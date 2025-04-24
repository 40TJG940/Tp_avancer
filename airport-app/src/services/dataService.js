import appConfig from '../config/appConfig';
import flightApi from './flightApi';
import flightsDepartureData from '../data/flights-departure.json';
import flightsArrivalData from '../data/flights-arrival.json';

const dataService = {
  // Récupérer les vols au départ
  async getDepartureFlights() {
    if (appConfig.dataSource === 'api') {
      if (appConfig.debug) console.log('Using API for departure flights');
      return await flightApi.getDepartureFlights();
    } else {
      if (appConfig.debug) console.log('Using JSON for departure flights');
      // Simuler une petite latence même en mode JSON pour uniformiser l'expérience
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        data: flightsDepartureData,
        status: 200
      };
    }
  },

  // Récupérer les vols à l'arrivée
  async getArrivalFlights() {
    if (appConfig.dataSource === 'api') {
      if (appConfig.debug) console.log('Using API for arrival flights');
      return await flightApi.getArrivalFlights();
    } else {
      if (appConfig.debug) console.log('Using JSON for arrival flights');
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        data: flightsArrivalData,
        status: 200
      };
    }
  },

  // Suivre un vol
  async followFlight(flightNumber, email) {
    if (appConfig.dataSource === 'api') {
      if (appConfig.debug) console.log('Using API for flight following');
      return await flightApi.followFlight(flightNumber, email);
    } else {
      if (appConfig.debug) console.log('Using simulated response for flight following');
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
  },

  // Obtenir les informations de trafic
  async getTrafficStatus() {
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
  }
};

export default dataService;