import { LeaderboardCard } from '@/components/LeaderboardCard';
import { getLeaderboards } from '@/lib/leaderboardData';
import Link from 'next/link';

export default async function Home() {
  const leaderboardData = await getLeaderboards();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <div className="flex flex-col items-center px-4 py-12">
        <h1 
          className="text-5xl font-bold text-center mb-12" 
          style={{ color: '#590766' }}
        >
          Where the Iso meets I/O
        </h1>
        <p>
          <Link href="/players">
            <span className="text-lg font-semibold text-blue-600 hover:underline">
              Explore NBA Players
            </span>
          </Link>
        </p>

        {/* Leaderboards Grid */}
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-8">Current Season Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <LeaderboardCard 
              title="Scoring Leaders" 
              stat="PPG" 
              timeframe="CURRENT_SEASON" 
              data={leaderboardData.currentSeason.ppg} 
            />
            <LeaderboardCard 
              title="Assist Leaders" 
              stat="APG" 
              timeframe="CURRENT_SEASON" 
              data={leaderboardData.currentSeason.apg} 
              />
            <LeaderboardCard 
              title="Rebound Leaders" 
              stat="RPG" 
              timeframe="CURRENT_SEASON" 
              data={leaderboardData.currentSeason.rpg} 
              />
            <LeaderboardCard 
              title="Steal Leaders" 
              stat="SPG" 
              timeframe="CURRENT_SEASON" 
              data={leaderboardData.currentSeason.spg} 
              />
            <LeaderboardCard 
              title="Block Leaders" 
              stat="BPG" 
              timeframe="CURRENT_SEASON" 
              data={leaderboardData.currentSeason.bpg} 
              />
          </div>
        </div>
      </div>
      
      <footer className="text-center text-gray-500 text-sm py-2">
        <p>© SAHR Productions Inc. All Rights Reserved</p>
      </footer>
    </div>
  );
}