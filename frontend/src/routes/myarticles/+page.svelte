<script>
    import { goto } from '$app/navigation';
    import { substringHTML } from '$lib/util.js';
    import { invalidate } from '$app/navigation';
    import {  apiDelete } from '$lib/api/api.js';


    export let data;
    let articles = data.articles;
    articles = [...data.articles].sort(
       (a, b) => new Date(b.updated_dttm) - new Date(a.updated_dttm)
        );


  function goToCreateArticle() {
  goto('/createarticle');
  }


  function editArticle(article) {
  const params = new URLSearchParams();
  if (article.article_id) params.set('article_id', article.article_id);
  goto(`/createarticle?${params.toString()}`);
}


  async function deleteArticle(articleId) {
    const confirmed = confirm('Are you sure you want to delete this article?');
    if (!confirmed) return;
    
    // const tokenId = document.cookie
    // .split('; ')
    // .find(row => row.startsWith('tokenId='))
    // ?.split('=')[1];

    try {
    //   const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`, {
    //     method: 'DELETE',
    //     headers: { "Content-Type": "application/json",  authorization:`${tokenId}` },
    //     credentials: "include"
    //   });

    //   if (!res.ok) {
    //   const errText = await res.text();
    //   throw new Error(`Failed to delete article: ${res.status} - ${errText}`);
    // }


      await apiDelete(`/articles/${articleId}`);
      articles = articles.filter(article => article.article_id !== articleId);
      await invalidate();
      
    } catch (err) {
      alert('Failed to delete article.');
      console.error(err);
    }
  }



  </script>
  
  
  <div class="main-container">
    <div class="user-info">
      
      <aside class="user-card">
        <div class="author-box">
          <img
            src={"http://localhost:3000" + articles[0]?.avatar_url}
            alt="User Avatar"
            class="author-avatar"
          />
          <div>
            <h2>@{articles[0]?.username}</h2>
            <p>{articles[0]?.followers ?? 0} Followers</p>
          </div>
        </div>
        {#if articles[0].description.trim() !== ''}
        <p class="description"><strong>About Me:</strong> { articles[0].description}</p>
        {/if}
       
      
      </aside>

    </div>
  
    <div class="article-list">
      <div class="header">
        <button class="create-post-button" on:click={goToCreateArticle}>+ CREATE POST</button>
      </div>
  
      {#if articles.filter(article => article.article_id !== null).length === 0}
        <p> @{articles[0]?.username}, you have no yet posted article.</p>
      {:else}
      {#each articles.filter(article => article.article_id !== null) as article}
        <article>
          <div class="article-content">
            <a href={`/articles/${article.article_id}`}>
            <img
              src={article.image_url ? "http://localhost:3000" + article.image_url : "/placeholder.jpg"}
              alt="Article Cover"
              class="article-thumbnail"
            />
            </a>
        
            <div class="article-body">
              <a href={`/articles/${article.article_id}`} class="article-title">{article.title}</a>
              <p>{substringHTML(article.content).slice(0, 150)}...</p>
              <div class="meta">
                <span>&#x2661; {article.like_cnt || 0} Likes</span>
                <span>💬 {article.comment_cnt || 0} Comments</span>
                <span>🕒 {article.updated_dttm || '—'}</span>
              </div>
            </div>
          </div>
        
          <div class="actions">
            <button class="icon-button" title="Edit" on:click={() => editArticle(article)}>
              <img src="/icon-edit.png" alt="Edit" />
            </button>
            <button class="icon-button" title="Delete" on:click={() => deleteArticle(article.article_id)}>
              <img src="/icon-delete.png" alt="Delete" />
            </button>
          </div>
        </article>
        
        {/each}
      {/if}
    </div>
  </div>
  
<style>
  .main-container {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    padding: 2rem;
    flex-wrap: nowrap;
    /* background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%); */
    min-height: 100vh;
    box-sizing: border-box;
  }
  
  .user-info {
    width: 260px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    border-radius: var(--radius);
    padding: 2rem 1.2rem;
    text-align: center;
    box-shadow: var(--shadow);
    flex-shrink: 0;
    font-family: 'Inter', sans-serif;
  }
  
  .user-info img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
  }
  
  .user-info p {
    font-size: var( --heading-3-font-size);
    color: var(--primary-text);
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }
  

  .user-card {
    
  max-width: 250px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  border-left: 4px solid var(--brand-primary);
  padding: 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}


.author-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--brand-primary);
}

.user-card h2 {
  font-size:var( --heading-2-font-size);
  margin: 0;
  color: var(--primary-text);
}


  .article-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .header {
    display: flex;
    justify-content: flex-end;
  }
  
  .create-post-button {
    background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    font-size: 1rem;
    border-radius: var(--radius);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    font-weight: bold;
  }
  
  .create-post-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  article {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem;
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(8px);
    box-shadow: var(--shadow);
    transition: transform 0.2s ease;
    position: relative;
  }
  
  article:hover {
    transform: translateY(-3px);
  }
  
  .article-content {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }
  
  .article-thumbnail {
    width: 130px;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    flex-shrink: 0;
  }
  
  .article-body {
    flex: 1;
  }
  
  .article-title {
    font-size: var( --heading-2-font-size);
    font-weight: 600;
    color: var(--brand-primary);
    text-decoration: none;
  }
  
  .article-title:hover {
    text-decoration: underline;
  }
  
  .article-body p {
    font-size: var( --heading-3-font-size);
    color: #444;
    margin: 0.5rem 0;
    line-height: 1.5;
  }
  
  .meta {
    font-size: var(--body-bigger-font-size);
    color: var(--icon);
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.7rem;
  }
  
  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.3rem;
  }
  
  .icon-button img {
    width: 20px;
    height: 20px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  
  .icon-button:hover img {
    opacity: 1;
  }
  

  .description {
  display: -webkit-box;
  -webkit-line-clamp: 4;     
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

  
  @media (max-width: 768px) {
    .main-container {
      flex-direction: column;
      padding: 1rem;
    }
  
    .user-info {
      width: 100%;
    }
  
    .article-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  
    .article-thumbnail {
      width: 100%;
      max-width: 300px;
      height: auto;
    }
  
    .article-body {
      text-align: center;
    }
  
    .actions {
      position: static;
      justify-content: center;
      margin-top: 1rem;
    }
  }
</style>  