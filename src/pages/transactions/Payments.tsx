import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function Payments() {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
              Payments Center
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Track all incoming and outgoing payments with real-time updates
            </p>
          </div>
          <Button variant="gradient" size="lg" className="shadow-xl">
            <Plus className="h-5 w-5 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="gradient" interactive className="border-accent/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Received Today</CardTitle>
              <ArrowUpRight className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">₹1,25,000</div>
            <p className="text-xs text-muted-foreground">+15.2% from yesterday</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Paid Today</CardTitle>
              <ArrowDownRight className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-warning">₹85,500</div>
            <p className="text-xs text-muted-foreground">12 transactions</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Pending</CardTitle>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">₹45,200</div>
            <p className="text-xs text-muted-foreground">8 pending payments</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-profit/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Net Flow</CardTitle>
              <TrendingUp className="h-5 w-5 text-profit" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-profit">₹39,500</div>
            <p className="text-xs text-muted-foreground">Positive cash flow</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="gradient" className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-black">Payment Methods</CardTitle>
            <CardDescription>Distribution of payment channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { method: "Bank Transfer", amount: "₹2,15,000", percentage: "65%", color: "bg-primary" },
              { method: "UPI/Digital", amount: "₹85,000", percentage: "25%", color: "bg-accent" },
              { method: "Cash", amount: "₹25,000", percentage: "8%", color: "bg-warning" },
              { method: "Cheque", amount: "₹8,000", percentage: "2%", color: "bg-muted" }
            ].map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${method.color}`}></div>
                  <span className="font-medium">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{method.amount}</p>
                  <p className="text-xs text-muted-foreground">{method.percentage}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card variant="gradient" className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black">Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "PAY-001", type: "received", description: "Invoice INV-2024-001 payment", amount: "₹25,000", method: "Bank Transfer", time: "2 hours ago", status: "completed" },
                { id: "PAY-002", type: "sent", description: "Vendor payment - Office Supplies", amount: "₹15,240", method: "UPI", time: "4 hours ago", status: "completed" },
                { id: "PAY-003", type: "received", description: "Customer payment via UPI", amount: "₹8,500", method: "UPI", time: "6 hours ago", status: "completed" },
                { id: "PAY-004", type: "sent", description: "Utility bill payment", amount: "₹3,200", method: "Bank Transfer", time: "1 day ago", status: "pending" }
              ].map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-1 hover:bg-surface-2 transition-all duration-300 hover:scale-[1.01] group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                      payment.type === 'received' ? 'bg-accent/10' : 'bg-warning/10'
                    }`}>
                      {payment.type === 'received' ? (
                        <ArrowUpRight className={`h-6 w-6 ${payment.type === 'received' ? 'text-accent' : 'text-warning'}`} />
                      ) : (
                        <ArrowDownRight className={`h-6 w-6 ${payment.type === 'received' ? 'text-accent' : 'text-warning'}`} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{payment.id}</h4>
                      <p className="text-sm text-muted-foreground">{payment.description}</p>
                      <p className="text-xs text-muted-foreground">{payment.method} • {payment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${payment.type === 'received' ? 'text-accent' : 'text-warning'}`}>
                        {payment.type === 'received' ? '+' : '-'}{payment.amount}
                      </p>
                    </div>
                    <Badge 
                      variant={payment.status === 'completed' ? 'default' : 'outline'}
                      className="capitalize"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
