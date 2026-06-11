import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const ADMIN_PASSWORD = "nunta2026";

const MENU_OPTIONS = [
  { val: "omnivor",    label: "🍖 Fără restricții" },
  { val: "vegetarian", label: "🥗 Vegetarian" },
  { val: "vegan",      label: "🌱 Vegan" },
];
const menuLabel = (m) => m === "omnivor" ? "Fără restricții" : m === "vegetarian" ? "Vegetarian" : m === "vegan" ? "Vegan" : "-";
const menuIcon  = (m) => m === "omnivor" ? "🍖" : m === "vegetarian" ? "🥗" : m === "vegan" ? "🌱" : "";

// ── Design tokens ─────────────────────────────────
const T = {
  plum:      "#2d2438",
  plumMid:   "#4a3858",
  plumLight: "#7a6585",
  gold:      "#c9a84c",
  goldGlow:  "rgba(201,168,76,0.45)",
  green:     "#3a5240",
  greenL:    "#6a8c72",
  err:       "#8b2635",
  lavB:      "rgba(180,175,210,0.35)",
  card:      "rgba(240,243,250,0.92)",
  white:     "#f8f6ff",
};
const FS = {
  names:   "'Alex Brush', cursive",
  heading: "'Cormorant Garamond', serif",
  body:    "'Montserrat', sans-serif",
};
const forestBg = `
  radial-gradient(ellipse at 18% 55%, rgba(130,155,210,0.55) 0%, transparent 52%),
  radial-gradient(ellipse at 82% 28%, rgba(145,190,155,0.45) 0%, transparent 48%),
  radial-gradient(ellipse at 50% 85%, rgba(200,185,130,0.45) 0%, transparent 52%),
  radial-gradient(ellipse at 65% 8%,  rgba(225,215,160,0.5)  0%, transparent 38%),
  linear-gradient(168deg, #bec8e8 0%, #aecab8 38%, #cec490 70%, #bec8e8 100%)
`;
const pageBg = "linear-gradient(152deg, #dddaf0 0%, #cfddd5 45%, #e5dcc5 100%)";

// ── Shared styles ─────────────────────────────────
const sInput  = { width:"100%", padding:"0.65rem 1rem", fontFamily:FS.body, fontSize:"0.88rem", letterSpacing:"0.02em", color:T.plum, background:"rgba(232,235,252,0.65)", border:"1px solid "+T.lavB, borderRadius:"12px", outline:"none", boxSizing:"border-box" };
const sLabel  = { display:"block", fontFamily:FS.body, fontSize:"0.67rem", letterSpacing:"0.14em", textTransform:"uppercase", color:T.plumLight, marginBottom:"0.42rem", fontWeight:600 };
const sErr    = { color:T.err, fontSize:"0.73rem", fontFamily:FS.body, marginTop:"0.27rem", display:"block" };
const sBtn    = { background:"linear-gradient(135deg,"+T.plum+" 0%,"+T.plumMid+" 100%)", color:T.white, border:"1px solid rgba(201,168,76,0.35)", borderRadius:"50px", padding:"0.75rem 2.2rem", fontFamily:FS.body, fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.3s ease" };
const sAddBtn = { background:"transparent", border:"1.5px dashed "+T.lavB, borderRadius:"50px", padding:"0.42rem 1rem", fontFamily:FS.body, fontSize:"0.73rem", letterSpacing:"0.07em", color:T.plumLight, cursor:"pointer", transition:"all 0.25s" };

// ── Atoms ─────────────────────────────────────────
function Divider({ tight }) {
  return <div style={{ textAlign:"center", margin:tight?"0.8rem 0":"1.4rem 0", color:T.gold, fontSize:"0.82rem", letterSpacing:"0.4em" }}>✦ · ✦</div>;
}
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom:"1.2rem" }}>
      {label && <label style={sLabel}>{label}</label>}
      {children}
      {error && <span style={sErr}>{error}</span>}
    </div>
  );
}
function ToggleBtn({ active, activeColor, onClick, children, small }) {
  const ac = activeColor || T.plum;
  return (
    <button onClick={onClick} style={{ border:"1.5px solid "+(active?ac:T.lavB), borderRadius:"50px", padding:small?"0.3rem 0.62rem":"0.47rem 1.05rem", fontFamily:FS.body, fontSize:small?"0.72rem":"0.79rem", letterSpacing:"0.05em", cursor:"pointer", transition:"all 0.25s", background:active?ac:"rgba(232,235,252,0.4)", color:active?"#fff":T.plumMid, boxShadow:active?"0 0 14px "+T.goldGlow:"none" }}>
      {children}
    </button>
  );
}
function Tag({ color, bg, children }) {
  return <span style={{ fontSize:"0.68rem", fontFamily:FS.body, letterSpacing:"0.03em", color, background:bg, borderRadius:"20px", padding:"0.13rem 0.6rem", whiteSpace:"nowrap", border:"1px solid "+color+"33" }}>{children}</span>;
}
function MenuSelect({ value, onChange, error }) {
  return (
    <div>
      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
        {MENU_OPTIONS.map(o => (
          <ToggleBtn key={o.val} small active={value===o.val} activeColor={T.green} onClick={()=>onChange(o.val)}>{o.label}</ToggleBtn>
        ))}
      </div>
      {error && <span style={sErr}>{error}</span>}
    </div>
  );
}

