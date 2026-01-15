const { MongoClient } = require('mongodb');

const URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'movielibrary';

let db;

async function connectDB() {
  if (db) return db;

  const client = new MongoClient(URI);
  await client.connect();
  db = client.db(DB_NAME);

  console.log('Connected to MongoDB');
  return db;
}

module.exports = connectDB;
