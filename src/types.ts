export type BallType = 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';

export interface BallConfig {
  id: BallType;
  nameFa: string;
  points: number;
  bgGradient: string;
  specularColor: string;
  shadowColor: string;
  textColor: string;
  badgeBg: string;
}

export interface Player {
  id: string;
  name: string;
  currentScore: number;
  frameWins: number;
  currentBreak: number;
  highestBreakInFrame: number;
  matchHighestBreak: number;
  potsCount: number;
  missesCount: number;
  foulsCount: number;
  color: string;
}

export type ActionMode = 'pot' | 'miss' | 'foul';

export type FoulPenaltyAction = 'awardOpponent' | 'deductPlayer' | 'both';

export interface MatchSettings {
  redPoints: number; // 10 (Custom default) or 1 (Official)
  totalReds: number; // 15, 10, or 6
  bestOfFrames: number; // e.g., 1, 3, 5, 7, 9
  foulRule: FoulPenaltyAction;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export interface FoulReason {
  id: string;
  titleFa: string;
  defaultPenalty: number;
  descriptionFa?: string;
}

export interface ActionHistorySnapshot {
  players: Player[];
  activePlayerIndex: number;
  remainingReds: number;
  currentFrameNumber: number;
  actionDescriptionFa: string;
  timestamp: number;
}

export interface MatchState {
  players: Player[];
  activePlayerIndex: number;
  remainingReds: number;
  currentFrameNumber: number;
  isMatchFinished: boolean;
  matchWinnerId: string | null;
  history: ActionHistorySnapshot[];
  settings: MatchSettings;
}
