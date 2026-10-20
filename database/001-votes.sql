CREATE TABLE IF NOT EXISTS gpu_legends_votes (
  operation_id UUID PRIMARY KEY,
  election_id TEXT NOT NULL,
  voter_id UUID NOT NULL,
  candidate_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  CONSTRAINT gpu_legends_election_voter_unique UNIQUE (election_id, voter_id)
);

CREATE INDEX IF NOT EXISTS gpu_legends_election_candidate_idx
  ON gpu_legends_votes (election_id, candidate_id);
