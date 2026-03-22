<script>
  import { page } from "$app/stores";
  import { userStore } from "$lib/store/user-store.js"; 
  import { goto } from '$app/navigation';
  import { PUBLIC_API_BASE_URL } from "$env/static/public";
  import NotificationWrapper from '$lib/components/NotificationWrapper.svelte';

  export let isHome = false;

  $: path = $page.url.pathname;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const restoreLoginState = () => {
    const tokenId = getCookie('tokenId');
    const username = getCookie('username');
    if (tokenId && username) {
      userStore.set({ tokenId, username });
    }
  };

  restoreLoginState();

  $: user = $userStore; 
  $: isLoggedIn = user !== null;
  $: username = isLoggedIn ? user.username : '';
  $: tokenId = isLoggedIn ? user.tokenId : '';

  const handleLogout = async () => {
    try {
      if (tokenId) {
        const apiUrl = `${PUBLIC_API_BASE_URL}/auth`;
        await fetch(apiUrl, {
          method: 'DELETE',
          headers: {
            'authorization': `${tokenId}`
          }
        });

        document.cookie = `tokenId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        userStore.set(null);
        goto('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogin = () => {
    const location = window.location.pathname;
    goto(`/login?redirect=${location}`);
  };

  const handleRegister = () => goto('/register');
  const handleHome = () => goto('/');
</script>

<nav class="nav {isHome ? 'glass-nav' : 'solid-nav'}">
  <div class="div">
    <h1 on:click={handleHome}>PLATES & PLACES</h1>
    <header class="header">
      <div class="navbar">
        <div class="text-wrapper"><a href="/" class:active={$page.url.pathname === "/"}>HOME</a></div>
        <div class="text-wrapper"><a href="/articles" class:active={$page.url.pathname === "/articles"}>ARTICLES</a></div>
        {#if isLoggedIn}
          <div class="text-wrapper"><a href="/profile" class:active={$page.url.pathname === "/profile"}>PROFILE</a></div>
          <div class="text-wrapper"><a href="/myarticles" class:active={$page.url.pathname === "/myarticles"}>MY ARTICLES</a></div>
          <div class="icon-container">
            <a href="/createarticle" class:active={$page.url.pathname === "/createarticle"} id="icon-create">
              <img src="/icon-create.png" alt="create" />
            </a>
            <NotificationWrapper />
          </div>
          <div class="text-hello">Hello, {username}</div>
        {/if}
      </div>

      <div class="group">
        <div class="log-in-register-wrapper">
          {#if !isLoggedIn}
            <div class="log-in-register" on:click={handleLogin}>LOG IN</div>
            /
            <div class="log-in-register" on:click={handleRegister}>REGISTER</div>
          {/if}
          {#if isLoggedIn}
            <div class="log-out" on:click={handleLogout}>LOG OUT</div>
          {/if}
        </div>
      </div>
    </header>
  </div>
</nav>

<style>
  :root {
    --brand-primary: #2c3e50;
    --brand-secondary: rgba(164, 232, 224, 1);
    /* --primary-text: #ffffff; */
  }

  nav.nav {
    width: 100%;
    padding: 0.5rem 1rem;
    position: sticky;
    top: 0;
    z-index: 999;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;
  }

  .glass-nav {
    background: rgba(44, 62, 80, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .solid-nav {
    background: #2c3e50;
  }

  .nav .div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav h1 {
    font-size: var(--heading-3-font-size);
    color: white;
    margin: 0;
    font-weight: bold;
    letter-spacing: 1px;
    cursor: pointer;
  }

  .nav .header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav .navbar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .nav .text-wrapper a {
    font-size: var(--heading-3-font-size);
    color: white;
    font-weight: 500;
    text-decoration: none;
    position: relative;
    transition: all 0.3s ease;
  }

  .nav .text-wrapper a:hover,
  .nav .text-wrapper a.active {
    color:  #ffffff;
  }

  .nav .text-wrapper a::after {
    content: '';
    position: absolute;
    width: 0%;
    height: 2px;
    background: var(--brand-secondary);
    left: 0;
    bottom: -3px;
    transition: width 0.3s ease;
  }

  .nav .text-wrapper a:hover::after,
  .nav .text-wrapper a.active::after {
    width: 100%;
  }

  .text-hello {
    color: white;
    font-size: var(--heading-3-font-size);
  }

  .icon-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  #icon-create img {
    width: 20px;
    filter: drop-shadow(0 0 2px white);
  }

  .nav .group {
    margin-left: auto;
  }

  .nav .log-in-register-wrapper {
    background: var(--glass-bg);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    color: white;
    font-weight: bold;
    font-size: var(--heading-3-font-size);
    cursor: pointer;
    backdrop-filter: blur(5px);
    transition: background 0.3s ease;
  }

  .nav .log-in-register-wrapper:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .nav .log-in-register,
  .nav .log-out {
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .nav .log-in-register:hover,
  .nav .log-out:hover {
    color: var(--brand-secondary);
  }
</style>
