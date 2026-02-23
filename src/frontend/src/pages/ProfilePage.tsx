import { useParams, Link } from '@tanstack/react-router';
import { useGetPublicProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ItemCard from '../components/ItemCard';
import { Loader2, Mail, Calendar, Award, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const { identity } = useInternetIdentity();
  const { data: publicProfile, isLoading, error } = useGetPublicProfile(userId);

  const isOwnProfile = identity && userId === identity.getPrincipal().toString();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !publicProfile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <Sparkles className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This wizard hasn't set up their profile yet.
          </p>
          <Link to="/browse" className="text-primary hover:underline">
            Return to Browse
          </Link>
        </div>
      </div>
    );
  }

  const { profile, activeListings } = publicProfile;
  const memberSince = new Date(Number(activeListings[0]?.created || Date.now()) / 1000000);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8 overflow-hidden border-primary/20">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-chart-1/20 to-chart-2/20" />
        <CardContent className="pt-6 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center text-4xl font-bold text-primary-foreground">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {profile.isSeller && (
                    <Badge className="bg-chart-1 hover:bg-chart-1/90">
                      <Award className="h-3 w-3 mr-1" />
                      Seller
                    </Badge>
                  )}
                  {isOwnProfile && (
                    <Badge variant="outline">Your Profile</Badge>
                  )}
                </div>
                {profile.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {memberSince.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isOwnProfile ? 'Your Listings' : `${profile.name}'s Listings`}
          </h2>
          <Badge variant="secondary">
            {activeListings.length} {activeListings.length === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>

        {activeListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeListings.map((item) => (
              <ItemCard key={item.id.toString()} item={item} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "You haven't listed any items yet."
                  : `${profile.name} hasn't listed any items yet.`}
              </p>
              {isOwnProfile && profile.isSeller && (
                <Link
                  to="/create-listing"
                  className="inline-block mt-4 text-primary hover:underline"
                >
                  Create your first listing
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
