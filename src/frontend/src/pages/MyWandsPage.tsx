import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWands, useDeleteWand } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Plus, Trash2, Edit, Sparkles } from 'lucide-react';
import AddWandForm from '../components/AddWandForm';
import EditWandForm from '../components/EditWandForm';
import type { Wand } from '../backend';

export default function MyWandsPage() {
  const { identity } = useInternetIdentity();
  const { data: wands = [], isLoading } = useGetWands();
  const deleteWandMutation = useDeleteWand();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWand, setEditingWand] = useState<Wand | null>(null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto bg-oak-dark/50 border-starlight-gold/30">
          <CardContent className="pt-6 text-center">
            <Wand2 className="h-16 w-16 mx-auto mb-4 text-starlight-gold" />
            <h2 className="text-2xl font-serif font-bold text-starlight-gold mb-2">Welcome to Wand Collector</h2>
            <p className="text-starlight-silver/70 mb-4">Please login to view and manage your wand collection.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async (wandId: string) => {
    if (confirm('Are you sure you want to delete this wand?')) {
      await deleteWandMutation.mutateAsync(wandId);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="/assets/generated/wand-hero.dim_1200x400.png" 
          alt="Wand Collection" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ebony via-ebony/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-serif font-bold text-starlight-gold mb-2 drop-shadow-lg">
              My Wand Collection
            </h1>
            <p className="text-xl text-starlight-silver drop-shadow-md">
              {wands.length} {wands.length === 1 ? 'Wand' : 'Wands'} in your collection
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Add Wand Button */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="lg"
            className="bg-gradient-to-r from-starlight-gold to-mahogany hover:from-starlight-gold/90 hover:to-mahogany/90 text-ebony font-semibold shadow-lg shadow-starlight-gold/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Wand
          </Button>
        </div>

        {/* Add Wand Form */}
        {showAddForm && (
          <div className="mb-8 max-w-md mx-auto">
            <AddWandForm onSuccess={() => setShowAddForm(false)} />
          </div>
        )}

        {/* Edit Wand Form */}
        {editingWand && (
          <div className="mb-8 max-w-md mx-auto">
            <EditWandForm 
              wand={editingWand} 
              onSuccess={() => setEditingWand(null)}
              onCancel={() => setEditingWand(null)}
            />
          </div>
        )}

        {/* Wands Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-starlight-gold animate-pulse" />
            <p className="text-starlight-silver">Loading your wands...</p>
          </div>
        ) : wands.length === 0 ? (
          <Card className="max-w-md mx-auto bg-oak-dark/50 border-starlight-gold/30">
            <CardContent className="pt-6 text-center">
              <Wand2 className="h-16 w-16 mx-auto mb-4 text-starlight-silver/50" />
              <h3 className="text-xl font-serif font-bold text-starlight-silver mb-2">No Wands Yet</h3>
              <p className="text-starlight-silver/70">Start your collection by adding your first wand!</p>
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
                  <p className="text-sm text-starlight-silver/70 mb-4">
                    Added: {new Date(Number(wand.createdAt) / 1000000).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingWand(wand)}
                      className="flex-1 border-starlight-silver/30 hover:border-starlight-gold hover:text-starlight-gold"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(wand.id)}
                      disabled={deleteWandMutation.isPending}
                      className="flex-1 border-mahogany/30 hover:border-mahogany hover:text-mahogany"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
