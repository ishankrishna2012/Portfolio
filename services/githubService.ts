import { GitHubStats, Project } from '../types';

const CACHE_DURATION = 3600000; // 1 hour

export const fetchGitHubStats = async (username: string): Promise<GitHubStats> => {
  const cacheKey = `github_stats_v2_${username}`;
  
  // Check cache to avoid rate limits during dev
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    
    // 1. Fetch User Data
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    
    if (!userRes.ok) {
       if (userRes.status === 404) throw new Error('GitHub User not found');
       if (userRes.status === 403) throw new Error('Rate Limit Exceeded');
       throw new Error('GitHub API Error');
    }
    
    const userData = await userRes.json();

    // 2. Fetch repos to calculate stars
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    const reposData = await reposRes.json();
    
    // Calculate total stars
    const totalStars = Array.isArray(reposData) 
      ? reposData.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0)
      : 0;

    // 3. Fetch events for last push, and recent contribution graph
    // Note: The public events API lists events performed by the user (last 90 days/300 events)
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers });
    const eventsData = await eventsRes.json();
    
    const lastPush = Array.isArray(eventsData) && eventsData.length > 0 ? eventsData[0].created_at : null;

    // Calculate recent commits (from PushEvents in the last 100 events)
    const recentCommits = Array.isArray(eventsData) 
      ? eventsData
          .filter((event: any) => event.type === 'PushEvent')
          .reduce((acc: number, event: any) => acc + (event.payload?.size || 0), 0)
      : 0;

    // 4. Fetch TOTAL Commits (Search API)
    // We try to get the real total count. If rate limited, we fall back to recentCommits.
    let totalCommits = recentCommits;
    try {
        const searchRes = await fetch(`https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc`, { 
            headers: { 'Accept': 'application/vnd.github.cloak-preview' } 
        });
        
        if (searchRes.ok) {
            const searchData = await searchRes.json();
            // The search API returns total_count which is the total commits in public repos
            totalCommits = searchData.total_count;
        } else {
            console.warn(`Search API status: ${searchRes.status}. Using fallback commit count.`);
        }
    } catch (e) {
        console.warn("Search API failed (likely rate limit), using event count fallback", e);
    }

    // Build Contribution Map (YYYY-MM-DD -> count)
    const contributionMap: Record<string, number> = {};
    if (Array.isArray(eventsData)) {
      eventsData.forEach((event: any) => {
        const date = event.created_at.split('T')[0]; // Extract YYYY-MM-DD
        
        let weight = 1;
        if (event.type === 'PushEvent') weight = event.payload?.size || 1;
        if (event.type === 'CreateEvent') weight = 2;
        if (event.type === 'PullRequestEvent') weight = 3;

        contributionMap[date] = (contributionMap[date] || 0) + weight;
      });
    }

    const stats: GitHubStats = {
      repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      following: userData.following || 0,
      totalStars,
      lastPush,
      totalCommits,
      contributionMap
    };

    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: stats }));
    return stats;
  } catch (error) {
    console.warn(`GitHub API Error for ${username}:`, error); 
    
    // Return fallback data if API fails
    return {
      repos: 0,
      followers: 0,
      following: 0,
      totalStars: 0,
      lastPush: null,
      totalCommits: 0,
      contributionMap: {}
    };
  }
};

export const fetchUserProjects = async (username: string): Promise<Project[]> => {
  const cacheKey = `github_projects_${username}`;
  
  // Check cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      // Cache projects for 1 hour
      if (Date.now() - timestamp < 3600000) { 
        return data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    // Fetch repos sorted by updated to get most recent activity, or sort by stars
    // Using 'pushed' ensures we show what you are currently working on.
    // Changing to 'updated' to get a mix, or sorting manually by stars below.
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=20&type=owner`);
    
    if (!res.ok) throw new Error("Failed to fetch projects");
    
    const data = await res.json();
    
    if (!Array.isArray(data)) return [];

    // Filter: Not a fork, has a description (optional), and sort by stars/priority
    const filtered = data.filter((repo: any) => !repo.fork);
    
    // Sort by stars descending to show "Best" work
    const sorted = filtered.sort((a: any, b: any) => b.stargazers_count - a.stargazers_count);
    
    // Take top 4
    const topProjects = sorted.slice(0, 4).map((repo: any) => {
        // Determine Tech Stack: Use topics if available, else language
        let stack = repo.topics && repo.topics.length > 0 ? repo.topics : [];
        if (stack.length === 0 && repo.language) stack = [repo.language];
        if (stack.length === 0) stack = ['Development'];

        return {
            id: repo.id.toString(),
            title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '), // Clean up title
            description: repo.description || "No description provided.",
            techStack: stack.slice(0, 3), // Limit to 3 tags
            githubLink: repo.html_url
        };
    });

    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: topProjects }));
    return topProjects;

  } catch (error) {
    console.warn("Error fetching projects from GitHub:", error);
    return [];
  }
};