"use client";
import { useState } from "react";
import { batchImportUsers } from "@/app/actions/admin-users";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet, Trash2, Edit2 } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ImportRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isValid: boolean;
  errors: string[];
}

export function BulkImport() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  
  const { trackEvent } = useAnalytics();

  const validateRow = (row: any): ImportRow => {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const name = row.name || row.Name || row.firstName || "";
    const email = (row.email || row.Email || "").trim();
    let role = (row.role || row.Role || "user").toLowerCase();
    
    if (role !== "admin" && role !== "user") role = "user";
    
    if (!email) errors.push("Email is required");
    else if (!emailRegex.test(email)) errors.push("Invalid email format");
    
    return {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      role,
      isValid: errors.length === 0,
      errors
    };
  };

  const processFile = (file: File) => {
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processed = results.data.map(validateRow);
          setRows(processed);
          if (processed.length > 0) toast.success(`Loaded ${processed.length} rows`);
        },
        error: (err) => toast.error(`CSV Error: ${err.message}`)
      });
    } else if (file.name.match(/\.(xlsx|xls)$/)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        const processed = json.map(validateRow);
        setRows(processed);
        if (processed.length > 0) toast.success(`Loaded ${processed.length} rows`);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Unsupported file format. Please upload CSV or Excel.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const handleImport = async () => {
    const validRows = rows.filter(r => r.isValid);
    if (validRows.length === 0) return toast.error("No valid rows to import.");
    
    setIsImporting(true);
    try {
      const result = await batchImportUsers(validRows.map(r => ({
        name: r.name,
        email: r.email,
        role: r.role
      })));
      setSummary({
        ...result,
        invalidRecords: rows.length - validRows.length,
        date: new Date().toLocaleString()
      });
      toast.success(`Successfully imported ${result.inserted} users!`);
      
      trackEvent('admin_bulk_import', {
        totalProcessed: rows.length,
        inserted: result.inserted,
        duplicatesSkipped: result.duplicatesSkipped,
        invalidRecordsSkipped: rows.length - validRows.length
      });
      
      setRows([]);
    } catch (error) {
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  if (summary) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Import Complete</h2>
          
          <div className="grid grid-cols-2 gap-4 text-left bg-card p-6 rounded-xl border border-border/50">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Processed</p>
              <p className="text-2xl font-bold">{summary.totalProcessed + summary.invalidRecords}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Successfully Imported</p>
              <p className="text-2xl font-bold text-emerald-500">{summary.inserted}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duplicates Skipped</p>
              <p className="text-2xl font-bold text-amber-500">{summary.duplicatesSkipped}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Invalid Records Skipped</p>
              <p className="text-2xl font-bold text-destructive">{summary.invalidRecords}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Imported on {summary.date}</p>
          
          <Button onClick={() => setSummary(null)} className="w-full">Start New Import</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {rows.length === 0 ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/30 hover:border-primary/50"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-2">CSV or Excel (XLSX) files supported</p>
            <p className="text-[10px] text-muted-foreground mt-1">Required columns: email, name (optional), role (optional)</p>
          </div>
          <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/50">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-primary"/> Preview Validation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {rows.filter(r => r.isValid).length} valid • {rows.filter(r => !r.isValid).length} invalid
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRows([])}>Cancel</Button>
              <Button onClick={handleImport} disabled={isImporting || rows.filter(r => r.isValid).length === 0}>
                {isImporting ? "Importing..." : "Confirm Import"}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0 max-h-[60vh] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id} className={row.isValid ? "hover:bg-muted/30" : "bg-destructive/5"}>
                      <td className="px-4 py-3">
                        {row.isValid ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1"/> Valid</Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"><AlertTriangle className="h-3 w-3 mr-1"/> Error</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.name || '-'}</td>
                      <td className="px-4 py-3">
                        {row.email}
                        {!row.isValid && <p className="text-[10px] text-destructive mt-0.5">{row.errors.join(", ")}</p>}
                      </td>
                      <td className="px-4 py-3 uppercase text-xs">{row.role}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeRow(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
