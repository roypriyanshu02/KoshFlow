import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { 
  Plus, 
  Search, 
  Package, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Save,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Products() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    hsnCode: "",
    unit: "Nos",
    salePrice: "",
    purchasePrice: "",
    openingStock: "0",
    minStockLevel: "",
    isService: false
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', { search: searchTerm, type: filterType }],
    queryFn: () => api.getProducts({ 
      search: searchTerm || undefined,
      type: filterType === 'All' ? undefined : (filterType === 'Goods' ? 'product' : 'service')
    }),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: any) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product created successfully" });
      setIsAddDialogOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        description: "",
        hsnCode: "",
        unit: "Nos",
        salePrice: "",
        purchasePrice: "",
        openingStock: "0",
        minStockLevel: "",
        isService: false
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product updated successfully" });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const products = productsData?.products || [];
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || 
                         (filterType === "Goods" && !product.isService) ||
                         (filterType === "Service" && product.isService);
    return matchesSearch && matchesFilter;
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.salePrice || !newProduct.purchasePrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, SKU, Sales Price, Purchase Price)",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...newProduct,
      salePrice: parseFloat(newProduct.salePrice),
      purchasePrice: parseFloat(newProduct.purchasePrice),
      openingStock: parseFloat(newProduct.openingStock),
      minStockLevel: newProduct.minStockLevel ? parseFloat(newProduct.minStockLevel) : null,
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      hsnCode: product.hsnCode || "",
      unit: product.unit,
      salePrice: product.salePrice.toString(),
      purchasePrice: product.purchasePrice.toString(),
      openingStock: product.openingStock.toString(),
      minStockLevel: product.minStockLevel?.toString() || "",
      isService: product.isService
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    updateProductMutation.mutate({
      id: editingProduct.id,
      data: {
        ...newProduct,
        salePrice: parseFloat(newProduct.salePrice),
        purchasePrice: parseFloat(newProduct.purchasePrice),
        minStockLevel: newProduct.minStockLevel ? parseFloat(newProduct.minStockLevel) : null,
      }
    });
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load products. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product or service in your catalog
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Enter SKU"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsnCode">HSN Code</Label>
                <Input
                  id="hsnCode"
                  value={newProduct.hsnCode}
                  onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })}
                  placeholder="Enter HSN code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  placeholder="Enter unit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newProduct.isService ? "Service" : "Goods"}
                  onValueChange={(value) => setNewProduct({ ...newProduct, isService: value === "Service" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goods">Goods</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={newProduct.salePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                  placeholder="Enter sale price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={newProduct.purchasePrice}
                  onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                  placeholder="Enter purchase price"
                />
              </div>
              {!newProduct.isService && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="openingStock">Opening Stock</Label>
                    <Input
                      id="openingStock"
                      type="number"
                      value={newProduct.openingStock}
                      onChange={(e) => setNewProduct({ ...newProduct, openingStock: e.target.value })}
                      placeholder="Enter opening stock"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel">Min Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={newProduct.minStockLevel}
                      onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: e.target.value })}
                      placeholder="Enter minimum stock level"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Service">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: any) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sale Price</span>
                <span className="font-semibold">₹{product.salePrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Purchase Price</span>
                <span className="font-semibold">₹{product.purchasePrice?.toLocaleString()}</span>
              </div>
              {!product.isService && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stock</span>
                  <span className="font-semibold">{product.currentStock || 0}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant={product.isService ? "secondary" : "default"}>
                  {product.isService ? "Service" : "Goods"}
                </Badge>
              </div>
              {product.hsnCode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">HSN Code</span>
                  <span className="text-sm font-mono">{product.hsnCode}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterType !== "All" 
                ? "No products match your current filters." 
                : "Get started by adding your first product to the catalog."
              }
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hsnCode">HSN Code</Label>
              <Input
                id="edit-hsnCode"
                value={newProduct.hsnCode}
                onChange={(e) => setNewProduct({ ...newProduct, hsnCode: e.target.value })}
                placeholder="Enter HSN code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                placeholder="Enter unit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select
                value={newProduct.isService ? "Service" : "Goods"}
                onValueChange={(value) => setNewProduct({ ...newProduct, isService: value === "Service" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-salePrice">Sale Price *</Label>
              <Input
                id="edit-salePrice"
                type="number"
                value={newProduct.salePrice}
                onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                placeholder="Enter sale price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-purchasePrice">Purchase Price *</Label>
              <Input
                id="edit-purchasePrice"
                type="number"
                value={newProduct.purchasePrice}
                onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                placeholder="Enter purchase price"
              />
            </div>
            {!newProduct.isService && (
              <div className="space-y-2">
                <Label htmlFor="edit-minStockLevel">Min Stock Level</Label>
                <Input
                  id="edit-minStockLevel"
                  type="number"
                  value={newProduct.minStockLevel}
                  onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: e.target.value })}
                  placeholder="Enter minimum stock level"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}