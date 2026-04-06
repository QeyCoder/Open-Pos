const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.menuItem.deleteMany();
    await prisma.storeConfig.deleteMany();

    await prisma.storeConfig.create({
        data: {
            name: "Mom's Fresh Pot",
            primaryColor: "#9fe870",
            upiIds: "9873552985@apl,momsfreshpot@paytm",
            defaultUpiId: "9873552985@apl",
            tableCount: 10
        }
    });

    const items = [
        { name: "Achari Paneer Tikka", category: "Snacks", priceDineIn: 220, priceDelivery: 240, priceCorporate: 200, taxRate: 5 },
        { name: "Fresh Veggie Pizza", category: "Pizza", priceDineIn: 280, priceDelivery: 320, priceCorporate: 260, taxRate: 5 },
        { name: "Dal Makhani", category: "Main Course", priceDineIn: 180, priceDelivery: 200, priceCorporate: 160, taxRate: 5 },
        { name: "Butter Naan", category: "Bread", priceDineIn: 45, priceDelivery: 50, priceCorporate: 40, taxRate: 5 },
        { name: "Special Garlic Chaap", category: "Snacks", priceDineIn: 210, priceDelivery: 230, priceCorporate: 190, taxRate: 5 }
    ];

    for (const item of items) {
        await prisma.menuItem.create({ data: item });
    }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
