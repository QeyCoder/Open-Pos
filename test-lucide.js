try {
    const lucide = require('lucide-react');
    console.log('Lucide-react found:', Object.keys(lucide).slice(0, 5));
} catch (e) {
    console.error('Lucide-react NOT found in node:', e.message);
}
