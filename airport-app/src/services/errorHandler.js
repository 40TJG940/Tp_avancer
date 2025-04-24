// Service centralisé de gestion des erreurs
export const errorHandler = {
    // Types d'erreurs
    ERROR_TYPES: {
      API_ERROR: 'API_ERROR',
      NETWORK_ERROR: 'NETWORK_ERROR',
      JSON_LOAD_ERROR: 'JSON_LOAD_ERROR',
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    },
  
    // Messages d'erreur personnalisés
    ERROR_MESSAGES: {
      API_ERROR: 'Failed to fetch data from the API',
      NETWORK_ERROR: 'Network connection error. Please check your internet connection',
      JSON_LOAD_ERROR: 'Failed to load local data',
      VALIDATION_ERROR: 'Invalid data format',
      UNKNOWN_ERROR: 'An unexpected error occurred'
    },
  
    // Logger d'erreurs
    logError(error, context = '') {
      console.error(`[${new Date().toISOString()}] Error in ${context}:`, error);
      
      // Dans un environnement de production, vous pourriez envoyer ceci à un service de logging
      // comme Sentry, LogRocket, etc.
      if (process.env.NODE_ENV === 'production') {
        // Exemple d'envoi à un service de logging externe
        // this.sendToLoggingService(error, context);
      }
    },
  
    // Gestionnaire d'erreurs centralisé
    handleError(error, context = '') {
      this.logError(error, context);
      
      if (error.response) {
        // Erreur de réponse HTTP
        return {
          type: this.ERROR_TYPES.API_ERROR,
          message: error.response.data?.message || this.ERROR_MESSAGES.API_ERROR,
          status: error.response.status,
          details: error.response.data
        };
      } else if (error.request) {
        // Erreur de réseau
        return {
          type: this.ERROR_TYPES.NETWORK_ERROR,
          message: this.ERROR_MESSAGES.NETWORK_ERROR,
          details: error.message
        };
      } else if (error.name === 'SyntaxError') {
        // Erreur de parsing JSON
        return {
          type: this.ERROR_TYPES.JSON_LOAD_ERROR,
          message: this.ERROR_MESSAGES.JSON_LOAD_ERROR,
          details: error.message
        };
      } else {
        // Autres erreurs
        return {
          type: this.ERROR_TYPES.UNKNOWN_ERROR,
          message: error.message || this.ERROR_MESSAGES.UNKNOWN_ERROR,
          details: error
        };
      }
    },
  
    // Validation des données
    validateFlightData(flight) {
      const errors = [];
      
      if (!flight.flight_number) errors.push('Missing flight number');
      if (!flight.company) errors.push('Missing company');
      if (!flight.status) errors.push('Missing status');
      
      if (errors.length > 0) {
        throw new Error(`Validation error: ${errors.join(', ')}`);
      }
      
      return true;
    },
  
    // Message d'erreur formaté pour l'utilisateur
    getUserFriendlyMessage(error) {
      switch (error.type) {
        case this.ERROR_TYPES.API_ERROR:
          return 'Unable to fetch data from the server. Please try again later.';
        case this.ERROR_TYPES.NETWORK_ERROR:
          return 'Network connection issue. Please check your internet connection.';
        case this.ERROR_TYPES.JSON_LOAD_ERROR:
          return 'Unable to load flight data. Please refresh the page.';
        case this.ERROR_TYPES.VALIDATION_ERROR:
          return 'Invalid data received. Please contact support.';
        default:
          return 'Something went wrong. Please try again.';
      }
    }
  };
  
  export default errorHandler;