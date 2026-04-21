-- Postgres runs every .sql file in /docker-entrypoint-initdb.d/ ONCE on first container boot
-- Lines starting with -- are SQL comments

-- Enable the UUID generator extension so DEFAULT gen_random_uuid() works below
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Main table storing every payment attempt (APPROVED or DECLINED)
CREATE TABLE IF NOT EXISTS payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- auto-generated surrogate key
    order_id        VARCHAR(64) NOT NULL UNIQUE,                 -- UUID received from go-api via RabbitMQ
    amount          NUMERIC(10, 2) NOT NULL,                     -- total charged, up to 99,999,999.99
    currency        VARCHAR(3) NOT NULL DEFAULT 'GBP',           -- ISO currency code
    card_last_four  VARCHAR(4),                                  -- last 4 digits only (PCI-safe)
    status          VARCHAR(16) NOT NULL,                        -- 'APPROVED' or 'DECLINED'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()           -- when the row was inserted
);

-- Index helps fast lookups by order_id (used when auditing a specific order)
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
