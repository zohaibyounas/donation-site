const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique
    }
})

module.exports = mongoose.model("Newsletter",newsletterSchema);