const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    // Check if the username already exists
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }
    // Add new user
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
public_users.get('/',async function(req, res) {
    try {
        const data = await new Promise((resolve) => {
            resolve(books);
        });
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Extract ISBN from request parameters
    const book = books[isbn];      // Fetch the book by ISBN
    
    if (book) {
        res.json(book);            // Return the book if found
    } else {
        res.status(404).json({ message: "Book not found for the given ISBN" });
    }
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;  // Get the author from the URL path parameter
    
    new Promise((resolve, reject) => {
        let booksByAuthor = [];
        let bookKeys = Object.keys(books);
        
        // Loop through the books and find matches
        for (let i = 0; i < bookKeys.length; i++) {
            let book = books[bookKeys[i]];
            
            // Check if the book author matches the URL parameter (case-insensitive)
            if (book.author.toLowerCase() === author.toLowerCase()) {
                booksByAuthor.push(book);
            }
        }

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject(new Error('No books found for the given author.'));
        }
    })
    .then((data) => {
        res.send(JSON.stringify(data, null, 4));
    })
    .catch((error) => {
        res.status(404).json({ message: error.message });  // Return a 404 if no books found
    });
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();
        const data = await new Promise((resolve) => {
            let booksByTitle = [];
            let bookKeys = Object.keys(books);
            for (let i = 0; i < bookKeys.length; i++) {
                let book = books[bookKeys[i]];
                if (book.title.toLowerCase() === title) {
                    booksByTitle.push(book);
                }
            }
            resolve(booksByTitle);
        });
        res.send(JSON.stringify(data, null, 4));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        res.send(book.reviews);
    } else {
        res.status(404).json({ message: "Reviews not found for this book" });
    }
});


module.exports.general = public_users;
