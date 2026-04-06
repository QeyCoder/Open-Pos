import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const items = await prisma.menuItem.findMany({ orderBy: { name: 'asc' } });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        // Handle bulk upload if it's an array
        if (Array.isArray(body.items)) {
            for (const item of body.items) {
                await prisma.menuItem.upsert({
                    where: { name: item.name || item['Item Name'] },
                    update: {
                        category: item.category || item['Category'] || 'General',
                        priceDineIn: parseFloat(item.priceDineIn || item['Price'] || 0),
                        priceDelivery: parseFloat(item.priceDelivery || item['Price'] || 0),
                        priceCorporate: parseFloat(item.priceCorporate || item['Price'] || 0),
                        taxRate: parseFloat(item.taxRate || item['Tax Rate'] || 0)
                    },
                    create: {
                        name: item.name || item['Item Name'],
                        category: item.category || item['Category'] || 'General',
                        priceDineIn: parseFloat(item.priceDineIn || item['Price'] || 0),
                        priceDelivery: parseFloat(item.priceDelivery || item['Price'] || 0),
                        priceCorporate: parseFloat(item.priceCorporate || item['Price'] || 0),
                        taxRate: parseFloat(item.taxRate || item['Tax Rate'] || 0)
                    }
                });
            }
            return NextResponse.json({ success: true, message: 'Menu Uploaded/Synced' });
        }

        // Single Item POST
        const item = await prisma.menuItem.upsert({
            where: { name: body.name },
            update: {
                category: body.category || 'General',
                priceDineIn: parseFloat(body.priceDineIn || 0),
                priceDelivery: parseFloat(body.priceDelivery || 0),
                priceCorporate: parseFloat(body.priceCorporate || 0),
                taxRate: parseFloat(body.taxRate || 0)
            },
            create: {
                name: body.name,
                category: body.category || 'General',
                priceDineIn: parseFloat(body.priceDineIn || 0),
                priceDelivery: parseFloat(body.priceDelivery || 0),
                priceCorporate: parseFloat(body.priceCorporate || 0),
                taxRate: parseFloat(body.taxRate || 0)
            }
        });
        return NextResponse.json({ success: true, item });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        await prisma.menuItem.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
