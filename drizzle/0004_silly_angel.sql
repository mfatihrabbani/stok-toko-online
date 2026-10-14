CREATE TYPE "public"."movement_direction" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(160) NOT NULL,
	"product_sku" varchar(80) DEFAULT '' NOT NULL,
	"direction" "movement_direction" NOT NULL,
	"quantity" integer NOT NULL,
	"stock_before" integer NOT NULL,
	"stock_after" integer NOT NULL,
	"note" varchar(300) DEFAULT '' NOT NULL,
	"request_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movements_user_request_unique" UNIQUE("user_id","request_id"),
	CONSTRAINT "movements_quantity_positive" CHECK ("stock_movements"."quantity" > 0),
	CONSTRAINT "movements_stock_nonnegative" CHECK ("stock_movements"."stock_before" >= 0 AND "stock_movements"."stock_after" >= 0),
	CONSTRAINT "movements_balance_valid" CHECK (("stock_movements"."direction" = 'in' AND "stock_movements"."stock_after"::bigint = "stock_movements"."stock_before"::bigint + "stock_movements"."quantity"::bigint) OR ("stock_movements"."direction" = 'out' AND "stock_movements"."stock_after"::bigint = "stock_movements"."stock_before"::bigint - "stock_movements"."quantity"::bigint))
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "movements_owned_product_fk" FOREIGN KEY ("product_id","user_id") REFERENCES "public"."products"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "movements_user_created_idx" ON "stock_movements" USING btree ("user_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "movements_product_created_idx" ON "stock_movements" USING btree ("product_id","user_id","created_at" DESC NULLS LAST);