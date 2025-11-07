import { useEffect, useCallback, useRef, useMemo } from "react";
import { Alert, AppState } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { locationAPI } from "../constants/axios";
import { useSocket } from "../providers/SocketProvider";
import type { LocationSessionData } from "../types/location.types";

interface UseLocationSharingProps {
  conversationId: string;
  userId: string | undefined;
  oppositeUserName: string | undefined;
  enabled?: boolean;
}

/**
 * Optimized location sharing hook
 * - Throttled cache updates (prevent excessive re-renders)
 * - Memoized derived state
 * - Batched WebSocket updates
 */
export const useLocationSharing = ({
  conversationId,
  userId,
  oppositeUserName,
  enabled = true,
}: UseLocationSharingProps) => {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const updateInterval = useRef(10000);

  // Throttle cache updates to max 1 per second
  const lastCacheUpdate = useRef(0);
  const pendingUpdate = useRef<any>(null);
  const isFirstLocationUpdate = useRef(true);

  // Fetch session data once on mount
  const { data: sessionData, isLoading: isQueryLoading } = useQuery<{
    data: LocationSessionData;
  }>({
    queryKey: ["locationSession", conversationId],
    queryFn: async () => {
      const response = await locationAPI.getSession(conversationId);
      return response;
    },
    enabled: enabled && !!conversationId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Memoize derived state (only recompute when sessionData changes)
  const derivedState = useMemo(() => {
    const session = sessionData?.data?.session;
    const locationUpdates = sessionData?.data?.locationUpdates || [];
    const nearbyPlaces = sessionData?.data?.nearbyPlaces || [];

    if (!session || !userId) {
      return {
        session: null,
        locationUpdates: [],
        isParticipant1: false,
        isSharing: false,
        oppositeUserSharing: false,
        myDistance: null,
        oppositeUserDistance: null,
        nearbyPlaces: [],
      };
    }

    const isParticipant1 = userId === session.participant1Id;
    const isSharing = isParticipant1
      ? session.participant1Sharing
      : session.participant2Sharing;
    const oppositeUserSharing = isParticipant1
      ? session.participant2Sharing
      : session.participant1Sharing;

    // Get distances from location updates
    const myUpdate = locationUpdates.find((u) => u.userId === userId);
    const oppositeUserId = isParticipant1
      ? session.participant2Id
      : session.participant1Id;
    const oppositeUpdate = locationUpdates.find(
      (u) => u.userId === oppositeUserId
    );

    return {
      session,
      locationUpdates,
      isParticipant1,
      isSharing,
      oppositeUserSharing,
      myDistance: myUpdate?.distance || null,
      oppositeUserDistance: oppositeUpdate?.distance || null,
      nearbyPlaces,
    };
  }, [sessionData, userId]);

  // Throttled cache update helper
  const updateCacheThrottled = useCallback(
    (updater: (old: any) => any) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastCacheUpdate.current;

      if (timeSinceLastUpdate < 1000) {
        // Queue the update
        pendingUpdate.current = updater;
        return;
      }

      // Execute immediately
      lastCacheUpdate.current = now;
      queryClient.setQueryData(["locationSession", conversationId], updater);
    },
    [queryClient, conversationId]
  );

  // Flush pending updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingUpdate.current) {
        lastCacheUpdate.current = Date.now();
        queryClient.setQueryData(
          ["locationSession", conversationId],
          pendingUpdate.current
        );
        pendingUpdate.current = null;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [queryClient, conversationId]);

  // Start location tracking
  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required");
      return;
    }

    // Get current location immediately and send it
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      socket?.emit("update_location", {
        conversationId,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {}

    // Then start watching for updates
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: updateInterval.current,
        distanceInterval: 20,
      },
      (location) => {
        socket?.emit("update_location", {
          conversationId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );

    locationSubscription.current = subscription;
  }, [conversationId, socket]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
  }, []);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        updateInterval.current = 30000;
      } else if (nextAppState === "active") {
        updateInterval.current = 10000;
      }
    });

    return () => subscription.remove();
  }, []);

  // Mutations
  const startSharingMutation = useMutation({
    mutationFn: () => locationAPI.startSharing(conversationId),
    onSuccess: async (response) => {
      // Reset first location flag to bypass throttle for immediate update
      isFirstLocationUpdate.current = true;

      // Check if session exists in cache
      const currentData = queryClient.getQueryData([
        "locationSession",
        conversationId,
      ]) as any;

      if (!currentData?.data?.session) {
        // No session existed before - backend just created it
        // Set the session data from the API response directly

        queryClient.setQueryData(["locationSession", conversationId], {
          data: {
            session: response.data?.session,
            locationUpdates: [],
            nearbyPlaces: [],
          },
        });
      } else {
        // Update existing session cache optimistically
        queryClient.setQueryData(
          ["locationSession", conversationId],
          (old: any) => {
            if (!old?.data?.session) return old;
            return {
              ...old,
              data: {
                ...old.data,
                session: {
                  ...old.data.session,
                  participant1Sharing:
                    derivedState.isParticipant1 ||
                    old.data.session.participant1Sharing,
                  participant2Sharing:
                    !derivedState.isParticipant1 ||
                    old.data.session.participant2Sharing,
                },
                // Ensure locationUpdates array exists
                locationUpdates: old.data.locationUpdates || [],
              },
            };
          }
        );
      }

      // Start tracking - will send location immediately
      await startTracking();
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to start sharing"
      );
    },
  });

  const stopSharingMutation = useMutation({
    mutationFn: () => locationAPI.stopSharing(conversationId),
    onSuccess: async () => {
      stopTracking();
      // Update cache optimistically
      queryClient.setQueryData(
        ["locationSession", conversationId],
        (old: any) => {
          if (!old?.data?.session) return old;
          return {
            ...old,
            data: {
              ...old.data,
              session: {
                ...old.data.session,
                participant1Sharing: derivedState.isParticipant1
                  ? false
                  : old.data.session.participant1Sharing,
                participant2Sharing: !derivedState.isParticipant1
                  ? false
                  : old.data.session.participant2Sharing,
              },
              locationUpdates:
                old.data.locationUpdates?.filter(
                  (u: any) => u.userId !== userId
                ) || [],
            },
          };
        }
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to stop sharing"
      );
    },
  });

  // Join conversation room when component mounts
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", conversationId);

    return () => {
      socket.emit("leave_conversation", conversationId);
    };
  }, [socket, conversationId]);

  // WebSocket event handlers - Throttled cache updates
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.on("location_sharing_started", (data: any) => {
      if (data.conversationId !== conversationId) return;

      // Check if session exists in cache
      const currentData = queryClient.getQueryData([
        "locationSession",
        conversationId,
      ]) as any;

      if (!currentData?.data?.session) {
        // No session in cache yet - this is first time sharing
        // Refetch to get the newly created session from backend
        queryClient.invalidateQueries({
          queryKey: ["locationSession", conversationId],
        });

        if (data.userId !== userId) {
          Alert.alert(
            "Location Sharing",
            `${oppositeUserName} started sharing`
          );
        }
        return;
      }

      // Update cache immediately (non-throttled) for sharing status changes
      queryClient.setQueryData(
        ["locationSession", conversationId],
        (old: any) => {
          if (!old?.data?.session) return old;
          const isP1 = data.userId === old.data.session.participant1Id;
          return {
            ...old,
            data: {
              ...old.data,
              session: {
                ...old.data.session,
                participant1Sharing:
                  isP1 || old.data.session.participant1Sharing,
                participant2Sharing:
                  !isP1 || old.data.session.participant2Sharing,
              },
            },
          };
        }
      );

      if (data.userId !== userId) {
        // Reset first location flag for the opposite user's updates
        isFirstLocationUpdate.current = true;
        Alert.alert("Location Sharing", `${oppositeUserName} started sharing`);
      }
    });

    socket.on("location_sharing_stopped", (data: any) => {
      if (data.conversationId !== conversationId) return;

      // Update cache immediately (non-throttled) for sharing status changes
      queryClient.setQueryData(
        ["locationSession", conversationId],
        (old: any) => {
          if (!old?.data?.session) return old;
          const isP1 = data.userId === old.data.session.participant1Id;
          return {
            ...old,
            data: {
              ...old.data,
              session: {
                ...old.data.session,
                participant1Sharing: isP1
                  ? false
                  : old.data.session.participant1Sharing,
                participant2Sharing: !isP1
                  ? false
                  : old.data.session.participant2Sharing,
              },
              locationUpdates:
                old.data.locationUpdates?.filter(
                  (u: any) => u.userId !== data.userId
                ) || [],
            },
          };
        }
      );

      if (data.userId !== userId) {
        Alert.alert("Location Sharing", `${oppositeUserName} stopped sharing`);
      }
    });

    socket.on("location_updated", (data: any) => {
      if (data.conversationId !== conversationId) {
        return;
      }

      // Validate location data
      if (
        !data.location ||
        typeof data.location.lat !== "number" ||
        typeof data.location.lng !== "number"
      ) {
        return;
      }

      const updateCache = (old: any) => {
        if (!old?.data?.session) return old;

        const newUpdate = {
          id: `${Date.now()}-${data.userId}`,
          sessionId: old.data.session.id,
          userId: data.userId,
          latitude: data.location.lat.toString(),
          longitude: data.location.lng.toString(),
          distance: data.distance,
          createdAt: data.timestamp,
        };

        // Replace old update for this user with new one
        const filteredUpdates =
          old.data.locationUpdates?.filter(
            (u: any) => u.userId !== data.userId
          ) || [];

        return {
          ...old,
          data: {
            ...old.data,
            locationUpdates: [newUpdate, ...filteredUpdates],
          },
        };
      };

      // For the first location update after starting sharing, bypass throttle
      // to ensure immediate UI update
      if (isFirstLocationUpdate.current) {
        isFirstLocationUpdate.current = false;
        queryClient.setQueryData(
          ["locationSession", conversationId],
          updateCache
        );
      } else {
        updateCacheThrottled(updateCache);
      }
    });

    socket.on("nearby_places", (data: any) => {
      if (data.conversationId !== conversationId) return;

      updateCacheThrottled((old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            nearbyPlaces: data.places,
          },
        };
      });
    });

    socket.on("location_sharing_expired", (data: any) => {
      if (data.conversationId !== conversationId) return;

      // Stop tracking if it's the current user's session that expired
      stopTracking();

      // Update cache immediately (non-throttled) for expiration
      queryClient.setQueryData(
        ["locationSession", conversationId],
        (old: any) => {
          if (!old?.data?.session) return old;
          const isP1 = userId === old.data.session.participant1Id;
          return {
            ...old,
            data: {
              ...old.data,
              session: {
                ...old.data.session,
                participant1Sharing: isP1
                  ? false
                  : old.data.session.participant1Sharing,
                participant2Sharing: !isP1
                  ? false
                  : old.data.session.participant2Sharing,
              },
              locationUpdates:
                old.data.locationUpdates?.filter(
                  (u: any) => u.userId !== userId
                ) || [],
            },
          };
        }
      );

      Alert.alert(
        "Location Sharing Expired",
        "Your location sharing session has expired after 1 hour. You can start sharing again if needed."
      );
    });

    return () => {
      socket.off("location_sharing_started");
      socket.off("location_sharing_stopped");
      socket.off("location_updated");
      socket.off("location_sharing_expired");
      socket.off("nearby_places");
    };
  }, [
    socket,
    conversationId,
    userId,
    oppositeUserName,
    updateCacheThrottled,
    stopTracking,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return {
    // Derived state (memoized)
    isSharing: derivedState.isSharing,
    oppositeUserSharing: derivedState.oppositeUserSharing,
    myDistance: derivedState.myDistance,
    oppositeUserDistance: derivedState.oppositeUserDistance,
    nearbyPlaces: derivedState.nearbyPlaces,
    // Raw data for components that need it
    session: derivedState.session,
    locationUpdates: derivedState.locationUpdates,
    // Loading states
    isLoading: isQueryLoading,
    isStarting: startSharingMutation.isPending,
    isStopping: stopSharingMutation.isPending,
    // Actions
    startSharing: () => startSharingMutation.mutate(),
    stopSharing: () => {
      Alert.alert("Stop Sharing Location", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: () => stopSharingMutation.mutate(),
        },
      ]);
    },
  };
};
