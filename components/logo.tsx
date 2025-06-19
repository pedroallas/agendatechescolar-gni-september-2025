import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({
  className,
  showText = true,
  size = "md",
  href = "/",
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "h-6 w-6",
      text: "text-lg",
      spacing: "gap-2",
    },
    md: {
      icon: "h-8 w-8",
      text: "text-xl",
      spacing: "gap-2",
    },
    lg: {
      icon: "h-10 w-10",
      text: "text-2xl",
      spacing: "gap-3",
    },
  };

  const content = (
    <>
      <div
        className={cn(
          "bg-gradient-to-br from-primary to-primary/80 rounded-lg p-2 flex items-center justify-center",
          sizeClasses[size].icon
        )}
      >
        <GraduationCap className="text-white h-full w-full" />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent",
            sizeClasses[size].text
          )}
        >
          AgendaTech
        </span>
      )}
    </>
  );

  const containerClasses = cn(
    "flex items-center",
    sizeClasses[size].spacing,
    className
  );

  if (href) {
    return (
      <Link href={href} className={containerClasses}>
        {content}
      </Link>
    );
  }

  return <div className={containerClasses}>{content}</div>;
}
