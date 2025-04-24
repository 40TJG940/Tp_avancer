<template>
    <div v-if="error" class="error-boundary">
      <div class="error-content">
        <h2>{{ errorTitle }}</h2>
        <p>{{ errorMessage }}</p>
        <button @click="retry" class="retry-button">Try Again</button>
        <button @click="goHome" class="home-button">Go to Home</button>
      </div>
    </div>
    <slot v-else></slot>
  </template>
  
  <script>
  import { ref, onErrorCaptured } from 'vue';
  import { useRouter } from 'vue-router';
  import errorHandler from '../services/errorHandler';
  
  export default {
    name: 'ErrorBoundary',
    setup() {
      const error = ref(null);
      const errorTitle = ref('');
      const errorMessage = ref('');
      const router = useRouter();
  
      const retry = () => {
        error.value = null;
        errorTitle.value = '';
        errorMessage.value = '';
        window.location.reload();
      };
  
      const goHome = () => {
        error.value = null;
        errorTitle.value = '';
        errorMessage.value = '';
        router.push('/');
      };
  
      onErrorCaptured((err) => {
        const handledError = errorHandler.handleError(err, 'ErrorBoundary');
        error.value = err;
        errorTitle.value = 'Oops! Something went wrong';
        errorMessage.value = errorHandler.getUserFriendlyMessage(handledError);
        
        // Empêcher la propagation de l'erreur
        return false;
      });
  
      return {
        error,
        errorTitle,
        errorMessage,
        retry,
        goHome
      };
    }
  };
  </script>
  
  <style scoped>
  .error-boundary {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 20px;
  }
  
  .error-content {
    text-align: center;
    max-width: 500px;
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .error-content h2 {
    color: #dc3545;
    margin-bottom: 15px;
  }
  
  .error-content p {
    color: #666;
    margin-bottom: 20px;
  }
  
  .retry-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
  }
  
  .home-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .retry-button:hover {
    background-color: #218838;
  }
  
  .home-button:hover {
    background-color: #0056b3;
  }
  </style>