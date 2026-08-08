"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const AccordionContext = React.createContext<any>({});

export function Accordion({ children, type = "single", collapsible = false, className }: any) {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ value, setValue, collapsible }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ children, value, className }: any) {
  return (
    <div className={`border-b ${className || ''}`} data-value={value}>
      {React.Children.map(children, (child) => 
        React.isValidElement(child) ? React.cloneElement(child as any, { itemValue: value }) : child
      )}
    </div>
  );
}

export function AccordionTrigger({ children, itemValue, className }: any) {
  const { value, setValue, collapsible } = React.useContext(AccordionContext);
  const isOpen = value === itemValue;
  
  return (
    <button
      onClick={() => setValue(isOpen && collapsible ? null : itemValue)}
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline ${className || ''}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}

export function AccordionContent({ children, itemValue, className }: any) {
  const { value } = React.useContext(AccordionContext);
  const isOpen = value === itemValue;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden text-sm"
        >
          <div className={`pb-4 pt-0 ${className || ''}`}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
