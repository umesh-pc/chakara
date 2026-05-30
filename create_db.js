const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'chakra_art'}\`;`);
  console.log(`Database ${process.env.DB_NAME || 'chakra_art'} created or already exists.`);
  await connection.end();
}

main().catch(err => {
  console.error('Failed to create database:', err.message);
  process.exit(1);
});
