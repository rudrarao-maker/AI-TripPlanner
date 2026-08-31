"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const UserTable = dynamic(() => import("./users/UserTable").then(mod => mod.UserTable), { ssr: false });
const BulkImport = dynamic(() => import("./users/BulkImport").then(mod => mod.BulkImport), { ssr: false });
const BulkExport = dynamic(() => import("./users/BulkExport").then(mod => mod.BulkExport), { ssr: false });
import { Users, Upload, Download } from "lucide-react";
import { motion } from "framer-motion";

export function UserManagement() {
  const [activeTab, setActiveTab] = useState<"users" | "import" | "export">("users");

  const tabs = [
    { id: "users", label: "User List", icon: Users },
    { id: "import", label: "Bulk Import", icon: Upload },
    { id: "export", label: "Bulk Export", icon: Download },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">Manage your users, bulk import from CSV/Excel, or export records.</p>
      </div>

      <div className="flex space-x-1 border-b border-border/50 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-lg"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        {activeTab === "users" && <UserTable />}
        {activeTab === "import" && <BulkImport />}
        {activeTab === "export" && <BulkExport />}
      </div>
    </div>
  );
}
