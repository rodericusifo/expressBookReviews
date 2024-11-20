const express = require('express');
let booksdb = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const getBooks = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(booksdb)
        }, 3000)
    })
}


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) {
        return res.status(400).json({message: "username required!"});
    }
    if (!password) {
        return res.status(400).json({message: "password required!"});
    }

    if (username && password) {
        if (isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(400).json({message: "User already exists!"});
        }
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const books = await getBooks()

    return res.status(200).json({message: "list of books", data: books});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const { isbn } = req.params

    const books = await getBooks()

    const book = books[isbn]

    if (!book) {
        return res.status(404).json({message: "book not found"});
    }

    return res.status(200).json({message: "book found", data: book});
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const { author } = req.params

    const books = await getBooks()

    const authorQueries = author.split(" ")

    const booksFound = {}
    Object.keys(books).forEach((bookISBN) => {
        const queryResult = authorQueries.every((authorQuery) => (books[bookISBN].author.toLowerCase().includes(authorQuery.toLowerCase())))

        if (queryResult) {
            booksFound[bookISBN] = books[bookISBN]
        }
    })

    if (Object.keys(booksFound).length <= 0) {
        return res.status(404).json({message: "books not found"});
    }

    return res.status(200).json({message: "books found", data: booksFound});
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const { title } = req.params

    const books = await getBooks()

    const titleQueries = title.split(" ")
  
    const booksFound = {}
    Object.keys(books).forEach((bookISBN) => {
        const queryResult = titleQueries.every((titleQuery) => (books[bookISBN].title.toLowerCase().includes(titleQuery.toLowerCase())))

        if (queryResult) {
            booksFound[bookISBN] = books[bookISBN]
        }
    })
  
    if (Object.keys(booksFound).length <= 0) {
      return res.status(404).json({message: "books not found"});
    }
  
    return res.status(200).json({message: "books found", data: booksFound});
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params

    const book = books[isbn]

    if (!book) {
        return res.status(404).json({message: "book not found"});
    }

    return res.status(200).json({message: "book reviews found", data: book.reviews});
});

module.exports.general = public_users;
