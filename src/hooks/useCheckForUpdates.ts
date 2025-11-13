import * as Updates from "expo-updates";
import { useEffect } from "react";

export function useCheckForUpdates() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          // Update silently.
          // Will auto-apply on next launch of the app.
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log("Error checking for updates:", error);
        throw error;
      }
    };

    checkForUpdates();
  }, []);
}
