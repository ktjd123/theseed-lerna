// const express = require('express');
import express, { ErrorRequestHandler } from 'express';

import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import compression from 'compression';
import morgan from 'morgan';

import MongoStore from 'connect-mongo';
import session from 'express-session';

import api from './routes';

const server = express();

const dev = process.env.NODE_ENV === 'development';

const LOCAL_DB = 'theseed';
const MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost/${LOCAL_DB}`;
// const SESSION_KEY = "connect.sid";
const SESSION_SECRET = 'jfoiesofj@#JIFSIOfsjieo@320923';
const SESSION_DOMAIN = undefined;
const PORT = 5000;

const main = async () => {
  // Parse application/x-www-form-urlencoded
  server.use(bodyParser.urlencoded({ extended: false }));
  // Parse application/json
  server.use(bodyParser.json());

  // Theseed Custom
  server.use(compression());
  server.use(morgan('dev'));

  // MongoDB
  // mongoose.set('debug', true);
  mongoose.Promise = global.Promise;
  await mongoose
    .connect(MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      autoIndex: true,
      // poolSize: 1000,
    })
    .then((m) => m.connection.getClient())
    .catch(() => {
      console.error('DB NOT CONNECTED');
      process.exit();
    });

  // Session
  server.use(
    session({
      // key: SESSION_KEY,
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: 365 * (24 * 60 * 60 * 1000),
        domain: dev ? undefined : SESSION_DOMAIN,
      },
      store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 365 * (24 * 60 * 60 * 1000),
        stringify: false,
      }),
    })
  );

  const errHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke');
  };

  server.use(errHandler);
  // API routes
  server.use('/api', api);

  server.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}/api/`);
  });
};

main();