// ── Forest decor ──────────────────────────────────
function ForestDecor() {
  return (
    <>
      {[7,21,37,61,75,88].map((left,i) => (
        <div key={i} style={{ position:"absolute", left:left+"%", top:0, bottom:0, width:i%2===0?"15px":"10px", background:i%2===0?"linear-gradient(180deg,rgba(225,223,215,0.6) 0%,rgba(195,193,183,0.4) 100%)":"linear-gradient(180deg,rgba(210,208,200,0.5) 0%,rgba(185,183,173,0.35) 100%)", borderRadius:"4px", pointerEvents:"none", animation:`sway ${3+i*0.5}s ease-in-out infinite`, animationDelay:i*0.4+"s" }} />
      ))}
      {[{l:"16%",t:"27%"},{l:"40%",t:"19%"},{l:"67%",t:"25%"},{l:"82%",t:"39%"}].map((p,i) => (
        <div key={i} style={{ position:"absolute", left:p.l, top:p.t, width:"8px", height:"12px", background:"rgba(255,210,95,0.9)", borderRadius:"2px 2px 4px 4px", boxShadow:"0 0 16px 8px rgba(255,195,70,0.35),0 0 35px 16px rgba(255,175,55,0.16)", animation:`flicker ${2.2+i*0.6}s ease-in-out infinite`, animationDelay:i*0.35+"s", pointerEvents:"none" }} />
      ))}
      {[...Array(12)].map((_,i) => (
        <div key={i} style={{ position:"absolute", width:i%3===0?"5px":"3px", height:i%3===0?"5px":"3px", borderRadius:"50%", background:"rgba(255,228,95,0.9)", boxShadow:"0 0 6px rgba(255,210,55,0.88)", left:((7+i*9)%91)+"%", top:((13+i*14)%73)+"%", animation:`flicker ${1.8+i*0.32}s ease-in-out infinite`, animationDelay:i*0.26+"s", pointerEvents:"none" }} />
      ))}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"90px", background:"linear-gradient(0deg,rgba(90,130,90,0.28) 0%,transparent 100%)", pointerEvents:"none" }} />
    </>
  );
}

