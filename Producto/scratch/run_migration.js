const { Client } = require('pg');

const client = new Client({
  host: '2600:1f13:838:6e14:b337:ecad:8979:fd99',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'E0unkZXAaDHP0CEB',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  await client.connect();
  console.log("Connected to database. Executing migrations...");
  try {
    // 1. Agregar anotacion_clinica a sesiones_clinicas si no existe
    await client.query(`
      ALTER TABLE public.sesiones_clinicas 
      ADD COLUMN IF NOT EXISTS anotacion_clinica TEXT;
    `);
    console.log("Added column anotacion_clinica to sesiones_clinicas (if not exists).");

    // 2. Crear tabla evaluaciones_remotas si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.evaluaciones_remotas (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          id_paciente UUID REFERENCES public.pacientes(id) ON DELETE CASCADE NOT NULL,
          tipo_test TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          activo BOOLEAN DEFAULT true,
          grupo_id TEXT DEFAULT 'grupo_brayan',
          creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          expira_en TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log("Created table evaluaciones_remotas (if not exists).");

    // 3. Desactivar RLS en la tabla evaluaciones_remotas
    await client.query(`
      ALTER TABLE public.evaluaciones_remotas DISABLE ROW LEVEL SECURITY;
    `);
    console.log("Disabled ROW LEVEL SECURITY on evaluaciones_remotas.");

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
