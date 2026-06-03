-- Epic 4: credit_transactions ledger
DO $$ BEGIN
  CREATE TYPE credit_transaction_type AS ENUM ('bonus', 'charge', 'usage');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type credit_transaction_type NOT NULL,
  stripe_checkout_session_id text UNIQUE,
  stripe_event_id text UNIQUE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_created_idx
  ON credit_transactions (user_id, created_at DESC);
