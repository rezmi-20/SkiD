import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function seedNotifications() {
  console.log("Seeding realistic notifications matching reference UI...");

  const users = await sql`SELECT id, role, email FROM users LIMIT 10`;
  if (users.length === 0) return;

  const now = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  for (const user of users) {
    const isWorker = user.role === "worker";

    const samples = [
      {
        userId: user.id,
        type: "job_status_update",
        title: isWorker ? "Next booking on April 27" : "Artisan scheduled for April 27",
        body: isWorker 
          ? "You have a confirmed electrical installation booking in Kebele 02 on April 27, 2026."
          : "Your booking with Certified Electrician in Kebele 02 is scheduled for April 27, 2026.",
        linkHref: isWorker ? "/worker/jobs" : "/client/dashboard",
        isRead: false,
        createdAt: now.toISOString(),
      },
      {
        userId: user.id,
        type: "discount_promo",
        title: "Get 20% Fee Discount",
        body: isWorker
          ? "Complete 10 milestone-protected jobs this month and get 20% off platform service fees!"
          : "Book your next verified trade artisan and get 20% off DireSkill Milestone Protection!",
        linkHref: isWorker ? "/worker/gigs" : "/client/search",
        isRead: false,
        createdAt: now.toISOString(),
      },
      {
        userId: user.id,
        type: "payment_confirmed",
        title: isWorker ? "Milestone 1 Funded: 4,500 ETB" : "Milestone Deposit Successful",
        body: isWorker
          ? "Client has deposited 4,500 ETB into DireSkill Milestone Protection. Work is fully secured."
          : "Your deposit of 4,500 ETB for Plumbing & Sanitary is securely locked in Milestone Protection.",
        linkHref: isWorker ? "/worker/contracts" : "/client/contracts",
        isRead: true,
        createdAt: yesterday.toISOString(),
      },
      {
        userId: user.id,
        type: "new_review",
        title: "5-Star Review Received",
        body: "A client gave you 5 stars: 'Exceptional craftsmanship and punctual arrival. Highly recommended!'",
        linkHref: isWorker ? "/worker/profile" : "/client/profile",
        isRead: true,
        createdAt: fiveDaysAgo.toISOString(),
      }
    ];

    for (const item of samples) {
      const existing = await sql`
        SELECT id FROM notifications WHERE user_id = ${item.userId} AND title = ${item.title} LIMIT 1
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO notifications (user_id, type, title, body, link_href, is_read, created_at)
          VALUES (${item.userId}, ${item.type}, ${item.title}, ${item.body}, ${item.linkHref}, ${item.isRead}, ${item.createdAt})
        `;
      }
    }
  }

  console.log("Notifications seeded successfully!");
}

seedNotifications().catch(console.error);
