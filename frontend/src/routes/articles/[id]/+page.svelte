<script>
    import  ArticleDetail from "../../../lib/components/ArticleDetail.svelte";
    export let data;

    const { article, tags, likes, liked, coverImage } = data;
  </script>



    <ArticleDetail {article} {tags} {likes} {liked} {coverImage} />


    
