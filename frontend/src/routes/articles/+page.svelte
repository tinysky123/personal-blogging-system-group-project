<script>
  
  import { goto } from '$app/navigation';
  import { substringHTML, getTokenFromCookie  } from '$lib/util.js';
  import PageFunction from '../../lib/components/Pagination.svelte';
  import { tick } from 'svelte';



  export let data;

  let articles = data.articles;
  let sortKey = '';
  let sortAsc = true;
  let searchField = 'title';   // default search field
  let searchText = '';
  let matchType = 'partial';   // 'partial' or 'exact'
  let startDate = '';
  let endDate = '';


  let filteredArticles = articles;

  let viewMode = 'grid'; // or 'list'

  let currentPage = 1;
  const itemsPerPage = 20;


  $: sortedArticles = [...filteredArticles].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === 'user_id' || sortKey === 'article_id') {
      valA = Number(valA);
      valB = Number(valB);
    } else if (sortKey === 'updated_dttm') {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  function goToArticle(id) {
    goto(`/articles/${id}`);
  }

  $: totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  $: paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  async function onPageChange(page) {
    currentPage = page;
    await tick(); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  function sortBy(key) {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    currentPage = 1;
  }
  function performSearch() {
  const searchVal = searchText.toLowerCase().trim();

  // searching by date 
  if (searchField === 'updated_dttm') {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 

    filteredArticles = articles.filter(article => {
      const articleDate = new Date(article.updated_dttm);
      return articleDate >= start && articleDate <= end;
    });
  } else {
    filteredArticles = articles;
  }

  currentPage = 1;
  return;
}


  // For other fields (title, username)
  if (!searchVal) {
    filteredArticles = articles;
    return;
  }

  filteredArticles = articles.filter(article => {
    if (searchField === 'title' || searchField === 'content') {
      const fieldValue = (article[searchField] || '').toLowerCase();
      return matchType === 'exact'
        ? fieldValue.split(/\b/).includes(searchVal)
        : fieldValue.includes(searchVal);
    }

    if (searchField === 'username') {
      const fieldValue = (article.username || '').toLowerCase();
      return matchType === 'exact'
        ? fieldValue.split(/\b/).includes(searchVal)
        : fieldValue.includes(searchVal);
    }

    return true;
  });

  currentPage = 1;
}



  function clearFilters() {
  searchText = '';
  startDate = '';
  endDate = '';
  searchField = 'title';
  matchType = 'partial';
  filteredArticles = articles;
  currentPage = 1;
}

</script>


<!-- <h1> All articles</h1> -->
<div class="toolbar">
  
  <div class="search-container">

    <div class="custom-select">
    <select bind:value={searchField}>
      <option value="title">Search by Title </option>
      <option value="username">Search by Username</option>
      <option value="updated_dttm">Search by Date</option>
    </select>
  </div>


  {#if searchField !== 'updated_dttm'}
  <div class="custom-select">
    <select bind:value={matchType}>
      <option value="partial">Partial Match</option>
      <option value="exact">Exact Match</option>
    </select>
  </div>
  {/if}



    {#if searchField === 'updated_dttm'}
      <input type="date" bind:value={startDate}  class="search-box" />
      <span class="separator">to</span>
      <input type="date" bind:value={endDate} min={startDate} class="search-box" />
    {:else}
      <input
        type="text"
        placeholder={`Search ${searchField === 'updated_dttm' ? 'YYYY-MM-DD' : searchField}...`}
        bind:value={searchText}
        class="search-box"
      />
    {/if}


    <button on:click={performSearch} class="search-btn">Search</button>
    {#if searchText.trim() || searchField !== 'title' || matchType !== 'partial'}
    <button on:click={clearFilters} class="clear-btn">Clear</button>
    {/if}
    

  </div>



  <div class="view-toggle">
    <button class={viewMode === 'table' ? 'active' : ''} on:click={() => viewMode = 'table'}>
      <img src="/icon-list.png" alt="table" />
    </button>
    <button class={viewMode === 'grid' ? 'active' : ''} on:click={() => viewMode = 'grid'}>
      <img src="/icon-grid.png" alt="grid" />
    </button>
  </div>
</div>





{#if viewMode === 'table'}
<table>
  <thead>
    <tr>
      <th>Avatar</th>
      <th on:click={() => sortBy('username')} style="cursor: pointer;">
        Author <span class="sort-icon">{sortKey === 'username' ? (sortAsc ? '▲' : '▼') : '△'}</span>
      </th>
      <th on:click={() => sortBy('article_id')}>
        Article ID <span class="sort-icon">{sortKey === 'article_id' ? (sortAsc ? '▲' : '▼') : '△'}</span>
      </th>
      <th on:click={() => sortBy('title')}>
        Title <span class="sort-icon">{sortKey === 'title' ? (sortAsc ? '▲' : '▼') : '△'}</span>
      </th>
      <th on:click={() => sortBy('updated_dttm')}>
        Updated Date <span class="sort-icon">{sortKey === 'updated_dttm' ? (sortAsc ? '▲' : '▼') : '△'}</span>
      </th>
      <th>Content</th>
      <th >Comment</th>
      <th >Likes</th>
    </tr>
  </thead>
  
  <tbody>
    {#each paginatedArticles as article}
      <tr class="trbody" on:click={() => goToArticle(article.article_id)}>
        <td>
          <img src={"http://localhost:3000" + article.avatar_url} alt="Avatar" class="avatar" />
        </td>

        <td>{article.username}</td>

        <td>{article.article_id}</td>
        <td class="link" on:click={() => goToArticle(article.article_id)}>
          {@html substringHTML(article.title).length > 50
            ? substringHTML(article.title).slice(0, 50) + '...'
            : substringHTML(article.title)
          }
        </td>
        <td>{article.updated_dttm.slice(0,10)}</td>
        <td id="content">{substringHTML(article.content).slice(0, 60)}...</td>
        <td>{article.comment_cnt}</td>
        <td> {article.like_cnt}</td>

      </tr>
    {/each}
  </tbody>
</table>
{:else}

<div class="grid-container">
  {#each paginatedArticles as article}

    <div class="card" on:click={() => goToArticle(article.article_id)}>
      <div class="cover-wrapper">
        <img 
          src={article.image_url ? "http://localhost:3000" + article.image_url : '/placeholder.jpg'} 
          alt="Cover Photo" 
          class="cover-photo" 
        />
      </div>

      <div class="card-content">
        <div class="author-info">
          <img src={"http://localhost:3000" + article.avatar_url} alt="Avatar" class="avatar-large" />
          <div>
            <p class="author">{article.username}</p>
            <p class="date">{article.updated_dttm}</p>
          </div>
        </div>

        <h3>{substringHTML(article.title).slice(0, 50)}...</h3>
        <p class="preview">{substringHTML(article.content).slice(0, 100)}...</p>

        <div class="meta">
          <span>💬 {article.comment_cnt}</span>
          <span>❤️ {article.like_cnt}</span>
        </div>
      </div>
    </div>
  {/each}
</div>

{#if paginatedArticles.length === 0}
  <p class="no-result-message">No articles match your search.</p>
{/if}




{/if}


<PageFunction  {currentPage} {totalPages} onPageChange={onPageChange}/>

<style>
  

  table {
  width: 95%;
  margin: 2rem auto;
  border-collapse: separate;
  border-spacing: 0;
  background:  rgb(255,255,255,0.5);;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

thead {
  background-color: var(--brand-primary);
}

th {
  font-size: var(--heading-3-font-size);
  padding: 0.2rem;
  color: #fff;
  background: var(--brand-primary);
  font-weight: 600;
  border-bottom: 1px solid var(--soft-border);
}

th:hover, th:active{
  color: #000;
  background-color: #ccc;
}

td {
  font-size: var(--heading-3-font-size);
  padding: 1rem;
  border-bottom: 1px solid var(--soft-border);
  vertical-align: top;
}

.trbody:hover {
  background-color: var(--brand-primary-dark);
  color: white;
}


  .link {
    cursor: pointer;
    text-decoration: underline;
    font-size: var(--heading-3-font-size);
  }

  .sort-icon {
    margin-left: 0.25rem;
  }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    margin: auto;
  }


  #content{
    font-size: var(--heading-3-font-size);
  }


  .toolbar {
  display: flex;
  align-items: center;         
  justify-content: space-between;
  padding: 1rem;
  margin: 2rem auto;
  flex-wrap: wrap;
 
}


.search-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;  
  gap: 1rem;
  padding: 1rem;
  margin: 2rem auto;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  align-items: center; 
  justify-content: center;
}


  .search-container select {
    background-color: #fff !important;    
    color: #000 !important;              
    appearance: none;               
}

.search-container select option {
  background-color: #fff !important;
  color: #000;   
  appearance: none;          
}

input{
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius);
  border: 1px solid #ccc;
  font-size: var(--heading-3-font-size);
}

.clear-btn {
  background: #ccc;
  color: #000;
  font-size: var(--heading-3-font-size);
}

.clear-btn:hover {
  background: #bbb;
}



.custom-select {
  position: relative;
  display: inline-block;          
  flex: 1 1 auto;
  min-width: 130px;
  max-width: 240px;
  box-sizing: border-box;
  
}

.custom-select select {
  width: 100%;
  padding:0.6rem 0.75rem;
 
  border-radius: var(--radius);
  transition: border var(--transition);

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  padding-right: 0.5rem;
  background-color: #fff;
  font-size: var(--heading-3-font-size);
}

.custom-select::after {
  content: "";
  pointer-events: none;           
  position: absolute;
  top: 50%;
  right: 0.2rem;                  
  transform: translateY(-50%);
  width: 1.5rem;        
  height: 1.5rem;
  background-image: url("/icon-down-arrow.png");
  background-size: contain;
  background-repeat: no-repeat;
}

.separator{
  font-size: var(--heading-3-font-size);
}

  .search-box, select { 
    flex: 1 1 160px; 
    min-width: 140px;
    max-width: 300px;
    padding:0.7rem; 
    border:1px solid #ccc;
    border-radius:var(--radius); 
    transition:border var(--transition);
    font-size: var(--heading-3-font-size);
  }

  .custom-select,
.search-box
 {
  font-size: clamp(0.9rem, 2.5vw, var(--heading-3-font-size));
}



.search-container {
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
}

.search-container input,
.search-container select,
.search-container  {
  min-width: 130px;
  flex: 1 1 150px;
  box-sizing: border-box;
}


  .search-box:focus, 
  select:focus { 
    border-color:var(--brand-primary-dark); 
    outline:none; }

  button { padding:0.75rem 1.5rem; background:var(--brand-primary);
    border:none; 
    border-radius:var(--radius); 
    color:#fff;
    cursor:pointer; transition:transform var(--transition);
    font-size: var(--heading-3-font-size);
   
  }


  button:hover { 
    
    transform:translateY(-2px); 
    background:var(--brand-primary-dark); }
  
  .view-toggle { display:flex; gap:0.5rem;  margin-left: auto; }

  .view-toggle button { background:#f5f5f5; padding:0.5rem;
    border-radius:var(--radius);
  }


.view-toggle button {
  background: #f0f0f0;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: right;
}

.view-toggle button img {
  width: 20px;
  height: 20px;
}

.view-toggle button:hover {
  background: var(--brand-primary-dark);
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  
  
}

.view-toggle button.active {
  background: var(--brand-primary);
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.4);
}

.view-toggle button.active img {
  filter: brightness(0) invert(1);
}



.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background-color:  rgb(255,255,255,0.3);
  width:90%;
 margin:auto;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.cover-wrapper {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.card h3 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
  color: #333;
}

.author {
  font-size: var(--heading-3-font-size);
  font-weight: bold;
  color: #666;
  margin: 0;
}

.date {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.preview {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.4;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #999;
}

.no-result-message{
  text-align: center;
  font-size: var(--heading-3-font-size);
}

input[type="date"].search-box {
  padding: 0.6rem 0.75rem;
  font-size: var(--heading-3-font-size);
  border: 1px solid #ccc;
  border-radius: var(--radius);
  background-color: #fff;
  color: #333;
  width: auto;
  flex: 1;
  min-width: 160px;
  box-sizing: border-box;
  transition: border 0.3s ease;
}

input[type="date"].search-box:focus {
  border-color: var(--brand-primary-dark);
  outline: none;
}


@media (max-width: 480px) {
  .search-container {
    padding: 1rem 0.5rem;
  }

  .custom-select::after {
    right: 0.5rem;
    width: 1rem;
    height: 1rem;
  }

  .view-toggle {
    margin-top: 1rem;
    justify-content: center;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}


</style>