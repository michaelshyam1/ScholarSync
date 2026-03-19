"use server";

import { apiClient } from "@/lib/backend/apiClient";
import { Scholarship } from "@/types/Scholarship";
import { Profile } from "@/types/Profile";

export async function getRecommendedScholarships(
  userProfile: Profile,
): Promise<Scholarship[]> {
  try {
    // Use backend API for recommendation logic
    const data = (await apiClient.getRecommendations(
      userProfile,
    )) as Scholarship[];
    return data;
  } catch (error) {
    console.error("Failed to fetch recommended scholarships:", error);
    // Fallback to basic filtering if backend is not available
    throw new Error("Failed to fetch recommended scholarships");
  }
}
