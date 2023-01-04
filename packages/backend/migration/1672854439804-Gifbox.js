export class gifboxIntegration1672854439804 {
    constructor() {
        this.name = 'gifboxIntegration1672854439804';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "deeplAuthKey" character varying(128)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "deeplAuthKey"`);
    }
}
