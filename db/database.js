const { Pool } = require('pg');

// Replace with your actual connection settings if different
const pool = new Pool({
  user: 'your_db_user',
  password: 'your_db_password',
  host: 'localhost',
  database: 'lightbnb'
});

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<Object|null>} A promise to the user object, or null if not found.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()])
    .then(res => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0];
    })
    .catch(err => {
      console.error('Error in getUserWithEmail:', err.stack);
      return null;
    });
};

/**
 * Get a single user from the database given their id.
 * @param {String} id The id of the user.
 * @return {Promise<Object|null>} A promise to the user object, or null if not found.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then(res => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0];
    })
    .catch(err => {
      console.error('Error in getUserWithId:', err.stack);
      return null;
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, email: string, password: string}} user The user to add.
 * @return {Promise<Object>} A promise to the new user object.
 */
const addUser = function (user) {
  const { name, email, password } = user;
  return pool
    .query(
      `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
      [name, email.toLowerCase(), password]
    )
    .then(res => res.rows[0])
    .catch(err => {
      console.error('Error in addUser:', err.stack);
      throw err;
    });
};

// Export the functions so they can be used in other parts of the app
module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser
};
