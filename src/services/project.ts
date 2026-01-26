import axios from "axios";

const API_URL = "/api/projects";

export interface ProjectLink {
    type: string;
    href: string;
}

export interface Project {
    _id: string;
    title: string;
    href: string;
    dates: string;
    active: boolean;
    description: string;
    technologies: string[];
    links: ProjectLink[];
    image: string;
    projectUrl?: string;
    githubUrl?: string;
    caseStudyUrl?: string;
}

/** Fetch ALL projects */
export const fetchProjects = async (): Promise<Project[]> => {
    try {
        const res = await axios.get(API_URL);
        return res.data?.data || [];
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
};
