import type { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;
  
  // The 'path' parameter is a catch-all [[path]]
  // If the URL is /api/v1/user, params.path will be ["v1", "user"]
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const url = new URL(request.url);
  
  // Target API base URL
  const targetBase = "https://goldapi.skafold.app/api";
  const targetUrl = `${targetBase}/${path}${url.search}`;

  // Create a new request to the target API
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual',
  });

  // Fetch from the external API and return the response
  return fetch(proxyRequest);
};
