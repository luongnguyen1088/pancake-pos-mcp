
const { Client } = require('pg');
async function run() {
    const client = new Client({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/bigData'
    });
    try {
        await client.connect();
        const query = `
            SELECT 
                customer_name, 
                customer_phone, 
                total_price, 
                inserted_at,
                raw_payload->>'order_source' as source,
                (SELECT string_agg(COALESCE(item->'variation_info'->>'name', item->>'product_name'), ', ') 
                 FROM jsonb_array_elements(raw_payload->'items') AS item) as products
            FROM public.pos_orders 
            WHERE shop_id = 1290002634 
              AND inserted_at >= CURRENT_DATE
              AND (raw_payload->>'order_source')::int >= -1
            ORDER BY inserted_at DESC
        `;
        const res = await client.query(query);
        
        const summary = {
            count: res.rows.length,
            total_revenue: res.rows.reduce((sum, r) => sum + Number(r.total_price), 0),
            customers: res.rows
        };
        
        console.log(JSON.stringify(summary, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
