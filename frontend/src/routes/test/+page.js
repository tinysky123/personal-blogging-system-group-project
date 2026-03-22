
import { PUBLIC_API_BASE_URL } from "$env/static/public";


export async function load({ params, fetch }) {
  const tag = params.tag.toLowerCase();

  const res = await fetch(`${PUBLIC_API_BASE_URL}/articles?tag=${tag}`);

  if (!res.ok) {
    return {
      status: res.status,
      error: new Error(`Could not fetch articles with tag "${tag}"`)
    };
  }

  const articles = await res.json();
  return { tag, articles };
}

export const csr = true;

