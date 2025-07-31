const keys = require('./keys');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const {Pool} = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on('error', () => console.error('Lost PG connection'));

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch((err) => console.error(err));


// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`
});

const redisPublisher = redisClient.duplicate();

// Connect to Redis
let redisConnected = false;
let redisPublisherConnected = false;

redisClient.connect()
  .then(() => {
    console.log('Redis client connected');
    redisConnected = true;
  })
  .catch(console.error);

redisPublisher.connect()
  .then(() => {
    console.log('Redis publisher connected');
    redisPublisherConnected = true;
  })
  .catch(console.error);

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  try {
    if (!redisConnected) {
      return res.status(503).send({ error: 'Redis not connected' });
    }
    const values = await redisClient.hGetAll('values');
    res.send(values);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/values', async (req, res) => {
  try {
    const index = req.body.index;
    if (parseInt(index) > 40) {
      return res.status(422).send('Index too high');
    }

    if (!redisConnected || !redisPublisherConnected) {
      return res.status(503).send({ error: 'Redis not connected' });
    }

    await redisClient.hSet('values', index.toString(), 'Nothing yet!');
    await redisPublisher.publish('insert', index.toString());
    await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
  } catch (err) {
    console.error('Error in /values POST:', err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Listening on port 5000');
});
