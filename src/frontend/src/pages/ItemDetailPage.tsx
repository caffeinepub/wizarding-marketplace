import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useGetItem, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AddToCartButton from '../components/AddToCartButton';
import ContactSellerButton from '../components/ContactSellerButton';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';

function formatCondition(condition: string): string {
  const map: Record<string, string> = {
    new_: 'New',
    likeNew: 'Like New',
    used: 'Used',
    veryUsed: 'Well-Loved',
  };
  return map[condition] || condition;
}

function formatCategory(category: string): string {
  const map: Record<string, string> = {
    books: 'Books',
    wands: 'Wands',
    clothing: 'Clothing',
    collectibles: 'Collectibles',
    props: 'Props',
    art: 'Art',
    toys: 'Toys',
    other: 'Other',
  };
  return map[category] || category;
}

export default function ItemDetailPage() {
  const { itemId } = useParams({ from: '/item/$itemId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: item, isLoading } = useGetItem(BigInt(itemId));
  const { data: sellerProfile } = useGetUserProfile(item?.seller.toString());

  const isOwnItem = identity && item && item.seller.toString() === identity.getPrincipal().toString();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Item not found</p>
        <Button onClick={() => navigate({ to: '/browse' })} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>
      </div>
    );
  }

  const imageUrl = item.image?.getDirectURL();
  const price = Number(item.price) / 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => navigate({ to: '/browse' })}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Browse
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-chart-1/10">
              <Sparkles className="h-24 w-24 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex gap-2 mb-3">
              <Badge>{formatCategory(item.category)}</Badge>
              <Badge variant="outline">{formatCondition(item.condition)}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
            <p className="text-4xl font-bold text-primary">${price.toFixed(2)}</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-semibold mb-2">Seller Information</h2>
              <Link
                to="/profile/$userId"
                params={{ userId: item.seller.toString() }}
                className="text-muted-foreground hover:text-primary hover:underline transition-colors inline-block"
              >
                {sellerProfile?.name || 'Anonymous Wizard'}
              </Link>
            </CardContent>
          </Card>

          {identity && !isOwnItem && (
            <div className="space-y-3">
              <AddToCartButton itemId={item.id} />
              <ContactSellerButton sellerId={item.seller} />
            </div>
          )}

          {isOwnItem && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">This is your listing</p>
              </CardContent>
            </Card>
          )}

          {!identity && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Please log in to purchase this item</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
