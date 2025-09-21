# KoshFlow Backend Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the KoshFlow backend system to production environments with security, scalability, and reliability in mind.

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: v12.0 or higher
- **Redis**: v6.0 or higher (optional but recommended)
- **Memory**: Minimum 2GB RAM, Recommended 4GB+
- **Storage**: Minimum 20GB SSD, Recommended 100GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores

### Required Services
- **Database**: PostgreSQL with SSL support
- **Cache**: Redis for session storage and rate limiting
- **Reverse Proxy**: Nginx or Apache
- **SSL Certificate**: Valid SSL certificate
- **Domain**: Production domain name

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file with the following configuration:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/koshflow_prod?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-minimum-32-characters"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-minimum-32-characters"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="production"
API_BASE_URL="https://api.yourdomain.com/api"

# CORS Configuration
CORS_ORIGIN="https://yourdomain.com"
CORS_ORIGINS="https://yourdomain.com,https://app.yourdomain.com"

# Security Configuration
MAX_REQUEST_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL="info"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Email Configuration
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT=587
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-smtp-password"
SMTP_SECURE=false

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH="/var/www/koshflow/uploads"

# Security Headers
HELMET_CSP_ENABLED=true
HELMET_HSTS_ENABLED=true

# Monitoring
ENABLE_REQUEST_LOGGING=true
ENABLE_SECURITY_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true

# Admin Configuration
ADMIN_IP_WHITELIST=""
ADMIN_EMAIL="admin@yourdomain.com"

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
```

### 2. Database Setup

#### PostgreSQL Configuration

```sql
-- Create production database
CREATE DATABASE koshflow_prod;

-- Create application user
CREATE USER koshflow_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE koshflow_prod TO koshflow_user;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';

-- Restart PostgreSQL
SELECT pg_reload_conf();
```

#### Database Optimization

```sql
-- Optimize PostgreSQL settings for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Restart PostgreSQL
SELECT pg_reload_conf();
```

### 3. Redis Setup

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set the following configurations:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Application Deployment

### 1. Server Setup

#### Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/koshflow
sudo chown -R $USER:$USER /var/www/koshflow

# Clone repository
git clone https://github.com/yourusername/koshflow.git /var/www/koshflow
cd /var/www/koshflow/backend

# Install dependencies
npm ci --production

# Set up environment
cp .env.example .env.production
# Edit .env.production with production values
```

#### CentOS/RHEL

```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/koshflow
sudo chown -R $USER:$USER /var/www/koshflow

# Clone and setup (same as Ubuntu)
```

### 2. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 3. Process Management with PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'koshflow-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/koshflow/error.log',
    out_file: '/var/log/koshflow/out.log',
    log_file: '/var/log/koshflow/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

Start the application:

