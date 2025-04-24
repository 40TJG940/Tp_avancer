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
      
      <div v-if="isLoading" class="loading">
        Loading flights...
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error.message }}</p>
        <button @click="retryLoad" class="retry-button">Retry</button>
      </div>
      
      <div v-else class="flights-list">
        <Flight
          v-for="flight in filteredFlights"
          :key="flight.flight_number"
          :flight-detail="flight"
          :is-arrival="false"
          :is-followed="isFlightFollowed(flight.flight_number)"
          @follow="openFollowModal"
        />
        <p v-if="filteredFlights.length === 0 && searchFlightInput" class="no-results">
          No flights found matching your search criteria.
        </p>
        <p v-else-if="flights.length === 0" class="no-data">
          No departure flights available.
        </p>
      </div>
      
      <div v-if="followModalOpen" class="modal">
        <div class="modal-content">
          <h3>Follow Flight {{ selectedFlight.flight_number }}</h3>
          <label for="followEmail">Your email:</label>
          <input 
            id="followEmail" 
            v-model="followEmail" 
            type="email"
            :class="{ 'error': emailError }"
          >
          <p v-if="emailError" class="error-message">{{ emailError }}</p>
          <p v-if="followError" class="error-message">{{ followError }}</p>
          <div class="modal-buttons">
            <button @click="confirmFollowFlight" :disabled="isSubmitting">
              {{ isSubmitting ? 'Processing...' : `Follow Flight ${selectedFlight.flight_number}` }}
            </button>
            <button @click="closeFollowModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import Flight from '../components/Flight.vue';
  import FilterFlights from '../components/FilterFlights.vue';
  import dataService from '../services/dataService';
  import errorHandler from '../services/errorHandler';
  import appConfig from '../config/appConfig';
  
  export default {
    name: 'FlightsDeparture',
    components: {
      Flight,
      FilterFlights
    },
    setup() {
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
      const emailError = ref('');
      const followError = ref('');
      
      const loadFlights = async () => {
        try {
          isLoading.value = true;
          error.value = null;
          
          const response = await dataService.getDepartureFlights();
          
          if (response.error) {
            console.warn('Data loaded with errors:', response.error);
          }
          
          if (response.status === 200) {
            flights.value = response.data.flights || response.data;
            if (appConfig.debug) {
              console.log(`Loaded ${flights.value.length} departure flights`);
            }
          } else {
            throw new Error(response.error?.message || 'Failed to load flights');
          }
        } catch (err) {
          const handledError = errorHandler.handleError(err, 'FlightsDeparture.loadFlights');
          error.value = {
            message: errorHandler.getUserFriendlyMessage(handledError),
            raw: handledError
          };
        } finally {
          isLoading.value = false;
        }
      };
      
      const retryLoad = () => {
        loadFlights();
      };
      
      onMounted(() => {
        loadFlights();
      });
      
      const filteredFlights = computed(() => {
        if (!flights.value || flights.value.length === 0) {
          return [];
        }
        
        if (!searchFlightInput.value) {
          return flights.value.sort((a, b) => 
            (a.departure_time || '').localeCompare(b.departure_time || '')
          );
        }
        
        const searchTerm = searchFlightInput.value.toLowerCase();
        const filtered = flights.value.filter(flight => 
          (flight.company && flight.company.toLowerCase().includes(searchTerm)) ||
          (flight.flight_number && flight.flight_number.toLowerCase().includes(searchTerm))
        );
        
        return filtered.sort((a, b) => 
          (a.departure_time || '').localeCompare(b.departure_time || '')
        );
      });
      
      const handleSearchFilterFlight = (input) => {
        searchFlightInput.value = input;
      };
      
      const resetSearch = () => {
        searchFlightInput.value = '';
      };
      
      const validateEmail = (email) => {
        if (!email) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return 'Invalid email format';
        }
        return '';
      };
      
      const openFollowModal = (flight) => {
        selectedFlight.value = flight;
        followModalOpen.value = true;
        emailError.value = '';
        followError.value = '';
      };
      
      const closeFollowModal = () => {
        followModalOpen.value = false;
        followEmail.value = '';
        emailError.value = '';
        followError.value = '';
      };
      
      const confirmFollowFlight = async () => {
        emailError.value = validateEmail(followEmail.value);
        
        if (emailError.value) {
          return;
        }
        
        if (followEmail.value && selectedFlight.value) {
          try {
            isSubmitting.value = true;
            followError.value = '';
            
            const response = await dataService.followFlight(
              selectedFlight.value.flight_number,
              followEmail.value
            );
            
            if (response.status === 200) {
              followedFlights.value.push({
                flight: selectedFlight.value,
                email: followEmail.value,
                subscriptionId: response.data.subscriptionId
              });
              closeFollowModal();
            }
          } catch (err) {
            const handledError = errorHandler.handleError(err, 'FlightsDeparture.confirmFollowFlight');
            followError.value = errorHandler.getUserFriendlyMessage(handledError);
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
        closeFollowModal,
        confirmFollowFlight,
        isFlightFollowed,
        isLoading,
        isSubmitting,
        error,
        emailError,
        followError,
        retryLoad
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
  
  .no-results, .no-data {
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
  
  .retry-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .retry-button:hover {
    background-color: #218838;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.9em;
    margin-top: 5px;
  }
  
  input.error {
    border-color: #dc3545;
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