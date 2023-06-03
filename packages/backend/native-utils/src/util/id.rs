//! ID generation utility based on [cuid2]

use cfg_if::cfg_if;
use once_cell::sync::OnceCell;

use crate::impl_into_napi_error;

#[derive(thiserror::Error, Debug, PartialEq, Eq)]
#[error("ID generator has not been initialized yet")]
pub struct ErrorUninitialized;

impl_into_napi_error!(ErrorUninitialized);

static FINGERPRINT: OnceCell<String> = OnceCell::new();
static GENERATOR: OnceCell<cuid2::CuidConstructor> = OnceCell::new();

/// Initializes Cuid2 generator. Must be called before any [create_id].
pub fn init_id(length: u16, fingerprint: impl Into<String>) {
    FINGERPRINT.get_or_init(move || format!("{}{}", fingerprint.into(), cuid2::create_id()));
    GENERATOR.get_or_init(move || {
        cuid2::CuidConstructor::new()
            .with_length(length)
            .with_fingerprinter(|| FINGERPRINT.get().unwrap().clone())
    });
}

/// Returns Cuid2 with the length specified by [init_id]. Must be called after
/// [init_id], otherwise returns [ErrorUninitialized].
pub fn create_id() -> Result<String, ErrorUninitialized> {
    match GENERATOR.get() {
        None => Err(ErrorUninitialized),
        Some(gen) => Ok(gen.create_id()),
    }
}

cfg_if! {
    if #[cfg(feature = "napi")] {
        use radix_fmt::radix_36;
        use std::cmp;
        use napi::bindgen_prelude::BigInt;
        use napi_derive::napi;

        const TIME_2000: u64 = 946_684_800_000;
        const TIMESTAMP_LENGTH: u16 = 8;

        /// Calls [init_id] inside. Must be called before [native_create_id].
        #[napi]
        pub fn native_init_id_generator(length: u16, fingerprint: String) {
            // length to pass init_id shoule be greater than or equal to 8.
            init_id(cmp::max(length - TIMESTAMP_LENGTH, 8), fingerprint);
        }

        /// Generates
        #[napi]
        pub fn native_create_id(date_num: BigInt) -> String {
            let time = cmp::max(date_num.get_u64().1 - TIME_2000, 0);
            format!("{:0>8}{}", radix_36(time).to_string(), create_id().unwrap())
        }
    }
}

#[cfg(test)]
mod unit_test {
    use crate::util::id;
    use cfg_if::cfg_if;
    use pretty_assertions::{assert_eq, assert_ne};
    use std::thread;

    cfg_if! {
        if #[cfg(feature = "napi")] {
            use chrono::Utc;

            #[test]
            fn can_generate_aid_compat_ids() {
                id::native_init_id_generator(20, "".to_string());
                let id1 = id::native_create_id(Utc::now().timestamp_millis().into());
                assert_eq!(id1.len(), 20);
                let id1 = id::native_create_id(Utc::now().timestamp_millis().into());
                let id2 = id::native_create_id(Utc::now().timestamp_millis().into());
                assert_ne!(id1, id2);
                let id1 = thread::spawn(|| id::native_create_id(Utc::now().timestamp_millis().into()));
                let id2 = thread::spawn(|| id::native_create_id(Utc::now().timestamp_millis().into()));
                assert_ne!(id1.join().unwrap(), id2.join().unwrap());
            }
        } else {
            #[test]
            fn can_generate_unique_ids() {
                assert_eq!(id::create_id(), Err(id::ErrorUninitialized));
                id::init_id(12, "");
                assert_eq!(id::create_id().unwrap().len(), 12);
                assert_ne!(id::create_id().unwrap(), id::create_id().unwrap());
                let id1 = thread::spawn(|| id::create_id().unwrap());
                let id2 = thread::spawn(|| id::create_id().unwrap());
                assert_ne!(id1.join().unwrap(), id2.join().unwrap());
            }
        }
    }
}
