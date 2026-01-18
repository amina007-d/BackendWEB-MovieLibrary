require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const dbName = 'movieLibraryDB';
const url = process.env.MONGO_URI

let db;

async function connectDB() {
  try {
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

module.exports = { connectDB, getDB, ObjectId };