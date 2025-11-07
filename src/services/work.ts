// services/work.service.ts
import axios from "axios";

const API_URL = "/api/work";

export interface WorkExperience {
  _id: string;
  company: string;
  href: string;
  badges: string[];
  location: string;
  title: string;
  logoUrl: string;
  start: string;
  end: string;
  description: string;
}

/** Fetch ALL work experiences */
export const fetchWorkExperiences = async (): Promise<WorkExperience[]> => {
  try {
    const res = await axios.get(API_URL);
    if (!res.data || res.data.length === 0) {
      console.warn("No work experiences found.");
      return [];
    }
    return res.data;
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    return [];
  }
};

/** Create a work experience (no userId; only the listed fields) */
export const createWorkExperience = async (
  data: Omit<WorkExperience, "_id">
): Promise<WorkExperience> => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

/** Update a work experience by id (route expects ?id=WORK_ID) */
export const updateWorkExperience = async (
  work: WorkExperience
): Promise<WorkExperience> => {
  const res = await axios.put(`${API_URL}?id=${work._id}`, work);
  return res.data;
};

/** Delete a work experience by id */
export const deleteWorkExperience = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}?id=${id}`);
};
