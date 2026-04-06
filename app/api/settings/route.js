import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        let config = await prisma.storeConfig.findUnique({ where: { id: 1 } });
        if (!config) {
            config = await prisma.storeConfig.create({
                data: {
                    id: 1,
                    name: "Mom's Fresh Pot",
                    address: "Shop No 40, Global City Center, Sohna",
                    phone: "+91 9220763205",
                    tableCount: 10,
                    printerFont: "Inter",
                    printerBoldSize: 24,
                    upiIds: ""
                }
            });
        }
        
        // Convert upiIds string back to array if needed
        const upiList = config.upiIds ? config.upiIds.split(',').filter(x => x.trim()) : [];
        return NextResponse.json({ ...config, upiIds: upiList });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Handle upiIds as a string for SQLite
        const upiString = Array.isArray(body.upiIds) ? body.upiIds.filter(x => x.trim()).join(',') : (body.upiIds || "");

        const dataToSave = {
            name: body.name,
            address: body.address,
            phone: body.phone,
            gstin: body.gstin,
            logoUrl: body.logoUrl,
            primaryColor: body.primaryColor,
            fontFamily: body.fontFamily,
            upiIds: upiString,
            defaultUpiId: body.defaultUpiId || "",
            tableCount: parseInt(body.tableCount) || 10,
            printerType: body.printerType || "EPSON",
            printerInterface: body.printerInterface || "",
            printerApiKey: body.printerApiKey || "",
            printerFont: body.printerFont || "Inter",
            printerBoldSize: parseInt(body.printerBoldSize) || 24
        };

        const config = await prisma.storeConfig.upsert({
            where: { id: 1 },
            update: dataToSave,
            create: { id: 1, ...dataToSave }
        });
        
        // Return with array version for immediate UI update
        const upiList = config.upiIds ? config.upiIds.split(',').filter(x => x.trim()) : [];
        return NextResponse.json({ success: true, config: { ...config, upiIds: upiList } });
    } catch (error) {
        console.error("Settings Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
