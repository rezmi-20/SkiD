import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing.");
}

const sql = neon(process.env.DATABASE_URL);

const INITIAL_CATEGORIES = [
  { slug: "electrician", nameEn: "Electrician", nameAm: "ኤሌክትሪክ ባለሙያ", nameOm: "Ogeessa Elektiriikii", description: "Home & commercial wiring, breakers, lighting, and electrical repairs", sortOrder: 1 },
  { slug: "plumber", nameEn: "Plumber", nameAm: "የውሃ ቧንቧ ባለሙያ", nameOm: "Ogeessa Ujummoo Bishaanii", description: "Pipe installation, leak repairs, fixtures, and sanitation systems", sortOrder: 2 },
  { slug: "painter", nameEn: "Painter", nameAm: "ቀለም ቀቢ", nameOm: "Halluu Dibaa", description: "Interior & exterior wall painting, decorative coats, and waterproofing", sortOrder: 3 },
  { slug: "satellite_installer", nameEn: "Satellite Dish Installer", nameAm: "የሳተላይት ዲሽ ተካይ", nameOm: "Teessisaa Saatalaayitii Dishii", description: "Dish mounting, LNB alignment, receiver tuning, and coaxial cabling", sortOrder: 4 },
  { slug: "house_finishing", nameEn: "House Finishing", nameAm: "የቤት ማጠናቀቂያ ባለሙያ", nameOm: "Xumura Manaa", description: "Gypsum ceiling, tiling, plastering, and interior finishing carpentry", sortOrder: 5 },
];

const INITIAL_ZONES = [
  { slug: "kezira", nameEn: "Kezira", nameAm: "ቀዚራ", nameOm: "Keziraa", centerLat: 9.5931, centerLng: 41.8596, radiusKm: 2.5, sortOrder: 1 },
  { slug: "gende-kore", nameEn: "Gende Kore", nameAm: "ገንደ ቆሬ", nameOm: "Ganda Qoree", centerLat: 9.5885, centerLng: 41.8712, radiusKm: 2.5, sortOrder: 2 },
  { slug: "sabian", nameEn: "Sabian", nameAm: "ሳቢያን", nameOm: "Saabiyaan", centerLat: 9.6052, centerLng: 41.8424, radiusKm: 3.0, sortOrder: 3 },
  { slug: "megala", nameEn: "Megala", nameAm: "መጋላ", nameOm: "Magaalaa", centerLat: 9.5844, centerLng: 41.8638, radiusKm: 2.0, sortOrder: 4 },
  { slug: "dechatu", nameEn: "Dechatu", nameAm: "ደቻቱ", nameOm: "Dachatuu", centerLat: 9.5912, centerLng: 41.8668, radiusKm: 2.2, sortOrder: 5 },
  { slug: "legehare", nameEn: "Legehare", nameAm: "ለገሐሬ", nameOm: "Laga Harree", centerLat: 9.6015, centerLng: 41.8565, radiusKm: 2.5, sortOrder: 6 },
  { slug: "addis-ketema", nameEn: "Addis Ketema", nameAm: "አዲስ ከተማ", nameOm: "Addis Katamaa", centerLat: 9.5978, centerLng: 41.8475, radiusKm: 2.5, sortOrder: 7 },
  { slug: "shinile", nameEn: "Shinile", nameAm: "ሽኒሌ", nameOm: "Shiniillee", centerLat: 9.6833, centerLng: 41.8500, radiusKm: 5.0, sortOrder: 8 },
  { slug: "melka-jebdu", nameEn: "Melka Jebdu", nameAm: "መልካ ጀብዱ", nameOm: "Malkaa Jabduu", centerLat: 9.6194, centerLng: 41.7878, radiusKm: 4.5, sortOrder: 9 },
];

async function run() {
  console.log("Applying ratings moderation & master data migration...");

  await sql`
    ALTER TABLE ratings
      ADD COLUMN IF NOT EXISTS flag_reason text,
      ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS moderation_reason text,
      ADD COLUMN IF NOT EXISTS moderated_by uuid,
      ADD COLUMN IF NOT EXISTS moderated_at timestamp without time zone
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS rating_flagged_hidden_idx
      ON ratings (is_flagged, is_hidden, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS service_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug varchar(80) NOT NULL UNIQUE,
      name_en varchar(120) NOT NULL,
      name_am varchar(120),
      name_om varchar(120),
      description text,
      sort_order integer NOT NULL DEFAULT 0,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS service_categories_active_order_idx
      ON service_categories (is_active, sort_order)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS zones (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug varchar(80) NOT NULL UNIQUE,
      name_en varchar(120) NOT NULL,
      name_am varchar(120),
      name_om varchar(120),
      city varchar(80) NOT NULL DEFAULT 'Dire Dawa',
      center_lat double precision,
      center_lng double precision,
      radius_km double precision NOT NULL DEFAULT 3.0,
      sort_order integer NOT NULL DEFAULT 0,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp without time zone NOT NULL DEFAULT NOW(),
      updated_at timestamp without time zone NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS zones_active_order_idx
      ON zones (is_active, sort_order)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key varchar(100) PRIMARY KEY,
      value jsonb NOT NULL,
      updated_by uuid,
      updated_at timestamp without time zone NOT NULL DEFAULT NOW()
    )
  `;

  for (const cat of INITIAL_CATEGORIES) {
    await sql`
      INSERT INTO service_categories (slug, name_en, name_am, name_om, description, sort_order, is_active)
      VALUES (${cat.slug}, ${cat.nameEn}, ${cat.nameAm}, ${cat.nameOm}, ${cat.description}, ${cat.sortOrder}, true)
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  for (const zone of INITIAL_ZONES) {
    await sql`
      INSERT INTO zones (slug, name_en, name_am, name_om, city, center_lat, center_lng, radius_km, sort_order, is_active)
      VALUES (${zone.slug}, ${zone.nameEn}, ${zone.nameAm}, ${zone.nameOm}, 'Dire Dawa', ${zone.centerLat}, ${zone.centerLng}, ${zone.radiusKm}, ${zone.sortOrder}, true)
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  console.log("Migration complete.");
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
