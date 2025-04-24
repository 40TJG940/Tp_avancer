// Configuration de l'application pour tester les erreurs
export const appConfig = {
    // Choisir entre 'json' ou 'api'
    dataSource: 'api', // Mettre à 'api' pour tester les erreurs
    
    // URLs invalides pour tester les erreurs
    apiUrls: {
        departures: 'https://mocki.io/v1/578a185a-a042-458d-8ada-e988f4c7935d',
        arrivals: 'https://mocki.io/v1/c5b9b3b4-7ddd-4563-880b-0aa74ca9e2f1',
        trafficStatus: 'https://mocki.io/v1/cd43dbc9-0636-40c2-b2d5-68e9c2959b4f'
    },
    
    // Activer/désactiver les logs de débogage
    debug: true,
    
    // Timeout des requêtes API (en ms)
    apiTimeout: 5000,
  };
  
  export default appConfig;