import { writable, get } from 'svelte/store';
import { apiGet, apiPost } from '$lib/api/api.js';

const notificationStore = writable([]);

const customStore = { 
  subscribe: notificationStore.subscribe, 
  set: notificationStore.set,    
  update: notificationStore.update, 

  clearAll: () => notificationStore.set([]), 

  fetchNotifications: async () => { 
    try { 
      const res = await apiGet('/notification/me'); 
      notificationStore.set(res.notifications || []); 
    } catch (err) { 
      console.error('Failed:', err); 
    } 
  },

  markAllAsRead: async () => {
    const notifications = get(notificationStore);
    const updated = [];

    for (const n of notifications) {
      if (n.is_read === 0 && n.notification_id) {
        try {
          await apiPost('/notification/mark-read', { id: n.notification_id });
          updated.push({ ...n, is_read: 1 });
        } catch (err) {
          console.error('Failed to mark as read:', err);
          updated.push(n);
        }
      } else {
        updated.push(n);
      }
    }

    notificationStore.set(updated);
  }
};

export default customStore;