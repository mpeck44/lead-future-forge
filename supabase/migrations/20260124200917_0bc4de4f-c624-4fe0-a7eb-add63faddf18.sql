-- Add implementation tracking columns to portfolio_items
ALTER TABLE portfolio_items 
ADD COLUMN used_in_district boolean DEFAULT false,
ADD COLUMN used_at timestamptz;