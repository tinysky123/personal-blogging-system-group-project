<script>
  import "$lib/css/app.css";
  import Nav from "../lib/components/nav.svelte";
  import { page, navigating } from "$app/stores";
  import { derived } from 'svelte/store';

  const isHome = derived(page, $page => $page.url.pathname === '/');

  // Correctly track navigation
  let isNavigating = false;
  $: $navigating ? isNavigating = true : isNavigating = false;
</script>

{#if isNavigating}
  <div class="loader-overlay">
    <span class="loader"></span>
  </div>
{/if}


<div class="background"></div>


<Nav {isHome} />

<div class="container">
  <slot />
</div>

<style>
  /* .background {
    position: fixed;
    inset: 0;
    background: url('/background5.jpg');
    color: #333;
  font-family: 'Inter', sans-serif;

    background-size: cover;
    width: 100%;
    z-index: -1;
    /* background: linear-gradient(145deg, #fefefe, #f3f3f3); */
    /* background: linear-gradient(to bottom, #ffffff, #f7f7f7); */
/*}*/

.background {
    position: fixed;
    inset: 0;
    margin: 0;
    padding: 0;
    background: /*linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),*/
                url('/background9.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    height: 100vh;
    color: white;   
    z-index: -1;

}
  




  .loader-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader {
    width: 64px;
    height: 12px;
    background:
      radial-gradient(circle 6px, #FFF 100%, transparent 0),
      radial-gradient(circle 6px, #FFF 100%, transparent 0);
    background-size: 12px 12px;
    background-position: left center, right center;
    background-repeat: no-repeat;
    position: relative;
  }

  .loader:before {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #FF3D00;
    inset: 0;
    margin: auto;
    animation: mvX 0.6s, mvY 0.3s;
    animation-timing-function: cubic-bezier(.5, -300, .5, 300);
    animation-iteration-count: infinite;
  }



  @keyframes mvX {
    100% { left: 0.85px }
  }

  @keyframes mvY {
    100% { top: 0.5px }
  }


</style>
