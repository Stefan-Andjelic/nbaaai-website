"use client";

import { useState, useEffect } from 'react';
import { LeaderboardCard } from '@/components/LeaderboardCard';
import { CreateLeaderboardButton } from "@/components/ethical-leaderboards/CreateLeaderboardButton";
import { LeaderboardEntry } from '@/types/supabase';

interface CustomLeaderboard {
  id: string;
  title: string;
  results: LeaderboardEntry[];
  topN: number;
  filters: Array<{
    stat: string;
    operator: string;
    value: number;
  }>;
}

const STORAGE_KEY = 'custom_leaderboards';

export default function EthicalLeaderboardsPage() {
  const [customLeaderboards, setCustomLeaderboards] = useState<CustomLeaderboard[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCustomLeaderboards(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading leaderboards:', error);
      }
    }
  }, []);

  // Save to localStorage whenever leaderboards change
  useEffect(() => {
    if (customLeaderboards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customLeaderboards));
    }
  }, [customLeaderboards]);

  // Callback function when new leaderboard is created
  const handleLeaderboardCreated = (apiResponse: any) => {
    const config = {
      title: apiResponse.title,
      topN: 5,
      statFilters: apiResponse.filters,
    };
    
    const encodedConfig = btoa(JSON.stringify(config));
    
    const newLeaderboard: CustomLeaderboard = {
      id: encodedConfig,
      title: apiResponse.title,
      results: apiResponse.results,
      topN: 5,
      filters: apiResponse.filters,
    };
    
    setCustomLeaderboards(prev => [...prev, newLeaderboard]);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ethical Leaderboards</h1>
        <CreateLeaderboardButton onSuccess={handleLeaderboardCreated} />
      </div>

      {/* Your existing pre-defined cards section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Featured Leaderboards</h2>
        {/* Your pre-defined cards go here */}
      </section>

      {/* Custom Leaderboards Section - Only show if user has created any */}
      {customLeaderboards.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Custom Leaderboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customLeaderboards.map((leaderboard) => (
              <LeaderboardCard
                key={leaderboard.id}
                title={leaderboard.title}
                stat="PPG" // Not used for display, but required by component
                timeframe="CURRENT_SEASON"
                data={leaderboard.results}
                maxEntries={5}
                isCustom={true}
                customConfig={{
                  topN: leaderboard.topN,
                  statFilters: leaderboard.filters
                }}
                leaderboardId={leaderboard.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}