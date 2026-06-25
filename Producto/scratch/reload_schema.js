const { Client } = require('pg');

const connectionString = "postgresql://postgres.hnbxhuqficktoaivrrqj:E0unkZXAaDHP0CEB@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

async function checkAndReload() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to production PostgreSQL database via Pooler.");

    // Check columns in pacientes
    const resPacientes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pacientes' AND column_name = 'grupo_id';
    `);
    console.log("pacientes.grupo_id exists:", resPacientes.rows.length > 0);
    if (resPacientes.rows.length === 0) {
      console.log("Adding grupo_id to pacientes...");
      await client.query("ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS grupo_id TEXT;");
    }

    // Check columns in sesiones_clinicas
    const resSesiones = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sesiones_clinicas' AND column_name = 'grupo_id';
    `);
    console.log("sesiones_clinicas.grupo_id exists:", resSesiones.rows.length > 0);
    if (resSesiones.rows.length === 0) {
      console.log("Adding grupo_id to sesiones_clinicas...");
      await client.query("ALTER TABLE sesiones_clinicas ADD COLUMN IF NOT EXISTS grupo_id TEXT;");
    }

    // Reload PostgREST schema cache
    console.log("Reloading PostgREST schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("PostgREST notified to reload schema.");

  } catch (err) {
    console.error("Error checking/reloading schema:", err);
  } finally {
    await client.end();
  }
}

checkAndReload();
