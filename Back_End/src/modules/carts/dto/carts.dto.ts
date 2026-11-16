import { IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";

export class AddToCartDto {
  // Added for testing without Auth
  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @IsInt()
  @Min(1, { message: "Quantity must be greater than zero" })
  quantity!: number;
}

export class UpdateCartDto {
  @IsInt()
  @Min(1, { message: "Quantity must be greater than zero" })
  quantity!: number;
}