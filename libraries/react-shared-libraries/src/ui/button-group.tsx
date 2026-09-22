"use client";

import * as React from "react";

import { cn } from "../lib/utils";

/**
 * A shadcn-style button group: renders Button children joined together inside a
 * bordered, rounded container. Segment seams are collapsed and the outer corners
 * are rounded. Pair with `@gitroom/react/ui/button` `Button`s (use variant
 * "ghost" for inactive segments, "secondary"/"default" for the active one).
 */
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="group"
    className={cn(
      "inline-flex items-center rounded-md border border-border p-[3px]",
      "[&>*]:rounded-[calc(var(--radius-md)-3px)]",
      className,
    )}
    {...props}
  />
));
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
