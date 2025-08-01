# Docker Multi-Service Application

A full-stack application with React frontend, Node.js backend, PostgreSQL database, Redis cache, and background worker - all containerized with Docker Compose.

## 🏗️ Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   Worker    │
│  (React)    │◄──►│  (Node.js)  │◄──►│ (Background)│
│   Port 5173 │    │   Port 5000 │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                    │
       │                   │                    │
       └───────┐   ┌───────┘                    │
               │   │                            │
               ▼   ▼                            ▼
         ┌─────────────┐                ┌─────────────┐
         │    Nginx    │                │    Redis    │
         │  (Reverse   │                │   Port 6379 │
         │   Proxy)    │                └─────────────┘
         │  Port 80    │
         └─────────────┘
               │
               ▼
         ┌─────────────┐
         │ PostgreSQL  │
         │   Port 5432 │
         └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Running the Application
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs

# Stop all services
docker compose down
```

## 📁 Project Structure

```
complex/
├── docker-compose.yml          # Main orchestration file
├── .env                        # Environment variables
├── default.conf                # Nginx reverse proxy configuration
├── client/                     # React frontend
│   ├── Dockerfile.dev         # Frontend container config
│   ├── package.json
│   ├── vite.config.js         # Vite configuration
│   └── src/
├── server/                     # Node.js backend
│   ├── Dockerfile.dev         # Backend container config
│   ├── package.json
│   ├── index.js               # Main server file
│   └── keys.js                # Database connection config
├── worker/                     # Background worker
│   ├── Dockerfile.dev         # Worker container config
│   ├── package.json
│   └── index.js               # Worker logic
└── README.md                   # This file
```

## 🔧 How Docker Works in This Project

### 1. Service Definition (docker-compose.yml)

Each service in `docker-compose.yml` defines a container:

```yaml
# Example: Server service
server:
  image: server:latest          # Custom image name
  build:
    context: ./server           # Build from server directory
    dockerfile: Dockerfile.dev  # Use development Dockerfile
  ports:
    - "5000:5000"              # Expose for direct access and Vite proxy
  volumes:
    - ./server:/app            # Live code updates
    - /app/node_modules        # Preserve node_modules

# Example: Client service
client:
  image: client:latest          # Custom image name
  build:
    context: ./client           # Build from client directory
    dockerfile: Dockerfile.dev  # Use development Dockerfile
  ports:
    - "5173:5173"              # Expose Vite dev server
  volumes:
    - ./client:/app            # Live code updates
    - /app/node_modules        # Preserve node_modules

# Example: Nginx reverse proxy
nginx:
  image: nginx:alpine          # Lightweight nginx image
  ports:
    - "80:80"                  # Production-like entry point
  volumes:
    - ./default.conf:/etc/nginx/conf.d/default.conf  # Custom nginx config
```

### 2. Container Building Process

When you run `docker compose up`, Docker:

1. **Reads docker-compose.yml** → Identifies all services
2. **Builds custom images** → Uses Dockerfile.dev for each service
3. **Creates containers** → One container per service
4. **Sets up networking** → All containers can communicate
5. **Starts services** → Runs the specified commands

### 3. Development Workflow

```bash
# 1. Build and start all services
docker compose up --build

# 2. Make code changes (they auto-reload)
# Edit files in client/, server/, or worker/

# 3. View logs for specific service
docker compose logs server

# 4. Restart a specific service
docker compose restart server

# 5. Stop everything
docker compose down
```

## 🐳 Docker Concepts Explained

### Images vs Containers
- **Image**: Blueprint/template (like a class)
- **Container**: Running instance (like an object)

```bash
# List images
docker images

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a
```

### Port Mapping
```yaml
ports:
  - "3000:5000"  # Host port 3000 → Container port 5000
```
- **Host port**: What you access from your computer
- **Container port**: What the app uses inside the container

### Volume Mounting
```yaml
volumes:
  - ./server:/app              # Live code updates
  - /app/node_modules          # Preserve dependencies
```
- **Source**: Your local directory
- **Target**: Container directory
- **Effect**: Changes sync automatically

## 🔄 Service Communication

### Network Setup
Docker Compose creates a default network where services can communicate using service names:

```javascript
// In server/index.js
const redisClient = redis.createClient({
  url: `redis://redis:6379`  // 'redis' = service name
});

