import { BallConfig, BallType, Player } from '../types';

export const COLOR_BALL_POINTS: Record<BallType, number> = {
  red: 10, // will be overridden dynamically by settings
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
};

export function getBallConfigs(redPoints: number = 10): BallConfig[] {
  return [
    {
      id: 'red',
      nameFa: 'قرمز',
      points: redPoints,
      bgGradient: 'radial-gradient(circle at 35% 28%, #ff8a8a 0%, #dc2626 40%, #7f1d1d 95%)',
      specularColor: '#fee2e2',
      shadowColor: '#450a0a',
      textColor: '#ffffff',
      badgeBg: '#b91c1c',
    },
    {
      id: 'yellow',
      nameFa: 'زرد',
      points: 2,
      bgGradient: 'radial-gradient(circle at 35% 28%, #fef08a 0%, #eab308 42%, #854d0e 95%)',
      specularColor: '#fef9c3',
      shadowColor: '#713f12',
      textColor: '#1c1917',
      badgeBg: '#ca8a04',
    },
    {
      id: 'green',
      nameFa: 'سبز',
      points: 3,
      bgGradient: 'radial-gradient(circle at 35% 28%, #86efac 0%, #16a34a 42%, #14532d 95%)',
      specularColor: '#dcfce7',
      shadowColor: '#052e16',
      textColor: '#ffffff',
      badgeBg: '#15803d',
    },
    {
      id: 'brown',
      nameFa: 'قهوه‌ای',
      points: 4,
      bgGradient: 'radial-gradient(circle at 35% 28%, #fed7aa 0%, #9a3412 45%, #431407 95%)',
      specularColor: '#ffedd5',
      shadowColor: '#2b0c03',
      textColor: '#ffffff',
      badgeBg: '#9a3412',
    },
    {
      id: 'blue',
      nameFa: 'آبی',
      points: 5,
      bgGradient: 'radial-gradient(circle at 35% 28%, #93c5fd 0%, #2563eb 42%, #1e3a8a 95%)',
      specularColor: '#dbeafe',
      shadowColor: '#172554',
      textColor: '#ffffff',
      badgeBg: '#1d4ed8',
    },
    {
      id: 'pink',
      nameFa: 'صورتی',
      points: 6,
      bgGradient: 'radial-gradient(circle at 35% 28%, #fbcfe8 0%, #ec4899 42%, #831843 95%)',
      specularColor: '#fce7f3',
      shadowColor: '#500724',
      textColor: '#ffffff',
      badgeBg: '#be185d',
    },
    {
      id: 'black',
      nameFa: 'مشکی',
      points: 7,
      bgGradient: 'radial-gradient(circle at 35% 28%, #71717a 0%, #27272a 45%, #09090b 98%)',
      specularColor: '#e4e4e7',
      shadowColor: '#000000',
      textColor: '#ffffff',
      badgeBg: '#18181b',
    },
  ];
}

/**
 * Calculates remaining points on the table.
 * Standard colors value: 2 + 3 + 4 + 5 + 6 + 7 = 27
 * With reds: (remainingReds * (redValue + 7)) + 27
 */
export function calculateRemainingPointsOnTable(remainingReds: number, redPoints: number): number {
  const colorsTotal = 27;
  if (remainingReds > 0) {
    return remainingReds * (redPoints + 7) + colorsTotal;
  }
  return colorsTotal;
}

/**
 * Calculates snookers required for a player against the leader
 */
export function calculateSnookersRequired(
  leaderScore: number,
  playerScore: number,
  pointsOnTable: number,
  foulValue: number = 4
): { snookersNeeded: number; pointsDeficit: number } {
  const pointsDeficit = leaderScore - playerScore;
  if (pointsDeficit <= pointsOnTable) {
    return { snookersNeeded: 0, pointsDeficit };
  }
  const deficitAboveTable = pointsDeficit - pointsOnTable;
  const snookersNeeded = Math.ceil(deficitAboveTable / foulValue);
  return { snookersNeeded, pointsDeficit };
}

/**
 * Sorts players for live dynamic leaderboard:
 * Highest current score first, then frame wins, then highest break.
 */
export function sortPlayersForLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    if (b.currentScore !== a.currentScore) {
      return b.currentScore - a.currentScore;
    }
    if (b.frameWins !== a.frameWins) {
      return b.frameWins - a.frameWins;
    }
    return b.matchHighestBreak - a.matchHighestBreak;
  });
}
