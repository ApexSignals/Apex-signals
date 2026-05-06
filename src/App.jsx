import { useState, useEffect } from "react";
const API_URL = "https://apexsignals.mooo.com/signals";
const PHASE_COLOR = { BULLRUN: "#22c55e", BEARMARKET: "#ef4444", SIDEWAYS: "#f59e0b", RECOVERY: "#3b82f6", KAPITULATION: "#f97316", NEUTRAL: "#6b7280" };
const fmt = (pair, price) => { if (!price) return "—"; const p = (pair||"").replace("USDT",""); if (p==="XRP") return Number(price).toFixed(4); if (p==="ETH") return Number(price).toFixed(1); return Number(price).toFixed(0); };
const fmtTime = (iso) => { try { return new Date(iso).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };
const getPair = (s) => (s.pair||"").replace("USDT","");
export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [tab, setTab] = useState("signals");
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const fetchSignals = async () => { try { const res = await fetch(API_URL); if (!res.ok) throw new Error(); const data = await res.json(); setSignals(data.reverse()); setLastUpdate(new Date()); setError(null); } catch { setError("API nicht erreichbar"); } finally { setLoading(false); } };
  useEffect(() => { fetchSignals(); const i = setInterval(fetchSignals,30000); return ()=>clearInterval(i); },[]);
  const wins=signals.filter(s=>s.result==="WIN").length, total=signals.filter(s=>s.result).length;
  const wr=total>0?Math.round(wins/total*100):"—";
  const avgRR=signals.length>0?(signals.reduce((a,s)=>a+(s.rr||0),0)/signals.length).toFixed(1):"—";
  return (
    <div style={{minHeight:"100vh",background:"#f9fafb",fontFamily:"'DM Sans',sans-serif",color:"#111"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 24px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"7px",height:"7px",borderRadius:"50%",background:error?"#ef4444":"#22c55e",boxShadow:`0 0 0 3px ${error?"rgba(239,68,68,0.15)":"rgba(34,197,94,0.15)"}`}}/>
          <span style={{fontWeight:"600",fontSize:"15px"}}>APEX Signals</span>
          {lastUpdate&&<span style={{fontSize:"11px",color:"#9ca3af",fontFamily:"'DM Mono',monospace"}}>· {lastUpdate.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</span>}
        </div>
        <button onClick={()=>setIsPro(!isPro)} style={{padding:"6px 14px",background:isPro?"#111":"#fff",color:isPro?"#fff":"#111",border:"1px solid #e5e7eb",borderRadius:"7px",fontSize:"13px",fontWeight:"500",cursor:"pointer"}}>{isPro?"Pro aktiv":"Upgrade →"}</button>
      </div>
      <div style={{maxWidth:"660px",margin:"0 auto",padding:"28px 20px"}}>
        {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",padding:"12px 16px",fontSize:"13px",color:"#dc2626",marginBottom:"20px",display:"flex",justifyContent:"space-between"}}><span>⚠ {error}</span><button onClick={fetchSignals} style={{fontSize:"12px",color:"#dc2626",background:"none",border:"1px solid #fecaca",borderRadius:"5px",padding:"3px 10px",cursor:"pointer"}}>Retry</button></div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"28px"}}>
          {[{label:"Win Rate",value:total>0?`${wr}%`:"—",color:"#22c55e"},{label:"Signals",value:signals.length||"—",color:"#111"},{label:"Ø R:R",value:signals.length>0?`1:${avgRR}`:"—",color:"#f59e0b"},{label:"Top Pair",value:"XRP",color:"#3b82f6"}].map(s=>(
            <div key={s.label} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"14px 16px"}}>
              <div style={{fontSize:"11px",color:"#9ca3af",marginBottom:"5px"}}>{s.label}</div>
              <div style={{fontSize:"20px",fontWeight:"500",color:s.color,fontFamily:"'DM Mono',monospace"}}>{loading?"…":s.value}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"2px",background:"#f3f4f6",borderRadius:"8px",padding:"3px",marginBottom:"18px"}}>
          {["signals","performance"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px",background:tab===t?"#fff":"transparent",border:"none",borderRadius:"6px",fontSize:"13px",fontWeight:tab===t?"500":"400",color:tab===t?"#111":"#6b7280",cursor:"pointer",boxShadow:tab===t?"0 1px 3px rgba(0,0,0,0.07)":"none"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
        {loading&&<div style={{textAlign:"center",padding:"40px",color:"#9ca3af",fontSize:"13px"}}>Lade Signals…</div>}
        {!loading&&tab==="signals"&&(
          <div>
            {signals.length===0&&!error&&<div style={{textAlign:"center",padding:"40px",color:"#9ca3af",fontSize:"13px"}}>Noch keine Signals.</div>}
            {!isPro&&signals.length>0&&<p style={{fontSize:"12px",color:"#9ca3af",marginBottom:"12px"}}>3 von {signals.length} Signals · <span style={{color:"#111",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setIsPro(true)}>Alle freischalten</span></p>}
            {signals.map((s,i)=>{
              const locked=!isPro&&i>=3, isLong=s.direction==="LONG", isWin=s.result==="WIN", pair=getPair(s);
              return (
                <div key={i} style={{position:"relative",background:"#fff",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"15px 18px",marginBottom:"7px",overflow:"hidden"}}>
                  {locked&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(5px)",background:"rgba(249,250,251,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2,borderRadius:"10px"}}><button onClick={()=>setIsPro(true)} style={{padding:"7px 16px",background:"#111",color:"#fff",border:"none",borderRadius:"7px",fontSize:"13px",fontWeight:"500",cursor:"pointer"}}>Freischalten →</button></div>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontWeight:"500",fontSize:"14px"}}>{pair}/USDT</span>
                      <span style={{fontSize:"11px",fontWeight:"500",padding:"2px 8px",borderRadius:"4px",background:isLong?"#f0fdf4":"#fef2f2",color:isLong?"#16a34a":"#dc2626"}}>{s.direction}</span>
                      {s.phase&&<span style={{fontSize:"11px",color:PHASE_COLOR[s.phase]||"#6b7280",fontFamily:"'DM Mono',monospace"}}>{s.phase}</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      {s.result&&<span style={{fontSize:"12px",fontWeight:"500",color:isWin?"#16a34a":"#dc2626"}}>{isWin?"✓ Win":"✗ Loss"}</span>}
                      <span style={{fontSize:"11px",color:"#9ca3af",fontFamily:"'DM Mono',monospace"}}>{fmtTime(s.timestamp)}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"18px",marginTop:"9px",fontFamily:"'DM Mono',monospace",fontSize:"12px",color:"#9ca3af"}}>
                    <span>Entry <b style={{color:"#111",fontWeight:"500"}}>{fmt(s.pair,s.entry)}</b></span>
                    <span>SL <b style={{color:"#ef4444",fontWeight:"500"}}>{fmt(s.pair,s.sl)}</b></span>
                    <span>TP <b style={{color:"#22c55e",fontWeight:"500"}}>{fmt(s.pair,s.tp)}</b></span>
                    <span>R:R <b style={{color:"#f59e0b",fontWeight:"500"}}>1:{s.rr}</b></span>
                    {s.score&&<span>Score <b style={{color:s.score>=12?"#22c55e":"#f59e0b",fontWeight:"500"}}>{s.score}</b></span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading&&tab==="performance"&&(
          <div>
            {["BTC","ETH","XRP"].map(pair=>{
              const ps=signals.filter(s=>getPair(s)===pair), pw=ps.filter(s=>s.result==="WIN").length, pwr=ps.length>0?Math.round(pw/ps.length*100):0;
              const c=pwr>=70?"#22c55e":pwr>=50?"#f59e0b":"#ef4444";
              return (
                <div key={pair} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"10px",padding:"16px 20px",marginBottom:"8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontWeight:"500",fontSize:"14px"}}>{pair}/USDT</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontWeight:"500",color:ps.length>0?c:"#9ca3af"}}>{ps.length>0?`${pwr}%`:"Keine Daten"}</span>
                  </div>
                  <div style={{background:"#f3f4f6",borderRadius:"4px",height:"4px",overflow:"hidden"}}><div style={{width:`${pwr}%`,height:"100%",background:c,borderRadius:"4px"}}/></div>
                  <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"7px"}}>{ps.length>0?`${pw} von ${ps.length} Trades gewonnen`:"Noch keine Trades"}</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{marginTop:"36px",textAlign:"center",fontSize:"11px",color:"#d1d5db"}}>Keine Anlageberatung · Handel auf eigenes Risiko</div>
      </div>
    </div>
  );
}
