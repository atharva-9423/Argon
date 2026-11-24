import {
  BadgeItem,
  CandidateStudent,
  CertificateItem,
  ChallengeItem,
  EventItem,
  LeaderboardStudent,
  LeaderboardTeam,
  LearningIsland,
  LiveSession,
  NotificationItem,
  ProjectItem,
  StudentProfile,
  TeamWorkspace,
} from '../types';

export const ASSETS = {
  heroLaptop: '/src/assets/images/hero_argon_laptop_1795330321448.jpg',
  sidebarCubes: '/src/assets/images/sidebar_voxel_cubes_1795330322144.jpg',
  avatarAditya: '/src/assets/images/avatar_aditya_patil_1795330322812.jpg',
  eventHackathon: '/src/assets/images/event_hackathon_arena_1795330323541.jpg',
  eventAiWorkshop: '/src/assets/images/event_ai_workshop_1795330321712.jpg',
};

export const INITIAL_PROFILE: StudentProfile = {
  name: '',
  branch: 'Computer Engg.',
  year: 'FE',
  college: 'AVCOE, Sangamner',
  email: '',
  github: '',
  bio: '',
  skills: [],
  interests: [],
  avatarUrl: ASSETS.avatarAditya,
  xp: 0,
  streakDays: 0,
  weeklyHoursTarget: 5,
  attendanceRate: 0,
};

