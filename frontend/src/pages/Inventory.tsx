import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Search, X } from "lucide-react";
import { apiMessage } from "../services/api";
import { createStockMovement, getProducts } from "../services/product.service";
import type { Product } from "../types";

export default function Inventory() {
  const [products,setProducts]=useState<Product[]>([]);
  const [search,setSearch]=useState("");
  const [lowStock,setLowStock]=useState(false);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState<Product|null>(null);
  const [type,setType]=useState<"IN"|"OUT">("IN");
  const [quantity,setQuantity]=useState(1);
  const [reason,setReason]=useState("");

  async function load(){
    setError("");
    try{
      const r=await getProducts({search:search||undefined,lowStock,page:1,limit:100});
      setProducts(r.products);
    }catch(e){setError(apiMessage(e,"Failed to load inventory"));}
  }
  useEffect(()=>{const t=setTimeout(load,200);return()=>clearTimeout(t)},[search,lowStock]);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!selected)return;
    try{
      await createStockMovement(selected.id,{quantity:Number(quantity),movementType:type,reason:reason||`${type==="IN"?"Stock received":"Stock issued"}`});
      setSelected(null);setQuantity(1);setReason("");await load();
    }catch(e){setError(apiMessage(e,"Stock movement failed"));}
  }

  return <>
    <div className="page-heading"><div><h1>Inventory</h1><p>Track stock levels and record stock movements.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
    {error&&<div className="alert error">{error}</div>}
    <div className="filter-card"><div className="search-field"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product or SKU..."/></div><label className="check"><input type="checkbox" checked={lowStock} onChange={e=>setLowStock(e.target.checked)}/> Low stock only</label></div>
    <section className="dashboard-card page-card"><div className="card-header"><div><h2>Inventory</h2><p>{products.length} tracked products</p></div></div>
      <div className="table-wrapper"><table><thead><tr><th>Product</th><th>SKU</th><th>Location</th><th>Current</th><th>Minimum</th><th>Level</th><th>Actions</th></tr></thead><tbody>
      {products.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.sku}</td><td>{p.location}</td><td className={p.currentStock<=p.minimumStock?"stock-low":""}>{p.currentStock}</td><td>{p.minimumStock}</td><td><div className="mini-progress"><span style={{width:`${Math.min(100,p.minimumStock?Math.max(5,p.currentStock/p.minimumStock*100):100)}%`}}/></div></td><td className="actions"><button className="small-action in" onClick={()=>{setSelected(p);setType("IN")}}><ArrowDownToLine size={15}/> IN</button><button className="small-action out" onClick={()=>{setSelected(p);setType("OUT")}}><ArrowUpFromLine size={15}/> OUT</button></td></tr>)}
      </tbody></table></div>
      {products.length===0&&<div className="empty-state">No inventory items found.</div>}
    </section>
    {selected&&<div className="modal-backdrop"><div className="modal small-modal"><div className="modal-header"><div><h2>{type==="IN"?"Receive Stock":"Issue Stock"}</h2><p>{selected.name} · {selected.sku} · Available {selected.currentStock}</p></div><button className="icon-button" onClick={()=>setSelected(null)}><X size={18}/></button></div>
      <form onSubmit={submit}><Field label="Quantity"><input type="number" min="1" max={type==="OUT"?selected.currentStock:undefined} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} required/></Field><Field label="Reason"><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for movement" required/></Field><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setSelected(null)}>Cancel</button><button className="primary-button">{type==="IN"?"Receive Stock":"Issue Stock"}</button></div></form>
    </div></div>}
  </>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="form-group"><span>{label}</span>{children}</label>}
