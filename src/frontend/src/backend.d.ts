import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    email?: string;
    isSeller: boolean;
    profilePicture?: ExternalBlob;
}
export interface Friendship {
    user: UserId;
    friend: UserId;
    confirmed: boolean;
}
export type Price = bigint;
export interface Wand {
    id: string;
    owner: UserId;
    name: string;
    createdAt: bigint;
}
export type UserId = Principal;
export interface ShoppingCartView {
    items: Array<CartItem>;
}
export interface PublicProfile {
    activeListings: Array<Item>;
    profile: UserProfile;
}
export interface Item {
    id: ItemId;
    title: string;
    created: bigint;
    description: string;
    seller: UserId;
    category: Category;
    image?: ExternalBlob;
    price: Price;
    condition: ItemCondition;
}
export type MessageId = bigint;
export type ItemId = bigint;
export interface Message {
    id: MessageId;
    to: UserId;
    content: string;
    from: UserId;
    timestamp: bigint;
}
export interface CartItem {
    item: Item;
    quantity: bigint;
}
export enum Category {
    art = "art",
    clothing = "clothing",
    collectibles = "collectibles",
    other = "other",
    toys = "toys",
    books = "books",
    wands = "wands",
    props = "props",
    syrups = "syrups"
}
export enum ItemCondition {
    new_ = "new",
    veryUsed = "veryUsed",
    used = "used",
    likeNew = "likeNew"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptFriendRequest(requesterId: UserId): Promise<void>;
    addToCart(itemId: ItemId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    browseItems(): Promise<Array<Item>>;
    clearCart(): Promise<void>;
    createItemListing(title: string, description: string, price: Price, condition: ItemCondition, category: Category, image: ExternalBlob | null): Promise<ItemId>;
    createWand(name: string): Promise<Wand>;
    deleteItemListing(itemId: ItemId): Promise<void>;
    deleteWand(wandId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConfirmedFriends(): Promise<Array<UserId>>;
    getConversation(otherUser: UserId): Promise<Array<Message>>;
    getFriendWands(friendId: UserId): Promise<Array<Wand>>;
    getItem(itemId: ItemId): Promise<Item | null>;
    getMessages(): Promise<Array<Message>>;
    getMyListings(): Promise<Array<Item>>;
    getPendingFriendRequests(): Promise<Array<Friendship>>;
    getPublicProfile(user: UserId): Promise<PublicProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWand(wandId: string): Promise<Wand | null>;
    getWands(): Promise<Array<Wand>>;
    isCallerAdmin(): Promise<boolean>;
    rejectFriendRequest(requesterId: UserId): Promise<void>;
    removeFromCart(itemId: ItemId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchItemsByCategory(category: Category): Promise<Array<Item>>;
    searchItemsByCondition(condition: ItemCondition): Promise<Array<Item>>;
    searchItemsByPriceRange(minPrice: Price, maxPrice: Price): Promise<Array<Item>>;
    sendFriendRequest(friendId: UserId): Promise<void>;
    sendMessage(to: UserId, content: string): Promise<MessageId>;
    updateCartItem(itemId: ItemId, quantity: bigint): Promise<void>;
    updateItemListing(itemId: ItemId, title: string, description: string, price: Price, condition: ItemCondition, category: Category, image: ExternalBlob | null): Promise<void>;
    updateWand(wandId: string, name: string): Promise<void>;
    viewCart(): Promise<ShoppingCartView>;
}
