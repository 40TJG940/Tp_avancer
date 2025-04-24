<template>
    <div class="filter-container">
      <div class="filter-header">
        <h4>Search Flights</h4>
        <p class="filter-subtitle">Filter by flight number or airline</p>
      </div>
      <div class="input-group">
        <div class="input-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            id="searchInput"
            v-model="searchInput" 
            type="text" 
            placeholder="Search by flight number or airline"
            @input="handleSearch">
        </div>
        <button @click="resetSearch" class="reset-btn" v-if="searchInput">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Clear
        </button>
      </div>
      <p v-if="searchInput" class="filter-info">
        Showing results for: <strong>{{ searchInput }}</strong>
      </p>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'FilterFlights',
    emits: ['handle-search', 'reset-search'],
    setup(props, { emit }) {
      const searchInput = ref('');
      
      const handleSearch = () => {
        emit('handle-search', searchInput.value);
      };
      
      const resetSearch = () => {
        searchInput.value = '';
        emit('reset-search');
      };
      
      return {
        searchInput,
        handleSearch,
        resetSearch
      };
    }
  }
  </script>
  
  <style scoped>
  .filter-header {
    margin-bottom: var(--spacing-md);
  }
  
  .filter-header h4 {
    margin-bottom: var(--spacing-xs);
    color: var(--primary-color);
  }
  
  .filter-subtitle {
    color: var(--gray-600);
    font-size: 0.875rem;
  }
  
  .input-wrapper {
    position: relative;
    flex: 1;
  }
  
  .search-icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-600);
    pointer-events: none;
  }
  
  .input-wrapper input {
    padding-left: calc(var(--spacing-md) * 3);
  }
  
  .reset-btn {
    background-color: var(--gray-600);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }
  
  .reset-btn:hover {
    background-color: var(--gray-800);
  }
  
  .filter-info {
    margin-top: var(--spacing-sm);
    color: var(--gray-600);
    font-size: 0.875rem;
  }
  
  .filter-info strong {
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    .input-group {
      gap: var(--spacing-sm);
    }
  }
  </style>