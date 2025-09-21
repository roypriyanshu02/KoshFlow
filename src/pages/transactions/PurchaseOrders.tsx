import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Save,
  X,
  FileText,
  Calendar,
  User,
  Package
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockPurchaseOrders = [
  {
    id: 1,
    orderNumber: "PO-2024-001",
    vendor: "ABC Suppliers Ltd",
    orderDate: "2024-01-15",
    expectedDate: "2024-01-25",
    status: "Pending",
    totalAmount: 25000,
    items: [
      { name: "Office Chairs", quantity: 10, rate: 2000, amount: 20000 },
      { name: "Desk Lamps", quantity: 5, rate: 1000, amount: 5000 }
    ],
    description: "Office furniture order"
  },
  {
    id: 2,
    orderNumber: "PO-2024-002",
    vendor: "XYZ Electronics",
    orderDate: "2024-01-20",
    expectedDate: "2024-01-30",
    status: "Approved",
    totalAmount: 45000,
    items: [
      { name: "Laptops", quantity: 5, rate: 8000, amount: 40000 },
      { name: "Mouse", quantity: 10, rate: 500, amount: 5000 }
    ],
    description: "IT equipment purchase"
  },
  {
    id: 3,
    orderNumber: "PO-2024-003",
    vendor: "Office Supplies Co",
    orderDate: "2024-01-25",
    expectedDate: "2024-02-05",
    status: "Delivered",
    totalAmount: 15000,
    items: [
      { name: "A4 Paper", quantity: 50, rate: 200, amount: 10000 },
      { name: "Pens", quantity: 100, rate: 50, amount: 5000 }
    ],
    description: "Stationery supplies"
  }
];

const mockVendors = [
  { id: 1, name: "ABC Suppliers Ltd", email: "contact@abcsuppliers.com" },
  { id: 2, name: "XYZ Electronics", email: "sales@xyzelectronics.com" },
  { id: 3, name: "Office Supplies Co", email: "orders@officesupplies.com" },
  { id: 4, name: "Tech Solutions Inc", email: "info@techsolutions.com" }
];

const mockProducts = [
  { id: 1, name: "Office Chairs", rate: 2000 },
  { id: 2, name: "Desk Lamps", rate: 1000 },
  { id: 3, name: "Laptops", rate: 8000 },
  { id: 4, name: "Mouse", rate: 500 },
  { id: 5, name: "A4 Paper", rate: 200 },
  { id: 6, name: "Pens", rate: 50 }
];

