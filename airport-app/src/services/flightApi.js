// Simulation d'une API pour les vols
import flightsDepartureData from '../data/flights-departure.json';
import flightsArrivalData from '../data/flights-arrival.json';

// URLs d'API simulées (remplacer ces URLs par vos endpoints mocki.io)
const API_URLS = {
  departures: 'https://mocki.io/v1/578a185a-a042-458d-8ada-e988f4c7935d', // Remplacer par votre URL
  arrivals: 'https://mocki.io/v1/c5b9b3b4-7ddd-4563-880b-0aa74ca9e2f1', // Remplacer par votre URL
  trafficStatus: 'https://mocki.io/v1/traffic-status' // Remplacer par votre URL
};

// Si vous avez créé vos endpoints sur mocki.io, remplacez les URLs ci-dessus
// par les vraies URLs, par exemple:
// const API_URLS = {
//   departures: 'https://mocki.io/v1/votre-id-departures',
//   arrivals: 'https://mocki.io/v1/votre-id-arrivals',
//   trafficStatus: 'https://mocki.io/v1/votre-id-traffic'
// };

export const flightApi = {
  // Récupérer les vols au départ (API simulée)
  async getDepartureFlights() {
    try {
      const response = await fetch(API_URLS.departures);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return {
        data: data,
        status: 200
      };
    } catch (error) {
      console.error('API Error, using local data:', error);
      // Fallback vers les données locales en cas d'erreur
      return {
        data: flightsDepartureData,
        status: 200
      };
    }
  },

  // Récupérer les vols à l'arrivée (API simulée)
  async getArrivalFlights() {
    try {
      const response = await fetch(API_URLS.arrivals);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return {
        data: data,
        status: 200
      };
    } catch (error) {
      console.error('API Error, using local data:', error);
      // Fallback vers les données locales en cas d'erreur
      return {
        data: flightsArrivalData,
        status: 200
      };
    }
  },

  // Récupérer un vol spécifique par son numéro
  async getFlightByNumber(flightNumber) {
    // Simuler un appel API avec un délai
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Rechercher dans les deux listes
    const departureFlights = flightsDepartureData.flights || flightsDepartureData;
    const arrivalFlights = flightsArrivalData.flights || flightsArrivalData;
    
    const flight = departureFlights.find(f => f.flight_number === flightNumber) || 
                  arrivalFlights.find(f => f.flight_number === flightNumber);
    
    if (flight) {
      return {
        data: flight,
        status: 200
      };
    } else {
      return {
        data: null,
        status: 404,
        message: 'Flight not found'
      };
    }
  },

  // Suivre un vol
  async followFlight(flightNumber, email) {
    // Simuler un appel API avec un délai
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
  },

  // Obtenir les informations de trafic
  async getTrafficStatus() {
    try {
      const response = await fetch(API_URLS.trafficStatus);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return {
        data: data,
        status: 200
      };
    } catch (error) {
      console.error('API Error, using default traffic status:', error);
      // Fallback vers un message par défaut
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

export default flightApi;