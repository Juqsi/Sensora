use std::sync::{Arc, Condvar, Mutex};

pub struct WaitGroup {
    counter: Arc<(Mutex<i32>, Condvar)>,
}

impl WaitGroup {
    /// Erstellt eine neue WaitGroup
    pub fn new() -> Self {
        WaitGroup {
            counter: Arc::new((Mutex::new(0), Condvar::new())),
        }
    }

    /// Erhöht den Zähler um `delta`
    pub fn add(&self, delta: i32) {
        let (lock, _) = &*self.counter;
        let mut count = lock.lock().unwrap();
        *count += delta;
    }

    /// Verringert den Zähler um 1 und weckt den wartenden Thread, wenn der Zähler 0 erreicht
    pub fn done(&self) {
        let (lock, cvar) = &*self.counter;
        let mut count = lock.lock().unwrap();
        *count -= 1;

        if *count == 0 {
            cvar.notify_all();
        }
    }

    /// Wartet, bis der Zähler 0 erreicht
    pub fn wait(&self) {
        let (lock, cvar) = &*self.counter;
        let mut count = lock.lock().unwrap();
        while *count > 0 {
            count = cvar.wait(count).unwrap();
        }
    }
}
