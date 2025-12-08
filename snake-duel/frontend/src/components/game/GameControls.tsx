import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const GameControls = () => {
  const { status, startGame, pauseGame, resumeGame, resetGame } = useGameStore();

  return (
    <div className="flex gap-3">
      {status === 'idle' && (
        <Button onClick={startGame} variant="neon" size="lg" className="gap-2">
          <Play className="w-5 h-5" />
          Start Game
        </Button>
      )}
      
      {status === 'playing' && (
        <Button onClick={pauseGame} variant="neon-accent" size="lg" className="gap-2">
          <Pause className="w-5 h-5" />
          Pause
        </Button>
      )}
      
      {status === 'paused' && (
        <>
          <Button onClick={resumeGame} variant="neon" size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            Resume
          </Button>
          <Button onClick={resetGame} variant="outline" size="lg" className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </>
      )}
      
      {status === 'game-over' && (
        <Button onClick={startGame} variant="neon" size="lg" className="gap-2">
          <RotateCcw className="w-5 h-5" />
          Play Again
        </Button>
      )}
    </div>
  );
};

export default GameControls;
