import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TopBarProps {
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

export function TopBar({
  sidebarCollapsed = false,
  onSidebarToggle,
  isMobile = false,
  isTablet = false,
}: TopBarProps) {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Enhanced responsive left offset calculations
  const leftOffset = (isMobile || isTablet)
    ? "left-0"
    : sidebarCollapsed
    ? "left-16 sm:left-20"
    : "left-64 sm:left-72 lg:left-80";

  return (
    <header
      className={cn(
        "bg-card/80 backdrop-blur-xl border-b border-border fixed top-0 right-0 z-40 transition-all duration-300",
        // Enhanced responsive height
        "h-16 sm:h-18 lg:h-20",
        leftOffset,
        "shadow-sm"
      )}
      role="banner"
      aria-label="Top navigation bar">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Enhanced Left section */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Enhanced Mobile/Tablet menu button */}
          {(isMobile || isTablet) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className={cn(
                "lg:hidden flex-shrink-0",
                "h-10 w-10 sm:h-12 sm:w-12",
                "hover:bg-accent transition-colors duration-200"
              )}
              aria-label="Toggle sidebar"
              aria-expanded={false}>
              <Menu strokeWidth={1.75} className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-icon-pop" />
            </Button>
          )}

          {/* Enhanced Search - Better responsive behavior */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
              <Search strokeWidth={1.75} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search transactions, contacts, products..."
                className={cn(
                  "pl-10 sm:pl-12 bg-muted/50 border-0 transition-all duration-200",
                  "focus:ring-2 focus:ring-primary focus:bg-background",
                  "h-10 sm:h-11 text-sm sm:text-base",
                  "placeholder:text-muted-foreground/70"
                )}
                aria-label="Search application content"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Right section */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Enhanced Mobile search button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "md:hidden group",
              "h-10 w-10 sm:h-12 sm:w-12",
              "hover:bg-accent transition-colors duration-200"
            )}
            aria-label="Open search">
            <Search strokeWidth={1.75} className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-icon-pop" />
          </Button>

          {/* Enhanced Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative hover:bg-accent transition-colors duration-200 group",
              "h-10 w-10 sm:h-12 sm:w-12"
            )}
            aria-label="View notifications (3 unread)">
            <Bell strokeWidth={1.75} className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-icon-pop" />
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-destructive text-destructive-foreground text-xs sm:text-sm rounded-full flex items-center justify-center animate-pulse-subtle font-medium"
              aria-label="3 unread notifications">
              3
            </span>
          </Button>

          {/* Enhanced Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hover:bg-accent transition-colors duration-200 group",
              "h-10 w-10 sm:h-12 sm:w-12"
            )}
            aria-label="Toggle theme">
            <Sun strokeWidth={1.75} className="w-5 h-5 sm:w-6 sm:h-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:animate-icon-pop" />
            <Moon strokeWidth={1.75} className="absolute w-5 h-5 sm:w-6 sm:h-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:animate-icon-pop" />
          </Button>

          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-2 sm:gap-3 hover:bg-accent transition-colors duration-200",
                  "px-2 sm:px-3 py-2",
                  "h-10 sm:h-12",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
                aria-label="User menu">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarImage src="/api/placeholder/32/32" alt={`${user?.name || 'User'} avatar`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-medium text-sm sm:text-base">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-32 lg:max-w-40">
                    {company?.name || user?.email || "user@example.com"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 sm:w-72 animate-scale-in"
              sideOffset={8}>
              <DropdownMenuLabel>
                <div className="space-y-2 p-2">
                  <p className="font-medium text-base sm:text-lg">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground break-all">
                    {user?.email || "user@example.com"}
                  </p>
                  {company?.name && (
                    <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {company.name}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={cn(
                "cursor-pointer group transition-colors duration-200",
                "px-4 py-3 text-sm sm:text-base",
                "focus:bg-accent focus:text-accent-foreground"
              )}>
                <User strokeWidth={1.75} className="mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:text-primary transition-colors group-hover:animate-icon-pop" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className={cn(
                "cursor-pointer group transition-colors duration-200",
                "px-4 py-3 text-sm sm:text-base",
                "focus:bg-accent focus:text-accent-foreground"
              )}>
                <Settings strokeWidth={1.75} className="mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:text-primary transition-colors group-hover:animate-icon-pop" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={cn(
                  "text-destructive cursor-pointer group focus:text-destructive transition-colors duration-200",
                  "px-4 py-3 text-sm sm:text-base",
                  "focus:bg-destructive/10"
                )}
                onClick={handleLogout}>
                <LogOut strokeWidth={1.75} className="mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:text-destructive transition-colors group-hover:animate-icon-pop" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
