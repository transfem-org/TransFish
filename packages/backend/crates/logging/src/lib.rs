use console::{pad_str, style, Style};
use std::{
    io::Write,
    num::NonZeroU64,
    sync::{Arc, Mutex, RwLock},
};

use tracing::{field::Visit, span, Level, Subscriber};

#[derive(thiserror::Error, Debug)]
pub struct Logger<T>
where
    T: Write,
{
    log_level: Level,
    writer: Arc<RwLock<T>>,
    log_id: Mutex<NonZeroU64>,
}

impl<T> Logger<T>
where
    T: Write,
{
    pub fn new(log_level: Level, writer: T) -> Self {
        Self {
            log_level,
            writer: RwLock::new(writer).into(),
            log_id: NonZeroU64::new(1).unwrap().into(),
        }
    }
}

impl<T> Subscriber for Logger<T>
where
    T: Write + 'static,
{
    fn enabled(&self, metadata: &tracing::Metadata<'_>) -> bool {
        &self.log_level >= metadata.level()
    }

    fn new_span(&self, _span: &span::Attributes<'_>) -> span::Id {
        let id = match self.log_id.lock() {
            Ok(mut v) => {
                *v = v.checked_add(1).unwrap();
                *v
            }
            Err(_) => NonZeroU64::new(1).unwrap(),
        };
        span::Id::from_non_zero_u64(id)
    }

    fn record(&self, _span: &span::Id, _values: &span::Record<'_>) {
        //todo!()
    }

    fn record_follows_from(&self, _span: &span::Id, _followss: &span::Id) {
        //todo!()
    }

    fn event(&self, event: &tracing::Event<'_>) {
        let mut out_buffer = self.writer.write().unwrap();
        //let mut out_buffer = Ansi::new(out_buffer.deref_mut());

        //_ = out_buffer.write_all(

        let level = *event.metadata().level();

        let header = Style::new();
        let s = pad_str(level.as_str(), 5, console::Alignment::Left, None);
        let header = match level {
            Level::ERROR => header.red(),
            Level::WARN => header.yellow(),
            Level::INFO => header.white(),
            Level::DEBUG => header.cyan(),
            Level::TRACE => header.bright().black(),
        };

        let mut visitor = V(String::new(), true);
        event.record(&mut visitor);

        let message = header.apply_to(format!(
            "{}: [{}] {}",
            s,
            style(chrono::offset::Local::now()).bright(),
            visitor.0
        ));

        _ = writeln!(out_buffer, "{message}");

        //   );

        _ = out_buffer.flush();

        //write!(out_buffer, "{:#?}", event.metadata()).unwrap();

        /// A visitor for determining the contents of the fields
        #[derive(Default)]
        struct V(String, bool);

        impl Visit for V {
            fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
                self.0.push_str(&if self.1 {
                    format!("{}={:#?}", field.name(), value)
                } else {
                    format!("{}={:?}", field.name(), value)
                });
            }
        }
    }

    fn enter(&self, _span: &span::Id) {
        //todo!()
    }

    fn exit(&self, _span: &span::Id) {
        //todo!()
    }
}
