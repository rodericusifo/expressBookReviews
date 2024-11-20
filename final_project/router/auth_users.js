const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    const usersWithSameName = users.filter((user) => {
        return user.username === username;
    })
    if (usersWithSameName.length > 0) {
        return false
    } else {
        return true
    }
}

const authenticatedUser = (username,password)=>{
    const validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username) {
        return res.status(400).json({message: "username required!"});
    }
    if (!password) {
        return res.status(400).json({message: "password required!"});
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken
        }
        return res.status(200).json({ message: "User successfully logged in"});
    } else {
        return res.status(400).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params
    const { review } = req.query

    const book = books[isbn]

    if (!book) {
        return res.status(404).json({message: "book not found"});
    }

    book.reviews[req.user.username] = review

    return res.status(200).json({message: "Book Review Added"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params

    const book = books[isbn]

    if (!book) {
        return res.status(404).json({message: "book not found"});
    }

    delete book.reviews[req.user.username]

    return res.status(200).json({message: "Book Review Deleted"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
