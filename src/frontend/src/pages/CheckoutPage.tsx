import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useViewCart, useClearCart } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useViewCart();
  const clearCart = useClearCart();

  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostal, setShippingPostal] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to checkout.
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

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your cart is empty. Add some items before checking out.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/browse' })} className="mt-4">
          Browse Items
        </Button>
      </div>
    );
  }

  const total = items.reduce((sum, cartItem) => {
    const price = Number(cartItem.item.price) / 100;
    const quantity = Number(cartItem.quantity);
    return sum + price * quantity;
  }, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostal || !contactEmail) {
      toast.error('Please fill in all shipping information');
      return;
    }

    try {
      // In a real app, this would process payment and create an order
      await clearCart.mutateAsync();
      toast.success('Order placed successfully! Sellers will contact you soon.');
      navigate({ to: '/browse' });
    } catch (error) {
      toast.error('Failed to complete checkout');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code *</Label>
                    <Input
                      id="postal"
                      value={shippingPostal}
                      onChange={(e) => setShippingPostal(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={clearCart.isPending}>
                  {clearCart.isPending ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((cartItem) => {
                const price = Number(cartItem.item.price) / 100;
                const quantity = Number(cartItem.quantity);
                return (
                  <div key={cartItem.item.id.toString()} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {cartItem.item.title} x{quantity}
                    </span>
                    <span>${(price * quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
