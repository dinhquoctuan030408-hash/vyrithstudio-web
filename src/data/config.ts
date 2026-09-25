export type AppProjectStatus = 'Ready' | 'In Development' | 'Maintenance' | 'Discontinued' | 'Alpha' | 'Beta';

export interface AppItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  icon: string;
  version: string;
  downloadUrl: string;
  status: AppProjectStatus;
  tags?: string[];
  downloadEnabled?: boolean;
}

export interface ProjectAttachment {
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface UpcomingProject {
  id: string;
  name: string;
  tagline: string;
  status: AppProjectStatus;
  progress: number;
  icon: string;
  techStack: string[];
  tags?: string[];
  projectUrl: string;
  overview?: string;
  detailedDocs?: string;
  galleryImages?: string[];
  attachments?: ProjectAttachment[];
}

export interface FeedbackMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'founder';
}

export interface FeedbackThread {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  pinned?: boolean;
  messages: FeedbackMessage[];
}

export const STUDIO_CONFIG = {
  founder: {
    uid: "VYR-FOUNDER-0001",
    name: "Đinh Quốc Tuấn",
    title: "Founder & Lead Systems Architect",
    email: "dinhquoctuan030408@gmail.com",
    phone: "0976853340",
    avatar: "/icons/avatar-founder.png",
    bio: "Passionate about low-level systems engineering, game engine architecture, and high-performance distributed computing."
  },

  founderAuth: {
    uid: "VYR-FOUNDER-0001",
    email: "dinhquoctuan030408@gmail.com",
    password: "Dinhquoctuan0304#",
    name: "Đinh Quốc Tuấn (Founder)",
    phone: "0976853340",
    avatar: "/icons/avatar-founder.png",
    role: "FOUNDER"
  },

  socialLinks: {
    facebook: "https://www.facebook.com/ahyeongege",
    tiktok: "https://www.tiktok.com/@eyes3408",
    discord: "https://discord.gg/YYJBbHYFq2",
  },

  activeApps: [
    {
      id: 'vyrith-code-studio',
      name: 'Vyrith Code',
      category: 'IDE Software',
      rating: 4.9,
      description: 'Build faster in Roblox with Gemini AI, a powerful IDE, and real-time Luau sync.',
      icon: '/icons/vyrithcode.png',
      version: 'v1.6.0',
      status: 'Ready',
      tags: ['AI Powered', 'IDE', 'Luau', 'Roblox'],
      downloadUrl: 'https://github.com/dinhquoctuan030408-hash/vyrith-code-studio/releases/latest/download/VyrithCode-Setup.zip',
      downloadEnabled: true
    },
    {
      id: 'vyrith-code-sync',
      name: 'Vyrith Code Sync',
      category: 'Roblox Studio Plugin',
      rating: 4.8,
      description: 'Seamless two-way, real-time Luau synchronization between Vyrith Code and Roblox Studio.',
      icon: '/icons/rbxstudio.png',
      version: 'v1.6.1',
      status: 'Ready',
      tags: ['Plugin', 'Sync Engine', 'Luau'],
      downloadUrl: 'https://github.com/dinhquoctuan030408-hash/vyrith-sync-lugin/archive/refs/heads/main.zip',
      downloadEnabled: true
    },
    {
      id: 'vyrith-student',
      name: 'Vyrith Student',
      category: 'Education Software',
      rating: 4.95,
      description: 'Simplify your studies and finances, all in one place.',
      icon: '/icons/vyrithcode.png',
      version: '1.0.0 BETA',
      status: 'Ready',
      tags: ['Education', 'Finance', 'Utility'],
      downloadUrl: 'https://github.com/dinhquoctuan030408-hash/vyrith-code-studio/releases/download/v1.0.0/VyrithStudent-Beta.zip',
      downloadEnabled: true
    }
  ] as AppItem[],

  upcomingProjects: [
    {
      id: 'proj-1',
      name: 'Anime Ascension',
      tagline: 'Roblox Experience',
      status: 'In Development',
      progress: 74,
      icon: '/icons/prj1.png',
      techStack: ['Luau'],
      tags: ['Open World', 'Anime RPG', 'Custom Combat'],
      projectUrl: '/project/proj-1',
      overview: 'Anime Ascension is an ambitious open-world Roblox anime experience featuring dynamic combat loops, procedural skill trees, and server-authoritative physics routines.',
      detailedDocs: '### Architecture Overview\n- Real-time client prediction & lag compensation.\n- Luau modular OOP framework with state machines.\n- Custom spatial particle simulations and high frame-rate hitboxes.\n\n### Milestones\n- [x] Combat Alpha 1.0\n- [x] Inventory & Stat Rebalancing\n- [ ] Open World Boss Raids & Dungeon Sync',
      galleryImages: [],
      attachments: []
    },
    {
      id: 'proj-2',
      name: 'Parasite Paradox',
      tagline: 'Roblox Experience',
      status: 'In Development',
      progress: 99,
      icon: '/icons/prj2.png',
      techStack: ['Luau'],
      tags: ['Multiplayer Horror', 'Spatial Audio', 'Shaders'],
      projectUrl: '/project/proj-2',
      overview: 'A psychological survival-horror multiplayer game running on custom dynamic lighting shaders and deterministic raycasted audio occlusion.',
      detailedDocs: '### Technical Highlights\n- Custom volumetric fog and dynamic sound spatialization.\n- Procedural entity AI with behavior tree nodes.\n- Releasing final public build shortly.',
      galleryImages: [],
      attachments: []
    },
    {
      id: 'proj-3',
      name: 'PROJECT MD27-G1',
      tagline: 'Roblox Experience',
      status: 'In Development',
      progress: 20,
      icon: '/icons/rbxstudio.png',
      techStack: ['Luau'],
      tags: ['Sandbox', 'ECS Architecture', 'High Density'],
      projectUrl: '/project/proj-3',
      overview: 'Next-generation tactical sandbox protocol testing high player-density simulations and modular weapon mechanics.',
      detailedDocs: '### Lab Specifications\n- Stress testing 100+ concurrent simulated players on live Roblox servers.\n- Pure ECS (Entity Component System) architecture in Luau.',
      galleryImages: [],
      attachments: []
    }
  ] as UpcomingProject[]
};