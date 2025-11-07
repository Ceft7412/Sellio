/**
 * Shared types for location sharing feature
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationUpdate {
  id: string;
  sessionId: string;
  userId: string;
  latitude: string;
  longitude: string;
  distance: string | null;
  accuracy?: number;
  createdAt: string;
}

export interface LocationSession {
  id: string;
  conversationId: string;
  participant1Id: string;
  participant2Id: string;
  participant1Sharing: boolean;
  participant2Sharing: boolean;
  participant1StartedAt: string | null;
  participant1StoppedAt: string | null;
  participant2StartedAt: string | null;
  participant2StoppedAt: string | null;
  status: "active" | "ended";
  createdAt: string;
  updatedAt: string;
}

export interface NearbyPlace {
  name: string;
  address: string;
  photoUrl: string | null;
  types: string[];
  location: {
    lat: number;
    lng: number;
  } | null;
}

export interface LocationSessionData {
  session: LocationSession | null;
  locationUpdates: LocationUpdate[];
  nearbyPlaces?: NearbyPlace[];
}

// Socket event payloads
export interface LocationSharingStartedEvent {
  conversationId: string;
  sessionId: string;
  userId: string;
  timestamp: string;
}

export interface LocationSharingStoppedEvent {
  conversationId: string;
  sessionId: string;
  userId: string;
  timestamp: string;
}

export interface LocationUpdatedEvent {
  conversationId: string;
  sessionId: string;
  userId: string;
  location: LocationCoordinates;
  distance: string | null;
  duration: string | null;
  timestamp: string;
}

// Hook return types
export interface LocationSharingState {
  isSharing: boolean;
  oppositeUserSharing: boolean;
  myDistance: string | null;
  oppositeUserDistance: string | null;
  isStarting: boolean;
  isStopping: boolean;
  error: string | null;
  startSharing: () => void;
  stopSharing: () => void;
}
