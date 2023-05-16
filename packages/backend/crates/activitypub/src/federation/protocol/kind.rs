//! Types of Activity, Actor, Collection, Link, and Object

use parse_display::{Display, FromStr};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Display, FromStr, PartialEq, Serialize, Deserialize, Default)]
pub(crate) enum ActivityType {
    Activity,
    Accept,
    Add,
    Announce,
    Arrive,
    Block,
    #[default]
    Create,
    Delete,
    Dislike,
    Flag,
    Follow,
    Ignore,
    Invite,
    Join,
    Leave,
    Like,
    Listen,
    Move,
    Offer,
    Question,
    Read,
    Reject,
    Remove,
    TentativeAccept,
    TentativeReject,
    Travel,
    Undo,
    Update,
    View,
}

#[derive(Clone, Debug, Display, FromStr, PartialEq, Serialize, Deserialize, Default)]
pub(crate) enum ActorType {
    Application,
    Group,
    Organization,
    #[default]
    Person,
    Service,
}

#[derive(Clone, Debug, Display, FromStr, PartialEq, Serialize, Deserialize, Default)]
pub(crate) enum CollectionType {
    Collection,
    #[default]
    OrderedCollection,
    CollectionPage,
    OrderedCollectionPage,
}

#[derive(Clone, Debug, Display, FromStr, PartialEq, Serialize, Deserialize, Default)]
pub(crate) enum LinkType {
    #[default]
    Link,
    Mention,
}

#[derive(Clone, Debug, Display, FromStr, PartialEq, Serialize, Deserialize, Default)]
pub(crate) enum ObjectType {
    Object,
    Article,
    Audio,
    Document,
    Event,
    Image,
    #[default]
    Note,
    Page,
    Place,
    Profile,
    Relationship,
    Tombstone,
    Video,
}
