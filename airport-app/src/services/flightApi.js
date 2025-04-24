// API pour les vols sans fallback automatique
import errorHandler from './errorHandler';
import appConfig from '../config/appConfig';

// Fonction utilitaire pour fetch avec timeout
async function fetchWithTimeout(url, options = {}, timeout = appConfig.apiTimeout || 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export const flightApi = {
  // Récupérer les vols au départ
  async getDepartureFlights() {
    try {
      console.log('Fetching departure flights from API...');
      
      // Pour tester les erreurs, vous pouvez utiliser une URL invalide
      const url = appConfig.apiUrls?.departures || 'https://invalid-url.com/api/departures';
      
      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validation des données
      if (!Array.isArray(data?.flights) && !Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      return {
        data: data,
        status: 200,
        source: 'api'
      };
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'getDepartureFlights');
      throw handledError; // Propager l'erreur au lieu de faire un fallback
    }
  },

  // Récupérer les vols à l'arrivée
  async getArrivalFlights() {
    try {
      console.log('Fetching arrival flights from API...');
      
      const url = appConfig.apiUrls?.arrivals || 'https://invalid-url.com/api/arrivals';
      
      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validation des données
      if (!Array.isArray(data?.flights) && !Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      return {
        data: data,
        status: 200,
        source: 'api'
      };
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'getArrivalFlights');
      throw handledError;
    }
  },

  // Obtenir les informations de trafic
  async getTrafficStatus() {
    try {
      console.log('Fetching traffic status from API...');
      
      const url = appConfig.apiUrls?.trafficStatus || 'https://invalid-url.com/api/traffic';
      
      const response = await fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data?.message) {
        throw new Error('Invalid traffic status data format');
      }
      
      return {
        data: data,
        status: 200,
        source: 'api'
      };
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'getTrafficStatus');
      throw handledError;
    }
  },

  // Suivre un vol
  async followFlight(flightNumber, email) {
    try {
      // Validation des entrées
      if (!flightNumber || !email) {
        throw new Error('Flight number and email are required');
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }
      
      // Simuler un appel API avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Pour tester les erreurs, décommentez la ligne suivante :
      // throw new Error('Test error for follow flight');
      
      console.log(`Flight ${flightNumber} is now being followed by ${email}`);
      
      return {
        data: {
          flightNumber,
          email,
          subscriptionId: Math.random().toString(36).substring(7),
          status: 'active'
        },
        status: 200
      };
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'followFlight');
      throw handledError;
    }
  }
};

export default flightApi;