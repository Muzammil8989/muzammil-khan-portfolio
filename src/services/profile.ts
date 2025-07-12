import axios from "axios";

const API_URL = "/api/profile";
export interface Profile {
  _id: string;
  name: string;
  description: string;
  avatarUrl: string;
  initials: string;
}

export const fetchProfiles = async (): Promise<Profile[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProfile = async (
  profileData: Omit<Profile, "_id">
): Promise<Profile> => {
  const response = await axios.post(API_URL, profileData, {
    withCredentials: true,
  });
  return response.data;
};

export const updateProfile = async (profileData: Profile): Promise<Profile> => {
  const response = await axios.put(API_URL, profileData, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteProfile = async (profileId: string): Promise<void> => {
  await axios.delete(`${API_URL}?id=${profileId}`, { withCredentials: true });
};
