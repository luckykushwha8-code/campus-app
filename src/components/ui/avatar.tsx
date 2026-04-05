import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);
    const initial = alt?.charAt(0).toUpperCase() || "U";

    React.useEffect(() => {
      setHasError(false);
    }, [src]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <Image className="aspect-square h-full w-full object-cover" src={src} alt={alt || ""} width={40} height={40} onError={() => setHasError(true)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-600 font-medium">
            {initial}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
