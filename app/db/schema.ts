import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, pgEnum, jsonb, uuid, integer, real, doublePrecision } from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  agentEnabled: boolean("agent_enabled").default(true).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  preferences: jsonb("preferences").default({}).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
export const integrationProviderEum = pgEnum("integration_provider", ["gmail", "google_calendar"]);
export const taskStatusEnum= pgEnum("task_status", [
    "pending",
    "completed",
    "cancelled",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
]);
export const agentRunStatusEnum = pgEnum("agent_run_status", [
    "running",
    "success",
    "failed",
]);


export const integrations = pgTable("integrations", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, {onDelete: "cascade"}).notNull(),
    provider: integrationProviderEum("provider").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    scope: text("scope").array().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, {onDelete: "cascade"}).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("pending").notNull(),
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date"),
    createdByAgent: boolean("created_by_agent").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export interface ActionLogEntry {
    emailId: string;
    subject: string;
    from: string;
    date: string;
    status: "success" | "error";
    summary?: string;
    priority?: string;
    category?: string;
    needsReply?: boolean;
    draftReply?: string | null;
    actionItems?: {
        title: string;
        description: string;
        dueDate?: string | null;
    }[];
    taskCreated?: number;
    draftCreated?: boolean;
    eventsCreated?: number;

}

export const agentRuns = pgTable("agent_runs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, {onDelete: "cascade"}).notNull(),
    status: agentRunStatusEnum("status").default("running").notNull(),
    summary: text("summary"),
    actionLog: jsonb("action_log").$type<ActionLogEntry[]>().default([]).notNull(),
    emailsProcessed: integer("emails_processed").default(0).notNull(),
    tasksCreated: integer("tasks_created").default(0).notNull(),
    draftsCreated: integer("drafts_created").default(0).notNull(),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    durationMs: integer("duration_ms"),
});

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;

export type ProcessedEmail = ActionLogEntry & { processedAt: Date };

// --- GraphMemory Tables ---

export const notes = pgTable("notes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(),
    content: text("content").default("").notNull(),
    tags: text("tags").array().default([]).notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => [
    index("notes_userId_idx").on(table.userId),
]);

export const chunks = pgTable("chunks", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    noteId: uuid("note_id").references(() => notes.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
}, (table) => [
    index("chunks_userId_idx").on(table.userId),
    index("chunks_noteId_idx").on(table.noteId),
]);

export const graphNodes = pgTable("graph_nodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    label: text("label").notNull(),
    type: text("type").default("concept").notNull(),
    noteId: uuid("note_id").references(() => notes.id, { onDelete: "set null" }),
    properties: jsonb("properties").default({}).notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("graph_nodes_userId_idx").on(table.userId),
    index("graph_nodes_label_idx").on(table.label),
]);

export const graphEdges = pgTable("graph_edges", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    sourceId: uuid("source_id").references(() => graphNodes.id, { onDelete: "cascade" }).notNull(),
    targetId: uuid("target_id").references(() => graphNodes.id, { onDelete: "cascade" }).notNull(),
    relation: text("relation").notNull(),
    weight: real("weight").default(1.0).notNull(),
    direction: text("direction").default("out").notNull(),
    confidence: real("confidence").default(1.0).notNull(),
    extractedBy: text("extracted_by").default("llm").notNull(),
    noteId: uuid("note_id").references(() => notes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("graph_edges_userId_idx").on(table.userId),
    index("graph_edges_sourceId_idx").on(table.sourceId),
    index("graph_edges_targetId_idx").on(table.targetId),
]);

export const wikiLinks = pgTable("wiki_links", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    sourceNoteId: uuid("source_note_id").references(() => notes.id, { onDelete: "cascade" }).notNull(),
    targetNoteId: uuid("target_note_id").references(() => notes.id, { onDelete: "cascade" }).notNull(),
}, (table) => [
    index("wiki_links_userId_idx").on(table.userId),
]);

export const nodeSimilarities = pgTable("node_similarities", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
    nodeAId: uuid("node_a_id").references(() => graphNodes.id, { onDelete: "cascade" }).notNull(),
    nodeBId: uuid("node_b_id").references(() => graphNodes.id, { onDelete: "cascade" }).notNull(),
    score: real("score").notNull(),
}, (table) => [
    index("node_similarities_userId_idx").on(table.userId),
]);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;

export type GraphNode = typeof graphNodes.$inferSelect;
export type NewGraphNode = typeof graphNodes.$inferInsert;

export type GraphEdge = typeof graphEdges.$inferSelect;
export type NewGraphEdge = typeof graphEdges.$inferInsert;