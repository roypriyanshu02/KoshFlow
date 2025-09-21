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
  Calculator, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Save,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockTaxes = [
  {
    id: 1,
    name: "GST 5%",
    type: "GST",
    rate: 5,
    description: "Goods and Services Tax 5%",
    isActive: true,
    applicableOn: "Goods"
  },
  {
    id: 2,
    name: "GST 12%",
    type: "GST",
    rate: 12,
    description: "Goods and Services Tax 12%",
    isActive: true,
    applicableOn: "Goods"
  },
  {
    id: 3,
    name: "GST 18%",
    type: "GST",
    rate: 18,
    description: "Goods and Services Tax 18%",
    isActive: true,
    applicableOn: "Services"
  },
  {
    id: 4,
    name: "GST 28%",
    type: "GST",
    rate: 28,
    description: "Goods and Services Tax 28%",
    isActive: true,
    applicableOn: "Goods"
  },
  {
    id: 5,
    name: "CGST 9%",
    type: "CGST",
    rate: 9,
    description: "Central GST 9%",
    isActive: true,
    applicableOn: "Both"
  },
  {
    id: 6,
    name: "SGST 9%",
    type: "SGST",
    rate: 9,
    description: "State GST 9%",
    isActive: true,
    applicableOn: "Both"
  }
];

export default function Taxes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [taxes, setTaxes] = useState(mockTaxes);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const { toast } = useToast();

  const [newTax, setNewTax] = useState({
    name: "",
    type: "GST",
    rate: "",
    description: "",
    isActive: true,
    applicableOn: "Both"
  });

  const filteredTaxes = taxes.filter(tax => {
    const matchesSearch = tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tax.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tax.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || tax.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddTax = () => {
    if (!newTax.name || !newTax.rate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Rate)",
        variant: "destructive",
      });
      return;
    }

    const tax = {
      id: Math.max(...taxes.map(t => t.id)) + 1,
      ...newTax,
      rate: parseFloat(newTax.rate)
    };

    setTaxes([...taxes, tax]);
    setNewTax({
      name: "",
      type: "GST",
      rate: "",
      description: "",
      isActive: true,
      applicableOn: "Both"
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Tax rate added successfully!",
    });
  };

  const handleEditTax = (tax) => {
    setEditingTax({
      ...tax,
      rate: tax.rate.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTax = () => {
    if (!editingTax.name || !editingTax.rate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setTaxes(taxes.map(tax => 
      tax.id === editingTax.id 
        ? { 
            ...editingTax, 
            rate: parseFloat(editingTax.rate)
          }
        : tax
    ));
    setIsEditDialogOpen(false);
    setEditingTax(null);
    
    toast({
      title: "Success",
      description: "Tax rate updated successfully!",
    });
  };

  const handleDeleteTax = (taxId) => {
    setTaxes(taxes.filter(tax => tax.id !== taxId));
    toast({
      title: "Success",
      description: "Tax rate deleted successfully!",
    });
  };

  const toggleTaxStatus = (taxId) => {
    setTaxes(taxes.map(tax => 
      tax.id === taxId 
        ? { ...tax, isActive: !tax.isActive }
        : tax
    ));
    toast({
      title: "Success",
      description: "Tax status updated successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Master</h1>
          <p className="text-muted-foreground">Manage your tax rates and configurations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Tax Rate</DialogTitle>
              <DialogDescription>
                Create a new tax rate for your business.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tax Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., GST 18%, CGST 9%"
                  value={newTax.name}
                  onChange={(e) => setNewTax({...newTax, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tax Type *</Label>
                <Select value={newTax.type} onValueChange={(value) => setNewTax({...newTax, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="CGST">CGST</SelectItem>
                    <SelectItem value="SGST">SGST</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                    <SelectItem value="CESS">CESS</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Tax Rate (%) *</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  placeholder="Enter tax rate percentage"
                  value={newTax.rate}
                  onChange={(e) => setNewTax({...newTax, rate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={newTax.description}
                  onChange={(e) => setNewTax({...newTax, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicableOn">Applicable On</Label>
                <Select value={newTax.applicableOn} onValueChange={(value) => setNewTax({...newTax, applicableOn: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicable category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goods">Goods</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleAddTax}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Tax Rate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tax rates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["All", "GST", "CGST", "SGST", "IGST", "CESS", "Other"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates List */}
      <div className="grid gap-4">
        {filteredTaxes.map((tax) => (
          <Card key={tax.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{tax.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Type: {tax.type}</span>
                      <span>Applicable: {tax.applicableOn}</span>
                      {tax.description && (
                        <span>Description: {tax.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Badge 
                      variant={tax.isActive ? "default" : "secondary"}
                      className={tax.isActive ? "bg-profit text-profit-foreground" : "bg-muted text-muted-foreground"}
                    >
                      {tax.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="mt-2">
                      <p className="text-2xl font-bold text-foreground">{tax.rate}%</p>
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
                      <DropdownMenuItem onClick={() => handleEditTax(tax)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Tax Rate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleTaxStatus(tax.id)}>
                        {tax.isActive ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteTax(tax.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Tax Rate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTaxes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tax rates found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Tax Rate
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Tax Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tax Rate</DialogTitle>
            <DialogDescription>
              Update the tax rate information.
            </DialogDescription>
          </DialogHeader>
          {editingTax && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tax Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., GST 18%, CGST 9%"
                  value={editingTax.name}
                  onChange={(e) => setEditingTax({...editingTax, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Tax Type *</Label>
                <Select value={editingTax.type} onValueChange={(value) => setEditingTax({...editingTax, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="CGST">CGST</SelectItem>
                    <SelectItem value="SGST">SGST</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                    <SelectItem value="CESS">CESS</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Tax Rate (%) *</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  step="0.01"
                  placeholder="Enter tax rate percentage"
                  value={editingTax.rate}
                  onChange={(e) => setEditingTax({...editingTax, rate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Enter description"
                  value={editingTax.description}
                  onChange={(e) => setEditingTax({...editingTax, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-applicableOn">Applicable On</Label>
                <Select value={editingTax.applicableOn} onValueChange={(value) => setEditingTax({...editingTax, applicableOn: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicable category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Goods">Goods</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateTax}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Tax Rate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
