import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { createApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCachedImages, setCachedImages } from "@/lib/imageCache";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mechanicId: string;
  documentType: string;
  title: string;
}

export function DocumentViewerDialog({
  open,
  onOpenChange,
  mechanicId,
  documentType,
  title,
}: Props) {
  const { apiKey, logout } = useAuth();
  const navigate = useNavigate();

  const api = createApi(
    () => apiKey,
    () => { logout(); navigate("/login"); },
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["documents", mechanicId, documentType],
    queryFn: async () => {
      const cached = getCachedImages(mechanicId, documentType);
      if (cached) return { urls: cached };

      const { urls: signedUrls } = await api.getMechanicDocuments(mechanicId, documentType);
      const blobUrls = await Promise.all(
        signedUrls.map(async (url) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }),
      );
      setCachedImages(mechanicId, documentType, blobUrls);
      return { urls: blobUrls };
    },
    enabled: open,
    staleTime: Infinity,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-ing-heading">{title}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-2 py-8">
            <p className="text-sm text-muted-foreground">
              Failed to load documents
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {data.urls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${title} ${i + 1}`}
                className="w-full rounded-lg border"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
