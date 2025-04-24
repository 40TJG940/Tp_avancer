<template>
    <div class="filter-container">
      <h4 v-if="searchInput">Filtering by: {{ searchInput }}</h4>
      <div class="input-group">
        <label for="searchInput">Search:</label>
        <input 
          id="searchInput"
          v-model="searchInput" 
          type="text" 
          placeholder="Search by flight number or airline"
          @input="handleSearch">
        <button @click="resetSearch" class="reset-btn">Reset</button>
      </div>
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
  .filter-container {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  
  .input-group {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .input-group input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .search-btn {
    background-color: #007bff;
    color: white;
  }
  
  .reset-btn {
    background-color: #6c757d;
    color: white;
  }
  </style>