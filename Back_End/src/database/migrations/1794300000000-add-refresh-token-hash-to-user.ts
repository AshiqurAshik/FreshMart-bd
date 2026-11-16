import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRefreshTokenHashToUser1794300000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "refresh_token_hash",
                type: "text",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "refresh_token_hash");
    }
}
