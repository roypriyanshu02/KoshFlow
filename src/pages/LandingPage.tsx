import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useValidation, validators } from "@/lib/validation";
import {
  FormField,
  EmailField,
  PhoneField,
  PasswordField,
  GSTINField,
  PANField,
} from "@/components/forms/FormField";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  useNotifications,
  NotificationContainer,
} from "@/hooks/useNotifications";
import {
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3,
  FileText,
  Shield,
  Zap,
  Globe,
  Heart,
  Coffee,
  Droplets,
  Star,
  TrendingUp,
  Calculator,
  PieChart,
  Receipt,
  Building2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Menu,
  X,
  Phone,
  MessageCircle,
  CreditCard,
  PiggyBank,
  Banknote,
  Percent,
  Clock,
  CheckCircle2,
  Fingerprint,
  Smartphone,
  Headphones,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useNotifications();
  const {
    login,
    register,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const { validateForm, errors, clearErrors } = useValidation();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    twoFactorCode: "",
  });

  const [signupForm, setSignupForm] = useState({
    // Admin data
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    // Company data
    companyName: "",
    companyEmail: "",
    phone: "",
    gstin: "",
    pan: "",
  });

  const [show2FA, setShow2FA] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSignupTab, setActiveSignupTab] = useState("admin");

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Auto-open modals based on URL path
  useEffect(() => {
    if (location.pathname === '/login') {
      setIsLoginOpen(true);
      // Replace URL with home to avoid confusion
      window.history.replaceState({}, '', '/');
    } else if (location.pathname === '/register') {
      setIsSignupOpen(true);
      // Replace URL with home to avoid confusion
      window.history.replaceState({}, '', '/');
    }
  }, [location.pathname]);

  // Authentication functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsSubmitting(true);

    try {
      const response = await login(
        loginForm.email,
        loginForm.password,
        loginForm.twoFactorCode
      );

      if (response.requires2FA) {
        setShow2FA(true);
        success("2FA Required", "Please enter your 2FA code to continue");
        return;
      }

      success("Login Successful!", "Welcome back to कोषFLOW!");
      setIsLoginOpen(false);
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please check your credentials and try again.";
      showError("Login Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsSubmitting(true);

    try {
      // Validation with tab switching for better UX
      const validateAndSwitchTab = (condition: boolean, message: string, tab: string) => {
        if (!condition) {
          showError("Validation Error", message);
          setActiveSignupTab(tab);
          setIsSubmitting(false);
          return false;
        }
        return true;
      };

      // Company validation (switch to company tab if error)
      if (!validateAndSwitchTab(
        signupForm.companyName.trim() !== "",
        "Company name is required",
        "company"
      )) return;

      if (!validateAndSwitchTab(
        signupForm.companyEmail.trim() !== "",
        "Company email is required",
        "company"
      )) return;

      // Validate company email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!validateAndSwitchTab(
        emailRegex.test(signupForm.companyEmail),
        "Please enter a valid company email address",
        "company"
      )) return;

      // Admin validation (switch to admin tab if error)
      if (!validateAndSwitchTab(
        signupForm.adminName.trim() !== "",
        "Admin name is required",
        "admin"
      )) return;

      if (!validateAndSwitchTab(
        signupForm.adminEmail.trim() !== "",
        "Admin email is required",
        "admin"
      )) return;

      // Validate admin email format
      if (!validateAndSwitchTab(
        emailRegex.test(signupForm.adminEmail),
        "Please enter a valid admin email address",
        "admin"
      )) return;

      if (!validateAndSwitchTab(
        signupForm.adminPassword && signupForm.adminPassword.length >= 4,
        "Password must be at least 4 characters",
        "admin"
      )) return;

      if (!validateAndSwitchTab(
        signupForm.adminPassword === signupForm.confirmPassword,
        "Passwords do not match",
        "admin"
      )) return;

      const companyData = {
        name: signupForm.companyName,
        email: signupForm.companyEmail,
        phone: signupForm.phone,
        gstin: signupForm.gstin,
        pan: signupForm.pan,
      };

      const adminData = {
        name: signupForm.adminName,
        email: signupForm.adminEmail,
        password: signupForm.adminPassword,
      };

      await register(companyData, adminData);
      success(
        "Account Created!",
        "Welcome to कोषFLOW! Your account has been created successfully."
      );
      setIsSignupOpen(false);
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later.";
      showError("Signup Failed", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if admin fields are valid
  const isAdminTabValid = () => {
    return signupForm.adminName.trim() !== "" &&
           signupForm.adminEmail.trim() !== "" &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.adminEmail) &&
           signupForm.adminPassword.length >= 4 &&
           signupForm.adminPassword === signupForm.confirmPassword;
  };

  // Helper function to check if company fields are valid
  const isCompanyTabValid = () => {
    return signupForm.companyName.trim() !== "" &&
           signupForm.companyEmail.trim() !== "" &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.companyEmail);
  };

  const resetSignupForm = () => {
    setSignupForm({
      // Admin data
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      confirmPassword: "",
      // Company data
      companyName: "",
      companyEmail: "",
      phone: "",
      gstin: "",
      pan: "",
    });
    setActiveSignupTab("admin");
    clearErrors();
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <NotificationContainer />
      {/* Enhanced Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sophisticated Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-primary rotate-45 animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-32 h-32 border-2 border-accent rotate-12 animate-tilt"></div>
          <div className="absolute bottom-40 left-40 w-36 h-36 border-2 border-primary -rotate-12 animate-float-slow"></div>
          <div className="absolute bottom-20 right-20 w-44 h-44 border-2 border-accent rotate-45 animate-tilt"></div>
        </div>

        {/* Enhanced Floating Elements with Staggered Animation */}
        <div className="absolute top-32 left-16 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full opacity-70 animate-pulse-subtle"></div>
        <div className="absolute top-48 right-24 w-4 h-4 bg-gradient-to-r from-accent to-primary rounded-full opacity-50 animate-pulse-subtle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full opacity-60 animate-pulse-subtle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-48 right-16 w-4 h-4 bg-gradient-to-r from-accent to-primary rounded-full opacity-70 animate-pulse-subtle" style={{animationDelay: '3s'}}></div>
        
        {/* Gradient Orbs for Depth */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
      </div>
      {/* Navigation - Enhanced Glass Morphism Design */}
      <nav
        className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-border/30 z-50 shadow-lg"
        role="navigation"
        aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo - Modern Enhanced Design */}
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  कोषFLOW
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block font-medium">
                  Smart Financial Management
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Better Spacing */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="#features"
                className="text-foreground/80 hover:text-foreground font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-xl px-4 py-2.5 hover:bg-interactive-hover"
                aria-label="View features">
                Features
              </a>
              <a
                href="#security"
                className="text-foreground/80 hover:text-foreground font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-xl px-4 py-2.5 hover:bg-interactive-hover"
                aria-label="View security information">
                Security
              </a>
              <a
                href="#help"
                className="text-foreground/80 hover:text-foreground font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-xl px-4 py-2.5 hover:bg-interactive-hover"
                aria-label="Get help and support">
                Help Center
              </a>
            </div>

            {/* CTA Buttons - Improved Design */}
            <div className="hidden lg:flex items-center space-x-4">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-foreground/80 hover:text-foreground hover:bg-interactive-hover font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:outline-none"
                    aria-label="Sign in to your account">
                    Sign in
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-slate-800 text-xl">
                      Welcome back
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Sign in to continue to your कोषFLOW workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <EmailField
                      label="Email Address"
                      name="email"
                      value={loginForm.email}
                      onChange={(value) =>
                        setLoginForm({ ...loginForm, email: value })
                      }
                      error={errors.email}
                      required
                      placeholder="Enter your email address"
                      aria-describedby="email-error"
                    />
                    <PasswordField
                      label="Password"
                      name="password"
                      value={loginForm.password}
                      onChange={(value) =>
                        setLoginForm({ ...loginForm, password: value })
                      }
                      error={errors.password}
                      required
                      placeholder="Enter your password"
                      aria-describedby="password-error"
                    />
                    {show2FA && (
                      <FormField
                        label="Two-Factor Authentication Code"
                        name="twoFactorCode"
                        value={loginForm.twoFactorCode}
                        onChange={(value) =>
                          setLoginForm({ ...loginForm, twoFactorCode: value })
                        }
                        error={errors.twoFactorCode}
                        required
                        placeholder="Enter 6-digit code"
                        pattern="[0-9]{6}"
                        helpText="Enter the 6-digit code from your authenticator app"
                        aria-describedby="2fa-error 2fa-help"
                      />
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-lg transition-all duration-300 focus:ring-4 focus:ring-slate-300 focus:outline-none"
                      disabled={isSubmitting || authLoading}
                      aria-label={
                        isSubmitting || authLoading
                          ? "Signing in..."
                          : "Sign in"
                      }>
                      {isSubmitting || authLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Signing In...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isSignupOpen} onOpenChange={(open) => {
                setIsSignupOpen(open);
                if (!open) {
                  resetSignupForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="gradient"
                    size="lg"
                    className="font-bold px-8 py-3 text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-primary/20 focus:outline-none"
                    aria-label="Create a new account">
                    Get started
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-slate-800 text-2xl">
                      Create your कोषFLOW account
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Set up your company and admin in minutes. Invoicing, taxes, and reports—simplified.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSignup} className="space-y-6">
                    <Tabs value={activeSignupTab} onValueChange={setActiveSignupTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                        <TabsTrigger value="admin" className="font-medium">
                          Admin details {isAdminTabValid() ? "✓" : ""}
                        </TabsTrigger>
                        <TabsTrigger value="company" className="font-medium">
                          Company details {isCompanyTabValid() ? "✓" : ""}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="admin" className="space-y-6 mt-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                              Admin information
                            </h3>
                            <p className="text-sm text-slate-600 mb-6">
                              Create the primary administrator account for your organization.
                            </p>
                          </div>

                          <FormField
                            label="Full Name"
                            name="adminName"
                            value={signupForm.adminName}
                            onChange={(value) =>
                              setSignupForm({ ...signupForm, adminName: value })
                            }
                            error={errors.adminName}
                            required
                            placeholder="Enter your full name"
                            aria-describedby="admin-name-error"
                          />
                          <EmailField
                            label="Email Address"
                            name="adminEmail"
                            value={signupForm.adminEmail}
                            onChange={(value) =>
                              setSignupForm({
                                ...signupForm,
                                adminEmail: value,
                              })
                            }
                            error={errors.adminEmail}
                            required
                            placeholder="Enter your email address"
                            aria-describedby="admin-email-error"
                          />
                          <PasswordField
                            label="Password"
                            name="adminPassword"
                            value={signupForm.adminPassword}
                            onChange={(value) =>
                              setSignupForm({
                                ...signupForm,
                                adminPassword: value,
                              })
                            }
                            error={errors.adminPassword}
                            required
                            placeholder="Just 4+ characters - keep it simple!"
                            aria-describedby="admin-password-error"
                          />
                          <PasswordField
                            label="Confirm Password"
                            name="confirmPassword"
                            value={signupForm.confirmPassword}
                            onChange={(value) =>
                              setSignupForm({
                                ...signupForm,
                                confirmPassword: value,
                              })
                            }
                            error={errors.confirmPassword}
                            required
                            placeholder="Confirm your password"
                            aria-describedby="confirm-password-error"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="company" className="space-y-6 mt-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                              Company information
                            </h3>
                            <p className="text-sm text-slate-600 mb-6">
                              Add your company details for invoicing and compliance.
                            </p>
                          </div>

                          <FormField
                            label="Company Name"
                            name="companyName"
                            value={signupForm.companyName}
                            onChange={(value) =>
                              setSignupForm({
                                ...signupForm,
                                companyName: value,
                              })
                            }
                            error={errors.companyName}
                            required
                            placeholder="Enter your company name"
                            aria-describedby="company-name-error"
                          />
                          <EmailField
                            label="Company Email"
                            name="companyEmail"
                            value={signupForm.companyEmail}
                            onChange={(value) =>
                              setSignupForm({
                                ...signupForm,
                                companyEmail: value,
                              })
                            }
                            error={errors.companyEmail}
                            required
                            placeholder="Enter company email address"
                            aria-describedby="company-email-error"
                          />
                          <PhoneField
                            label="Phone Number"
                            name="phone"
                            value={signupForm.phone}
                            onChange={(value) =>
                              setSignupForm({ ...signupForm, phone: value })
                            }
                            error={errors.phone}
                            placeholder="Enter company phone number"
                            aria-describedby="phone-error"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <GSTINField
                              label="GSTIN (Optional)"
                              name="gstin"
                              value={signupForm.gstin}
                              onChange={(value) =>
                                setSignupForm({ ...signupForm, gstin: value })
                              }
                              error={errors.gstin}
                              aria-describedby="gstin-error"
                            />
                            <PANField
                              label="PAN (Optional)"
                              name="pan"
                              value={signupForm.pan}
                              onChange={(value) =>
                                setSignupForm({ ...signupForm, pan: value })
                              }
                              error={errors.pan}
                              aria-describedby="pan-error"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="pt-6 border-t border-slate-200">
                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-emerald-200 focus:outline-none"
                        disabled={isSubmitting || authLoading || !isAdminTabValid() || !isCompanyTabValid()}
                        aria-label={
                          isSubmitting || authLoading
                            ? "Creating your account..."
                            : !isAdminTabValid() || !isCompanyTabValid()
                            ? "Please complete all required fields"
                            : "Create your account"
                        }>
                        {isSubmitting || authLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Creating Account...
                          </>
                        ) : !isAdminTabValid() || !isCompanyTabValid() ? (
                          "Complete required fields"
                        ) : (
                          "Create account"
                        )}
                      </Button>

                      <p className="text-xs text-slate-500 text-center mt-4">
                        By creating an account, you agree to our Terms of
                        Service and Privacy Policy.
                      </p>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Mobile Menu Button - Better Design */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 transition-all duration-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu">
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu - Enhanced Design */}
          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg shadow-lg"
              role="menu"
              aria-labelledby="mobile-menu-button">
              <div className="px-4 pt-4 pb-6 space-y-4">
                <a
                  href="#features"
                  className="block px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                  role="menuitem"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Features
                </a>
                <a
                  href="#security"
                  className="block px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                  role="menuitem"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Security
                </a>
                <a
                  href="#help"
                  className="block px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                  role="menuitem"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Help Center
                </a>
                <div className="pt-4 space-y-3 border-t border-slate-200">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium py-3 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    role="menuitem">
                    Sign in
                  </Button>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-emerald-200 focus:outline-none"
                    onClick={() => {
                      setIsSignupOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    role="menuitem">
                    Get started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Enhanced Modern Design */}
      <section
        className="pt-36 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        role="banner"
        aria-labelledby="hero-title">
        {/* Enhanced Hero Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-surface-1/50 to-surface-2/30"></div>
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-primary/15 to-accent/15 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background/90 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            {/* Enhanced Trust Badge */}
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
              role="banner"
              aria-label="Trust indicator">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-amber-400 fill-current animate-icon-pop" />
                <Star className="h-5 w-5 text-amber-400 fill-current animate-icon-pop" style={{animationDelay: '0.1s'}} />
                <Star className="h-5 w-5 text-amber-400 fill-current animate-icon-pop" style={{animationDelay: '0.2s'}} />
                <Star className="h-5 w-5 text-amber-400 fill-current animate-icon-pop" style={{animationDelay: '0.3s'}} />
                <Star className="h-5 w-5 text-amber-400 fill-current animate-icon-pop" style={{animationDelay: '0.4s'}} />
              </div>
              <span className="text-sm font-bold text-foreground">
                Trusted by 50K+ businesses
              </span>
            </div>

            {/* Hero Title - Enhanced Typography */}
            <div className="space-y-8">
              <h1
                id="hero-title"
                className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight leading-[0.85] animate-fade-in-up">
                <span className="bg-gradient-primary bg-clip-text text-black block hero-title">
                  कोषFLOW
                </span>
                <span className="text-foreground/90 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold tracking-normal block mt-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  Smarter, faster finance for growing teams
                </span>
              </h1>

              {/* Enhanced Compelling Subtitle */}
              <p className="text-2xl sm:text-3xl lg:text-4xl text-foreground/70 font-light max-w-5xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                Accounting complexity ends today.
                <br />
                <span className="text-accent font-bold bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">Take control</span> of your finances and time.
              </p>
            </div>

            {/* Hero Description - Better Readability */}
            <div className="max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                At कोषFLOW, we believe financial management should work for
                you—not the other way around. We've eliminated the complexity,
                confusing interfaces, and outdated systems.
              </p>
              <p className="text-base sm:text-lg text-slate-500 mt-4 leading-relaxed">
                Whether you're invoicing, tracking expenses, or generating
                reports, कोषFLOW gives you the transparency and control to
                manage your finances efficiently.
              </p>
            </div>

            {/* Enhanced CTA Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <Button
                variant="gradient"
                size="xl"
                className="font-black px-12 py-4 text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 focus:ring-4 focus:ring-primary/30 focus:outline-none group"
                onClick={() => setIsSignupOpen(true)}
                aria-label="Get started with कोषFLOW">
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>

              <button
                className="group flex items-center gap-3 text-foreground/70 hover:text-foreground font-bold px-8 py-4 rounded-2xl hover:bg-interactive-hover transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:outline-none hover:scale-105"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                aria-label="Learn more about features">
                <span className="text-lg">Learn more</span>
                <div className="w-10 h-10 rounded-2xl border-2 border-border group-hover:border-primary/50 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110">
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            </div>

            {/* Enhanced Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center gap-4 text-foreground/80 group hover:text-foreground transition-colors duration-300">
                <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base font-bold">No setup fees</span>
              </div>
              <div className="flex items-center gap-4 text-foreground/80 group hover:text-foreground transition-colors duration-300">
                <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base font-bold">30-day free trial</span>
              </div>
              <div className="flex items-center gap-4 text-foreground/80 group hover:text-foreground transition-colors duration-300">
                <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-base font-bold">24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Card-based Design */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50"
        role="main"
        aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              id="features-title"
              className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
              Why Choose कोषFLOW?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of financial management with our intuitive,
              powerful, and secure platform.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-24">
            {/* Invoicing Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    <X className="h-4 w-4" />
                    Say no to
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                    Manual invoice creation
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Stop wasting hours creating invoices manually and chasing
                    payments.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                    Say yes to
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                    Automated invoice generation
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    Generate professional invoices instantly with your branding,
                    track payments automatically, and send smart reminders.
                    Create invoices in seconds, not hours.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Custom branding
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Payment tracking
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Smart reminders
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Multi-currency
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-blue-200 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-slate-100 group-hover:shadow-2xl transition-all duration-300">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Receipt className="h-12 w-12 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-2">
                        Smart Invoicing
                      </h4>
                      <p className="text-slate-600">
                        Generate, track, and manage invoices effortlessly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Tracking Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-slate-100 group-hover:shadow-2xl transition-all duration-300">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Calculator className="h-12 w-12 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-2">
                        Expense Tracking
                      </h4>
                      <p className="text-slate-600">
                        Categorize and track all your business expenses
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    <X className="h-4 w-4" />
                    Say no to
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                    Spreadsheet chaos
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Stop drowning in spreadsheets and losing receipts.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                    Say yes to
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                    Smart expense categorization
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    Upload receipts with your phone, get automatic
                    categorization, track tax-deductible items, and generate
                    expense reports instantly. Real-time insights, not monthly
                    headaches.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Receipt scanning
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Auto categorization
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Tax tracking
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Real-time reports
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Reports Feature */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    <X className="h-4 w-4" />
                    Say no to
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                    Complex financial reports
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    No more waiting for month-end reports or hiring accountants
                    for basic insights.
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                    Say yes to
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">
                    Instant financial insights
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    Get real-time financial dashboards, profit & loss
                    statements, and cash flow analysis. Make informed decisions
                    instantly with beautiful, easy-to-understand reports.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Real-time dashboards
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        P&L statements
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Cash flow analysis
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        Custom reporting
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                  <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-slate-100 group-hover:shadow-2xl transition-all duration-300">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <PieChart className="h-12 w-12 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-slate-800 mb-2">
                        Financial Reports
                      </h4>
                      <p className="text-slate-600">
                        Get insights with beautiful, real-time reports
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security and Trust Section - Modern Design */}
      <section
        id="security"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white"
        role="region"
        aria-labelledby="security-title">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              id="security-title"
              className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
              Security and ease
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                can coexist
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade security meets intuitive design. Your data is
              protected while staying easily accessible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Cloud-based */}
            <div className="group text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Globe className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Cloud-based platform
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Access your data securely from anywhere, anytime with our cloud
                infrastructure.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>99.9% uptime</span>
              </div>
            </div>

            {/* Security */}
            <div className="group text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-200 to-green-200 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                Bank-grade security
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Your financial data is protected with industry-leading
                encryption and security protocols.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>PCI DSS compliant</span>
                </div>
              </div>
            </div>

            {/* Multi-user */}
            <div className="group text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Team collaboration
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Invite team members with customizable role-based permissions and
                access controls.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Role-based access</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Audit trails</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="group text-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-200 to-red-200 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-30 group-hover:opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Headphones className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                Expert support
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get help when you need it with our dedicated customer support
                team.
              </p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>No sales calls</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-16 border-t border-slate-200">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Trusted by businesses worldwide
              </h3>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Join thousands of companies that rely on कोषFLOW for their
                financial management needs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">50K+</div>
                <div className="text-sm text-slate-500">Active users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">99.9%</div>
                <div className="text-sm text-slate-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">4.8/5</div>
                <div className="text-sm text-slate-500">Customer rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">150+</div>
                <div className="text-sm text-slate-500">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Gradient Design */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        role="region"
        aria-labelledby="cta-title">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-800"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-700/20 via-blue-700/20 to-slate-800/20"></div>

        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            id="cta-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to transform your
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              financial management?
            </span>
          </h2>

          <p className="text-xl sm:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join thousands of businesses already using कोषFLOW to streamline
            their accounting, save time, and make better financial decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-emerald-200 focus:outline-none group"
              onClick={() => setIsSignupOpen(true)}
              aria-label="Start your free trial">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>

            <div className="text-center">
              <p className="text-slate-300 text-sm">
                No credit card required • 30-day free trial • Setup in minutes
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-12 border-t border-slate-600/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  50,000+
                </div>
                <div className="text-slate-400">Happy customers</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-6 w-6 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <div className="text-slate-400">4.8/5 customer rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-slate-400">Uptime guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean Modern Design */}
      <footer
        className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 relative"
        role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">कोषFLOW</span>
                  <div className="text-sm text-slate-400">
                    Financial Management Software
                  </div>
                </div>
              </div>
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                Modern cloud-based accounting and financial management platform
                built for businesses that want to focus on growth, not
                paperwork.
              </p>

              {/* Trust Badges */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>PCI DSS Compliant</span>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#help"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#help"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#help"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#help"
                    className="text-slate-400 hover:text-white transition-colors duration-300">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-slate-400 text-sm mb-2">
                  Built with ❤️ by Tarun, Priyanshu, Sanchit, and Gopi
                </p>
                <p className="text-slate-500 text-xs">
                  © 2024 कोषFLOW Financial Management Software. All rights
                  reserved.
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <a
                  href="/privacy-policy"
                  className="hover:text-white transition-colors duration-300">
                  Privacy Policy
                </a>
                <a
                  href="/terms-of-service"
                  className="hover:text-white transition-colors duration-300">
                  Terms of Service
                </a>
                <a
                  href="/privacy-policy"
                  className="hover:text-white transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
