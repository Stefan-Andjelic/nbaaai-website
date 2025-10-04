'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PlayerSearch } from '../PlayerSearch';
import { 
  PredictionType, 
  ComparisonOperator, 
  STAT_TYPES, 
  COMPARISON_OPERATORS 
} from '@/types/predictions';
import { getCurrentSeason } from '@/lib/predictionUtils';

interface CreatePredictionFormProps {
  onSuccess?: () => void;
}

export default function CreatePredictionForm({ onSuccess }: CreatePredictionFormProps) {
  const [predictionType, setPredictionType] = useState<PredictionType>('season');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const [statType, setStatType] = useState('');
  const [comparisonOperator, setComparisonOperator] = useState<ComparisonOperator>('more_than');
  const [targetValue, setTargetValue] = useState('');
  const [gameDate, setGameDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!statType || !targetValue) {
      setError('Please fill in all required fields');
      return;
    }

    if (predictionType === 'game' && !gameDate) {
      setError('Please select a game date');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prediction_type: predictionType,
          player_id: selectedPlayer?.id,
          player_name: selectedPlayer?.name,
          stat_type: statType,
          comparison_operator: comparisonOperator,
          target_value: parseFloat(targetValue),
          season: predictionType === 'season' ? getCurrentSeason() : undefined,
          game_date: predictionType === 'game' ? gameDate : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prediction');
      }

      // Reset form
      setSelectedPlayer(null);
      setStatType('');
      setTargetValue('');
      setGameDate('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statOptions = STAT_TYPES[predictionType];

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="prediction-type" className="text-base font-semibold">
            Prediction Type
          </Label>
          <div className="mt-2 flex gap-4">
            <Button
              type="button"
              variant={predictionType === 'season' ? 'default' : 'outline'}
              onClick={() => setPredictionType('season')}
              className="flex-1"
            >
              Season Prediction
            </Button>
            <Button
              type="button"
              variant={predictionType === 'game' ? 'default' : 'outline'}
              onClick={() => setPredictionType('game')}
              className="flex-1"
            >
              Game Prediction
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="player-search" className="text-sm font-medium">
            Player (Optional)
          </Label>
          <PlayerSearch
            onPlayerSelect={(player) => setSelectedPlayer({ id: player.id, name: player.name })}
            selectedPlayer={selectedPlayer}
          />
          {selectedPlayer && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedPlayer.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="stat-type" className="text-sm font-medium">
            Stat Type *
          </Label>
          <select
            id="stat-type"
            value={statType}
            onChange={(e) => setStatType(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a stat</option>
            {statOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="comparison-operator" className="text-sm font-medium">
            Comparison *
          </Label>
          <select
            id="comparison-operator"
            value={comparisonOperator}
            onChange={(e) => setComparisonOperator(e.target.value as ComparisonOperator)}
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {COMPARISON_OPERATORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="target-value" className="text-sm font-medium">
            Target Value *
          </Label>
          <Input
            id="target-value"
            type="number"
            step="0.1"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Enter target value"
            required
            className="mt-1"
          />
        </div>

        {predictionType === 'game' && (
          <div>
            <Label htmlFor="game-date" className="text-sm font-medium">
              Game Date *
            </Label>
            <Input
              id="game-date"
              type="date"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Creating...' : 'Create Prediction'}
        </Button>
      </form>
    </Card>
  );
}