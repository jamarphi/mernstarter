const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pictureList: [
        {
            pictureId: Number,
            pictureName: String,
            pictureTitle: String,
            picturePath: String,
            pictureBuffer: Buffer,
            pictureType: String,
            pictureCreatedAt: Number,
            pictureUpdatedAt: Number
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User',Schema);