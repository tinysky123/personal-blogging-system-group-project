<script>
  import { onMount } from 'svelte';
  import { apiGet } from '$lib/api/api.js';

  let tags = [];
  let showAll = false;
  const visibleCount = 10;
  let searchQuery = '';

  $: filteredTags = tags.filter(tag =>
    tag.tag_name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  $: displayedTags = showAll
    ? filteredTags
    : filteredTags.slice(0, visibleCount);

  onMount(async () => {
    try {
      const res = await apiGet(`/tags`);
      tags = res.tags ?? [];
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  });

  function toggleShowAll() {
    showAll = !showAll;
  }
</script>

<div class="container">
  <div class="title-row">
    <h2 class="tags-title">Tags</h2>
  </div>

  <div class="search-toggle-row">
    <input
      class="search-input"
      type="text"
      placeholder="Search tags..."
      bind:value={searchQuery}
    />
    
    {#if tags.length > visibleCount}
      <button class="toggle-button alt" on:click={toggleShowAll}>
        {showAll ? "Show Less" : "Show More"}
      </button>
    {/if}
  </div>

  <div class="tags-scroll-wrapper">
    <div class="tags-list">
      {#each displayedTags as tag}
        <a class="tag-item" href={`/tags/${tag.tag_name}`}>
          #{tag.tag_name}
        </a>
      {/each}
    </div>
  </div>
</div>



  <style>
  .container {
    display: flex;
    flex-direction: column;
    background: linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url('/background2.jpg') center/cover;
    padding: 1.5rem;
    border-radius: 12px;
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    margin-bottom: 2rem;
  }

  .tags-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  }

  
  .tags-scroll-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--brand-primary) rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.tags-scroll-wrapper::-webkit-scrollbar {
  height: 8px;
}

.tags-scroll-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.tags-scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--brand-primary);
  border-radius: 10px;
}

.tags-list {
  display: flex;
  gap: 0.6rem;
  white-space: nowrap;
  flex-wrap: nowrap;
}


.tag-item {
    flex-shrink: 0;
    text-decoration: none;
    font-weight: 500;
    padding: 0.45rem 1rem;
    border-radius: 999px;
    font-size: 0.95rem;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.25s ease;
  }

  .tag-item:hover {
    background: var(--brand-primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }


  .toggle-button {
  align-self: flex-start;
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.45rem 1.2rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 500;
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: all 0.25s ease;
}

.toggle-button:hover {
  background: var(--brand-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  color: white;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  outline: none;
  width: 100%;
  max-width: 300px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-toggle-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

/* Use a different color for the Show More button */
.toggle-button.alt {
  background: var(--brand-primary);
  color: white;
}

.toggle-button.alt:hover {
  background: #174b73; /* darker hover color */
}


@media (min-width: 640px) {
  .tags-scroll-wrapper {
    overflow-x: visible;
  }
  .tags-list {
    flex-wrap: wrap;
    white-space: normal;
  }
}

</style>