// ── Section wrapper ───────────────────────────────
function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} style={{ minHeight:"100vh", background:pageBg, padding:"5rem 1rem 4rem", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:forestBg, opacity:0.13, pointerEvents:"none" }} />
      <div style={{ maxWidth:"560px", margin:"0 auto", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          {subtitle && <p style={{ fontFamily:FS.body, fontSize:"0.6rem", letterSpacing:"0.28em", textTransform:"uppercase", color:T.gold, margin:"0 0 0.5rem", fontWeight:600 }}>{subtitle}</p>}
          <h2 style={{ fontFamily:FS.heading, fontSize:"clamp(2rem,7vw,3rem)", color:T.plum, margin:0, fontWeight:600, lineHeight:1.15 }}>{title}</h2>
          <Divider />
        </div>
        <div style={{ background:T.card, backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", borderRadius:"22px", border:"1px solid "+T.lavB, boxShadow:"0 12px 60px rgba(45,36,56,0.12)", padding:"2rem 1.6rem" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

// ── Nav ───────────────────────────────────────────
const NAV_ITEMS = [
  { id:"cover",   label:"Acasă" },
  { id:"nasi",    label:"Nași" },
  { id:"familii", label:"Familii" },
  { id:"locatie", label:"Locație" },
  { id:"contact", label:"Contact" },
  { id:"rsvp",    label:"Confirmare" },
];

function NavMenu({ activeSection, adminOpen }) {
  const [open, setOpen] = useState(false);
  const scrollTo = (id) => { setOpen(false); document.getElementById(id)?.scrollIntoView({ behavior:"smooth" }); };
  return (
    <>
      <button onClick={() => setOpen(o=>!o)} aria-label="Meniu"
        style={{ position:"fixed", top:"1rem", right:"1rem", zIndex:400, width:"44px", height:"44px", borderRadius:"50%", background:"rgba(240,238,255,0.88)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", border:"1px solid "+T.lavB, boxShadow:"0 4px 20px rgba(45,36,56,0.15)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"5px", cursor:"pointer" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:"18px", height:"1.5px", background:T.plum, borderRadius:"2px", transition:"all 0.3s", transform:open?(i===0?"rotate(45deg) translate(5px,5px)":i===1?"scaleX(0)":"rotate(-45deg) translate(5px,-5px)"):"none" }} />
        ))}
      </button>
      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:350 }} onClick={()=>setOpen(false)}>
          <div style={{ position:"absolute", top:0, right:0, width:"250px", height:"100vh", background:"rgba(245,243,255,0.97)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderLeft:"1px solid "+T.lavB, boxShadow:"-8px 0 40px rgba(45,36,56,0.15)", display:"flex", flexDirection:"column", padding:"5rem 0 2rem", animation:"slideIn 0.28s ease" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
              <p style={{ fontFamily:FS.names, fontSize:"1.8rem", color:T.plum, margin:0 }}>Andreea &amp; Tudor</p>
              <p style={{ fontFamily:FS.body, fontSize:"0.6rem", color:T.gold, letterSpacing:"0.2em", textTransform:"uppercase", margin:"0.3rem 0 0", fontWeight:600 }}>10 · 10 · 2026</p>
            </div>
            <Divider tight />
            <nav style={{ flex:1, padding:"0.8rem 0" }}>
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={()=>scrollTo(item.id)}
                  style={{ display:"block", width:"100%", padding:"0.82rem 2rem", fontFamily:FS.body, fontSize:"0.78rem", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:activeSection===item.id?600:400, color:activeSection===item.id?T.plum:T.plumLight, background:activeSection===item.id?"rgba(180,175,210,0.18)":"transparent", border:"none", borderLeft:activeSection===item.id?"3px solid "+T.gold:"3px solid transparent", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
                  {item.label}
                </button>
              ))}
            </nav>
            <Divider tight />
            <button onClick={()=>{adminOpen();setOpen(false);}}
              style={{ margin:"0.8rem 2rem 0", background:"none", border:"none", fontFamily:FS.body, fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase", color:T.plumLight, cursor:"pointer", opacity:0.55, textAlign:"left" }}>
              Acces organizatori
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── RSVP Form ─────────────────────────────────────
function RSVPForm({ onSubmit }) {
  const init = { name:"", attendance:"", myMenu:"", companions:[], message:"" };
  const [form, setForm]     = useState(init);
  const [submitted, setSub] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const adultsCount = form.companions.filter(c=>c.type==="adult").length;
  const kidsCount   = form.companions.filter(c=>c.type==="kid").length;

  const addComp    = type => setForm(f=>({...f, companions:[...f.companions,{type,name:"",menu:""}]}));
  const removeComp = idx  => setForm(f=>({...f, companions:f.companions.filter((_,i)=>i!==idx)}));
  const updateComp = (idx,field,val) => setForm(f=>{const c=[...f.companions];c[idx]={...c[idx],[field]:val};return{...f,companions:c};});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Te rugăm să introduci numele tău.";
    if (!form.attendance)  e.att  = "Te rugăm să confirmi prezența.";
    if (form.attendance==="da") {
      if (!form.myMenu) e.menu = "Te rugăm să alegi meniul tău.";
      form.companions.forEach((c,i) => { if (!c.menu) e["c"+i]="Alege meniul."; });
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await onSubmit({
      name:form.name, attendance:form.attendance, myMenu:form.myMenu,
      companions:form.companions, adultsCount, kidsCount, message:form.message,
      id:"g_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),
      date:new Date().toLocaleDateString("ro-RO"), timestamp:Date.now(),
    });
    setSaving(false); setSub(true);
  };

  if (submitted) return (
    <div style={{ textAlign:"center", padding:"2rem 0.5rem", animation:"fadeIn 0.7s ease" }}>
      <div style={{ background:"linear-gradient(135deg,rgba(58,82,64,0.12),rgba(106,140,114,0.18))", border:"1.5px solid rgba(58,82,64,0.3)", borderRadius:"16px", padding:"1.4rem 1.2rem", marginBottom:"1.4rem" }}>
        <div style={{ fontSize:"2.2rem", marginBottom:"0.5rem" }}>✅</div>
        <p style={{ fontFamily:FS.body, fontSize:"0.88rem", fontWeight:700, color:T.green, margin:"0 0 0.3rem", letterSpacing:"0.04em", textTransform:"uppercase" }}>
          Confirmarea ta a fost trimisă cu succes!
        </p>
        <p style={{ fontFamily:FS.body, fontSize:"0.8rem", color:T.plumLight, margin:0, lineHeight:1.7 }}>
          {form.attendance==="da" ? "Suntem încântați că vei fi alături de noi în această zi magică. 🍃" : "Îți mulțumim pentru răspuns. Ne va lipsi prezența ta!"}
        </p>
      </div>
      <h2 style={{ fontFamily:FS.heading, fontSize:"2.2rem", color:T.plum, marginBottom:"0.3rem", fontWeight:600 }}>Mulțumim, {form.name}!</h2>
      <Divider />
      <button onClick={()=>{setForm(init);setSub(false);setErrors({});}} style={sBtn}>Trimite un alt răspuns</button>
    </div>
  );

  return (
    <div>
      <Field label="Numele tău complet" error={errors.name}>
        <input style={{...sInput, borderColor:errors.name?T.err:T.lavB}} placeholder="ex. Maria Ionescu" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
      </Field>
      <Field label="Confirmi prezența?" error={errors.att}>
        <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
          {[{val:"da",label:"Da, voi fi prezent(ă) 🥂"},{val:"nu",label:"Nu pot veni 💌"}].map(o=>(
            <ToggleBtn key={o.val} active={form.attendance===o.val} onClick={()=>setForm({...form,attendance:o.val,myMenu:"",companions:[]})}>{o.label}</ToggleBtn>
          ))}
        </div>
      </Field>
      {form.attendance==="da" && (<>
        <Field label="Meniul tău" error={errors.menu}>
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
            {MENU_OPTIONS.map(o=>(
              <ToggleBtn key={o.val} active={form.myMenu===o.val} activeColor={T.green} onClick={()=>setForm({...form,myMenu:o.val})}>{o.label}</ToggleBtn>
            ))}
          </div>
        </Field>
        <Field label="Însoțitori">
          <p style={{ fontFamily:FS.body, fontSize:"0.77rem", color:T.plumLight, margin:"0 0 0.8rem", lineHeight:1.7 }}>
            Adaugă persoanele care vin cu tine și alege meniul fiecăruia.
          </p>
          {form.companions.map((c,i) => (
            <div key={i} style={{ background:c.type==="adult"?"rgba(210,218,242,0.38)":"rgba(242,218,210,0.38)", border:"1px solid "+T.lavB, borderRadius:"14px", padding:"0.85rem 1rem", marginBottom:"0.6rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                <span style={{ fontFamily:FS.body, fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase", color:T.plum, fontWeight:600 }}>
                  {c.type==="adult" ? "👤 Adult însoțitor" : "👶 Copil"}
                </span>
                <button onClick={()=>removeComp(i)} style={{ background:"none", border:"none", cursor:"pointer", color:T.err, fontSize:"0.9rem", opacity:0.6, padding:"0 0.2rem" }}>✕</button>
              </div>
              <input style={{...sInput, fontSize:"0.83rem", padding:"0.47rem 0.8rem", marginBottom:"0.5rem"}} placeholder={c.type==="adult"?"Numele adultului (opțional)":"Numele copilului (opțional)"} value={c.name} onChange={e=>updateComp(i,"name",e.target.value)} />
              <div style={{...sLabel, marginBottom:"0.28rem"}}>Preferință meniu</div>
              <MenuSelect value={c.menu} onChange={v=>updateComp(i,"menu",v)} error={errors["c"+i]} />
            </div>
          ))}
          <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginTop:"0.3rem" }}>
            <button onClick={()=>addComp("adult")} style={sAddBtn}>+ Adult însoțitor</button>
            <button onClick={()=>addComp("kid")} style={{...sAddBtn, borderColor:"rgba(190,130,120,0.45)", color:"#7a4040"}}>+ Copil</button>
          </div>
          {(adultsCount+kidsCount)>0 && (
            <div style={{ marginTop:"0.6rem", fontSize:"0.73rem", color:T.plumLight, fontFamily:FS.body }}>
              {adultsCount>0&&adultsCount+(adultsCount===1?" adult însoțitor":" adulți însoțitori")}
              {adultsCount>0&&kidsCount>0&&" · "}
              {kidsCount>0&&kidsCount+(kidsCount===1?" copil":" copii")}
            </div>
          )}
        </Field>
      </>)}
      <Field label="Un mesaj pentru noi (opțional)">
        <textarea style={{...sInput, height:"84px", resize:"vertical"}} placeholder="O urare, un gând..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
      </Field>
      <div style={{ textAlign:"center", marginTop:"1.8rem" }}>
        <button onClick={handleSubmit} disabled={saving} style={{...sBtn, opacity:saving?0.6:1}}>
          {saving?"Se trimite...":"Trimite răspunsul"}
        </button>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────
function AdminDashboard({ guests, onClose, onDelete, loading }) {
  const attending = guests.filter(g=>g.attendance==="da");
  const declined  = guests.filter(g=>g.attendance==="nu");
  const totalAdults = attending.reduce((s,g)=>s+1+(g.adults_count||0),0);
  const totalKids   = attending.reduce((s,g)=>s+(g.kids_count||0),0);
  const menus = {omnivor:0,vegetarian:0,vegan:0};
  attending.forEach(g=>{
    if(g.my_menu) menus[g.my_menu]++;
    (g.companions||[]).forEach(c=>{if(c.menu)menus[c.menu]++;});
  });

  const exportCSV = () => {
    const rows = [["Nume","Prezență","Meniu propriu","Adulți însoțitori","Copii","Detalii însoțitori","Mesaj","Data"]];
    guests.forEach(g=>{
      const cd=(g.companions||[]).map(c=>(c.type==="adult"?"Adult":"Copil")+(c.name?" ("+c.name+")":"")+": "+menuLabel(c.menu)).join(" | ");
      rows.push([g.name, g.attendance==="da"?"Confirmă":"Nu poate veni", g.attendance==="da"?menuLabel(g.my_menu):"-", g.adults_count||0, g.kids_count||0, cd||"-", g.message||"", g.response_date||""]);
    });
    const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="invitatii_tudor_andreea.csv";a.click();
    URL.revokeObjectURL(url);
  };

  const stats=[
    {label:"Total răspunsuri", val:guests.length,        icon:"📋"},
    {label:"Confirmați",       val:attending.length,      icon:"✅"},
    {label:"Nu pot veni",      val:declined.length,       icon:"❌"},
    {label:"Total persoane",   val:totalAdults+totalKids, icon:"🧑‍🤝‍🧑"},
    {label:"Adulți",           val:totalAdults,           icon:"👤"},
    {label:"Copii",            val:totalKids,             icon:"👶"},
    {label:"Fără restricții",  val:menus.omnivor,         icon:"🍖"},
    {label:"Vegetarieni",      val:menus.vegetarian,      icon:"🥗"},
    {label:"Vegani",           val:menus.vegan,           icon:"🌱"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:pageBg, padding:"2rem 1rem 3rem" }}>
      <div style={{ maxWidth:"700px", margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.5rem" }}>
          <h2 style={{ fontFamily:FS.heading, fontSize:"2rem", color:T.plum, margin:0, fontWeight:600 }}>Centralizator Invitați</h2>
          <div style={{ display:"flex", gap:"0.45rem", flexWrap:"wrap" }}>
            <button onClick={exportCSV} style={{...sBtn, padding:"0.45rem 1rem", fontSize:"0.7rem", background:"linear-gradient(135deg,"+T.green+","+T.greenL+")"}}>Export CSV</button>
            <button onClick={onClose}   style={{...sBtn, padding:"0.45rem 1rem", fontSize:"0.7rem", background:"linear-gradient(135deg,"+T.plumMid+","+T.plumLight+")"}}>← Înapoi</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:"0.5rem", marginBottom:"1.6rem" }}>
          {stats.map(s=>(
            <div key={s.label} style={{ background:"rgba(210,215,240,0.5)", border:"1px solid "+T.lavB, borderRadius:"12px", padding:"0.65rem 0.4rem", textAlign:"center" }}>
              <div style={{ fontSize:"1.1rem" }}>{s.icon}</div>
              <div style={{ fontFamily:FS.heading, fontSize:"1.8rem", color:T.plum, lineHeight:1.1, fontWeight:600 }}>{s.val}</div>
              <div style={{ fontSize:"0.59rem", color:T.plumLight, fontFamily:FS.body, marginTop:"0.12rem", lineHeight:1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <Divider />
        {loading ? (
          <p style={{ textAlign:"center", color:T.plumLight, fontFamily:FS.body, fontStyle:"italic" }}>Se încarcă...</p>
        ) : guests.length===0 ? (
          <p style={{ textAlign:"center", color:T.plumLight, fontFamily:FS.body, fontStyle:"italic" }}>Nu există răspunsuri încă.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.65rem" }}>
            {guests.map(g=>(
              <div key={g.id} style={{ background:g.attendance==="da"?"rgba(210,220,245,0.5)":"rgba(240,215,215,0.4)", border:"1px solid "+(g.attendance==="da"?T.lavB:"rgba(180,120,120,0.3)"), borderRadius:"14px", padding:"0.95rem 1rem", display:"grid", gridTemplateColumns:"1fr auto", gap:"0.5rem", alignItems:"start" }}>
                <div>
                  <div style={{ fontFamily:FS.heading, fontSize:"1.25rem", color:T.plum, fontWeight:600, lineHeight:1.2 }}>{g.name}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"0.38rem", marginTop:"0.3rem" }}>
                    <Tag color={g.attendance==="da"?T.green:T.err} bg={g.attendance==="da"?"rgba(58,82,64,0.1)":"rgba(139,38,53,0.1)"}>{g.attendance==="da"?"✓ Confirmă":"✗ Nu poate veni"}</Tag>
                    {g.attendance==="da"&&g.my_menu&&<Tag color={T.green} bg="rgba(58,82,64,0.1)">{menuIcon(g.my_menu)} {menuLabel(g.my_menu)}</Tag>}
                    {g.attendance==="da"&&(g.adults_count>0||g.kids_count>0)&&(
                      <Tag color={T.plumMid} bg="rgba(74,56,88,0.08)">
                        {[g.adults_count>0&&g.adults_count+" adult"+(g.adults_count===1?"":"i"),g.kids_count>0&&g.kids_count+" copil"+(g.kids_count===1?"":"i")].filter(Boolean).join(" · ")} însoț.
                      </Tag>
                    )}
                    <Tag color={T.plumLight} bg="transparent">📅 {g.response_date}</Tag>
                  </div>
                  {g.attendance==="da"&&(g.companions||[]).length>0&&(
                    <div style={{ marginTop:"0.55rem", paddingLeft:"0.7rem", borderLeft:"2px solid "+T.lavB }}>
                      <div style={{ fontSize:"0.6rem", color:T.plumLight, fontFamily:FS.body, marginBottom:"0.25rem", letterSpacing:"0.1em", textTransform:"uppercase" }}>Însoțitori</div>
                      {(g.companions||[]).map((c,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.38rem", marginBottom:"0.18rem", flexWrap:"wrap" }}>
                          <span style={{ fontSize:"0.76rem", fontFamily:FS.body, color:T.plum }}>{c.type==="adult"?"👤":"👶"} {c.name||(c.type==="adult"?"Adult":"Copil")}</span>
                          {c.menu&&<Tag color={T.green} bg="rgba(58,82,64,0.1)">{menuIcon(c.menu)} {menuLabel(c.menu)}</Tag>}
                        </div>
                      ))}
                    </div>
                  )}
                  {g.message&&(
                    <div style={{ fontSize:"0.73rem", color:T.plumLight, fontFamily:FS.body, fontStyle:"italic", marginTop:"0.5rem", paddingLeft:"0.5rem", borderLeft:"2px solid "+T.lavB }}>
                      {"\u201E"}{g.message}{"\u201D"}
                    </div>
                  )}
                </div>
                <button onClick={()=>onDelete(g.id)} style={{ background:"none", border:"none", cursor:"pointer", color:T.err, fontSize:"0.9rem", padding:"0.2rem", opacity:0.5 }} title="Șterge">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin modal ───────────────────────────────────
function AdminModal({ onSuccess, onClose }) {
  const [code,setCode]=useState(""); const [err,setErr]=useState("");
  const attempt=()=>{ if(code===ADMIN_PASSWORD) onSuccess(); else setErr("Cod incorect."); };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(30,20,50,0.45)", backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)" }} onClick={onClose}>
      <div style={{ background:T.card, borderRadius:"20px", border:"1px solid "+T.lavB, boxShadow:"0 16px 60px rgba(45,36,56,0.25)", padding:"2rem", width:"min(320px,90vw)" }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ fontFamily:FS.heading, fontSize:"1.6rem", color:T.plum, margin:"0 0 0.4rem", fontWeight:600, textAlign:"center" }}>Acces organizatori</h3>
        <p style={{ fontFamily:FS.body, fontSize:"0.74rem", color:T.plumLight, textAlign:"center", margin:"0 0 1.4rem" }}>Introduceți codul de acces</p>
        <input type="password" placeholder="Cod acces" value={code} onChange={e=>{setCode(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&attempt()} style={{...sInput, marginBottom:"0.8rem", textAlign:"center", fontSize:"1rem", letterSpacing:"0.2em"}} autoFocus />
        {err&&<p style={{...sErr, textAlign:"center", marginBottom:"0.6rem"}}>{err}</p>}
        <div style={{ display:"flex", gap:"0.6rem" }}>
          <button onClick={attempt} style={{...sBtn, flex:1, padding:"0.65rem 1rem"}}>Intră</button>
          <button onClick={onClose} style={{...sBtn, flex:"0 0 auto", padding:"0.65rem 1rem", background:"linear-gradient(135deg,"+T.plumMid+","+T.plumLight+")"}}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────
export default function App() {
  const [guests, setGuests]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showAdmin, setShowAdmin]           = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeSection, setActiveSection]   = useState("cover");

  // ── Supabase: load guests ──────────────────────
  const loadGuests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rsvp_responses")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setGuests(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadGuests(); }, [loadGuests]);

  // ── Supabase: save guest ───────────────────────
  const handleSubmit = async (guest) => {
    const { error } = await supabase.from("rsvp_responses").insert({
      id:            guest.id,
      name:          guest.name,
      attendance:    guest.attendance,
      my_menu:       guest.myMenu,
      companions:    guest.companions,
      adults_count:  guest.adultsCount,
      kids_count:    guest.kidsCount,
      message:       guest.message,
      response_date: guest.date,
    });
    if (!error) setGuests(prev => [{ ...guest, my_menu: guest.myMenu, adults_count: guest.adultsCount, kids_count: guest.kidsCount, response_date: guest.date }, ...prev]);
  };

  // ── Supabase: delete guest ─────────────────────
  const handleDelete = async (id) => {
    const { error } = await supabase.from("rsvp_responses").delete().eq("id", id);
    if (!error) setGuests(prev => prev.filter(g => g.id !== id));
  };

  // ── IntersectionObserver for nav highlight ─────
  useEffect(() => {
    const ids = ["cover","nasi","familii","locatie","contact","rsvp"];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.4 });
    ids.forEach(id => { const el=document.getElementById(id); if(el) obs.observe(el); });
    return () => obs.disconnect();
  }, [showAdmin]);

  if (showAdmin) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@300;400;500;600&display=swap');*{box-sizing:border-box;}@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}button:hover{box-shadow:0 0 20px rgba(201,168,76,0.5)!important;transform:translateY(-1px)!important;}`}</style>
      <AdminDashboard guests={guests} onClose={()=>setShowAdmin(false)} onDelete={handleDelete} loading={loading} />
    </>
  );

  return (
    <div style={{ fontFamily:FS.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:wght@400;600&family=Montserrat:wght@300;400;500;600&display=swap');
        @keyframes fadeIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flicker { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes sway    { 0%,100%{transform:rotate(-1deg)} 50%{transform:rotate(1deg)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        button:hover { box-shadow:0 0 20px rgba(201,168,76,0.5)!important; transform:translateY(-1px)!important; transition:all 0.3s ease!important; }
        input:focus,textarea:focus { border-color:rgba(201,168,76,0.7)!important; box-shadow:0 0 0 3px rgba(201,168,76,0.15)!important; outline:none; }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(180,175,210,0.4);border-radius:3px}
      `}</style>

      <NavMenu activeSection={activeSection} adminOpen={()=>setShowAdminModal(true)} />
      {showAdminModal && <AdminModal onSuccess={()=>{setShowAdminModal(false);setShowAdmin(true);loadGuests();}} onClose={()=>setShowAdminModal(false)} />}

      {/* COVER */}
      <section id="cover" style={{ minHeight:"100vh", background:forestBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", padding:"2rem 1rem" }}>
        <ForestDecor />
        <div style={{ position:"relative", zIndex:10, textAlign:"center", padding:"2.8rem 2.6rem", background:"rgba(240,238,255,0.72)", backdropFilter:"blur(12px) saturate(1.4)", WebkitBackdropFilter:"blur(12px) saturate(1.4)", borderRadius:"28px", border:"1px solid rgba(255,255,255,0.6)", boxShadow:"0 8px 50px rgba(30,15,60,0.15),inset 0 1px 0 rgba(255,255,255,0.6)", maxWidth:"400px", width:"100%", animation:"fadeUp 1.4s ease both" }}>
          <p style={{ fontFamily:FS.body, fontSize:"0.6rem", letterSpacing:"0.3em", textTransform:"uppercase", color:T.plum, margin:"0 0 0.9rem", fontWeight:600 }}>Vă invităm la nunta noastră</p>
          <h1 style={{ fontFamily:FS.names, fontSize:"clamp(3rem,12vw,5rem)", color:T.plum, margin:"0 0 0.15rem", lineHeight:1.05, fontWeight:400 }}>Andreea și Tudor</h1>
          <div style={{ width:"50px", height:"1px", background:"linear-gradient(90deg,transparent,"+T.gold+",transparent)", margin:"0.9rem auto 1.2rem" }} />
          <p style={{ fontFamily:FS.body, fontSize:"0.95rem", letterSpacing:"0.1em", color:T.plum, margin:"0 0 0.2rem", fontWeight:600 }}>10 Octombrie 2026</p>
          <p style={{ fontFamily:FS.body, fontSize:"0.66rem", letterSpacing:"0.06em", color:T.plumMid, margin:"0 0 0.08rem" }}>La Foret · Strada Salcâmului 15</p>
          <p style={{ fontFamily:FS.body, fontSize:"0.66rem", letterSpacing:"0.06em", color:T.plumMid, margin:"0 0 2rem" }}>Florești, Cluj</p>
          <button onClick={()=>document.getElementById("rsvp").scrollIntoView({behavior:"smooth"})}
            style={{...sBtn, background:"rgba(45,36,56,0.75)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", border:"1.5px solid rgba(201,168,76,0.6)", color:"#fff", fontSize:"0.7rem", letterSpacing:"0.22em", padding:"0.82rem 2.4rem"}}>
            Confirmă prezența
          </button>
        </div>
      </section>

      {/* NAȘI */}
      <Section id="nasi" title="Nașii noștri" subtitle="Cu drag și recunoștință">
        <p style={{ textAlign:"center", fontFamily:FS.body, fontSize:"0.85rem", color:T.plumLight, lineHeight:1.9, margin:"0 0 1.6rem" }}>
          Suntem binecuvântați să avem alături de noi oameni speciali care ne-au ghidat și ne-au susținut cu drag.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {["Ionuț Păcurar și Stejara Dosa","Mircea și Dora Marcu"].map((n,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"1.6rem 1.2rem", background:"rgba(210,215,242,0.35)", border:"1px solid "+T.lavB, borderRadius:"18px" }}>
              <div style={{ fontSize:"1.6rem", marginBottom:"0.5rem" }}>🌿</div>
              <p style={{ fontFamily:FS.heading, fontSize:"1.5rem", color:T.plum, margin:0, fontWeight:600, lineHeight:1.25 }}>{n}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAMILII */}
      <Section id="familii" title="Familiile noastre" subtitle="Cu toată iubirea">
        <p style={{ textAlign:"center", fontFamily:FS.body, fontSize:"0.85rem", color:T.plumLight, lineHeight:1.9, margin:"0 0 1.6rem" }}>
          Această zi nu ar fi posibilă fără dragostea și sprijinul necondiționat al familiilor noastre.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {["Remus și Mirela Henciu","Maria Bota"].map((n,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"1.6rem 1.2rem", background:"rgba(200,220,210,0.3)", border:"1px solid rgba(150,190,160,0.35)", borderRadius:"18px" }}>
              <p style={{ fontFamily:FS.heading, fontSize:"1.4rem", color:T.plum, margin:0, fontWeight:600, lineHeight:1.3 }}>{n}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* LOCAȚIE */}
      <Section id="locatie" title="Locația nunții" subtitle="Unde ne întâlnim">
        <div style={{ textAlign:"center" }}>
          <p style={{ fontFamily:FS.heading, fontSize:"1.8rem", color:T.plum, margin:"0 0 0.25rem", fontWeight:600 }}>La Foret</p>
          <p style={{ fontFamily:FS.body, fontSize:"0.82rem", color:T.plumLight, margin:"0 0 0.15rem", letterSpacing:"0.04em" }}>Strada Salcâmului 15, Florești, Cluj</p>
          <p style={{ fontFamily:FS.body, fontSize:"0.78rem", color:T.gold, margin:"0 0 1.4rem", letterSpacing:"0.08em", fontWeight:600 }}>Ora 14:00</p>
          <div style={{ borderRadius:"16px", overflow:"hidden", border:"1px solid "+T.lavB, marginBottom:"1.4rem", boxShadow:"0 4px 24px rgba(45,36,56,0.1)" }}>
            <iframe title="Harta" width="100%" height="240" frameBorder="0" style={{ display:"block" }}
              src="https://maps.google.com/maps?q=La+Foret+Strada+Salcamului+15+Floresti+Cluj&output=embed" allowFullScreen />
          </div>
          <a href="https://maps.google.com/?q=La+Foret+Strada+Salcamului+15+Floresti+Cluj" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
            <button style={sBtn}>Deschide în Google Maps</button>
          </a>
        </div>
      </Section>

      {/* CONTACT */}
      <Section id="contact" title="Contact" subtitle="Suntem bucuroși să te ajutăm">
        <p style={{ textAlign:"center", fontFamily:FS.body, fontSize:"0.85rem", color:T.plumLight, lineHeight:1.9, margin:"0 0 1.6rem" }}>
          Ai întrebări? Nu ezita să ne contactezi.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {[{name:"Tudor",phone:"0748 147 075",href:"tel:+40748147075"},{name:"Andreea",phone:"0753 805 123",href:"tel:+40753805123"}].map((p,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.2rem 1.4rem", background:"rgba(210,215,242,0.35)", border:"1px solid "+T.lavB, borderRadius:"16px", flexWrap:"wrap", gap:"0.8rem" }}>
              <div>
                <p style={{ fontFamily:FS.heading, fontSize:"1.3rem", color:T.plum, margin:"0 0 0.15rem", fontWeight:600 }}>{p.name}</p>
                <p style={{ fontFamily:FS.body, fontSize:"0.88rem", color:T.plumLight, margin:0, letterSpacing:"0.05em" }}>{p.phone}</p>
              </div>
              <a href={p.href} style={{ textDecoration:"none" }}>
                <button style={{...sBtn, padding:"0.6rem 1.4rem", fontSize:"0.72rem"}}>Sună</button>
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* RSVP */}
      <Section id="rsvp" title="Confirmare prezență" subtitle="Te așteptăm cu drag">
        <p style={{ textAlign:"center", color:T.plumLight, fontSize:"0.84rem", lineHeight:1.9, marginTop:0, marginBottom:"1.3rem", fontFamily:FS.body }}>
          Prezența ta este cel mai frumos cadou.<br/>
          Te rugăm să răspunzi până pe <strong style={{ color:T.plum }}>1 septembrie 2026</strong>.
        </p>
        <Divider />
        <RSVPForm onSubmit={handleSubmit} />
      </Section>

      {/* Footer */}
      <div style={{ background:T.plum, textAlign:"center", padding:"2rem 1rem" }}>
        <p style={{ fontFamily:FS.names, fontSize:"2rem", color:"rgba(255,255,255,0.9)", margin:"0 0 0.3rem" }}>Andreea &amp; Tudor</p>
        <p style={{ fontFamily:FS.body, fontSize:"0.62rem", color:T.gold, letterSpacing:"0.2em", textTransform:"uppercase", margin:0 }}>10 · 10 · 2026 · La Foret, Florești</p>
      </div>
    </div>
  );
}
