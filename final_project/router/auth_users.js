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
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

        req.session.authorization = { accessToken, username };

        // Debug: Log session after setting it
        console.log("Session set after login:", req.session);

        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password" });
    }
});



// Add or update book review
regd_users.put("/review/:isbn", (req, res) => {
    console.log(`Received request to update review for ISBN: ${req.params.isbn}`);
    const isbn = req.params.isbn;
    //const { username, review } = req.params;
    const username = req.body.username;
    const review = req.body.reviews;

    console.log(username);
    console.log(review);
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



// DELETE review route
regd_users.delete("/review/:isbn", (req, res) => {
    console.log(req.session);  // Log session for debugging
    console.log("DELETE /review/:isbn route hit");

    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Check if the user is authenticated
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found for this ISBN" });
    }

    if (!book.reviews[username]) {
        return res.status(404).json({ message: `No review found for user ${username}` });
    }

    // Delete the review for the authenticated user
    delete book.reviews[username];

    res.json({ message: `Review deleted successfully for user ${username}`, book: book });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
