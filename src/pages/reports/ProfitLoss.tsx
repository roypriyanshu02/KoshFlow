import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart
} from "lucide-react";

export default function ProfitLoss() {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
              Profit & Loss Statement
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Comprehensive income statement and financial performance analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="gradient" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="gradient" interactive className="border-accent/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Total Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">₹15,45,000</div>
            <p className="text-xs text-muted-foreground">+12.5% vs last period</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Total Expenses</CardTitle>
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-warning">₹9,85,000</div>
            <p className="text-xs text-muted-foreground">-3.2% vs last period</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-profit/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Gross Profit</CardTitle>
              <DollarSign className="h-5 w-5 text-profit" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-profit">₹5,60,000</div>
            <p className="text-xs text-muted-foreground">36.2% margin</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Net Profit</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">₹4,25,000</div>
            <p className="text-xs text-muted-foreground">27.5% net margin</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="gradient" className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-black">Income Statement</CardTitle>
            <CardDescription>Detailed profit and loss breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Revenue Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-accent border-b border-accent/20 pb-2">Revenue</h3>
                <div className="space-y-3">
                  {[
                    { item: "Product Sales", amount: "₹12,50,000", percentage: "80.9%" },
                    { item: "Service Revenue", amount: "₹2,45,000", percentage: "15.9%" },
                    { item: "Other Income", amount: "₹50,000", percentage: "3.2%" }
                  ].map((item) => (
                    <div key={item.item} className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
                      <span className="font-medium">{item.item}</span>
                      <div className="text-right">
                        <p className="font-bold text-accent">{item.amount}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="font-bold text-accent">Total Revenue</span>
                    <span className="font-black text-accent text-lg">₹15,45,000</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-warning border-b border-warning/20 pb-2">Expenses</h3>
                <div className="space-y-3">
                  {[
                    { item: "Cost of Goods Sold", amount: "₹4,85,000", percentage: "49.2%" },
                    { item: "Operating Expenses", amount: "₹2,50,000", percentage: "25.4%" },
                    { item: "Marketing & Sales", amount: "₹1,20,000", percentage: "12.2%" },
                    { item: "Administrative", amount: "₹80,000", percentage: "8.1%" },
                    { item: "Depreciation", amount: "₹35,000", percentage: "3.6%" },
                    { item: "Interest & Taxes", amount: "₹15,000", percentage: "1.5%" }
                  ].map((item) => (
                    <div key={item.item} className="flex items-center justify-between p-3 rounded-lg bg-surface-1">
                      <span className="font-medium">{item.item}</span>
                      <div className="text-right">
                        <p className="font-bold text-warning">{item.amount}</p>
                        <p className="text-xs text-muted-foreground">{item.percentage}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <span className="font-bold text-warning">Total Expenses</span>
                    <span className="font-black text-warning text-lg">₹9,85,000</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-profit/10 to-primary/10 border border-profit/20">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-profit">Net Profit</span>
                  <span className="text-2xl font-black text-profit">₹5,60,000</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Profit Margin: 36.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Analysis */}
        <Card variant="gradient" className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-black">Performance Analysis</CardTitle>
            <CardDescription>Key financial ratios and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Margin Analysis */}
            <div className="space-y-4">
              <h4 className="font-bold text-foreground">Profit Margins</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gross Margin</span>
                  <Badge variant="outline" className="border-accent/50 text-accent">68.6%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Operating Margin</span>
                  <Badge variant="outline" className="border-primary/50 text-primary">45.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Net Margin</span>
                  <Badge variant="outline" className="border-profit/50 text-profit">36.2%</Badge>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="space-y-4">
              <h4 className="font-bold text-foreground">Expense Distribution</h4>
              <div className="space-y-3">
                {[
                  { category: "COGS", percentage: 49.2, color: "bg-warning" },
                  { category: "Operations", percentage: 25.4, color: "bg-primary" },
                  { category: "Marketing", percentage: 12.2, color: "bg-accent" },
                  { category: "Admin", percentage: 8.1, color: "bg-muted" },
                  { category: "Other", percentage: 5.1, color: "bg-secondary" }
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-surface-2 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <PieChart className="h-4 w-4 mr-2" />
                View Detailed Charts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare Periods
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
