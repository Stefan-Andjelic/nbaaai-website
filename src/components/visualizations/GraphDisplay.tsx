"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GraphDataPoint, PlayerInfo, STAT_LABELS, StatMetric } from "@/types/visualizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphDisplayProps {
  data: GraphDataPoint[];
  players: PlayerInfo[];
  metric: StatMetric;
  title?: string;
}

// Color palette for different players
const PLAYER_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
];

export function GraphDisplay({ data, players, metric, title }: GraphDisplayProps) {
  console.log("GraphDisplay data:", data);
  console.log("GraphDisplay players:", players);
  console.log("GraphDisplay metric:", metric);
  console.log("GraphDisplay title:", title);
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No data available for the selected parameters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="season_year"
                label={{ value: "Season", position: "insideBottom", offset: -5 }}
                className="text-sm"
              />
              <YAxis
                label={{
                  value: STAT_LABELS[metric],
                  angle: -90,
                  position: "insideLeft",
                }}
                className="text-sm"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                formatter={(value: number) => value.toFixed(2)}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => {
                  const player = players.find((p) => p.player_id === value);
                  return player ? player.name : value;
                }}
              />
              {players.map((player, index) => (
                <Line
                  key={player.player_id}
                  type="monotone"
                  dataKey={player.player_id}
                  name={player.player_id}
                  stroke={PLAYER_COLORS[index % PLAYER_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Player Legend with Colors */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {players.map((player, index) => (
            <div key={player.player_id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length] }}
              />
              <span className="text-sm font-medium">{player.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}