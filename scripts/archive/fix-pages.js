const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');

function fixExports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixExports(fullPath);
        } else if (file === 'page.tsx') {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Fix export function
            if (!content.includes('export default function') && content.includes('export function')) {
                content = content.replace(/export function/g, 'export default function');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed export in', fullPath);
            }
        }
    }
}

fixExports(appDir);
