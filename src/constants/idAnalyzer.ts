import axios from "axios";

// ID Analyzer API Configuration
const ID_ANALYZER_API_URL = "https://api2.idanalyzer.com/scan";

// API Key from environment
const ID_ANALYZER_API_KEY =
  process.env.EXPO_PUBLIC_ID_ANALYZER_API_KEY || "YOUR_API_KEY_HERE";

const ID_ANALYZER_KYC_ID = process.env.EXPO_PUBLIC_ID_ANALYZER_KYC_ID || "";
/**
 * ID Analyzer API Service
 * Documentation: https://www.idanalyzer.com/
 */

interface IDAnalyzerResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Verify ID document with biometric face verification
 * @param frontBase64 - Base64 encoded front of ID
 * @param backBase64 - Base64 encoded back of ID (optional)
 * @param faceBase64 - Base64 encoded face/selfie image for biometric verification (optional)
 * @returns API response with verification results including biometric matching
 */
export const verifyIDDocument = async (
  frontBase64: string,
  backBase64?: string,
  faceBase64?: string
): Promise<IDAnalyzerResponse> => {
  try {
    const payload: any = {
      document: frontBase64,
      profile: "1ce1beed09814d0aa51a3cba1a8257e4",
    };

    // Add back image if provided for dual-side scan
    if (backBase64) {
      payload.documentBack = backBase64;
    }

    // Add face image for biometric verification
    if (faceBase64) {
      payload.face = faceBase64;
    }

    console.log("🔍 Sending ID verification request to ID Analyzer API...");
    console.log("📋 API Endpoint:", ID_ANALYZER_API_URL);
    console.log("📋 Request payload keys:", Object.keys(payload));
    console.log("📏 Document base64 length:", frontBase64.length);
    if (backBase64) {
      console.log("📏 DocumentBack base64 length:", backBase64.length);
    }
    if (faceBase64) {
      console.log("📏 Face base64 length:", faceBase64.length);
      console.log("🔐 Biometric face verification enabled");
    }

    const response = await axios.post(ID_ANALYZER_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": ID_ANALYZER_API_KEY,
      },
      timeout: 30000, // 30 seconds timeout for image processing
    });

    console.log("✅ ID Analyzer API Response Status:", response.status);
    console.log(
      "✅ ID Analyzer API Response:",
      JSON.stringify(response.data, null, 2)
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("❌ ID Analyzer API Error:", error);

    if (error.response) {
      // Server responded with error
      console.error("❌ Error Status:", error.response.status);
      console.error(
        "❌ Error Response:",
        JSON.stringify(error.response.data, null, 2)
      );
      return {
        success: false,
        error: {
          code: error.response.status.toString(),
          message:
            error.response.data?.error?.message ||
            error.response.data?.error ||
            "ID verification failed",
        },
      };
    } else if (error.request) {
      // Request made but no response
      console.error("❌ No response received from ID Analyzer API");
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Network error - please check your connection",
        },
      };
    } else {
      // Something else went wrong
      console.error("❌ Error:", error.message);
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: error.message || "An unknown error occurred",
        },
      };
    }
  }
};

export const idAnalyzerAPI = {
  verifyIDDocument,
};
