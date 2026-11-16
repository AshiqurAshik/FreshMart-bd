import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey
} from "typeorm";

export class CreateAddressTable1793992017331
    implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(
            new Table({
                name: "addresses",

                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "gen_random_uuid()"
                    },
                    {
                        name: "user_id",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "full_name",
                        type: "varchar",
                        length: "100",
                        isNullable: false
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "20",
                        isNullable: false
                    },
                    {
                        name: "address_line",
                        type: "text",
                        isNullable: false
                    },
                    {
                        name: "area",
                        type: "varchar",
                        length: "100",
                        isNullable: false
                    },
                    {
                        name: "city",
                        type: "varchar",
                        length: "100",
                        isNullable: false
                    },
                    {
                        name: "postal_code",
                        type: "varchar",
                        length: "20",
                        isNullable: true
                    },
                    {
                        name: "delivery_zone",
                        type: "varchar",
                        length: "20",
                        isNullable: false
                    },
                    {
                        name: "is_default",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "created_at",
                        type: "timestamptz",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        default: "now()"
                    }
                ]
            })
        );

        await queryRunner.createForeignKey(
            "addresses",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE"
            })
        );

        // Only one default address per user
        await queryRunner.query(`
            CREATE UNIQUE INDEX idx_one_default_address
            ON addresses (user_id)
            WHERE is_default = TRUE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_one_default_address
        `);

        await queryRunner.dropTable("addresses");
    }
}