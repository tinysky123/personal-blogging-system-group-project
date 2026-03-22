<script>
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { onMount } from 'svelte';
  import SubscribeInfo from "./SubscribeInfo.svelte";  
  import Comment from "./Comment.svelte";
  import { getUserIdCookie } from '$lib/util.js';
  import { apiPost,apiDelete } from "$lib/api/api.js";
  import { page } from '$app/stores';


  
  export let article;
  export let tags;
  export let likes;
  export let liked;
  export let coverImage;

  let likeCount = likes ?? 0;
  let loggedIn = false;
  let isLoading = false;
  let currentUserId ='';
  

  onMount(() => {
    loggedIn = document.cookie.includes("tokenId=");
    currentUserId = getUserIdCookie();
  });

  async function likeArticle() {
    if (isLoading) return;
    if (!loggedIn) {
      // alert("Please log in to like this article");
      return;
    }

    isLoading = true;

    try {
      // const tokenId = document.cookie
      //   .split('; ')
      //   .find(row => row.startsWith('tokenId='))
      //   ?.split('=')[1];

      // const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${article.article_id}/like`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     authorization: `${tokenId}`,
      //     credentials: "include"
      //   },
      //   body: JSON.stringify({ liked: !liked })
      // });

      // if (!res.ok) {
      //   const errorText = await res.text();
      //   console.error(`Failed to update like: ${res.status} - ${errorText}`);
      //   return;
      // }

      await apiPost(`/articles/${article.article_id}/like`,{ liked: !liked });

      liked = !liked;
      likeCount = liked ? likeCount + 1 : likeCount - 1;
    } catch (err) {
      console.error('Error liking article:', err);
    } finally {
      isLoading = false;
    }
  }
  async function deleteArticle(articleId) {
  const confirmed = confirm('Are you sure you want to delete this article?');
  if (!confirmed) return;

  // const tokenId = document.cookie
  //   .split('; ')
  //   .find(row => row.startsWith('tokenId='))
  //   ?.split('=')[1];

  try {
  //   const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
  //     method: 'DELETE',
  //     headers: {
  //       "Content-Type": "application/json",
  //       authorization: `${tokenId}`
  //     },
  //     credentials: "include"
  //   });

  //   if (!res.ok) {
  //     const errText = await res.text();
  //     throw new Error(`Failed to delete article: ${res.status} - ${errText}`);
  //   }
    await apiDelete(`/articles/${articleId}`);
   
    window.location.href = "/myarticles";

  } catch (err) {
    alert('Failed to delete article.');
    console.error(err);
  }
}



</script>


<div class="breadcrumb">
<nav class="breadcrumb-item">
  <a href="/articles">Articles</a>
  <span class="separator"> / </span>
  <span class="current">{article.title}</span>
</nav>
</div>


