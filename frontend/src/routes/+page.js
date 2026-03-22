

import { apiGet, apiPost, apiDelete, apiPatch } from '$lib/api/api.js';
import { PUBLIC_API_BASE_URL } from "$env/static/public";

export const prerender = true;

export async function load({ fetch }) {
  // const [mostLikedRes, latestRes] = await Promise.all([
  //   fetch(`${PUBLIC_API_BASE_URL}/articles/most-liked-top-5`),
  //   fetch(`${PUBLIC_API_BASE_URL}/articles/latest-top-5`)
  // ]);

  // const mostLiked = mostLikedRes.ok ? await mostLikedRes.json() : [];
  // const latest = latestRes.ok ? await latestRes.json() : [];
  const mostLiked = await apiGet(`/articles/most-liked-top-5`);
  const latest = await apiGet(`/articles/latest-top-5`);
  
  return {
    mostLiked,
    latest
  };
}


