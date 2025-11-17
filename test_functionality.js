import { createClient } from '@supabase/supabase-js';

// Load environment variables or use the ones from the existing validation script
const supabaseUrl = 'https://pgbefqzlrvjnsymigfmv.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVmcXpscnZqbnN5bWlnZm12Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTUyOTIxNCwiZXhwIjoyMDc3MTA1MjE0fQ.j2yBeWDSHmdESPjJx4thILjF_5Ft9fq7c3MqRKFwdwU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testFunctionality() {
  console.log('=== Testing POS System Critical Functionality ===\n');

  // Test 1: Check if products exist in the database
  console.log('1. Testing Product Catalog...');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching products:', error.message);
    } else if (products && products.length > 0) {
      console.log(`✅ Successfully fetched ${products.length} products from database`);
      console.log('   Sample products:', products.slice(0, 2).map(p => ({ id: p.id, name: p.name, price: p.price })));
    } else {
      console.log('⚠️  No products found in database');
    }
  } catch (err) {
    console.error('❌ Error in product test:', err.message);
  }

  // Test 2: Check if categories exist
  console.log('\n2. Testing Categories...');
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching categories:', error.message);
    } else if (categories && categories.length > 0) {
      console.log(`✅ Successfully fetched ${categories.length} categories from database`);
    } else {
      console.log('⚠️  No categories found in database');
    }
  } catch (err) {
    console.error('❌ Error in category test:', err.message);
  }

  // Test 3: Check if inventory batches exist
  console.log('\n3. Testing Inventory Batches...');
  try {
    const { data: batches, error } = await supabase
      .from('inventory_batches')
      .select('id, product_id, location_id, quantity')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching inventory batches:', error.message);
    } else {
      console.log(`✅ Successfully fetched ${batches.length} inventory batches from database`);
      if (batches.length > 0) {
        console.log('   Sample batches:', batches.slice(0, 2).map(b => ({ 
          id: b.id, 
          product_id: b.product_id, 
          location_id: b.location_id, 
          quantity: b.quantity 
        })));
      }
    }
  } catch (err) {
    console.error('❌ Error in inventory test:', err.message);
  }

  // Test 4: Check if users exist
  console.log('\n4. Testing Users...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching users:', error.message);
    } else if (users && users.length > 0) {
      console.log(`✅ Successfully fetched ${users.length} users from database`);
      console.log('   Sample users:', users.slice(0, 2).map(u => ({ 
        id: u.id, 
        name: u.name, 
        email: u.email,
        role: u.role 
      })));
    } else {
      console.log('⚠️  No users found in database');
    }
  } catch (err) {
    console.error('❌ Error in user test:', err.message);
  }

  // Test 5: Check if stores exist
  console.log('\n5. Testing Stores...');
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching stores:', error.message);
    } else if (stores && stores.length > 0) {
      console.log(`✅ Successfully fetched ${stores.length} stores from database`);
    } else {
      console.log('⚠️  No stores found in database');
    }
  } catch (err) {
    console.error('❌ Error in store test:', err.message);
  }

  console.log('\n=== Functionality Test Complete ===');
}

// Run the test
testFunctionality()
  .then(() => console.log('\n🎉 All tests completed!'))
  .catch(err => console.error('\n💥 Test suite failed:', err));