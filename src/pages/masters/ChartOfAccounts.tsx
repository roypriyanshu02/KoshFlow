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
  BookOpen, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockAccounts = [
  {
    id: 1,
    code: "1000",
    name: "Assets",
    type: "Asset",
    category: "Current Assets",
    parentAccount: null,
    balance: 150000,
    isActive: true,
    description: "All company assets"
  },
  {
    id: 2,
    code: "1100",
    name: "Cash and Cash Equivalents",
    type: "Asset",
    category: "Current Assets",
    parentAccount: "Assets",
    balance: 50000,
    isActive: true,
    description: "Cash in hand and bank accounts"
  },
  {
    id: 3,
    code: "1200",
    name: "Accounts Receivable",
    type: "Asset",
    category: "Current Assets",
    parentAccount: "Assets",
    balance: 75000,
    isActive: true,
    description: "Money owed by customers"
  },
  {
    id: 4,
    code: "1300",
    name: "Inventory",
    type: "Asset",
    category: "Current Assets",
    parentAccount: "Assets",
    balance: 25000,
    isActive: true,
    description: "Stock and inventory"
  },
  {
    id: 5,
    code: "2000",
    name: "Liabilities",
    type: "Liability",
    category: "Current Liabilities",
    parentAccount: null,
    balance: 80000,
    isActive: true,
    description: "All company liabilities"
  },
  {
    id: 6,
    code: "2100",
    name: "Accounts Payable",
    type: "Liability",
    category: "Current Liabilities",
    parentAccount: "Liabilities",
    balance: 45000,
    isActive: true,
    description: "Money owed to suppliers"
  },
  {
    id: 7,
    code: "2200",
    name: "Accrued Expenses",
    type: "Liability",
    category: "Current Liabilities",
    parentAccount: "Liabilities",
    balance: 35000,
    isActive: true,
    description: "Expenses incurred but not yet paid"
  },
  {
    id: 8,
    code: "3000",
    name: "Equity",
    type: "Equity",
    category: "Owner's Equity",
    parentAccount: null,
    balance: 70000,
    isActive: true,
    description: "Owner's equity and retained earnings"
  },
  {
    id: 9,
    code: "4000",
    name: "Revenue",
    type: "Revenue",
    category: "Operating Revenue",
    parentAccount: null,
    balance: 200000,
    isActive: true,
    description: "Sales and service revenue"
  },
  {
    id: 10,
    code: "5000",
    name: "Expenses",
    type: "Expense",
    category: "Operating Expenses",
    parentAccount: null,
    balance: 120000,
    isActive: true,
    description: "Operating and administrative expenses"
  }
];

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [accounts, setAccounts] = useState(mockAccounts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const { toast } = useToast();

  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    type: "Asset",
    category: "",
    parentAccount: "",
    balance: "",
    description: ""
  });

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "All" || account.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getAccountIcon = (type) => {
    switch (type) {
      case "Asset":
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case "Liability":
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      case "Equity":
        return <DollarSign className="w-6 h-6 text-blue-600" />;
      case "Revenue":
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "Expense":
        return <TrendingDown className="w-6 h-6 text-red-500" />;
      default:
        return <BookOpen className="w-6 h-6 text-primary" />;
    }
  };

  const getBalanceColor = (type, balance) => {
    if (type === "Asset" || type === "Expense") {
      return balance >= 0 ? "text-green-600" : "text-red-600";
    } else if (type === "Liability" || type === "Equity" || type === "Revenue") {
      return balance >= 0 ? "text-green-600" : "text-red-600";
    }
    return "text-foreground";
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(balance);
  };

  const handleAddAccount = () => {
    console.log("handleAddAccount called with:", newAccount);
    if (!newAccount.code || !newAccount.name || !newAccount.type) {
      console.log("Validation failed - missing required fields");
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Code, Name, Type)",
        variant: "destructive",
      });
      return;
    }

    const account = {
      id: Math.max(...accounts.map(a => a.id)) + 1,
      ...newAccount,
      balance: parseFloat(newAccount.balance) || 0,
      isActive: true,
      parentAccount: newAccount.parentAccount || null
    };

    console.log("Adding new account:", account);
    setAccounts([...accounts, account]);
    setNewAccount({
      code: "",
      name: "",
      type: "Asset",
      category: "",
      parentAccount: "",
      balance: "",
      description: ""
    });
    setIsAddDialogOpen(false);
    
    console.log("Account added successfully");
    toast({
      title: "Success",
      description: "Account added successfully!",
    });
  };

  const handleEditAccount = (account) => {
    setEditingAccount({
      ...account,
      balance: account.balance.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAccount = () => {
    if (!editingAccount.code || !editingAccount.name || !editingAccount.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setAccounts(accounts.map(account => 
      account.id === editingAccount.id 
        ? { 
            ...editingAccount, 
            balance: parseFloat(editingAccount.balance) || 0,
            parentAccount: editingAccount.parentAccount || null
          }
        : account
    ));
    setIsEditDialogOpen(false);
    setEditingAccount(null);
    
    toast({
      title: "Success",
      description: "Account updated successfully!",
    });
  };

  const handleDeleteAccount = (accountId) => {
    setAccounts(accounts.filter(account => account.id !== accountId));
    toast({
      title: "Success",
      description: "Account deleted successfully!",
    });
  };

  const toggleAccountStatus = (accountId) => {
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, isActive: !account.isActive }
        : account
    ));
    toast({
      title: "Success",
      description: "Account status updated successfully!",
    });
  };

  const parentAccountOptions = accounts.filter(account => account.parentAccount === null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your financial accounts and categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              console.log("Add Account button clicked");
              setIsAddDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Create a new account in your chart of accounts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Account Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., 1100, 2100"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cash, Accounts Payable"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type *</Label>
                <Select value={newAccount.type} onValueChange={(value) => setNewAccount({...newAccount, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asset">Asset</SelectItem>
                    <SelectItem value="Liability">Liability</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Current Assets, Operating Expenses"
                  value={newAccount.category}
                  onChange={(e) => setNewAccount({...newAccount, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentAccount">Parent Account</Label>
                <Select value={newAccount.parentAccount} onValueChange={(value) => setNewAccount({...newAccount, parentAccount: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent Account</SelectItem>
                    {parentAccountOptions.map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Opening Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="Enter opening balance"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter account description"
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleAddAccount}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Account
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
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Asset", "Liability", "Equity", "Revenue", "Expense"].map((type) => (
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

      {/* Accounts List */}
      <div className="grid gap-4">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{account.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Code: {account.code}</span>
                      <span>Type: {account.type}</span>
                      {account.category && (
                        <span>Category: {account.category}</span>
                      )}
                      {account.parentAccount && (
                        <span>Parent: {account.parentAccount}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Badge 
                      variant={account.isActive ? "default" : "secondary"}
                      className={account.isActive ? "bg-profit text-profit-foreground" : "bg-muted text-muted-foreground"}
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="mt-2">
                      <p className={`text-lg font-bold ${getBalanceColor(account.type, account.balance)}`}>
                        {formatBalance(account.balance)}
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
                      <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Account
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleAccountStatus(account.id)}>
                        {account.isActive ? (
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
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update the account information.
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Account Code *</Label>
                  <Input
                    id="edit-code"
                    placeholder="e.g., 1100, 2100"
                    value={editingAccount.code}
                    onChange={(e) => setEditingAccount({...editingAccount, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Account Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Cash, Accounts Payable"
                    value={editingAccount.name}
                    onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Account Type *</Label>
                <Select value={editingAccount.type} onValueChange={(value) => setEditingAccount({...editingAccount, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asset">Asset</SelectItem>
                    <SelectItem value="Liability">Liability</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  placeholder="e.g., Current Assets, Operating Expenses"
                  value={editingAccount.category}
                  onChange={(e) => setEditingAccount({...editingAccount, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parentAccount">Parent Account</Label>
                <Select value={editingAccount.parentAccount || ""} onValueChange={(value) => setEditingAccount({...editingAccount, parentAccount: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent Account</SelectItem>
                    {parentAccountOptions.filter(acc => acc.id !== editingAccount.id).map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-balance">Opening Balance</Label>
                <Input
                  id="edit-balance"
                  type="number"
                  placeholder="Enter opening balance"
                  value={editingAccount.balance}
                  onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Enter account description"
                  value={editingAccount.description}
                  onChange={(e) => setEditingAccount({...editingAccount, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateAccount}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
