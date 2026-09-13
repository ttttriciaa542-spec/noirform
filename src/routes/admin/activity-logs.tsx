import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { fetchAdminActivityLogs } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/activity-logs")({
  component: AdminActivityLogs,
});

const ACTION_STYLES: Record<string, string> = {
  create: "bg-green-500/10 text-green-700 border-green-200",
  update: "bg-blue-500/10 text-blue-700 border-blue-200",
  delete: "bg-red-500/10 text-red-700 border-red-200",
  publish: "bg-purple-500/10 text-purple-700 border-purple-200",
  unpublish: "bg-gray-500/10 text-gray-700 border-gray-200",
  archive: "bg-gray-500/10 text-gray-700 border-gray-200",
  restore: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  order_status_change: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  order_payment_change: "bg-orange-500/10 text-orange-700 border-orange-200",
  order_fulfill: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  customer_create: "bg-green-500/10 text-green-700 border-green-200",
  customer_update: "bg-blue-500/10 text-blue-700 border-blue-200",
  discount_create: "bg-green-500/10 text-green-700 border-green-200",
  discount_update: "bg-blue-500/10 text-blue-700 border-blue-200",
  settings_change: "bg-amber-500/10 text-amber-700 border-amber-200",
  bulk_action: "bg-purple-500/10 text-purple-700 border-purple-200",
  import: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  export: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  login: "bg-gray-500/10 text-gray-700 border-gray-200",
  logout: "bg-gray-500/10 text-gray-700 border-gray-200",
};

function AdminActivityLogs() {
  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/admin/activity-logs"],
    queryFn: fetchAdminActivityLogs,
  });

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="display-xl text-3xl sm:text-4xl">Activity Logs</h1>
            <p className="mt-2 text-sm text-muted-foreground">Track admin actions and changes</p>
          </div>
          <Badge variant="secondary">{logs.length} entries</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="size-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load activity logs</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Loader2 className="size-4 animate-spin" /> Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground">Actions will be logged here</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ACTION_STYLES[log.action] ?? ``} text-xs capitalize`}>
                        {log.action.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-xs">{log.resourceType}</TableCell>
                    <TableCell className="text-xs">{log.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
  );
}
