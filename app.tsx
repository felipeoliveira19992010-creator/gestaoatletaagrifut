// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./storage.js";

const LOGO_SRC = "logo.png";
const getLogoSrc = () => new URL(LOGO_SRC, window.location.href).href;

// ── Logo ─────────────────────────────────────────────────
function AgrifutLogo({size=48}:{size?:number}) {
  return (
    <img src={LOGO_SRC} alt="Agrifut Itajaí EC" style={{width:size,height:size,objectFit:"contain",display:"block"}}/>
  );
}

// ── Constants ────────────────────────────────────────────
const CATS = ["Sub-6","Sub-7","Sub-8","Sub-9","Sub-10","Sub-11","Sub-12","Sub-13","Sub-14","Sub-15","Sub-16","Sub-17","Sub-18"];
const PROJS = ["Rendimento","Academy","Conexão"];
const RELS = ["Pai","Mãe","Avô/Avó","Tio/Tia","Irmão/Irmã","Responsável Legal","Outro"];
const PTYPES = ["Taxa de Inscrição","Campeonato","Mensalidade","Uniforme","Outro"];
const PSTAT = ["Pendente","Pago","Isento"];
const POSICOES = ["Goleiro","Lateral Direito","Lateral Esquerdo","Zagueiro","Volante","Meia","Meia-atacante","Ponta Direita","Ponta Esquerda","Centroavante"];
const PC = { Rendimento:"#DC2626", Academy:"#2563EB", "Conexão":"#059669" };
const PGROUPS = {
  Rendimento: ["Sub-9","Sub-10","Sub-11","Sub-12","Sub-13","Sub-14","Sub-15","Sub-16","Sub-17","Sub-18"].map(c => ({ label:c, cats:[c] })),
  Academy: [
    { label:"Sub-14 e Sub-15", cats:["Sub-14","Sub-15"] },
    { label:"Sub-16 a Sub-18", cats:["Sub-16","Sub-17","Sub-18"] }
  ],
  "Conexão": [
    { label:"Sub-6 a Sub-8", cats:["Sub-6","Sub-7","Sub-8"] },
    { label:"Sub-9 a Sub-11", cats:["Sub-9","Sub-10","Sub-11"] },
    { label:"Sub-12 a Sub-14", cats:["Sub-12","Sub-13","Sub-14"] }
  ]
};
const WA_GROUPS = {
  "Sub-16":"https://chat.whatsapp.com/BykCM04K6Sb0Ch2zC1YDbZ?mode=gi_t",
  "Sub-17":"https://chat.whatsapp.com/BykCM04K6Sb0Ch2zC1YDbZ?mode=gi_t",
  "Academy":"https://chat.whatsapp.com/JPuW8yVhE569Uqasos0fuG?mode=gi_t"
};
const TAMANHOS = ['PP','P','M','G','GG','XG','Único'];
const ITEM_CATS = ['Item de Venda','Material de Uso'];
const ITENS_INICIAIS = [
  {id:1,nome:'Uniforme de Treino',categoria:'Item de Venda',preco:90,tamanhos:['P','M','G','GG'],qtd:{P:10,M:10,G:8,GG:5},foto:null,descricao:'Conjunto treino oficial Agrifut'},
  {id:2,nome:'Camisa de Torcida',categoria:'Item de Venda',preco:119.9,tamanhos:['P','M','G','GG','XG'],qtd:{P:15,M:15,G:12,GG:8,XG:4},foto:null,descricao:'Camisa oficial de torcida'},
  {id:3,nome:'Uniforme de Passeio',categoria:'Item de Venda',preco:0,tamanhos:['P','M','G','GG'],qtd:{P:5,M:5,G:4,GG:3},foto:null,descricao:'Uniforme oficial de passeio'},
  {id:4,nome:'Boné',categoria:'Item de Venda',preco:59.9,tamanhos:['Único'],qtd:{Único:20},foto:null,descricao:'Boné oficial Agrifut Itajaí EC'},
];

const N="#1B2A4A", G="#F5C518", GR="#25D366", R="#DC2626", PU="#7C3AED", BL="#2563EB", OR="#D97706";
const WA_ADMIN = "5547997776191";
const CNPJ = "13.254.085/0001-86";

