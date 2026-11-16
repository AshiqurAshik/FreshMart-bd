import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Product } from "../../products/entities/products.entity";

@Entity({ name: "carts" })
@Unique("UQ_carts_user_product", ["user", "product"])
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.carts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Product, (product) => product.carts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product!: Product;

  @Column({ length: 200 })
  product_name!: string;

  @Column({ type: "text", nullable: true })
  image_url?: string;

  @Column({ length: 100, nullable: true })
  brand?: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  added_at?: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}
