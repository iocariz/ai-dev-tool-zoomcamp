import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';

const ModeSelector = () => {
  const { mode, setMode, status } = useGameStore();
  const isDisabled = status === 'playing';

  const modes: { value: GameMode; label: string; description: string }[] = [
    { value: 'walls', label: 'Walls', description: 'Hit the wall = Game Over' },
    { value: 'pass-through', label: 'Pass-Through', description: 'Wrap around edges' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-arcade text-accent text-glow-accent">Game Mode</h3>
      <div className="flex gap-2">
        {modes.map((m) => (
          <Button
            key={m.value}
            onClick={() => setMode(m.value)}
            variant={mode === m.value ? 'default' : 'outline'}
            size="sm"
            disabled={isDisabled}
            className="flex-1"
            title={m.description}
          >
            {m.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {modes.find((m) => m.value === mode)?.description}
      </p>
    </div>
  );
};

export default ModeSelector;
