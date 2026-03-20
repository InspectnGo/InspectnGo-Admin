const API_BASE = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createApi(getApiKey: () => string | null, onUnauthorized: () => void) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const apiKey = getApiKey();
    if (!apiKey) {
      onUnauthorized();
      throw new ApiError(401, "No API key");
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (res.status === 401 || res.status === 403) {
      onUnauthorized();
      throw new ApiError(res.status, "Unauthorized");
    }

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, body);
    }

    return res.json() as Promise<T>;
  }

  return {
    getMechanics: () => request<import("@/types").AdminMechanic[]>("/admin/mechanics"),

    getMechanicDocuments: (mechanicId: string, documentType: string) =>
      request<import("@/types").DocumentUrlsResponse>(
        `/admin/mechanics/${encodeURIComponent(mechanicId)}/documents/${encodeURIComponent(documentType)}`,
      ),

    verifyMechanic: (mechanicId: string, isVerified: boolean) =>
      request(`/admin/mechanic/${encodeURIComponent(mechanicId)}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ is_verified: isVerified }),
      }),

    getLandingPageMechanics: (skip = 0, limit = 50) =>
      request<import("@/types").LandingPageEntry[]>(`/admin/landing-page/mechanics?skip=${skip}&limit=${limit}`),

    getLandingPageCustomers: (skip = 0, limit = 50) =>
      request<import("@/types").LandingPageEntry[]>(`/admin/landing-page/customers?skip=${skip}&limit=${limit}`),

    // Validate key by calling mechanics endpoint
    validateKey: (key: string) =>
      fetch(`${API_BASE}/admin/mechanics`, {
        headers: { "X-Api-Key": key },
      }).then((res) => res.ok),
  };
}
