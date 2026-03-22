<script>
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import { onMount } from "svelte";

  export let articleId;
  export let initialLiked = undefined; 
  export let initialLikeCount = 0;

  let liked = initialLiked ?? false;
  let likeCount = initialLikeCount;
  let loggedIn = false;
  let isLoading = false;

  onMount(async () => {
    loggedIn = document.cookie.includes("tokenId=");

    // If liked is not passed in, try to fetch it (fallback)
    if (initialLiked === undefined && loggedIn) {
      const tokenId = document.cookie
        .split('; ')
        .find(row => row.startsWith('tokenId='))
        ?.split('=')[1];

      try {
        const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/liked`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: tokenId
          },
          credentials: "include"
        });

        if (res.ok) {
          const json = await res.json();
          liked = json.liked;
        }
      } catch (e) {
        console.warn(`Failed to fetch liked status for article ${articleId}`, e);
      }
    }
  });

  async function toggleLike() {
    if (isLoading || !loggedIn) return;

    isLoading = true;
    try {
      const tokenId = document.cookie
        .split('; ')
        .find(row => row.startsWith('tokenId='))
        ?.split('=')[1];

      const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenId
        },
        credentials: "include",
        body: JSON.stringify({ liked: !liked })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to update like: ${res.status} - ${errorText}`);
        return;
      }

      liked = !liked;
      likeCount = liked ? likeCount + 1 : likeCount - 1;
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="like-inline-wrapper">
  <button on:click={toggleLike} class="icon-button" title={liked ? "Unlike" : "Like"}>
    <img
      src={liked ? "/icon-heart2.png" : "/icon-heart.png"}
      alt={liked ? "Liked" : "Like"}
      style="width: 28px; height: 28px;"
    />
  </button>
  <span class="like-count">{likeCount}</span>
  {#if !loggedIn}
    <span class="login-hint">Log in to like</span>
  {/if}
</div>

<style>
  .like-inline-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .like-count {
    font-weight: bold;
    color: #2c3e50;
  }

  .login-hint {
    font-size: 0.75rem;
    color: gray;
  }
</style>
