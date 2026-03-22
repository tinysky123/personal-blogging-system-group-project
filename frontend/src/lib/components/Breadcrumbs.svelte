<script>
    import { page } from '$app/stores';
    import { derived } from 'svelte/store';
  
    // Transform path segments into breadcrumb items
    const breadcrumbs = derived(page, $page => {
      const segments = $page.url.pathname.split('/').filter(Boolean);
      const items = [];
      let path = '';
  
      for (let i = 0; i < segments.length; i++) {
        path += `/${segments[i]}`;
        items.push({
          label: decodeURIComponent(segments[i].replace(/-/g, ' ')),
          href: i === segments.length - 1 ? null : path
        });
      }
  
      return items;
    });
  </script>
  
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="/">Home</a><span class="separator">/</span></li>
      {#each $breadcrumbs as item, index}
        <li class="breadcrumb-item">
          {#if item.href}
            <a href={item.href}>{item.label}</a>
          {:else}
            <span class="current">{item.label}</span>
          {/if}
          {#if index !== $breadcrumbs.length - 1}
            <span class="separator">/</span>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
  <style>
    nav[aria-label="Breadcrumb"] {
      margin: 1em 0;
      font-size: var(--body-bigger-font-size);
    }
  
    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      list-style: none;
      padding: 0;
      margin: 0;
    }
  
    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: #444;
    }
  
    .breadcrumb-item a {
      text-decoration: none;
      color: var(--brand-primary, #0077cc);
      transition: color 0.2s ease;
    }
  
    .breadcrumb-item a:hover {
      color: #2c3e50;
      font-weight: bold;
    }
  
    .breadcrumb-item .current {
      font-weight: 600;
      color: #555;
      text-decoration: underline;
    }
  
    .separator {
      margin: 0 0.4rem;
      color: #3b3a3a;
      user-select: none;
    }
  
    @media (max-width: 600px) {
      .breadcrumb {
        font-size: var(--body-font-size);
        flex-wrap: wrap;
        gap: 0.2rem;
      }
      .separator {
        margin: 0 0.3rem;
      }
    }
  </style>
  