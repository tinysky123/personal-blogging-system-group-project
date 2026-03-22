



<script>
  import { onMount, onDestroy } from 'svelte';
  import { createArticle, updateArticle, uploadImage,fetchSuggestedTags, insertImage  } from '$lib/api/article.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { PUBLIC_API_BASE_URL } from "$env/static/public";

  let editor;
  let title = '';
  let content = '';
  let isEditMode = false;
  let articleId = null;
  let tagsInput = '';
  let filesToUpload;
  let uploadedImageUrl = null;
  let imageDeleted = false;
  let fileInputRef;

  let suggestedTags = [];

  let errorMessage = '';
  const maxContentLength = 6000;



  $: currentContent = editor?.getContent() || '';
  $: if ((title || currentContent) && typeof window !== 'undefined') {
  const tokenId = getTokenFromCookie();
  if (tokenId) {
    const plainContent = stripHTML(currentContent);
    fetchSuggestedTags(tokenId, `${title} ${plainContent}`)
      .then(tags => {
        if (Array.isArray(tags)) {
          suggestedTags = tags;
        }
      })
      .catch(err => {
        console.error("Failed to fetch suggested tags:", err);
      });
  }
}







function addSuggestedTag(tag) {
  if (!tagsInput.includes(`#${tag}`)) {
    tagsInput += (tagsInput ? ' ' : '') + `#${tag}`;
  }
}

function stripHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
}



  function getTokenFromCookie() {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('tokenId='))
      ?.split('=')[1];
  }

  async function saveArticle() {
    try {

      if (!title.trim()) {
        errorMessage = "Title are required";
        return;
      }

      if (!(editor?.getContent().trim())) {
        errorMessage = "content are required";
        return;
      }

      // if (editor?.getContent().trim().length > maxContentLength) {
      //       errorMessage = `Content is too long. Maximum is ${maxContentLength} characters.`;
      //       return;
      //     }
 

      const fileArray = filesToUpload ? Array.from(filesToUpload) : [];
      // if (fileArray.length > 1) {
      //   alert("Only one image is allowed as a cover photo.");
      //   return;
      // }

      if (fileArray[0]?.size > 10 * 1024 * 1024) {
        errorMessage ="File too large. Max is 10MB";
        return;
      }

      const content = editor?.getContent() || '';
      const tokenId = getTokenFromCookie();
      if (!tokenId) throw new Error("Missing token");

      const tags = tagsInput
        .split('#')
        .map(tag => tag.trim().replace(/^#+/, ''))
        .filter(tag => tag);

      const newArticle = await createArticle({ tokenId, title, content, tags });
      const newArticleId = newArticle.article_id;

      if (fileArray[0]) {
        const response = await uploadImage(tokenId, newArticleId, fileArray[0]);
        console.log("Image uploaded:", response);
      }

      
      goto(`/articles/${newArticleId}`);

    } catch (err) {
      console.error('Save error:', err);
      
    }
  }

  async function handleupdateArticle() {
    try {
      if (!title.trim()) {
        errorMessage = "Title are required";
        return;
      }

      if (!(editor?.getContent().trim())) {
        errorMessage = "content are required";
        return;
      }

      // if (editor?.getContent().trim().length > maxContentLength) {
      //       errorMessage = `Content is too long. Maximum is ${maxContentLength} characters.`;
      //       return;
      //     }

      const fileArray = filesToUpload ? Array.from(filesToUpload) : [];
      // if (fileArray.length > 1) {
      //   alert("Only one image is allowed as a cover photo.");
      //   return;
      // }

      if (fileArray[0]?.size > 10 * 1024 * 1024) {
        errorMessage ="File too large. Max is 10MB";
        return;
      }

      const content = editor?.getContent() || '';
      const tokenId = getTokenFromCookie();
      if (!tokenId) throw new Error("Missing token");

      const tags = tagsInput
        .split('#')
        .map(tag => tag.trim().replace(/^#+/, ''))
        .filter(tag => tag);

      await updateArticle({ tokenId, title, content, articleId, tags });

      if (fileArray[0]) {
        const response = await uploadImage(tokenId, articleId, fileArray[0]);
        console.log("Image uploaded:", response);
      }


      goto(`/articles/${articleId}`);
    } catch (err) {
      console.error('Update error:', err);
      
    }
  }

  async function deleteImage() {
    if (!articleId) return;

    const tokenId = getTokenFromCookie();
    if (!tokenId) {
      return;
    }

    try {
      articleId = $page.url.searchParams.get('article_id');
      const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/images/1`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          authorization: `${tokenId}`,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete image");
      }

      uploadedImageUrl = null;
      imageDeleted = true;
    
    } catch (err) {
      console.error("Delete image error:", err);
      
    }
  }

  function initEditor() {
    if (!window.tinymce) {
      console.error('TinyMCE not loaded');
      return;
    }

    if (editor) {
      editor.remove();
      editor = null;
    }

    const target = document.getElementById('my-editor');
    if (!target) return;

    

   
    tinymce.init({
  selector: '#my-editor',
  plugins: [
    'link', 'image', 'lists', 'autolink', 'code'
  ],
  toolbar: 'undo redo | bold italic underline | bullist numlist | image | removeformat | code',
  menubar: false,
  branding: false,

  image_dimensions: false, 
  image_caption: true,
  images_reuse_filename: true,
  paste_data_images: false,
  paste_preprocess: (plugin, args) => {
  const div = document.createElement('div');
  div.innerHTML = args.content;
  const base64Imgs = div.querySelectorAll('img[src^="data:image"]');
  base64Imgs.forEach(img => img.remove()); // hard strip if needed
  args.content = div.innerHTML;
},
  automatic_uploads: false,
  image_class_list: [
    { title: 'Responsive', value: 'img-responsive' }
  ],

  images_upload_handler: async (blobInfo, success, failure) => {
    try {
      const tokenId = getTokenFromCookie();
      const file = blobInfo.blob();
      const result = await insertImage(tokenId, file);
      success(result.location); // Assign responsive class directly
    } catch (err) {
      failure('Upload failed: ' + err.message);
    }
  },

  content_style: `
    img.img-responsive {
      max-width: 30%;
      height: auto;
      display: block;
      margin: 1rem 0;
    }
  `,

  setup: (ed) => {
    editor = ed;

    ed.on('init', () => {
      if (content) ed.setContent(content);
    });

    ed.on('change', () => {
      currentContent = ed.getContent();
    });

    
    ed.on('NodeChange', () => {
      const imgs = ed.getDoc().querySelectorAll('img');
      imgs.forEach(img => {
        img.removeAttribute('width');
        img.removeAttribute('height');
      });
    });
  }
});


   }

  onMount(async () => {
    const query = $page.url.searchParams;
    articleId = query.get('article_id');
    isEditMode = !!articleId;

    if (isEditMode) {
      try {
        const res = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}`);
        if (!res.ok) throw new Error('Article not found');

        const article = await res.json();
        title = article.title;
        content = article.content;

        const imageRes = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/images`);
        const imageJson = await imageRes.json();
        if (imageJson.status === 'success' && Array.isArray(imageJson.data) && imageJson.data.length > 0) {
          const firstImage = imageJson.data.find(img => img.image_id === 1);
          uploadedImageUrl = firstImage?.image_url || null;
        }

        const tagsRes = await fetch(`${PUBLIC_API_BASE_URL}/articles/${articleId}/tags`);
        const tagJson = await tagsRes.json();
        if (tagJson.status === 'success' && Array.isArray(tagJson.data)) {
          tagsInput = tagJson.data.map(tag => `#${tag}`).join(' ');
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        
      }
    }

    initEditor();
  });

  onDestroy(() => {
    if (editor) {
      editor.remove();
      editor = null;
    }
  });
</script>



<div class="breadcrumb">
<a href="/myarticles"> My Articles </a>
<img src="/icon-right-arrow.png" alt="arrow" id="bread-icon">
<span class="current">Create Article</span>
</div>

<div class="container">
  <h2><label for="title-input" class="title">Title: <span style="color: red">*</span></label></h2>
  <input id="title-input" type="text" placeholder="Enter article title" bind:value={title} />

  <h2>Content: <span style="color: red">*</span></h2>
  <div id="my-editor"> </div>

  <div class="upload-img">
    <h2><label for="imageFile" class="upload-title">Upload Cover Photo:</label></h2>
    <input
        type="file"
        multiple={false}
        name="image-file"
        accept="image/png, image/jpeg"
        bind:files={filesToUpload}
        bind:this={fileInputRef}
        disabled={!!uploadedImageUrl && !imageDeleted}

    />

  </div>

  {#if filesToUpload?.[0] && !uploadedImageUrl}
    <div class="uploaded-image-preview">
      <p>Selected Cover Photo:</p>
      <img src={URL.createObjectURL(filesToUpload[0])} alt="Selected Cover" class="cover-photo" />
      <button
  on:click={() => {
    filesToUpload = null;
    if (fileInputRef) fileInputRef.value = null; 
  }}
  style="margin-top: 0.5rem;"
>
  x cancel selection
</button>
    </div>
  {/if}

  {#if uploadedImageUrl}
    <div class="uploaded-image-preview">
      <p>Current Cover Photo:</p>
      <img src={"http://localhost:3000" + uploadedImageUrl} alt="Uploaded Cover" class="cover-photo" />
      <button on:click={deleteImage} style="margin-top: 0.5rem;">x delete</button>
    </div>
  {/if}

  <h2><label for="tags-input" class="tag-title">Tags (use # to separate):</label></h2>
  <input
    id="tags-input"
    type="text"
    placeholder="#UOA #Cafe #Dessert #Group8"
    bind:value={tagsInput}
  />

  {#if suggestedTags.length}
  <div class="suggested-tags">
    <p><strong>Suggested Tags(click to apply): </strong></p>
    {#each suggestedTags as tag}
      <button class="tag-button" on:click={() => addSuggestedTag(tag)}>
        {tag}
      </button>
    {/each}
  </div>
  {/if}



  {#if errorMessage}
  <div class="error-message">{errorMessage}</div>
  {/if}

  <div style="display: flex; justify-content: flex-end;">
    <button class="cancel-btn" on:click={() => goto('/myarticles')}>Cancel</button>
    <button class="save-btn" on:click={isEditMode ? handleupdateArticle : saveArticle}>
      {isEditMode ? 'Update Article' : 'Save Article'}
    </button>
  </div>
</div>

<style>


.container {
  max-width: 850px;
  margin: 3rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
}

label {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  display: block;
  color: #333;
}

input[type="text"],
input[type="file"] {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.title{

  margin-top: 2rem;
  font-size: 1.4rem;
  color: #444;
}

h2 {
  margin-top: 2rem;
  font-size: 1.4rem;
  color: #444;
}

.upload-title{
  font-size: 1.4rem;
}

.tag-title{
  font-size: 1.4rem;
}


#my-editor {
  margin-top: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  min-height: 300px;
}

.upload-img {
  margin-top: 2rem;
}

.uploaded-image-preview {
  margin: 1rem 0;
}

.uploaded-image-preview img.cover-photo {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  display: block;
  margin-bottom: 0.5rem;
}

button.save-btn {
  padding: 0.9rem 2rem;
  font-size: 1.1rem;
  background-color: var(--brand-primary, #007bff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

button.save-btn:hover {
  background-color: var(--brand-secondary, #0056b3);
  color: var(--primary-text, #fff);
}

button {
  font-family: inherit;
}

button.tag-button {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
  padding: 0.45rem 0.9rem;
  margin: 0.4rem 0.5rem 0.4rem 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.2s ease;
}

button.tag-button:hover {
  background-color: #bae7ff;
}

.suggested-tags {
  margin: 1.5rem 0;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eaeaea;
}

.suggested-tags p {
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


button.cancel-btn {
  padding: 0.9rem 2rem;
  font-size: 1.1rem;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 1rem;
  transition: background-color 0.25s ease;
}

button.cancel-btn:hover {
  background-color: #6e6e6e;
  color: white;
}


.breadcrumb {
  font-size: 0.95rem;
  margin: 1.5rem auto;
  max-width: 850px;
  padding: 0 1rem;
  color: #666;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--heading-1-font-family);
}

#bread-icon{
  width: 1.2rem;
}

.breadcrumb a {
  color:#0056b3;
  text-decoration: none;
  transition: color 0.2s;
  font-weight:bold;
  font-size: 1.5rem;
  
}

.breadcrumb a:hover {
  text-decoration: underline;
  color: #0056b3;
}


.breadcrumb .current {
  font-weight: 500;
  color: #333;
  font-weight:bold;
  font-size: 1.5rem;
  
}

.error-message {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background-color: #ffe8e8;
  color: #cc0000;
  border: 1px solid #ffcccc;
  border-radius: var(--radius);
  font-weight: bold;
}

</style>

