export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  lastName: string;
  nickname: string;
  courseGroup: string; // e.g. "10-1", "10-2", "10-3"
  role: UserRole;
  avatar: string;
  spaceship: string;
  level: number;
  xp: number;
  cosmicCredits: number;
  batteries: number; // 0 to 3
  streakDays: number;
  lastActiveDate: string;
  galaxiesExplored: number;
  missionsCompleted: number;
  exercisesSolved: number;
  accuracy: number; // percentage, e.g. 92
  bestStreak: number;
  unlockedItems: string[]; // item IDs
  equippedItems: {
    avatar: string;
    spaceship: string;
    trail: string;
    banner: string;
  };
  badges: string[]; // badge IDs
}

export type QuestionType =
  | 'mental_math'
  | 'multiple_choice'
  | 'pythagoras_builder'
  | 'trig_ratio_builder'
  | 'unit_circle_point'
  | 'order_steps'
  | 'trig_graph_manipulator';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  context?: string;
  hint?: string;
  explanation: string; // Step-by-step pedagogical explanation on error
  pointsXP: number;
  pointsCredits: number;
}

export interface MentalMathQuestion extends BaseQuestion {
  type: 'mental_math';
  numA: number;
  operator: '+' | '-' | '×' | '÷' | '^';
  numB: number;
  correctAnswer: number;
  timeLimitSeconds?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctIndex: number;
  formula?: string;
  diagramType?: 'triangle' | 'circle' | 'coordinates' | 'wave';
  diagramData?: any;
}

export interface PythagorasQuestion extends BaseQuestion {
  type: 'pythagoras_builder';
  catetoA?: number;
  catetoB?: number;
  hipotenusa?: number;
  targetSide: 'catetoA' | 'catetoB' | 'hipotenusa';
  correctValue: number;
  unit: string;
  storyContext?: string;
}

export interface TrigRatioQuestion extends BaseQuestion {
  type: 'trig_ratio_builder';
  triangle: {
    angleLabel: string;
    angleDeg: number;
    opposite: number;
    adjacent: number;
    hypotenuse: number;
  };
  targetRatio: 'sin' | 'cos' | 'tan';
  correctNumerator: number;
  correctDenominator: number;
}

export interface UnitCircleQuestion extends BaseQuestion {
  type: 'unit_circle_point';
  angleDeg: number;
  angleRadText: string;
  targetValue: 'cos' | 'sin' | 'coord';
  correctX: string;
  correctY: string;
}

export interface OrderStepsQuestion extends BaseQuestion {
  type: 'order_steps';
  problemStatement: string;
  steps: { id: string; text: string }[];
  correctOrderIds: string[];
}

export interface TrigGraphQuestion extends BaseQuestion {
  type: 'trig_graph_manipulator';
  targetFunction: 'sin' | 'cos';
  targetAmplitude: number;
  targetFrequency: number;
  targetPhase: number;
  targetVerticalShift: number;
}

export type Question =
  | MentalMathQuestion
  | MultipleChoiceQuestion
  | PythagorasQuestion
  | TrigRatioQuestion
  | UnitCircleQuestion
  | OrderStepsQuestion
  | TrigGraphQuestion;

export interface Mission {
  id: string;
  galaxyId: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  requiredStarsToUnlock: number;
  questions: Question[];
  xpReward: number;
  creditsReward: number;
  type: 'academic' | 'recharge_station' | 'boss_challenge';
}

export interface Galaxy {
  id: string;
  name: string;
  sectorName: string;
  order: number;
  themeColor: string; // e.g. "#22D3EE"
  description: string;
  topics: string[];
  missions: Mission[];
  isLockedByDefault?: boolean;
}

export interface StudentMissionProgress {
  missionId: string;
  completed: boolean;
  stars: number; // 0, 1, 2, 3
  highScore: number;
  attemptsCount: number;
  errorsCount: number;
  lastAttemptDate: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'streak' | 'math' | 'speed' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface RewardItem {
  id: string;
  title: string;
  type: 'avatar' | 'spaceship' | 'trail' | 'banner' | 'minigame';
  priceCredits: number;
  description: string;
  previewUrl?: string;
  accentColor: string;
  unlockedByDefault?: boolean;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  creditsReward: number;
  badgeRewardId?: string;
  isCompleted: boolean;
  expiresInDays: number;
}

export interface CourseEvent {
  id: string;
  title: string;
  description: string;
  multiplierXP: number;
  active: boolean;
  remainingHours: number;
  badgeRewardId?: string;
  bannerColor: string;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  name: string;
  lastName: string;
  avatar: string;
  spaceship: string;
  level: number;
  weeklyXP: number;
  monthlyXP: number;
  allTimeXP: number;
  streakDays: number;
  courseGroup: string;
  rank?: number;
}

export interface ClassErrorStat {
  topic: string;
  errorPercentage: number;
  affectedStudentsCount: number;
  severity: 'high' | 'medium' | 'low';
}

export interface QuestionAnswerLog {
  id: string;
  questionId: string;
  studentId: string;
  missionId: string;
  numberOfAttempts: number; // 1 or 2
  correct: boolean;
  firstAttemptCorrect: boolean;
  batteryLost: boolean;
  timestamp: string;
}

