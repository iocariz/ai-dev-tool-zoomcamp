import { useState, useEffect } from 'react';
import { ActivePlayer } from '@/types/game';
import { watchApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameBoard from '@/components/game/GameBoard';
import { ArrowLeft, Eye, Zap } from 'lucide-react';

interface WatchPlayerProps {
  player: ActivePlayer;
  onBack: () => void;
}

const WatchPlayer = ({ player: initialPlayer, onBack }: WatchPlayerProps) => {
  const [player, setPlayer] = useState<ActivePlayer>(initialPlayer);

  useEffect(() => {
    const unsubscribe = watchApi.subscribeToPlayer(initialPlayer.id, (updatedPlayer) => {
      setPlayer(updatedPlayer);
    });

    return () => unsubscribe();
  }, [initialPlayer.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-accent animate-pulse" />
          <span className="text-sm text-muted-foreground">Watching</span>
          <span className="font-semibold text-foreground">{player.username}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{player.username}'s Game</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-arcade text-primary text-lg">{player.score}</span>
              </div>
              <span className="px-2 py-1 bg-muted text-xs rounded capitalize">{player.mode}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex justify-center">
          <div className="relative">
            <GameBoard
              readonly
              snake={player.snake}
              food={player.food}
              gridSize={20}
            />
            <div className="absolute top-2 right-2 px-2 py-1 bg-accent/80 text-accent-foreground text-xs rounded flex items-center gap-1">
              <Eye className="w-3 h-3" />
              LIVE
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WatchPlayer;
