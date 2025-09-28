import { LeaderboardCard } from '@/components/LeaderboardCard';
import { getLeaderboards } from '@/lib/leaderboardData';

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

        {/* Leaderboards Grid (Current Season) */}
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-8">Current Season Leaders (2024-25)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <LeaderboardCard 
              title="Scoring Leaders" 
              stat="PPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.currentSeason.ppg} 
            />
            <LeaderboardCard 
              title="Assist Leaders" 
              stat="APG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.currentSeason.apg} 
              />
            <LeaderboardCard 
              title="Rebound Leaders" 
              stat="RPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.currentSeason.rpg} 
              />
            <LeaderboardCard 
              title="Steal Leaders" 
              stat="SPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.currentSeason.spg} 
              />
            <LeaderboardCard 
              title="Block Leaders" 
              stat="BPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.currentSeason.bpg} 
              />
          </div>
        </div>

        {/* Leaderboards Grid (All-Time) */}
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-8">All-Time Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <LeaderboardCard 
              title="Scoring Leaders" 
              stat="PPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.allTime.ppg} 
            />
            <LeaderboardCard 
              title="Assist Leaders" 
              stat="APG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.allTime.apg} 
              />
            <LeaderboardCard 
              title="Rebound Leaders" 
              stat="RPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.allTime.rpg} 
              />
            <LeaderboardCard 
              title="Steal Leaders" 
              stat="SPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.allTime.spg} 
              />
            <LeaderboardCard 
              title="Block Leaders" 
              stat="BPG" 
              timeframe="ALL_TIME" 
              data={leaderboardData.allTime.bpg} 
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