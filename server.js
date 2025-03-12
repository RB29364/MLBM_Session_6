// server.js

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // body-parser to handle request bodies
const fs = require('fs'); // File system module to read and write files

const app = express(); // Create an Express application
const port = 3000; // Define the port the server will listen on

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Serve static files from the 'public' directory
// This makes files in the 'public' folder accessible directly from the browser
app.use(express.static('public'));

// Signup endpoint - handles POST requests to /signup
app.post('/signup', (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;
    const timestamp = new Date().toISOString(); // Generate a timestamp for user registration

    // User data to be saved
    const newUser = {
        email: email,
        password: password, // In a real application, you should hash and salt passwords!
        timestamp: timestamp
    };

    // Path to the users.json file
    const usersFilePath = 'users.json';

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        let users = []; // Initialize users array
        if (!err) {
            try {
                users = JSON.parse(data); // Try to parse existing users data from file
            } catch (parseError) {
                console.error('Error parsing users.json:', parseError);
                // If there's an error parsing, start with an empty users array
            }
        } else if (err.code !== 'ENOENT') { // ENOENT error means file not found, which is okay initially
            console.error('Error reading users.json:', err);
            return res.status(500).send('Error reading user data.');
        }

        users.push(newUser); // Add the new user to the users array

        // Write the updated users array back to users.json
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to users.json:', writeErr);
                return res.status(500).send('Signup failed: Could not save user data.');
            }
            // Respond to the client indicating successful signup
            res.send('Signup successful!');
        });
    });
});

// Login endpoint - handles POST requests to /login
app.post('/login', (req, res) => {
    // Extract email and password from the login request
    const { email, password } = req.body;

    // Path to the users.json file
    const usersFilePath = 'users.json';

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json for login:', err);
            return res.status(500).send('Login failed: Could not read user data.');
        }

        let users = [];
        try {
            users = JSON.parse(data); // Parse user data from users.json
        } catch (parseError) {
            console.error('Error parsing users.json for login:', parseError);
            return res.status(500).send('Login failed: Error reading user data.');
        }

        // Check if there is a user with the provided email and password
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // If user is found, login is successful
            res.send('Login successful!');
        } else {
            // If no matching user is found, login fails
            res.status(401).send('Login failed: Invalid credentials.');
        }
    });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
