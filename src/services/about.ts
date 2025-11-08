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
    // Ensure the data has the expected structure
    if (response.data) {
      return response.data;
    } else {
      throw new Error('No data found for about section.');
    }
  } catch (error) {
    // Log the error with detailed context
    if (axios.isAxiosError(error)) {
      // Axios error
      console.error("Axios error while fetching about section:", error.response?.data || error.message);
      throw new Error(`Error fetching about section: ${error.response?.data || error.message}`);
    } else {
      // General error
      console.error("General error fetching about section:", error);
      throw new Error('An unexpected error occurred while fetching the about section.');
    }
  }
};

// Creates the "about" section
export const createAbout = async (
  aboutData: Omit<About, "_id">
): Promise<{ message: string; _id: string }> => {
  try {
    const response = await axios.post(ABOUT_API_URL, aboutData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating about section:", error);
    throw error;
  }
};

// Updates the "about" section
export const updateAbout = async (aboutData: Omit<About, "_id">): Promise<{ message: string; _id: string }> => {
  try {
    const response = await axios.put(ABOUT_API_URL, aboutData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating about section:", error);
    throw error;
  }
};

// Delete the "about" section
export const deleteAbout = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(ABOUT_API_URL, { 
      withCredentials: true 
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting about section:", error);
    throw error;
  }
};