import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { apiMessage } from "../services/api";
import { getCustomers } from "../services/customer.service";
import { getProducts } from "../services/product.service";
import { cancelChallan, confirmChallan, createChallan, getChallans } from "../services/challan.service";
import type { Challan, Customer, Product } from "../types";

type DraftItem = { productId: string; quantity: number };

export default function Challans() {
  const [challans,setChallans]=useState<Challan[]>([]);
  const [customers,setCustomers]=useState<Customer[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [error,setError]=useState("");
  const [modal,setModal]=useState(false);
  const [customerId,setCustomerId]=useState("");
  const [items,setItems]=useState<DraftItem[]>([]);
  const [view,setView]=useState<Challan|null>(null);

  async function load(){
    setError("");
    try{
      const [c,p,ch]=await Promise.all([
        getCustomers({page:1,limit:100}),
        getProducts({page:1,limit:100}),
        getChallans({page:1,limit:100})
      ]);
      setCustomers(c.customers);setProducts(p.products);setChallans(ch.challans);
    }catch(e){setError(apiMessage(e,"Failed to load challans"));}
  }
  useEffect(()=>{load()},[]);

  function addItem(){ if(products.length) setItems([...items,{productId:products[0].id,quantity:1}]); }
  function updateItem(i:number,patch:Partial<DraftItem>){setItems(items.map((x,n)=>n===i?{...x,...patch}:x))}
  function removeItem(i:number){setItems(items.filter((_,n)=>n!==i))}
  async function create(e:React.FormEvent){
    e.preventDefault();
    if(!customerId||items.length===0)return;
    try{
      const created=await createChallan({customerId,items});
      setModal(false);setCustomerId("");setItems([]);setView(created);await load();
    }catch(e){setError(apiMessage(e,"Failed to create challan"));}
  }
  async function confirm(id:string){
    if(!confirm("Confirm this challan? Inventory will be deducted."))return;
    try{await confirmChallan(id);await load();}catch(e){setError(apiMessage(e,"Failed to confirm challan"));}
  }
  async function cancel(id:string){
    if(!confirm("Cancel this challan?"))return;
    try{await cancelChallan(id);await load();}catch(e){setError(apiMessage(e,"Failed to cancel challan"));}
  }

  return <>
    <div className="page-heading"><div><h1>Sales Challans</h1><p>Create, review and confirm customer delivery challans.</p></div><button className="primary-button" onClick={()=>{setItems([]);setCustomerId("");setModal(true)}}><Plus size={16}/> New Challan</button></div>
    {error&&<div className="alert error">{error}</div>}
    <section className="dashboard-card page-card"><div className="card-header"><div><h2>Challan List</h2><p>{challans.length} challans</p></div><button className="secondary-button" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
      <div className="table-wrapper"><table><thead><tr><th>Challan</th><th>Customer</th><th>Items</th><th>Total Qty</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
      {challans.map(c=><tr key={c.id}><td><strong>{c.challanNumber}</strong></td><td>{c.customer?.name||c.customerId}</td><td>{c.items?.length||0}</td><td>{c.totalQuantity}</td><td><span className={`badge ${c.status.toLowerCase()}`}>{c.status}</span></td><td>{new Date(c.createdAt).toLocaleDateString()}</td><td className="actions"><button className="icon-button" onClick={()=>setView(c)}><Eye size={16}/></button>{c.status==="DRAFT"&&<><button className="small-action confirm" onClick={()=>confirm(c.id)}><CheckCircle2 size={15}/> Confirm</button><button className="icon-button danger" onClick={()=>cancel(c.id)}><Trash2 size={16}/></button></>}</td></tr>)}
      </tbody></table></div>{challans.length===0&&<div className="empty-state">No sales challans found.</div>}</section>

    {modal&&<div className="modal-backdrop"><div className="modal wide-modal"><div className="modal-header"><h2>New Sales Challan</h2><button className="icon-button" onClick={()=>setModal(false)}><X size={18}/></button></div>
      <form onSubmit={create}>
        <label className="form-group"><span>Customer</span><select required value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Select customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.businessName}</option>)}</select></label>
        <div className="item-builder"><div className="builder-title"><strong>Items</strong><button type="button" className="secondary-button" onClick={addItem}>+ Add Item</button></div>
          {items.map((item,i)=><div className="builder-row" key={i}><select value={item.productId} onChange={e=>updateItem(i,{productId:e.target.value})}>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.sku} (Stock: {p.currentStock})</option>)}</select><input type="number" min="1" value={item.quantity} onChange={e=>updateItem(i,{quantity:Number(e.target.value)})}/><button type="button" className="icon-button danger" onClick={()=>removeItem(i)}><Trash2 size={16}/></button></div>)}
          {items.length===0&&<p className="muted">Add at least one product.</p>}
        </div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal(false)}>Cancel</button><button className="primary-button" disabled={!customerId||items.length===0}>Create Draft</button></div>
      </form>
    </div></div>}

    {view&&<div className="modal-backdrop"><div className="modal wide-modal"><div className="modal-header"><div><h2>{view.challanNumber}</h2><p>{view.customer?.name||view.customerId}</p></div><button className="icon-button" onClick={()=>setView(null)}><X size={18}/></button></div>
      <div className="detail-list">{view.items?.map(i=><div className="detail-row" key={i.id||i.productId}><span>{i.productName} ({i.sku}) × {i.quantity}</span><strong>₹{(Number(i.unitPrice)*i.quantity).toLocaleString()}</strong></div>)}</div>
      <div className="summary-row"><span>Total Quantity</span><strong>{view.totalQuantity}</strong></div>
      <div className="modal-actions"><button className="secondary-button" onClick={()=>setView(null)}>Close</button>{view.status==="DRAFT"&&<button className="primary-button" onClick={async()=>{await confirm(view.id);setView(null)}}>Confirm & Deduct Stock</button>}</div>
    </div></div>}
  </>;
}
