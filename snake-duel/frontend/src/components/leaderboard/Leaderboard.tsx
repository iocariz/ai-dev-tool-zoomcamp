import { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { leaderboardApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const response = await leaderboardApi.getLeaderboard(filter === 'all' ? undefined : filter);
      if (response.success && response.data) {
        setEntries(response.data.slice(0, 10));
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-neon-yellow" />;
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return <span className="w-5 text-center text-muted-foreground font-mono">{rank}</span>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-neon-yellow" />
            <CardTitle className="text-sm">Leaderboard</CardTitle>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          {(['all', 'walls', 'pass-through'] as const).map((mode) => (
            <Button
              key={mode}
              onClick={() => setFilter(mode)}
              variant={filter === mode ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
            >
              {mode === 'all' ? 'All' : mode === 'walls' ? 'Walls' : 'Pass-Through'}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  index === 0 
                    ? 'bg-neon-yellow/10 border border-neon-yellow/30' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="w-6 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{entry.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{entry.mode}</p>
                </div>
                <p className={`font-arcade text-lg ${index === 0 ? 'text-neon-yellow' : 'text-primary'}`}>
                  {entry.score}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
