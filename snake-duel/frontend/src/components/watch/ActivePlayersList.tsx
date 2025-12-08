import { useState, useEffect } from 'react';
import { ActivePlayer } from '@/types/game';
import { watchApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Users, Loader2 } from 'lucide-react';

interface ActivePlayersListProps {
  onWatchPlayer: (player: ActivePlayer) => void;
}

const ActivePlayersList = ({ onWatchPlayer }: ActivePlayersListProps) => {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await watchApi.getActivePlayers();
      if (response.success && response.data) {
        setPlayers(response.data);
      }
      setIsLoading(false);
    };

    fetchPlayers();
    
    // Refresh player list periodically
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          <CardTitle className="text-sm">Live Players</CardTitle>
          <span className="ml-auto px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
            {players.length} online
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : players.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No players currently online
          </p>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{player.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Score: <span className="text-primary">{player.score}</span> • {player.mode}
                  </p>
                </div>
                <Button
                  onClick={() => onWatchPlayer(player)}
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-accent hover:text-accent hover:bg-accent/10"
                >
                  <Eye className="w-4 h-4" />
                  Watch
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivePlayersList;
