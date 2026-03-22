<script>
    import { substringHTML } from '$lib/util.js';
    import Breadcrumbs from '../../lib/components/Breadcrumbs.svelte';
    export let data;
    $: articles = data.articles;

    const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'How to Use Breadcrumbs', href: null } // current page
];

</script>






<Breadcrumbs {breadcrumbItems} />


<body>
  
  
  {#if articles.length > 0}
    <ul class="article-list">
      {#each articles as article}
      <li class="article-item">
        <a href={`/articles/${article.article_id}`} class="article-link">
          <div class="article-header">
            <img
              src={"http://localhost:3000" + article.avatar_url}
              alt="Author Avatar"
              class="avatar"
            />
            <div class="header-text">
              <p class="author-name">{article.username}</p>
              <p class="post-date">{article.created_dttm?.slice(0, 10)}</p>
            </div>
          </div>
      
          <h2 class="article-title">{article.title}</h2>
      
          {#if article.image_url}
            <img src={"http://localhost:3000" + article.image_url} alt="Cover Image" class="cover-img" />
          {/if}
      
          <p class="summary">
            {@html substringHTML(article.content)}
          </p>
        </a>
      </li>
      
      {/each}
    </ul>
  {:else}
    <p>No articles found with this tag.</p>
  {/if}
  </body>
  
  <style>
  body{
    background-color: rgb(255,255,255,0.5);
    border-radius: var(--radius);
  }
  
  h1 {
    font-size: 2.2rem;
    margin: 2rem auto;
    text-align: center;
    color: var(--brand-primary);
    font-weight: 700;
    letter-spacing: 0.5px;
    
  }
  
  .article-list {
    list-style: none;
    padding: 0;
    max-width: 750px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .article-item {
    background: rgb(255,255,255,0.7);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    padding: 1rem 1.5rem;
  }
  
  .article-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .article-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  
  .article-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.8rem;
  }
  
  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--brand-primary);
  }
  
  .header-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .author-name {
    font-weight: 600;
    font-size: var(--heading-2-font-size);
    color: #333;
    margin: 0;
  }
  
  .post-date {
    font-size: var(--body-bigger-font-size);
    color: #999;
    margin-top: 0.1rem;
  }
  
  .article-title {
    font-size: var(--heading-1-font-size);
    font-weight: 600;
    color: #222;
    margin: 0.2rem 0 0.8rem 0;
  }
  
  .cover-img {
    width: 100%;
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .summary {
    font-size:var( --body-bigger-font-size);
    color: #555;
    line-height: 1.5;
    margin-bottom: 0.5rem;
    text-align: left;
  }
  
  p {
    text-align: center;
    color: #666;
    font-size: 1.1rem;
    margin-top: 2rem;
  }
  </style>