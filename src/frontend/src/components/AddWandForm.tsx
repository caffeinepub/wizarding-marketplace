import { useState } from 'react';
import { useCreateWand } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';

interface AddWandFormProps {
  onSuccess?: () => void;
}

export default function AddWandForm({ onSuccess }: AddWandFormProps) {
  const [name, setName] = useState('');
  const createWandMutation = useCreateWand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return;

    await createWandMutation.mutateAsync(name.trim());
    setName('');
    onSuccess?.();
  };

  return (
    <Card className="bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30 shadow-lg shadow-starlight-gold/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
          <Wand2 className="h-5 w-5" />
          Add New Wand
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wandName" className="text-starlight-silver">
              Wand Name
            </Label>
            <Input
              id="wandName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Elder Wand, Phoenix Feather..."
              required
              minLength={2}
              className="bg-ebony/50 border-starlight-silver/30 text-starlight-silver placeholder:text-starlight-silver/50"
            />
            {name.trim().length > 0 && name.trim().length < 2 && (
              <p className="text-sm text-mahogany mt-1">Name must be at least 2 characters</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={createWandMutation.isPending || !name.trim() || name.trim().length < 2}
            className="w-full bg-gradient-to-r from-starlight-gold to-mahogany hover:from-starlight-gold/90 hover:to-mahogany/90 text-ebony font-semibold"
          >
            {createWandMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Create Wand
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
