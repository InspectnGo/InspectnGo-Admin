// In-memory cache: "mechanicId:docType" → blob URL[]
const cache = new Map<string, string[]>();

export function getCachedImages(
  mechanicId: string,
  documentType: string,
): string[] | undefined {
  return cache.get(`${mechanicId}:${documentType}`);
}

export function setCachedImages(
  mechanicId: string,
  documentType: string,
  blobUrls: string[],
): void {
  cache.set(`${mechanicId}:${documentType}`, blobUrls);
}

export function clearImageCache(): void {
  for (const urls of cache.values()) {
    urls.forEach(URL.revokeObjectURL);
  }
  cache.clear();
}
