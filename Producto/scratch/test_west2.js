const { Client } = require('pg');

const connectionString = "postgresql://postgres.hnbxhuqficktoaivrrqj:E0unkZXAaDHP0CEB@aws-0-us-west-2.pooler.supabase.com:6543/postgres";

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("SUCCESSFULLY connected to us-west-2 database pooler!");

    console.log("Checking and adding columns if necessary...");
    await client.query("ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS grupo_id TEXT;");
    await client.query("ALTER TABLE sesiones_clinicas ADD COLUMN IF NOT EXISTS grupo_id TEXT;");
    await client.query("ALTER TABLE sesiones_clinicas ADD COLUMN IF NOT EXISTS anotacion_clinica TEXT;");
    console.log("Columns verified/added.");

    console.log("Reloading schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Schema cache reloaded successfully!");
  } catch (err) {
    console.error("Connection failed:", err.message || err);
  } finally {
    await client.end();
  }
}

run();
