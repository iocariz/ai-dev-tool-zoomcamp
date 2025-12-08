import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skull, Trophy } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { leaderboardApi } from '@/api';

const GameOverlay = () => {
  const { status, score, startGame } = useGameStore();
  const { mode } = useGameStore();
  const { user, isAuthenticated } = useAuthStore();

  const handleSubmitScore = async () => {
    if (isAuthenticated && user) {
      await leaderboardApi.submitScore(user.username, score, mode);
    }
    startGame();
  };

  if (status !== 'game-over') return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
      <Card className="w-80 text-center border-destructive/50">
        <CardContent className="pt-8 pb-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
              <Skull className="w-10 h-10 text-destructive" />
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-arcade text-destructive mb-2">GAME OVER</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-2xl font-arcade text-primary">{score}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {isAuthenticated ? (
              <Button onClick={handleSubmitScore} variant="neon" size="lg" className="w-full">
                Submit & Play Again
              </Button>
            ) : (
              <>
                <Button onClick={startGame} variant="neon" size="lg" className="w-full">
                  Play Again
                </Button>
                <p className="text-xs text-muted-foreground">
                  Login to submit your score to the leaderboard!
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverlay;