const pgClient = new Pool({
  host: 'postgres',          // 'postgres' = service name
  // ... other config
});
```

### Vite Development Proxy
Vite provides a development proxy for API requests:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://server:5000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')  // Remove /api prefix
  },
}
```

### Nginx Reverse Proxy
Nginx acts as a reverse proxy for production-like access:

```nginx
# Serve React app
location / {
    proxy_pass http://client:5173;
}

# Proxy API requests to server
location /api/ {
    proxy_pass http://server:5000/;
}
```

### Health Checks
Services wait for dependencies to be healthy:

```yaml
depends_on:
  postgres:
    condition: service_healthy  # Wait for PostgreSQL to be ready
  redis:
    condition: service_healthy  # Wait for Redis to be ready
```

## 📊 API Endpoints

### Direct Vite Access (Port 5173 - Development)
```bash
# Frontend application with hot reloading
GET http://localhost:5173/

# API endpoints (proxied through Vite)
GET http://localhost:5173/api/values/all
GET http://localhost:5173/api/values/current
POST http://localhost:5173/api/values
```

### Nginx Proxy Access (Port 80 - Production-like)
```bash
# Frontend application
GET http://localhost/

# API endpoints (through nginx)
GET http://localhost/api/values/all
GET http://localhost/api/values/current
POST http://localhost/api/values
```

### Direct Server Access (Port 5000 - Internal)
```bash
# Get all stored values
GET http://localhost:5000/values/all

# Get current Redis values
GET http://localhost:5000/values/current

# Submit a new value
POST http://localhost:5000/values
Content-Type: application/json
{
  "index": 5
}
```

### Example API Usage
```bash
# Test the frontend (Vite development)
curl http://localhost:5173
# Response: HTML content

# Test the API through Vite proxy
curl http://localhost:5173/api/values/all
# Response: []

# Submit a value through Vite proxy
curl -X POST http://localhost:5173/api/values \
  -H "Content-Type: application/json" \
  -d '{"index": 5}'
# Response: {"working": true}

# Test the frontend (Nginx production-like)
curl http://localhost
# Response: HTML content

# Test the API through nginx
curl http://localhost/api/values/all
# Response: []

# Direct server access (if needed)
curl http://localhost:5000
# Response: "Hi"
```

## 🛠️ Development Commands

### Docker Compose Commands
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Rebuild and start
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs

# View logs for specific service
docker compose logs server

# Restart specific service
docker compose restart server

# Check service status
docker compose ps
```

### Individual Container Commands
```bash
# Execute command in running container
docker compose exec server sh

# View container logs
docker logs server

# Stop specific container
docker stop server
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :5000

   # Kill the process
   kill -9 <PID>
   ```

2. **Container won't start**
   ```bash
   # Check logs
   docker compose logs <service-name>

   # Rebuild
   docker compose up --build
   ```

3. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   docker compose ps postgres

   # Check PostgreSQL logs
   docker compose logs postgres
   ```

4. **Redis connection issues**
   ```bash
   # Check if Redis is running
   docker compose ps redis

   # Test Redis connection
   docker compose exec redis redis-cli ping
   ```

### Debugging Tips

1. **Check container status**
   ```bash
   docker compose ps
   ```

2. **View real-time logs**
   ```bash
   docker compose logs -f
   ```

3. **Access container shell**
   ```bash
   docker compose exec server sh
   ```

4. **Check network connectivity**
   ```bash
   docker network inspect complex_default
   ```

## 📝 Environment Variables

Create a `.env` file in the project root:

```env
# Database configuration
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=postgres
PGHOST=postgres
PGPORT=5432

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
```

## 🎯 Key Benefits

1. **Isolation**: Each service runs in its own container
2. **Consistency**: Same environment across all machines
3. **Scalability**: Easy to scale individual services
4. **Development**: Hot reloading for all services
5. **Production Ready**: Same containers can be used in production
6. **Flexible Access**: Choose between Vite dev server or nginx proxy
7. **No CORS Issues**: Frontend and API served from same origin
8. **Clean URLs**: Access everything through port 80 (nginx) or 5173 (Vite)
9. **Development Experience**: Vite provides better debugging and hot reloading
10. **Production Simulation**: Nginx setup mimics production deployment

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
