function normalizeBase(base: string) {
  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function isExternalUrl(url: string) {
  return /^(https?:)?\/\//i.test(url);
}

function isSpecialUrl(url: string) {
  return /^(data:|blob:|mailto:|tel:|#)/i.test(url);
}

export function withBaseAssetUrl(input: string) {
  const url = input.trim();
  if (!url) return url;
  if (isExternalUrl(url) || isSpecialUrl(url)) return url;
  if (!url.startsWith('/')) return url;

  const base = normalizeBase(import.meta.env.BASE_URL || '/');
  if (base === '/' || url.startsWith(base)) return url;
  return `${base}${url.slice(1)}`;
}

