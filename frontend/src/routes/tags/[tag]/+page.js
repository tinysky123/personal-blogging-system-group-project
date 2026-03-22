
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


// Fetch liked status
let liked = false;
try {
  const tokenId = document.cookie
    .split('; ')
    .find(row => row.startsWith('tokenId='))
    ?.split('=')[1];

  if (tokenId) {
    const likedRes = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}/liked`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": tokenId
      },
      credentials: "include"
    });

    if (likedRes.ok) {
      const likedJson = await likedRes.json();
      liked = likedJson.liked;
    } else {
      console.warn(`Could not load liked status for article ${id}`);
    }
  } else {
    console.log('User is not logged in — skipping liked fetch');
  }
} catch (e) {
  console.warn('Error checking liked status:', e);
}


  return { tag, articles, liked };
}



// export async function load({ params, fetch }) {
//   const tag = params.tag.toLowerCase();

//   const res = await fetch(`${PUBLIC_API_BASE_URL}/articles?tag=${tag}`);

//   if (!res.ok) {
//     return {
//       status: res.status,
//       error: new Error(`Could not fetch articles with tag "${tag}"`)
//     };
//   }

//   const articles = await res.json();
//   return { tag, articles };
// }

export const csr = true;

