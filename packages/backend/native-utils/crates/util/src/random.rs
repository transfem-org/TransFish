use rand::{distributions::Alphanumeric, thread_rng, Rng};

pub fn gen_string(length: u16) -> String {
    thread_rng()
        .sample_iter(Alphanumeric)
        .take(length.into())
        .map(char::from)
        .collect()
}

#[cfg(test)]
mod tests {
    use std::thread;

    use super::gen_string;

    #[test]
    fn can_generate_string() {
        assert_eq!(gen_string(16).len(), 16);
        assert_ne!(gen_string(16), gen_string(16));
        let s1 = thread::spawn(|| gen_string(16));
        let s2 = thread::spawn(|| gen_string(16));
        assert_ne!(s1.join().unwrap(), s2.join().unwrap());
    }
}
