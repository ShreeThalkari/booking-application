require("dotenv").config();
const { Pool } = require("pg");

let connection;

if (process.env.NODE_ENV === "production") {
    // Render / Production
    connection = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    // Local development
    connection = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: Number(process.env.DB_PORT),
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
}

// Optional: verify connection
connection
    .query("SELECT NOW()")
    .then(() => console.log("Database connected:", process.env.NODE_ENV))
    .catch(err => {
        console.error("DB connection failed:", err);
        process.exit(1);
    });

module.exports = connection;
