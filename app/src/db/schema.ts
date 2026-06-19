import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const domainNameEnum = pgEnum("domain_name", [
  "Meg",
  "Oss",
  "Stall",
  "Hest",
]);

export const projectTypeEnum = pgEnum("project_type", ["prosjekt", "område"]);

export const projectStatusEnum = pgEnum("project_status", [
  "aktiv",
  "pause",
  "fullført",
  "avbrutt",
]);

export const taskStatusEnum = pgEnum("task_status", ["åpen", "gjort"]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "høy",
  "normal",
  "lav",
]);

export const routineTimeEnum = pgEnum("routine_time", [
  "morgen",
  "ettermiddag",
  "kveld",
  "når_som_helst",
]);

export const routineTypeEnum = pgEnum("routine_type", [
  "daglig",
  "tidsbegrenset",
]);

export const libraryTypeEnum = pgEnum("library_type", [
  "notat",
  "sitat",
  "bok",
]);

export const captureStatusEnum = pgEnum("capture_status", [
  "behandlet",
  "feil",
  "venter",
]);

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  navn: domainNameEnum("navn").notNull().unique(),
  farge: text("farge").notNull(),
  rekkefølge: integer("rekkefolge").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id")
    .notNull()
    .references(() => domains.id),
  navn: text("navn").notNull(),
  beskrivelse: text("beskrivelse"),
  type: projectTypeEnum("type").notNull().default("prosjekt"),
  status: projectStatusEnum("status").notNull().default("aktiv"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  opprettet: timestamp("opprettet").notNull().defaultNow(),
  sistRørtAt: timestamp("sist_rort_at").notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  navn: text("navn").notNull(),
  forfall: date("forfall"),
  fullført: boolean("fullfort").notNull().default(false),
  rekkefølge: integer("rekkefolge").notNull().default(0),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => domains.id),
  projectId: integer("project_id").references(() => projects.id),
  milestoneId: integer("milestone_id").references(() => milestones.id),
  tittel: text("tittel").notNull(),
  notat: text("notat"),
  prioritet: taskPriorityEnum("prioritet").notNull().default("normal"),
  forfall: date("forfall"),
  påminnelseAt: timestamp("paminnelse_at"),
  topp3: boolean("topp3").notNull().default(false),
  tilbakevendendeRegel: text("tilbakevendende_regel"),
  nesteForekomst: date("neste_forekomst"),
  status: taskStatusEnum("status").notNull().default("åpen"),
  opprettet: timestamp("opprettet").notNull().defaultNow(),
  fullførtAt: timestamp("fullfort_at"),
});

export const routines = pgTable("routines", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").references(() => domains.id),
  navn: text("navn").notNull(),
  beskrivelse: text("beskrivelse"),
  tidspunkt: routineTimeEnum("tidspunkt").notNull().default("når_som_helst"),
  klokkeslett: text("klokkeslett"),
  type: routineTypeEnum("type").notNull().default("daglig"),
  varighetDager: integer("varighet_dager"),
  startDate: date("start_date").notNull(),
  sendVarsel: boolean("send_varsel").notNull().default(false),
});

export const routineLogs = pgTable("routine_logs", {
  id: serial("id").primaryKey(),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  dato: date("dato").notNull(),
  fullført: boolean("fullfort").notNull().default(false),
});

export const libraryItems = pgTable("library_items", {
  id: serial("id").primaryKey(),
  type: libraryTypeEnum("type").notNull(),
  tittel: text("tittel"),
  innhold: text("innhold"),
  kilde: text("kilde"),
  tags: text("tags").array(),
  flaggetForReview: boolean("flagget_for_review").notNull().default(false),
  reviewDato: date("review_dato"),
  favoritt: boolean("favoritt").notNull().default(false),
  opprettet: timestamp("opprettet").notNull().defaultNow(),
  forfatter: text("forfatter"),
  omslagUrl: text("omslag_url"),
  leseStatus: text("lese_status"),
  format: text("format"),
  startet: date("startet"),
  fullførtDato: date("fullfort_dato"),
  rating: integer("rating"),
  isbn: text("isbn"),
  sammendrag: text("sammendrag"),
});

export const libraryThoughts = pgTable("library_thoughts", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => libraryItems.id, { onDelete: "cascade" }),
  tekst: text("tekst").notNull(),
  opprettet: timestamp("opprettet").notNull().defaultNow(),
});

export const captures = pgTable("captures", {
  id: serial("id").primaryKey(),
  råTekst: text("ra_tekst").notNull(),
  tolketJson: jsonb("tolket_json"),
  rutetTil: jsonb("rutet_til"),
  status: captureStatusEnum("status").notNull().default("venter"),
  opprettet: timestamp("opprettet").notNull().defaultNow(),
});
