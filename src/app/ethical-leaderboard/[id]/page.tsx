"use client";

import { useEffect, useState } from "react";
import { LeaderboardConfigModal } from "@/components/LeaderboardCardModal";
import { useParams, useRouter } from "next/navigation";
import { LeaderboardEntry } from "@/types/supabase";
import { getPlayerImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";

interface FullLeaderboard {
  title: string;
  results: LeaderboardEntry[];
  config?: {
    topN: number;
    statFilters: Array<{
      stat: string;
      operator: string;
      value: number;
    }>;
  };
}

export default function FullLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const leaderboardId = params.id as string;

  const [leaderboard, setLeaderboard] = useState<FullLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch full leaderboard data
    fetchFullLeaderboard(leaderboardId);
  }, [leaderboardId]);

  const fetchFullLeaderboard = async (id: string) => {
    setIsLoading(true);
    try {
      // Call your API without the limit parameter
      const response = await fetch(`/api/leaderboards/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching full leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <div className="container mx-auto p-6">
        <p>Leaderboard not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{leaderboard.title}</h1>
      </div>

      {/* Showing top 50 text */}
      <p className="text-sm text-muted-foreground mb-6">
        Showing top {leaderboard.results.length} players
      </p>

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border">
        <div className="divide-y">
          {leaderboard.results.map((player, index) => (
            <Link
              key={player.player_id}
              href={`/players/${player.player_id}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {/* Rank */}
                <div className="w-12 text-center font-bold text-lg text-muted-foreground">
                  {index + 1}
                </div>

                {/* Player Image */}
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getPlayerImageUrl(player.player_id)}
                    alt={`${player.player_id} headshot`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    quality={90}
                  />
                </div>

                {/* Player Name */}
                <div className="flex-1">
                  <p className="font-semibold text-lg">{player.player_name}</p>
                </div>

                {/* Stat Value */}
                <div className="text-right">
                  <p className="text-2xl font-bold">{player.value}</p>
                  <p className="text-sm text-muted-foreground">games</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}