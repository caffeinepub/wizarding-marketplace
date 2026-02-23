import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Loader2, User } from 'lucide-react';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import type { UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

export default function AccountSettingsPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<ExternalBlob | null>(null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email || '');
      setProfilePicture(userProfile.profilePicture || null);
    }
  }, [userProfile]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto bg-oak-dark/50 border-starlight-gold/30">
          <CardContent className="pt-6 text-center">
            <Settings className="h-16 w-16 mx-auto mb-4 text-starlight-gold" />
            <h2 className="text-2xl font-serif font-bold text-starlight-gold mb-2">Account Settings</h2>
            <p className="text-starlight-silver/70 mb-4">Please login to manage your account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim() || undefined,
      isSeller: false,
      profilePicture: profilePicture || undefined,
    };

    await saveProfileMutation.mutateAsync(profile);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-starlight-gold mb-8 text-center">
          Account Settings
        </h1>

        <Card className="bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto mb-4 text-starlight-gold animate-spin" />
                <p className="text-starlight-silver">Loading profile...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-starlight-silver mb-2 block">Profile Picture</Label>
                  <ProfilePictureUpload
                    value={profilePicture}
                    onChange={setProfilePicture}
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-starlight-silver">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="bg-ebony/50 border-starlight-silver/30 text-starlight-silver"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-starlight-silver">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="bg-ebony/50 border-starlight-silver/30 text-starlight-silver"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saveProfileMutation.isPending || !name.trim()}
                  className="w-full bg-gradient-to-r from-starlight-gold to-mahogany hover:from-starlight-gold/90 hover:to-mahogany/90 text-ebony font-semibold"
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Principal ID Display */}
        <Card className="mt-6 bg-oak-dark/50 border-starlight-gold/30">
          <CardHeader>
            <CardTitle className="text-starlight-gold font-serif text-sm">Your Principal ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-starlight-silver/70 font-mono break-all">
              {identity?.getPrincipal().toString()}
            </p>
            <p className="text-xs text-starlight-silver/50 mt-2">
              Share this ID with friends so they can add you!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
