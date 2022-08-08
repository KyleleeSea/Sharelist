const Playlist = require('../models/playlist');
const Review = require('../models/review');

// Censoring
var urlRE = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+"); //Regex for link

const Filter = require('bad-words')
filter = new Filter(); // Filter swear words

// Combine into one function 
function spamFilter(string_to_test) {
    if (string_to_test.match(urlRE) != null) { //Regex returns null if no link found
        return '[Detected as spam due to posting a link. Please contact us if this was a mistake.]'
    }
    else {
        return filter.clean(string_to_test)
    }
}

module.exports.createReview = async (req, res) => {
    // Initialize review

    // Updating number of reviews, total stars, average review, score, and linking new review to object
    const playlist_object = await Playlist.findById(req.params.id);

    var review // needed to avoid error 

    if (req.body.review['body'] !== '') { // Avoids no body spam filter not knowing what to do bc empty string error
        var review = new Review({ rating: req.body.review['rating'], body: spamFilter(req.body.review['body']), playlist: playlist_object });
    }
    else {
        var review = new Review({ rating: req.body.review['rating'], playlist: playlist_object })
    }

    review.author = req.user._id;

    // Functions exists to avoid error of NaN for first review... Please improve if possible. 
    function first_review_num(num_revs) {
        if (num_revs < 1) {
            return 1
        }
        else {
            return num_revs
        }
    }

    function first_review_stars(total_stars) {
        if (total_stars < 1) {
            return review['rating']
        }
        else {
            return total_stars
        }
    }

    const playlist = await Playlist.findByIdAndUpdate(req.params.id,
        {
            $set:
            {
                num_revs: playlist_object['num_revs'] + 1,
                total_stars: playlist_object['total_stars'] + review['rating'],
                avg_rev: Math.round((first_review_stars(playlist_object['total_stars'])) / first_review_num(playlist_object['num_revs']) * 10) / 10,
                score: first_review_stars(((playlist_object['total_stars'] / first_review_num(playlist_object['num_revs'])) * 100 + first_review_num(playlist_object['num_revs']))),
                weekly_score: first_review_stars(((playlist_object['total_stars'] / first_review_num(playlist_object['num_revs'])) * 100 + first_review_num(playlist_object['num_revs'])))
            }
        })

    playlist.reviews.push(review);

    // Saving and redirecting
    await review.save();
    await playlist.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/playlists/${playlist._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    const playlist = await Playlist.findById(req.params.id)

    // Update score 
    playlist['num_revs'] = playlist['num_revs'] - 1
    playlist['total_stars'] = playlist['total_stars'] - review['rating']

    // Avoids NaN error when there's only one review. Without if, else block, avg_rev is undefined and the code breaks
    if (playlist['num_revs'] == 0 || playlist['total_stars'] == 0) {
        playlist['avg_rev'] = 0
    }
    else {
        playlist['avg_rev'] = Math.round(playlist['total_stars'] / playlist['num_revs'] * 10) / 10
    }
    playlist['score'] = (playlist['avg_rev'] * 100) + (playlist['num_revs'])
    playlist['weekly_score'] = (playlist['avg_rev'] * 100) + (playlist['num_revs'])

    // Save, update, and delete
    await playlist.save()
    await Playlist.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/playlists/${id}`);
}
