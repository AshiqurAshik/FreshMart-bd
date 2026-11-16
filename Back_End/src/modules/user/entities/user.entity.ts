import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Address } from "../../addresse/entities/address.entity";
import { Cart } from "../../carts/entities/carts.entity";
import { Order } from "../../orders/entities/orders.entity";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    phone!: string;

    @Column({ name: "password_hash", type: "text", select: false })
    password_hash!: string;

    @Column({ name: "refresh_token_hash", type: "text", nullable: true, select: false })
    refresh_token_hash!: string | null;

    @Column({ default: "customer" })
    role!: string;

    @Column({ name: "account_status", default: "active" })
    account_status!: string;

    @OneToMany(() => Address, (address) => address.user)
    addresses!: Address[];

    @OneToMany(() => Cart, (cart) => cart.user)
    carts!: Cart[];

    @OneToMany(() => Order, (order) => order.user)
    orders!: Order[];

    @CreateDateColumn({ type: "timestamptz" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updated_at!: Date;
}
