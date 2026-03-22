<script>
  import { onMount } from 'svelte';
  import { apiGet, apiPost, apiDelete } from '$lib/api/api.js';
  import { getUserIdCookie } from '$lib/util.js';
  import {page} from "$app/stores";

  export let authorId;

  let currentUserId = getUserIdCookie();
  let isSubscribed = false;
  let subscriberCount = 0;
  let loading = true;
  let isLoggedIn = !!currentUserId;

  onMount(() => {
    if (isLoggedIn) {
      fetchStatus();
    } else {
      loading = false;
    }
  });

  async function fetchStatus() {
    try {
      const res1 = await apiGet(`/subscription/${authorId}/subscribers/count`);
      subscriberCount = res1.data?.subscriberCount ?? 0;

      const res2 = await apiGet(`/subscription/${authorId}/status`);
      isSubscribed = res2.data?.isSubscribed ?? false;
    } catch (err) {
      console.error("Failed to get subscription status", err);
    } finally {
      loading = false;
    }
  }

  async function toggleSubscription() {
    try {
      if (isSubscribed) {
        await apiDelete(`/subscription/${authorId}`);
        subscriberCount--;
      } else {
        await apiPost(`/subscription`, { targetUserId: authorId });
        subscriberCount++;
      }
      isSubscribed = !isSubscribed;
    } catch (err) {
      console.error("Failed to change status", err);
    }
  }
</script>

{#if currentUserId == authorId}
  <!-- Do not allow following yourself -->
{:else}
  <div class="subscribe-box">
    <p>Followers: {subscriberCount}</p>
    <button 
      class="follow-btn"
      on:click={toggleSubscription}
      disabled={!isLoggedIn}
    >
      {isSubscribed ? 'Unfollow' : 'Follow'}
    </button>
    {#if !isLoggedIn}
      <span class="login-warning">Please <a href='/login?redirect={$page.url}&reset=1'>log in </a> to FOLLOW</span>
    {/if}
  </div>
{/if}

<style>

.subscribe-box{
  font-size: var(--body-bigger-font-size);
}
  .follow-btn {
    margin-top: 0.5rem;
    background: linear-gradient(135deg, #4D96FF, #6BCB77);
    color: white;
    border: none;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: var(--body-bigger-font-size);;
  }

  .follow-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-warning {
    display: block;
    margin-top: 0.3rem;
    color:gray;
    font-size: 0.8rem;
  }
</style>
