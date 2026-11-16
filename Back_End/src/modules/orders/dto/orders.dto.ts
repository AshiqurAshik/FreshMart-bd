import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator";

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  address_id!: string;

  @IsOptional()
  @IsString()
  recipient_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  delivery_address?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsIn(["inside_dhaka", "outside_dhaka"], {
    message: "Delivery zone must be inside_dhaka or outside_dhaka",
  })
  delivery_zone?: string;

  @IsIn(["COD", "BKASH", "NAGAD"], {
    message: "Payment method must be COD, BKASH or NAGAD",
  })
  payment_method!: string;

  @IsOptional()
  @IsString()
  customer_note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;
}

export class UpdateStatusDto {
  @IsIn(
    [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    { message: "Invalid order status" },
  )
  order_status!: string;

  @IsOptional()
  @IsIn(["pending", "paid", "failed"], {
    message: "Invalid payment status",
  })
  payment_status?: string;
}