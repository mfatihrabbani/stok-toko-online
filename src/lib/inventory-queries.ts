import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getSession } from "@/lib/session.server";
import { getInventory, getProduct } from "@/services/inventory.service.server";
import { inventoryIdSchema } from "@/validators/inventory";
import { listCategories } from "@/services/categories.service.server";
export const getCategoriesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession(getRequestHeaders() as Headers);
    if (!session) throw new Error("Masuk untuk membuka kategori.");
    return listCategories(session.user.id);
  },
);

export const getInventoryFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession(getRequestHeaders() as Headers);
    if (!session) throw new Error("Masuk untuk membuka persediaan.");
    return getInventory(session.user.id);
  },
);
export const getProductFn = createServerFn({ method: "GET" })
  .validator((id: string) => inventoryIdSchema.parse(id))
  .handler(async ({ data }) => {
    const session = await getSession(getRequestHeaders() as Headers);
    if (!session) throw new Error("Masuk untuk membuka persediaan.");
    return getProduct(session.user.id, data);
  });
