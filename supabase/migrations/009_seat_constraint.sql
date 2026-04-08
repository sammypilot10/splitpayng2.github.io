-- supabase/migrations/009_seat_constraint.sql

-- Enforce strict database-level validation to prevent pools from overfilling 
-- beyond their maximum shareable seat limits due to race conditions.
-- This guarantees structural integrity at the lowest level.

ALTER TABLE pools 
ADD CONSTRAINT enforce_max_seats 
CHECK (current_seats <= max_seats);
