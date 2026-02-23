import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Role-based Access Control
  let accessControlState = AccessControl.initState();
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  public type UserId = Principal;
  public type ItemId = Nat;
  public type MessageId = Nat;
  public type Price = Int;

  public type ItemCondition = {
    #new;
    #likeNew;
    #used;
    #veryUsed;
  };

  public type Category = {
    #books;
    #wands;
    #props;
    #clothing;
    #toys;
    #art;
    #collectibles;
    #syrups;
    #other;
  };

  public type Item = {
    id : ItemId;
    seller : UserId;
    title : Text;
    description : Text;
    price : Price;
    condition : ItemCondition;
    category : Category;
    image : ?Storage.ExternalBlob;
    created : Int;
  };

  module Item {
    public func compareByPriceAscending(a : Item, b : Item) : Order.Order {
      Int.compare(a.price, b.price);
    };
  };

  public type CartItem = {
    item : Item;
    quantity : Nat;
  };

  public type ShoppingCart = {
    items : List.List<CartItem>;
  };

  public type ShoppingCartView = {
    items : [CartItem];
  };

  public type Message = {
    id : MessageId;
    from : UserId;
    to : UserId;
    content : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    isSeller : Bool;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type PublicProfile = {
    profile : UserProfile;
    activeListings : [Item];
  };

  // Wand, Magic, and Friendship System
  public type Wand = {
    id : Text;
    name : Text;
    owner : UserId;
    createdAt : Int;
  };

  public type Magic = {
    id : Text;
    name : Text;
    effect : Text;
    owner : UserId;
    wandId : Text;
    createdAt : Int;
  };

  // Friendship data type for friendship management
  public type Friendship = {
    user : UserId;
    friend : UserId;
    confirmed : Bool;
  };

  var idStore = 0;
  let items = Map.empty<ItemId, Item>();
  let shoppingCarts = Map.empty<UserId, ShoppingCart>();
  let messages = Map.empty<MessageId, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let wands = Map.empty<Text, Wand>();
  let friendships = Map.empty<Text, Friendship>();

  func nextId() : Nat {
    var currentId = idStore;
    idStore += 1;
    currentId;
  };

  func generateFriendshipKey(user : UserId, friend : UserId) : Text {
    user.toText() # "-" # friend.toText();
  };

  func areFriends(user1 : UserId, user2 : UserId) : Bool {
    let key = generateFriendshipKey(user1, user2);
    let reverseKey = generateFriendshipKey(user2, user1);

    switch (friendships.get(key)) {
      case (?friendship) { return friendship.confirmed };
      case (null) {
        switch (friendships.get(reverseKey)) {
          case (?friendship) { return friendship.confirmed };
          case (null) { return false };
        };
      };
    };
  };

  // User Profile Management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getPublicProfile(user : UserId) : async ?PublicProfile {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        let activeListings = items.values().toArray().filter(
          func(item) {
            item.seller == user
          }
        );
        ?{
          profile;
          activeListings;
        };
      };
    };
  };

  // Item Listing
  public shared ({ caller }) func createItemListing(
    title : Text,
    description : Text,
    price : Price,
    condition : ItemCondition,
    category : Category,
    image : ?Storage.ExternalBlob,
  ) : async ItemId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    if (price < 0) { Runtime.trap("Price cannot be negative") };
    let itemId = nextId();
    let item : Item = {
      id = itemId;
      seller = caller;
      title;
      description;
      price;
      condition;
      category;
      image;
      created = Time.now();
    };
    items.add(itemId, item);
    itemId;
  };

  public shared ({ caller }) func updateItemListing(
    itemId : ItemId,
    title : Text,
    description : Text,
    price : Price,
    condition : ItemCondition,
    category : Category,
    image : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
    if ((item.seller != caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the seller or admin can update this listing");
    };
    if (price < 0) { Runtime.trap("Price cannot be negative") };
    let updatedItem : Item = {
      id = itemId;
      seller = item.seller;
      title;
      description;
      price;
      condition;
      category;
      image;
      created = item.created;
    };
    items.add(itemId, updatedItem);
  };

  public shared ({ caller }) func deleteItemListing(itemId : ItemId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
    if ((item.seller != caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the seller or admin can delete this listing");
    };
    items.remove(itemId);
  };

  public query ({ caller }) func getItem(itemId : ItemId) : async ?Item {
    items.get(itemId);
  };

  public query ({ caller }) func browseItems() : async [Item] {
    items.values().toArray();
  };

  public query ({ caller }) func searchItemsByCategory(category : Category) : async [Item] {
    items.values().toArray().filter(
      func(item) {
        item.category == category
      }
    );
  };

  public query ({ caller }) func searchItemsByPriceRange(minPrice : Price, maxPrice : Price) : async [Item] {
    if (minPrice > maxPrice) { Runtime.trap("Invalid price range") };
    items.values().toArray().filter(
      func(item) {
        item.price >= minPrice and item.price <= maxPrice
      }
    );
  };

  public query ({ caller }) func searchItemsByCondition(condition : ItemCondition) : async [Item] {
    items.values().toArray().filter(
      func(item) {
        item.condition == condition
      }
    );
  };

  public query ({ caller }) func getMyListings() : async [Item] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their listings");
    };
    items.values().toArray().filter(
      func(item) {
        item.seller == caller
      }
    );
  };

  // Shopping Cart
  public shared ({ caller }) func addToCart(itemId : ItemId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let item = switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
    if (item.seller == caller) {
      Runtime.trap("Cannot add your own item to cart");
    };
    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { { items = List.empty<CartItem>() } };
      case (?cart) { cart };
    };

    let existingItemIndex = cart.items.toArray().findIndex(
      func(cartItem) { cartItem.item.id == itemId }
    );

    let newCartItems = switch (existingItemIndex) {
      case (null) {
        cart.items.add({ item; quantity });
        cart.items;
      };
      case (?index) {
        let cartItemsArray = cart.items.toArray();
        if (index >= cartItemsArray.size()) {
          cart.items;
        } else {
          let currentCartItem = cartItemsArray[index];
          let updatedCartItem = {
            item = currentCartItem.item;
            quantity = currentCartItem.quantity + quantity;
          };
          let updatedArray = Array.tabulate(
            cartItemsArray.size(),
            func(i) {
              if (i == index) { updatedCartItem } else { cartItemsArray[i] };
            },
          );
          List.fromArray<CartItem>(updatedArray);
        };
      };
    };

    let newCart = { items = newCartItems };
    shoppingCarts.add(caller, newCart);
  };

  public shared ({ caller }) func removeFromCart(itemId : ItemId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove items from cart");
    };
    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };
    let cartItemsArray = cart.items.toArray();
    let filteredItems = cartItemsArray.filter(
      func(cartItem) {
        cartItem.item.id != itemId
      }
    );
    let newCart = { items = List.fromArray<CartItem>(filteredItems) };
    shoppingCarts.add(caller, newCart);
  };

  public shared ({ caller }) func updateCartItem(itemId : ItemId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart items");
    };
    if (quantity == 0) { Runtime.trap("Quantity must be greater than 0") };
    let cart = switch (shoppingCarts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };
    let cartItems = cart.items.toArray();
    let mappedItems = cartItems.map(
      func(cartItem) {
        if (cartItem.item.id == itemId) { { item = cartItem.item; quantity } } else { cartItem };
      }
    );
    let newCart = { items = List.fromArray<CartItem>(mappedItems) };
    shoppingCarts.add(caller, newCart);
  };

  public shared ({ caller }) func viewCart() : async ShoppingCartView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (shoppingCarts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) {
        { items = cart.items.toArray() };
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    let emptyCart = { items = List.empty<CartItem>() };
    shoppingCarts.add(caller, emptyCart);
  };

  // Messaging System
  public shared ({ caller }) func sendMessage(to : UserId, content : Text) : async MessageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let messageId = nextId();
    let message : Message = {
      id = messageId;
      from = caller;
      to;
      content;
      timestamp = Time.now();
    };
    messages.add(messageId, message);
    messageId;
  };

  public query ({ caller }) func getMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.values().toArray().filter(
      func(message) {
        message.from == caller or message.to == caller
      }
    );
  };

  public query ({ caller }) func getConversation(otherUser : UserId) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    messages.values().toArray().filter(
      func(message) {
        (message.from == caller and message.to == otherUser) or (message.from == otherUser and message.to == caller)
      }
    );
  };

  // Wand Management
  public shared ({ caller }) func createWand(name : Text) : async Wand {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create wands");
    };
    let id = "wand-" # caller.toText();
    let wand : Wand = {
      id;
      name;
      owner = caller;
      createdAt = Time.now();
    };
    wands.add(id, wand);
    wand;
  };

  public query ({ caller }) func getWands() : async [Wand] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get wands");
    };
    wands.values().toArray().filter(
      func(wand) {
        wand.owner == caller
      }
    );
  };

  public query ({ caller }) func getWand(wandId : Text) : async ?Wand {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wands");
    };
    switch (wands.get(wandId)) {
      case (null) { null };
      case (?wand) {
        // Allow access if caller is the owner or a confirmed friend
        if (wand.owner == caller or areFriends(caller, wand.owner)) {
          ?wand
        } else {
          Runtime.trap("Unauthorized: You can only view your own wands or wands of confirmed friends");
        };
      };
    };
  };

  public shared ({ caller }) func updateWand(wandId : Text, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update wands");
    };
    let wand = switch (wands.get(wandId)) {
      case (null) { Runtime.trap("Wand not found") };
      case (?wand) { wand };
    };
    if (wand.owner != caller) {
      Runtime.trap("Unauthorized: You can only update your own wands");
    };
    let updatedWand : Wand = { wand with name };
    wands.add(wandId, updatedWand);
  };

  public shared ({ caller }) func deleteWand(wandId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete wands");
    };
    let wand = switch (wands.get(wandId)) {
      case (null) { Runtime.trap("Wand not found") };
      case (?wand) { wand };
    };
    if (wand.owner != caller) {
      Runtime.trap("Unauthorized: You can only delete your own wands");
    };
    wands.remove(wandId);
  };

  // Friendship System
  public shared ({ caller }) func sendFriendRequest(friendId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send friend requests");
    };
    if (caller == friendId) {
      Runtime.trap("You cannot send a friend request to yourself");
    };
    let key = generateFriendshipKey(caller, friendId);
    let reverseKey = generateFriendshipKey(friendId, caller);

    if (
      friendships.get(key) != null or
      friendships.get(reverseKey) != null
    ) {
      Runtime.trap("Friend request already exists or you are already friends");
    };

    let friendship : Friendship = {
      user = caller;
      friend = friendId;
      confirmed = false;
    };
    friendships.add(key, friendship);
  };

  public shared ({ caller }) func acceptFriendRequest(requesterId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept friend requests");
    };
    let key = generateFriendshipKey(requesterId, caller);
    let friendship = switch (friendships.get(key)) {
      case (null) { Runtime.trap("Friend request not found") };
      case (?friendship) { friendship };
    };
    if (friendship.friend != caller) {
      Runtime.trap("Unauthorized: You can only accept requests sent to you");
    };
    let updatedFriendship : Friendship = { friendship with confirmed = true };
    friendships.add(key, updatedFriendship);
  };

  public shared ({ caller }) func rejectFriendRequest(requesterId : UserId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject friend requests");
    };
    let key = generateFriendshipKey(requesterId, caller);
    switch (friendships.get(key)) {
      case (null) { Runtime.trap("Friend request not found") };
      case (_) {
        friendships.remove(key);
      };
    };
  };

  public query ({ caller }) func getPendingFriendRequests() : async [Friendship] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pending friend requests");
    };
    friendships.values().toArray().filter(
      func(friendship) {
        friendship.friend == caller and not friendship.confirmed
      }
    );
  };

  public query ({ caller }) func getConfirmedFriends() : async [UserId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends");
    };
    let outgoingFriends = friendships.values().toArray().filter(
      func(friendship) {
        friendship.user == caller and friendship.confirmed
      }
    );
    let incomingFriends = friendships.values().toArray().filter(
      func(friendship) {
        friendship.friend == caller and friendship.confirmed
      }
    );
    let friendsArray = outgoingFriends.concat(incomingFriends);
    let friendIds = friendsArray.map(
      func(friendship) {
        if (friendship.user == caller) { friendship.friend } else { friendship.user };
      }
    );
    friendIds;
  };

  public query ({ caller }) func getFriendWands(friendId : UserId) : async [Wand] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friend wands");
    };
    if (not areFriends(caller, friendId)) {
      Runtime.trap("Unauthorized: You are not friends with this user");
    };
    wands.values().toArray().filter(
      func(wand) {
        wand.owner == friendId
      }
    );
  };
};
