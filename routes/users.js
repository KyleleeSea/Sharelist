const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const { cantFollowSelf, cantDuplicateFollow, mustFollowToUnfollow, validateRegistration, captcha } = require('../middleware');

// Registration rate limiter 
const rateLimit = require('express-rate-limit')

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 create account requests per `window` (here, per hour)
    message:
        'Too many accounts created from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Login rate limiter 
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200, // Limit each IP to 200 login attempt requests per `window` (here, per hour)
    message:
        'Too many login attempts from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


router.route('/register')
    .get(users.renderRegister)
    .post(registrationLimiter, captcha, validateRegistration, catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(loginLimiter, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

router.route('/profiles/:id')
    .get(catchAsync(users.renderProfile))

router.route('/follow')
    .post(cantFollowSelf, cantDuplicateFollow, catchAsync(users.follow));

router.route('/unfollow')
    .post(mustFollowToUnfollow, catchAsync(users.unfollow));

router.route('/unfollow_from_profile')
    .post(mustFollowToUnfollow, catchAsync(users.unfollowFromProfile));

router.route('/unfollow_from_index')
    .post(mustFollowToUnfollow, catchAsync(users.unfollowFromIndex));

router.route('/follow_from_index')
    .post(cantFollowSelf, cantDuplicateFollow, catchAsync(users.followFromIndex));

module.exports = router;