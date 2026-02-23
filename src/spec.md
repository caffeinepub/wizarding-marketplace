# Specification

## Summary
**Goal:** Add user profile pages where sellers can showcase their collections and listings.

**Planned changes:**
- Create a user profile page component displaying seller information (name, email, seller status, member since date)
- Display all active listings from the profile owner in a grid layout on their profile page
- Add backend query function to retrieve user profile data and their active listings by principal ID
- Make seller names clickable on item cards and item detail pages to navigate to seller profiles
- Create React Query hook for fetching user profile data with listings
- Add "View Profile" link in header navigation for authenticated users to access their own profile

**User-visible outcome:** Users can view seller profile pages showing the seller's information and all their active listings. Seller names throughout the app are clickable links to their profiles. Authenticated users can access their own profile from the header navigation.
