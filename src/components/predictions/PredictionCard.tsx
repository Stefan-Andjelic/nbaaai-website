'use client';

import { Card } from '@/components/ui/card';
import { Prediction } from '@/types/predictions';

interface PredictionCardProps {
  prediction: Prediction;
}

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine if the prediction period is complete
  // For now, we'll assume it's not complete since we don't have end dates
  // You can add logic here later to check if season/game is finished
  const isComplete = false;

  // Calculate progress percentage
  const calculateProgressPercentage = () => {
    if (prediction.target_value === 0) return 0;
    return (prediction.current_value / prediction.target_value) * 100;
  };

  const progressPercentage = calculateProgressPercentage();

  // Determine if prediction is successful
  const isPredictionSuccessful = () => {
    const { current_value, target_value, comparison_operator } = prediction;
    
    switch (comparison_operator) {
      case 'more_than':
        return current_value > target_value;
      case 'less_than':
        return current_value < target_value;
      case 'exactly':
        return current_value === target_value;
      default:
        return false;
    }
  };

  const isSuccessful = isPredictionSuccessful();
  const hasExceededTarget = prediction.current_value > prediction.target_value;

  // Determine bar color
  const getBarColor = () => {
    if (isComplete) {
      // If complete, green for success, red for failure
      return isSuccessful ? 'bg-green-500' : 'bg-red-500';
    }
    
    // During progress
    if (prediction.comparison_operator === 'less_than') {
      // For "less than", we want blue until exceeded, then red
      return hasExceededTarget ? 'bg-red-500' : 'bg-blue-500';
    } else {
      // For "more than" and "exactly", red if exceeded, blue otherwise
      return hasExceededTarget ? 'bg-red-500' : 'bg-blue-500';
    }
  };

  // Get status text
  const getStatusText = () => {
    if (isComplete) {
      return isSuccessful ? '✓ Prediction successful!' : '✗ Prediction failed';
    }

    if (prediction.comparison_operator === 'less_than') {
      if (hasExceededTarget) {
        return 'Target exceeded - prediction at risk';
      }
      return `${prediction.current_value.toLocaleString()} (target: < ${prediction.target_value.toLocaleString()})`;
    }

    if (prediction.comparison_operator === 'more_than') {
      if (hasExceededTarget) {
        return '✓ Target reached!';
      }
      return `${progressPercentage.toFixed(1)}% of target`;
    }

    if (prediction.comparison_operator === 'exactly') {
      if (prediction.current_value === prediction.target_value) {
        return '✓ Exact target reached!';
      }
      if (hasExceededTarget) {
        return 'Target exceeded';
      }
      return `${progressPercentage.toFixed(1)}% of target`;
    }

    return '';
  };

  const barColor = getBarColor();
  const statusText = getStatusText();

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
              Current Progress
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {prediction.current_value.toLocaleString()}
            </span>
          </div>
          
          {/* Progress bar container with vertical marker at target */}
          <div className="relative w-full h-2.5">
            {/* Background */}
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
            
            {/* Target marker - vertical line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-500 z-10"
              style={{ 
                left: `${Math.min(progressPercentage, 100)}%`,
                transform: 'translateX(-50%)'
              }}
            />
            
            {/* Progress fill */}
            <div
              className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          
          <p className={`text-xs mt-1.5 font-medium ${
            isComplete 
              ? isSuccessful 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
              : hasExceededTarget && prediction.comparison_operator === 'less_than'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
          }`}>
            {statusText}
          </p>
        </div>

        {/* Type Badge */}
        <div className="pt-2 flex gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 capitalize">
            {prediction.prediction_type}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 capitalize">
            {prediction.comparison_operator.replace('_', ' ')}
          </span>
        </div>
      </div>
    </Card>
  );
}