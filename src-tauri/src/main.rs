// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod config;
mod db;
use crate::db::video;
use serde::{Deserialize, Serialize};

fn main() {
    let _ = config::init();
    let _ = db::init();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            handle_create_video,
            handle_get_video,
            handle_list_video,
            handle_update_video,
            handle_del_video,
            handle_down_file,
            handle_get_work_path,
            handle_exists_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
#[derive(Debug, Deserialize, Serialize)]
struct Resp<T> {
    data: Option<T>,
    message: String,
    code: u8,
}

#[derive(Debug, Deserialize, Serialize)]
struct Empty([i8; 0]);

#[tauri::command]
fn handle_create_video(mut t: video::Video) -> Resp<Empty> {
    let row = video::find_by_name(t.title.clone().unwrap());
    if let Ok(Some(r)) = row {
        t.id = r.id;
        let err = video::update(&t);
        if let Err(err) = err {
            println!("{:?}", err);
        }
    } else {
        let _ = video::create(&t);
        //创建对应的目录
        video::create_video_dir(&t);
    }
    Resp {
        data: None,
        message: "success".to_string(),
        code: 200,
    }
}

#[tauri::command]
fn handle_update_video(t: video::Video) -> Resp<Empty> {
    let row = video::find_one(t.id.unwrap());
    if let Ok(Some(_)) = row {
        let r = video::update(&t);
        if let Ok(_) = r {
            Resp {
                data: None,
                message: "success".to_string(),
                code: 200,
            }
        } else {
            Resp {
                data: None,
                message: "操作失败".to_string(),
                code: 100,
            }
        }
    } else {
        Resp {
            data: None,
            message: "记录不存在".to_string(),
            code: 101,
        }
    }
}

#[tauri::command]
fn handle_del_video(id: usize) -> Resp<Empty> {
    let _ = video::del_by_id(id);
    Resp {
        data: None,
        message: "success".to_string(),
        code: 200,
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ListVideoReq {
    page_size: usize,
    page_num: usize,
}

#[tauri::command]
fn handle_list_video(req: ListVideoReq) -> Resp<Vec<video::Video>> {
    let resp = video::all(&req);
    Resp {
        data: Some(resp.unwrap()),
        message: "success".to_string(),
        code: 200,
    }
}

#[tauri::command]
fn handle_get_video(id: usize) -> Resp<video::Video> {
    let resp = video::find_one(id);
    if let Ok(Some(v)) = resp {
        return Resp {
            data: Some(v),
            message: "success".to_string(),
            code: 200,
        };
    } else {
        return Resp {
            data: None,
            message: "记录不存在".to_string(),
            code: 101,
        };
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct DownFileReq {
    url: String,
    path: String,
    file_name: String,
}

use std::fs::File;
use std::io;
use std::path::Path;

#[tauri::command]
fn handle_down_file(req: DownFileReq) -> Resp<String> {
    let mut resp = reqwest::blocking::get(req.url).expect("request failed");
    let output_path = Path::new(&config::get_work_path())
        .join(req.path)
        .join(req.file_name);
    let mut out = File::create(&output_path).expect("failed to create file");
    let msg = io::copy(&mut resp, &mut out);
    if let Err(_) = msg {
        println!("failed to copy file")
    }
    println!("success");
    Resp {
        data: Some(output_path.as_path().display().to_string()),
        message: "success".to_string(),
        code: 200,
    }
}

#[tauri::command]
fn handle_get_work_path() -> Resp<String> {
    Resp {
        data: Some(config::get_work_path()),
        message: "success".to_string(),
        code: 200,
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExistsFileAns {
    exists: bool,
    path: String,
}
#[tauri::command]
fn handle_exists_file(path: String) -> Resp<ExistsFileAns> {
    let file_path = Path::new(&config::get_work_path()).join(path);
    let exists = file_path.exists();
    Resp {
        data: Some(ExistsFileAns {
            exists: exists,
            path: file_path.as_path().display().to_string(),
        }),
        message: "success".to_string(),
        code: 200,
    }
}
