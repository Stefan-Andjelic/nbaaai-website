"use client";

import { LeaderboardEntry } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { getPlayerImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Settings, ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface LeaderboardCardProps {
  title: string;
  stat: "PPG" | "RPG" | "APG" | "SPG" | "BPG" | "TPG" | "FG%" | "3P%" | "FT%";
  timeframe: "CURRENT_SEASON" | "ALL_TIME";
  data: LeaderboardEntry[];
  maxEntries?: number;
  // Props for custom leaderboards
  isCustom?: boolean;
  customConfig?: {
    topN: number;
    statFilters: Array<{
      stat: string;
      operator: string;
      value: number;
    }>;
  };
  leaderboardId?: string; // For generating URL to full list page
}

export function LeaderboardCard({
  title,
  stat,
  timeframe,
  data,
  maxEntries = 5,
  isCustom = false,
  customConfig,
  leaderboardId,
}: LeaderboardCardProps) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <>
      <Card className="w-full border-2 border-opacity-100 border-[#FF7D00]">
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <CardTitle>{title}</CardTitle>

            {/* Gear Icon - Only show for custom leaderboards */}
            {isCustom && customConfig && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8"
                onClick={() => setIsConfigModalOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {data.slice(0, maxEntries).map((player, index) => (
              <Link
                key={player.player_id}
                href={`/players/${player.player_id}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={getPlayerImageUrl(player.player_id)}
                      alt={`${player.player_id} headshot`}
                      fill
                      className="object-cover"
                      sizes="48px"
                      quality={90}
                    />
                  </div>

                  {/* RANK & NAME */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {index + 1}. {player.player_name}
                    </span>
                  </div>

                  {/* STAT VALUE */}
                  <span className="font-semibold">{player.value}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      {isCustom && customConfig && (
        <LeaderboardConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          title={title}
          config={customConfig}
        />
      )}
    </>
  );
}

interface LeaderboardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  config: {
    topN: number;
    statFilters: Array<{
      stat: string;
      operator: string;
      value: number;
    }>;
  };
}

function LeaderboardConfigModal({
  isOpen,
  onClose,
  title,
  config,
}: LeaderboardConfigModalProps) {
  // Map stat keys to readable names
  const statDisplayNames: Record<string, string> = {
    pts: "Points",
    trb: "Total Rebounds",
    ast: "Assists",
    stl: "Steals",
    blk: "Blocks",
    fg: "Field Goals Made",
    fga: "Field Goal Attempts",
    fg3: "3-Pointers Made",
    fg3a: "3-Point Attempts",
    ft: "Free Throws Made",
    fta: "Free Throw Attempts",
    tov: "Turnovers",
    pf: "Personal Fouls",
  };

  const operatorDisplayNames: Record<string, string> = {
    ">=": "At least",
    ">": "More than",
    "=": "Exactly",
    "<=": "At most",
    "<": "Less than",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Leaderboard Configuration</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Top N Display */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Top Players
            </h3>
            <p className="text-lg font-medium">Top {config.topN}</p>
          </div>

          {/* Stat Filters Display */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Filters
            </h3>
            <div className="space-y-2">
              {config.statFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="font-medium">
                    {statDisplayNames[filter.stat] || filter.stat}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {operatorDisplayNames[filter.operator] || filter.operator}{" "}
                    {filter.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
