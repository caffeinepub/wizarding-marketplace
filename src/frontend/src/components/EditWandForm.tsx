import { useState } from 'react';
import { useUpdateWand } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2, X } from 'lucide-react';
import type { Wand } from '../backend';

interface EditWandFormProps {
  wand: Wand;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditWandForm({ wand, onSuccess, onCancel }: EditWandFormProps) {
  const [name, setName] = useState(wand.name);
  const updateWandMutation = useUpdateWand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return;

    await updateWandMutation.mutateAsync({ wandId: wand.id, name: name.trim() });
    onSuccess?.();
  };

  return (
    <Card className="bg-gradient-to-br from-oak-dark to-oak-light border-starlight-gold/30 shadow-lg shadow-starlight-gold/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-starlight-gold font-serif">
            <Wand2 className="h-5 w-5" />
            Edit Wand
          </CardTitle>
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-starlight-silver hover:text-starlight-gold"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="editWandName" className="text-starlight-silver">
              Wand Name
            </Label>
            <Input
              id="editWandName"
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
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={updateWandMutation.isPending || !name.trim() || name.trim().length < 2}
              className="flex-1 bg-gradient-to-r from-starlight-gold to-mahogany hover:from-starlight-gold/90 hover:to-mahogany/90 text-ebony font-semibold"
            >
              {updateWandMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Update Wand
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-starlight-silver/30 hover:border-starlight-gold"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
