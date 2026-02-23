import { Button } from '@/components/ui/button';
import { useAddToCart } from '../hooks/useQueries';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import type { ItemId } from '../backend';

interface AddToCartButtonProps {
  itemId: ItemId;
  quantity?: bigint;
}

export default function AddToCartButton({ itemId, quantity = BigInt(1) }: AddToCartButtonProps) {
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({ itemId, quantity });
      toast.success('Added to cart!');
    } catch (error: any) {
      if (error.message?.includes('Cannot add your own item')) {
        toast.error('You cannot add your own items to cart');
      } else {
        toast.error('Failed to add to cart');
      }
      console.error(error);
    }
  };

  return (
    <Button onClick={handleAddToCart} disabled={addToCart.isPending} className="w-full">
      <ShoppingCart className="h-4 w-4 mr-2" />
      {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
