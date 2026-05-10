import { siteConfig, type SiteConfig } from '../site.config';

const CMS_SITE_CONFIG_URL = import.meta.env.VITE_CMS_SITE_CONFIG_URL as string | undefined;
const CMS_BEARER_TOKEN = import.meta.env.VITE_CMS_BEARER_TOKEN as string | undefined;

export async function loadSiteConfigFromCms(): Promise<SiteConfig> {
  if (!CMS_SITE_CONFIG_URL) {
    return siteConfig;
  }

  const headers: Record<string, string> = {};
  if (CMS_BEARER_TOKEN) {
    headers.Authorization = `Bearer ${CMS_BEARER_TOKEN}`;
  }

  const response = await fetch(CMS_SITE_CONFIG_URL, { headers });
  if (!response.ok) {
    throw new Error(`CMS request failed: ${response.status}`);
  }

  const data = (await response.json()) as SiteConfig;
  return data;
}
