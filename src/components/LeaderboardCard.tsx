import { LeaderboardEntry } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface LeaderboardCardProps {
    title: string;
    stat: 'PPG' | 'RPG' | 'APG' | 'SPG' | 'BPG' | 'TPG' | 'FG%' | '3P%' | 'FT%';
    timeframe: 'CURRENT_SEASON' | 'ALL_TIME';
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {/* <Badge variant="outline">{timeframe}</Badge> */}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {data.slice(0, maxEntries).map((player, index) => (
                        <div key={player.player_id} className="flex justify-between items-center">
                            <span className="text-sm">
                                {index + 1}. {player.player_id}
                            </span>
                            <span className="font-semibold">
                                {player.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
