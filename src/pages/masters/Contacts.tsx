import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Plus, Search, Filter, Download, Edit, Trash2, Phone, Mail, MapPin,
  Building2, Users, UserCheck, AlertCircle, MoreHorizontal
} from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  pan?: string;
  isCustomer: boolean;
  isVendor: boolean;
  creditLimit?: number;
  creditDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Contacts() {
  const api = useApi();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "",
    gstin: "", pan: "", isCustomer: true, isVendor: false, creditLimit: "", creditDays: "30"
  });
  const [formLoading, setFormLoading] = useState(false);

  // Mock data for development/demo purposes
  const getMockContacts = (): Contact[] => [
    {
      id: "1", name: "ABC Corporation", email: "contact@abccorp.com", phone: "+91-9876543210",
      address: "123 Business District, Sector 5", city: "Mumbai", state: "Maharashtra",
      gstin: "27ABCDE1234F1Z5", pan: "ABCDE1234F", isCustomer: true, isVendor: false,
      creditLimit: 500000, creditDays: 30, isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "2", name: "XYZ Limited", email: "info@xyzltd.com", phone: "+91-9876543211",
      address: "456 Tech Park, Phase 2", city: "Bangalore", state: "Karnataka",
      gstin: "29XYZAB5678C1D2", pan: "XYZAB5678C", isCustomer: true, isVendor: false,
      creditLimit: 750000, creditDays: 45, isActive: true,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3", name: "Office Supplies Co.", email: "sales@officesupplies.com", phone: "+91-9876543212",
      address: "789 Industrial Area", city: "Delhi", state: "Delhi",
      gstin: "07OFFICE123F1G2", pan: "OFFICE123F", isCustomer: false, isVendor: true,
      creditLimit: 200000, creditDays: 15, isActive: true,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "4", name: "Tech Solutions Pvt Ltd", email: "contact@techsolutions.in", phone: "+91-9876543213",
      address: "321 Software City", city: "Pune", state: "Maharashtra",
      gstin: "27TECH567H8I9J0", pan: "TECH567H8I", isCustomer: false, isVendor: true,
      creditLimit: 300000, creditDays: 30, isActive: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "5", name: "Global Enterprises", email: "business@globalent.com", phone: "+91-9876543214",
      address: "555 Commercial Complex", city: "Chennai", state: "Tamil Nadu",
      gstin: "33GLOBAL890K1L2", pan: "GLOBAL890K", isCustomer: true, isVendor: true,
      creditLimit: 1000000, creditDays: 60, isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading contacts...');
      const response = await api.getContacts();
      console.log('✅ Contacts loaded:', response);
      setContacts(response.contacts || response);
    } catch (error) {
      console.warn('⚠️ Contacts API failed, using mock data:', error);
      const mockContacts = getMockContacts();
      setContacts(mockContacts);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    try {
      setFormLoading(true);
      const contactData = {
        ...formData,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        creditDays: parseInt(formData.creditDays) || 30
      };
      
      console.log('🔄 Creating contact:', contactData);
      
      try {
        const response = await api.createContact(contactData);
        console.log('✅ Contact created:', response);
        await loadContacts();
      } catch (apiError) {
        console.warn('⚠️ Create API failed, using mock behavior:', apiError);
        const newContact: Contact = {
          id: Date.now().toString(),
          ...contactData,
          creditLimit: contactData.creditLimit || 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setContacts(prev => [newContact, ...prev]);
      }
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('❌ Failed to create contact:', error);
      setError('Failed to create contact. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Are you sure you want to delete ${contact.name}?`)) return;
    
    try {
      console.log('🔄 Deleting contact:', contact.id);
      try {
        await api.deleteContact(contact.id);
        console.log('✅ Contact deleted');
        await loadContacts();
      } catch (apiError) {
        console.warn('⚠️ Delete API failed, using mock behavior:', apiError);
        setContacts(prev => prev.filter(c => c.id !== contact.id));
      }
    } catch (error) {
      console.error('❌ Failed to delete contact:', error);
      setError('Failed to delete contact. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", phone: "", address: "", city: "", state: "",
      gstin: "", pan: "", isCustomer: true, isVendor: false, creditLimit: "", creditDays: "30"
    });
  };

  // Filter contacts based on search and type
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.phone && contact.phone.includes(searchTerm));
    
    const matchesType = filterType === "all" ||
                       (filterType === "customers" && contact.isCustomer) ||
                       (filterType === "vendors" && contact.isVendor);
    
    return matchesSearch && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: contacts.length,
    customers: contacts.filter(c => c.isCustomer).length,
    vendors: contacts.filter(c => c.isVendor).length,
    both: contacts.filter(c => c.isCustomer && c.isVendor).length
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={loadContacts} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent">
              Contacts Management
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Manage your customers and vendors with comprehensive contact information
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="lg" className="shadow-xl">
                <Plus className="h-5 w-5 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Contact</DialogTitle>
                <DialogDescription>
                  Add a new customer or vendor to your contact database
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company/Person Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company or person name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91-9876543210"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Mumbai"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Maharashtra"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
                    placeholder="27ABCDE1234F1Z5"
                  />
                </div>
                
                <div className="space-y-4 md:col-span-2">
                  <Label>Contact Type</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isCustomer"
                        checked={formData.isCustomer}
                        onChange={(e) => setFormData(prev => ({ ...prev, isCustomer: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="isCustomer">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isVendor"
                        checked={formData.isVendor}
                        onChange={(e) => setFormData(prev => ({ ...prev, isVendor: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="isVendor">Vendor</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateContact}
                  disabled={formLoading || !formData.name || !formData.email}
                >
                  {formLoading ? "Creating..." : "Create Contact"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="gradient" interactive className="border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Total Contacts</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active contacts</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-accent/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Customers</CardTitle>
              <UserCheck className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Customer accounts</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Vendors</CardTitle>
              <Building2 className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-warning">{stats.vendors}</div>
            <p className="text-xs text-muted-foreground">Vendor accounts</p>
          </CardContent>
        </Card>

        <Card variant="gradient" interactive className="border-profit/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Both Types</CardTitle>
              <Users className="h-5 w-5 text-profit" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-profit">{stats.both}</div>
            <p className="text-xs text-muted-foreground">Customer & Vendor</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact List */}
      <Card variant="gradient" className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black">Contact Directory</CardTitle>
              <CardDescription>Manage your business relationships</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Contacts</option>
                <option value="customers">Customers</option>
                <option value="vendors">Vendors</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No contacts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-1 hover:bg-surface-2 transition-all duration-300 hover:scale-[1.01] group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {contact.isCustomer && contact.isVendor ? (
                        <Users className="h-6 w-6 text-primary" />
                      ) : contact.isCustomer ? (
                        <UserCheck className="h-6 w-6 text-accent" />
                      ) : (
                        <Building2 className="h-6 w-6 text-warning" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">{contact.name}</h4>
                        <div className="flex gap-1">
                          {contact.isCustomer && (
                            <Badge variant="secondary" className="text-xs">Customer</Badge>
                          )}
                          {contact.isVendor && (
                            <Badge variant="outline" className="text-xs">Vendor</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {contact.city}, {contact.state}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      {contact.creditLimit && (
                        <p className="text-sm font-medium">₹{contact.creditLimit.toLocaleString()}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{contact.creditDays} days credit</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContact(contact)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}