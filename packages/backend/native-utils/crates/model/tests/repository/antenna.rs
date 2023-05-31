mod it_test {
    use model::{
        entity::{antenna, user},
        repository::Repository,
        schema,
    };
    use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

    use crate::{cleanup, prepare};

    #[tokio::test]
    async fn can_pack() {
        prepare().await;
        let db = database::get_database().unwrap();

        let alice_antenna = user::Entity::find()
            .filter(user::Column::Username.eq("alice"))
            .find_also_related(antenna::Entity)
            .one(db)
            .await
            .unwrap()
            .expect("alice not found")
            .1
            .expect("alice's antenna not found");

        let packed = alice_antenna
            .to_owned()
            .pack()
            .await
            .expect("Unable to pack");

        assert_eq!(
            packed,
            schema::antenna::Antenna {
                id: alice_antenna.id,
                created_at: alice_antenna.created_at.into(),
                name: "Test Antenna".to_string(),
                keywords: vec![
                    vec!["foo".to_string(), "bar".to_string()],
                    vec!["foobar".to_string()]
                ]
                .into(),
                exclude_keywords: vec![
                    vec!["abc".to_string()],
                    vec!["def".to_string(), "ghi".to_string()]
                ]
                .into(),
                src: schema::antenna::AntennaSrc::All,
                user_list_id: None,
                user_group_id: None,
                users: vec![].into(),
                instances: vec![].into(),
                case_sensitive: true,
                notify: true,
                with_replies: false,
                with_file: false,
                has_unread_note: false,
            }
        );

        cleanup().await;
    }

    #[tokio::test]
    async fn unread_note() {
        todo!();
    }
}
