const { createClient } = require('@supabase/supabase-js');

const url = "https://kvqeekjjdsaagqxhhdsg.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWVla2pqZHNhYWdxeGhoZHNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM3MTA4OCwiZXhwIjoyMDk3OTQ3MDg4fQ.6jgp0c0d7dFRsrHU4Od2AfElmNZO8j_Kyj_UKWPOUcQ";

async function readBackup() {
  const supabase = createClient(url, key);
  const { data, error } = await supabase.storage
    .from('backups-clinicos')
    .download('backup-2026-06-25_10-43-18.json');

  if (error) {
    console.error("Error downloading backup:", error.message);
    return;
  }

  const text = await data.text();
  console.log("Backup file content:");
  console.log(text);
}

readBackup();
