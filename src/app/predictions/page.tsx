'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CreatePredictionForm from '@/components/predictions/CreatePredictionForm';
import PredictionCard from '@/components/predictions/PredictionCard';
import { Prediction, PredictionType } from '@/types/predictions';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [typeFilter, setTypeFilter] = useState<PredictionType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy: 'created_at',
        sortOrder,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/predictions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch predictions');
      
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [sortOrder, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPredictions();
  };

  const handlePredictionCreated = () => {
    setShowForm(false);
    fetchPredictions();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            NBA Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Make predictions and track progress throughout the season
          </p>
        </div>

        {/* Create Prediction Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
            className="w-full sm:w-auto"
          >
            {showForm ? 'Cancel' : '+ Create New Prediction'}
          </Button>
        </div>

        {/* Prediction Form */}
        {showForm && (
          <div className="mb-8">
            <CreatePredictionForm onSuccess={handlePredictionCreated} />
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              type="text"
              placeholder="Search predictions, players, or usernames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  fetchPredictions();
                }}
              >
                Clear
              </Button>
            )}
          </form>

          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div className="flex gap-2">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All
              </Button>
              <Button
                variant={typeFilter === 'season' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('season')}
              >
                Season
              </Button>
              <Button
                variant={typeFilter === 'game' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('game')}
              >
                Game
              </Button>
            </div>

            {/* Sort Order */}
            <div className="flex gap-2 ml-auto">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center mr-2">
                Sort by:
              </span>
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('desc')}
              >
                Newest
              </Button>
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('asc')}
              >
                Oldest
              </Button>
            </div>
          </div>
        </div>

        {/* Predictions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery || typeFilter !== 'all'
                ? 'No predictions found matching your filters'
                : 'No predictions yet. Be the first to make a prediction!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {predictions.length} prediction{predictions.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predictions.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}