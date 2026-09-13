const fs = require('fs');
const files = [
  'src/routes/admin.tsx',
  'src/routes/admin/index.tsx',
  'src/routes/admin/orders.tsx',
  'src/routes/admin/products.tsx',
  'src/routes/admin/customers.tsx',
  'src/routes/admin/sales.tsx',
  'src/routes/admin/discounts.tsx',
  'src/routes/admin/appearance.tsx',
  'src/routes/admin/delivery.tsx',
  'src/routes/admin/settings.tsx',
  'src/routes/admin/help.tsx',
  'src/routes/admin/activity-logs.tsx',
];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g);
  const imports = importMatches ? importMatches.map(m => m.replace(/from\s+/, '')) : [];
  const unresolved = imports.filter(imp => {
    if (imp.startsWith('@/')) {
      const modulePath = imp.replace(/^@\//, '');
      const fullPath = 'src/' + modulePath;
      return !fs.existsSync(fullPath);
    }
    return false;
  });
  if (unresolved.length > 0) {
    console.log('WARN', f, ':', unresolved.join(', '));
  } else {
    console.log('OK', f);
  }
}
