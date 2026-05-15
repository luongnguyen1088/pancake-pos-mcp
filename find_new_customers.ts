
import { PancakePOS } from './pancake-pos-mcp/pancake_api.ts';

async function findNewCustomersToday() {
    const shopId = '1290002634'; // Shop BB
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startTimestamp = Math.floor(today.getTime() / 1000);

    console.log(`Checking orders since: ${today.toISOString()}`);

    try {
        // 1. Get all orders today
        // Note: The list API usually takes startDateTime/endDateTime
        const orders = await PancakePOS.listOrders({
            startDateTime: startTimestamp,
            page_size: 100,
            fields: ['id', 'order_code', 'bill_full_name', 'bill_phone_number', 'customer_id', 'inserted_at']
        });

        if (!orders || orders.length === 0) {
            console.log("No orders found today.");
            return;
        }

        console.log(`Found ${orders.length} orders today. Checking history...`);

        const newCustomers = [];

        for (const order of orders) {
            const customerId = order.customer_id;
            const phone = order.bill_phone_number;

            // Check if this customer had orders before today
            const history = await PancakePOS.listOrders({
                customer_id: customerId,
                endDateTime: startTimestamp - 1,
                page_size: 1
            });

            if (history.length === 0) {
                // Also check by phone if possible (Pancake doesn't always merge accounts)
                if (phone) {
                    const phoneHistory = await PancakePOS.listOrders({
                        search: phone,
                        endDateTime: startTimestamp - 1,
                        page_size: 1
                    });
                    if (phoneHistory.length === 0) {
                        newCustomers.push(order);
                    }
                } else {
                    newCustomers.push(order);
                }
            }
        }

        console.log("\n--- NEW CUSTOMERS TODAY ---");
        if (newCustomers.length === 0) {
            console.log("None of the customers today are brand new.");
        } else {
            newCustomers.forEach(c => {
                console.log(`- ${c.bill_full_name} (${c.bill_phone_number || 'No phone'}) | Order: ${c.order_code}`);
            });
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

findNewCustomersToday();
