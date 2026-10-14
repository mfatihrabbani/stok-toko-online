CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_id_user_unique" UNIQUE("id","user_id"),
	CONSTRAINT "categories_name_valid" CHECK (length(trim("categories"."name")) > 0 AND lower(trim("categories"."name")) NOT IN ('all', 'tanpa kategori'))
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_name_unique" ON "categories" USING btree ("user_id",lower("name"));--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owned_category_fk" FOREIGN KEY ("category_id","user_id") REFERENCES "public"."categories"("id","user_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
-- Preserve existing product categories while introducing owned category records.
INSERT INTO "categories" ("user_id", "name")
SELECT DISTINCT ON ("user_id", lower(trim("category"))) "user_id", trim("category")
FROM "products" WHERE lower(trim("category")) NOT IN ('', 'all', 'tanpa kategori')
ORDER BY "user_id", lower(trim("category")), trim("category");
--> statement-breakpoint
UPDATE "products" AS p SET "category_id" = c."id", "category" = c."name"
FROM "categories" AS c WHERE p."user_id" = c."user_id" AND lower(trim(p."category")) = lower(c."name");
--> statement-breakpoint
UPDATE "products" SET "category" = 'Tanpa kategori' WHERE "category_id" IS NULL;
