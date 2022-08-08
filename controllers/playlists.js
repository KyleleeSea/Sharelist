// Spotify API Import
const fs = require('fs');
const { Schema } = require('mongoose');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi();

// Environment variables for client secret and id (spotify API)
const env = require('dotenv').config()
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;

// Importing Mongo Schemas 
const User = require('../models/user')
const Playlist = require('../models/playlist');
const Reviews = require('../models/review')

// Weekly reset
const schedule = require('node-schedule');
const rule_weekly = new schedule.RecurrenceRule();
rule_weekly.dayOfWeek = 0;
rule_weekly.hour = 22;
rule_weekly.minute = 0;

const job_weekly = schedule.scheduleJob(rule_weekly, async function () {
    const playlists = await Playlist.find({});
    console.log('refreshed weekly')

    playlists.forEach(o => {
        if (o['weekly_eligible'] == true) {
            o['weekly_eligible'] = false;
            o.save()
        }
    })
});

// Detect browser
const browser = require('browser-detect') //https://stackoverflow.com/questions/54451155/trying-to-render-different-view-between-mobile-and-web-from-express-js

// Spotify Authorization 
var token;
var request = require('request'); // "Request" library

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
const job_token = schedule.scheduleJob('30 * * * *', function () {
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            token = body.access_token;
            spotifyApi.setAccessToken(token);
        }
    });
});


// Tags
const tags = ['Angry',
    'Angst',
    'Breakup',
    'Chill',
    'Christian',
    'Classical',
    'Country',
    'Disco',
    'Electronic',
    'Folk',
    'Funk',
    'Gym',
    'Happy',
    'Hip Hop',
    'Hype',
    'Indie',
    'Jazz',
    'K-Pop',
    'Latin',
    'Metal',
    'New-age',
    'Other',
    'Pop',
    'Rap',
    'Reggae',
    'Rhythm & Blues',
    'Rock',
    'Sad',
    'Soul']


//getId function delcaration
function getId(url) {
    return url.substring(url.indexOf('playlist/') + 9).split('?')[0]
}

// Render index routes

module.exports.index = async (req, res) => {
    // Pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        // Get total playlists for next button responsiveness
        const total_playlists = await Playlist.find({ tags: tag })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ tags: tag })
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        // Must pass tag in
        res.render('playlists/index', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const total_playlists = await Playlist.find()
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({})
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        res.render('playlists/index', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
}


module.exports.renderTop = async (req, res) => {

    // Pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        // Get total playlists for next button responsiveness
        const total_playlists = await Playlist.find({ tags: tag })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ tags: tag })
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        // Must pass tag in
        res.render('playlists/index_top', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const total_playlists = await Playlist.find()
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({})
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        res.render('playlists/index_top', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
}

module.exports.renderRecent = async (req, res) => {

    // Pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        // Get total playlists for next button responsiveness
        const total_playlists = await Playlist.find({ tags: tag })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ tags: tag })
            .populate('author')
            .sort({ date_added: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        // Must pass tag in
        res.render('playlists/index_recency', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const total_playlists = await Playlist.find()
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({})
            .populate('author')
            .sort({ date_added: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        res.render('playlists/index_recency', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
}


module.exports.renderFeatured = async (req, res) => {

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        const playlists = await Playlist.find({ tags: tag, featured: true }).populate('author');

        res.render('playlists/index_featured', { playlists, tag, tags })
    }
    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const playlists = await Playlist.find({ featured: true }).populate('author');

        res.render('playlists/index_featured', { playlists, tag, tags })
    }
}

module.exports.renderWeeklyTop = async (req, res) => {
    // Pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        // Get total playlists for next button responsiveness
        const total_playlists = await Playlist.find({ tags: tag, weekly_eligible: true })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ tags: tag, weekly_eligible: true })
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        // Must pass tag in
        res.render('playlists/index_weekly', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const total_playlists = await Playlist.find({ weekly_eligible: true })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ weekly_eligible: true })
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        res.render('playlists/index_weekly', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
}

module.exports.renderFeed = async (req, res) => {
    const user = await User.findById(req.user._id)

    // Pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        // Get total playlists for next button responsiveness
        const total_playlists = await Playlist.find({ tags: tag, author: { $in: user['following'] } })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ tags: tag, author: { $in: user['following'] } })
            .populate('author')
            .sort({ date_added: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        // Must pass tag in
        res.render('playlists/feed', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }

    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const total_playlists = await Playlist.find({ author: { $in: user['following'] } })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ author: { $in: user['following'] } })
            .populate('author')
            .sort({ date_added: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        res.render('playlists/feed', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }
}

module.exports.renderRising = async (req, res) => {
    // Pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    // If a tag is found, sort by that tag. Otherwise, initialize the tag as an empty string.
    if (req.query['tag'] != undefined && req.query['tag'] != '') {
        tag = req.query['tag']

        // Get total playlists for next button responsiveness
        const total_playlists = await Playlist.find({ tags: tag, num_revs: { $lt: 15 } })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ tags: tag, num_revs: { $lt: 15 } })
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        // Must pass tag in
        res.render('playlists/index_rising', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }

    else {
        // Get total playlists for next button responsiveness
        var tag = "" //Avoids error on initial load w/o narrowing 
        const total_playlists = await Playlist.find({ num_revs: { $lt: 15 } })
            .populate('author')
            .exec()

        const totalPlaylists = total_playlists.length

        // Pagination continued
        const playlists = await Playlist.find({ num_revs: { $lt: 15 } })
            .populate('author')
            .sort({ score: -1, _id: 1 }) // Must include id, otherwise there's a duplication error. This sorts first by score, then id. 
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec()

        res.render('playlists/index_rising', { playlists, currentPage: page, totalPages: Math.ceil(totalPlaylists / limit), totalPlaylists: totalPlaylists, limit, tags, tag })
    }

}


