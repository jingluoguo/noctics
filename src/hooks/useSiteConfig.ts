import { useEffect, useState } from 'react';
import { loadSiteConfigFromCms } from '../lib/cms';
import { siteConfig, type SiteConfig } from '../site.config';

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(siteConfig);

  useEffect(() => {
    let isDisposed = false;

    loadSiteConfigFromCms()
      .then((nextConfig) => {
        if (!isDisposed) {
          setConfig(nextConfig);
        }
      })
      .catch((error) => {
        console.warn('Failed to load CMS site config, fallback to local config.', error);
      });

    return () => {
      isDisposed = true;
    };
  }, []);

  return config;
}
