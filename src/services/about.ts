import axios from "axios";

const ABOUT_API_URL = "/api/about";

export interface About {
  _id: string;
  message: string;
}

// Fetches the "about" section message
export const fetchAbout = async (): Promise<About> => {
  try {
    const response = await axios.get(ABOUT_API_URL);
    // Our new API format is { success: true, data: {...} }
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching about section:", error);
    throw error;
  }
};

// Creates the "about" section
export const createAbout = async (
  aboutData: Omit<About, "_id">
): Promise<{ message: string; _id: string }> => {
  const response = await axios.post(ABOUT_API_URL, aboutData, {
    withCredentials: true,
  });
  return response.data?.data || response.data;
};

// Updates the "about" section
export const updateAbout = async (aboutData: Omit<About, "_id">): Promise<{ message: string; _id: string }> => {
  const response = await axios.put(ABOUT_API_URL, aboutData, {
    withCredentials: true,
  });
  return response.data?.data || response.data;
};

// Delete the "about" section
export const deleteAbout = async (): Promise<{ message: string }> => {
  const response = await axios.delete(ABOUT_API_URL, {
    withCredentials: true
  });
  return response.data?.data || response.data;
};
