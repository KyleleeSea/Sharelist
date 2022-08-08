const express = require('express');
const router = express.Router();
const playlists = require('../controllers/playlists');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, duplicatePlaylist, validatePlaylist, threeTagsMaxEdit, threeTagsMaxNew } = require('../middleware');

const Playlist = require('../models/playlist');

// Playlist posting rate limiter 
const rateLimit = require('express-rate-limit')

const postLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each IP to 30 playlist submission requests per `window` (here, per hour)
    message:
        'Too many playlists posted from this IP (max 30/hour), please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Allow index routes 
router.route('/')
    .get(catchAsync(playlists.index))
    .post(postLimiter, threeTagsMaxNew, duplicatePlaylist, isLoggedIn, validatePlaylist, catchAsync(playlists.createPlaylist))

router.route('/top')
    .get(catchAsync(playlists.renderTop))

router.route('/recent')
    .get(catchAsync(playlists.renderRecent))

router.route('/featured')
    .get(catchAsync(playlists.renderFeatured))

router.route('/weekly')
    .get(catchAsync(playlists.renderWeeklyTop))

router.route('/feed')
    .get(catchAsync(playlists.renderFeed))

router.route('/rising')
    .get(catchAsync(playlists.renderRising))

// New playlist route
router.get('/new', isLoggedIn, playlists.renderNewForm)

// Show route
router.route('/:id')
    .get(catchAsync(playlists.showPlaylist))
    .put(threeTagsMaxEdit, isLoggedIn, isAuthor, catchAsync(playlists.updatePlaylist))
    .delete(isLoggedIn, isAuthor, catchAsync(playlists.deletePlaylist));

// Edit route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(playlists.renderEditForm))


module.exports = router;