'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { Printer, Trash2, Utensils, Ticket, Settings, Upload, History, Lock, Search, Store, Plus, Minus } from 'lucide-react';
import Papa from 'papaparse';

export default function POSPage() {
    return (
        <Suspense fallback={<div>Loading POS...</div>}>
            <POSContent />
        </Suspense>
    );
}

function POSContent() {
    const searchParams = useSearchParams();
    const isDebug = searchParams.get('debug') === 'true';

    // Auth & View State
    const [authMatched, setAuthMatched] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [activeTab, setActiveTab] = useState('POS');

    // POS Cart & Table States
    const defaultTables = { 'Takeaway': [], 'Table 1': [], 'Table 2': [], 'Table 3': [], 'Table 4': [] };
    const [tables, setTables] = useState(defaultTables);
    const [tableTimers, setTableTimers] = useState({}); // Tracking start time per table
    const [activeTable, setActiveTable] = useState('Takeaway');
    const [orderNo, setOrderNo] = useState(1);
    const [zomatoOtp, setZomatoOtp] = useState('');

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [taxRate, setTaxRate] = useState(0);
    const [qty, setQty] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [menuMode, setMenuMode] = useState('DineIn'); // DineIn, Delivery, Corporate
    const [saveToMenu, setSaveToMenu] = useState(false);
    const [newItemCategory, setNewItemCategory] = useState('General');

    // Customer Info States
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    // Settlement States
    const [paymentType, setPaymentType] = useState('CASH'); // CASH, UPI, PARTIAL
    const [cashPaid, setCashPaid] = useState('');
    const [upiPaid, setUpiPaid] = useState('');
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [selectedUpiId, setSelectedUpiId] = useState('');

    // System Config States
    const [activePrint, setActivePrint] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [menuDb, setMenuDb] = useState([]);
    const [storeConfig, setStoreConfig] = useState({
        name: "Loading...",
        address: "",
        phone: "",
        gstin: "",
        logoUrl: "",
        primaryColor: "#9fe870",
        fontFamily: "Inter",
        upiIds: [],
        defaultUpiId: "",
        tableCount: 10,
        printerType: "EPSON",
        printerInterface: "",
        printerApiKey: ""
    });

    // History States
    const [historyData, setHistoryData] = useState([]);
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [reprintOrder, setReprintOrder] = useState(null);

    // ── UNIVERSAL DELIVERY PARSER (Full Proof) ─────────────────────────────
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [bulkOrderText, setBulkOrderText] = useState('');

    const parseAndImportDelivery = () => {
        if (!bulkOrderText.trim()) return;
        const lines = bulkOrderText.split('\n');
        const items = [];
        let detectedOrderNo = `ZOM-${Date.now().toString().slice(-6)}`;

        lines.forEach(line => {
            const clean = line.trim();
            if (!clean) return;
            // Detect Order ID (e.g. Order #1234 or ID: 456)
            const idMatch = clean.match(/#(\d+)|ID[:\s]+(\d+)/i);
            if (idMatch) detectedOrderNo = idMatch[1] || idMatch[2];

            // Detect Items (e.g. 1 x Paneer or Paneer Tikka 2)
            const itemMatch = clean.match(/(\d+)\s*[x\-]?\s*(.+)/) || clean.match(/(.+)\s*[x\-]?\s*(\d+)/);
            if (itemMatch && !clean.toLowerCase().includes('order')) {
                const name = (itemMatch[2] || itemMatch[1]).trim();
                const qty = parseInt(itemMatch[1] || itemMatch[2]) || 1;
                const match = menuDb.find(m => m.name.toLowerCase() === name.toLowerCase());
                items.push({
                    id: Date.now() + Math.random(),
                    name: name,
                    qty: qty,
                    price: match ? (match.priceDelivery || match.priceDineIn || 0) : 0,
                    taxRate: match ? (match.taxRate || 0) : 0
                });
            }
        });

        if (items.length > 0) {
            setTables(prev => ({ ...prev, Takeaway: items }));
            setOrderNo(detectedOrderNo);
            setBulkOrderText('');
            setIsDeliveryModalOpen(false);
            showToast(`Delivery Order #${detectedOrderNo} Imported!`);
        } else {
            showToast("Parsing failed. Check your text format.");
        }
    };

    // Custom UI Overlays
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [menuSearch, setMenuSearch] = useState('');
    const [editingMenuItem, setEditingMenuItem] = useState(null);
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
    
    // 1. Initial Hydration
    useEffect(() => {
        const savedTables = localStorage.getItem('running_tables');
        if (savedTables) setTables(JSON.parse(savedTables));
        const savedTimers = localStorage.getItem('table_timers');
        if (savedTimers) setTableTimers(JSON.parse(savedTimers));
        const savedOrderNo = localStorage.getItem('order_no');
        if (savedOrderNo) setOrderNo(parseInt(savedOrderNo));
        const hasSession = document.cookie.includes('moms_auth=true');
        if (hasSession) setAuthMatched(true);
    }, []);

    // 2. LocalStorage syncing
    useEffect(() => {
        localStorage.setItem('running_tables', JSON.stringify(tables));
    }, [tables]);
    useEffect(() => {
        localStorage.setItem('table_timers', JSON.stringify(tableTimers));
    }, [tableTimers]);
    useEffect(() => {
        localStorage.setItem('order_no', orderNo.toString());
    }, [orderNo]);

    // 3. Theme Color Sync
    useEffect(() => {
        if (storeConfig.primaryColor) {
            document.documentElement.style.setProperty('--primary', storeConfig.primaryColor);
            // Derive primary-text (Dark Green vs White) based on lightness if needed, 
            // for now just stick to Wise Dark Green since we expect light primary colors.
        }
    }, [storeConfig.primaryColor]);

    // Fetch Configurations, Menu, and History
    useEffect(() => {
        if (!authMatched) return;

        fetch('/api/settings').then(r => r.json()).then(data => {
            if (data && !data.error) {
                setStoreConfig(data);
                // Also set default UPI if not set
                if (!selectedUpiId && data.defaultUpiId) setSelectedUpiId(data.defaultUpiId);
            }
        }).catch(e => console.error(e));

        fetchMenu();
        fetchHistory();
    }, [authMatched, activeTab, historyDate]);

    // ── ZOMATO MAGIC IMPORT (Remote Ordering from Home) ───────────────────
    useEffect(() => {
        const zid = searchParams.get('z_id');
        const zitems = searchParams.get('z_items'); 
        const zotp = searchParams.get('z_otp');
        
        if (zid && zitems && menuDb.length > 0) {
            if (zotp) setZomatoOtp(zotp);
            const items = zitems.split('|').map(line => {
                const clean = line.trim();
                // Surgical Match for "Qty x Name" or "Qty x Name (Option)"
                const m = clean.match(/^(\d+)\s*[x\-]\s*(.+)/i) || clean.match(/^(.+)\s+(\d+)$/);
                if (m && !clean.includes('PM') && !clean.includes('AM') && !clean.includes('April')) {
                    const nameRaw = (m[2] || m[1]).trim();
                    const name = nameRaw.replace(/\[.*?\]/g, '').trim(); 
                    const qty = parseInt(m[1] || m[2]) || 1;
                    return {
                        id: Math.random(),
                        name: name.toUpperCase(),
                        qty: qty,
                        price: 0, // Hard-coded for testing
                        taxRate: 0
                    };
                }
                return null;
            }).filter(Boolean);

            if (items.length > 0) {
                setTables(prev => ({ ...prev, Takeaway: items }));
                setOrderNo(zid);
                setActiveTab('POS');
                setActiveTable('Takeaway');
                showToast(`🚀 Order #${zid} Ready for Review`);
                window.history.replaceState({}, '', '/');
            }
        }
    }, [searchParams, menuDb]);

    const fetchMenu = async () => {
        try {
            const res = await fetch('/api/menu');
            if (res.ok) {
                const data = await res.json();
                setMenuDb(data);
            }
        } catch (err) { console.error(err); }
    };


    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/orders?date=${historyDate}`);
            if (res.ok) {
                const data = await res.json();
                setHistoryData(data);
            }
        } catch (err) { console.error(err); }
    }

    const deleteOrder = (id) => {
        setConfirmDialog({
            title: 'Delete Order Record',
            message: 'Are you sure you want to permanently delete this order?',
            showPinInput: true,
            isDanger: true,
            onConfirm: async (pin) => {
                if (!pin) { showToast('PIN required'); return; }
                try {
                    const res = await fetch(`/api/orders?id=${id}&pin=${pin}`, { method: 'DELETE' });
                    if (res.ok) { showToast('Order Deleted'); fetchHistory(); }
                    else { const err = await res.json(); showToast(err.error || 'Delete failed'); }
                } catch (e) { showToast('Network Error'); }
            }
        });
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setStoreConfig({ ...storeConfig, logoUrl: event.target.result });
        };
        reader.readAsDataURL(file);
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storeConfig)
            });
            if (res.ok) {
                showToast('Store updated globally!');
                // Refetch to sync local state
                const data = await fetch('/api/settings').then(r => r.json());
                if (data && !data.error) setStoreConfig(data);
            }
            else showToast('Failed to save settings.');
        } catch (err) { showToast('Error: ' + err.message); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                try {
                    const res = await fetch('/api/menu', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: results.data })
                    });
                    const resJson = await res.json();
                    if (res.ok) {
                        showToast(resJson.message);
                        setActiveTab('POS'); // triggers refetch
                    } else showToast('Error: ' + resJson.error);
                } catch (err) {
                    showToast('Upload failed: ' + err.message);
                }
            }
        });
    };

    const handleNameChange = (val) => {
        setName(val);
        const found = menuDb.find(m => m.name.toLowerCase() === val.trim().toLowerCase());
        if (found) {
            const channelPrice = found[`price${menuMode}`] || found.priceDineIn || 0;
            setPrice(channelPrice);
            setTaxRate(found.taxRate || 0);
            setNewItemCategory(found.category || 'General');
        }
    };

    const selectMenuItem = (item) => {
        const channelPrice = item[`price${menuMode}`] || item.priceDineIn || 0;
        const newTables = { ...tables };
        const tableCart = [...(newTables[activeTable] || [])];

        // If already in cart, just increment qty
        const existingIdx = tableCart.findIndex(i => i.name === item.name);
        if (existingIdx !== -1) {
            tableCart[existingIdx].qty += 1;
        } else {
            tableCart.push({
                id: Date.now(),
                name: item.name,
                price: parseFloat(channelPrice),
                taxRate: parseFloat(item.taxRate || 0),
                qty: 1
            });
        }

        newTables[activeTable] = tableCart;
        setTables(newTables);

        // Start timer if first item
        if (tableCart.length === 1 && !tableTimers[activeTable]) {
            setTableTimers(prev => ({ ...prev, [activeTable]: Date.now() }));
        }

        setName(''); // Clear search
        showToast(`Added ${item.name}`);
    };

    const addItem = async (e) => {
        e.preventDefault();

        // If 'saveToMenu' checked, persist it in the database
        if (saveToMenu) {
            try {
                await fetch('/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, priceDineIn: price, category: newItemCategory, taxRate })
                });
            } catch (err) { console.error('Menu save failed', err); }
        }

        const newTables = { ...tables };
        newTables[activeTable] = [...(newTables[activeTable] || []), {
            id: Date.now(),
            name,
            price: parseFloat(price),
            taxRate: parseFloat(taxRate),
            qty: parseInt(qty)
        }];
        setTables(newTables);
        setName(''); setPrice(''); setQty(1); setTaxRate(0); setSaveToMenu(false);
        document.getElementById('item-name')?.focus();
    };

    const clearTable = () => {
        const newTables = { ...tables };
        newTables[activeTable] = [];
        setTables(newTables);
        setTableTimers(prev => {
            const next = { ...prev };
            delete next[activeTable];
            return next;
        });
        setCustomerName(''); setCustomerPhone(''); setDeliveryAddress(''); setGlobalDiscount(0); setSelectedUpiId('');
    };

    const removeItem = (id) => {
        setTables(prev => {
            const next = { ...prev };
            next[activeTable] = (next[activeTable] || []).filter(i => i.id !== id);
            return next;
        });
    };

    const updateCartItem = (id, field, value) => {
        if (field === 'qty' && value <= 0) {
            removeItem(id);
            return;
        }
        setTables(prev => {
            const next = { ...prev };
            next[activeTable] = (next[activeTable] || []).map(i => 
                i.id === id ? { ...i, [field]: value } : i
            );
            return next;
        });
    };

    // Calculate details for active table view
    const currentItems = tables[activeTable] || [];
    const subtotal = currentItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxTotal = currentItems.reduce((sum, item) => sum + ((item.price * item.qty) * (item.taxRate / 100)), 0);
    const grandTotal = subtotal + taxTotal - (parseFloat(globalDiscount) || 0);

    const finalizeBill = async () => {
        if (currentItems.length === 0) return showToast('Cannot finalize an empty table');

        // Calculate settlement details
        const total = grandTotal;
        const pType = paymentType;
        const cPaid = parseFloat(cashPaid || 0);
        const uPaid = (pType === 'UPI') ? total : parseFloat(upiPaid || 0);
        const totalPaid = (pType === 'PARTIAL') ? (cPaid + uPaid) : (pType === 'UPI' ? uPaid : cPaid);
        const change = totalPaid > total ? (totalPaid - total) : 0;

        if (totalPaid < total) {
            return showToast(`Insufficient Payment! Paid: ₹${totalPaid.toFixed(2)}, Needed: ₹${total.toFixed(2)}`);
        }

        setConfirmDialog({
            title: "Settle Order",
            message: (
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '900', margin: 0 }}>Amount: ₹{total.toFixed(2)}</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>Paid via {pType} ({totalPaid.toFixed(2)})</p>
                    {change > 0 && <p style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '0.9rem', margin: 0 }}>Return: ₹{change.toFixed(2)}</p>}
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Logistics</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>{customerName || 'Standard Walk-in'} {customerPhone && `(${customerPhone})`}</p>
                        {deliveryAddress && <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>{deliveryAddress}</p>}
                    </div>
                </div>
            ),
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    const res = await fetch('/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderNo,
                            tableNo: activeTable,
                            subtotal, taxTotal, grandTotal,
                            paymentType: pType,
                            cashPaid: cPaid,
                            upiPaid: uPaid,
                            changeReturned: change,
                            customerName,
                            customerPhone,
                            deliveryAddress,
                            upiUsed: selectedUpiId || storeConfig.defaultUpiId,
                            items: currentItems
                        })
                    });
                    if (res.ok) {
                        clearTable();
                        setOrderNo(order => order + 1);
                        showToast('Transaction Finalized!');
                        fetchHistory();
                        setCashPaid(''); setUpiPaid(''); setPaymentType('CASH');
                    } else {
                        showToast('Failed to save order.');
                    }
                } catch (err) { showToast('Server error saving order.'); }
            }
        });
    };

    const handlePrint = async (type) => {
        if (isPrinting) return;
        setIsPrinting(true);
        setReprintOrder(null);
        setActivePrint(type); // Still show preview on screen briefly

        if (isDebug) {
            console.log(`[DEBUG] Print Payload for ${type}:`, {
                type,
                items: currentItems,
                orderNo,
                tableNo: activeTable,
                subtotal,
                taxTotal,
                grandTotal,
                upiId: paymentType === 'CASH' ? null : (selectedUpiId || storeConfig.defaultUpiId)
            });
            showToast(`[DEBUG MODE] Local preview only`);
            setTimeout(() => {
                setActivePrint(null);
                setIsPrinting(false);
            }, 2000);
            return;
        }

        try {
            const res = await fetch('/api/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    items: currentItems,
                    orderNo,
                    billId: 'PENDING', // Will be finalized at settlement
                    tableNo: activeTable,
                    subtotal,
                    taxTotal,
                    grandTotal,
                    otp: zomatoOtp,
                    duration: tableTimers[activeTable] ? Math.floor((Date.now() - tableTimers[activeTable]) / 60000) : 0,
                    upiId: paymentType === 'CASH' ? null : (selectedUpiId || storeConfig.defaultUpiId)
                })
            });
            if (res.ok) showToast(`Silent ${type} Printed`);
            else {
                const err = await res.json();
                showToast(`Print Failed: ${err.error}. Showing Dialog instead.`);
                window.print();
            }
        } catch (e) {
            window.print();
        } finally {
            setIsPrinting(false);
            setTimeout(() => setActivePrint(null), 1000);
        }
    };

    const handleReprint = async (order) => {
        setReprintOrder(order);
        setActivePrint('BILL');
        try {
            const res = await fetch('/api/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'BILL',
                    items: order.items,
                    orderNo: order.orderNo,
                    billId: order.billId,
                    tableNo: order.tableNo,
                    subtotal: order.subtotal,
                    taxTotal: order.taxTotal,
                    grandTotal: order.grandTotal,
                    upiId: order.upiUsed
                })
            });
            if (res.ok) showToast('Silent Reprint Sent');
            else window.print();
        } catch (e) {
            window.print();
        } finally {
            setTimeout(() => { setActivePrint(null); setReprintOrder(null); }, 1000);
        }
    };

    const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Print Context Resolver
    const printItems = reprintOrder ? reprintOrder.items : currentItems;
    const printOrderNo = reprintOrder ? reprintOrder.orderNo : orderNo;
    const printBillId = reprintOrder ? reprintOrder.billId : 'PENDING';
    const printSubtotal = reprintOrder ? reprintOrder.subtotal : subtotal;
    const printTaxTotal = reprintOrder ? reprintOrder.taxTotal : taxTotal;
    const printGrandTotal = reprintOrder ? reprintOrder.grandTotal : grandTotal;
    const printTable = reprintOrder ? reprintOrder.tableNo : activeTable;
    const printDate = reprintOrder ? new Date(reprintOrder.createdAt).toLocaleString('en-IN') : dateStr;
    const printCustomerName = reprintOrder ? reprintOrder.customerName : customerName;
    const printCustomerPhone = reprintOrder ? reprintOrder.customerPhone : customerPhone;
    const printPaymentType = reprintOrder ? reprintOrder.paymentType : paymentType;
    const printUpiId = reprintOrder ? reprintOrder.upiUsed : (selectedUpiId || storeConfig.defaultUpiId);

    // UPI QR Generation URL
    const upiQrUrl = (printUpiId && printGrandTotal > 0)
        ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${printUpiId}&pn=${storeConfig.name}&am=${printGrandTotal.toFixed(2)}&cu=INR`)}`
        : null;

    // Persistent Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            // Just trying to fetch any protected API
            const res = await fetch('/api/menu');
            if (res.ok) setAuthMatched(true);
        };
        checkAuth();
    }, []);

    const [authError, setAuthError] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: pinInput })
            });
            if (res.ok) setAuthMatched(true);
            else {
                setAuthError('Invalid Master PIN. Please try again.');
                setPinInput('');
            }
        } catch (err) {
            setAuthError('Connection error. Server may be offline.');
        }
    };

    if (!authMatched) {
        return (
            <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)', padding: '1.5rem' }}>
                <form onSubmit={handleAuth} style={{ background: 'var(--bg)', padding: '5rem 3rem', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-ring)', textAlign: 'center', maxWidth: '460px', width: '100%' }}>
                    <Lock size={56} color="var(--text-primary)" style={{ marginBottom: '2.5rem' }} />
                    <h1 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '3rem', fontWeight: '900', letterSpacing: '-2.5px', lineHeight: '0.85' }}>Mom's Fresh Pot</h1>
                    <p style={{ marginBottom: '3.5rem', color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '600' }}>Unified POS Platform</p>

                    <div style={{ position: 'relative', marginBottom: '3rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '1rem', display: 'block' }}>Master Access PIN</label>
                        <input
                            type="password" required autoFocus value={pinInput} onChange={e => setPinInput(e.target.value)}
                            style={{ width: '100%', padding: '1.5rem', fontSize: '3rem', letterSpacing: '15px', textAlign: 'center', borderRadius: '20px', background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: authError ? '3px solid #d03238' : '3px solid transparent', transition: 'all 0.2s', fontWeight: '900' }}
                            placeholder="••••"
                        />
                        {authError && <p style={{ color: '#d03238', fontSize: '0.9rem', marginTop: '1.25rem', fontWeight: '700' }}>{authError}</p>}
                    </div>

                    <button type="submit" style={{ fontSize: '1.25rem', padding: '1.5rem', width: '100%', background: 'var(--primary)', color: 'var(--primary-text)', border: 'none', borderRadius: '9999px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>Unlock Register</button>

                    <div style={{ marginTop: '4rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Powered by Blind POS</p>
                    </div>

                    {toast && <div className={styles.toast} style={{ background: 'var(--text-primary)', color: 'white', borderRadius: '9999px', padding: '1rem 2rem' }}>{toast}</div>}
                </form>
            </div>
        );
    }

    // Dynamic Theme Calibrator
    const pColor = storeConfig.primaryColor || '#0050e6';
    const isLight = (color) => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 155;
    };
    const pTextColor = isLight(pColor) ? '#000000' : '#ffffff';

    return (
        <div className={styles.appContainer} style={{
            background: 'var(--bg)', color: 'var(--text-primary)', minHeight: '100vh', padding: '0.75rem',
            '--primary': pColor,
            '--primary-text': pTextColor,
            '--primary-accent': pColor, // Settle button also follows theme
            fontFamily: storeConfig.fontFamily || 'Inter'
        }}>
            <div className={styles.controlsSection} style={{ display: activePrint ? 'none' : 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: '1' }}>{storeConfig.name}</h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Unified POS Workspace</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(22, 51, 0, 0.05)', padding: '0.4rem', borderRadius: '9999px' }}>
                            <button
                                onClick={() => setActiveTab('POS')}
                                style={{
                                    padding: '0.65rem 1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: activeTab === 'POS' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'POS' ? '#ffffff' : 'var(--text-muted)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <Utensils size={18} /> POS
                            </button>
                            <button
                                onClick={() => setActiveTab('HISTORY')}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: activeTab === 'HISTORY' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'HISTORY' ? 'var(--primary-text)' : 'var(--text-primary)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <History size={18} /> History
                            </button>
                            <button
                                onClick={() => setActiveTab('MENU')}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: activeTab === 'MENU' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'MENU' ? 'var(--primary-text)' : 'var(--text-primary)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <Ticket size={18} /> Menu
                            </button>
                            <button
                                onClick={() => setActiveTab('SETTINGS')}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: activeTab === 'SETTINGS' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'SETTINGS' ? 'var(--primary-text)' : 'var(--text-primary)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <Settings size={18} /> Settings
                            </button>
                        </div>
                        <button
                            onClick={() => { setAuthMatched(false); setPinInput(''); }}
                            style={{
                                padding: '0.65rem 1rem', borderRadius: '9999px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'white', color: '#d03238',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Lock size={16} /> Lock Terminal
                        </button>
                    </div>
                </div>

                {/* TAB CONTENT AREAS */}

                {activeTab === 'MENU' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-2.5px', lineHeight: '0.85' }}>Menu Catalog</h1>

                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className={styles.input}
                                    placeholder="Search catalog items..."
                                    value={menuSearch}
                                    onChange={e => setMenuSearch(e.target.value)}
                                    style={{ paddingLeft: '3.5rem', height: '56px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        {editingMenuItem && (
                            <div style={{ background: 'var(--bg-subtle)', padding: '2.5rem', borderRadius: '30px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <h3 style={{ marginBottom: '2rem', fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-1px' }}>Edit: {editingMenuItem.name}</h3>
                                <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.category} onChange={e => setEditingMenuItem({ ...editingMenuItem, category: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>GST Rate (%)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '12px', padding: '4px', border: '2px solid var(--border)', height: '50px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => setEditingMenuItem({ ...editingMenuItem, taxRate: Math.max(0, (parseFloat(editingMenuItem.taxRate) || 0) - 1) })}
                                                style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Minus size={14} color="var(--text-primary)" strokeWidth={3} />
                                            </button>
                                            <input 
                                                type="number" 
                                                style={{ border: 'none', background: 'transparent', flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', outline: 'none' }} 
                                                value={editingMenuItem.taxRate} 
                                                onChange={e => setEditingMenuItem({ ...editingMenuItem, taxRate: e.target.value })} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setEditingMenuItem({ ...editingMenuItem, taxRate: (parseFloat(editingMenuItem.taxRate) || 0) + 1 })}
                                                style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <Plus size={14} color="var(--text-primary)" strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <div className={styles.formGroup}><label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Dine-In Price</label><input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.priceDineIn} onChange={e => setEditingMenuItem({ ...editingMenuItem, priceDineIn: e.target.value })} /></div>
                                    <div className={styles.formGroup}><label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Delivery Price</label><input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.priceDelivery} onChange={e => setEditingMenuItem({ ...editingMenuItem, priceDelivery: e.target.value })} /></div>
                                    <div className={styles.formGroup}><label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Corporate Price</label><input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.priceCorporate} onChange={e => setEditingMenuItem({ ...editingMenuItem, priceCorporate: e.target.value })} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={async () => {
                                        const res = await fetch('/api/menu', { method: 'POST', body: JSON.stringify(editingMenuItem) });
                                        if (res.ok) { showToast('Menu item updated'); setEditingMenuItem(null); fetchMenu(); }
                                    }} style={{ padding: '1rem 2.5rem', borderRadius: '9999px', background: 'var(--primary)', color: 'var(--primary-text)', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Save Update</button>
                                    <button onClick={() => setEditingMenuItem(null)} style={{ padding: '1rem 2.5rem', borderRadius: '9999px', background: 'white', color: 'var(--text-primary)', border: '2px solid var(--border)', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div style={{ background: 'var(--bg)', borderRadius: '30px', border: '2px solid var(--bg-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-ring)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Item Identity</th>
                                        <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Dine-In</th>
                                        <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Delivery</th>
                                        <th style={{ textAlign: 'left', padding: '1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Tax Rate</th>
                                        <th style={{ textAlign: 'right', padding: '1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)' }}>Commands</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menuDb.filter(m => m.name.toLowerCase().includes(menuSearch.toLowerCase())).map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--bg-subtle)' }}>
                                            <td style={{ padding: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>{item.name}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-muted)' }}>₹{(item.priceDineIn || 0).toLocaleString()}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-muted)' }}>₹{(item.priceDelivery || 0).toLocaleString()}</td>
                                            <td style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--text-muted)' }}>{item.taxRate}%</td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                <button onClick={() => setEditingMenuItem(item)} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontWeight: '700', marginRight: '0.5rem' }}>Edit</button>
                                                <button onClick={() => {
                                                    setConfirmDialog({
                                                        title: `Delete ${item.name}?`,
                                                        message: 'This will remove the item from all catalogs permanently.',
                                                        isDanger: true,
                                                        onConfirm: async () => {
                                                            const res = await fetch(`/api/menu?id=${item.id}`, { method: 'DELETE' });
                                                            if (res.ok) { fetchMenu(); showToast('Item deleted'); }
                                                            else showToast('Delete failed');
                                                        }
                                                    });
                                                }} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'white', color: '#d03238', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'SETTINGS' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-2.5px', lineHeight: '0.85' }}>Store Environment</h1>

                        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: 'var(--bg)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: '800', fontSize: '1.25rem' }}>Store Profile</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Restaurant Name</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} required value={storeConfig.name} onChange={e => setStoreConfig({ ...storeConfig, name: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Address (80mm Printer Format)</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.address} onChange={e => setStoreConfig({ ...storeConfig, address: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontWeight: '800', fontSize: '1.25rem' }}>Payment Channels</h3>
                                {(storeConfig.upiIds || []).map((upi, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                        <input className={styles.input} style={{ flex: 1, height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: '800' }} value={upi} onChange={e => {
                                            const u = [...storeConfig.upiIds]; u[i] = e.target.value; setStoreConfig({ ...storeConfig, upiIds: u });
                                        }} />
                                        <button type="button" onClick={() => setStoreConfig({ ...storeConfig, defaultUpiId: upi })} style={{ padding: '0.75rem 1.25rem', borderRadius: '9999px', border: 'none', background: storeConfig.defaultUpiId === upi ? 'var(--primary)' : 'white', color: storeConfig.defaultUpiId === upi ? 'var(--primary-text)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', boxShadow: 'var(--shadow-ring)' }}>Default</button>
                                        <button type="button" onClick={() => setStoreConfig({ ...storeConfig, upiIds: storeConfig.upiIds.filter((_, idx) => idx !== i) })} style={{ color: '#d03238', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setStoreConfig({ ...storeConfig, upiIds: [...(storeConfig.upiIds || []), ""] })} style={{ fontSize: '0.8rem', padding: '0.75rem 1.5rem', borderRadius: '9999px', background: 'white', border: '2px solid var(--border)', color: 'var(--text-primary)', fontWeight: '800', cursor: 'pointer' }}>+ Link Account</button>
                            </div>

                            <div style={{ background: 'var(--bg)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: '800', fontSize: '1.25rem' }}>Spatial & Hardware</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Active Tables</label>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '4px', border: '2px solid var(--border)', height: '50px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => setStoreConfig({ ...storeConfig, tableCount: Math.max(1, (storeConfig.tableCount || 1) - 1) })}
                                                style={{ background: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >
                                                <Minus size={14} color="var(--text-primary)" strokeWidth={3} />
                                            </button>
                                            <input 
                                                type="number" 
                                                style={{ border: 'none', background: 'transparent', flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)', outline: 'none' }} 
                                                value={storeConfig.tableCount || 10} 
                                                onChange={e => setStoreConfig({ ...storeConfig, tableCount: parseInt(e.target.value) || 0 })} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setStoreConfig({ ...storeConfig, tableCount: (storeConfig.tableCount || 0) + 1 })}
                                                style={{ background: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >
                                                <Plus size={14} color="var(--text-primary)" strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Thermal Interface</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '600' }} placeholder="tcp://... or http://..." value={storeConfig.printerInterface || ''} onChange={e => setStoreConfig({ ...storeConfig, printerInterface: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Print Server API Key</label>
                                        <input className={styles.input} type="password" style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '600' }} placeholder="Tailscale API Key..." value={storeConfig.printerApiKey || ''} onChange={e => setStoreConfig({ ...storeConfig, printerApiKey: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Printer Engine</label>
                                        <select className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.printerType || 'EPSON'} onChange={e => setStoreConfig({ ...storeConfig, printerType: e.target.value })}>
                                            <option value="EPSON">ESC/POS (Epson)</option>
                                            <option value="STAR">STAR (Star Mode)</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Calibration Test</label>
                                        <button type="button" onClick={() => handlePrint('TEST')} style={{ height: '50px', width: '100%', borderRadius: '9999px', border: '2px solid var(--primary)', background: 'white', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Printer size={16} /> RUN TEST PRINT
                                        </button>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Thermal Font Weight</label>
                                        <select className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.printerFont || 'Inter'} onChange={e => setStoreConfig({ ...storeConfig, printerFont: e.target.value })}>
                                            <option value="Inter">Standard Bold</option>
                                            <option value="Classic">Classic Mono</option>
                                            <option value="Elegant">Elegant Serif</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Headline Scaling (pt)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '4px', border: '2px solid var(--border)', height: '50px' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => setStoreConfig({ ...storeConfig, printerBoldSize: Math.max(8, (storeConfig.printerBoldSize || 24) - 2) })}
                                                style={{ background: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >
                                                <Minus size={14} color="var(--text-primary)" strokeWidth={3} />
                                            </button>
                                            <input 
                                                type="number" 
                                                style={{ border: 'none', background: 'transparent', flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)', outline: 'none' }} 
                                                value={storeConfig.printerBoldSize || 24} 
                                                onChange={e => setStoreConfig({ ...storeConfig, printerBoldSize: parseInt(e.target.value) || 24 })} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setStoreConfig({ ...storeConfig, printerBoldSize: (storeConfig.printerBoldSize || 0) + 2 })}
                                                style={{ background: 'white', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                            >
                                                <Plus size={14} color="var(--text-primary)" strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" style={{ padding: '1.5rem', width: '100%', borderRadius: '9999px', background: 'var(--primary)', color: 'var(--primary-text)', fontSize: '1.1rem', fontWeight: '900', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Sync Configuration Environment</button>
                        </form>

                        <div style={{ background: 'var(--bg-subtle)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)' }}>
                            <h3 style={{ marginBottom: '1rem', fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-1px' }}>Manifest Import</h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--text-primary)', color: 'white', padding: '1rem 2rem', borderRadius: '9999px', fontWeight: '800', width: 'fit-content' }}>
                                <Upload size={20} /> Select CSV Source
                                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'POS' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 380px', gap: '1.5rem', height: 'calc(100vh - 110px)', overflow: 'hidden' }}>
                        {/* 1. Category Nav Tile System */}
                        <div style={{ overflowY: 'auto', background: 'var(--bg-subtle)', borderRadius: '32px', padding: '1rem', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', paddingLeft: '0.5rem' }}>Product Channel</h4>
                            {['All Items', ...new Set(menuDb.map(m => m.category || 'Kitchen'))].map(cat => (
                                <button
                                    key={cat} onClick={() => setSelectedCategory(cat === 'All Items' ? 'All' : cat)}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '1rem 1.25rem', borderRadius: '16px', border: 'none', cursor: 'pointer', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700',
                                        background: (selectedCategory === 'All' && cat === 'All Items') || selectedCategory === cat ? 'var(--primary)' : 'white',
                                        color: (selectedCategory === 'All' && cat === 'All Items') || selectedCategory === cat ? '#ffffff' : 'var(--text-primary)',
                                        boxShadow: (selectedCategory === 'All' && cat === 'All Items') || selectedCategory === cat ? 'var(--shadow-ring)' : '0 1px 3px rgba(0,0,0,0.02)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* 2. Menu Central Grid Workspace */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg)', borderRadius: '32px', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', background: 'rgba(22, 51, 0, 0.05)', padding: '0.4rem', borderRadius: '9999px' }}>
                                        {['DineIn', 'Takeaway', 'Corporate', 'Delivery'].map(mode => (
                                            <button
                                                key={mode} onClick={() => {
                                                    setMenuMode(mode);
                                                    if (mode === 'DineIn') {
                                                        setActiveTable('Table 1');
                                                        if (!tables['Table 1']) setTables({ ...tables, ['Table 1']: [] });
                                                    } else {
                                                        setActiveTable('Takeaway');
                                                        if (!tables['Takeaway']) setTables({ ...tables, ['Takeaway']: [] });
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.65rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '-0.5px',
                                                    background: menuMode === mode ? 'var(--primary)' : 'transparent',
                                                    color: menuMode === mode ? '#ffffff' : 'var(--text-muted)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {mode.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ position: 'relative', width: '250px' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className={styles.input} style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.85rem', borderRadius: '12px', background: 'var(--bg-subtle)', border: 'none', color: 'var(--text-primary)', fontWeight: '700' }}
                                            placeholder="Find MenuItem..."
                                            value={name} onChange={e => handleNameChange(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {menuMode === 'DineIn' && (
                                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {Array.from({ length: storeConfig.tableCount || 5 }, (_, i) => `Table ${i + 1}`).map(t => (
                                            <button
                                                key={t} onClick={() => {
                                                    setActiveTable(t);
                                                    if (!tables[t]) setTables({ ...tables, [t]: [] });
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800',
                                                    whiteSpace: 'nowrap', transition: 'all 0.25s',
                                                    background: activeTable === t ? '#000000' : 'white',
                                                    color: activeTable === t ? '#ffffff' : 'var(--text-primary)'
                                                }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem', alignContent: 'start' }}>
                                {(() => {
                                    const filtered = menuDb
                                        .filter(m => selectedCategory === 'All' || m.category === selectedCategory)
                                        .filter(m => m.name.toLowerCase().includes(name.toLowerCase()));

                                    const grouped = filtered.reduce((acc, item) => {
                                        const cat = item.category || 'General';
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(item);
                                        return acc;
                                    }, {});

                                    return Object.entries(grouped).map(([cat, items]) => (
                                        <React.Fragment key={cat}>
                                            <div style={{ gridColumn: '1 / -1', padding: '1rem 0 0.5rem 0', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5, borderBottom: '1px solid var(--border)', marginBottom: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                <h3 style={{ fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>{cat}</h3>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)' }}>{items.length} items</span>
                                            </div>
                                            {items.map(item => {
                                                const p = item[`price${menuMode}`] || item.priceDineIn || 0;
                                                return (
                                                    <div
                                                        key={item.id} onClick={() => selectMenuItem(item)}
                                                        style={{
                                                            background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.25rem', cursor: 'pointer', textAlign: 'center',
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '160px',
                                                            transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                                                        }}
                                                        className="menu-card"
                                                    >
                                                        <div style={{
                                                            fontWeight: '800', fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.3', letterSpacing: '-0.3px',
                                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                            marginTop: 'auto', marginBottom: 'auto', padding: '0 0.25rem'
                                                        }}>
                                                            {item.name}
                                                        </div>
                                                        <div style={{ marginTop: 'auto', padding: '4px 0' }}>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--primary-text)', background: 'var(--primary)', borderRadius: '12px', padding: '0.5rem', width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>₹{p.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </React.Fragment>
                                    ));
                                })()}
                                {menuDb.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.5rem' }}>Empty POS Manifest</div>
                                        <div style={{ fontSize: '0.85rem' }}>Please initialize parameters in the Menu settings tab.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Anchored Cart Sidebar (TargetContent Match Ends Here) */}
                        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', background: 'var(--bg)', borderRadius: '40px', border: '2px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-ring)', height: '100%', position: 'relative' }}>
                            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>{menuMode} Manifest</span>
                                    <span style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-1.2px', lineHeight: '1.1' }}>
                                        {menuMode === 'DineIn' ? activeTable : `${menuMode} Checkout`}
                                    </span>
                                </div>
                                <button onClick={clearTable} style={{ background: 'rgba(208, 50, 56, 0.05)', border: '1px solid rgba(208, 50, 56, 0.2)', color: '#d03238', padding: '0.5rem 1.2rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer' }}>CLEAR</button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
                                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 5, borderBottom: '1px solid var(--border)' }}>
                                        <tr style={{ color: 'var(--text-muted)' }}>
                                            <th align="left" style={{ padding: '0.75rem 1.5rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800' }}>Manifest Item</th>
                                            <th align="center" style={{ padding: '0.75rem 0.5rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800' }}>Qty</th>
                                            <th align="right" style={{ padding: '0.75rem 1.5rem', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800' }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, idx) => (
                                            <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--bg-subtle)' }}>
                                                <td style={{ padding: '0.65rem 1.5rem' }}>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', fontSize: '0.85rem' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: '700' }}>₹{item.price}</div>
                                                </td>
                                                <td align="center">
                                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(22, 51, 0, 0.05)', borderRadius: '12px', padding: '4px', width: 'fit-content', margin: '0 auto', gap: '0.25rem', border: '1px solid var(--border)' }}>
                                                        <button
                                                            onClick={() => updateCartItem(item.id, 'qty', Math.max(0, item.qty - 1))}
                                                            style={{ background: 'white', border: 'none', borderRadius: '8px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                        >
                                                            <Minus size={12} color="var(--text-primary)" strokeWidth={3} />
                                                        </button>
                                                        <input
                                                            type="number" style={{ border: 'none', background: 'transparent', width: '28px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-primary)', outline: 'none' }}
                                                            value={item.qty}
                                                            onChange={(e) => updateCartItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                                        />
                                                        <button
                                                            onClick={() => updateCartItem(item.id, 'qty', item.qty + 1)}
                                                            style={{ background: 'white', border: 'none', borderRadius: '8px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                        >
                                                            <Plus size={12} color="var(--text-primary)" strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td align="right" style={{ padding: '0.65rem 1.5rem' }}>
                                                    <div style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '0.9rem' }}>₹{(item.price * item.qty).toLocaleString()}</div>
                                                    <button onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'none', color: '#d03238', cursor: 'pointer', fontSize: '0.6rem', fontWeight: '800', padding: 0, marginTop: '2px', textTransform: 'uppercase' }}>Discard</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {currentItems.length === 0 && (
                                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem' }}>Awaiting transaction input...</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderTop: '2px solid var(--border)', flexShrink: 0 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                                    <input className={styles.input} placeholder="Customer Name" style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontWeight: '800' }} value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                    <input className={styles.input} type="tel" placeholder="Phone Number" style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontWeight: '800' }} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                    {(menuMode === 'Delivery' || menuMode === 'Corporate') && (
                                        <input className={styles.input} placeholder="Fulfillment Coordinates (Address)" style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontWeight: '800' }} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '14px', padding: '2px', border: '1px solid var(--border)', height: '44px' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => setGlobalDiscount(Math.max(0, (parseFloat(globalDiscount) || 0) - 10))}
                                            style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: '10px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <Minus size={12} color="var(--text-primary)" strokeWidth={3} />
                                        </button>
                                        <input 
                                            type="number" style={{ border: 'none', background: 'transparent', flex: 1, textAlign: 'center', fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-primary)', outline: 'none' }}
                                            placeholder="Adj ₹ (Lumpsum Discount)"
                                            value={globalDiscount}
                                            onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setGlobalDiscount((parseFloat(globalDiscount) || 0) + 10)}
                                            style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: '10px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <Plus size={12} color="var(--text-primary)" strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: paymentType === 'CASH' ? '1fr' : '1fr 1fr', gap: '0.65rem' }}>
                                        <select className={styles.input} style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontWeight: '800' }} value={paymentType} onChange={e => setPaymentType(e.target.value)}>
                                            <option value="CASH">Cash Settlement</option>
                                            <option value="UPI">Digital (UPI)</option>
                                            <option value="PARTIAL">Split Tendering</option>
                                        </select>
                                        {paymentType !== 'CASH' && (
                                            <select className={styles.input} style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontWeight: '800', cursor: 'pointer' }} value={selectedUpiId} onChange={e => setSelectedUpiId(e.target.value)}>
                                                {(storeConfig.upiIds || []).map(id => <option key={id} value={id}>{id}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}><span>GST / Taxes</span><span>₹{taxTotal.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '0.75rem', letterSpacing: '-1px', lineHeight: '0.9' }}><span>TOTAL PAYABLE</span><span>₹{grandTotal.toLocaleString()}</span></div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <button disabled={isPrinting} onClick={() => handlePrint('KOT')} style={{ flex: 1, cursor: isPrinting ? 'not-allowed' : 'pointer', background: 'var(--bg)', color: 'var(--text-primary)', border: '2px solid var(--border)', padding: '1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.5px' }}>1. KOT</button>
                                    <button disabled={isPrinting} onClick={() => handlePrint('BILL')} style={{ flex: 1, cursor: isPrinting ? 'not-allowed' : 'pointer', background: 'var(--bg)', color: 'var(--text-primary)', border: '2px solid var(--border)', padding: '1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.5px' }}>2. PRINT</button>
                                    <button disabled={isPrinting} onClick={finalizeBill} style={{ flex: 2, cursor: isPrinting ? 'not-allowed' : 'pointer', background: 'var(--primary-accent)', color: '#ffffff', border: 'none', padding: '1rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: '900', letterSpacing: '-0.5px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>3. SETTLE (NO PRINT)</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-2.5px', lineHeight: '0.85' }}>Order Manifests</h1>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '2.5rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Environment Date</label>
                                <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '1.5rem', fontWeight: '900', background: 'transparent', color: 'var(--text-primary)', letterSpacing: '-1px' }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Settled Liquidity</span>
                                <span style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '900', letterSpacing: '-2px' }}>₹{historyData.reduce((acc, order) => acc + order.grandTotal, 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', maxHeight: '600px', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                            {historyData.length === 0 ? <p style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '600' }}>No logs available for this environmental window.</p> : null}
                            {historyData.map(order => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', background: 'var(--bg)', borderRadius: '9999px', border: '2px solid var(--bg-subtle)', transition: 'all 0.2s', boxShadow: 'var(--shadow-ring)' }} className="order-log-row">
                                    <div>
                                        <div style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>{order.billId} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.75rem', fontWeight: '700' }}>{order.tableNo} • ID-#{order.orderNo}</span></div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: '600' }}>{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {order.paymentType}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text-primary)', marginRight: '1rem', letterSpacing: '-0.5px' }}>₹{order.grandTotal.toLocaleString()}</span>
                                        <button onClick={() => handleReprint(order)} style={{ padding: '0.75rem 1.5rem', background: 'var(--bg-subtle)', border: 'none', color: 'var(--text-primary)', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Printer size={16} /> Duplicate</button>
                                        <button onClick={() => deleteOrder(order.id)} style={{ padding: '0.75rem', color: '#d03238', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={22} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SHARED PRINT STAGE (Hidden by default, shown for KOT/BILL/TOKEN) */}
            <div className={styles.receiptSection} style={{
                display: activePrint ? 'flex' : (reprintOrder ? 'flex' : 'none'),
                '--printer-font': storeConfig.printerFont === 'Classic' ? '"Space Mono", monospace' : (storeConfig.printerFont === 'Elegant' ? '"Playfair Display", serif' : '"Inter", sans-serif'),
                '--printer-bold-size': `${storeConfig.printerBoldSize || 24}px`
            }}>

                <div className={`${styles.thermalPreview} ${activePrint === 'KOT' ? 'print-active' : ''}`} style={{ display: activePrint === 'KOT' ? 'block' : 'none' }}>
                    <div className={styles.receiptHeader}>
                        <h2>KOT - Order #{printOrderNo}</h2>
                        <p>{printTable} | {printDate}</p>
                    </div>
                    <table className={styles.itemsTable}>
                        <thead><tr><th width="80%">Item</th><th width="20%" className={styles.textCenter}>Qty</th></tr></thead>
                        <tbody>{printItems.map(item => <tr key={item.id || item.menuName}><td>{item.name || item.menuName}</td><td className={styles.textCenter}>{item.qty}</td></tr>)}</tbody>
                    </table>
                </div>

                <div className={`${styles.thermalPreview} ${activePrint === 'TOKEN' ? 'print-active' : ''}`} style={{ display: activePrint === 'TOKEN' ? 'block' : 'none', textAlign: 'center' }}>
                    {storeConfig.logoUrl ? <img src={storeConfig.logoUrl} style={{ maxWidth: '50px', marginBottom: '0.5rem', filter: 'grayscale(100%)' }} alt="logo" /> : null}
                    <div className={styles.receiptHeader}><h2>{storeConfig.name}</h2></div>
                    <h1 style={{ fontSize: '4rem', margin: '2rem 0' }}>#{printOrderNo}</h1>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Please wait for your token.</p>
                    <p>{printTable} | {printDate}</p>
                </div>

                <div className={`${styles.thermalPreview} ${activePrint === 'BILL' ? 'print-active' : ''}`} style={{
                    display: activePrint === 'BILL' ? 'block' : (activePrint ? 'none' : 'block'),
                }}>
                    <div className={styles.receiptHeader}>
                        <h2>{storeConfig.name}</h2>
                        <p style={{ fontSize: '0.7rem', margin: '0.1rem 0' }}>{storeConfig.address}</p>
                        <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.1rem 0' }}>
                            {storeConfig.phone && <span>Tel: {storeConfig.phone}</span>}
                            {storeConfig.gstin && <span>GSTIN: {storeConfig.gstin}</span>}
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '0.25rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                            <span>Order #{printOrderNo} | {printTable}</span>
                            <span>ID: {printBillId}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', margin: '0.1rem 0', fontWeight: '600' }}>Date: {printDate}</p>
                        {(printCustomerName || printCustomerPhone) && (
                            <p style={{ fontSize: '0.75rem', margin: '0.1rem 0' }}>Customer: {printCustomerName} {printCustomerPhone && `(${printCustomerPhone})`}</p>
                        )}
                    </div>
                    <table className={styles.itemsTable}>
                        <thead><tr><th width="50%">Item</th><th width="15%" className={styles.textCenter}>Qty</th><th width="35%" className={styles.textRight}>Price</th><th className={styles.actionCell} style={{ display: activePrint || reprintOrder ? 'none' : 'table-cell' }}></th></tr></thead>
                        <tbody>
                            {printItems.map(item => (
                                <tr key={item.id || item.menuName}>
                                    <td>
                                        {item.name || item.menuName}
                                        {item.taxRate > 0 && <span style={{ fontSize: '0.65rem', color: '#666', marginLeft: '0.4rem' }}>({(item.taxRate).toFixed(1)}% Tax)</span>}
                                    </td>
                                    <td className={styles.textCenter}>{item.qty}</td>
                                    <td className={styles.textRight}>₹{(item.price * item.qty).toFixed(2)}</td>
                                    <td className={styles.actionCell} onClick={() => removeItem(item.id)} style={{ display: activePrint || reprintOrder ? 'none' : 'table-cell' }}>×</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.receiptTotals}>
                        <div className={styles.totalsRow}><span>Subtotal:</span><span>₹{printSubtotal.toFixed(2)}</span></div>
                        <div className={styles.totalsRow}><span>Total GST:</span><span>₹{printTaxTotal.toFixed(2)}</span></div>
                        {globalDiscount > 0 && <div className={styles.totalsRow}><span>Discount:</span><span>-₹{parseFloat(globalDiscount).toFixed(2)}</span></div>}
                        <div className={`${styles.totalsRow} ${styles.grandTotal}`}><span>Grand Total:</span><span>₹{printGrandTotal.toFixed(2)}</span></div>
                    </div>
                    <div className={styles.receiptFooter}>
                        {upiQrUrl && (
                            <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                                <img src={upiQrUrl} alt="UPI QR" style={{ width: '100px', height: '100px' }} />
                                <p style={{ fontSize: '0.65rem', margin: 0 }}>Scan to pay with UPI</p>
                            </div>
                        )}
                        <p>Thank you for choosing</p><p>{storeConfig.name}!</p><p>Please visit again.</p>
                    </div>
                </div>
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'var(--primary)', color: 'var(--primary-text)', padding: '1rem 2.5rem', borderRadius: '9999px', fontWeight: '900', fontSize: '0.9rem', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '2px solid var(--border)' }}>
                    {toast}
                </div>
            )}

            {confirmDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'var(--bg)', padding: '3rem', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-ring)', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: '0.9' }}>{confirmDialog.title}</h3>
                        <div style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '600' }}>{confirmDialog.message}</div>

                        {confirmDialog.showPinInput && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.75rem', display: 'block' }}>Master Security PIN</label>
                                <input
                                    type="password" autoFocus placeholder="••••"
                                    style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '2.5rem', letterSpacing: '12px', fontWeight: '900' }}
                                    value={pinInput} onChange={e => setPinInput(e.target.value)}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setConfirmDialog(null); setPinInput(''); }} style={{ flex: 1, padding: '1.25rem', borderRadius: '9999px', border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>Dismiss</button>
                            <button
                                onClick={() => { confirmDialog.onConfirm(pinInput); setConfirmDialog(null); setPinInput(''); }}
                                style={{ flex: 1, padding: '1.25rem', borderRadius: '9999px', border: 'none', background: confirmDialog.isDanger ? '#d03238' : 'var(--primary)', color: confirmDialog.isDanger ? 'white' : 'var(--primary-text)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
