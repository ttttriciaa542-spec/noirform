import pathlib

files = [
    pathlib.Path('src/routes/admin/activity-logs.tsx'),
    pathlib.Path('src/routes/admin/appearance.tsx'),
    pathlib.Path('src/routes/admin/customers.tsx'),
    pathlib.Path('src/routes/admin/delivery.tsx'),
    pathlib.Path('src/routes/admin/discounts.tsx'),
    pathlib.Path('src/routes/admin/help.tsx'),
    pathlib.Path('src/routes/admin/orders.tsx'),
    pathlib.Path('src/routes/admin/products.tsx'),
    pathlib.Path('src/routes/admin/sales.tsx'),
    pathlib.Path('src/routes/admin/settings.tsx'),
]

for path in files:
    text = path.read_text(encoding='utf-8')
    text = text.replace('import { AdminLayout } from "@/components/admin/AdminLayout";\n', '')
    text = text.replace('\n    <AdminLayout>\n', '\n')
    text = text.replace('\n    </AdminLayout>\n', '\n')
    text = text.replace('\n  </AdminLayout>\n', '\n')
    path.write_text(text, encoding='utf-8')

print('child admin layout wrappers removed')
