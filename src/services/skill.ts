import axios from "axios";

const API_URL = "/api/skills";

export const fetchSkills = async (): Promise<string[]> => {
    try {
        const res = await axios.get(API_URL);
        return res.data?.data || [];
    } catch (error) {
        console.error("Error fetching skills:", error);
        return [];
    }
};
