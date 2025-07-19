import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import '../strategies/localStrategy.mjs';

dotenv.config();

let mongoOptions = {
    connectTimeoutMS: 60000,  // Increase timeout to 60 seconds
    socketTimeoutMS: 45000,   // Socket timeout
    serverSelectionTimeoutMS: 60000,
    retryWrites: true,
    w: "majority",
    tls: true,
    tlsInsecure: false,
}

let databaseSessionHandler = (app) => {
    mongoose.connect(process.env.MONGO_URL, mongoOptions)
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch((err) => {
            console.error(err);
        });

    app.use(cookieParser('CookieSecret'));
    app.use(
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Only use secure in production
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            },
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
            }),
        })
    );


    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/', (req, res) => {
        req.session.visited = true;
        // console.log(req.session);
        res.status(200).send('{ Skills.log } server is running!');
    })

    app.use((req, res, next) => {
        // console.log('Incoming request from:', req.headers.origin);
        // console.log('Session data:', req.session);
        // console.log('Cookies:', req.cookies);
        next();
    });

    app.use((req, res, next) => {
        // console.log('Cookies being sent:', res.getHeaders()['set-cookie']);
        next();
    });

}

export default databaseSessionHandler;