'use client';

import { Card } from '@/components/ui/card';
import { Prediction } from '@/types/predictions';
import { calculateProgress, isPredictionMet } from '@/lib/predictionUtils';

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const progress = calculateProgress(
    prediction.current_value,
    prediction.target_value,
    prediction.comparison_operator
  );
  
  const isMet = isPredictionMet(
    prediction.current_value,
    prediction.target_value,
    prediction.comparison_operator
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {prediction.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDate(prediction.created_at)}
            </p>
          </div>
          
          {prediction.is_after_start && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
              Late Entry
            </span>
          )}
        </div>

        {/* Prediction Text */}
        <div className="pt-2">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {prediction.prediction_text}
          </p>
          
          {prediction.prediction_type === 'season' && prediction.season && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {prediction.season} Season
            </p>
          )}
          
          {prediction.prediction_type === 'game' && prediction.game_date && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Game on {formatDate(prediction.game_date)}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {prediction.current_value.toLocaleString()} / {prediction.target_value.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isMet
                  ? 'bg-green-500'
                  : progress >= 75
                  ? 'bg-blue-500'
                  : progress >= 50
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            {isMet ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                ✓ Prediction met!
              </span>
            ) : (
              `${progress.toFixed(1)}% complete`
            )}
          </p>
        </div>

        {/* Type Badge */}
        <div className="pt-2 flex gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 capitalize">
            {prediction.prediction_type}
          </span>
        </div>
      </div>
    </Card>
  );
}