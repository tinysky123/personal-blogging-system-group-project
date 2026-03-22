
import { PUBLIC_API_BASE_URL } from "$env/static/public";
import {  apiGet } from '$lib/api/api.js';

export async function load({ params, fetch }) {
  

  // const res = await fetch(`${PUBLIC_API_BASE_URL}/articles`);

  // if (!res.ok) {
  //   return {
  //     status: res.status,
  //     error: new Error(`Could not fetch articles`)
  //   };
  // }
  
  // const articles = await res.json();
  const res=await apiGet(`/articles`);
  const articles =res;
  return { articles };
}

export const csr = true;

