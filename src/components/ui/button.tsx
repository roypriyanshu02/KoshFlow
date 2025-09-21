import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-350 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/25 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-350 button-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100 active:shadow-lg",
        outline:
          "border-2 border-input bg-background/80 backdrop-blur-md shadow-sm hover:bg-interactive-hover hover:text-accent-foreground hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100",
        secondary:
          "bg-secondary/90 backdrop-blur-sm text-secondary-foreground shadow-md hover:bg-secondary-hover hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100",
        ghost: "hover:bg-interactive-hover hover:text-accent-foreground transition-all duration-350 hover:scale-[1.03] hover:backdrop-blur-sm active:scale-100",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-350",
        success:
          "bg-accent text-accent-foreground shadow-lg hover:bg-accent-hover hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100 active:shadow-lg",
        warning:
          "bg-warning text-warning-foreground shadow-lg hover:bg-warning/90 hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100 active:shadow-lg",
        gradient:
          "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100 active:shadow-lg before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/25 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-350 button-glow",
        glass:
          "bg-glass-bg backdrop-blur-xl border border-glass-border text-foreground shadow-glass hover:bg-glass-bg-strong hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100",
        mesh:
          "button-mesh text-white shadow-lg hover:shadow-floating hover:-translate-y-2 hover:scale-[1.03] active:translate-y-0 active:scale-100",
      },
      size: {
        default: "h-12 px-8 py-3 text-sm",
        sm: "h-10 rounded-lg px-6 py-2 text-xs",
        lg: "h-14 rounded-xl px-12 py-4 text-base",
        xl: "h-16 rounded-2xl px-16 py-5 text-lg",
        icon: "h-12 w-12",
        micro: "h-8 px-4 py-1.5 text-xs rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <span className={cn(loading && "opacity-0")}>{children}</span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
