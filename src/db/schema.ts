import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  shortDescription: text('short_description'),
  fullDetails: text('full_details'),
  clientName: text('client_name'),
  completionDate: text('completion_date'),
  technologyStack: text('technology_stack'),
  websiteUrl: text('website_url'),
  githubUrl: text('github_url'),
  status: text('status'),
  category: text('category'),
  displayOrder: integer('display_order'),
  featured: boolean('featured').default(false),
  bannerImage: text('banner_image'),
  screenshots: text('screenshots'), // JSON string or comma separated
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
}));

export const portfoliosRelations = relations(portfolios, ({ one }) => ({
  author: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
}));

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  designation: text('designation'),
  rating: integer('rating').notNull(),
  text: text('text').notNull(),
  image: text('image'),
  status: text('status').default('active'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  service: text('service'),
  message: text('message'),
  source: text('source').default('contact_form'),
  status: text('status').default('new'), // new, contacted, resolved
  createdAt: timestamp('created_at').defaultNow(),
});

export const whatsappLeads = pgTable('whatsapp_leads', {
  id: serial('id').primaryKey(),
  phone: text('phone'),
  message: text('message'),
  status: text('status').default('new'),
  createdAt: timestamp('created_at').defaultNow(),
});
