import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { apiMessage } from "../services/api";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/product.service";
import type { Product } from "../types";

const initial: Partial<Product> = { name:"", sku:"", category:"Accessories", unitPrice:0, currentStock:0, minimumStock:0, location:"Warehouse A" };

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(initial);

  async function load() {
    setError("");
    try {
      const r = await getProducts({search:search||undefined, category:category||undefined, lowStock, page:1, limit:100});
      setProducts(r.products);
    } catch (e) { setError(apiMessage(e, "Failed to load products")); }
  }
  useEffect(() => { const t=window.setTimeout(load,200); return()=>window.clearTimeout(t); }, [search,category,lowStock]);

  useEffect(() => {
    const handler = () => { load(); };
    window.addEventListener('fundops:data-changed', handler);
    return () => window.removeEventListener('fundops:data-changed', handler);
  }, []);

  function openCreate(){setEditing(null);setForm(initial);setModal(true);}
  function openEdit(p:Product){setEditing(p);setForm({...p});setModal(true);}

  async function save(e:React.FormEvent){
    e.preventDefault(); setError("");
    try {
      if(editing) await updateProduct(editing.id, form);
      else await createProduct({...form, unitPrice:Number(form.unitPrice), currentStock:Number(form.currentStock), minimumStock:Number(form.minimumStock)});
      setModal(false); await load();
    } catch(e){setError(apiMessage(e,"Failed to save product"));}
  }

  async function remove(p:Product){
    if(!confirm(`Delete ${p.name}?`))return;
    try{await deleteProduct(p.id);await load();}catch(e){setError(apiMessage(e,"Failed to delete product"));}
  }

  return <>
    <div className="products-page">
      <div className="products-header">
        <div className="products-header-content">
          <div>
            <h1>Products</h1>
            <p>Manage your product catalog and pricing.</p>
          </div>
        </div>
        <div>
          <button className="primary-button" onClick={openCreate}><Plus size={16}/> Add Product</button>
        </div>
      </div>

      {error&&<div className="alert error">{error}</div>}

      <div className="products-filters">
        <div className="products-search search-field"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product name or SKU..."/></div>
        <div className="products-category"><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="All Categories"/></div>
        <label className="products-low-stock"><input type="checkbox" checked={lowStock} onChange={e=>setLowStock(e.target.checked)}/> <span>Low stock only</span></label>
        <div className="products-refresh"><button className="secondary-button" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
      </div>

      <section className="product-catalog dashboard-card page-card">
      <div className="card-header"><div><h2>Product Catalog</h2><p>{products.length} products</p></div></div>
      <div className="table-wrapper">
        <table><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Minimum</th><th>Location</th><th>Actions</th></tr></thead>
        <tbody>{products.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.sku}</td><td>{p.category}</td><td>₹{Number(p.unitPrice).toLocaleString()}</td><td className={p.currentStock<=p.minimumStock?"stock-low":""}>{p.currentStock}</td><td>{p.minimumStock}</td><td>{p.location}</td><td className="actions"><button className="icon-button" onClick={()=>openEdit(p)}><Pencil size={16}/></button><button className="icon-button danger" onClick={()=>remove(p)}><Trash2 size={16}/></button></td></tr>)}</tbody></table>
      </div>
      {products.length===0&&<div className="empty-state"><h3>No products found</h3><p>Add a product to get started.</p></div>}
    </section>
    {modal&&<Modal title={editing?"Edit Product":"Add Product"} onClose={()=>setModal(false)}>
      <form className="form-grid" onSubmit={save}>
        <Field label="Name"><input required value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="SKU"><input required value={form.sku||""} onChange={e=>setForm({...form,sku:e.target.value})}/></Field>
        <Field label="Category"><input required value={form.category||""} onChange={e=>setForm({...form,category:e.target.value})}/></Field>
        <Field label="Unit Price"><input required type="number" min="0" value={form.unitPrice as number || 0} onChange={e=>setForm({...form,unitPrice:Number(e.target.value)})}/></Field>
        <Field label="Current Stock"><input type="number" min="0" value={form.currentStock||0} onChange={e=>setForm({...form,currentStock:Number(e.target.value)})}/></Field>
        <Field label="Minimum Stock"><input type="number" min="0" value={form.minimumStock||0} onChange={e=>setForm({...form,minimumStock:Number(e.target.value)})}/></Field>
        <Field label="Location" wide><input required value={form.location||""} onChange={e=>setForm({...form,location:e.target.value})}/></Field>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal(false)}>Cancel</button><button className="primary-button">{editing?"Save Changes":"Create Product"}</button></div>
      </form>
    </Modal>}
    </div>
  </>;
}
function Field({label,children,wide}:{label:string;children:React.ReactNode;wide?:boolean}){return <label className={`form-group ${wide?"wide":""}`}><span>{label}</span>{children}</label>}
function Modal({title,children,onClose}:{title:string;children:React.ReactNode;onClose:()=>void}){return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