```bash
# Start in production mode
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 4. Nginx Configuration

Create `/etc/nginx/sites-available/koshflow`:

```nginx
upstream koshflow_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Client Configuration
    client_max_body_size 10M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Proxy Configuration
    location / {
        proxy_pass http://koshflow_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health Check
    location /health {
        proxy_pass http://koshflow_backend;
        access_log off;
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://koshflow_backend;
    }

    # Static Files
    location /uploads/ {
        alias /var/www/koshflow/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/koshflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

#### Using Custom Certificate

```bash
# Place your certificate files
sudo cp your-certificate.crt /etc/ssl/certs/koshflow.crt
sudo cp your-private-key.key /etc/ssl/private/koshflow.key

# Set proper permissions
sudo chmod 600 /etc/ssl/private/koshflow.key
sudo chmod 644 /etc/ssl/certs/koshflow.crt
```

## Monitoring and Logging

### 1. Log Management

```bash
# Create log directory
sudo mkdir -p /var/log/koshflow
sudo chown -R $USER:$USER /var/log/koshflow

# Setup log rotation
sudo nano /etc/logrotate.d/koshflow
```

Add to `/etc/logrotate.d/koshflow`:

```
/var/log/koshflow/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Monitoring Setup

#### Install monitoring tools

```bash
# Install htop for system monitoring
sudo apt install htop

# Install monitoring scripts
sudo mkdir -p /opt/monitoring
sudo chown -R $USER:$USER /opt/monitoring
```

#### Create monitoring script

Create `/opt/monitoring/health-check.sh`:

```bash
#!/bin/bash

# Health check script
API_URL="https://api.yourdomain.com/health"
LOG_FILE="/var/log/koshflow/health-check.log"

# Check API health
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -eq 200 ]; then
    echo "$(date): API is healthy" >> $LOG_FILE
else
    echo "$(date): API is unhealthy (HTTP $response)" >> $LOG_FILE
    # Restart PM2 processes
    pm2 restart koshflow-backend
fi
```

Make it executable and add to cron:

```bash
chmod +x /opt/monitoring/health-check.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add: */5 * * * * /opt/monitoring/health-check.sh
```

### 3. Backup Strategy

#### Database Backup

Create `/opt/backup/db-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/backup/db"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="koshflow_prod"
DB_USER="koshflow_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/koshflow_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/koshflow_$DATE.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "koshflow_*.sql.gz" -mtime +30 -delete

echo "$(date): Database backup completed" >> /var/log/koshflow/backup.log
```

#### Application Backup

Create `/opt/backup/app-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/backup/app"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/koshflow"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create application backup
tar -czf $BACKUP_DIR/koshflow_app_$DATE.tar.gz -C $APP_DIR .

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "koshflow_app_*.tar.gz" -mtime +7 -delete

echo "$(date): Application backup completed" >> /var/log/koshflow/backup.log
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (if not using localhost)
sudo ufw allow 6379/tcp  # Redis (if not using localhost)

# Enable firewall
sudo ufw enable
```

### 2. System Hardening

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local
```

Add to `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

### 3. Application Security

```bash
# Set proper file permissions
sudo chown -R $USER:$USER /var/www/koshflow
sudo chmod -R 755 /var/www/koshflow
sudo chmod 600 /var/www/koshflow/.env.production

# Create non-root user for application
sudo useradd -r -s /bin/false koshflow
sudo chown -R koshflow:koshflow /var/www/koshflow
```

## Performance Optimization

### 1. Node.js Optimization

```bash
# Set Node.js options
export NODE_OPTIONS="--max-old-space-size=1024 --max-semi-space-size=128"

# Add to PM2 ecosystem.config.js
node_args: '--max-old-space-size=1024 --max-semi-space-size=128'
```

### 2. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_company_id ON users(company_id);
CREATE INDEX CONCURRENTLY idx_transactions_company_id ON transactions(company_id);
CREATE INDEX CONCURRENTLY idx_transactions_date ON transactions(date);
CREATE INDEX CONCURRENTLY idx_contacts_company_id ON contacts(company_id);
CREATE INDEX CONCURRENTLY idx_products_company_id ON products(company_id);

-- Analyze tables for better query planning
ANALYZE;
```

### 3. Nginx Optimization

Add to nginx configuration:

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Monitoring setup complete
- [ ] Backup strategy implemented
- [ ] Security hardening applied

### Deployment
- [ ] Application deployed
- [ ] Database migrated
- [ ] Nginx configured
- [ ] SSL enabled
- [ ] PM2 processes running
- [ ] Health checks passing
- [ ] Monitoring active

### Post-deployment
- [ ] Performance testing completed
- [ ] Security scan performed
- [ ] Backup tested
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team trained on operations

## Troubleshooting

### Common Issues

#### Application won't start
```bash
# Check PM2 logs
pm2 logs koshflow-backend

# Check application logs
tail -f /var/log/koshflow/error.log

# Restart application
pm2 restart koshflow-backend
```

#### Database connection issues
```bash
# Check database status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Test connection
psql -h localhost -U koshflow_user -d koshflow_prod
```

#### High memory usage
```bash
# Check memory usage
htop

# Check PM2 memory usage
pm2 monit

# Restart if needed
pm2 restart koshflow-backend
```

### Performance Issues

#### Slow API responses
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/access.log

# Check application logs
tail -f /var/log/koshflow/out.log

# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

#### Database performance
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Maintenance

### Regular Tasks

#### Daily
- [ ] Check application health
- [ ] Review error logs
- [ ] Monitor resource usage
- [ ] Check backup status

#### Weekly
- [ ] Review security logs
- [ ] Check database performance
- [ ] Update dependencies
- [ ] Test backup restoration

#### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Update documentation
- [ ] Review monitoring alerts

### Updates and Patches

```bash
# Update application
cd /var/www/koshflow
git pull origin main
npm ci --production
npm run db:migrate
pm2 restart koshflow-backend

# Update system packages
sudo apt update && sudo apt upgrade -y
```

---

For additional support or questions, please contact the development team at dev@koshflow.com.
