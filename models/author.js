const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

const Author = mongoose.model('AUTHOR', authorSchema)

module.exports = Author