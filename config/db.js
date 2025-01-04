import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log('connected successfully with MongoDB');
  } catch (err) {
    console.error('Faild to connect to db', err);
    process.exit(1); 
  }
}

export default  connectDB;