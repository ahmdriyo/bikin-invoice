CREATE TABLE clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT, email TEXT, phone TEXT, address TEXT, npwp TEXT, created_at TEXT);
CREATE TABLE projects (id TEXT PRIMARY KEY, client_id TEXT, title TEXT, category TEXT, description TEXT, price_estimate INTEGER, deadline TEXT, status TEXT, created_at TEXT);
CREATE TABLE invoices (id TEXT PRIMARY KEY, number TEXT UNIQUE, client_id TEXT, project_id TEXT, items TEXT, subtotal INTEGER, discount_type TEXT, discount_value INTEGER, tax_mode TEXT, tax_value INTEGER, total INTEGER, termin TEXT, termin_dp TEXT, termin_pelunasan TEXT, termin_dp_custom INTEGER, termin_pelunasan_custom INTEGER, termin_details TEXT, payment_method TEXT, due_mode TEXT, due_date TEXT, issue_date TEXT, late_fee TEXT, extra_cost TEXT, notes TEXT, terms TEXT, template_id TEXT, status TEXT, invoice_kind TEXT, created_at TEXT);
CREATE TABLE contracts (id TEXT PRIMARY KEY, number TEXT UNIQUE, client_id TEXT, project_id TEXT, title TEXT, party1_name TEXT, party1_role TEXT, party2_name TEXT, party2_role TEXT, duration TEXT, revisi TEXT, warranty TEXT, materai INTEGER, sign_count INTEGER, witness_name TEXT, ip_rights TEXT, clauses TEXT, template_id TEXT, status TEXT, created_at TEXT);
CREATE TABLE settings (id TEXT PRIMARY KEY, data TEXT);
CREATE TABLE counters (year TEXT PRIMARY KEY, last_invoice_seq INTEGER, last_contract_seq INTEGER);

-- Seeder — Bikin Invoice v2 (sql.js) — sumber: src/db/defaultSeeder.ts → SQLite
-- Generated: 2026-09-09T03:48:23.548Z
-- Clients: 10, Projects: 8, Invoices: 12, Contracts: 6

-- Data inserts omitted (binary .db is source of truth, sql dump for schema only)
