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
import { StatMetric, ContextType, STAT_LABELS } from "@/types/visualizations";

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
  }) => void;
  isLoading?: boolean;
}

const currentYear = new Date().getFullYear();
const DEFAULT_SEASON_START = 2015;
const DEFAULT_SEASON_END = 2025;

export function GraphConfigForm({ onGenerate, isLoading = false }: GraphConfigFormProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [metric, setMetric] = useState<StatMetric>("pts");
  const [seasonStart, setSeasonStart] = useState<number>(DEFAULT_SEASON_START);
  const [seasonEnd, setSeasonEnd] = useState<number>(DEFAULT_SEASON_END);
  const [context, setContext] = useState<ContextType>("regular");

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
    });
  };

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

      {/* Stat Metric */}
      <div className="space-y-2">
        <Label htmlFor="metric">Statistic</Label>
        <Select value={metric} onValueChange={(value) => setMetric(value as StatMetric)}>
          <SelectTrigger id="metric">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STAT_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
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
            min={1980}
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
            min={1980}
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