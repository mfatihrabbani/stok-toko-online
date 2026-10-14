import { Check, PackageX, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { stockStatus, type Product } from "@/lib/inventory";

export function StockStatus({
  product,
}: {
  product: Pick<Product, "stock" | "minStock">;
}) {
  const status = stockStatus(product);
  const Icon =
    status === "Aman" ? Check : status === "Habis" ? PackageX : TriangleAlert;
  return (
    <Badge
      variant={
        status === "Aman" ? "success" : status === "Habis" ? "empty" : "warning"
      }
    >
      <Icon aria-hidden="true" />
      {status}
    </Badge>
  );
}
