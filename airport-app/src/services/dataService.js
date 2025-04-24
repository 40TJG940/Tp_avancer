import appConfig from '../config/appConfig';
import flightApi from './flightApi';
import flightsDepartureData from '../data/flights-departure.json';
import flightsArrivalData from '../data/flights-arrival.json';
import errorHandler from './errorHandler';

const dataService = {
  // Récupérer les vols au départ
  async getDepartureFlights() {
    try {
      if (appConfig.dataSource === 'api') {
        if (appConfig.debug) console.log('Using API for departure flights');
        return await flightApi.getDepartureFlights();
      } else {
        if (appConfig.debug) console.log('Using JSON for departure flights');
        
        // Simuler une petite latence même en mode JSON
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Vérifier que les données JSON sont valides
        if (!flightsDepartureData || (!Array.isArray(flightsDepartureData.flights) && !Array.isArray(flightsDepartureData))) {
          throw new Error('Invalid departure data structure');
        }
        
        return {
          data: flightsDepartureData,
          status: 200
        };
      }
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'dataService.getDepartureFlights');
      
      // En cas d'erreur critique, retourner des données vides
      if (appConfig.debug) {
        console.error('Critical error in getDepartureFlights, returning empty data');
      }
      
      return {
        data: { flights: [] },
        status: 500,
        error: handledError
      };
    }
  },

  // Récupérer les vols à l'arrivée
  async getArrivalFlights() {
    try {
      if (appConfig.dataSource === 'api') {
        if (appConfig.debug) console.log('Using API for arrival flights');
        return await flightApi.getArrivalFlights();
      } else {
        if (appConfig.debug) console.log('Using JSON for arrival flights');
        
        // Simuler une petite latence même en mode JSON
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Vérifier que les données JSON sont valides
        if (!flightsArrivalData || (!Array.isArray(flightsArrivalData.flights) && !Array.isArray(flightsArrivalData))) {
          throw new Error('Invalid arrival data structure');
        }
        
        return {
          data: flightsArrivalData,
          status: 200
        };
      }
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'dataService.getArrivalFlights');
      
      // En cas d'erreur critique, retourner des données vides
      if (appConfig.debug) {
        console.error('Critical error in getArrivalFlights, returning empty data');
      }
      
      return {
        data: { flights: [] },
        status: 500,
        error: handledError
      };
    }
  },

  // Suivre un vol
  async followFlight(flightNumber, email) {
    try {
      if (!flightNumber || !email) {
        throw new Error('Flight number and email are required');
      }
      
      if (appConfig.dataSource === 'api') {
        if (appConfig.debug) console.log('Using API for flight following');
        return await flightApi.followFlight(flightNumber, email);
      } else {
        if (appConfig.debug) console.log('Using simulated response for flight following');
        
        // Validation de l'email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error('Invalid email format');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          data: {
            flightNumber,
            email,
            subscriptionId: Math.random().toString(36).substring(7),
            status: 'active'
          },
          status: 200
        };
      }
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'dataService.followFlight');
      throw handledError; // Propager l'erreur pour que le composant puisse la gérer
    }
  },

  // Obtenir les informations de trafic
  async getTrafficStatus() {
    try {
      if (appConfig.dataSource === 'api') {
        if (appConfig.debug) console.log('Using API for traffic status');
        return await flightApi.getTrafficStatus();
      } else {
        if (appConfig.debug) console.log('Using static data for traffic status');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          data: {
            message: "Strike in France on 05/08/2025",
            severity: "warning",
            affectedFlights: ["AF101", "AF201", "AF301"]
          },
          status: 200
        };
      }
    } catch (error) {
      const handledError = errorHandler.handleError(error, 'dataService.getTrafficStatus');
      
      // En cas d'erreur, retourner un message par défaut
      return {
        data: {
          message: "Unable to fetch traffic status",
          severity: "error",
          affectedFlights: []
        },
        status: 500,
        error: handledError
      };
    }
  }
};

export default dataService; 