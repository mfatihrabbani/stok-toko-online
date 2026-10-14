export class InventoryError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "INVALID_STOCK"
      | "SKU_EXISTS"
      | "CATEGORY_EXISTS"
      | "REQUEST_CONFLICT",
    message: string,
  ) {
    super(message);
  }
}
