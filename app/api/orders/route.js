import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateFilter = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        let query = {
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        };

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            query.where = {
                createdAt: {
                    gte: start,
                    lte: end
                }
            };
        } else if (dateFilter) {
            const startOfDay = new Date(dateFilter);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateFilter);
            endOfDay.setHours(23, 59, 59, 999);
            
            query.where = {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            };
        }

        const orders = await prisma.order.findMany(query);
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderNo, tableNo, subtotal, taxTotal, grandTotal, items } = body;

        if (!items || !items.length) {
            return NextResponse.json({ error: 'Cannot save an empty order' }, { status: 400 });
        }

        const billId = 'MFP-' + Math.floor(100000 + Math.random() * 900000).toString();

        const order = await prisma.order.create({
            data: {
                billId,
                orderNo: parseInt(orderNo),
                tableNo: String(tableNo || 'Takeaway'),
                subtotal: parseFloat(subtotal),
                taxTotal: parseFloat(taxTotal), 
                grandTotal: parseFloat(grandTotal),
                paymentType: String(body.paymentType || 'CASH'),
                cashPaid: parseFloat(body.cashPaid || 0),
                upiPaid: parseFloat(body.upiPaid || 0),
                changeReturned: parseFloat(body.changeReturned || 0),
                packagingCharge: parseFloat(body.packagingCharge || 0),
                customerName: body.customerName || null,
                customerPhone: body.customerPhone || null,
                deliveryAddress: body.deliveryAddress || null,
                upiUsed: body.upiUsed || null,
                items: {
                    create: items.map(item => ({
                        menuName: String(item.name || item.menuName),
                        price: parseFloat(item.price),
                        qty: parseInt(item.qty),
                        taxRate: parseFloat(item.taxRate || 0)
                    }))
                }
            },
            include: { items: true }
        });

        return NextResponse.json({ success: true, order });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const pin = searchParams.get('pin');

        if (pin !== process.env.MASTER_PIN) {
            return NextResponse.json({ error: 'Incorrect Admin PIN' }, { status: 403 });
        }

        await prisma.order.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
