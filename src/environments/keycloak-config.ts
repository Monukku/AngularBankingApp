export const keycloakConfig = {
  url: 'http://localhost/auth', // ✅ Keycloak via Istio ingress (no port-forward needed)
  realm: 'rewabank', // Keycloak realm
  clientId: 'rewabank-web', // Public Angular client (no secret required)
};
