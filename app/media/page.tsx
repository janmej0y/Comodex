"use client";

import { useState } from "react";
import { FileImage, FileText, UploadCloud } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Role } from "@/types/auth";

export default function MediaPage() {
  const [files, setFiles] = useState<string[]>(["invoice-201.pdf", "product-shot-p101.jpg"]);

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">File & Media Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload invoices, GRN docs, and product assets.</p>
          <Button className="mt-3" onClick={() => setFiles((prev) => [`upload-${prev.length + 1}.pdf`, ...prev])}>
            <UploadCloud className="h-4 w-4" />
            Simulate Upload
          </Button>
        </Card>

        <Card className="space-y-2">
          {files.map((file) => (
            <div key={file} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <div className="flex items-center gap-2">
                {file.endsWith(".pdf") ? <FileText className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                <span className="text-slate-700 dark:text-slate-200">{file}</span>
              </div>
              <Badge>Processed</Badge>
            </div>
          ))}
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}