// const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const {app,httpServer,express} = require('./socket.server.js')
require('dotenv').config();


// routes
const signUpRoute = require('./routes/SignUp.routes.js')
const LogInRoute = require('./routes/LogIn.route.js')
const homePageRoute = require('./routes/HomePage.route.js')
const apiRoutes = require('./routes/apiRoutes.js')


// const app = express();

// app.use(cors({
//     origin: ["http://localhost:8081","http://10.255.87.158:5000",'http://192.168.1.10:5000'], // or your frontend URL
//     credentials: true
//   }));
  
app.use(cookieParser())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});


// middlewares

const dbConnect = require('./db.connect.js')

dbConnect();

// routes

app.use('/signUp', signUpRoute)
app.use('/login', LogInRoute)
app.use('/homepage', homePageRoute)
app.use('/api', apiRoutes)

// server

httpServer.listen(process.env.PORT,'0.0.0.0', () => console.log(`app listening Port ${process.env.PORT}`))