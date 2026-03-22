<script>
import { PUBLIC_BASE_URL } from "$env/static/public";
export let users = [];
export let onUnfollow = () => {};


function handleUnfollow(id) {
  onUnfollow(id);
}
</script>

<div class="follow-list">
  {#each users as user (user.user_id)}
    <div class="user-card">
      <img src={PUBLIC_BASE_URL + user.avatar_url} alt="avatar" />
      <div class="info">
        <span class="username">@{user.username}</span>
      </div>
      <button on:click={() => handleUnfollow(user.user_id)}>Unsubscribe</button>
    </div>
  {/each}
</div>
  
  <style>
    .follow-list {
      margin-top: 1rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
    }
  
    .user-card {
      display: flex;
      align-items: center;
      padding: 0.75rem 0;
      gap: 1rem;
      border-bottom: 1px solid #edf2f7;
      transition: background-color 0.2s ease;
    }
  
    .user-card:hover {
      background-color: #f9fafb;
    }
  
    img {
      width: 48px;
      height: 48px;
      border-radius: 9999px;
      object-fit: cover;
      border: 2px solid #cbd5e1;
    }
  
    .info {
      flex: 1;
    }

    .username {
      font-weight: 600;
      color: #1a202c;
      text-decoration: none;
      transition: color 0.2s;
    }
  
    button {
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: white;
      background: linear-gradient(135deg, #4D96FF, #6BCB77);
      border: none;
      border-radius: 9999px;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
    }
  
    button:hover {
      background: linear-gradient(135deg, #3b82f6, #4ade80);
      transform: scale(1.03);
    }
  </style>