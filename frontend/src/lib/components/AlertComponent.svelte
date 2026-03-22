<script>
  export let message;
  export let isVisible = false;
  export let onClose;
  export let title = "Login Failed"; 
</script>

{#if isVisible}
  <div class="alert-overlay">
    <div class="alert-box">
      <h2>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="alert-icon" style="width: 2em; height: 2em;margin-bottom:-0.5em">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        {title}
      </h2>
      <p>{message}</p>
      <button class="alert-button" on:click={onClose}>close</button>
    </div>
  </div>
{/if}

<style>
  .alert-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  }

  .alert-box {
    background-color: white;
    padding: 20px;
    border-radius: var(--radius);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    border: 2px solid var(--brand-primary);
  }





.alert-button {
    background-color: var(--brand-primary);
    border-radius: 8px;
    padding: 5px 10px;


    font-family: var(--heading-2-font-family);
    /* font-weight: var(--heading-2-font-weight); */
    color: var(--primary-text);
    font-size: var(--heading-2-font-size);
    letter-spacing: 0.20px;
    line-height: 24px;
    white-space: nowrap;
    cursor: pointer; 
    border: none;
}


.alert-button:hover {
    background-color: var(--brand-scondary);
    transition: background-color 0.3s ease;



    color: white;
}


</style>