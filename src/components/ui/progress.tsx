import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  /**
   * Yalnızca işlevin kontrolü için dahili olarak kullanılır
   */
  indicator?: React.ReactNode;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicator, ...props }, ref) => {
    // Değerin 0-100 arasında olmasını sağlar
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    return (
      <div
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          className
        )}
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        >
          {indicator}
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress }; 