<template>
    <div class="flights-departure">
      <h2>Flights Departure</h2>
      
      <button @click="showFilters = !showFilters" class="toggle-filters">
        {{ showFilters ? 'Hide Filters' : 'Display Filters' }}
      </button>
      
      <Transition name="fade">
        <FilterFlights 
          v-show="showFilters" 
          @handle-search="handleSearchFilterFlight"
          @reset-search="resetSearch"
        />
      </Transition>
      
      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="loading">
        Loading flights...
      </div>
      
      <!-- Message d'erreur si l'API échoue -->
      <div v-if="error" class="error">
        {{ error }}
      </div>
      
      <!-- Liste des vols -->
      <div v-else class="flights-list">
        <Flight
          v-for="flight in filteredFlights"
          :key="flight.flight_number"
          :flight-detail="flight"
          :is-arrival="false"
          :is-followed="isFlightFollowed(flight.flight_number)"
          @follow="openFollowModal"
        />
        <p v-if="filteredFlights.length === 0" class="no-results">
          No flights found matching your search criteria.
        </p>
      </div>
      
      <!-- Modal pour suivre un vol -->
      <div v-if="followModalOpen" class="modal">
        <div class="modal-content">
          <h3>Follow Flight {{ selectedFlight.flight_number }}</h3>
          <label for="followEmail">Your email:</label>
          <input id="followEmail" v-model="followEmail" type="email">
          <div class="modal-buttons">
            <button @click="confirmFollowFlight" :disabled="isSubmitting">
              {{ isSubmitting ? 'Processing...' : `Follow Flight ${selectedFlight.flight_number}` }}
            </button>
            <button @click="followModalOpen = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import Flight from '../components/Flight.vue';
  import FilterFlights from '../components/FilterFlights.vue';
  import flightApi from '../services/flightApi';
  
  export default {
    name: 'FlightsDeparture',
    components: {
      Flight,
      FilterFlights
    },
    setup() {
      // États réactifs
      const flights = ref([]);
      const searchFlightInput = ref('');
      const showFilters = ref(false);
      const followModalOpen = ref(false);
      const selectedFlight = ref({});
      const followEmail = ref('');
      const followedFlights = ref([]);
      const isLoading = ref(true);
      const isSubmitting = ref(false);
      const error = ref(null);
      
      // Fonction asynchrone pour charger les vols
      const loadFlights = async () => {
        try {
          isLoading.value = true;
          error.value = null;
          
          // Appel asynchrone à l'API
          const response = await flightApi.getDepartureFlights();
          
          if (response.status === 200) {
            flights.value = response.data.flights || response.data;
            console.log(`Successfully loaded ${flights.value.length} departure flights`);
          } else {
            throw new Error('Failed to load flights');
          }
        } catch (err) {
          console.error('Error loading flights:', err);
          error.value = 'Failed to load flights. Please try again later.';
        } finally {
          isLoading.value = false;
        }
      };
      
      // Charger les vols quand le composant est monté
      onMounted(() => {
        loadFlights();
      });
      
      // Computed property pour filtrer les vols
      const filteredFlights = computed(() => {
        if (!searchFlightInput.value) {
          return flights.value.sort((a, b) => 
            a.departure_time.localeCompare(b.departure_time)
          );
        }
        
        const searchTerm = searchFlightInput.value.toLowerCase();
        const filtered = flights.value.filter(flight => 
          (flight.company && flight.company.toLowerCase().includes(searchTerm)) ||
          (flight.flight_number && flight.flight_number.toLowerCase().includes(searchTerm))
        );
        
        return filtered.sort((a, b) => 
          a.departure_time.localeCompare(b.departure_time)
        );
      });
      
      // Méthodes de gestion des filtres
      const handleSearchFilterFlight = (input) => {
        searchFlightInput.value = input;
      };
      
      const resetSearch = () => {
        searchFlightInput.value = '';
      };
      
      // Méthodes pour suivre un vol
      const openFollowModal = (flight) => {
        selectedFlight.value = flight;
        followModalOpen.value = true;
      };
      
      const confirmFollowFlight = async () => {
        if (followEmail.value && selectedFlight.value) {
          try {
            isSubmitting.value = true;
            const response = await flightApi.followFlight(
              selectedFlight.value.flight_number,
              followEmail.value
            );
            
            if (response.status === 200) {
              followedFlights.value.push({
                flight: selectedFlight.value,
                email: followEmail.value,
                subscriptionId: response.data.subscriptionId
              });
              followModalOpen.value = false;
              followEmail.value = '';
            }
          } catch (error) {
            console.error('Error following flight:', error);
          } finally {
            isSubmitting.value = false;
          }
        }
      };
      
      const isFlightFollowed = (flightNumber) => {
        return followedFlights.value.some(
          f => f.flight.flight_number === flightNumber
        );
      };
      
      return {
        flights,
        filteredFlights,
        searchFlightInput,
        showFilters,
        handleSearchFilterFlight,
        resetSearch,
        followModalOpen,
        selectedFlight,
        followEmail,
        openFollowModal,
        confirmFollowFlight,
        isFlightFollowed,
        isLoading,
        isSubmitting,
        error
      };
    }
  };
  </script>
  
  <style scoped>
  .flights-list {
    margin-top: 20px;
  }
  
  .toggle-filters {
    margin-bottom: 10px;
  }
  
  .no-results {
    padding: 20px;
    text-align: center;
    color: #999;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .error {
    text-align: center;
    padding: 20px;
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin: 20px 0;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
  }
  
  .modal-buttons {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  </style>