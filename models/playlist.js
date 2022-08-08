const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
    title: String,
    image: String,
    description: String,
    link: String,
    owner: String,
    owner_url: String,
    num_tracks: Number,
    id: String,
    num_revs: Number,
    total_stars: Number,
    avg_rev: Number,
    score: Number,
    date_added: Number,
    featured: Boolean,
    weekly_eligible: Boolean,
    weekly_score: Number,
    tags: [],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

PlaylistSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Playlist', PlaylistSchema);