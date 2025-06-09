const { Pool } = require('pg');

// Replace with your actual database credentials
const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

/**
 * Get a single user from the database given their email.
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

/**
 * Get all reservations for a single user.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
      `
      SELECT properties.*, reservations.*, AVG(property_reviews.rating) AS average_rating
      FROM reservations
      JOIN properties ON reservations.property_id = properties.id
      LEFT JOIN property_reviews ON properties.id = property_reviews.property_id
      WHERE reservations.guest_id = $1
        AND reservations.end_date < NOW()::date
      GROUP BY properties.id, reservations.id
      ORDER BY reservations.start_date
      LIMIT $2;
      `,
      [guest_id, limit]
    )
    .then(res => res.rows)
    .catch(err => {
      console.error('Error in getAllReservations:', err.stack);
      return null;
    });
};

// Export all functions
module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations
};
