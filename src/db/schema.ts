import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  pgEnum,
  timestamp,
  unique,
  jsonb,
  index,
  boolean,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("role", ["USER", "ADMIN", "COURIER"]);
export const currency = pgEnum("currency", ["GEL", "USD", "EUR"]);
export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const paymentStatus = pgEnum("payment_status", ["PAID", "UNPAID"]);
export const deliveryStatus = pgEnum("delivery_status", [
  "ASSIGNED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    age: integer("age").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 255 }).notNull(),
    role: userRole("role").notNull().default("USER"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("users_email_unique").on(t.email)]
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("refresh_token_value_idx").on(t.token),
    unique("refresh_token_user_idx").on(t.userId, t.token),
  ]
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: jsonb("name").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("categories_slug_unique").on(t.slug),
    index("categories_parent_idx").on(t.parentId),
  ]
);

export const manufacturers = pgTable(
  "manufacturers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: jsonb("name").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("manufacturers_slug_unique").on(t.slug),
    index("manufacturers_slug_idx").on(t.slug),
  ]
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: jsonb("title").notNull(),
    description: jsonb("description").notNull(),
    shortDescription: jsonb("short_description").notNull(),

    slug: varchar("slug", { length: 255 }).notNull(),
    price: integer("price").notNull(),
    discountPrice: integer("discount_price"),
    currency: currency("currency").notNull(),

    countInStock: integer("count_in_stock").notNull().default(0),
    availability: boolean("availability").notNull().default(true),

    categoryId: uuid("category_id")
      .references(() => categories.id)
      .notNull(),
    manufacturerId: uuid("manufacturer_id")
      .references(() => manufacturers.id)
      .notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("products_slug_unique").on(t.slug),
    index("products_category_idx").on(t.categoryId),
    index("products_manufacturer_idx").on(t.manufacturerId),
    index("products_price_idx").on(t.price),
    index("products_availability_idx").on(t.availability),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    url: text("url").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("product_images_product_idx").on(t.productId),
    index("product_images_is_primary_idx").on(t.isPrimary),
  ]
);

export const productAttributes = pgTable(
  "product_attributes",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    key: jsonb("key").notNull(),
    value: jsonb("value").notNull(),
    keySlug: varchar("key_slug", { length: 255 }).notNull(),
  },
  (t) => [
    index("product_attributes_product_idx").on(t.productId),
    index("product_attributes_key_slug_idx").on(t.keySlug),
  ]
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("wishlists_user_product_idx").on(t.userId, t.productId),
    index("wishlists_user_idx").on(t.userId),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    quantity: integer("quantity").notNull().default(1),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("cart_user_product_unique").on(t.userId, t.productId),
    index("cart_user_idx").on(t.userId),
  ]
);

export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    rating: integer("rating").notNull(),
    comment: jsonb("comment").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("product_user_product_unique").on(t.userId, t.productId),
    index("review_product_idx").on(t.productId),
    index("review_rating_idx").on(t.rating),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    status: orderStatus("order_status").notNull().default("PENDING"),
    paymentStatus: paymentStatus("payment_status").notNull().default("UNPAID"),
    paymentMethod: text("payment_method").notNull(),

    totalPrice: integer("total_price").notNull(),
    currency: currency("currency").notNull().default("GEL"),

    address: jsonb("address").notNull(),

    couponId: uuid("coupon_id").references(() => coupons.id),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_payment_status_idx").on(t.paymentStatus),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    quantity: integer("quantity").notNull(),
    price: integer("price").notNull(),
  },
  (t) => [
    index("order_item_order_idx").on(t.orderId),
    index("order_item_product_idx").on(t.productId),
  ]
);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    code: varchar("code", { length: 50 }).notNull(),
    discountAmount: integer("discount_amount").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("coupons_code_unique").on(t.code),
    index("coupons_expires_at_idx").on(t.expiresAt),
    index("coupons_status_idx").on(t.isActive),
  ]
);

export const courierOrders = pgTable(
  "courier_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    courierId: uuid("courier_id")
      .notNull()
      .references(() => users.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),

    status: deliveryStatus("delivery_status").notNull().default("ASSIGNED"),
    trackingUrl: text("tracking_url"),
    mapLocation: text("map_location"),

    assignedAt: timestamp("assigned_at").defaultNow(),
  },
  (t) => [
    index("courier_orders_courier_idx").on(t.courierId),
    index("courier_order_order_idx").on(t.orderId),
    index("courier_order_status_idx").on(t.status),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    pdfUrl: text("pdf_url").notNull(),
    issuedAt: timestamp("issued_at").defaultNow(),
  },
  (t) => [unique("invoices_order_idx").on(t.orderId)]
);

export const wheelSales = pgTable(
  "wheel_sales",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    discountAmount: integer("discount_amount").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("wheel_sales_user_idx").on(t.userId),
    index("wheel_sales_date_idx").on(t.createdAt),
  ]
);

export const relatedProducts = pgTable(
  "related_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    relatedProductId: uuid("related_product_id")
      .notNull()
      .references(() => products.id),
  },
  (t) => [unique("related_products_unique").on(t.productId, t.relatedProductId)]
);

export const upsellProducts = pgTable(
  "upsell_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    upsellProductId: uuid("upsell_product_id")
      .notNull()
      .references(() => products.id),
  },
  (t) => [unique("upsell_products_unique").on(t.productId, t.upsellProductId)]
);

export const partnerCompanies = pgTable("partner_companies", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: jsonb("name").notNull(),
  description: jsonb("description").notNull(),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const featuredProducts = pgTable(
  "featured_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    isFeatured: boolean("is_featured").notNull().default(false),
    isLatest: boolean("is_latest").notNull().default(false),
    isBestDeal: boolean("is_best_deal").notNull().default(false),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("featured_product_idx").on(t.productId)]
);

export const bestSellers = pgTable(
  "best_sellers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    rank: uuid("rank").defaultRandom(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("best_sellers_product_unique").on(t.productId)]
);

export const productOfTheDay = pgTable(
  "product_of_the_day",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    date: timestamp("date").defaultNow(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("product_of_the_day_unique").on(t.date)]
);

export const compareProducts = pgTable(
  "compare_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique("compare_products_user_product_unique").on(t.userId, t.productId),
  ]
);
