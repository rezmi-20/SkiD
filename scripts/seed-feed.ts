/**
 * Seeding Script for Community Feed
 * Run this script to add sample verified posts to your database.
 * Usage: npx tsx scripts/seed-feed.ts
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
  console.log("🔄 Starting community feed seed...");
  try {
    // 1. Fetch some users
    let users = await sql`SELECT id, role FROM users LIMIT 5`;
    
    let workerUserId: string;
    let clientUserId: string;

    const workerUser = users.find(u => u.role === "worker");
    const clientUser = users.find(u => u.role === "client");

    if (workerUser) {
      workerUserId = workerUser.id;
      console.log(`✅ Using existing worker: ${workerUserId}`);
    } else {
      // Create a dummy worker user
      console.log("➕ Creating dummy worker user...");
      const userRes = await sql`
        INSERT INTO users (email, password_hash, role)
        VALUES ('kassim.worker@direskill.com', 'dummy_hash', 'worker')
        RETURNING id
      `;
      workerUserId = userRes[0].id;
      
      // Create profile
      await sql`
        INSERT INTO worker_profiles (user_id, full_name, bio, skills, is_verified, district, hourly_rate)
        VALUES (
          ${workerUserId}, 
          'Kassim Ibrahim', 
          'Certified senior electrician with over 8 years of experience in domestic and commercial wiring.', 
          ARRAY['House Wiring', 'Distribution Board', 'Solar Inverter'], 
          true, 
          'Kezira', 
          250
        )
      `;
    }

    if (clientUser) {
      clientUserId = clientUser.id;
      console.log(`✅ Using existing client: ${clientUserId}`);
    } else {
      // Create a dummy client user
      console.log("➕ Creating dummy client user...");
      const userRes = await sql`
        INSERT INTO users (email, password_hash, role)
        VALUES ('betty.client@direskill.com', 'dummy_hash', 'client')
        RETURNING id
      `;
      clientUserId = userRes[0].id;

      // Create profile
      await sql`
        INSERT INTO client_profiles (user_id, full_name, is_verified)
        VALUES (${clientUserId}, 'Bethelhem Tesfaye', true)
      `;
    }

    // 2. Clear old community feed if any
    console.log("🧹 Cleaning up old community posts...");
    await sql`DELETE FROM community_comments`;
    await sql`DELETE FROM community_likes`;
    await sql`DELETE FROM community_flags`;
    await sql`DELETE FROM community_posts`;

    // 3. Insert sample posts
    console.log("➕ Inserting high-quality community posts...");
    const posts = [
      {
        userId: workerUserId,
        title: "How to avoid short circuits during heavy rain seasons in Dire Dawa",
        content: "With the rains starting, roof leaks and high humidity can easily seep into outdoor distribution boxes or exposed wiring. I highly recommend checking your junction boxes and seal them with IP65-rated silicon gel. Keep your main breaker dry!",
        category: "Electrical",
        likes: 12
      },
      {
        userId: workerUserId,
        title: "Simple fix for low water pressure in Kezira district",
        content: "If you are experiencing sudden low water pressure in Kezira, check your gate valve first. Often, sand and mineral deposits clog the inlet filters near the main meter. Turn off the water, unscrew the filter, clean it under running water, and re-install. It takes 5 minutes!",
        category: "Plumbing",
        likes: 8
      },
      {
        userId: clientUserId,
        title: "Looking for recommendations for a reliable house painter",
        content: "We are currently finishing our renovation project in Kezira. Need a professional painter who can handle textured finishes. Verified providers with reviews preferred. Please drop your recommendations or DM me!",
        category: "Painting",
        likes: 3
      },
      {
        userId: workerUserId,
        title: "DIY: Best way to patch drywall holes before painting",
        content: "Do not just slap putty on large drywall holes, it will crack and shrink. Use a mesh tape patch first. Apply three thin layers of joint compound, letting it dry completely and sanding between coats. The final coat should be feathered out by 6 inches for a seamless finish.",
        category: "DIY",
        likes: 15
      },
      {
        userId: clientUserId,
        title: "Urban gardening: Tips for growing tomatoes in small pots",
        content: "I started a small tomato garden on my balcony in Dire Dawa. The trick is deep watering in the early morning and adding eggshells to the soil to prevent blossom end rot. They love the sun here, but make sure they get some afternoon shade!",
        category: "Gardening",
        likes: 9
      }
    ];

    for (const post of posts) {
      await sql`
        INSERT INTO community_posts (user_id, title, content, category, likes_count)
        VALUES (${post.userId}, ${post.title}, ${post.content}, ${post.category}, ${post.likes})
      `;
    }

    console.log("✅ Community feed seeded successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
