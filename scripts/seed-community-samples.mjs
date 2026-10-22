import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

if (process.env.ALLOW_LIVE_COMMUNITY_SAMPLE_SEED !== "true") {
  throw new Error("Set ALLOW_LIVE_COMMUNITY_SAMPLE_SEED=true after confirming DATABASE_URL targets the live DireSkill database.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. The connection value is never printed by this script.");
}

const sql = neon(process.env.DATABASE_URL);
const [admin] = await sql`
  SELECT id
  FROM users
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1
`;

if (!admin) {
  throw new Error("No system admin user exists to own the DireSkill sample posts.");
}

const samplePosts = [
  {
    id: "d1750000-0000-4000-8000-000000000001",
    title: "DireSkill sample: Skilled trades at work",
    content: "A look at the hands-on work behind everyday repairs. Share a practical tip, ask a question, or show the result of a job you are proud of.",
    category: "DIY",
    mediaUrl: "/landing/skilled-workers-hero.jpg",
  },
  {
    id: "d1750000-0000-4000-8000-000000000002",
    title: "DireSkill sample: Planning a home improvement",
    content: "Starting a repair or renovation in Dire Dawa? Describe the work clearly, agree on the details before the job begins, and keep progress photos to share with the client.",
    category: "Painting",
    mediaUrl: "/images/diredawa_street.jpg",
  },
];

for (const post of samplePosts) {
  await sql`
    INSERT INTO community_posts (
      id, user_id, title, content, category, media_url,
      likes_count, flags_count, is_removed
    )
    VALUES (
      ${post.id}, ${admin.id}, ${post.title}, ${post.content},
      ${post.category}, ${post.mediaUrl}, 0, 0, false
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      category = EXCLUDED.category,
      media_url = EXCLUDED.media_url,
      is_removed = false
    WHERE community_posts.user_id = EXCLUDED.user_id
  `;
}

console.log(`Seeded ${samplePosts.length} clearly labeled DireSkill sample posts with site-hosted photos.`);
