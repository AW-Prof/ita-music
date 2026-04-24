import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const env = {
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: { rejectUnauthorized: false },
};

export async function connect() {
    const db = new pg.Client(env);
    await db.connect();
    return db;
}

export function pool() {
    return new pg.Pool(env);
}
