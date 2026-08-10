require('dotenv').config();
const { client, isRedisConnected } = require('../config/redis');
const { clearCachePattern } = require('../middleware/cache');

async function testRedis() {
  console.log('--- REDIS DIAGNOSTIC TEST ---');
  
  try {
    await client.connect();
    
    // Wait slightly to allow 'ready' event to fire and set isRedisConnected flag
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Connection Status:', isRedisConnected() ? '✅ Connected' : '❌ Disconnected');

    if (isRedisConnected()) {
      // 1. Write Test
      console.log('Testing Write (SET)...');
      await client.set('test:key1', 'value1');
      await client.set('test:key2', 'value2');
      console.log('✅ Write successful');

      // 2. Read Test
      console.log('Testing Read (GET)...');
      const val1 = await client.get('test:key1');
      console.log(`Value for test:key1 = ${val1}`);
      if (val1 === 'value1') {
        console.log('✅ Read successful');
      } else {
        console.log('❌ Read mismatch');
      }

      // 3. TTL Test
      console.log('Testing TTL (SETEX)...');
      await client.setEx('test:ttl_key', 2, 'expiring_value');
      console.log('Value set with 2s TTL. Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      const expVal = await client.get('test:ttl_key');
      if (!expVal) {
        console.log('✅ TTL successful (value expired)');
      } else {
        console.log('❌ TTL failed (value still exists)');
      }

      // 4. SCAN & Eviction Test
      console.log('Testing SCAN Eviction (clearCachePattern)...');
      await client.set('jobs:1', 'job1');
      await client.set('jobs:2', 'job2');
      await client.set('other:1', 'other1');
      
      await clearCachePattern('jobs:*');
      
      const jobs1 = await client.get('jobs:1');
      const other1 = await client.get('other:1');
      
      if (!jobs1 && other1 === 'other1') {
        console.log('✅ SCAN Eviction successful (jobs:* cleared, other:* remained)');
      } else {
        console.log('❌ SCAN Eviction failed');
      }
      
      // Cleanup
      await client.del('test:key1');
      await client.del('test:key2');
      await client.del('other:1');
    }
  } catch (err) {
    console.error('Diagnostic Test Error:', err);
  } finally {
    console.log('Closing connections...');
    if (client.isOpen) {
      await client.quit();
    }
    process.exit(0);
  }
}

testRedis();
