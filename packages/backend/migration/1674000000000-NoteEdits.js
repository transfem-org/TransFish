export class PollChoiceLength1674000000000 {
	name = 'PollChoiceLength1674000000000'

	async up(queryRunner) {
		await queryRunner.query(`CREATE TABLE "post_edits" (
			"id" VARCHAR(32) NOT NULL,
			"post_id" VARCHAR(32) REFERENCES "note" (id) ON DELETE CASCADE,
			"user_id" VARCHAR(32) REFERENCES "user" (id) ON DELETE CASCADE,
			"text" TEXT,
			"cw" TEXT,
			"media_attachments_changed" BOOLEAN,
			"modified_at" DATE,
			PRIMARY KEY ("id")
		)`);
		await queryRunner.query(`ALTER TABLE "note" ADD "modified_at" DATE DEFAULT NULL`);

		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."id" IS 'Unique Identified for this Edit.'`);
		await queryRunner.query(`COMMENT ON COLUMN "note"."modified_at" IS 'Null if not modified, else the time it was last modified'`)
		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."post_id" IS 'The Post the Edit belongs to.'`);
		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."user_id" IS 'The User that made the edit.'`);
		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."text" IS 'The modified Text.'`);
		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."cw" IS 'The modified CW.'`);
		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."media_attachments_changed" IS 'Did media attachments got changed?'`);
		await queryRunner.query(`COMMENT ON COLUMN "post_edits"."modified_at" IS 'When was the post modified?'`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "modified_at"`);
		await queryRunner.query(`DROP TABLE "post_edits"`);
	}
}
