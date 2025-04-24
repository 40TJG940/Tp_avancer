<template>
    <div class="flights-arrival">
      <h2>Flights Arrival</h2>
      
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
      
      <div v-else class="flights-list">
        <Flight
          v-for="(flight, index) in filteredFlights"
          :key="index"
          :flight-detail="flight"
          :is-arrival="true"
          :is-followed="isFlightFollowed(flight.flight_number)"
          @follow="openFollowModal"
        />
        <p v-if="filteredFlights.length === 0" class="no-results">
          No flights found matching your search criteria.
        </p>
      </div>
      
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
  import dataService from '../services/dataService';
  import appConfig from '../config/appConfig';
  
  export default {
    name: 'FlightsArrival',
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
      
      onMounted(async () => {
        try {
          isLoading.value = true;
          const response = await dataService.getArrivalFlights();
          
          if (response.status === 200) {
            const flightsData = response.data.flights || response.data;
            
            // Adapter les données pour l'affichage
            flights.value = flightsData.map((flight) => ({
              flight_number: flight.flight_number,
              city: flight.origin_city,
              company: flight.company,
              arrival_time: flight.arrival_time_due, // Utiliser l'heure prévue comme heure principale
              arrival_time_estimated: flight.arrival_time_estimated,
              status: flight.status,
              origin_airport_code: flight.origin_airport_code
            }));
            
            if (appConfig.debug) {
              console.log(`Loaded ${flights.value.length} arrival flights using ${appConfig.dataSource}`);
              console.log('First flight data:', flights.value[0]);
            }
          } else {
            console.error('Error fetching flights:', response);
          }
        } catch (error) {
          console.error('Error loading flights:', error);
        } finally {
          isLoading.value = false;
        }
      });
      
      const filteredFlights = computed(() => {
        if (!flights.value || flights.value.length === 0) {
          return [];
        }
        
        if (!searchFlightInput.value) {
          return flights.value.sort((a, b) => {
            if (a.arrival_time && b.arrival_time) {
              return a.arrival_time.localeCompare(b.arrival_time);
            }
            return 0;
          });
        }
        
        const searchTerm = searchFlightInput.value.toLowerCase();
        const filtered = flights.value.filter(flight => 
          (flight.company && flight.company.toLowerCase().includes(searchTerm)) ||
          (flight.flight_number && flight.flight_number.toLowerCase().includes(searchTerm))
        );
        
        return filtered.sort((a, b) => {
          if (a.arrival_time && b.arrival_time) {
            return a.arrival_time.localeCompare(b.arrival_time);
          }
          return 0;
        });
      });
      
      const handleSearchFilterFlight = (input) => {
        searchFlightInput.value = input;
      };
      
      const resetSearch = () => {
        searchFlightInput.value = '';
      };
      
      const openFollowModal = (flight) => {
        selectedFlight.value = flight;
        followModalOpen.value = true;
      };
      
      const confirmFollowFlight = async () => {
        if (followEmail.value && selectedFlight.value) {
          try {
            isSubmitting.value = true;
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
        isSubmitting
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