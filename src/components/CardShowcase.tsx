import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DevNavigation from "./DevNavigation";
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Star
} from "lucide-react";

export const CardShowcase = () => {
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background via-surface-1/50 to-surface-2/30 min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent">
          Enhanced Card Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the beautiful card variants with modern animations and effects
        </p>
      </div>

      {/* Basic Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Basic Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card variant="default" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>Standard card with hover effects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the default card variant with subtle shadows and smooth hover animations.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Enhanced shadows for prominence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Elevated cards have stronger shadows and more dramatic hover effects.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Glass Card</CardTitle>
                  <CardDescription>Modern glass morphism effect</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Glass cards feature beautiful backdrop blur and translucent backgrounds.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Special Effect Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Special Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Card variant="neon" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-primary">Neon Card</CardTitle>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Glowing
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Neon effect with glowing borders and shadows.
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-primary/50 hover:bg-primary/10">
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card variant="success" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-accent">Success Card</CardTitle>
                  <Badge variant="outline" className="border-accent/50 text-accent">
                    Positive
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Success variant with green accent colors.
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-accent/50 hover:bg-accent/10">
                Continue
              </Button>
            </CardContent>
          </Card>

          <Card variant="warning" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-warning">Warning Card</CardTitle>
                  <Badge variant="outline" className="border-warning/50 text-warning">
                    Attention
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Warning variant for important notices.
              </p>
              <Button variant="outline" size="sm" className="mt-3 border-warning/50 hover:bg-warning/10">
                Review
              </Button>
            </CardContent>
          </Card>

          <Card variant="premium" interactive>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="bg-gradient-primary bg-clip-text text-transparent">
                    Premium Card
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Premium variant with gradient effects.
              </p>
              <Button variant="gradient" size="sm" className="mt-3">
                Upgrade
              </Button>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Usage Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <Card variant="gradient" className="p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Financial Dashboard</h3>
              <p className="text-white/90">Real-time insights and analytics</p>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-lg font-bold text-primary">₹2,45,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Growth Rate</span>
                  <Badge variant="outline" className="border-accent/50 text-accent">
                    +12.5%
                  </Badge>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
            <CardHeader className="relative">
              <CardTitle>Glass Morphism Example</CardTitle>
              <CardDescription>
                Modern translucent design with backdrop blur
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm">Backdrop blur effect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">Translucent background</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm">Modern aesthetics</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>
      
      <DevNavigation />
    </div>
  );
};

export default CardShowcase;
