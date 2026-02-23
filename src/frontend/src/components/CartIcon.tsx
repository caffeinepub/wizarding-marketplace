import { Link } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import { useViewCart } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';

export default function CartIcon() {
  const { data: cart } = useViewCart();
  const itemCount = cart?.items.length || 0;

  return (
    <Link to="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
