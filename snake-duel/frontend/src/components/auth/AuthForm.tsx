import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  onClose?: () => void;
}

const AuthForm = ({ onClose }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const { login, signup, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await signup(username, email, password);
    }

    if (success && onClose) {
      onClose();
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-base">{isLogin ? 'Welcome Back' : 'Join the Game'}</CardTitle>
        <CardDescription>
          {isLogin 
            ? 'Login to track your scores and compete!' 
            : 'Create an account to join the leaderboard'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="SnakeMaster99"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="player@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <Button type="submit" variant="neon" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </form>
        
        {isLogin && (
          <div className="mt-4 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Demo credentials:</p>
            <p>Email: snakemaster@example.com</p>
            <p>Password: password123</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
