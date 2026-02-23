import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyListings, useDeleteItemListing } from '../hooks/useQueries';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Package, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

export default function MyListingsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: listings, isLoading } = useGetMyListings();
  const deleteListing = useDeleteItemListing();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your listings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleDelete = async (itemId: bigint) => {
    try {
      await deleteListing.mutateAsync(itemId);
      toast.success('Listing deleted successfully');
    } catch (error) {
      toast.error('Failed to delete listing');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No listings yet</h2>
        <p className="text-muted-foreground mb-6">Create your first listing to start selling!</p>
        <Button onClick={() => navigate({ to: '/create-listing' })}>
          Create Listing
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Button onClick={() => navigate({ to: '/create-listing' })}>
          Create New Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => {
          const imageUrl = item.image?.getDirectURL();
          const price = Number(item.price) / 100;

          return (
            <Card key={item.id.toString()} className="overflow-hidden">
              <div className="aspect-square overflow-hidden bg-muted relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-chart-1/10">
                    <Sparkles className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-card/90 backdrop-blur">
                  {formatCategory(item.category)}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-primary">${price.toFixed(2)}</span>
                  <Badge variant="outline" className="w-fit">
                    {formatCondition(item.condition)}
                  </Badge>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this listing? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
