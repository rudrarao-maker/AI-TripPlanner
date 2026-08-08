"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchUsersForAdmin, bulkUpdateUsers, bulkDeleteUsers } from "@/app/actions/admin-users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MoreVertical, Shield, ShieldOff, ShieldAlert, Trash2, CheckCircle, RefreshCw, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { UserProfileModal } from "./UserProfileModal";
import toast from "react-hot-toast";

export function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsersForAdmin({ search, role: roleFilter, status: statusFilter, page, limit: 10 });
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    const delay = setTimeout(loadUsers, 300);
    return () => clearTimeout(delay);
  }, [loadUsers]);

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map(u => u.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAction = async (action: 'active' | 'restricted' | 'admin' | 'user' | 'delete') => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    
    try {
      if (action === 'delete') {
        if (!confirm(`Delete ${ids.length} users? This is irreversible.`)) return;
        await bulkDeleteUsers(ids);
        toast.success(`Deleted ${ids.length} users`);
      } else if (action === 'admin' || action === 'user') {
        await bulkUpdateUsers(ids, { role: action });
        toast.success(`Updated role for ${ids.length} users`);
      } else {
        await bulkUpdateUsers(ids, { status: action });
        toast.success(`Updated status for ${ids.length} users`);
      }
      setSelectedIds(new Set());
      loadUsers();
    } catch (e) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 h-10"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-md border bg-background text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="restricted">Restricted</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold text-primary mr-2">{selectedIds.size} selected</span>
          <Button size="sm" variant="ghost" onClick={() => handleBulkAction('active')}><CheckCircle className="h-4 w-4 mr-1"/> Activate</Button>
          <Button size="sm" variant="ghost" onClick={() => handleBulkAction('restricted')}><ShieldAlert className="h-4 w-4 mr-1"/> Restrict</Button>
          <Button size="sm" variant="ghost" onClick={() => handleBulkAction('admin')}><Shield className="h-4 w-4 mr-1"/> Make Admin</Button>
          <Button size="sm" variant="ghost" onClick={() => handleBulkAction('user')}><ShieldOff className="h-4 w-4 mr-1"/> Remove Admin</Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleBulkAction('delete')}><Trash2 className="h-4 w-4 mr-1"/> Delete</Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.size > 0 && selectedIds.size === users.length} onChange={toggleSelectAll} className="rounded" /></th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No users found.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded" /></td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="text-[10px] uppercase">{user.status}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-[10px] uppercase">{user.role}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent isOpen={openMenuId === user.id} onClose={() => setOpenMenuId(null)}>
                            <DropdownMenuItem onClick={() => { setViewingUser(user); setOpenMenuId(null); }}><Eye className="h-4 w-4 mr-2"/> View Profile</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedIds(new Set([user.id])); handleBulkAction('delete'); setOpenMenuId(null); }}>
                              <Trash2 className="h-4 w-4 mr-2"/> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages || 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <UserProfileModal user={viewingUser} isOpen={!!viewingUser} onClose={() => setViewingUser(null)} />
    </div>
  );
}
