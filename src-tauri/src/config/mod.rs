use directories::UserDirs;
use lazy_static::lazy_static;
use std::fs;

lazy_static! {
    // static ref WORK_PATH: String = String::from("KOTO-STREAM");
    static ref WORK_PATH: &'static str = "KOTO-STREAM";
}

pub fn init() {
    if let Some(user_dirs) = UserDirs::new() {
        let path = user_dirs
            .document_dir()
            .unwrap()
            .join(*WORK_PATH)
            .to_str()
            .unwrap()
            .to_string();
        _ = fs::create_dir_all(path.clone());
    }
}

pub fn get_db_path() -> String {
    if let Some(user_dirs) = UserDirs::new() {
        let path = user_dirs
            .document_dir()
            .unwrap()
            .join(*WORK_PATH)
            .join("data.db")
            .to_str()
            .unwrap()
            .to_string();
        return path;
    } else {
        "data.db".to_string()
    }
}
