const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Middleware to check for valid username
const isValid = (username) => {
    if (!username || !/^[a-zA-Z0-9]+$/.test(username)) {
        return false;
    }
    if (username.length < 3 || username.length > 20) {
        return false;
    }
    const reservedUsernames = ['admin', 'root', 'superuser'];
    if (reservedUsernames.includes(username.toLowerCase())) {
        return false;
    }
    return true;
}

// Check if the user is authenticated
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

// Login route
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or update book review
regd_users.put("/review/:isbn", (req, res) => {
    console.log(`Received request to update review for ISBN: ${req.params.isbn}`);
    const isbn = req.params.isbn;
    const { username, review } = req.body;

    let book = books[isbn];

    if (!book) {
        console.log("Book not found.");
        return res.status(404).json({ message: "Book not found for this ISBN" });
    }

    if (!review || !username) {
        return res.status(400).json({ message: "Review and username are required" });
    }

    book.reviews[username] = review;

    console.log("Review added/updated successfully.");
    res.json({ message: "Review added/updated successfully", book: book });
});


// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let foundBook = books[isbn];

    if (foundBook) {
        let username = req.session.username;
        foundBook.reviews = foundBook.reviews.filter(review => review.username !== username);
        books[isbn] = foundBook;
        res.send(`Review for book with ISBN ${isbn} deleted.`);
    } else {
        res.send("Unable to find book!");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
