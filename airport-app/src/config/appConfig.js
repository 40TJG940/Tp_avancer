// Configuration de l'application
export const appConfig = {
    // Choisir entre 'json' ou 'api'
    dataSource: 'json', // Changez cette valeur à 'api' pour utiliser l'API simulée
    
    // Délai simulé pour l'API en millisecondes
    apiDelay: 100,
    
    // URL de l'API (pour une future utilisation avec une vraie API)
    apiUrl: 'https://mocki.io/fake-json-api',
    
    // Activer/désactiver les logs de débogage
    debug: true
  };
  
  export default appConfig;