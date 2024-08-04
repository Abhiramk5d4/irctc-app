const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit process with failure
    } else {
        console.log('Database connected!');
    }
});

module.exports = connection;