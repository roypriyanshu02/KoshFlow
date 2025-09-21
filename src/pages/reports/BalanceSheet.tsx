import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";

const balanceSheetData = {
  assets: {
    current: [
      { name: "Cash", amount: 125000, change: 8.5 },
      { name: "Bank Balance", amount: 89000, change: -2.3 },
      { name: "Accounts Receivable (Debtors)", amount: 156000, change: 15.2 },
      { name: "Inventory", amount: 234000, change: 6.8 }
    ],
    fixed: [
      { name: "Furniture & Fixtures", amount: 450000, change: 0 },
      { name: "Office Equipment", amount: 125000, change: 0 },
      { name: "Vehicles", amount: 380000, change: 0 }
    ]
  },
  liabilities: {
    current: [
      { name: "Accounts Payable (Creditors)", amount: 234000, change: 12.4 },
      { name: "GST Payable", amount: 45000, change: 5.8 },
      { name: "Short-term Loans", amount: 150000, change: -10.2 }
    ],
    longTerm: [
      { name: "Long-term Loans", amount: 500000, change: -5.0 }
    ]
  },
  equity: [
    { name: "Owner's Capital", amount: 800000, change: 0 },
    { name: "Retained Earnings", amount: 175000, change: 25.6 }
  ]
};

export default function BalanceSheet() {
  const totalAssets = [...balanceSheetData.assets.current, ...balanceSheetData.assets.fixed]
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalLiabilities = [...balanceSheetData.liabilities.current, ...balanceSheetData.liabilities.longTerm]
    .reduce((sum, item) => sum + item.amount, 0);
  
  const totalEquity = balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const BalanceItem = ({ item }: { item: { name: string; amount: number; change: number } }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-foreground">{item.name}</span>
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
        {item.change !== 0 && (
          <Badge 
            variant="outline" 
            className={`text-xs ${item.change > 0 ? 'text-profit border-profit/20' : 'text-loss border-loss/20'}`}
          >
            {item.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(item.change)}%
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Balance Sheet</h1>
          <p className="text-muted-foreground">As of {new Date().toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Change Date
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Balance Sheet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-primary">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalAssets)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-warning">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalLiabilities)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-profit/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-profit">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalEquity)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Balance Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Assets */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-primary">Current Assets</h3>
                <div className="space-y-1">
                  {balanceSheetData.assets.current.map((item, index) => (
                    <BalanceItem key={index} item={item} />
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-primary/20 font-semibold">
                  <span>Total Current Assets</span>
                  <span>{formatCurrency(balanceSheetData.assets.current.reduce((sum, item) => sum + item.amount, 0))}</span>
                </div>
              </div>

              {/* Fixed Assets */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-primary">Fixed Assets</h3>
                <div className="space-y-1">
                  {balanceSheetData.assets.fixed.map((item, index) => (
                    <BalanceItem key={index} item={item} />
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-primary/20 font-semibold">
                  <span>Total Fixed Assets</span>
                  <span>{formatCurrency(balanceSheetData.assets.fixed.reduce((sum, item) => sum + item.amount, 0))}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t-2 border-primary text-lg font-bold text-primary">
                <span>TOTAL ASSETS</span>
                <span>{formatCurrency(totalAssets)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Liabilities & Equity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Liabilities */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-warning">Current Liabilities</h3>
                <div className="space-y-1">
                  {balanceSheetData.liabilities.current.map((item, index) => (
                    <BalanceItem key={index} item={item} />
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-warning/20 font-semibold">
                  <span>Total Current Liabilities</span>
                  <span>{formatCurrency(balanceSheetData.liabilities.current.reduce((sum, item) => sum + item.amount, 0))}</span>
                </div>
              </div>

              {/* Long-term Liabilities */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-warning">Long-term Liabilities</h3>
                <div className="space-y-1">
                  {balanceSheetData.liabilities.longTerm.map((item, index) => (
                    <BalanceItem key={index} item={item} />
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-warning/20 font-semibold">
                  <span>Total Long-term Liabilities</span>
                  <span>{formatCurrency(balanceSheetData.liabilities.longTerm.reduce((sum, item) => sum + item.amount, 0))}</span>
                </div>
              </div>

              {/* Equity */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-profit">Equity</h3>
                <div className="space-y-1">
                  {balanceSheetData.equity.map((item, index) => (
                    <BalanceItem key={index} item={item} />
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-profit/20 font-semibold">
                  <span>Total Equity</span>
                  <span>{formatCurrency(totalEquity)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t-2 border-primary text-lg font-bold text-primary">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Balance Verification */}
      <Card className={`border-2 ${totalAssets === (totalLiabilities + totalEquity) ? 'border-profit bg-profit/5' : 'border-loss bg-loss/5'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Balance Verification</h3>
              <p className="text-sm text-muted-foreground">
                {totalAssets === (totalLiabilities + totalEquity) 
                  ? "✓ Balance sheet is balanced - Assets equal Liabilities + Equity"
                  : "⚠ Balance sheet is not balanced - Please check your entries"
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Difference</p>
              <p className={`text-2xl font-bold ${totalAssets === (totalLiabilities + totalEquity) ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(Math.abs(totalAssets - (totalLiabilities + totalEquity)))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}