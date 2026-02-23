import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  useGetConfirmedFriends, 
  useGetPendingFriendRequests, 
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useGetPublicProfile
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Check, X, Wand2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import UserAvatar from '../components/UserAvatar';
import { Principal } from '@dfinity/principal';

function FriendCard({ friendId }: { friendId: string }) {
  const { data: profile } = useGetPublicProfile(friendId);

  return (
    <Link 
      to="/friends/$friendId/wands" 
      params={{ friendId }}
      className="block"
    >
      <Card className="bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30 hover:border-starlight-gold/60 transition-all hover:shadow-lg hover:shadow-starlight-gold/20 cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <UserAvatar profilePicture={profile?.profile.profilePicture} size="medium" />
            <div className="flex-1">
              <h3 className="font-serif font-bold text-starlight-gold text-lg">
                {profile?.profile.name || 'Loading...'}
              </h3>
              <p className="text-sm text-starlight-silver/70">View wand collection</p>
            </div>
            <Wand2 className="h-6 w-6 text-starlight-silver/50" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function FriendsPage() {
  const { identity } = useInternetIdentity();
  const { data: friends = [], isLoading: friendsLoading } = useGetConfirmedFriends();
  const { data: pendingRequests = [], isLoading: requestsLoading } = useGetPendingFriendRequests();
  const sendRequestMutation = useSendFriendRequest();
  const acceptRequestMutation = useAcceptFriendRequest();
  const rejectRequestMutation = useRejectFriendRequest();

  const [friendPrincipal, setFriendPrincipal] = useState('');

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto bg-oak-dark/50 border-starlight-gold/30">
          <CardContent className="pt-6 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-starlight-gold" />
            <h2 className="text-2xl font-serif font-bold text-starlight-gold mb-2">Friends</h2>
            <p className="text-starlight-silver/70 mb-4">Please login to manage your friends.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendPrincipal.trim()) return;

    try {
      const principal = Principal.fromText(friendPrincipal.trim());
      await sendRequestMutation.mutateAsync(principal);
      setFriendPrincipal('');
    } catch (error) {
      console.error('Invalid principal:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-starlight-gold mb-8 text-center">
          Friends & Connections
        </h1>

        {/* Send Friend Request */}
        <Card className="mb-8 bg-oak-dark/50 border-starlight-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
              <UserPlus className="h-5 w-5" />
              Add Friend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <Label htmlFor="friendPrincipal" className="text-starlight-silver">
                  Friend's Principal ID
                </Label>
                <Input
                  id="friendPrincipal"
                  value={friendPrincipal}
                  onChange={(e) => setFriendPrincipal(e.target.value)}
                  placeholder="Enter principal ID..."
                  className="bg-ebony/50 border-starlight-silver/30 text-starlight-silver"
                />
              </div>
              <Button
                type="submit"
                disabled={sendRequestMutation.isPending || !friendPrincipal.trim()}
                className="w-full bg-gradient-to-r from-starlight-gold to-mahogany hover:from-starlight-gold/90 hover:to-mahogany/90 text-ebony font-semibold"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {sendRequestMutation.isPending ? 'Sending...' : 'Send Friend Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pending Friend Requests */}
        {pendingRequests.length > 0 && (
          <Card className="mb-8 bg-oak-dark/50 border-starlight-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
                <Users className="h-5 w-5" />
                Pending Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map((request) => {
                const requesterId = request.user.toString();
                return (
                  <div key={requesterId} className="flex items-center justify-between p-4 bg-ebony/30 rounded-lg border border-starlight-silver/20">
                    <div className="flex items-center gap-3">
                      <UserAvatar size="small" />
                      <span className="text-starlight-silver font-medium">
                        {requesterId.slice(0, 8)}...{requesterId.slice(-6)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequestMutation.mutate(request.user)}
                        disabled={acceptRequestMutation.isPending}
                        className="bg-starlight-gold hover:bg-starlight-gold/90 text-ebony"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectRequestMutation.mutate(request.user)}
                        disabled={rejectRequestMutation.isPending}
                        className="border-mahogany/30 hover:border-mahogany hover:text-mahogany"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card className="bg-oak-dark/50 border-starlight-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
              <Users className="h-5 w-5" />
              My Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friendsLoading ? (
              <p className="text-center text-starlight-silver/70 py-8">Loading friends...</p>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-starlight-silver/50" />
                <p className="text-starlight-silver/70">No friends yet. Add some friends to see their wand collections!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friendId) => (
                  <FriendCard key={friendId.toString()} friendId={friendId.toString()} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
