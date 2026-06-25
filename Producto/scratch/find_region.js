const { Client } = require('pg');

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'sa-east-1', 'ca-central-1',
  'eu-west-1', 'eu-west-2', 'eu-west-3',
  'eu-central-1', 'eu-central-2', 'eu-north-1',
  'ap-southeast-1', 'ap-southeast-2',
  'ap-northeast-1', 'ap-northeast-2', 'ap-south-1'
];

async function probe() {
  console.log("Probing all Supabase regions...");
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const client = new Client({
      host: host,
      port: 6543,
      database: 'postgres',
      user: 'postgres.hnbxhuqficktoaivrrqj',
      password: 'E0unkZXAaDHP0CEB',
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
      console.log(`\n>>> SUCCESS! CONNECTED to region: ${region} <<<\n`);
      await client.end();
      return;
    } catch (err) {
      // If it connected but threw auth/tenant error, it means we hit the pooler but it's the wrong region or wrong ref
      if (err.message.includes("tenant/user") || err.message.includes("not found")) {
        console.log(`${region}: Pooler reached, but tenant not found.`);
      } else {
        console.log(`${region}: ${err.message}`);
      }
    }
  }
}

probe();
