import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border bg-card text-card-foreground shadow-lg transition-all duration-350 ease-out backdrop-blur-sm relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-border/50 shadow-lg hover:shadow-floating hover:border-primary/30 bg-gradient-card",
        elevated: "shadow-xl hover:shadow-floating border-border/30 bg-gradient-surface",
        outlined: "border-2 border-border shadow-md hover:shadow-lg hover:border-primary/40",
        flat: "shadow-none border-border/20 bg-surface-1",
        glass: "glass-card shadow-glass hover:shadow-floating",
        gradient: "bg-gradient-card shadow-xl hover:shadow-floating border-border/20",
        mesh: "mesh-card shadow-lg hover:shadow-floating border-border/30",
        neon: "border-2 border-primary/60 shadow-lg shadow-glow hover:shadow-floating hover:shadow-glow bg-gradient-to-br from-background to-primary/8",
        success: "border-2 border-accent/60 shadow-lg shadow-glow-accent hover:shadow-floating hover:shadow-glow-accent bg-gradient-to-br from-background to-accent/8",
        warning: "border-2 border-warning/60 shadow-lg shadow-warning/30 hover:shadow-floating hover:shadow-warning/50 bg-gradient-to-br from-background to-warning/8",
        premium: "glass-card-premium shadow-floating hover:shadow-glow border-primary/40",
        frosted: "glass-frosted shadow-floating hover:shadow-glow",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-3 hover:scale-[1.03] card-hover-lift transition-all duration-350 ease-out",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-3 p-8 pb-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-black leading-tight tracking-tight text-card-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-muted-foreground leading-relaxed mt-2 font-medium", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8 pt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-8 pt-6 border-t border-border/30", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
