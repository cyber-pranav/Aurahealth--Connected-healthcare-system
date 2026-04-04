import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ITEM_TYPES = [
  { value: 'medication', label: 'Medication', icon: 'medication' },
  { value: 'follow_up', label: 'Follow-up', icon: 'event_repeat' },
  { value: 'test', label: 'Lab Test', icon: 'science' },
  { value: 'lifestyle', label: 'Lifestyle', icon: 'self_improvement' },
  { value: 'referral', label: 'Referral', icon: 'forward' },
];
const STATUS_CFG = {
  pending: { color: 'bg-outline-variant/30 text-on-surface-variant', icon: 'schedule' },
  in_progress: { color: 'bg-primary/10 text-primary', icon: 'pending' },
  completed: { color: 'bg-primary-container text-on-primary-container', icon: 'check_circle' },
  overdue: { color: 'bg-error/10 text-error', icon: 'warning' },
};

export default function CarePlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [patients, setPatients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [noteInput, setNoteInput] = useState({});
  const [form, setForm] = useState({ patientId:'', title:'', description:'', items:[{type:'medication',title:'',description:'',dueDate:''}], endDate:'' });

  useEffect(() => { loadPlans(); if (user.role==='DOCTOR') loadPatients(); }, []);

  const loadPlans = async () => { try { const r = await api.get('/care-plans'); setPlans(r.data); } catch(e){console.error(e);} finally{setLoading(false);} };
  const loadPatients = async () => { try { const r=await api.get('/clinic/appointments'); const m=new Map(); r.data.forEach(a=>{if(a.patientId)m.set(a.patientId._id,a.patientId);}); setPatients(Array.from(m.values())); }catch{} };
  const addItem=()=>setForm(p=>({...p,items:[...p.items,{type:'medication',title:'',description:'',dueDate:''}]}));
  const removeItem=(i)=>setForm(p=>({...p,items:p.items.filter((_,idx)=>idx!==i)}));
  const updateItem=(i,f,v)=>setForm(p=>({...p,items:p.items.map((it,idx)=>idx===i?{...it,[f]:v}:it)}));

  const handleCreate = async(e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post('/care-plans',{patientId:form.patientId,title:form.title,description:form.description,items:form.items.filter(i=>i.title),endDate:form.endDate||undefined}); setShowCreate(false); setForm({patientId:'',title:'',description:'',items:[{type:'medication',title:'',description:'',dueDate:''}],endDate:''}); loadPlans(); }
    catch(e){console.error(e);} finally{setSubmitting(false);}
  };

  const updateItemStatus = async(planId,idx,status)=>{ try{await api.patch(`/care-plans/${planId}/items/${idx}`,{status}); loadPlans();}catch(e){console.error(e);} };
  const addDoctorNote = async(planId)=>{ const note=noteInput[planId]; if(!note?.trim())return; try{await api.post(`/care-plans/${planId}/notes`,{note:note.trim()}); setNoteInput(p=>({...p,[planId]:''})); loadPlans();}catch(e){console.error(e);} };
  const getProgress=(plan)=>{if(!plan.items?.length)return 0; return Math.round((plan.items.filter(i=>i.status==='completed').length/plan.items.length)*100);};

  if(loading) return <div className="space-y-4 animate-pulse"><div className="h-8 w-48 skeleton"/>{[1,2,3].map(i=><div key={i} className="h-32 skeleton rounded-3xl"/>)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined filled text-primary text-3xl">assignment</span>Care Plans</h1>
          <p className="text-on-surface-variant mt-1">{user.role==='DOCTOR'?'Create and manage treatment plans':'Track your treatment progress'}</p>
        </div>
        {user.role==='DOCTOR'&&<button onClick={()=>setShowCreate(!showCreate)} className="px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-elevation-1 flex items-center gap-2"><span className="material-symbols-outlined text-lg">add</span>New Care Plan</button>}
      </div>

      {showCreate&&(
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-2 p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-outlined filled text-primary">add_task</span>Create Treatment Plan</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-on-surface mb-2">Patient</label><select value={form.patientId} onChange={e=>setForm(p=>({...p,patientId:e.target.value}))} required className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all"><option value="">Select...</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-on-surface mb-2">Title</label><input type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all" placeholder="e.g. Hypertension Management"/></div>
            </div>
            <div><label className="block text-sm font-medium text-on-surface mb-2">Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all resize-none" placeholder="Brief overview..."/></div>
            <div>
              <div className="flex items-center justify-between mb-3"><label className="text-sm font-medium text-on-surface">Items</label><button type="button" onClick={addItem} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-semibold hover:bg-secondary-container/70 transition-all flex items-center gap-1"><span className="material-symbols-outlined text-base">add</span>Add</button></div>
              <div className="space-y-3">{form.items.map((item,i)=>(
                <div key={i} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 relative animate-fade-in">
                  {form.items.length>1&&<button type="button" onClick={()=>removeItem(i)} className="absolute top-3 right-3 p-1 text-error hover:bg-error-container/30 rounded-lg transition-all"><span className="material-symbols-outlined text-base">close</span></button>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Type</label><select value={item.type} onChange={e=>updateItem(i,'type',e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all">{ITEM_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                    <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Title</label><input type="text" value={item.title} onChange={e=>updateItem(i,'title',e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all" placeholder="BP check"/></div>
                    <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Details</label><input type="text" value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all"/></div>
                    <div><label className="block text-xs font-medium text-on-surface-variant mb-1">Due</label><input type="date" value={item.dueDate} onChange={e=>updateItem(i,'dueDate',e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all"/></div>
                  </div>
                </div>
              ))}</div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-primary text-on-primary rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">{submitting?<span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>:<><span className="material-symbols-outlined text-lg">check</span>Create Plan</>}</button>
              <button type="button" onClick={()=>setShowCreate(false)} className="px-6 py-2.5 border border-outline-variant/40 text-on-surface-variant rounded-2xl font-medium text-sm hover:bg-surface-container-high transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {plans.length===0?(
        <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">assignment</span>
          <p className="text-on-surface-variant mt-4 text-lg font-medium">No care plans yet</p>
          <p className="text-on-surface-variant/60 mt-1 text-sm">{user.role==='DOCTOR'?'Create a plan for your patients':'Your doctor will create one for you'}</p>
        </div>
      ):(
        <div className="space-y-4">{plans.map((plan,pi)=>{
          const progress=getProgress(plan); const isExp=expandedPlan===plan._id;
          return(
            <div key={plan._id} className={`bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1 overflow-hidden transition-all animate-slide-in stagger-${Math.min(pi+1,5)}`}>
              <button onClick={()=>setExpandedPlan(isExp?null:plan._id)} className="w-full p-5 text-left">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.status==='completed'?'bg-primary-container':plan.status==='active'?'bg-secondary-container':'bg-surface-container'}`}><span className={`material-symbols-outlined filled text-xl ${plan.status==='completed'?'text-primary':plan.status==='active'?'text-secondary':'text-on-surface-variant'}`}>{plan.status==='completed'?'task_alt':'assignment'}</span></div>
                  <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-on-surface">{plan.title}</h3><p className="text-xs text-on-surface-variant mt-0.5">{user.role==='DOCTOR'?plan.patientId?.name||'Patient':`Dr. ${plan.doctorId?.name||'Unknown'}`} • {plan.items?.length||0} items</p></div>
                  <div className="flex items-center gap-3">
                    <div className="text-right"><p className="text-lg font-bold text-on-surface">{progress}%</p><div className="w-20 h-1.5 bg-primary/10 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all duration-500" style={{width:`${progress}%`}}/></div></div>
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${plan.status==='active'?'bg-primary/10 text-primary':plan.status==='completed'?'bg-primary-container text-on-primary-container':'bg-surface-container text-on-surface-variant'}`}>{plan.status}</span>
                    <span className={`material-symbols-outlined text-on-surface-variant/50 transition-transform ${isExp?'rotate-180':''}`}>expand_more</span>
                  </div>
                </div>
              </button>
              {isExp&&(
                <div className="px-5 pb-5 animate-fade-in">
                  {plan.description&&<p className="text-sm text-on-surface-variant mb-4 px-1">{plan.description}</p>}
                  <div className="space-y-2 mb-4">{plan.items?.map((item,idx)=>{
                    const it=ITEM_TYPES.find(t=>t.value===item.type)||{}; const sc=STATUS_CFG[item.status]||STATUS_CFG.pending;
                    return(<div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">{it.icon||'circle'}</span>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-on-surface">{item.title||it.label}</p>{item.description&&<p className="text-xs text-on-surface-variant">{item.description}</p>}{item.dueDate&&<p className="text-xs text-on-surface-variant/60">Due: {new Date(item.dueDate).toLocaleDateString()}</p>}</div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize flex items-center gap-1 ${sc.color}`}><span className="material-symbols-outlined text-xs">{sc.icon}</span>{item.status}</span>
                      {(user.role==='PATIENT'||user.role==='CAREGIVER')&&item.status!=='completed'&&<button onClick={()=>updateItemStatus(plan._id,idx,'completed')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all">Done</button>}
                    </div>);
                  })}</div>
                  {plan.doctorNotes?.length>0&&<div className="mb-4"><h4 className="text-xs font-semibold text-on-surface-variant mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">note</span>Doctor Notes</h4><div className="space-y-2">{plan.doctorNotes.map((n,ni)=><div key={ni} className="p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/10"><p className="text-xs text-on-surface">{n.note}</p><p className="text-[10px] text-on-surface-variant mt-1">— Dr. {n.doctorName} • {new Date(n.createdAt).toLocaleDateString()}</p></div>)}</div></div>}
                  {user.role==='DOCTOR'&&<div className="flex gap-2"><input type="text" value={noteInput[plan._id]||''} onChange={e=>setNoteInput(p=>({...p,[plan._id]:e.target.value}))} className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all" placeholder="Add a note..."/><button onClick={()=>addDoctorNote(plan._id)} className="px-4 py-2.5 bg-tertiary text-on-tertiary rounded-xl text-sm font-semibold hover:bg-tertiary/90 transition-all"><span className="material-symbols-outlined text-lg">send</span></button></div>}
                </div>
              )}
            </div>
          );
        })}</div>
      )}
    </div>
  );
}
