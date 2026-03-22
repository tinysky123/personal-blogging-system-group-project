<script>
  import { createEventDispatcher } from 'svelte';
  import { apiPost } from '$lib/api/api.js';

  export let notifications = [];
  export let onClearAll = () => {};
  export let onMarkAllAsRead = () => {};

  const dispatch = createEventDispatcher();

  
  async function handleClick(notification) {
    if (notification.is_read === 0 && notification.notification_id) {
      try {
        await apiPost('/notification/mark-read', {
          id: notification.notification_id
        });
        notification.is_read = 1;
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    dispatch('close');

    const basePath = `/articles/${notification.article_id}`;
    const hash = (notification.type === 'mention' || notification.type === 'tag_comment')
      ? `#comment-${notification.comment_id ?? ''}`
      : '';

    window.location.href = basePath + hash;
  }


  
  $: sortedNotifications = Array.isArray(notifications)
    ? [...notifications].sort((a, b) => {
        if (a.is_read !== b.is_read) return a.is_read - b.is_read;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
    : [];
</script>

<div class="notification-panel">
  <div class="notification-header">
    <h4>Notification</h4>

    {#if sortedNotifications.length > 0}
      <div class="actions">
        <button class="read-btn" on:click={onMarkAllAsRead}> Mark all as read</button>
        <button class="clear-btn" on:click={onClearAll}>Empty all</button>
      </div>
    {/if}
  </div>

  {#if sortedNotifications.length === 0}
    <p class="empty-message">Empty</p>
  {:else}
    <ul class="notification-list">
      {#each sortedNotifications as n}
        <li
          class="notification-item"
          class:unread={n.is_read === 0}
          class:read={n.is_read !== 0}
        >
          <button class="notification-button" on:click={() => handleClick(n)}>
            {#if n.type === 'mention'}
              <span class="username">{n.sender_username}</span> mentioned you in {n.article_title}
            {:else if n.type === 'tag_comment'}
              <span class="username">{n.sender_username}</span> commented on your article
            {:else if n.type === 'new_article'}
              Your followee <span class="username">{n.sender_username}</span> posted a new article.
            {:else}
              New notification: {n.type}
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>


<style>
  .notification-panel {
    background: #fff;
    padding: 1rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-width: 600px;
    margin: auto;
  }

  .notification-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .notification-item {
    border-bottom: 1px solid #eee;
    padding: 0.75rem 0;
    transition: background-color 0.2s ease;
  }

  .notification-item:last-child {
    border-bottom: none;
  }

  .notification-button {
    all: unset;
    display: block;
    width: 100%;
    cursor: pointer;
    font-size: var(--body-bigger-font-size);
    color: #333;
  }

  .notification-button:hover {
    background-color: #f9f9f9;
  }

  .username {
    color: #305379;
    font-weight: 600;
  }

  h4 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
    border-bottom: 2px solid #ddd;
    padding-bottom: 0.5rem;
  }

  .empty-message {
    color: #888;
    text-align: center;
    padding: 2rem 0;
  }

  .notification-item.unread {
    background-color: #f5f9ff;
    font-weight: 500;
    position: relative;
  }

  .notification-item.read {
    background-color: #ffffff;
    border-left: 4px solid transparent;
    opacity: 0.8;
  }

  .notification-item.unread::after {
    content: '';
    position: absolute;
    top: 16px;
    right: 12px;
    width: 8px;
    height: 8px;
    background-color: #007bff;
    border-radius: 50%;
  }

.clear-btn,.read-btn{
  background-color: var(--brand-primary);
  border-color: white;
  color: white;
  border-radius: var(--radius);
  font-size: var(--body-bigger-font-size);
  padding: 0.5rem;
}

.read-btn:hover{
  background-color: var(--brand-primary-dark);
  border-radius: var(--radius);
  font-size: var(--body-bigger-font-size);
}

.clear-btn:hover{
  background-color: var(--brand-primary-dark);
  border-radius: var(--radius);
  font-size: var(--body-bigger-font-size);
}


</style>

