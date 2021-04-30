const express = require('express')
const Author = require('../models/author')
const multer = require('multer')
const Book = require('../models/book')
const path = require('path')
const router = express.Router()
const fs = require('fs')

const uploadPath = path.join('public', Book.coverImageBasePath)

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']

const upload = multer({
    dest: uploadPath,   // This is going to be the upload path for all the cover that user is gonna be upload 
    fileFilter: (req, file, callback) =>     // Here we will specify that what kind of files a server accepts 
    {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Books Route

router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != "") {
        query = query.regex('title', new RegExp(req.query.title, 'i')) // This is the query made to the database that we are looking for the title which regex gonna return
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
        query = query.lte('publishDate', req.query.publishedBefore)    // lte stands for the less than or equal to
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
        query = query.gte('publishDate', req.query.publishedAfter)    // lte stands for the greater than or equal to
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

// New book route

router.get('/new', async (req, res) => {
    try {
        const authors = await Author.find({})
        const book = new Book()
        res.render('books/new', {
            authors: authors,
            book: book
        })
    } catch (error) {
        res.redirect('/books')
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) {
            console.log(err)
        }
    })
}

// Creating the book route

router.post('/', upload.single('cover'), async (req, res) => {   // so here we are telling the multer that we will upload the single file with the name inside in the "cover"
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description,
    })
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)

    } catch (error) {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }
        const authors = await Author.find({})
        res.render('books/new', {
            authors: authors,
            book: book,
            errorMessage: 'Error Creating Book'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author')   // Here populate will add all the properties that exists in the author model
        res.render('books/show', { book: book })
    } catch (error) {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const authors = await Author.find({})
        res.render('books/edit', { book: book, authors: authors })
    } catch (error) {
        res.redirect('/')
    }
})

// Updating the book route


router.put('/:id', async (req, res) => {   // so here we are telling the multer that we will upload the single file with the name inside in the "cover"
  
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
       
        await book.save()
        res.redirect(`books/${book.id}`)

    } catch (error) {
        console.log(error)
        const authors = await Author.find({})
        res.render(`books/edit`, {
            authors: authors,
            book: book,
            errorMessage: 'Error Editing Book'
        })
    }
})

router.delete('/:id', async(req, res) => {
     let book
     try {
         book = await Book.findById(req.params.id)
         await book.remove()
         res.redirect('/books')
     } catch (error) {
        if(book != null) {
            res.redirect('/books/show', {
                book: book, 
                errorMessage: 'Failed to delete the book'
            })
        } else {
            res.redirect('/')
        }
     }
})

module.exports = router