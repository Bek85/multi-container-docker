# Render.com Deployment Guide

## Overview
This guide explains how to deploy your multi-service application to Render.com.

## Architecture
- **Frontend**: React app deployed as a static site
- **Backend**: Node.js API deployed as a web service
- **Database**: PostgreSQL managed by Render.com
- **Cache**: Redis managed by Render.com

## Prerequisites
1. Render.com account
2. GitHub repository with your code
3. Environment variables configured

## Deployment Steps

### 1. Connect Repository
1. Go to [Render.com](https://render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing this code

### 2. Configure Environment Variables
Set these environment variables in Render.com dashboard:

#### For API Service:
```
NODE_ENV=production
REDIS_HOST=your-redis-service-name
REDIS_PORT=6379
PGUSER=postgres
PGPASSWORD=your-postgres-password
PGDATABASE=postgres
PGHOST=your-postgres-service-name
PGPORT=5432
```

#### For Client Service:
```
VITE_API_URL=https://your-api-service-name.onrender.com
```

### 3. Deploy Services

#### Option A: Using Blueprint (Recommended)
1. Use the `render.yaml` file in this repository
2. Render will automatically create all services
3. Update environment variables in the dashboard

#### Option B: Manual Deployment

##### Deploy Backend API:
1. Create new Web Service
2. Connect to your repository
3. Set build command: `cd server && yarn install`
4. Set start command: `cd server && yarn start`
5. Set environment variables

##### Deploy Frontend:
1. Create new Static Site
2. Connect to your repository
3. Set build command: `cd client && yarn install && yarn build`
4. Set publish directory: `client/dist`
5. Set environment variables

##### Create Database:
1. Create new PostgreSQL service
2. Note the connection details
3. Update API environment variables

##### Create Redis:
1. Create new Redis service
2. Note the connection details
3. Update API environment variables

### 4. Update Service URLs
After deployment, update the `VITE_API_URL` in your client service to point to your actual API service URL.

## Testing Deployment

### Test API Endpoints:
```bash
# Get all values
curl https://your-api-service.onrender.com/values/all

# Get current values
curl https://your-api-service.onrender.com/values/current

# Submit a value
curl -X POST https://your-api-service.onrender.com/values \
  -H "Content-Type: application/json" \
  -d '{"index": 5}'
```

### Test Frontend:
1. Visit your static site URL
2. Test the Fibonacci calculator
3. Verify API calls work

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Check PostgreSQL service is running
   - Verify environment variables are correct
   - Check SSL configuration

2. **Redis Connection Errors**
   - Check Redis service is running
   - Verify environment variables are correct

3. **API Not Found Errors**
   - Check API service is running
   - Verify CORS configuration
   - Check environment variables

4. **Frontend Build Errors**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build logs for errors

### Debug Commands:
```bash
# Check service logs in Render dashboard
# Check environment variables
# Test database connection
# Test Redis connection
```

## Cost Considerations
- Free tier includes:
  - 750 hours/month for web services
  - 1GB PostgreSQL database
  - 25MB Redis cache
  - Static sites are always free

## Security Notes
- Use strong passwords for databases
- Enable SSL for production
- Set up proper CORS policies
- Use environment variables for sensitive data

## Monitoring
- Set up health checks
- Monitor service logs
- Set up alerts for downtime
- Monitor resource usage
