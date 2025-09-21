import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  LayoutDashboard, 
  Palette, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export const DevNavigation = () => {
  const navigationItems = [
    {
      title: "Landing Page",
      description: "Enhanced hero section with modern design",
      href: "/",
      icon: Home,
      badge: "Enhanced",
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Dashboard",
      description: "Interactive KPI cards and modern layout",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: "Redesigned",
      color: "bg-accent/10 text-accent"
    },
    {
      title: "Card Showcase",
      description: "Explore all new card variants and effects",
      href: "/showcase",
      icon: Palette,
      badge: "New",
      color: "bg-warning/10 text-warning"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-2xl border-primary/20 bg-glass-bg backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">UI/UX Showcase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {navigationItems.map((item) => (
            <div key={item.href} className="group">
              <a
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-1 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </a>
            </div>
          ))}
          
          <div className="pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              🎨 Enhanced UI/UX with modern animations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevNavigation;
