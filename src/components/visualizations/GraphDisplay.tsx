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
import {
  GraphDataPoint,
  PlayerInfo,
  StatMetric,
  AggregationType,
  STAT_LABELS,
} from "@/types/visualizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerImageUrl } from "@/lib/utils";
import React from "react";

interface GraphDisplayProps {
  data: GraphDataPoint[];
  players: PlayerInfo[];
  metric: StatMetric;
  aggregation: AggregationType;
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

// Custom dot component with player headshot for first and last points
const CustomDot: React.FC<any> = (props) => {
  const { cx, cy, payload, dataKey, index, data, playerColor, playerId } =
    props;

  // Step 1: Check if player has data at this point
  if (payload[dataKey] == null) {
    return <g />; // Don't render anything if no data for this player at this season
  }

  // Step 2: Find ALL data points where this specific player has values
  const playerDataPoints = data
    .map((point: any, idx: number) => ({ point, idx }))
    .filter(({ point }: any) => point[dataKey] != null);

  // Step 3: Determine if current point is FIRST or LAST for this player
  const isFirst = playerDataPoints.length > 0 && index === playerDataPoints[0].idx;
  const isLast = playerDataPoints.length > 0 && index === playerDataPoints[playerDataPoints.length - 1].idx;

  // Step 4a: Render headshot if first or last point
  if (isFirst || isLast) {
    return (
      <g>
        {/* Background circle with colored border */}
        <circle
          cx={cx}
          cy={cy}
          r={16}
          fill="white"
          stroke={playerColor}
          strokeWidth={3}
        />

        {/* SVG clip path for circular mask */}
        <defs>
          <clipPath id={`clip-${playerId}-${index}`}>
            <circle cx={cx} cy={cy} r={14} />
          </clipPath>
        </defs>

        {/* Player headshot image from Supabase storage */}
        <image
          x={cx - 14}
          y={cy - 14}
          width={28}
          height={28}
          href={getPlayerImageUrl(playerId)}
          clipPath={`url(#clip-${playerId}-${index})`}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    );
  }

  // Step 4b: Render regular dot for middle points
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={playerColor}
        stroke={playerColor}
        strokeWidth={1}
      />
    </g>
  );
};

export function GraphDisplay({
  data,
  players,
  metric,
  aggregation,
  title,
}: GraphDisplayProps) {
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
                label={{
                  value: "Season",
                  position: "insideBottom",
                  offset: -5,
                }}
                className="text-sm"
              />
              <YAxis
                label={{
                  value: STAT_LABELS[aggregation][metric],
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
              {players.map((player, index) => {
                const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
                return (
                  <Line
                    key={player.player_id}
                    type="monotone"
                    dataKey={player.player_id}
                    name={player.player_id}
                    stroke={color}
                    strokeWidth={2}
                    dot={(props) => (
                      <CustomDot {...props} data={data} playerColor={color} playerId={player.player_id} />
                    )}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Player Legend with Colors */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {players.map((player, index) => (
            <div key={player.player_id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: PLAYER_COLORS[index % PLAYER_COLORS.length],
                }}
              />
              <span className="text-sm font-medium">{player.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