export default function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [purchaseOrders, setPurchaseOrders] = useState(mockPurchaseOrders);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const { toast } = useToast();

  const [newOrder, setNewOrder] = useState({
    vendor: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: "",
    description: "",
    items: [{ name: "", quantity: "", rate: "", amount: "" }]
  });

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateItemTotal = (items) => {
    return items.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  };

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: "", quantity: "", rate: "", amount: "" }]
    });
  };

  const handleRemoveItem = (index) => {
    if (newOrder.items.length > 1) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === "quantity" || field === "rate") {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].amount = (quantity * rate).toString();
    }
    
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const handleAddOrder = () => {
    console.log("handleAddOrder called with:", newOrder);
    if (!newOrder.vendor || !newOrder.orderDate || !newOrder.expectedDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Vendor, Order Date, Expected Date)",
        variant: "destructive",
      });
      return;
    }

    // Check for incomplete items and provide specific feedback
    const incompleteItems = newOrder.items.filter(item => 
      item.name || item.quantity || item.rate
    );

    if (incompleteItems.length > 0) {
      const incompleteItem = incompleteItems[0];
      let missingFields = [];
      
      if (!incompleteItem.name) missingFields.push("Product Name");
      if (!incompleteItem.quantity) missingFields.push("Quantity");
      if (!incompleteItem.rate) missingFields.push("Rate");
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }

    const validItems = newOrder.items.filter(item => item.name && item.quantity && item.rate);
    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order. Select a product, enter quantity and rate.",
        variant: "destructive",
      });
      return;
    }

    const order = {
      id: purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(o => o.id)) + 1 : 1,
      orderNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      vendor: newOrder.vendor,
      orderDate: newOrder.orderDate,
      expectedDate: newOrder.expectedDate,
      status: "Pending",
      totalAmount: calculateItemTotal(validItems),
      items: validItems.map(item => ({
        name: item.name,
        quantity: parseInt(item.quantity),
        rate: parseFloat(item.rate),
        amount: parseFloat(item.amount)
      })),
      description: newOrder.description
    };

    console.log("Adding new order:", order);
    setPurchaseOrders([...purchaseOrders, order]);
    setNewOrder({
      vendor: "",
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: "",
      description: "",
      items: [{ name: "", quantity: "", rate: "", amount: "" }]
    });
    setIsAddDialogOpen(false);
    
    console.log("Order added successfully");
    toast({
      title: "Success",
      description: "Purchase order created successfully!",
    });
  };

  const handleEditOrder = (order) => {
    setEditingOrder({
      ...order,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        amount: item.amount.toString()
      }))
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = () => {
    if (!editingOrder.vendor || !editingOrder.orderDate || !editingOrder.expectedDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for incomplete items and provide specific feedback
    const incompleteItems = editingOrder.items.filter(item => 
      item.name || item.quantity || item.rate
    );

    if (incompleteItems.length > 0) {
      const incompleteItem = incompleteItems[0];
      let missingFields = [];
      
      if (!incompleteItem.name) missingFields.push("Product Name");
      if (!incompleteItem.quantity) missingFields.push("Quantity");
      if (!incompleteItem.rate) missingFields.push("Rate");
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }

    const validItems = editingOrder.items.filter(item => item.name && item.quantity && item.rate);
    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order. Select a product, enter quantity and rate.",
        variant: "destructive",
      });
      return;
    }

    setPurchaseOrders(purchaseOrders.map(order => 
      order.id === editingOrder.id 
        ? { 
            ...editingOrder, 
            totalAmount: calculateItemTotal(validItems),
            items: validItems.map(item => ({
              name: item.name,
              quantity: parseInt(item.quantity),
              rate: parseFloat(item.rate),
              amount: parseFloat(item.amount)
            }))
          }
        : order
    ));
    setIsEditDialogOpen(false);
    setEditingOrder(null);
    
    toast({
      title: "Success",
      description: "Purchase order updated successfully!",
    });
  };

  const handleDeleteOrder = (orderId) => {
    setPurchaseOrders(purchaseOrders.filter(order => order.id !== orderId));
    toast({
      title: "Success",
      description: "Purchase order deleted successfully!",
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setPurchaseOrders(purchaseOrders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
    toast({
      title: "Success",
      description: `Order status updated to ${newStatus}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your vendor purchase orders</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Pending", "Approved", "Delivered", "Cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{order.orderNumber}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {order.vendor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {order.items.length} items
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expected: {new Date(order.expectedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                      {order.status === "Pending" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Approved")}>
                          <FileText className="mr-2 h-4 w-4" />
                          Approve Order
                        </DropdownMenuItem>
                      )}
                      {order.status === "Approved" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, "Delivered")}>
                          <Package className="mr-2 h-4 w-4" />
                          Mark Delivered
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No purchase orders found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Purchase Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Purchase Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for your vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Select value={newOrder.vendor} onValueChange={(value) => setNewOrder({...newOrder, vendor: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.name}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={newOrder.orderDate}
                  onChange={(e) => setNewOrder({...newOrder, orderDate: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDate">Expected Date *</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={newOrder.expectedDate}
                  onChange={(e) => setNewOrder({...newOrder, expectedDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter order description"
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                />
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Items *</Label>
                  <p className="text-sm text-muted-foreground">Select a product and enter quantity to add items to your order</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              {newOrder.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label>Product Name *</Label>
                    <select 
                      value={item.name} 
                      onChange={(e) => {
                        const selectedProduct = mockProducts.find(p => p.name === e.target.value);
                        handleItemChange(index, "name", e.target.value);
                        if (selectedProduct) {
                          handleItemChange(index, "rate", selectedProduct.rate.toString());
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${!item.name ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select product</option>
                      {mockProducts.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className={!item.quantity ? "border-red-300" : ""}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Rate (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="Enter rate"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                      className={!item.rate ? "border-red-300" : ""}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="Auto calculated"
                      value={item.amount}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2">
                    {newOrder.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-right">
                <div className="text-lg font-semibold">
                  Total: {formatCurrency(calculateItemTotal(newOrder.items))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleAddOrder}>
                <Save className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Purchase Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
            <DialogDescription>
              Update the purchase order information.
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-vendor">Vendor *</Label>
                  <Select value={editingOrder.vendor} onValueChange={(value) => setEditingOrder({...editingOrder, vendor: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.name}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-orderDate">Order Date *</Label>
                  <Input
                    id="edit-orderDate"
                    type="date"
                    value={editingOrder.orderDate}
                    onChange={(e) => setEditingOrder({...editingOrder, orderDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expectedDate">Expected Date *</Label>
                  <Input
                    id="edit-expectedDate"
                    type="date"
                    value={editingOrder.expectedDate}
                    onChange={(e) => setEditingOrder({...editingOrder, expectedDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    placeholder="Enter order description"
                    value={editingOrder.description}
                    onChange={(e) => setEditingOrder({...editingOrder, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Items</Label>
                </div>
                
                {editingOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label>Product Name *</Label>
                      <select 
                        value={item.name} 
                        onChange={(e) => {
                          const selectedProduct = mockProducts.find(p => p.name === e.target.value);
                          const updatedItems = [...editingOrder.items];
                          updatedItems[index] = { ...updatedItems[index], name: e.target.value };
                          if (selectedProduct) {
                            updatedItems[index].rate = selectedProduct.rate.toString();
                            const quantity = parseFloat(updatedItems[index].quantity) || 0;
                            updatedItems[index].amount = (quantity * selectedProduct.rate).toString();
                          }
                          setEditingOrder({...editingOrder, items: updatedItems});
                        }}
                        className={`w-full px-3 py-2 border rounded-md ${!item.name ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select product</option>
                        {mockProducts.map((product) => (
                          <option key={product.id} value={product.name}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedItems = [...editingOrder.items];
                          updatedItems[index] = { ...updatedItems[index], quantity: e.target.value };
                          const quantity = parseFloat(e.target.value) || 0;
                          const rate = parseFloat(updatedItems[index].rate) || 0;
                          updatedItems[index].amount = (quantity * rate).toString();
                          setEditingOrder({...editingOrder, items: updatedItems});
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => {
                          const updatedItems = [...editingOrder.items];
                          updatedItems[index] = { ...updatedItems[index], rate: e.target.value };
                          const quantity = parseFloat(updatedItems[index].quantity) || 0;
                          const rate = parseFloat(e.target.value) || 0;
                          updatedItems[index].amount = (quantity * rate).toString();
                          setEditingOrder({...editingOrder, items: updatedItems});
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        readOnly
                      />
                    </div>
                    <div className="col-span-2">
                      {editingOrder.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updatedItems = editingOrder.items.filter((_, i) => i !== index);
                            setEditingOrder({...editingOrder, items: updatedItems});
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: {formatCurrency(calculateItemTotal(editingOrder.items))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateOrder}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
