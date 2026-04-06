const lucide = require('lucide-react');
const icons = ['Printer', 'Trash2', 'Utensils', 'Ticket', 'Settings', 'Upload', 'History', 'Lock', 'Search', 'Store', 'Plus', 'Minus'];
icons.forEach(icon => {
    if (lucide[icon]) {
        console.log(`Icon ${icon} found`);
    } else {
        console.warn(`Icon ${icon} NOT found`);
    }
});
