import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "../../category/entities/category.entity";
import { Cart } from "../../carts/entities/carts.entity";

@Entity({ name: "products" })
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 200 })
    name!: string;

    @Column({ type: "uuid" })
    category_id!: string;

    @ManyToOne(() => Category, (category) => category.products, {
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "category_id" })
    category!: Category;

    @OneToMany(() => Cart, (cart) => cart.product)
    carts!: Cart[];

    @Column({ type: "varchar", length: 100, nullable: true })
    brand?: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "text", nullable: true })
    image_url?: string;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    price!: number;

    @Column({ type: "integer", default: 0 })
    stock!: number;

    @Column({ type: "varchar", length: 30 })
    unit!: string;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;

    @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    updated_at?: Date;
}
