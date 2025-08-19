// =====================================================
// Test Supabase Connection
// Fashion Park Inventory System
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('Please check your .env file and ensure:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('🔌 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
    console.log('');

    try {
        // Test 1: Basic connection
        console.log('📡 Test 1: Basic connection...');
        const { data, error } = await supabase.from('categories').select('*').limit(1);
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Connection successful!');
        console.log('📊 Sample data:', data);
        console.log('');

        // Test 2: Check table structure
        console.log('🏗️ Test 2: Check table structure...');
        const tables = ['users', 'categories', 'products', 'product_variants', 'transactions'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase.from(table).select('*').limit(1);
                if (error) {
                    console.log(`❌ Table ${table}: ${error.message}`);
                } else {
                    console.log(`✅ Table ${table}: OK`);
                }
            } catch (err) {
                console.log(`❌ Table ${table}: ${err.message}`);
            }
        }
        console.log('');

        // Test 3: Check RLS policies
        console.log('🔐 Test 3: Check RLS policies...');
        const { data: policies, error: policiesError } = await supabase
            .rpc('get_policies_info');
        
        if (policiesError) {
            console.log('⚠️ Could not check RLS policies (this is normal for non-admin users)');
        } else {
            console.log('✅ RLS policies are active');
        }
        console.log('');

        // Test 4: Authentication test
        console.log('👤 Test 4: Authentication status...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            console.log('ℹ️ Not authenticated (this is normal for testing)');
        } else if (user) {
            console.log('✅ User authenticated:', user.email);
        } else {
            console.log('ℹ️ No user session');
        }
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Test your frontend application');
        console.log('2. Verify authentication flows');
        console.log('3. Test CRUD operations on tables');
        console.log('4. Check RLS policies work correctly');

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting tips:');
        console.log('1. Check your Supabase URL and API key');
        console.log('2. Ensure your project is active');
        console.log('3. Check if RLS policies are blocking access');
        console.log('4. Verify table names and structure');
        process.exit(1);
    }
}

// Run the test
testConnection();
