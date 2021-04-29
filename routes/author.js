const express = require('express')
const Author = require('../models/author')
const router = express.Router()
const Book = require('../models/book')

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
        res.redirect(`authors/${result.id}`)
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error Creating Author'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6)
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch (error) {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch (error) {
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch (error) {
        if (author == null) {
            res.redirect('/')
        }
        else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error Updating Author'
            })
        }
    }
})

router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect(`/authors`)
    } catch (error) {
        if (author == null) {
            res.redirect('/')
        }
        else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router