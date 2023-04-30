export class InstanceSilence1682891890317 {
	name = "InstanceSilence1682891890317";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" DROP CONSTRAINT "fk_7f4e851a35d81b64dda28eee0"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_renote_muting_createdAt"`,
		);
		await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muteeId"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_renote_muting_muterId"`);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "useStarForReactionFallback"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableGuestTimeline"`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "silencedHosts" character varying(256) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "notification"."isRead" IS 'Whether the notification was read.'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "meta"."defaultReaction" IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "secureMode" SET NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "privateMode" SET NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "allowedHosts" SET NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "pinnedPages" SET DEFAULT '{/featured,/channels,/explore,/pages,/about-calckey}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://codeberg.org/calckey/calckey'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://codeberg.org/calckey/calckey/issues/new'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "renote_muting"."createdAt" IS 'The created date of the Muting.'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "renote_muting"."muteeId" IS 'The mutee user ID.'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "renote_muting"."muterId" IS 'The muter user ID.'`,
		);
		await queryRunner.query(
			`ALTER TABLE "page" ALTER COLUMN "isPublic" DROP DEFAULT`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_d1259a2c2b7bb413ff449e8711" ON "renote_muting" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_7eac97594bcac5ffcf2068089b" ON "renote_muting" ("muteeId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_7aa72a5fe76019bfe8e5e0e8b7" ON "renote_muting" ("muterId") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_0d801c609cec4e9eb4b6b4490c" ON "renote_muting" ("muterId", "muteeId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_a9021cc2e1feb5f72d3db6e9f5" ON "abuse_user_report" ("targetUserId") `,
		);
		await queryRunner.query(
			`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" ADD CONSTRAINT "FK_a9021cc2e1feb5f72d3db6e9f5f" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" DROP CONSTRAINT "FK_a9021cc2e1feb5f72d3db6e9f5f"`,
		);
		await queryRunner.query(
			`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`,
		);
		await queryRunner.query(
			`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_a9021cc2e1feb5f72d3db6e9f5"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_0d801c609cec4e9eb4b6b4490c"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_7aa72a5fe76019bfe8e5e0e8b7"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_7eac97594bcac5ffcf2068089b"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_d1259a2c2b7bb413ff449e8711"`,
		);
		await queryRunner.query(
			`ALTER TABLE "page" ALTER COLUMN "isPublic" SET DEFAULT true`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "renote_muting"."muterId" IS NULL`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "renote_muting"."muteeId" IS NULL`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "renote_muting"."createdAt" IS NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://github.com/misskey-dev/misskey/issues/new'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://github.com/misskey-dev/misskey'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "pinnedPages" SET DEFAULT '{/featured,/channels,/explore,/pages,/about-misskey}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "allowedHosts" DROP NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "privateMode" DROP NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ALTER COLUMN "secureMode" DROP NOT NULL`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "meta"."defaultReaction" IS 'The fallback reaction for emoji reacts'`,
		);
		await queryRunner.query(
			`COMMENT ON COLUMN "notification"."isRead" IS 'Whether the Notification is read.'`,
		);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "silencedHosts"`);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableGuestTimeline" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "useStarForReactionFallback" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_muterId" ON "muting" ("muterId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_muteeId" ON "muting" ("muteeId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_renote_muting_createdAt" ON "muting" ("createdAt") `,
		);
		await queryRunner.query(
			`ALTER TABLE "abuse_user_report" ADD CONSTRAINT "fk_7f4e851a35d81b64dda28eee0" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}
}
