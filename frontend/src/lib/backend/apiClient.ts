import { Profile } from "@/types/Profile";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";
class ApiClient {
  private baseUrl: string;
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Recommendations endpoints
  async getRecommendations(userProfile: Profile) {
    return this.request("/recommendations/", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });
  }

}

export const apiClient = new ApiClient();
