import pathlib

route_map = {
    'src/routes/admin/activity-logs.tsx': '/admin/activity-logs',
    'src/routes/admin/appearance.tsx': '/admin/appearance',
    'src/routes/admin/customers.tsx': '/admin/customers',
    'src/routes/admin/delivery.tsx': '/admin/delivery',
    'src/routes/admin/discounts.tsx': '/admin/discounts',
    'src/routes/admin/help.tsx': '/admin/help',
    'src/routes/admin/orders.tsx': '/admin/orders',
    'src/routes/admin/products.tsx': '/admin/products',
    'src/routes/admin/sales.tsx': '/admin/sales',
    'src/routes/admin/settings.tsx': '/admin/settings',
}

for rel, route in route_map.items():
    path = pathlib.Path(rel)
    text = path.read_text(encoding='utf-8')
    if 'createFileRoute' not in text:
        text = 'import { createFileRoute } from "@tanstack/react-router";\n' + text
    text = text.replace('export const Route = createFileRoute({', f'export const Route = createFileRoute("{route}")({')
    path.write_text(text, encoding='utf-8')

# Remove duplicate layout wrappers from child files.
for rel in route_map:
    path = pathlib.Path(rel)
    text = path.read_text(encoding='utf-8')
    text = text.replace('import { AdminLayout } from "@/components/admin/AdminLayout";\n', '')
    text = text.replace('\n    <AdminLayout>\n', '\n')
    text = text.replace('\n    </AdminLayout>\n', '\n')
    text = text.replace('\n  </AdminLayout>\n', '\n')
    path.write_text(text, encoding='utf-8')

print('route ids restored and child wrappers stripped')
