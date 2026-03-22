import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { apiGet, apiPost, apiDelete, apiPatch } from '$lib/api/api.js';


/**
 * @author [Annie]
 * @param {Object} param0 
 * @param {string} param0.tokenId - User token for authentication
 * @param {string} param0.title - Title of the article
 * @param {string} param0.content - HTML content
 * @param {string[]} param0.tags - Array of tag names
 * @returns {Promise<Object>}
 * @throws Will throw an error 
 */

export async function createArticle({ tokenId, title, content, tags }) {
  // const res = await fetch(`${PUBLIC_API_BASE_URL}/articles`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', authorization:`${tokenId}` },
  //   credentials: 'include',
  //   body: JSON.stringify({ title, content, tags })
  // });

  // if (!res.ok) {
  //   throw new Error('Failed to create article');
  // }

  // return await res.json();
  const res=await apiPost(`/articles`,{ title, content, tags });
  return res;
}



export async function updateArticle({ tokenId, title, content, articleId, tags }) {

  // console.log('TokenID:', tokenId);
  
  // const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json', authorization:`${tokenId}` },
  //   credentials: 'include',
  //   body: JSON.stringify({ title, content, tags })
  // });

  // if (!res.ok) {
  //   throw new Error('Failed to update article');
  // }

  // return await res.json();

  const res=await apiPatch(`/articles/${articleId}`,{ title, content, tags });
  return res;
}

export async function uploadImage(tokenId, articleId, file) {
  const formData = new FormData();
  formData.append("image-file", file);

  const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/images`, {
    method: "POST",
    headers: { authorization:`${tokenId}` },
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return await response.json(); 
}



export async function insertImage(tokenId, file) {
  const resizedFile = await resizeImage(file, 600);
  const formData = new FormData();
  formData.append("image-file", resizedFile);

  const response = await fetch(`${PUBLIC_API_BASE_URL}/articles/images`, {
    method: "POST",
    headers: { authorization:`${tokenId}` },
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return await response.json(); 
}



export async function fetchSuggestedTags(tokenId, text) {
  try {
    // const response = await fetch(`${PUBLIC_API_BASE_URL}/tags/suggest`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', authorization:`${tokenId}` },
    //   credentials: 'include',
    //   body: JSON.stringify({ text })
    // });
    // const json = await response.json();
    // if (!response.ok || json.status !== 'success') {
    //   throw new Error(json.message || 'Failed to fetch suggested tags');
    // }
    // return json.data.tags; 

    const res=await apiPost(`/tags/suggest`,{ text });
    return res.data.tags;
  } catch (err) {
    console.error('Error fetching suggested tags:', err);
    return [];
  }
}



async function deleteArticle(articleId) {
  const confirmed = confirm('Are you sure you want to delete this article?');
  if (!confirmed) return;
  
  // const tokenId = document.cookie
  // .split('; ')
  // .find(row => row.startsWith('tokenId='))
  // ?.split('=')[1];

  try {
    // const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
    //   method: 'DELETE',
    //   headers: { "Content-Type": "application/json",  authorization:`${tokenId}` },
    //   credentials: "include"
    // });

    // if (!res.ok) {
    // const errText = await res.text();
    // throw new Error(`Failed to delete article: ${res.status} - ${errText}`);
    // }

    await apiDelete(`/articles/${articleId}`);
    articles = articles.filter(article => article.article_id !== articleId);
    await invalidate();
    
  } catch (err) {
    alert('Failed to delete article.');
    console.error(err);
  }
}


function resizeImage(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        blob => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve(resizedFile);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        file.type,
        0.7 // Quality (0.0 - 1.0), adjust to compress more
      );
    };

    img.onerror = err => reject(err);

    reader.readAsDataURL(file);
  });
}
