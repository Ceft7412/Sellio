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

    if (backBase64) {
    }
    if (faceBase64) {
    }

    const response = await axios.post(ID_ANALYZER_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": ID_ANALYZER_API_KEY,
      },
      timeout: 30000, // 30 seconds timeout for image processing
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    if (error.response) {
      // Server responded with error
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
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Network error - please check your connection",
        },
      };
    } else {
      // Something else went wrong
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
