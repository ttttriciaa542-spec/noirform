import { useState } from 'react'
import {
  BarChart3, Bell, Boxes, ChevronDown, ChevronLeft, CircleDollarSign, ClipboardList,
  FileText, FolderKanban, Image, LayoutDashboard, LogOut, Mail, Menu, Package,
  Pencil, Plus, Search, Settings, ShieldCheck, ShoppingBag, Trash2, Truck, Users, X
} from 'lucide-react'
import './admin.css'

const seedProducts = [
  { id: 1, name: 'The Column Dress', category: 'Dresses', price: 680, stock: 12, status: 'Published', featured: true },
  { id: 2, name: 'Form Trouser', category: 'Bottoms', price: 540, stock: 8, status: 'Published', featured: false },
  { id: 3, name: 'The Essential Shirt', category: 'Tops', price: 350, stock: 4, status: 'Published', featured: true },
  { id: 4, name: 'Soft Structure Blazer', category: 'Tops', price: 980, stock: 0, status: 'Draft', featured: false }
]

const nav = [
  ['Overview', [['Dashboard', LayoutDashboard], ['Orders', ClipboardList], ['Products', Package], ['Collections', FolderKanban], ['Categories', Boxes], ['Inventory', Truck]]],
  ['Customers', [['Customers', Users], ['Discounts', CircleDollarSign], ['Reviews', FileText]]],
  ['Business', [['Payments', ShieldCheck], ['Analytics', BarChart3], ['Store Content', Image], ['Messages', Mail], ['Settings', Settings]]]
]

const money = value => `GHS ${Number(value || 0).toLocaleString()}`

function useLocalStore(key, seed) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    const initial = seed && seed.length ? seed : []
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  })
  const save = next => {
    setItems(next)
    localStorage.setItem(key, JSON.stringify(next))
  }
  return [items, save]
}

