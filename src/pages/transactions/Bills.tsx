import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign,
  Search,
  Filter,
  Download
} from "lucide-react";

export default function Bills() {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
              Bills Management
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Track and manage all your vendor bills and payables
            </p>
          </div>
          <Button variant="gradient" size="lg" className="shadow-xl">
            <Plus className="h-5 w-5 mr-2" />
            Create Bill
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="gradient" interactive className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Total Bills</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Pending Bills</CardTitle>
              <Calendar className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-warning">23</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-destructive/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Overdue Bills</CardTitle>
              <Calendar className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">8</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-accent/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Total Amount</CardTitle>
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">₹2,45,670</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card variant="gradient" className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">Recent Bills</CardTitle>
              <CardDescription>Manage your vendor bills and track payments</CardDescription>
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
            {/* Sample Bill Entries */}
            {[
              { id: "BILL-001", vendor: "Office Supplies Co.", amount: "₹15,240", date: "2024-01-15", status: "pending", dueDate: "2024-02-15" },
              { id: "BILL-002", vendor: "Tech Solutions Ltd.", amount: "₹45,000", date: "2024-01-12", status: "approved", dueDate: "2024-02-12" },
              { id: "BILL-003", vendor: "Utility Services", amount: "₹8,750", date: "2024-01-10", status: "overdue", dueDate: "2024-01-25" },
              { id: "BILL-004", vendor: "Marketing Agency", amount: "₹32,500", date: "2024-01-08", status: "paid", dueDate: "2024-02-08" }
            ].map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-1 hover:bg-surface-2 transition-all duration-300 hover:scale-[1.01] group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{bill.id}</h4>
                    <p className="text-sm text-muted-foreground">{bill.vendor}</p>
                    <p className="text-xs text-muted-foreground">Due: {bill.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-foreground">{bill.amount}</p>
                    <p className="text-xs text-muted-foreground">{bill.date}</p>
                  </div>
                  <Badge 
                    variant={
                      bill.status === 'paid' ? 'default' : 
                      bill.status === 'approved' ? 'secondary' :
                      bill.status === 'overdue' ? 'destructive' : 'outline'
                    }
                    className="capitalize"
                  >
                    {bill.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
