import { LeaderboardEntry } from "@/types/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getPlayerImageUrl } from "@/lib/utils";
import Image from 'next/image';

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
                            
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                <Image
                                src={getPlayerImageUrl(player.player_id)}
                                alt={`${player.player_id} headshot`}
                                fill
                                className="object-cover"
                                sizes="40px"
                                />
                            </div>

                            {/* RANK & NAME */}
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium">
                                {index + 1}. {player.player_id}
                                </span>
                            </div>

                            {/* STAT VALUE */}
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
