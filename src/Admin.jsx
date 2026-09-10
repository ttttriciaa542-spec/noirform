import { useEffect, useState } from 'react'
import { BarChart3, Bell, Boxes, ChevronLeft, CircleDollarSign, ClipboardList, FileText, FolderKanban, Image, LayoutDashboard, LogOut, Mail, Menu, Package, Pencil, Plus, Search, Settings, ShieldCheck, Trash2, Truck, Users, X } from 'lucide-react'
import './admin.css'

const nav = [
  ['Overview', [['Dashboard', LayoutDashboard], ['Orders', ClipboardList], ['Products', Package], ['Collections', FolderKanban], ['Categories', Boxes], ['Inventory', Truck]]],
  ['Customers', [['Customers', Users], ['Discounts', CircleDollarSign], ['Reviews', FileText]]],
  ['Business', [['Payments', ShieldCheck], ['Analytics', BarChart3], ['Store Content', Image], ['Messages', Mail], ['Settings', Settings]]]
]
const tokenKey = 'noir-admin-token'
const money = value => `GHS ${Number(value || 0).toLocaleString()}`

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}), ...(sessionStorage.getItem(tokenKey) ? { Authorization: `Bearer ${sessionStorage.getItem(tokenKey)}` } : {}) }
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`)
  return body
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async event => { event.preventDefault(); setError(''); try { await onLogin(email, password) } catch (e) { setError(e.message) } }
  return <main className="admin-login"><div className="login-panel"><a className="admin-logo" href="#home">NOIR<span>/</span>FORM</a><p className="admin-kicker">PRIVATE STUDIO / OWNER ACCESS</p><h1>Welcome back.</h1><p className="login-copy">Sign in to manage your clothing brand.</p><form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p className="form-error">{error}</p>}<button className="admin-primary" type="submit">Sign in <ChevronRight /></button></form><small className="login-security"><ShieldCheck size={14} /> Protected owner access</small></div><div className="login-image"><span>NOIR/FORM</span><b>Make fewer.<br />Better things.</b></div></main>
}
function ChevronRight({ size = 17 }) { return <ChevronLeft size={size} style={{ transform: 'rotate(180deg)' }} /> }
function Stat({ label, value, note }) { return <div className="admin-stat"><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function Loading() { return <div className="admin-card loading-state">Loading data...</div> }
function Empty({ label }) { return <div className="empty-state"><ClipboardList size={22} /><p>No {label} found</p></div> }
function ErrorState({ message }) { return <div className="admin-content"><div className="admin-card error-state"><strong>Could not load this section</strong><p>{message}</p></div></div> }

const configs = {
  Collections: { endpoint: '/admin/collections', title: 'Collections', fields: [['title', 'Title', 'text'], ['slug', 'Handle', 'text'], ['description', 'Description', 'textarea'], ['published', 'Published', 'checkbox']] },
  Categories: { endpoint: '/admin/categories', title: 'Categories', fields: [['name', 'Name', 'text'], ['slug', 'Slug', 'text'], ['sort_order', 'Order', 'number']] },
  Discounts: { endpoint: '/admin/discounts', title: 'Discounts', fields: [['code', 'Code', 'text'], ['type', 'Type', 'select', ['percentage', 'fixed']], ['value', 'Value', 'number'], ['minimum_amount', 'Minimum order', 'number'], ['usage_limit', 'Usage limit', 'number'], ['per_customer_limit', 'Per customer limit', 'number'], ['expires_at', 'Expires', 'datetime-local'], ['status', 'Status', 'select', ['Active', 'Disabled']]] },
  Reviews: { endpoint: '/admin/reviews', title: 'Reviews', fields: [['product_id', 'Product ID', 'number'], ['customer_name', 'Customer', 'text'], ['rating', 'Rating', 'number'], ['comment', 'Comment', 'textarea'], ['status', 'Status', 'select', ['Pending', 'Approved', 'Hidden']]] },
  Messages: { endpoint: '/admin/messages', title: 'Messages', fields: [['status', 'Status', 'select', ['Unread', 'Read', 'Replied']], ['subject', 'Subject', 'text'], ['body', 'Message', 'textarea']] },
  Settings: { endpoint: '/admin/settings', title: 'Settings', fields: [['key', 'Key', 'text'], ['value', 'Value', 'text'], ['type', 'Type', 'select', ['Text', 'Number', 'URL', 'Boolean']], ['category', 'Category', 'text']] },
  'Store Content': { endpoint: '/admin/settings', title: 'Store Content', fields: [['key', 'Content key', 'text'], ['value', 'Content value', 'textarea'], ['type', 'Type', 'select', ['Text', 'URL', 'Boolean']], ['category', 'Category', 'text']] }
}

function Table({ headers, rows, render, actions, empty }) {
  return <div className="responsive-table"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}{actions && <th />}</tr></thead><tbody>{rows.map((row, i) => <tr key={row.id || row.reference || i}>{render(row).map((cell, j) => <td key={j}>{cell}</td>)}{actions && <td>{actions(row)}</td>}</tr>)}</tbody></table>{!rows.length && <Empty label={empty} />}</div>
}
function Toolbar({ query, setQuery, count, placeholder }) { return <div className="table-toolbar"><div className="search-field"><Search size={15} /><input placeholder={placeholder || 'Search...'} value={query} onChange={e => setQuery(e.target.value)} /></div><span className="muted">{count} records</span></div> }
function Page({ title, kicker, error, action, children }) { return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">{kicker}</p><h1>{title}</h1></div>{action}</div>{error && <p className="form-error">{error}</p>}{children}</div> }
function Pagination({ page, pages, setPage }) { if (!pages || pages <= 1) return null; return <div className="table-toolbar"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div> }

function Dashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { request('/admin/dashboard').then(setData).catch(e => setError(e.message)) }, [])
  if (error) return <ErrorState message={error} />; if (!data) return <Loading />
  return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">OVERVIEW / DATABASE</p><h1>Dashboard</h1><p className="muted">Live sales and catalog information.</p></div></div><div className="stats-grid"><Stat label="Revenue" value={money(data.revenue)} note="Paid orders" /><Stat label="Orders" value={data.orders} note={`${data.pending} pending`} /><Stat label="Customers" value={data.customers} note="Guest customers" /><Stat label="Products" value={data.products} note={`${data.low_stock} low stock / ${data.out_of_stock} out`} /></div><div className="dashboard-grid"><section className="admin-card"><div className="card-heading"><div><p className="admin-kicker">RECENT</p><h2>Recent orders</h2></div></div><Table headers={['Order', 'Customer', 'Total', 'Payment', 'Status']} rows={data.recent_orders || []} render={row => [row.order_number, row.customer_name, money(row.total), row.payment_status, row.status]} empty="orders" /></section><section className="admin-card"><div className="card-heading"><div><p className="admin-kicker">PRODUCTS SOLD</p><h2>Best sellers</h2></div></div><Table headers={['Product', 'Sold']} rows={data.bestsellers || []} render={row => [row.name, row.sold || 0]} empty="bestsellers" /></section></div></div>
}

function Orders() {
  const [rows, setRows] = useState([]); const [query, setQuery] = useState(''); const [status, setStatus] = useState('All'); const [error, setError] = useState(''); const [page, setPage] = useState(1); const [meta, setMeta] = useState({})
  const load = () => request(`/admin/orders?search=${encodeURIComponent(query)}&status=${status}&page=${page}`).then(body => { setRows(body.data || body.items || []); setMeta(body.meta || {}) }).catch(e => setError(e.message))
  useEffect(() => { load() }, [query, status, page])
  const update = async (id, value) => { try { await request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: value }) }); load() } catch (e) { setError(e.message) } }
  return <Page title="Orders" kicker="BUSINESS / ORDERS" error={error}><div className="admin-card table-card"><div className="table-toolbar"><div className="search-field"><Search size={15} /><input placeholder="Search orders..." value={query} onChange={e => { setPage(1); setQuery(e.target.value) }} /></div><select value={status} onChange={e => { setPage(1); setStatus(e.target.value) }}>{['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(x => <option key={x}>{x}</option>)}</select></div><Table headers={['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Status']} rows={rows} render={r => [r.order_number, <><strong>{r.customer_name}</strong><small>{r.email}</small></>, new Date(r.created_at).toLocaleDateString(), money(r.total), r.payment_status, <select value={r.status} onChange={e => update(r.id, e.target.value)}>{['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(x => <option key={x}>{x}</option>)}</select>]} empty="orders" /></div><Pagination page={meta.page || page} pages={meta.pages || Math.ceil((meta.total || 0) / (meta.per_page || 20))} setPage={setPage} /></Page>
}

function Products() {
  const [rows, setRows] = useState([]); const [query, setQuery] = useState(''); const [editing, setEditing] = useState(null); const [error, setError] = useState('')
  const load = () => request(`/admin/products?search=${encodeURIComponent(query)}`).then(b => setRows(b.data || [])).catch(e => setError(e.message))
  useEffect(() => { load() }, [query])
  const remove = async id => { if (!window.confirm('Delete this product?')) return; try { await request(`/admin/products/${id}`, { method: 'DELETE' }); load() } catch (e) { setError(e.message) } }
  return <Page title="Products" kicker="CATALOG / PRODUCTS" error={error} action={<button className="admin-primary compact" onClick={() => setEditing({ status: 'Draft', featured: false, variants: [] })}><Plus size={16} /> Add product</button>}><div className="admin-card table-card"><Toolbar query={query} setQuery={setQuery} count={rows.length} placeholder="Search products..." /><Table headers={['Product', 'Price', 'Variants', 'Inventory', 'Status']} rows={rows} render={r => [r.name, money(r.price), r.variants?.length || 0, (r.variants || []).reduce((n, v) => n + Number(v.inventory || 0), 0), r.status]} actions={r => <><button className="icon-action" onClick={() => setEditing(r)}><Pencil size={15} /></button><button className="icon-action danger" onClick={() => remove(r.id)}><Trash2 size={15} /></button></>} empty="products" /></div>{editing && <ProductForm value={editing} close={() => setEditing(null)} saved={() => { setEditing(null); load() }} />}</Page>
}
function ProductForm({ value, close, saved }) {
  const [form, setForm] = useState({ ...value, variants: value.variants || [] }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false)
  const change = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const submit = async e => { e.preventDefault(); setSaving(true); setError(''); try { await request(form.id ? `/admin/products/${form.id}` : '/admin/products', { method: form.id ? 'PUT' : 'POST', body: JSON.stringify({ ...form, price: Number(form.price), compare_price: form.compare_price ? Number(form.compare_price) : null }) }); saved() } catch (err) { setError(err.message) } finally { setSaving(false) } }
  return <div className="modal-backdrop"><form className="admin-modal" onSubmit={submit}><div className="modal-head"><h2>{form.id ? 'Edit product' : 'Add product'}</h2><button type="button" onClick={close}><X size={18} /></button></div><label>Name<input name="name" value={form.name || ''} onChange={change} required /></label><label>Slug<input name="slug" value={form.slug || ''} onChange={change} /></label><div className="modal-grid"><label>Price<input name="price" type="number" min="0" value={form.price || ''} onChange={change} required /></label><label>Original price<input name="compare_price" type="number" min="0" value={form.compare_price || ''} onChange={change} /></label><label>Status<select name="status" value={form.status || 'Draft'} onChange={change}><option>Draft</option><option>Published</option></select></label><label>Badge<input name="badge" value={form.badge || ''} onChange={change} /></label></div><label>Description<textarea name="description" rows="4" value={form.description || ''} onChange={change} /></label><label><input name="featured" type="checkbox" checked={!!form.featured} onChange={change} /> Featured product</label><label>Variants JSON<textarea value={JSON.stringify(form.variants || [], null, 2)} onChange={e => { try { setForm({ ...form, variants: JSON.parse(e.target.value) }) } catch {} }} rows="6" placeholder='[{"title":"Black / M","sku":"SKU-1","price":500,"inventory":5,"is_active":true}]' /></label>{error && <p className="form-error">{error}</p>}<button className="admin-primary" disabled={saving}>{saving ? 'Saving...' : 'Save product'} <ChevronRight /></button></form></div>
}

function Inventory() {
  const [rows, setRows] = useState([]); const [error, setError] = useState(''); const load = () => request('/admin/inventory').then(setRows).catch(e => setError(e.message)); useEffect(load, [])
  const adjust = async (row, delta) => { const quantity = Math.max(0, Number(row.current_stock) + delta); try { await request(`/admin/inventory/${row.variant_id}`, { method: 'PATCH', body: JSON.stringify({ quantity, reason: 'Admin adjustment' }) }); load() } catch (e) { setError(e.message) } }
  return <Page title="Inventory" kicker="CATALOG / INVENTORY" error={error}><div className="admin-card table-card"><Table headers={['Product', 'Variant', 'SKU', 'Current stock', 'Adjustment']} rows={rows} render={r => [r.product, r.variant, r.sku, r.current_stock, <div className="adjustment"><button onClick={() => adjust(r, -1)}>-</button><span>Adjust</span><button onClick={() => adjust(r, 1)}>+</button></div>]} empty="inventory items" /></div></Page>
}

function Generic({ name }) {
  const config = configs[name]; const [rows, setRows] = useState([]); const [query, setQuery] = useState(''); const [editing, setEditing] = useState(null); const [error, setError] = useState('')
  const load = () => request(config.endpoint).then(setRows).catch(e => setError(e.message)); useEffect(load, [])
  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()))
  const save = async value => { try { const method = value.id ? (name === 'Messages' ? 'PATCH' : 'PUT') : 'POST'; const path = value.id ? `${config.endpoint}/${value.id}` : config.endpoint; await request(path, { method, body: JSON.stringify(value) }); setEditing(null); load() } catch (e) { setError(e.message) } }
  const remove = async id => { try { await request(`${config.endpoint}/${id}`, { method: 'DELETE' }); load() } catch (e) { setError(e.message) } }
  const readOnly = ['Customers', 'Payments'].includes(name)
  const columns = Object.keys(filtered[0] || {}).filter(k => !['id', 'created_at', 'updated_at', 'password_hash', 'orders'].includes(k)).slice(0, 6)
  return <Page title={config.title} kicker={`BUSINESS / ${config.title.toUpperCase()}`} error={error} action={!readOnly && <button className="admin-primary compact" onClick={() => setEditing({})}><Plus size={16} /> Add</button>}><div className="admin-card table-card"><Toolbar query={query} setQuery={setQuery} count={filtered.length} placeholder={`Search ${config.title.toLowerCase()}...`} /><Table headers={columns} rows={filtered} render={row => columns.map(k => String(row[k] ?? ''))} actions={!readOnly && (row => <><button className="icon-action" onClick={() => setEditing(row)}><Pencil size={15} /></button><button className="icon-action danger" onClick={() => remove(row.id)}><Trash2 size={15} /></button></>)} empty={config.title.toLowerCase()} /></div>{editing && <GenericForm config={config} value={editing} close={() => setEditing(null)} save={save} />}</Page>
}
function GenericForm({ config, value, close, save }) {
  const [form, setForm] = useState(value); const submit = e => { e.preventDefault(); save(form) }
  return <div className="modal-backdrop"><form className="admin-modal" onSubmit={submit}><div className="modal-head"><h2>{value.id ? 'Edit' : 'Add'} {config.title.slice(0, -1)}</h2><button type="button" onClick={close}><X size={18} /></button></div>{config.fields.map(([name, label, type, options]) => <label key={name}>{label}{type === 'textarea' ? <textarea rows="4" value={form[name] ?? ''} onChange={e => setForm({ ...form, [name]: e.target.value })} /> : type === 'select' ? <select value={form[name] ?? options[0]} onChange={e => setForm({ ...form, [name]: e.target.value })}>{options.map(x => <option key={x}>{x}</option>)}</select> : <input name={name} type={type} checked={type === 'checkbox' ? !!form[name] : undefined} value={type === 'checkbox' ? undefined : form[name] ?? ''} onChange={e => setForm({ ...form, [name]: type === 'checkbox' ? e.target.checked : type === 'number' ? Number(e.target.value) : e.target.value })} />}</label>)}<button className="admin-primary">Save <ChevronRight /></button></form></div>
}

function Analytics() { const [data, setData] = useState(null); useEffect(() => { request('/admin/dashboard').then(setData) }, []); if (!data) return <Loading />; return <div className="admin-content"><div className="content-heading"><div><p className="admin-kicker">BUSINESS / ANALYTICS</p><h1>Analytics</h1><p className="muted">Calculated from paid order and order item records.</p></div></div><div className="stats-grid"><Stat label="Revenue" value={money(data.revenue)} note="Paid orders" /><Stat label="Orders" value={data.orders} note="Paid orders" /><Stat label="Customers" value={data.customers} note="Guest buyers" /><Stat label="Products sold" value={(data.bestsellers || []).reduce((n, x) => n + Number(x.sold || 0), 0)} note="Top products" /></div><div className="admin-card"><h2>Best sellers</h2><Table headers={['Product', 'Sold']} rows={data.bestsellers || []} render={r => [r.name, r.sold || 0]} empty="best sellers" /></div></div> }

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(() => !!sessionStorage.getItem(tokenKey)); const [active, setActive] = useState('Dashboard'); const [mobileOpen, setMobileOpen] = useState(false)
  const login = async (email, password) => { const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); sessionStorage.setItem(tokenKey, result.token); setAuthenticated(true) }
  const logout = () => { sessionStorage.removeItem(tokenKey); setAuthenticated(false) }
  if (!authenticated) return <Login onLogin={login} />
  const view = active === 'Dashboard' ? <Dashboard /> : active === 'Orders' ? <Orders /> : active === 'Products' ? <Products /> : active === 'Inventory' ? <Inventory /> : active === 'Analytics' ? <Analytics /> : <Generic name={active} />
  return <div className="admin-shell"><aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}><div className="sidebar-top"><a className="admin-logo" href="#admin">NOIR<span>/</span>FORM</a><button className="sidebar-close" onClick={() => setMobileOpen(false)}><X size={18} /></button></div><p className="owner-label">OWNER ADMIN</p><nav>{nav.map(([group, items]) => <div className="nav-group" key={group}><small>{group}</small>{items.map(([label, Icon]) => <button className={active === label ? 'active' : ''} key={label} onClick={() => { setActive(label); setMobileOpen(false) }}><Icon size={16} /><span>{label}</span></button>)}</div>)}</nav><div className="sidebar-bottom"><div className="admin-profile"><div>AM</div><span><strong>Owner</strong><small>Authenticated</small></span></div><button className="logout" onClick={logout}><LogOut size={15} /> Log out</button></div></aside><main className="admin-main"><header className="admin-header"><button className="admin-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="header-breadcrumb">NOIR/FORM <span>/</span> {active}</div><div className="header-actions"><button><Bell size={18} /></button><a href="#home" className="view-store">View store <ChevronRight size={14} /></a></div></header>{view}</main></div>
}
