use super::config;
use super::get_conn;
use rusqlite::Error::QueryReturnedNoRows;
use rusqlite::{params, Error, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Deserialize, Serialize)]
pub struct Video {
    pub id: Option<usize>,
    pub title: Option<String>,
    pub image: Option<String>,
    pub description: Option<String>,
    pub actor: Option<String>,
    pub director: Option<String>,
    pub release_date: Option<String>,
    pub area: Option<String>,
    pub alias: Option<String>,
    pub score: Option<String>,
    pub class: Option<String>,
    pub otitle: Option<String>,
    pub episodes: Option<String>,
    pub expand: Option<String>,
    pub bg: Option<String>,
}

pub fn all(p: &super::super::ListVideoReq) -> Result<Vec<Video>, Error> {
    let mut resp: Vec<Video> = Vec::new();
    let conn = get_conn();
    let mut stmt = conn.prepare(
        "SELECT id,
        title,
        image,
        description,
        actor,
        director,
        release_date,
        area,
        alias,
        score,
        class,
        otitle,
        episodes,
        bg,
        expand
        FROM videos LIMIT ?1 OFFSET ?2",
    )?;
    // let person_iter = stmt.unwrap().query([]);
    let person_iter = stmt.query_map(params![p.page_size, p.page_num - 1], |row| {
        Ok(Video {
            id: row.get(0)?,
            title: row.get(1)?,
            image: row.get(2)?,
            description: row.get(3)?,
            actor: row.get(4)?,
            director: row.get(5)?,
            release_date: row.get(6)?,
            area: row.get(7)?,
            alias: row.get(8)?,
            score: row.get(9)?,
            class: row.get(10)?,
            otitle: row.get(11)?,
            episodes: row.get(12)?,
            bg: row.get(13)?,
            expand: row.get(14)?,
        })
    })?;

    for person in person_iter {
        resp.push(person?);
    }

    Ok(resp)
}

pub fn create_video_dir(t: &Video) {
    let resp = find_by_name(t.title.clone().unwrap());
    if let Ok(Some(r)) = resp {
        let path_str = config::get_work_path();
        let path = Path::new(&path_str).join(r.id.unwrap().to_string());
        _ = fs::create_dir_all(path.clone());
    }
}

pub fn create(t: &Video) -> Result<(), Error> {
    let conn = get_conn();

    conn.execute(
        "INSERT INTO videos (title,
            image,
            description,
            actor,
            director,
            release_date,
            area,
            alias,
            score,
            class,
            otitle,
            episodes,
            bg ,
            expand ) VALUES (?1, ?2,?3,?4, ?5,?6,?7, ?8,?9,?10, ?11,?12,?13,?14)",
        (
            &t.title,
            &t.image,
            &t.description,
            &t.actor,
            &t.director,
            &t.release_date,
            &t.area,
            &t.alias,
            &t.score,
            &t.class,
            &t.otitle,
            &t.episodes,
            &t.bg,
            &t.expand,
        ),
    )?;

    Ok(())
}

pub fn update(t: &Video) -> Result<(), Error> {
    let conn = get_conn();

    conn.execute(
        "UPDATE videos SET 
        title = ?1 , 
        image = ?2 , 
        description = ?3,
        actor = ?4 , 
        director = ?5 , 
        release_date = ?6,
        area = ?7 , 
        alias = ?8 , 
        score = ?9,
        class = ?10 , 
        otitle = ?11 , 
        episodes = ?12,
        bg = ?13,
        expand = ?14
        WHERE id = ?15",
        (
            &t.title,
            &t.image,
            &t.description,
            &t.actor,
            &t.director,
            &t.release_date,
            &t.area,
            &t.alias,
            &t.score,
            &t.class,
            &t.otitle,
            &t.episodes,
            &t.bg,
            &t.expand,
            &t.id,
        ),
    )?;

    Ok(())
}

pub fn find_one(id: usize) -> Result<Option<Video>, Error> {
    let conn = get_conn();
    let mut stmt = conn.prepare(
        "SELECT id, title,
    image,
    description,
    actor,
    director,
    release_date,
    area,
    alias,
    score,
    class,
    otitle,
    episodes,
    bg,
    expand FROM videos WHERE id = ?1",
    )?;
    let row: std::result::Result<Option<Video>, Error> = stmt.query_row(params!(id), |row| {
        Ok(Some(Video {
            id: row.get(0)?,
            title: row.get(1)?,
            image: row.get(2)?,
            description: row.get(3)?,
            actor: row.get(4)?,
            director: row.get(5)?,
            release_date: row.get(6)?,
            area: row.get(7)?,
            alias: row.get(8)?,
            score: row.get(9)?,
            class: row.get(10)?,
            otitle: row.get(11)?,
            episodes: row.get(12)?,
            bg: row.get(13)?,
            expand: row.get(14)?,
        }))
    });
    if let Err(QueryReturnedNoRows) = row {
        return Ok(None);
    }
    row
}

pub fn find_by_name(title: String) -> Result<Option<Video>, Error> {
    let conn = get_conn();
    let mut stmt = conn.prepare(
        "SELECT id, 
    title,
    image,
    description,
    actor,
    director,
    release_date,
    area,
    alias,
    score,
    class,
    otitle,
    episodes,
    bg,expand FROM videos WHERE title = ?1",
    )?;
    let row: std::result::Result<Option<Video>, Error> = stmt.query_row(params!(title), |row| {
        Ok(Some(Video {
            id: row.get(0)?,
            title: row.get(1)?,
            image: row.get(2)?,
            description: row.get(3)?,
            actor: row.get(4)?,
            director: row.get(5)?,
            release_date: row.get(6)?,
            area: row.get(7)?,
            alias: row.get(8)?,
            score: row.get(9)?,
            class: row.get(10)?,
            otitle: row.get(11)?,
            episodes: row.get(12)?,
            bg: row.get(13)?,
            expand: row.get(14)?,
        }))
    });
    if let Err(QueryReturnedNoRows) = row {
        return Ok(None);
    }
    row
}

pub fn del_by_id(id: usize) -> Result<(), Error> {
    let conn = get_conn();

    conn.execute("DELETE FROM videos WHERE id = ?1", params!(id))?;

    Ok(())
}
