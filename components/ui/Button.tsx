import { forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "magenta";
type Size = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButtonProps
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  as?: "button";
  href?: never;
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  as: "link";
  href: string;
  external?: boolean;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-opacity-90 shadow-sm hover:shadow-md",
  secondary:
    "bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-dark",
  magenta:
    "bg-brand-magenta text-white hover:bg-opacity-90 shadow-sm hover:shadow-md",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

function getClasses(variant: Variant, size: Size, className = "") {
  return [
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-ring",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      ...props
    }: ButtonProps,
    ref
  ) => {
    if ((props as ButtonAsLinkProps).as === "link") {
      const { href, external } = props as ButtonAsLinkProps;
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={getClasses(variant, size, className)}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={getClasses(variant, size, className)}>
          {children}
        </Link>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _as, ...buttonProps } = props as ButtonAsButtonProps & {
      as?: "button";
    };

    return (
      <button
        ref={ref}
        className={getClasses(variant, size, className)}
        {...buttonProps}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
