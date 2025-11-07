import React, { forwardRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

interface ChatOptionsBottomSheetProps {
  onReportUser: () => void;
  canReport: boolean;
}

export const ChatOptionsBottomSheet = forwardRef<
  BottomSheetModal,
  ChatOptionsBottomSheetProps
>(({ onReportUser, canReport }, ref) => {
  const snapPoints = useMemo(() => ["25%"], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={{
        backgroundColor: "#D1D5DB",
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <BottomSheetView style={{ padding: 16 }} className="pb-20">
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter-Bold",
            color: "#1F2937",
            marginBottom: 16,
          }}
        >
          Chat Options
        </Text>

        <TouchableOpacity
          onPress={onReportUser}
          disabled={!canReport}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: canReport ? "#FEF2F2" : "#F3F4F6",
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter-SemiBold",
                color: canReport ? "#DC2626" : "#9CA3AF",
                marginBottom: 4,
              }}
            >
              Report User
            </Text>
            {!canReport && (
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Inter-Regular",
                  color: "#6B7280",
                }}
              >
                Available after transaction is completed, cancelled, or expired
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

ChatOptionsBottomSheet.displayName = "ChatOptionsBottomSheet";
