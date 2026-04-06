import { NextResponse } from 'next/server';
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { prisma } from '@/app/lib/prisma';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        },
    });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const z_id = searchParams.get('z_id');
        const z_items = searchParams.get('z_items'); 
        const z_otp = searchParams.get('z_otp');
        const z_cust = searchParams.get('z_cust');
        const z_addr = searchParams.get('z_addr');
        const z_instr = searchParams.get('z_instr');

        const store = await prisma.storeConfig.findUnique({ where: { id: 1 } });
        
        console.log(`[POS] 🚀 Processing MASTER Delivery Order #${z_id}...`);

        const items = (z_items || "").split('|').map(p => decodeURIComponent(p).trim());
        
        if (items.length > 0) {
            // DEACTIVATED AUTO-PRINT TO SAVE PAPER
            console.log(`[POS] 📝 Delivery Preview Prepared for #${z_id || 'AUTO'}`);
        }
        
        // --- GHOST MODE SELF-DESTRUCT (Silent Tab) ---
        return new Response(`
            <html><body style="background:#000;color:#9fe870;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;font-weight:900;">
                <div style="text-align:center;">
                    <h1>DELIVERY SYNCED! ⚡</h1>
                    <p>Check your POS Dashboard Preview.</p>
                </div>
                <script>setTimeout(() => window.close(), 1500);</script>
            </body></html>`, { headers: { 'Content-Type': 'text/html' } });

    } catch (e) {
        return new Response(`<html><body>Error: ${e.message}</body></html>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
    }
}

export async function POST(request) {
    try {
        const body = await request.json(); 
        
        // --- Smart Hijacker Support (ZOMATO_RAW) ---
        if (body.type === 'ZOMATO_RAW') {
            const rawLines = (body.text || "").split('\n');
            const items = [];
            rawLines.forEach(l => {
                const m = l.trim().match(/^(\d+)\s+[x\-]?\s*(.+)/) || l.trim().match(/^(.+)\s+(\d+)$/);
                if (m) items.push({ name: m[2] || m[1], qty: parseInt(m[1] || m[2]) || 1, price: 0 });
            });
            body.items = items;
            body.type = 'ZOMATO';
        }

        const { type, items, orderNo, tableNo, grandTotal, upiId, duration, billId, subtotal, taxTotal, otp } = body;
        const store = await prisma.storeConfig.findUnique({ where: { id: 1 } });
        
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        };

        if (!store.printerInterface) {
            return NextResponse.json({ error: 'Printer not configured' }, { headers, status: 400 });
        }

        // --- OPTION A: Remote Pi Server ---
        if (store.printerInterface && store.printerInterface.startsWith('http')) {
            if (store.printerApiKey) {
                let textContent = "";
                const LINE_WIDTH = 42; 
                const separator = "-".repeat(LINE_WIDTH) + "\n";

                if (type === 'KOT') {
                    textContent += `--- KOT ORDER #${orderNo} ---\n`;
                    textContent += `Table: ${tableNo || 'N/A'} [Started: ${duration}m ago]\n`;
                    textContent += separator;
                    items.forEach(i => { textContent += `${i.qty.toString().padEnd(3)} x ${i.name}\n`; });
                } else if (type === 'ZOMATO' || type === 'ZOMATO_RAW') {
                    // --- ZOMATO DELIVERY KOT (Branded) ---
                    textContent += `\n==== ZOMATO DELIVERY ====\n`;
                    textContent += `ORDER ID: ${orderNo || 'AUTO'}\n`;
                    if (otp) textContent += `DELIVERY OTP: ${otp}\n`;
                    textContent += `\nITEMS:\n`;
                    textContent += separator;
                    items.forEach(i => {
                        textContent += `${i.qty.toString().padEnd(3)} x ${i.name.toUpperCase()}\n`;
                    });
                    textContent += separator;
                    textContent += `\nPAID ONLINE - PACK FOR DELIVERY\n`;
                } else {
                    // ── HEADER ──────────
                    textContent += `${store.name}\n`;
                    textContent += `${store.address}\n`;
                    if (store.phone) textContent += `Tel: ${store.phone}\n`;
                    textContent += separator;

                    // ── ORDER INFO ──────
                    const orderStr = `Order #${orderNo} | ${tableNo || 'Takeaway'}`;
                    const idStr = `ID: ${billId || 'PENDING'}`;
                    textContent += orderStr.padEnd(LINE_WIDTH - idStr.length) + idStr + "\n";
                    
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                    textContent += `Date: ${dateStr}, ${timeStr}\n`;
                    textContent += separator;

                    // ── ITEMS TABLE ─────
                    textContent += `Item               Qty            Price\n`;
                    textContent += separator;
                    items.forEach(i => {
                        const nameLine = i.name.substring(0, 21).padEnd(22);
                        const qty = i.qty.toString().padStart(4);
                        const price = (i.price * i.qty).toFixed(2).padStart(16);
                        textContent += `${nameLine}${qty}${price}\n`;
                        if (i.taxRate > 0) {
                            textContent += ` - D (${i.taxRate.toFixed(1)}% Tax)\n`;
                        }
                    });
                    textContent += separator;

                    // ── TOTALS ──────────
                    const subLabel = "Subtotal:";
                    textContent += subLabel.padEnd(LINE_WIDTH - (subtotal || 0).toFixed(2).length - 4) + `Rs. ${(subtotal || 0).toFixed(2)}\n`;
                    const gstLabel = "Total GST:";
                    textContent += gstLabel.padEnd(LINE_WIDTH - (taxTotal || 0).toFixed(2).length - 4) + `Rs. ${(taxTotal || 0).toFixed(2)}\n`;
                    textContent += separator;
                    const grandLabel = "Grand Total:";
                    textContent += grandLabel.padEnd(LINE_WIDTH - (grandTotal || 0).toFixed(2).length - 4) + `Rs. ${(grandTotal || 0).toFixed(2)}\n`;
                    textContent += separator;
                }

                const printQr = (type === 'BILL' && (grandTotal || 0) > 0);
                const finalUpiId = upiId || store.defaultUpiId || "9220763205@paytm"; 

                // --- 1. BILLING SECTION ---
                await fetch(`${store.printerInterface}/print/text`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': store.printerApiKey },
                    body: JSON.stringify({ text: textContent, align: 'CENTER', bold: true, cut: false })
                });

                // --- 2. PAYMENT SECTION ---
                if (printQr) {
                    const upiUri = `upi://pay?pa=${finalUpiId}&pn=${store.name}&am=${(grandTotal || 0).toFixed(2)}&cu=INR`;
                    await fetch(`${store.printerInterface}/print/qr`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': store.printerApiKey },
                        body: JSON.stringify({ 
                            data: upiUri, 
                            label: `Scan to pay with UPI`, 
                            size: 14, 
                            lineAfter: true, 
                            cut: false 
                        })
                    });
                }

                // --- 3. FAREWELL SECTION ---
                if (type === 'BILL' || type === 'TOKEN') {
                    const footerTxt = `\nThank you for choosing\n${store.name}!\nPlease visit again.\n`;
                    await fetch(`${store.printerInterface}/print/text`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': store.printerApiKey },
                        body: JSON.stringify({ text: footerTxt, align: 'CENTER', bold: true, cut: true })
                    });
                } else if (type === 'KOT') {
                    await fetch(`${store.printerInterface}/print/text`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': store.printerApiKey },
                        body: JSON.stringify({ text: "\n", cut: true })
                    });
                }
                
                return NextResponse.json({ success: true }, { headers });
            }
            return NextResponse.json({ success: true }, { headers });
        }

        return NextResponse.json({ success: true }, { headers });

    } catch (error) {
        console.error("[CRITICAL ERROR]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
