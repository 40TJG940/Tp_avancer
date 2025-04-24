<template>
    <div class="flights-departure">
      <header class="view-header">
        <h2>Departures</h2>
        <p class="view-subtitle">Real-time departure information</p>
      </header>
      
      <button @click="showFilters = !showFilters" class="toggle-filters">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </button>
      
      <Transition name="fade">
        <FilterFlights 
          v-show="showFilters" 
          @handle-search="handleSearchFilterFlight"
          @reset-search="resetSearch"
        />
      </Transition>
      
      <div v-if="isLoading" class="loading">
        <span>Loading flights...</span>
      </div>
      
      <div v-else-if="error" class="error">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error.message }}</p>
        <button @click="retryLoad" class="retry-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Try Again
        </button>
      </div>
      
      <div v-else class="flights-list">
        <TransitionGroup name="list">
          <Flight
            v-for="flight in filteredFlights"
            :key="flight.flight_number"
            :flight-detail="flight"
            :is-arrival="false"
            :is-followed="isFlightFollowed(flight.flight_number)"
            @follow="openFollowModal"
          />
        </TransitionGroup>
        <p v-if="filteredFlights.length === 0 && searchFlightInput" class="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          No flights found matching your search criteria.
        </p>
        <p v-else-if="flights.length === 0" class="no-data">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          No departure flights available.
        </p>
      </div>
      
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="followModalOpen" class="modal">
            <div class="modal-content">
              <h3>Follow Flight {{ selectedFlight.flight_number }}</h3>
              <div class="form-group">
                <label for="followEmail">Your email address</label>
                <div class="input-with-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input 
                    id="followEmail" 
                    v-model="followEmail" 
                    type="email"
                    placeholder="Enter your email"
                    :class="{ 'error': emailError }"
                  >
                </div>
                <p v-if="emailError" class="error-message">{{ emailError }}</p>
                <p v-if="followError" class="error-message">{{ followError }}</p>
              </div>
              <div class="modal-buttons">
                <button @click="confirmFollowFlight" :disabled="isSubmitting" class="primary-btn">
                  <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {{ isSubmitting ? 'Processing...' : `Follow Flight` }}
                </button>
                <button @click="closeFollowModal" class="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
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
  .view-header {
    margin-bottom: var(--spacing-xl);
  }
  
  .view-subtitle {
    color: var(--gray-600);
    font-size: 1rem;
    margin-top: var(--spacing-xs);
  }
  
  .toggle-filters {
    margin-bottom: var(--spacing-lg);
    background-color: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
  }
  
  .toggle-filters:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  .no-results, .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xxl);
    text-align: center;
    color: var(--gray-600);
    background: white;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  .no-results svg, .no-data svg {
    color: var(--gray-400);
    width: 48px;
    height: 48px;
  }
  
  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .error svg {
    width: 48px;
    height: 48px;
  }
  
  .form-group {
    margin-bottom: var(--spacing-lg);
  }
  
  .form-group label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    color: var(--gray-700);
  }
  
  .input-with-icon {
    position: relative;
  }
  
  .input-with-icon svg {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-600);
  }
  
  .input-with-icon input {
    padding-left: calc(var(--spacing-md) * 3);
  }
  
  .primary-btn {
    background-color: var(--primary-color);
  }
  
  .cancel-btn {
    background-color: var(--gray-600);
  }
  
  .cancel-btn:hover {
    background-color: var(--gray-800);
  }
  
  /* Transitions */
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }
  
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: transform 0.3s ease;
  }
  
  .modal-enter-from .modal-content,
  .modal-leave-to .modal-content {
    transform: scale(0.9);
  }
  </style>