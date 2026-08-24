const fs = require('fs');
const file = 'e:/Agentic/agent-6/Agent6_FE/src/pages/Applications.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/#9333ea/g, '#FF5A14')
                 .replace(/#7e22ce/g, '#F56B2F')
                 .replace(/#f3e8ff/g, 'rgba(255, 90, 20, 0.08)')
                 .replace(/#fdf4ff/g, '#FFF7F2')
                 .replace(/#e9d5ff/g, '#FF8A55');

content = content.replace(/#16a34a/g, '#FF5A14')
                 .replace(/#f0fdf4/g, '#FFF7F2')
                 .replace(/#bbf7d0/g, '#FF8A55')
                 .replace(/#4f46e5/g, '#FF5A14')
                 .replace(/#6366f1/g, '#FF5A14')
                 .replace(/#e0e7ff/g, '#FFF7F2')
                 .replace(/#c7d2fe/g, '#FF8A55');

content = content.replace(/color:\s*'(#0f172a|#1e293b|#334155|#374151)'/g, "color: themeColors.textPrimary")
                 .replace(/color:\s*'(#475569|#64748b)'/g, "color: themeColors.textSecondary");

content = content.replace(/bgcolor:\s*'(#f8fafc|#fafafa|#ffffff|#fff|#f1f5f9)'/g, "bgcolor: themeColors.cardBg");

content = content.replace(/backgroundColor:\s*viewMode \? '#f1f5f9' : '#fff'/g, "backgroundColor: viewMode ? themeColors.bg : themeColors.cardBg");

content = content.replace(/color="success"/g, 'color="primary"')
                 .replace(/color="warning"/g, 'color="primary"')
                 .replace(/color="error"/g, 'color="inherit"');

// Fix border colors that might be too bright in dark mode, or use borderLight
content = content.replace(/border:\s*'1px solid (#e2e8f0|#e5e7eb)'/g, "border: themeColors.border");
content = content.replace(/borderColor:\s*darkMode \? '#334155' : '#e2e8f0'/g, "borderColor: themeColors.borderHex");

fs.writeFileSync(file, content, 'utf8');
console.log('done');
