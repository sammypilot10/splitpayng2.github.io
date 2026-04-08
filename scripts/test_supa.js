const supabaseUrl = 'https://mdfixikuanonexmoztpw.supabase.co';

async function testSupabase() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, { method: 'GET' });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(text.substring(0, 50));
  } catch (err) {
    console.error(`💥 Fetch completely failed:`, err);
  }
}

testSupabase();