// ── Helpers ───────────────────────────────────────────────
const tod = () => new Date().toISOString().slice(0,10);
const fmtD = d => { if(!d) return "—"; const[y,m,dd]=d.split("-"); return `${dd}/${m}/${y}`; };
const ageOf = d => {
  if(!d) return "";
  const [y,m,dd]=d.split("-").map(Number), t=new Date();
  let a=t.getFullYear()-y;
  if(t.getMonth()+1<m||(t.getMonth()+1===m&&t.getDate()<dd)) a--;
  return a;
};
const maxDOB = () => { const d=new Date(); d.setFullYear(d.getFullYear()-6); return d.toISOString().slice(0,10); };
const minDOB = () => { const d=new Date(); d.setFullYear(d.getFullYear()-18); return d.toISOString().slice(0,10); };
const fmtCPF = v => { const d=v.replace(/\D/g,"").slice(0,11); if(d.length<=3)return d; if(d.length<=6)return d.replace(/(\d{3})(\d+)/,"$1.$2"); if(d.length<=9)return d.replace(/(\d{3})(\d{3})(\d+)/,"$1.$2.$3"); return d.replace(/(\d{3})(\d{3})(\d{3})(\d+)/,"$1.$2.$3-$4"); };
const fmtTel = v => { const d=v.replace(/\D/g,"").slice(0,11); if(!d)return""; if(d.length<=2)return`(${d}`; if(d.length<=6)return`(${d.slice(0,2)}) ${d.slice(2)}`; if(d.length<=10)return`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`; return`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`; };
const fmtCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ");
const fmtExp = v => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };
const fmtR = v => v ? `R$ ${Number(v).toFixed(2).replace(".",",")}` : "-";
const normTxt = v => String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const sortName = (a,b) => (a.nomeAtleta||"").localeCompare(b.nomeAtleta||"", "pt-BR", {sensitivity:"base"});
const isBirthdayToday = a => {
  if(!a.dataNasc) return false;
  const [,m,d]=a.dataNasc.split("-");
  const today=tod();
  return today.slice(5,10)===`${m}-${d}`;
};
const rangePres = (base, mode) => {
  const d=new Date(`${base}T12:00:00`);
  let start=new Date(d), end=new Date(d), label="Dia";
  if(mode==="semana"){
    const day=(d.getDay()+6)%7;
    start.setDate(d.getDate()-day);
    end=new Date(start);end.setDate(start.getDate()+6);
    label="Semana";
  } else if(mode==="mes"){
    start=new Date(d.getFullYear(),d.getMonth(),1,12);
    end=new Date(d.getFullYear(),d.getMonth()+1,0,12);
    label="Mês";
  } else if(mode==="semestre"){
    const firstMonth=d.getMonth()<6?0:6;
    start=new Date(d.getFullYear(),firstMonth,1,12);
    end=new Date(d.getFullYear(),firstMonth+6,0,12);
    label="Semestre";
  }
  const iso=x=>x.toISOString().slice(0,10);
  return {start:iso(start),end:iso(end),label};
};
const genToken = () => "AGF"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
const genTxn = () => "TXN-"+Date.now().toString(36).toUpperCase().slice(-8);
const catN = c => parseInt((c||"").replace(/\D/g,""))||0;
const readB64 = f => new Promise(r => { const fr=new FileReader(); fr.onload=e=>r({data:e.target.result,name:f.name,type:f.type}); fr.readAsDataURL(f); });
const expCSV = (rows,fn) => { const csv=rows.map(r=>r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n"); const b=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=fn; a.click(); URL.revokeObjectURL(u); };
const waOpen = (tel,msg) => window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`,"_blank");

// Build shareable link from token
const buildLink = token => {
  const base = window.location.href.split("#")[0].split("?")[0];
  return `${base}?atleta=${token}`;
};
const getTokenFromURL = () => {
  const p = new URLSearchParams(window.location.search);
  return p.get("atleta") || "";
};

const getMissingDocs = a => {
  const d=[];
  if(!a.rgAtleta) d.push("RG ou Certidão de Nascimento do Atleta");
  if(!a.rgResp) d.push("RG ou CPF do Responsável");
  if(!a.comprResid) d.push("Comprovante de Residência");
  if(a.neurodivergente&&!a.laudo) d.push("Laudo Médico");
  return d;
};
const getGroupLink = a => {
  if(a.categoria==="Sub-16"||a.categoria==="Sub-17") return WA_GROUPS["Sub-16"];
  if(a.projeto==="Academy") return WA_GROUPS["Academy"];
  return null;
};
const buildDocsMsg = a => {
  const miss=getMissingDocs(a); if(!miss.length) return null;
  const link=getGroupLink(a);
  return `Olá, ${a.nomeResp}! 👋\n\nEquipe *Itajaí Agrifut* 🟡⚫\n\nO cadastro do atleta *${a.nomeAtleta}* possui documentos pendentes:\n\n${miss.map((d,i)=>`${i+1}. ${d}`).join("\n")}\n\n📱 *Como enviar os documentos:*\nAcesse seu link exclusivo abaixo e clique em 📁 Documentos → + Adicionar\n\n🔗 ${buildLink(a.token||"")}\n\n${link?`👥 *Entre no grupo:*\n${link}\n\n`:""}Qualquer dúvida estamos à disposição! ⚽`;
};

const isImgDoc = f => !!(f&&f.data&&(((f.type||"").startsWith("image/"))||String(f.data).startsWith("data:image/")));
const docName = f => f&&f.name?f.name:"Documento anexado";
const docTileHTML = (label,file,extra="") => {
  if(!file) return "";
  if(isImgDoc(file)){
    return `<div class="doc-file ${extra}"><div class="doc-caption"><strong>${label}</strong><span>${docName(file)}</span></div><div class="doc-img-wrap"><img src="${file.data}" alt="${label}"/></div></div>`;
  }
  return `<div class="doc-file doc-pdf ${extra}"><div class="doc-caption"><strong>${label}</strong><span>${docName(file)}</span></div><div class="doc-pdf-box">Arquivo PDF anexado. Abra o documento original pelo perfil do atleta.</div></div>`;
};
const docAttachmentsHTML = a => {
  const mainDocs=[
    {label:"RG / Certidão do Atleta",file:a.rgAtleta},
    {label:"RG / CPF do Responsável",file:a.rgResp},
    {label:"Comprovante de Residência",file:a.comprResid}
  ].filter(d=>d.file);
  const main=mainDocs.length?`<section class="doc-page"><h2>Documentos Anexados</h2><p class="doc-note">Imagens em escala original, reduzidas automaticamente somente para caber na folha.</p><div class="doc-img-grid doc-count-${mainDocs.length}">${mainDocs.map(d=>docTileHTML(d.label,d.file)).join("")}</div></section>`:"";
  const laudo=a.laudo?`<section class="doc-page laudo-page"><h2>Laudo Médico</h2><p class="doc-note">Laudo anexado em folha separada.</p><div class="doc-img-grid doc-count-1">${docTileHTML("Laudo Médico",a.laudo,"laudo-doc")}</div></section>`:"";
  return main+laudo;
};
const docAttachmentStyles = `@page{size:A4;margin:10mm}.doc-page{page-break-before:always;break-before:page;display:flex;flex-direction:column;gap:8px;background:white}.doc-page h2{font-size:16px;color:#1B2A4A;margin:0;border-bottom:3px solid #F5C518;padding-bottom:6px}.doc-note{font-size:10px;color:#64748B;margin:0 0 4px}.doc-img-grid{flex:1;display:grid;gap:8px;min-height:0}.doc-count-1{grid-template-rows:1fr}.doc-count-2{grid-template-rows:1fr 1fr}.doc-count-3{grid-template-rows:repeat(3,1fr)}.doc-file{border:1px solid #CBD5E1;border-radius:8px;padding:7px;display:flex;flex-direction:column;min-height:0;overflow:hidden;break-inside:avoid;page-break-inside:avoid}.doc-caption{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:5px}.doc-caption strong{font-size:11px;color:#1B2A4A;text-transform:uppercase}.doc-caption span{font-size:9px;color:#64748B;text-align:right;word-break:break-all}.doc-img-wrap{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#F8FAFC;border-radius:6px}.doc-img-wrap img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;display:block}.doc-pdf-box{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;background:#F8FAFC;border-radius:6px;color:#64748B;font-size:12px;padding:12px}.laudo-page .doc-img-grid{grid-template-rows:1fr}@media screen{.doc-page{min-height:980px;margin-top:28px;border-top:1px solid #E2E8F0;padding-top:16px}.doc-img-grid{height:850px}.laudo-doc .doc-img-wrap{height:auto;min-height:850px}}@media print{.doc-page{height:260mm;padding-top:0}.doc-img-grid{height:236mm}.doc-file{padding:5mm}.doc-caption{margin-bottom:3mm}.laudo-page{height:auto;min-height:260mm}.laudo-doc{display:block;overflow:visible;break-inside:auto;page-break-inside:auto}.laudo-doc .doc-img-wrap{height:auto;overflow:visible;display:block;text-align:center;background:white}.laudo-doc .doc-img-wrap img{max-height:none}}`;

const generatePDF = (a, sig) => {
  const docs=[{l:"RG Atleta",ok:!!a.rgAtleta},{l:"RG Responsável",ok:!!a.rgResp},{l:"Comp. Residência",ok:!!a.comprResid},{l:"Laudo Médico",ok:!!a.laudo}];
  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Ficha — ${a.nomeAtleta}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:28px;color:#1E293B;font-size:13px}
.hdr{display:flex;align-items:center;gap:16px;margin-bottom:20px;border-bottom:3px solid #F5C518;padding-bottom:14px}
.logo{width:58px;height:58px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.logo img{width:100%;height:100%;object-fit:contain;display:block}
h1{font-size:20px;color:#1B2A4A}
.sec{margin-bottom:18px}.sec-t{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1B2A4A;border-bottom:2px solid #F5C518;padding-bottom:3px;margin-bottom:10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}.fl{font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase}.fv{color:#1E293B;margin-top:2px}
.termo{font-size:12px;line-height:1.8;color:#374151;background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #E2E8F0;margin-bottom:12px}
.doc-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.dok{background:#F0FFF4;color:#065F46;border:1px solid #86EFAC;border-radius:8px;padding:8px;text-align:center;font-size:11px;font-weight:700}
.dno{background:#FFF5F5;color:#DC2626;border:1px solid #FECACA;border-radius:8px;padding:8px;text-align:center;font-size:11px;font-weight:700}
.sig-a{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:28px}.sig-b{border-top:2px solid #1B2A4A;padding-top:6px;text-align:center;font-size:11px;color:#64748B;text-transform:uppercase}
.foot{margin-top:24px;text-align:center;font-size:10px;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:10px}
${docAttachmentStyles}
@media print{body{padding:14px}}</style></head><body>
<div class="hdr"><div class="logo"><img src="${getLogoSrc()}" alt="Agrifut Itajaí EC"/></div><div><h1>Itajaí Agrifut</h1><p style="font-size:11px;color:#94A3B8">CNPJ ${CNPJ} · Ficha de Matrícula</p></div></div>
<div class="sec"><div class="sec-t">Dados do Atleta</div><div class="grid">
<div><div class="fl">Nome</div><div class="fv">${a.nomeAtleta||"—"}</div></div>
<div><div class="fl">Posição</div><div class="fv">${a.posicao||"—"}</div></div>
<div><div class="fl">Data de Nascimento</div><div class="fv">${fmtD(a.dataNasc)} (${a.age} anos)</div></div>
<div><div class="fl">CPF</div><div class="fv">${a.cpfAtleta||"—"}</div></div>
<div><div class="fl">RG</div><div class="fv">${a.rgAtletaNum||"—"}</div></div>
<div><div class="fl">Telefone</div><div class="fv">${a.telAtleta||"—"}</div></div>
<div><div class="fl">Escola / Série</div><div class="fv">${a.escola||"—"}${a.serie?" — "+a.serie:""}</div></div>
<div><div class="fl">Categoria / Projeto</div><div class="fv">${a.categoria||"—"} · ${a.projeto||"—"}</div></div>
<div><div class="fl">Endereço</div><div class="fv">${[a.endereco,a.bairro,a.cidade].filter(Boolean).join(", ")||"—"}</div></div>
</div></div>
<div class="sec"><div class="sec-t">Dados do Responsável</div><div class="grid">
<div><div class="fl">Nome</div><div class="fv">${a.nomeResp||"—"}</div></div>
<div><div class="fl">CPF</div><div class="fv">${a.cpfResp||"—"}</div></div>
<div><div class="fl">Relação</div><div class="fv">${a.relacao||"—"}</div></div>
<div><div class="fl">WhatsApp</div><div class="fv">${a.telResp||"—"}</div></div>
<div><div class="fl">E-mail</div><div class="fv">${a.emailResp||"—"}</div></div>
<div><div class="fl">Emergência</div><div class="fv">${a.contatoEmerg||"—"}${a.telEmerg?" · "+a.telEmerg:""}</div></div>
</div></div>
<div class="sec"><div class="sec-t">Saúde</div><div class="grid">
<div><div class="fl">Alergias</div><div class="fv">${a.alergia==="sim"?"Sim — "+a.alergiaDesc:"Não"}</div></div>
<div><div class="fl">Medicamentos</div><div class="fv">${a.medicamento==="sim"?"Sim — "+a.medicamentoDesc:"Não"}</div></div>
</div></div>
<div class="sec"><div class="sec-t">Documentos</div><div class="doc-g">
${docs.map(d=>`<div class="${d.ok?"dok":"dno"}">${d.ok?"✅":"❌"}<br/>${d.l}</div>`).join("")}
</div></div>
<div class="sec"><div class="sec-t">Termo de Autorização</div>
<div class="termo">Eu, <strong>${a.nomeResp||"___"}</strong>, CPF <strong>${a.cpfResp||"___"}</strong>, responsável legal por <strong>${a.nomeAtleta||"___"}</strong>, autorizo sua participação nas atividades da Agrifut (CNPJ ${CNPJ}), ciente dos riscos, isentando a Agrifut e colaboradores de responsabilidade por eventuais lesões. Autorizo também o uso da imagem do atleta para fins institucionais.</div>
<p style="font-size:12px;color:#64748B">✅ Termo aceito: ${a.termoAceito?"Sim":"Não"} &nbsp;|&nbsp; 📸 Imagem: ${a.imagemAceito?"Autorizada":"Não autorizada"}</p>
</div>
<div class="sig-a">
<div class="sig-b">${sig?`<img src="${sig}" style="max-width:180px;max-height:70px;margin-bottom:4px" alt="Assinatura"/>`:'<div style="height:70px"></div>'}<div>Assinatura do Responsável</div></div>
<div class="sig-b"><div style="height:70px"></div><div>Data: _____ / _____ / __________</div></div>
</div>
<div class="foot">Itajaí Esporte Clube — Agrifut · CNPJ ${CNPJ} · Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</div>
${docAttachmentsHTML(a)}
<script>setTimeout(()=>window.print(),600)</script></body></html>`;
  const w=window.open("","_blank"); if(w){w.document.write(html);w.document.close();}
};

// ── UI Primitives ─────────────────────────────────────────
function Inp({label,value,onChange,type="text",disabled,placeholder,full,req,note,max,min}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:3,gridColumn:full?"1/-1":""}}>
      <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>{label}{req&&<span style={{color:R}}> *</span>}</label>
      <input type={type} value={value||""} max={max} min={min} disabled={disabled} placeholder={placeholder} onChange={e=>onChange&&onChange(e.target.value)}
        style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none",background:disabled?"#f5f5f5":"white",width:"100%",boxSizing:"border-box"}}/>
      {note&&<span style={{fontSize:11,color:"#888"}}>{note}</span>}
    </div>
  );
}
function Sel({label,value,onChange,opts,full,req}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:3,gridColumn:full?"1/-1":""}}>
      <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>{label}{req&&<span style={{color:R}}> *</span>}</label>
      <select value={value||""} onChange={e=>onChange(e.target.value)} style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none",background:"white",width:"100%"}}>
        <option value="">Selecione...</option>{opts.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Sec({label,c=N}) {
  return (
    <div style={{gridColumn:"1/-1",borderBottom:`2px solid ${G}`,paddingBottom:4,marginTop:10,marginBottom:2}}>
      <span style={{fontSize:11,fontWeight:800,letterSpacing:2,color:c,textTransform:"uppercase"}}>{label}</span>
    </div>
  );
}
function Btn({children,onClick,color=N,outline,small,disabled,full,xst={}}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":color,color:outline?color:(color===G?N:"white"),border:`2px solid ${color}`,borderRadius:8,padding:small?"5px 11px":"9px 18px",cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontSize:small?12:14,opacity:disabled?0.45:1,width:full?"100%":"auto",...xst}}>{children}</button>
  );
}
function Badge({text,color}) {
  return <span style={{background:color+"18",color,border:`1px solid ${color}44`,borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{text}</span>;
}
function Modal({title,onClose,children,wide}) {
  return (
    <div style={{position:"fixed",inset:0,background:"#0009",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:wide?960:760,maxHeight:"92vh",overflow:"auto",boxShadow:"0 24px 60px #0006"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 20px",borderBottom:"1px solid #eee",position:"sticky",top:0,background:"white",zIndex:1}}>
          <span style={{fontWeight:800,fontSize:15,color:N}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}}>✕</button>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  );
}
function FilePick({label,file,onChange,note}) {
  return (
    <div style={{background:"#F8FAFC",border:"2px dashed #CBD5E1",borderRadius:10,padding:11}}>
      <span style={{fontSize:11,fontWeight:800,color:"#475569",textTransform:"uppercase",display:"block",marginBottom:4}}>{label}</span>
      {note&&<span style={{fontSize:11,color:"#94A3B8",display:"block",marginBottom:6}}>{note}</span>}
      <input type="file" accept="image/*,.pdf" onChange={async e=>{if(e.target.files[0])onChange(await readB64(e.target.files[0]));}} style={{fontSize:12}}/>
      {file&&(
        <div style={{display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:8,padding:"5px 9px",border:"1px solid #E2E8F0",marginTop:6}}>
          <span style={{fontSize:17}}>{file.type&&file.type.includes("pdf")?"📄":"🖼️"}</span>
          <span style={{fontSize:12,flex:1,color:"#334155",wordBreak:"break-all"}}>{file.name}</span>
          <a href={file.data} download={file.name} style={{fontSize:11,color:BL,fontWeight:700,textDecoration:"none"}}>⬇</a>
          <button onClick={()=>onChange(null)} style={{background:"none",border:"none",color:R,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
      )}
    </div>
  );
}
function IRow({label,value}) {
  if(value===null||value===undefined||value==="") return null;
  return <div style={{display:"flex",gap:6,fontSize:13,marginBottom:4}}><span style={{fontWeight:700,color:"#64748B",minWidth:110,flexShrink:0}}>{label}:</span><span style={{color:"#1E293B",wordBreak:"break-word"}}>{value}</span></div>;
}

// ── Link Box — shows a shareable athlete link ─────────────
function LinkBox({token, onCopy}) {
  const link = buildLink(token);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(link).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
    if(onCopy) onCopy();
  };
  return (
    <div style={{background:"#F0FFF4",borderRadius:12,padding:14,border:"1px solid #86EFAC"}}>
      <p style={{fontWeight:700,fontSize:12,color:"#065F46",margin:"0 0 8px"}}>🔗 Link de Acesso do Atleta</p>
      <p style={{fontSize:11,color:"#064E3B",margin:"0 0 8px",lineHeight:1.5}}>Compartilhe este link com o responsável. Ao acessar, o atleta entra diretamente no seu perfil — sem login ou senha.</p>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:1,background:"white",borderRadius:8,padding:"8px 12px",border:"1px solid #86EFAC",fontSize:12,color:N,fontFamily:"monospace",wordBreak:"break-all"}}>{link}</div>
        <button onClick={copy} style={{background:copied?"#059669":N,color:G,border:"none",borderRadius:8,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",transition:"background .2s"}}>
          {copied?"✅ Copiado!":"📋 Copiar"}
        </button>
      </div>
      <button onClick={()=>waOpen(WA_ADMIN,`🔗 Link de acesso do atleta:\n${link}`)} style={{marginTop:8,background:GR,color:"white",border:"none",borderRadius:8,padding:"6px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>
        📲 Enviar via WhatsApp
      </button>
    </div>
  );
}

// ── Signature Pad ─────────────────────────────────────────
function SignaturePad({onSave,onClose}) {
  const cRef=useRef(null);
  const [drawing,setDrawing]=useState(false);
  const [hasSig,setHasSig]=useState(false);
  const getPos=(e,c)=>{const r=c.getBoundingClientRect(),cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;return{x:(cx-r.left)*(c.width/r.width),y:(cy-r.top)*(c.height/r.height)};};
  const startDraw=e=>{const c=cRef.current,ctx=c.getContext("2d"),p=getPos(e,c);ctx.beginPath();ctx.moveTo(p.x,p.y);setDrawing(true);setHasSig(true);};
  const draw=e=>{if(!drawing)return;e.preventDefault();const c=cRef.current,ctx=c.getContext("2d"),p=getPos(e,c);ctx.lineWidth=2.5;ctx.lineCap="round";ctx.strokeStyle=N;ctx.lineTo(p.x,p.y);ctx.stroke();};
  const endDraw=()=>setDrawing(false);
  const clear=()=>{const c=cRef.current,ctx=c.getContext("2d");ctx.clearRect(0,0,c.width,c.height);setHasSig(false);};
  return (
    <Modal title="✍️ Assinatura Digital" onClose={onClose}>
      <p style={{fontSize:13,color:"#64748B",margin:"0 0 10px"}}>Assine abaixo com o mouse ou toque:</p>
      <canvas ref={cRef} width={680} height={180} style={{border:"2px solid #CBD5E1",borderRadius:10,width:"100%",cursor:"crosshair",background:"#FAFAFA",touchAction:"none"}}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}/>
      <div style={{display:"flex",gap:10,marginTop:14}}>
        <Btn color={N} disabled={!hasSig} onClick={()=>onSave(cRef.current.toDataURL())}>✅ Confirmar e Gerar PDF</Btn>
        <Btn outline color="#888" onClick={clear}>🗑 Limpar</Btn>
        <Btn outline color="#888" onClick={()=>onSave(null)}>Sem assinatura</Btn>
      </div>
    </Modal>
  );
}

// ── Payment Modal (PIX only) ──────────────────────────────
function PayModal({pgto,atleta,onSuccess,onClose}) {
  const [phase,setPhase]=useState("form");
  const [pixComp,setPixComp]=useState(null);
  const [txn,setTxn]=useState("");
  const [copied,setCopied]=useState(false);
  const qrRef=useRef(null);
  const valor=Number(pgto?pgto.valor:0);
  // PIX key = only digits of CNPJ
  const pixKey="13254085000186";

  useEffect(()=>{
    if(phase!=="form"||!qrRef.current) return;
    // Generate QR via canvas using qrcode-generator approach
    const el=qrRef.current;
    el.innerHTML="";
    const img=document.createElement("img");
    img.style.cssText="width:190px;height:190px;border-radius:10px;border:3px solid #1B2A4A;display:block;";
    img.alt="QR Code PIX";
    // Try primary then fallback URLs
    const urls=[
      `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${pixKey}&bgcolor=ffffff&color=1B2A4A&margin=8&format=png`,
      `https://chart.googleapis.com/chart?chs=190x190&cht=qr&chl=${pixKey}&choe=UTF-8`
    ];
    let idx=0;
    const tryNext=()=>{
      if(idx>=urls.length){
        el.innerHTML=`<div style="width:190px;height:190px;background:#F0FFF4;border-radius:10px;border:3px solid #1B2A4A;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;"><span style="font-size:36px">📱</span><span style="font-size:11px;color:#065F46;font-weight:700;text-align:center;padding:0 10px">Use a chave abaixo<br/>para pagar via PIX</span></div>`;
        return;
      }
      img.src=urls[idx++];
    };
    img.onerror=()=>tryNext();
    img.onload=()=>el.appendChild(img);
    tryNext();
  },[phase]);

  const copyPix=()=>{
    navigator.clipboard.writeText(CNPJ).catch(()=>{
      const ta=document.createElement("textarea");ta.value=CNPJ;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);
    });
    setCopied(true);setTimeout(()=>setCopied(false),2500);
  };

  const handlePix=()=>{
    const code=genTxn();setTxn(code);setPhase("success");onSuccess(code);
  };

  if(phase==="success") return (
    <Modal title="✅ Pagamento Confirmado" onClose={onClose}>
      <div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{width:68,height:68,background:"#F0FFF4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 14px"}}>✅</div>
        <p style={{fontSize:18,fontWeight:800,color:"#065F46",margin:"0 0 6px"}}>Pagamento Confirmado!</p>
        <p style={{fontSize:14,color:"#64748B",margin:"0 0 18px"}}>Atleta: <strong>{atleta?atleta.nomeAtleta:"—"}</strong></p>
        <div style={{background:"#F0FFF4",borderRadius:12,padding:14,border:"1px solid #86EFAC",marginBottom:18,display:"inline-block",minWidth:240}}>
          <p style={{fontSize:11,color:"#065F46",fontWeight:700,margin:"0 0 5px",textTransform:"uppercase",letterSpacing:1}}>Código da Transação</p>
          <p style={{fontSize:22,fontWeight:900,color:N,fontFamily:"monospace",margin:0}}>{txn}</p>
          <p style={{fontSize:12,color:"#64748B",margin:"5px 0 0"}}>{fmtR(valor)} · {fmtD(tod())}</p>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn color={GR} onClick={()=>{const msg=`✅ *Pagamento Confirmado — Agrifut*\n🔑 Código: *${txn}*\nAtleta: ${atleta?atleta.nomeAtleta:"—"}\nTipo: ${pgto?pgto.tipo:""}\nValor: ${fmtR(valor)}\nData: ${fmtD(tod())}\n\n_Itajaí Agrifut 🟡⚫_`;waOpen(WA_ADMIN,msg);}}>📲 Enviar ao Admin</Btn>
          <Btn color={N} onClick={onClose}>Fechar</Btn>
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal title="💰 Pagar via PIX" onClose={onClose}>
      {/* Resumo */}
      <div style={{background:"#F8FAFC",borderRadius:12,padding:13,border:"1px solid #E2E8F0",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <p style={{margin:0,fontWeight:800,color:N,fontSize:15}}>{pgto?pgto.tipo:""}{pgto&&pgto.desc?" — "+pgto.desc:""}</p>
          <p style={{margin:"3px 0 0",fontSize:13,color:"#64748B"}}>Atleta: <strong>{atleta?atleta.nomeAtleta:"—"}</strong></p>
        </div>
        <p style={{margin:0,fontSize:24,fontWeight:900,color:N}}>{fmtR(valor)}</p>
      </div>

      {/* QR + chave */}
      <div style={{background:"#F0FFF4",borderRadius:14,padding:20,border:"1px solid #86EFAC",marginBottom:16}}>
        <p style={{fontWeight:800,fontSize:15,color:"#065F46",margin:"0 0 16px",textAlign:"center"}}>📱 Escaneie o QR Code ou copie a chave PIX</p>
        <div style={{display:"flex",gap:20,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
          <div style={{textAlign:"center"}}>
            <div ref={qrRef} style={{width:190,height:190,display:"flex",alignItems:"center",justifyContent:"center"}}/>
            <p style={{fontSize:11,color:"#064E3B",margin:"8px 0 0",fontWeight:600}}>Escaneie com o app do banco</p>
          </div>
          <div style={{flex:1,minWidth:180,display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <p style={{fontSize:11,color:"#064E3B",fontWeight:700,margin:"0 0 5px",textTransform:"uppercase",letterSpacing:.5}}>Chave PIX — CNPJ</p>
              <div style={{background:"white",borderRadius:10,padding:12,border:"1px solid #86EFAC"}}>
                <p style={{fontSize:15,fontWeight:900,fontFamily:"monospace",color:N,margin:0,letterSpacing:.5}}>{CNPJ}</p>
                <p style={{fontSize:11,color:"#64748B",margin:"4px 0 0"}}>Itajaí Esporte Clube</p>
              </div>
            </div>
            <button onClick={copyPix} style={{background:copied?"#059669":N,color:copied?"white":G,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:800,fontSize:13,cursor:"pointer",transition:"all .2s"}}>
              {copied?"✅ Chave Copiada!":"📋 Copiar Chave PIX"}
            </button>
          </div>
        </div>
      </div>

      {/* Passo a passo */}
      <div style={{background:"#EFF6FF",borderRadius:12,padding:14,border:"1px solid #BFDBFE",marginBottom:16,fontSize:13,color:"#1E40AF"}}>
        <p style={{fontWeight:700,margin:"0 0 6px"}}>📋 Como pagar:</p>
        <p style={{margin:0,lineHeight:2}}>
          1️⃣ Abra o app do seu banco → <strong>PIX → Pagar</strong><br/>
          2️⃣ Escaneie o QR Code <strong>ou</strong> cole a chave CNPJ<br/>
          3️⃣ Confirme o valor: <strong>{fmtR(valor)}</strong><br/>
          4️⃣ Finalize e anexe o comprovante abaixo
        </p>
      </div>

      {/* Comprovante */}
      <FilePick label="📎 Anexar Comprovante do PIX" file={pixComp} onChange={setPixComp} note="Obrigatório para confirmar o pagamento"/>
      {pixComp&&(
        <div style={{marginTop:12}}>
          <Btn color="#059669" onClick={handlePix} full>✅ Confirmar Pagamento PIX</Btn>
        </div>
      )}
    </Modal>
  );
}

// ── AthCard ───────────────────────────────────────────────
function AthCard({a,pagamentos,onSelect,onWA,onMig,canMig}) {
  const dOk=[a.rgAtleta,a.rgResp,a.comprResid].filter(Boolean).length;
  const pend=pagamentos.filter(pg=>pg.aId===a.id&&pg.status==="Pendente").length;
  return (
    <div onClick={()=>onSelect(a)} style={{background:"white",borderRadius:12,padding:"11px 16px",boxShadow:"0 2px 8px #0001",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",cursor:"pointer",border:"1.5px solid transparent",transition:"border .15s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=G;}} onMouseLeave={e=>{e.currentTarget.style.borderColor="transparent";}}>
      <div style={{width:42,height:42,borderRadius:10,background:N,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {a.foto?<img src={a.foto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:G,fontWeight:800,fontSize:17}}>{a.nomeAtleta?a.nomeAtleta[0]:"?"}</span>}
      </div>
      <div style={{flex:1,minWidth:140}}>
        <p style={{margin:0,fontWeight:800,fontSize:14,color:N}}>{a.nomeAtleta} {a.posicao&&<span style={{fontWeight:400,fontSize:12,color:"#64748B"}}>· {a.posicao}</span>}</p>
        <p style={{margin:0,fontSize:12,color:"#64748B"}}>{a.nomeResp} · {a.telResp}</p>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
        {a.categoria?<Badge text={a.categoria} color={N}/>:<Badge text="Sem cat." color="#94A3B8"/>}
        {a.projeto?<Badge text={a.projeto} color={PC[a.projeto]||"#888"}/>:<Badge text="Sem projeto" color="#94A3B8"/>}
        {a.neurodivergente&&<Badge text="Neurodiv." color={PU}/>}
        <Badge text={"📎 "+dOk+"/3"} color={dOk===3?"#059669":dOk>0?OR:R}/>
        {pend>0&&<Badge text={"💰 "+pend+" pend."} color={R}/>}
      </div>
      <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>onWA(a)} style={{background:GR,color:"white",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontWeight:700}}>📲</button>
        {canMig&&<button onClick={()=>onMig(a)} style={{background:OR,color:"white",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontWeight:700}}>🔄</button>}
      </div>
    </div>
  );
}

// ── BLANK ─────────────────────────────────────────────────
const BLANK={nomeAtleta:"",cpfAtleta:"",rgAtletaNum:"",posicao:"",dataNasc:"",endereco:"",bairro:"",cidade:"Itajaí",escola:"",serie:"",telAtleta:"",emailAtleta:"",foto:null,categoria:"",projeto:"",nomeResp:"",telResp:"",emailResp:"",relacao:"",cpfResp:"",docResp:"",contatoEmerg:"",telEmerg:"",rgAtleta:null,rgResp:null,comprResid:null,alergia:"nao",alergiaDesc:"",laudo:null,neurodivergente:false,medicamento:"nao",medicamentoDesc:"",termoAceito:false,imagemAceito:false,dataMatricula:tod()};

// ═══════════════════════════════════════════════════════════
export default function App() {
  const [user,setUser]=useState(null);
  const [athletes,setAthletes]=useState([]);
  const [pagamentos,setPagamentos]=useState([]);
  const [finHist,setFinHist]=useState([]);
  const [presencas,setPresencas]=useState([]);
  const [camps,setCamps]=useState([]);
  const [profs,setProfs]=useState([{id:"p1",nome:"Professor Demo",user:"prof",pass:"prof123",projeto:"Academy",categoria:"Sub-13"}]);
  const [loading,setLoading]=useState(true);

  // UI state
  const [tab,setTab]=useState("athletes");
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({...BLANK});
  const [newAthToken,setNewAthToken]=useState(""); // shown after registration
  const [projV,setProjV]=useState(null);
  const [srch,setSrch]=useState("");
  const [selAth,setSelAth]=useState(null);
  const [editAth,setEditAth]=useState(null);
  const [migAth,setMigAth]=useState(null);
  const [migC,setMigC]=useState("");const[migP,setMigP]=useState("");
  const [presDate,setPresDate]=useState(tod());const[presProj,setPresProj]=useState("");const[presGi,setPresGi]=useState(null);const[presCat,setPresCat]=useState("");const[presExpPer,setPresExpPer]=useState("dia");
  const [showPgto,setShowPgto]=useState(false);const[pgtoF,setPgtoF]=useState({tipo:"",desc:"",valor:"",status:"Pendente",data:tod(),aId:"",comp:null});
  const [editPgto,setEditPgto]=useState(null);
  const [fPSt,setFPSt]=useState("all");const[fPTp,setFPTp]=useState("all");const[fPCats,setFPCats]=useState([]);const[fPAth,setFPAth]=useState("");
  const [showCamp,setShowCamp]=useState(false);const[campF,setCampF]=useState({nome:"",data:"",cat:"",proj:""});const[selCamp,setSelCamp]=useState(null);
  const [showEv,setShowEv]=useState(false);const[evF,setEvF]=useState({nome:"",data:"",local:"",taxa:""});
  const [showProf,setShowProf]=useState(false);const[profF,setProfF]=useState({nome:"",user:"",pass:"",projeto:"",categoria:""});
  const [docTab,setDocTab]=useState("ver");
  const [toast,setToast]=useState("");
  const [stripeTarget,setStripeTarget]=useState(null);
  const [itens,setItens] = useState(ITENS_INICIAIS);
  const [showAddItem,setShowAddItem] = useState(false);
  const [itemF,setItemF] = useState({nome:'',categoria:'Item de Venda',preco:'',tamanhos:[],descricao:'',foto:null,qtdInput:{}});
  const [fEstCat,setFEstCat] = useState('all');
  const [pedidoItem,setPedidoItem] = useState(null);
  const [pedidoF,setPedidoF] = useState({tamanho:'',qtd:'1'});
  const [sigTarget,setSigTarget] = useState(null);
  const [pdfTarget,setPdfTarget] = useState(null); // {atleta, sig}

  // Load data & check URL token
  useEffect(()=>{
    (async()=>{
      let aths=[];
      for(const [k,fn] of [["agrifut-a9",setAthletes],["agrifut-p9",setPagamentos],["agrifut-fh9",setFinHist],["agrifut-pr9",setPresencas],["agrifut-c9",setCamps],["agrifut-pf9",setProfs],["agrifut-i9",setItens]]){
        try{const r=await window.storage.get(k);if(r){const parsed=JSON.parse(r.value);fn(parsed);if(k==="agrifut-a9")aths=parsed;}}catch(e){}
      }
      // Auto-login via URL token
      const urlToken=getTokenFromURL();
      if(urlToken){
        const at=aths.find(x=>x.token===urlToken);
        if(at){setUser({role:"atleta",id:at.id,nome:at.nomeAtleta});setTab("portal");}
      }
      setLoading(false);
    })();
  },[]);

  const sA=async l=>{try{await window.storage.set("agrifut-a9",JSON.stringify(l));}catch(e){}};
  const sP=async l=>{try{await window.storage.set("agrifut-p9",JSON.stringify(l));}catch(e){}};
  const sFH=async l=>{try{await window.storage.set("agrifut-fh9",JSON.stringify(l));}catch(e){}};
  const sPr=async l=>{try{await window.storage.set("agrifut-pr9",JSON.stringify(l));}catch(e){}};
  const sC=async l=>{try{await window.storage.set("agrifut-c9",JSON.stringify(l));}catch(e){}};
  const sPf=async l=>{try{await window.storage.set("agrifut-pf9",JSON.stringify(l));}catch(e){}};
  const sI=async l=>{try{await window.storage.set("agrifut-i9",JSON.stringify(l));}catch(e){}};
  const t2=(m,d=3000)=>{setToast(m);setTimeout(()=>setToast(""),d);};
  const sF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const addFinHist=async(action,pg,extra="")=>{
    const ath=athletes.find(a=>a.id===pg?.aId);
    const entry={id:Date.now()+Math.random(),data:new Date().toISOString(),action,aId:pg?.aId||"",atleta:ath?ath.nomeAtleta:"—",tipo:pg?.tipo||"",valor:pg?.valor||"",status:pg?.status||"",extra};
    const nl=[entry,...finHist].slice(0,300);
    setFinHist(nl);await sFH(nl);
  };

  const handleLogin=({role,id,nome,tab:t})=>{setUser({role,id,nome});setTab(t||"athletes");};

  const canNext=()=>{
    if(user&&user.role==='admin') return true;
    if(step===0){
      const a=Number(ageOf(form.dataNasc));
      if(!form.nomeAtleta||!form.dataNasc) return false;
      const cpfL=form.cpfAtleta?form.cpfAtleta.replace(/\D/g,"").length:0;
      if(cpfL>0&&cpfL<11) return false;
      if(form.telAtleta?form.telAtleta.replace(/\D/g,"").length<10:true) return false;
      if(a>18||a<6) return false;
      return true;
    }
    if(step===1){const tOk=form.telResp?form.telResp.replace(/\D/g,"").length>=10:false;const cOk=form.cpfResp?form.cpfResp.replace(/\D/g,"").length===11:false;return form.nomeResp&&tOk&&cOk;}
    if(step===4) return form.termoAceito&&form.imagemAceito;
    return true;
  };

  const submit=async()=>{
    const token=genToken();
    const a={...form,id:Date.now(),token,age:ageOf(form.dataNasc),createdAt:new Date().toISOString()};
    const nl=[...athletes,a];setAthletes(nl);await sA(nl);
    setNewAthToken(token);
    setForm({...BLANK});setStep(0);
  };

  const saveEdit=async()=>{const nl=athletes.map(a=>a.id===editAth.id?{...editAth,age:ageOf(editAth.dataNasc)}:a);setAthletes(nl);await sA(nl);setEditAth(null);t2("✅ Atualizado!");};
  const doMig=async()=>{const nl=athletes.map(a=>a.id===migAth.id?{...a,categoria:migC||a.categoria,projeto:migP||a.projeto}:a);setAthletes(nl);await sA(nl);setMigAth(null);t2("✅ Migrado!");};
  const delA=async id=>{if(!confirm("Remover atleta?"))return;const nl=athletes.filter(a=>a.id!==id);setAthletes(nl);await sA(nl);setSelAth(null);};
  const onPaid=async txnCode=>{if(!stripeTarget)return;const updated={...stripeTarget.pgto,status:"Pago",txn:txnCode};const nl=pagamentos.map(p=>p.id===stripeTarget.pgto.id?updated:p);setPagamentos(nl);await sP(nl);await addFinHist("Pagamento confirmado",updated,txnCode);t2("✅ Pagamento confirmado!");setStripeTarget(null);};

  const resetPgtoF=()=>setPgtoF({tipo:"",desc:"",valor:"",status:"Pendente",data:tod(),aId:"",comp:null});
  const addPgto=async()=>{if(!pgtoF.tipo||!pgtoF.aId)return;const txn=pgtoF.comp?genTxn():"";const np={...pgtoF,id:Date.now(),txn};const nl=[...pagamentos,np];setPagamentos(nl);await sP(nl);await addFinHist("Registro criado",np);if(np.comp){const ath=athletes.find(x=>x.id===np.aId);const msg=`📋 *Comprovante*\n🔑 Código: *${txn}*\nAtleta: ${ath?ath.nomeAtleta:"—"}\nTipo: ${np.tipo}\nValor: ${np.valor?fmtR(np.valor):"-"}`;const el=document.createElement("a");el.href=np.comp.data;el.download=np.comp.name;el.click();setTimeout(()=>waOpen(WA_ADMIN,msg),600);}setShowPgto(false);resetPgtoF();t2("✅ Registro adicionado!");};
  const openEditPgto=pg=>{setEditPgto(pg);setPgtoF({...pg});setShowPgto(true);};
  const saveEditPgto=async()=>{if(!editPgto||!pgtoF.tipo||!pgtoF.aId)return;const updated={...editPgto,...pgtoF,aId:Number(pgtoF.aId)};const nl=pagamentos.map(p=>p.id===editPgto.id?updated:p);setPagamentos(nl);await sP(nl);await addFinHist("Registro editado",updated,`Antes: ${fmtR(editPgto.valor)} / ${editPgto.status}`);setEditPgto(null);setShowPgto(false);resetPgtoF();t2("✅ Registro financeiro atualizado!");};
  const updPgto=async(id,status)=>{let changed=null;const nl=pagamentos.map(p=>{if(p.id!==id)return p;changed={...p,status};return changed;});setPagamentos(nl);await sP(nl);if(changed)await addFinHist("Status alterado",changed,status);};
  const delPgto=async id=>{const old=pagamentos.find(p=>p.id===id);const nl=pagamentos.filter(p=>p.id!==id);setPagamentos(nl);await sP(nl);if(old)await addFinHist("Registro removido",old);};

  const handlePresGi=i=>{setPresGi(i);const g=PGROUPS[presProj]?.[i];if(presProj==="Conexão"&&g){setPresCat(g.label);}else if(g&&g.cats.length===1){setPresCat(g.cats[0]);}else{setPresCat("");}};
  const getPres=(data=presDate)=>presencas.find(p=>p.data===data&&p.proj===presProj&&p.cat===presCat)||{presentes:[]};
  const presCats=()=>{const g=presGi!==null?(PGROUPS[presProj]||[])[presGi]:null;if(presProj==="Conexão"&&g)return g.cats;return presCat?[presCat]:[];};
  const togPres=async aId=>{const cur=getPres();const pres=cur.presentes.includes(aId)?cur.presentes.filter(x=>x!==aId):[...cur.presentes,aId];const ex=presencas.find(p=>p.data===presDate&&p.proj===presProj&&p.cat===presCat);const entry={data:presDate,proj:presProj,cat:presCat,id:Date.now(),presentes:pres};const nl=ex?presencas.map(p=>(p.data===presDate&&p.proj===presProj&&p.cat===presCat)?{...p,presentes:pres}:p):[...presencas,entry];setPresencas(nl);await sPr(nl);};
  const expPres=()=>{const {start,end,label}=rangePres(presDate,presExpPer);const al=athletes.filter(a=>a.projeto===presProj&&presCats().includes(a.categoria)).sort(sortName);const recDates=presencas.filter(p=>p.proj===presProj&&p.cat===presCat&&p.data>=start&&p.data<=end).map(p=>p.data);const dates=(presExpPer==="dia"?[presDate]:[...new Set(recDates)].sort());const rows=[];dates.forEach(dt=>{const rec=getPres(dt);al.forEach(a=>rows.push([a.nomeAtleta,a.posicao||"",a.categoria,a.projeto,rec.presentes.includes(a.id)?"Presente":"Ausente",fmtD(dt)]));});expCSV([["Nome","Posição","Categoria","Projeto","Presença","Data"],...rows],`presenca_${presProj}_${presCat}_${label}_${start}_${end}.csv`);t2("📊 Planilha baixada!");};

  const addCamp=async()=>{if(!campF.nome)return;const nl=[...camps,{...campF,id:Date.now(),inscritos:[],eventos:[]}];setCamps(nl);await sC(nl);setShowCamp(false);setCampF({nome:"",data:"",cat:"",proj:""});t2("✅ Campeonato criado!");};
  const delCamp=async id=>{const nl=camps.filter(c=>c.id!==id);setCamps(nl);await sC(nl);setSelCamp(null);};
  const campPayDesc=(camp,ev)=>`${camp.nome} - ${ev.nome}`;
  const campFinanceIds=(camp,ev,list=pagamentos)=>list.filter(pg=>pg.tipo==="Campeonato"&&((pg.campId===camp.id&&pg.evId===ev.id)||pg.desc===campPayDesc(camp,ev))).map(pg=>Number(pg.aId));
  const findCampPgto=(camp,ev,aId,list=pagamentos)=>list.find(pg=>Number(pg.aId)===Number(aId)&&pg.tipo==="Campeonato"&&((pg.campId===camp.id&&pg.evId===ev.id)||pg.desc===campPayDesc(camp,ev)));
  const campPayOk=(camp,ev,aId)=>{const pg=findCampPgto(camp,ev,aId);return !!pg&&(pg.status==="Pago"||pg.status==="Isento");};
  const campPayLabel=(camp,ev,aId)=>{const pg=findCampPgto(camp,ev,aId);return pg?`${pg.status}${pg.valor?" · "+fmtR(pg.valor):""}`:"Pendente não lançado";};
  const campFinanceSummary=(camp,ev)=>{const ids=[...new Set([...(camp.inscritos||[]),...campFinanceIds(camp,ev)])];const rows=ids.map(id=>findCampPgto(camp,ev,id));return{pend:rows.filter(pg=>pg&&pg.status==="Pendente").length,pago:rows.filter(pg=>pg&&pg.status==="Pago").length,isento:rows.filter(pg=>pg&&pg.status==="Isento").length,sem:rows.filter(pg=>!pg).length,total:ids.length};};
  const syncCampFinance=async(camp,evOrEvents,ids=null,silent=false)=>{
    const events=(Array.isArray(evOrEvents)?evOrEvents:[evOrEvents]).filter(ev=>ev&&Number(ev.taxa||0)>0);
    const targetIds=[...new Set((ids||camp.inscritos||[]).map(Number).filter(Boolean))];
    if(!events.length){if(!silent)t2("⚠️ Informe a taxa da partida para gerar pendências.");return false;}
    if(!targetIds.length){if(!silent)t2("⚠️ Nenhum atleta inscrito para gerar pendência.");return false;}
    let nl=pagamentos.map(p=>({...p}));
    const created=[];
    events.forEach(ev=>{
      targetIds.forEach((aId,idx)=>{
        const exists=findCampPgto(camp,ev,aId,nl);
        if(exists){
          if(exists.status==="Pendente"){exists.valor=ev.taxa;exists.data=ev.data||camp.data||tod();exists.desc=campPayDesc(camp,ev);exists.campId=camp.id;exists.evId=ev.id;}
          return;
        }
        const pg={id:Date.now()+Math.random()+idx,tipo:"Campeonato",desc:campPayDesc(camp,ev),valor:ev.taxa,status:"Pendente",data:ev.data||camp.data||tod(),aId,comp:null,campId:camp.id,evId:ev.id};
        nl.push(pg);created.push(pg);
      });
    });
    setPagamentos(nl);await sP(nl);
    if(created.length){
      const hist=created.map(pg=>{const ath=athletes.find(a=>Number(a.id)===Number(pg.aId));return{id:Date.now()+Math.random(),data:new Date().toISOString(),action:"Pendência de competição criada",aId:pg.aId,atleta:ath?ath.nomeAtleta:"—",tipo:pg.tipo,valor:pg.valor,status:pg.status,extra:pg.desc};});
      const fh=[...hist,...finHist].slice(0,300);setFinHist(fh);await sFH(fh);
    }
    if(!silent)t2(created.length?`✅ ${created.length} pendência(s) gerada(s) no financeiro!`:"✅ Pendências já estavam lançadas.");
    return true;
  };
  const setCampPgtoStatus=async(camp,ev,aId,status)=>{
    if(!Number(ev.taxa||0)){t2("⚠️ Informe a taxa da partida primeiro.");return;}
    let nl=pagamentos.map(p=>({...p}));
    let pg=findCampPgto(camp,ev,aId,nl);
    if(!pg){pg={id:Date.now()+Math.random(),tipo:"Campeonato",desc:campPayDesc(camp,ev),valor:ev.taxa,status:"Pendente",data:ev.data||camp.data||tod(),aId:Number(aId),comp:null,campId:camp.id,evId:ev.id};nl.push(pg);}
    const updated={...pg,status,valor:ev.taxa,desc:campPayDesc(camp,ev),campId:camp.id,evId:ev.id};
    nl=nl.map(p=>p.id===pg.id?updated:p);
    setPagamentos(nl);await sP(nl);await addFinHist("Status taxa competição",updated,campPayDesc(camp,ev));t2("✅ Financeiro da competição atualizado!");
  };
  const hasInscricaoOk=aId=>pagamentos.some(pg=>pg.aId===aId&&pg.tipo==="Taxa de Inscrição"&&(pg.status==="Pago"||pg.status==="Isento"));
  const hasTaxaGeralOk=aId=>pagamentos.some(pg=>pg.aId===aId&&pg.tipo!=="Uniforme"&&(pg.status==="Pago"||pg.status==="Isento"));
  const taxaLabel=aId=>{const pg=pagamentos.find(x=>x.aId===aId&&x.tipo!=="Uniforme"&&(x.status==="Pago"||x.status==="Isento"));return pg?`${pg.tipo}: ${pg.status}`:"Sem taxa";};
  const togInsc=async(camp,aId)=>{if(!hasInscricaoOk(aId)){t2("⚠️ Atleta sem taxa de inscrição paga ou isenta!");return;}const adding=!camp.inscritos.includes(aId);const ins=adding?[...camp.inscritos,aId]:camp.inscritos.filter(x=>x!==aId);const nl=camps.map(c=>c.id===camp.id?{...c,inscritos:ins}:c);setCamps(nl);await sC(nl);const nc=nl.find(c=>c.id===camp.id);setSelCamp(nc);if(adding)await syncCampFinance(nc,nc.eventos||[],[aId],true);};
  const addEv=async()=>{if(!evF.nome||!selCamp)return;const ev={...evF,id:Date.now(),convocados:[]};const nl=camps.map(c=>c.id===selCamp.id?{...c,eventos:[...(c.eventos||[]),ev]}:c);setCamps(nl);await sC(nl);const nc=nl.find(c=>c.id===selCamp.id);setSelCamp(nc);if(Number(ev.taxa||0)>0)await syncCampFinance(nc,ev,nc.inscritos||[],true);setShowEv(false);setEvF({nome:"",data:"",local:"",taxa:""});t2("✅ Evento criado!");};
  const togConv=async(camp,evId,aId)=>{const ev=(camp.eventos||[]).find(e=>e.id===evId);if(!camp.inscritos.includes(aId)&&!campPayOk(camp,ev,aId)&&!hasTaxaGeralOk(aId)){t2("⚠️ Atleta sem inscrição ou taxa paga/isenta!");return;}const nl=camps.map(c=>c.id===camp.id?{...c,eventos:c.eventos.map(ev=>ev.id===evId?{...ev,convocados:ev.convocados.includes(aId)?ev.convocados.filter(x=>x!==aId):[...ev.convocados,aId]}:ev)}:c);setCamps(nl);await sC(nl);setSelCamp(nl.find(c=>c.id===camp.id));};
  const delEv=async(cId,eId)=>{const nl=camps.map(c=>c.id===cId?{...c,eventos:c.eventos.filter(e=>e.id!==eId)}:c);setCamps(nl);await sC(nl);setSelCamp(nl.find(c=>c.id===cId));};
  const expConv=(camp,ev)=>{const list=ev.convocados.map((id,i)=>{const a=athletes.find(x=>x.id===id);const taxa=ev.taxa?` · Taxa: ${campPayLabel(camp,ev,id)}`:"";return`${i+1}. ${a?a.nomeAtleta:"?"} (${a?a.categoria:"—"}${a&&a.posicao?" · "+a.posicao:""}${taxa})`;});const msg=`🏆 *${camp.nome}*\n⚽ *${ev.nome}*\n📅 ${fmtD(ev.data)}${ev.local?"\n📍 "+ev.local:""}${ev.taxa?"\n💰 "+fmtR(ev.taxa):""}\n\n👕 *CONVOCADOS (${ev.convocados.length}):*\n${list.join("\n")}\n\n_Itajaí Agrifut 🟡⚫_`;waOpen(WA_ADMIN,msg);};
  const resetProfF=()=>setProfF({nome:"",user:"",pass:"",projeto:"",categoria:""});
  const openEditProf=pf=>{setProfF({...pf});setShowProf(true);};
  const addProf=async()=>{if(!profF.nome||!profF.user||!profF.pass)return;const item={...profF,id:profF.id||"p"+Date.now()};const nl=profF.id?profs.map(p=>p.id===profF.id?item:p):[...profs,item];setProfs(nl);await sPf(nl);setShowProf(false);resetProfF();t2(profF.id?"✅ Professor atualizado!":"✅ Professor adicionado!");};
  const eligibleForCamp=camp=>{const mx=catN(camp.cat);return athletes.filter(a=>(!camp.proj||a.projeto===camp.proj)&&(!camp.cat||catN(a.categoria)<=mx));};
  const canMig=user&&(user.role==="admin"||user.role==="professor");
  const doWA=a=>waOpen("55"+a.telResp.replace(/\D/g,""),`Olá ${a.nomeResp}! Contato Agrifut 🟡⚫`);
  const doMigOpen=a=>{setMigAth(a);setMigC(a.categoria||"");setMigP(a.projeto||"");};

  // ── Form Steps ────────────────────────────────────────
  const STEPS=[{icon:"⚽",label:"Atleta"},{icon:"👤",label:"Responsável"},{icon:"📁",label:"Docs"},{icon:"🏥",label:"Saúde"},{icon:"📝",label:"Termo"}];

  const renderStep=()=>{
    const a=form.dataNasc?Number(ageOf(form.dataNasc)):"";
    if(step===0) return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sec label="Dados do Atleta"/>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontWeight:700,fontSize:14}}>
            <input type="checkbox" checked={form.neurodivergente} onChange={e=>sF("neurodivergente",e.target.checked)} style={{width:16,height:16,accentColor:PU}}/>
            <span style={{color:PU}}>🧠 Atleta Neurodivergente</span>
          </label>
        </div>
        <Inp label="Nome Completo" req value={form.nomeAtleta} onChange={v=>sF("nomeAtleta",v)} full/>
        <Inp label="Data de Nascimento" req type="date" value={form.dataNasc} max={maxDOB()} min={minDOB()} onChange={v=>sF("dataNasc",v)}/>
        <Inp label="Idade" value={a!==""?(a+" anos"):""} disabled/>
        {a!==""&&a<6&&<p style={{gridColumn:"1/-1",color:R,fontSize:12,fontWeight:700,margin:0}}>⚠️ Mínimo 6 anos.</p>}
        {a!==""&&a>18&&<p style={{gridColumn:"1/-1",color:R,fontSize:12,fontWeight:700,margin:0}}>⚠️ Máximo 18 anos.</p>}
        <Inp label="CPF do Atleta" req value={form.cpfAtleta} onChange={v=>sF("cpfAtleta",fmtCPF(v))} placeholder="000.000.000-00" note={(form.cpfAtleta?form.cpfAtleta.replace(/\D/g,"").length:0)+"/11"}/>
        <Inp label="RG do Atleta" value={form.rgAtletaNum} onChange={v=>sF("rgAtletaNum",v)} placeholder="RG para competições"/>
        <Inp label="Telefone (WhatsApp)" req value={form.telAtleta} onChange={v=>sF("telAtleta",fmtTel(v))} placeholder="(47) 9xxxx-xxxx"/>
        <Sel label="Posição" value={form.posicao} onChange={v=>sF("posicao",v)} opts={POSICOES}/>
        <Sel label="Categoria" value={form.categoria} onChange={v=>sF("categoria",v)} opts={CATS}/>
        <Sel label="Projeto" value={form.projeto} onChange={v=>sF("projeto",v)} opts={PROJS}/>
        <Inp label="Escola" value={form.escola} onChange={v=>sF("escola",v)}/>
        <Inp label="Série" value={form.serie} onChange={v=>sF("serie",v)}/>
        <Inp label="Endereço" value={form.endereco} onChange={v=>sF("endereco",v)} full/>
        <Inp label="Bairro" value={form.bairro} onChange={v=>sF("bairro",v)}/>
        <Inp label="Cidade" value={form.cidade} onChange={v=>sF("cidade",v)}/>
        <Inp label="E-mail" value={form.emailAtleta} onChange={v=>sF("emailAtleta",v)} type="email"/>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",display:"block",marginBottom:5}}>Foto</label>
          <input type="file" accept="image/*" style={{fontSize:12}} onChange={async e=>{if(e.target.files[0]){const d=await readB64(e.target.files[0]);setForm(f=>({...f,foto:d.data}));}}}/>
          {form.foto&&<img src={form.foto} alt="" style={{width:74,height:74,objectFit:"cover",borderRadius:10,marginTop:8,border:`3px solid ${G}`}}/>}
        </div>
      </div>
    );
    if(step===1) return (
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sec label="Dados do Responsável"/>
        <Inp label="Nome Completo" req value={form.nomeResp} onChange={v=>sF("nomeResp",v)} full/>
        <Inp label="CPF" req value={form.cpfResp} onChange={v=>sF("cpfResp",fmtCPF(v))} placeholder="000.000.000-00" note={(form.cpfResp?form.cpfResp.replace(/\D/g,"").length:0)+"/11"}/>
        <Inp label="Telefone (WhatsApp)" req value={form.telResp} onChange={v=>sF("telResp",fmtTel(v))} placeholder="(47) 9xxxx-xxxx"/>
        <Inp label="E-mail" value={form.emailResp} onChange={v=>sF("emailResp",v)} type="email"/>
        <Sel label="Relação com o Atleta" value={form.relacao} onChange={v=>sF("relacao",v)} opts={RELS}/>
        <Inp label="Documento (RG/outro)" value={form.docResp} onChange={v=>sF("docResp",v)}/>
        <Sec label="Contato de Emergência"/>
        <Inp label="Nome" value={form.contatoEmerg} onChange={v=>sF("contatoEmerg",v)}/>
        <Inp label="Telefone" value={form.telEmerg} onChange={v=>sF("telEmerg",fmtTel(v))} placeholder="(47) 9xxxx-xxxx"/>
      </div>
    );
    if(step===2) return (
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <p style={{margin:0,fontSize:12,fontWeight:800,color:"#0369A1",textTransform:"uppercase",letterSpacing:1.5}}>📁 Documentos</p>
        <FilePick label="🪪 RG / Certidão do Atleta" file={form.rgAtleta} onChange={f=>setForm(fm=>({...fm,rgAtleta:f}))}/>
        <FilePick label="🪪 RG / CPF do Responsável" file={form.rgResp} onChange={f=>setForm(fm=>({...fm,rgResp:f}))}/>
        <FilePick label="🏠 Comprovante de Residência" file={form.comprResid} onChange={f=>setForm(fm=>({...fm,comprResid:f}))}/>
        <p style={{fontSize:12,color:"#888",fontStyle:"italic",margin:0}}>* Podem ser enviados depois pelo link de acesso do atleta.</p>
      </div>
    );
    if(step===3) return (
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"#FFF9E6",border:`1px solid ${G}44`,borderRadius:12,padding:14}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:800,color:"#92400E",textTransform:"uppercase",letterSpacing:1.5}}>🤧 Alergias</p>
          <div style={{display:"flex",gap:20,marginBottom:8}}>{["sim","nao"].map(v=><label key={v} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontWeight:700,fontSize:14}}><input type="radio" checked={form.alergia===v} onChange={()=>sF("alergia",v)} style={{accentColor:N}}/>{v==="sim"?"Sim":"Não"}</label>)}</div>
          {form.alergia==="sim"&&<Inp label="Especifique" value={form.alergiaDesc} onChange={v=>sF("alergiaDesc",v)} full/>}
        </div>
        <div style={{background:"#F0FFF4",border:"1px solid #86EFAC44",borderRadius:12,padding:14}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:800,color:"#065F46",textTransform:"uppercase",letterSpacing:1.5}}>💊 Medicamentos</p>
          <div style={{display:"flex",gap:20,marginBottom:8}}>{["sim","nao"].map(v=><label key={v} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontWeight:700,fontSize:14}}><input type="radio" checked={form.medicamento===v} onChange={()=>sF("medicamento",v)} style={{accentColor:N}}/>{v==="sim"?"Sim":"Não"}</label>)}</div>
          {form.medicamento==="sim"&&<Inp label="Medicamento e dosagem" value={form.medicamentoDesc} onChange={v=>sF("medicamentoDesc",v)} full/>}
        </div>
        {form.neurodivergente&&(
          <div style={{background:"#F5F3FF",border:"1px solid #C4B5FD44",borderRadius:12,padding:14}}>
            <p style={{margin:"0 0 8px",fontSize:12,fontWeight:800,color:PU,textTransform:"uppercase",letterSpacing:1.5}}>🧠 Laudo</p>
            <FilePick label="📋 Laudo / Relatório" file={form.laudo} onChange={f=>setForm(fm=>({...fm,laudo:f}))}/>
          </div>
        )}
      </div>
    );
    return (
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"#F8FAFC",borderRadius:12,padding:14,border:"1px solid #E2E8F0",maxHeight:180,overflowY:"auto"}}>
          <p style={{fontSize:12,fontWeight:800,color:N,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>Termo de Autorização — Agrifut</p>
          <p style={{fontSize:13,lineHeight:1.8,color:"#374151",margin:0}}>Eu, <strong>{form.nomeResp||"___"}</strong>, CPF <strong>{form.cpfResp||"___"}</strong>, responsável por <strong>{form.nomeAtleta||"___"}</strong>, autorizo sua participação nas atividades da Agrifut (CNPJ {CNPJ}), ciente dos riscos, isentando a Agrifut de responsabilidade por eventuais lesões. Autorizo o uso da imagem do atleta para fins institucionais.</p>
        </div>
        <div style={{background:"#F0FFF4",border:"1.5px solid #68D39155",borderRadius:12,padding:12}}><label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}><input type="checkbox" checked={form.termoAceito} onChange={e=>sF("termoAceito",e.target.checked)} style={{width:18,height:18,marginTop:2,accentColor:N,flexShrink:0}}/><span style={{fontSize:14,fontWeight:600,lineHeight:1.5}}>✅ Concordo com o Termo de Autorização. <span style={{color:R}}>*</span></span></label></div>
        <div style={{background:"#EFF6FF",border:"1.5px solid #93C5FD55",borderRadius:12,padding:12}}><label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer"}}><input type="checkbox" checked={form.imagemAceito} onChange={e=>sF("imagemAceito",e.target.checked)} style={{width:18,height:18,marginTop:2,accentColor:BL,flexShrink:0}}/><span style={{fontSize:14,fontWeight:600,lineHeight:1.5}}>📸 Autorizo o uso da imagem do atleta. <span style={{color:R}}>*</span></span></label></div>
        {(!form.termoAceito||!form.imagemAceito)&&<p style={{fontSize:12,color:R,fontWeight:600,margin:0}}>⚠️ Ambas as autorizações são obrigatórias.</p>}
      </div>
    );
  };

  // ── Success after registration ──────────────────────────
  const renderSuccess=()=>(
    <div style={{maxWidth:680,margin:"32px auto",padding:"0 16px"}}>
      <div style={{background:"white",borderRadius:20,padding:32,boxShadow:"0 4px 24px #0002",textAlign:"center"}}>
        <div style={{width:72,height:72,background:"#F0FFF4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px"}}>✅</div>
        <p style={{fontSize:22,fontWeight:900,color:N,margin:"0 0 6px"}}>Cadastro Realizado!</p>
        <p style={{fontSize:14,color:"#64748B",margin:"0 0 24px"}}>O atleta foi cadastrado com sucesso no sistema Agrifut.</p>
        <div style={{marginBottom:20}}>
          <LinkBox token={newAthToken}/>
        </div>
        <div style={{background:"#EFF6FF",borderRadius:12,padding:14,border:"1px solid #BFDBFE",textAlign:"left",marginBottom:20}}>
          <p style={{fontWeight:700,color:BL,fontSize:13,margin:"0 0 6px"}}>📱 Compartilhe o link com o responsável:</p>
          <p style={{fontSize:13,color:"#1E40AF",lineHeight:1.7,margin:0}}>
            Ao clicar no link, o responsável acessa diretamente o perfil do atleta para:<br/>
            • Anexar documentos pendentes<br/>
            • Visualizar cobranças e realizar pagamentos<br/>
            • Acompanhar informações do cadastro
          </p>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn color={N} onClick={()=>{setNewAthToken("");setTab("athletes");}}>📋 Ver Atletas</Btn>
          <Btn color={G} onClick={()=>{setNewAthToken("");setStep(0);}}>➕ Novo Cadastro</Btn>
        </div>
      </div>
    </div>
  );

  // ── Athletes ──────────────────────────────────────────
  const renderAthletes=()=>{
    const listAll=filterFn=>athletes.filter(filterFn).filter(a=>!normTxt(srch)||normTxt(a.nomeAtleta).includes(normTxt(srch))||normTxt(a.nomeResp).includes(normTxt(srch)));
    const searchBar=(extra=null)=>(
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap",background:"white",borderRadius:12,padding:"10px 14px",boxShadow:"0 2px 8px #0001"}}>
        <Btn small outline color={N} onClick={()=>{setProjV(null);setSrch("");}}>← Projetos</Btn>
        {extra}
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Buscar..." style={{marginLeft:"auto",border:"1.5px solid #ddd",borderRadius:8,padding:"6px 11px",fontSize:13,outline:"none",minWidth:180}}/>
      </div>
    );
    const athList=list=>list.length===0
      ?<div style={{background:"white",borderRadius:12,padding:40,textAlign:"center"}}><p style={{color:"#888",fontWeight:600}}>Nenhum atleta.</p></div>
      :<div style={{display:"grid",gap:8}}>{list.map(a=><AthCard key={a.id} a={a} pagamentos={pagamentos} onSelect={setSelAth} onWA={doWA} onMig={doMigOpen} canMig={canMig}/>)}</div>;
    const bdays=athletes.filter(isBirthdayToday).sort(sortName);

    if(projV==="all") return <div style={{maxWidth:1100,margin:"24px auto",padding:"0 16px"}}>{searchBar(<><span style={{fontWeight:800,color:N,fontSize:15}}>Todos</span><Badge text={athletes.length+" atletas"} color={N}/></>)}{athList(listAll(()=>true))}</div>;
    if(projV&&projV!=="all"){
      const {p,gi}=projV;const grps=PGROUPS[p]||[];const activeCats=gi!==null?grps[gi].cats:grps.flatMap(g=>g.cats);const projColor=PC[p]||"#888";
      return (<div style={{maxWidth:1100,margin:"24px auto",padding:"0 16px"}}>{searchBar(<><span style={{fontWeight:800,color:projColor,fontSize:15}}>{p}</span>{grps.map((g,i)=><button key={i} onClick={()=>setProjV({p,gi:gi===i?null:i})} style={{background:gi===i?projColor:projColor+"18",color:gi===i?"white":projColor,border:`1.5px solid ${projColor}55`,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontWeight:700,fontSize:11}}>{g.label}</button>)}</>)}{athList(listAll(a=>a.projeto===p&&activeCats.includes(a.categoria)))}</div>);
    }
    return (
      <div style={{maxWidth:1100,margin:"24px auto",padding:"0 16px"}}>
        <div style={{background:"white",borderRadius:12,padding:"10px 14px",boxShadow:"0 2px 8px #0001",marginBottom:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:800,color:N,textTransform:"uppercase",letterSpacing:1}}>Buscar atleta</span>
          <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Digite o nome do atleta ou responsável" style={{flex:1,minWidth:240,border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none"}}/>
          {srch&&<button onClick={()=>setSrch("")} style={{background:"#F1F5F9",color:"#64748B",border:"1px solid #CBD5E1",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontWeight:700,fontSize:12}}>Limpar</button>}
        </div>
        {srch&&<div style={{marginBottom:18}}>{athList(listAll(()=>true))}</div>}
        {bdays.length>0&&(
          <div style={{background:"white",borderRadius:12,padding:14,boxShadow:"0 2px 8px #0001",marginBottom:16,borderLeft:`4px solid ${G}`}}>
            <p style={{margin:"0 0 8px",fontWeight:800,fontSize:14,color:N}}>🎂 Aniversariantes do Dia</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {bdays.map(a=><button key={a.id} onClick={()=>setSelAth(a)} style={{background:"#FFFBEB",border:`1px solid ${G}66`,borderRadius:8,padding:"7px 11px",cursor:"pointer",textAlign:"left"}}><span style={{display:"block",fontWeight:800,color:N,fontSize:13}}>{a.nomeAtleta}</span><span style={{display:"block",fontSize:11,color:"#92400E"}}>{a.projeto||"Sem projeto"} · {a.categoria||"Sem categoria"}</span></button>)}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>{setProjV("all");setSrch("");}} style={{background:N,color:G,border:"none",borderRadius:10,padding:"10px 20px",fontWeight:800,fontSize:14,cursor:"pointer"}}>👥 Todos ({athletes.length})</button>
          {athletes.filter(a=>!a.projeto).length>0&&<button onClick={()=>setProjV("all")} style={{background:"#F1F5F9",color:"#64748B",border:"2px solid #E2E8F0",borderRadius:10,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>⚠️ Sem projeto: {athletes.filter(a=>!a.projeto).length}</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20}}>
          {PROJS.map(p=>{
            const cnt=athletes.filter(a=>a.projeto===p).length;const grps=PGROUPS[p]||[];const projColor=PC[p]||"#888";
            return (
              <div key={p} style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px #0001",border:`2px solid ${projColor}22`,cursor:"pointer",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=projColor;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=projColor+"22";}} onClick={()=>setProjV({p,gi:null})}>
                <div style={{background:projColor,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{color:"white",fontWeight:800,fontSize:18}}>{p}</span><span style={{color:"white",fontSize:32,fontWeight:900}}>{cnt}</span></div>
                <div style={{padding:10,display:"flex",flexWrap:"wrap",gap:5}} onClick={e=>e.stopPropagation()}>
                  {grps.map((g,i)=>{const gc=athletes.filter(a=>a.projeto===p&&g.cats.includes(a.categoria)).length;return <button key={i} onClick={()=>setProjV({p,gi:i})} style={{background:projColor+"15",color:projColor,border:`1.5px solid ${projColor}55`,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontWeight:700,fontSize:11}}>{g.label} ({gc})</button>;})}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Presença ──────────────────────────────────────────
  const renderPresenca=()=>{
    const groups=presProj?(PGROUPS[presProj]||[]):[];const selGroup=presGi!==null?groups[presGi]:null;const groupCats=selGroup?selGroup.cats:[];const needCatSel=groupCats.length>1&&presProj!=="Conexão";
    const presAlunos=athletes.filter(a=>a.projeto===presProj&&presCats().includes(a.categoria)).sort(sortName);const rec=getPres();
    return (
      <div style={{maxWidth:900,margin:"24px auto",padding:"0 16px"}}>
        <div style={{background:"white",borderRadius:14,padding:18,marginBottom:14,boxShadow:"0 2px 8px #0001"}}>
          <p style={{fontWeight:800,fontSize:14,color:N,margin:"0 0 12px"}}>📅 Selecionar Turma</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:12,alignItems:"flex-end",marginBottom:presProj?12:0}}>
            <Sel label="Projeto" value={presProj} onChange={v=>{setPresProj(v);setPresGi(null);setPresCat("");}} opts={user&&user.role==="professor"&&user.proj?[user.proj]:PROJS}/>
            <Inp label="Data" type="date" value={presDate} onChange={setPresDate}/>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>Exportar</label>
              <select value={presExpPer} onChange={e=>setPresExpPer(e.target.value)} style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none",background:"white",width:"100%"}}>
                <option value="dia">Dia</option>
                <option value="semana">Semana</option>
                <option value="mes">Mês</option>
                <option value="semestre">Semestre</option>
              </select>
            </div>
            {presProj&&presCat&&<Btn color={BL} onClick={expPres} xst={{whiteSpace:"nowrap"}}>⬇ Baixar Planilha</Btn>}
          </div>
          {presProj&&groups.length>0&&(
            <div>
              <p style={{fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",margin:"0 0 8px"}}>Turma:</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:needCatSel&&presGi!==null?10:0}}>
                {groups.map((g,i)=><button key={i} onClick={()=>handlePresGi(i)} style={{background:presGi===i?(PC[presProj]||N):(PC[presProj]||N)+"18",color:presGi===i?"white":(PC[presProj]||N),border:`1.5px solid ${(PC[presProj]||N)}55`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontWeight:700,fontSize:12}}>{g.label}</button>)}
              </div>
              {needCatSel&&presGi!==null&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  <p style={{fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",margin:"0 8px 0 0",alignSelf:"center"}}>Categoria:</p>
                  {groupCats.map(c=><button key={c} onClick={()=>setPresCat(c)} style={{background:presCat===c?N:N+"10",color:presCat===c?"white":N,border:`1.5px solid ${N}44`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontWeight:700,fontSize:12}}>{c}</button>)}
                </div>
              )}
            </div>
          )}
        </div>
        {(!presProj||!presCat)
          ?<div style={{background:"white",borderRadius:14,padding:40,textAlign:"center",boxShadow:"0 2px 8px #0001"}}><p style={{fontSize:36,margin:0}}>📋</p><p style={{color:"#888",fontWeight:600}}>{!presProj?"Selecione um projeto":"Selecione a turma"}</p></div>
          :(
            <div style={{background:"white",borderRadius:14,padding:18,boxShadow:"0 2px 8px #0001"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div><p style={{fontWeight:800,fontSize:15,color:N,margin:0}}>{presProj} — {presCat} · {fmtD(presDate)}</p><p style={{fontSize:12,color:"#64748B",margin:0}}>{rec.presentes.length}/{presAlunos.length} · ordem alfabética</p></div>
                <div style={{display:"flex",gap:6}}><Badge text={"✅ "+rec.presentes.length} color="#059669"/><Badge text={"❌ "+(presAlunos.length-rec.presentes.length)} color={R}/></div>
              </div>
              {presAlunos.length===0?<p style={{color:"#888",textAlign:"center",padding:24}}>Nenhum atleta nesta turma.</p>
                :<div style={{display:"grid",gap:8}}>{presAlunos.map(a=>{const pr=rec.presentes.includes(a.id);return <div key={a.id} onClick={()=>togPres(a.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,cursor:"pointer",background:pr?"#F0FFF4":"#FFF9F9",border:`2px solid ${pr?"#86EFAC":R+"44"}`,transition:"all .15s"}}><div style={{width:36,height:36,borderRadius:8,overflow:"hidden",background:N,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{a.foto?<img src={a.foto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:G,fontWeight:800}}>{a.nomeAtleta?a.nomeAtleta[0]:"?"}</span>}</div><div style={{flex:1}}><span style={{fontWeight:700,fontSize:14,color:N}}>{a.nomeAtleta}</span>{a.posicao&&<span style={{fontSize:12,color:"#64748B"}}> · {a.posicao}</span>}</div><span style={{fontSize:22}}>{pr?"✅":"⬜"}</span></div>;})}</div>}
            </div>
          )}
      </div>
    );
  };

  // ── Campeonatos ───────────────────────────────────────
  const renderCamps=()=>(
    <div style={{maxWidth:1000,margin:"24px auto",padding:"0 16px"}}>
      {(user&&(user.role==="admin"||user.role==="professor"))&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}><Btn color={G} onClick={()=>setShowCamp(true)}>+ Novo Campeonato</Btn></div>}
      {camps.length===0?<div style={{background:"white",borderRadius:14,padding:48,textAlign:"center",boxShadow:"0 2px 8px #0001"}}><p style={{fontSize:40,margin:0}}>🏆</p><p style={{color:"#888",fontWeight:600}}>Nenhum campeonato</p></div>
        :<div style={{display:"grid",gap:12}}>{camps.map(c=><div key={c.id} style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0001"}}><div style={{background:N,padding:"13px 18px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}><span style={{fontSize:22}}>🏆</span><div style={{flex:1}}><p style={{color:"white",fontWeight:800,fontSize:15,margin:0}}>{c.nome}</p><p style={{color:G,fontSize:12,margin:0}}>{fmtD(c.data)}{c.cat?" · "+c.cat:""}{c.proj?" · "+c.proj:""}</p></div><Badge text={"📋 "+c.inscritos.length} color={G}/><Badge text={"⚽ "+(c.eventos||[]).length+" eventos"} color="#86EFAC"/><Btn small color={G} onClick={()=>setSelCamp(c)}>Gerenciar</Btn>{user&&user.role==="admin"&&<Btn small color={R} outline onClick={()=>delCamp(c.id)}>🗑</Btn>}</div></div>)}</div>}
      {showCamp&&<Modal title="➕ Novo Campeonato" onClose={()=>setShowCamp(false)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}><Inp label="Nome" req value={campF.nome} onChange={v=>setCampF(f=>({...f,nome:v}))} full/><Inp label="Data" type="date" value={campF.data} onChange={v=>setCampF(f=>({...f,data:v}))}/><Sel label="Categoria máx." value={campF.cat} onChange={v=>setCampF(f=>({...f,cat:v}))} opts={CATS}/><Sel label="Projeto" value={campF.proj} onChange={v=>setCampF(f=>({...f,proj:v}))} opts={PROJS}/></div><div style={{display:"flex",gap:10}}><Btn color={N} disabled={!campF.nome} onClick={addCamp}>✅ Criar</Btn><Btn outline color="#888" onClick={()=>setShowCamp(false)}>Cancelar</Btn></div></Modal>}
      {selCamp&&(()=>{const c=selCamp;const elig=eligibleForCamp(c).sort(sortName);return(
        <Modal title={"🏆 "+c.nome} onClose={()=>setSelCamp(null)} wide>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <p style={{fontWeight:800,fontSize:13,color:N,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:1}}>📋 Inscrições</p>
              <div style={{maxHeight:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
                {elig.map(a=>{const pgIns=pagamentos.find(pg=>pg.aId===a.id&&pg.tipo==="Taxa de Inscrição"&&(pg.status==="Pago"||pg.status==="Isento"));const ok=!!pgIns;const insc=c.inscritos.includes(a.id);const bg=insc?"#F0FFF4":ok?"white":"#FFF9F9";const bd=insc?"#86EFAC":ok?"#E2E8F0":R+"33";return(
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,background:bg,border:`1.5px solid ${bd}`,opacity:(!ok&&!insc)?0.6:1}}>
                    <div style={{flex:1}}><span style={{fontSize:13,fontWeight:600,color:N}}>{a.nomeAtleta}</span> <span style={{fontSize:11,color:"#94A3B8"}}>({a.categoria}{a.posicao?" · "+a.posicao:""})</span></div>
                    <span style={{fontSize:10,color:ok?(pgIns.status==="Isento"?OR:"#059669"):R,fontWeight:700}}>{ok?pgIns.status:"Sem taxa"}</span>
                    <button onClick={()=>togInsc(c,a.id)} style={{background:insc?R:GR,color:"white",border:"none",borderRadius:6,padding:"4px 9px",cursor:"pointer",fontWeight:700,fontSize:11}}>{insc?"−":"+"}</button>
                  </div>
                );})}
              </div>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><p style={{fontWeight:800,fontSize:13,color:N,margin:0,textTransform:"uppercase",letterSpacing:1}}>⚽ Partidas</p><Btn small color={G} onClick={()=>setShowEv(true)}>+ Evento</Btn></div>
              {(c.eventos||[]).length===0?<p style={{color:"#888",fontSize:13}}>Nenhum evento.</p>
                :<div style={{display:"flex",flexDirection:"column",gap:10,maxHeight:340,overflowY:"auto"}}>{c.eventos.map(ev=>(
                  <div key={ev.id} style={{background:"#F8FAFC",borderRadius:10,padding:12,border:"1px solid #E2E8F0"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><div><p style={{fontWeight:800,fontSize:14,color:N,margin:0}}>{ev.nome}</p><p style={{fontSize:12,color:"#64748B",margin:0}}>{fmtD(ev.data)}{ev.local?" · "+ev.local:""}{ev.taxa?" · "+fmtR(ev.taxa):""}</p>{ev.taxa&&(()=>{const fs=campFinanceSummary(c,ev);return <p style={{fontSize:11,color:"#64748B",margin:"3px 0 0",fontWeight:700}}>Financeiro: {fs.pend} pend. · {fs.pago} pago(s) · {fs.isento} isento(s){fs.sem?" · "+fs.sem+" sem lançamento":""}</p>;})()}</div><div style={{display:"flex",gap:5}}>{ev.taxa&&<Btn small color={OR} onClick={()=>syncCampFinance(c,ev)}>💰</Btn>}<Btn small color={GR} onClick={()=>expConv(c,ev)}>📲</Btn><button onClick={()=>delEv(c.id,ev.id)} style={{background:"none",border:"none",color:R,cursor:"pointer",fontSize:14}}>🗑</button></div></div>
                    <p style={{fontSize:11,fontWeight:700,color:"#64748B",margin:"0 0 5px",textTransform:"uppercase"}}>Convocados ({ev.convocados.length})</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{ev.convocados.map(id=>{const a=athletes.find(x=>x.id===id);return a?<span key={id} style={{background:BL+"15",color:BL,border:`1px solid ${BL}44`,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700}}>{a.nomeAtleta}{a.posicao?" · "+a.posicao:""}</span>:null;})}</div>
                    <details><summary style={{fontSize:12,cursor:"pointer",color:"#64748B",fontWeight:600}}>Selecionar atletas e revisar financeiro da competição</summary>
                      <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4,maxHeight:190,overflowY:"auto"}}>{(()=>{const ids=[...new Set([...c.inscritos,...campFinanceIds(c,ev),...elig.filter(a=>hasTaxaGeralOk(a.id)).map(a=>a.id)])];return ids.map(id=>{const a=athletes.find(x=>x.id===id);if(!a)return null;const conv=ev.convocados.includes(id);const pgEv=findCampPgto(c,ev,id);const st=pgEv?pgEv.status:"Sem lançamento";const stColor=st==="Pago"?"#059669":st==="Isento"?OR:R;return(
                        <div key={id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:conv?"#EFF6FF":"white",border:`1px solid ${conv?"#93C5FD":"#E2E8F0"}`}}>
                          <span style={{flex:1,fontSize:12,fontWeight:600}}>{a.nomeAtleta} <span style={{fontSize:11,color:"#94A3B8"}}>({a.categoria}{a.posicao?" · "+a.posicao:""} · {c.inscritos.includes(id)?"Inscrito":taxaLabel(id)})</span></span>
                          {ev.taxa&&<span style={{fontSize:10,color:stColor,fontWeight:800,whiteSpace:"nowrap"}}>{st}</span>}
                          {ev.taxa&&<div style={{display:"flex",gap:3}}><button onClick={()=>setCampPgtoStatus(c,ev,id,"Pago")} style={{background:"#DCFCE7",color:"#166534",border:"1px solid #86EFAC",borderRadius:5,padding:"2px 5px",cursor:"pointer",fontWeight:800,fontSize:10}}>Pago</button><button onClick={()=>setCampPgtoStatus(c,ev,id,"Isento")} style={{background:"#FFF7ED",color:OR,border:"1px solid #FDBA74",borderRadius:5,padding:"2px 5px",cursor:"pointer",fontWeight:800,fontSize:10}}>Isento</button></div>}
                          <button onClick={()=>togConv(c,ev.id,id)} style={{background:conv?OR:BL,color:"white",border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontWeight:700,fontSize:11}}>{conv?"Rem.":"Conv."}</button>
                        </div>
                      );});})()}</div>
                    </details>
                  </div>
                ))}</div>}
            </div>
          </div>
        </Modal>
      );})()}
      {showEv&&<Modal title="➕ Nova Partida" onClose={()=>setShowEv(false)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}><Inp label="Nome" req value={evF.nome} onChange={v=>setEvF(f=>({...f,nome:v}))} full/><Inp label="Data" type="date" value={evF.data} onChange={v=>setEvF(f=>({...f,data:v}))}/><Inp label="Local" value={evF.local} onChange={v=>setEvF(f=>({...f,local:v}))} placeholder="Estádio Municipal"/><Inp label="Taxa (R$)" type="number" value={evF.taxa} onChange={v=>setEvF(f=>({...f,taxa:v}))}/></div><div style={{display:"flex",gap:10}}><Btn color={N} disabled={!evF.nome} onClick={addEv}>✅ Criar</Btn><Btn outline color="#888" onClick={()=>setShowEv(false)}>Cancelar</Btn></div></Modal>}
    </div>
  );

  const resetItemF=()=>setItemF({nome:'',categoria:'Item de Venda',preco:'',tamanhos:[],descricao:'',foto:null,qtdInput:{}});
  const openEditItem=item=>{setItemF({...item,qtdInput:{...(item.qtd||{})}});setShowAddItem(true);};
  const saveItem = async () => {
    if(!itemF.nome||!itemF.categoria) return;
    const qtd={};
    itemF.tamanhos.forEach(t=>{qtd[t]=Number(itemF.qtdInput[t]||0);});
    const item={id:itemF.id||Date.now(),nome:itemF.nome,categoria:itemF.categoria,preco:Number(itemF.preco||0),tamanhos:itemF.tamanhos,qtd,foto:itemF.foto,descricao:itemF.descricao};
    const nl=itemF.id?itens.map(i=>i.id===itemF.id?item:i):[...itens,item];
    setItens(nl);await sI(nl);setShowAddItem(false);resetItemF();t2(itemF.id?'✅ Item atualizado!':'✅ Item cadastrado!');
  };

  const delItem = async id => {const nl=itens.filter(i=>i.id!==id);setItens(nl);await sI(nl);};

  const sendPedidoWA = async (item,ath,tam,qtd) => {
    const total=item.preco*Number(qtd||1);
    const msg=`🛍️ *PEDIDO — Agrifut Loja*\n\n`+
      `📦 Item: *${item.nome}*\n`+
      `📐 Tamanho: *${tam}*\n`+
      `🔢 Quantidade: *${qtd}*\n`+
      `💰 Valor total: *${item.preco>0?fmtR(total):'A confirmar'}*\n\n`+
      `👤 Atleta: *${ath?ath.nomeAtleta:'—'}*\n`+
      `📂 Categoria: *${ath?ath.categoria||'—':'—'}*\n`+
      `📱 Responsável: ${ath?ath.nomeResp:'—'}\n\n`+
      `💳 *Pagamento via PIX — CNPJ:*\n${CNPJ}\n`+
      `_Itajaí Esporte Clube_\n\n`+
      `_Após o pagamento, envie o comprovante para este número._\n\n`+
      `_Itajaí Agrifut 🟡⚫_`;
    if(ath&&item.preco>0){
      const txn=genTxn();
      const np={id:Date.now(),aId:ath.id,tipo:'Uniforme',desc:`${item.nome} — Tam: ${tam} x${qtd}`,valor:String(total),status:'Pendente',data:tod(),txn,comp:null};
      const nl=[...pagamentos,np];setPagamentos(nl);await sP(nl);await addFinHist("Pedido de estoque criado",np);
      t2('✅ Pedido registrado! Código: '+txn);
    }
    const itemList=itens.map(i=>{
      if(i.id!==item.id) return i;
      const nq={...i.qtd};nq[tam]=Math.max(0,(nq[tam]||0)-Number(qtd||1));
      return {...i,qtd:nq};
    });
    setItens(itemList);await sI(itemList);
    waOpen(WA_ADMIN,msg);
    setPedidoItem(null);setPedidoF({tamanho:'',qtd:'1'});
    if(!ath||item.preco===0) t2('✅ Pedido enviado via WhatsApp!');
  };

  // ── Estoque ───────────────────────────────────────────
  const renderEstoque = () => {
    const filtrado = itens.filter(i => fEstCat==='all' || i.categoria===fEstCat);
    return (
      <div style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>
        <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:6}}>
            {['all',...ITEM_CATS].map(c=>(
              <button key={c} onClick={()=>setFEstCat(c)}
                style={{background:fEstCat===c?N:'white',color:fEstCat===c?G:N,border:`1.5px solid ${N}`,borderRadius:8,padding:'6px 14px',cursor:'pointer',fontWeight:700,fontSize:12}}>
                {c==='all'?'Todos':c}
              </button>
            ))}
          </div>
          {user&&(user.role==='admin'||user.role==='professor')&&(
            <Btn color={G} onClick={()=>{resetItemF();setShowAddItem(true);}} xst={{marginLeft:'auto'}}>+ Cadastrar Item</Btn>
          )}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {l:'Itens de Venda',v:itens.filter(i=>i.categoria==='Item de Venda').length,c:BL},
            {l:'Materiais de Uso',v:itens.filter(i=>i.categoria==='Material de Uso').length,c:'#059669'},
            {l:'Total de Itens',v:itens.length,c:N},
          ].map(s=>(
            <div key={s.l} style={{background:'white',borderRadius:12,padding:'13px 16px',boxShadow:'0 2px 8px #0001',borderLeft:`4px solid ${s.c}`}}>
              <p style={{margin:0,fontSize:22,fontWeight:800,color:s.c}}>{s.v}</p>
              <p style={{margin:0,fontSize:12,color:'#666',fontWeight:600}}>{s.l}</p>
            </div>
          ))}
        </div>
        {filtrado.length===0
          ? <div style={{background:'white',borderRadius:14,padding:48,textAlign:'center',boxShadow:'0 2px 8px #0001'}}><p style={{fontSize:40,margin:0}}>📦</p><p style={{color:'#888',fontWeight:600}}>Nenhum item cadastrado</p></div>
          : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
              {filtrado.map(item=>{
                const isVenda=item.categoria==='Item de Venda';
                const totalQtd=Object.values(item.qtd).reduce((a,b)=>a+b,0);
                return(
                  <div key={item.id} style={{background:'white',borderRadius:14,overflow:'hidden',boxShadow:'0 2px 12px #0001',border:`1.5px solid ${isVenda?BL+'33':'#05996933'}`}}>
                    <div style={{height:160,background:isVenda?BL+'10':'#05996910',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                      {item.foto
                        ? <img src={item.foto.data} alt={item.nome} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <div style={{textAlign:'center'}}><p style={{fontSize:48,margin:0}}>{isVenda?'🛍️':'📦'}</p><p style={{fontSize:12,color:'#64748B',margin:'4px 0 0'}}>{item.nome}</p></div>
                      }
                      <span style={{position:'absolute',top:8,right:8,background:isVenda?BL:'#059669',color:'white',borderRadius:99,padding:'2px 10px',fontSize:11,fontWeight:700}}>{item.categoria}</span>
                    </div>
                    <div style={{padding:14}}>
                      <p style={{margin:'0 0 4px',fontWeight:800,fontSize:15,color:N}}>{item.nome}</p>
                      {item.descricao&&<p style={{margin:'0 0 8px',fontSize:12,color:'#64748B'}}>{item.descricao}</p>}
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <span style={{fontWeight:800,fontSize:16,color:isVenda?BL:'#059669'}}>{item.preco>0?fmtR(item.preco):'Sob consulta'}</span>
                        <Badge text={'📦 '+totalQtd+' un.'} color={totalQtd>0?'#059669':R}/>
                      </div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                        {item.tamanhos.map(t=>{
                          const q=item.qtd[t]||0;
                          return <span key={t} style={{background:q>0?N+'10':R+'10',color:q>0?N:R,border:`1px solid ${q>0?N+'33':R+'33'}`,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:700}}>{t}: {q}</span>;
                        })}
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        {isVenda&&(
                          <Btn small color={BL} onClick={()=>{setPedidoItem(item);setPedidoF({tamanho:item.tamanhos[0]||'',qtd:'1'});}} xst={{flex:1}}>
                            {user&&user.role==='atleta'?'🛒 Solicitar':'🛒 Registrar Venda'}
                          </Btn>
                        )}
                        {user&&(user.role==='admin'||user.role==='professor')&&(
                          <>
                            <button onClick={()=>openEditItem(item)} style={{background:'none',border:`1px solid ${N}44`,borderRadius:6,padding:'5px 10px',color:N,cursor:'pointer',fontSize:12,fontWeight:700}}>✏️</button>
                            <button onClick={()=>delItem(item.id)} style={{background:'none',border:`1px solid ${R}44`,borderRadius:6,padding:'5px 10px',color:R,cursor:'pointer',fontSize:12,fontWeight:700}}>🗑</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }

        {showAddItem&&(
          <Modal title={itemF.id?"📦 Editar Item":"📦 Cadastrar Item"} onClose={()=>{setShowAddItem(false);resetItemF();}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <Inp label="Nome do Item" req value={itemF.nome} onChange={v=>setItemF(f=>({...f,nome:v}))} full/>
              <Sel label="Categoria" value={itemF.categoria} onChange={v=>setItemF(f=>({...f,categoria:v}))} opts={ITEM_CATS}/>
              <Inp label="Preço (R$)" type="number" value={itemF.preco} onChange={v=>setItemF(f=>({...f,preco:v}))} placeholder="0,00"/>
              <Inp label="Descrição" value={itemF.descricao} onChange={v=>setItemF(f=>({...f,descricao:v}))} full/>
              <div style={{gridColumn:'1/-1'}}>
                <label style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',display:'block',marginBottom:6}}>Tamanhos Disponíveis</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                  {TAMANHOS.map(t=>{
                    const sel=itemF.tamanhos.includes(t);
                    return <button key={t} onClick={()=>setItemF(f=>({...f,tamanhos:sel?f.tamanhos.filter(x=>x!==t):[...f.tamanhos,t]}))} style={{background:sel?N:'white',color:sel?G:N,border:`1.5px solid ${N}`,borderRadius:7,padding:'5px 12px',cursor:'pointer',fontWeight:700,fontSize:12}}>{t}</button>;
                  })}
                </div>
                {itemF.tamanhos.length>0&&(
                  <div>
                    <label style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',display:'block',marginBottom:6}}>Quantidade por Tamanho</label>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:8}}>
                      {itemF.tamanhos.map(t=>(
                        <div key={t}>
                          <label style={{fontSize:11,color:'#64748B',display:'block',marginBottom:2}}>{t}</label>
                          <input type="number" value={itemF.qtdInput[t]||''} onChange={e=>setItemF(f=>({...f,qtdInput:{...f.qtdInput,[t]:e.target.value}}))} placeholder="0" style={{border:'1.5px solid #ddd',borderRadius:7,padding:'7px 10px',fontSize:13,outline:'none',width:'100%',boxSizing:'border-box'}}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{gridColumn:'1/-1'}}>
                <FilePick label="📸 Foto do Item (opcional)" file={itemF.foto} onChange={f=>setItemF(fm=>({...fm,foto:f}))}/>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn color={N} disabled={!itemF.nome} onClick={saveItem}>✅ Salvar</Btn>
              <Btn outline color="#888" onClick={()=>{setShowAddItem(false);resetItemF();}}>Cancelar</Btn>
            </div>
          </Modal>
        )}

        {pedidoItem&&(()=>{
          const item=pedidoItem;
          const ath=user&&user.id&&user.id!=='demo'?athletes.find(x=>x.id===user.id):null;
          const tamSel=pedidoF.tamanho;
          const qtdDisp=item.qtd[tamSel]||0;
          return(
            <Modal title={'🛒 '+item.nome} onClose={()=>setPedidoItem(null)}>
              <div style={{background:'#EFF6FF',borderRadius:12,padding:14,border:'1px solid #BFDBFE',marginBottom:14}}>
                <p style={{fontWeight:700,color:BL,fontSize:14,margin:'0 0 4px'}}>{item.nome}</p>
                <p style={{fontSize:13,color:'#1E40AF',margin:0}}>{item.preco>0?'Valor: '+fmtR(item.preco)+' por unidade':'Valor sob consulta'}</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:'#555',textTransform:'uppercase',display:'block',marginBottom:6}}>Tamanho</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {item.tamanhos.map(t=>{
                      const q=item.qtd[t]||0;
                      return <button key={t} onClick={()=>setPedidoF(f=>({...f,tamanho:t}))} disabled={q===0} style={{background:pedidoF.tamanho===t?N:q>0?'white':'#f5f5f5',color:pedidoF.tamanho===t?G:q>0?N:'#aaa',border:`1.5px solid ${pedidoF.tamanho===t?N:q>0?N+'55':'#ddd'}`,borderRadius:7,padding:'6px 14px',cursor:q>0?'pointer':'not-allowed',fontWeight:700,fontSize:12,opacity:q===0?0.5:1}}>{t}</button>;
                    })}
                  </div>
                  {tamSel&&<p style={{fontSize:11,color:'#64748B',margin:'6px 0 0'}}>Disponível: {qtdDisp} un.</p>}
                </div>
                <Inp label="Quantidade" type="number" value={pedidoF.qtd} onChange={v=>setPedidoF(f=>({...f,qtd:v}))}/>
              </div>
              {item.preco>0&&tamSel&&(
                <div style={{background:'#F0FFF4',borderRadius:10,padding:12,border:'1px solid #86EFAC',marginBottom:12}}>
                  <p style={{margin:0,fontWeight:700,color:'#065F46',fontSize:14}}>💰 Total: {fmtR(item.preco*Number(pedidoF.qtd||1))}</p>
                  <p style={{margin:'4px 0 0',fontSize:12,color:'#065F46'}}>Pagamento via PIX — CNPJ: <strong>{CNPJ}</strong></p>
                </div>
              )}
              <div style={{background:'#FFFBF0',borderRadius:10,padding:11,border:`1px solid ${G}44`,marginBottom:12,fontSize:12,color:'#92400E'}}>
                ℹ️ Ao clicar em "Enviar Pedido", o WhatsApp abrirá com as informações. Realize o pagamento via PIX e envie o comprovante.
              </div>
              <div style={{display:'flex',gap:10}}>
                <Btn color={GR} disabled={!tamSel||!pedidoF.qtd||Number(pedidoF.qtd)<1} onClick={()=>sendPedidoWA(item,ath,tamSel,pedidoF.qtd)} xst={{flex:1}}>📲 Enviar Pedido via WhatsApp</Btn>
                <Btn outline color="#888" onClick={()=>setPedidoItem(null)}>Cancelar</Btn>
              </div>
            </Modal>
          );
        })()}
      </div>
    );
  };

  // ── Financeiro ────────────────────────────────────────
  const finCatOf=pg=>athletes.find(x=>x.id===pg.aId)?.categoria||"Sem categoria";
  const finAthOf=pg=>athletes.find(x=>Number(x.id)===Number(pg.aId));
  const finAthName=pg=>finAthOf(pg)?.nomeAtleta||"Sem atleta";
  const finVal=pg=>Number(pg.valor||0);
  const finCatOpts=[...CATS,"Sem categoria"];
  const finCatMatch=pg=>fPCats.length===0||fPCats.includes(finCatOf(pg));
  const finAthMatch=pg=>!normTxt(fPAth)||normTxt(finAthName(pg)).includes(normTxt(fPAth));
  const histAthMatch=h=>!normTxt(fPAth)||normTxt(h.atleta).includes(normTxt(fPAth));
  const filtPgto=pagamentos.filter(p=>(fPSt==="all"||p.status===fPSt)&&(fPTp==="all"||p.tipo===fPTp)&&finCatMatch(p)&&finAthMatch(p));
  const filtFinHist=finHist.filter(histAthMatch);
  const sumPg=(rows,status=null)=>rows.filter(p=>!status||p.status===status).reduce((s,p)=>s+finVal(p),0);
  const tGeral=sumPg(filtPgto);
  const tPago=sumPg(filtPgto,"Pago");
  const tPend=sumPg(filtPgto,"Pendente");
  const tIsentos=filtPgto.filter(p=>p.status==="Isento").length;
  const finCatRows=(fPCats.length?fPCats:finCatOpts).map(cat=>{
    const rows=filtPgto.filter(p=>finCatOf(p)===cat);
    return {cat,rows,total:sumPg(rows),pago:sumPg(rows,"Pago"),pend:sumPg(rows,"Pendente"),isentos:rows.filter(p=>p.status==="Isento").length};
  }).filter(r=>fPCats.length>0||r.rows.length>0);
  const toggleFinCat=cat=>setFPCats(list=>list.includes(cat)?list.filter(c=>c!==cat):[...list,cat]);
  const athPayments=a=>pagamentos.filter(p=>Number(p.aId)===Number(a.id)).sort((x,y)=>String(y.data||"").localeCompare(String(x.data||"")));
  const athFinHist=a=>finHist.filter(h=>Number(h.aId)===Number(a.id)||normTxt(h.atleta)===normTxt(a.nomeAtleta)).sort((x,y)=>new Date(y.data||0)-new Date(x.data||0));
  const renderAthFinanceBox=(a,{allowPay=false}={})=>{
    const myPg=athPayments(a);const myHist=athFinHist(a);
    const paid=sumPg(myPg,"Pago");const pend=sumPg(myPg,"Pendente");const isentos=myPg.filter(pg=>pg.status==="Isento").length;
    return(
      <div style={{background:"white",borderRadius:16,padding:18,boxShadow:"0 2px 12px #0001",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:12}}>
          <p style={{fontWeight:800,fontSize:14,color:N,margin:0}}>💰 Histórico Financeiro do Atleta</p>
          <Badge text={a.nomeAtleta} color={N}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          {[{l:"Pago",v:fmtR(paid),c:"#059669"},{l:"Pendente",v:fmtR(pend),c:R},{l:"Isenções",v:isentos,c:OR},{l:"Registros",v:myPg.length,c:N}].map(s=><div key={s.l} style={{background:"#F8FAFC",borderRadius:8,padding:"8px 10px",borderLeft:"3px solid "+s.c}}><p style={{margin:0,fontWeight:900,fontSize:15,color:s.c}}>{s.v}</p><p style={{margin:0,fontSize:10,color:"#64748B",fontWeight:800,textTransform:"uppercase"}}>{s.l}</p></div>)}
        </div>
        {myPg.length===0?<p style={{color:"#888",fontSize:13,margin:"0 0 12px"}}>Nenhuma cobrança registrada para este atleta.</p>:(
          <div style={{overflowX:"auto",marginBottom:12}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
              <thead><tr style={{background:N}}>{["Atleta","Tipo","Valor","Data","Status","Código"].map(h=><th key={h} style={{padding:"7px 9px",textAlign:"left",fontSize:10,fontWeight:900,color:G,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{myPg.map((pg,i)=>{const sc=pg.status==="Pago"?"#059669":pg.status==="Pendente"?R:OR;return(
                <tr key={pg.id} style={{background:i%2===0?"white":"#F8FAFC",borderBottom:"1px solid #E2E8F0"}}>
                  <td style={{padding:"8px 9px",fontSize:12,fontWeight:800,color:N}}>{a.nomeAtleta}</td>
                  <td style={{padding:"8px 9px",fontSize:12}}><span style={{fontWeight:700}}>{pg.tipo}</span>{pg.desc&&<span style={{display:"block",fontSize:10,color:"#64748B"}}>{pg.desc}</span>}</td>
                  <td style={{padding:"8px 9px",fontSize:12,fontWeight:800}}>{pg.valor?fmtR(pg.valor):"—"}</td>
                  <td style={{padding:"8px 9px",fontSize:11,color:"#64748B"}}>{fmtD(pg.data)}</td>
                  <td style={{padding:"8px 9px"}}><Badge text={pg.status} color={sc}/></td>
                  <td style={{padding:"8px 9px",fontSize:11,color:"#64748B",fontFamily:"monospace"}}>{pg.txn||"—"}</td>
                </tr>
              );})}</tbody>
            </table>
          </div>
        )}
        {allowPay&&myPg.some(pg=>pg.status==="Pendente")&&<p style={{fontSize:12,color:"#64748B",margin:"0 0 8px"}}>Cobranças pendentes podem ser pagas pelo botão em cada item abaixo.</p>}
        {allowPay&&myPg.filter(pg=>pg.status==="Pendente").map(pg=><button key={"pay"+pg.id} onClick={()=>setStripeTarget({pgto:pg,atleta:a})} style={{margin:"0 0 8px",background:"linear-gradient(135deg,#635BFF,#4F46E5)",color:"white",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,fontSize:13,cursor:"pointer",width:"100%"}}>💳 Pagar {pg.tipo}{pg.valor?" - "+fmtR(pg.valor):""}</button>)}
        <div style={{borderTop:"1px solid #E2E8F0",paddingTop:10}}>
          <p style={{margin:"0 0 8px",fontSize:12,fontWeight:900,color:N,textTransform:"uppercase",letterSpacing:1}}>Movimentações registradas</p>
          {myHist.length===0?<p style={{color:"#888",fontSize:13,margin:0}}>Nenhuma movimentação registrada para este atleta.</p>:(
            <div style={{maxHeight:220,overflow:"auto",border:"1px solid #E2E8F0",borderRadius:8}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
                <thead><tr style={{background:"#F8FAFC"}}>{["Data","Ação","Atleta","Tipo","Valor","Status"].map(h=><th key={h} style={{padding:"7px 9px",textAlign:"left",fontSize:10,fontWeight:900,color:"#64748B",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                <tbody>{myHist.map((h,i)=><tr key={h.id||i} style={{background:i%2===0?"white":"#F8FAFC",borderTop:"1px solid #E2E8F0"}}><td style={{padding:"7px 9px",fontSize:11,color:"#64748B",whiteSpace:"nowrap"}}>{new Date(h.data).toLocaleString("pt-BR")}</td><td style={{padding:"7px 9px",fontSize:12,fontWeight:800,color:N}}>{h.action}</td><td style={{padding:"7px 9px",fontSize:12}}>{h.atleta||a.nomeAtleta}</td><td style={{padding:"7px 9px",fontSize:12}}>{h.tipo||"—"}</td><td style={{padding:"7px 9px",fontSize:12,fontWeight:800}}>{h.valor?fmtR(h.valor):"—"}</td><td style={{padding:"7px 9px",fontSize:12}}>{h.status||"—"}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderFin=()=>(
    <div style={{maxWidth:1100,margin:"24px auto",padding:"0 16px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
        {[{l:"Total Geral",v:fmtR(tGeral),c:N},{l:"Total Pago",v:fmtR(tPago),c:"#059669"},{l:"Pendente",v:fmtR(tPend),c:R},{l:"Registros",v:filtPgto.length,c:OR}].map(s=><div key={s.l} style={{background:"white",borderRadius:12,padding:"12px 14px",boxShadow:"0 2px 8px #0001",borderLeft:"4px solid "+s.c}}><p style={{margin:0,fontSize:20,fontWeight:800,color:s.c}}>{s.v}</p><p style={{margin:0,fontSize:12,color:"#666",fontWeight:600}}>{s.l}</p></div>)}
      </div>
      <div style={{background:"white",borderRadius:12,padding:13,marginBottom:12,boxShadow:"0 2px 8px #0001",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
        <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:150}}>
          <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>Status</label>
          <select value={fPSt} onChange={e=>setFPSt(e.target.value)} style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none",background:"white",width:"100%"}}>
            <option value="all">Todos</option>{PSTAT.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:170}}>
          <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>Tipo</label>
          <select value={fPTp} onChange={e=>setFPTp(e.target.value)} style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none",background:"white",width:"100%"}}>
            <option value="all">Todos</option>{PTYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:230,flex:1}}>
          <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:.5}}>Atleta</label>
          <input list="financeiro-atletas" value={fPAth} onChange={e=>setFPAth(e.target.value)} placeholder="Filtrar pelo nome do atleta" style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,outline:"none",background:"white",width:"100%",boxSizing:"border-box"}}/>
          <datalist id="financeiro-atletas">{athletes.slice().sort(sortName).map(a=><option key={a.id} value={a.nomeAtleta}/>)}</datalist>
        </div>
        <Btn color={G} onClick={()=>{setEditPgto(null);resetPgtoF();setShowPgto(true);}} xst={{marginLeft:"auto"}}>+ Novo Registro</Btn>
        <div style={{flexBasis:"100%",borderTop:"1px solid #F1F5F9",paddingTop:11}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontWeight:800,color:N,textTransform:"uppercase",letterSpacing:1}}>Categorias totalizadas</span>
            <button onClick={()=>setFPCats([])} style={{background:fPCats.length===0?N:"white",color:fPCats.length===0?G:N,border:`1.5px solid ${N}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontWeight:700,fontSize:11}}>Todas</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {finCatOpts.map(cat=>{const on=fPCats.includes(cat);return <button key={cat} onClick={()=>toggleFinCat(cat)} style={{background:on?N:"#F8FAFC",color:on?G:N,border:`1.5px solid ${on?N:"#CBD5E1"}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontWeight:700,fontSize:11}}>{cat}</button>;})}
          </div>
        </div>
      </div>
      <div style={{background:"white",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px #0001",marginBottom:12}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <p style={{margin:0,fontWeight:800,fontSize:14,color:N}}>Totais por Categoria</p>
          <Badge text={fPCats.length?fPCats.length+" categorias":"Todas as categorias"} color={N}/>
        </div>
        {finCatRows.length===0?<p style={{padding:22,textAlign:"center",color:"#888",fontSize:13,margin:0}}>Nenhum subtotal para os filtros selecionados.</p>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:680}}>
              <thead><tr style={{background:"#F8FAFC"}}>{["Categoria","Pago","Pendente","Isenções","Registros","Subtotal"].map(h=><th key={h} style={{padding:"8px 11px",textAlign:h==="Categoria"?"left":"right",fontSize:11,fontWeight:800,color:"#64748B",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>
                {finCatRows.map((r,i)=><tr key={r.cat} style={{background:i%2===0?"white":"#F8FAFC",borderBottom:"1px solid #F1F5F9"}}>
                  <td style={{padding:"9px 11px",fontSize:13,fontWeight:800,color:N}}>{r.cat}</td>
                  <td style={{padding:"9px 11px",fontSize:13,fontWeight:700,color:"#059669",textAlign:"right"}}>{fmtR(r.pago)}</td>
                  <td style={{padding:"9px 11px",fontSize:13,fontWeight:700,color:R,textAlign:"right"}}>{fmtR(r.pend)}</td>
                  <td style={{padding:"9px 11px",fontSize:13,color:OR,textAlign:"right",fontWeight:700}}>{r.isentos}</td>
                  <td style={{padding:"9px 11px",fontSize:13,color:"#64748B",textAlign:"right",fontWeight:700}}>{r.rows.length}</td>
                  <td style={{padding:"9px 11px",fontSize:13,fontWeight:900,color:N,textAlign:"right"}}>{fmtR(r.total)}</td>
                </tr>)}
                <tr style={{background:N}}>
                  <td style={{padding:"10px 11px",fontSize:12,fontWeight:900,color:G,textTransform:"uppercase"}}>Total Geral</td>
                  <td style={{padding:"10px 11px",fontSize:13,fontWeight:900,color:"white",textAlign:"right"}}>{fmtR(tPago)}</td>
                  <td style={{padding:"10px 11px",fontSize:13,fontWeight:900,color:"white",textAlign:"right"}}>{fmtR(tPend)}</td>
                  <td style={{padding:"10px 11px",fontSize:13,fontWeight:900,color:"white",textAlign:"right"}}>{tIsentos}</td>
                  <td style={{padding:"10px 11px",fontSize:13,fontWeight:900,color:"white",textAlign:"right"}}>{filtPgto.length}</td>
                  <td style={{padding:"10px 11px",fontSize:13,fontWeight:900,color:G,textAlign:"right"}}>{fmtR(tGeral)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      {filtPgto.length===0?<div style={{background:"white",borderRadius:12,padding:48,textAlign:"center",boxShadow:"0 2px 8px #0001"}}><p style={{fontSize:40,margin:0}}>💰</p><p style={{color:"#888",fontWeight:600}}>Nenhum registro</p></div>:(
        <div style={{background:"white",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px #0001"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:N}}>{["Atleta","Tipo","Valor","Data","Código","Status","Ações"].map(h=><th key={h} style={{padding:"9px 11px",textAlign:"left",fontSize:11,fontWeight:800,color:G,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
            <tbody>{filtPgto.map((pg,i)=>{const ath=athletes.find(x=>x.id===pg.aId);const sc=pg.status==="Pago"?"#059669":pg.status==="Pendente"?R:OR;return(
              <tr key={pg.id} style={{background:i%2===0?"white":"#F8FAFC",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"9px 11px",fontSize:13}}><p style={{margin:0,fontWeight:700,color:N}}>{ath?ath.nomeAtleta:"—"}</p><p style={{margin:0,fontSize:11,color:"#94A3B8"}}>{ath?ath.categoria:""}{ath&&ath.projeto?" · "+ath.projeto:""}</p></td>
                <td style={{padding:"9px 11px",fontSize:13}}><p style={{margin:0,fontWeight:600}}>{pg.tipo}</p>{pg.desc&&<p style={{margin:0,fontSize:11,color:"#64748B"}}>{pg.desc}</p>}</td>
                <td style={{padding:"9px 11px",fontSize:13,fontWeight:700}}>{pg.valor?fmtR(pg.valor):"—"}</td>
                <td style={{padding:"9px 11px",fontSize:12,color:"#64748B"}}>{fmtD(pg.data)}</td>
                <td style={{padding:"9px 11px"}}>{pg.txn?<span style={{background:N+"15",color:N,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{pg.txn}</span>:<span style={{color:"#94A3B8",fontSize:11}}>—</span>}</td>
                <td style={{padding:"9px 11px"}}><select value={pg.status} onChange={e=>updPgto(pg.id,e.target.value)} style={{background:sc+"18",color:sc,border:`1px solid ${sc}44`,borderRadius:99,padding:"3px 9px",fontSize:12,fontWeight:700,cursor:"pointer",outline:"none"}}>{PSTAT.map(s=><option key={s}>{s}</option>)}</select></td>
                <td style={{padding:"9px 11px"}}><div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <button onClick={()=>openEditPgto(pg)} style={{background:N,color:G,border:"none",borderRadius:7,padding:"5px 9px",cursor:"pointer",fontWeight:700,fontSize:11}}>✏️</button>
                  {pg.status==="Pendente"&&<button onClick={()=>setStripeTarget({pgto:pg,atleta:ath})} style={{background:"linear-gradient(135deg,#635BFF,#4F46E5)",color:"white",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>💳 Pagar</button>}
                  {pg.comp&&<button onClick={()=>{const msg=`📋 *Comprovante*\n🔑 ${pg.txn}\nAtleta: ${ath?ath.nomeAtleta:"—"}\nValor: ${fmtR(pg.valor)}`;const el=document.createElement("a");el.href=pg.comp.data;el.download=pg.comp.name;el.click();setTimeout(()=>waOpen(WA_ADMIN,msg),600);}} style={{background:GR,color:"white",border:"none",borderRadius:7,padding:"5px 9px",cursor:"pointer",fontWeight:700,fontSize:11}}>📲</button>}
                  <button onClick={()=>delPgto(pg.id)} style={{background:"none",border:"none",color:R,cursor:"pointer",fontSize:14}}>🗑</button>
                </div></td>
              </tr>
            );})}
            </tbody>
          </table>
        </div>
      )}
      <div style={{background:"white",borderRadius:12,overflow:"hidden",boxShadow:"0 2px 8px #0001",marginTop:12}}>
        <div style={{padding:"12px 14px",borderBottom:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <p style={{margin:0,fontWeight:800,fontSize:14,color:N}}>Histórico de Movimentação Financeira</p>
          <Badge text={filtFinHist.length+" registros"} color={N}/>
        </div>
        {filtFinHist.length===0?<p style={{padding:22,textAlign:"center",color:"#888",fontSize:13,margin:0}}>Nenhuma movimentação registrada para os filtros selecionados.</p>:(
          <div style={{maxHeight:260,overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:760}}>
              <thead><tr style={{background:"#F8FAFC"}}>{["Data","Ação","Atleta","Tipo","Valor","Status","Obs."].map(h=><th key={h} style={{padding:"8px 11px",textAlign:"left",fontSize:11,fontWeight:800,color:"#64748B",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
              <tbody>{filtFinHist.map((h,i)=><tr key={h.id||i} style={{background:i%2===0?"white":"#F8FAFC",borderBottom:"1px solid #F1F5F9"}}><td style={{padding:"8px 11px",fontSize:12,color:"#64748B",whiteSpace:"nowrap"}}>{new Date(h.data).toLocaleString("pt-BR")}</td><td style={{padding:"8px 11px",fontSize:13,fontWeight:700,color:N}}>{h.action}</td><td style={{padding:"8px 11px",fontSize:13}}>{h.atleta}</td><td style={{padding:"8px 11px",fontSize:13}}>{h.tipo}</td><td style={{padding:"8px 11px",fontSize:13,fontWeight:700}}>{h.valor?fmtR(h.valor):"—"}</td><td style={{padding:"8px 11px",fontSize:13}}>{h.status||"—"}</td><td style={{padding:"8px 11px",fontSize:12,color:"#64748B"}}>{h.extra||"—"}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      {showPgto&&<Modal title={editPgto?"✏️ Editar Registro Financeiro":"💰 Novo Registro"} onClose={()=>{setShowPgto(false);setEditPgto(null);resetPgtoF();}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}><div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",display:"block",marginBottom:4}}>Atleta *</label><select value={pgtoF.aId} onChange={e=>setPgtoF(f=>({...f,aId:Number(e.target.value)}))} style={{border:"1.5px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:14,width:"100%",outline:"none"}}><option value="">Selecione...</option>{athletes.slice().sort(sortName).map(a=><option key={a.id} value={a.id}>{a.nomeAtleta}{a.categoria?" ("+a.categoria+")":""}</option>)}</select></div><Sel label="Tipo *" value={pgtoF.tipo} onChange={v=>setPgtoF(f=>({...f,tipo:v}))} opts={PTYPES}/><Sel label="Status" value={pgtoF.status} onChange={v=>setPgtoF(f=>({...f,status:v}))} opts={PSTAT}/><Inp label="Descrição" value={pgtoF.desc} onChange={v=>setPgtoF(f=>({...f,desc:v}))} placeholder="ex: Campeonato"/><Inp label="Valor (R$)" type="number" value={pgtoF.valor} onChange={v=>setPgtoF(f=>({...f,valor:v}))}/><Inp label="Data" type="date" value={pgtoF.data} onChange={v=>setPgtoF(f=>({...f,data:v}))}/><div style={{gridColumn:"1/-1"}}><FilePick label="📎 Comprovante (opcional)" file={pgtoF.comp} onChange={f=>setPgtoF(fm=>({...fm,comp:f}))}/></div></div><div style={{display:"flex",gap:10}}><Btn color={N} disabled={!pgtoF.tipo||!pgtoF.aId} onClick={editPgto?saveEditPgto:addPgto}>✅ Salvar</Btn><Btn outline color="#888" onClick={()=>{setShowPgto(false);setEditPgto(null);resetPgtoF();}}>Cancelar</Btn></div></Modal>}
    </div>
  );

  // ── Professores ───────────────────────────────────────
  const renderProfs=()=>(
    <div style={{maxWidth:800,margin:"24px auto",padding:"0 16px"}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}><Btn color={G} onClick={()=>{resetProfF();setShowProf(true);}}>+ Novo Professor</Btn></div>
      <div style={{background:"white",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px #0001"}}>{profs.length===0?<p style={{padding:32,textAlign:"center",color:"#888"}}>Nenhum professor</p>:profs.map((pf,i)=><div key={pf.id} style={{display:"flex",gap:12,padding:"11px 16px",borderBottom:"1px solid #F1F5F9",alignItems:"center",background:i%2===0?"white":"#F8FAFC"}}><div style={{width:36,height:36,borderRadius:8,background:N,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{color:G,fontWeight:800}}>{pf.nome?pf.nome[0]:"?"}</span></div><div style={{flex:1}}><p style={{margin:0,fontWeight:700,color:N}}>{pf.nome}</p><p style={{margin:0,fontSize:12,color:"#64748B"}}>Login: <strong>{pf.user}</strong> · {pf.projeto||"—"} · {pf.categoria||"—"}</p></div><button onClick={()=>openEditProf(pf)} style={{background:"none",border:"none",color:N,cursor:"pointer",fontSize:16}}>✏️</button><button onClick={async()=>{const nl=profs.filter(x=>x.id!==pf.id);setProfs(nl);await sPf(nl);}} style={{background:"none",border:"none",color:R,cursor:"pointer",fontSize:16}}>🗑</button></div>)}</div>
      {showProf&&<Modal title={profF.id?"✏️ Editar Professor":"➕ Novo Professor"} onClose={()=>{setShowProf(false);resetProfF();}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}><Inp label="Nome" req value={profF.nome} onChange={v=>setProfF(f=>({...f,nome:v}))} full/><Inp label="Login" req value={profF.user} onChange={v=>setProfF(f=>({...f,user:v}))}/><Inp label="Senha" req value={profF.pass} onChange={v=>setProfF(f=>({...f,pass:v}))} type="password"/><Sel label="Projeto" value={profF.projeto} onChange={v=>setProfF(f=>({...f,projeto:v}))} opts={PROJS}/><Sel label="Categoria" value={profF.categoria} onChange={v=>setProfF(f=>({...f,categoria:v}))} opts={CATS}/></div><div style={{display:"flex",gap:10}}><Btn color={N} disabled={!profF.nome||!profF.user||!profF.pass} onClick={addProf}>✅ Salvar</Btn><Btn outline color="#888" onClick={()=>{setShowProf(false);resetProfF();}}>Cancelar</Btn></div></Modal>}
    </div>
  );

  // ── Portal Atleta ─────────────────────────────────────
  const renderPortal=()=>{
    const a=user&&user.id&&user.id!=="demo"?athletes.find(x=>x.id===user.id):null;
    if(!a) return (
      <div style={{maxWidth:600,margin:"32px auto",padding:"0 16px",textAlign:"center"}}>
        <div style={{background:"white",borderRadius:16,padding:32,boxShadow:"0 2px 12px #0001"}}>
          <p style={{fontSize:48,margin:"0 0 12px"}}>⚽</p>
          <p style={{fontWeight:800,fontSize:18,color:N,margin:"0 0 8px"}}>Acesso de Demonstração</p>
          <p style={{color:"#64748B",fontSize:14,margin:"0 0 20px"}}>Use o link exclusivo enviado pelo Agrifut para acessar seu perfil.</p>
          <Btn color={N} onClick={()=>setUser(null)}>← Voltar</Btn>
        </div>
      </div>
    );
    const missing=getMissingDocs(a);
    return (
      <div style={{maxWidth:700,margin:"24px auto",padding:"0 16px"}}>
        <div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px #0001",marginBottom:14}}>
          <div style={{background:N,padding:"18px 22px",display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:58,height:58,borderRadius:12,background:G,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{a.foto?<img src={a.foto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontWeight:900,fontSize:24,color:N}}>{a.nomeAtleta?a.nomeAtleta[0]:"?"}</span>}</div>
            <div><p style={{color:"white",fontWeight:800,fontSize:18,margin:0}}>{a.nomeAtleta}</p><p style={{color:G,fontSize:13,margin:"2px 0 0"}}>{a.posicao||""}</p><div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>{a.categoria&&<Badge text={a.categoria} color={G}/>}{a.projeto&&<Badge text={a.projeto} color={G}/>}</div></div>
          </div>
          <div style={{padding:18}}>
        <IRow label="Nasc." value={fmtD(a.dataNasc)}/><IRow label="RG" value={a.rgAtletaNum}/><IRow label="Escola" value={a.escola}/><IRow label="Responsável" value={a.nomeResp}/><IRow label="WhatsApp" value={a.telResp}/>
          </div>
        </div>
        {missing.length>0&&(
          <div style={{background:"#FFF9F9",borderRadius:14,padding:16,marginBottom:14,border:`1.5px solid ${R}33`,boxShadow:"0 2px 8px #0001"}}>
            <p style={{fontWeight:800,fontSize:13,color:R,margin:"0 0 8px"}}>⚠️ Documentos Pendentes</p>
            {missing.map((d,i)=><p key={i} style={{fontSize:13,color:"#374151",margin:"3px 0"}}>• {d}</p>)}
            <p style={{fontSize:12,color:"#64748B",margin:"10px 0 0"}}>Vá em 📁 Documentos abaixo para enviar.</p>
          </div>
        )}
        <div style={{background:"white",borderRadius:16,padding:18,boxShadow:"0 2px 12px #0001",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{fontWeight:800,fontSize:14,color:N,margin:0}}>📁 Documentos</p>
            <div style={{display:"flex",gap:6}}><Btn small color={docTab==="ver"?N:"#94A3B8"} onClick={()=>setDocTab("ver")}>Ver</Btn><Btn small color={docTab==="add"?N:"#94A3B8"} onClick={()=>setDocTab("add")}>+ Adicionar</Btn></div>
          </div>
          {docTab==="ver"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[{k:"rgAtleta",l:"RG Atleta"},{k:"rgResp",l:"RG Responsável"},{k:"comprResid",l:"Comp. Residência"},{k:"laudo",l:"Laudo"}].map(({k,l})=><div key={k} style={{background:a[k]?"#F0FFF4":"#FFF9F9",borderRadius:8,padding:10,border:`1px solid ${a[k]?"#86EFAC":R+"44"}`,textAlign:"center"}}><p style={{margin:"0 0 4px",fontSize:18}}>{a[k]?"✅":"❌"}</p><p style={{margin:0,fontSize:11,fontWeight:700,color:a[k]?"#065F46":R}}>{l}</p>{a[k]&&<a href={a[k].data} download={a[k].name} style={{fontSize:11,color:BL,fontWeight:700}}>⬇</a>}</div>)}</div>}
          {docTab==="add"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{[{k:"rgAtleta",l:"🪪 RG do Atleta"},{k:"rgResp",l:"🪪 RG do Responsável"},{k:"comprResid",l:"🏠 Comprovante de Residência"},{k:"laudo",l:"📋 Laudo Médico"}].map(({k,l})=><FilePick key={k} label={l} file={null} onChange={async f=>{const nl=athletes.map(x=>x.id===a.id?{...x,[k]:f}:x);setAthletes(nl);await sA(nl);t2("✅ Documento salvo!");setDocTab("ver");}}/>)}</div>}
        </div>
        {renderAthFinanceBox(a,{allowPay:true})}
      </div>
    );
  };

  // ── Athlete detail modal ──────────────────────────────
  const renderSelAth=()=>{
    if(!selAth) return null;
    const a=selAth;const missing=getMissingDocs(a);const docsMsg=buildDocsMsg(a);
    return (
      <Modal title={"👤 "+a.nomeAtleta} onClose={()=>setSelAth(null)} wide>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {a.categoria?<Badge text={a.categoria} color={N}/>:<Badge text="Sem categoria" color="#94A3B8"/>}
          {a.posicao&&<Badge text={a.posicao} color={OR}/>}
          {a.projeto?<Badge text={a.projeto} color={PC[a.projeto]||"#888"}/>:<Badge text="Sem projeto" color="#94A3B8"/>}
          {a.neurodivergente&&<Badge text="Neurodivergente" color={PU}/>}
        </div>
        {a.foto&&<img src={a.foto} alt="" style={{width:78,height:78,objectFit:"cover",borderRadius:12,border:`3px solid ${G}`,float:"right",marginLeft:12}}/>}
        <IRow label="Nasc." value={fmtD(a.dataNasc)}/><IRow label="Idade" value={a.age+" anos"}/><IRow label="CPF Atleta" value={a.cpfAtleta}/><IRow label="RG Atleta" value={a.rgAtletaNum}/><IRow label="Posição" value={a.posicao}/><IRow label="Escola" value={a.escola}/><IRow label="Responsável" value={a.nomeResp}/><IRow label="WhatsApp" value={a.telResp}/>
        <div style={{clear:"both",marginTop:12,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          {[{k:"rgAtleta",l:"RG Atleta"},{k:"rgResp",l:"RG Resp."},{k:"comprResid",l:"Comp. Resid."},{k:"laudo",l:"Laudo"}].map(({k,l})=><div key={k} style={{background:a[k]?"#F0FFF4":"#FFF9F9",borderRadius:8,padding:8,border:`1px solid ${a[k]?"#86EFAC":R+"44"}`,textAlign:"center"}}><p style={{margin:"0 0 2px",fontSize:16}}>{a[k]?"✅":"❌"}</p><p style={{margin:0,fontSize:10,fontWeight:700,color:a[k]?"#065F46":R}}>{l}</p>{a[k]&&<a href={a[k].data} download={a[k].name} style={{fontSize:10,color:BL,fontWeight:700}}>⬇</a>}</div>)}
        </div>
        {missing.length>0&&(
          <div style={{background:"#FFF9F9",borderRadius:10,padding:12,border:`1px solid ${R}33`,marginBottom:12}}>
            <p style={{fontWeight:700,fontSize:12,color:R,margin:"0 0 6px"}}>⚠️ Documentos Pendentes:</p>
            {missing.map((d,i)=><p key={i} style={{fontSize:12,color:"#374151",margin:"2px 0"}}>• {d}</p>)}
          </div>
        )}
        {a.token&&<div style={{marginBottom:14}}><LinkBox token={a.token}/></div>}
        {renderAthFinanceBox(a)}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingTop:10,borderTop:"1px solid #eee"}}>
          <Btn color={GR} small onClick={()=>waOpen("55"+a.telResp.replace(/\D/g,""),`Olá ${a.nomeResp}! Contato Agrifut 🟡⚫`)}>📲 WhatsApp</Btn>
          {docsMsg&&<Btn color="#059669" small onClick={()=>waOpen("55"+a.telResp.replace(/\D/g,""),docsMsg)}>📋 Enviar Docs Pendentes</Btn>}
          <Btn color={N} small onClick={()=>setSigTarget(a)}>📄 Gerar PDF</Btn>
          {user&&user.role==="admin"&&<>
            <Btn color={OR} small onClick={()=>{setMigAth(a);setMigC(a.categoria||"");setMigP(a.projeto||"");setSelAth(null);}}>🔄 Migrar</Btn>
            <Btn color={N} small onClick={()=>{setEditAth({...a});setSelAth(null);}}>✏️ Editar</Btn>
            <Btn color={R} small onClick={()=>delA(a.id)}>🗑 Remover</Btn>
          </>}
        </div>
      </Modal>
    );
  };

  // ── Login ─────────────────────────────────────────────
  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${N},#2D4A7A)`}}><p style={{color:"white",fontSize:18,fontWeight:700}}>Carregando...</p></div>;

  if(!user) return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${N} 0%,#2D4A7A 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:20,padding:36,width:"100%",maxWidth:420,boxShadow:"0 24px 60px #0004"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <AgrifutLogo size={72}/>
          <p style={{fontWeight:900,fontSize:20,color:N,margin:0}}>ITAJAÍ AGRIFUT</p>
          <p style={{fontSize:12,color:"#94A3B8",margin:"4px 0 0",letterSpacing:1}}>GESTÃO DE ATLETAS</p>
        </div>

        {/* Public form access */}
        <div style={{background:"#F0FFF4",borderRadius:12,padding:14,border:"1px solid #86EFAC",marginBottom:20,textAlign:"center"}}>
          <p style={{fontWeight:700,color:"#065F46",fontSize:13,margin:"0 0 8px"}}>⚽ Novo atleta? Faça seu cadastro aqui:</p>
          <button onClick={()=>{setUser({role:"publico",nome:"Visitante"});setTab("form");}} style={{background:GR,color:"white",border:"none",borderRadius:10,padding:"10px 24px",fontWeight:800,fontSize:14,cursor:"pointer",width:"100%"}}>📝 Cadastrar Atleta</button>
        </div>

        <div style={{borderTop:"1px solid #E2E8F0",paddingTop:18,marginBottom:16}}>
          <p style={{textAlign:"center",fontSize:12,color:"#94A3B8",margin:"0 0 14px",textTransform:"uppercase",letterSpacing:1}}>Acesso do sistema</p>
          <StaffLogin onLogin={handleLogin} profs={profs} athletes={athletes}/>
        </div>
      </div>
    </div>
  );

  const ADMIN_TABS=[{id:"athletes",l:"📋 Atletas"},{id:"form",l:"➕ Cadastrar"},{id:"presenca",l:"📅 Presença"},{id:"campeonatos",l:"🏆 Campeonatos"},{id:"financeiro",l:"💰 Financeiro"},{id:"estoque",l:"🛍️ Estoque"},{id:"professores",l:"👨‍🏫 Professores"}];
  const PROF_TABS=[{id:"athletes",l:"📋 Turma"},{id:"form",l:"➕ Cadastrar"},{id:"presenca",l:"📅 Presença"},{id:"campeonatos",l:"🏆 Campeonatos"},{id:"estoque",l:"🛍️ Estoque"}];
  const PUBLICO_TABS=[{id:"form",l:"📝 Cadastro"}];
  const ATLETA_TABS=[{id:"portal",l:"⚽ Meu Perfil"},{id:"estoque",l:"🛍️ Loja"}];
  const tabs=user.role==="admin"?ADMIN_TABS:user.role==="professor"?PROF_TABS:user.role==="publico"?PUBLICO_TABS:ATLETA_TABS;

  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:"#F1F5F9"}}>
      <div style={{background:N,padding:"10px 18px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <AgrifutLogo size={40}/>
          <div style={{flex:1}}><p style={{color:"white",fontWeight:800,fontSize:14,margin:0}}>ITAJAÍ AGRIFUT</p><p style={{color:G,fontSize:10,margin:0,letterSpacing:1}}>{user.role==="admin"?"ADMINISTRADOR":user.role==="professor"?"PROFESSOR — "+user.nome:user.role==="publico"?"CADASTRO PÚBLICO":"ATLETA — "+user.nome}</p></div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?G:"transparent",color:tab===t.id?N:"white",border:`1.5px solid ${tab===t.id?G:"#ffffff33"}`,borderRadius:8,padding:"5px 11px",cursor:"pointer",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>{t.l}</button>)}
            <button onClick={()=>{setUser(null);setNewAthToken("");}} style={{background:"transparent",color:"#94A3B8",border:"1.5px solid #ffffff22",borderRadius:8,padding:"5px 11px",cursor:"pointer",fontWeight:700,fontSize:11}}>Sair</button>
          </div>
        </div>
      </div>

      {toast&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",background:N,color:"white",padding:"9px 22px",borderRadius:99,fontWeight:700,fontSize:14,zIndex:9999,boxShadow:"0 4px 20px #0004",whiteSpace:"nowrap"}}>{toast}</div>}

      {stripeTarget&&<PayModal pgto={stripeTarget.pgto} atleta={stripeTarget.atleta} onSuccess={onPaid} onClose={()=>setStripeTarget(null)}/>}
      {sigTarget&&<SignaturePad onSave={sig=>{setPdfTarget({atleta:sigTarget,sig});setSigTarget(null);}} onClose={()=>setSigTarget(null)}/>}
      {pdfTarget&&<PDFModal atleta={pdfTarget.atleta} sig={pdfTarget.sig} onClose={()=>setPdfTarget(null)}/>}
      {migAth&&<Modal title="🔄 Migrar" onClose={()=>setMigAth(null)}><p style={{fontSize:14,marginBottom:14}}>Alterando: <strong>{migAth.nomeAtleta}</strong></p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}><Sel label="Nova Categoria" value={migC} onChange={setMigC} opts={CATS}/><Sel label="Novo Projeto" value={migP} onChange={setMigP} opts={PROJS}/></div><div style={{display:"flex",gap:10}}><Btn color={N} onClick={doMig}>✅ Confirmar</Btn><Btn outline color="#888" onClick={()=>setMigAth(null)}>Cancelar</Btn></div></Modal>}
      {editAth&&<Modal title="✏️ Editar Atleta" onClose={()=>setEditAth(null)} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
          <Sec label="Dados do Atleta"/>
          <Inp label="Nome" value={editAth.nomeAtleta} onChange={v=>setEditAth(e=>({...e,nomeAtleta:v}))} full/>
          <Inp label="Data Nasc." type="date" value={editAth.dataNasc} onChange={v=>setEditAth(e=>({...e,dataNasc:v}))}/>
          <Inp label="CPF Atleta" value={editAth.cpfAtleta} onChange={v=>setEditAth(e=>({...e,cpfAtleta:fmtCPF(v)}))}/>
          <Inp label="RG Atleta" value={editAth.rgAtletaNum} onChange={v=>setEditAth(e=>({...e,rgAtletaNum:v}))}/>
          <Inp label="Tel. Atleta" value={editAth.telAtleta} onChange={v=>setEditAth(e=>({...e,telAtleta:fmtTel(v)}))}/>
          <Inp label="E-mail Atleta" value={editAth.emailAtleta} onChange={v=>setEditAth(e=>({...e,emailAtleta:v}))}/>
          <Sel label="Categoria" value={editAth.categoria} onChange={v=>setEditAth(e=>({...e,categoria:v}))} opts={CATS}/>
          <Sel label="Projeto" value={editAth.projeto} onChange={v=>setEditAth(e=>({...e,projeto:v}))} opts={PROJS}/>
          <Sel label="Posição" value={editAth.posicao} onChange={v=>setEditAth(e=>({...e,posicao:v}))} opts={POSICOES}/>
          <Inp label="Escola" value={editAth.escola} onChange={v=>setEditAth(e=>({...e,escola:v}))}/>
          <Inp label="Série" value={editAth.serie} onChange={v=>setEditAth(e=>({...e,serie:v}))}/>
          <Inp label="Endereço" value={editAth.endereco} onChange={v=>setEditAth(e=>({...e,endereco:v}))} full/>
          <Inp label="Bairro" value={editAth.bairro} onChange={v=>setEditAth(e=>({...e,bairro:v}))}/>
          <Inp label="Cidade" value={editAth.cidade} onChange={v=>setEditAth(e=>({...e,cidade:v}))}/>
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",display:"block",marginBottom:5}}>Foto</label>
            <input type="file" accept="image/*" style={{fontSize:12}} onChange={async e=>{if(e.target.files[0]){const d=await readB64(e.target.files[0]);setEditAth(at=>({...at,foto:d.data}));}}}/>
            {editAth.foto&&<div style={{display:"flex",gap:10,alignItems:"center",marginTop:8}}><img src={editAth.foto} alt="" style={{width:74,height:74,objectFit:"cover",borderRadius:10,border:`3px solid ${G}`}}/><Btn small outline color={R} onClick={()=>setEditAth(e=>({...e,foto:null}))}>Remover foto</Btn></div>}
          </div>
          <Sec label="Responsável"/>
          <Inp label="Nome Responsável" value={editAth.nomeResp} onChange={v=>setEditAth(e=>({...e,nomeResp:v}))} full/>
          <Inp label="CPF Responsável" value={editAth.cpfResp} onChange={v=>setEditAth(e=>({...e,cpfResp:fmtCPF(v)}))}/>
          <Inp label="WhatsApp Resp." value={editAth.telResp} onChange={v=>setEditAth(e=>({...e,telResp:fmtTel(v)}))}/>
          <Inp label="E-mail Resp." value={editAth.emailResp} onChange={v=>setEditAth(e=>({...e,emailResp:v}))}/>
          <Sel label="Relação" value={editAth.relacao} onChange={v=>setEditAth(e=>({...e,relacao:v}))} opts={RELS}/>
          <Inp label="Documento Resp." value={editAth.docResp} onChange={v=>setEditAth(e=>({...e,docResp:v}))}/>
          <Inp label="Contato Emergência" value={editAth.contatoEmerg} onChange={v=>setEditAth(e=>({...e,contatoEmerg:v}))}/>
          <Inp label="Telefone Emergência" value={editAth.telEmerg} onChange={v=>setEditAth(e=>({...e,telEmerg:fmtTel(v)}))}/>
          <Sec label="Saúde e Autorizações"/>
          <Sel label="Alergia" value={editAth.alergia} onChange={v=>setEditAth(e=>({...e,alergia:v}))} opts={["sim","nao"]}/>
          <Inp label="Descrição Alergia" value={editAth.alergiaDesc} onChange={v=>setEditAth(e=>({...e,alergiaDesc:v}))}/>
          <Sel label="Medicamento" value={editAth.medicamento} onChange={v=>setEditAth(e=>({...e,medicamento:v}))} opts={["sim","nao"]}/>
          <Inp label="Descrição Medicamento" value={editAth.medicamentoDesc} onChange={v=>setEditAth(e=>({...e,medicamentoDesc:v}))}/>
          <label style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,color:PU}}><input type="checkbox" checked={!!editAth.neurodivergente} onChange={e=>setEditAth(at=>({...at,neurodivergente:e.target.checked}))} style={{accentColor:PU}}/>Atleta neurodivergente</label>
          <label style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,color:N}}><input type="checkbox" checked={!!editAth.termoAceito} onChange={e=>setEditAth(at=>({...at,termoAceito:e.target.checked}))} style={{accentColor:N}}/>Termo aceito</label>
          <label style={{display:"flex",alignItems:"center",gap:8,fontWeight:700,fontSize:13,color:BL}}><input type="checkbox" checked={!!editAth.imagemAceito} onChange={e=>setEditAth(at=>({...at,imagemAceito:e.target.checked}))} style={{accentColor:BL}}/>Imagem autorizada</label>
          <Sec label="Documentos"/>
          <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <FilePick label="🪪 RG / Certidão do Atleta" file={editAth.rgAtleta} onChange={f=>setEditAth(at=>({...at,rgAtleta:f}))}/>
            <FilePick label="🪪 RG / CPF do Responsável" file={editAth.rgResp} onChange={f=>setEditAth(at=>({...at,rgResp:f}))}/>
            <FilePick label="🏠 Comprovante de Residência" file={editAth.comprResid} onChange={f=>setEditAth(at=>({...at,comprResid:f}))}/>
            <FilePick label="📋 Laudo Médico" file={editAth.laudo} onChange={f=>setEditAth(at=>({...at,laudo:f}))}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}><Btn color={N} onClick={saveEdit}>💾 Salvar</Btn><Btn outline color="#888" onClick={()=>setEditAth(null)}>Cancelar</Btn></div>
      </Modal>}
      {renderSelAth()}

      {tab==="form"&&(
        newAthToken ? renderSuccess() : (
          <div style={{maxWidth:740,margin:"22px auto",padding:"0 16px"}}>
            {user.role==="publico"&&<div style={{background:"#EFF6FF",borderRadius:12,padding:14,marginBottom:16,border:"1px solid #BFDBFE",display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>📝</span><div><p style={{margin:0,fontWeight:700,color:BL,fontSize:14}}>Cadastro de Atleta — Itajaí Agrifut</p><p style={{margin:0,fontSize:12,color:"#1E40AF"}}>Preencha o formulário abaixo. Após o cadastro, você receberá um link exclusivo de acesso ao perfil.</p></div></div>}
            <div style={{display:"flex",background:"white",borderRadius:12,overflow:"hidden",marginBottom:16,boxShadow:"0 2px 8px #0001"}}>
              {STEPS.map((s,i)=><div key={i} onClick={()=>i<step&&setStep(i)} style={{flex:1,padding:"9px 4px",textAlign:"center",background:i===step?N:i<step?"#D1FAE5":"white",cursor:i<step?"pointer":"default",borderRight:"1px solid #F0F0F0"}}><p style={{margin:0,fontSize:14}}>{i<step?"✓":s.icon}</p><p style={{margin:0,fontSize:10,fontWeight:700,color:i===step?"white":i<step?"#065F46":"#94A3B8"}}>{s.label}</p></div>)}
            </div>
            <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 2px 12px #0001"}}>
              {renderStep()}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:20,paddingTop:14,borderTop:"1px solid #eee"}}>
                {step>0?<Btn outline color={N} onClick={()=>setStep(s=>s-1)}>← Anterior</Btn>:<div/>}
                {step<4?<Btn color={N} disabled={!canNext()} onClick={()=>setStep(s=>s+1)}>Próximo →</Btn>:<Btn color={GR} disabled={!form.termoAceito||!form.imagemAceito} onClick={submit}>✅ Finalizar Cadastro</Btn>}
              </div>
            </div>
          </div>
        )
      )}
      {tab==="athletes"&&renderAthletes()}
      {tab==="presenca"&&renderPresenca()}
      {tab==="campeonatos"&&renderCamps()}
      {tab==="financeiro"&&renderFin()}
      {tab==="estoque"&&renderEstoque()}
      {tab==="professores"&&renderProfs()}
      {tab==="portal"&&renderPortal()}
    </div>
  );
}

// ── PDF Modal ─────────────────────────────────────────────
function PDFModal({atleta:a, sig, onClose}) {
  const iRef = useRef(null);
  const docs=[{l:"RG Atleta",ok:!!a.rgAtleta},{l:"RG Responsável",ok:!!a.rgResp},{l:"Comp. Residência",ok:!!a.comprResid},{l:"Laudo Médico",ok:!!a.laudo}];
  const doPrint=()=>{if(iRef.current){iRef.current.contentWindow.focus();iRef.current.contentWindow.print();}};
  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Ficha — ${a.nomeAtleta}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:28px;color:#1E293B;font-size:13px;max-width:800px;margin:0 auto}
.hdr{display:flex;align-items:center;gap:16px;margin-bottom:20px;border-bottom:3px solid #F5C518;padding-bottom:14px}
.logo{width:58px;height:58px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.logo img{width:100%;height:100%;object-fit:contain;display:block}
h1{font-size:20px;color:#1B2A4A;margin:0}.sub{font-size:11px;color:#94A3B8;margin-top:3px}
.sec{margin-bottom:16px}.sec-t{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1B2A4A;border-bottom:2px solid #F5C518;padding-bottom:3px;margin-bottom:10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}.fl{font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;margin-bottom:2px}.fv{color:#1E293B;font-size:13px}
.termo{font-size:12px;line-height:1.8;color:#374151;background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #E2E8F0;margin-bottom:10px}
.doc-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.dok{background:#F0FFF4;color:#065F46;border:1px solid #86EFAC;border-radius:8px;padding:8px;text-align:center;font-size:11px;font-weight:700}
.dno{background:#FFF5F5;color:#DC2626;border:1px solid #FECACA;border-radius:8px;padding:8px;text-align:center;font-size:11px;font-weight:700}
.sig-a{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:28px}
.sig-b{border-top:2px solid #1B2A4A;padding-top:6px;text-align:center;font-size:11px;color:#64748B;text-transform:uppercase}
.foot{margin-top:24px;text-align:center;font-size:10px;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:10px}
${docAttachmentStyles}
@media print{body{padding:14px}}</style></head><body>
<div class="hdr"><div class="logo"><img src="${getLogoSrc()}" alt="Agrifut Itajaí EC"/></div><div><h1>Itajaí Agrifut</h1><p class="sub">CNPJ ${CNPJ} · itajaiesporteclube@gmail.com · (47) 99777-6191</p></div></div>
<div class="sec"><div class="sec-t">Dados do Atleta</div><div class="grid">
<div><p class="fl">Nome Completo</p><p class="fv">${a.nomeAtleta||"—"}</p></div>
<div><p class="fl">Posição</p><p class="fv">${a.posicao||"—"}</p></div>
<div><p class="fl">Data de Nascimento</p><p class="fv">${fmtD(a.dataNasc)} (${a.age} anos)</p></div>
<div><p class="fl">CPF</p><p class="fv">${a.cpfAtleta||"—"}</p></div>
<div><p class="fl">RG</p><p class="fv">${a.rgAtletaNum||"—"}</p></div>
<div><p class="fl">Telefone</p><p class="fv">${a.telAtleta||"—"}</p></div>
<div><p class="fl">Escola / Série</p><p class="fv">${a.escola||"—"}${a.serie?" — "+a.serie:""}</p></div>
<div><p class="fl">Categoria / Projeto</p><p class="fv">${a.categoria||"—"} · ${a.projeto||"—"}</p></div>
<div><p class="fl">Endereço</p><p class="fv">${[a.endereco,a.bairro,a.cidade].filter(Boolean).join(", ")||"—"}</p></div>
</div></div>
<div class="sec"><div class="sec-t">Dados do Responsável</div><div class="grid">
<div><p class="fl">Nome Completo</p><p class="fv">${a.nomeResp||"—"}</p></div>
<div><p class="fl">CPF</p><p class="fv">${a.cpfResp||"—"}</p></div>
<div><p class="fl">Relação</p><p class="fv">${a.relacao||"—"}</p></div>
<div><p class="fl">WhatsApp</p><p class="fv">${a.telResp||"—"}</p></div>
<div><p class="fl">E-mail</p><p class="fv">${a.emailResp||"—"}</p></div>
<div><p class="fl">Emergência</p><p class="fv">${a.contatoEmerg||"—"}${a.telEmerg?" · "+a.telEmerg:""}</p></div>
</div></div>
<div class="sec"><div class="sec-t">Saúde</div><div class="grid">
<div><p class="fl">Alergias</p><p class="fv">${a.alergia==="sim"?"Sim — "+a.alergiaDesc:"Não"}</p></div>
<div><p class="fl">Medicamentos</p><p class="fv">${a.medicamento==="sim"?"Sim — "+a.medicamentoDesc:"Não"}</p></div>
<div><p class="fl">Neurodivergente</p><p class="fv">${a.neurodivergente?"Sim":"Não"}</p></div>
</div></div>
<div class="sec"><div class="sec-t">Documentos</div><div class="doc-g">
${docs.map(d=>`<div class="${d.ok?"dok":"dno"}">${d.ok?"✅":"❌"}<br/>${d.l}</div>`).join("")}
</div></div>
<div class="sec"><div class="sec-t">Termo de Autorização</div>
<div class="termo">Eu, <strong>${a.nomeResp||"___"}</strong>, CPF <strong>${a.cpfResp||"___"}</strong>, responsável por <strong>${a.nomeAtleta||"___"}</strong>, autorizo sua participação nas atividades da Agrifut (CNPJ ${CNPJ}), ciente dos riscos, isentando a Agrifut de responsabilidade por eventuais lesões. Autorizo também o uso gratuito e por tempo indeterminado da imagem e voz do atleta para fins institucionais e de divulgação.</div>
<p style="font-size:11px;color:#64748B">✅ Termo aceito: <strong>${a.termoAceito?"Sim":"Não"}</strong> &nbsp;|&nbsp; 📸 Imagem: <strong>${a.imagemAceito?"Autorizada":"Não autorizada"}</strong></p>
</div>
<div class="sig-a">
<div class="sig-b">${sig?`<img src="${sig}" style="max-width:200px;max-height:80px;margin:0 auto 6px;display:block" alt="Assinatura"/>`:'<div style="height:80px"></div>'}<div>Assinatura do Responsável</div></div>
<div class="sig-b"><div style="height:80px"></div><div>Data: &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div></div>
</div>
<div class="foot">Itajaí Esporte Clube — Agrifut · CNPJ ${CNPJ} · Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</div>
${docAttachmentsHTML(a)}
</body></html>`;
  useEffect(()=>{
    if(!iRef.current) return;
    const doc=iRef.current.contentDocument||iRef.current.contentWindow.document;
    doc.open();doc.write(html);doc.close();
  },[]);
  return(
    <div style={{position:"fixed",inset:0,background:"#0009",zIndex:2000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:860,maxHeight:"94vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px #0006",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid #eee",flexShrink:0}}>
          <span style={{fontWeight:800,fontSize:15,color:N}}>📄 Ficha — {a.nomeAtleta}</span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={doPrint} style={{background:N,color:G,border:"none",borderRadius:8,padding:"8px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>🖨️ Imprimir / Salvar PDF</button>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}}>✕</button>
          </div>
        </div>
        <iframe ref={iRef} title="Ficha" style={{flex:1,border:"none",width:"100%",minHeight:0}}/>
        <div style={{padding:"10px 20px",background:"#F8FAFC",borderTop:"1px solid #eee",fontSize:12,color:"#64748B",flexShrink:0,textAlign:"center"}}>
          💡 Clique em <strong>Imprimir / Salvar PDF</strong> e escolha "Salvar como PDF" para gerar o arquivo.
        </div>
      </div>
    </div>
  );
}

// ── Staff + Athlete Login ─────────────────────────────────
function StaffLogin({onLogin, profs, athletes}) {
  const [u,setU] = useState("");
  const [p,setP] = useState("");
  const [err,setErr] = useState("");

  const handle = () => {
    const uc=u.trim(), pc=p.trim();
    // Admin
    if(uc==="admin"&&pc==="agrifut123"){onLogin({role:"admin",nome:"Administrador",tab:"athletes"});return;}
    // Professor
    const pr=profs.find(x=>x.user===uc&&x.pass===pc);
    if(pr){onLogin({role:"professor",id:pr.id,nome:pr.nome,proj:pr.projeto,cat:pr.categoria,tab:"athletes"});return;}
    // Athlete: user = CPF sem pontos, pass = data nascimento DDMMAAAA
    const cpfClean = uc.replace(/\D/g,"");
    const passClean = pc.replace(/\D/g,"");
    if(cpfClean.length===11 && passClean.length===8){
      const at=athletes.find(x=>{
        const cpf=(x.cpfAtleta||"").replace(/\D/g,"");
        const dob=(x.dataNasc||"").replace(/-/g,""); // YYYYMMDD
        const dobFmt=dob.length===8?dob.slice(6,8)+dob.slice(4,6)+dob.slice(0,4):""; // → DDMMAAAA
        return cpf===cpfClean && dobFmt===passClean;
      });
      if(at){onLogin({role:"atleta",id:at.id,nome:at.nomeAtleta,tab:"portal"});return;}
    }
    setErr("Usuário ou senha incorretos.");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <input value={u} onChange={e=>setU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
        placeholder="CPF do atleta  /  professor"
        style={{border:"1.5px solid #ddd",borderRadius:8,padding:"10px 12px",fontSize:14,outline:"none",width:"100%",boxSizing:"border-box"}}/>
      <input type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}
        placeholder="Data de nasc. DDMMAAAA  /  senha"
        style={{border:"1.5px solid #ddd",borderRadius:8,padding:"10px 12px",fontSize:14,outline:"none",width:"100%",boxSizing:"border-box"}}/>
      {err&&<p style={{color:R,fontSize:13,fontWeight:600,margin:0,textAlign:"center"}}>{err}</p>}
      <button onClick={handle} style={{background:N,color:G,border:"none",borderRadius:10,padding:"10px",fontWeight:800,fontSize:14,cursor:"pointer"}}>🔐 Entrar</button>
      <div style={{background:"#F8FAFC",borderRadius:10,padding:10,fontSize:11,color:"#64748B",lineHeight:1.8}}>
        <strong style={{color:N}}>Como acessar:</strong><br/>
        👤 Atleta: CPF (sem pontos) + data nasc. ex: <code style={{background:"#EEE",padding:"1px 4px",borderRadius:3}}>01012010</code><br/>
        👨‍🏫 Professor: login + senha cadastrados
      </div>
    </div>
  );
}

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
