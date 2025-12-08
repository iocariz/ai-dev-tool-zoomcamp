import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ActivePlayer } from '@/types/game';
import Header from '@/components/layout/Header';
import AuthForm from '@/components/auth/AuthForm';
import GameBoard from '@/components/game/GameBoard';
import GameControls from '@/components/game/GameControls';
import ModeSelector from '@/components/game/ModeSelector';
import ScoreDisplay from '@/components/game/ScoreDisplay';
import GameOverlay from '@/components/game/GameOverlay';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import ActivePlayersList from '@/components/watch/ActivePlayersList';
import WatchPlayer from '@/components/watch/WatchPlayer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [activeTab, setActiveTab] = useState('play');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [watchingPlayer, setWatchingPlayer] = useState<ActivePlayer | null>(null);
  
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleWatchPlayer = (player: ActivePlayer) => {
    setWatchingPlayer(player);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onLoginClick={() => setShowAuthModal(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'play' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="space-y-6">
              <ScoreDisplay />
              
              <div className="relative">
                <GameBoard />
                <GameOverlay />
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <GameControls />
                <ModeSelector />
              </div>
              
              <Card className="max-w-[400px]">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">↑</kbd>{' '}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">↓</kbd>{' '}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">←</kbd>{' '}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">→</kbd>{' '}
                    or <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground">WASD</kbd> to move
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full lg:w-80">
              <Leaderboard />
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <Leaderboard />
          </div>
        )}

        {activeTab === 'watch' && (
          <div className="max-w-2xl mx-auto">
            {watchingPlayer ? (
              <WatchPlayer
                player={watchingPlayer}
                onBack={() => setWatchingPlayer(null)}
              />
            ) : (
              <ActivePlayersList onWatchPlayer={handleWatchPlayer} />
            )}
          </div>
        )}
      </main>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md border-border/50 bg-card">
          <AuthForm onClose={() => setShowAuthModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
