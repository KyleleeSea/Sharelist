const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    playlists: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist'
    }],
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);