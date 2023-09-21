// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::{fs, path::PathBuf};

use serde::{Deserialize, Serialize};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            handle_exists_file,
            handle_create_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
#[derive(Debug, Deserialize, Serialize)]
struct Resp<T> {
    data: Option<T>,
    message: String,
    code: u32,
}

#[derive(Debug, Deserialize, Serialize)]
struct Empty([i8; 0]);

#[derive(Debug, Deserialize, Serialize)]
pub struct ExistsFileAns {
    exists: bool,
    path: String,
}
#[tauri::command]
fn handle_exists_file(path: String) -> Resp<ExistsFileAns> {
    let file_path = PathBuf::from(&path.clone());
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

#[tauri::command]
fn handle_create_dir(path: String) -> Resp<Empty> {
    let err = fs::create_dir_all(path.clone());
    if let Err(e) = err {
        println!("{}", e);
    }
    Resp {
        data: None,
        message: "success".to_string(),
        code: 200,
    }
}
