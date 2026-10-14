import { ApiError, withApiSession } from "@/lib/api.server";
import { InventoryError } from "@/lib/inventory-error";

export function withInventorySession(
  request: Request,
  handler: Parameters<typeof withApiSession>[1],
) {
  return withApiSession(request, async (session) => {
    try {
      return await handler(session);
    } catch (error) {
      if (error instanceof InventoryError)
        throw new ApiError(
          error.code === "NOT_FOUND" ? 404 : 409,
          error.code,
          error.message,
        );
      throw error;
    }
  });
}
