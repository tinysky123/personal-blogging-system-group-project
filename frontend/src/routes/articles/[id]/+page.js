import { PUBLIC_API_BASE_URL } from "$env/static/public";

export async function load({ params, fetch }) {
  const id = params.id;

  // Fetch article
  const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}`);
  if (!res.ok) {
    return {
      status: res.status,
      error: new Error('Could not load article')
    };
  }

  const article = await res.json();

  // Fetch tags
  let tags = [];
  try {
    const tagsRes = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}/tags`);
    if (tagsRes.ok) {
      const tagsJson = await tagsRes.json();
      tags = tagsJson.data || [];
    } else {
      console.warn(`Could not load tags for article ${id}`);
    }
  } catch (e) {
    console.warn('Tags fetch error:', e);
  }

  // Fetch likes
  let likes = 0;
  try {
    const likesRes = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}/likes`);
    if (likesRes.ok) {
      const likesJson = await likesRes.json();
      likes = likesJson.likes?.like_cnt ?? 0;
    } else {
      console.warn(`Could not load likes for article ${id}`);
    }
  } catch (e) {
    console.warn('Likes fetch error:', e);
  }

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

  // Fetch images and extract image_id=1
  let coverImage = null;
  try {
    const imagesRes = await fetch(`${PUBLIC_API_BASE_URL}/articles/${id}/images`);
    if (imagesRes.ok) {
      const imagesJson = await imagesRes.json();

      if (imagesJson.status === 'success' && Array.isArray(imagesJson.data)) {
        const image1 = imagesJson.data.find(img => img.image_id === 1);
        if (image1) {
          coverImage = image1.image_url;
        }
      }
    } else {
      console.warn(`Could not load images for article ${id}`);
    }
  } catch (e) {
    console.warn('Image fetch error:', e);
  }

  console.log("datttt",article);
  return {
    article,
    tags,
    likes,
    liked,
    coverImage
  };
}
