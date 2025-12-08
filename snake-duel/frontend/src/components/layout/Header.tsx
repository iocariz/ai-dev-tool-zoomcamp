import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import UserMenu from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLoginClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ onLoginClick, activeTab, onTabChange }: HeaderProps) => {
  const tabs = [
    { id: 'play', label: 'Play' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'watch', label: 'Watch' },
  ];

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-lg font-arcade text-primary text-glow-primary hidden sm:block">
              SNAKE
            </h1>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {tab.label}
              </Button>
            ))}
          </nav>

          <UserMenu onLoginClick={onLoginClick} />
        </div>
      </div>
    </header>
  );
};

export default Header;
