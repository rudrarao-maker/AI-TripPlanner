import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Search,
  UserPlus,
  ChevronDown,
  Shield,
  ShieldOff,
  Users,
  Plus,
  X,
  AlertTriangle,
  CheckSquare,
  Square,
  MinusSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Papa from "papaparse";
import { FileSpreadsheet } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  provider: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BulkUserRow {
  name: string;
  email: string;
  role: string;
}

type ModalType =
  | "add-single"
  | "add-bulk"
  | "edit"
  | "confirm-delete"
  | "confirm-bulk-action"
  | "change-password"
  | null;

export function UserManagement() {
  // ─── State ──────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Selection (Gmail-style)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Modals
  const [modalType, setModalType] = useState<ModalType>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "user",
    status: "active",
    password: "",
  });

  // Bulk Add
  const [bulkRows, setBulkRows] = useState<BulkUserRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Bulk Action Confirmation
  const [pendingBulkAction, setPendingBulkAction] = useState<{
    action: string;
    label: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Toast messages
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // ─── Auto-dismiss toast ─────────────────────────────────
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
  };

  // ─── Drag & Drop Handlers ────────────────────────────────
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processCSV = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      showToast("Please upload a valid CSV file.", "error");
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/^\uFEFF/, ''),
      complete: (results) => {
        const parsedRows: BulkUserRow[] = [];
        results.data.forEach((row: any) => {
          if (parsedRows.length >= 50) return; // limit to 50
          const name = row.name || "";
          const email = row.email || "";
          let role = (row.role || "user").toLowerCase();
          if (role !== "admin" && role !== "user") role = "user";
          
          if (name || email) {
            parsedRows.push({ name, email, role });
          }
        });
        
        if (parsedRows.length > 0) {
          setBulkRows(parsedRows);
          showToast(`Loaded ${parsedRows.length} users from CSV.`);
        } else {
          showToast("No valid user data found in CSV.", "error");
        }
      },
      error: (error: any) => {
        showToast(`Error parsing CSV: ${error.message}`, "error");
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processCSV(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processCSV(e.target.files[0]);
    }
  };

  // ─── Data Fetching ──────────────────────────────────────
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (roleFilter !== "all") params.set("role", roleFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);
        params.set("page", String(page));
        params.set("limit", String(pagination.limit));
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        const res = await api.get(`/users?${params.toString()}`);
        const data = res.data.data;

        // Handle both old and new response format
        if (data.users && data.pagination) {
          setUsers(data.users);
          setPagination(data.pagination);
        } else if (Array.isArray(data)) {
          setUsers(data);
          setPagination({
            total: data.length,
            page: 1,
            limit: 50,
            totalPages: 1,
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    },
    [
      searchQuery,
      roleFilter,
      statusFilter,
      sortBy,
      sortOrder,
      pagination.limit,
    ],
  );

  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  // ─── Selection Logic (Gmail-style) ─────────────────────
  const allSelected =
    users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const someSelected = users.some((u) => selectedIds.has(u.id));
  const selectedCount = selectedIds.size;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── Single User CRUD ─────────────────────────────────
  const handleOpenAddModal = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      role: "user",
      status: "active",
      password: "",
    });
    setModalType("add-single");
  };

  const handleOpenEditModal = (user: User) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
    });
    setModalType("edit");
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "restricted" : "active";
    try {
      await api.put(`/users/${user.id}`, { status: newStatus });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      showToast(`User marked as ${newStatus}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to update status", "error");
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (modalType === "edit") {
        await api.put(`/users/${formData.id}`, formData);
        showToast("User updated successfully");
      } else {
        await api.post("/users", formData);
        showToast("User created successfully");
      }
      setModalType(null);
      fetchUsers(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    setActionLoading(true);
    try {
      await api.delete(`/users/${id}`);
      showToast("User deleted successfully");
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      fetchUsers(pagination.page);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to delete user", "error");
    } finally {
      setActionLoading(false);
      setModalType(null);
    }
  };

  // ─── Bulk Add ─────────────────────────────────────────
  const handleOpenBulkAddModal = () => {
    setBulkRows([]);
    setModalType("add-bulk");
  };

  const addBulkRow = () => {
    if (bulkRows.length < 50) {
      setBulkRows([...bulkRows, { name: "", email: "", role: "user" }]);
    }
  };

  const removeBulkRow = (index: number) => {
    if (bulkRows.length > 1) {
      setBulkRows(bulkRows.filter((_, i) => i !== index));
    }
  };

  const updateBulkRow = (
    index: number,
    field: keyof BulkUserRow,
    value: string,
  ) => {
    setBulkRows(
      bulkRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = bulkRows.filter((r) => r.email.trim());
    if (validRows.length === 0) {
      showToast("Please provide at least one valid email", "error");
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post("/users/bulk", { users: validRows });
      const data = res.data.data;
      
      const createdCount = data.created?.length || 0;
      const skippedCount = data.skipped?.length || 0;
      
      if (skippedCount > 0) {
        const skippedDetails = data.skipped.slice(0, 3).map((s: any) => s.email).join(", ");
        const more = skippedCount > 3 ? ` and ${skippedCount - 3} more` : "";
        showToast(`${createdCount} created. ${skippedCount} skipped: ${skippedDetails}${more}`, "error");
      } else {
        showToast(`Successfully created ${createdCount} users!`);
      }
      
      if (createdCount > 0 || skippedCount === 0) {
        setModalType(null);
        fetchUsers(1);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Bulk creation failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Bulk Actions ─────────────────────────────────────
  const confirmBulkAction = (
    action: string,
    label: string,
    description: string,
    onConfirm: () => void,
  ) => {
    setPendingBulkAction({ action, label, description, onConfirm });
    setModalType("confirm-bulk-action");
  };

  const handleBulkRestrict = () => {
    confirmBulkAction(
      "restrict",
      `Restrict ${selectedCount} user(s)`,
      `Are you sure you want to restrict ${selectedCount} selected user(s)? They will lose access to their accounts.`,
      async () => {
        setActionLoading(true);
        try {
          await api.put("/users/bulk", {
            userIds: Array.from(selectedIds),
            update: { status: "restricted" },
          });
          showToast(`${selectedCount} user(s) restricted`);
          setSelectedIds(new Set());
          fetchUsers(pagination.page);
        } catch (err: any) {
          showToast(
            err.response?.data?.error || "Bulk restrict failed",
            "error",
          );
        } finally {
          setActionLoading(false);
          setModalType(null);
        }
      },
    );
  };

  const handleBulkActivate = () => {
    confirmBulkAction(
      "activate",
      `Activate ${selectedCount} user(s)`,
      `Are you sure you want to activate ${selectedCount} selected user(s)?`,
      async () => {
        setActionLoading(true);
        try {
          await api.put("/users/bulk", {
            userIds: Array.from(selectedIds),
            update: { status: "active" },
          });
          showToast(`${selectedCount} user(s) activated`);
          setSelectedIds(new Set());
          fetchUsers(pagination.page);
        } catch (err: any) {
          showToast(
            err.response?.data?.error || "Bulk activate failed",
            "error",
          );
        } finally {
          setActionLoading(false);
          setModalType(null);
        }
      },
    );
  };

  const handleBulkPromoteAdmin = () => {
    confirmBulkAction(
      "promote",
      `Promote ${selectedCount} user(s) to Admin`,
      `Are you sure you want to grant admin privileges to ${selectedCount} selected user(s)?`,
      async () => {
        setActionLoading(true);
        try {
          await api.put("/users/bulk", {
            userIds: Array.from(selectedIds),
            update: { role: "admin" },
          });
          showToast(`${selectedCount} user(s) promoted to admin`);
          setSelectedIds(new Set());
          fetchUsers(pagination.page);
        } catch (err: any) {
          showToast(
            err.response?.data?.error || "Bulk promote failed",
            "error",
          );
        } finally {
          setActionLoading(false);
          setModalType(null);
        }
      },
    );
  };

  const handleBulkDemote = () => {
    confirmBulkAction(
      "demote",
      `Demote ${selectedCount} user(s) to User`,
      `Are you sure you want to remove admin privileges from ${selectedCount} selected user(s)?`,
      async () => {
        setActionLoading(true);
        try {
          await api.put("/users/bulk", {
            userIds: Array.from(selectedIds),
            update: { role: "user" },
          });
          showToast(`${selectedCount} user(s) demoted to user role`);
          setSelectedIds(new Set());
          fetchUsers(pagination.page);
        } catch (err: any) {
          showToast(err.response?.data?.error || "Bulk demote failed", "error");
        } finally {
          setActionLoading(false);
          setModalType(null);
        }
      },
    );
  };

  const handleBulkDelete = () => {
    confirmBulkAction(
      "delete",
      `Delete ${selectedCount} user(s)`,
      `This action is irreversible. All data for ${selectedCount} selected user(s) will be permanently deleted including their trips, bookings, and expenses.`,
      async () => {
        setActionLoading(true);
        try {
          await api.delete("/users/bulk", {
            data: { userIds: Array.from(selectedIds) },
          });
          showToast(`${selectedCount} user(s) deleted`);
          setSelectedIds(new Set());
          fetchUsers(pagination.page);
        } catch (err: any) {
          showToast(err.response?.data?.error || "Bulk delete failed", "error");
        } finally {
          setActionLoading(false);
          setModalType(null);
        }
      },
    );
  };

  // ─── Sorting ──────────────────────────────────────────
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // ─── Computed ─────────────────────────────────────────
  const statusCounts = useMemo(() => {
    return {
      total: pagination.total,
      active: users.filter((u) => u.status === "active").length,
      restricted: users.filter((u) => u.status === "restricted").length,
      admins: users.filter((u) => u.role === "admin").length,
    };
  }, [users, pagination.total]);

  // ─── Render ───────────────────────────────────────────
  if (error && !loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold">Failed to load users</h3>
        <p className="text-muted-foreground text-sm max-w-md">{error}</p>
        <Button
          onClick={() => fetchUsers(1)}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Toast ──────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-sm font-medium max-w-sm ${
              toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-auto opacity-60 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> User Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {pagination.total} total users • {statusCounts.admins} admins •{" "}
            {statusCounts.restricted} restricted
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleOpenBulkAddModal}
            variant="outline"
            className="gap-2 rounded-xl border-dashed"
          >
            <UserPlus className="h-4 w-4" /> Add Multiple
          </Button>
        </div>
      </div>

      {/* ─── Search & Filters ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/40 border-border/50 rounded-xl h-11"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 px-3 pr-8 rounded-xl border border-border/50 bg-muted/40 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 pr-8 rounded-xl border border-border/50 bg-muted/40 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
      </div>

      {/* ─── Bulk Action Toolbar (Gmail-style) ─────────── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary mr-2">
                <CheckSquare className="h-4 w-4" />
                {selectedCount} selected
              </div>
              <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs h-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600"
                onClick={handleBulkActivate}
              >
                <CheckCircle className="h-3.5 w-3.5" /> Activate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs h-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-600"
                onClick={handleBulkRestrict}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Restrict
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs h-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-600"
                onClick={handleBulkPromoteAdmin}
              >
                <Shield className="h-3.5 w-3.5" /> Make Admin
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs h-8 rounded-lg hover:bg-orange-500/10 hover:text-orange-600"
                onClick={handleBulkDemote}
              >
                <ShieldOff className="h-3.5 w-3.5" /> Remove Admin
              </Button>
              <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs h-8 rounded-lg hover:bg-destructive/10 text-destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <div className="ml-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 rounded-lg text-muted-foreground"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── User Table ─────────────────────────────────── */}
      <Card className="glass border-primary/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase select-none">
                <tr>
                  <th className="px-4 py-3.5 w-12">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center h-5 w-5 rounded transition-colors hover:text-primary"
                      title={allSelected ? "Deselect all" : "Select all"}
                    >
                      {allSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 text-primary" />
                      ) : someSelected ? (
                        <MinusSquare className="h-4.5 w-4.5 text-primary/70" />
                      ) : (
                        <Square className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </th>
                  <th
                    className="px-4 py-3.5 font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    <span className="flex items-center gap-1.5">
                      Name
                      {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3.5 font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort("email")}
                  >
                    <span className="flex items-center gap-1.5">
                      Email
                      {sortBy === "email" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 font-medium">Role</th>
                  <th className="px-4 py-3.5 font-medium">Status</th>
                  <th
                    className="px-4 py-3.5 font-medium cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <span className="flex items-center gap-1.5">
                      Joined
                      {sortBy === "createdAt" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                  <th className="px-4 py-3.5 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  // Skeleton Rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-4 w-4 bg-muted rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-28 bg-muted rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-40 bg-muted rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-5 w-14 bg-muted rounded-full" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-5 w-16 bg-muted rounded-full" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-20 bg-muted rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-16 bg-muted rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium">
                          No users found
                        </p>
                        <p className="text-muted-foreground/60 text-xs">
                          {searchQuery ||
                          roleFilter !== "all" ||
                          statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Start by adding your first user"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedIds.has(user.id);
                    return (
                      <motion.tr
                        key={user.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() => toggleSelect(user.id)}
                      >
                        <td
                          className="px-4 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => toggleSelect(user.id)}
                            className="flex items-center justify-center h-5 w-5 rounded transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4.5 w-4.5 text-primary" />
                            ) : (
                              <Square className="h-4.5 w-4.5 text-muted-foreground/50 group-hover:text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground truncate max-w-[160px]">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                              user.role === "admin"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.role === "admin" && (
                              <Shield className="w-2.5 h-2.5" />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                              user.status === "restricted"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {user.status === "restricted" ? (
                              <ShieldAlert className="w-2.5 h-2.5" />
                            ) : (
                              <CheckCircle className="w-2.5 h-2.5" />
                            )}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </td>
                        <td
                          className="px-4 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  password: "",
                                });
                                setModalType("change-password");
                              }}
                              className="h-8 w-8 rounded-lg hover:bg-amber-500/15 hover:text-amber-500"
                              title="Change password"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditModal(user)}
                              className="h-8 w-8 rounded-lg hover:bg-primary/15 hover:text-primary"
                              title="Edit user"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                              className={`h-8 w-8 rounded-lg ${user.status === 'active' ? 'hover:bg-destructive/15 hover:text-destructive' : 'hover:bg-emerald-500/15 hover:text-emerald-500'}`}
                              title={user.status === 'active' ? "Suspend user" : "Restore user"}
                            >
                              {user.status === 'active' ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-destructive/15 text-destructive"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                });
                                setModalType("confirm-delete");
                              }}
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ───────────────────────────────── */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pagination.page === pageNum ? "default" : "ghost"
                        }
                        size="icon"
                        className={`h-8 w-8 rounded-lg text-xs ${pagination.page === pageNum ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => fetchUsers(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  },
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
            onClick={() => {
              if (!actionLoading) setModalType(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              {/* ─── Add / Edit Single User Modal ────────── */}
              {(modalType === "add-single" || modalType === "edit") && (
                <Card className="shadow-2xl border-primary/15">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {modalType === "edit" ? (
                        <Edit className="h-5 w-5 text-primary" />
                      ) : (
                        <UserPlus className="h-5 w-5 text-primary" />
                      )}
                      {modalType === "edit" ? "Edit User" : "Add New User"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                      onClick={() => setModalType(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitSingle} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Full Name
                        </label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="bg-muted/40"
                          placeholder="Enter user's name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email Address
                        </label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={modalType === "edit"}
                          className="bg-muted/40 disabled:opacity-50"
                          placeholder="user@example.com"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                          </label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-input bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                            value={formData.role}
                            onChange={(e) =>
                              setFormData({ ...formData, role: e.target.value })
                            }
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-input bg-muted/40 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="active">Active</option>
                            <option value="restricted">Restricted</option>
                          </select>
                        </div>
                      </div>
                      {modalType === "add-single" && (
                        <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/30">
                          💡 Default password:{" "}
                          <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">
                            Password123!
                          </code>{" "}
                          — User can change it after logging in.
                        </p>
                      )}

                      {modalType === "edit" && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                            <span>Change Password</span>
                            <span className="text-[10px] text-muted-foreground/70 normal-case bg-muted px-1.5 py-0.5 rounded">
                              Optional
                            </span>
                          </label>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            className="bg-muted/40"
                            placeholder="Enter new password to reset"
                          />
                        </div>
                      )}

                      <div className="pt-2 flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-xl"
                          onClick={() => setModalType(null)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : modalType === "edit" ? (
                            "Save Changes"
                          ) : (
                            "Create User"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* ─── Change Password Modal ───────────────── */}
              {modalType === "change-password" && (
                <Card className="shadow-2xl border-amber-500/20">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-5 w-5 text-amber-500" />
                      Change Password
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                      onClick={() => setModalType(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (formData.password.length < 6) {
                          setError("Password must be at least 6 characters");
                          return;
                        }
                        setActionLoading(true);
                        try {
                          await api.put(
                            `/admin/users/${formData.id}/password`,
                            { newPassword: formData.password },
                          );
                          setModalType(null);
                          setFormData({
                            id: "",
                            name: "",
                            email: "",
                            role: "user",
                            status: "active",
                            password: "",
                          });
                          // alert success or toast here
                        } catch (err: any) {
                          setError(
                            err.response?.data?.message ||
                              "Failed to change password",
                          );
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        Change password for{" "}
                        <span className="font-semibold text-foreground">
                          {formData.name}
                        </span>{" "}
                        ({formData.email}).
                      </p>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          New Password
                        </label>
                        <Input
                          required
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="bg-muted/40"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="pt-2 flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-xl"
                          onClick={() => setModalType(null)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* ─── Confirm Delete Modal ────────────────── */}
              {modalType === "confirm-delete" && (
                <Card className="shadow-2xl border-destructive/20">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-bold">Delete User</h3>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete{" "}
                      <span className="font-semibold text-foreground">
                        {formData.name}
                      </span>{" "}
                      ({formData.email})? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => setModalType(null)}
                        disabled={actionLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full rounded-xl shadow-lg"
                        onClick={() => handleDeleteSingle(formData.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ─── Confirm Bulk Action Modal ───────────── */}
              {modalType === "confirm-bulk-action" && pendingBulkAction && (
                <Card
                  className={`shadow-2xl ${pendingBulkAction.action === "delete" ? "border-destructive/20" : "border-primary/20"}`}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div
                      className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
                        pendingBulkAction.action === "delete"
                          ? "bg-destructive/10"
                          : pendingBulkAction.action === "restrict"
                            ? "bg-amber-500/10"
                            : "bg-primary/10"
                      }`}
                    >
                      {pendingBulkAction.action === "delete" ? (
                        <Trash2 className="h-6 w-6 text-destructive" />
                      ) : pendingBulkAction.action === "restrict" ? (
                        <ShieldAlert className="h-6 w-6 text-amber-500" />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold">
                      {pendingBulkAction.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pendingBulkAction.description}
                    </p>
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => setModalType(null)}
                        disabled={actionLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant={
                          pendingBulkAction.action === "delete"
                            ? "destructive"
                            : "default"
                        }
                        className="w-full rounded-xl shadow-lg"
                        onClick={pendingBulkAction.onConfirm}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* ─── Bulk Add Modal (wider) ──────────────── */}
            {modalType === "add-bulk" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl absolute"
              >
                <Card className="shadow-2xl border-primary/15 max-h-[85vh] flex flex-col">
                  <CardHeader className="flex flex-row justify-between items-center pb-2 shrink-0">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Add Multiple Users
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                      onClick={() => setModalType(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmitBulk} className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Add up to 50 users at once. Each user will receive the
                        default password{" "}
                        <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          Password123!
                        </code>
                      </p>

                      {/* ─── CSV Drag & Drop Zone ────────────── */}
                      <motion.label 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{
                          borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border) / 0.5)",
                          backgroundColor: isDragging ? "hsl(var(--primary) / 0.05)" : "transparent",
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer block hover:border-primary/30 hover:bg-muted/30"
                      >
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <motion.div 
                            animate={{ scale: isDragging ? 1.1 : 1 }}
                            className={`p-3 rounded-full ${isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                          >
                            <FileSpreadsheet className="h-6 w-6" />
                          </motion.div>
                          <h4 className="font-semibold text-sm">Drag and drop your CSV file here or click to browse</h4>
                          <p className="text-xs text-muted-foreground max-w-[250px]">
                            File must contain <b>Name</b> and <b>Email</b> columns. (Role is optional)
                          </p>
                        </div>
                      </motion.label>
                      
                      <div className="text-center mt-2">
                        <a 
                          href="data:text/csv;charset=utf-8,Name,Email,Role%0A" 
                          download="sample_users_template.csv"
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Download CSV Template
                        </a>
                      </div>

                      {bulkRows.length > 0 && (
                        <div className="mt-4 border rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted text-muted-foreground sticky top-0">
                              <tr>
                                <th className="py-2 px-3 text-left font-medium">Name</th>
                                <th className="py-2 px-3 text-left font-medium">Email</th>
                                <th className="py-2 px-3 text-left font-medium">Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bulkRows.map((row, i) => {
                                const isInvalid = !row.email.trim();
                                return (
                                  <tr key={i} className={`border-b last:border-0 ${isInvalid ? "bg-red-50 text-red-600" : ""}`}>
                                    <td className="py-2 px-3 truncate max-w-[120px]">{row.name}</td>
                                    <td className="py-2 px-3 truncate max-w-[150px]">{row.email || "Missing Email!"}</td>
                                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px] uppercase">{row.role}</Badge></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="pt-2 flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-xl"
                          onClick={() => setModalType(null)}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Create{" "}
                              {
                                bulkRows.filter(
                                  (r) => r.name.trim() && r.email.trim(),
                                ).length
                              }{" "}
                              User(s)
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
