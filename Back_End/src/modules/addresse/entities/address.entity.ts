import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity({ name: "addresses" })
@Index("idx_one_default_address", ["user_id"], {
    unique: true,
    where: '"is_default" = true',
})
export class Address {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid" })
    user_id!: string;

    @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "varchar", length: 100 })
    full_name!: string;

    @Column({ type: "varchar", length: 20 })
    phone!: string;

    @Column({ type: "text" })
    address_line!: string;

    @Column({ type: "varchar", length: 100 })
    area!: string;

    @Column({ type: "varchar", length: 100 })
    city!: string;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true,
    })
    postal_code!: string | null;

    @Column({ type: "varchar", length: 20 })
    delivery_zone!: string;

    @Column({ type: "boolean", default: false })
    is_default!: boolean;

    @CreateDateColumn({ type: "timestamptz" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updated_at!: Date;
}
