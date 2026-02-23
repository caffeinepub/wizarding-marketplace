import { useState, useMemo } from 'react';
import { useBrowseItems } from '../hooks/useQueries';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import HeroBanner from '../components/HeroBanner';
import { Loader2 } from 'lucide-react';

export default function BrowsePage() {
  const { data: items, isLoading } = useBrowseItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = category === 'all' || item.category === category;

      // Condition filter
      const matchesCondition = condition === 'all' || item.condition === condition;

      // Price filter
      const itemPrice = Number(item.price) / 100;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = itemPrice >= min && itemPrice <= max;

      return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
    });
  }, [items, searchQuery, category, condition, minPrice, maxPrice]);

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroBanner />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <FilterPanel
            category={category}
            condition={condition}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onCategoryChange={setCategory}
            onConditionChange={setCondition}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No magical items found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id.toString()} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
