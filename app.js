const express = require('express'); //use express library
const app = express(); //instance of express
const session = require('express-session');//called to create session for user 
//const flash = require('express-flash');//called to flash error or success messages
const passport = require('passport');

const initializePassport = require('./config/PassportConfig');
const pg = require('pg');
const pgSession = require('connect-pg-simple')(session);


require("dotenv").config(); //use a an environment variiable (from the '.env' file)
const { pool } = require('./config/dbConfig');


const port = process.env.PORT || 3000;

//const HOST = '0.0.0.0' || process.env.DB_HOST;

app.use(express.urlencoded({extended: true}));//use qs library(querystring with added security) to parse data

//ejs middleware
app.set('view engine', 'ejs');

//use files from this directory (css, logos, etc.)
app.use(express.static(__dirname + '/public/'))


const user = require('./routes/user');//calling the user
const adminRoute = require('./routes/admin'); //calling the admin route 
const apiRoute = require('./routes/api'); //calling the api route 
//const { pool } = require('./config/dbConfig');

//Setup the various routes
app.use('/', user)
app.use('/admin', adminRoute);
app.use('/api', apiRoute);

initializePassport(passport);

// ... other imports and configurations ...

// Initialize the session middleware before Passport
app.use(session({
  cookie: {
    secure: true,
    maxAge: 60000
  },
  secret: 'secret',
  store: new pgSession({
    pool: pool,
    tableName: 'user_session'
  }),
  resave: false,
  saveUninitialized: true
}));

app.use(function(req, res, next) {
  if (!req.session) {
    return next(new Error('Oh no')); // handle crash error
  }
  next();
});

// Initialize Passport after the session middleware
app.use(passport.initialize());
// Uncomment the line below if you are using passport.session()
// app.use(passport.session());

// ... other routes and configurations ...

app.listen(port, function() {
  console.log('Listening on port ' + port);
});
