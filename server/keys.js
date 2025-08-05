const { Pool } = require('pg');

// Use environment variables for production, fallback to development defaults
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres',
  host: process.env.PGHOST || 'postgres',
  port: process.env.PGPORT || 5432,
  // Add SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
