import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import cors from 'cors'
import productsRouter from './routers/products.js';
import categriesRouter from './routers/categories.js';
import ordersRouter from './routers/orders.js';
import usersRouter from './routers/users.js';
import authJwt from './auth/jwt.js';
import errorHandler from './auth/error-handler.js'

const app = express();
dotenv.config();

// using cors
app.use(cors());
app.options('*', cors());

// env config
const PORT = process.env.PORT || 5000;
const API = process.env.API_URL;

// Middlwares
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + 'public/uploads'));
app.use(errorHandler);


// using Routers
app.use(`${API}/products`, productsRouter);
app.use(`${API}/categories`, categriesRouter);
app.use(`${API}/orders`, ordersRouter);
app.use(`${API}/users`, usersRouter);


// connect MongoDB
connectDB();


app.listen(PORT, () => {    
    console.log(`Server running at http://localhost:${PORT}`);
  });