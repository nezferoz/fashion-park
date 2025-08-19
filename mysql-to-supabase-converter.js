// =====================================================
// MySQL to Supabase Data Converter
// Fashion Park Inventory System
// =====================================================

const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fashion_park',
    port: process.env.MYSQL_PORT || 3306
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    process.exit(1);
}

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createMySQLConnection() {
    try {
        return await mysql.createConnection(mysqlConfig);
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        throw error;
    }
}

async function convertData() {
    console.log('🔄 Starting MySQL to Supabase data conversion...');
    console.log('');

    let mysqlConnection;
    
    try {
        // Connect to MySQL
        console.log('📡 Connecting to MySQL...');
        mysqlConnection = await createMySQLConnection();
        console.log('✅ MySQL connected successfully');
        console.log('');

        // Convert data table by table
        await convertCategories(mysqlConnection);
        await convertProducts(mysqlConnection);
        await convertProductVariants(mysqlConnection);
        await convertUsers(mysqlConnection);
        await convertTransactions(mysqlConnection);
        await convertTransactionDetails(mysqlConnection);
        await convertCart(mysqlConnection);
        await convertStockMovements(mysqlConnection);
        await convertAddressData(mysqlConnection);

        console.log('🎉 Data conversion completed successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Verify data in Supabase Dashboard');
        console.log('2. Test your application with new data');
        console.log('3. Check RLS policies work correctly');

    } catch (error) {
        console.error('❌ Conversion failed:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting tips:');
        console.log('1. Check MySQL connection details');
        console.log('2. Ensure Supabase tables exist');
        console.log('3. Verify environment variables');
        console.log('4. Check table structure matches');
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('🔌 MySQL connection closed');
        }
    }
}

