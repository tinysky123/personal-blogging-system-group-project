<script>
  import SubscribeButton from '$lib/components/SubscribeInfo.svelte';

  // 模拟数据（正式可以用 props）
  let authorId = 3;
  let subscriberCount = 10;
</script>
  

  <SubscribeButton 
  authorId={authorId} 
  subscriberCount={subscriberCount}
/>

