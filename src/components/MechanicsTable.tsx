import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ImageIcon,
  CheckCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentViewerDialog } from "./DocumentViewerDialog";
import { createApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { AdminMechanic } from "@/types";

type SortKey = "name" | "created_at" | "is_verified";
type SortDir = "asc" | "desc";

export function MechanicsTable() {
  const { apiKey, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const api = createApi(
    () => apiKey,
    () => { logout(); navigate("/login"); },
  );

  const { data: mechanics, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: () => api.getMechanics(),
  });

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [docDialog, setDocDialog] = useState<{
    mechanicId: string;
    documentType: string;
    title: string;
  } | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (mechanicId: string) => api.verifyMechanic(mechanicId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] });
      toast.success("Mechanic verified");
    },
    onError: () => {
      toast.error("Failed to verify mechanic");
    },
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!mechanics) return [];
    const copy = [...mechanics];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      switch (sortKey) {
        case "name": {
          const nameA = `${a.last_name ?? ""} ${a.first_name ?? ""}`.toLowerCase();
          const nameB = `${b.last_name ?? ""} ${b.first_name ?? ""}`.toLowerCase();
          return nameA.localeCompare(nameB) * dir;
        }
        case "created_at": {
          const dateA = a.created_at ?? "";
          const dateB = b.created_at ?? "";
          return dateA.localeCompare(dateB) * dir;
        }
        case "is_verified":
          return (Number(a.is_verified) - Number(b.is_verified)) * dir;
      }
    });
    return copy;
  }, [mechanics, sortKey, sortDir]);

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => {
    const Icon = sortKeyName === sortKey
      ? sortDir === "asc" ? ArrowUp : ArrowDown
      : ArrowUpDown;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-semibold"
        onClick={() => toggleSort(sortKeyName)}
      >
        {label}
        <Icon className="ml-1 h-3 w-3" />
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortHeader label="Name" sortKeyName="name" />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City / Province</TableHead>
              <TableHead>Trades ID</TableHead>
              <TableHead>
                <SortHeader label="Verified" sortKeyName="is_verified" />
              </TableHead>
              <TableHead>
                <SortHeader label="Created" sortKeyName="created_at" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No mechanics found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((m) => (
                <MechanicRow
                  key={m.id}
                  mechanic={m}
                  onVerify={() => verifyMutation.mutate(m.id)}
                  onViewDoc={(type, title) =>
                    setDocDialog({ mechanicId: m.id, documentType: type, title })
                  }
                  verifying={verifyMutation.isPending}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {docDialog && (
        <DocumentViewerDialog
          open
          onOpenChange={() => setDocDialog(null)}
          mechanicId={docDialog.mechanicId}
          documentType={docDialog.documentType}
          title={docDialog.title}
        />
      )}
    </>
  );
}

function MechanicRow({
  mechanic: m,
  onVerify,
  onViewDoc,
  verifying,
}: {
  mechanic: AdminMechanic;
  onVerify: () => void;
  onViewDoc: (type: string, title: string) => void;
  verifying: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const hasAnyDoc =
    m.has_driver_license || m.has_garage_liability_insurance || m.has_driver_insurance;

  const name =
    m.first_name || m.last_name
      ? `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim()
      : "—";

  const location =
    m.city || m.province
      ? `${m.city ?? ""}${m.city && m.province ? ", " : ""}${m.province ?? ""}`
      : "—";

  const created = m.created_at
    ? new Date(m.created_at).toLocaleDateString()
    : "—";

  const docs = [
    { key: "driver_license", label: "Driver License", has: m.has_driver_license },
    { key: "garage_liability_insurance", label: "Garage Liability Insurance", has: m.has_garage_liability_insurance },
    { key: "driver_insurance", label: "Driver Insurance", has: m.has_driver_insurance },
  ] as const;

  return (
    <TableRow>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="text-sm">{m.email}</TableCell>
      <TableCell className="text-sm">{location}</TableCell>
      <TableCell className="text-sm font-mono">
        {m.skilled_trades_bc_id ?? "—"}
      </TableCell>
      <TableCell>
        {m.is_verified ? (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Verified
          </Badge>
        ) : (
          <Badge variant="secondary">Unverified</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm">{created}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {!m.is_verified && (
            <Button
              variant="outline"
              size="sm"
              onClick={onVerify}
              disabled={verifying}
              title="Verify mechanic"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {hasAnyDoc && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPickerOpen(true)}
                title="View documents"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader>
                    <DialogTitle>Documents</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-1">
                    {docs.filter((d) => d.has).map((d) => (
                      <Button
                        key={d.key}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          setPickerOpen(false);
                          onViewDoc(d.key, d.label);
                        }}
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
