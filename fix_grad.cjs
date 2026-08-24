const fs = require('fs');
const file = 'e:/Agentic/agent-6/Agent6_FE/src/pages/Applications.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace linear gradient
content = content.replace(/background: 'linear-gradient\\(90deg, #1e293b 0%, #0f172a 100%\\)'/g, "bgcolor: themeColors.sidebarBg");

// Fix some residual colors that might be bad
content = content.replace(/color:\s*!riskData\.findings\.extracted_details\.patient_details\?\.bmi \? '#475569'/g, "color: !riskData.findings.extracted_details.patient_details?.bmi ? themeColors.textSecondary");

fs.writeFileSync(file, content, 'utf8');
console.log('gradient fixed');
