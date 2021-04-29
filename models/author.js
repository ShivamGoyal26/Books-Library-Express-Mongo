const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// This will run when ever the remove operation is gonna trigger
authorSchema.pre('remove', function (next) {
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            next(err)
        } else if (books.length > 0) {
            next(new Error('This author has books still'))
        } else {
            next()  // This is the case where everything is just fine
        }
    })
})

const Author = mongoose.model('AUTHOR', authorSchema)

module.exports = Author