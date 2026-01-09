// src/services/educations.ts
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
    // New API format: { success: true, data: [...] }
    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching education items:", error);
    return [];
  }
};

/** POST: create a new education item */
export const createEducation = async (
  data: Omit<Education, "_id">
): Promise<Education> => {
  const res = await axios.post(EDUCATION_API_URL, data, {
    withCredentials: true,
  });
  return res.data?.data || res.data;
};

/** PUT: update an education item by id */
export const updateEducation = async (
  id: string,
  data: Partial<Omit<Education, "_id">>
): Promise<Education> => {
  const res = await axios.put(`${EDUCATION_API_URL}?id=${id}`, data, {
    withCredentials: true,
  });
  return res.data?.data || res.data;
};

/** DELETE: remove an education item by id */
export const deleteEducation = async (
  id: string
): Promise<{ message: string }> => {
  const res = await axios.delete(`${EDUCATION_API_URL}?id=${id}`, {
    withCredentials: true,
  });
  return res.data?.data || res.data;
};

