import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import UserAvatar from './UserAvatar';
import { Wand2, Users, Settings, Sparkles } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-oak-dark to-ebony">
      {/* Mystical header */}
      <header className="sticky top-0 z-50 border-b border-starlight-gold/20 bg-oak-dark/95 backdrop-blur supports-[backdrop-filter]:bg-oak-dark/80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/assets/generated/wand-logo.dim_256x256.png" 
                alt="Wand Collector Logo" 
                className="h-12 w-12 transition-transform group-hover:scale-110 group-hover:rotate-12"
              />
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold bg-gradient-to-r from-starlight-gold via-starlight-silver to-starlight-gold bg-clip-text text-transparent">
                  Wand Collector
                </span>
                <span className="text-xs text-starlight-silver/70">Magical Wand Registry</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <Link 
                    to="/my-wands" 
                    className="flex items-center gap-2 text-sm font-medium text-starlight-silver hover:text-starlight-gold transition-colors"
                  >
                    <Wand2 className="h-4 w-4" />
                    My Wands
                  </Link>
                  <Link 
                    to="/friends"
                    className="flex items-center gap-2 text-sm font-medium text-starlight-silver hover:text-starlight-gold transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    Friends
                  </Link>
                  <Link 
                    to="/account-settings"
                    className="flex items-center gap-2 text-sm font-medium text-starlight-silver hover:text-starlight-gold transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated && userProfile && (
                <div className="flex items-center gap-2">
                  <UserAvatar profilePicture={userProfile.profilePicture} size="small" />
                  <span className="text-sm font-medium text-starlight-silver hidden lg:inline">{userProfile.name}</span>
                </div>
              )}
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                className="relative overflow-hidden group border-starlight-gold/30 hover:border-starlight-gold"
              >
                <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
                {isLoggingIn ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-starlight-gold/20 bg-oak-dark/80 backdrop-blur mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-starlight-silver/70">
              © {new Date().getFullYear()} Wand Collector. All rights reserved.
            </p>
            <p className="text-sm text-starlight-silver/70">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'wand-collector')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-starlight-gold hover:text-starlight-gold/80 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
