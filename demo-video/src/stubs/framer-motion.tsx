/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  initial?: unknown;
  animate?: unknown;
  transition?: unknown;
  variants?: unknown;
  whileTap?: unknown;
  whileHover?: unknown;
  layout?: unknown;
};

function createMotionComponent(tag: keyof React.JSX.IntrinsicElements) {
  return React.forwardRef<HTMLElement, MotionProps>(
    (
      {
        initial: _initial,
        animate: _animate,
        transition: _transition,
        variants: _variants,
        whileTap: _whileTap,
        whileHover: _whileHover,
        layout: _layout,
        ...props
      },
      ref,
    ) => React.createElement(tag, { ...props, ref }),
  );
}

export const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) => createMotionComponent(tag as keyof React.JSX.IntrinsicElements),
  },
) as Record<string, ReturnType<typeof createMotionComponent>>;

export const AnimatePresence: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

export type Transition = Record<string, unknown>;
export type Variants = Record<string, unknown>;