async function convertCategories(mysqlConnection) {
    console.log('📂 Converting categories...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM categories');
        
        if (rows.length === 0) {
            console.log('ℹ️ No categories to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('categories')
                .upsert({
                    category_id: row.category_id,
                    category_name: row.category_name,
                    description: row.description,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }, { onConflict: 'category_id' });

            if (error) {
                console.log(`⚠️ Category ${row.category_name}: ${error.message}`);
            } else {
                console.log(`✅ Category: ${row.category_name}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} categories`);
    } catch (error) {
        console.log(`❌ Categories conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertProducts(mysqlConnection) {
    console.log('📦 Converting products...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM products');
        
        if (rows.length === 0) {
            console.log('ℹ️ No products to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('products')
                .upsert({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    description: row.description,
                    price: row.price,
                    image_url: row.image_url,
                    category_id: row.category_id,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    is_active: row.is_active
                }, { onConflict: 'product_id' });

            if (error) {
                console.log(`⚠️ Product ${row.product_name}: ${error.message}`);
            } else {
                console.log(`✅ Product: ${row.product_name}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} products`);
    } catch (error) {
        console.log(`❌ Products conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertProductVariants(mysqlConnection) {
    console.log('🔧 Converting product variants...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM product_variants');
        
        if (rows.length === 0) {
            console.log('ℹ️ No product variants to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('product_variants')
                .upsert({
                    variant_id: row.variant_id,
                    product_id: row.product_id,
                    size: row.size,
                    stock_quantity: row.stock_quantity,
                    barcode: row.barcode,
                    sku: row.sku,
                    price_adjustment: row.price_adjustment || 0,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    is_active: row.is_active
                }, { onConflict: 'variant_id' });

            if (error) {
                console.log(`⚠️ Variant ${row.variant_id}: ${error.message}`);
            } else {
                console.log(`✅ Variant: ${row.size} for product ${row.product_id}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} product variants`);
    } catch (error) {
        console.log(`❌ Product variants conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertUsers(mysqlConnection) {
    console.log('👥 Converting users...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM users');
        
        if (rows.length === 0) {
            console.log('ℹ️ No users to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    user_id: row.user_id,
                    name: row.name,
                    email: row.email,
                    password: row.password,
                    phone: row.phone,
                    address: row.address,
                    province_id: row.province_id,
                    province_name: row.province_name,
                    city_id: row.city_id,
                    city_name: row.city_name,
                    district_id: row.district_id,
                    district_name: row.district_name,
                    village_id: row.village_id,
                    village_name: row.village_name,
                    postal_code: row.postal_code,
                    address_detail: row.address_detail,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    role: row.role,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    is_active: row.is_active
                }, { onConflict: 'user_id' });

            if (error) {
                console.log(`⚠️ User ${row.email}: ${error.message}`);
            } else {
                console.log(`✅ User: ${row.name} (${row.email})`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} users`);
    } catch (error) {
        console.log(`❌ Users conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertTransactions(mysqlConnection) {
    console.log('💳 Converting transactions...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM transactions');
        
        if (rows.length === 0) {
            console.log('ℹ️ No transactions to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('transactions')
                .upsert({
                    transaction_id: row.transaction_id,
                    transaction_code: row.transaction_code,
                    user_id: row.user_id,
                    cashier_id: row.cashier_id,
                    total_amount: row.total_amount,
                    discount: row.discount || 0,
                    final_amount: row.final_amount,
                    payment_method: row.payment_method,
                    payment_status: row.payment_status,
                    status: row.status || 'menunggu pembayaran',
                    waybill_number: row.waybill_number,
                    courier: row.courier,
                    payment_reference: row.payment_reference,
                    fee_amount: row.midtrans_fee || 0,
                    transaction_date: row.transaction_date,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }, { onConflict: 'transaction_id' });

            if (error) {
                console.log(`⚠️ Transaction ${row.transaction_code}: ${error.message}`);
            } else {
                console.log(`✅ Transaction: ${row.transaction_code}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} transactions`);
    } catch (error) {
        console.log(`❌ Transactions conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertTransactionDetails(mysqlConnection) {
    console.log('📋 Converting transaction details...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM transaction_details');
        
        if (rows.length === 0) {
            console.log('ℹ️ No transaction details to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('transaction_details')
                .upsert({
                    detail_id: row.detail_id,
                    transaction_id: row.transaction_id,
                    product_id: row.product_id,
                    variant_id: row.variant_id,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                    subtotal: row.subtotal,
                    created_at: row.created_at
                }, { onConflict: 'detail_id' });

            if (error) {
                console.log(`⚠️ Detail ${row.detail_id}: ${error.message}`);
            } else {
                console.log(`✅ Detail: ${row.detail_id} for transaction ${row.transaction_id}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} transaction details`);
    } catch (error) {
        console.log(`❌ Transaction details conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertCart(mysqlConnection) {
    console.log('🛒 Converting cart items...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM cart');
        
        if (rows.length === 0) {
            console.log('ℹ️ No cart items to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('cart')
                .upsert({
                    cart_id: row.cart_id,
                    user_id: row.user_id,
                    product_id: row.product_id,
                    variant_id: row.variant_id,
                    quantity: row.quantity,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }, { onConflict: 'cart_id' });

            if (error) {
                console.log(`⚠️ Cart item ${row.cart_id}: ${error.message}`);
            } else {
                console.log(`✅ Cart item: ${row.cart_id} for user ${row.user_id}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} cart items`);
    } catch (error) {
        console.log(`❌ Cart conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertStockMovements(mysqlConnection) {
    console.log('📊 Converting stock movements...');
    
    try {
        const [rows] = await mysqlConnection.execute('SELECT * FROM stock_movements');
        
        if (rows.length === 0) {
            console.log('ℹ️ No stock movements to convert');
            return;
        }

        for (const row of rows) {
            const { data, error } = await supabase
                .from('stock_movements')
                .upsert({
                    movement_id: row.movement_id,
                    product_id: row.product_id,
                    user_id: row.user_id,
                    movement_type: row.movement_type,
                    quantity: row.quantity,
                    notes: row.notes,
                    movement_date: row.movement_date,
                    created_at: row.created_at
                }, { onConflict: 'movement_id' });

            if (error) {
                console.log(`⚠️ Movement ${row.movement_id}: ${error.message}`);
            } else {
                console.log(`✅ Movement: ${row.movement_type} ${row.quantity} for product ${row.product_id}`);
            }
        }
        
        console.log(`✅ Converted ${rows.length} stock movements`);
    } catch (error) {
        console.log(`❌ Stock movements conversion failed: ${error.message}`);
    }
    console.log('');
}

async function convertAddressData(mysqlConnection) {
    console.log('📍 Converting address data...');
    
    try {
        // Convert provinces
        const [provinces] = await mysqlConnection.execute('SELECT * FROM provinces');
        if (provinces.length > 0) {
            for (const row of provinces) {
                await supabase.from('provinces').upsert({
                    province_id: row.province_id,
                    province_name: row.province_name,
                    created_at: row.created_at
                }, { onConflict: 'province_id' });
            }
            console.log(`✅ Converted ${provinces.length} provinces`);
        }

        // Convert cities
        const [cities] = await mysqlConnection.execute('SELECT * FROM cities');
        if (cities.length > 0) {
            for (const row of cities) {
                await supabase.from('cities').upsert({
                    city_id: row.city_id,
                    city_name: row.city_name,
                    province_id: row.province_id,
                    created_at: row.created_at
                }, { onConflict: 'city_id' });
            }
            console.log(`✅ Converted ${cities.length} cities`);
        }

        // Convert districts
        const [districts] = await mysqlConnection.execute('SELECT * FROM districts');
        if (districts.length > 0) {
            for (const row of districts) {
                await supabase.from('districts').upsert({
                    district_id: row.district_id,
                    district_name: row.district_name,
                    city_id: row.city_id,
                    created_at: row.created_at
                }, { onConflict: 'district_id' });
            }
            console.log(`✅ Converted ${districts.length} districts`);
        }

        // Convert villages
        const [villages] = await mysqlConnection.execute('SELECT * FROM villages');
        if (villages.length > 0) {
            for (const row of villages) {
                await supabase.from('villages').upsert({
                    village_id: row.village_id,
                    village_name: row.village_name,
                    district_id: row.district_id,
                    created_at: row.created_at
                }, { onConflict: 'village_id' });
            }
            console.log(`✅ Converted ${villages.length} villages`);
        }

        // Convert postal codes
        const [postalCodes] = await mysqlConnection.execute('SELECT * FROM postal_codes');
        if (postalCodes.length > 0) {
            for (const row of postalCodes) {
                await supabase.from('postal_codes').upsert({
                    postal_code_id: row.postal_code_id,
                    postal_code: row.postal_code,
                    village_id: row.village_id,
                    district_id: row.district_id,
                    city_id: row.city_id,
                    created_at: row.created_at
                }, { onConflict: 'postal_code_id' });
            }
            console.log(`✅ Converted ${postalCodes.length} postal codes`);
        }

    } catch (error) {
        console.log(`❌ Address data conversion failed: ${error.message}`);
    }
    console.log('');
}

// Run the conversion
if (require.main === module) {
    convertData();
}

module.exports = { convertData };
