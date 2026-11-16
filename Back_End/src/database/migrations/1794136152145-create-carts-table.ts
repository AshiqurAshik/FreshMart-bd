import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class CreateCartsTable1794136152145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "carts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "product_name",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "image_url",
            type: "text",
            isNullable: true,
          },
          {
            name: "brand",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "price",
            type: "numeric",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
          },
          {
            name: "added_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP(6)",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP(6)",
          },
        ],
        uniques: [
          new TableUnique({
            name: "UQ_carts_user_product",
            columnNames: ["user_id", "product_id"],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_carts_user",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            name: "FK_carts_product",
            columnNames: ["product_id"],
            referencedTableName: "products",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("carts");
  }
}