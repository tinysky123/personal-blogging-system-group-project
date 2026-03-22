

import { PUBLIC_API_BASE_URL } from "$env/static/public";
import { apiGet } from '$lib/api/api.js';


export async function load({ fetch }) {

  const tokenId = document.cookie
  .split('; ')
  .find(row => row.startsWith('tokenId='))
  ?.split('=')[1];

  console.log(tokenId);

  // const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/me`, {
  //   method: "GET",
  //   headers: { "Content-Type": "application/json",  authorization:`${tokenId}` },
  //   credentials: "include"
    
  // });
  const res= await apiGet(`/articles/me`);


  // if (!res.ok) {
  //   console.error("Failed to fetch user's articles");
  //   return { articles: [] };
  // }

  // const articles = await res.json();
  const articles = res;
  console.log(articles)
  return { articles };
}

