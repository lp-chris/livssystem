CREATE TYPE "public"."capture_status" AS ENUM('behandlet', 'feil', 'venter');--> statement-breakpoint
CREATE TYPE "public"."domain_name" AS ENUM('Meg', 'Oss', 'Stall', 'Hest');--> statement-breakpoint
CREATE TYPE "public"."library_type" AS ENUM('notat', 'sitat', 'bok', 'journal');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('aktiv', 'pause', 'fullført', 'avbrutt');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('prosjekt', 'område');--> statement-breakpoint
CREATE TYPE "public"."routine_time" AS ENUM('morgen', 'ettermiddag', 'kveld', 'når_som_helst');--> statement-breakpoint
CREATE TYPE "public"."routine_type" AS ENUM('daglig', 'tidsbegrenset');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('høy', 'normal', 'lav');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('åpen', 'gjort');--> statement-breakpoint
CREATE TABLE "captures" (
	"id" serial PRIMARY KEY NOT NULL,
	"ra_tekst" text NOT NULL,
	"tolket_json" jsonb,
	"rutet_til" jsonb,
	"status" "capture_status" DEFAULT 'venter' NOT NULL,
	"opprettet" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"navn" "domain_name" NOT NULL,
	"farge" text NOT NULL,
	"rekkefolge" integer NOT NULL,
	CONSTRAINT "domains_navn_unique" UNIQUE("navn")
);
--> statement-breakpoint
CREATE TABLE "library_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "library_type" NOT NULL,
	"domain_id" integer,
	"tittel" text,
	"innhold" text,
	"kilde" text,
	"tags" text[],
	"flagget_for_review" boolean DEFAULT false NOT NULL,
	"review_dato" date,
	"favoritt" boolean DEFAULT false NOT NULL,
	"opprettet" timestamp DEFAULT now() NOT NULL,
	"forfatter" text,
	"omslag_url" text,
	"lese_status" text,
	"format" text,
	"startet" date,
	"fullfort_dato" date,
	"rating" integer,
	"isbn" text,
	"sammendrag" text
);
--> statement-breakpoint
CREATE TABLE "library_thoughts" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"tekst" text NOT NULL,
	"opprettet" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"navn" text NOT NULL,
	"forfall" date,
	"fullfort" boolean DEFAULT false NOT NULL,
	"rekkefolge" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain_id" integer NOT NULL,
	"navn" text NOT NULL,
	"beskrivelse" text,
	"type" "project_type" DEFAULT 'prosjekt' NOT NULL,
	"status" "project_status" DEFAULT 'aktiv' NOT NULL,
	"start_date" date,
	"end_date" date,
	"opprettet" timestamp DEFAULT now() NOT NULL,
	"sist_rort_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"routine_id" integer NOT NULL,
	"dato" date NOT NULL,
	"fullfort" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain_id" integer,
	"navn" text NOT NULL,
	"beskrivelse" text,
	"tidspunkt" "routine_time" DEFAULT 'når_som_helst' NOT NULL,
	"klokkeslett" text,
	"type" "routine_type" DEFAULT 'daglig' NOT NULL,
	"varighet_dager" integer,
	"start_date" date NOT NULL,
	"send_varsel" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain_id" integer,
	"project_id" integer,
	"milestone_id" integer,
	"tittel" text NOT NULL,
	"notat" text,
	"prioritet" "task_priority" DEFAULT 'normal' NOT NULL,
	"forfall" date,
	"paminnelse_at" timestamp,
	"topp3" boolean DEFAULT false NOT NULL,
	"tilbakevendende_regel" text,
	"neste_forekomst" date,
	"status" "task_status" DEFAULT 'åpen' NOT NULL,
	"opprettet" timestamp DEFAULT now() NOT NULL,
	"fullfort_at" timestamp,
	"varslet_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_thoughts" ADD CONSTRAINT "library_thoughts_item_id_library_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."library_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_logs" ADD CONSTRAINT "routine_logs_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;