"use client";

import { useState } from "react";
import { MessageSquare, UserPlus } from "lucide-react";
import AppShell from "@/components/AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/lib/toast-context";
import { Role } from "@/types/auth";

export default function CollaborationPage() {
  const [note, setNote] = useState("Need approval on P-103 stock correction.");
  const { pushToast } = useToast();

  return (
    <ProtectedRoute roles={[Role.MANAGER, Role.STORE_KEEPER]}>
      <AppShell>
        <Card>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Collaboration Workspace</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Mentions, comments, and operational handoffs.</p>
        </Card>

        <Card className="space-y-3">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write note..." />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => pushToast({ title: "Comment posted", message: note, tone: "success" })}>
              <MessageSquare className="h-4 w-4" />
              Post Comment
            </Button>
            <Button variant="secondary" onClick={() => pushToast({ title: "Task assigned", message: "Manager notified", tone: "info" })}>
              <UserPlus className="h-4 w-4" />
              Assign to Manager
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge>@operations-team</Badge>
            <Badge>Open Task: 6</Badge>
          </div>
        </Card>
      </AppShell>
    </ProtectedRoute>
  );
}
