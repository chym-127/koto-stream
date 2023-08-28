pub mod video;

use super::config;
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
#[derive(Debug, Deserialize, Serialize)]
struct Total(usize);

pub fn init() -> Result<()> {
    let conn: Connection = Connection::open(config::get_db_path())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS videos (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            image TEXT,
            description TEXT,
            actor VARCHAR(255),
            director VARCHAR(255),
            episodes TEXT,
            release_date VARCHAR(255),
            alias VARCHAR(255),
            area VARCHAR(255),
            score VARCHAR(255),
            class VARCHAR(255),
            otitle VARCHAR(255),
            bg VARCHAR(255)
        )",
        (), // empty list of parameters.
    )?;

    Ok(())
}

pub fn get_conn() -> Connection {
    let res: std::result::Result<Connection, rusqlite::Error> = Connection::open(config::get_db_path());
    res.unwrap()
}
