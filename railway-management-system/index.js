const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/db.js');
const app = express();

app.use(cors());
app.use(bodyParser.json());


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


const authenticationToken = (request, response, next) => {
    let jwtToken
    const authHeader = request.headers['authorization']
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(' ')[1]
    }
    if (jwtToken === undefined) {
      response.status = 401
      response.send('Invalid Access Token')
    } else {
      jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
        if (error) {
          response.send('Invalid Access Token')
        } else {
            request.username = payload.username
            request.email = payload.email
          next()
        }
      })
    }
}

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, 'MY_SECRET_TOKEN_ADMIN', (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }

        if (decoded.role !== 'admin') {
            return res.status(403).send('Forbidden');
        }

        req.user = decoded;
        next();
    });
};


// For Register Api
app.post('/api/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        try {
            const hashedPassword = await bcryptjs.hash(password, 10);

            db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Database query error:', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                res.status(201).json({ message: 'User registered successfully' });
            });
        } catch (error) {
            console.error('Password hashing error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// For Login Api
app.post('/api/login', (req, res) => {
    const { email,username, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.query('SELECT * FROM users WHERE email = ? AND name = ?', [email,username], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];
        const match = await bcryptjs.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const payload = {
            username: username,
            email: email
          }
        const token = jwt.sign(payload, 'MY_SECRET_TOKEN')

        res.status(200).json({ message: 'Login successful', token });
    });
});


// Admin Login 
app.post('/api/admin/login', (req, res) => {
    const { email,username, password } = req.body;
    const role = "admin"

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.query('SELECT * FROM users WHERE email = ? AND name = ? AND role = ? ', [email,username,role], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];
        const match = await bcryptjs.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const payload = {
            username: username,
            email: email,
            role: role
          }
        const token = jwt.sign(payload, 'MY_SECRET_TOKEN_ADMIN')
        res.status(200).json({ message: 'Login successful', token });
    });
});

//Add Trains By Admin
app.post('/api/trains', verifyAdmin, (req, res) => {
    const { name, source, destination,noOfSeats,availableSeats } = req.body;
    console.log(typeof(noOfSeats))
    if (!name || !source || !destination) {
        return res.status(400).send('All fields are required');
    }

    const createTrainQuery = 'INSERT INTO trains (name, source, destination, totalSeats, availableSeats) VALUES (?, ?, ?, ?, ?)';
    db.query(createTrainQuery, [name, source, destination,noOfSeats,availableSeats], (err, results) => {
        if (err) {
            console.error('Error creating train:', err);
            return res.status(500).send('Server error');
        }

        res.status(201).send('Train created successfully');
    });
});




//For Train Availability

app.get('/api/trains/availability', authenticationToken, (req, res) => {
    const { source, destination } = req.query;
    const query = 'SELECT * FROM trains WHERE source = ? AND destination = ?';
    
    db.query(query, [source, destination], (err, results) => {
        if (err) {
            console.error('Error fetching seat availability:', err);
            return res.status(500).send('Server error');
        }

        const availability = results.map(train => ({
            id : train.id,
            name: train.name,
            seatsAvailable: train.availableSeats
        }));
        res.json(availability);
    });
});


//For Booking a Seat

app.post('/api/trains/book', authenticationToken, (req, res) => {
    const { trainId, seatNumber } = req.body;
    console.log(req.username)
    let userId 
    db.query('SELECT id FROM users WHERE name = ? AND email = ?', [req.username, req.email], (err, results) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        userId = results[0].id;
    });
    
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send('Server error');
        }

        const checkSeatQuery = 'SELECT availableSeats FROM trains WHERE id = ? FOR UPDATE';
        db.query(checkSeatQuery, [trainId], (err, results) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error checking seat availability:', err);
                    return res.status(500).send('Server error');
                });
            }

            if (results.length === 0 || results[0].availableSeats < seatNumber) {
                return db.rollback(() => {
                    return res.status(400).send('Seat not available');
                });
            }

            const bookSeatQuery = 'UPDATE trains SET availableSeats = availableSeats - ? WHERE id = ?';
            db.query(bookSeatQuery, [seatNumber,trainId], (err, results) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error booking seat:', err);
                        return res.status(500).send('Server error');
                    });
                }
                const createBookingQuery = 'INSERT INTO bookings (user_id, train_id, number_of_seats) VALUES (?, ?, ?)';
                db.query(createBookingQuery, [userId, trainId, seatNumber], (err, results) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error creating booking:', err);
                            return res.status(500).send('Server error');
                        });
                    }

                    const bookingId = results.insertId;
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', err);
                                return res.status(500).send('Server error');
                            });
                        }
                        console.log(bookingId)
                        res.send({message : 'Booking successful' , bookingId});
                    });
                });
            });
        });
    });
});


// Get Booking details API
app.get('/api/bookings/:bookingId', authenticationToken, (req, res) => {
    const bookingId = req.params.bookingId;
    const query = `SELECT b.*, t.name AS train_name, u.name AS user_name
                   FROM bookings b
                   JOIN trains t ON b.train_id = t.id
                   JOIN users u ON b.user_id = u.id
                   WHERE b.id = ?`;
                   
    db.query(query, [bookingId], (err, results) => {
        if (err) {
            console.error('Error fetching booking details:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send("Booking not found");
        }
        res.json(results[0]);
    });
});











app.get('/get/bookings/data', (req, res) => {
    const query = 'SELECT * FROM trains';
    
    db.query(query, [], (err, results) => {
        if (err) {
            console.error('Error fetching seat availability:', err);
            return res.status(500).send('Server error');
        }

        /*const availability = results.map(train => ({
            name: train.name,
            seatsAvailable: train.seats_available
        }));*/
        res.json(results);
    });
});

