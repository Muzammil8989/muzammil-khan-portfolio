// services/educationService.ts
import axios from "axios";

const EDUCATION_API_URL = "/api/educations";

export interface Education {
  _id: string;
  school: string;
  href: string;
  degree: string;
  logoUrl: string;
  start: string;
  end: string;
}

/** GET: all education items */
export const fetchEducations = async (): Promise<Education[]> => {
  try {
    const res = await axios.get(EDUCATION_API_URL);
    if (Array.isArray(res.data)) return res.data;
    throw new Error("Unexpected response while fetching education items.");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error while fetching education:",
        error.response?.data || error.message
      );
      throw new Error(
        `Error fetching education: ${error.response?.data || error.message}`
      );
    }
    console.error("General error fetching education:", error);
    throw new Error("An unexpected error occurred while fetching education.");
  }
};

/** POST: create a new education item */
export const createEducation = async (
  data: Omit<Education, "_id">
): Promise<Education> => {
  try {
    const res = await axios.post(EDUCATION_API_URL, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error creating education item:", error);
    throw error;
  }
};

/** PUT: update an education item by id
 *  - Send partial fields; use null to unset a field on the server (per your API)
 */
export const updateEducation = async (
  id: string,
  data: Partial<Omit<Education, "_id">>
): Promise<Education> => {
  try {
    const res = await axios.put(`${EDUCATION_API_URL}?id=${id}`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating education item:", error);
    throw error;
  }
};

/** DELETE: remove an education item by id */
export const deleteEducation = async (
  id: string
): Promise<{ message: string }> => {
  try {
    const res = await axios.delete(`${EDUCATION_API_URL}?id=${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting education item:", error);
    throw error;
  }
};
