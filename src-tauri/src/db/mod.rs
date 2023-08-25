pub mod video;

use lazy_static::lazy_static;
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
lazy_static! {
    static ref DB_FILE: &'static str = "E:\\database\\data.db";
}

#[derive(Debug, Deserialize, Serialize)]
struct Total(usize);

pub fn init() -> Result<()> {
    let conn: Connection = Connection::open(*DB_FILE)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS videos (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            image TEXT,
            description TEXT,
            actor VARCHAR(255),
            director VARCHAR(255),
            release_date VARCHAR(255),
            alias VARCHAR(255),
            area VARCHAR(255),
            score VARCHAR(255),
            class VARCHAR(255),
            otitle VARCHAR(255)
        )",
        (), // empty list of parameters.
    )?;

    Ok(())
}

pub fn get_conn() -> Connection {
    let res: std::result::Result<Connection, rusqlite::Error> = Connection::open(*DB_FILE);
    res.unwrap()
}
