-- PostGIS + RLS Migration for Project SHIFT
-- Runs AFTER Prisma's initial schema migration

-- ============================================================
-- 1. ENABLE PostGIS EXTENSION
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- 2. ADD GEOGRAPHY COLUMNS TO meeting_points
-- ============================================================
ALTER TABLE meeting_points
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Spatial index for proximity queries
CREATE INDEX IF NOT EXISTS idx_meeting_points_location
  ON meeting_points USING GIST (location);

-- Trigger to auto-update geography column on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_meeting_point_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_meeting_point_location ON meeting_points;
CREATE TRIGGER trg_update_meeting_point_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON meeting_points
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_point_location();

-- ============================================================
-- 3. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_organizations ON organizations
  USING (id = current_setting('app.current_org_id', true));

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_users ON users
  USING (organization_id = current_setting('app.current_org_id', true));

-- Email Domains
ALTER TABLE email_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_email_domains ON email_domains
  USING (organization_id = current_setting('app.current_org_id', true));

-- Org Modules
ALTER TABLE org_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_org_modules ON org_modules
  USING (organization_id = current_setting('app.current_org_id', true));

-- Meeting Points
ALTER TABLE meeting_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_meeting_points ON meeting_points
  USING (organization_id = current_setting('app.current_org_id', true));

-- Rides
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_rides ON rides
  USING (organization_id = current_setting('app.current_org_id', true));

-- ESG Trip Logs
ALTER TABLE esg_trip_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_esg_trip_logs ON esg_trip_logs
  USING (organization_id = current_setting('app.current_org_id', true));

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_events ON events
  USING (organization_id = current_setting('app.current_org_id', true));

-- Partner Links
ALTER TABLE partner_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_partner_links ON partner_links
  USING (organization_id = current_setting('app.current_org_id', true));

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (organization_id = current_setting('app.current_org_id', true));
