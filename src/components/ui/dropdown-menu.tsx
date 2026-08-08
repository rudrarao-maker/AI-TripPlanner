"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DropdownMenu({ children }: any) {
  return <div className="relative inline-block text-left">{children}</div>;
}

export function DropdownMenuTrigger({ asChild, children }: any) {
  return <>{children}</>;
}

export function DropdownMenuContent({ children, isOpen, onClose, align = "end" }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className={`absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${align === 'end' ? 'right-0' : 'left-0'}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DropdownMenuItem({ children, onClick, className }: any) {
  return (
    <div
      onClick={onClick}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${className || ''}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-muted" />;
}

export function DropdownMenuLabel({ children }: any) {
  return <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>;
}
