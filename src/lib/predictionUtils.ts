import { ComparisonOperator } from '@/types/predictions';

const ADJECTIVES = [
  'Swift', 'Brave', 'Clever', 'Mighty', 'Noble', 'Quick', 'Bold', 'Sharp',
  'Wise', 'Fierce', 'Cool', 'Epic', 'Cosmic', 'Turbo', 'Ultra', 'Alpha',
  'Stellar', 'Legendary', 'Dynamic', 'Supreme'
];

const NOUNS = [
  'Eagle', 'Tiger', 'Dragon', 'Phoenix', 'Falcon', 'Wolf', 'Lion', 'Hawk',
  'Panther', 'Bear', 'Viper', 'Rhino', 'Shark', 'Raven', 'Fox', 'Cobra',
  'Stallion', 'Jaguar', 'Lynx', 'Orca'
];

/**
 * Generates a random anonymous username
 * Format: AdjectiveNoun#### [anonymous]
 * Example: SwiftEagle4782 [anonymous]
 */
export function generateAnonymousUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  
  return `${adjective}${noun}${number} [anonymous]`;
}

/**
 * Formats a prediction into human-readable text
 */
export function formatPredictionText(
  playerName: string | null,
  statType: string,
  operator: ComparisonOperator,
  targetValue: number,
  predictionType: 'season' | 'game'
): string {
  const operatorText = {
    more_than: 'more than',
    less_than: 'less than',
    at_least: 'at least',
    at_most: 'at most',
    exactly: 'exactly',
  }[operator];

  const statLabel = statType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  if (playerName) {
    return `${playerName} will score ${operatorText} ${targetValue} ${statLabel}`;
  }
  
  return `${operatorText} ${targetValue} ${statLabel}`;
}

/**
 * Calculates progress percentage for a prediction
 */
export function calculateProgress(
  currentValue: number,
  targetValue: number,
  operator: ComparisonOperator
): number {
  if (operator === 'exactly') {
    return currentValue === targetValue ? 100 : (currentValue / targetValue) * 100;
  }
  
  if (operator === 'more_than') {
    return Math.min((currentValue / targetValue) * 100, 100);
  }
  
  // less_than
  if (currentValue >= targetValue) {
    return 0;
  }
  return Math.max(0, ((targetValue - currentValue) / targetValue) * 100);
}

/**
 * Checks if a prediction has been met
 */
export function isPredictionMet(
  currentValue: number,
  targetValue: number,
  operator: ComparisonOperator
): boolean {
  switch (operator) {
    case 'more_than':
      return currentValue > targetValue;
    case 'less_than':
      return currentValue < targetValue;
    case 'exactly':
      return currentValue === targetValue;
    default:
      return false;
  }
}

/**
 * Gets the current NBA season (e.g., "2024-25")
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // NBA season typically starts in October
  if (month >= 10) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
  return `${year - 1}-${year.toString().slice(-2)}`;
}