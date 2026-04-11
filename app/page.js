'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { Printer, Trash2, Utensils, Ticket, Settings, Upload, History, Lock, Search, Store, Plus, Minus, User, Phone, MapPin, X } from 'lucide-react';
import Papa from 'papaparse';

// ── PRESET THEME REGISTRY ────────────────────────────────────────────────────
const THEMES = [
    {
        id: 'wise',
        name: 'Wise',
        tagline: 'Forest green, fresh',
        preview: ['#9fe870', '#163300', '#ffffff'],
        vars: {
            '--bg': '#ffffff',
            '--bg-subtle': '#f5faf0',
            '--surface': '#ffffff',
            '--surface-elevated': '#e2f6d5',
            '--primary': '#9fe870',
            '--primary-text': '#163300',
            '--primary-accent': '#cdffad',
            '--primary-hover': '#b8f090',
            '--text-primary': '#0e0f0c',
            '--text-secondary': '#454745',
            '--text-muted': '#868685',
            '--border': 'rgba(14,15,12,0.12)',
            '--border-strong': '#0e0f0c',
            '--shadow-ring': 'rgba(14,15,12,0.12) 0px 0px 0px 1px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'uber',
        name: 'Uber',
        tagline: 'Black & white decisive',
        preview: ['#000000', '#ffffff', '#efefef'],
        vars: {
            '--bg': '#ffffff',
            '--bg-subtle': '#f9f9f9',
            '--surface': '#ffffff',
            '--surface-elevated': '#efefef',
            '--primary': '#000000',
            '--primary-text': '#ffffff',
            '--primary-accent': '#000000',
            '--primary-hover': '#1a1a1a',
            '--text-primary': '#000000',
            '--text-secondary': '#4b4b4b',
            '--text-muted': '#afafaf',
            '--border': 'rgba(0,0,0,0.1)',
            '--border-strong': '#000000',
            '--shadow-ring': 'rgba(0,0,0,0.12) 0px 4px 16px 0px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'apple',
        name: 'Apple',
        tagline: 'Cinematic singular blue',
        preview: ['#0071e3', '#f5f5f7', '#1d1d1f'],
        vars: {
            '--bg': '#f5f5f7',
            '--bg-subtle': '#ffffff',
            '--surface': '#ffffff',
            '--surface-elevated': '#e8e8ed',
            '--primary': '#0071e3',
            '--primary-text': '#ffffff',
            '--primary-accent': '#34c759',
            '--primary-hover': '#0077ed',
            '--text-primary': '#1d1d1f',
            '--text-secondary': 'rgba(0,0,0,0.8)',
            '--text-muted': 'rgba(0,0,0,0.48)',
            '--border': 'rgba(0,0,0,0.1)',
            '--border-strong': '#1d1d1f',
            '--shadow-ring': 'rgba(0,0,0,0.22) 3px 5px 30px 0px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'midnight',
        name: 'Midnight',
        tagline: 'Dark, electric blue',
        preview: ['#6366f1', '#0f0f1a', '#1e1e35'],
        vars: {
            '--bg': '#0f0f1a',
            '--bg-subtle': '#1a1a2e',
            '--surface': '#1e1e35',
            '--surface-elevated': '#2a2a45',
            '--primary': '#6366f1',
            '--primary-text': '#ffffff',
            '--primary-accent': '#818cf8',
            '--primary-hover': '#4f46e5',
            '--text-primary': '#f1f5f9',
            '--text-secondary': '#94a3b8',
            '--text-muted': '#64748b',
            '--border': 'rgba(99,102,241,0.2)',
            '--border-strong': '#6366f1',
            '--shadow-ring': 'rgba(99,102,241,0.15) 0px 0px 0px 1px',
            '--error': '#ff6b75',
            '--error-bg': 'rgba(255,107,117,0.08)',
            '--error-border': 'rgba(255,107,117,0.25)',
            '--bg-overlay': 'rgba(0,0,0,0.6)',
            '--pill-track': 'rgba(255,255,255,0.06)',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'emerald',
        name: 'Emerald',
        tagline: 'Fresh, nature-first',
        preview: ['#10b981', '#f0fdf4', '#ecfdf5'],
        vars: {
            '--bg': '#f0fdf4',
            '--bg-subtle': '#ecfdf5',
            '--surface': '#ffffff',
            '--surface-elevated': '#d1fae5',
            '--primary': '#059669',
            '--primary-text': '#ffffff',
            '--primary-accent': '#065f46',
            '--primary-hover': '#047857',
            '--text-primary': '#064e3b',
            '--text-secondary': '#065f46',
            '--text-muted': '#6b7280',
            '--border': 'rgba(5,150,105,0.15)',
            '--border-strong': '#059669',
            '--shadow-ring': 'rgba(5,150,105,0.12) 0px 0px 0px 1px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'saffron',
        name: 'Saffron',
        tagline: 'Warm & vibrant',
        preview: ['#f59e0b', '#fffbeb', '#fef3c7'],
        vars: {
            '--bg': '#fffbeb',
            '--bg-subtle': '#fef3c7',
            '--surface': '#ffffff',
            '--surface-elevated': '#fde68a',
            '--primary': '#d97706',
            '--primary-text': '#ffffff',
            '--primary-accent': '#92400e',
            '--primary-hover': '#b45309',
            '--text-primary': '#1c1917',
            '--text-secondary': '#44403c',
            '--text-muted': '#78716c',
            '--border': 'rgba(217,119,6,0.2)',
            '--border-strong': '#d97706',
            '--shadow-ring': 'rgba(217,119,6,0.15) 0px 0px 0px 1px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'rose',
        name: 'Rose',
        tagline: 'Bold, passionate',
        preview: ['#e11d48', '#fff1f2', '#ffe4e6'],
        vars: {
            '--bg': '#fff1f2',
            '--bg-subtle': '#ffe4e6',
            '--surface': '#ffffff',
            '--surface-elevated': '#fecdd3',
            '--primary': '#e11d48',
            '--primary-text': '#ffffff',
            '--primary-accent': '#9f1239',
            '--primary-hover': '#be123c',
            '--text-primary': '#0f0a0a',
            '--text-secondary': '#3f3f46',
            '--text-muted': '#71717a',
            '--border': 'rgba(225,29,72,0.15)',
            '--border-strong': '#e11d48',
            '--shadow-ring': 'rgba(225,29,72,0.12) 0px 0px 0px 1px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'slate',
        name: 'Slate Pro',
        tagline: 'Corporate, premium',
        preview: ['#475569', '#f8fafc', '#f1f5f9'],
        vars: {
            '--bg': '#f8fafc',
            '--bg-subtle': '#f1f5f9',
            '--surface': '#ffffff',
            '--surface-elevated': '#e2e8f0',
            '--primary': '#334155',
            '--primary-text': '#ffffff',
            '--primary-accent': '#0ea5e9',
            '--primary-hover': '#1e293b',
            '--text-primary': '#0f172a',
            '--text-secondary': '#334155',
            '--text-muted': '#64748b',
            '--border': 'rgba(51,65,85,0.12)',
            '--border-strong': '#334155',
            '--shadow-ring': 'rgba(51,65,85,0.1) 0px 0px 0px 1px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'spotify',
        name: 'Spotify',
        tagline: 'Dark immersive green',
        preview: ['#1ed760', '#121212', '#1f1f1f'],
        vars: {
            '--bg': '#121212',
            '--bg-subtle': '#181818',
            '--surface': '#1f1f1f',
            '--surface-elevated': '#252525',
            '--primary': '#1ed760',
            '--primary-text': '#000000',
            '--primary-accent': '#1db954',
            '--primary-hover': '#1fdf64',
            '--text-primary': '#ffffff',
            '--text-secondary': '#b3b3b3',
            '--text-muted': '#7c7c7c',
            '--border': 'rgba(255,255,255,0.1)',
            '--border-strong': '#4d4d4d',
            '--shadow-ring': 'rgba(0,0,0,0.5) 0px 8px 24px',
            '--error': '#ff6b75',
            '--error-bg': 'rgba(255,107,117,0.08)',
            '--error-border': 'rgba(255,107,117,0.25)',
            '--bg-overlay': 'rgba(0,0,0,0.7)',
            '--pill-track': 'rgba(255,255,255,0.06)',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'notion',
        name: 'Notion',
        tagline: 'Warm structured calm',
        preview: ['#0075de', '#ffffff', '#f6f5f4'],
        vars: {
            '--bg': '#ffffff',
            '--bg-subtle': '#f6f5f4',
            '--surface': '#ffffff',
            '--surface-elevated': '#ebebea',
            '--primary': '#0075de',
            '--primary-text': '#ffffff',
            '--primary-accent': '#097fe8',
            '--primary-hover': '#005bab',
            '--text-primary': 'rgba(0,0,0,0.95)',
            '--text-secondary': '#615d59',
            '--text-muted': '#a39e98',
            '--border': 'rgba(0,0,0,0.1)',
            '--border-strong': '#31302e',
            '--shadow-ring': 'rgba(0,0,0,0.04) 0px 4px 18px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'stripe',
        name: 'Stripe',
        tagline: 'Purple fintech precision',
        preview: ['#533afd', '#ffffff', '#061b31'],
        vars: {
            '--bg': '#ffffff',
            '--bg-subtle': '#f6f9fc',
            '--surface': '#ffffff',
            '--surface-elevated': '#e5edf5',
            '--primary': '#533afd',
            '--primary-text': '#ffffff',
            '--primary-accent': '#ea2261',
            '--primary-hover': '#4434d4',
            '--text-primary': '#061b31',
            '--text-secondary': '#273951',
            '--text-muted': '#64748d',
            '--border': '#e5edf5',
            '--border-strong': '#061b31',
            '--shadow-ring': 'rgba(50,50,93,0.25) 0px 13px 27px -5px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'zomato',
        name: 'Zomato',
        tagline: 'Food delivery fire',
        preview: ['#e23744', '#ffffff', '#fef2f3'],
        vars: {
            '--bg': '#ffffff',
            '--bg-subtle': '#fef2f3',
            '--surface': '#ffffff',
            '--surface-elevated': '#fde8ea',
            '--primary': '#e23744',
            '--primary-text': '#ffffff',
            '--primary-accent': '#c0392b',
            '--primary-hover': '#c62633',
            '--text-primary': '#1c1c1c',
            '--text-secondary': '#363636',
            '--text-muted': '#93959f',
            '--border': 'rgba(226,55,68,0.12)',
            '--border-strong': '#e23744',
            '--shadow-ring': 'rgba(226,55,68,0.1) 0px 0px 0px 1px',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'netflix',
        name: 'Netflix',
        tagline: 'Bold, cinematic',
        preview: ['#e50914', '#141414', '#221f1f'],
        vars: {
            '--bg': '#141414',
            '--bg-subtle': '#1a1a1a',
            '--surface': '#221f1f',
            '--surface-elevated': '#2f2f2f',
            '--primary': '#e50914',
            '--primary-text': '#ffffff',
            '--primary-accent': '#b81d24',
            '--primary-hover': '#c40812',
            '--text-primary': '#ffffff',
            '--text-secondary': '#bcbcbc',
            '--text-muted': '#808080',
            '--border': 'rgba(255,255,255,0.1)',
            '--border-strong': '#e50914',
            '--shadow-ring': 'rgba(229,9,20,0.2) 0px 0px 0px 1px',
            '--error': '#ff6b75',
            '--error-bg': 'rgba(255,107,117,0.08)',
            '--error-border': 'rgba(255,107,117,0.25)',
            '--bg-overlay': 'rgba(0,0,0,0.7)',
            '--pill-track': 'rgba(255,255,255,0.06)',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        tagline: 'Fresh conversational',
        preview: ['#25d366', '#111b21', '#202c33'],
        vars: {
            '--bg': '#111b21',
            '--bg-subtle': '#202c33',
            '--surface': '#2a3942',
            '--surface-elevated': '#374248',
            '--primary': '#25d366',
            '--primary-text': '#111b21',
            '--primary-accent': '#00a884',
            '--primary-hover': '#1ebe5d',
            '--text-primary': '#e9edef',
            '--text-secondary': '#aebac1',
            '--text-muted': '#8696a0',
            '--border': 'rgba(134,150,160,0.15)',
            '--border-strong': '#25d366',
            '--shadow-ring': 'rgba(37,211,102,0.12) 0px 0px 0px 1px',
            '--error': '#ff7875',
            '--error-bg': 'rgba(255,120,117,0.08)',
            '--error-border': 'rgba(255,120,117,0.25)',
            '--bg-overlay': 'rgba(0,0,0,0.65)',
            '--pill-track': 'rgba(255,255,255,0.05)',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'xai',
        name: 'xAI',
        tagline: 'Terminal monochrome',
        preview: ['#ffffff', '#1f2228', '#0a0b0d'],
        vars: {
            '--bg': '#1f2228',
            '--bg-subtle': '#15171b',
            '--surface': '#2a2d34',
            '--surface-elevated': '#32363e',
            '--primary': '#ffffff',
            '--primary-text': '#1f2228',
            '--primary-accent': '#ffffff',
            '--primary-hover': 'rgba(255,255,255,0.9)',
            '--text-primary': '#ffffff',
            '--text-secondary': 'rgba(255,255,255,0.7)',
            '--text-muted': 'rgba(255,255,255,0.5)',
            '--border': 'rgba(255,255,255,0.1)',
            '--border-strong': 'rgba(255,255,255,0.2)',
            '--shadow-ring': 'none',
            '--error': '#ff7875',
            '--error-bg': 'rgba(255,120,117,0.08)',
            '--error-border': 'rgba(255,120,117,0.25)',
            '--bg-overlay': 'rgba(0,0,0,0.65)',
            '--pill-track': 'rgba(255,255,255,0.06)',
        },
        font: 'Plus Jakarta Sans',
    },
    {
        id: 'linear',
        name: 'Linear',
        tagline: 'Dark precision engineering',
        preview: ['#5e6ad2', '#08090a', '#191a1b'],
        vars: {
            '--bg': '#08090a',
            '--bg-subtle': '#0f1011',
            '--surface': '#191a1b',
            '--surface-elevated': '#28282c',
            '--primary': '#5e6ad2',
            '--primary-text': '#ffffff',
            '--primary-accent': '#7170ff',
            '--primary-hover': '#828fff',
            '--text-primary': '#f7f8f8',
            '--text-secondary': '#d0d6e0',
            '--text-muted': '#8a8f98',
            '--border': 'rgba(255,255,255,0.08)',
            '--border-strong': 'rgba(255,255,255,0.15)',
            '--shadow-ring': 'rgba(0,0,0,0.2) 0px 0px 0px 1px',
            '--error': '#ff7875',
            '--error-bg': 'rgba(255,120,117,0.08)',
            '--error-border': 'rgba(255,120,117,0.25)',
            '--bg-overlay': 'rgba(0,0,0,0.7)',
            '--pill-track': 'rgba(255,255,255,0.05)',
        },
        font: 'Plus Jakarta Sans',
    },
];

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

    // Packaging charge + live checkout amounts
    const [packagingCharge, setPackagingCharge] = useState(0);
    const [checkoutCash, setCheckoutCash] = useState('');
    const [checkoutUpi, setCheckoutUpi] = useState('');
    // Checkout Sheet — null = closed, object = open with snapshot
    const [checkoutSheet, setCheckoutSheet] = useState(null);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);

    // POS Cart & Table States
    const defaultTables = { 'Takeaway': [], 'Table 1': [], 'Table 2': [], 'Table 3': [], 'Table 4': [] };
    const [tables, setTables] = useState(defaultTables);
    
    // New Multi-Order State for non-dine-in
    // Format: { 'Takeaway': { 'T-1': [], 'T-2': [] }, 'Delivery': { 'D-1': [] }, ... }
    const [extraOrders, setExtraOrders] = useState({ 'Takeaway': {}, 'Delivery': {}, 'Corporate': {}, 'Party': {} });
    const [activeExtraId, setActiveExtraId] = useState(null); // The specific ID within Takeaway/Delivery/Corporate/Party
    
    const [tableTimers, setTableTimers] = useState({}); // Tracking start time per table
    const [activeTable, setActiveTable] = useState('Table 1');
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
    const [globalDiscount, setGlobalDiscount] = useState(0);      // flat ₹ off
    const [discountPercent, setDiscountPercent] = useState(0);    // % off applied first
    const [editingPriceId, setEditingPriceId] = useState(null);   // item id whose price is being edited
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
        printerApiKey: "",
        // New Fields
        onboarded: false, // Default to false to ensure onboarding shows if needed
        themeId: "wise",
        deliveryEnabled: true,
        pickupEnabled: true,
        corporateEnabled: false,
        partyEnabled: false,
        packagingCharge: 0,
        deliveryCharge: 0,
        minDeliveryAmount: 0,
        freeDeliveryAbove: 0,
        maxDeliveryDistance: 0,
        tailscaleIp: "",
        uiTextSize: "medium"
    });

    // History States
    const [historyData, setHistoryData] = useState([]);
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
    const [historyEndDate, setHistoryEndDate] = useState(new Date().toISOString().split('T')[0]);
    const isRangeFilter = true; // Enforced range-only mode
    const [reprintOrder, setReprintOrder] = useState(null);

    // ── UI SCALING ENGINE ────────────────────────────────────────────────────
    useEffect(() => {
        const scales = { small: '0.85', medium: '1', large: '1.15' };
        const scale = scales[storeConfig.uiTextSize] || '1';
        document.documentElement.style.setProperty('--font-scale', scale);
    }, [storeConfig.uiTextSize]);

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

        // ── Pre-auth Theme Boot ─────────────────────────────────────────────
        // Apply saved theme CSS vars immediately so the lock screen always
        // reflects the correct theme (including dark themes) before API loads.
        const savedThemeId = localStorage.getItem('pos_theme_id') || 'wise';
        const bootTheme = THEMES.find(t => t.id === savedThemeId) || THEMES[0];
        Object.entries(bootTheme.vars).forEach(([k, v]) => {
            document.documentElement.style.setProperty(k, v);
        });
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
    // Monitor service status — reset to DineIn if current channel is disabled
    useEffect(() => {
        const checkMode = () => {
            if (menuMode === 'Takeaway' && !storeConfig.pickupEnabled) return 'DineIn';
            if (menuMode === 'Corporate' && !storeConfig.corporateEnabled) return 'DineIn';
            if (menuMode === 'Delivery' && !storeConfig.deliveryEnabled) return 'DineIn';
            if (menuMode === 'Party' && !storeConfig.partyEnabled) return 'DineIn';
            return menuMode;
        };
        const nextMode = checkMode();
        if (nextMode !== menuMode) {
            setMenuMode(nextMode);
            setActiveTable('Table 1');
        }
    }, [storeConfig.pickupEnabled, storeConfig.corporateEnabled, storeConfig.deliveryEnabled, storeConfig.partyEnabled, menuMode]);

    // 3. Theme Sync — applies all CSS variables from the selected preset
    //    Also persists themeId to localStorage so the lock screen pre-boots
    //    with the correct theme on next cold load.
    useEffect(() => {
        const themeId = storeConfig.themeId || 'wise';
        const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
        Object.entries(theme.vars).forEach(([k, v]) => {
            document.documentElement.style.setProperty(k, v);
        });
        localStorage.setItem('pos_theme_id', themeId);
    }, [storeConfig.themeId]);

    // Fetch Configurations, Menu, and History
    useEffect(() => {
        if (!authMatched) return;

        fetch('/api/settings').then(r => r.json()).then(data => {
            if (data && !data.error) {
                setStoreConfig(data);
                // Also set default UPI if not set
                if (!selectedUpiId && data.defaultUpiId) setSelectedUpiId(data.defaultUpiId);
            }
            setIsConfigLoaded(true);
        }).catch(e => {
            console.error(e);
            setIsConfigLoaded(true); // Don't block UI forever if API fails
        });

        fetchMenu();
        fetchHistory();
    }, [authMatched, activeTab, historyDate, historyEndDate, isRangeFilter]);

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
            const url = `/api/orders?startDate=${historyDate}&endDate=${historyEndDate}`;
            const res = await fetch(url);
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
        
        if (menuMode === 'DineIn') {
            const newTables = { ...tables };
            const tableCart = [...(newTables[activeTable] || [])];
            const existingIdx = tableCart.findIndex(i => i.name === item.name);
            if (existingIdx !== -1) {
                tableCart[existingIdx].qty += 1;
            } else {
                tableCart.push({ id: Date.now(), name: item.name, price: parseFloat(channelPrice), taxRate: parseFloat(item.taxRate || 0), qty: 1 });
            }
            newTables[activeTable] = tableCart;
            setTables(newTables);
            if (tableCart.length === 1 && !tableTimers[activeTable]) {
                setTableTimers(prev => ({ ...prev, [activeTable]: Date.now() }));
            }
        } else {
            // Multi-order non-dine-in
            const currentMode = menuMode;
            const orderId = activeExtraId || `ORD-${Date.now().toString().slice(-4)}`;
            if (!activeExtraId) setActiveExtraId(orderId);

            setExtraOrders(prev => {
                const next = { ...prev };
                const modeOrders = { ...next[currentMode] };
                const orderItems = [...(modeOrders[orderId] || [])];
                
                const existingIdx = orderItems.findIndex(i => i.name === item.name);
                if (existingIdx !== -1) {
                    orderItems[existingIdx].qty += 1;
                } else {
                    orderItems.push({ id: Date.now(), name: item.name, price: parseFloat(channelPrice), taxRate: parseFloat(item.taxRate || 0), qty: 1 });
                }
                
                modeOrders[orderId] = orderItems;
                next[currentMode] = modeOrders;
                return next;
            });
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
        if (menuMode === 'DineIn') {
            const newTables = { ...tables };
            newTables[activeTable] = [];
            setTables(newTables);
            setTableTimers(prev => {
                const next = { ...prev };
                delete next[activeTable];
                return next;
            });
        } else {
            setExtraOrders(prev => {
                const next = { ...prev };
                const modeOrders = { ...next[menuMode] };
                delete modeOrders[activeExtraId];
                next[menuMode] = modeOrders;
                return next;
            });
            setActiveExtraId(null);
        }
        setCustomerName(''); setCustomerPhone(''); setDeliveryAddress(''); setGlobalDiscount(0); setDiscountPercent(0); setSelectedUpiId('');
        setPackagingCharge(0); setCheckoutCash(''); setCheckoutUpi('');
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
        if (menuMode === 'DineIn') {
            setTables(prev => {
                const next = { ...prev };
                next[activeTable] = (next[activeTable] || []).map(i =>
                    i.id === id ? { ...i, [field]: value } : i
                );
                return next;
            });
        } else {
            setExtraOrders(prev => {
                const next = { ...prev };
                const modeOrders = { ...next[menuMode] };
                modeOrders[activeExtraId] = (modeOrders[activeExtraId] || []).map(i =>
                    i.id === id ? { ...i, [field]: value } : i
                );
                next[menuMode] = modeOrders;
                return next;
            });
        }
    };

    // Calculate details for active view
    const currentItems = menuMode === 'DineIn' 
        ? (tables[activeTable] || [])
        : (extraOrders[menuMode]?.[activeExtraId] || []);
        
    const subtotal = currentItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxTotal = currentItems.reduce((sum, item) => sum + ((item.price * item.qty) * (item.taxRate / 100)), 0);
    // Apply % discount first, then flat ₹ discount
    const afterPercent = (subtotal + taxTotal) * (1 - (parseFloat(discountPercent) || 0) / 100);
    const grandTotal = Math.max(0, afterPercent - (parseFloat(globalDiscount) || 0) + (parseFloat(packagingCharge) || 0));
    const totalDiscount = (subtotal + taxTotal) - afterPercent + (parseFloat(globalDiscount) || 0);

    // Opens the dedicated checkout sheet instead of the raw confirm dialog
    const openCheckout = () => {
        if (currentItems.length === 0) return showToast('Cannot finalize an empty table');
        setCheckoutCash('');
        setCheckoutUpi('');
        setCheckoutSheet({ total: grandTotal, subtotal, taxTotal });
    };

    // Called from within the Checkout Sheet after user confirms
    const finalizeBill = async ({ pType, cPaid, uPaid, change, total, pkg }) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNo,
                    tableNo: menuMode === 'DineIn' ? activeTable : `${menuMode} (${activeExtraId})`,
                    subtotal, taxTotal,
                    grandTotal: total,
                    paymentType: pType,
                    cashPaid: cPaid,
                    upiPaid: uPaid,
                    changeReturned: change,
                    packagingCharge: pkg,
                    customerName,
                    customerPhone,
                    deliveryAddress,
                    upiUsed: selectedUpiId || storeConfig.defaultUpiId,
                    items: currentItems
                })
            });
            if (res.ok) {
                setCheckoutSheet(null);
                clearTable();
                setOrderNo(order => order + 1);
                showToast('Transaction Finalized!');
                fetchHistory();
                setPaymentType('CASH');
            } else {
                showToast('Failed to save order.');
            }
        } catch (err) { showToast('Server error saving order.'); }
    };

    const migrateOrder = (targetMode) => {
        if (currentItems.length === 0) return;
        const itemsToMove = [...currentItems];
        const newOrderId = `M-${Date.now().toString().slice(-4)}`;
        
        setExtraOrders(prev => {
            const next = { ...prev };
            const modeOrders = { ...next[targetMode] };
            modeOrders[newOrderId] = itemsToMove;
            next[targetMode] = modeOrders;
            return next;
        });
        
        if (menuMode === 'DineIn') {
            setTables(prev => ({ ...prev, [activeTable]: [] }));
            setTableTimers(prev => { const n = { ...prev }; delete n[activeTable]; return n; });
        } else {
            setExtraOrders(prev => {
                const next = { ...prev };
                const modeOrders = { ...next[menuMode] };
                delete modeOrders[activeExtraId];
                next[menuMode] = modeOrders;
                return next;
            });
        }
        
        setMenuMode(targetMode);
        setActiveExtraId(newOrderId);
        showToast(`Migrating to ${targetMode}...`);
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
            <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)', padding: '1.5rem', fontFamily: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif" }}>
                <form onSubmit={handleAuth} style={{ background: 'var(--bg)', padding: '5rem 3rem', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-ring)', textAlign: 'center', maxWidth: '460px', width: '100%' }}>
                    <Lock size={56} color="var(--text-primary)" style={{ marginBottom: '2.5rem' }} />
                    <h1 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)', fontSize: '3rem', fontWeight: '900', letterSpacing: '-2.5px', lineHeight: '0.85', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mom's Fresh Pot</h1>
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


    // Dynamic Theme Calibrator — resolves active preset
    const activeTheme = THEMES.find(t => t.id === (storeConfig.themeId || 'wise')) || THEMES[0];
    const themeVars = activeTheme.vars;


    // ── LOADING GATE ─────────────────────────────────────────────────────────
    if (authMatched && !isConfigLoaded) {
        return (
            <div style={{ display: 'flex', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Calibrating POS Terminal...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (

        <div className={styles.appContainer} style={{
            background: 'var(--bg)', color: 'var(--text-primary)', minHeight: '100vh', padding: '0.75rem',
            ...Object.fromEntries(Object.entries(themeVars)),
            fontFamily: activeTheme.font || 'Plus Jakarta Sans, Inter, sans-serif'
        }}>
            <div className={styles.controlsSection} style={{ display: activePrint ? 'none' : 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: '1' }}>{storeConfig.name}</h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Unified POS Workspace</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--pill-track)', padding: '0.4rem', borderRadius: '9999px' }}>
                            <button
                                onClick={() => setActiveTab('POS')}
                                style={{
                                    padding: '0.65rem 1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: activeTab === 'POS' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'POS' ? 'var(--primary-text)' : 'var(--text-muted)',
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
                                background: 'var(--surface)', color: 'var(--text-primary)',
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
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: '1.1' }}>Menu Catalog</h1>

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
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.category} onChange={e => setEditingMenuItem({ ...editingMenuItem, category: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>GST Rate (%)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: '12px', padding: '4px', border: '2px solid var(--border)', height: '50px' }}>
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
                                    <div className={styles.formGroup}><label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Dine-In Price</label><input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.priceDineIn} onChange={e => setEditingMenuItem({ ...editingMenuItem, priceDineIn: e.target.value })} /></div>
                                    <div className={styles.formGroup}><label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Delivery Price</label><input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.priceDelivery} onChange={e => setEditingMenuItem({ ...editingMenuItem, priceDelivery: e.target.value })} /></div>
                                    <div className={styles.formGroup}><label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Corporate Price</label><input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '600' }} value={editingMenuItem.priceCorporate} onChange={e => setEditingMenuItem({ ...editingMenuItem, priceCorporate: e.target.value })} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={async () => {
                                        const res = await fetch('/api/menu', { method: 'POST', body: JSON.stringify(editingMenuItem) });
                                        if (res.ok) { showToast('Menu item updated'); setEditingMenuItem(null); fetchMenu(); }
                                    }} style={{ padding: '1rem 2.5rem', borderRadius: '9999px', background: 'var(--primary)', color: 'var(--primary-text)', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Save Update</button>
                                    <button onClick={() => setEditingMenuItem(null)} style={{ padding: '1rem 2.5rem', borderRadius: '9999px', background: 'var(--surface)', color: 'var(--text-primary)', border: '2px solid var(--border)', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
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
                                                }} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'var(--error-bg)', color: 'var(--error)', border: '1px solid var(--error-border)', cursor: 'pointer', fontWeight: '700' }}>Delete</button>
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
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: '1.1' }}>Store Environment</h1>


                        <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: 'var(--bg)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: '800', fontSize: '1.25rem' }}>Store Profile</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
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

                            <div style={{ background: 'var(--bg)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: '800', fontSize: '1.25rem' }}>Hardware & Printer Setup</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Interface Density</label>
                                        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                                            {['small', 'medium', 'large'].map(size => (
                                                <button key={size} type="button" onClick={() => setStoreConfig({ ...storeConfig, uiTextSize: size })}
                                                    style={{ 
                                                        flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer',
                                                        background: storeConfig.uiTextSize === size ? 'var(--primary)' : 'var(--surface)',
                                                        color: storeConfig.uiTextSize === size ? 'var(--primary-text)' : 'var(--text-primary)',
                                                        boxShadow: storeConfig.uiTextSize === size ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                                    }}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Active Tables</label>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '4px', border: '2px solid var(--border)', height: '50px' }}>
                                            <button type="button" onClick={() => setStoreConfig({ ...storeConfig, tableCount: Math.max(1, (storeConfig.tableCount || 1) - 1) })} style={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                                            <input type="number" style={{ border: 'none', background: 'transparent', flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }} value={storeConfig.tableCount} onChange={e => setStoreConfig({ ...storeConfig, tableCount: parseInt(e.target.value) || 0 })} />
                                            <button type="button" onClick={() => setStoreConfig({ ...storeConfig, tableCount: (storeConfig.tableCount || 0) + 1 })} style={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Tailscale Node IP</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '600' }} placeholder="100.x.x.x" value={storeConfig.tailscaleIp || ''} onChange={e => setStoreConfig({ ...storeConfig, tailscaleIp: e.target.value })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Connection Mode</label>
                                        <select className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.printerConnectionMode || 'REMOTE'} onChange={e => setStoreConfig({ ...storeConfig, printerConnectionMode: e.target.value })}>
                                            <option value="REMOTE">Remote Proxy (Cloud/Pi)</option>
                                            <option value="LOCAL">Direct Local (TCP/Port)</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Thermal Font</label>
                                        <select className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.printerFont || 'Inter'} onChange={e => setStoreConfig({ ...storeConfig, printerFont: e.target.value })}>
                                            <option value="Inter">Modern Bold</option>
                                            <option value="Classic">Classic Mono</option>
                                            <option value="Elegant">Serif Mono</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>{storeConfig.printerConnectionMode === 'LOCAL' ? 'Local Interface IP/Path' : 'Remote Server URL'}</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '600' }} placeholder={storeConfig.printerConnectionMode === 'LOCAL' ? 'tcp://192.168.1.100' : 'http://cloud-pos.local'} value={storeConfig.printerInterface || ''} onChange={e => setStoreConfig({ ...storeConfig, printerInterface: e.target.value })} />
                                    </div>
                                    {storeConfig.printerConnectionMode !== 'LOCAL' && (
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Print Server API Key</label>
                                            <input className={styles.input} type="password" style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '600' }} value={storeConfig.printerApiKey || ''} onChange={e => setStoreConfig({ ...storeConfig, printerApiKey: e.target.value })} />
                                        </div>
                                    )}
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Printer Engine</label>
                                        <select className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.printerType} onChange={e => setStoreConfig({ ...storeConfig, printerType: e.target.value })}>
                                            <option value="EPSON">ESC/POS (Epson)</option>
                                            <option value="STAR">STAR (Star Mode)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Headline Scaling (pt)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: '12px', padding: '4px', border: '2px solid var(--border)', height: '50px' }}>
                                            <button type="button" onClick={() => setStoreConfig({ ...storeConfig, printerBoldSize: Math.max(8, (storeConfig.printerBoldSize || 24) - 2) })} style={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                                            <input type="number" style={{ border: 'none', background: 'transparent', flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }} value={storeConfig.printerBoldSize} onChange={e => setStoreConfig({ ...storeConfig, printerBoldSize: parseInt(e.target.value) || 24 })} />
                                            <button type="button" onClick={() => setStoreConfig({ ...storeConfig, printerBoldSize: (storeConfig.printerBoldSize || 0) + 2 })} style={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Calibration Test</label>
                                        <button type="button" onClick={() => handlePrint('TEST')} style={{ height: '50px', width: '100%', borderRadius: '9999px', border: '2px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <Printer size={16} /> RUN TEST PRINT
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '1.5rem', fontWeight: '800', fontSize: '1.25rem' }}>Payment Channels</h3>
                                {(storeConfig.upiIds || []).map((upi, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                        <input className={styles.input} style={{ flex: 1, height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '800' }} value={upi} onChange={e => {
                                            const u = [...storeConfig.upiIds]; u[i] = e.target.value; setStoreConfig({ ...storeConfig, upiIds: u });
                                        }} />
                                        <button type="button" onClick={() => setStoreConfig({ ...storeConfig, defaultUpiId: upi })} style={{ padding: '0.75rem 1.25rem', borderRadius: '9999px', border: 'none', background: storeConfig.defaultUpiId === upi ? 'var(--primary)' : 'var(--surface)', color: storeConfig.defaultUpiId === upi ? 'var(--primary-text)' : 'var(--text-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', boxShadow: 'var(--shadow-ring)' }}>Default</button>
                                        <button type="button" onClick={() => setStoreConfig({ ...storeConfig, upiIds: storeConfig.upiIds.filter((_, idx) => idx !== i) })} style={{ color: 'var(--error)', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setStoreConfig({ ...storeConfig, upiIds: [...(storeConfig.upiIds || []), ""] })} style={{ fontSize: '0.8rem', padding: '0.75rem 1.5rem', borderRadius: '9999px', background: 'var(--surface)', border: '2px solid var(--border)', color: 'var(--text-primary)', fontWeight: '800', cursor: 'pointer' }}>+ Link Account</button>
                            </div>

                            <div style={{ background: 'var(--bg)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                                <h3 style={{ marginBottom: '1rem', fontWeight: '800', fontSize: '1.25rem' }}>Core Operations</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {[
                                        { key: 'deliveryEnabled', label: 'Delivery Service' },
                                        { key: 'pickupEnabled', label: 'Takeaway/Pickup' },
                                        { key: 'corporateEnabled', label: 'Corporate B2B' },
                                        { key: 'partyEnabled', label: 'Birthday/Party' }
                                    ].map(service => (
                                        <div key={service.key} 
                                            onClick={() => setStoreConfig({ ...storeConfig, [service.key]: !storeConfig[service.key] })}
                                            style={{ 
                                                padding: '1.25rem', borderRadius: '24px', cursor: 'pointer',
                                                background: storeConfig[service.key] ? 'var(--primary)' : 'var(--bg-subtle)',
                                                color: storeConfig[service.key] ? 'var(--primary-text)' : 'var(--text-primary)',
                                                border: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                                                transition: 'all 0.2s',
                                                boxShadow: storeConfig[service.key] ? '0 8px 20px rgba(var(--primary-rgb, 0,0,0), 0.2)' : 'none'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>{service.label}</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: '900' }}>{storeConfig[service.key] ? 'ENABLED' : 'DISABLED'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Packaging Charge (₹)</label>
                                        <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.packagingCharge} onChange={e => setStoreConfig({ ...storeConfig, packagingCharge: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Delivery Charge (₹)</label>
                                        <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.deliveryCharge} onChange={e => setStoreConfig({ ...storeConfig, deliveryCharge: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Min Amount (₹)</label>
                                        <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.minDeliveryAmount} onChange={e => setStoreConfig({ ...storeConfig, minDeliveryAmount: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Free Delivery Above (₹)</label>
                                        <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.freeDeliveryAbove || 0} onChange={e => setStoreConfig({ ...storeConfig, freeDeliveryAbove: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Max Distance (KM)</label>
                                        <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '800' }} value={storeConfig.maxDeliveryDistance || 0} onChange={e => setStoreConfig({ ...storeConfig, maxDeliveryDistance: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </div>
                            </div>


                            <button type="submit" style={{ padding: '1.5rem', width: '100%', borderRadius: '9999px', background: 'var(--primary)', color: 'var(--primary-text)', fontSize: '1.1rem', fontWeight: '900', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Sync Configuration Environment</button>
                        </form>

                        <div style={{ background: 'var(--bg-subtle)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)' }}>
                            <h3 style={{ marginBottom: '1rem', fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-1px' }}>Manifest Import</h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--primary)', color: 'var(--primary-text)', padding: '1rem 2rem', borderRadius: '9999px', fontWeight: '800', width: 'fit-content' }}>
                                <Upload size={20} /> Select CSV Source
                                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                        </div>

                        {/* ── THEME STUDIO (MOVED TO BOTTOM) ───────────────────────── */}
                        <div style={{ background: 'var(--bg-subtle)', padding: '2rem', borderRadius: '40px', border: '2px solid var(--border)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Interface Theme</h3>
                                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Choose a look & feel — applied instantly</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                {THEMES.map(theme => {
                                    const isActive = (storeConfig.themeId || 'wise') === theme.id;
                                    // Use the card's OWN theme colors — never inherit from active theme
                                    const cardBg = theme.vars['--surface'] || theme.vars['--bg'];
                                    const cardText = theme.vars['--text-primary'];
                                    const cardMuted = theme.vars['--text-muted'];
                                    const cardBorder = theme.vars['--border'];
                                    return (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            id={`theme-btn-${theme.id}`}
                                            onClick={() => setStoreConfig({ ...storeConfig, themeId: theme.id, primaryColor: theme.vars['--primary'] })}
                                            style={{
                                                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                                                padding: '1.25rem', borderRadius: '20px', cursor: 'pointer', textAlign: 'left',
                                                border: isActive ? `2.5px solid ${theme.vars['--primary']}` : `2px solid ${cardBorder}`,
                                                background: cardBg,
                                                boxShadow: isActive
                                                    ? `0 0 0 4px ${theme.vars['--primary']}33, 0 8px 24px -8px ${theme.vars['--primary']}55`
                                                    : `0 2px 8px rgba(0,0,0,0.12)`,
                                                transform: isActive ? 'translateY(-3px) scale(1.02)' : 'none',
                                                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                                position: 'relative', overflow: 'hidden',
                                                outline: 'none',
                                            }}
                                        >
                                            {/* Color swatch strip — always use theme's own preview colors */}
                                            <div style={{ display: 'flex', gap: '0.35rem', height: '32px' }}>
                                                {theme.preview.map((c, ci) => (
                                                    <div key={ci} style={{
                                                        flex: ci === 0 ? 2 : 1,
                                                        borderRadius: '7px',
                                                        background: c,
                                                        border: '1px solid rgba(128,128,128,0.2)'
                                                    }} />
                                                ))}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                    {/* Hardcode text color from THIS theme, not active theme */}
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: cardText, letterSpacing: '-0.3px' }}>{theme.name}</span>
                                                    {isActive && (
                                                        <span style={{
                                                            fontSize: '0.55rem', fontWeight: '900', padding: '2px 7px',
                                                            borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                            background: theme.vars['--primary'], color: theme.vars['--primary-text'],
                                                            flexShrink: 0,
                                                        }}>Active</span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: cardMuted }}>{theme.tagline}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
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
                                        background: (selectedCategory === 'All' && cat === 'All Items') || selectedCategory === cat ? 'var(--primary)' : 'var(--surface)',
                                        color: (selectedCategory === 'All' && cat === 'All Items') || selectedCategory === cat ? 'var(--primary-text)' : 'var(--text-primary)',
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
                                    <div style={{ display: 'flex', background: 'var(--pill-track)', padding: '0.4rem', borderRadius: '9999px' }}>
                                        {[
                                            'DineIn',
                                            ...(storeConfig.pickupEnabled ? ['Takeaway'] : []),
                                            ...(storeConfig.corporateEnabled ? ['Corporate'] : []),
                                            ...(storeConfig.deliveryEnabled ? ['Delivery'] : []),
                                            ...(storeConfig.partyEnabled ? ['Party'] : [])
                                        ].map(mode => (
                                            <button
                                                key={mode} onClick={() => {
                                                    setMenuMode(mode);
                                                    if (mode === 'DineIn') {
                                                        setActiveTable(activeTable || 'Table 1');
                                                    } else {
                                                        const existing = Object.keys(extraOrders[mode] || {});
                                                        if (existing.length > 0) {
                                                            if (!activeExtraId || !(extraOrders[mode] && extraOrders[mode][activeExtraId])) {
                                                                setActiveExtraId(existing[0]);
                                                            }
                                                        } else {
                                                            setActiveExtraId(null);
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.65rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '-0.5px',
                                                    background: menuMode === mode ? 'var(--primary)' : 'transparent',
                                                    color: menuMode === mode ? 'var(--primary-text)' : 'var(--text-muted)',
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
                                            placeholder="Find Menu Item..."
                                            value={name} onChange={e => handleNameChange(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {menuMode === 'DineIn' ? (
                                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {Array.from({ length: storeConfig.tableCount || 5 }, (_, i) => `Table ${i + 1}`).map(t => (
                                            <button
                                                key={t} onClick={() => setActiveTable(t)}
                                                style={{
                                                    padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800',
                                                    whiteSpace: 'nowrap', transition: 'all 0.25s',
                                                    background: activeTable === t ? 'var(--primary)' : 'var(--bg-subtle)',
                                                    color: activeTable === t ? 'var(--primary-text)' : 'var(--text-primary)'
                                                }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', alignItems: 'center' }}>
                                        {Object.keys(extraOrders[menuMode]).map(id => (
                                            <div key={id} style={{ display: 'flex', alignItems: 'center', background: activeExtraId === id ? 'var(--primary)' : 'var(--bg-subtle)', borderRadius: '9999px', padding: '2px 2px 2px 12px', border: '1px solid var(--border)' }}>
                                                <span onClick={() => setActiveExtraId(id)} style={{ fontSize: '0.75rem', fontWeight: '800', marginRight: '8px', cursor: 'pointer', color: activeExtraId === id ? 'var(--primary-text)' : 'var(--text-primary)' }}>{id}</span>
                                                <button onClick={() => {
                                                    setExtraOrders(prev => { const n = { ...prev }; delete n[menuMode][id]; return n; });
                                                    if (activeExtraId === id) setActiveExtraId(null);
                                                }} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '9999px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <X size={12} color={activeExtraId === id ? 'var(--primary-text)' : 'var(--text-muted)'} />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => {
                                                const newId = `${menuMode.charAt(0)}-${Date.now().toString().slice(-4)}`;
                                                setExtraOrders(prev => { const n = { ...prev }; n[menuMode][newId] = []; return n; });
                                                setActiveExtraId(newId);
                                            }}
                                            style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', border: '2px dashed var(--primary)', background: 'transparent', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer' }}
                                        >
                                            + NEW {menuMode.toUpperCase()}
                                        </button>
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
                                                            background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1rem', cursor: 'pointer', textAlign: 'left',
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '150px',
                                                            transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                                                        }}
                                                        className="menu-card"
                                                    >
                                                        {/* Item name — clamped to 2 lines */}
                                                        <div style={{
                                                            fontWeight: '800', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.35', letterSpacing: '-0.2px',
                                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                                                            flex: '1 1 auto',
                                                        }}>
                                                            {item.name.replace(/_+$/, '')}
                                                        </div>
                                                        {/* Price badge pinned to bottom */}
                                                        <div style={{ flexShrink: 0, marginTop: '0.5rem' }}>
                                                            <div style={{ fontSize: '0.88rem', fontWeight: '900', color: 'var(--primary-text)', background: 'var(--primary)', borderRadius: '10px', padding: '0.45rem 0.75rem', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>₹{p.toLocaleString()}</div>
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
                                <button onClick={clearTable} style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error)', padding: '0.5rem 1.2rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer' }}>CLEAR</button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)' }}>
                                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5, borderBottom: '1px solid var(--border)' }}>
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
                                                    {/* Tap price to override it */}
                                                    {editingPriceId === item.id ? (
                                                        <input
                                                            autoFocus
                                                            type="number"
                                                            defaultValue={item.price}
                                                            onBlur={(e) => {
                                                                const v = parseFloat(e.target.value);
                                                                if (!isNaN(v) && v >= 0) updateCartItem(item.id, 'price', v);
                                                                setEditingPriceId(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') e.target.blur();
                                                                if (e.key === 'Escape') setEditingPriceId(null);
                                                            }}
                                                            style={{ width: '70px', fontSize: '0.75rem', fontWeight: '800', border: '1.5px solid var(--primary)', borderRadius: '6px', padding: '2px 6px', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() => setEditingPriceId(item.id)}
                                                            title="Click to override price"
                                                            style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                                        >
                                                            ₹{item.price} <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>✎</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td align="center">
                                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--pill-track)', borderRadius: '12px', padding: '4px', width: 'fit-content', margin: '0 auto', gap: '0.25rem', border: '1px solid var(--border)' }}>
                                                        <button
                                                            onClick={() => updateCartItem(item.id, 'qty', Math.max(0, item.qty - 1))}
                                                            style={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
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
                                                            style={{ background: 'var(--surface)', border: 'none', borderRadius: '8px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                                                        >
                                                            <Plus size={12} color="var(--text-primary)" strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td align="right" style={{ padding: '0.65rem 1.5rem' }}>
                                                    <div style={{ fontWeight: '900', color: 'var(--text-primary)', fontSize: '0.9rem' }}>₹{(item.price * item.qty).toLocaleString()}</div>
                                                    <button onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.6rem', fontWeight: '800', padding: 0, marginTop: '2px', textTransform: 'uppercase' }}>Discard</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {currentItems.length === 0 && (
                                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem' }}>Awaiting transaction input...</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                                <div style={{ paddingTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}><span>Subtotal</span><span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}><span>GST / Taxes</span><span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{taxTotal.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                                        <span>Total Payable</span>
                                        <span>₹{grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                                
                                {currentItems.length > 0 && (
                                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        {[
                                            'DineIn',
                                            ...(storeConfig.pickupEnabled ? ['Takeaway'] : []),
                                            ...(storeConfig.deliveryEnabled ? ['Delivery'] : []),
                                            ...(storeConfig.corporateEnabled ? ['Corporate'] : []),
                                            ...(storeConfig.partyEnabled ? ['Party'] : [])
                                        ].filter(target => target !== menuMode).map(target => (
                                            <button key={target} onClick={() => migrateOrder(target)} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                Move to {target}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                                    <button disabled={isPrinting} onClick={() => handlePrint('KOT')} style={{ flex: 1, cursor: isPrinting ? 'not-allowed' : 'pointer', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.7rem 0', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.2s' }}>KOT</button>
                                    <button disabled={isPrinting} onClick={() => handlePrint('BILL')} style={{ flex: 1, cursor: isPrinting ? 'not-allowed' : 'pointer', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.7rem 0', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.2s' }}>PRINT</button>
                                    <button disabled={isPrinting} onClick={openCheckout} style={{ flex: 2, cursor: isPrinting ? 'not-allowed' : 'pointer', background: 'var(--primary)', color: 'var(--primary-text)', border: 'none', padding: '0.7rem 0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '800', boxShadow: '0 4px 12px var(--shadow-color, rgba(0,0,0,0.1))', transition: 'all 0.2s' }}>Checkout →</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: '1.1' }}>Order Manifests</h1>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg)', padding: '2rem 2.5rem', borderRadius: '40px', border: '2px solid var(--border)', boxShadow: 'var(--shadow-ring)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>From Date</label>
                                        <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '1.1rem', fontWeight: '900', background: 'var(--bg-subtle)', color: 'var(--text-primary)', padding: '0.6rem 1.25rem', borderRadius: '14px' }} />
                                    </div>
                                    <div style={{ padding: '2rem 0 0 0', color: 'var(--text-muted)' }}><ArrowRight size={20} /></div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>To Date</label>
                                        <input type="date" value={historyEndDate} onChange={e => setHistoryEndDate(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '1.1rem', fontWeight: '900', background: 'var(--bg-subtle)', color: 'var(--text-primary)', padding: '0.6rem 1.25rem', borderRadius: '14px' }} />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <button onClick={() => fetchHistory()} style={{ padding: '0.9rem 2rem', borderRadius: '9999px', border: 'none', background: 'var(--secondary)', color: 'var(--primary-text)', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-lg)' }}>
                                        <RefreshCw size={18} /> REFRESH REPORT
                                    </button>
                                </div>
                            </div>

                            {/* ── ANALYTICS GRID ───────────────────────────────────── */}
                            {(() => {
                                const stats = historyData.reduce((acc, o) => {
                                    acc.revenue += o.grandTotal;
                                    acc.cash += (o.paymentType === 'CASH' ? o.grandTotal : 0);
                                    acc.upi += (o.paymentType === 'UPI' ? o.grandTotal : 0);
                                    acc.orders += 1;
                                    if (o.tableNo?.startsWith('Table')) acc.dineIn += 1;
                                    else acc.others += 1;
                                    return acc;
                                }, { revenue: 0, cash: 0, upi: 0, orders: 0, dineIn: 0, others: 0 });

                                const aov = stats.orders ? stats.revenue / stats.orders : 0;
                                
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                        <div style={{ padding: '1.25rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Gross Revenue</span>
                                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '0.25rem' }}>₹{stats.revenue.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.4rem' }}>{stats.orders} Success Orders</div>
                                        </div>
                                        <div style={{ padding: '1.25rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Payment Mix</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)' }}>CASH (₹{stats.cash.toLocaleString()})</div>
                                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${stats.revenue ? (stats.cash/stats.revenue)*100 : 0}%`, background: 'var(--success)' }}></div>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)' }}>UPI (₹{stats.upi.toLocaleString()})</div>
                                                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${stats.revenue ? (stats.upi/stats.revenue)*100 : 0}%`, background: 'var(--primary)' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.25rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Avg Ticket (AOV)</span>
                                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '0.25rem' }}>₹{aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Per Customer Value</div>
                                        </div>
                                        <div style={{ padding: '1.25rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Service Load</span>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                <div style={{ background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '900' }}>{stats.dineIn}</div>
                                                    <div style={{ fontSize: '0.55rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DINEIN</div>
                                                </div>
                                                <div style={{ background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '900' }}>{stats.others}</div>
                                                    <div style={{ fontSize: '0.55rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXTERN</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
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
                                        <button onClick={() => deleteOrder(order.id)} style={{ padding: '0.75rem', color: 'var(--error)', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={22} /></button>
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
                                        {item.taxRate > 0 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({(item.taxRate).toFixed(1)}% Tax)</span>}
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
                        {totalDiscount > 0 && <div className={styles.totalsRow}><span>Discount{discountPercent > 0 ? ` (${discountPercent}%)` : ''}:</span><span>-₹{totalDiscount.toFixed(2)}</span></div>}
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

            {checkoutSheet && (
                <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(12px)' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: '0 20px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', height: 'auto', maxHeight: '90vh', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '2rem 3rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
                            <div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-1px' }}>Final Settlement</h3>
                                <p style={{ color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{activeTable} • {menuMode} Mode</p>
                            </div>
                            <button onClick={() => setCheckoutSheet(null)} style={{ border: 'none', background: 'var(--surface)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', overflowY: 'auto' }}>
                            {/* Left Column: Summary & Payment */}
                            <div style={{ padding: '2.5rem 3rem', borderRight: '1px solid var(--border)' }}>
                                <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}><span>GST / Tax</span><span>₹{taxTotal.toLocaleString()}</span></div>

                                    {/* Packaging stepper in modal */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>Packaging</span>
                                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border)' }}>
                                            <button onClick={() => setPackagingCharge(v => Math.max(0, v - 5))} style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}><Minus size={12} /></button>
                                            <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '0.85rem' }}>₹{packagingCharge}</span>
                                            <button onClick={() => setPackagingCharge(v => v + 5)} style={{ border: 'none', background: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}><Plus size={12} /></button>
                                        </div>
                                    </div>

                                    {/* Dual Discount Controls */}
                                    <div style={{ marginBottom: '1.5rem', background: 'var(--bg-subtle)', borderRadius: '14px', padding: '1rem', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '0.75rem' }}>Discount</div>
                                        {/* % Discount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                            <span style={{ color: 'var(--error)', fontWeight: '700', fontSize: '0.82rem' }}>% Off</span>
                                            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border)', gap: '2px' }}>
                                                <button onClick={() => setDiscountPercent(v => Math.max(0, v - 5))} style={{ border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}><Minus size={12} /></button>
                                                <input
                                                    type="number" min="0" max="100"
                                                    value={discountPercent}
                                                    onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                                                    style={{ width: '44px', textAlign: 'center', fontWeight: '900', fontSize: '0.85rem', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
                                                />
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', paddingRight: '4px' }}>%</span>
                                                <button onClick={() => setDiscountPercent(v => Math.min(100, v + 5))} style={{ border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}><Plus size={12} /></button>
                                            </div>
                                        </div>
                                        {/* ₹ Flat Discount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--error)', fontWeight: '700', fontSize: '0.82rem' }}>₹ Off</span>
                                            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border)', gap: '2px' }}>
                                                <button onClick={() => setGlobalDiscount(v => Math.max(0, v - 10))} style={{ border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}><Minus size={12} /></button>
                                                <input
                                                    type="number" min="0"
                                                    value={globalDiscount}
                                                    onChange={e => setGlobalDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                                    style={{ width: '44px', textAlign: 'center', fontWeight: '900', fontSize: '0.85rem', border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
                                                />
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', paddingRight: '4px' }}>₹</span>
                                                <button onClick={() => setGlobalDiscount(v => v + 10)} style={{ border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-primary)' }}><Plus size={12} /></button>
                                            </div>
                                        </div>
                                        {/* Show effective saving */}
                                        {totalDiscount > 0 && <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--error)', textAlign: 'right' }}>Saving ₹{totalDiscount.toFixed(2)}</div>}
                                    </div>

                                    <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Payable</span>
                                        <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>₹{grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Payment Method</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['CASH', 'UPI', 'PARTIAL'].map(t => (
                                            <button key={t} onClick={() => setPaymentType(t)} style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid ' + (paymentType === t ? 'var(--primary)' : 'var(--border)'), background: paymentType === t ? 'var(--primary)' : 'var(--surface)', color: paymentType === t ? 'var(--primary-text)' : 'var(--text-primary)', cursor: 'pointer' }}>{t}</button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {(paymentType === 'CASH' || paymentType === 'PARTIAL') && (
                                        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '18px', border: '2px solid ' + (paymentType === 'CASH' ? 'var(--primary)' : 'var(--border)') }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>CASH RECEIVED</label>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', marginRight: '0.5rem' }}>₹</span>
                                                <input
                                                    type="number" autoFocus={paymentType === 'CASH'}
                                                    style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', outline: 'none' }}
                                                    placeholder="0"
                                                    value={checkoutCash}
                                                    onChange={e => setCheckoutCash(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(paymentType === 'UPI' || paymentType === 'PARTIAL') && (
                                        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '18px', border: '2px solid ' + (paymentType === 'UPI' ? 'var(--primary)' : 'var(--border)') }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>UPI RECEIVED {(selectedUpiId || storeConfig.defaultUpiId) && `• ${selectedUpiId || storeConfig.defaultUpiId}`}</label>
                                                {paymentType === 'UPI' && <button onClick={() => setCheckoutUpi(grandTotal)} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer' }}>SET FULL AMOUNT</button>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', marginRight: '0.5rem' }}>₹</span>
                                                <input
                                                    type="number" autoFocus={paymentType === 'UPI'}
                                                    style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', outline: 'none' }}
                                                    placeholder={paymentType === 'UPI' ? grandTotal : "0"}
                                                    value={checkoutUpi}
                                                    onChange={e => setCheckoutUpi(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentType === 'CASH' && (parseFloat(checkoutCash) > grandTotal) && (
                                        <div style={{ background: 'var(--primary-accent)', color: 'var(--primary-text)', padding: '1.5rem', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '800' }}>CHANGE TO RETURN</span>
                                            <span style={{ fontSize: '1.75rem', fontWeight: '900' }}>₹{(parseFloat(checkoutCash) - grandTotal).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {paymentType === 'PARTIAL' && (
                                        <div style={{
                                            padding: '1rem', borderRadius: '14px', textAlign: 'center', fontWeight: '800', fontSize: '0.85rem',
                                            background: (Math.abs((parseFloat(checkoutCash) || 0) + (parseFloat(checkoutUpi) || 0) - grandTotal) < 0.1) ? 'var(--error-bg)' : 'var(--bg-subtle)',
                                            color: (Math.abs((parseFloat(checkoutCash) || 0) + (parseFloat(checkoutUpi) || 0) - grandTotal) < 0.1) ? 'var(--error)' : 'var(--text-secondary)'
                                        }}>
                                            Total Entered: ₹{((parseFloat(checkoutCash) || 0) + (parseFloat(checkoutUpi) || 0)).toLocaleString()}
                                            {Math.abs((parseFloat(checkoutCash) || 0) + (parseFloat(checkoutUpi) || 0) - grandTotal) > 0.1 && ` (Need ₹${grandTotal.toLocaleString()})`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Customer & Final Action */}
                            <div style={{ padding: '2.5rem 3rem', background: 'var(--bg-subtle)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Customer Information</h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                                        <User size={18} color="var(--text-muted)" />
                                        <input
                                            style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', outline: 'none' }}
                                            placeholder="Guest Name" value={customerName} onChange={e => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                                        <Phone size={18} color="var(--text-muted)" />
                                        <input
                                            style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', outline: 'none' }}
                                            placeholder="Link Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                        />
                                    </div>
                                    {(menuMode === 'Delivery' || menuMode === 'Corporate') && (
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                                            <MapPin size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
                                            <textarea
                                                style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', outline: 'none', height: '60px', resize: 'none' }}
                                                placeholder="Surgical delivery address..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <button
                                        onClick={() => {
                                            const c = parseFloat(checkoutCash) || 0;
                                            const u = parseFloat(checkoutUpi) || 0;
                                            const totalPaid = (paymentType === 'CASH') ? c : (paymentType === 'UPI' ? (u || grandTotal) : (c + u));

                                            if (totalPaid < grandTotal) return showToast(`Short by ₹${(grandTotal - totalPaid).toFixed(2)}`);

                                            finalizeBill({
                                                pType: paymentType,
                                                cPaid: paymentType === 'UPI' ? 0 : c,
                                                uPaid: paymentType === 'CASH' ? 0 : (paymentType === 'UPI' ? (u || grandTotal) : u),
                                                change: (totalPaid > grandTotal && paymentType === 'CASH') ? (totalPaid - grandTotal) : 0,
                                                total: grandTotal,
                                                pkg: packagingCharge
                                            });
                                        }}
                                        style={{ width: '100%', padding: '1.5rem', borderRadius: '9999px', border: 'none', background: 'var(--primary)', color: 'var(--primary-text)', fontSize: '1.25rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 40px rgba(var(--primary-rgb, 0,0,0), 0.3)', transition: 'all 0.2s' }}
                                    >
                                        SETTLE TRANSACTION
                                    </button>
                                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                                        By settling, this order will be moved to the manifests and cleared from the live grid.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }}>
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
                            <button onClick={() => { setConfirmDialog(null); setPinInput(''); }} style={{ flex: 1, padding: '1.25rem', borderRadius: '9999px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>Dismiss</button>
                            <button
                                onClick={() => { confirmDialog.onConfirm(pinInput); setConfirmDialog(null); setPinInput(''); }}
                                style={{ flex: 1, padding: '1.25rem', borderRadius: '9999px', border: 'none', background: confirmDialog.isDanger ? 'var(--error)' : 'var(--primary)', color: 'var(--primary-text)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── ONBOARDING ENGINE ────────────────────────────────────────────────── */}
            {authMatched && !storeConfig.onboarded && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '900px', height: '100%', maxHeight: '750px',
                        background: 'var(--bg)', borderRadius: '48px', border: '2px solid var(--border)',
                        boxShadow: '0 30px 100px rgba(0,0,0,0.15)', display: 'flex', overflow: 'hidden'
                    }}>
                        {/* 1. Progress Sidebar */}
                        <div style={{
                            width: '320px', background: 'var(--bg-subtle)', padding: '3rem 2rem',
                            display: 'flex', flexDirection: 'column', gap: '2rem', borderRight: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Store size={22} color="var(--primary-text)" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Setup Terminal</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { step: 1, title: 'Identity', desc: 'Brand & Display' },
                                    { step: 2, title: 'Operations', desc: 'Working Model' },
                                    { step: 3, title: 'Pricing', desc: 'Delivery Rules' },
                                    { step: 4, title: 'Contact', desc: 'Location & UPI' },
                                    { step: 5, title: 'Hardware', desc: 'Infrastructure' },
                                    { step: 6, title: 'Inventory', desc: 'Catalogue Import' }
                                ].map((s, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', gap: '1rem', alignItems: 'center', opacity: (onboardingStep || 1) >= s.step ? 1 : 0.4,
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ 
                                            width: '32px', height: '32px', borderRadius: '50%', background: (onboardingStep || 1) === s.step ? 'var(--primary)' : 'var(--surface)',
                                            color: (onboardingStep || 1) === s.step ? 'var(--primary-text)' : 'var(--text-primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '900', border: '1px solid var(--border)'
                                        }}>{s.step}</div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '900' }}>{s.title}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 'auto', padding: '1.5rem', borderRadius: '24px', background: 'var(--primary)', color: 'var(--primary-text)' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.8 }}>Pro Tip</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', lineHeight: '1.4' }}>Setting up correctly now ensures a smooth first day of sales.</div>
                            </div>
                        </div>

                        {/* 2. Content Area */}
                        <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
                            {(!onboardingStep || onboardingStep === 1) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1' }}>Your Brand Identity.</h1>
                                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>Set your restaurant name and visual density.</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Restaurant Name</label>
                                        <input 
                                            className={styles.input} 
                                            style={{ height: '60px', fontSize: '1.25rem', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontWeight: '900' }} 
                                            value={storeConfig.name} 
                                            onChange={e => setStoreConfig({ ...storeConfig, name: e.target.value })} 
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                            <h3 style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Visual Theme</h3>
                                            <select 
                                                className={styles.input}
                                                style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', fontWeight: '800' }}
                                                value={storeConfig.themeId}
                                                onChange={e => setStoreConfig({ ...storeConfig, themeId: e.target.value })}
                                            >
                                                {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                            <h3 style={{ fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>UI Scaling</h3>
                                            <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                                                {['small', 'medium', 'large'].map(size => (
                                                    <button key={size} type="button" onClick={() => setStoreConfig({ ...storeConfig, uiTextSize: size })}
                                                        style={{ 
                                                            flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer',
                                                            background: storeConfig.uiTextSize === size ? 'var(--primary)' : 'transparent',
                                                            color: storeConfig.uiTextSize === size ? 'var(--primary-text)' : 'var(--text-primary)',
                                                        }}
                                                    >
                                                        {size[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {onboardingStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1' }}>Operational Logic.</h1>
                                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>Select which services you offer at this location.</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[
                                            { key: 'deliveryEnabled', label: 'Delivery', desc: 'Home drop-off' },
                                            { key: 'pickupEnabled', label: 'Takeaway', desc: 'Order & Carry' },
                                            { key: 'corporateEnabled', label: 'Corporate', desc: 'B2B Services' },
                                            { key: 'partyEnabled', label: 'Birthdays', desc: 'Party Booking' }
                                        ].map(service => (
                                            <div 
                                                key={service.key}
                                                onClick={() => setStoreConfig({ ...storeConfig, [service.key]: !storeConfig[service.key] })}
                                                style={{ 
                                                    padding: '1.25rem', borderRadius: '24px', border: '2px solid var(--border)', cursor: 'pointer',
                                                    background: storeConfig[service.key] ? 'var(--primary)' : 'var(--bg-subtle)',
                                                    color: storeConfig[service.key] ? 'var(--primary-text)' : 'var(--text-primary)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontWeight: '900', fontSize: '1rem' }}>{service.label}</div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.7 }}>{service.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '0.5rem' }}>Registered Dining Tables</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button type="button" onClick={() => setStoreConfig({ ...storeConfig, tableCount: Math.max(1, (storeConfig.tableCount || 1) - 1) })} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: 'var(--surface)', fontWeight: '900', cursor: 'pointer' }}>-</button>
                                            <span style={{ fontSize: '1.5rem', fontWeight: '900', minWidth: '40px', textAlign: 'center' }}>{storeConfig.tableCount}</span>
                                            <button type="button" onClick={() => setStoreConfig({ ...storeConfig, tableCount: (storeConfig.tableCount || 0) + 1 })} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: 'var(--surface)', fontWeight: '900', cursor: 'pointer' }}>+</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {onboardingStep === 3 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1' }}>Pricing & Rules.</h1>
                                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>Automate your delivery and packaging logic.</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Pkg Charge (₹)</label>
                                            <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '800' }} value={storeConfig.packagingCharge} onChange={e => setStoreConfig({ ...storeConfig, packagingCharge: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Delivery (₹)</label>
                                            <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '800' }} value={storeConfig.deliveryCharge} onChange={e => setStoreConfig({ ...storeConfig, deliveryCharge: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Free Delivery Above (₹)</label>
                                            <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '800' }} value={storeConfig.freeDeliveryAbove || 0} onChange={e => setStoreConfig({ ...storeConfig, freeDeliveryAbove: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Max Distance (KM)</label>
                                            <input type="number" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '800' }} value={storeConfig.maxDeliveryDistance || 0} onChange={e => setStoreConfig({ ...storeConfig, maxDeliveryDistance: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {onboardingStep === 4 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1' }}>Location & UPI.</h1>
                                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>Where are you located and how do you get paid?</p>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Shop Address (Billing Line)</label>
                                        <input className={styles.input} style={{ height: '60px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '700' }} value={storeConfig.address} onChange={e => setStoreConfig({ ...storeConfig, address: e.target.value })} placeholder="Full address for bills..." />
                                    </div>
                                    <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '1rem' }}>UPI Identifiers</h3>
                                        {(storeConfig.upiIds || []).map((upi, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input className={styles.input} style={{ height: '40px', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, fontWeight: '700' }} value={upi} onChange={e => {
                                                    const u = [...storeConfig.upiIds]; u[i] = e.target.value; setStoreConfig({ ...storeConfig, upiIds: u });
                                                }} />
                                                <button type="button" onClick={() => setStoreConfig({ ...storeConfig, upiIds: storeConfig.upiIds.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--error)' }}><Trash2 size={16} /></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setStoreConfig({ ...storeConfig, upiIds: [...(storeConfig.upiIds || []), ""] })} style={{ width: '100%', height: '40px', borderRadius: '8px', background: 'var(--surface)', border: '1px dotted var(--border)', fontWeight: '800', cursor: 'pointer' }}>+ Add UPI ID</button>
                                    </div>
                                </div>
                            )}

                            {onboardingStep === 5 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1' }}>Hardware Core.</h1>
                                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>Define your networking and thermal fonts.</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Print Server API Key</label>
                                            <input type="password" className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '600' }} value={storeConfig.printerApiKey || ''} onChange={e => setStoreConfig({ ...storeConfig, printerApiKey: e.target.value })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Thermal Font</label>
                                            <select className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '800' }} value={storeConfig.printerFont || 'Inter'} onChange={e => setStoreConfig({ ...storeConfig, printerFont: e.target.value })}>
                                                <option value="Inter">Modern Bold</option>
                                                <option value="Classic">Classic Mono</option>
                                                <option value="Elegant">Serif Mono</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Tailscale IP (100.x.x.x)</label>
                                        <input className={styles.input} style={{ height: '50px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-subtle)', fontWeight: '600' }} placeholder="Connect your Cloud Printer..." value={storeConfig.tailscaleIp || ''} onChange={e => setStoreConfig({ ...storeConfig, tailscaleIp: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {onboardingStep === 6 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1' }}>Catalogue Import.</h1>
                                        <p style={{ color: 'var(--text-muted)', fontWeight: '700', marginTop: '0.5rem' }}>Upload your menu to start selling instantly.</p>
                                    </div>
                                    <div style={{ 
                                        padding: '4rem 2rem', borderRadius: '40px', border: '3px dashed var(--border)', 
                                        background: 'var(--bg-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-text)' }}>
                                            <Upload size={40} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.5rem' }}>Import Menu Manifest</h3>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>Drop your CSV here or click to browse</p>
                                        </div>
                                        <label style={{ 
                                            background: 'var(--text-primary)', color: 'var(--bg)', padding: '1rem 2.5rem', borderRadius: '9999px', fontWeight: '900', 
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' 
                                        }}>
                                            CHOOSE FILE
                                            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => {
                                                handleFileUpload(e);
                                                showToast("Catalogue Linked Successfully!");
                                            }} />
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800' }}>
                                        <Ticket size={16} />
                                        <span>Pro Tip: You can skipped this and add items manually.</span>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                                {onboardingStep > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => setOnboardingStep(onboardingStep - 1)}
                                        style={{ height: '60px', padding: '0 2rem', borderRadius: '9999px', background: 'var(--bg-subtle)', border: '2px solid var(--border)', fontWeight: '900', cursor: 'pointer' }}
                                    >
                                        BACK
                                    </button>
                                )}
                                <button 
                                    type="button" 
                                    onClick={async () => {
                                        if (onboardingStep < 6) {
                                            setOnboardingStep((onboardingStep || 1) + 1);
                                        } else {
                                            // Finalize Onboarding
                                            const finalConfig = { ...storeConfig, onboarded: true };
                                            try {
                                                const res = await fetch('/api/settings', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(finalConfig)
                                                });
                                                if (res.ok) {
                                                    setStoreConfig(finalConfig);
                                                    showToast("POS Terminal Operational! 🚀");
                                                }
                                            } catch (e) { showToast("Error saving setup."); }
                                        }
                                    }}
                                    style={{ flex: 1, height: '60px', borderRadius: '9999px', background: 'var(--primary)', color: 'var(--primary-text)', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 10px 30px var(--primary)33' }}
                                >
                                    {onboardingStep === 6 ? 'FINALIZE SETUP' : 'CONTINUE'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

