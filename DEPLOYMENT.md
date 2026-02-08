# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Building for Different Environments](#building-for-different-environments)
4. [Deployment Process](#deployment-process)
5. [Docker Deployment](#docker-deployment)
6. [Server Configuration](#server-configuration)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Rollback Procedure](#rollback-procedure)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Node.js 18.19.1 or higher
- npm 10.x or higher
- Angular CLI 18.x
- Docker (for containerized deployment)
- Git
- Access to deployment servers

### Environment Variables

Create a `.env` file in the project root (never commit to version control):

```bash
# Development
DEV_API_URL=http://localhost:8811/rewabank
DEV_KEYCLOAK_URL=http://localhost:7070/auth
DEV_KEYCLOAK_REALM=rewabank-realm

# Staging
STAGING_API_URL=https://staging-api.rewabank.com/rewabank
STAGING_KEYCLOAK_URL=https://staging-auth.rewabank.com/auth
STAGING_KEYCLOAK_REALM=rewabank-staging

# Production
PROD_API_URL=https://api.rewabank.com/rewabank
PROD_KEYCLOAK_URL=https://auth.rewabank.com/auth
PROD_KEYCLOAK_REALM=rewabank-prod
```

---

## Environment Setup

### Development Environment

**Configuration**: `src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8811/rewabank',
  keycloak: {
    url: 'http://localhost:7070/auth',
    realm: 'rewabank-realm',
    clientId: 'angular-client'
  },
  logLevel: 'debug',
  enableProfiling: true,
  cacheDuration: 5 // minutes
};
```

**Usage**:
```bash
npm start
```

### Staging Environment

**Configuration**: `src/environments/environment.staging.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.rewabank.com/rewabank',
  keycloak: {
    url: 'https://staging-auth.rewabank.com/auth',
    realm: 'rewabank-staging',
    clientId: 'angular-staging-client'
  },
  logLevel: 'warn',
  enableProfiling: false,
  cacheDuration: 15
};
```

### Production Environment

**Configuration**: `src/environments/environment.production.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.rewabank.com/rewabank',
  keycloak: {
    url: 'https://auth.rewabank.com/auth',
    realm: 'rewabank-prod',
    clientId: 'angular-prod-client'
  },
  logLevel: 'error',
  enableProfiling: false,
  cacheDuration: 30
};
```

### Test Environment

**Configuration**: `src/environments/environment.test.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8811/rewabank',
  keycloak: {
    url: 'http://localhost:7070/auth',
    realm: 'rewabank-test',
    clientId: 'angular-test-client'
  },
  logLevel: 'warn',
  enableProfiling: false,
  cacheDuration: 1,
  mockData: true
};
```

---

## Building for Different Environments

### Development Build

```bash
# Development server (with HMR)
npm start

# Or build and serve
ng build --configuration development
ng serve --configuration development
```

### Staging Build

```bash
# Create optimized staging build
ng build --configuration staging

# Build output will be in dist/banking-app/
```

**Output**: Production-optimized bundle with staging API URLs

```bash
# Serve staging build locally for testing
npm install -g http-server
http-server dist/banking-app/ -p 8000
```

### Production Build

```bash
# Create optimized production build
ng build --configuration production

# Build output will be in dist/banking-app/
```

**Output**: Fully optimized, minified bundle with production API URLs

```bash
# Verify production build works locally
npm install -g http-server
http-server dist/banking-app/ -p 8000
```

### Build with Source Maps (for debugging)

```bash
# Include source maps in build
ng build --configuration production --source-map=true
```

### Build Size Analysis

```bash
# Analyze bundle size
ng build --configuration production --stats-json
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/banking-app/stats.json
```

---

## Deployment Process

### Step 1: Pre-Deployment Verification

```bash
# Install dependencies
npm install --production

# Run tests
npm test -- --watch=false

# Run E2E tests
npm run e2e:headless

# Build the application
ng build --configuration production

# Check bundle size
du -sh dist/banking-app/
```

### Step 2: Build Docker Image (Optional)

```bash
# Build Docker image
docker build -t banking-app:latest .

# Tag for registry
docker tag banking-app:latest registry.example.com/banking-app:v1.0.0

# Push to registry
docker push registry.example.com/banking-app:v1.0.0
```

### Step 3: Deploy to Server

#### Option A: Direct File Transfer

```bash
# Upload build files to server
scp -r dist/banking-app/* user@staging.rewabank.com:/var/www/banking-app/

# Or using rsync
rsync -avz dist/banking-app/ user@staging.rewabank.com:/var/www/banking-app/
```

#### Option B: Docker Deployment

```bash
# SSH into server
ssh user@staging.rewabank.com

# Pull latest image
docker pull registry.example.com/banking-app:v1.0.0

# Stop old container
docker stop banking-app || true

# Start new container
docker run -d \
  --name banking-app \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  registry.example.com/banking-app:v1.0.0
```

### Step 4: Web Server Configuration

#### Nginx Configuration

Create `/etc/nginx/sites-available/banking-app`:

```nginx
server {
    listen 80;
    server_name staging.rewabank.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.rewabank.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/staging.rewabank.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.rewabank.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_level 6;
    
    root /var/www/banking-app;
    index index.html index.htm;
    
    # Angular routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Don't cache HTML files
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/banking-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Apache Configuration

Create `/etc/apache2/sites-available/banking-app.conf`:

```apache
<VirtualHost *:80>
    ServerName staging.rewabank.com
    Redirect / https://staging.rewabank.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName staging.rewabank.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/staging.rewabank.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/staging.rewabank.com/privkey.pem
    
    DocumentRoot /var/www/banking-app
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>
    
    # Angular routing
    <Directory /var/www/banking-app>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Cache control
    <FilesMatch "\.js$|\.css$|\.woff$|\.png$|\.jpg$|\.gif$|\.svg$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
    
    <FilesMatch "\.html$">
        Header set Cache-Control "max-age=3600, public, must-revalidate"
    </FilesMatch>
</VirtualHost>
```

Enable the site:
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2ensite banking-app
sudo apache2ctl configtest
sudo systemctl restart apache2
```

### Step 5: Verify Deployment

```bash
# Test the application
curl https://staging.rewabank.com

# Check server logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Or for Apache
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application for production
RUN npm run build -- --configuration production

# Serve stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/banking-app /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    include /etc/nginx/conf.d/*.conf;
}
```

Create `default.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static files
    location ~* \.(js|css|png|jpg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  banking-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: banking-app
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s

  # Optional: Keycloak for authentication
  keycloak:
    image: keycloak/keycloak:latest
    container_name: keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
    ports:
      - "7070:8080"
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: postgres
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Deploy with Docker Compose:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f banking-app

# Stop services
docker-compose down
```

---

## Server Configuration

### Required Ports

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Web App | 80 | HTTP | Redirect to HTTPS |
| Web App | 443 | HTTPS | Secure access |
| Keycloak | 8080 | HTTP | Authentication (internal) |
| Database | 5432 | TCP | PostgreSQL (internal) |

### Firewall Rules

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

### SSL/TLS Certificate

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d staging.rewabank.com -d www.staging.rewabank.com

# Auto-renew certificates
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

### Performance Tuning

#### Nginx

```nginx
# In nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

http {
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;
    
    gzip on;
    gzip_vary on;
    gzip_level 6;
    gzip_types text/plain text/css application/json application/javascript;
}
```

#### Apache

```apache
# Performance modules
a2enmod mpm_event
a2enmod http2

<IfModule mpm_event_module>
    MaxRequestWorkers 256
    ServerLimit 256
</IfModule>
```

---

## Post-Deployment Checklist

### Immediate Verification

- [ ] Application loads at domain URL
- [ ] All pages render correctly
- [ ] API calls work (check Network tab)
- [ ] Login/logout functionality works
- [ ] Keycloak integration working
- [ ] SSL certificate valid
- [ ] No console errors in browser DevTools

### Security Checklist

- [ ] HTTPS only (HTTP redirects to HTTPS)
- [ ] Security headers present
- [ ] CSRF tokens configured
- [ ] XSS protection enabled
- [ ] Sensitive data not in localStorage
- [ ] API responses validated

### Performance Checklist

- [ ] Page load time < 3 seconds
- [ ] Assets are compressed (gzip)
- [ ] Cache headers set correctly
- [ ] Bundle size within limits
- [ ] No 404 errors in console
- [ ] Images optimized

### Monitoring Checklist

- [ ] Error logging configured
- [ ] Log aggregation setup
- [ ] Monitoring alerts configured
- [ ] Uptime monitoring active
- [ ] Performance metrics tracked
- [ ] User session tracking enabled

### Database/Backend Checklist

- [ ] Database migrations completed
- [ ] API keys/secrets configured
- [ ] Email service configured (if applicable)
- [ ] Payment gateway configured (if applicable)
- [ ] Backup scheduled
- [ ] Database monitoring active

---

## Monitoring and Logging

### Application Logging

All application logs are sent to console and can be collected by:

```bash
# View Docker logs
docker logs -f banking-app

# Or server logs
tail -f /var/log/syslog | grep banking-app
```

### Error Tracking

Configure error tracking service:

```typescript
// In app.config.ts
import { environment } from '../environments/environment';

if (environment.production) {
  // Configure error tracking (e.g., Sentry)
  // Sentry.init({
  //   dsn: 'https://xxx@xxx.ingest.sentry.io/xxx',
  //   environment: 'production'
  // });
}
```

### Performance Monitoring

Monitor key metrics:

```bash
# Check response times
curl -w "@curl-format.txt" https://staging.rewabank.com

# Monitor server resources
htop
# or
top
```

### Log Aggregation

Example using ELK Stack:

```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
```

---

## Rollback Procedure

### If Deployment Fails

#### Step 1: Stop Current Deployment

```bash
# For Docker
docker stop banking-app

# For Nginx
sudo systemctl stop nginx

# For Apache
sudo systemctl stop apache2
```

#### Step 2: Restore Previous Version

```bash
# List previous builds
ls -la /var/www/banking-app/backups/

# Restore previous version
cp -r /var/www/banking-app/backups/v1.0.0/* /var/www/banking-app/

# Or restore Docker image
docker run -d --name banking-app registry.example.com/banking-app:v0.9.9
```

#### Step 3: Restart Services

```bash
# For Nginx
sudo systemctl start nginx

# For Apache
sudo systemctl start apache2

# For Docker
docker start banking-app
```

#### Step 4: Verify Rollback

```bash
# Test the application
curl https://staging.rewabank.com

# Check version
curl https://staging.rewabank.com/api/version

# Monitor logs
tail -f /var/log/nginx/error.log
```

### Automated Backup

Create backup script `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/www/banking-app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUILD_DIR="/var/www/banking-app"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup current build
cp -r $BUILD_DIR $BACKUP_DIR/backup_$TIMESTAMP

# Keep only last 5 backups
ls -t $BACKUP_DIR | tail -n +6 | xargs rm -rf

echo "Backup completed: backup_$TIMESTAMP"
```

Schedule with cron:
```bash
# Run backup before deployment
0 2 * * * /scripts/backup.sh
```

---

## Troubleshooting

### Application Won't Load

```bash
# Check if application is accessible
curl -v https://staging.rewabank.com

# Check web server logs
sudo tail -f /var/log/nginx/error.log

# Check if files are in correct location
ls -la /var/www/banking-app/
```

### API Calls Failing

```bash
# Check API configuration in environment file
grep apiUrl src/environments/environment.production.ts

# Test API endpoint
curl https://api.rewabank.com/rewabank/health

# Check CORS headers
curl -i -X OPTIONS https://staging.rewabank.com
```

### SSL Certificate Issues

```bash
# Check certificate expiration
openssl s_client -connect staging.rewabank.com:443 | grep "Not After"

# Renew certificate
sudo certbot renew --force-renewal

# Check Nginx configuration
sudo nginx -t
```

### Performance Issues

```bash
# Check server resources
top
free -h
df -h

# Analyze bundle size
webpack-bundle-analyzer dist/banking-app/stats.json

# Check slow queries (if applicable)
tail -f /var/log/mysql/slow.log
```

### Memory Leaks

```bash
# Monitor memory usage
watch -n 5 'free -h'

# Restart Docker container to clear memory
docker restart banking-app

# Or restart Nginx
sudo systemctl restart nginx
```

---

**Last Updated**: February 7, 2026
**Version**: 1.0.0
