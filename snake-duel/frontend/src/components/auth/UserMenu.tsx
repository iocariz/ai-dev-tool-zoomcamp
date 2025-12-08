import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface UserMenuProps {
  onLoginClick: () => void;
}

const UserMenu = ({ onLoginClick }: UserMenuProps) => {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
    );
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={onLoginClick} variant="outline" size="sm" className="gap-2">
        <User className="w-4 h-4" />
        Login
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border/50">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-3 h-3 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">{user?.username}</span>
      </div>
      <Button onClick={logout} variant="ghost" size="icon" title="Logout">
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserMenu;
