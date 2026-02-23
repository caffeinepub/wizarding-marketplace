import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category, ItemCondition } from '../backend';

interface FilterPanelProps {
  category: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const categoryImages: Record<string, string> = {
  books: '/assets/generated/category-books.dim_300x300.png',
  wands: '/assets/generated/category-wands.dim_300x300.png',
  clothing: '/assets/generated/category-robes.dim_300x300.png',
  collectibles: '/assets/generated/category-collectibles.dim_300x300.png',
};

export default function FilterPanel({
  category,
  condition,
  minPrice,
  maxPrice,
  onCategoryChange,
  onConditionChange,
  onMinPriceChange,
  onMaxPriceChange,
}: FilterPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter with Images */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value={Category.books}>Books</SelectItem>
              <SelectItem value={Category.wands}>Wands</SelectItem>
              <SelectItem value={Category.clothing}>Clothing & Robes</SelectItem>
              <SelectItem value={Category.collectibles}>Collectibles</SelectItem>
              <SelectItem value={Category.props}>Props</SelectItem>
              <SelectItem value={Category.art}>Art</SelectItem>
              <SelectItem value={Category.toys}>Toys</SelectItem>
              <SelectItem value={Category.other}>Other</SelectItem>
            </SelectContent>
          </Select>
          {category !== 'all' && categoryImages[category] && (
            <div className="mt-2 rounded-lg overflow-hidden border">
              <img
                src={categoryImages[category]}
                alt={category}
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>

        {/* Condition Filter */}
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select value={condition} onValueChange={onConditionChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value={ItemCondition.new_}>New</SelectItem>
              <SelectItem value={ItemCondition.likeNew}>Like New</SelectItem>
              <SelectItem value={ItemCondition.used}>Used</SelectItem>
              <SelectItem value={ItemCondition.veryUsed}>Well-Loved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              min="0"
              step="0.01"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
