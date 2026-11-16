import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/products.entity";

@Entity({ name: "category" })
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at?: Date;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at?: Date;
}
