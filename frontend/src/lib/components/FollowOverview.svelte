<script>
  import FollowList from './FollowList.svelte';
  import { apiGet, apiDelete } from '$lib/api/api.js';
  import { onMount } from 'svelte';

  export let followingUsers = [];

  let showList = false;
  $: users = [...followingUsers];

  // Toggle the follow list to expand/collapse
  function toggleList() {
    showList = !showList;
  }

  // Unfollow
  async function handleUnfollow(id) {
    try {
      await apiDelete(`/subscription/${id}`);
      users = users.filter(user => user.user_id !== id);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  // Get follow list
  onMount(async () => {
    try {
      const response = await apiGet('/subscription/following/me');
      users = response.data;
    } catch (error) {
      console.error('Failed to fetch following users:', error);
    }
  });
</script>


<div class="follow-overview">
  <button class="summary" on:click={toggleList}>
    Subscribed {users.length} {showList ? '▲' : '▼'}
  </button>

  {#if showList}
    <FollowList {users} onUnfollow={handleUnfollow} />
  {/if}
</div>

<style>
  .summary {
    all: unset; 
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    color: white;
    font-weight: 600;
    background-color: var(--brand-primary);
    padding: 0.4rem 0.8rem;
    border-radius: 9999px;
    border: 1px solid #cce4ff;
    transition: background-color 0.2s ease, transform 0.1s ease;
    font-size: var( --body-bigger-font-size);
  }

  .summary:hover {
    background-color:var(--brand-primary-dark);
    transform: translateY(-1px);
  }

  .summary:active {
    background-color: var(--brand-primary-dark)f;
    transform: translateY(0);
  }
</style>