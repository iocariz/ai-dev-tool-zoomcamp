import { useGameStore } from '@/stores/gameStore';
import { Trophy, Zap } from 'lucide-react';

const ScoreDisplay = () => {
  const { score, highScore, status } = useGameStore();

  return (
    <div className="flex gap-6">
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-1">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-arcade text-muted-foreground">SCORE</span>
        </div>
        <p className="text-3xl font-arcade text-primary text-glow-primary">{score}</p>
      </div>
      
      <div className="text-center">
        <div className="flex items-center gap-2 justify-center mb-1">
          <Trophy className="w-4 h-4 text-neon-yellow" />
          <span className="text-xs font-arcade text-muted-foreground">HIGH</span>
        </div>
        <p className="text-3xl font-arcade text-neon-yellow">{highScore}</p>
      </div>
    </div>
  );
};

export default ScoreDisplay;
