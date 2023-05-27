//! ID generation utility based on [cuid2]

use cuid2::CuidConstructor;
use once_cell::sync::OnceCell;

#[derive(thiserror::Error, Debug, PartialEq, Eq)]
#[error("ID generator has not been initialized yet")]
pub struct ErrorUninitialized;

static GENERATOR: OnceCell<CuidConstructor> = OnceCell::new();

pub fn init_id(length: u16) {
    GENERATOR.get_or_init(move || CuidConstructor::new().with_length(length));
}

pub fn create_id() -> Result<String, ErrorUninitialized> {
    match GENERATOR.get() {
        None => Err(ErrorUninitialized),
        Some(gen) => Ok(gen.create_id()),
    }
}

#[cfg(test)]
mod tests {
    use std::thread;

    use crate::id;

    #[test]
    fn unit_id_can_generate() {
        assert_eq!(id::create_id(), Err(id::ErrorUninitialized));
        id::init_id(12);
        assert_eq!(id::create_id().unwrap().len(), 12);
        assert_ne!(id::create_id().unwrap(), id::create_id().unwrap());
        let id1 = thread::spawn(|| id::create_id().unwrap());
        let id2 = thread::spawn(|| id::create_id().unwrap());
        assert_ne!(id1.join().unwrap(), id2.join().unwrap())
    }
}
