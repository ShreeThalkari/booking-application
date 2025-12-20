require('dotenv').config()

const { Pool } = require('pg')

const connection = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

connection.on('connect', () => {
    console.log('Connection Successful');
})

connection.on('error', (err) => {
    console.log('Error:', err);
    process.exit(1);
})

module.exports = connection;


