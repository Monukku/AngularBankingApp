# Keycloak Realm and Client Setup Script
# Run this to create the rewabank realm and client

# Get admin token
$TOKEN = (Invoke-RestMethod `
  -Uri "http://localhost/auth/realms/master/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "grant_type=password&client_id=admin-cli&username=admin&password=admin@2024"
).access_token

Write-Host "Got admin token: $($TOKEN.Substring(0,20))..."

# Create rewabank realm
Write-Host "Creating rewabank realm..."
Invoke-RestMethod `
  -Uri "http://localhost/auth/admin/realms" `
  -Method POST `
  -Headers @{Authorization="Bearer $TOKEN"} `
  -ContentType "application/json" `
  -Body '{"realm":"rewabank","enabled":true,"displayName":"RewaBank"}'

# Create rewabank-ms client (for microservices)
Write-Host "Creating rewabank-ms client..."
Invoke-RestMethod `
  -Uri "http://localhost/auth/admin/realms/rewabank/clients" `
  -Method POST `
  -Headers @{Authorization="Bearer $TOKEN"} `
  -ContentType "application/json" `
  -Body '{"clientId":"rewabank-ms","secret":"rewabank-ms-secret-2024","redirectUris":["*"],"publicClient":false,"serviceAccountsEnabled":true,"directAccessGrantsEnabled":true,"enabled":true}'

# Create rewabank-web client (for Angular)
Write-Host "Creating rewabank-web client..."
Invoke-RestMethod `
  -Uri "http://localhost/auth/admin/realms/rewabank/clients" `
  -Method POST `
  -Headers @{Authorization="Bearer $TOKEN"} `
  -ContentType "application/json" `
  -Body '{"clientId":"rewabank-web","publicClient":true,"redirectUris":["http://localhost:4200/*"],"webOrigins":["http://localhost:4200"],"directAccessGrantsEnabled":true,"standardFlowEnabled":true,"enabled":true}'

# Create roles
Write-Host "Creating roles..."
$roles = @("CUSTOMER","TELLER","RELATIONSHIP_MANAGER","CREDIT_OFFICER","BRANCH_MANAGER","AUDITOR","SUPER_ADMIN")
foreach ($role in $roles) {
  Invoke-RestMethod `
    -Uri "http://localhost/auth/admin/realms/rewabank/roles" `
    -Method POST `
    -Headers @{Authorization="Bearer $TOKEN"} `
    -ContentType "application/json" `
    -Body "{`"name`":`"$role`"}"
}

Write-Host "Keycloak setup complete!"
Write-Host "Realm: rewabank"
Write-Host "Clients: rewabank-web (public), rewabank-ms (confidential)"
Write-Host "Roles: CUSTOMER, TELLER, RELATIONSHIP_MANAGER, CREDIT_OFFICER, BRANCH_MANAGER, AUDITOR, SUPER_ADMIN"

