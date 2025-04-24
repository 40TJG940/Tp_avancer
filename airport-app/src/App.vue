<template>
  <div id="app">
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
    
    <button v-if="!dialogShow" @click="showTrafficStatus">Display traffic status</button>
    
    <Transition>
      <div v-show="dialogShow" class="dialog">
        <p>{{ dialogLabel }}</p>
        <button @click="dialogShow = false">Close</button>
      </div>
    </Transition>
    
    <router-view :key="dataSourceKey" />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import dataService from './services/dataService';
import appConfig from './config/appConfig';

export default {
  name: 'App',
  setup() {
    const title = ref('Montpellier Airport');
    const dialogShow = ref(false);
    const dialogLabel = ref('');
    const dataSourceKey = ref(0);
    
    const dataSourceLabel = computed(() => {
      return appConfig.dataSource === 'json' ? 'JSON Files' : 'Simulated API';
    });
    
    const showTrafficStatus = async () => {
      try {
        const response = await dataService.getTrafficStatus();
        if (response.status === 200) {
          dialogLabel.value = response.data.message;
          dialogShow.value = true;
        }
      } catch (error) {
        console.error('Error fetching traffic status:', error);
        dialogLabel.value = 'Unable to fetch traffic status';
        dialogShow.value = true;
      }
    };
    
    const toggleDataSource = () => {
      appConfig.dataSource = appConfig.dataSource === 'json' ? 'api' : 'json';
      dataSourceKey.value++; // Force le rechargement des composants router-view
      if (appConfig.debug) {
        console.log(`Switched data source to: ${appConfig.dataSource}`);
      }
    };
    
    return {
      title,
      dialogShow,
      dialogLabel,
      dataSourceLabel,
      dataSourceKey,
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
  padding: 10px;
  margin-bottom: 20px;
  text-align: left;
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

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>