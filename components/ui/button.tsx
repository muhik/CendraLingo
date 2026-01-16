import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Button variants configuration
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-widest transition-all active:translate-y-[2px] active:border-b-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-slate-500 border-2 border-slate-200 border-b-4 hover:bg-slate-50 active:border-b-0",
        primary:
          "bg-green-500 text-white border-green-600 border-b-4 hover:bg-green-400 active:border-green-600",
        secondary:
          "bg-sky-500 text-white border-sky-600 border-b-4 hover:bg-sky-400 active:border-sky-600",
        danger:
          "bg-rose-500 text-white border-rose-600 border-b-4 hover:bg-rose-400 active:border-rose-600",
        super:
          "bg-indigo-500 text-white border-indigo-600 border-b-4 hover:bg-indigo-400 active:border-indigo-600",
        ghost:
          "bg-transparent text-slate-500 border-transparent border-0 hover:bg-slate-100",
        sidebar:
          "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none justify-start w-full px-4 py-3 text-start normal-case tracking-normal font-normal active:translate-y-0",
        sidebarOutline:
          "bg-sky-50 text-sky-500 border-2 border-sky-200 hover:bg-sky-100 transition-none justify-start w-full px-4 py-3 text-start normal-case tracking-normal font-normal active:translate-y-0",
        outline:
          "bg-transparent text-slate-500 border-2 border-slate-200 hover:bg-slate-100"
      },
      size: {
        default: "h-11 px-4 py-2 min-w-[120px]",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 min-w-0 p-0 rounded-full",
        rounded: "h-12 rounded-2xl px-8"
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

const Button = ({ className, variant, size, loading, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export { Button, buttonVariants };
