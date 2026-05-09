const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

const newHash = "$2b$10$Lr8lPeAyH14DMMJsRLJuaeqZkDlQQfccTSHVRB49Brufyyon59VbO";
const email = "admin@dire-skill.com";

async function run() {
  try {
    await sql`UPDATE users SET password_hash = ${newHash} WHERE email = ${email}`;
    console.log("Password updated successfully for " + email);
  } catch (err) {
    console.error(err);
  }
}
run();
