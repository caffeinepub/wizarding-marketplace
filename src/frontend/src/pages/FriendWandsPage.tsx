import { useParams, Link } from '@tanstack/react-router';
import { useGetFriendWands, useGetPublicProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ArrowLeft, Sparkles } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

export default function FriendWandsPage() {
  const { friendId } = useParams({ from: '/friends/$friendId/wands' });
  const { data: wands = [], isLoading: wandsLoading } = useGetFriendWands(friendId);
  const { data: profile, isLoading: profileLoading } = useGetPublicProfile(friendId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/friends">
          <Button variant="outline" className="mb-6 border-starlight-silver/30 hover:border-starlight-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Friends
          </Button>
        </Link>

        {/* Friend Profile */}
        {profileLoading ? (
          <Card className="mb-8 bg-oak-dark/50 border-starlight-gold/30">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-starlight-gold animate-pulse" />
              <p className="text-starlight-silver">Loading profile...</p>
            </CardContent>
          </Card>
        ) : profile ? (
          <Card className="mb-8 bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <UserAvatar profilePicture={profile.profile.profilePicture} size="large" />
                <div>
                  <h1 className="text-3xl font-serif font-bold text-starlight-gold">
                    {profile.profile.name}'s Wand Collection
                  </h1>
                  <p className="text-starlight-silver/70">
                    {wands.length} {wands.length === 1 ? 'Wand' : 'Wands'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 bg-oak-dark/50 border-starlight-gold/30">
            <CardContent className="pt-6 text-center">
              <p className="text-starlight-silver">Profile not found</p>
            </CardContent>
          </Card>
        )}

        {/* Wands Grid */}
        {wandsLoading ? (
          <Card className="bg-oak-dark/50 border-starlight-gold/30">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-starlight-gold animate-pulse" />
              <p className="text-starlight-silver">Loading wands...</p>
            </CardContent>
          </Card>
        ) : wands.length === 0 ? (
          <Card className="bg-oak-dark/50 border-starlight-gold/30">
            <CardContent className="pt-6 text-center">
              <Wand2 className="h-16 w-16 mx-auto mb-4 text-starlight-silver/50" />
              <h3 className="text-xl font-serif font-bold text-starlight-silver mb-2">No Wands Yet</h3>
              <p className="text-starlight-silver/70">This friend hasn't added any wands to their collection.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wands.map((wand) => (
              <Card 
                key={wand.id} 
                className="bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30 hover:border-starlight-gold/60 transition-all hover:shadow-lg hover:shadow-starlight-gold/20"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
                    <Wand2 className="h-5 w-5" />
                    {wand.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-starlight-silver/70">
                    Added: {new Date(Number(wand.createdAt) / 1000000).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