const sections = {
  Collections: {
    storageKey: 'noir-collections',
    title: 'Collections',
    kicker: 'CATALOG / COLLECTIONS',
    description: 'Organize products into seasonal collections shown on your storefront.',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'handle', label: 'Handle', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'productCount', label: 'Products', type: 'number' }
    ],
    columns: [
      { name: 'title', label: 'Title' },
      { name: 'handle', label: 'Handle' },
      { name: 'productCount', label: 'Products' }
    ],
    searchFields: ['title', 'handle'],
    seed: [
      { id: 1, title: 'SS26 The Quiet Form', handle: 'ss26-quiet-form', description: 'Movement, restraint, and the spaces between.', productCount: 8 },
      { id: 2, title: 'Studio Editions', handle: 'studio-editions', description: 'Curated pieces from the Accra studio.', productCount: 4 }
    ]
  },
  Categories: {
    storageKey: 'noir-categories',
    title: 'Categories',
    kicker: 'CATALOG / CATEGORIES',
    description: 'Manage the categories shown across your storefront.',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'parent', label: 'Parent', type: 'text' },
      { name: 'productCount', label: 'Products', type: 'number' }
    ],
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'slug', label: 'Slug' },
      { name: 'parent', label: 'Parent' },
      { name: 'productCount', label: 'Products' }
    ],
    searchFields: ['name', 'slug'],
    seed: [
      { id: 1, name: 'Dresses', slug: 'dresses', parent: '—', productCount: 2 },
      { id: 2, name: 'Bottoms', slug: 'bottoms', parent: '—', productCount: 2 },
      { id: 3, name: 'Tops', slug: 'tops', parent: '—', productCount: 4 }
    ]
  },
  Customers: {
    storageKey: 'noir-customers',
    title: 'Customers',
    kicker: 'RELATIONSHIPS / CUSTOMERS',
    description: 'Guest customers and their order history live here.',
    fields: [
      { name: 'name', label: 'Full name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'joined', label: 'Joined', type: 'date' },
      { name: 'totalOrders', label: 'Orders', type: 'number' },
      { name: 'totalSpent', label: 'Total spent', type: 'number', money: true }
    ],
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'joined', label: 'Joined' },
      { name: 'totalOrders', label: 'Orders' },
      { name: 'totalSpent', label: 'Spent', money: true }
    ],
    searchFields: ['name', 'email', 'phone'],
    seed: [
      { id: 1, name: 'Ama Mensah', email: 'ama@noirform.co', phone: '+233 20 123 4567', joined: '2025-03-12', totalOrders: 3, totalSpent: 2100 },
      { id: 2, name: 'Kofi Asante', email: 'kofi@noirform.co', phone: '+233 55 987 6543', joined: '2025-06-01', totalOrders: 1, totalSpent: 680 }
    ]
  },
  Discounts: {
    storageKey: 'noir-discounts',
    title: 'Discounts',
    kicker: 'MARKETING / DISCOUNTS',
    description: 'Create percentage and fixed-value codes with usage limits.',
    fields: [
      { name: 'code', label: 'Code', type: 'text' },
      { name: 'type', label: 'Type', type: 'select', options: ['Percentage', 'Fixed'] },
      { name: 'value', label: 'Value', type: 'number' },
      { name: 'usage', label: 'Times used', type: 'number' },
      { name: 'limit', label: 'Uses limit', type: 'number' },
      { name: 'expires', label: 'Expires', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Draft'] }
    ],
    columns: [
      { name: 'code', label: 'Code' },
      { name: 'type', label: 'Type' },
      { name: 'value', label: 'Value' },
      { name: 'usage', label: 'Used' },
      { name: 'expires', label: 'Expires' },
      { name: 'status', label: 'Status', status: true }
    ],
    searchFields: ['code'],
    seed: [
      { id: 1, code: 'WELCOME10', type: 'Percentage', value: 10, usage: 42, limit: 100, expires: '2026-12-31', status: 'Active' },
      { id: 2, code: 'FREESHIP', type: 'Fixed', value: 150, usage: 12, limit: 50, expires: '2026-08-15', status: 'Expired' }
    ]
  },
  Reviews: {
    storageKey: 'noir-reviews',
    title: 'Reviews',
    kicker: 'CUSTOMER VOICE / REVIEWS',
    description: 'Approve, hide, and respond to product reviews.',
    fields: [
      { name: 'product', label: 'Product', type: 'text' },
      { name: 'customer', label: 'Customer', type: 'text' },
      { name: 'rating', label: 'Rating', type: 'number' },
      { name: 'comment', label: 'Comment', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['Approved', 'Pending', 'Hidden'] }
    ],
    columns: [
      { name: 'product', label: 'Product' },
      { name: 'customer', label: 'Customer' },
      { name: 'rating', label: 'Rating', rating: true },
      { name: 'status', label: 'Status', status: true }
    ],
    searchFields: ['product', 'customer', 'comment'],
    seed: [
      { id: 1, product: 'The Column Dress', customer: 'Ama Mensah', rating: 5, comment: 'Perfect fit and beautiful fabric.', status: 'Approved' },
      { id: 2, product: 'Form Trouser', customer: 'Kofi Asante', rating: 4, comment: 'Comfortable and the length is great.', status: 'Pending' }
    ]
  },
  Payments: {
    storageKey: 'noir-payments',
    title: 'Payments',
    kicker: 'FINANCE / PAYMENTS',
    description: 'Paystack transactions and verification status.',
    fields: [
      { name: 'provider', label: 'Provider', type: 'text' },
      { name: 'order', label: 'Order', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number', money: true },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Paid', 'Pending', 'Failed'] }
    ],
    columns: [
      { name: 'provider', label: 'Provider' },
      { name: 'order', label: 'Order' },
      { name: 'amount', label: 'Amount', money: true },
      { name: 'date', label: 'Date' },
      { name: 'status', label: 'Status', status: true }
    ],
    searchFields: ['order', 'provider'],
    seed: [
      { id: 1, provider: 'Paystack', order: 'NF-842917', amount: 1220, date: '2026-09-01', status: 'Paid' },
      { id: 2, provider: 'Paystack', order: 'NF-510293', amount: 680, date: '2026-09-05', status: 'Paid' },
      { id: 3, provider: 'Paystack', order: 'NF-309884', amount: 980, date: '2026-09-08', status: 'Pending' }
    ]
  },
  'Store Content': {
    storageKey: 'noir-store-content',
    title: 'Store Content',
    kicker: 'PUBLIC WEBSITE / CONTENT',
    description: 'Control the public homepage, announcement, brand story, and social links.',
    fields: [
      { name: 'page', label: 'Page', type: 'select', options: ['Home', 'About', 'Contact', 'Collections', 'Shipping', 'Returns'] },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'content', label: 'Content', type: 'textarea' },
      { name: 'visibility', label: 'Visibility', type: 'select', options: ['Visible', 'Hidden'] }
    ],
    columns: [
      { name: 'page', label: 'Page' },
      { name: 'title', label: 'Title' },
      { name: 'visibility', label: 'Visibility', status: true }
    ],
    searchFields: ['page', 'title'],
    seed: [
      { id: 1, page: 'Home', title: 'Hero headline', content: 'Dress with intention.', visibility: 'Visible' },
      { id: 2, page: 'About', title: 'Our story', content: 'Independent clothing studio by Ama Mensah.', visibility: 'Visible' },
      { id: 3, page: 'Contact', title: 'Contact details', content: 'hello@noirform.co', visibility: 'Visible' }
    ]
  },
  Messages: {
    storageKey: 'noir-messages',
    title: 'Messages',
    kicker: 'INBOX / MESSAGES',
    description: 'Reply to customer contact messages from one inbox.',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'sender', label: 'Sender', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'body', label: 'Message', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['Unread', 'Read'] }
    ],
    columns: [
      { name: 'subject', label: 'Subject' },
      { name: 'sender', label: 'Sender' },
      { name: 'email', label: 'Email' },
      { name: 'status', label: 'Status', status: true }
    ],
    searchFields: ['subject', 'sender', 'email'],
    seed: [
      { id: 1, subject: 'Question about sizing', sender: 'Adwoa Mensah', email: 'adwoa@noirform.co', body: 'Does the Column Dress run true to size?', status: 'Unread' },
      { id: 2, subject: 'Order NF-842917 inquiry', sender: 'Kofi Asante', email: 'kofi@noirform.co', body: 'When will my order arrive?', status: 'Read' }
    ]
  },
  Settings: {
    storageKey: 'noir-settings',
    title: 'Settings',
    kicker: 'PRIVATE STUDIO / SETTINGS',
    description: 'Manage brand, shipping, checkout, policies, and payment configuration.',
    fields: [
      { name: 'key', label: 'Key', type: 'text' },
      { name: 'value', label: 'Value', type: 'text' },
      { name: 'type', label: 'Type', type: 'select', options: ['Text', 'Number', 'URL', 'Boolean'] }
    ],
    columns: [
      { name: 'key', label: 'Key' },
      { name: 'value', label: 'Value' },
      { name: 'type', label: 'Type' }
    ],
    searchFields: ['key', 'value'],
    seed: [
      { id: 1, key: 'store_name', value: 'NOIR/FORM', type: 'Text' },
      { id: 2, key: 'store_currency', value: 'GHS', type: 'Text' },
      { id: 3, key: 'shipping_threshold', value: '1000', type: 'Number' },
      { id: 4, key: 'instagram_url', value: 'https://instagram.com/noirform', type: 'URL' }
    ]
  }
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const submit = event => {
    event.preventDefault()
    if (mode === 'reset') { alert('If that owner email exists, reset instructions have been sent.'); setMode('login'); return }
    onLogin(email, password)
  }
  return <main className="admin-login"><div className="login-panel"><a className="admin-logo" href="#home">NOIR<span>/</span>FORM</a><p className="admin-kicker">PRIVATE STUDIO / OWNER ACCESS</p><h1>{mode === 'login' ? 'Welcome back.' : 'Reset access.'}</h1><p className="login-copy">{mode === 'login' ? 'Sign in to manage your clothing brand.' : 'Enter the owner email and we will send reset instructions.'}</p><form onSubmit={submit}>{mode === 'login' ? <><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required /></label><button className="admin-primary" type="submit">Sign in <ChevronRight /></button><button className="forgot" type="button" onClick={() => setMode('reset')}>Forgot password?</button></> : <><label>Owner email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label><button className="admin-primary" type="submit">Send reset link <ChevronRight /></button><button className="forgot" type="button" onClick={() => setMode('login')}>Back to sign in</button></>}</form><small className="login-security"><ShieldCheck size={14} /> Protected owner access</small></div><div className="login-image"><span>NOIR/FORM</span><b>Make fewer.<br />Better things.</b></div></main>
}

