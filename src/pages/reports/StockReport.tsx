import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, Search, Filter, Download } from "lucide-react";

export default function StockReport() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
              Stock Report & Inventory
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Real-time inventory tracking and stock level monitoring
            </p>
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
            <Button variant="gradient" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="gradient" interactive className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Total Products</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">1,247</div>
            <p className="text-xs text-muted-foreground">Active SKUs</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-accent/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Stock Value</CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">₹45,67,890</div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Low Stock</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-warning">23</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-destructive/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Out of Stock</CardTitle>
              <Package className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">8</div>
            <p className="text-xs text-muted-foreground">Items need reorder</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Items Table */}
      <Card variant="gradient" className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-black">Inventory Items</CardTitle>
          <CardDescription>Current stock levels and product information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { sku: "PRD-001", name: "Wireless Headphones", category: "Electronics", stock: 45, reorder: 20, value: "₹67,500", status: "in_stock" },
              { sku: "PRD-002", name: "Office Chair", category: "Furniture", stock: 12, reorder: 15, value: "₹84,000", status: "low_stock" },
              { sku: "PRD-003", name: "Laptop Stand", category: "Accessories", stock: 0, reorder: 10, value: "₹0", status: "out_of_stock" },
              { sku: "PRD-004", name: "Desk Lamp", category: "Lighting", stock: 28, reorder: 25, value: "₹42,000", status: "in_stock" }
            ].map((item) => (
              <div key={item.sku} className="flex items-center justify-between p-4 rounded-xl bg-surface-1 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.sku} • {item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-bold">{item.stock}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-bold">{item.value}</p>
                  </div>
                  <Badge 
                    variant={
                      item.status === 'in_stock' ? 'default' : 
                      item.status === 'low_stock' ? 'secondary' : 'destructive'
                    }
                  >
                    {item.status.replace('_', ' ')}
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
