<template>
  <div id="app">
    <ErrorBoundary>
      <header class="app-header">
        <h1>{{ title }}</h1>
        <p class="subtitle">Real-time flight information</p>
      </header>
      
      <nav>
        <router-link to="/departure">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
          </svg>
          Departures
        </router-link>
        <router-link to="/arrival">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6.8 4.8 8 13l-3.5 3.5C3 18 2.5 20 3 21c1 .5 3 0 4.5-1.5L11 16l8.2 1.8c.5.1.9-.1 1.1-.5l.3-.5c.2-.5.1-1-.3-1.3L15 12l2-3h3l1-1-3-2-2-3-1 1v3l-3 2-3.5-5.3c-.3-.4-.8-.5-1.3-.3l-.5.2c-.4.3-.6.7-.5 1.2z"/>
          </svg>
          Arrivals
        </router-link>
      </nav>
      
      <div class="data-source-info">
        <span class="source-label">Data Source:</span>
        <span class="source-value">{{ dataSourceLabel }}</span>
        <button @click="toggleDataSource" class="toggle-source-btn">
          Switch to {{ appConfig.dataSource === 'json' ? 'API' : 'Local' }}
        </button>
      </div>
      
      <div class="traffic-status-container">
        <button v-if="!dialogShow" @click="showTrafficStatus" class="traffic-status-btn" :disabled="isLoadingTraffic">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ isLoadingTraffic ? 'Loading...' : 'Traffic Status' }}
        </button>
      </div>
      
      <Transition name="fade">
        <div v-show="dialogShow" class="dialog" :class="dialogClass">
          <div class="dialog-content">
            <div class="dialog-icon">
              <svg v-if="dialogClass === 'error-dialog'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="dialog-text">
              <p>{{ dialogLabel }}</p>
              <p v-if="affectedFlights && affectedFlights.length > 0" class="affected-flights">
                Affected flights: {{ affectedFlights.join(', ') }}
              </p>
            </div>
          </div>
          <button @click="dialogShow = false" class="dialog-close">Close</button>
        </div>
      </Transition>
      
      <main class="main-content">
        <router-view :key="dataSourceKey" v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
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
      return appConfig.dataSource === 'json' ? 'Local JSON' : 'Live API';
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
/* App-specific styles */
.app-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.subtitle {
  color: var(--gray-600);
  font-size: 1.125rem;
  margin-top: -1rem;
  margin-bottom: var(--spacing-xl);
  font-weight: 400;
}

nav svg {
  margin-right: var(--spacing-xs);
  vertical-align: middle;
}

.data-source-info {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.source-label {
  font-weight: 500;
  color: var(--gray-600);
}

.source-value {
  font-weight: 600;
  color: var(--primary-color);
}

.toggle-source-btn {
  font-size: 0.875rem;
  padding: var(--spacing-xs) var(--spacing-md);
}

.traffic-status-container {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.traffic-status-btn {
  background-color: var(--warning-color);
  gap: var(--spacing-sm);
}

.traffic-status-btn:hover {
  background-color: #e69500;
}

.dialog {
  margin: 0 auto;
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
}

.dialog-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  flex: 1;
}

.dialog-icon {
  flex-shrink: 0;
}

.dialog-icon svg {
  width: 24px;
  height: 24px;
}

.dialog-text {
  flex: 1;
}

.dialog-close {
  flex-shrink: 0;
  margin-left: var(--spacing-lg);
}

.dialog.error-dialog {
  border-left-color: var(--danger-color);
}

.dialog.error-dialog .dialog-icon svg {
  stroke: var(--danger-color);
}

.dialog.warning-dialog {
  border-left-color: var(--warning-color);
}

.dialog.warning-dialog .dialog-icon svg {
  stroke: var(--warning-color);
}

.main-content {
  animation: fadeIn 0.5s ease;
}

@media (max-width: 768px) {
  .data-source-info {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .dialog {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .dialog-close {
    margin-left: 0;
    width: 100%;
  }
}
</style>