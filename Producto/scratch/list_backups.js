const { createClient } = require('@supabase/supabase-js');

const prodUrl = "https://hnbxhuqficktoaivrrqj.supabase.co";
const prodKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYnhodXFmaWNrdG9haXZycnFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE1OTg0NCwiZXhwIjoyMDgyNzM1ODQ0fQ.UjBKBM5v3mlkcIhkP5lILdjtElQlk84HVFLZVD7uo5c";

const stagingUrl = "https://kvqeekjjdsaagqxhhdsg.supabase.co";
const stagingKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWVla2pqZHNhYWdxeGhoZHNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM3MTA4OCwiZXhwIjoyMDk3OTQ3MDg4fQ.6jgp0c0d7dFRsrHU4Od2AfElmNZO8j_Kyj_UKWPOUcQ";

async function listBackups(url, key, name) {
  console.log(`--- Listing backups in ${name} (${url}) ---`);
  const supabase = createClient(url, key);
  try {
    const { data: buckets, error: errBuckets } = await supabase.storage.listBuckets();
    if (errBuckets) {
      console.error("Error listing buckets:", errBuckets.message);
      return;
    }
    console.log("Available buckets:", buckets.map(b => b.name));

    const backupBucket = buckets.find(b => b.name === 'backups-clinicos');
    if (!backupBucket) {
      console.log("Bucket 'backups-clinicos' not found.");
      return;
    }

    const { data: files, error: errFiles } = await supabase.storage
      .from('backups-clinicos')
      .list('', { limit: 100 });

    if (errFiles) {
      console.error("Error listing files:", errFiles.message);
      return;
    }

    console.log(`Files in 'backups-clinicos' (${files.length}):`);
    files.forEach(f => {
      console.log(`- ${f.name} (size: ${f.metadata?.size || 'unknown'} bytes, created: ${f.created_at})`);
    });
  } catch (e) {
    console.error("Unexpected error:", e);
  }
}

async function run() {
  await listBackups(prodUrl, prodKey, "PRODUCTION");
  await listBackups(stagingUrl, stagingKey, "STAGING");
}

run();
