import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

export interface OrderItem {
  product_id: string;
  name: string;
  brand?: string;
  image_url?: string;
  price: number;
  quantity: number;
  unit: string;
}

@Entity({ name: "orders" })
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 50 })
  order_number!: string;

  // Historical orders must survive customer account deletion
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ length: 150 })
  user_email!: string;

  @Column({ type: "jsonb" })
  items!: OrderItem[];

  @Column({ length: 100 })
  recipient_name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ type: "text" })
  delivery_address!: string;

  @Column({ length: 100 })
  area!: string;

  @Column({ length: 100 })
  city!: string;

  @Column({ length: 20 })
  delivery_zone!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  delivery_charge!: number;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  discount_amount!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  total_amount!: number;

  @Column({ length: 30 })
  payment_method!: string;

  @Column({ length: 30, default: "pending" })
  payment_status!: string;

  @Column({ length: 30, default: "pending" })
  order_status!: string;

  @Column({ type: "text", nullable: true })
  customer_note?: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at?: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  updated_at?: Date;
}