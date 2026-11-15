import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding lively Dire Dawa community posts...");

  const users = await sql`
    SELECT id, role, email FROM users WHERE role IN ('worker', 'client', 'admin') LIMIT 10
  `;

  if (users.length === 0) {
    console.error("No users found to author posts.");
    return;
  }

  const workerUser = users.find(u => u.role === 'worker') || users[0];
  const clientUser = users.find(u => u.role === 'client') || users[0];
  const adminUser = users.find(u => u.role === 'admin') || users[0];

  const samplePosts = [
    {
      userId: workerUser.id,
      title: "Solar Water Heater & PEX Piping Completed in Kebele 02",
      content: "Just finalized a 300L rooftop solar thermal water heater installation with insulated PEX piping. Water pressure test held at 6.5 bar with zero leaks. For anyone in Dire Dawa facing hard water scale buildup, I highly recommend installing a sacrificial magnesium anode rod inside the primary tank every 18 months.",
      category: "Plumbing",
      mediaUrl: "/images/trades/plumber.jpg",
      likesCount: 28,
      usefulCount: 15,
      notUsefulCount: 1,
    },
    {
      userId: workerUser.id,
      title: "Clean Subpanel Rewiring & Surge Protection for Residential Villa",
      content: "Upgraded a 60A main breaker panel to a 125A distribution board with dual Type 2 surge protection devices (SPD) in Gende Kore. With local grid fluctuations, installing independent RCBOs for sensitive kitchen and inverter circuits protects high-value appliances from sudden drops.",
      category: "Electrical",
      mediaUrl: "/images/trades/electrician.jpg",
      likesCount: 45,
      usefulCount: 24,
      notUsefulCount: 0,
    },
    {
      userId: clientUser.id,
      title: "Multi-Satellite Ku-Band LNB Bracket Setup on Tile Roof",
      content: "Successfully aligned an 85cm offset dish with a dual-feed LNB bracket tracking Nilesat 7W and Eutelsat 8W. Signal quality reached 88% MER using our digital spectrum analyzer. Tip: always use weather-sealed compression F-connectors with UV-resistant coaxial cable to prevent rain moisture ingress.",
      category: "DIY",
      mediaUrl: "/images/trades/satellite-dish-installer.jpg",
      likesCount: 34,
      usefulCount: 19,
      notUsefulCount: 2,
    },
    {
      userId: workerUser.id,
      title: "Exterior Weatherproof Paint & Wall Texture for Dire Dawa Sun",
      content: "Applied three coats of UV-reflective acrylic emulsion paint over primer on an exterior facade in Sabian. In our high-temperature climate, priming with an alkali-resistant sealer is key to preventing chalking and micro-cracking along south-facing brick walls.",
      category: "Painting",
      mediaUrl: "/images/trades/painter.jpg",
      likesCount: 19,
      usefulCount: 11,
      notUsefulCount: 0,
    },
    {
      userId: workerUser.id,
      title: "Drywall Joint Finishing & Corner Bead Plastering Techniques",
      content: "Sharing our latest gypsum board partition project. Used fiberglass mesh tape for tapered joints and setting-type compound for the base layer, followed by two light skim coats. Sanded flat with 220-grit for a level 5 ultra-smooth surface ready for satin finish.",
      category: "DIY",
      mediaUrl: "/images/trades/house-finishing.jpg",
      likesCount: 39,
      usefulCount: 20,
      notUsefulCount: 1,
    },
    {
      userId: clientUser.id,
      title: "Custom Hardwood Workbench with Built-in Tool Organization",
      content: "Built a mobile heavy-duty artisan workbench from local eucalyptus and seasoned pine timbers. Features recessed t-tracks, 19mm dog holes for bench dogs, and dual-bearing locking casters. Great addition to any home workshop!",
      category: "DIY",
      mediaUrl: "/images/worker_workbench_hero.jpg",
      likesCount: 52,
      usefulCount: 31,
      notUsefulCount: 0,
    },
    {
      userId: adminUser.id,
      title: "DireSkill Milestone Protection: Best Practices for Field Work",
      content: "Reminder to all registered artisans and homeowners in Dire Dawa: Always confirm milestone completion within the app before finalizing phase handovers. Keep photos of your rough-in piping and electrical conduit runs for rapid dispute-free milestone approvals.",
      category: "DIY",
      mediaUrl: "/images/client_project_hero.jpg",
      likesCount: 67,
      usefulCount: 42,
      notUsefulCount: 1,
    }
  ];

  for (const post of samplePosts) {
    const existing = await sql`
      SELECT id FROM community_posts WHERE title = ${post.title} LIMIT 1
    `;

    if (existing.length === 0) {
      const res = await sql`
        INSERT INTO community_posts (user_id, title, content, category, media_url, likes_count, useful_count, not_useful_count, is_removed)
        VALUES (${post.userId}, ${post.title}, ${post.content}, ${post.category}, ${post.mediaUrl}, ${post.likesCount}, ${post.usefulCount}, ${post.notUsefulCount}, false)
        RETURNING id
      `;
      const postId = res[0].id;

      // Seed a couple of initial useful votes
      await sql`
        INSERT INTO community_post_votes (user_id, post_id, vote_type)
        VALUES (${post.userId}, ${postId}, 'useful')
        ON CONFLICT DO NOTHING
      `;

      // Seed a sample comment
      await sql`
        INSERT INTO community_comments (user_id, post_id, content)
        VALUES (${clientUser.id}, ${postId}, 'Excellent work! Appreciate the detailed technical tips for Dire Dawa conditions.')
        ON CONFLICT DO NOTHING
      `;

      console.log(`Inserted post: "${post.title}" (${postId})`);
    } else {
      console.log(`Post already exists: "${post.title}"`);
    }
  }

  console.log("Community seeding complete!");
}

seed().catch(console.error);
