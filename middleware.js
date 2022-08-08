const { playlistSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Playlist = require('./models/playlist');
const User = require('./models/user');
const Review = require('./models/review');

// Environment variables for client secret and id (spotify API)
// const env = require('dotenv').config()

// Spotify API Import
const fs = require('fs');
const { Schema } = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi();

// Spotify Authorization
var token;
var request = require('request'); // "Request" library

const env = require('dotenv').config()
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;;

var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        token = body.access_token;
        spotifyApi.setAccessToken(token);
    }
});

// Auto Spotify auth refresh every 30 minutes
const schedule = require('node-schedule');
const job_token = schedule.scheduleJob('30 * * * *', function () {
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            token = body.access_token;
            spotifyApi.setAccessToken(token);
        }
    });
});

//getId function delcaration
function getId(url) {
    return url.substring(url.indexOf('playlist/') + 9).split('?')[0]
}

// Validates if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// Validates if playlist ID is valid and if the link is indeed a Spotify playlist 
module.exports.validatePlaylist = async (req, res, next) => {
    const playlist_link = req.body.playlist.link

    try {
        await spotifyApi.getPlaylist(getId(playlist_link))
    } catch (err) {
        req.flash('error', `An error occured, playlist could not be uploaded. ${err}`);
        return res.redirect(`/playlists/`);
    }
    next();

}

// Validates only 3 tags. Used for both post and put. Two routes for redirect
module.exports.threeTagsMaxEdit = async (req, res, next) => {
    // req.body['playlist'] is undefined if there's no tags. If it's undefined, var tags in the try block will throw an error and the catch will make tags empty
    try {
        var tags = Object.keys(req.body['playlist']).filter((function (e) { return e !== 'link' }))
    }
    catch (err) {
        var tags = []
    }

    const playlist = await Playlist.findById(req.params.id);

    if (tags.length > 3) {
        req.flash('error', `Maximum of 3 tags!`);
        return res.redirect(`/playlists/${playlist._id}/edit`);
    }
    next();
}

// Redirects to new page 
module.exports.threeTagsMaxNew = async (req, res, next) => {
    // req.body['playlist'] is undefined if there's no tags. If it's undefined, var tags in the try block will throw an error and the catch will make tags empty
    try {
        var tags = Object.keys(req.body['playlist']).filter((function (e) { return e !== 'link' }))
    }
    catch (err) {
        var tags = []
    }

    if (tags.length > 3) {
        req.flash('error', `Maximum of 3 tags!`);
        return res.redirect(`/playlists/new`);
    }
    next();
}

// Valiates if user sending request is the author of post. Used for deletion route. 
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);
    if (!playlist.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/playlists/${id}`);
    }
    next();
}

// Validates that the playlist user wants to submit hasn't been submitted yet. Error: Only works after first duplicate posted. 
module.exports.duplicatePlaylist = async (req, res, next) => {
    const playlists = await Playlist.find({});
    const playlist_id = getId(req.body['playlist']['link'])

    playlists.forEach(o => {
        if (playlist_id == o['id']) {
            req.flash('error', 'That playlist has already been posted!');
            return res.redirect(`/playlists/`);
        }
    })
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/playlists/${id}`);
    }
    next();
}

// Checks if review has rating 
module.exports.validateReview = (req, res, next) => {
    if (req.body.review['rating'] > 5 || req.body.review['rating'] < 1 || !req.body.review['rating']) {
        req.flash('error', 'Invalid review rating!');
        return res.redirect(`/playlists/${req.params.id}`);
    }
    next();
}

module.exports.cantReviewOwnPost = async (req, res, next) => {
    const playlist = await Playlist.findById(req.params.id)

    // Doesn't work if not casted to string
    const playlist_author = String(playlist['author'])
    const user = String(req.user._id)

    if (playlist_author === user) {
        req.flash('error', 'You cannot review your own post!');
        return res.redirect(`/playlists/${req.params.id}`);
    }
    next();
}

// Validates that the user hasn't already reviewed the playlist. Error: Only works after first duplicate posted. 
module.exports.duplicateReview = async (req, res, next) => {
    const user = String(req.user._id)
    const playlist = await Playlist.findById(req.params.id).populate('reviews')

    playlist['reviews'].forEach(o => {
        if (String(o['author']) == user) {
            req.flash('error', 'You have already reviewed this post!');
            return res.redirect(`/playlists/${req.params.id}`);
        }
    })

    next();
}

// Valiates user isn't trying to follow themselves
module.exports.cantFollowSelf = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const user_to_follow = await User.find({ 'username': req.body['follow'] });
    if (String(user._id) == String(user_to_follow[0]._id)) {
        req.flash('error', 'You cannot follow yourself!');
        return res.redirect(`/playlists/`);
    }

    next();
}

// Valiates user isn't trying to follow themselves
module.exports.cantDuplicateFollow = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const user_to_follow = await User.find({ 'username': req.body['follow'] });
    if (user_to_follow[0]['followers'].includes(user._id)) {
        req.flash('error', 'You cannot follow a profile multiple times!');
        return res.redirect(`/playlists/`);
    }

    next();
}

// Valiates user isn't trying to unfollow an account they aren't following
module.exports.mustFollowToUnfollow = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const user_to_follow = await User.find({ 'username': req.body['unfollow'] });
    if (!(user_to_follow[0]['followers'].includes(user._id))) {
        req.flash('error', 'You cannot unfollow a profile you are not currently following!');
        return res.redirect(`/playlists/`);
    }

    next();
}

// Captcha validation
module.exports.captcha = async (req, res, next) => {
    const { captcha, captcha_verif } = req.body;

    if (captcha.toLowerCase() !== captcha_verif.toLowerCase()) {
        req.flash('error', 'Captcha failed, do you have caps lock on?');
        return res.redirect(`/register/`);
    }

    next();
}

module.exports.validateRegistration = async (req, res, next) => {
    const { email, username, password } = req.body;

    // Special character (includes space) validation
    function hasSpecialCharacters(str) {
        var regex = /[ !@#$%^&*()+\-=\[\]{};':"\\|,<>\/?]/g;
        return regex.test(str);
    }

    if (hasSpecialCharacters(username)) {
        req.flash('error', 'You cannot have special characters (such as !, ?, $, @, etc) or spaces in your username');
        return res.redirect(`/register/`);
    }

    // Password length validation
    if (password.length < 8) {
        req.flash('error', 'Password must be 8 or more characters');
        return res.redirect(`/register/`);
    }

    // Password too long
    if (password.length > 50) {
        req.flash('error', 'Password too long');
        return res.redirect(`/register/`);
    }

    // Username length validation
    if (username.length > 20) {
        req.flash('error', 'Username too long');
        return res.redirect(`/register/`);
    }

    next();
}

module.exports.contactValidation = async (req, res, next) => {
    if (req.body.email == '') {
        req.flash('error', 'Please enter a valid email!');
        return res.redirect(`/contact/`);
    }
    next();
}