import mysql from 'mysql2/promise';

export const databaseConfig = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Mahe@123',
  database: 'cab',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});