<template>
  <div id="app">
    <ErrorBoundary>
      <h1>{{ title }}</h1>
      
      <nav>
        <router-link to="/departure">Flights Departure</router-link> | 
        <router-link to="/arrival">Flights Arrival</router-link>
      </nav>
      
      <div class="data-source-info">
        Current data source: {{ dataSourceLabel }}
        <button @click="toggleDataSource" class="toggle-source-btn">
          Switch to {{ appConfig.dataSource === 'json' ? 'API' : 'JSON' }}
        </button>
      </div>
      
      <button v-if="!dialogShow" @click="showTrafficStatus" :disabled="isLoadingTraffic">
        {{ isLoadingTraffic ? 'Loading...' : 'Display traffic status' }}
      </button>
      
      <Transition>
        <div v-show="dialogShow" class="dialog" :class="dialogClass">
          <p>{{ dialogLabel }}</p>
          <p v-if="affectedFlights && affectedFlights.length > 0" class="affected-flights">
            Affected flights: {{ affectedFlights.join(', ') }}
          </p>
          <button @click="dialogShow = false">Close</button>
        </div>
      </Transition>
      
      <router-view :key="dataSourceKey" />
    </ErrorBoundary>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import dataService from './services/dataService';
import errorHandler from './services/errorHandler';
import appConfig from './config/appConfig';
import ErrorBoundary from './components/ErrorBoundary.vue';

export default {
  name: 'App',
  components: {
    ErrorBoundary
  },
  setup() {
    const title = ref('Montpellier Airport');
    const dialogShow = ref(false);
    const dialogLabel = ref('');
    const affectedFlights = ref([]);
    const dialogClass = ref('');
    const dataSourceKey = ref(0);
    const isLoadingTraffic = ref(false);
    
    const dataSourceLabel = computed(() => {
      return appConfig.dataSource === 'json' ? 'JSON Files' : 'Simulated API';
    });
    
    const showTrafficStatus = async () => {
      try {
        isLoadingTraffic.value = true;
        const response = await dataService.getTrafficStatus();
        
        if (response.status === 200) {
          dialogLabel.value = response.data.message;
          affectedFlights.value = response.data.affectedFlights || [];
          dialogClass.value = response.data.severity === 'error' ? 'error-dialog' : '';
          dialogShow.value = true;
        } else if (response.error) {
          // Afficher l'erreur mais utiliser les données de fallback
          dialogLabel.value = response.data.message;
          affectedFlights.value = response.data.affectedFlights || [];
          dialogClass.value = 'warning-dialog';
          dialogShow.value = true;
        }
      } catch (error) {
        const handledError = errorHandler.handleError(error, 'App.showTrafficStatus');
        dialogLabel.value = errorHandler.getUserFriendlyMessage(handledError);
        affectedFlights.value = [];
        dialogClass.value = 'error-dialog';
        dialogShow.value = true;
      } finally {
        isLoadingTraffic.value = false;
      }
    };
    
    const toggleDataSource = () => {
      try {
        appConfig.dataSource = appConfig.dataSource === 'json' ? 'api' : 'json';
        dataSourceKey.value++; // Force le rechargement des composants router-view
        if (appConfig.debug) {
          console.log(`Switched data source to: ${appConfig.dataSource}`);
        }
      } catch (error) {
        const handledError = errorHandler.handleError(error, 'App.toggleDataSource');
        console.error('Failed to switch data source:', handledError);
      }
    };
    
    return {
      title,
      dialogShow,
      dialogLabel,
      affectedFlights,
      dialogClass,
      dataSourceLabel,
      dataSourceKey,
      isLoadingTraffic,
      showTrafficStatus,
      toggleDataSource,
      appConfig
    };
  }
}
</script>

<style>
#app {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  max-width: 1280px;
  padding: 2rem;
}

nav {
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  margin: 0 10px;
}

nav a.router-link-active {
  color: #42b983;
}

.dialog {
  background-color: #ffe0b2;
  border-left: 4px solid #ff9800;
  padding: 10px 20px;
  margin: 20px auto;
  text-align: left;
  max-width: 600px;
  border-radius: 4px;
}

.dialog.error-dialog {
  background-color: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.dialog.warning-dialog {
  background-color: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

.affected-flights {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.data-source-info {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.toggle-source-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.toggle-source-btn:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Global error styles */
.error-message {
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 5px;
}

.error-container {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 20px;
  margin: 20px 0;
  color: #721c24;
}

/* Loading states */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading::after {
  content: "";
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>