<script>
    export let currentPage = 1;
    export let totalPages = 1;
    export let onPageChange = () => {};
  
    function goToPage(page) {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    }
  </script>
  
  <div class="pagination">
    <button on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
      ⬅ Prev
    </button>
  
    {#each Array(totalPages).fill(0).map((_, i) => i + 1) as page}
      <button
        class:active={page === currentPage}
        on:click={() => goToPage(page)}
      >
        {page}
      </button>
    {/each}
  
    <button on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
      Next ➡
    </button>
  </div>
  
  <style>
    
.pagination {
  display: flex;
  gap: 0.5rem;
  margin: 2rem auto;
  justify-content: center;
 
}

.pagination button {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  color: var(--brand-primary);
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1.5rem;
}

.pagination button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.pagination button.active {
  background-color: var(--brand-primary);
  color: #fff;
  font-weight: bold;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
  </style>
  