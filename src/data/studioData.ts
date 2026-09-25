export interface AppItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  iconBg: string;
  version: string;
  downloadUrl: string;
}

export interface UpcomingProject {
  id: string;
  name: string;
  tagline: string;
  status: 'In Development' | 'Alpha';
  progress: number;
  techStack: string[];
}

export const ACTIVE_APPS: AppItem[] = [
  {
    id: 'vyrith-engine-cli',
    name: 'Vyrith Core CLI',
    category: 'System Tooling',
    rating: 4.9,
    description: 'High-throughput cross-compilation pipeline and memory profiler written in C++ and Rust.',
    iconBg: 'from-blue-600 to-indigo-600',
    version: 'v2.4.1',
    downloadUrl: '#'
  },
  {
    id: 'aether-spatial-audio',
    name: 'Aether Audio Engine',
    category: 'Game Engine Plugin',
    rating: 4.8,
    description: 'Real-time binaural spatial audio middleware using SIMD C++ DSP algorithms.',
    iconBg: 'from-indigo-600 to-purple-600',
    version: 'v1.1.0-lts',
    downloadUrl: '#'
  },
  {
    id: 'ro-sync-daemon',
    name: 'RoSync Luau Hub',
    category: 'Developer Workspace',
    rating: 4.95,
    description: 'Instant local AST analyzer and live-sync bridge for Luau runtime sandboxes.',
    iconBg: 'from-cyan-500 to-blue-600',
    version: 'v3.0.2',
    downloadUrl: '#'
  }
];

export const UPCOMING_PROJECTS: UpcomingProject[] = [
  {
    id: 'proj-1',
    name: 'Project Chronos: Tactical Protocol',
    tagline: 'Deterministic multiplayer FPS featuring low-latency custom UDP netcode.',
    status: 'In Development',
    progress: 68,
    techStack: ['C++', 'Rust', 'Unity', 'DirectX 12'],
  },
  {
    id: 'proj-2',
    name: 'NexusOS: Microkernel Simulator',
    tagline: 'Lightweight simulated embedded real-time OS designed for robotics testing.',
    status: 'Alpha',
    progress: 85,
    techStack: ['C', 'C++', 'ASM', 'WebAssembly'],
  },
  {
    id: 'proj-3',
    name: 'Aetheria MMO Game Universe',
    tagline: 'Next-gen persistent voxel-based survival universe with modular Luau scripting.',
    status: 'In Development',
    progress: 42,
    techStack: ['Luau', 'C++', 'Vulkan', 'React'],
  }
];