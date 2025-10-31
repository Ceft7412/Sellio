import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState<"date" | "time">("date");
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  };

  const handleNext = () => {
    if (mode === "date") {
      // Move to time selection
      setMode("time");
      if (Platform.OS === "android") {
        setShowPicker(true);
      }
    } else {
      // Validate that the selected datetime is in the future
      const now = new Date();
      if (selectedDate <= now) {
        alert("Please select a future date and time");
        return;
      }
      // Confirm and close
      onConfirm(selectedDate);
      handleClose();
    }
  };

  const handleClose = () => {
    setMode("date");
    setShowPicker(false);
    setSelectedDate(new Date());
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get minimum date (tomorrow)
  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="bg-white rounded-2xl w-full max-w-md p-6">
          {/* Header */}
          <Text className="text-xl font-inter-bold text-neutral-900 mb-2">
            {mode === "date" ? "Select Date" : "Select Time"}
          </Text>
          <Text className="text-sm font-inter-regular text-neutral-600 mb-6">
            {mode === "date"
              ? "Choose a date for the meetup"
              : "Choose a time for the meetup"}
          </Text>

          {/* Selected Date/Time Display */}
          <View className="bg-neutral-50 rounded-xl p-4 mb-6">
            <Text className="text-sm font-inter-medium text-neutral-700 mb-1">
              Selected Date & Time
            </Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-inter-semibold text-neutral-900">
                {formatDate(selectedDate)}
              </Text>
            </View>
            <View className="flex-row items-center mt-2">
              <Text className="text-lg font-inter-semibold text-neutral-900">
                {formatTime(selectedDate)}
              </Text>
            </View>
          </View>

          {/* Date/Time Picker */}
          {Platform.OS === "ios" ? (
            <View className="mb-6">
              <DateTimePicker
                value={selectedDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={getMinimumDate()}
                textColor="#111827"
              />
            </View>
          ) : (
            showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode={mode}
                display="default"
                onChange={handleDateChange}
                minimumDate={mode === "date" ? getMinimumDate() : undefined}
              />
            )
          )}

          {Platform.OS === "android" && !showPicker && (
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="bg-neutral-100 rounded-xl p-4 mb-6"
            >
              <Text className="text-center text-base font-inter-medium text-neutral-900">
                {mode === "date" ? "Select Date" : "Select Time"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 py-3 px-4 rounded-xl bg-neutral-100 items-center"
            >
              <Text className="text-base font-inter-semibold text-neutral-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 py-3 px-4 rounded-xl bg-primary-500 items-center"
            >
              <Text className="text-base font-inter-semibold text-white">
                {mode === "date" ? "Next" : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
