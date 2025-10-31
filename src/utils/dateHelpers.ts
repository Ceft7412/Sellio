// Format time for chat messages (e.g., "2:30 PM")
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// Format date for chat headers (e.g., "Today", "Yesterday", "Jan 15, 2024")
export const formatMessageDate = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to midnight for comparison
  const messageDateOnly = new Date(messageDate.setHours(0, 0, 0, 0));
  const todayOnly = new Date(today.setHours(0, 0, 0, 0));
  const yesterdayOnly = new Date(yesterday.setHours(0, 0, 0, 0));

  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return "Yesterday";
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[messageDate.getMonth()];
    const day = messageDate.getDate();
    const year = messageDate.getFullYear();
    return `${month} ${day}, ${year}`;
  }
};

// Format full timestamp with date and time (e.g., "Sent at 2:30 PM")
export const formatSentAt = (timestamp: string): string => {
  return `Sent at ${formatMessageTime(timestamp)}`;
};

// Format seen timestamp (e.g., "Seen at 2:35 PM")
export const formatSeenAt = (timestamp: string | null): string | null => {
  if (!timestamp) return null;
  return `Seen at ${formatMessageTime(timestamp)}`;
};

// Check if two timestamps are on the same day
export const isSameDay = (timestamp1: string, timestamp2: string): boolean => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