<div class="article-wrapper">
  <aside class="user-card">
    <div class="author-box">
      <img
        src={`http://localhost:3000${article.avatar_url}`}
        alt="User Avatar"
        class="author-avatar"
      />
      <div>
        <h2>@{article.username}</h2>
        <SubscribeInfo authorId={article.user_id}/>
        
      </div>
    </div>
    <p class="description"><strong>About Me:</strong> {article.description}</p>
  </aside>

  <main class="article-content">
    <h1>{article.title}</h1>

    
    <div class="like-edit-wrapper">
      {#if Number(currentUserId) === Number(article.user_id)}
        <a href={`/createarticle?article_id=${article.article_id}`} class="icon-button" title="Edit">
          <img src="/icon-edit.png" alt="Edit" />
        </a>
    
        <button on:click={() => deleteArticle(article.article_id)} class="icon-button" title="Delete">
          <img src="/icon-delete.png" alt="Delete" />
        </button>
      {/if}
      {#if !loggedIn}
        <p style="color: gray; margin-top: 0.8rem; margin-left:0.5rem"> Please <a href='/login?redirect={$page.url}&reset=1'>log in</a>  to like this article</p>
      {/if}
      <button on:click={likeArticle} class="icon-button" title={liked ? "Unlike" : "Like"}>
        <img
          src={liked ? "/icon-heart2.png" : "/icon-heart.png"}
          alt={liked ? "Liked" : "Like"}
        />
      </button>
    
      <span class="like-count">{likeCount}</span>
    </div>
    
    


  


    {#if coverImage}
      <img src={`http://localhost:3000${coverImage}`} alt="Cover Image" class="cover-image" />
    {/if}

   

    <div class="info">
      <p><strong>Article ID:</strong> {article.article_id}</p>
      <p><strong>Last Updated:</strong> {article.updated_dttm}</p>
    </div>

    <hr />

    <div class="content">
      {@html article.content}
      {#if tags.length > 0}
      <div class="tags">
        <hr class="hr-glass" />
        <h3>Tags:</h3>
        <div class="tag-list">
          {#each tags as tag}
          <a href={`/tags/${tag}`} class="tag">#{tag}</a>
          {/each}
        </div>
      </div>
      {/if}
    </div>

    <div class="like-wrapper">
      <button on:click={likeArticle} class="like-button" aria-label="Like article">
        <img
          src={liked ? "/icon-heart2.png" : "/icon-heart.png"}
          alt={liked ? "Liked" : "Like"}
          class="icon-like"
        />
      </button>
      <span class="like-count">{likeCount}</span>
      {#if !loggedIn}
        <p style="color: gray; margin-top: 0.8rem; margin-left:0.5rem"> Please <a href='/login?redirect={$page.url}&reset=1'>log in</a>  to like this article</p>
      {/if}
    </div>
    <Comment articleId={article.article_id} articleAuthorId={article.user_id} />
  </main>
 
</div>




<style>
.article-wrapper {
  display: flex;
  gap: 2rem;
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1rem;
  align-items: flex-start;
  
}

.user-card {
  flex: 0 0 250px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(6px);
  border-left: 4px solid var(--brand-primary);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.author-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--brand-primary);
}

.user-card h2 {
  font-size: var(--heading-3-font-size);
  margin: 0;
  color: var(--primary-text);
}

 .description {
  font-size: var(--body-bigger-font-size);
  color: #555;
  text-align: center;
}


.article-content {
  flex: 1;
  background-color:  rgb(255,255,255,0.5);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.content{
  background-color:  rgb(255,255,255,0.6);
  border-radius: 3%;
  padding-left: 1rem;
}

.cover-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  padding-left: 1rem;
  color: #2c3e50;
  background-color:  rgb(255,255,255,0.6);
  border-radius: 6px;
}

.info {
  /* background: rgb(255,255,255,0.5); */
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: #444;
}

.tag-list {
  color: white;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  margin: 0.5em;
  background: var(--brand-primary-dark);
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  text-decoration: none;
  transition: 0.2s;
}

.tag:hover {
  background-color: var(--brand-primary);
  color: white;
}

.like-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  background-color: rgb(255,255,255,0.6);
  border-radius: var(--radius);
}

.like-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0.5rem;
}

.icon-like {
  width: 24px;
  height: 24px;
  transition: transform 0.2s;
}

.like-button:hover .icon-like {
  transform: scale(1.1);
}

.like-count {
  font-size: var(--heading-3-font-size);
  font-weight: bold;
  color: #2c3e50;
}

.breadcrumb {
      display: flex;
      flex-wrap: wrap;
      list-style: none;
      padding: 0;
      margin: 1em ;
      font-size: var(--body-bigger-font-size);
    }
  
    .breadcrumb-item {
      display: flex;
      align-items: center;
    }
  
    .breadcrumb-item a {
      text-decoration: none;
      color: #0077cc;
    }

    .breadcrumb-item a:hover{
        color: #555;
        font-weight: bold;

    }
  
    .breadcrumb-item .current {
      font-weight: bold;
      color: #555;
      text-decoration: underline;
    }
  
    .separator {
      margin: 0 0.5em;
      color: #aaa;
    }

    .hr-glass {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  margin: 1.5rem 0;
}


.like-edit-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}




.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.icon-button img {
  width: 21px;
  height: 21px;
  transition: transform 0.2s ease;
}

.icon-button:hover img {
  transform: scale(1.15);
}


@media (max-width: 768px) {
  .article-wrapper {
    flex-direction: column;
  }

  .user-card {
    width: 100%;
    margin-bottom: 1.5rem;
  }
}
</style>
