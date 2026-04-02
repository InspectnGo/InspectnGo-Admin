import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function AppConfigCard() {
  const { apiKey, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const api = createApi(
    () => apiKey,
    () => { logout(); navigate("/login"); },
  );

  const { data: config, isLoading } = useQuery({
    queryKey: ["appConfig"],
    queryFn: () => api.getConfig(),
  });

  const [versionInput, setVersionInput] = useState("");

  const maintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => api.updateConfig({ maintenance_mode: enabled }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appConfig"] });
      toast.success(`Maintenance mode ${data.maintenance_mode ? "enabled" : "disabled"}`);
    },
    onError: () => toast.error("Failed to update maintenance mode"),
  });

  const versionMutation = useMutation({
    mutationFn: (version: string) => api.updateConfig({ min_app_version: version }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appConfig"] });
      setVersionInput("");
      toast.success(`Min app version updated to ${data.min_app_version}`);
    },
    onError: () => toast.error("Failed to update min app version"),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">App Configuration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Maintenance Mode:</span>
          <Badge variant={config?.maintenance_mode ? "destructive" : "secondary"}>
            {config?.maintenance_mode ? "On" : "Off"}
          </Badge>
          <Button
            size="sm"
            variant={config?.maintenance_mode ? "outline" : "destructive"}
            disabled={maintenanceMutation.isPending}
            onClick={() => maintenanceMutation.mutate(!config?.maintenance_mode)}
          >
            {maintenanceMutation.isPending
              ? "Updating..."
              : config?.maintenance_mode
                ? "Disable"
                : "Enable"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Min App Version:</span>
          <Badge variant="secondary">{config?.min_app_version}</Badge>
          <Input
            className="w-32"
            placeholder="e.g. 1.2.0"
            value={versionInput}
            onChange={(e) => setVersionInput(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!versionInput.trim() || versionMutation.isPending}
            onClick={() => versionMutation.mutate(versionInput.trim())}
          >
            {versionMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