function ChevronRight({ size = 17 }) { return <ChevronLeft size={size} style={{ transform: 'rotate(180deg)' }} /> }
function Stat({ label, value, note, tone }) { return <div className="admin-stat"><span>{label}</span><strong>{value}</strong><small className={tone || ''}>{note}</small></div> }

function Dashboard({ orders, products }) {
  const revenue = orders.filter(order => order.payment === 'Paid').reduce((sum, order) => sum + order.total, 0)
  const pending = orders.filter(order => order.status === 'Pending').length
  const processing = orders.filter(order => order.status === 'Processing').length
  const low = products.filter(product => product.stock > 0 && product.stock < 5).length
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">OVERVIEW / TODAY</p><h1>Good morning, Ama.</h1><p className="muted">Here is what is happening with NOIR/FORM today.</p></div><button className="admin-primary compact"><Plus size={16} /> Add product</button></div><div className="stats-grid"><Stat label="Revenue" value={money(revenue)} note={`${orders.length} orders recorded`} /><Stat label="Total orders" value={orders.length} note={`${pending} pending`} /><Stat label="Customers" value={new Set(orders.map(order => order.email)).size} note="Guest customers" /><Stat label="Products" value={products.length} note={`${low} low stock`} tone={low ? 'warning' : ''} /></div><div className="dashboard-grid"><section className="admin-card chart-card"><div className="card-heading"><div><p className="admin-kicker">SALES PERFORMANCE</p><h2>Revenue overview</h2></div><select><option>Last 30 days</option><option>Last 7 days</option><option>Last 3 months</option><option>Last year</option></select></div><div className="chart"><div className="chart-y"><span>GHS 1k</span><span>GHS 750</span><span>GHS 500</span><span>GHS 250</span><span>GHS 0</span></div><div className="bars">{[22, 35, 29, 48, 42, 67, 55, 72, 63, 82, 70, 92].map((height, index) => <div className="bar-column" key={index}><div className="bar" style={{ height: `${height}%` }} /><small>{['01','04','07','10','13','16','19','22','25','28','30',''][index]}</small></div>)}</div></div><div className="chart-summary"><span>Revenue <b>{money(revenue)}</b></span><span>Orders <b>{orders.length}</b></span><span>Avg. order <b>{money(orders.length ? revenue / orders.length : 0)}</b></span></div></section><section className="admin-card"><div className="card-heading"><div><p className="admin-kicker">INBOX</p><h2>Recent orders</h2></div><button className="card-link">View all <ChevronRight size={14} /></button></div>{orders.length === 0 ? <div className="empty-state"><ClipboardList size={22} /><p>No orders yet</p><small>New guest orders will appear here.</small></div> : <div className="mini-list">{orders.slice(0, 5).map(order => <div className="mini-row" key={order.id}><div className="order-dot">{order.customer[0]}</div><div><strong>{order.customer}</strong><small>{order.id} · {order.status}</small></div><b>{money(order.total)}</b></div>)}</div>}</section></div><div className="dashboard-grid lower"><section className="admin-card"><div className="card-heading"><div><p className="admin-kicker">PRODUCTS</p><h2>Best sellers</h2></div><button className="card-link">View products <ChevronRight size={14} /></button></div>{products.slice(0, 4).map((product, index) => <div className="rank-row" key={product.id}><b>0{index + 1}</b><div className="rank-image" /><strong>{product.name}</strong><span>{product.stock} in stock</span></div>)}</section><section className="admin-card"><div className="card-heading"><div><p className="admin-kicker">ATTENTION</p><h2>Low stock</h2></div><span className="count-badge">{low}</span></div>{products.filter(product => product.stock < 5).map(product => <div className="stock-row" key={product.id}><div><strong>{product.name}</strong><small>{product.category}</small></div><b className={product.stock === 0 ? 'out' : ''}>{product.stock === 0 ? 'Out of stock' : `${product.stock} left`}</b></div>)}{low === 0 && <div className="empty-state"><p>Everything is well stocked.</p></div>}</section></div></div> }

function Orders({ orders, updateOrder }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const results = orders.filter(order => (filter === 'All' || order.status === filter) && `${order.id} ${order.customer} ${order.email}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">BUSINESS / ORDERS</p><h1>Orders</h1><p className="muted">Manage guest purchases and fulfillment.</p></div></div><div className="admin-card table-card"><div className="table-toolbar"><div className="search-field"><Search size={15} /><input placeholder="Search orders..." value={query} onChange={event => setQuery(event.target.value)} /></div><select value={filter} onChange={event => setFilter(event.target.value)}><option>All</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select></div><div className="responsive-table"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th /></tr></thead><tbody>{results.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td><strong>{order.customer}</strong><small>{order.email}</small></td><td>{order.date}</td><td>{money(order.total)}</td><td><span className={`status ${order.payment.toLowerCase()}`}>{order.payment}</span></td><td><select value={order.status} onChange={event => updateOrder(order.id, event.target.value)}>{['Pending','Processing','Shipped','Delivered','Cancelled','Refunded'].map(status => <option key={status}>{status}</option>)}</select></td><td><button className="icon-action"><Pencil size={15} /></button></td></tr>)}</tbody></table>{results.length === 0 && <div className="empty-state"><ClipboardList size={22} /><p>No matching orders</p></div>}</div></div></div> }

function Products({ products, setProducts }) {
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const filtered = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()))
  const save = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const item = { id: editing?.id || Date.now(), name: data.get('name'), category: data.get('category'), price: Number(data.get('price')), stock: Number(data.get('stock')), status: data.get('status'), featured: editing?.featured || false }
    setProducts(current => editing ? current.map(product => product.id === editing.id ? item : product) : [...current, item])
    setEditing(null)
  }
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">CATALOG / PRODUCTS</p><h1>Products</h1><p className="muted">Your brand catalog, variants, pricing, and inventory.</p></div><button className="admin-primary compact" onClick={() => setEditing({})}><Plus size={16} /> Add product</button></div><div className="admin-card table-card"><div className="table-toolbar"><div className="search-field"><Search size={15} /><input placeholder="Search products..." value={query} onChange={event => setQuery(event.target.value)} /></div><span className="muted">{products.length} products</span></div><div className="responsive-table"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Inventory</th><th>Status</th><th /></tr></thead><tbody>{filtered.map(product => <tr key={product.id}><td><div className="product-name"><div className="admin-product-thumb" /><strong>{product.name}</strong></div></td><td>{product.category}</td><td>{money(product.price)}</td><td><span className={product.stock < 5 ? 'stock-warning' : ''}>{product.stock}</span></td><td><span className={`status ${product.status.toLowerCase()}`}>{product.status}</span></td><td><button className="icon-action" onClick={() => setEditing(product)}><Pencil size={15} /></button><button className="icon-action danger" onClick={() => setProducts(products.filter(item => item.id !== product.id))}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div></div>{editing && <div className="modal-backdrop"><form className="admin-modal" onSubmit={save}><div className="modal-head"><div><p className="admin-kicker">CATALOG</p><h2>{editing.id ? 'Edit product' : 'Add product'}</h2></div><button type="button" onClick={() => setEditing(null)}><X size={18} /></button></div><label>Product name<input name="name" defaultValue={editing.name || ''} required /></label><div className="modal-grid"><label>Category<select name="category" defaultValue={editing.category || 'Tops'}><option>Tops</option><option>Bottoms</option><option>Dresses</option><option>Accessories</option></select></label><label>Price<input name="price" type="number" defaultValue={editing.price || ''} required /></label><label>Inventory<input name="stock" type="number" defaultValue={editing.stock ?? ''} required /></label><label>Status<select name="status" defaultValue={editing.status || 'Draft'}><option>Draft</option><option>Published</option></select></label></div><label>Description<textarea rows="4" placeholder="Describe the piece..." /></label><button className="admin-primary" type="submit">Save product <ChevronRight /></button></form></div>}</div> }

function Inventory({ products, setProducts }) {
  const adjust = (id, amount) => setProducts(products.map(product => product.id === id ? { ...product, stock: Math.max(0, product.stock + amount) } : product))
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">CATALOG / INVENTORY</p><h1>Inventory</h1><p className="muted">Track available stock and make manual adjustments.</p></div></div><div className="admin-card table-card"><div className="table-toolbar"><span className="muted">Stock updates are recorded in the activity log.</span><button className="admin-secondary">Set low-stock threshold</button></div><div className="responsive-table"><table><thead><tr><th>Product</th><th>Variant</th><th>SKU</th><th>Current stock</th><th>Available</th><th>Adjustment</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><strong>{product.name}</strong></td><td>Default / All</td><td>NF-{product.id}00</td><td><span className={product.stock < 5 ? 'stock-warning' : ''}>{product.stock}</span></td><td>{product.stock}</td><td><div className="adjustment"><button onClick={() => adjust(product.id, -1)}>-</button><span>Adjust</span><button onClick={() => adjust(product.id, 1)}>+</button></div></td></tr>)}</tbody></table></div></div></div> }

function renderCell(col, value, item) {
  if (col.render) return col.render(value, item)
  if (col.money) return money(value)
  if (col.rating) return `★ ${value}`
  if (col.status) return <span className={`status ${String(value).toLowerCase()}`}>{value}</span>
  return value
}

function EditableSection({ schema }) {
  const { title, fields, columns, searchFields } = schema
  const [items, save] = useLocalStore(schema.storageKey, schema.seed)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const singular = title.toLowerCase().replace(/s$/, '')
  const filtered = items.filter(item => searchFields.some(field => String(item[field] || '').toLowerCase().includes(query.toLowerCase())))
  const handleSubmit = event => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const item = { id: editing.id }
    fields.forEach(field => {
      const raw = data.get(field.name)
      item[field.name] = field.type === 'number' ? Number(raw) : raw
    })
    if (editing.id) {
      save(items.map(existing => existing.id === editing.id ? item : existing))
    } else {
      item.id = Date.now()
      save([item, ...items])
    }
    setEditing(null)
  }
  const removeItem = id => save(items.filter(item => item.id !== id))
  if (editing) {
    return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">{schema.kicker}</p><h1>{editing.id ? 'Edit' : 'Add'} {singular}</h1></div></div><div className="modal-backdrop"><form className="admin-modal" onSubmit={handleSubmit}><div className="modal-head"><div><p className="admin-kicker">{schema.kicker}</p><h2>{editing.id ? 'Edit' : 'Add'} {singular}</h2></div><button type="button" onClick={() => setEditing(null)}><X size={18} /></button></div><div className="modal-grid">{fields.map(field => {
      const value = editing[field.name] ?? ''
      return (
        <label key={field.name}>{field.label}
          {field.type === 'select'
            ? <select name={field.name} defaultValue={value}>{field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
            : field.type === 'textarea'
              ? <textarea name={field.name} rows="3" defaultValue={value} />
              : <input name={field.name} type={field.type} defaultValue={value} />}
        </label>
      )
    })}</div><button className="admin-primary" type="submit">Save {singular} <ChevronRight /></button></form></div></div>
  }
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">{schema.kicker}</p><h1>{title}</h1><p className="muted">{schema.description}</p></div><button className="admin-primary compact" onClick={() => setEditing({})}><Plus size={16} /> Add {singular}</button></div><div className="admin-card table-card"><div className="table-toolbar"><div className="search-field"><Search size={15} /><input placeholder={`Search ${title.toLowerCase()}...`} value={query} onChange={event => setQuery(event.target.value)} /></div><span className="muted">{items.length} {title.toLowerCase()}</span></div><div className="responsive-table"><table><thead><tr>{columns.map(col => <th key={col.name}>{col.label}</th>)}<th /></tr></thead><tbody>{filtered.map(item => <tr key={item.id}>{columns.map(col => <td key={col.name}>{renderCell(col, item[col.name], item)}</td>)}<td><button className="icon-action" onClick={() => setEditing(item)}><Pencil size={15} /></button><button className="icon-action danger" onClick={() => removeItem(item.id)}><Trash2 size={15} /></button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><ClipboardList size={22} /><p>No matching {title.toLowerCase()}</p></div>}</div></div></div>
}

function Analytics({ orders, products }) {
  const revenue = orders.filter(order => order.payment === 'Paid').reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const totalCustomers = new Set(orders.map(order => order.email)).size
  const bestsellers = [...products].sort((a, b) => b.featured - a.featured).slice(0, 4)
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">BUSINESS / ANALYTICS</p><h1>Analytics</h1><p className="muted">Sales, products sold, customers, and collection performance.</p></div></div><div className="stats-grid"><Stat label="Revenue" value={money(revenue)} note={`${totalOrders} orders`} /><Stat label="Orders" value={totalOrders} note="All time" /><Stat label="Customers" value={totalCustomers} note="Unique buyers" /><Stat label="Products" value={products.length} note="In catalog" /></div><div className="admin-card"><div className="card-heading"><div><p className="admin-kicker">TOP PRODUCTS</p><h2>Bestsellers</h2></div></div><div className="responsive-table"><table><thead><tr><th>Product</th><th>Price</th><th>Inventory</th><th /></tr></thead><tbody>{bestsellers.map(product => <tr key={product.id}><td><div className="product-name"><div className="admin-product-thumb" /><strong>{product.name}</strong></div></td><td>{money(product.price)}</td><td><span className={product.stock < 5 ? 'stock-warning' : ''}>{product.stock}</span></td><td><span className={`status ${product.status.toLowerCase()}`}>{product.status}</span></td></tr>)}</tbody></table></div></div></div> }

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('noir-admin-session') === 'active')
  const [active, setActive] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('noir-orders') || '[]'))
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('noir-admin-products') || JSON.stringify(seedProducts)))
  const login = (email, password) => {
    if (email === 'owner@noirform.co' && password === 'noir2026') {
      sessionStorage.setItem('noir-admin-session', 'active')
      setAuthenticated(true)
    } else alert('Owner email or password is incorrect.')
  }
  const logout = () => {
    sessionStorage.removeItem('noir-admin-session')
    setAuthenticated(false)
  }
  const updateProducts = next => {
    setProducts(next)
    localStorage.setItem('noir-admin-products', JSON.stringify(next))
  }
  const updateOrder = (id, status) => {
    const next = orders.map(order => order.id === id ? { ...order, status } : order)
    setOrders(next)
    localStorage.setItem('noir-orders', JSON.stringify(next))
  }
  if (!authenticated) return <Login onLogin={login} />
  const specialViews = {
    Dashboard: () => <Dashboard orders={orders} products={products} />,
    Orders: () => <Orders orders={orders} updateOrder={updateOrder} />,
    Products: () => <Products products={products} setProducts={updateProducts} />,
    Inventory: () => <Inventory products={products} setProducts={updateProducts} />,
    Analytics: () => <Analytics orders={orders} products={products} />
  }
  const view = active in specialViews
    ? specialViews[active]()
    : active in sections
      ? <EditableSection schema={sections[active]} />
      : <EditableSection schema={sections.Settings} />
  return <div className="admin-shell"><aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}><div className="sidebar-top"><a className="admin-logo" href="#admin">NOIR<span>/</span>FORM</a><button className="sidebar-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div><p className="owner-label">OWNER ADMIN</p><nav>{nav.map(([group, items]) => <div className="nav-group" key={group}><small>{group}</small>{items.map(([label, Icon]) => <button className={active === label ? 'active' : ''} key={label} onClick={() => { setActive(label); setMobileOpen(false) }}><Icon size={16} /><span>{label}</span>{label === 'Orders' && orders.length > 0 && <b>{orders.length}</b>}</button>)}</div>)}</nav><div className="sidebar-bottom"><div className="admin-profile"><div>AM</div><span><strong>Ama Mensah</strong><small>Owner</small></span></div><button className="logout" onClick={logout}><LogOut size={15} /> Log out</button></div></aside><main className="admin-main"><header className="admin-header"><button className="admin-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="header-breadcrumb">NOIR/FORM <span>/</span> {active}</div><div className="header-actions"><button><Bell size={18} /><i /></button><a href="#home" className="view-store">View store <ChevronRight size={14} /></a></div></header>{view}</main></div> }
