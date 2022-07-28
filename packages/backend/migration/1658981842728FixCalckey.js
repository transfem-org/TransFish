export class FixCalckey1658981842728 {
		name = 'FixCalckey1658981842728'

		async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" SET "useStarForReactionFallback" TRUE;`);
			await queryRunner.query(`ALTER TABLE "meta" SET "repositoryUrl" = 'https://codeberg/thatonecalculator/calckey'`);
			await queryRunner.query(`ALTER TABLE "meta" SET "feedbackUrl" = 'https://codeberg/thatonecalculator/calckey/issues'`);
	}

	async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "meta" SET "useStarForReactionFallback" = FALSE;`);
			await queryRunner.query(`ALTER TABLE "meta" SET "repositoryUrl" = 'https://codeberg/thatonecalculator/calckey'`);
			await queryRunner.query(`ALTER TABLE "meta" SET "feedbackUrl" = 'https://codeberg/thatonecalculator/calckey/issues'`);
	}
}
