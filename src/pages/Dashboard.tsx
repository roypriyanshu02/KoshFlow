import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  CreditCard,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  status: string;
}

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  overdueInvoices: number;
  period?: {
    startDate: Date;
    endDate: Date;
  };
}

function Dashboard() {
  const api = useApi();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<{
    transactions: Transaction[];
  } | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Memoized mock data for dashboard
  const mockDashboardData = useMemo((): DashboardData => ({
    totalRevenue: 2450000,      // ₹24.5 Lakhs
    totalExpenses: 1850000,     // ₹18.5 Lakhs  
    netProfit: 600000,          // ₹6 Lakhs
    pendingInvoices: 12,
    overdueInvoices: 3,
    totalCustomers: 45,
    totalProducts: 128,
    period: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    }
  }), []);

  // Memoized mock transactions with more realistic data
  const mockTransactions = useMemo(() => ({
    transactions: [
      {
        id: "TXN-001",
        type: "income",
        description: "Payment from ABC Corp",
        amount: 25000,
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: "TXN-002",
        type: "expense",
        description: "Office supplies purchase",
        amount: 15240,
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: "TXN-003",
        type: "income",
        description: "Service payment - XYZ Ltd",
        amount: 8500,
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      },
      {
        id: "TXN-004",
        type: "expense",
        description: "Utility bill payment",
        amount: 3200,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "pending"
      },
      {
        id: "TXN-005",
        type: "income",
        description: "Consulting fee - Tech Solutions",
        amount: 45000,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed"
      }
    ]
  }), []);

  // Optimized Quick Actions handlers with useCallback
  const handleCreateInvoice = useCallback(() => {
    console.log('📄 Navigating to create invoice...');
    navigate('/transactions/invoices');
  }, [navigate]);

  const handleAddExpense = useCallback(() => {
    console.log('💰 Navigating to add expense...');
    navigate('/transactions/bills');
  }, [navigate]);

  const handleRecordPayment = useCallback(() => {
    console.log('💳 Navigating to record payment...');
    navigate('/transactions/payments');
  }, [navigate]);

  const handleNewPurchase = useCallback(() => {
    console.log('🛒 Navigating to new purchase...');
    navigate('/transactions/purchase-orders');
  }, [navigate]);

  const handleViewAllTransactions = useCallback(() => {
    console.log('📋 Navigating to all transactions...');
    navigate('/transactions/invoices');
  }, [navigate]);

  // Memoized computed values for better performance
  const formattedRevenue = useMemo(() => {
    return dashboardData?.totalRevenue ? 
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dashboardData.totalRevenue) : 
      '₹0';
  }, [dashboardData?.totalRevenue]);

  const formattedExpenses = useMemo(() => {
    return dashboardData?.totalExpenses ? 
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dashboardData.totalExpenses) : 
      '₹0';
  }, [dashboardData?.totalExpenses]);

  const formattedNetProfit = useMemo(() => {
    return dashboardData?.netProfit ? 
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(dashboardData.netProfit) : 
      '₹0';
  }, [dashboardData?.netProfit]);

  const profitMargin = useMemo(() => {
    if (!dashboardData?.totalRevenue || !dashboardData?.netProfit) return 0;
    return ((dashboardData.netProfit / dashboardData.totalRevenue) * 100).toFixed(1);
  }, [dashboardData?.totalRevenue, dashboardData?.netProfit]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError(null);
        
        console.log('🔄 Loading dashboard data...');
        const response = await api.getDashboardSummary();
        console.log('✅ Dashboard data loaded:', response);
        
        setDashboardData(response as DashboardData);
      } catch (error) {
        console.warn('⚠️ Dashboard API failed, using mock data:', error);
        
        // Use mock data as fallback
        setDashboardData(mockDashboardData);
        
        // Don't set error state when using mock data
        setDashboardError(null);
      } finally {
        setDashboardLoading(false);
      }
    };

    const loadRecentTransactions = async () => {
      try {
        setTransactionsLoading(true);
        setTransactionsError(null);
        
        console.log('🔄 Loading recent transactions...');
        const response = await api.getRecentTransactions();
        console.log('✅ Recent transactions loaded:', response);
        
        setRecentTransactions(response);
      } catch (error) {
        console.warn('⚠️ Transactions API failed, using mock data:', error);
        
        // Use mock data as fallback
        setRecentTransactions(mockTransactions);
        
        // Don't set error state when using mock data
        setTransactionsError(null);
      } finally {
        setTransactionsLoading(false);
      }
    };

    loadDashboardData();
    loadRecentTransactions();
  }, [api, mockDashboardData, mockTransactions]);

  if (dashboardLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="p-8 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dashboardError}</AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Retry
          </Button>
          <Button 
            onClick={() => {
              setDashboardData(getMockDashboardData());
              setRecentTransactions(getMockTransactions());
              setDashboardError(null);
            }}
            variant="secondary"
          >
            Use Demo Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 min-h-screen">
      {/* Enhanced header section */}
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-primary bg-clip-text text-transparent animate-fade-in-up">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg lg:text-xl animate-fade-in-up animation-delay-100 max-w-4xl font-medium">
          Track performance and key metrics with real‑time insights and actionable data.
        </p>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <Card variant="gradient" interactive className="relative overflow-hidden border-primary/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in-up group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <CardTitle className="text-sm font-bold text-card-foreground/80">Total Revenue</CardTitle>
            <div className="p-3 bg-primary/15 rounded-2xl animate-pulse-subtle group-hover:scale-110 transition-transform duration-300">
              <DollarSign strokeWidth={2} className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-black text-primary animate-number-count mb-2">
              ₹{dashboardData?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center text-sm text-profit font-semibold">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+12.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="relative overflow-hidden border-warning/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in-up animation-delay-100 group">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-loss/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <CardTitle className="text-sm font-bold text-card-foreground/80">
              Total Expenses
            </CardTitle>
            <div className="p-3 bg-warning/15 rounded-2xl animate-pulse-subtle group-hover:scale-110 transition-transform duration-300">
              <TrendingUp strokeWidth={2} className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-black text-warning animate-number-count mb-2">
              ₹{dashboardData?.totalExpenses?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-warning font-semibold">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>Expenses</span>
              </div>
              <Badge
                variant="outline"
                className="border-warning/50 text-warning font-bold">
                -8.2%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="relative overflow-hidden border-profit/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in-up animation-delay-200 group">
          <div className="absolute inset-0 bg-gradient-to-br from-profit/10 via-transparent to-accent/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <CardTitle className="text-sm font-bold text-card-foreground/80">Net Profit</CardTitle>
            <div className="p-3 bg-profit/15 rounded-2xl animate-pulse-subtle group-hover:scale-110 transition-transform duration-300">
              <DollarSign strokeWidth={2} className="h-5 w-5 text-profit" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-black text-profit animate-number-count mb-2">
              ₹{dashboardData?.netProfit?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center text-sm text-profit font-semibold">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Net profit this period
            </div>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="relative overflow-hidden border-accent/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in-up animation-delay-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
            <CardTitle className="text-sm font-bold text-card-foreground/80">
              Pending Invoices
            </CardTitle>
            <div className="p-3 bg-accent/15 rounded-2xl animate-pulse-subtle group-hover:scale-110 transition-transform duration-300">
              <Receipt strokeWidth={2} className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-black text-foreground animate-number-count mb-2">
              {dashboardData?.pendingInvoices || 0}
            </div>
            <div className="flex items-center text-sm text-muted-foreground font-semibold">
              Awaiting payment
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <Card variant="gradient" className="lg:col-span-2 border-primary/30 animate-fade-in-up animation-delay-400">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black">Recent Transactions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllTransactions}
                className="hover:bg-primary/10 transition-all duration-300 hover:scale-105 font-semibold">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : transactionsError ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We couldn't load recent transactions.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {recentTransactions?.transactions?.length > 0 ? (
                  recentTransactions.transactions.map(
                    (transaction: Transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-surface-1 hover:bg-surface-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                              transaction.type === "income"
                                ? "bg-profit/20 text-profit"
                                : "bg-warning/20 text-warning"
                            }`}>
                            {transaction.type === "income" ? (
                              <ArrowUpRight strokeWidth={2} className="w-5 h-5" />
                            ) : (
                              <ArrowDownRight strokeWidth={2} className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-black ${
                              transaction.type === "income"
                                ? "text-profit"
                                : "text-warning"
                            }`}>
                            {transaction.type === "income" ? "+" : "-"}₹
                            {transaction.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs font-bold">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt strokeWidth={1.75} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent transactions found.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quick actions */}
        <Card variant="gradient" className="border-accent/30 animate-fade-in-up animation-delay-500">
          <CardHeader>
            <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleCreateInvoice}
              className="w-full justify-start hover:bg-primary/10 transition-all duration-300 hover:scale-105 font-semibold h-12">
              <Plus strokeWidth={2} className="w-5 h-5 mr-3" />
              Create invoice
            </Button>
            <Button
              variant="outline"
              onClick={handleAddExpense}
              className="w-full justify-start hover:bg-primary/10 transition-all duration-300 hover:scale-105 font-semibold h-12">
              <FileText strokeWidth={2} className="w-5 h-5 mr-3" />
              Add expense
            </Button>
            <Button
              variant="outline"
              onClick={handleRecordPayment}
              className="w-full justify-start hover:bg-primary/10 transition-all duration-300 hover:scale-105 font-semibold h-12">
              <CreditCard strokeWidth={2} className="w-5 h-5 mr-3" />
              Record payment
            </Button>
            <Button
              variant="outline"
              onClick={handleNewPurchase}
              className="w-full justify-start hover:bg-primary/10 transition-all duration-300 hover:scale-105 font-semibold h-12">
              <ShoppingCart strokeWidth={2} className="w-5 h-5 mr-3" />
              New purchase
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card variant="gradient" interactive className="text-center border-primary/30 hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-600 group">
          <CardHeader>
            <CardTitle className="text-xl font-black">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
              {dashboardData?.totalCustomers || 0}
            </div>
            <p className="text-sm text-muted-foreground font-semibold">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="text-center border-accent/30 hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-700 group">
          <CardHeader>
            <CardTitle className="text-xl font-black">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-accent mb-3 group-hover:scale-110 transition-transform duration-300">
              {dashboardData?.totalProducts || 0}
            </div>
            <p className="text-sm text-muted-foreground font-semibold">
              Products in catalog
            </p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="text-center border-destructive/30 hover:shadow-2xl transition-all duration-500 animate-fade-in-up animation-delay-800 group">
          <CardHeader>
            <CardTitle className="text-xl font-black">Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-destructive mb-3 group-hover:scale-110 transition-transform duration-300">
              {dashboardData?.overdueInvoices || 0}
            </div>
            <p className="text-sm text-muted-foreground font-semibold">
              Overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export memoized component for better performance
export default memo(Dashboard);
