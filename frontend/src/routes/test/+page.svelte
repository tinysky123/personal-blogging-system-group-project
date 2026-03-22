<script>
    import LikeButton from "$lib/components/LikeButton.svelte";
    export let data;
  $: articles = data.articles;
console.log(articles.article)
  </script>

    {#each articles as article}
    <LikeButton
      articleId={article.article_id}
      initialLiked={article.liked}
      initialLikeCount={article.like_cnt}
    />
  {/each}
  