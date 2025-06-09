const { Pool } = require('pg');

// ✅ Update these with your actual DB credentials
const pool = new Pool({
  user: 'your_db_user',
  password: 'your_db_password',
  host: 'localhost',
  database: 'lightbnb'
});

// ✅ Get user by email
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()])
    .then(res => res.rows[0] || null)
    .catch(err => {
      console.error('getUserWithEmail error:', err.stack);
      return null;
    });
};

// ✅ Get user by ID
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then(res => res.rows[0] || null)
    .catch(err => {
      console.error('getUserWithId error:', err.stack);
      return null;
    });
};

// ✅ Add a new user
const addUser = function (user) {
  const { name, email, password } = user;
  return pool
    .query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [name, email.toLowerCase(), password]
    )
    .then(res => res.rows[0])
    .catch(err => {
      console.error('addUser error:', err.stack);
      throw err;
    });
};

// ✅ Get all reservations for a user
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
      console.error('getAllReservations error:', err.stack);
      return null;
    });
};

// ✅ Get all properties with optional filters
const getAllProperties = function (options, limit = 10) {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_reviews.property_id
  `;

  const whereClauses = [];

  // City filter
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    whereClauses.push(`city LIKE $${queryParams.length}`);
  }

  // Owner filter
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    whereClauses.push(`owner_id = $${queryParams.length}`);
  }

  // Price range filter
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night) * 100);
    whereClauses.push(`cost_per_night >= $${queryParams.length}`);

    queryParams.push(Number(options.maximum_price_per_night) * 100);
    whereClauses.push(`cost_per_night <= $${queryParams.length}`);
  }

  // WHERE clause (if any filters)
  if (whereClauses.length > 0) {
    queryString += `WHERE ${whereClauses.join(' AND ')}\n`;
  }

  // GROUP BY and optional HAVING
  queryString += `GROUP BY properties.id\n`;

  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length}\n`;
  }

  // Finalize query with ORDER and LIMIT
  queryParams.push(limit);
  queryString += `ORDER BY cost_per_night\nLIMIT $${queryParams.length};`;

  console.log('getAllProperties query:', queryString);
  console.log('Parameters:', queryParams);

  return pool.query(queryString, queryParams).then(res => res.rows);
};

// ✅ Export all functions
module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties
};
