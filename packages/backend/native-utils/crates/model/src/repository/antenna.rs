use async_trait::async_trait;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

use crate::entity::{antenna, antenna_note, user_group_joining};
use crate::error::Error;
use crate::schema::antenna::Antenna;

use super::Repository;

#[async_trait]
impl Repository<Antenna> for antenna::Model {
    async fn pack(self) -> Result<Antenna, Error> {
        let db = database::get_database()?;
        let has_unread_note = antenna_note::Entity::find()
            .filter(antenna_note::Column::AntennaId.eq(self.id.to_owned()))
            .filter(antenna_note::Column::Read.eq(false))
            .one(db)
            .await?
            .is_some();
        let user_group_joining = match self.user_group_joining_id {
            None => None,
            Some(id) => user_group_joining::Entity::find_by_id(id).one(db).await?,
        };
        let user_group_id = match user_group_joining {
            None => None,
            Some(m) => Some(m.user_group_id),
        };

        Ok(Antenna {
            id: self.id,
            created_at: self.created_at.into(),
            name: self.name,
            keywords: self.keywords.into(),
            exclude_keywords: self.exclude_keywords.into(),
            src: self.src.try_into()?,
            user_list_id: self.user_list_id,
            user_group_id,
            users: self.users.into(),
            instances: self.instances.into(),
            case_sensitive: self.case_sensitive,
            notify: self.notify,
            with_replies: self.with_replies,
            with_file: self.with_file,
            has_unread_note,
        })
    }
}
