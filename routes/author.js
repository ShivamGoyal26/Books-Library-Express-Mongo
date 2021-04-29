const express = require('express')
const Author = require('../models/author')
const router = express.Router()

// All Authors

router.get('/', async (req, res) => {
    // let searchOptions = {}
    let query = Author.find()
    if (req.query.name != null && req.query.name != "") {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const authors = await query.exec()
        res.render("authors/index", {
            authors: authors,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

// New author route

router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// Creating the author route

router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const result = await author.save()
        // res.redirect(`authors/${result.id}`)
        res.redirect('authors')
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error Creating Author'
        })
    }
})

module.exports = router