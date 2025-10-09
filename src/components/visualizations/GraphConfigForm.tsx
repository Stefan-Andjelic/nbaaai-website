"use client";

import { useState } from "react";
import { PlayerMultiSelect } from "./PlayerMultiSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatMetric, ContextType, AggregationType, STAT_LABELS, COUNTING_STATS, PERCENTAGE_STATS } from "@/types/visualizations";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface Player {
  player_id: string;
  name: string;
}

interface GraphConfigFormProps {
  onGenerate: (config: {
    playerIds: string[];
    metric: StatMetric;
    seasonStart: number;
    seasonEnd: number;
    context: ContextType;
    aggregation?: AggregationType;
  }) => void;
  isLoading?: boolean;
}

const currentYear = new Date().getFullYear();
const DEFAULT_SEASON_START = 2015;
const DEFAULT_SEASON_END = 2025;

export function GraphConfigForm({ onGenerate, isLoading = false }: GraphConfigFormProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [aggregation, setAggregation] = useState<AggregationType>("per_game");
  const [metric, setMetric] = useState<StatMetric>("pts");
  const [seasonStart, setSeasonStart] = useState<number>(DEFAULT_SEASON_START);
  const [seasonEnd, setSeasonEnd] = useState<number>(DEFAULT_SEASON_END);
  const [context, setContext] = useState<ContextType>("regular");

  // Get available stats (all stats available in both modes)
  const getAvailableStats = (): StatMetric[] => {
    return [...COUNTING_STATS, ...PERCENTAGE_STATS];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlayers.length === 0) {
      alert("Please select at least one player");
      return;
    }

    if (seasonStart > seasonEnd) {
      alert("Start season must be before or equal to end season");
      return;
    }

    onGenerate({
      playerIds: selectedPlayers.map((p) => p.player_id),
      metric,
      seasonStart,
      seasonEnd,
      context,
      aggregation
    });
  };

  const availableStats = getAvailableStats();
  const countingStats = availableStats.filter(stat => COUNTING_STATS.includes(stat));
  const percentageStats = availableStats.filter(stat => PERCENTAGE_STATS.includes(stat));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Player Selection */}
      <div className="space-y-2">
        <Label htmlFor="players">Select Players (up to 8)</Label>
        <PlayerMultiSelect
          selectedPlayers={selectedPlayers}
          onPlayersChange={setSelectedPlayers}
          maxPlayers={8}
        />
      </div>

      {/* Aggregation Type */}
      <div className="space-y-3">
        <Label>Aggregation Mode</Label>
        <RadioGroup value={aggregation} onValueChange={(value) => setAggregation(value as AggregationType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="per_game" id="per_game" />
            <Label htmlFor="per_game" className="font-normal cursor-pointer">
              Per Game
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="totals" id="totals" />
            <Label htmlFor="totals" className="font-normal cursor-pointer">
              Season Totals
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Stat Metric */}
      <div className="space-y-2">
        <Label htmlFor="metric">Statistic</Label>
        <Select value={metric} onValueChange={(value) => setMetric(value as StatMetric)}>
          <SelectTrigger id="metric">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Counting Stats Group */}
            {countingStats.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  COUNTING STATS
                </div>
                {countingStats.map((stat) => (
                  <SelectItem key={stat} value={stat}>
                    {STAT_LABELS[aggregation][stat]}
                  </SelectItem>
                ))}
              </>
            )}
            
            {/* Percentage Stats Group */}
            {percentageStats.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  PERCENTAGES
                </div>
                {percentageStats.map((stat) => (
                  <SelectItem key={stat} value={stat}>
                    {STAT_LABELS[aggregation][stat]}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Season Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seasonStart">Start Season</Label>
          <Input
            id="seasonStart"
            type="number"
            min={1979}
            max={currentYear}
            value={seasonStart}
            onChange={(e) => setSeasonStart(parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seasonEnd">End Season</Label>
          <Input
            id="seasonEnd"
            type="number"
            min={1979}
            max={currentYear}
            value={seasonEnd}
            onChange={(e) => setSeasonEnd(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Context */}
      <div className="space-y-2">
        <Label htmlFor="context">Game Context</Label>
        <Select value={context} onValueChange={(value) => setContext(value as ContextType)}>
          <SelectTrigger id="context">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular Season Only</SelectItem>
            <SelectItem value="playoffs">Playoffs Only</SelectItem>
            <SelectItem value="all">All Games</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button type="submit" className="w-full" disabled={isLoading || selectedPlayers.length === 0}>
        {isLoading ? "Generating..." : "Generate Graph"}
      </Button>
    </form>
  );
}