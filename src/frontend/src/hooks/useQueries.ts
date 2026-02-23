import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Item, ItemId, Category, ItemCondition, Price, ShoppingCartView, Message, UserId, PublicProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

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

// Item Listing Hooks
export function useCreateItemListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      price,
      condition,
      category,
      image,
    }: {
      title: string;
      description: string;
      price: Price;
      condition: ItemCondition;
      category: Category;
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createItemListing(title, description, price, condition, category, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    },
  });
}

export function useUpdateItemListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      title,
      description,
      price,
      condition,
      category,
      image,
    }: {
      itemId: ItemId;
      title: string;
      description: string;
      price: Price;
      condition: ItemCondition;
      category: Category;
      image: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateItemListing(itemId, title, description, price, condition, category, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    },
  });
}

export function useDeleteItemListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: ItemId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteItemListing(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    },
  });
}

export function useGetItem(itemId: ItemId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Item | null>({
    queryKey: ['item', itemId?.toString()],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getItem(itemId);
    },
    enabled: !!actor && !isFetching && itemId !== undefined,
  });
}

export function useBrowseItems() {
  const { actor, isFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.browseItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyListings() {
  const { actor, isFetching } = useActor();

  return useQuery<Item[]>({
    queryKey: ['myListings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyListings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Shopping Cart Hooks
export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: ItemId; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: ItemId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromCart(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: ItemId; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCartItem(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useViewCart() {
  const { actor, isFetching } = useActor();

  return useQuery<ShoppingCartView>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return { items: [] };
      try {
        return await actor.viewCart();
      } catch (error) {
        // Cart not found for new users
        return { items: [] };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Messaging Hooks
export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, content }: { to: UserId; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(to, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}

export function useGetMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetConversation(otherUser: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['conversation', otherUser],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return actor.getConversation(Principal.fromText(otherUser));
    },
    enabled: !!actor && !isFetching && !!otherUser,
  });
}

export function useGetUserProfile(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
