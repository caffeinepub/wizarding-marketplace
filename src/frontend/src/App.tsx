import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import MyWandsPage from './pages/MyWandsPage';
import FriendsPage from './pages/FriendsPage';
import FriendWandsPage from './pages/FriendWandsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MyWandsPage,
});

const myWandsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-wands',
  component: MyWandsPage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/friends',
  component: FriendsPage,
});

const friendWandsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/friends/$friendId/wands',
  component: FriendWandsPage,
});

const accountSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account-settings',
  component: AccountSettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  myWandsRoute,
  friendsRoute,
  friendWandsRoute,
  accountSettingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
