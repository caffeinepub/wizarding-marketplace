import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';
import ProfilePictureUpload from './ProfilePictureUpload';
import type { UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState<ExternalBlob | null>(null);
  const saveProfileMutation = useSaveCallerUserProfile();

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
    <Dialog open={true}>
      <DialogContent className="bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-starlight-gold font-serif text-2xl">
            <Wand2 className="h-6 w-6" />
            Welcome to Wand Collector
          </DialogTitle>
          <DialogDescription className="text-starlight-silver/70">
            Let's set up your profile to get started with your wand collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <Label className="text-starlight-silver mb-2 block">Profile Picture (Optional)</Label>
            <ProfilePictureUpload
              value={profilePicture}
              onChange={setProfilePicture}
            />
          </div>

          <div>
            <Label htmlFor="setupName" className="text-starlight-silver">
              Name *
            </Label>
            <Input
              id="setupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="bg-ebony/50 border-starlight-silver/30 text-starlight-silver"
            />
          </div>

          <div>
            <Label htmlFor="setupEmail" className="text-starlight-silver">
              Email (Optional)
            </Label>
            <Input
              id="setupEmail"
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
                Creating Profile...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
