CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(160) NOT NULL,
	"sku" varchar(80) DEFAULT '' NOT NULL,
	"category" varchar(80) DEFAULT 'Tanpa kategori' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"unit" varchar(30) DEFAULT 'unit' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_id_user_unique" UNIQUE("id","user_id"),
	CONSTRAINT "products_stock_nonnegative" CHECK ("products"."stock" >= 0),
	CONSTRAINT "products_min_stock_nonnegative" CHECK ("products"."min_stock" >= 0),
	CONSTRAINT "products_name_nonempty" CHECK (length(trim("products"."name")) > 0)
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_user_name_idx" ON "products" USING btree ("user_id","name","id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_user_sku_unique" ON "products" USING btree ("user_id",lower("sku")) WHERE "products"."sku" <> '';