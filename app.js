// Import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('cookie-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const schedule = require('node-schedule');
const env = require('dotenv').config()
const browser = require('browser-detect') //https://stackoverflow.com/questions/54451155/trying-to-render-different-view-between-mobile-and-web-from-express-js

// Import routes
const userRoutes = require('./routes/users');
const playlistRoutes = require('./routes/playlists');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');

// Connect to database 

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Setup express 
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

// Setup passport for authentication and authorization 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Setup favicon http://expressjs.com/en/resources/middleware/serve-favicon.html
var favicon = require('serve-favicon')
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))


// Contact setup
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', userRoutes);
app.use('/playlists', playlistRoutes)
app.use('/playlists/:id/reviews', reviewRoutes)
app.use('/', contactRoutes)

// Non embedded routes

app.get('/', (req, res) => {
    const isMobile = browser(req.headers['user-agent']).mobile;

    if (isMobile) {
        res.render('homemobile');

    }
    else {
        res.render('home');
    }
});

app.get('/privacy-policy', (req, res) => {
    res.render('privacy')
});

app.get('/terms-of-service', (req, res) => {
    res.render('terms')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const server = app.listen(0, () => {
    console.log('Example app listening at http://localhost:', server.address().port);
});