module.exports.renderNewForm = (req, res) => {
    res.render('playlists/new', { tags });
}

module.exports.createPlaylist = async (req, res, next) => {
    const playlist_link = req.body.playlist.link

    // Tag setup
    const tags = Object.keys(req.body['playlist']).filter((function (e) { return e !== 'link' }))


    // Get all playlist body attributes 
    spotifyApi.getPlaylist(getId(playlist_link))
        .then(async function (data) {
            const description = data.body.description.replace(/&#x27;/g, ''); // Replacing error where html changes apostrophes into &#x27

            const link = data.body.external_urls.spotify;
            const img_link = data.body.images[0].url;
            const title = data.body.name;
            const owner = data.body.owner.display_name;
            const owner_url = data.body.owner.external_urls.spotify;

            const num_tracks = (data.body.tracks.items).length

            const body = { title: title, image: img_link, description: description, link: link, owner: owner, owner_url: owner_url, num_tracks: num_tracks, id: getId(playlist_link), num_revs: 0, avg_rev: 0, total_stars: 0, score: - 0.5, date_added: Date.now(), featured: false, weekly_eligible: true, weekly_score: 0, reviews: [] }

            const playlist = new Playlist(body);
            playlist.author = req.user._id;

            // add tags
            for (tag in tags) {
                playlist['tags'].push(tags[tag])
            }

            // Attach to User 
            const author = await User.findById(req.user._id)
            author.playlists.push(playlist)
            await author.save();

            // Save playlist to database
            await playlist.save();
            req.flash('success', 'Successfully made a new playlist!');
            res.redirect(`/playlists/${playlist._id}`)
            res.redirect('/playlists')
        })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const playlist = await Playlist.findById(id)
    if (!playlist) {
        req.flash('error', 'Cannot find that playlist!');
        return res.redirect('/playlists');
    }
    res.render('playlists/edit', { playlist, tags });
}

module.exports.updatePlaylist = async (req, res) => {
    const { id } = req.params;
    const playlist = await Playlist.findById(id);

    // req.body['playlist'] is undefined if there's no tags. If it's undefined, var tags in the try block will throw an error and the catch will make tags empty
    try {
        var tags = Object.keys(req.body['playlist']).filter((function (e) { return e !== 'link' }))
    }
    catch (err) {
        var tags = []
    }

    playlist['tags'] = tags
    await playlist.save()

    req.flash('success', 'Successfully updated playlist!');
    res.redirect(`/playlists/${playlist._id}`)
}

module.exports.showPlaylist = async (req, res,) => {
    const isMobile = browser(req.headers['user-agent']).mobile;

    const playlist = await Playlist.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); // Must populate to access reviews in show page
    if (!playlist) {
        req.flash('error', 'Cannot find that playlist!');
        return res.redirect('/playlists');
    }

    // Review pagination setup
    var { page = 1, limit = 15 } = req.query;

    try {
        page = newPage

    }
    catch {
        page = page
    }

    const reviews = await Reviews.find({ playlist: playlist })
        .populate('author')
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec()

    const totalReviews_list = await Reviews.find({ playlist: playlist })
    const totalReviews = await totalReviews_list.length

    if (isMobile) {
        res.render('playlists/mobileshow', { playlist, reviews, totalReviews, currentPage: page, totalPages: Math.ceil(totalReviews / limit), limit });

    }
    else {
        res.render('playlists/show', { playlist, reviews, totalReviews, currentPage: page, totalPages: Math.ceil(totalReviews / limit), limit });
    }
}

module.exports.deletePlaylist = async (req, res) => {
    const { id } = req.params;
    await Playlist.findByIdAndDelete(id);

    //Delete from user 
    await User.findByIdAndUpdate(req.user._id, { $pull: { playlists: id } })

    req.flash('success', 'Successfully deleted playlist')
    res.redirect('/playlists');
}