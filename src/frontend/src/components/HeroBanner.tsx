export default function HeroBanner() {
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg mb-8">
      <img
        src="/assets/generated/hero-banner.dim_1200x400.png"
        alt="Wizarding Marketplace"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end">
        <div className="container mx-auto px-4 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Discover Magical Treasures
          </h1>
          <p className="text-lg text-muted-foreground">
            Buy and sell authentic wizarding world collectibles
          </p>
        </div>
      </div>
    </div>
  );
}
