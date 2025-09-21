import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Enhanced breakpoints for better responsive design
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  large: 1280,
} as const;

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    const newIsMobile = width < BREAKPOINTS.tablet;
    const newIsTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    
    setIsMobile(newIsMobile);
    setIsTablet(newIsTablet);
    
    // Auto-collapse sidebar on mobile and tablet
    if (newIsMobile || newIsTablet) {
      setSidebarCollapsed(true);
      setSidebarOpen(false);
    } else {
      // On desktop, restore sidebar state from localStorage or default to expanded
      const savedState = localStorage.getItem('sidebar-collapsed');
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  useEffect(() => {
    checkScreenSize();
    
    // Use ResizeObserver for better performance if available, fallback to resize event
    let resizeObserver: ResizeObserver | null = null;
    
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(checkScreenSize);
      resizeObserver.observe(document.documentElement);
    } else {
      window.addEventListener("resize", checkScreenSize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", checkScreenSize);
      }
    };
  }, [checkScreenSize]);

  // Save sidebar state to localStorage for desktop users
  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    if (!isMobile && !isTablet) {
      localStorage.setItem('sidebar-collapsed', collapsed.toString());
    }
  }, [isMobile, isTablet]);

  // Enhanced responsive calculations
  const sidebarWidth = sidebarCollapsed ? "w-16 sm:w-20" : "w-64 sm:w-72 lg:w-80";
  const contentMargin = sidebarCollapsed 
    ? "ml-16 sm:ml-20" 
    : "ml-64 sm:ml-72 lg:ml-80";
  const mobileContentMargin = "ml-0";

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Enhanced Mobile Overlay with better accessibility */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSidebarOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar with enhanced props */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={handleSidebarCollapse}
        isMobile={isMobile}
        isTablet={isTablet}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      {/* TopBar with enhanced responsive props */}
      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Enhanced Main Content with better responsive design */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          // Enhanced responsive top padding
          "pt-16 sm:pt-18 lg:pt-20",
          // Responsive margins based on screen size
          (isMobile || isTablet) ? mobileContentMargin : contentMargin,
          // Enhanced background with better contrast
          "bg-gradient-to-br from-background via-surface-1/30 to-surface-2/20"
        )}
        role="main"
        aria-label="Main content area">
        {/* Enhanced container with better responsive padding and max-width */}
        <div className={cn(
          "transition-all duration-300",
          // Enhanced responsive padding system
          "px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12",
          // Better max-width constraints for different screen sizes
          "max-w-[100vw] sm:max-w-full lg:max-w-7xl xl:max-w-8xl 2xl:max-w-9xl mx-auto",
          // Ensure proper spacing from edges
          "min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4.5rem)] lg:min-h-[calc(100vh-5rem)]"
        )}>
          {/* Content wrapper with enhanced accessibility and animation */}
          <div 
            className="animate-fade-in-up w-full"
            role="region"
            aria-label="Page content">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
