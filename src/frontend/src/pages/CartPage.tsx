import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useViewCart, useRemoveFromCart, useUpdateCartItem } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useViewCart();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your cart.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = cart?.items || [];
  const total = items.reduce((sum, cartItem) => {
    const price = Number(cartItem.item.price) / 100;
    const quantity = Number(cartItem.quantity);
    return sum + price * quantity;
  }, 0);

  const handleRemove = async (itemId: bigint) => {
    try {
      await removeFromCart.mutateAsync(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error(error);
    }
  };

  const handleUpdateQuantity = async (itemId: bigint, newQuantity: string) => {
    const qty = parseInt(newQuantity);
    if (qty < 1) return;

    try {
      await updateCartItem.mutateAsync({ itemId, quantity: BigInt(qty) });
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error(error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Start adding some magical items!</p>
        <Button onClick={() => navigate({ to: '/browse' })}>
          Browse Items
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((cartItem) => {
            const imageUrl = cartItem.item.image?.getDirectURL();
            const price = Number(cartItem.item.price) / 100;
            const quantity = Number(cartItem.quantity);

            return (
              <Card key={cartItem.item.id.toString()}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={cartItem.item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{cartItem.item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        ${price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Qty:</label>
                          <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleUpdateQuantity(cartItem.item.id, e.target.value)}
                            className="w-20"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(cartItem.item.id)}
                          disabled={removeFromCart.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${(price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate({ to: '/checkout' })}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
