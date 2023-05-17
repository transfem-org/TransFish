use std::{
    io::{stdout, Stdout, Write},
    sync::{Arc, RwLock},
};

use tracing::{span, Level, Subscriber};

#[derive(thiserror::Error, Debug)]
pub struct Logger<T: Write> {
    log_level: Level,
    writer: Arc<RwLock<T>>,
}

impl<T: Write> Logger<T> {
    pub fn new(log_level: Level, writer: T) -> Self {
        Self {
            log_level,
            writer: RwLock::new(writer).into(),
        }
    }
}

impl<T: Write + 'static> Subscriber for Logger<T> {
    fn enabled(&self, metadata: &tracing::Metadata<'_>) -> bool {
        &self.log_level <= metadata.level()
    }

    fn new_span(&self, span: &span::Attributes<'_>) -> span::Id {
        todo!()
    }

    fn record(&self, span: &span::Id, values: &span::Record<'_>) {
        todo!()
    }

    fn record_follows_from(&self, span: &span::Id, follows: &span::Id) {
        todo!()
    }

    fn event(&self, event: &tracing::Event<'_>) {
        let mut out_buffer = self.writer.write().unwrap();

        writeln!(out_buffer, "{:#?}", event.metadata()).unwrap();
    }

    fn enter(&self, span: &span::Id) {
        todo!()
    }

    fn exit(&self, span: &span::Id) {
        todo!()
    }
}
