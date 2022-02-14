import { Pool } from 'pg';

const pool = new Pool({
  user: 'admin',
  password: 'admin',
  host: 'localhost',
  port: 5432,
  database: 'virtualroom'
});

pool.on('connect', () => {
  console.log('PG connected sucessfully');
});

const db = {
  query: (text, params) => pool.query(text, params),
}

export default db