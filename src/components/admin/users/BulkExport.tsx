"use client";
import { useState } from "react";
import { exportUsersData } from "@/app/actions/admin-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, FileSpreadsheet, FileIcon } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

export function BulkExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setIsExporting(true);
    try {
      const filters: any = { role: roleFilter, status: statusFilter };
      if (dateFrom) filters.dateRange = { ...filters.dateRange, from: new Date(dateFrom) };
      if (dateTo) filters.dateRange = { ...filters.dateRange, to: new Date(dateTo) };

      const data = await exportUsersData(filters);
      
      if (data.length === 0) {
        toast.error("No data found for the selected filters.");
        return;
      }

      const formattedData = data.map(u => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Status: u.status,
        Verified: u.verified ? "Yes" : "No",
        Joined: new Date(u.createdAt).toLocaleString()
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `users_export_${timestamp}`;

      if (format === "csv") {
        const csv = Papa.unparse(formattedData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
      } 
      else if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }
      else if (format === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Users Export", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        let y = 40;
        formattedData.forEach((row, i) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`${i+1}. ${row.Name} (${row.Email}) - [${row.Role}] - [${row.Status}]`, 14, y);
          y += 10;
        });
        
        doc.save(`${filename}.pdf`);
      }
      
      toast.success(`Exported ${data.length} users as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Download className="h-6 w-6 text-primary" /> Export Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Filter</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Filter</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full h-10 px-3 rounded-md border bg-background text-sm">
              <option value="all">All Status</option>
              <option value="active">Active Users</option>
              <option value="restricted">Restricted / Blocked Users</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Joined From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Joined To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Select format to export the filtered data:</p>
          <div className="flex gap-4">
            <Button onClick={() => handleExport("csv")} disabled={isExporting} variant="outline" className="flex-1 gap-2">
              <FileText className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => handleExport("excel")} disabled={isExporting} variant="outline" className="flex-1 gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Export Excel
            </Button>
            <Button onClick={() => handleExport("pdf")} disabled={isExporting} variant="outline" className="flex-1 gap-2">
              <FileIcon className="h-4 w-4 text-destructive" /> Export PDF
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
