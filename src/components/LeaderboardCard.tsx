import { LeaderboardEntry } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getPlayerImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface LeaderboardCardProps {
  title: string;
  stat: "PPG" | "RPG" | "APG" | "SPG" | "BPG" | "TPG" | "FG%" | "3P%" | "FT%";
  timeframe: "CURRENT_SEASON" | "ALL_TIME";
  data: LeaderboardEntry[];
  maxEntries?: number;
}

export function LeaderboardCard({
  title,
  stat,
  timeframe,
  data,
  maxEntries = 5,
}: LeaderboardCardProps) {
  return (
    // make the border faded purple
    <Card className="w-full border-2 border-opacity-100 border-[#FF7D00]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
  );
}
