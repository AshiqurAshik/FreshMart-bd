import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class CreateOrdersTable1794136286675 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "order_number",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "user_email",
            type: "varchar",
            length: "150",
            isNullable: false,
          },
          {
            name: "items",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "recipient_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "phone",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "delivery_address",
            type: "text",
            isNullable: false,
          },
          {
            name: "area",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "delivery_zone",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "subtotal",
            type: "numeric",
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: "delivery_charge",
            type: "numeric",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: "discount_amount",
            type: "numeric",
            precision: 12,
            scale: 2,
            isNullable: false,
            default: "0",
          },
          {
            name: "total_amount",
            type: "numeric",
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: "payment_method",
            type: "varchar",
            length: "30",
            isNullable: false,
          },
          {
            name: "payment_status",
            type: "varchar",
            length: "30",
            isNullable: false,
            default: "'pending'",
          },
          {
            name: "order_status",
            type: "varchar",
            length: "30",
            isNullable: false,
            default: "'pending'",
          },
          {
            name: "customer_note",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
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
            name: "UQ_orders_order_number",
            columnNames: ["order_number"],
          }),
        ],
        foreignKeys: [
          // Historical orders must be kept even if a customer account is
          // removed, so user deletion is restricted, not cascaded.
          new TableForeignKey({
            name: "FK_orders_user",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("orders");
  }
}