import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProductTable1793962559986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "category",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "brand",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "image_url",
            type: "text",
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
            name: "stock",
            type: "integer",
            default: 0,
            isNullable: false,
          },
          {
            name: "unit",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "CHK_products_price" CHECK ("price" >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "CHK_products_stock" CHECK ("stock" >= 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products");
  }
}