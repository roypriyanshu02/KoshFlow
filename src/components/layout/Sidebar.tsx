import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  ChevronRight,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  exact?: boolean;
  children?: Array<{
    title: string;
    href: string;
  }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    exact: true,
  },
  {
    title: "Masters",
    icon: Users,
    children: [
      { title: "Contacts", href: "/masters/contacts" },
      { title: "Products", href: "/masters/products" },
      { title: "Taxes", href: "/masters/taxes" },
      { title: "Chart of Accounts", href: "/masters/accounts" },
    ],
  },
  {
    title: "Transactions",
    icon: Receipt,
    children: [
      { title: "Purchase Orders", href: "/transactions/purchase-orders" },
      { title: "Sales Orders", href: "/transactions/sales-orders" },
      { title: "Bills", href: "/transactions/bills" },
      { title: "Invoices", href: "/transactions/invoices" },
      { title: "Payments", href: "/transactions/payments" },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    children: [
      { title: "Balance Sheet", href: "/reports/balance-sheet" },
      { title: "Profit & Loss", href: "/reports/profit-loss" },
      { title: "Stock Report", href: "/reports/stock" },
    ],
  },
];

export function Sidebar({
  collapsed = false,
  onCollapse,
  isMobile = false,
  isTablet = false,
  isOpen = false,
  onToggle,
}: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Masters",
    "Transactions",
    "Reports",
  ]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  // Enhanced responsive width calculations
  const sidebarWidth = collapsed 
    ? "w-16 sm:w-20" 
    : "w-64 sm:w-72 lg:w-80";

  const SidebarItem = ({ item }: { item: MenuItem }) => {
    if (item.children && !collapsed) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center justify-between transition-all duration-200",
              // Enhanced padding and touch targets for better accessibility
              "px-3 py-3.5 sm:py-4 rounded-xl text-sm font-medium",
              // Better hover and focus states
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "focus-visible:outline-none",
              "text-sidebar-foreground group",
              // Enhanced touch targets for mobile
              "min-h-[44px] sm:min-h-[48px]"
            )}
            aria-expanded={expandedItems.includes(item.title)}
            aria-controls={`submenu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <item.icon strokeWidth={1.75} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-200 group-hover:animate-icon-pop" />
              <span className="text-sm sm:text-base">{item.title}</span>
            </div>
            <ChevronRight
              strokeWidth={1.75}
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 flex-shrink-0",
                expandedItems.includes(item.title) && "rotate-90"
              )}
            />
          </button>
          {expandedItems.includes(item.title) && (
            <div 
              id={`submenu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="ml-6 sm:ml-8 mt-2 space-y-1 animate-fade-in-up"
              role="group"
              aria-label={`${item.title} submenu`}>
              {item.children.map((child) => (
                <NavLink
                  key={child.href}
                  to={child.href}
                  onClick={() => (isMobile || isTablet) && onToggle?.(false)}
                  className={({ isActive }) =>
                    cn(
                      "block transition-all duration-200",
                      // Enhanced padding and touch targets
                      "px-4 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      "focus-visible:outline-none",
                      // Enhanced touch targets
                      "min-h-[40px] sm:min-h-[44px]",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-md"
                        : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                    )
                  }>
                  {child.title}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.href || "/"}
        onClick={() => (isMobile || isTablet) && onToggle?.(false)}
        className={({ isActive }) =>
          cn(
            "flex items-center transition-all duration-200",
            // Enhanced spacing and touch targets
            "gap-3 sm:gap-4 px-3 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-medium",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "focus-visible:outline-none",
            "group relative",
            // Enhanced touch targets
            "min-h-[44px] sm:min-h-[48px]",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )
        }>
        <item.icon strokeWidth={1.75} className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform duration-200 group-hover:animate-icon-pop" />
        {!collapsed && <span className="truncate">{item.title}</span>}
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.title}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border transition-all duration-300 ease-in-out",
          "bg-sidebar/95 backdrop-blur-xl shadow-lg",
          sidebarWidth,
          (isMobile || isTablet) ? "hidden" : "block"
        )}
        role="navigation"
        aria-label="Main navigation">
        {/* Enhanced Logo Section */}
        <div
          className={cn(
            "flex items-center border-b border-sidebar-border transition-all duration-300",
            // Enhanced padding for better spacing
            "p-4 sm:p-6 lg:p-8",
            collapsed && "justify-center"
          )}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg animate-glow">
              <Building2 strokeWidth={1.75} className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in-left min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-sidebar-foreground brand-text truncate">
                  कोषFLOW
                </h1>
                <p className="text-xs sm:text-sm text-sidebar-foreground/60 truncate">
                  Cloud Finance
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Navigation with better scrolling */}
        <nav 
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent"
          role="menubar"
          aria-label="Main navigation menu">
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {menuItems.map((item) => (
              <div key={item.title} role="none">
                <SidebarItem item={item} />
              </div>
            ))}
          </div>
        </nav>

        {/* Collapse Toggle Button for Desktop */}
        {!isMobile && !isTablet && (
          <div className="border-t border-sidebar-border p-3 sm:p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapse?.(!collapsed)}
              className={cn(
                "w-full justify-center hover:bg-sidebar-accent transition-colors duration-200",
                "min-h-[44px] sm:min-h-[48px]"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <ChevronRight 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200",
                  collapsed ? "rotate-0" : "rotate-180"
                )}
              />
              {!collapsed && (
                <span className="ml-2 text-sm">Collapse</span>
              )}
            </Button>
          </div>
        )}
      </aside>

      {/* Enhanced Mobile/Tablet Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:hidden",
          "bg-sidebar/98 backdrop-blur-xl shadow-xl",
          // Enhanced responsive width
          "w-72 sm:w-80",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!isOpen}>
        {/* Enhanced Logo Section */}
        <div className="flex items-center justify-between border-b border-sidebar-border p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Building2 strokeWidth={1.75} className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-sidebar-foreground brand-text truncate">
                कोषFLOW
              </h1>
              <p className="text-xs sm:text-sm text-sidebar-foreground/60 truncate">
                Cloud Finance
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle?.(false)}
            className={cn(
              "hover:bg-sidebar-accent flex-shrink-0",
              "h-10 w-10 sm:h-12 sm:w-12"
            )}
            aria-label="Close sidebar">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Enhanced Navigation */}
        <nav 
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent"
          role="menubar"
          aria-label="Main navigation menu">
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            {menuItems.map((item) => (
              <div key={item.title} role="none">
                <SidebarItem item={item} />
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
