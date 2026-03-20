import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type SortKey = "email" | "created_at";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 50;

export function LPCustomersTable() {
  const { apiKey, logout } = useAuth();
  const navigate = useNavigate();

  const api = createApi(
    () => apiKey,
    () => { logout(); navigate("/login"); },
  );

  const [page, setPage] = useState(0);

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["lp-customers", page],
    queryFn: () => api.getLandingPageCustomers(page * PAGE_SIZE, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  const hasNextPage = (data?.length ?? 0) === PAGE_SIZE;

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    if (!data) return [];
    const copy = [...data];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      switch (sortKey) {
        case "email": {
          const emailA = (a.email ?? "").toLowerCase();
          const emailB = (b.email ?? "").toLowerCase();
          return emailA.localeCompare(emailB) * dir;
        }
        case "created_at": {
          const dateA = a.created_at ?? "";
          const dateB = b.created_at ?? "";
          return dateA.localeCompare(dateB) * dir;
        }
      }
    });
    return copy;
  }, [data, sortKey, sortDir]);

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
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead><SortHeader label="Email" sortKeyName="email" /></TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead><SortHeader label="Created At" sortKeyName="created_at" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!sorted.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No entries found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                  <TableCell className="text-sm">{entry.email ?? "—"}</TableCell>
                  <TableCell className="text-sm">{entry.phone_number ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {entry.created_at
                      ? new Date(entry.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page + 1}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage || isPlaceholderData}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
