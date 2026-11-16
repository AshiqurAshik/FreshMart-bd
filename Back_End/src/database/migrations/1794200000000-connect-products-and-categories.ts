import { MigrationInterface, QueryRunner } from "typeorm";

export class ConnectProductsAndCategories1794200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed approved standard categories if not already present
    await queryRunner.query(`
      INSERT INTO "category" ("name", "description")
      SELECT 'Fruits', 'Fresh organic and local fruits'
      WHERE NOT EXISTS (SELECT 1 FROM "category" WHERE LOWER(TRIM("name")) = 'fruits');
    `);

    await queryRunner.query(`
      INSERT INTO "category" ("name", "description")
      SELECT 'Groceries', 'Daily grocery essentials and pantry items'
      WHERE NOT EXISTS (SELECT 1 FROM "category" WHERE LOWER(TRIM("name")) = 'groceries');
    `);

    await queryRunner.query(`
      INSERT INTO "category" ("name", "description")
      SELECT 'Snacks', 'Packaged snacks, beverages, and confectionery'
      WHERE NOT EXISTS (SELECT 1 FROM "category" WHERE LOWER(TRIM("name")) = 'snacks');
    `);

    await queryRunner.query(`
      INSERT INTO "category" ("name", "description")
      SELECT 'Household Essentials', 'Daily household necessities including cleaning supplies, detergents, tissue paper and personal care products'
      WHERE NOT EXISTS (SELECT 1 FROM "category" WHERE LOWER(TRIM("name")) = 'household essentials');
    `);

    // 2. Add category_id UUID column to products (nullable initially for data migration)
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "category_id" uuid;
    `);

    // 3. Migrate existing category data by matching category names (case-insensitive)
    await queryRunner.query(`
      UPDATE "products" p
      SET "category_id" = c."id"
      FROM "category" c
      WHERE LOWER(TRIM(p."category")) = LOWER(TRIM(c."name"))
        AND p."category_id" IS NULL;
    `);

    // 4. Verify no unmatched records remain before setting NOT NULL
    const unmatched = await queryRunner.query(`
      SELECT "id", "name", "category"
      FROM "products"
      WHERE "category_id" IS NULL;
    `);

    if (unmatched.length > 0) {
      throw new Error(
        `Migration aborted: Found ${unmatched.length} product(s) with unmatched category: ` +
          JSON.stringify(unmatched),
      );
    }

    // 5. Make category_id NOT NULL
    await queryRunner.query(`
      ALTER TABLE "products"
      ALTER COLUMN "category_id" SET NOT NULL;
    `);

    // 6. Add Foreign Key with ON DELETE RESTRICT
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD CONSTRAINT "FK_products_category"
      FOREIGN KEY ("category_id")
      REFERENCES "category"("id")
      ON DELETE RESTRICT;
    `);

    // 7. Drop the old varchar category column after successful verification
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN "category";
    `);

    // 8. Add approved CHECK constraints for carts and orders if not present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_carts_price') THEN
          ALTER TABLE "carts" ADD CONSTRAINT "CHK_carts_price" CHECK ("price" >= 0);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_carts_quantity') THEN
          ALTER TABLE "carts" ADD CONSTRAINT "CHK_carts_quantity" CHECK ("quantity" > 0);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_orders_subtotal') THEN
          ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_subtotal" CHECK ("subtotal" >= 0);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_orders_delivery_charge') THEN
          ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_delivery_charge" CHECK ("delivery_charge" >= 0);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_orders_discount_amount') THEN
          ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_discount_amount" CHECK ("discount_amount" >= 0);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CHK_orders_total_amount') THEN
          ALTER TABLE "orders" ADD CONSTRAINT "CHK_orders_total_amount" CHECK ("total_amount" >= 0);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove CHECK constraints
    await queryRunner.query(`
      ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "CHK_carts_price";
      ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "CHK_carts_quantity";
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "CHK_orders_subtotal";
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "CHK_orders_delivery_charge";
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "CHK_orders_discount_amount";
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "CHK_orders_total_amount";
    `);

    // 2. Re-add category column
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN "category" varchar(50);
    `);

    // 3. Populate category name back from category table
    await queryRunner.query(`
      UPDATE "products" p
      SET "category" = LOWER(c."name")
      FROM "category" c
      WHERE p."category_id" = c."id";
    `);

    // 4. Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "FK_products_category";
    `);

    // 5. Drop category_id column
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "category_id";
    `);
  }
}
