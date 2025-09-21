import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border bg-card text-card-foreground shadow-lg transition-all duration-300 ease-out backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-border/60 shadow-lg hover:shadow-xl hover:border-primary/20",
        elevated: "shadow-xl hover:shadow-2xl border-border/40",
        outlined: "border-2 border-border shadow-md hover:shadow-lg hover:border-primary/30",
        flat: "shadow-none border-border/30 bg-surface-1",
        glass: "bg-glass-bg backdrop-blur-xl border-glass-border shadow-xl",
        gradient: "bg-gradient-card shadow-xl hover:shadow-2xl border-border/30",
        neon: "border-2 border-primary/50 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 bg-gradient-to-br from-background to-primary/5",
        success: "border-2 border-accent/50 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 bg-gradient-to-br from-background to-accent/5",
        warning: "border-2 border-warning/50 shadow-lg shadow-warning/25 hover:shadow-xl hover:shadow-warning/40 bg-gradient-to-br from-background to-warning/5",
        premium: "border-2 border-gradient-to-r from-primary to-accent shadow-xl shadow-primary/30 hover:shadow-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease-out",
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
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
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
      "text-xl font-bold leading-tight tracking-tight text-card-foreground",
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
    className={cn("text-sm text-muted-foreground leading-relaxed mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-4 border-t border-border/50", className)}
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
