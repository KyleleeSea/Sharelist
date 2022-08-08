const User = require('../models/user');
const Playlist = require('../models/playlist');

// Captcha Import
var svgCaptcha = require('svg-captcha');

// Registration routes
module.exports.renderRegister = (req, res) => {
    var captcha = svgCaptcha.create();

    res.render('users/register', { captcha });
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to ShareList!');
            res.redirect('/playlists');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/playlists';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/playlists');
}

// Social Routes

module.exports.renderProfile = async (req, res) => {
    const playlists = await Playlist.find({});
    const users = await User.find({});

    const user_list = await User.find({ 'username': req.params.id }).populate('playlists')
    const user = user_list[0]


    // Error handling allowing page to be rendered even if user not logged in

    try {
        const user_logged_in = await User.findById(req.user.id).populate('followers').populate('following')
        // Using variable of user_logged_in_unpopulated to avoid querying nested arrays and objects of user_logged_in when following is populated
        const user_logged_in_unpopulated = await User.findById(req.user.id)
        if (user) {
            res.render('profiles/show', { playlists, users, user, user_logged_in, user_logged_in_unpopulated })
        }
        else {
            req.flash('error', "That profile doesn't exist (URL Case Sensitive)!");
            res.redirect('/playlists');
        }
    }
    catch {
        if (user) {
            res.render('profiles/show', { playlists, users, user })
        }
        else {
            req.flash('error', "That profile doesn't exist (URL Case Sensitive)!");
            res.redirect('/playlists');
        }
    }
}

module.exports.follow = async (req, res) => {

    // User is the person logged in. User_to_follow is the profile getting followed. 
    const user = await User.findById(req.user._id)
    const user_to_follow = await User.find({ 'username': req.body['follow'] })

    // Adjusts followers and following
    user['following'].push(user_to_follow[0])
    user_to_follow[0]['followers'].push(user)

    await user.save()
    await user_to_follow[0].save()

    res.redirect(`/profiles/${req.body['follow']}`)

}

module.exports.unfollow = async (req, res) => {

    // User is the person logged in. User_to_follow is the profile getting followed. 
    var user = await User.findById(req.user._id)
    var user_to_follow = await User.find({ 'username': req.body['unfollow'] })

    // Remove following status from logged in user 
    var index = user['following'].indexOf(user_to_follow[0]['_id']);

    if (index > -1) {
        user['following'].splice(index, 1);
    }

    // Remove follower from unfollowed user 
    var index = user_to_follow[0]['followers'].indexOf(user['_id']);

    if (index > -1) {
        user_to_follow[0]['followers'].splice(index, 1);
    }

    await user.save()
    await user_to_follow[0].save()

    res.redirect(`/profiles/${req.body['unfollow']}`)

}

module.exports.unfollowFromProfile = async (req, res) => {

    // User is the person logged in. User_to_follow is the profile getting followed. 
    var user = await User.findById(req.user._id)
    var user_to_follow = await User.find({ 'username': req.body['unfollow'] })

    // Remove following status from logged in user 
    var index = user['following'].indexOf(user_to_follow[0]['_id']);

    if (index > -1) {
        user['following'].splice(index, 1);
    }

    // Remove follower from unfollowed user 
    var index = user_to_follow[0]['followers'].indexOf(user['_id']);

    if (index > -1) {
        user_to_follow[0]['followers'].splice(index, 1);
    }

    await user.save()
    await user_to_follow[0].save()

    res.redirect(`/profiles/${user.username}`)

}

module.exports.unfollowFromIndex = async (req, res) => {
    // User is the person logged in. User_to_follow is the profile getting followed. 
    var user = await User.findById(req.user._id)
    var user_to_follow = await User.find({ 'username': req.body['unfollow'] })

    // Remove following status from logged in user 
    var index = user['following'].indexOf(user_to_follow[0]['_id']);

    if (index > -1) {
        user['following'].splice(index, 1);
    }

    // Remove follower from unfollowed user 
    var index = user_to_follow[0]['followers'].indexOf(user['_id']);

    if (index > -1) {
        user_to_follow[0]['followers'].splice(index, 1);
    }

    await user.save()
    await user_to_follow[0].save()

    // Current_url is passed in by a hardcoded value from a hidden input in the index page
    req.flash('success', `You unfollowed ${user_to_follow[0]['username']}`);

    res.redirect(`/playlists/${req.body['current_url']}`)
}

module.exports.followFromIndex = async (req, res) => {
    // User is the person logged in. User_to_follow is the profile getting followed. 
    const user = await User.findById(req.user._id)
    const user_to_follow = await User.find({ 'username': req.body['follow'] })

    // Adjusts followers and following
    user['following'].push(user_to_follow[0])
    user_to_follow[0]['followers'].push(user)

    await user.save()
    await user_to_follow[0].save()

    // Current_url is passed in by a hardcoded value from a hidden input in the index page
    req.flash('success', `You followed ${user_to_follow[0]['username']}`);

    res.redirect(`/playlists/${req.body['current_url']}`)
    // res.redirect('/')
}