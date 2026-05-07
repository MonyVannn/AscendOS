// Smart Form mount should read cache first, then Convex, and rely on invalidation after settings save.

interface ProfileCache {
  name: string;
  bookingLink: string;
  updatedAt: number;
}

const profileCache = new Map<string, ProfileCache>();

export function primeRdProfileCache(userId: string, data: ProfileCache) {
  profileCache.set(userId, data);
}

export function getRdProfileCache(userId: string): ProfileCache | undefined {
  return profileCache.get(userId);
}

export function invalidateRdProfileCache(userId: string) {
  profileCache.delete(userId);
}
