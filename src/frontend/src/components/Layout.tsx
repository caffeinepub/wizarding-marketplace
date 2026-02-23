import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import CartIcon from './CartIcon';
import { Wand2, ShoppingBag, MessageSquare, PlusCircle, Package, User } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-accent/5">
      {/* Magical header */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/assets/generated/shop-icon.dim_128x128.png" 
                alt="Wizarding Marketplace" 
                className="h-10 w-10 transition-transform group-hover:scale-110"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                  Wizarding Marketplace
                </span>
                <span className="text-xs text-muted-foreground">Magical Items & Collectibles</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/browse" 
                className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Browse
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/profile/$userId"
                  params={{ userId: identity.getPrincipal().toString() }}
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Link>
              )}
              {isAuthenticated && userProfile?.isSeller && (
                <>
                  <Link 
                    to="/create-listing" 
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Sell Item
                  </Link>
                  <Link 
                    to="/my-listings" 
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    My Listings
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link 
                  to="/inbox" 
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated && <CartIcon />}
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                className="relative overflow-hidden group"
              >
                <Wand2 className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
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
      <footer className="border-t border-primary/20 bg-card/50 backdrop-blur mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wand2 className="h-4 w-4 text-chart-1" />
              <span>© {new Date().getFullYear()} Wizarding Marketplace</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