export const INITIAL_ISLANDS: LearningIsland[] = [
  {
    id: 'island-1',
    level: 1,
    name: 'Coding Forest',
    subtitle: 'Foundations of problem solving, C++/Python syntax, and clean algorithmic thinking.',
    themeColor: '#48B8AE',
    accentHex: '#2F9E94',
    badgeName: 'Forest Pathfinder',
    requiredXp: 0,
    status: 'active',
    position: [-9.5, 0, 2.2],
    checkpoints: ['Variables & Logic', 'Loops & Arrays', 'Recursion Trail', 'DSA Checkpoint'],
    lessons: [
      {
        id: 'l1-1',
        title: 'Complexity & Problem Decomposition',
        type: 'Lesson',
        duration: '25 min',
        xp: 120,
        completed: false,
      },
      {
        id: 'l1-2',
        title: 'Arrays, Strings & Sliding Window',
        type: 'Quiz',
        duration: '20 min',
        xp: 150,
        completed: false,
        quizQuestion: {
          prompt:
            'What is the time complexity of finding the maximum sum of a fixed-size subarray k using a sliding window?',
          options: ['O(n * k)', 'O(n)', 'O(n log n)', 'O(k²)'],
          correctIndex: 1,
        },
      },
      {
        id: 'l1-3',
        title: 'CLI Expense Tracker Mini-Project',
        type: 'Project',
        duration: '45 min',
        xp: 200,
        completed: false,
      },
    ],
  },
  {
    id: 'island-2',
    level: 2,
    name: 'Web Development Village',
    subtitle: 'Modern responsive layouts, React component craft, and REST API integration.',
    themeColor: '#F97316',
    accentHex: '#EA580C',
    badgeName: 'Village Architect',
    requiredXp: 400,
    status: 'locked',
    position: [-5.6, 0.45, -1.6],
    checkpoints: ['Semantic HTML & CSS', 'Interactive TypeScript', 'React State Hooks', 'Live Portfolio Deploy'],
    lessons: [
      {
        id: 'l2-1',
        title: 'Responsive Grid & Design Tokens',
        type: 'Lesson',
        duration: '30 min',
        xp: 120,
        completed: false,
      },
      {
        id: 'l2-2',
        title: 'React State, Effects & Custom Hooks',
        type: 'Quiz',
        duration: '25 min',
        xp: 160,
        completed: false,
        quizQuestion: {
          prompt: 'Which hook lets you synchronize a React component with an external browser API or subscription?',
          options: ['useMemo', 'useEffect', 'useId', 'useReducer'],
          correctIndex: 1,
        },
      },
      {
        id: 'l2-3',
        title: 'Campus Event Explorer App',
        type: 'Project',
        duration: '60 min',
        xp: 240,
        completed: false,
      },
    ],
  },
  {
    id: 'island-3',
    level: 3,
    name: 'Git & GitHub Workshop',
    subtitle: 'Team branching workflows, pull request etiquette, and merge conflict resolution.',
    themeColor: '#F59E0B',
    accentHex: '#D97706',
    badgeName: 'Branch Forger',
    requiredXp: 900,
    status: 'locked',
    position: [-1.5, 0.9, 1.5],
    checkpoints: ['Commits & Branches', 'Pull Requests', 'Conflict Rescue', 'Team CI Checks'],
    lessons: [
      {
        id: 'l3-1',
        title: 'Feature Branches & Atomic Commits',
        type: 'Lesson',
        duration: '25 min',
        xp: 140,
        completed: false,
      },
      {
        id: 'l3-2',
        title: 'Resolving Merge Conflicts Cleanly',
        type: 'Quiz',
        duration: '20 min',
        xp: 180,
        completed: false,
        quizQuestion: {
          prompt: 'Which Git command safely creates and switches to a new feature branch named feat/login?',
          options: [
            'git branch feat/login',
            'git switch -c feat/login',
            'git merge feat/login',
            'git push origin feat/login',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'l3-3',
        title: 'Team PR Review & Release Tagging',
        type: 'Assignment',
        duration: '35 min',
        xp: 220,
        completed: false,
      },
    ],
  },
  {
    id: 'island-4',
    level: 4,
    name: 'AI Innovation Mountain',
    subtitle: 'Applied machine learning pipelines, prompt engineering, and structured evaluations.',
    themeColor: '#9B72E7',
    accentHex: '#7C4FD6',
    badgeName: 'Summit Synthesizer',
    requiredXp: 1500,
    status: 'locked',
    position: [2.6, 1.5, -1.8],
    checkpoints: ['Python Dataframes', 'Model Inference APIs', 'RAG Architecture', 'AI Prototype Demo'],
    lessons: [
      {
        id: 'l4-1',
        title: 'Vector Embeddings & Semantic Search',
        type: 'Lesson',
        duration: '35 min',
        xp: 180,
        completed: false,
      },
      {
        id: 'l4-2',
        title: 'Evaluating LLM Accuracy & Latency',
        type: 'Quiz',
        duration: '25 min',
        xp: 210,
        completed: false,
        quizQuestion: {
          prompt: 'Why is Retrieval-Augmented Generation (RAG) effective for campus or domain-specific assistants?',
          options: [
            'It removes the need for any database',
            'It grounds model responses in verified external documents',
            'It doubles GPU clock speed automatically',
            'It replaces HTTP with WebSockets',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'l4-3',
        title: 'Build a Syllabus Study Assistant MVP',
        type: 'Project',
        duration: '75 min',
        xp: 300,
        completed: false,
      },
    ],
  },
  {
    id: 'island-5',
    level: 5,
    name: 'Project Development City',
    subtitle: 'System design, backend APIs, user testing, and shipping production MVPs in 36 hours.',
    themeColor: '#48B8AE',
    accentHex: '#2C8E86',
    badgeName: 'City Builder',
    requiredXp: 2200,
    status: 'locked',
    position: [6.4, 2.0, 1.4],
    checkpoints: ['API Architecture', 'Database Schema', 'Deployment Pipeline', 'Usability Polish'],
    lessons: [
      {
        id: 'l5-1',
        title: 'Designing Hackathon-Ready REST APIs',
        type: 'Lesson',
        duration: '40 min',
        xp: 220,
        completed: false,
      },
      {
        id: 'l5-2',
        title: 'Zero-Downtime Deployment Checklist',
        type: 'Assignment',
        duration: '35 min',
        xp: 240,
        completed: false,
      },
      {
        id: 'l5-3',
        title: 'Full-Stack Capstone Deployment',
        type: 'Project',
        duration: '90 min',
        xp: 360,
        completed: false,
      },
    ],
  },
  {
    id: 'island-6',
    level: 6,
    name: 'Hackathon Champion Castle',
    subtitle: 'Pitch deck storytelling, live jury Q&A, rapid demo resilience, and national finals.',
    themeColor: '#F97316',
    accentHex: '#C2410C',
    badgeName: 'Grand Innovator',
    requiredXp: 3000,
    status: 'locked',
    position: [10.0, 2.65, -1.2],
    checkpoints: ['Problem Framing', '3-Minute Pitch', 'Live Demo Drill', 'Jury Defense'],
    lessons: [
      {
        id: 'l6-1',
        title: 'Crafting High-Impact SIH Pitch Decks',
        type: 'Lesson',
        duration: '30 min',
        xp: 250,
        completed: false,
      },
      {
        id: 'l6-2',
        title: 'Mock Jury Q&A Simulation',
        type: 'Quiz',
        duration: '25 min',
        xp: 260,
        completed: false,
        quizQuestion: {
          prompt: 'During a 3-minute hackathon pitch, what should you demonstrate within the first 60 seconds?',
          options: [
            'Every single database column name',
            'The real user problem and live working core solution',
            'Your team’s favorite programming languages',
            'A 10-slide history of the internet',
          ],
          correctIndex: 1,
        },
      },
      {
        id: 'l6-3',
        title: 'Final Capstone Demo Submission',
        type: 'Project',
        duration: '60 min',
        xp: 450,
        completed: false,
      },
    ],
  },
];

export const WEEKLY_ACTIVITY_SERIES = {
  Weekly: [
    { label: 'Mon', learning: 0, practice: 0, projects: 0 },
    { label: 'Tue', learning: 0, practice: 0, projects: 0 },
    { label: 'Wed', learning: 0, practice: 0, projects: 0 },
    { label: 'Thu', learning: 0, practice: 0, projects: 0 },
    { label: 'Fri', learning: 0, practice: 0, projects: 0 },
    { label: 'Sat', learning: 0, practice: 0, projects: 0 },
    { label: 'Sun', learning: 0, practice: 0, projects: 0 },
  ],
  Monthly: [
    { label: 'Wk 1', learning: 0, practice: 0, projects: 0 },
    { label: 'Wk 2', learning: 0, practice: 0, projects: 0 },
    { label: 'Wk 3', learning: 0, practice: 0, projects: 0 },
    { label: 'Wk 4', learning: 0, practice: 0, projects: 0 },
  ],
  'All Time': [
    { label: 'M1', learning: 0, practice: 0, projects: 0 },
    { label: 'M2', learning: 0, practice: 0, projects: 0 },
    { label: 'M3', learning: 0, practice: 0, projects: 0 },
    { label: 'M4', learning: 0, practice: 0, projects: 0 },
  ],
};

export const ANALYTICS_EXTRA = {
  xpOverTime: [
    { week: 'W1', you: 0, teamAvg: 0 },
    { week: 'W2', you: 0, teamAvg: 0 },
    { week: 'W3', you: 0, teamAvg: 0 },
    { week: 'W4', you: 0, teamAvg: 0 },
  ],
  assignmentScores: [
    { month: 'M1', score: 0 },
    { month: 'M2', score: 0 },
    { month: 'M3', score: 0 },
    { month: 'M4', score: 0 },
  ],
  skills: [
    { name: 'DSA & Logic', level: 0, color: '#F95C4B' },
    { name: 'Frontend & React', level: 0, color: '#000000' },
    { name: 'Git & Collaboration', level: 0, color: '#F95C4B' },
    { name: 'Applied AI & APIs', level: 0, color: '#000000' },
  ],
};

export const INITIAL_SESSIONS: LiveSession[] = [];

export const INITIAL_PROJECTS: ProjectItem[] = [];

export const INITIAL_TEAM: TeamWorkspace = {
  id: '',
  name: 'No Team Assigned',
  code: '—',
  tagline: 'Wait for your Admin to assign a team or configure your squad.',
  hackathonTarget: 'No hackathon selected yet',
  accentColor: '#F95C4B',
  members: [],
  milestones: [
    {
      id: 'ms-1',
      label: 'Team Formed',
      stage: 'Team Formation',
      completed: false,
      dueLabel: 'Pending',
      owner: 'Team',
    },
    {
      id: 'ms-2',
      label: 'Problem Statement',
      stage: 'Problem Statement',
      completed: false,
      dueLabel: 'Pending',
      owner: 'Team',
    },
    {
      id: 'ms-3',
      label: 'Prototype (MVP)',
      stage: 'Prototype (MVP)',
      completed: false,
      dueLabel: 'Pending',
      owner: 'Team',
    },
    {
      id: 'ms-4',
      label: 'Final Submission',
      stage: 'Final Submission',
      completed: false,
      dueLabel: 'Pending',
      owner: 'Team',
    },
    {
      id: 'ms-5',
      label: 'Presentation',
      stage: 'Presentation',
      completed: false,
      dueLabel: 'Pending',
      owner: 'Team',
    },
  ],
};

export const INITIAL_CANDIDATES: CandidateStudent[] = [];

export const INITIAL_CHALLENGES: ChallengeItem[] = [];

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_LEADERBOARD_STUDENTS: LeaderboardStudent[] = [];

export const INITIAL_LEADERBOARD_TEAMS: LeaderboardTeam[] = [];

export const INITIAL_BADGES: BadgeItem[] = [];

export const INITIAL_CERTIFICATES: CertificateItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
