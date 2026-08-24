const fs = require('fs');
const path = require('path');

const pwcMapping = {
    // Solid Blues to Primary Orange
    '#3b82f6': '#FF5A14',
    '#2563eb': '#FF5A14',
    '#0369a1': '#FF5A14',
    
    // Light Blue Backgrounds to Light Orange / Hover Orange
    '#eff6ff': '#FFF7F2',
    '#dbeafe': 'rgba(255, 90, 20, 0.08)',
    '#e0f2fe': '#FFF7F2',
    
    // Borders
    '#bfdbfe': '#FF8A55',

    // Dark Blue
    '#1e3a5f': '#4A4A4A',
    
    // Some purples that slipped through in timeline
    '#8b5cf6': '#F56B2F',
    '#7c3aed': '#FF7A45'
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            for (const [blue, pwc] of Object.entries(pwcMapping)) {
                const regex = new RegExp(blue, 'gi');
                content = content.replace(regex, pwc);
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'src', 'pages'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('done');
