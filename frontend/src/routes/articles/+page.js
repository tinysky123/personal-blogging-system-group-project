

import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load() {
  try {
    // Fetch articles
    const responseArticles = await fetch(`${PUBLIC_API_BASE_URL}/articles`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!responseArticles.ok) throw new Error('Failed to fetch articles');
    const articles = await responseArticles.json();

    return { articles };

  } catch (error) {
    console.error('Failed to load data:', error);
    return { articles: []};
  }
}
