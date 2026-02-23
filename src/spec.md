# Specification

## Summary
**Goal:** Create a wand collection tracking app where users can catalog their wands, manage friendships, and view friends' wand collections.

**Planned changes:**
- Add backend Wand type with id, name, owner, and timestamp fields
- Implement backend CRUD operations for wands (create, read, update, delete)
- Add backend Friendship type with friend request system (send, accept, reject)
- Implement backend function to view friends' wand collections
- Create MyWandsPage showing user's wand count and collection with add/edit/delete capabilities
- Create AddWandForm component for naming and adding new wands
- Create FriendsPage displaying friends list, pending requests, and friend search
- Create FriendWandsPage to view a friend's wand collection
- Update navigation to include "My Wands" and "Friends" links
- Add React Query hooks for all wand and friendship operations
- Add routes for /my-wands, /friends, and /friends/:userId/wands
- Apply magical wand-themed visual style with deep wood colors, starlight accents, and elegant serif typography

**User-visible outcome:** Users can log in, add and name their wands, see their wand count, send and accept friend requests, and browse their friends' wand collections in a mystical wand collector-themed interface.
