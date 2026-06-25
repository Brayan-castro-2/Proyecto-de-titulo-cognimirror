const { Client } = require('pg');

const regions = [
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-central-1'
];

async function probe() {
  console.log("Probing Supabase poolers...");
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Trying ${region} (${host})...`);
    const client = new Client({
      host: host,
      port: 6543,
      database: 'postgres',
      user: 'postgres.hnbxhuqficktoaivrrqj',
      password: 'E0unkZXAaDHP0CEB',
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000
    });

    try {
      await client.connect();
      console.log(`SUCCESS! Connected successfully to region: ${region}`);
      await client.end();
      return region;
    } catch (err) {
      console.log(`Failed for ${region}: ${err.message}`);
    }
  }
  console.log("Probing complete. No region succeeded.");
}

probe();
