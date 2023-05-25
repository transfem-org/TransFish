use chrono::{DateTime, Utc};
use radix_fmt::radix_36;

const TIME_2000: i64 = 946_684_800_000;

/// FIXME: Should we continue aid, or use other (more secure and scalable) guids
/// such as [Cuid2](https://github.com/paralleldrive/cuid2)?
pub fn create_aid(date: DateTime<Utc>) -> String {
    let time = date.timestamp_millis() - TIME_2000;
    let time = if time < 0 { 0 } else { time };
    let num: i16 = rand::random();
    let mut noise = format!("{:0>2}", radix_36(num).to_string());
    let noise = noise.split_off(noise.len() - 2);
    format!("{:0>8}{}", radix_36(time).to_string(), noise,)
}

#[cfg(test)]
mod tests {
    use chrono::{TimeZone, Utc};

    use super::create_aid;

    #[test]
    fn generate_aid() {
        let date = Utc.with_ymd_and_hms(2023, 5, 25, 11, 49, 37).unwrap();
        let aid = create_aid(date);
        assert_eq!(aid.len(), 10);
        assert!(aid.starts_with("9f6mynag"));
        assert_ne!(create_aid(Utc::now()), create_aid(Utc::now()));
    }
}
