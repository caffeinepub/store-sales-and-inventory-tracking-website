import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import RecordSalePage from './pages/RecordSalePage';
import SalesHistoryPage from './pages/SalesHistoryPage';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: InventoryPage,
});

const recordSaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/record-sale',
  component: RecordSalePage,
});

const salesHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sales-history',
  component: SalesHistoryPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  inventoryRoute,
  recordSaleRoute,
  salesHistoryRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
