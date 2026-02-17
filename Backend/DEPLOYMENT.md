# Deployment Guide

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- Redis v6 or higher
- SendGrid API Key
- Ubuntu/Debian server (or similar Linux distro)

## Production Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE dominion_city_db;
CREATE USER dominion_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE dominion_city_db TO dominion_user;
\q
```

### 3. Redis Configuration

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Set password (optional but recommended)
requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 4. Application Deployment

```bash
# Clone repository
cd /var/www
git clone <your-repo-url> dominion-city
cd dominion-city/Dominion_City_BackEnd/Backend

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env
nano .env  # Update with production values

# Build TypeScript
npm run build

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### 5. Environment Variables (.env)

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DB_HOST=localhost
DB_PORT=5432
DB_NAME=dominion_city_db
DB_USER=dominion_user
DB_PASSWORD=your_secure_password

JWT_SECRET=generate_a_very_strong_random_secret_here
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@dominioncityuyo.org
SENDGRID_FROM_NAME=Dominion City Uyo

CORS_ORIGIN=https://yourdomain.com

# ... other configs
```

### 6. Start with PM2

```bash
# Start the application
pm2 start dist/index.js --name dominion-city-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor logs
pm2 logs dominion-city-api
```

### 7. Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/dominion-city
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.dominioncityuyo.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/dominion-city /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 8. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.dominioncityuyo.org

# Auto-renewal is set up automatically
```

### 9. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 10. Database Backup Script

Create `/var/scripts/backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/dominion-city"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

pg_dump -U dominion_user dominion_city_db | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete
```

```bash
# Make executable
chmod +x /var/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /var/scripts/backup-db.sh
```

## Monitoring

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart app
pm2 restart dominion-city-api

# View error logs
pm2 logs dominion-city-api --err
```

### System Health Checks

```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check Redis
sudo systemctl status redis-server
redis-cli ping

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check disk space
df -h

# Check memory
free -m
```

## Updates and Maintenance

```bash
# Pull latest changes
cd /var/www/dominion-city/Dominion_City_BackEnd/Backend
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npm run migrate

# Rebuild
npm run build

# Restart application
pm2 restart dominion-city-api

# Check logs
pm2 logs dominion-city-api
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs dominion-city-api --err

# Check environment variables
cat .env

# Check database connection
psql -U dominion_user -d dominion_city_db -h localhost
```

### High memory usage
```bash
# Check PM2 processes
pm2 list

# Restart app
pm2 restart dominion-city-api

# Clear Redis cache if needed
redis-cli FLUSHALL
```

### Database connection issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Security Best Practices

1. **Never commit `.env` files** - Keep secrets in environment variables
2. **Use strong JWT secrets** - At least 32 characters, random
3. **Regular updates** - Keep Node.js, PostgreSQL, Redis updated
4. **Database backups** - Automated daily backups
5. **Rate limiting** - Already configured in the application
6. **HTTPS only** - Use SSL certificates
7. **Firewall rules** - Only open necessary ports
8. **Monitor logs** - Regular log review for suspicious activity

## Performance Optimization

1. **Enable Redis caching** - Cache frequently accessed data
2. **Database indexing** - Already configured in schema
3. **Connection pooling** - Already configured (max: 20)
4. **Gzip compression** - Enable in Nginx
5. **CDN for static files** - Use for sermon media files

## Contact and Support

For issues or questions:
- Email: tech@dominioncityuyo.org
- Documentation: See API_DOCUMENTATION.md
