import { ContentData, Project, Skill } from '../types';
import { validateUpdate } from '../utils/validation';
import { fetchUserProjects } from './githubService';

// --- CONFIGURATION ---
// Change this to your GitHub username to connect your stats and links
const GITHUB_USERNAME = "ishankrishna2012";
// ---------------------

// Fallback data for initial load
const INITIAL_CONTENT: ContentData = {
  heroTagline: "Crafting immersive digital experiences through code and creativity.",
  aboutText: "I'm Ishan Krishna Verma, a 13-year-old student at Delhi Private School (DPS) Dubai. Passionate about merging creativity with logic, I build immersive digital experiences that push the boundaries of what's possible on the web.",
  email: "contactishankrishna@gmail.com",
  githubUsername: GITHUB_USERNAME,
  linkedinUrl: "https://linkedin.com",
  instagramUrl: "https://instagram.com/ishankrishnaverma",
  // Default futuristic placeholder
  heroImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3276&auto=format&fit=crop" 
};

// Fallback projects if GitHub is empty or fails
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Connect GitHub',
    description: 'Connect your GitHub account in the code config to see your actual projects here automatically.',
    techStack: ['React', 'API', 'Config'],
    githubLink: `https://github.com/${GITHUB_USERNAME}`
  }
];

const INITIAL_SKILLS: Skill[] = [
  { name: 'React', level: 90, category: 'Framework' },
  { name: 'TypeScript', level: 85, category: 'Language' },
  { name: 'Python', level: 80, category: 'Language' },
  { name: 'Flutter', level: 75, category: 'Framework' },
  { name: 'Next.js', level: 85, category: 'Framework' },
  { name: 'Three.js', level: 60, category: 'Tool' },
];

export const getContent = async (): Promise<ContentData> => {
  // Simulating network delay
  return new Promise(resolve => setTimeout(() => resolve(INITIAL_CONTENT), 800));
};

export const updateContent = async (data: Partial<ContentData>) => {
  // Client-side validation
  for (const [key, value] of Object.entries(data)) {
    const check = validateUpdate(key, value as string);
    if (!check.valid) {
      throw new Error(`Validation Error on ${key}: ${check.error}`);
    }
  }

  // Simulate update delay
  return new Promise<void>(resolve => {
    console.log("Mock Update Saved:", data);
    setTimeout(resolve, 500);
  });
};

export const getProjects = async (): Promise<Project[]> => {
    // 1. Try to fetch real projects from GitHub
    const realProjects = await fetchUserProjects(GITHUB_USERNAME);
    
    // 2. If we found projects, return them
    if (realProjects.length > 0) {
        return realProjects;
    }

    // 3. Otherwise return fallback/demo projects
    return INITIAL_PROJECTS;
};

export const getSkills = async (): Promise<Skill[]> => {
    return new Promise(resolve => setTimeout(() => resolve(INITIAL_SKILLS), 500));
};