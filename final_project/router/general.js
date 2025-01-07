const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    // check if username and password are provided
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    // check if username already exists
    if (users[req.body.username]) {
        return res.status(400).json({message: "Username already exists"});
    }
    // register new user
    users[req.body.username] = {
         
        password: req.body.password
    };
    return res.status(200).json({message: "User registered successfully"});
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
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    //loop through the book to find the ISBN
    let foundBook = null;
    for(let bookKeys in books){
        let book = books[bookKeys];
        //if ISBN exist, assign book to foundBook
        if(book.isbn === isbn){
            foundBook = book;
            break;
        }
    }

    if(foundBook){
        //return the book if found
        res.send(JSON.stringify(data, null, 4));
    }else{
        //return null if no book found with the given ISBN
        res.json(null);
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
public_users.get('/title/:title',async function (req, res) {
    try {
        const title = req.params.title;
        const data = await new Promise((resolve) => {
            let booksByTitle = [];
            let bookKeys = Object.keys(books);
            for (let i = 0; i < bookKeys.length; i++) {
                let book = books[bookKeys[i]];
                if (book.title === title) {
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
public_users.get('/review/:isbn',function (req, res) {
    const details  = req.params.isbn;
    res.send(books[details].reviews)
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
