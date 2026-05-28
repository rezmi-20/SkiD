import { neon } from "@neondatabase/serverless";

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("NO DATABASE_URL");
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Dire Dawa base approx
    const baseLat = 9.61;
    const baseLng = 41.83;
    
    console.log("Updating null coordinates...");
    const result = await sql`
      UPDATE worker_profiles 
      SET 
        latitude = ${baseLat} + (random() * 0.04 - 0.02),
        longitude = ${baseLng} + (random() * 0.04 - 0.02)
      WHERE latitude IS NULL OR longitude IS NULL OR latitude = 0
      RETURNING id, full_name, latitude, longitude;
    `;
    
    console.log("Updated workers:", result.length);
  } catch (err) {
    console.error(err);
  }
}

run();
