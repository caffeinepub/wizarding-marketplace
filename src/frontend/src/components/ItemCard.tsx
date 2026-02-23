import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item } from '../backend';
import { Sparkles } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

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

export default function ItemCard({ item }: ItemCardProps) {
  const imageUrl = item.image?.getDirectURL();
  const price = Number(item.price) / 100; // Convert from cents

  return (
    <Link to="/item/$itemId" params={{ itemId: item.id.toString() }}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full">
        <div className="aspect-square overflow-hidden bg-muted relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-chart-1/10">
              <Sparkles className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge>{formatCategory(item.category)}</Badge>
          </div>
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-2xl font-bold text-primary mb-2">${price.toFixed(2)}</p>
          <Badge variant="outline" className="text-xs">
            {formatCondition(item.condition)}
          </Badge>
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <Link
            to="/profile/$userId"
            params={{ userId: item.seller.toString() }}
            className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View Seller
          </Link>
        </CardFooter>
      </Card>
    </Link>
  );
}
