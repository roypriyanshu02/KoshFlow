import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contacts = lazy(() => import("./pages/masters/Contacts"));
const Products = lazy(() => import("./pages/masters/Products"));
const Taxes = lazy(() => import("./pages/masters/Taxes"));
const ChartOfAccounts = lazy(() => import("./pages/masters/ChartOfAccounts"));
const BalanceSheet = lazy(() => import("./pages/reports/BalanceSheet"));
const PurchaseOrders = lazy(() => import("./pages/transactions/PurchaseOrders"));
const SalesOrders = lazy(() => import("./pages/transactions/SalesOrders"));
const Invoices = lazy(() => import("./pages/transactions/Invoices"));
const Bills = lazy(() => import("./pages/transactions/Bills"));
const Payments = lazy(() => import("./pages/transactions/Payments"));
const ProfitLoss = lazy(() => import("./pages/reports/ProfitLoss"));
const StockReport = lazy(() => import("./pages/reports/StockReport"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CardShowcase = lazy(() => import("./components/CardShowcase"));

// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Redirect /login and /register to landing page */}
            <Route path="/login" element={<LandingPage />} />
            <Route path="/register" element={<LandingPage />} />
            <Route path="/showcase" element={<CardShowcase />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/masters/contacts" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><Contacts /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/masters/products" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><Products /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/masters/taxes" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><Taxes /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/masters/accounts" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><ChartOfAccounts /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/balance-sheet" 
              element={
                <ProtectedRoute requiredRole="VIEWER">
                  <MainLayout><BalanceSheet /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/purchase-orders" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><PurchaseOrders /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/sales-orders" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><SalesOrders /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/invoices" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><Invoices /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/bills" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><Bills /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions/payments" 
              element={
                <ProtectedRoute requiredRole="ACCOUNTANT">
                  <MainLayout><Payments /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/profit-loss" 
              element={
                <ProtectedRoute requiredRole="VIEWER">
                  <MainLayout><ProfitLoss /></MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/stock" 
              element={
                <ProtectedRoute requiredRole="VIEWER">
                  <MainLayout><StockReport /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
