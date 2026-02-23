import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, UserId, PublicProfile, Wand, Friendship } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

// User Profile Hooks
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useGetPublicProfile(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicProfile | null>({
    queryKey: ['publicProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getPublicProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// Wand Management Hooks
export function useGetWands() {
  const { actor, isFetching } = useActor();

  return useQuery<Wand[]>({
    queryKey: ['wands'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWands();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWand(wandId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Wand | null>({
    queryKey: ['wand', wandId],
    queryFn: async () => {
      if (!actor || !wandId) return null;
      return actor.getWand(wandId);
    },
    enabled: !!actor && !isFetching && !!wandId,
  });
}

export function useCreateWand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createWand(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wands'] });
      toast.success('Wand created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create wand');
    },
  });
}

export function useUpdateWand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wandId, name }: { wandId: string; name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWand(wandId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wands'] });
      queryClient.invalidateQueries({ queryKey: ['wand'] });
      toast.success('Wand updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update wand');
    },
  });
}

export function useDeleteWand() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wandId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWand(wandId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wands'] });
      toast.success('Wand deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete wand');
    },
  });
}

// Friendship Hooks
export function useGetConfirmedFriends() {
  const { actor, isFetching } = useActor();

  return useQuery<UserId[]>({
    queryKey: ['confirmedFriends'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConfirmedFriends();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingFriendRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<Friendship[]>({
    queryKey: ['pendingFriendRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFriendRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId: UserId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendFriendRequest(friendId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmedFriends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      toast.success('Friend request sent!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterId: UserId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptFriendRequest(requesterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmedFriends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      toast.success('Friend request accepted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });
}

export function useRejectFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterId: UserId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectFriendRequest(requesterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingFriendRequests'] });
      toast.success('Friend request rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject friend request');
    },
  });
}

export function useGetFriendWands(friendId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Wand[]>({
    queryKey: ['friendWands', friendId],
    queryFn: async () => {
      if (!actor || !friendId) return [];
      return actor.getFriendWands(Principal.fromText(friendId));
    },
    enabled: !!actor && !isFetching && !!friendId,
  });
}
