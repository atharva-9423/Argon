export type NavTab =
  | 'dashboard'
  | 'learning-path'
  | 'live-sessions'
  | 'projects'
  | 'teams'
  | 'challenges'
  | 'hackathon'
  | 'events'
  | 'leaderboard'
  | 'certificates'
  | 'profile'
  | 'settings'
  | 'admin';

export interface LessonItem {
  id: string;
  title: string;
  type: 'Lesson' | 'Quiz' | 'Assignment' | 'Project';
  duration: string;
  xp: number;
  completed: boolean;
  quizQuestion?: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
}

export interface LearningIsland {
  id: string;
  level: number;
  name: string;
  subtitle: string;
  themeColor: string;
  accentHex: string;
  badgeName: string;
  requiredXp: number;
  status: 'completed' | 'active' | 'locked';
  position: [number, number, number];
  checkpoints: string[];
  lessons: LessonItem[];
}

export interface LiveSession {
  id: string;
  title: string;
  mode: 'Online' | 'Offline';
  track: string;
  dateLabel: string;
  timeRange: string;
  venueOrLink: string;
  instructor: string;
  instructorRole: string;
  durationHrs: number;
  xpReward: number;
  tier: 'Free Core Training' | 'Optional Advanced (College Approved)';
  registered: boolean;
  attended: boolean;
  checkInCode: string;
  recordingUrl?: string;
  slidesLabel?: string;
  watchedRecording?: boolean;
  seatsTotal: number;
  seatsFilled: number;
  isPast?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  teamName: string;
  track: 'AI & ML' | 'Web & Full-Stack' | 'IoT & Hardware' | 'Developer Tools';
  description: string;
  techStack: string[];
  upvotes: number;
  upvoted: boolean;
  status: 'Deployed' | 'In Review' | 'Hackathon Winner';
  repoUrl: string;
  demoUrl: string;
  submittedDate: string;
  xpAwarded: number;
}

export interface TeamMember {
  id: string;
  name: string;
  branch: string;
  year: string;
  role: string;
  skills: string[];
  xpContribution: number;
  initials: string;
  accentColor: string;
  isCurrentUser?: boolean;
}

export interface CandidateStudent {
  id: string;
  name: string;
  branch: string;
  year: string;
  primaryRole: string;
  skills: string[];
  interests: string[];
  xp: number;
  initials: string;
  accentColor: string;
  invited?: boolean;
}

export interface ReadinessMilestone {
  id: string;
  label: string;
  stage: 'Team Formation' | 'Problem Statement' | 'Prototype (MVP)' | 'Final Submission' | 'Presentation';
  completed: boolean;
  dueLabel: string;
  owner: string;
}

export interface TeamWorkspace {
  id: string;
  name: string;
  code: string;
  tagline: string;
  hackathonTarget: string;
  accentColor: string;
  logoDataUrl?: string;
  members: TeamMember[];
  milestones: ReadinessMilestone[];
}

export interface ManagedTeam {
  id: string;
  name: string;
  code: string;
  tagline: string;
  hackathonTarget: string;
  logoDataUrl?: string;
  accentColor: string;
  weeklyXp: number;
  monthlyXp: number;
  allTimeXp: number;
  projectsShipped: number;
  badgesCount: number;
  isUserTeam?: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: string;
  role: 'Student' | 'Team Lead' | 'Mentor' | 'Admin';
  teamId: string;
  teamName: string;
  defaultPassword: string;
  passwordHash?: string;
  passwordSalt?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  passwordEmailedAt?: string;
  weeklyXp: number;
  monthlyXp: number;
  allTimeXp: number;
  questsCompleted: number;
  badgesCount: number;
  streakDays: number;
  initials: string;
  isCurrentUser?: boolean;
}

export interface ChallengeItem {
  id: string;
  title: string;
  category: 'DSA Sprint' | 'Web UI' | 'Git Mastery' | 'AI Prompting' | 'Debug Quest';
  difficulty: 'Beginner' | 'Intermediate' | 'Builder';
  xp: number;
  estimatedMin: number;
  completed: boolean;
  description: string;
  question: string;
  options: string[];
  correctIndex: number;
  streakEligible: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  category:
    | 'Internal Hackathon'
    | 'National Hackathon'
    | 'Coding Competition'
    | 'Guest Lecture'
    | 'Innovation Challenge';
  mode: 'Offline · AVCOE Campus' | 'Hybrid · Online + Lab' | 'National · Online + Finals';
  targetDateIso: string;
  dateDisplay: string;
  prizeOrOutcome: string;
  xpReward: number;
  registered: boolean;
  participantsCount: number;
  maxParticipants: number;
  imageUrl: string;
  description: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  branch: string;
  year: string;
  teamId: string;
  teamName: string;
  trackPreference?: string;
  registeredAt: string;
}

export interface LeaderboardStudent {
  id: string;
  name: string;
  branch: string;
  teamName: string;
  weeklyXp: number;
  monthlyXp: number;
  allTimeXp: number;
  questsCompleted: number;
  badgesCount: number;
  streakDays: number;
  initials: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardTeam {
  id: string;
  name: string;
  code?: string;
  logoDataUrl?: string;
  membersCount: number;
  weeklyXp: number;
  monthlyXp: number;
  allTimeXp: number;
  projectsShipped: number;
  badgesCount: number;
  isUserTeam?: boolean;
}

export interface BadgeItem {
  id: string;
  name: string;
  category: 'Digital Skill' | 'Project Completion' | 'Leadership' | 'Hackathon' | 'Milestone & Streak';
  description: string;
  rule: string;
  unlocked: boolean;
  unlockedDate?: string;
  colorScheme: 'orange' | 'purple' | 'amber' | 'teal';
  iconName: 'code' | 'zap' | 'users' | 'book' | 'trophy' | 'git' | 'cpu' | 'shield';
  imageUrl?: string;
  xpBonus: number;
}

export interface CertificateItem {
  id: string;
  title: string;
  type: 'Registration Certificate' | 'Training Completion' | 'Hackathon Achievement';
  status: 'Earned' | 'In Progress' | 'Locked';
  progressPct: number;
  eligibilityRule: string;
  issuedDate?: string;
  credentialId?: string;
  approvalNote: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  read: boolean;
  targetTab: NavTab;
}

export interface StudentProfile {
  name: string;
  branch: string;
  year: string;
  college: string;
  email: string;
  github: string;
  bio: string;
  skills: string[];
  interests: string[];
  avatarUrl: string;
  xp: number;
  streakDays: number;
  weeklyHoursTarget: number;
  attendanceRate: number;
}

export interface ToastReward {
  id: string;
  title: string;
  subtitle?: string;
  xpDelta?: number;
  type: 'xp' | 'badge' | 'info' | 'levelup';
}
