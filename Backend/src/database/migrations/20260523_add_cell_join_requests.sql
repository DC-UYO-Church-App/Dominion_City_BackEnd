CREATE TABLE IF NOT EXISTS cell_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cell_group_id UUID NOT NULL REFERENCES cell_groups(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Only one pending request per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_cell_join_requests_user_pending
  ON cell_join_requests(user_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_cell_join_requests_cell_group
  ON cell_join_requests(cell_group_id, status);

CREATE INDEX IF NOT EXISTS idx_cell_join_requests_user
  ON cell_join_requests(user_id);
