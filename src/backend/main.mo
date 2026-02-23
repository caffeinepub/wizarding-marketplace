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
    // future: more fields
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
  };

  public type PublicProfile = {
    profile : UserProfile;
    activeListings : [Item];
  };

  // Persistent state
  var idStore = 0;
  let items = Map.empty<ItemId, Item>();
  let shoppingCarts = Map.empty<UserId, ShoppingCart>();
  let messages = Map.empty<MessageId, Message>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func nextId() : Nat {
    var currentId = idStore;
    idStore += 1;
    currentId;
  };

  // User Profile Management
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

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
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
    // Public access - anyone can view items
    items.get(itemId);
  };

  public query ({ caller }) func browseItems() : async [Item] {
    // Public access - anyone can browse items
    items.values().toArray();
  };

  public query ({ caller }) func searchItemsByCategory(category : Category) : async [Item] {
    // Public access - anyone can search items
    items.values().toArray().filter(
      func(item) {
        item.category == category
      }
    );
  };

  public query ({ caller }) func searchItemsByPriceRange(minPrice : Price, maxPrice : Price) : async [Item] {
    // Public access - anyone can search items
    if (minPrice > maxPrice) { Runtime.trap("Invalid price range") };
    items.values().toArray().filter(
      func(item) {
        item.price >= minPrice and item.price <= maxPrice
      }
    );
  };

  public query ({ caller }) func searchItemsByCondition(condition : ItemCondition) : async [Item] {
    // Public access - anyone can search items
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
};
