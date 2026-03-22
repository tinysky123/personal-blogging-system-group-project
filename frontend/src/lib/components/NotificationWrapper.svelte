<script>
  import { onMount } from 'svelte';
  import { apiDelete, apiPost } from '$lib/api/api.js'; 
  import NotificationPanel from './NotificationPanel.svelte';
  import notificationStore from '$lib/store/notificationStore.js';
  import { get } from 'svelte/store';

  let showPanel = false;
  let unreadCount = 0;
 



  
  const unsubscribe = notificationStore.subscribe((value) => {
    unreadCount = value.filter(n => n.is_read === 0).length;
  });

  async function handleClearAll() {
    const confirmed = confirm('Are you sure you want to delete all the notifications? This operation cannot be restored.');
    if (!confirmed) return;

    try {
      await apiDelete('/notification/me');
      notificationStore.clearAll();
      showPanel = false;
    } catch (err) {
      alert('Deletion failed. Please try again later');
      console.error(err);
    }
  }

  async function markAllAsRead() {
  const notifications = get(notificationStore);
  const unread = notifications.filter(n => n.is_read === 0 && n.notification_id);

  for (const n of unread) {
    try {
      await apiPost('/notification/mark-read', { id: n.notification_id });
      n.is_read = 1; 
    } catch (err) {
      console.error('Mark all as read failed:', err);
    }
  }


  notificationStore.set([...notifications]);
}
  

  function handleGlobalClick(event) {
    const isPanel = event.target.closest('.notification-panel');
    const isBell = event.target.closest('.bell-wrapper');
    if (!isPanel && !isBell && showPanel) {
      showPanel = false;
    }
  }

  onMount(() => {
    notificationStore.fetchNotifications();
    document.addEventListener('click', handleGlobalClick);
    return () => {
      unsubscribe();
      document.removeEventListener('click', handleGlobalClick);
    };
  });
</script>

<div class="notification-wrapper">
  <div
    class="bell-wrapper"
    role="button"
    tabindex="0"
    aria-label="Open the notification panel"
    on:click={() => { showPanel = !showPanel }}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (showPanel = !showPanel)}
  >
    <img src="/bell.png" alt="notification" class="bell" />
    {#if unreadCount > 0}
      <span class="badge">{unreadCount}</span>
    {/if}
  </div>

  {#if showPanel}
    <div class="panel-container"> 
      <NotificationPanel 
        notifications={$notificationStore} 
        on:close={() => showPanel = false} 
        onClearAll={handleClearAll} 
        onMarkAllAsRead={markAllAsRead}
      /> 
    </div>
  {/if}
</div>


<style>
  .notification-wrapper {
    position: relative;
    display: inline-block;
  }

  .bell {
    width: 24px;
    height: 24px;
    cursor: pointer;
    filter: drop-shadow(0 0 2px white);
  }
  
  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: red;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 999px;
  }

  :global(.notification-panel) {
    position: absolute;
    top: 30px;
    right: 0;
    width: 300px;
    background: white;
    border: 1px solid #ddd;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
</style>
