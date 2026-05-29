const LOCAL_API_URL = "http://localhost:8000";
const DEPLOY_API_URL = "/api";

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function normalizeApiUrl(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL;
  const browserHostname = typeof window === "undefined" ? "" : window.location.hostname;
  const isLocalBrowser = isLocalHost(browserHostname);

  if (configuredUrl) {
    const normalizedUrl = normalizeApiUrl(configuredUrl);

    if (!isLocalBrowser && normalizedUrl.startsWith("http://")) {
      return DEPLOY_API_URL;
    }

    return normalizedUrl;
  }

  if (isLocalBrowser) {
    return LOCAL_API_URL;
  }

  return DEPLOY_API_URL;
}

export const API_URL = resolveApiUrl();
