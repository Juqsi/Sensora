mod configuration;
mod server;
mod utils;
mod database;
mod models;
mod security;
mod validation;

use crate::server::run;
use std::thread;
use tokio::runtime::Runtime;
use std::sync::Arc;
use std::panic;
use crate::utils::wait_group::WaitGroup;

fn main() {
    let wg = Arc::new(WaitGroup::new());

    let wg_server = Arc::clone(&wg);
    wg.add(1);
    thread::spawn(move || {
        let rt = Runtime::new().expect("Failed to create Tokio runtime");
        println!("Starting API Server...");

        // `catch_unwind` fängt panics ab und verhindert einen vorzeitigen Absturz
        let _ = panic::catch_unwind(|| {
            rt.block_on(async {
                let _ = run().await;
            });
        });

        wg_server.done();
        println!("API Server stopped");
    });

    wg.wait();
}
