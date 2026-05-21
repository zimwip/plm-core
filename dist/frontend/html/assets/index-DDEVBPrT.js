import{j as e}from"./react-jsx-runtime-shim-DtcNtlUI.js";import{c as gn,r as l,R as Oe}from"./vendor-Dw91Z_SL.js";import{c as xr}from"./react-dom-shim-u_SHOSaN.js";import{S as fr,R as gr,G as br,C as vr,B as yr,a as jr,L as wr,A as bn,b as gt,U as vn,c as kr,H as Bt,d as yn,F as Sr,e as Zt,M as Nr,f as Cr,Z as ks,g as Er,h as Tr,T as zr,i as Ir,j as jn,k as wn,D as kn,l as Ar,W as $r,m as Ss,P as Sn,n as Rr,o as Pr,N as Lr,K as Br,p as Nn,q as Mr,r as Or,s as Qt,t as Ve,u as Ue,v as es,w as ts,x as Dr,y as _r,X as xt,z as bt,E as St,I as De,J as Wr,O as Fr,Q as Cn,V as Bs,Y as Ur,_ as Gr,$ as Hr,a0 as Vr}from"./icons-CwfpQ0Z8.js";import{C as At,S as qr,A as Kr,D as Jr,P as Xr,W as Yr,O as Zr,X as Qr,V as ea,M as ns,B as ta,a as Ms,R as sa,G as na,b as ra,c as rs,d as Os,e as aa,f as oa,g as ia,h as la}from"./three-DAyMVibd.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const En=500,ot=[],hs=new Set;function Tn(){hs.forEach(t=>{try{t()}catch{}})}function Ds(t){return hs.add(t),()=>hs.delete(t)}const ca=/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,da=/\/\d+(?=\/|$)/g;function pa(t){return t.split("?")[0].replace(ca,"/{id}").replace(da,"/{n}")}function _s({method:t,endpoint:s,status:n,durationMs:r,ok:a}){ot.push({method:t,endpoint:pa(s),status:n,durationMs:r,ok:a,at:Date.now()}),ot.length>En&&ot.shift(),Tn()}function at(t,s){if(t.length===0)return 0;const n=Math.min(t.length-1,Math.floor(t.length*s));return t[n]}function Dt(){const t=new Map;for(const o of ot){const i=`${o.method} ${o.endpoint}`;let c=t.get(i);c||(c={method:o.method,endpoint:o.endpoint,durations:[],errorCount:0,lastMs:0,lastAt:0},t.set(i,c)),c.durations.push(o.durationMs),o.ok||c.errorCount++,c.lastMs=o.durationMs,c.lastAt=o.at}const s=[];for(const o of t.values()){const i=[...o.durations].sort((u,d)=>u-d),c=o.durations.reduce((u,d)=>u+d,0);s.push({method:o.method,endpoint:o.endpoint,count:o.durations.length,avgMs:c/o.durations.length,p50:at(i,.5),p95:at(i,.95),maxMs:i[i.length-1],lastMs:o.lastMs,lastAt:o.lastAt,errorCount:o.errorCount})}s.sort((o,i)=>i.count-o.count);const n=ot.map(o=>o.durationMs).sort((o,i)=>o-i),r=n.reduce((o,i)=>o+i,0);return{overall:{total:ot.length,windowSize:En,avgMs:n.length?r/n.length:0,p50:at(n,.5),p75:at(n,.75),p90:at(n,.9),p95:at(n,.95),p99:at(n,.99),maxMs:n.length?n[n.length-1]:0,errorCount:ot.filter(o=>!o.ok).length,sorted:n},byEndpoint:s}}function ua(){ot.length=0,Tn()}function _t(t){const s=Date.now()-t,n=ot.filter(o=>o.at>=s),r=n.map(o=>o.durationMs).sort((o,i)=>o-i),a=r.reduce((o,i)=>o+i,0);return{windowMs:t,count:n.length,avgMs:r.length?a/r.length:0,p50:at(r,.5),p95:at(r,.95),maxMs:r.length?r[r.length-1]:0,errorCount:n.filter(o=>!o.ok).length}}const ct="/api/platform";function He(t){return`/api/${t}`}class zn extends Error{constructor(s,n,r){super(n),this.name="ApiError",this.status=s,this.detail=r}}function Mt(t,s,n,r,a){return new Promise((o,i)=>{const c=new XMLHttpRequest;c.open(s,t),Object.entries(n).forEach(([u,d])=>c.setRequestHeader(u,d)),c.upload.addEventListener("progress",u=>{u.lengthComputable&&a(Math.round(u.loaded/u.total*100))}),c.onload=()=>{const u=()=>Promise.resolve(c.responseText),d=()=>Promise.resolve(JSON.parse(c.responseText));o({ok:c.status>=200&&c.status<300,status:c.status,text:u,json:d})},c.onerror=()=>i(new Error("Network error during upload")),c.onabort=()=>i(new Error("Upload cancelled")),c.send(r)})}async function Me(t,s,n){const r=performance.now();let a,o;try{a=await fetch(t,s)}catch(u){o=u}const i=performance.now()-r,c=t.split("?")[0];if(o)throw _s({method:n,endpoint:c,status:0,durationMs:i,ok:!1}),o;return _s({method:n,endpoint:c,status:a.status,durationMs:i,ok:a.ok}),a}function ma(t,s,n){return Array.isArray(t)?{items:t,totalElements:t.length,totalPages:1,page:s,size:n}:t&&Array.isArray(t.content)?{items:t.content,totalElements:t.totalElements??t.content.length,totalPages:t.totalPages??1,page:t.number??s,size:t.size??n}:t&&Array.isArray(t.items)?{items:t.items,totalElements:t.totalElements??t.items.length,totalPages:t.totalPages??1,page:t.page??s,size:t.size??n}:{items:[],totalElements:0,totalPages:0,page:s,size:n}}let Ce=null;function Ws(t){Ce=t}function Rt(){return Ce}let Xe=null;function ha(t){Xe=t}let ve=null;function ft(){return ve}let Pt=null;function xa(t){Pt=t}const Fs={login:async t=>{const s=await Me("/api/spe/auth/login",{method:"POST",headers:{"X-User":t}},"POST");if(!s.ok){const r=await s.json().catch(()=>({error:s.statusText}));throw new Error(r.error||`HTTP ${s.status}`)}const n=await s.json();return ve=n.token,n},logout:async()=>{const t=ve;if(ve=null,!!t)try{await Me("/api/spe/auth/logout",{method:"POST",headers:{Authorization:`Bearer ${t}`}},"POST")}catch{}}};let Us=!1,Gs=null;function Jt(){if(!Us){if(Us=!0,!document.getElementById("plm-reconnect-banner")){const t=document.createElement("div");t.id="plm-reconnect-banner",t.style.cssText=["position:fixed","top:0","left:0","right:0","z-index:99999","background:#b45309","color:#fff","text-align:center","padding:8px 16px","font-size:13px","font-family:monospace","letter-spacing:.02em","box-shadow:0 2px 8px rgba(0,0,0,.4)"].join(";"),t.textContent="⟳  Backend is restarting — reconnecting…",document.body.prepend(t)}Gs=setInterval(async()=>{try{(await fetch("/actuator/health",{cache:"no-store"})).ok&&(clearInterval(Gs),window.location.reload())}catch{}},3e3)}}async function Ns(t,s,n,r=!1){var c,u;const a={};ve&&(a.Authorization=`Bearer ${ve}`),Ce&&(a["X-PLM-ProjectSpace"]=Ce),n!==void 0&&(a["Content-Type"]="application/json");let o;try{o=await Me(s,{method:t,headers:a,body:n!==void 0?JSON.stringify(n):void 0},t)}catch{Jt();const d=new Error("Backend unreachable");throw Xe&&Xe(d),d}if(o.status===401&&!r&&Pt){const d=await Pt().catch(()=>null);if(d)return ve=d,Ns(t,s,n,!0)}if(!o.ok){(o.status===502||o.status===503)&&Jt();const d=await o.json().catch(()=>({error:o.statusText})),p=(c=d.violations)!=null&&c.length?d.violations.map(E=>typeof E=="string"?E:E.message).join("; "):d.error||d.message||`HTTP ${o.status}`,h=new Error(p);h.status=o.status,h.detail=d;const b=(u=d.violations)==null?void 0:u.some(E=>E==null?void 0:E.attrCode);throw Xe&&!b&&Xe(h),h}const i=await o.text();return i?JSON.parse(i):null}async function Be(t,s,n,r,{txId:a,psOverride:o}={},i=!1){var h,b;const c={"Content-Type":"application/json"};ve&&(c.Authorization=`Bearer ${ve}`);const u=o??Ce;u&&(c["X-PLM-ProjectSpace"]=u),a&&(c["X-PLM-Tx"]=a);let d;try{d=await Me(`${t}${n}`,{method:s,headers:c,body:r?JSON.stringify(r):void 0},s)}catch{Jt();const E=new Error("Backend unreachable");throw Xe&&Xe(E),E}if(d.status===401&&!i&&Pt){const E=await Pt().catch(()=>null);if(E)return ve=E,Be(t,s,n,r,{txId:a,psOverride:o},!0)}if(!d.ok){(d.status===502||d.status===503)&&Jt();const E=await d.json().catch(()=>({error:d.statusText})),R=(h=E.violations)!=null&&h.length?E.violations.map(g=>typeof g=="string"?g:g.message).join("; "):E.error||E.message||`HTTP ${d.status}`,$=new zn(d.status,R,E),f=(b=E.violations)==null?void 0:b.some(g=>g==null?void 0:g.attrCode);throw Xe&&!f&&Xe($),$}const p=await d.text();return p?JSON.parse(p):null}async function he(t,s,n,r,a={}){return Be(He("pno"),t,s,r,a)}async function ue(t,s,n,r){return Be(ct,t,s,r)}function In(t,s,n,r={}){let a=s.path.replace("{id}",n);const o=Object.entries(r).filter(([,i])=>i!=null).map(([i,c])=>`${i}=${encodeURIComponent(c)}`).join("&");return o&&(a+=`?${o}`),Ns(s.httpMethod||"GET",He(t)+a,void 0)}async function fa(t,s){var d;const n=t.create,r=He(t.serviceCode)+n.path,a=(n.httpMethod||"POST").toUpperCase(),o={};ve&&(o.Authorization=`Bearer ${ve}`),Ce&&(o["X-PLM-ProjectSpace"]=Ce);let i;if((n.bodyShape||"RAW").toUpperCase()==="MULTIPART"){const p=new FormData;for(const[h,b]of Object.entries(s||{}))b==null||b===""||p.append(h,b);i=p}else{o["Content-Type"]="application/json";const p=(n.bodyShape||"RAW").toUpperCase()==="WRAPPED"?{parameters:s||{}}:s||{};i=JSON.stringify(p)}const c=await Me(r,{method:a,headers:o,body:i},a);if(!c.ok){const p=await c.json().catch(()=>({error:c.statusText})),h=(d=p.violations)!=null&&d.length?p.violations.join("; "):p.error||p.message||`HTTP ${c.status}`,b=new Error(h);throw b.detail=p,Xe&&Xe(b),b}const u=await c.text();return u?JSON.parse(u):null}async function Ie(t,s,n,r,a){return Be(He("psm"),t,s,r,{psOverride:a})}async function Q(t,s,n,r){return Be(He("psa"),t,s,r)}function ga(t,s,n,r){return Be(He(t),s,n,r)}const mt={getStatus:async()=>Be(ct,"GET","/status"),getRegistryTags:async()=>Be(ct,"GET","/admin/registry/tags"),getEnvironment:async()=>Be(ct,"GET","/admin/environment/expected-services"),updateEnvironment:async t=>Be(ct,"PUT","/admin/environment/expected-services",{expectedServices:t}),addExpectedService:async t=>Be(ct,"POST","/admin/environment/expected-services/services",{serviceCode:t}),removeExpectedService:async t=>Be(ct,"DELETE",`/admin/environment/expected-services/services/${t}`),getNatsStatus:async()=>Be(ct,"GET","/status/nats")},Z={getMetadataKeys:(t,s)=>Q("GET",s?`/metamodel/metadata/keys/${s}`:"/metamodel/metadata/keys"),getNodeTypes:t=>Q("GET","/metamodel/nodetypes"),getVersionHistory:(t,s)=>Ie("GET",`/nodes/${s}/versions`),getVersionDiff:(t,s,n,r)=>Ie("GET",`/nodes/${s}/versions/diff?v1=${n}&v2=${r}`),createNode:(t,s,n,r,a)=>Ie("POST",`/actions/create_node/${s}`,t,{parameters:{...n,_logicalId:r||null,_externalId:a||null}}),getNodeDescription:(t,s,n,r)=>{const a=[];n&&a.push(`txId=${n}`),r&&a.push(`versionNumber=${r}`);const o=a.length?`?${a.join("&")}`:"";return Ie("GET",`/nodes/${s}/description${o}`)},updateExternalId:(t,s,n)=>Ie("PATCH",`/nodes/${s}/external-id`,t,{externalId:n}),getSignatures:(t,s)=>Ie("GET",`/nodes/${s}/signatures`),getSignatureHistory:(t,s)=>Ie("GET",`/nodes/${s}/signatures/history`),getComments:(t,s)=>Ie("GET",`/nodes/${s}/comments`),addComment:(t,s,n,r,a,o)=>Ie("POST",`/nodes/${s}/comments`,t,{nodeVersionId:n,text:r,...a?{parentCommentId:a}:{},...o?{attributeName:o}:{}}),getLinkTypes:t=>Q("GET","/metamodel/linktypes"),getNodeTypeLinkTypes:(t,s)=>Q("GET",`/metamodel/nodetypes/${s}/linktypes`),getRegistryGrouped:t=>ue("GET","/admin/registry/grouped"),getRegistryTagsAdmin:t=>ue("GET","/admin/registry/tags"),getRegistryOverview:t=>ue("GET","/admin/registry/overview"),getItems:t=>ue("GET","/items"),gatewayJson:(t,s,n)=>Ns(t,s,n),gatewayRawText:async(t,s=64*1024)=>{const n={};ve&&(n.Authorization=`Bearer ${ve}`),Ce&&(n["X-PLM-ProjectSpace"]=Ce),n.Range=`bytes=0-${s-1}`;const r=await Me(t,{method:"GET",headers:n},"GET");if(!r.ok&&r.status!==206)throw new Error(`HTTP ${r.status}`);const a=r.body.getReader(),o=[];let i=0;for(;;){const{done:E,value:R}=await a.read();if(E)break;if(R&&(o.push(R),i+=R.length),i>=s){a.cancel();break}}const c=new Uint8Array(i);let u=0;for(const E of o)c.set(E,u),u+=E.length;const d=new TextDecoder("utf-8",{fatal:!1}).decode(c),p=r.headers.get("Content-Range"),h=p&&parseInt(p.split("/")[1],10)||null,b=r.status===206||i>=s;return{text:d,truncated:b,totalBytes:h}},fetchListableItems:async(t,s,n=0,r=50)=>{var R;const a=s.list,o=s.serviceCode?He(s.serviceCode):"",i=a.path.includes("?")?"&":"?",c=a.pageParam||"page",u=a.sizeParam||"size",d=`${o}${a.path}${i}${c}=${n}&${u}=${r}`,p={};ve&&(p.Authorization=`Bearer ${ve}`),Ce&&(p["X-PLM-ProjectSpace"]=Ce);const h=await Me(d,{method:"GET",headers:p},"GET");if(!h.ok){const $=await h.json().catch(()=>({error:h.statusText})),f=(R=$.violations)!=null&&R.length?$.violations.join("; "):$.error||$.message||`HTTP ${h.status}`,g=new Error(f);throw g.detail=$,g}const b=await h.text(),E=b?JSON.parse(b):null;return ma(E,n,r)},searchNodes:async(t,s={},n={},r=["_type","*"],a=100)=>{const o=`${He("search")}/search`,i={"Content-Type":"application/json"};ve&&(i.Authorization=`Bearer ${ve}`),Ce&&(i["X-PLM-ProjectSpace"]=Ce);const c=JSON.stringify({query:t,filterTerms:s,rangeFilters:n,facetOn:r,size:a}),u=await Me(o,{method:"POST",headers:i,body:c},"POST");if(!u.ok){const d=await u.json().catch(()=>({error:u.statusText}));throw new zn(u.status,d.error||`HTTP ${u.status}`,d)}return u.json()},searchInfo:async()=>{const t=`${He("search")}/search/info`,s={};ve&&(s.Authorization=`Bearer ${ve}`);const n=await Me(t,{method:"GET",headers:s},"GET");return n.ok?n.json():{available:!1,nodeCount:0,edgeCount:0}},reindexSearch:()=>Be(He("psm"),"POST","/nodes/internal/search/reindex",{}),searchChildren:async t=>{const s=`${He("search")}/search/children/${encodeURIComponent(t)}`,n={};ve&&(n.Authorization=`Bearer ${ve}`),Ce&&(n["X-PLM-ProjectSpace"]=Ce);const r=await Me(s,{method:"GET",headers:n},"GET");if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()},getSources:t=>Ie("GET","/sources"),getSourceKeys:(t,s,n,r="",a=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),r&&o.set("q",r),o.set("limit",String(a)),Ie("GET",`/sources/${encodeURIComponent(s)}/keys?${o.toString()}`)},getChildLinks:(t,s)=>Ie("GET",`/nodes/${s}/links/children`),getParentLinks:(t,s)=>Ie("GET",`/nodes/${s}/links/parents`),getLifecycles:t=>Q("GET","/metamodel/lifecycles"),getLifecycleStates:(t,s)=>Q("GET",`/metamodel/lifecycles/${s}/states`),getLifecycleTransitions:(t,s)=>Q("GET",`/metamodel/lifecycles/${s}/transitions`),createLifecycle:(t,s)=>Q("POST","/metamodel/lifecycles",t,s),duplicateLifecycle:(t,s,n)=>Q("POST",`/metamodel/lifecycles/${s}/duplicate`,t,{name:n}),deleteLifecycle:(t,s)=>Q("DELETE",`/metamodel/lifecycles/${s}`),addLifecycleState:(t,s,n)=>Q("POST",`/metamodel/lifecycles/${s}/states`,t,n),updateLifecycleState:(t,s,n,r)=>Q("PUT",`/metamodel/lifecycles/${s}/states/${n}`,t,r),deleteLifecycleState:(t,s,n)=>Q("DELETE",`/metamodel/lifecycles/${s}/states/${n}`),listLifecycleStateActions:(t,s,n)=>Q("GET",`/metamodel/lifecycles/${s}/states/${n}/actions`),attachLifecycleStateAction:(t,s,n,r,a,o,i=0)=>Q("POST",`/metamodel/lifecycles/${s}/states/${n}/actions`,t,{instanceId:r,trigger:a,executionMode:o,displayOrder:i}),detachLifecycleStateAction:(t,s,n,r)=>Q("DELETE",`/metamodel/lifecycles/${s}/states/${n}/actions/${r}`),addLifecycleTransition:(t,s,n)=>Q("POST",`/metamodel/lifecycles/${s}/transitions`,t,n),updateLifecycleTransition:(t,s,n,r)=>Q("PUT",`/metamodel/lifecycles/${s}/transitions/${n}`,t,r),deleteLifecycleTransition:(t,s,n)=>Q("DELETE",`/metamodel/lifecycles/${s}/transitions/${n}`),addTransitionSignatureRequirement:(t,s,n,r=0)=>Q("POST",`/metamodel/transitions/${s}/signature-requirements`,t,{roleId:n,displayOrder:r}),removeTransitionSignatureRequirement:(t,s,n)=>Q("DELETE",`/metamodel/transitions/${s}/signature-requirements/${n}`),deleteNodeType:(t,s)=>Q("DELETE",`/metamodel/nodetypes/${s}`),updateNodeTypeIdentity:(t,s,n)=>Q("PUT",`/metamodel/nodetypes/${s}/identity`,t,n),updateNodeTypeNumberingScheme:(t,s,n)=>Q("PUT",`/metamodel/nodetypes/${s}/numbering-scheme`,t,{numberingScheme:n}),updateNodeTypeVersionPolicy:(t,s,n)=>Q("PUT",`/metamodel/nodetypes/${s}/version-policy`,t,{versionPolicy:n}),updateNodeTypeCollapseHistory:(t,s,n)=>Q("PUT",`/metamodel/nodetypes/${s}/collapse-history`,t,{collapseHistory:n}),updateNodeTypeLifecycle:(t,s,n)=>Q("PUT",`/metamodel/nodetypes/${s}/lifecycle`,t,{lifecycleId:n||null}),updateNodeTypeAppearance:(t,s,n,r)=>Q("PUT",`/metamodel/nodetypes/${s}/appearance`,t,{color:n||null,icon:r||null}),updateAttribute:(t,s,n,r)=>Q("PUT",`/metamodel/nodetypes/${s}/attributes/${n}`,t,r),deleteAttribute:(t,s,n)=>Q("DELETE",`/metamodel/nodetypes/${s}/attributes/${n}`),updateLinkType:(t,s,n)=>Q("PUT",`/metamodel/linktypes/${s}`,t,n),deleteLinkType:(t,s)=>Q("DELETE",`/metamodel/linktypes/${s}`),getLinkTypeAttributes:(t,s)=>Q("GET",`/metamodel/linktypes/${s}/attributes`),createLinkTypeAttribute:(t,s,n)=>Q("POST",`/metamodel/linktypes/${s}/attributes`,t,n),updateLinkTypeAttribute:(t,s,n,r)=>Q("PUT",`/metamodel/linktypes/${s}/attributes/${n}`,t,r),deleteLinkTypeAttribute:(t,s,n)=>Q("DELETE",`/metamodel/linktypes/${s}/attributes/${n}`),getLinkTypeCascades:(t,s)=>Q("GET",`/metamodel/linktypes/${s}/cascades`),createLinkTypeCascade:(t,s,n,r,a)=>Q("POST",`/metamodel/linktypes/${s}/cascades`,t,{parentTransitionId:n,childFromStateId:r,childTransitionId:a}),deleteLinkTypeCascade:(t,s,n)=>Q("DELETE",`/metamodel/linktypes/${s}/cascades/${n}`),getNodeTypeAttributes:(t,s)=>Q("GET",`/metamodel/nodetypes/${s}/attributes`),createNodeType:(t,s)=>Q("POST","/metamodel/nodetypes",t,s),updateNodeTypeParent:(t,s,n)=>Q("PUT",`/metamodel/nodetypes/${s}/parent`,t,{parentNodeTypeId:n||null}),createAttribute:(t,s,n)=>Q("POST",`/metamodel/nodetypes/${s}/attributes`,t,n),createLinkType:(t,s)=>Q("POST","/metamodel/linktypes",t,s),getSourcesAdmin:t=>Q("GET","/sources"),getSourceResolversAdmin:t=>Q("GET","/sources/resolvers"),createSource:(t,s)=>Q("POST","/sources",t,s),updateSource:(t,s,n)=>Q("PUT",`/sources/${s}`,t,n),deleteSource:(t,s)=>Q("DELETE",`/sources/${s}`),getImportContexts:()=>Q("GET","/admin/import-contexts"),createImportContext:t=>Q("POST","/admin/import-contexts",null,t),updateImportContext:(t,s)=>Q("PUT",`/admin/import-contexts/${t}`,null,s),deleteImportContext:t=>Q("DELETE",`/admin/import-contexts/${t}`),getImportAlgorithmInstances:()=>Q("GET","/admin/import-contexts/algorithm-instances/import"),getValidationAlgorithmInstances:()=>Q("GET","/admin/import-contexts/algorithm-instances/validation"),getSources:t=>Ie("GET","/sources"),getSourceTypes:(t,s)=>Ie("GET",`/sources/${s}/types`),suggestSourceKeys:(t,s,n,r,a=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),r&&o.set("q",r),o.set("limit",String(a)),Ie("GET",`/sources/${s}/keys?${o.toString()}`)},getAllActions:t=>Q("GET","/metamodel/actions"),getActionsForNodeType:(t,s)=>Q("GET",`/metamodel/nodetypes/${s}/actions`),registerCustomAction:(t,s)=>Q("POST","/metamodel/actions",t,s),getPermissionGrants:(t,s,n,r)=>he("GET",`/nodetypes/${s}/permissions/${n}${r?`?transitionId=${encodeURIComponent(r)}`:""}`),addPermissionGrant:(t,s,n,r,a)=>he("POST",`/nodetypes/${s}/permissions/${n}`,t,{roleId:r,transitionId:a||null}),removePermissionGrant:(t,s,n,r,a)=>he("DELETE",`/nodetypes/${s}/permissions/${n}`,t,{roleId:r,transitionId:a||null}),getDomains:t=>Q("GET","/domains"),createDomain:(t,s)=>Q("POST","/domains",t,s),updateDomain:(t,s,n)=>Q("PUT",`/domains/${s}`,t,n),deleteDomain:(t,s)=>Q("DELETE",`/domains/${s}`),getDomainAttributes:(t,s)=>Q("GET",`/domains/${s}/attributes`),createDomainAttribute:(t,s,n)=>Q("POST",`/domains/${s}/attributes`,t,n),updateDomainAttribute:(t,s,n,r)=>Q("PUT",`/domains/${s}/attributes/${n}`,t,r),deleteDomainAttribute:(t,s,n)=>Q("DELETE",`/domains/${s}/attributes/${n}`),getEnums:t=>Q("GET","/enums"),getEnumDetail:(t,s)=>Q("GET",`/enums/${s}`),createEnum:(t,s)=>Q("POST","/enums",t,s),updateEnum:(t,s,n)=>Q("PUT",`/enums/${s}`,t,n),deleteEnum:(t,s)=>Q("DELETE",`/enums/${s}`),getEnumValues:(t,s)=>Q("GET",`/enums/${s}/values`),addEnumValue:(t,s,n)=>Q("POST",`/enums/${s}/values`,t,n),updateEnumValue:(t,s,n,r)=>Q("PUT",`/enums/${s}/values/${n}`,t,r),deleteEnumValue:(t,s,n)=>Q("DELETE",`/enums/${s}/values/${n}`),reorderEnumValues:(t,s,n)=>Q("PUT",`/enums/${s}/values/reorder`,t,n),listBaselines:t=>Ie("GET","/baselines"),createBaseline:(t,s,n,r)=>Ie("POST","/baselines",t,{userId:t,rootNodeId:s,name:n,description:r}),getBaselineContent:(t,s)=>Ie("GET",`/baselines/${s}/content`),getRoles:t=>he("GET","/roles"),createRole:(t,s,n)=>he("POST","/roles",t,{name:s,description:n}),updateRole:(t,s,n,r)=>he("PUT",`/roles/${s}`,t,{name:n,description:r}),deleteRole:(t,s)=>he("DELETE",`/roles/${s}`),listProjectSpaces:t=>he("GET",`/project-spaces${t?`?userId=${encodeURIComponent(t)}`:""}`),createProjectSpace:(t,s,n)=>he("POST","/project-spaces",t,{name:s,description:n}),deactivateProjectSpace:(t,s)=>he("DELETE",`/project-spaces/${s}`),getProjectSpaceServiceTags:(t,s)=>he("GET",`/project-spaces/${s}/service-tags`),setProjectSpaceServiceTags:(t,s,n,r)=>he("PUT",`/project-spaces/${s}/service-tags/${n}`,t,{tags:r}),setProjectSpaceIsolated:(t,s,n)=>he("PUT",`/project-spaces/${s}/isolated`,t,{isolated:n}),listUsers:t=>he("GET","/users"),getUser:(t,s)=>he("GET",`/users/${s}`),updateUser:(t,s,n,r)=>he("PUT",`/users/${s}`,t,{displayName:n,email:r}),createUser:(t,s,n,r)=>he("POST","/users",t,{username:s,displayName:n,email:r}),deactivateUser:(t,s)=>he("DELETE",`/users/${s}`),getUserRoles:(t,s,n)=>he("GET",`/users/${s}/roles${n?`?projectSpaceId=${encodeURIComponent(n)}`:""}`),assignRole:(t,s,n,r)=>he("POST",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(r)}`),removeRole:(t,s,n,r)=>he("DELETE",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(r)}`),setUserAdmin:(t,s,n)=>he("PUT",`/users/${s}/admin`,t,{isAdmin:n}),getUserContext:(t,s)=>he("GET",`/users/${t}/context${s?`?projectSpaceId=${encodeURIComponent(s)}`:""}`),getDashboardTransaction:t=>Ie("GET","/dashboard/transaction"),getDashboardWorkItems:t=>Ie("GET","/dashboard/workitems"),listPermissions:t=>he("GET","/permissions"),createPermission:(t,s,n,r,a,o)=>he("POST","/permissions",t,{permissionCode:s,scope:n,displayName:r,description:a,displayOrder:o}),updatePermission:(t,s,n,r,a)=>he("PUT",`/permissions/${s}`,t,{displayName:n,description:r,displayOrder:a}),getRolePolicies:(t,s)=>he("GET",`/roles/${s}/policies`),listGlobalActions:t=>he("GET","/global-actions"),getMyGlobalPermissions:t=>he("GET","/my-global-permissions"),getSettingsSections:t=>ue("GET","/sections"),getUiManifest:()=>ue("GET","/ui/manifest"),createResource:(t,s)=>fa(t,s),getRoleGlobalPermissions:(t,s)=>he("GET",`/roles/${s}/global-permissions`),addRoleGlobalPermission:(t,s,n)=>he("POST",`/roles/${s}/global-permissions`,t,{permissionCode:n}),removeRoleGlobalPermission:(t,s,n)=>he("DELETE",`/roles/${s}/global-permissions/${n}`),getRoleScopePermissions:(t,s,n)=>he("GET",`/roles/${s}/scope-permissions/${n}`),addRoleScopePermission:(t,s,n,r)=>he("POST",`/roles/${s}/scope-permissions/${n}`,t,{permissionCode:r}),removeRoleScopePermission:(t,s,n,r)=>he("DELETE",`/roles/${s}/scope-permissions/${n}/${r}`),getAccessRightsTree:(t,s)=>he("GET",`/access-rights/tree${s?`?projectSpaceId=${s}`:""}`),getGrantsForRoleAndScope:(t,s,n)=>he("GET",`/access-rights/roles/${s}/grants?scopeCode=${n}`),addScopedGrant:(t,s)=>he("POST","/access-rights/grants",t,s),removeScopedGrant:(t,s)=>he("DELETE","/access-rights/grants",t,s),listSecrets:t=>ue("GET","/admin/secrets"),revealSecret:(t,s)=>ue("GET",`/admin/secrets/${encodeURIComponent(s)}`),createSecret:(t,s,n)=>ue("POST","/admin/secrets",t,{key:s,value:n}),updateSecret:(t,s,n)=>ue("PUT",`/admin/secrets/${encodeURIComponent(s)}`,t,{value:n}),deleteSecret:(t,s)=>ue("DELETE",`/admin/secrets/${encodeURIComponent(s)}`),listAllInstances:t=>ue("GET","/algorithms/instances"),listTransitionGuards:(t,s)=>Q("GET",`/metamodel/lifecycles/transitions/${s}/guards`),attachTransitionGuard:(t,s,n,r,a)=>Q("POST",`/metamodel/lifecycles/transitions/${s}/guards`,t,{instanceId:n,effect:r,displayOrder:a}),updateTransitionGuard:(t,s,n)=>Q("PUT",`/metamodel/lifecycles/transitions/guards/${s}`,t,{effect:n}),detachTransitionGuard:(t,s)=>Q("DELETE",`/metamodel/lifecycles/transitions/guards/${s}`)},Ee={listActions:(t,s)=>ue("GET",`/actions${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAction:(t,s)=>ue("GET",`/actions/${s}`),createAction:(t,s)=>ue("POST","/actions",t,s),updateAction:(t,s,n)=>ue("PUT",`/actions/${s}`,t,n),deleteAction:(t,s)=>ue("DELETE",`/actions/${s}`),listParameters:(t,s)=>ue("GET",`/actions/${s}/parameters`),addParameter:(t,s,n)=>ue("POST",`/actions/${s}/parameters`,t,n),listActionGuards:(t,s)=>ue("GET",`/actions/${s}/guards`),attachActionGuard:(t,s,n,r,a)=>ue("POST",`/actions/${s}/guards`,t,{instanceId:n,effect:r,displayOrder:a}),updateActionGuard:(t,s,n,r)=>ue("PUT",`/actions/${s}/guards/${n}`,t,{effect:r}),detachActionGuard:(t,s,n)=>ue("DELETE",`/actions/${s}/guards/${n}`),listAlgorithmTypes:(t,s)=>ue("GET",`/algorithms/types${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithms:(t,s)=>ue("GET",`/algorithms${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithmParameters:(t,s)=>ue("GET",`/algorithms/${s}/parameters`),listAllInstances:(t,s)=>ue("GET",`/algorithms/instances${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),createInstance:(t,s,n,r)=>ue("POST","/algorithms/instances",t,{algorithmId:s,name:n,serviceCode:r}),updateInstance:(t,s,n)=>ue("PUT",`/algorithms/instances/${s}`,t,{name:n}),deleteInstance:(t,s)=>ue("DELETE",`/algorithms/instances/${s}`),getInstanceParams:(t,s)=>ue("GET",`/algorithms/instances/${s}/params`),setInstanceParam:(t,s,n,r)=>ue("PUT",`/algorithms/instances/${s}/params/${n}`,t,{value:r}),getAlgorithmStats:(t,s)=>ue("GET",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAlgorithmTimeseries:(t,s=24,n)=>ue("GET",`/algorithms/stats/timeseries?hours=${s}${n?`&serviceCode=${encodeURIComponent(n)}`:""}`),resetAlgorithmStats:(t,s)=>ue("DELETE",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listActionWrappers:(t,s)=>ue("GET",`/algorithms/actions/${s}/wrappers`),attachActionWrapper:(t,s,n,r,a)=>ue("POST",`/algorithms/actions/${s}/wrappers`,t,{instanceId:n,executionOrder:r,serviceCode:a}),detachActionWrapper:(t,s,n)=>ue("DELETE",`/algorithms/actions/${s}/wrappers/${n}`),getRegisteredServices:()=>ue("GET","/algorithms/services"),getServiceCatalog:t=>ue("GET","/registry/actions").then(s=>{var n;return((n=s==null?void 0:s.services)==null?void 0:n[t])||{handlers:[],guards:[]}})},ht={open:(t,s,n="psm")=>ue("POST",`/transactions/${n}`),current:async t=>{const s=await ue("GET","/transactions?status=OPEN");return Array.isArray(s)&&s.length>0?s[0]:null},commit:(t,s,n,r,a)=>ue("POST",`/transactions/${s}/${n}/commit`,null,{comment:r,...a!=null&&a.length?{itemIds:a}:{}}),release:(t,s,n,r)=>ue("DELETE",`/transactions/${s}/${n}/items`,null,{itemIds:r}),rollback:(t,s,n)=>ue("POST",`/transactions/${s}/${n}/rollback`),get:(t,s,n)=>ue("GET",`/transactions/${s}/${n}`),nodes:async(t,s,n)=>{const r=await ue("GET",`/transactions/${s}/${n}`);return(r==null?void 0:r.items)||[]},versions:(t,s)=>Ie("GET",`/transactions/${s}/versions`)};async function Hs(t,s,n,r,a){return Be(He("psm"),t,s,a,{txId:r})}async function Cs(t,s){const n={"Content-Type":"application/json"};ve&&(n.Authorization=`Bearer ${ve}`),Ce&&(n["X-PLM-ProjectSpace"]=Ce);const r=await Me(`/api/${t}${s}`,{method:"GET",headers:n},"GET");if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}const ba={submitImport:async(t,s,n,r)=>{const a={};ve&&(a.Authorization=`Bearer ${ve}`),Ce&&(a["X-PLM-ProjectSpace"]=Ce);const o=new FormData;o.append("file",t),n&&o.append("contextCode",n);const i=r?await Mt(`/api/psm/cad/import/${s}`,"POST",a,o,r):await Me(`/api/psm/cad/import/${s}`,{method:"POST",headers:a,body:o},"POST");if(!i.ok){const c=await i.text();throw new Error(`HTTP ${i.status}: ${c}`)}return i.json()},getJobStatus:async t=>{const s={"Content-Type":"application/json"};ve&&(s.Authorization=`Bearer ${ve}`),Ce&&(s["X-PLM-ProjectSpace"]=Ce);const n=await Me(`/api/psm/cad/jobs/${t}`,{method:"GET",headers:s},"GET");if(!n.ok)throw new Error(`HTTP ${n.status}`);return n.json()},getImportContexts:async()=>{const t={"Content-Type":"application/json"};ve&&(t.Authorization=`Bearer ${ve}`),Ce&&(t["X-PLM-ProjectSpace"]=Ce);const s=await Me("/api/psm/cad/import-contexts",{method:"GET",headers:t},"GET");return s.ok?s.json():[]}},va={executeAction:(t,s,n,r,a,o)=>{const i=o?`/actions/${s}/${t}/${o}`:`/actions/${s}/${t}`;return Hs("POST",i,n,r,{parameters:a||{}})},executeViaDescriptor:async(t,s,n,r,a,o)=>{var u;const i=(t.path||"").replace("{id}",s).replace("{transitionId}",((u=t.metadata)==null?void 0:u.transitionId)||""),c=t.httpMethod||"POST";if(t.bodyShape==="MULTIPART"){const d=new FormData;for(const[E,R]of Object.entries(a||{}))R!=null&&d.append(E,R);const p={};ve&&(p.Authorization=`Bearer ${ve}`),Ce&&(p["X-PLM-ProjectSpace"]=Ce),r&&(p["X-PLM-Tx"]=r);const h=o?await Mt("/api/psm"+i,c,p,d,o):await Me("/api/psm"+i,{method:c,headers:p,body:d},c);if(!h.ok){const E=await h.text();throw new Error(`HTTP ${h.status}: ${E}`)}const b=await h.text();return b?JSON.parse(b):null}return Hs(c,i,n,r,{parameters:a||{}})}},Ct={list:t=>he("GET",`/users/${encodeURIComponent(t)}/basket`),add:(t,s,n,r)=>he("PUT",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(r)}`),remove:(t,s,n,r)=>he("DELETE",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(r)}`),clear:t=>he("DELETE",`/users/${encodeURIComponent(t)}/basket`)},An={getSingle:(t,s,n)=>he("GET",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}`,void 0,void 0,{psOverride:""}),setSingle:(t,s,n,r)=>he("PUT",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}/${encodeURIComponent(r)}`,void 0,void 0,{psOverride:""})},ae=gn((t,s)=>({userId:null,setUserId:n=>t({userId:n}),projectSpaceId:null,setProjectSpaceId:n=>t({projectSpaceId:n}),items:[],nodeTypes:[],resources:[],itemsStatus:"idle",refreshItems:async()=>{const{userId:n}=s();if(n){t({itemsStatus:"loading"});try{const r=await Z.getItems(n),a=Array.isArray(r)?r:[],o=a.filter(c=>c.serviceCode==="psm"&&c.list).map(c=>({id:c.itemCode,name:c.displayName,description:c.description,color:c.color,icon:c.icon})),i=a.filter(c=>c.create);t({items:a,nodeTypes:o,resources:i,itemsStatus:"loaded"})}catch{t({items:[],nodeTypes:[],resources:[],itemsStatus:"idle"})}}},stateColorMap:{},stateColorMapLoaded:!1,refreshStateColorMap:async()=>{const{userId:n}=s();if(n)try{const r=await Z.getLifecycles(n);if(!Array.isArray(r))return;const a=await Promise.all(r.map(i=>Z.getLifecycleStates(n,i.id||i.ID).catch(()=>[]))),o={};a.forEach(i=>i.forEach(c=>{const u=c.id||c.ID,d=c.color||c.COLOR;u&&d&&(o[u]=d)})),t({stateColorMap:o,stateColorMapLoaded:!0})}catch{}},projectSpaces:[],users:[],refreshProjectSpaces:async()=>{const{userId:n}=s();if(n)try{const r=await Z.listProjectSpaces(n);t({projectSpaces:Array.isArray(r)?r:[]})}catch{}},refreshUsers:async()=>{const{userId:n}=s();if(n)try{const r=await Z.listUsers(n);t({users:Array.isArray(r)?r.filter(a=>a.active!==!1):[]})}catch{}},nodes:[],refreshNodes:async()=>{const{userId:n,items:r}=s();if(n)try{const a=r.filter(i=>i.serviceCode==="psm"&&i.list),o=await Promise.all(a.map(i=>Z.fetchListableItems(n,i,0,50).then(c=>c.items||[]).catch(()=>[])));t({nodes:o.flat()})}catch{}},activeTx:null,txNodes:[],lockedByMe:new Set,lockItem:n=>t(r=>{const a=new Set(r.lockedByMe);return a.add(n),{lockedByMe:a}}),unlockItem:n=>t(r=>{const a=new Set(r.lockedByMe);return a.delete(n),{lockedByMe:a}}),unlockAll:()=>t({lockedByMe:new Set}),refreshTx:async()=>{const{userId:n}=s();if(n)try{const r=await ht.current(n);if(r){const a=await ht.nodes(n,r.serviceCode,r.txId).catch(()=>[]),o=Array.isArray(a)?a:[],i=new Set(o.map(c=>c.itemId).filter(Boolean));t({activeTx:r,txNodes:o,lockedByMe:i})}else t({activeTx:null,txNodes:[],lockedByMe:new Set})}catch{t({activeTx:null,txNodes:[],lockedByMe:new Set})}},clearTx:()=>t({activeTx:null,txNodes:[],lockedByMe:new Set}),refreshAll:async()=>{const{refreshItems:n,refreshTx:r}=s();await Promise.all([n(),r()])},basketItems:{},basketLoaded:!1,loadBasket:async n=>{if(n)try{const r=await Ct.list(n),a={};(r||[]).forEach(({source:o,typeCode:i,itemId:c})=>{const u=`${o}:${i}`;a[u]||(a[u]=new Set),a[u].add(c)}),t({basketItems:a,basketLoaded:!0})}catch{t({basketItems:{},basketLoaded:!0})}},addToBasket:async(n,r,a,o)=>{const i=`${r}:${a}`;t(c=>{const u=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return u.add(o),{basketItems:{...c.basketItems,[i]:u}}});try{await Ct.add(n,r,a,o)}catch{}},removeFromBasket:async(n,r,a,o)=>{const i=`${r}:${a}`;t(c=>{const u=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return u.delete(o),{basketItems:{...c.basketItems,[i]:u}}});try{await Ct.remove(n,r,a,o)}catch{}},emptyBasket:async n=>{const{lockedByMe:r,basketItems:a}=s(),o=new Set(r);if(![...Object.entries(a)].some(([d,p])=>d.startsWith("psm:")&&[...p].some(h=>o.has(h)))){t({basketItems:{}});try{await Ct.clear(n)}catch{}return}const c={},u=[];for(const[d,p]of Object.entries(a)){const h=d.indexOf(":"),b=h>-1?d.slice(0,h):d,E=h>-1?d.slice(h+1):"",R=new Set;for(const $ of p){if(b==="psm"&&o.has($)){R.add($);continue}u.push(Ct.remove(n,b,E,$).catch(()=>{}))}R.size>0&&(c[d]=R)}t({basketItems:c}),await Promise.all(u)},isInBasket:(n,r,a)=>{const o=`${n}:${r}`,{basketItems:i}=ae.getState();return!!(i[o]&&i[o].has(a))},syncBasketAdd:(n,r)=>t(a=>{const o=a.basketItems[n]?new Set(a.basketItems[n]):new Set;return o.add(r),{basketItems:{...a.basketItems,[n]:o}}}),syncBasketRemove:(n,r)=>t(a=>{if(!a.basketItems[n])return{};const o=new Set(a.basketItems[n]);return o.delete(r),{basketItems:{...a.basketItems,[n]:o}}}),syncBasketClear:()=>t({basketItems:{}}),removeBasketItemIds:n=>t(r=>{const a=new Set(n),o={};for(const[i,c]of Object.entries(r.basketItems)){const u=new Set([...c].filter(d=>!a.has(d)));u.size>0&&(o[i]=u)}return{basketItems:o}}),_slices:{},_sliceActions:{}})),$n="plm-theme",Rn="UI_PREF";function xs(t){return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function fs(t){document.documentElement.setAttribute("data-theme",t)}function Xt(){return localStorage.getItem($n)||"dark"}function Es(t){localStorage.setItem($n,t),fs(xs(t))}async function ya(t){try{const s=await An.getSingle(t,Rn,"theme");s!=null&&s.value&&Es(s.value)}catch{}}async function ja(t,s){try{await An.setSingle(t,Rn,"theme",s)}catch{}}function wa(){const t=Xt();fs(xs(t)),window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{Xt()==="system"&&fs(xs("system"))})}const be=gn(t=>({showCollab:!1,collabWidth:320,collabVersionFilter:null,collabTriggerText:null,collabTabs:[],toggleCollab:()=>t(s=>({showCollab:!s.showCollab})),openCollab:()=>t({showCollab:!0}),closeCollab:()=>t({showCollab:!1}),setCollabWidth:s=>t({collabWidth:s}),setVersionFilter:s=>t({collabVersionFilter:s}),setTriggerText:s=>t({collabTriggerText:s}),clearTriggerText:()=>t({collabTriggerText:null}),addCollabTab:(s,n,r)=>t(a=>({collabTabs:a.collabTabs.some(o=>o.id===s)?a.collabTabs:[...a.collabTabs,{id:s,label:n,Component:r}]})),removeCollabTab:s=>t(n=>({collabTabs:n.collabTabs.filter(r=>r.id!==s)})),consoleVisible:!1,consoleHeight:220,consoleTabs:[],consoleLog:[],toggleConsole:()=>t(s=>({consoleVisible:!s.consoleVisible})),openConsole:()=>t({consoleVisible:!0}),setConsoleHeight:s=>t({consoleHeight:s}),addConsoleTab:(s,n,r)=>t(a=>({consoleTabs:a.consoleTabs.some(o=>o.id===s)?a.consoleTabs:[...a.consoleTabs,{id:s,label:n,Component:r}]})),removeConsoleTab:s=>t(n=>({consoleTabs:n.consoleTabs.filter(r=>r.id!==s)})),appendLog:(s,n)=>t(r=>({consoleLog:[...r.consoleLog.slice(-500),{level:s,message:n,ts:Date.now()}]})),statusSlots:[],registerStatus:(s,n,r="left")=>t(a=>({statusSlots:a.statusSlots.some(o=>o.id===s)?a.statusSlots.map(o=>o.id===s?{id:s,Component:n,position:r}:o):[...a.statusSlots,{id:s,Component:n,position:r}]})),unregisterStatus:s=>t(n=>({statusSlots:n.statusSlots.filter(r=>r.id!==s)})),bgJobs:[],registerBgJob:(s,n,r)=>t(a=>({bgJobs:a.bgJobs.some(o=>o.id===s)?a.bgJobs.map(o=>o.id===s?{...o,label:n,onOpen:r}:o):[...a.bgJobs,{id:s,label:n,status:"running",onOpen:r}]})),updateBgJob:(s,n)=>t(r=>({bgJobs:r.bgJobs.map(a=>a.id===s?{...a,status:n}:a)})),removeBgJob:s=>t(n=>({bgJobs:n.bgJobs.filter(r=>r.id!==s)})),_wsListeners:new Set,fireWsEvent:s=>{be.getState()._wsListeners.forEach(n=>n(s))},subscribeWsEvent:s=>(be.getState()._wsListeners.add(s),()=>be.getState()._wsListeners.delete(s))}));function Et(t,s){be.getState().appendLog(t,s)}function ka(t){if(!t.event)return`[WS] (unknown) ${JSON.stringify(t)}`;const s=[t.event];return t.byUser&&s.push(`by ${t.byUser}`),(t.nodeId||t.itemId)&&s.push(`node=${t.nodeId||t.itemId}`),t.userId&&s.push(`user=${t.userId}`),t.entity&&s.push(t.entity),t.status&&s.push(t.status),t.jobId&&s.push(`job=${t.jobId}`),`[WS] ${s.join(" · ")}`}function Pn(t,s,n,r){const a=l.useRef(s);a.current=s;const o=l.useRef(r);o.current=r;const i=l.useRef(null),c=Array.isArray(t)?t:t?[t]:[],u=c.join("\0");l.useEffect(()=>{if(c.length===0)return;let d=null,p=null,h=1e3,b=!1;function E($){const f=o.current;f&&$&&$.readyState===WebSocket.OPEN&&$.send(JSON.stringify({type:"subscribe",projectSpaceId:f}))}function R(){if(b)return;const $=ft(),f=location.protocol==="https:"?"wss:":"ws:",g=$?`${f}//${location.host}/api/ws/?token=${encodeURIComponent($)}`:`${f}//${location.host}/api/ws/`;d=new WebSocket(g),i.current=d,d.onopen=()=>{h=1e3,Et("debug","[WS] connected"),E(d)},d.onmessage=m=>{try{const j=JSON.parse(m.data);Et("info",ka(j)),a.current(j),be.getState().fireWsEvent(j)}catch(j){console.warn("WS parse error",j),Et("warn",`[WS] parse error: ${j.message}`)}},d.onclose=m=>{i.current=null,!b&&(Et("warn",`[WS] disconnected — reconnecting in ${h}ms`),p=setTimeout(()=>{h=Math.min(h*2,3e4),R()},h))},d.onerror=()=>{Et("warn","[WS] connection error")}}return R(),()=>{b=!0,i.current=null,p&&clearTimeout(p),d&&(d.onclose=null,d.close())}},[u,n]),l.useEffect(()=>{const d=i.current;d&&d.readyState===WebSocket.OPEN&&r&&d.send(JSON.stringify({type:"subscribe",projectSpaceId:r}))},[r])}const qe={Box:Rr,Package:Sn,Cpu:Ss,Wrench:$r,Cog:Ar,Database:kn,Globe:wn,BookOpen:jn,Clipboard:Ir,Tag:zr,FolderOpen:Tr,Archive:Er,Zap:ks,FlaskConical:Cr,Microscope:Nr,Layers:Zt,FileText:Sr,GitBranch:yn,Hexagon:Bt,Circle:kr,Users:vn,Shield:gt,Award:bn,LayoutDashboard:wr,Component:jr,Blocks:yr,Cable:vr,Gauge:br,Radio:gr,Scan:fr},Sa={user:Qt,layers:Zt,database:kn,list:Or,lifecycle:yn,plug:Mr,hexagon:Bt,users:vn,shield:gt,cpu:Ss,workflow:Nn,key:Br,network:Lr,globe:wn,terminal:Pr,book:jn,zap:ks,package:Sn},Ot=Object.freeze({serviceCode:"psm",get:Object.freeze({httpMethod:"GET",path:"/nodes/{id}/description"})}),Nt=[];function gs(t){if(!t||!t.match||!t.match.serviceCode)throw new Error("Plugin requires match.serviceCode");const s=(t.match.itemKey?4:0)+(t.match.itemCode?2:0)+(t.match.serviceCode==="*"?0:1);t._specificity=s,Nt.push(t),Nt.sort((n,r)=>(r._specificity||0)-(n._specificity||0))}function Ln(t,s){const n=t.match;return!(n.serviceCode!=="*"&&n.serviceCode!==s.serviceCode||n.itemCode&&n.itemCode!==s.itemCode||n.itemKey&&n.itemKey!==s.itemKey)}function Yt(t){for(const s of Nt)if(Ln(s,t||{}))return s;return Lt}function Na(t){if(!t)return Lt;for(const s of Nt)if(Ln(s,t))return s;return Lt}let Lt={match:{serviceCode:"*"},name:"default",hasItemChildren:()=>!1};function Ca(t){Lt={...Lt,...t,match:{serviceCode:"*"}}}function Ea(t){for(const s of Nt)if(s.LinkRow&&(s.match.serviceCode==="*"||s.match.serviceCode===t))return s.LinkRow;return null}function Vs(t,s,n){const r=Nt.find(a=>a.match.serviceCode===t&&(!s||a.match.itemCode===s));r?Object.assign(r,n):gs({match:{serviceCode:t,itemCode:s},...n})}function Ta(t){return!t||t.id==="dashboard"||!t.nodeId?null:{source:t.serviceCode||"",type:t.itemCode||"",key:t.nodeId}}function as(t){return`${t.serviceCode}:${t.itemCode||""}`}function za(t,s){return t.serviceCode===s.source&&t.itemCode===s.type}function Bn(t){if(!t)return null;const s={id:t.id,_title:t.title};t.itemType&&(s._serviceCode=t.itemType.serviceCode,s._itemCode=t.itemType.itemCode,s._itemKey=t.itemType.itemKey??null);for(const n of t.values??t.fields??[])s[n.name]=n.value;return s}function Mn({descriptor:t,item:s,ctx:n,isActive:r,isOpen:a,isPinned:o,hasChildren:i,isExpanded:c,isLoading:u,onToggleExpand:d,onToggleChildren:p,onPin:h,onUnpin:b}){var _,G,K,B,P;const E=d||p,R=Yt(t),$=R==null?void 0:R.NavLabel,f=((_=R==null?void 0:R.getRowProps)==null?void 0:_.call(R,s,t,n))??{},g=((K=(G=t.list)==null?void 0:G.itemShape)==null?void 0:K.idField)||"id",m=((P=(B=t.list)==null?void 0:B.itemShape)==null?void 0:P.labelField)||"_title",j=(s==null?void 0:s[g])||(s==null?void 0:s.id)||(s==null?void 0:s.ID),x=(s==null?void 0:s[m])||(s==null?void 0:s._title)||j,k=t.icon?qe[t.icon]:null;return e.jsxs("div",{className:`node-item${r?" active":""}`,onClick:()=>n.onNavigate(j,x,t),title:f.title??x,...f,children:[e.jsx("span",{className:"ni-expand",style:{visibility:u||i?"visible":"hidden"},onClick:S=>{S.stopPropagation(),E==null||E(S)},children:u?e.jsx("span",{style:{fontSize:9,color:"var(--muted)",lineHeight:1},children:"…"}):c?e.jsx(Ve,{size:9,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Ue,{size:9,strokeWidth:2.5,color:"var(--muted)"})}),k?e.jsx(k,{size:11,color:t.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):t.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:t.color,flexShrink:0,display:"inline-block"}}):null,a&&!o&&e.jsx("span",{title:"Open",style:{width:5,height:5,borderRadius:"50%",background:"var(--accent)",flexShrink:0,display:"inline-block"}}),$?e.jsx($,{item:s,descriptor:t,ctx:n}):e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:x||j}),(h||b)&&e.jsx("button",{className:`search-pin-btn${o?" pinned":""}`,title:o?"Remove from basket":"Add to basket",onClick:S=>{S.stopPropagation(),o?b==null||b():h==null||h()},children:o?e.jsx(es,{size:11,strokeWidth:2}):e.jsx(ts,{size:11,strokeWidth:2})})]})}const Ia=8;function On({descriptor:t,itemRef:s,initialItem:n,ctx:r,isOpen:a,isPinned:o}){const[i,c]=l.useState(n??null),[u,d]=l.useState(!n&&!!(t!=null&&t.get)),[p,h]=l.useState(!1),[b,E]=l.useState(!1),[R,$]=l.useState(!1),f=l.useRef({}),[g,m]=l.useState(new Set),[,j]=l.useState(0),x=ae(C=>C.addToBasket),k=ae(C=>C.removeFromBasket),_=ae(C=>C.lockedByMe),G=ae(C=>C.userId);l.useEffect(()=>{n&&(c(n),d(!1),h(!1))},[n]),l.useEffect(()=>{if(n||!(t!=null&&t.get)){n||d(!1);return}let C=!1;return d(!0),h(!1),In(t.serviceCode,t.get,s.key).then(M=>{if(!C){const O=Bn(M);O?(c(O),h(!1)):h(!0),d(!1)}}).catch(()=>{C||(h(!0),d(!1))}),()=>{C=!0}},[s.key,t==null?void 0:t.serviceCode]);const K=Yt(t),B=i||{id:s.key,_title:s.key},P=B.id||B.ID||s.key,S=r.activeNodeId===P,N=(t==null?void 0:t.serviceCode)==="psm"&&_.has(P),V=!u&&i&&K.hasItemChildren?K.hasItemChildren(B):!1,Y=l.useCallback(()=>{x(G,t.serviceCode,t.itemCode,P)},[x,G,t,P]),z=l.useCallback(()=>{k(G,t.serviceCode,t.itemCode,P)},[k,G,t,P]),U=N?null:z,A=l.useCallback(async C=>{C==null||C.stopPropagation();const M=!b;if(E(M),!!M&&f.current[P]===void 0){if(!K.fetchChildren){f.current[P]=[];return}f.current[P]="loading",$(!0),j(O=>O+1);try{const O=await K.fetchChildren(B,r);f.current[P]=Array.isArray(O)?O:[]}catch{f.current[P]=[]}finally{$(!1),j(O=>O+1)}}},[b,P,K,B,r]),I=l.useCallback(async(C,M,O)=>{if(O&&O.stopPropagation(),m(L=>{const w=new Set(L);return w.has(C)?w.delete(C):w.add(C),w}),f.current[M]===void 0){if(!K.fetchChildren){f.current[M]=[];return}f.current[M]="loading",j(L=>L+1);try{const L=await K.fetchChildren({id:M},r);f.current[M]=Array.isArray(L)?L:[]}catch{f.current[M]=[]}j(L=>L+1)}},[K,r]);function v(C,M,O,L){if(O>Ia)return null;const w=C.id||C.ID||M,D=f.current[w];return!Array.isArray(D)||D.length===0||!K.ChildRow?null:D.map(q=>{const te=q.targetNodeId||q.id||q.ID,le=`${M}/${q.linkId||te}`,ne=!L.has(te)&&g.has(le);return e.jsxs(Oe.Fragment,{children:[e.jsx(K.ChildRow,{link:q,child:q,depth:O,parentPath:le,ancestorIds:L,ctx:r,childCacheRef:f,expandedPaths:g,toggleNodeChildren:(W,J,re)=>I(W,J,re)}),ne&&v({id:te},le,O+1,new Set([...L,te]))]},le)})}const y=`${(t==null?void 0:t.serviceCode)||""}:${(t==null?void 0:t.itemCode)||""}:${P}`,F=f.current[P]==="loading"||R;return u?e.jsx("div",{className:"node-item",style:{color:"var(--muted)",fontSize:10,paddingLeft:24},children:"…"}):p?e.jsxs("div",{className:"node-item",title:`Could not resolve item: ${s.key}`,style:{color:"var(--danger, #e55)",fontSize:10,gap:6,cursor:"default"},children:[e.jsx("span",{style:{opacity:.7},children:"⚠"}),e.jsx("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"},children:s.key})]}):e.jsxs(e.Fragment,{children:[e.jsx(Mn,{descriptor:t,item:B,ctx:r,isActive:S,isOpen:a,isPinned:o,hasChildren:V,isExpanded:b,isLoading:F,onToggleExpand:A,onToggleChildren:A,onPin:Y,onUnpin:U}),b&&v(B,y,1,new Set([P]))]})}const Aa=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function $a({userId:t}){const[s,n]=l.useState(Xt);function r(a){n(a),Es(a),t&&ja(t,a)}return e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:8},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:Aa.map(a=>e.jsxs("button",{type:"button",className:`theme-option${s===a.value?" theme-option--active":""}`,onClick:()=>r(a.value),children:[e.jsx("span",{className:"theme-option-icon",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))})]})}const qs=["#5b9cf6","#56d18e","#e8c547","#a78bfa","#f87171","#34d399","#fb923c","#60a5fa"];function Dn(t){if(!t)return"#64748b";let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)&4294967295;return qs[Math.abs(s)%qs.length]}function _n(t){const s=(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||"?",n=s.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():s[0].toUpperCase()}function Ra({user:t,userId:s}){const n=Dn((t==null?void 0:t.id)||s);return e.jsxs("div",{className:"user-avatar",style:{"--avatar-color":n},title:(t==null?void 0:t.displayName)||(t==null?void 0:t.username),children:[t!=null&&t.avatarUrl?e.jsx("img",{className:"user-avatar-img",src:t.avatarUrl,alt:""}):e.jsx("span",{className:"user-avatar-initials",children:_n(t)}),(t==null?void 0:t.isAdmin)&&e.jsx("span",{className:"user-avatar-badge",title:"Administrator",children:"A"})]})}function Pa({userId:t,onClose:s}){const[n,r]=l.useState(null),[a,o]=l.useState(!1),[i,c]=l.useState({displayName:"",email:""}),[u,d]=l.useState(!1),[p,h]=l.useState(null);l.useEffect(()=>{Z.getUser(t,t).then(r).catch(()=>{})},[t]);function b(f,g){h({msg:f,type:g}),setTimeout(()=>h(null),2500)}function E(){c({displayName:(n==null?void 0:n.displayName)||"",email:(n==null?void 0:n.email)||""}),o(!0)}async function R(){d(!0);try{await Z.updateUser(t,t,i.displayName.trim(),i.email.trim());const f=await Z.getUser(t,t);r(f),o(!1),b("Profile updated","success")}catch{b("Failed to update profile","error")}finally{d(!1)}}l.useEffect(()=>{function f(g){g.key==="Escape"&&s()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[s]);const $=Dn(t);return e.jsx("div",{className:"profile-modal-overlay",onMouseDown:f=>{f.target===f.currentTarget&&s()},children:e.jsxs("div",{className:"profile-modal",children:[e.jsxs("div",{className:"profile-modal-header",children:[e.jsx("span",{className:"profile-modal-title",children:"My Profile"}),e.jsx("button",{className:"icon-btn",onClick:s,title:"Close",children:e.jsx(xt,{size:14,strokeWidth:2})})]}),e.jsxs("div",{className:"profile-modal-body",children:[p&&e.jsx("div",{style:{padding:"7px 12px",borderRadius:"var(--r)",fontSize:12,fontWeight:500,background:p.type==="success"?"rgba(56,212,113,.15)":"rgba(248,113,113,.15)",color:p.type==="success"?"#34d399":"#f87171",border:`1px solid ${p.type==="success"?"#34d39940":"#f8717140"}`},children:p.msg}),n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:"50%",border:`3px solid ${$}`,background:`color-mix(in srgb, ${$} 12%, var(--surface))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:$,flexShrink:0},children:n.avatarUrl?e.jsx("img",{src:n.avatarUrl,alt:"",style:{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}):_n(n)}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:14,fontWeight:700,color:"var(--text)"},children:n.displayName||n.username}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2},children:n.username}),n.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",style:{marginTop:4,display:"inline-block"},children:"Admin"})]})]}),a?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Display Name"}),e.jsx("input",{className:"field-input",autoFocus:!0,value:i.displayName,onChange:f=>c(g=>({...g,displayName:f.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Email"}),e.jsx("input",{className:"field-input",type:"email",value:i.email,onChange:f=>c(g=>({...g,email:f.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("button",{className:"btn btn-primary",onClick:R,disabled:u,children:u?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>o(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.email||"—"})]}),e.jsx("div",{children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:E,children:[e.jsx(bt,{size:11,strokeWidth:2}),"Edit"]})})]}),e.jsx("div",{style:{borderTop:"1px solid var(--border)",paddingTop:12,marginTop:4},children:e.jsx($a,{userId:t})})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})]})]})})}function La({currentUser:t,userId:s,users:n,onUserChange:r,onOpenProfile:a,onClose:o}){const i=l.useRef(null);return l.useEffect(()=>{function c(u){i.current&&!i.current.contains(u.target)&&o()}return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[o]),e.jsxs("div",{className:"profile-menu",ref:i,children:[e.jsxs("div",{className:"profile-menu-header",children:[e.jsx("div",{className:"profile-menu-name",children:(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||s}),(t==null?void 0:t.username)&&t.username!==t.displayName&&e.jsx("div",{className:"profile-menu-username",children:t.username})]}),(n||[]).length>1&&e.jsxs("div",{className:"profile-menu-section",children:[e.jsx("div",{className:"profile-menu-label",children:"Switch user"}),e.jsx("div",{className:"profile-menu-select-row",children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"user-select",style:{width:"100%",paddingRight:28},value:s,onChange:c=>{r(c.target.value),o()},children:n.map(c=>e.jsx("option",{value:c.id,children:c.displayName||c.username},c.id))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})})]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",onClick:()=>{a(),o()},children:[e.jsx(Qt,{size:13,strokeWidth:2,color:"var(--muted)"}),"My Profile"]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",disabled:!0,title:"Not yet implemented",children:[e.jsx(_r,{size:13,strokeWidth:2,color:"var(--muted)"}),"Logout"]})]})}function Ba({onNavigate:t}){const s=ae(b=>b.basketItems),n=ae(b=>b.emptyBasket),r=ae(b=>b.userId),a=ae(b=>b.items),o=ae(b=>b.stateColorMap),[i,c]=Oe.useState(!1),u=Oe.useRef(null),d=Object.values(s).reduce((b,E)=>b+E.size,0);Oe.useEffect(()=>{if(!i)return;function b(E){u.current&&!u.current.contains(E.target)&&c(!1)}return document.addEventListener("mousedown",b),()=>document.removeEventListener("mousedown",b)},[i]);const p=Oe.useMemo(()=>({userId:r,activeNodeId:null,stateColorMap:o,onNavigate:(b,E,R)=>{t==null||t(b,E,R),c(!1)}}),[r,o,t]),h=Oe.useMemo(()=>{const b=[];for(const[E,R]of Object.entries(s)){const $=E.indexOf(":"),f=$>-1?E.slice(0,$):E,g=$>-1?E.slice($+1):"",m=a.find(j=>j.serviceCode===f&&j.itemCode===g);if(m)for(const j of R)b.push({descriptor:m,itemRef:{source:f,type:g,key:j}})}return b},[s,a]);return e.jsxs("div",{className:"basket-btn-wrap",ref:u,children:[e.jsxs("button",{className:"basket-btn",title:"Basket",onClick:()=>c(b=>!b),children:[e.jsx(Dr,{size:15,strokeWidth:1.8}),d>0&&e.jsx("span",{className:"basket-badge",children:d>99?"99+":d})]}),i&&e.jsxs("div",{className:"basket-dropdown",children:[e.jsxs("div",{className:"basket-dropdown-header",children:[e.jsx("span",{className:"basket-dropdown-title",children:"Basket"}),e.jsxs("span",{className:"basket-dropdown-count",children:[d," item",d!==1?"s":""]})]}),e.jsx("div",{className:"basket-dropdown-divider"}),d===0?e.jsx("div",{className:"basket-dropdown-empty",children:"No items pinned"}):e.jsx("div",{className:"basket-dropdown-list",children:h.map(({descriptor:b,itemRef:E})=>e.jsx(On,{descriptor:b,itemRef:E,ctx:p,isOpen:!1,isPinned:!0},`${E.source}:${E.type}:${E.key}`))}),e.jsx("div",{className:"basket-dropdown-divider"}),e.jsx("button",{className:"basket-dropdown-action",disabled:d===0,onClick:()=>{r&&n(r),c(!1)},children:"Empty basket"})]})]})}function Ma({userId:t,onUserChange:s,users:n,nodeTypes:r,stateColorMap:a,nodes:o,searchQuery:i,searchType:c,onSearchChange:u,onSearchTypeChange:d,onSearchSubmit:p,projectSpaces:h,projectSpaceId:b,onProjectSpaceChange:E,onNavigate:R}){const $=l.useMemo(()=>(n||[]).find(I=>I.id===t),[n,t]),f=ae(I=>I.items),[g,m]=l.useState([]),[j,x]=l.useState(!1),[k,_]=l.useState(-1),[G,K]=l.useState(!1),[B,P]=l.useState(!1),S=l.useRef(null),N=l.useRef(null),V=l.useRef(0);l.useEffect(()=>{const I=(i||"").trim();if(I.length<2){m([]),x(!1);return}const v=++V.current,y=setTimeout(async()=>{try{const F=await Z.searchNodes(I,{},[],6);if(V.current!==v)return;const C=F.hits||[];m(C),x(C.length>0),_(-1)}catch{V.current===v&&(m([]),x(!1))}},200);return()=>clearTimeout(y)},[i]);const Y=l.useCallback(I=>{if(clearTimeout(S.current),u(""),x(!1),m([]),R){const v=I.serviceCode||"psm",y=I.itemCode||I.type||"",F=f.find(C=>C.serviceCode===v&&C.itemCode===y)||(v==="psm"?Ot:{serviceCode:v,itemCode:y});R(I.id,void 0,F)}},[u,R,f]),z=l.useCallback(I=>{if(I.key==="Enter"){k>=0&&g.length>0?(I.preventDefault(),Y(g[k])):i&&i.trim()&&(I.preventDefault(),x(!1),p&&p(i.trim()));return}!j||g.length===0||(I.key==="ArrowDown"?(I.preventDefault(),_(v=>Math.min(v+1,g.length-1))):I.key==="ArrowUp"?(I.preventDefault(),_(v=>Math.max(v-1,0))):I.key==="Escape"&&x(!1))},[j,g,k,Y,i,p]),U=l.useCallback(()=>{S.current=setTimeout(()=>x(!1),150)},[]),A=l.useCallback(()=>{clearTimeout(S.current),g.length>0&&x(!0)},[g.length]);return e.jsxs("header",{className:"header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"brand",children:[e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{flexShrink:0},children:[e.jsx("rect",{width:"24",height:"24",rx:"5",fill:"url(#psm-grad)"}),e.jsx("circle",{cx:"12",cy:"6",r:"2.2",fill:"white",fillOpacity:"0.95"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"6.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"17.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"12",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("circle",{cx:"6.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"12",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"17.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"psm-grad",x1:"0",y1:"0",x2:"24",y2:"24",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"var(--accent)"}),e.jsx("stop",{offset:"100%",stopColor:"#7c3aed"})]})})]}),e.jsx("span",{children:"PSM"})]}),e.jsx("div",{className:"brand-sep"})]}),e.jsx("div",{className:"header-center",children:e.jsxs("div",{className:"search-wrap",children:[e.jsxs("div",{className:"search-group",children:[e.jsx("span",{className:"search-icon",children:"⌕"}),e.jsx("input",{className:"search-input",placeholder:"Search by logical ID…",value:i,onChange:I=>u(I.target.value),onKeyDown:z,onFocus:A,onBlur:U,autoComplete:"off"}),e.jsx("div",{className:"search-divider"}),e.jsxs("select",{className:"search-type",value:c,onChange:I=>d(I.target.value),title:"Filter by type",children:[e.jsx("option",{value:"",children:"All types"}),(r||[]).map(I=>e.jsx("option",{value:I.id||I.ID,children:I.name||I.NAME},I.id||I.ID))]})]}),j&&g.length>0&&e.jsx("div",{className:"search-suggestions",children:g.map((I,v)=>{const y=(()=>{try{return JSON.parse(I.sourceJson||"{}")}catch{return{}}})(),F=I.serviceCode||"psm",C=I.itemCode||I.type||"",M=f.find(H=>H.serviceCode===F&&H.itemCode===C),O=(M==null?void 0:M.color)||null,L=(M==null?void 0:M.icon)||null,w=L?qe[L]:null,D=y.logicalId||y.logical_id||y.originalName||I.id,q=y.name||y.displayName||"",te=y.revision||"",le=y.iteration;return e.jsxs("div",{className:`search-sug-item${v===k?" hi":""}`,onMouseDown:()=>Y(I),onMouseEnter:()=>_(v),children:[e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:w?e.jsx(w,{size:11,color:O||"var(--muted)",strokeWidth:2}):O?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:O,display:"inline-block"}}):null}),e.jsx("span",{className:"sug-lid",children:D}),q&&e.jsx("span",{className:"sug-dname",children:q}),te&&e.jsxs("span",{className:"sug-meta",children:[C,le!=null?` · ${te}.${le}`:` · ${te}`]})]},I.id)})})]})}),e.jsxs("div",{className:"header-right",children:[e.jsx(Ba,{onNavigate:R}),(h||[]).length>0&&e.jsxs("div",{className:"ps-select-wrap",title:"Active project space",children:[e.jsx(Bt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"ps-select",value:b,onChange:I=>E(I.target.value),children:h.map(I=>e.jsx("option",{value:I.id||I.ID,children:I.name||I.NAME},I.id||I.ID))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})]}),e.jsxs("div",{className:"profile-menu-wrap",ref:N,children:[e.jsx("button",{className:"profile-avatar-btn",onClick:()=>K(I=>!I),title:"Profile & settings",children:e.jsx(Ra,{user:$,userId:t})}),G&&e.jsx(La,{currentUser:$,userId:t,users:n,onUserChange:s,onOpenProfile:()=>P(!0),onClose:()=>K(!1)})]})]}),B&&e.jsx(Pa,{userId:t,onClose:()=>P(!1)})]})}const Oa=Oe.memo(Ma);function Da(t){const s=l.useRef(t);s.current=t,l.useEffect(()=>be.getState().subscribeWsEvent(n=>s.current(n)),[])}function bs(){const t=ft();return t?{Authorization:`Bearer ${t}`}:{}}const Ks={get:{bg:"rgba(56,189,248,.13)",text:"#38bdf8",border:"rgba(56,189,248,.28)"},post:{bg:"rgba(74,222,128,.13)",text:"#4ade80",border:"rgba(74,222,128,.28)"},put:{bg:"rgba(251,191,36,.13)",text:"#fbbf24",border:"rgba(251,191,36,.28)"},delete:{bg:"rgba(var(--danger-rgb),.13)",text:"var(--danger)",border:"rgba(var(--danger-rgb),.28)"},patch:{bg:"rgba(167,139,250,.13)",text:"#a78bfa",border:"rgba(167,139,250,.28)"}};function _a({method:t}){const s=Ks[t]||Ks.get;return e.jsx("span",{style:{background:s.bg,color:s.text,border:`1px solid ${s.border}`,borderRadius:3,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"var(--sans)",letterSpacing:".07em",textTransform:"uppercase",flexShrink:0,width:58,textAlign:"center",display:"inline-block"},children:t})}function vs(t,s=0){var n;if(!t||s>4)return null;if(t.example!==void 0)return t.example;if(t.type==="object"||t.properties){const r={};return Object.entries(t.properties||{}).forEach(([a,o])=>{r[a]=vs(o,s+1)}),r}return t.type==="array"?[vs(t.items,s+1)]:t.type==="string"?((n=t.enum)==null?void 0:n[0])??"":t.type==="boolean"?!1:t.type==="integer"||t.type==="number"?0:null}function Wa({method:t,path:s,operation:n,userId:r,projectSpaceId:a,basePath:o}){const[i,c]=l.useState(!1),[u,d]=l.useState({}),[p,h]=l.useState(""),[b,E]=l.useState(null),[R,$]=l.useState(!1),[f,g]=l.useState(r),[m,j]=l.useState(a||"");l.useEffect(()=>{g(r)},[r]),l.useEffect(()=>{j(a||"")},[a]);const x=n.parameters||[],k=["post","put","patch"].includes(t);l.useEffect(()=>{var B,P,S;if(!i||!k||p)return;const G=(P=(B=n.requestBody)==null?void 0:B.content)==null?void 0:P["application/json"];if(!G)return;let K=G.example??((S=G.schema)==null?void 0:S.example);K===void 0&&G.schema&&(K=vs(G.schema)),K!=null&&h(JSON.stringify(K,null,2))},[i,k,n,p]);async function _(){$(!0),E(null);let G=(o||"")+s;x.filter(S=>S.in==="path").forEach(S=>{G=G.replace(`{${S.name}}`,encodeURIComponent(u[S.name]??""))});const K=new URLSearchParams;x.filter(S=>S.in==="query").forEach(S=>{u[S.name]&&K.append(S.name,u[S.name])});const B=K.toString();B&&(G+="?"+B);const P={"Content-Type":"application/json",...bs()};m&&(P["X-PLM-ProjectSpace"]=m),x.filter(S=>S.in==="header").forEach(S=>{u[S.name]&&(P[S.name]=u[S.name])});try{const S=await fetch(G,{method:t.toUpperCase(),headers:P,body:k&&p.trim()?p:void 0}),N=await S.text();let V=N;try{V=JSON.stringify(JSON.parse(N),null,2)}catch{}E({status:S.status,ok:S.ok,body:V||"(empty)"})}catch(S){E({status:0,ok:!1,body:`Network error: ${S.message}`})}finally{$(!1)}}return e.jsxs("div",{className:`pg-row${i?" pg-row--open":""}`,children:[e.jsxs("div",{className:"pg-row-hd",onClick:()=>c(G=>!G),children:[e.jsx("span",{className:"pg-chevron",children:i?e.jsx(Ve,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Ue,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx(_a,{method:t}),e.jsx("code",{className:"pg-path",children:s}),n.summary&&e.jsx("span",{className:"pg-summary",children:n.summary})]}),i&&e.jsxs("div",{className:"pg-row-body",children:[e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Headers"}),e.jsxs("div",{className:"pg-header-grid",children:[e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-User"}),e.jsx("input",{className:"pg-input pg-header-input",value:f,onChange:G=>g(G.target.value),placeholder:"user-alice"})]}),e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-ProjectSpace"}),e.jsx("input",{className:"pg-input pg-header-input",value:m,onChange:G=>j(G.target.value),placeholder:"ps-default"})]})]})]}),x.length>0&&e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Parameters"}),e.jsx("div",{className:"pg-params-grid",children:x.map(G=>{var K,B;return e.jsxs("div",{className:"pg-param",children:[e.jsxs("div",{className:"pg-param-hd",children:[e.jsx("code",{className:"pg-param-name",children:G.name}),e.jsx("span",{className:"pg-param-in",children:G.in}),G.required&&e.jsx("span",{className:"pg-param-req",children:"req"}),G.description&&e.jsx("span",{className:"pg-param-desc",children:G.description})]}),e.jsx("input",{className:"pg-input",placeholder:String(((K=G.schema)==null?void 0:K.example)??((B=G.schema)==null?void 0:B.type)??""),value:u[G.name]??"",onChange:P=>d(S=>({...S,[G.name]:P.target.value}))})]},G.name)})})]}),k&&e.jsxs("div",{className:"pg-section",children:[e.jsxs("div",{className:"pg-section-label",children:["Body",e.jsx("span",{className:"pg-section-sub",children:"application/json"})]}),e.jsx("textarea",{className:"pg-body-editor",value:p,onChange:G=>h(G.target.value),rows:5,spellCheck:!1,placeholder:"{}"})]}),e.jsxs("div",{className:"pg-exec-bar",children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:_,disabled:R,style:{minWidth:90},children:R?"Sending…":"▶ Execute"}),e.jsxs("span",{className:"pg-exec-meta",children:["as ",e.jsx("strong",{children:r})]}),b&&e.jsx("button",{className:"btn btn-xs",style:{marginLeft:"auto"},onClick:()=>E(null),children:"Clear"})]}),b&&e.jsxs("div",{className:"pg-response",children:[e.jsxs("div",{className:"pg-response-hd",children:[e.jsx("span",{className:"pg-status",style:{background:b.ok?"rgba(77,212,160,.15)":"rgba(var(--danger-rgb),.15)",color:b.ok?"var(--success)":"var(--danger)",border:`1px solid ${b.ok?"rgba(77,212,160,.3)":"rgba(var(--danger-rgb),.3)"}`},children:b.status||"ERR"}),e.jsx("span",{className:"pg-response-label",children:b.ok?"OK":"Error"})]}),e.jsx("pre",{className:"pg-response-body",children:b.body})]})]})]})}function Fa(t){return t?t.endsWith("/")?t.slice(0,-1):t:""}function Ua({userId:t,projectSpaceId:s}){var B,P;const[n,r]=l.useState([]),[a,o]=l.useState(null),[i,c]=l.useState(null),[u,d]=l.useState(!0),[p,h]=l.useState(null),[b,E]=l.useState(""),[R,$]=l.useState({}),f=l.useMemo(()=>n.find(S=>S.serviceCode===a)||null,[n,a]),g=Fa(f==null?void 0:f.path),m=l.useCallback(()=>{d(!0),h(null),fetch("/api/platform/status",{headers:bs(),cache:"no-store"}).then(S=>{if(!S.ok)throw new Error(`HTTP ${S.status} on /api/platform/status`);return S.json()}).then(S=>{const N=(S.services||[]).filter(V=>V.registered&&V.path&&V.serviceCode!=="spe"&&V.serviceCode!=="ws").sort((V,Y)=>V.serviceCode.localeCompare(Y.serviceCode));r(N),N.length===0?(o(null),d(!1),h("No services registered — start backend services first.")):o(V=>N.some(Y=>Y.serviceCode===V)?V:N[0].serviceCode)}).catch(S=>{h(S.message),d(!1)})},[]),j=l.useCallback(()=>{g&&(d(!0),h(null),c(null),fetch(`${g}/v3/api-docs`,{headers:bs(),cache:"no-store"}).then(async S=>{if(!S.ok){const V=await S.text().catch(()=>"");throw new Error(`HTTP ${S.status}${V?" — "+V.slice(0,200):""}`)}const N=S.headers.get("content-type")||"";if(!N.includes("json"))throw new Error(`Expected JSON spec, got ${N||"unknown"}.`);return S.json()}).then(S=>{c(S),d(!1)}).catch(S=>{h(S.message),d(!1)}))},[g]);l.useEffect(()=>{m()},[m]),l.useEffect(()=>{j()},[j]),l.useEffect(()=>{E(""),$({})},[a]);const x=l.useMemo(()=>{if(!(i!=null&&i.paths))return[];const S={};Object.entries(i.paths).forEach(([V,Y])=>{Object.entries(Y).forEach(([z,U])=>{var I;if(!["get","post","put","delete","patch"].includes(z))return;const A=((I=U.tags)==null?void 0:I[0])??"default";S[A]||(S[A]=[]),S[A].push({method:z,path:V,operation:U})})});const N=["get","post","put","patch","delete"];return Object.entries(S).sort(([V],[Y])=>V.localeCompare(Y)).map(([V,Y])=>[V,[...Y].sort((z,U)=>N.indexOf(z.method)-N.indexOf(U.method))])},[i]),k=l.useMemo(()=>{const S=b.trim().toLowerCase();return S?x.map(([N,V])=>[N,V.filter(({method:Y,path:z,operation:U})=>Y.includes(S)||z.toLowerCase().includes(S)||(U.summary||"").toLowerCase().includes(S)||N.toLowerCase().includes(S))]).filter(([,N])=>N.length>0):x},[x,b]);function _(S){$(N=>({...N,[S]:!N[S]}))}const G=i?Object.keys(i.paths||{}).length:0,K=e.jsx("select",{className:"pg-service-select",value:a||"",onChange:S=>o(S.target.value),disabled:n.length===0,style:{background:"var(--bg-elev-1)",color:"var(--fg)",border:"1px solid var(--border)",borderRadius:4,padding:"4px 8px",fontSize:12,fontFamily:"var(--mono)",minWidth:160},children:n.map(S=>e.jsxs("option",{value:S.serviceCode,children:[S.serviceCode,"  (",S.path,")"]},S.serviceCode))});return u&&!i?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[K,e.jsx("span",{className:"pg-topbar-meta",children:"loading…"}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:m,title:"Reload services",children:"⟳"})]}),e.jsx("div",{className:"settings-loading",children:"Fetching OpenAPI spec…"})]}):p?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[K,e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:m,title:"Reload services",children:"⟳"})]}),e.jsxs("div",{style:{padding:24,display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("span",{style:{fontSize:12,color:"var(--danger)"},children:["✗ ",p]}),e.jsx("button",{className:"btn btn-sm",style:{alignSelf:"flex-start"},onClick:j,children:"Retry"})]})]}):e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[K,e.jsx("span",{className:"pg-topbar-title",children:(B=i==null?void 0:i.info)==null?void 0:B.title}),e.jsxs("span",{className:"pg-topbar-ver",children:["v",(P=i==null?void 0:i.info)==null?void 0:P.version]}),e.jsxs("span",{className:"pg-topbar-meta",children:[G," paths"]}),e.jsxs("span",{className:"pg-topbar-user",children:["as ",e.jsx("strong",{children:t}),s&&e.jsxs("span",{style:{marginLeft:8,color:"var(--accent)",opacity:.75},children:["· ",s]})]}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:j,title:"Reload spec",children:"⟳ Reload"})]}),e.jsxs("div",{className:"pg-filter",children:[e.jsx("input",{className:"pg-filter-input",placeholder:"Filter endpoints…",value:b,onChange:S=>E(S.target.value)}),b&&e.jsx("button",{className:"btn btn-xs",onClick:()=>E(""),children:"Clear"})]}),e.jsxs("div",{className:"pg-list",children:[k.length===0&&e.jsxs("div",{style:{padding:"32px 20px",fontSize:12,color:"var(--muted2)",fontStyle:"italic"},children:["No endpoints match “",b,"”"]}),k.map(([S,N])=>{const V=!!R[S];return e.jsxs("div",{className:"pg-group",children:[e.jsxs("div",{className:"pg-group-hd",onClick:()=>_(S),children:[e.jsx("span",{className:"pg-chevron",children:V?e.jsx(Ue,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Ve,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx("span",{className:"pg-group-name",children:S}),e.jsx("span",{className:"pg-group-count",children:N.length})]}),!V&&N.map(({method:Y,path:z,operation:U})=>e.jsx(Wa,{method:Y,path:z,operation:U,userId:t,projectSpaceId:s,basePath:g},`${Y}:${z}`))]},S)})]})]})}function Tt({id:t,children:s}){return e.jsx("h2",{id:t,style:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 10px",paddingTop:4,borderBottom:"1px solid var(--border)",paddingBottom:8},children:s})}function Le({children:t}){return e.jsx("h3",{style:{fontSize:13,fontWeight:600,color:"var(--accent)",margin:"20px 0 6px",textTransform:"uppercase",letterSpacing:".06em"},children:t})}function ze({children:t}){return e.jsx("p",{style:{margin:"0 0 10px",fontSize:13,lineHeight:1.65,color:"var(--text)"},children:t})}function Ne({children:t}){return e.jsx("code",{style:{fontFamily:"var(--mono)",fontSize:11,background:"rgba(100,116,139,.15)",border:"1px solid rgba(100,116,139,.2)",borderRadius:3,padding:"1px 5px",color:"var(--accent)"},children:t})}function Wt({children:t}){return e.jsxs("div",{style:{background:"rgba(232,169,71,.08)",border:"1px solid rgba(232,169,71,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"#e8a947"},children:"Note: "}),t]})}function os({children:t}){return e.jsxs("div",{style:{background:"rgba(91,156,246,.08)",border:"1px solid rgba(91,156,246,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"var(--accent)"},children:"Tip: "}),t]})}function xe({name:t,type:s,children:n}){return e.jsxs("div",{style:{marginBottom:10},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:8,marginBottom:3},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13,color:"var(--text)"},children:t}),s&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",textTransform:"uppercase"},children:s})]}),e.jsx("div",{style:{fontSize:12,lineHeight:1.6,color:"var(--muted)",paddingLeft:10,borderLeft:"2px solid var(--border)"},children:n})]})}function et({rows:t}){return e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:10},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:600,width:"30%"},children:"Value"}),e.jsx("th",{style:{textAlign:"left",padding:"4px 0",color:"var(--muted)",fontWeight:600},children:"Meaning"})]})}),e.jsx("tbody",{children:t.map(([s,n])=>e.jsxs("tr",{style:{borderBottom:"1px solid rgba(100,116,139,.08)"},children:[e.jsx("td",{style:{padding:"5px 8px 5px 0",verticalAlign:"top"},children:e.jsx(Ne,{children:s})}),e.jsx("td",{style:{padding:"5px 0",verticalAlign:"top",color:"var(--text)",lineHeight:1.55},children:n})]},s))})]})}function Ft(){return e.jsx("hr",{style:{border:"none",borderTop:"1px solid var(--border)",margin:"28px 0"}})}const Ga=[{id:"node-types",label:"Node Types"},{id:"lifecycles",label:"Lifecycles"},{id:"proj-spaces",label:"Project Spaces"},{id:"users-roles",label:"Users & Roles"},{id:"access-rights",label:"Access Rights"}];function Ha(){const[t,s]=l.useState("node-types"),n=l.useRef(null);function r(a){s(a);const o=document.getElementById("manual-"+a);o&&n.current&&n.current.scrollTo({top:o.offsetTop-16,behavior:"smooth"})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[e.jsxs("div",{style:{width:160,flexShrink:0,borderRight:"1px solid var(--border)",padding:"16px 0",overflowY:"auto"},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",padding:"0 14px 10px"},children:"Contents"}),Ga.map(({id:a,label:o})=>e.jsx("div",{onClick:()=>r(a),style:{padding:"6px 14px",fontSize:12,cursor:"pointer",color:t===a?"var(--accent)":"var(--muted)",background:t===a?"rgba(91,156,246,.08)":"transparent",borderLeft:t===a?"2px solid var(--accent)":"2px solid transparent",transition:"all .15s"},children:o},a))]}),e.jsxs("div",{ref:n,style:{flex:1,overflowY:"auto",padding:"20px 28px 40px"},children:[e.jsxs("div",{id:"manual-node-types",children:[e.jsx(Tt,{id:"node-types",children:"Node Types"}),e.jsxs(ze,{children:["A ",e.jsx("strong",{children:"Node Type"})," is the blueprint for any object you create in the product structure — a component, an assembly, a document, a requirement, etc. Every node belongs to exactly one type and inherits that type's attributes, lifecycle, versioning rules, and link constraints."]}),e.jsx(Le,{children:"Identity"}),e.jsxs(ze,{children:["Each node can carry a human-readable ",e.jsx("em",{children:"logical identifier"})," (separate from its internal UUID). The identity settings control how that identifier is displayed and validated."]}),e.jsx(xe,{name:"Label",type:"text",children:'The display label used in the UI for the identifier field (e.g. "Part Number", "Doc ID"). Defaults to "Identifier".'}),e.jsxs(xe,{name:"Validation Pattern",type:"regex",children:["An optional regular expression that the logical ID must match. If blank, any value is accepted. Example: ",e.jsx(Ne,{children:"^[A-Z]{2}-\\d{4}$"})," enforces two uppercase letters, a dash, and four digits."]}),e.jsx(Le,{children:"Lifecycle"}),e.jsx(ze,{children:"Assign a lifecycle to the node type to enable state-based workflows (Draft → Review → Frozen → Released). Nodes without a lifecycle remain in their initial state and cannot be transitioned."}),e.jsx(xe,{name:"Lifecycle",type:"select",children:'The lifecycle that governs nodes of this type. Setting it to "None" disables lifecycle management for this node type.'}),e.jsx(Le,{children:"Versioning"}),e.jsxs(ze,{children:["Versioning settings control how the visible version identifier (",e.jsx(Ne,{children:"revision.iteration"}),", e.g. ",e.jsx(Ne,{children:"A.3"}),") advances when a node is checked out or released."]}),e.jsxs(xe,{name:"Numbering Scheme",type:"select",children:["Determines the alphabet used for revision letters.",e.jsx(et,{rows:[["ALPHA_NUMERIC","Revisions advance A → B → … → Z → AA → AB … Standard PLM convention."]]})]}),e.jsxs(xe,{name:"Version Policy",type:"select",children:["Controls what happens to the version number when a user checks out a node.",e.jsx(et,{rows:[["NONE","Checkout creates a new technical version for traceability but does not advance the visible revision.iteration. Use for types where every save is tracked internally but the displayed identifier must stay stable."],["ITERATE","Checkout increments the iteration: A.1 → A.2. Use for normal work-in-progress types where each save is a new draft of the same revision."],["RELEASE","Checkout starts a new revision and resets iteration to 1: A.3 → B.1. Use for types that follow a formal release cycle where a new revision means a significant change."]]})]}),e.jsxs(xe,{name:"Collapse history on release",type:"checkbox",children:["When enabled, the intermediate working iterations are purged from history each time a node enters a ",e.jsx("strong",{children:"Released"})," state.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"What happens:"}),e.jsxs("ul",{style:{margin:"6px 0 0 16px",paddingLeft:0,listStyleType:"disc",fontSize:12,lineHeight:1.7},children:[e.jsxs("li",{children:["All working iterations of the previous revision are deleted (",e.jsx(Ne,{children:"A.1"}),", ",e.jsx(Ne,{children:"A.2"}),", ",e.jsx(Ne,{children:"A.3"})," — all gone)."]}),e.jsxs("li",{children:["The new Released version has its iteration stripped and displays as the bare revision letter (e.g. ",e.jsx(Ne,{children:"B.1"})," → ",e.jsx(Ne,{children:"B"}),")."]}),e.jsx("li",{children:"Versions that are pinned in a baseline or referenced by a VERSION_TO_VERSION link are never deleted."})]}),e.jsx("br",{}),e.jsx("strong",{children:"Result:"})," version history reads ",e.jsx(Ne,{children:"B"}),", ",e.jsx(Ne,{children:"C"}),", ",e.jsx(Ne,{children:"D"})," (one entry per release) instead of ",e.jsx(Ne,{children:"A.1"}),", ",e.jsx(Ne,{children:"A.2"}),", ",e.jsx(Ne,{children:"A.3"}),", ",e.jsx(Ne,{children:"B.1"}),", …",e.jsxs(Wt,{children:["Only applies to node types whose lifecycle has a Released state (",e.jsx(Ne,{children:"isReleased = true"}),")."]})]}),e.jsx(Le,{children:"Attributes"}),e.jsx(ze,{children:"Attributes are the structured data fields attached to every version of a node of this type (title, description, material, weight, etc.). Each attribute is independently configurable."}),e.jsxs(xe,{name:"Name (internal key)",type:"text",children:["The machine-readable key stored in the database. Must be unique within the node type. Cannot be changed after creation. Use camelCase or snake_case (e.g. ",e.jsx(Ne,{children:"reviewNote"}),", ",e.jsx(Ne,{children:"material_grade"}),")."]}),e.jsx(xe,{name:"Label (display)",type:"text",children:'The human-readable label shown in forms and tables (e.g. "Review Note", "Material Grade").'}),e.jsxs(xe,{name:"Data Type",type:"select",children:["The underlying data type for validation and storage.",e.jsx(et,{rows:[["STRING","Free text."],["NUMBER","Numeric value (integer or decimal)."],["DATE","ISO date value."],["BOOLEAN","True / False toggle."],["ENUM","One value from a predefined list (configure the list separately)."]]})]}),e.jsxs(xe,{name:"Widget",type:"select",children:["The UI control rendered in the editor for this attribute.",e.jsx(et,{rows:[["TEXT","Single-line text input."],["TEXTAREA","Multi-line text area."],["DROPDOWN","Dropdown selector (required for ENUM type)."],["DATE_PICKER","Calendar date picker (recommended for DATE type)."],["CHECKBOX","Toggle checkbox (recommended for BOOLEAN type)."]]})]}),e.jsx(xe,{name:"Section",type:"text",children:'Groups this attribute under a named panel in the editor (e.g. "Mechanical", "Review"). Attributes with no section appear in the default group.'}),e.jsx(xe,{name:"Order",type:"number",children:"Display order within the section. Lower numbers appear first."}),e.jsx(xe,{name:"Required field",type:"checkbox",children:"When checked, this attribute must be filled before a node can advance past states configured as requiring it (via Attribute State Rules). Does not block saving; only blocks lifecycle transitions where the rule is active."}),e.jsx(xe,{name:"Use as display name ★",type:"checkbox",children:"Marks this attribute as the human-readable title of the node. Its value appears in node lists, search results, and link pickers. Only one attribute per node type can be the display name."}),e.jsx(Le,{children:"Link Types (Outgoing)"}),e.jsx(ze,{children:"A link type defines an allowed relationship from this node type to another. Links are version-aware and carry a versioning policy."}),e.jsxs(xe,{name:"Link Name",type:"text",children:["Internal name for the relationship (e.g. ",e.jsx(Ne,{children:"composed_of"}),", ",e.jsx(Ne,{children:"references"}),")."]}),e.jsx(xe,{name:"Target Node Type",type:"select",children:"The node type that can appear on the other end of this link."}),e.jsxs(xe,{name:"Link Policy",type:"select",children:["Controls how the link resolves over time.",e.jsx(et,{rows:[["VERSION_TO_MASTER","The link always points to the latest committed version of the target. When the target is updated and committed, all parents automatically see the new version. Use for live BOM structures. Requires the parent to be locked (checked out) when the target is modified."],["VERSION_TO_VERSION","The link is frozen to the exact target version at the time the link was created. The parent always sees the same snapshot of the child regardless of future changes. Use for reference documentation or frozen configurations."]]})]}),e.jsxs(xe,{name:"Min Cardinality",type:"number",children:["Minimum number of links of this type required per node version. ",e.jsx(Ne,{children:"0"})," means the link is optional."]}),e.jsx(xe,{name:"Max (blank = unlimited)",type:"number",children:"Maximum number of links allowed. Leave blank for no upper limit."}),e.jsx(xe,{name:"Color",type:"color",children:"Visual color used to draw this link in the graph view."}),e.jsx(os,{children:'After creating a link type you can add attributes to it (e.g. "quantity", "reference designator") via the Edit link type panel. You can also define cascade rules that automatically propagate lifecycle transitions through the link.'})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-lifecycles",children:[e.jsx(Tt,{id:"lifecycles",children:"Lifecycles"}),e.jsxs(ze,{children:["A ",e.jsx("strong",{children:"Lifecycle"})," defines the states an object can be in and the valid transitions between them. It encodes the approval and release workflow for a node type."]}),e.jsx(Le,{children:"Lifecycle Properties"}),e.jsx(xe,{name:"Name",type:"text",children:"Name displayed in the UI and referenced by node types."}),e.jsx(xe,{name:"Description",type:"text",children:"Optional free-text explanation of the lifecycle's purpose."}),e.jsx(Le,{children:"States"}),e.jsx(ze,{children:"States represent stages in the lifecycle (e.g. Draft, In Review, Frozen, Released). Every node version has exactly one current state."}),e.jsx(xe,{name:"State Name",type:"text",children:'Display label for the state. Short, descriptive names work best (e.g. "Draft", "Frozen").'}),e.jsx(xe,{name:"Display Order",type:"number",children:"Order in which states appear in dropdowns and diagrams. Lower = earlier in the flow."}),e.jsx(xe,{name:"Color",type:"color",children:"Color used to represent this state in the UI (state pills, timeline dots). Pick a color that intuitively maps to the state's meaning — green for released, yellow for in-review, grey for draft."}),e.jsx(xe,{name:"isInitial",type:"tag",children:"Marks this as the entry state. Every newly created node starts here. Only one state per lifecycle can be initial."}),e.jsx(xe,{name:"isFrozen",type:"tag",children:"A frozen state locks the node's content. When a node enters a frozen state, the lock cascades to all children connected via VERSION_TO_MASTER links — they cannot be independently modified until the parent is unfrozen. Required before a baseline can be taken."}),e.jsxs(xe,{name:"isReleased",type:"tag",children:["Marks the state as a release milestone. Reaching this state is what triggers the ",e.jsx("em",{children:"Collapse history"})," feature (if enabled on the node type). Typically only one state per lifecycle is released."]}),e.jsx(Le,{children:"Transitions"}),e.jsx(ze,{children:"Transitions define which state changes are allowed and under what conditions. A transition always goes from one specific state to another."}),e.jsx(xe,{name:"Transition Name",type:"text",children:'Label shown on the action button that triggers this transition (e.g. "Freeze", "Release", "Reject"). Keep it short and verb-form.'}),e.jsx(xe,{name:"From State / To State",type:"select",children:"The source and target states for this transition. A node must be in the From State for the transition to appear."}),e.jsxs(xe,{name:"Guard Expression",type:"text",children:["An optional server-side condition that must be satisfied before the transition is allowed. If the guard fails, the transition button is blocked and an error is shown.",e.jsx(et,{rows:[["all_required_filled","All attributes marked Required must have a non-empty value in the current version."],["all_signatures_done","All signature requirements for this transition must have been fulfilled."],["(blank)","No guard — the transition is always allowed when the node is in the From State."]]})]}),e.jsxs(xe,{name:"Action Type",type:"select",children:["A server-side action executed as part of this transition.",e.jsx(et,{rows:[["NONE","No action — the transition simply changes the state."],["REQUIRE_SIGNATURE","Collects an electronic signature from the current user as part of the transition. The signature is stored permanently against the version."]]})]}),e.jsxs(xe,{name:"Version Strategy",type:"select",children:["Controls how the version number changes when this transition is triggered.",e.jsx(et,{rows:[["NONE","Creates a new technical version (for audit trail) but keeps the same revision.iteration visible to users. Used for state changes that are purely administrative."],["ITERATE","Increments the iteration (A.2 → A.3). Unusual for a lifecycle transition; more common for checkouts."],["REVISE","Starts a new revision and resets iteration to 1 (A.3 → B.1). Typically used on the Release transition to mark a new formal revision of the product."]]})]}),e.jsx(Le,{children:"Cascade Rules"}),e.jsx(ze,{children:"Cascade rules automate lifecycle propagation through links. When a parent node undergoes a transition, eligible child nodes are automatically transitioned as well — without manual action."}),e.jsx(ze,{children:"Rules are configured inside the link type: you specify which parent transition triggers which child transition, and from which child state. Children not in the expected state are silently skipped (they are already beyond or not yet at that stage)."}),e.jsx(Wt,{children:"Cascade is only applied through VERSION_TO_MASTER links. VERSION_TO_VERSION links point to frozen snapshots and are never cascaded."})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-proj-spaces",children:[e.jsx(Tt,{id:"proj-spaces",children:"Project Spaces"}),e.jsxs(ze,{children:["A ",e.jsx("strong",{children:"Project Space"})," is an organisational container that groups nodes and controls access. Every node creation request must specify a project space. Access rights (which roles can do what) are configured per project space."]}),e.jsx(ze,{children:'Think of a project space as a "workspace" or "programme" — you might have one per product line, customer project, or development phase.'}),e.jsx(xe,{name:"Name",type:"text",children:'Short, unique name for the space (e.g. "Prototype-2026", "Certification-A320"). Shown in the project space selector at the top of the application.'}),e.jsx(xe,{name:"Description",type:"text",children:"Optional free-text explaining the purpose or scope of this project space."}),e.jsx(Wt,{children:"Deleting a project space does not delete the nodes inside it — it removes only the space record. Nodes retain their project_space_id as a plain reference."})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-users-roles",children:[e.jsx(Tt,{id:"users-roles",children:"Users & Roles"}),e.jsx(Le,{children:"Roles"}),e.jsxs(ze,{children:["A ",e.jsx("strong",{children:"Role"})," is a named group of permissions (e.g. DESIGNER, REVIEWER, READER). Users are assigned roles within a project space. The role determines what actions the user can perform on which node types."]}),e.jsxs(xe,{name:"Name",type:"text",children:["Internal name for the role. By convention use UPPER_CASE (e.g. ",e.jsx(Ne,{children:"DESIGNER"}),"). This name is referenced in permission rules and signature requirements."]}),e.jsx(xe,{name:"Description",type:"textarea",children:'Human-readable explanation of who should hold this role (e.g. "Engineers who create and modify parts").'}),e.jsx(os,{children:"Create roles that map to real job functions, not individual people. A user can hold multiple roles — combine them to grant additive permissions."}),e.jsx(Le,{children:"Users"}),e.jsxs(ze,{children:["Users are the people who log in to the system. Each user is identified by a username (sent in the ",e.jsx(Ne,{children:"X-PLM-User"})," HTTP header). Users are created here and then assigned roles in specific project spaces."]}),e.jsxs(xe,{name:"Username",type:"text",children:["Unique login identifier (e.g. ",e.jsx(Ne,{children:"john.doe"}),"). This is the value placed in the ",e.jsx(Ne,{children:"X-PLM-User"})," header. Cannot be changed after creation."]}),e.jsx(xe,{name:"Display Name",type:"text",children:'Full human-readable name shown in the UI (e.g. "John Doe").'}),e.jsx(xe,{name:"Email",type:"email",children:"Contact email address. Stored for reference; not used for authentication in the current setup."}),e.jsx(xe,{name:"Admin status",type:"select",children:e.jsx(et,{rows:[["User","Standard user — access governed entirely by role assignments."],["Admin","System administrator — bypasses all permission checks and can perform any action in any project space. Use sparingly."]]})}),e.jsx(Le,{children:"Role Assignments"}),e.jsxs(ze,{children:["A role assignment connects a ",e.jsx("strong",{children:"user"}),", a ",e.jsx("strong",{children:"role"}),", and a ",e.jsx("strong",{children:"project space"}),". The user gains all permissions granted to that role within that specific project space."]}),e.jsx(ze,{children:"A user can hold multiple role assignments — for example, DESIGNER in Project-A and READER in Project-B, or DESIGNER + REVIEWER in the same project space (permissions are additive)."})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-access-rights",children:[e.jsx(Tt,{id:"access-rights",children:"Access Rights"}),e.jsxs(ze,{children:["Access Rights define what each role is allowed to do. The system uses two levels of permissions: ",e.jsx("strong",{children:"global actions"})," and ",e.jsx("strong",{children:"node-type/project-space actions"}),"."]}),e.jsx(Le,{children:"Global Permissions"}),e.jsx(ze,{children:"Global permissions control system-wide administrative capabilities, independent of any project space or node type."}),e.jsx(Wt,{children:'"Zero grants = action open to all roles." — If no role has been granted a global permission, the action is unrestricted. As soon as any role is granted a permission, only that role (and admins) can perform it.'}),e.jsx(et,{rows:[["MANAGE_METAMODEL","Create and edit node types, lifecycles, attributes, link types, and cascade rules."],["MANAGE_ROLES","Create and edit roles, users, project spaces, and role assignments."],["CREATE_NODE","Create new nodes (top-level action, independently of node type)."]]}),e.jsx(Le,{children:"Node Type × Project Space Permission Matrix"}),e.jsx(ze,{children:"The matrix table shows all combinations of node types (rows) and actions (columns) for a given project space. Toggle the circle icon in any cell to grant or revoke that permission for the current role."}),e.jsx(ze,{children:e.jsx("strong",{children:"Action column types:"})}),e.jsx(xe,{name:"NODE scope actions",type:"column",children:"Standard CRUD and workflow actions that apply to nodes of that type (e.g. checkout, checkin, create link, delete)."}),e.jsxs(xe,{name:"LIFECYCLE scope actions",type:"column",children:['Columns labelled "',e.jsx("em",{children:"From State → Transition Name"}),'" represent individual lifecycle transitions. Granting this permission allows the role to fire that specific transition on nodes of that type within this project space.']}),e.jsx(Le,{children:"How Permissions Stack"}),e.jsx(ze,{children:"Permissions are evaluated in this order. Each layer can only restrict, never expand, what the higher layer allowed:"}),e.jsxs("ol",{style:{margin:"0 0 12px 18px",paddingLeft:0,fontSize:13,lineHeight:2,color:"var(--text)"},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute State Rules"})," — declares which attributes are editable, visible, or required based on the lifecycle state."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute Views"})," — can further restrict (never widen) attribute visibility/editability for a specific role × state combination."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Node Type Permission ",e.jsx(Ne,{children:"can_write"})]})," — if false for the role, the entire node type becomes read-only regardless of other rules."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Transition Permission"})," — filters the list of lifecycle transitions available to the role."]})]}),e.jsx(os,{children:"Start with broad node-type permissions and use attribute views to fine-tune field-level access by role. Only add transition restrictions when you need formal approval gates."})]})]})]})}const Va="#5b9cf6";function Js(t){return(t==null?void 0:t.color)||(t==null?void 0:t.COLOR)||Va}const yt=110,jt=36,is=72,Ut=28,ls=46,cs=32,lt=10,zt=16,Xs=8,Gt=4;function qa({lifecycleId:t,currentStateId:s,userId:n,onTransition:r,availableTransitionNames:a,transitionGuardViolations:o,previewMode:i}){const[c,u]=l.useState([]),[d,p]=l.useState([]),[h,b]=l.useState(!1),[E,R]=l.useState(null);if(l.useEffect(()=>{!t||!n||(b(!0),Promise.all([Z.getLifecycleStates(n,t).catch(()=>[]),Z.getLifecycleTransitions(n,t).catch(()=>[])]).then(([v,y])=>{u(Array.isArray(v)?v:[]),p(Array.isArray(y)?y:[])}).finally(()=>b(!1)))},[t,n]),h)return e.jsx("div",{className:"lc-empty",children:"Loading diagram…"});if(!t)return e.jsx("div",{className:"lc-empty",children:"No lifecycle associated with this object type."});if(!c.length)return e.jsx("div",{className:"lc-empty",children:"No lifecycle states defined."});const $=[...c].sort((v,y)=>(v.display_order??v.DISPLAY_ORDER??0)-(y.display_order??y.DISPLAY_ORDER??0)),f={};$.forEach((v,y)=>{f[v.id||v.ID]=y});const g={};$.forEach((v,y)=>{g[v.id||v.ID]=Ut+y*(yt+is)+yt/2});const m=d.map((v,y)=>{const F=v.from_state_id||v.FROM_STATE_ID,C=v.to_state_id||v.TO_STATE_ID,M=f[F]??0,O=f[C]??0,L=O-M;return{...v,fromId:F,toId:C,fromIdx:M,toIdx:O,span:L,i:y}}).filter(v=>g[v.fromId]&&g[v.toId]&&v.span!==0),j=yt*.6,x=new Map,k=(v,y,F,C,M)=>{const O=`${v}::${y}`;x.has(O)||x.set(O,[]),x.get(O).push({tIdx:F,role:C,otherIdx:M})};for(const v of m){const y=v.span>0?"top":"bot";k(v.fromId,y,v.i,"from",v.toIdx),k(v.toId,y,v.i,"to",v.fromIdx)}const _=new Map(m.map(v=>[v.i,{x1:g[v.fromId],x2:g[v.toId]}]));for(const[v,y]of x){if(y.length<=1)continue;const F=v.indexOf("::"),C=v.slice(0,F),M=v.slice(F+2),O=f[C],L=g[C],w=W=>Math.abs(W.otherIdx-O),D=y.filter(W=>W.role==="to"),q=y.filter(W=>W.role==="from");let te;M==="top"?(D.sort((W,J)=>w(W)-w(J)),q.sort((W,J)=>w(J)-w(W)),te=[...D,...q]):(q.sort((W,J)=>w(W)-w(J)),D.sort((W,J)=>w(J)-w(W)),te=[...q,...D]);const le=te.length,H=L-j/2,ne=j/(le-1);te.forEach(({tIdx:W,role:J},re)=>{const X=H+re*ne,se=_.get(W);J==="from"?se.x1=X:se.x2=X})}const G=m.filter(v=>v.span>0),K=m.filter(v=>v.span<0),B=G.length?Math.max(...G.map(v=>v.span)):0,P=K.length?Math.max(...K.map(v=>-v.span)):0,S=B>0?ls+(B-1)*cs+zt+16:20,N=P>0?ls+(P-1)*cs+zt+28:30,V=Ut+S+jt/2,Y=Ut*2+$.length*(yt+is)-is,z=V+jt/2+N+Ut,U=V-jt/2,A=V+jt/2,I=v=>{const{fromId:y,span:F,i:C}=v,M=v.name||v.NAME||"",O=F>0,L=Math.abs(F),w=ls+(L-1)*cs,{x1:D,x2:q}=_.get(C),te=O?U:A,le=O?te-w:te+w,H=(D+q)/2,ne=!i&&y===s,W=(o==null?void 0:o.get(M))??[],J=W.length>0,re=J||ne&&a!=null&&!a.has(M),X=re?`✕ ${M}`:M,se=X?Math.max(44,X.length*6+18)/2:0;let oe,pe;O?(oe=[`M ${D},${te}`,`V ${le+lt}`,`Q ${D},${le} ${D+lt},${le}`,`H ${H-se-Gt}`].join(" "),pe=[`M ${H+se+Gt},${le}`,`H ${q-lt}`,`Q ${q},${le} ${q},${le+lt}`,`V ${te}`].join(" ")):(oe=[`M ${D},${te}`,`V ${le-lt}`,`Q ${D},${le} ${D-lt},${le}`,`H ${H+se+Gt}`].join(" "),pe=[`M ${H-se-Gt},${le}`,`H ${q+lt}`,`Q ${q},${le} ${q},${le-lt}`,`V ${te}`].join(" "));const de=ne,ie=re,me=de&&!ie,fe=me&&E===C,ye=me&&!!r&&!i,ke=i||de,Te=$.find(rt=>(rt.id||rt.ID)===v.toId),Se=ie?"#dc2626":Js(Te)||(O?"#5b9cf6":"#e8a947"),Ae=Se,_e=ke?.7:.3,nt=ke?1.5:1,Ye=se*2,Ze=H-se,vt=le-zt/2;let Ge,Qe,We;return ie?(Ge="var(--danger-bg)",Qe="var(--danger-border)",We="var(--danger)"):me||i?fe?(Ge=Se,Qe=Se,We="#ffffff"):(Ge=`${Se}18`,Qe=`${Se}70`,We=Se):(Ge="var(--surface2)",Qe="var(--border2)",We="var(--muted2)"),e.jsxs("g",{children:[e.jsx("path",{d:oe,fill:"none",style:{stroke:ke?Ae:"var(--border2)"},strokeWidth:nt,strokeDasharray:O?"none":"4,3",opacity:_e}),e.jsx("path",{d:pe,fill:"none",style:{stroke:ke?Ae:"var(--border2)"},strokeWidth:nt,strokeDasharray:O?"none":"4,3",opacity:_e,markerEnd:"url(#arr)"}),X&&e.jsxs("g",{style:{cursor:ye?"pointer":"default"},onMouseEnter:me?()=>R(C):void 0,onMouseLeave:me?()=>R(null):void 0,onClick:ye?()=>r(v):void 0,children:[J&&e.jsx("title",{children:`Blocked:
• `+W.map(rt=>typeof rt=="string"?rt:rt.message||rt.guardCode).join(`
• `)}),e.jsx("rect",{x:Ze-4,y:vt-4,width:Ye+8,height:zt+8,rx:Xs+4,fill:"transparent"}),e.jsx("rect",{x:Ze,y:vt,width:Ye,height:zt,rx:Xs,style:{fill:Ge,stroke:Qe},strokeWidth:de?1:.5}),e.jsx("text",{x:H,y:le+5,textAnchor:"middle",fontSize:"9",fontFamily:"var(--sans)",fontWeight:"700",style:{fill:We,userSelect:"none",pointerEvents:"none"},children:X})]})]},`t-${C}`)};return e.jsx("div",{className:"lc-diagram",children:e.jsxs("svg",{width:Y,height:z,viewBox:`0 0 ${Y} ${z}`,style:{fontFamily:"var(--mono)",overflow:"visible"},children:[e.jsxs("defs",{children:[e.jsx("marker",{id:"arr",markerWidth:"7",markerHeight:"7",refX:"5",refY:"3.5",orient:"auto",children:e.jsx("path",{d:"M0,0.5 L0,6.5 L6,3.5 z",fill:"context-stroke",opacity:"0.7"})}),e.jsxs("filter",{id:"glow",children:[e.jsx("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),K.map(I),G.map(I),$.map(v=>{const y=v.id||v.ID,F=v.name||v.NAME||y,C=v.is_frozen===1||v.IS_FROZEN===1,M=v.is_released===1||v.IS_RELEASED===1,L=[v.is_initial===1||v.IS_INITIAL===1?"INIT":null,C?"FROZEN":null,M?"REL":null].filter(Boolean).join(" · "),w=g[y],D=w-yt/2,q=V-jt/2,te=i||y===s;let le,H,ne;if(te){const W=Js(v);le=`${W}22`,H=W,ne=W}else le="var(--surface2)",H="var(--border2)",ne="var(--muted)";return e.jsxs("g",{filter:te?"url(#glow)":void 0,children:[e.jsx("rect",{x:D,y:q,width:yt,height:jt,rx:6,style:{fill:le,stroke:H},strokeWidth:te?1.5:1}),e.jsx("text",{x:w,y:V+(L?1:4),textAnchor:"middle",fontSize:"11",fontFamily:"var(--sans)",fontWeight:te?"700":"600",style:{fill:ne},children:F}),L&&e.jsx("text",{x:w,y:V+13,textAnchor:"middle",fontSize:"7",fontFamily:"var(--sans)",style:{fill:te?ne:"var(--muted2)"},opacity:"0.7",children:L})]},y)})]})})}const Wn=new Map;function Ke(t,s,{wrapBody:n=!0}={}){Wn.set(t,{Component:s,wrapBody:n})}function Ka(t){return Wn.get(t)??null}const Ja=new Map,$t=new Map;function Xa(t){t!=null&&t.id&&(Ja.set(t.id,t),$t.has(t.zone)||$t.set(t.zone,[]),$t.get(t.zone).push(t))}function Ya(t){return($t.get("editor")??[]).find(n=>{var r;return(r=n.matches)==null?void 0:r.call(n,t)})??null}function Za(t){var s;for(const n of $t.get("settings")??[])if((s=n.sections)!=null&&s[t])return{Component:n.sections[t],wrapBody:!0};return null}function Qa({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(""),[c,u]=l.useState("actions");if(l.useEffect(()=>{Ee.listActions(t).then(h=>{const b=Array.isArray(h)?h:[];if(a(b),!o){const E=[...new Set(b.map(R=>R.serviceCode).filter(Boolean))].sort();E.length>0&&i(E[0])}}).catch(()=>a([]))},[t]),r===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const d=[...new Set(r.map(h=>h.serviceCode).filter(Boolean))].sort(),p=h=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:c===h?"var(--accent)":"var(--muted)",borderBottom:c===h?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:o,onChange:h=>i(h.target.value),children:d.map(h=>e.jsx("option",{value:h,children:h},h))})]}),e.jsxs("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[e.jsx("button",{style:p("actions"),onClick:()=>u("actions"),children:"Actions"}),e.jsx("button",{style:p("algorithm-catalog"),onClick:()=>u("algorithm-catalog"),children:"Algorithm Catalog"})]}),c==="actions"&&e.jsx(eo,{userId:t,serviceCode:o,dbActions:r.filter(h=>h.serviceCode===o),canWrite:s,toast:n}),c==="algorithm-catalog"&&e.jsx(to,{userId:t,serviceCode:o,canWrite:s,toast:n})]})}function eo({userId:t,serviceCode:s,dbActions:n,canWrite:r,toast:a}){const[o,i]=l.useState(null),[c,u]=l.useState(null),[d,p]=l.useState(null),[h,b]=l.useState(null),[E,R]=l.useState({}),[$,f]=l.useState({}),g=o??n;function m(A,I){i(v=>(v??n).map(y=>y.id===A?{...y,description:I}:y))}l.useEffect(()=>{s&&(i(null),u(null),b(null),R({}),f({}),Promise.all([Ee.getServiceCatalog(s),Ee.listAllInstances(t,s)]).then(([A,I])=>{u(A),p(Array.isArray(I)?I:[])}).catch(()=>{u({handlers:[],guards:[]}),p([])}))},[t,s]);async function j(A){const I=await Ee.listActionGuards(t,A).catch(()=>[]);R(v=>({...v,[A]:Array.isArray(I)?I:[]}))}async function x(A){const I=await Ee.listActionWrappers(t,A).catch(()=>[]);f(v=>({...v,[A]:Array.isArray(I)?I:[]}))}function k(A){if(h===A){b(null);return}b(A),E[A]||j(A),$[A]||x(A)}async function _(A,I,v){try{await Ee.attachActionGuard(t,A,I,v||"HIDE",0),j(A),a("Guard attached","success")}catch(y){a(String(y),"error")}}async function G(A,I){try{await Ee.detachActionGuard(t,A,I),j(A),a("Guard detached","success")}catch(v){a(String(v),"error")}}async function K(A,I,v){try{await Ee.updateActionGuard(t,A,I,v),R(y=>({...y,[A]:(y[A]||[]).map(F=>F.id===I?{...F,effect:v}:F)}))}catch(y){a(String(y),"error")}}async function B(A,I,v){try{await Ee.attachActionWrapper(t,A,I,v,s),x(A),a("Wrapper attached","success")}catch(y){a(String(y),"error")}}if(c===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const P={};g.forEach(A=>{P[(A.actionCode||A.action_code||"").toUpperCase()]=A});const S=c.handlers||[],N=new Set([...S.map(A=>(A.code||"").toUpperCase()),...Object.keys(P)]),V=Array.from(N).map(A=>{const I=P[A],v=S.find(y=>(y.code||"").toUpperCase()===A);return I?{...I,_fromDb:!0,_module:I.handlerModuleName||I.handler_module_name||(v==null?void 0:v.module)||"unknown"}:{id:null,actionCode:v.code,displayName:v.label||v.code,scope:null,displayCategory:null,displayOrder:9999,description:null,_fromDb:!1,_module:v.module||"unknown"}});if(V.sort((A,I)=>A._fromDb&&I._fromDb?(A.displayOrder??0)-(I.displayOrder??0):A._fromDb?-1:I._fromDb?1:(A.actionCode||"").localeCompare(I.actionCode||"")),V.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No actions registered for ",e.jsx("strong",{children:s}),"."]});const Y={};V.forEach(A=>{const I=A._module||"unknown";Y[I]||(Y[I]=[]),Y[I].push(A)});const z=(d||[]).filter(A=>(A.typeName||"").toLowerCase().includes("guard")),U=(d||[]).filter(A=>(A.typeName||"").toLowerCase().includes("wrapper"));return e.jsx("div",{className:"settings-list",children:Object.entries(Y).sort(([A],[I])=>A.localeCompare(I)).map(([A,I])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx(Fn,{module:A}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",I.length,")"]})]}),I.map(v=>{const y=v.id||v.actionCode,F=h===y,C=v.actionCode||v.action_code,M=v.displayName||v.display_name||C,O=v.scope,L=v.displayCategory||v.display_category,w=E[y]||[],D=$[y]||[];return e.jsxs("div",{className:"settings-card",style:{marginBottom:4,opacity:v._fromDb?1:.6},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>v._fromDb&&k(y),style:{display:"flex",alignItems:"center",cursor:v._fromDb?"pointer":"default"},children:[v._fromDb?e.jsx("span",{className:"settings-card-chevron",children:F?e.jsx(Ve,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ue,{size:13,strokeWidth:2,color:"var(--muted)"})}):e.jsx("span",{className:"settings-card-chevron",style:{width:18,color:"var(--muted2)",fontSize:9},children:"—"}),e.jsx("span",{className:"settings-card-name",children:M}),!v._fromDb&&e.jsx("span",{style:{fontSize:9,color:"var(--muted2)",marginLeft:6,fontStyle:"italic"},children:"not seeded"}),e.jsx("span",{style:{flex:1}}),O&&e.jsx("span",{className:"settings-badge",children:O}),L&&e.jsx("span",{className:"settings-badge",style:{marginLeft:4},children:L})]}),F&&v._fromDb&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:e.jsxs("span",{children:["Code: ",e.jsx("code",{children:C})]})}),e.jsx(so,{description:v.description,actionId:y,userId:t,canWrite:r,onSaved:q=>m(y,q)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Guards"}),w.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No guards attached"}),w.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%",marginBottom:8},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Guard"}),e.jsx("th",{children:"Effect"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:w.map(q=>e.jsxs("tr",{children:[e.jsxs("td",{children:[q.algorithmName||q.algorithm_name,(q.algorithmCode||q.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",q.algorithmCode||q.algorithm_code,")"]})]}),e.jsx("td",{children:r?e.jsxs("select",{className:"field-input",style:{fontSize:11,padding:"1px 4px"},value:q.effect,onChange:te=>K(y,q.id,te.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}):e.jsx("span",{className:`settings-badge${q.effect==="BLOCK"?" badge-warn":""}`,children:q.effect})}),e.jsx("td",{style:{textAlign:"right"},children:r&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>G(y,q.id),children:e.jsx(St,{size:10})})})]},q.id))})]}),r&&z.length>0&&e.jsx(ro,{instances:z,onAttach:(q,te)=>_(y,q,te)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4,marginTop:12},children:"Wrappers"}),D.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No wrappers"}),D.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Order"}),e.jsx("th",{children:"Wrapper"}),e.jsx("th",{children:"Instance"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:D.map(q=>e.jsxs("tr",{children:[e.jsx("td",{style:{width:50},children:q.executionOrder||q.execution_order}),e.jsxs("td",{children:[q.algorithmName||q.algorithm_name,(q.algorithmCode||q.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",q.algorithmCode||q.algorithm_code,")"]})]}),e.jsx("td",{style:{fontSize:11,color:"var(--muted)"},children:q.instanceName||q.instance_name}),e.jsx("td",{style:{textAlign:"right"},children:r&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:async()=>{try{await Ee.detachActionWrapper(t,y,q.id),x(y),a("Wrapper detached","success")}catch(te){a(String(te),"error")}},children:e.jsx(St,{size:10})})})]},q.id))})]}),r&&U.length>0&&e.jsx(no,{instances:U,onAttach:(q,te)=>B(y,q,te)})]})]},y)})]},A))})}const Ys=[{key:"handler",label:"Action Handler",filter:t=>t.toLowerCase().includes("handler")},{key:"guard",label:"Guard",filter:t=>t.toLowerCase().includes("guard")},{key:"wrapper",label:"Wrapper",filter:t=>t.toLowerCase().includes("wrapper")}];function to({userId:t,serviceCode:s}){const[n,r]=l.useState(null),[a,o]=l.useState("handler");l.useEffect(()=>{s&&(r(null),Ee.listAllInstances(t,s).then(d=>r(Array.isArray(d)?d:[])).catch(()=>r([])))},[t,s]);const i=d=>({padding:"4px 12px",fontSize:11,cursor:"pointer",background:"none",border:"none",color:a===d?"var(--accent)":"var(--muted)",borderBottom:a===d?"2px solid var(--accent)":"2px solid transparent"});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const c=Ys.find(d=>d.key===a),u=(n||[]).filter(d=>c==null?void 0:c.filter(d.typeName||d.type_name||""));return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:Ys.map(d=>e.jsx("button",{style:i(d.key),onClick:()=>o(d.key),children:d.label},d.key))}),u.length===0?e.jsxs("div",{style:{padding:"16px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No ",c==null?void 0:c.label.toLowerCase()," instances for ",e.jsx("strong",{children:s}),"."]}):e.jsx("div",{className:"settings-list",children:u.map(d=>{const p=a==="guard"?e.jsx(gt,{size:12,color:"var(--accent)",strokeWidth:1.8}):a==="wrapper"?e.jsx(Ss,{size:12,color:"var(--muted2)",strokeWidth:1.8}):e.jsx(ks,{size:12,color:"var(--muted)",strokeWidth:1.8});return e.jsxs("div",{className:"settings-card",style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"},children:[p,e.jsx("span",{className:"settings-card-name",style:{flex:1,fontSize:12},children:d.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:d.algorithmCode||d.algorithm_code})]},d.id)})})]})}function so({description:t,actionId:s,userId:n,canWrite:r,onSaved:a}){const[o,i]=l.useState(!1),[c,u]=l.useState(t||""),d=l.useCallback(async()=>{await Ee.updateAction(n,s,{description:c}),a(c),i(!1)},[n,s,c,a]);return e.jsxs("div",{style:{marginBottom:10},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Description"}),o?e.jsxs("div",{style:{display:"flex",gap:6},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11},value:c,onChange:p=>u(p.target.value)}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:d,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{u(t||""),i(!1)},children:"✕"})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{style:{fontSize:11,color:t?"var(--text)":"var(--muted)",fontStyle:t?"normal":"italic"},children:t||"No description"}),r&&e.jsx("button",{className:"btn btn-xs",onClick:()=>i(!0),children:"Edit"})]})]})}function no({instances:t,onAttach:s}){const[n,r]=l.useState(""),[a,o]=l.useState(10);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>r(i.target.value),children:[e.jsx("option",{value:"",children:"— attach wrapper —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsx("input",{type:"number",className:"field-input",style:{fontSize:11,width:60,padding:"3px 4px"},value:a,min:1,onChange:i=>o(Number(i.target.value)),placeholder:"Order"}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,a),r(""))},children:[e.jsx(De,{size:10})," Attach"]})]})}function ro({instances:t,onAttach:s}){const[n,r]=l.useState(""),[a,o]=l.useState("HIDE");return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>r(i.target.value),children:[e.jsx("option",{value:"",children:"— attach guard —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsxs("select",{className:"field-input",style:{fontSize:11,width:90,padding:"3px 4px"},value:a,onChange:i=>o(i.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,a),r(""))},children:[e.jsx(De,{size:10})," Attach"]})]})}function ao({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(null),[c,u]=l.useState(""),[d,p]=l.useState("catalog"),[h,b]=l.useState(null),[E,R]=l.useState(null),[$,f]=l.useState(24),g=l.useCallback(()=>{a(null),i(null),Promise.all([Ee.listAlgorithms(t),Ee.listAllInstances(t)]).then(([_,G])=>{const K=Array.isArray(_)?_:[],B=Array.isArray(G)?G:[];if(a(K),i(B),!c){const P=[...new Set(K.map(S=>S.serviceCode).filter(Boolean))].sort();P.length>0&&u(P[0])}}).catch(()=>{a([]),i([])})},[t]);l.useEffect(()=>{g()},[g]),l.useEffect(()=>{b(null),R(null)},[c]);const m=l.useCallback(()=>{Ee.getAlgorithmStats(t,c).then(_=>b(Array.isArray(_)?_:[])).catch(()=>b([]))},[t,c]),j=l.useCallback(_=>{Ee.getAlgorithmTimeseries(t,_,c).then(G=>R(Array.isArray(G)?G:[])).catch(()=>R([]))},[t,c]);if(r===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const x=[...new Set(r.map(_=>_.serviceCode).filter(Boolean))].sort(),k=_=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:d===_?"var(--accent)":"var(--muted)",borderBottom:d===_?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:c,onChange:_=>u(_.target.value),children:x.map(_=>e.jsx("option",{value:_,children:_},_))})]}),e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[["catalog","Catalog"],["stats","Execution Stats"],["graph","Usage Graph"]].map(([_,G])=>e.jsx("button",{style:k(_),onClick:()=>{p(_),_==="stats"&&!h&&m(),_==="graph"&&!E&&j($)},children:G},_))}),c&&d==="catalog"&&e.jsx(oo,{userId:t,serviceCode:c,algorithms:r.filter(_=>_.serviceCode===c),instances:o?o.filter(_=>_.serviceCode===c):[],canWrite:s,toast:n,onReload:g}),d==="stats"&&c&&e.jsx(lo,{userId:t,serviceCode:c,canWrite:s,toast:n,stats:h,onLoad:m,onReset:async()=>{await Ee.resetAlgorithmStats(t,c).catch(()=>{}),b([]),n("Stats reset","success")}}),d==="graph"&&c&&e.jsx(co,{timeseries:E,tsHours:$,onLoad:_=>{f(_),j(_)}})]})}function oo({userId:t,serviceCode:s,algorithms:n,instances:r,canWrite:a,toast:o,onReload:i}){const[c,u]=l.useState(null),[d,p]=l.useState(""),[h,b]=l.useState({});l.useEffect(()=>{u(null),p(""),b({})},[s]);async function E(f){const g=d.trim();if(!g){o("Instance name is required","error");return}try{await Ee.createInstance(t,f,g,s),p(""),i(),o("Instance created","success")}catch(m){o(String(m),"error")}}if(n.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No algorithms registered for ",e.jsx("strong",{children:s}),"."]});const R={};n.forEach(f=>{const g=f.typeName||f.type_name||"Unknown",m=f.moduleName||f.module_name||"unknown";R[g]||(R[g]={}),R[g][m]||(R[g][m]=[]),R[g][m].push(f)});const $={};return(r||[]).forEach(f=>{const g=f.algorithmId||f.algorithm_id;$[g]||($[g]=[]),$[g].push(f)}),e.jsx("div",{className:"settings-list",children:Object.entries(R).sort(([f],[g])=>f.localeCompare(g)).map(([f,g])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx("span",{style:{fontSize:12,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".04em"},children:f}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".06em"},children:"type"})]}),Object.entries(g).sort(([m],[j])=>m.localeCompare(j)).map(([m,j])=>e.jsxs("div",{style:{marginBottom:14,marginLeft:4},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6},children:[e.jsx(Fn,{module:m}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",j.length,")"]})]}),j.map(x=>{const k=x.id,_=c===k,G=$[k]||[],K=x.code,B=x.name||K;return e.jsxs("div",{className:"settings-card",style:{marginBottom:4},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>{const P=_?null:k;u(P),p(""),P&&!h[P]&&Ee.listAlgorithmParameters(t,P).then(S=>b(N=>({...N,[P]:Array.isArray(S)?S:[]}))).catch(()=>b(S=>({...S,[P]:[]})))},style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:_?e.jsx(Ve,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ue,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(Nn,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:B}),e.jsx("span",{className:"settings-card-id",children:K}),e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:x.description||""}),e.jsxs("span",{className:"settings-badge",style:{marginLeft:8},children:[G.length," instance",G.length!==1?"s":""]})]}),_&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsxs("div",{style:{display:"flex",gap:16,fontSize:11,color:"var(--muted)",marginBottom:10},children:[e.jsxs("span",{children:["Handler: ",e.jsx("code",{style:{color:"var(--text)"},children:x.handlerRef||x.handler_ref||"—"})]}),e.jsxs("span",{children:["Type: ",e.jsx("code",{style:{color:"var(--text)"},children:f})]})]}),(()=>{const P=h[k];return!P||P.length===0?null:e.jsxs("div",{style:{marginBottom:12},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Parameter Schema"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsx("tr",{style:{borderBottom:"1px solid var(--border)"},children:["Name","Label","Type","Req.","Default"].map(S=>e.jsx("th",{style:{textAlign:S==="Req."?"center":"left",padding:"3px 6px",color:"var(--muted)",fontWeight:600,fontSize:10},children:S},S))})}),e.jsx("tbody",{children:P.map(S=>{const N=S.paramName||S.param_name,V=S.paramLabel||S.param_label||N,Y=S.dataType||S.data_type||"STRING",z=S.required===1||S.required===!0,U=S.defaultValue||S.default_value||"";return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--accent)"},children:N}),e.jsx("td",{style:{padding:"3px 6px"},children:V}),e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--muted)",fontSize:10},children:Y}),e.jsx("td",{style:{padding:"3px 6px",textAlign:"center"},children:z?"✓":""}),e.jsx("td",{style:{padding:"3px 6px",color:U?"var(--text)":"var(--muted)",fontFamily:"var(--mono)",fontSize:10},children:U||"—"})]},S.id||N)})})]})]})})(),e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Instances"}),G.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"No instances"}),G.map(P=>e.jsx(io,{inst:P,algo:x,userId:t,canWrite:a,toast:o,onReload:i},P.id)),a&&e.jsxs("div",{style:{display:"flex",gap:6,marginTop:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11,padding:"3px 6px"},placeholder:"New instance name…",value:d,onChange:P=>p(P.target.value),onKeyDown:P=>{P.key==="Enter"&&E(k)}}),e.jsxs("button",{className:"btn btn-sm",style:{fontSize:10},disabled:!d.trim(),onClick:()=>E(k),children:[e.jsx(De,{size:10,strokeWidth:2.5})," Create"]})]})]})]},k)})]},m))]},f))})}function io({inst:t,algo:s,userId:n,canWrite:r,toast:a,onReload:o}){var j;const[i,c]=l.useState(!1),[u,d]=l.useState(null),[p,h]=l.useState(!1),[b,E]=l.useState(t.name||"");async function R(){if(u===null)try{const x=await Ee.getInstanceParams(n,t.id);d(Array.isArray(x)?x:[])}catch{d([])}}function $(){i||R(),c(x=>!x)}async function f(){if(!b.trim()||b.trim()===t.name){h(!1);return}try{await Ee.updateInstance(n,t.id,b.trim()),a("Instance renamed","success"),o()}catch(x){a(String(x),"error")}h(!1)}async function g(){try{await Ee.deleteInstance(n,t.id),a("Instance deleted","success"),o()}catch(x){a(String(x),"error")}}async function m(x,k){try{await Ee.setInstanceParam(n,t.id,x,k);const _=await Ee.getInstanceParams(n,t.id);d(Array.isArray(_)?_:[])}catch(_){a(String(_),"error")}}return e.jsxs("div",{className:"settings-card",style:{marginBottom:2},children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",cursor:"pointer"},onClick:$,children:[e.jsx("span",{className:"settings-card-chevron",children:i?e.jsx(Ve,{size:11,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ue,{size:11,strokeWidth:2,color:"var(--muted)"})}),p?e.jsx("input",{className:"field-input",style:{fontSize:12,padding:"1px 4px",flex:1},autoFocus:!0,value:b,onChange:x=>E(x.target.value),onBlur:f,onKeyDown:x=>{x.key==="Enter"&&f(),x.key==="Escape"&&(h(!1),E(t.name))},onClick:x=>x.stopPropagation()}):e.jsx("span",{className:"settings-card-name",style:{fontSize:12,flex:1},children:t.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:(j=t.id)==null?void 0:j.slice(-8)}),r&&e.jsxs("span",{style:{display:"flex",gap:4,marginLeft:8},onClick:x=>x.stopPropagation(),children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>{h(!0),E(t.name)},children:e.jsx(bt,{size:10})}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:g,children:e.jsx(St,{size:10})})]})]}),i&&e.jsxs("div",{className:"settings-card-body",style:{padding:"6px 12px 8px 26px"},children:[u===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading params…"}),u!==null&&u.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No parameters"}),u!==null&&u.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Parameter"}),e.jsx("th",{children:"Value"})]})}),e.jsx("tbody",{children:u.map(x=>e.jsxs("tr",{children:[e.jsxs("td",{style:{fontSize:11},children:[x.paramLabel||x.param_label||x.paramName||x.param_name,(x.dataType||x.data_type)&&e.jsx("span",{style:{color:"var(--muted2)",fontSize:9,marginLeft:4},children:x.dataType||x.data_type})]}),e.jsx("td",{children:r?e.jsx(po,{param:x,onSave:k=>m(x.algorithmParameterId||x.algorithm_parameter_id||x.id,k)}):e.jsx("span",{style:{fontSize:11,fontFamily:"var(--mono)"},children:x.value||e.jsx("em",{style:{color:"var(--muted)"},children:"—"})})})]},x.id))})]})]})]})}function lo({stats:t,onLoad:s,onReset:n}){return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:s,children:"Refresh"}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:n,children:"Reset"})]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading stats…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No algorithm executions recorded yet"}),t&&t.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Algorithm"}),e.jsx("th",{style:{textAlign:"right"},children:"Calls"}),e.jsx("th",{style:{textAlign:"right"},children:"Min (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Avg (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Max (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Total (ms)"}),e.jsx("th",{children:"Last Update"})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:r.algorithmCode})}),e.jsx("td",{style:{textAlign:"right"},children:r.callCount}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.minMs=="number"?r.minMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.avgMs=="number"?r.avgMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.maxMs=="number"?r.maxMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.totalMs=="number"?r.totalMs.toFixed(1):"—"}),e.jsx("td",{style:{fontSize:10,color:"var(--muted)"},children:r.lastFlushed||"—"})]},r.algorithmCode))})]})]})}function co({timeseries:t,tsHours:s,onLoad:n}){const o={t:20,r:20,b:40,l:50},i=800-o.l-o.r,c=200-o.t-o.b;function u(h,b,E){if(h.length===0)return e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No data"});const R=Math.max(...h.map($=>$.calls),1);return e.jsxs("svg",{viewBox:"0 0 800 200",style:{width:"100%",height:200,display:"block"},children:[[0,.25,.5,.75,1].map($=>{const f=o.t+c*(1-$);return e.jsxs("g",{children:[e.jsx("line",{x1:o.l,x2:800-o.r,y1:f,y2:f,stroke:"var(--border)",strokeWidth:.5}),e.jsx("text",{x:o.l-4,y:f+3,textAnchor:"end",fill:"var(--muted)",fontSize:9,children:Math.round(R*$)})]},$)}),h.map(($,f)=>{const g=Math.max(i/h.length-1,2),m=o.l+f/h.length*i,j=$.calls/R*c,x=o.t+c-j,k=h.length<20||f%Math.ceil(h.length/12)===0,_=$.windowStart.replace("T"," ").slice(11,16);return e.jsxs("g",{children:[e.jsx("rect",{x:m,y:x,width:g,height:j,fill:E,opacity:.8,rx:1,children:e.jsxs("title",{children:[$.windowStart.replace("T"," ").slice(0,16)," — ",$.calls," calls, ",$.totalMs.toFixed(1),"ms"]})}),k&&e.jsx("text",{x:m+g/2,y:200-o.b+14,textAnchor:"middle",fill:"var(--muted)",fontSize:8,transform:`rotate(-45, ${m+g/2}, ${200-o.b+14})`,children:_})]},f)}),e.jsx("text",{x:12,y:o.t+c/2,textAnchor:"middle",fill:"var(--muted)",fontSize:9,transform:`rotate(-90, 12, ${o.t+c/2})`,children:"Calls"}),e.jsx("text",{x:o.l,y:12,fill:"var(--text)",fontSize:11,fontWeight:600,children:b})]})}const d={};(t||[]).forEach(h=>{d[h.windowStart]||(d[h.windowStart]={calls:0,totalMs:0}),d[h.windowStart].calls+=h.callCount||0,d[h.windowStart].totalMs+=h.totalMs||0});const p=Object.keys(d).sort().map(h=>({windowStart:h,...d[h]}));return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12,alignItems:"center"},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>n(s),children:"Refresh"}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)"},children:"Window:"}),[6,12,24,48].map(h=>e.jsxs("button",{className:"btn btn-xs",onClick:()=>n(h),style:{background:s===h?"var(--accent)":void 0,color:s===h?"#fff":void 0},children:[h,"h"]},h))]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No windowed data yet. Stats are bucketed every 15 seconds on flush."}),t&&t.length>0&&e.jsx("div",{style:{background:"var(--bg2)",borderRadius:6,padding:12},children:u(p,"All Algorithms (aggregate)","#3b82f6")})]})}function po({param:t,onSave:s}){const[n,r]=l.useState(t.value||""),[a,o]=l.useState(!1);function i(c){r(c),o(c!==(t.value||""))}return e.jsxs("div",{style:{display:"flex",gap:4,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{fontSize:11,padding:"1px 4px",flex:1},value:n,onChange:c=>i(c.target.value),onBlur:()=>{a&&(s(n),o(!1))}}),a&&e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>{s(n),o(!1)},children:"Save"})]})}function Zs(t){return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(t??"—")}function uo({canWrite:t,toast:s}){const[n,r]=l.useState(null),[a,o]=l.useState(!1),[i,c]=l.useState(null);function u(){Z.searchInfo().then(r).catch(()=>r({available:!1}))}l.useEffect(()=>{u()},[]);async function d(){o(!0);try{const h=await Z.reindexSearch();c(h.queued),s==null||s(`Re-index queued: ${h.queued} nodes`),setTimeout(u,2e3)}catch{s==null||s("Re-index failed — check psm-api logs")}finally{o(!1)}}const p=(n==null?void 0:n.available)!==!1;return e.jsxs("div",{children:[e.jsx("div",{className:"nats-section-title",children:"Index statistics"}),e.jsxs("div",{className:"nats-stats-grid",style:{gridTemplateColumns:"repeat(3,1fr)"},children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Status"}),e.jsx("span",{className:"nats-stat-value",style:{fontSize:13,color:p?"var(--success)":"var(--warn)"},children:n===null?"…":p?"Online":"Unavailable"})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Nodes"}),e.jsx("span",{className:"nats-stat-value",children:n===null?"…":Zs(n.nodeCount)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Edges"}),e.jsx("span",{className:"nats-stat-value",children:n===null?"…":Zs(n.edgeCount)})]})]}),e.jsx("div",{className:"nats-section-title",style:{marginTop:20},children:"Re-index"}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:10,lineHeight:1.5},children:"Republishes all PSM nodes through the event pipeline so the search index picks up any new stored fields (e.g. after updating the extractor)."}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:d,disabled:a||!t,children:a?"Queuing…":"Re-index now"}),i!=null&&e.jsxs("span",{style:{fontSize:12,color:"var(--muted)"},children:["Last run: ",i," nodes queued"]})]})]})}function mo(t){if(!t)return{fg:"var(--muted2)",bg:"rgba(120,130,150,.14)"};let s=0;for(let r=0;r<t.length;r++)s=s*31+t.charCodeAt(r)&16777215;const n=s%360;return{fg:`hsl(${n},70%,72%)`,bg:`hsl(${n},55%,22%)`}}function Fn({module:t}){if(!t)return null;const s=mo(t);return e.jsx("span",{title:`Spring Modulith module: ${t}`,style:{display:"inline-block",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700,letterSpacing:".06em",fontFamily:"var(--mono)",textTransform:"uppercase",background:s.bg,color:s.fg,border:`1px solid ${s.fg}33`,verticalAlign:"middle"},children:t})}function ho({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(!1),[c,u]=l.useState({displayName:"",email:""}),[d,p]=l.useState(!1);l.useEffect(()=>{Z.getUser(t,t).then(a).catch(()=>{})},[t]);function h(){u({displayName:(r==null?void 0:r.displayName)||"",email:(r==null?void 0:r.email)||""}),i(!0)}async function b(){p(!0);try{await Z.updateUser(t,t,c.displayName.trim(),c.email.trim());const E=await Z.getUser(t,t);a(E),i(!1),n("Profile updated","success")}catch{n("Failed to update profile","error")}finally{p(!1)}}return r?e.jsxs("div",{className:"settings-list",children:[e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx(Qt,{size:15,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{fontSize:13},children:r.username}),r.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",children:"Admin"})]}),o?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(Fe,{label:"Display Name",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.displayName,onChange:E=>u(R=>({...R,displayName:E.target.value}))})}),e.jsx(Fe,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:c.email,onChange:E=>u(R=>({...R,email:E.target.value}))})}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:4},children:[e.jsx("button",{className:"btn btn-primary",onClick:b,disabled:d,children:d?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>i(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,paddingLeft:23},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:r.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:r.email||"—"})]}),s&&e.jsx("div",{style:{marginTop:4},children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:h,children:[e.jsx(bt,{size:11,strokeWidth:2}),"Edit"]})})]})]}),e.jsx(fo,{})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}const xo=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function fo(){const[t,s]=l.useState(Xt);function n(r){s(r),Es(r)}return e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:10},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:xo.map(r=>e.jsxs("button",{type:"button",className:`theme-option${t===r.value?" theme-option--active":""}`,onClick:()=>n(r.value),children:[e.jsx("span",{className:"theme-option-icon",children:r.icon}),e.jsx("span",{children:r.label})]},r.value))})]})}function ss({title:t,onClose:s,onSave:n,saving:r,saveLabel:a="Save",children:o,width:i=480}){return e.jsx("div",{className:"diff-overlay",style:{zIndex:600},onClick:c=>{c.target===c.currentTarget&&s()},children:e.jsxs("div",{className:"diff-modal",style:{width:i,maxHeight:"85vh",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"diff-header",children:[e.jsx("span",{className:"diff-title",children:t}),e.jsx("button",{className:"diff-close",onClick:s,children:"×"})]}),e.jsx("div",{style:{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12},children:o}),e.jsxs("div",{style:{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0},children:[e.jsx("button",{className:"btn",onClick:s,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:n,disabled:r,children:r?"Saving…":a})]})]})})}function Fe({label:t,children:s}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx("label",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:t}),s]})}function go({userId:t,roleId:s,canWrite:n,toast:r,nodePerms:a,lcPerms:o,nodeTypes:i,transitions:c}){const[u,d]=l.useState(null);l.useEffect(()=>{d(null),Z.getRolePolicies(t,s).then(f=>{const g=new Set;(Array.isArray(f)?f:[]).forEach(m=>{const j=m.permissionCode||m.permission_code,x=m.nodeTypeId||m.node_type_id||"",k=m.transitionId||m.transition_id||"";g.add(`${j}|${x}|${k}`)}),d(g)}).catch(()=>d(new Set))},[t,s]);const p=(f,g,m)=>`${f}|${g||""}|${m||""}`;async function h(f,g,m){if(!n||!u)return;const j=p(f,g,m),x=u.has(j);d(k=>{const _=new Set(k);return x?_.delete(j):_.add(j),_});try{x?await Z.removePermissionGrant(t,g,f,s,m||null):await Z.addPermissionGrant(t,g,f,s,m||null)}catch(k){d(_=>{const G=new Set(_);return x?G.add(j):G.delete(j),G}),r(k,"error")}}if(!u)return e.jsx("div",{style:{padding:"4px 0",color:"var(--muted)",fontSize:11},children:"Loading policies…"});if(i.length===0)return e.jsx("div",{className:"settings-empty-row",children:"No node types defined."});const b={padding:"4px 8px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)",background:"var(--bg2, var(--bg))",whiteSpace:"nowrap",verticalAlign:"bottom"},E={padding:"3px 6px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)"};function R({permCode:f,ntId:g,transId:m}){const j=u.has(p(f,g,m));return e.jsx("td",{style:E,children:e.jsx("button",{className:"panel-icon-btn",disabled:!n,title:n?j?"Revoke":"Grant":"Requires MANAGE_ROLES",onClick:()=>h(f,g,m),style:{margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",width:22,height:22,cursor:n?"pointer":"default"},children:j?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})})})}function $({ntId:f,ntName:g}){return e.jsxs("td",{style:{...E,textAlign:"left",position:"sticky",left:0,background:"var(--bg)",zIndex:1,minWidth:120},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"var(--text)"},children:g}),e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--muted)"},children:f})]})}return e.jsxs("div",{children:[a.length>0&&e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Node Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...b,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),a.map(f=>e.jsxs("th",{style:{...b,minWidth:72},children:[e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--accent)",marginBottom:1},children:f.permissionCode}),e.jsx("div",{style:{fontSize:9,color:"var(--muted)",fontWeight:400},children:f.displayName})]},f.permissionCode))]})}),e.jsx("tbody",{children:i.map(f=>{const g=f.id||f.ID,m=f.name||f.NAME||g;return e.jsxs("tr",{children:[e.jsx($,{ntId:g,ntName:m}),a.map(j=>e.jsx(R,{permCode:j.permissionCode,ntId:g,transId:null},j.permissionCode))]},g)})})]})})]}),o.length>0&&c.length>0&&e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Lifecycle Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type + transition check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...b,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),c.map(f=>e.jsx("th",{style:{...b,minWidth:100},children:e.jsx("div",{style:{fontSize:9,color:"var(--text)",fontWeight:500},children:f.label})},f.id))]})}),e.jsx("tbody",{children:i.filter(f=>f.lifecycle_id||f.lifecycleId).map(f=>{const g=f.id||f.ID,m=f.name||f.NAME||g,j=f.lifecycle_id||f.lifecycleId;return e.jsxs("tr",{children:[e.jsx($,{ntId:g,ntName:m}),c.map(x=>x.lifecycleId!==j?e.jsx("td",{style:E,children:e.jsx("span",{style:{color:"var(--border)",fontSize:11},children:"—"})},x.id):e.jsx(R,{permCode:o[0].permissionCode,ntId:g,transId:x.id},x.id))]},g)})})]})})]}),a.length===0&&o.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No permissions configured."})]})}function bo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState([]),[o,i]=l.useState(!0),[c,u]=l.useState(!1),[d,p]=l.useState({name:"",description:""}),[h,b]=l.useState(!1),[E,R]=l.useState(null),[$,f]=l.useState({}),[g,m]=l.useState({}),[j,x]=l.useState(!1);function k(){return Z.listProjectSpaces(t).then(P=>a(Array.isArray(P)?P:[]))}l.useEffect(()=>{k().finally(()=>i(!1))},[t]),l.useEffect(()=>{mt.getRegistryTags().then(f).catch(()=>{})},[]);async function _(){if(d.name.trim()){b(!0);try{await Z.createProjectSpace(t,d.name.trim(),d.description.trim()||null),await k(),u(!1),p({name:"",description:""})}catch(P){n(P,"error")}finally{b(!1)}}}async function G(P){if(E===P){R(null);return}R(P);try{const S=await Z.getProjectSpaceServiceTags(t,P);m(S||{})}catch{m({})}}async function K(P){const S=P.id||P.ID,N=P.isolated===!0;try{await Z.setProjectSpaceIsolated(t,S,!N),await k(),n(N?"Isolation disabled":"Isolation enabled")}catch(V){n(V,"error")}}async function B(P,S,N){x(!0);try{await Z.setProjectSpaceServiceTags(t,P,S,N);const V=await Z.getProjectSpaceServiceTags(t,P);m(V||{}),n("Tags updated")}catch(V){n(V,"error")}finally{x(!1)}}return o?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-list",children:[c&&e.jsxs(ss,{title:"New Project Space",onClose:()=>{u(!1),p({name:"",description:""})},onSave:_,saving:h,saveLabel:"Create",children:[e.jsx(Fe,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:d.name,onChange:P=>p(S=>({...S,name:P.target.value})),placeholder:"e.g. Prototype-2026"})}),e.jsx(Fe,{label:"Description",children:e.jsx("input",{className:"field-input",value:d.description,onChange:P=>p(S=>({...S,description:P.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{p({name:"",description:""}),u(!0)},children:[e.jsx(De,{size:11,strokeWidth:2.5}),"New space"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No project spaces yet."}),r.map(P=>{const S=P.id||P.ID,N=P.name||P.NAME||S,V=P.description||P.DESCRIPTION||"",Y=P.active!==!1&&P.ACTIVE!==!1,z=P.isolated===!0,U=P.parentId||P.PARENT_ID||null,A=E===S;return e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer"},onClick:()=>G(S),children:[A?e.jsx(Ve,{size:12}):e.jsx(Ue,{size:12}),e.jsx(Bt,{size:13,color:Y?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:N}),e.jsx("span",{className:"settings-card-id",children:S}),U&&e.jsx("span",{className:"settings-badge",title:`Child of ${U}`,children:"child"}),z&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Isolated"}),!Y&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"})]}),V&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:19},children:V}),A&&e.jsxs("div",{style:{marginTop:10,paddingLeft:19,borderTop:"1px solid var(--border)",paddingTop:10},children:[s&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10},children:[e.jsxs("label",{style:{fontSize:11,display:"flex",alignItems:"center",gap:6,cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:z,onChange:()=>K(P)}),e.jsx("span",{children:"Isolated"})]}),e.jsx("span",{className:"muted",style:{fontSize:10},children:"Exclusive tag ownership, no untagged routing"})]}),e.jsx("div",{style:{fontSize:11,fontWeight:600,marginBottom:6},children:"Service Tags"}),Object.keys($).length===0?e.jsx("div",{className:"muted",style:{fontSize:11},children:"No services registered with tags."}):e.jsxs("table",{className:"status-table",style:{fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service"}),e.jsx("th",{children:"Available Tags"}),e.jsx("th",{children:"Assigned"}),s&&e.jsx("th",{})]})}),e.jsx("tbody",{children:Object.entries($).map(([I,v])=>{const y=g[I]||[];return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:I})}),e.jsx("td",{children:v.length===0?e.jsx("span",{className:"muted",children:"none"}):v.map(F=>e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",margin:"1px 2px",borderRadius:3,fontSize:10,background:y.includes(F)?"var(--accent-bg)":"var(--bg2)",color:y.includes(F)?"var(--accent)":"var(--muted)",border:`1px solid ${y.includes(F)?"var(--accent)":"var(--border)"}`,cursor:s?"pointer":"default"},onClick:s?()=>{const C=y.includes(F)?y.filter(M=>M!==F):[...y,F];B(S,I,C)}:void 0,title:s?y.includes(F)?"Click to remove":"Click to assign":"",children:F},F))}),e.jsx("td",{children:y.length===0?e.jsx("span",{className:"muted",children:"—"}):y.join(", ")}),s&&e.jsx("td",{children:y.length>0&&e.jsx("button",{className:"btn btn-sm btn-ghost",style:{fontSize:10,padding:"1px 6px"},onClick:()=>B(S,I,[]),disabled:j,children:"clear"})})]},I)})})]})]})]},S)})]})}function vo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(null),[c,u]=l.useState({}),[d,p]=l.useState(!1),[h,b]=l.useState(null),E=l.useCallback(()=>Z.getRoles(t).then(f=>a(Array.isArray(f)?f:[])),[t]);l.useEffect(()=>{E()},[E]);async function R(){var f,g,m;if((f=c.name)!=null&&f.trim()){p(!0);try{o==="create"?await Z.createRole(t,c.name.trim(),((g=c.description)==null?void 0:g.trim())||null):await Z.updateRole(t,o.role.id,c.name.trim(),((m=c.description)==null?void 0:m.trim())||null),await E(),i(null)}catch(j){n(j,"error")}finally{p(!1)}}}async function $(f){if(window.confirm(`Delete role "${f.name}"?
All user assignments for this role will also be removed.`)){b(f.id);try{await Z.deleteRole(t,f.id),await E()}catch(g){n(g,"error")}finally{b(null)}}}return r?e.jsxs("div",{className:"settings-list",children:[o&&e.jsxs(ss,{title:o==="create"?"New Role":`Edit — ${o.role.name}`,onClose:()=>i(null),onSave:R,saving:d,saveLabel:o==="create"?"Create":"Save",children:[e.jsx(Fe,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.name||"",onChange:f=>u(g=>({...g,name:f.target.value})),placeholder:"e.g. APPROVER"})}),e.jsx(Fe,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,style:{resize:"vertical"},value:c.description||"",onChange:f=>u(g=>({...g,description:f.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{u({name:"",description:""}),i("create")},children:[e.jsx(De,{size:11,strokeWidth:2.5})," New role"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No roles yet."}),r.map(f=>e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx(gt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,fontSize:13,flex:1},children:f.name}),e.jsx("span",{className:"settings-card-id",children:f.id}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Edit role",onClick:()=>{u({name:f.name,description:f.description||""}),i({role:f})},children:e.jsx(bt,{size:11,strokeWidth:2,color:"var(--accent)"})}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Delete role",disabled:h===f.id,onClick:()=>$(f),children:e.jsx(St,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),f.description&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:21},children:f.description})]},f.id))]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function yo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState([]),[c,u]=l.useState([]),[d,p]=l.useState(null),[h,b]=l.useState({}),[E,R]=l.useState(!1),[$,f]=l.useState({username:"",displayName:"",email:""}),[g,m]=l.useState(!1),[j,x]=l.useState({}),[k,_]=l.useState(null),[G,K]=l.useState(null),[B,P]=l.useState(null),S=l.useCallback(()=>Z.listUsers(t).then(v=>a(Array.isArray(v)?v:[])),[t]),N=l.useCallback(async v=>{const y=await Z.getUserRoles(t,v).catch(()=>[]);b(F=>({...F,[v]:Array.isArray(y)?y:[]}))},[t]);l.useEffect(()=>{S(),Z.getRoles(t).then(v=>i(Array.isArray(v)?v:[])),Z.listProjectSpaces(t).then(v=>u(Array.isArray(v)?v:[]))},[t]);async function V(v){const y=v.id;if(d===y){p(null);return}p(y),await N(y),x(F=>{var C,M,O;return{...F,[y]:F[y]||{roleId:((C=o[0])==null?void 0:C.id)||"",spaceId:((M=c[0])==null?void 0:M.id)||((O=c[0])==null?void 0:O.ID)||""}}})}async function Y(){if($.username.trim()){m(!0);try{await Z.createUser(t,$.username.trim(),$.displayName.trim()||null,$.email.trim()||null),await S(),R(!1),f({username:"",displayName:"",email:""})}catch(v){n(v,"error")}finally{m(!1)}}}async function z(v){if(window.confirm(`Deactivate user "${v.username}"?`))try{await Z.deactivateUser(t,v.id),await S()}catch(y){n(y,"error")}}async function U(v){const{roleId:y,spaceId:F}=j[v]||{};if(!(!y||!F)){_(v);try{await Z.assignRole(t,v,y,F),await N(v)}catch(C){n(C,"error")}finally{_(null)}}}async function A(v,y,F){const C=`${v}:${y}:${F}`;K(C);try{await Z.removeRole(t,v,y,F),await N(v)}catch(M){n(M,"error")}finally{K(null)}}async function I(v,y){P(v.id);try{await Z.setUserAdmin(t,v.id,y),await S()}catch(F){n(F,"error")}finally{P(null)}}return r?e.jsxs("div",{className:"settings-list",children:[E&&e.jsxs(ss,{title:"New User",onClose:()=>{R(!1),f({username:"",displayName:"",email:""})},onSave:Y,saving:g,saveLabel:"Create",children:[e.jsx(Fe,{label:"Username *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:$.username,onChange:v=>f(y=>({...y,username:v.target.value})),placeholder:"e.g. john.doe"})}),e.jsx(Fe,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:$.displayName,onChange:v=>f(y=>({...y,displayName:v.target.value})),placeholder:"e.g. John Doe"})}),e.jsx(Fe,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:$.email,onChange:v=>f(y=>({...y,email:v.target.value})),placeholder:"e.g. john@company.com"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{f({username:"",displayName:"",email:""}),R(!0)},children:[e.jsx(De,{size:11,strokeWidth:2.5})," New user"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No users found."}),r.map(v=>{var O,L;const y=v.id,F=d===y,C=h[y]||[],M=v.active!==!1;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center"},onClick:()=>V(v),children:[e.jsx("span",{className:"settings-card-chevron",children:F?e.jsx(Ve,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ue,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(Qt,{size:13,color:M?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:v.username}),v.displayName&&e.jsx("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:6},children:v.displayName}),e.jsx("span",{className:"settings-card-id",children:y}),v.email&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:v.email}),!M&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"}),v.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--warn",title:"Administrator",children:"Admin"}),s&&e.jsxs("select",{className:"field-input",style:{height:22,fontSize:10,padding:"0 4px",width:"auto",marginLeft:6,flexShrink:0},value:v.isAdmin?"admin":"user",disabled:B===y,onClick:w=>w.stopPropagation(),onChange:w=>{w.stopPropagation(),I(v,w.target.value==="admin")},title:"Admin status",children:[e.jsx("option",{value:"user",children:"User"}),e.jsx("option",{value:"admin",children:"Admin"})]}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Deactivate user",style:{marginLeft:4},onClick:w=>{w.stopPropagation(),z(v)},children:e.jsx(St,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),F&&e.jsxs("div",{className:"settings-card-body",style:{paddingTop:10},children:[e.jsx("span",{className:"settings-sub-label",style:{display:"block",margin:"0 0 8px"},children:"Role Assignments"}),C.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No role assignments yet."}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},children:C.map(w=>{const D=`${y}:${w.id}:${w.projectSpaceId}`;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,padding:"3px 0"},children:[e.jsx(gt,{size:11,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,minWidth:80},children:w.name}),e.jsx("span",{style:{color:"var(--muted)",fontSize:11},children:"in"}),e.jsx(Bt,{size:10,color:"var(--muted)",strokeWidth:1.5}),e.jsx("span",{style:{color:"var(--fg)",fontSize:11},children:w.projectSpaceName}),e.jsx("button",{className:"panel-icon-btn",title:"Remove assignment",disabled:G===D,onClick:()=>A(y,w.id,w.projectSpaceId),children:e.jsx(xt,{size:10,strokeWidth:2.5,color:"var(--danger, #f87171)"})})]},D)})}),s&&o.length>0&&c.length>0&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,paddingTop:6,borderTop:"1px solid var(--border)"},children:[e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((O=j[y])==null?void 0:O.roleId)||"",onChange:w=>x(D=>({...D,[y]:{...D[y]||{},roleId:w.target.value}})),children:o.map(w=>e.jsx("option",{value:w.id,children:w.name},w.id))}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",flexShrink:0},children:"in"}),e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((L=j[y])==null?void 0:L.spaceId)||"",onChange:w=>x(D=>({...D,[y]:{...D[y]||{},spaceId:w.target.value}})),children:c.map(w=>e.jsx("option",{value:w.id||w.ID,children:w.name||w.NAME},w.id||w.ID))}),e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:4,flexShrink:0},disabled:k===y,onClick:()=>U(y),children:[e.jsx(De,{size:10,strokeWidth:2.5})," Assign"]})]})]})]},y)})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function jo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState("roles");return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid var(--border)"},children:[["roles","Roles"],["users","Users"]].map(([o,i])=>e.jsx("button",{onClick:()=>a(o),style:{background:"none",border:"none",cursor:"pointer",padding:"6px 16px",fontSize:12,fontWeight:600,color:r===o?"var(--accent)":"var(--muted)",borderBottom:r===o?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,letterSpacing:".02em"},children:i},o))}),r==="roles"?e.jsx(vo,{userId:t,canWrite:s,toast:n}):e.jsx(yo,{userId:t,canWrite:s,toast:n})]})}function wo({permissions:t,userId:s,canWrite:n,toast:r,onReload:a}){const[o,i]=l.useState(!1),[c,u]=l.useState(null),[d,p]=l.useState(!1),[h,b]=l.useState({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0});function E(){b({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0}),u("create")}function R(j){b({code:j.permissionCode,scope:j.scope,displayName:j.displayName,description:j.description||"",displayOrder:0}),u(j.permissionCode)}async function $(){p(!0);try{if(c==="create"){if(!h.code.trim()||!h.displayName.trim()){r("Code and label required","error"),p(!1);return}await Z.createPermission(s,h.code.trim().toUpperCase(),h.scope,h.displayName.trim(),h.description.trim()||null,h.displayOrder),r("Permission created")}else await Z.updatePermission(s,c,h.displayName.trim(),h.description.trim()||null,h.displayOrder),r("Permission updated");u(null),a()}catch(j){r(j,"error")}p(!1)}const f=["GLOBAL","NODE","LIFECYCLE"],g={};t.forEach(j=>{j.scope&&(g[j.scope]||(g[j.scope]=[]),g[j.scope].push(j))});const m=[...f.filter(j=>g[j]),...Object.keys(g).filter(j=>!f.includes(j)).sort()];return e.jsxs("div",{style:{marginBottom:16},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:4},onClick:()=>i(!o),children:[o?e.jsx(Ve,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ue,{size:13,strokeWidth:2,color:"var(--muted)"}),e.jsx(gt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontSize:13,fontWeight:700},children:"Permission Catalog"}),e.jsxs("span",{style:{fontSize:11,color:"var(--muted)"},children:["(",t.length,")"]}),n&&o&&e.jsxs("button",{className:"btn btn-sm",style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:4},onClick:j=>{j.stopPropagation(),E()},children:[e.jsx(De,{size:11})," Add"]})]}),o&&e.jsx("div",{style:{border:"1px solid var(--border)",borderRadius:6,overflow:"hidden",marginBottom:8},children:m.map(j=>{const x=g[j]||[];return x.length===0?null:e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--muted)",padding:"6px 10px",background:"var(--subtle-bg)",borderBottom:"1px solid var(--border)"},children:[j," scope"]}),x.map(k=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderBottom:"1px solid var(--border)",fontSize:12},children:[e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:180,fontWeight:500},children:k.permissionCode}),e.jsx("span",{style:{flex:1,color:"var(--text)"},children:k.displayName}),k.description&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:k.description}),n&&e.jsx("button",{className:"panel-icon-btn",title:"Edit",onClick:()=>R(k),style:{flexShrink:0,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(bt,{size:12})})]},k.permissionCode))]},j)})}),c&&e.jsxs(ss,{title:c==="create"?"New Permission":`Edit ${c}`,onClose:()=>u(null),onSave:$,saving:d,saveLabel:c==="create"?"Create":"Save",children:[c==="create"&&e.jsxs(e.Fragment,{children:[e.jsx(Fe,{label:"Permission Code",children:e.jsx("input",{className:"field-input",value:h.code,onChange:j=>b(x=>({...x,code:j.target.value})),placeholder:"e.g. MANAGE_EXPORTS",style:{textTransform:"uppercase",fontFamily:"monospace"}})}),e.jsx(Fe,{label:"Scope",children:e.jsx("select",{className:"field-input",value:h.scope,onChange:j=>b(x=>({...x,scope:j.target.value})),children:[...f,...Object.keys(g).filter(j=>!f.includes(j)).sort()].filter((j,x,k)=>k.indexOf(j)===x).map(j=>e.jsx("option",{value:j,children:j},j))})})]}),e.jsx(Fe,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:h.displayName,onChange:j=>b(x=>({...x,displayName:j.target.value})),placeholder:"e.g. Manage Exports"})}),e.jsx(Fe,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,value:h.description,onChange:j=>b(x=>({...x,description:j.target.value})),placeholder:"Optional description"})})]})]})}function ko({scopeDef:t,allPermissions:s,roleId:n,projectSpaceId:r,userId:a,canWrite:o,toast:i}){const[c,u]=l.useState(null);l.useEffect(()=>{Z.getGrantsForRoleAndScope(a,n,t.code).then(f=>{const g=(t.keys||[]).find(x=>{var k;return((k=x.values)==null?void 0:k.length)>0}),m=g==null?void 0:g.name,j=new Set((Array.isArray(f)?f:[]).map(x=>{var k;return`${x.permission_code}|${(k=x.keys)==null?void 0:k[m]}`}));u(j)}).catch(()=>u(new Set))},[n,t.code,a]);const d=(t.keys||[]).find(f=>{var g;return((g=f.values)==null?void 0:g.length)>0});if(!d)return null;const{name:p,values:h}=d,b=(s||[]).filter(f=>f.scope===t.code);if(b.length===0||h.length===0)return null;async function E(f,g){if(!o)return;const m=`${f}|${g}`,j=c==null?void 0:c.has(m);u(x=>{const k=new Set(x);return j?k.delete(m):k.add(m),k});try{const x={permissionCode:f,scopeCode:t.code,roleId:n,projectSpaceId:r,keys:{[p]:g}};j?await Z.removeScopedGrant(a,x):await Z.addScopedGrant(a,x)}catch(x){u(k=>{const _=new Set(k);return j?_.add(m):_.delete(m),_}),i(x,"error")}}const R=e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}),$=e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})});return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[t.code," Permissions"]}),t.description&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:t.description}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)"},children:e.jsx("code",{children:p})}),b.map(f=>e.jsx("th",{style:{textAlign:"center",padding:"4px 8px",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)",minWidth:80},children:e.jsx("code",{style:{color:"var(--accent)",fontSize:10},children:f.permissionCode})},f.permissionCode))]})}),e.jsx("tbody",{children:h.map(f=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 8px 4px 0"},children:e.jsx("code",{style:{color:"var(--text)"},children:f.label})}),b.map(g=>{const m=c===null,j=!m&&c.has(`${g.permissionCode}|${f.id}`);return e.jsx("td",{style:{textAlign:"center",padding:"4px 8px"},children:e.jsx("button",{className:"panel-icon-btn",disabled:m||!o,title:o?j?"Revoke from this role":"Grant to this role":"Requires MANAGE_ROLES",onClick:()=>E(g.permissionCode,f.id),style:{width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:m?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):j?R:$})},g.permissionCode)})]},f.id))})]})]})}function So({userId:t,projectSpaceId:s,canWrite:n,toast:r}){const[a,o]=l.useState(null),[i,c]=l.useState([]),[u,d]=l.useState([]),[p,h]=l.useState([]),[b,E]=l.useState(null),[R,$]=l.useState({}),[f,g]=l.useState({}),[m,j]=l.useState(null);l.useEffect(()=>{Promise.all([Z.getRoles(t),Z.listPermissions(t),Z.getNodeTypes(t),Z.getLifecycles(t)]).then(async([z,U,A,I])=>{o(Array.isArray(z)?z:[]);const v=(Array.isArray(U)?U:[]).map(C=>({...C,permissionCode:C.permissionCode||C.permission_code,displayName:C.displayName||C.display_name,displayOrder:C.displayOrder??C.display_order}));c(v),d(Array.isArray(A)?A:[]);const y=Array.isArray(I)?I:[],F=[];await Promise.all(y.map(async C=>{const M=C.id||C.ID,O=await Z.getLifecycleTransitions(t,M).catch(()=>[]);(Array.isArray(O)?O:[]).forEach(L=>{const w=L.from_state_name||L.fromStateName||"",D=L.name||L.NAME||L.id;F.push({id:L.id||L.ID,label:w?`${w} → ${D}`:D,lifecycleId:M})})})),h(F)}).catch(()=>{o([])}),Z.getAccessRightsTree(t,s).then(j).catch(()=>j({scopes:[]}))},[t,s]);async function x(){const z=await Z.listPermissions(t).catch(()=>[]),U=(Array.isArray(z)?z:[]).map(A=>({...A,permissionCode:A.permissionCode||A.permission_code,displayName:A.displayName||A.display_name,displayOrder:A.displayOrder??A.display_order}));c(U)}const k=i.filter(z=>z.scope==="GLOBAL"),_=i.filter(z=>z.scope==="NODE"),G=i.filter(z=>z.scope==="LIFECYCLE"),K=Object.fromEntries(((m==null?void 0:m.scopes)||[]).filter(z=>{var U;return(U=z.keys)==null?void 0:U.some(A=>{var I;return((I=A.values)==null?void 0:I.length)>0})}).map(z=>[z.code,z])),B=new Set(["GLOBAL","NODE","LIFECYCLE",...Object.keys(K)]),P=[...new Set(i.map(z=>z.scope).filter(z=>z&&!B.has(z)))],S=z=>i.filter(U=>U.scope===z);async function N(z){if(b===z){E(null);return}if(E(z),R[z]===void 0){const A=await Z.getRoleGlobalPermissions(t,z).catch(()=>[]),I=new Set((Array.isArray(A)?A:[]).map(v=>v.permissionCode||v.permission_code));$(v=>({...v,[z]:I}))}const U=P.filter(A=>!K[A]);if(U.length>0&&!f[z]){const A=await Promise.all(U.map(async I=>{const v=await Z.getRoleScopePermissions(t,z,I).catch(()=>[]),y=new Set((Array.isArray(v)?v:[]).map(F=>F.permissionCode||F.permission_code));return[I,y]}));g(I=>({...I,[z]:Object.fromEntries(A)}))}}async function V(z,U){if(!n)return;const A=(R[z]||new Set).has(U);$(I=>{const v=new Set(I[z]||[]);return A?v.delete(U):v.add(U),{...I,[z]:v}});try{A?await Z.removeRoleGlobalPermission(t,z,U):await Z.addRoleGlobalPermission(t,z,U)}catch(I){$(v=>{const y=new Set(v[z]||[]);return A?y.add(U):y.delete(U),{...v,[z]:y}}),r(I,"error")}}async function Y(z,U,A){if(!n)return;const I=f[z]&&f[z][U]||new Set,v=I.has(A),y=new Set(I);v?y.delete(A):y.add(A),g(F=>({...F,[z]:{...F[z]||{},[U]:y}}));try{v?await Z.removeRoleScopePermission(t,z,U,A):await Z.addRoleScopePermission(t,z,U,A)}catch(F){g(C=>({...C,[z]:{...C[z]||{},[U]:I}})),r(F,"error")}}return a===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):a.length===0?e.jsx("div",{className:"settings-empty-row",children:"No roles defined. Create roles first in Users & Roles."}):e.jsxs("div",{className:"settings-list",children:[!n&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_ROLES"})]}),e.jsx(wo,{permissions:i,userId:t,canWrite:n,toast:r,onReload:x}),e.jsx("div",{className:"settings-sub-label",style:{marginBottom:6},children:"Role Grants"}),a.map(z=>{const U=b===z.id,A=R[z.id];return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>N(z.id),style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:U?e.jsx(Ve,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ue,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(gt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:z.name}),e.jsx("span",{className:"settings-card-id",children:z.id}),z.description&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:z.description})]}),U&&e.jsxs("div",{className:"settings-card-body",children:[k.length>0&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("div",{className:"settings-sub-label",children:"Global Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role-only check — no node type context."}),k.map(I=>{const v=A===void 0,y=!v&&A.has(I.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:v||!n,title:n?y?`Revoke from ${z.name}`:`Grant to ${z.name}`:"Requires MANAGE_ROLES",onClick:()=>V(z.id,I.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:v?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):y?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:I.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:I.displayName})]},I.permissionCode)})]}),P.map(I=>{const v=S(I);if(v.length===0)return null;const y=f[z.id]&&f[z.id][I];return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[I," Permissions"]}),e.jsxs("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:["Role-only check — scope ",I," has no key context."]}),v.map(F=>{const C=y===void 0,M=!C&&y.has(F.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:C||!n,title:n?M?`Revoke from ${z.name}`:`Grant to ${z.name}`:"Requires MANAGE_ROLES",onClick:()=>Y(z.id,I,F.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:C?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):M?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:F.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:F.displayName})]},F.permissionCode)})]},I)}),Object.values(K).map(I=>S(I.code).length>0?e.jsx(ko,{scopeDef:I,allPermissions:i,roleId:z.id,projectSpaceId:s,userId:t,canWrite:n,toast:r},I.code):null),(_.length>0||G.length>0)&&e.jsx(go,{userId:t,roleId:z.id,canWrite:n,toast:r,nodePerms:_,lcPerms:G,nodeTypes:u,transitions:p})]})]},z.id)})]})}function No({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState([]),[o,i]=l.useState(null),[c,u]=l.useState(!1),[d,p]=l.useState(""),[h,b]=l.useState(!1),E=["pno","platform","spe"];async function R(){try{const[m,j]=await Promise.all([mt.getEnvironment(),mt.getStatus()]);a(m.expectedServices||[]),i(j)}catch(m){n((m==null?void 0:m.message)||String(m),"error")}}l.useEffect(()=>{R()},[]);const $={};((o==null?void 0:o.services)||[]).forEach(m=>{$[m.serviceCode]=m});async function f(){const m=d.trim();if(m){b(!0);try{await mt.addExpectedService(m),p(""),u(!1),n("Service added","success"),R()}catch(j){n((j==null?void 0:j.message)||String(j),"error")}finally{b(!1)}}}async function g(m){if(window.confirm(`Remove expected service '${m}'?`)){b(!0);try{const j=await mt.removeExpectedService(m);j!=null&&j.baseline?n("Cannot remove baseline service","error"):n("Service removed","success"),R()}catch(j){n((j==null?void 0:j.message)||String(j),"error")}finally{b(!1)}}}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Expected Services"}),e.jsx("span",{style:{fontSize:12,color:"var(--muted2)"},children:"Services the platform expects to be running"}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!c&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>u(!0),children:[e.jsx(De,{size:11,strokeWidth:2}),"Add service"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only access"}),c&&e.jsx("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",placeholder:"Service code (e.g. my-service)",value:d,onChange:m=>p(m.target.value),onKeyDown:m=>m.key==="Enter"&&f(),style:{flex:1,maxWidth:300},autoFocus:!0}),e.jsx("button",{className:"btn btn-primary btn-xs",onClick:f,disabled:h,children:"Add"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{u(!1),p("")},children:"Cancel"})]})}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service Code"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Instances"}),e.jsx("th",{children:"Version"}),e.jsx("th",{style:{width:80}})]})}),e.jsxs("tbody",{children:[r.map(m=>{const j=$[m],x=E.includes(m),k=(j==null?void 0:j.status)||"missing",_={up:"#4dd4a0",degraded:"#f0b429",down:"#fc8181",missing:"#6b8099"},G=_[k]||_.missing;return e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("code",{style:{fontSize:12},children:m}),x&&e.jsx("span",{className:"settings-badge",style:{marginLeft:8,fontSize:10},children:"baseline"})]}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot",style:{marginRight:6,background:G,boxShadow:`0 0 6px ${G}`}}),k]}),e.jsx("td",{children:j?`${j.healthyInstances??0}/${j.instanceCount??0}`:"–"}),e.jsx("td",{style:{fontFamily:"var(--mono)",fontSize:11},children:(j==null?void 0:j.version)||"–"}),e.jsx("td",{children:s&&!x&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>g(m),disabled:h,children:"Remove"})})]},m)}),r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{textAlign:"center",color:"var(--muted)",padding:24},children:"No expected services configured (dynamic discovery mode)"})})]})]})]})}function Co({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState({}),[c,u]=l.useState({}),[d,p]=l.useState(null),[h,b]=l.useState(!1);async function E(){try{const x=await Z.listSecrets(t);a(Array.isArray(x)?x.map(k=>k.key).sort():[])}catch(x){n((x==null?void 0:x.message)||String(x),"error"),a([])}}l.useEffect(()=>{E()},[t]);async function R(x){if(o[x]!==void 0){i(k=>{const _={...k};return delete _[x],_});return}i(k=>({...k,[x]:null}));try{const k=await Z.revealSecret(t,x);i(_=>({..._,[x]:(k==null?void 0:k.value)??""}))}catch(k){n((k==null?void 0:k.message)||String(k),"error"),i(_=>{const G={..._};return delete G[x],G})}}function $(x){u(k=>({...k,[x]:o[x]??""}))}function f(x){u(k=>{const _={...k};return delete _[x],_})}async function g(x){b(!0);try{await Z.updateSecret(t,x,c[x]),n(`Updated '${x}'`,"success"),f(x),o[x]!==void 0&&i(k=>({...k,[x]:c[x]}))}catch(k){n((k==null?void 0:k.message)||String(k),"error")}finally{b(!1)}}async function m(x){if(window.confirm(`Delete secret '${x}'? This cannot be undone.`)){b(!0);try{await Z.deleteSecret(t,x),n(`Deleted '${x}'`,"success"),i(k=>{const _={...k};return delete _[x],_}),E()}catch(k){n((k==null?void 0:k.message)||String(k),"error")}finally{b(!1)}}}async function j(){var x;if(!((x=d==null?void 0:d.key)!=null&&x.trim())){n("Key required","error");return}b(!0);try{await Z.createSecret(t,d.key.trim(),d.value??""),n(`Created '${d.key}'`,"success"),p(null),E()}catch(k){const _=((k==null?void 0:k.message)||String(k)).includes("409")?"Key already exists":(k==null?void 0:k.message)||String(k);n(_,"error")}finally{b(!1)}}return r===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Secrets"}),e.jsxs("span",{style:{fontSize:12,color:"var(--muted2)"},children:["Vault path: ",e.jsx("code",{children:"secret/plm"})]}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!d&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>p({key:"",value:""}),children:[e.jsx(De,{size:11,strokeWidth:2}),"Add secret"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only — MANAGE_SECRETS not granted to your role."}),d&&e.jsxs("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:8},children:[e.jsx("input",{className:"field-input",placeholder:"key (e.g. plm.s3.access-key)",value:d.key,onChange:x=>p(k=>({...k,key:x.target.value})),style:{flex:1}}),e.jsx("input",{className:"field-input",placeholder:"value",value:d.value,onChange:x=>p(k=>({...k,value:x.target.value})),style:{flex:2}})]}),e.jsxs("div",{style:{display:"flex",gap:6,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>p(null),disabled:h,children:"Cancel"}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:j,disabled:h,children:"Create"})]})]}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"40%"},children:"Key"}),e.jsx("th",{children:"Value"}),e.jsx("th",{style:{width:220,textAlign:"right"},children:"Actions"})]})}),e.jsxs("tbody",{children:[r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:3,style:{color:"var(--muted2)"},children:"No secrets yet."})}),r.map(x=>{const k=o[x],_=c[x]!==void 0,G=k!==void 0;return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:x})}),e.jsx("td",{children:_?e.jsx("input",{className:"field-input",value:c[x],onChange:K=>u(B=>({...B,[x]:K.target.value})),style:{width:"100%"},autoFocus:!0}):G?k===null?e.jsx("span",{style:{color:"var(--muted2)"},children:"loading…"}):e.jsx("code",{children:k}):e.jsx("span",{style:{letterSpacing:2,color:"var(--muted2)"},children:"••••••••"})}),e.jsx("td",{style:{textAlign:"right"},children:e.jsx("div",{style:{display:"inline-flex",gap:6,justifyContent:"flex-end"},children:_?e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>g(x),disabled:h,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>f(x),disabled:h,children:"Cancel"})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>R(x),title:G?"Hide value":"Reveal value",children:G?"Hide":"Reveal"}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn btn-xs",style:{display:"inline-flex",alignItems:"center",gap:4},onClick:()=>$(x),disabled:!G,title:G?"Edit value":"Reveal first to edit",children:[e.jsx(bt,{size:10,strokeWidth:2}),"Edit"]}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>m(x),disabled:h,title:"Delete secret",children:e.jsx(St,{size:10,strokeWidth:2})})]})]})})})]},x)})]})]})]})}function Eo({userId:t,toast:s}){const[n,r]=l.useState(null),[a,o]=l.useState(null),[i,c]=l.useState(null),[u,d]=l.useState(null),[p,h]=l.useState(null);async function b(){try{const[m,j,x,k]=await Promise.all([Z.getRegistryGrouped(t).catch(()=>({})),Z.getRegistryTagsAdmin(t).catch(()=>null),Z.getRegistryOverview(t).catch(()=>null),Z.getUiManifest().catch(()=>null)]);r(m),o(j),c(x),h(k),d(null)}catch(m){d(m.message||String(m))}}if(l.useEffect(()=>{b();const m=setInterval(b,5e3);return()=>clearInterval(m)},[]),u)return e.jsxs("div",{className:"settings-empty-row",children:["Failed to load registry: ",u]});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const E=Object.keys(n).sort(),R=m=>{if(!m)return null;const j=Date.now()-new Date(m).getTime();return Math.max(0,Math.round(j/1e3))},$=m=>m==null?"—":m<60?`${m}s`:m<3600?`${Math.round(m/60)}m`:`${Math.round(m/3600)}h`,f=(i==null?void 0:i.services)||{},g=(i==null?void 0:i.settingsRegistrations)||[];return e.jsxs("div",{className:"settings-list",children:[e.jsx("div",{className:"settings-sub-label",children:"Platform Federation"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Per-service summary as seen by platform-api (",(i==null?void 0:i.self)||"platform","). Settings tabs registered, live item contributions probed via ","/internal/items/visible",". Refreshes every 5s."]}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instances"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Settings tabs"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Items"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Creatable"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Listable"})]})}),e.jsxs("tbody",{children:[Object.keys(f).sort().map(m=>{const j=f[m]||{};return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m}),e.jsx("td",{style:{padding:"4px 6px"},children:j.instances??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.settingsSections??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.itemDescriptors??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.creatableItems??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.listableItems??0})]},m)}),Object.keys(f).length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:6,style:{padding:"4px 6px",color:"var(--muted2)"},children:"No services known."})})]})]}),g.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",children:"Settings Registrations"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"Sections actively registered by each service against this platform-api."}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Sections"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Registered at"})]})}),e.jsx("tbody",{children:g.map(m=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.instanceId}),e.jsx("td",{style:{padding:"4px 6px"},children:(m.sections||[]).map(j=>j.key).join(", ")||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:m.registeredAt||"—"})]},m.serviceCode+":"+m.instanceId))})]})]}),e.jsx("div",{className:"settings-sub-label",children:"UI Plugin Registrations"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:["Plugin bundles declared by each service and loaded by the shell at boot. Source: ",e.jsx("code",{style:{fontSize:11},children:"/api/platform/ui/manifest"}),"."]}),p==null?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"Manifest unavailable."}):p.length===0?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"No UI plugins declared."}):e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Plugin ID"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Zone"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Bundle URL"})]})}),e.jsx("tbody",{children:p.map(m=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.pluginId}),e.jsx("td",{style:{padding:"4px 6px"},children:e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)"},children:m.zone})}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace",color:"var(--muted2)"},children:m.url})]},m.pluginId))})]}),e.jsx("div",{className:"settings-sub-label",children:"Registered Services (platform-api)"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Live snapshot from platform-api environment registry. ",E.length," service",E.length===1?"":"s"," known."]}),E.length===0?e.jsx("div",{className:"settings-empty-row",children:"No services registered."}):E.map(m=>{const j=n[m]||[],x=j.filter(k=>k.healthy).length;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{className:"settings-card-name",style:{fontFamily:"monospace"},children:m}),e.jsxs("span",{style:{fontSize:10,color:x===j.length?"var(--success)":"var(--warn)"},children:[x,"/",j.length," healthy"]})]}),e.jsx("div",{className:"settings-card-body",children:e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Base URL"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Version"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Tag"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Health"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Last HB"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Failures"})]})}),e.jsx("tbody",{children:j.map(k=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:k.instanceId}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:k.baseUrl}),e.jsx("td",{style:{padding:"4px 6px"},children:k.version||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:k.spaceTag||"—"}),e.jsx("td",{style:{padding:"4px 6px",color:k.healthy?"var(--success)":"var(--danger, #e05252)"},children:k.healthy?"OK":"DOWN"}),e.jsx("td",{style:{padding:"4px 6px"},children:$(R(k.lastHeartbeatOk))}),e.jsx("td",{style:{padding:"4px 6px"},children:k.consecutiveFailures??0})]},k.instanceId))})]})})]},m)}),a&&Object.keys(a).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",style:{marginTop:16},children:"Project Space Tags"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Service ↔ space-tag affinity (used by gateway routing)."}),e.jsx("pre",{style:{fontSize:11,background:"var(--bg2)",padding:8,borderRadius:4},children:JSON.stringify(a,null,2)})]})]})}function To({sectionKey:t,userId:s,projectSpaceId:n,canWrite:r,toast:a,pluginsLoaded:o}){if(t===null)return e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading…"});const c=Za(t)??Ka(t);if(!c)return o?e.jsxs("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:["Unknown section: ",t]}):e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading plugins…"});const{Component:u,wrapBody:d}=c,p=e.jsx(u,{userId:s,projectSpaceId:n,canWrite:r,toast:a});return d?e.jsx("div",{className:"settings-content-body",children:p}):p}function zo({userId:t,projectSpaceId:s,activeSection:n,onSectionChange:r,settingsSections:a,pluginsLoaded:o,toast:i}){const c=l.useMemo(()=>{const d={};return(a||[]).forEach(p=>p.sections.forEach(h=>{d[h.key]=h.canWrite})),d},[a]),u=l.useMemo(()=>{if(!a)return n;for(const d of a){const p=d.sections.find(h=>h.key===n);if(p)return p.label}return n},[a,n]);return e.jsxs("div",{className:"settings-content",children:[e.jsx("div",{className:"settings-content-hd",children:e.jsx("span",{className:"settings-content-title",children:u})}),e.jsx(To,{sectionKey:n,userId:t,projectSpaceId:s,canWrite:c[n]??!1,pluginsLoaded:o,toast:i})]})}Ke("my-profile",ho);Ke("api-playground",Ua,{wrapBody:!1});Ke("user-manual",Ha,{wrapBody:!1});Ke("proj-spaces",bo);Ke("users-roles",jo);Ke("access-rights",So);Ke("secrets",Co);Ke("service-registry",Eo);Ke("platform-environment",No);Ke("actions-catalog",Qa);Ke("platform-algorithms",ao);Ke("search-index",uo);class ds extends Oe.Component{constructor(s){super(s),this.state={hasError:!1,error:null}}static getDerivedStateFromError(s){return{hasError:!0,error:s}}componentDidCatch(s,n){console.error("ErrorBoundary caught:",s,n)}render(){var s;return this.state.hasError?this.props.fallback||e.jsxs("div",{style:{padding:24,color:"#e74c3c"},children:[e.jsx("strong",{children:"Something went wrong."}),e.jsx("pre",{style:{fontSize:12,marginTop:8},children:(s=this.state.error)==null?void 0:s.message})]}):this.props.children}}const Qs={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function Io({userId:t,serviceCode:s,txId:n,txNodes:r,stateColorMap:a,onCommitted:o,onClose:i,toast:c}){const[u,d]=l.useState(""),[p,h]=l.useState(!1),b=(r||[]).map(m=>m.itemId||m.node_id||m.NODE_ID),[E,R]=l.useState(()=>new Set(b));function $(m){R(j=>{const x=new Set(j);return x.has(m)?x.delete(m):x.add(m),x})}function f(){R(E.size===b.length?new Set:new Set(b))}async function g(){if(!u.trim()){c("Commit comment is required","warn");return}if(E.size===0){c("Select at least one object to commit","warn");return}h(!0);try{const m=E.size===b.length?null:[...E],j=await ht.commit(t,s,n,u,m),x=(j==null?void 0:j.continuationTxId)||null,k=b.length-E.size;c("Transaction committed","success"),o(x,k),i()}catch(m){c(m,"error")}finally{h(!1)}}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true","aria-labelledby":"commit-title",children:e.jsxs("div",{className:"card commit-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",id:"commit-title",children:"Commit transaction"}),e.jsx("button",{className:"btn btn-sm",onClick:i,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:"commit-comment",children:["Commit comment ",e.jsx("span",{className:"field-req","aria-label":"required",children:"*"})]}),e.jsx("input",{id:"commit-comment",className:"field-input",placeholder:"Describe what you changed…",value:u,onChange:m=>d(m.target.value),autoFocus:!0})]}),(r==null?void 0:r.length)>0&&e.jsxs("div",{className:"commit-node-list",children:[e.jsx("div",{className:"commit-node-list-hd",children:e.jsxs("label",{className:"commit-node-all",children:[e.jsx("input",{type:"checkbox",checked:E.size===b.length,onChange:f}),e.jsx("span",{children:"Objects to commit"}),e.jsxs("span",{className:"commit-node-count",children:[E.size,"/",b.length]})]})}),e.jsx("div",{className:"commit-node-list-scroll",children:r.map(m=>{const j=m.itemId||m.node_id||m.NODE_ID,x=m.logicalId||m.logical_id||m.LOGICAL_ID||j,k=m.nodeTypeName||m.node_type_name||m.NODE_TYPE_NAME||"",_=m.revision||m.REVISION||"A",G=m.iteration??m.ITERATION??1,K=(m.changeType||m.change_type||m.CHANGE_TYPE||"CONTENT").toUpperCase(),B=m.lifecycleStateId||m.lifecycle_state_id||m.LIFECYCLE_STATE_ID||"",P=Qs[K]||Qs.CONTENT;return e.jsxs("label",{className:"commit-node-item",children:[e.jsx("input",{type:"checkbox",checked:E.has(j),onChange:()=>$(j)}),e.jsx("span",{className:"commit-node-dot",style:{background:(a==null?void 0:a[B])||"#6b7280"}}),e.jsx("span",{className:"commit-node-lid",children:x}),e.jsx("span",{className:"commit-node-rev",children:G===0?_:`${_}.${G}`}),e.jsx("span",{className:"commit-node-type",children:k}),e.jsx("span",{className:"commit-node-badge",style:{background:P.bg,color:P.color},children:P.label})]},j)})})]}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:14},children:"Committed objects become visible to everyone. Uncommitted objects stay in a new transaction."}),e.jsxs("div",{className:"row flex-end",style:{gap:8},children:[e.jsx("button",{className:"btn",onClick:i,children:"Cancel"}),e.jsx("button",{className:"btn btn-success",onClick:g,disabled:p||!u.trim()||E.size===0,children:p?"Committing…":"✓ Commit"})]})]})]})})}function Ao({resources:t,onCreated:s,onClose:n,toast:r,initialDescriptor:a}){const o=l.useMemo(()=>{const B=new Set,P=[];for(const S of t||[]){const N=S.sourceLabel||"OTHER";B.has(N)||(B.add(N),P.push(N))}return P},[t]),[i,c]=l.useState((a==null?void 0:a.sourceLabel)||o[0]||""),u=l.useMemo(()=>(t||[]).filter(B=>(B.sourceLabel||"OTHER")===i),[t,i]),[d,p]=l.useState(()=>a?(t||[]).find(B=>B.serviceCode===a.serviceCode&&B.itemCode===a.itemCode)||null:u[0]||null);l.useEffect(()=>{a||p(u[0]||null)},[i]);const[h,b]=l.useState({}),[E,R]=l.useState({}),[$,f]=l.useState(!1);if(l.useEffect(()=>{b({}),R({})},[d]),!d)return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsx("div",{className:"modal-scroll",style:{padding:24,color:"var(--muted)"},children:"No creatable resources available."})]})});const g=d.create,m=((g==null?void 0:g.parameters)||[]).slice().sort((B,P)=>(B.displayOrder||0)-(P.displayOrder||0)),j=[];let x=null;for(const B of m){const P=B.displaySection||"Fields";(j.length===0||P!==x)&&(j.push({section:P,items:[]}),x=P),j[j.length-1].items.push(B)}function k(B,P){b(S=>({...S,[B]:P})),R(S=>({...S,[B]:null}))}function _(){const B={};for(const P of m){const S=h[P.name];if(P.required&&(S==null||S===""||S instanceof File&&S.size===0)&&(B[P.name]="Required"),P.validationRegex&&typeof S=="string"&&S.trim())try{new RegExp(`^(?:${P.validationRegex})$`).test(S.trim())||(B[P.name]=`Does not match pattern: ${P.validationRegex}`)}catch{}}return R(B),Object.keys(B).length===0}async function G(){if(_()){f(!0);try{const B=await Z.createResource(d,h);r(`${d.displayName||d.itemCode} created`,"success"),s==null||s(B,d),n()}catch(B){r(B,"error")}finally{f(!1)}}}function K(B){const P=(B.widgetType||"TEXT").toUpperCase(),S=E[B.name],N=h[B.name];if(P==="FILE")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("input",{id:`f-${B.name}`,type:"file",className:`field-input${S?" error":""}`,onChange:U=>{var A;return k(B.name,((A=U.target.files)==null?void 0:A[0])||null)}}),B.tooltip&&e.jsx("span",{className:"field-hint",children:B.tooltip}),S&&e.jsx("span",{className:"field-hint error",role:"alert",children:S})]},B.name);if(P==="TEXTAREA")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("textarea",{id:`f-${B.name}`,className:`field-input${S?" error":""}`,placeholder:B.tooltip||"",value:N||"",onChange:U=>k(B.name,U.target.value)}),S&&e.jsx("span",{className:"field-hint error",role:"alert",children:S})]},B.name);if(P==="DROPDOWN"||P==="SELECT"){const U=B.allowedValues?Ro(B.allowedValues):[];return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("select",{id:`f-${B.name}`,className:`field-input${S?" error":""}`,value:N||"",onChange:A=>k(B.name,A.target.value),children:[e.jsx("option",{value:"",children:"— select —"}),U.map(A=>e.jsx("option",{children:A},A))]}),S&&e.jsx("span",{className:"field-hint error",role:"alert",children:S})]},B.name)}const V=(N||"").toString().trim(),Y=B.validationRegex?$o(`^(?:${B.validationRegex})$`):null,z=!Y||!V?null:Y.test(V);return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("div",{className:"logical-id-wrap",children:[e.jsx("input",{id:`f-${B.name}`,type:P==="NUMBER"?"number":"text",className:`field-input${S?" error":z===!0?" ok":z===!1?" error":""}`,placeholder:B.tooltip||(B.validationRegex?`pattern: ${B.validationRegex}`:""),value:N||"",onChange:U=>k(B.name,U.target.value)}),V&&Y&&e.jsx("span",{className:`logical-id-badge ${z?"ok":"err"}`,children:z?"✓":"✗"})]}),B.validationRegex&&e.jsxs("div",{className:"logical-id-hint",children:[e.jsx("span",{className:"logical-id-hint-label",children:"Pattern"}),e.jsx("code",{className:"logical-id-hint-code",children:B.validationRegex}),!V&&e.jsx("span",{className:"logical-id-hint-idle",children:"start typing to validate"}),V&&z===!1&&e.jsx("span",{className:"logical-id-hint-err",children:"no match"}),V&&z===!0&&e.jsx("span",{className:"logical-id-hint-ok",children:"matches"})]}),!B.validationRegex&&B.tooltip&&e.jsx("span",{className:"field-hint",children:B.tooltip}),S&&e.jsx("span",{className:"field-hint error",role:"alert",children:S})]},B.name)}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"modal-scroll",children:[e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsxs("div",{className:"field",style:{margin:0,flex:"0 0 180px"},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-source",children:"Source"}),e.jsx("select",{id:"rc-source",className:"field-input",value:i,onChange:B=>c(B.target.value),disabled:!!a,children:o.map(B=>e.jsx("option",{value:B,children:B},B))})]}),e.jsxs("div",{className:"field",style:{margin:0,flex:1},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-type",children:"Type"}),e.jsx("select",{id:"rc-type",className:"field-input",value:d?`${d.serviceCode}/${d.itemCode}`:"",onChange:B=>{const P=B.target.value,S=u.find(N=>`${N.serviceCode}/${N.itemCode}`===P);S&&p(S)},disabled:!!a,children:u.map(B=>{const P=`${B.serviceCode}/${B.itemCode}`;return e.jsx("option",{value:P,children:B.displayName},P)})})]})]}),d.description&&e.jsx("div",{style:{padding:"12px 0 0",color:"var(--muted)",fontSize:12},children:d.description}),j.map((B,P)=>e.jsxs(Oe.Fragment,{children:[e.jsx("div",{className:"modal-identity-sep",style:{marginTop:P===0?16:18},children:e.jsx("span",{children:B.section})}),B.items.map(S=>K(S))]},`grp-${P}-${B.section}`))]}),e.jsx("div",{className:"card-hd",style:{borderTop:"1px solid var(--border)",borderBottom:"none"},children:e.jsxs("div",{className:"row flex-end",style:{width:"100%",gap:8},children:[e.jsx("button",{className:"btn",onClick:n,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:G,disabled:$,children:$?"Creating…":"Create"})]})})]})})}function $o(t){try{return new RegExp(t)}catch{return null}}function Ro(t){try{return JSON.parse(t)}catch{return[]}}function Po({detail:t,onClose:s}){var a;const n=t.category==="TECHNICAL",r=n&&Array.isArray(t.stackTrace)?t.stackTrace.join(`
`):null;return e.jsx("div",{className:"overlay",onClick:s,role:"dialog","aria-modal":"true","aria-label":"Error detail",children:e.jsxs("div",{className:`card ${n?"err-card-tech":"err-card-func"}`,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",style:{color:n?"var(--danger)":"var(--warn)"},children:n?"✗ Unexpected error":"⚠ Error"}),e.jsx("button",{className:"btn btn-sm",onClick:s,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:`card-body ${n?"err-body":""}`,children:[e.jsx("div",{className:"err-message",children:t.error}),((a=t.violations)==null?void 0:a.length)>0&&e.jsx("ul",{className:"violations-list",children:t.violations.map((o,i)=>e.jsx("li",{className:"violation-item",children:typeof o=="string"?o:o.message},i))}),n&&t.type&&e.jsx("div",{className:"err-meta",children:t.type}),t.path&&e.jsx("div",{className:"err-meta",children:t.path}),r&&e.jsx("pre",{className:"stack-trace",children:r})]})]})})}const qt=new Map;function Lo({serviceCode:t,itemCode:s,itemKey:n}){return`${t}:${s}:${n??""}`}function Bo({serviceCode:t,itemCode:s,itemKey:n}){return`/api/${t}/item-type/${encodeURIComponent(n??s)}`}async function Mo(t){if(!(t!=null&&t.serviceCode))return null;const s=Lo(t);if(qt.has(s))return qt.get(s);try{const n=await Z.gatewayJson("GET",Bo(t));return qt.set(s,n),n}catch{return null}}function Oo(){qt.clear()}const ys=new Map;let Un=null;function js(t,s,n){ys.set(s?`${t}:${s}`:`${t}:`,n)}function Do(t){Un=t}function en(t,s){return ys.get(`${t}:${s}`)??ys.get(`${t}:`)??Un}function _o(t){const s=t.value;if(s==null||s==="")return e.jsx("span",{style:{color:"var(--muted2)"},children:"—"});switch(t.widget){case"datetime":{try{const n=new Date(s);if(!isNaN(n.getTime()))return n.toLocaleString()}catch{}return String(s)}case"code":return e.jsx("code",{style:{fontSize:10,wordBreak:"break-all"},children:String(s)});case"number":return e.jsx("span",{style:{fontFamily:"var(--mono)"},children:Number(s).toLocaleString()});case"link":return e.jsx("a",{href:String(s),target:"_blank",rel:"noreferrer",children:String(s)});case"badge":return e.jsx("span",{className:"settings-badge",children:String(s)});case"image":return e.jsx("img",{src:String(s),alt:t.label,style:{maxWidth:"100%",maxHeight:240}});case"multiline":return e.jsx("pre",{style:{margin:0,whiteSpace:"pre-wrap",fontSize:12},children:String(s)});default:return String(s)}}function Gn({tab:t,ctx:s,descriptorOverride:n}){var v,y,F,C,M,O;const{userId:r,toast:a}=s||{},o=n||t.get||{},i=o.path,c=(o.httpMethod||"GET").toUpperCase(),u=(n==null?void 0:n.serviceCode)||t.serviceCode,d=u?`/api/${u}`:"",[p,h]=l.useState(null),[b,E]=l.useState(null),[R,$]=l.useState(null),[f,g]=l.useState(!0),[m,j]=l.useState(null),[x,k]=l.useState(null),[_,G]=l.useState(!1),[K,B]=l.useState(!1),[P,S]=l.useState(null),N=l.useCallback(async()=>{if(!i||!t.nodeId){$("No get action declared for this source"),g(!1);return}g(!0),$(null);try{const L=d+i.replace("{id}",encodeURIComponent(t.nodeId)),w=await Z.gatewayJson(c,L);h(w)}catch(L){$((L==null?void 0:L.message)||String(L))}finally{g(!1)}},[i,c,t.nodeId,d]);l.useEffect(()=>{N()},[N]),l.useEffect(()=>{p!=null&&p.itemType&&Mo(p.itemType).then(E).catch(()=>E(null))},[(v=p==null?void 0:p.itemType)==null?void 0:v.serviceCode,(y=p==null?void 0:p.itemType)==null?void 0:y.itemCode,(F=p==null?void 0:p.itemType)==null?void 0:F.itemKey]),l.useEffect(()=>{var D;const L=(D=p==null?void 0:p.metadata)==null?void 0:D.downloadUrl;if(!L){k(null),B(!1),S(null);return}let w=!1;return G(!0),Z.gatewayRawText(L).then(({text:q,truncated:te,totalBytes:le})=>{w||(k(q),B(te),S(le),G(!1))}).catch(()=>{w||(k(null),G(!1))}),()=>{w=!0}},[(C=p==null?void 0:p.metadata)==null?void 0:C.downloadUrl]),l.useEffect(()=>{var L;(L=s==null?void 0:s.onRegisterPreview)==null||L.call(s,{text:x,truncated:K,totalBytes:P,loading:_})},[x,_,K,P]),l.useEffect(()=>()=>{var L;(L=s==null?void 0:s.onRegisterPreview)==null||L.call(s,null)},[t.nodeId]);async function V(L){var w,D;if(!(L.confirmRequired&&!window.confirm(`${L.label}?

${L.description||""}`))){if((w=L.metadata)!=null&&w.openInNewTab){window.open(d+L.path.replace("{id}",encodeURIComponent(t.nodeId)),"_blank","noreferrer");return}j(L.code);try{const q=d+L.path.replace("{id}",encodeURIComponent(t.nodeId));await Z.gatewayJson(L.httpMethod,q,(D=L.parameters)!=null&&D.length?{}:void 0),a&&a(`${L.label} done`,"success"),N()}catch(q){a&&a(q,"error")}finally{j(null)}}}const Y=l.useMemo(()=>{const L={};for(const w of(b==null?void 0:b.fields)??[])L[w.name]=w;return L},[b]),z=l.useMemo(()=>((p==null?void 0:p.values)??(p==null?void 0:p.fields)??[]).map(w=>{var D,q,te;return{name:w.name,value:w.value,editable:w.editable,required:w.required??!1,label:((D=Y[w.name])==null?void 0:D.label)??w.label??w.name,widget:((q=Y[w.name])==null?void 0:q.widget)??w.widget??"text",hint:((te=Y[w.name])==null?void 0:te.hint)??w.hint??null}}),[p,Y]),U=l.useMemo(()=>{if(b!=null&&b.titleField){const L=z.find(w=>w.name===b.titleField);if(L!=null&&L.value)return String(L.value)}return(p==null?void 0:p.title)??(p==null?void 0:p.id)},[b,z,p]),A=l.useMemo(()=>{if(b!=null&&b.subtitleField){const L=z.find(w=>w.name===b.subtitleField);if(L!=null&&L.value)return String(L.value)}return(p==null?void 0:p.subtitle)??null},[b,z,p]),I=(b==null?void 0:b.color)??(p==null?void 0:p.color);return f?e.jsx("div",{className:"settings-loading",children:"Loading…"}):R?e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⚠"}),e.jsx("div",{className:"editor-empty-text",children:"Failed to load"}),e.jsx("div",{className:"editor-empty-hint",children:R})]}):p?e.jsxs("div",{style:{padding:24,overflow:"auto",height:"100%",boxSizing:"border-box"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:4},children:[I&&e.jsx("span",{style:{width:10,height:10,borderRadius:2,background:I,flexShrink:0}}),e.jsx("h2",{style:{margin:0,fontSize:18},children:U}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"},children:p.id})]}),A&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:16},children:A}),p.actions&&p.actions.length>0&&e.jsx("div",{style:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},children:p.actions.map(L=>e.jsx("button",{className:`btn btn-sm ${L.dangerous?"btn-danger":"btn-primary"}`,onClick:()=>V(L),disabled:m===L.code,title:L.description||L.label,children:m===L.code?"…":L.label},L.code))}),e.jsx("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse",marginBottom:24},children:e.jsx("tbody",{children:z.map(L=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsxs("td",{style:{padding:"6px 8px",color:"var(--muted)",width:180,verticalAlign:"top"},children:[L.label,L.hint&&e.jsx("div",{style:{fontSize:10,color:"var(--muted2)"},children:L.hint})]}),e.jsx("td",{style:{padding:"6px 8px"},children:_o(L)})]},L.name))})}),((M=p.metadata)==null?void 0:M.isImage)&&((O=p.metadata)==null?void 0:O.downloadUrl)&&e.jsxs("div",{children:[e.jsx("div",{className:"settings-sub-label",style:{marginBottom:8},children:"Preview"}),e.jsx("img",{src:p.metadata.downloadUrl,alt:U,style:{maxWidth:"100%",maxHeight:480,border:"1px solid var(--border)",borderRadius:4}})]})]}):null}const Wo={match:{serviceCode:"*"},name:"default",Editor:Gn,hasItemChildren:()=>!1},Hn=256*1024*1024,Ts=Math.max(1,Math.min(navigator.hardwareConcurrency||2,4)),st=Array.from({length:Ts},()=>new Worker(new URL("/assets/stepWorker-BXK_CxMf.js",import.meta.url),{type:"module"}));st.forEach(t=>{t.addEventListener("message",({data:s})=>{s.type==="log"&&be.getState().appendLog(s.level,s.message)})});function Fo(t){let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)>>>0;return st[s%Ts]}function tn({idb:t=!1}={}){st.forEach(s=>s.postMessage({type:"clear",idb:t}))}function Uo(t){st.forEach(s=>s.postMessage({type:"setMaxBytes",maxBytes:t}))}const ps={postMessage(t){t.uuid?Fo(t.uuid).postMessage(t):st.forEach(s=>s.postMessage(t))},addEventListener(t,s){st.forEach(n=>n.addEventListener(t,s))},removeEventListener(t,s){st.forEach(n=>n.removeEventListener(t,s))}},Go=()=>({entries:0,cacheBytes:0,maxBytes:Hn,memHits:0,idbHits:0,netFetches:0,avgDownloadMs:null,avgParseMs:null});function sn(t,s){const n=t.map(r=>r[s]).filter(r=>r!=null);return n.length?n.reduce((r,a)=>r+a,0)/n.length:null}function Ho(){const t=l.useRef(st.map(Go)),[,s]=l.useState(0);l.useEffect(()=>{const r=st.map((a,o)=>{const i=({data:c})=>{c.type==="stats"&&(t.current[o]={entries:c.entries,cacheBytes:c.cacheBytes,maxBytes:c.maxBytes??Hn,memHits:c.memHits??0,idbHits:c.idbHits??0,netFetches:c.netFetches??0,avgDownloadMs:c.avgDownloadMs??null,avgParseMs:c.avgParseMs??null},s(u=>u+1))};return a.addEventListener("message",i),a.postMessage({type:"stats"}),i});return()=>st.forEach((a,o)=>a.removeEventListener("message",r[o]))},[]);const n=t.current;return{workers:Ts,entries:n.reduce((r,a)=>r+a.entries,0),cacheBytes:n.reduce((r,a)=>r+a.cacheBytes,0),maxBytes:n.reduce((r,a)=>r+a.maxBytes,0),memHits:n.reduce((r,a)=>r+a.memHits,0),idbHits:n.reduce((r,a)=>r+a.idbHits,0),netFetches:n.reduce((r,a)=>r+a.netFetches,0),avgDownloadMs:sn(n,"avgDownloadMs"),avgParseMs:sn(n,"avgParseMs")}}function Vo({nodes:t=[],loading:s=!1,onNavigateToNode:n}){var v;const r=l.useRef(null),a=l.useRef(null),o=l.useRef(null),i=l.useRef(null),c=l.useRef(null),u=l.useRef(null),d=l.useRef(null),p=l.useRef({}),h=l.useRef(new Set),b=l.useRef({}),E=l.useRef({}),R=l.useRef(n),$=l.useRef(null),f=l.useRef({}),g=l.useRef([]),m=l.useRef(null);l.useEffect(()=>{R.current=n},[n]);const[j,x]=l.useState({}),[k,_]=l.useState(()=>new Set),[G,K]=l.useState(()=>new Set),B=(v=t[0])==null?void 0:v.nodeId;l.useEffect(()=>{_(new Set)},[B]);const[P,S]=l.useState(!1);l.useEffect(()=>{const y={},F={};t.forEach(C=>C.parts.forEach(M=>{const O=M.instanceKey||M.uuid;y[O]=C.nodeId,F[O]=C.stateColor||"#6b7280"})),b.current=y,E.current=F,Object.entries(F).forEach(([C,M])=>{const O=p.current[C];if(!O)return;const L=new At(M);O.traverse(w=>{w.isMesh&&w.userData.isOutline&&w.material.uniforms.color.value.copy(L)})})},[t]);const V=t.flatMap(y=>y.parts).filter(y=>!k.has(y.instanceKey||y.uuid)),Y=V.map(y=>`${y.instanceKey||y.uuid}@${y.matrix?y.matrix.join(","):"I"}`).join("|");g.current=V,l.useEffect(()=>{const y=r.current;if(!y)return;const F=y.clientWidth||600,C=y.clientHeight||400,M=()=>{const ie=getComputedStyle(document.documentElement).getPropertyValue("--scene-bg").trim();return new At(ie||"#1c1c2a")},O=new qr;O.background=M(),O.add(new Kr(16777215,.7));const L=new Jr(16777215,1.2);L.position.set(8,12,6),O.add(L);const w=new Xr(45,F/C,1e-4,1e5);w.position.set(0,5,10);const D=new Yr({antialias:!0});D.setPixelRatio(window.devicePixelRatio),D.setSize(F,C),y.appendChild(D.domElement);const q=new Zr(w,D.domElement);q.enableDamping=!0,q.dampingFactor=.08;const te=new Qr(w,D,{size:80,container:y});te.attachControls(q),a.current=O,o.current=D,i.current=w,c.current=q,u.current=te;function le(){d.current=requestAnimationFrame(le),q.update(),D.render(O,w),te.render()}le();function H(){const ie=y.clientWidth,me=y.clientHeight;!ie||!me||(w.aspect=ie/me,w.updateProjectionMatrix(),D.setSize(ie,me),te.update())}m.current=H;const ne=new MutationObserver(()=>{a.current&&(a.current.background=M())});ne.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});const W=new ResizeObserver(()=>H());W.observe(y);const J=new sa,re=new ea;function X(ie){const me=y.getBoundingClientRect();re.set((ie.clientX-me.left)/y.clientWidth*2-1,(ie.clientY-me.top)/y.clientHeight*-2+1),J.setFromCamera(re,w);const fe=[];O.traverse(Te=>{Te.isMesh&&!Te.userData.isOutline&&Te.visible&&fe.push(Te)});const ye=J.intersectObjects(fe,!1);if(!ye.length)return null;let ke=ye[0].object;for(;ke&&!ke.name;)ke=ke.parent;return(ke==null?void 0:ke.name)||null}function se(ie){const me=$.current;if(me!==ie){if(me){const fe=p.current[me];fe&&fe.traverse(ye=>{ye.isMesh&&(ye.userData.isOutline?ye.material.uniforms.color.value.set(E.current[me]||"#6b7280"):ye.material.emissive.set(0))})}if(ie){const fe=p.current[ie];fe&&fe.traverse(ye=>{ye.isMesh&&(ye.userData.isOutline?ye.material.uniforms.color.value.set(16777215):ye.material.emissive.set(6710886))})}$.current=ie,D.domElement.style.cursor=ie?"pointer":"default"}}function oe(ie){se(X(ie))}function pe(){se(null)}function de(ie){if(!ie.ctrlKey&&!ie.metaKey)return;const me=X(ie);if(!me)return;const fe=b.current[me];fe&&R.current&&R.current(fe)}return D.domElement.addEventListener("mousemove",oe),D.domElement.addEventListener("mouseleave",pe),D.domElement.addEventListener("click",de),()=>{cancelAnimationFrame(d.current),ne.disconnect(),W.disconnect(),D.domElement.removeEventListener("mousemove",oe),D.domElement.removeEventListener("mouseleave",pe),D.domElement.removeEventListener("click",de),te.dispose(),D.dispose(),y.contains(D.domElement)&&y.removeChild(D.domElement)}},[]),l.useEffect(()=>{const y=({data:F})=>{var O;const{type:C,uuid:M}=F;if(h.current.has(M)){if(h.current.delete(M),C==="ready"){f.current[M]=F.meshes;const L=g.current.filter(D=>D.uuid===M),w={};for(const D of L){const q=D.instanceKey||D.uuid;if(p.current[q])continue;const te=E.current[q]||"#6b7280",le=nn(F.meshes,te);if(le.name=q,D.matrix){const H=new ns;H.set(D.matrix[0],D.matrix[1],D.matrix[2],D.matrix[3],D.matrix[4],D.matrix[5],D.matrix[6],D.matrix[7],D.matrix[8],D.matrix[9],D.matrix[10],D.matrix[11],D.matrix[12],D.matrix[13],D.matrix[14],D.matrix[15]),le.matrix.copy(H),le.matrixAutoUpdate=!1}(O=a.current)==null||O.add(le),p.current[q]=le,w[q]={phase:"ready",error:null,visible:!0}}z(),Object.keys(w).length>0&&x(D=>({...D,...w}))}else if(C==="error"){const L=g.current.filter(D=>D.uuid===M),w={};for(const D of L){const q=D.instanceKey||D.uuid;w[q]={phase:"error",error:F.message,visible:!1}}Object.keys(w).length>0&&x(D=>({...D,...w}))}}};return ps.addEventListener("message",y),()=>ps.removeEventListener("message",y)},[]),l.useEffect(()=>{var O,L;const y=new Set(V.map(w=>w.instanceKey||w.uuid)),F=new Set(V.map(w=>w.uuid));for(const w of Object.keys(p.current))y.has(w)||(rn(p.current[w]),(O=a.current)==null||O.remove(p.current[w]),delete p.current[w]);for(const w of[...h.current])F.has(w)||h.current.delete(w);for(const w of Object.keys(f.current))F.has(w)||delete f.current[w];x(w=>{const D={...w};for(const q of Object.keys(D))y.has(q)||delete D[q];return D});const C={};let M=!1;for(const w of V){const D=w.instanceKey||w.uuid;if(p.current[D]){if(w.matrix){const q=new ns;q.set(w.matrix[0],w.matrix[1],w.matrix[2],w.matrix[3],w.matrix[4],w.matrix[5],w.matrix[6],w.matrix[7],w.matrix[8],w.matrix[9],w.matrix[10],w.matrix[11],w.matrix[12],w.matrix[13],w.matrix[14],w.matrix[15]),p.current[D].matrix.equals(q)||(p.current[D].matrix.copy(q),p.current[D].matrixAutoUpdate=!1,M=!0)}continue}if(f.current[w.uuid]){const q=E.current[D]||"#6b7280",te=nn(f.current[w.uuid],q);if(te.name=D,w.matrix){const le=new ns;le.set(w.matrix[0],w.matrix[1],w.matrix[2],w.matrix[3],w.matrix[4],w.matrix[5],w.matrix[6],w.matrix[7],w.matrix[8],w.matrix[9],w.matrix[10],w.matrix[11],w.matrix[12],w.matrix[13],w.matrix[14],w.matrix[15]),te.matrix.copy(le),te.matrixAutoUpdate=!1}(L=a.current)==null||L.add(te),p.current[D]=te,C[D]={phase:"ready",error:null,visible:!0},M=!0}else h.current.has(w.uuid)?C[D]={phase:"loading",error:null,visible:!0}:(h.current.add(w.uuid),C[D]={phase:"loading",error:null,visible:!0},ps.postMessage({type:"load",uuid:w.uuid,kind:w.kind||"design",token:ft(),projectSpace:Rt()}))}M&&z(),Object.keys(C).length>0&&x(w=>({...w,...C}))},[Y]);function z(){var D;(D=m.current)==null||D.call(m);const y=a.current,F=i.current,C=c.current;if(!y||!F)return;y.updateMatrixWorld(!0);const M=new ta;if(y.traverse(q=>{q.isMesh&&!q.userData.isOutline&&q.visible&&M.expandByObject(q)}),M.isEmpty())return;const O=new Ms,L=new Ms;M.getCenter(O),M.getSize(L);const w=Math.max(L.x,L.y,L.z)||1;F.near=w*1e-4,F.far=w*200,F.position.set(O.x+w*1.5,O.y+w,O.z+w*2),F.lookAt(O),C&&(C.target.copy(O),C.update()),F.updateProjectionMatrix()}function U(y){const F=p.current[y];if(!F)return;const C=!F.visible;F.visible=C,x(M=>({...M,[y]:{...M[y],visible:C}}))}function A(y){var C;const F=p.current[y];F&&(rn(F),(C=a.current)==null||C.remove(F),delete p.current[y]),_(M=>new Set([...M,y])),x(M=>{const O={...M};return delete O[y],O})}function I(y){K(F=>{const C=new Set(F);return C.has(y)?C.delete(y):C.add(y),C})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[P?e.jsxs("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,background:"var(--surface)"},onClick:()=>S(!1),title:"Show parts panel",children:[e.jsx(Ue,{size:12,style:{color:"var(--muted)",flexShrink:0}}),e.jsx("span",{style:{writingMode:"vertical-rl",fontSize:10,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1,textTransform:"uppercase"},children:"Parts"})]}):e.jsxs("div",{style:{width:220,flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"5px 8px 5px 10px",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:"Parts"}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>S(!0),title:"Collapse parts panel",children:e.jsx(Wr,{size:13})})]}),s&&e.jsx("div",{style:{padding:"6px 10px",fontSize:11,color:"var(--muted)",flexShrink:0},children:"Loading…"}),!s&&t.length===0&&e.jsx("div",{style:{padding:"10px 12px",fontSize:12,color:"var(--muted)"},children:"No parts"}),e.jsx("div",{style:{flex:1,overflowY:"auto"},children:t.map(y=>{const F=y.parts.filter(O=>!k.has(O.instanceKey||O.uuid));if(F.length===0)return null;const C=G.has(y.nodeId),M=y.stateColor||"#6b7280";return e.jsxs("div",{children:[e.jsxs("div",{onClick:()=>I(y.nodeId),style:{display:"flex",alignItems:"center",gap:5,padding:`4px 8px 4px ${8+y.depth*12}px`,cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--muted)",borderBottom:"1px solid var(--border)",background:"var(--surface)",userSelect:"none"},children:[e.jsx("span",{style:{width:7,height:7,borderRadius:2,background:M,flexShrink:0,display:"inline-block"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:y.nodeLabel,children:y.nodeLabel}),e.jsx("span",{style:{fontSize:9,flexShrink:0},children:C?"▶":"▼"})]}),!C&&F.map(O=>{const L=O.instanceKey||O.uuid,w=j[L]||{},D=w.visible!==!1;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,padding:`4px 8px 4px ${14+y.depth*12}px`,fontSize:12,borderBottom:"1px solid var(--border)"},children:[e.jsx("input",{type:"checkbox",checked:D,disabled:w.phase!=="ready",onChange:()=>U(L),style:{flexShrink:0,cursor:w.phase==="ready"?"pointer":"default"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:w.phase==="error"?"var(--danger, #e05252)":"inherit",opacity:D?1:.45},title:w.phase==="error"?w.error:O.fileName,children:O.fileName||O.uuid}),e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",flexShrink:0},children:[w.phase==="loading"&&"…",w.phase==="error"&&"✗"]}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>A(L),title:"Remove from scene",style:{fontSize:13,lineHeight:1},children:"×"})]},L)})]},y.instanceId||y.nodeId)})})]}),e.jsx("div",{ref:r,style:{flex:1,overflow:"hidden",minWidth:0,position:"relative"}})]})}function nn(t,s="#6b7280"){const n=new na,r=new At(s);for(const a of t){if(!a.positions)continue;const o=new ra;o.setAttribute("position",new rs(a.positions,3)),a.normals&&o.setAttribute("normal",new rs(a.normals,3)),a.indices&&o.setIndex(new rs(a.indices,1));const i=a.color?new At(a.color[0],a.color[1],a.color[2]):new At(6003958),c=new Os(o,new aa({color:i,side:oa}));n.add(c);const u=new Os(o,new ia({side:la,uniforms:{color:{value:r.clone()},thickness:{value:.007}},vertexShader:`
uniform float thickness;
void main() {
  vec4 mvPos    = modelViewMatrix * vec4(position, 1.0);
  vec4 clipPos  = projectionMatrix * mvPos;
  vec3 viewNorm = normalize(normalMatrix * normal);
  vec2 sn       = viewNorm.xy;
  float snLen   = length(sn);
  vec2 offset   = snLen > 1e-4 ? sn / snLen : vec2(0.0);
  clipPos.xy   += offset * thickness * clipPos.w;
  gl_Position   = clipPos;
}`,fragmentShader:`
uniform vec3 color;
void main() { gl_FragColor = vec4(color, 1.0); }`}));u.renderOrder=1,u.userData.isOutline=!0,n.add(u)}return n}function rn(t){t.traverse(s=>{var n,r;(n=s.geometry)==null||n.dispose(),Array.isArray(s.material)?s.material.forEach(a=>a.dispose()):(r=s.material)==null||r.dispose()})}function qo({data:t,tab:s,ctx:n}){const{nodes:r=[],loading:a=!1}=t||{};return e.jsx(Vo,{nodes:r,loading:a,onNavigateToNode:n!=null&&n.onNavigate?o=>n.onNavigate(o,void 0,{serviceCode:"psm"}):void 0})}function Ko(t){return t?t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`:""}function Jo({data:t}){const{text:s,loading:n,truncated:r,totalBytes:a}=t||{};return n?e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"Loading…"}):s?e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"},children:[e.jsx("pre",{style:{margin:0,padding:14,fontSize:11,lineHeight:1.55,fontFamily:"var(--mono)",whiteSpace:"pre-wrap",wordBreak:"break-all",color:"var(--text)",overflow:"auto",flex:1,boxSizing:"border-box"},children:s}),r&&e.jsxs("div",{style:{padding:"6px 14px",fontSize:11,color:"var(--muted)",borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:["Preview limited to first 64 KB",a?` — file is ${Ko(a)}`:"","."]})]}):e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"No preview available"})}function Xo({hit:t,descriptor:s,isPinned:n,onPin:r,onUnpin:a,ctx:o}){let i={};try{i=JSON.parse(t.sourceJson||"{}")}catch{}const c=i.logicalId||i.logical_id||i.originalName||t.id,u=(s==null?void 0:s.displayName)||t.itemCode||t.type||"",{onNavigate:d}=o,p=s!=null&&s.icon?qe[s.icon]:null;return e.jsxs("div",{className:"node-item",onClick:()=>d(t.id,c,s),title:c,children:[p?e.jsx(p,{size:11,color:s.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):s!=null&&s.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:s.color,flexShrink:0,display:"inline-block"}}):null,e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:c}),u&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",flexShrink:0},children:u}),e.jsx("button",{className:`search-pin-btn${n?" pinned":""}`,title:n?"Remove from basket":"Add to basket",onClick:h=>{h.stopPropagation(),n?a==null||a():r==null||r()},children:n?e.jsx(es,{size:11,strokeWidth:2}):e.jsx(ts,{size:11,strokeWidth:2})})]})}function Yo({item:t,ctx:s}){const{userId:n,stateColorMap:r}=s,a=t.revision||t.REVISION||"A",o=t.iteration??t.ITERATION??1,i=t.lifecycle_state_id||t.LIFECYCLE_STATE_ID,c=t.logical_id||t.LOGICAL_ID||"",u=t.locked_by||t.LOCKED_BY||null,p=(t.tx_status||t.TX_STATUS||"COMMITTED")==="OPEN",h=u&&u!==n,b=u&&u===n;return e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"ni-dot",style:{background:(r==null?void 0:r[i])||"#6b7280"}}),e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[c||e.jsx("span",{className:"ni-no-id",children:"—"}),(t.display_name||t.DISPLAY_NAME)&&e.jsx("span",{className:"ni-dname",children:t.display_name||t.DISPLAY_NAME})]}),e.jsx("span",{className:"ni-reviter",style:p?{color:"var(--warn)"}:void 0,children:o===0?a:`${a}.${o}`}),h&&e.jsx(Fr,{size:10,strokeWidth:2.5,color:"var(--muted)",style:{flexShrink:0}}),b&&e.jsx(bt,{size:10,strokeWidth:2.5,color:"var(--accent)",style:{flexShrink:0}})]})}function Zo({item:t}){const s=t.originalName||t.ORIGINAL_NAME||t.id;return e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:s})}function Vn({isPinned:t,onPin:s,onUnpin:n}){return e.jsx("button",{className:`search-pin-btn${t?" pinned":""}`,title:t?"Remove from basket":"Add to basket",onClick:r=>{r.stopPropagation(),t?n==null||n():s==null||s()},children:t?e.jsx(es,{size:11,strokeWidth:2}):e.jsx(ts,{size:11,strokeWidth:2})})}function Qo({hit:t,descriptor:s,isPinned:n,onPin:r,onUnpin:a,ctx:o}){let i={};try{i=JSON.parse(t.sourceJson||"{}")}catch{}const{onNavigate:c}=o,u=i.revision||"A",d=i.iteration??1,p=i.logicalId||"",h=i.name||"",b=s!=null&&s.icon?qe[s.icon]:null;return e.jsxs("div",{className:"node-item",onClick:()=>c(t.id,p||t.id,s),title:[p,h].filter(Boolean).join(" · ")||t.id,children:[b?e.jsx(b,{size:11,color:s.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):s!=null&&s.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:s.color,flexShrink:0,display:"inline-block"}}):null,e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[p||e.jsx("span",{className:"ni-no-id",children:"—"}),h&&e.jsx("span",{className:"ni-dname",children:h})]}),e.jsx("span",{className:"ni-reviter",children:d===0?u:`${u}.${d}`}),e.jsx(Vn,{isPinned:n,onPin:r,onUnpin:a})]})}function ei({hit:t,descriptor:s,isPinned:n,onPin:r,onUnpin:a,ctx:o}){let i={};try{i=JSON.parse(t.sourceJson||"{}")}catch{}const{onNavigate:c}=o,u=i.originalName||t.id,d=s!=null&&s.icon?qe[s.icon]:null;return e.jsxs("div",{className:"node-item",onClick:()=>c(t.id,u,s),title:u,children:[d?e.jsx(d,{size:11,color:s.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):s!=null&&s.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:s.color,flexShrink:0,display:"inline-block"}}):null,e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:u}),e.jsx(Vn,{isPinned:n,onPin:r,onUnpin:a})]})}let an=!1;function ti(){an||(an=!0,Ca(Wo),gs({match:{serviceCode:"psm"},name:"psm-shell",NavLabel:Yo,Preview:qo,previewLabel:"3D Preview",hasItemChildren:t=>{const s=t.children_count??t.CHILDREN_COUNT;return s==null||s>0}}),gs({match:{serviceCode:"dst",itemCode:"data-object"},name:"dst-shell",NavLabel:Zo,Editor:Gn,Preview:Jo,previewLabel:"Preview",hasItemChildren:()=>!1}),Do(Xo),js("psm",null,Qo),js("dst","data-object",ei))}const wt={},Ht=[];function si(t,s){return t.length!==s.length?!1:s.every((n,r)=>n==="*"||n===t[r])}const us={emit(t){const s=t==null?void 0:t.type;if(!s)return;(wt[s]||[]).slice().forEach(r=>r(t));const n=s.split(":");Ht.forEach(({glob:r,handler:a})=>{si(n,r)&&a(t)})},on(t,s){return(wt[t]??(wt[t]=[])).push(s),()=>this.off(t,s)},onPattern(t,s){const n={glob:t.split(":"),handler:s};return Ht.push(n),()=>{const r=Ht.indexOf(n);r!==-1&&Ht.splice(r,1)}},off(t,s){wt[t]=(wt[t]||[]).filter(n=>n!==s)}};let qn=null;function ni(){qn=null}function ri(){return qn}const ai=l.createContext(null);function oi({navigate:t,openTab:s,closeTab:n}){const r=be.getState;return{navigate:t,openTab:s,closeTab:n,getToken:()=>ft(),getProjectSpaceId:()=>Rt(),emit:(a,o)=>us.emit(a,o),on:(a,o)=>(us.on(a,o),()=>us.off(a,o)),getStore:()=>ae.getState(),usePlmStore:ae,useWebSocket:Pn,api:Z,txApi:ht,authoringApi:va,cadApi:ba,pollJobStatus:Cs,getDraggedNode:ri,clearDraggedNode:ni,getLinkRowForSource:Ea,icons:{NODE_ICONS:qe,SignIcon:bn},components:{LifecycleDiagram:qa},http:{serviceRequest:(a,o,i,c)=>ga(a,o,i,c),serviceUpload:(a,o,i,c)=>Mt(`/api/${a}${o}`,"POST",{Authorization:`Bearer ${ft()}`,"X-PLM-ProjectSpace":Rt()||""},i,c)},store:{registerSlice(a,o){ae.setState(i=>({_slices:{...i._slices,[a]:o.state??{}},_sliceActions:{...i._sliceActions,[a]:o.actions??{}}}))},getSlice:a=>{var o;return(o=ae.getState()._slices)==null?void 0:o[a]},useSlice:a=>ae(o=>{var i;return(i=o._slices)==null?void 0:i[a]}),dispatch(a,o,...i){var u,d;const c=(d=(u=ae.getState()._sliceActions)==null?void 0:u[a])==null?void 0:d[o];c&&c(ae.setState,ae.getState,...i)}},console:{addTab:(a,o,i)=>r().addConsoleTab(a,o,i),removeTab:a=>r().removeConsoleTab(a),log:(a,o)=>r().appendLog(a,o)},status:{register:(a,o,i)=>r().registerStatus(a,o,i),unregister:a=>r().unregisterStatus(a)},collab:{addTab:(a,o,i)=>r().addCollabTab(a,o,i),removeTab:a=>r().removeCollabTab(a)},jobs:{register:(a,o,i)=>r().registerBgJob(a,o,i),update:(a,o)=>r().updateBgJob(a,o),remove:a=>r().removeBgJob(a)}}}async function ii(t){const s=await Z.getUiManifest();return(await Promise.allSettled(s.map(async r=>{const o=(await import(r.url)).default;if(!(o!=null&&o.id))throw new Error(`Plugin at ${r.url} has no id`);if(o.init&&o.init(t),Xa(o),o.zone==="nav"&&o.match&&(Vs(o.match.serviceCode,o.match.itemCode,{NavLabel:o.NavLabel??null,getRowProps:o.getRowProps??null,ChildRow:o.ChildRow??null,hasItemChildren:o.hasItemChildren??(()=>!1),fetchChildren:o.fetchChildren??null,LinkRow:o.LinkRow??null}),o.SearchItem&&js(o.match.serviceCode,o.match.itemCode??null,o.SearchItem),o.linkSources&&o.LinkRow))for(const i of o.linkSources)Vs(i,null,{LinkRow:o.LinkRow})}))).map((r,a)=>{var o,i,c;return r.status==="rejected"?`${((o=s[a])==null?void 0:o.pluginId)??((i=s[a])==null?void 0:i.url)}: ${((c=r.reason)==null?void 0:c.message)??r.reason}`:null}).filter(Boolean)}const on=50,li=8;function ci({jobData:t,onClose:s}){const{job:n,results:r=[]}=t,a=n.status==="DONE"||n.status==="FAILED",o=r.reduce((c,u)=>(c[u.action]=(c[u.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${r.length} node${r.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,u])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",u]},c))}),r.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:r.map((c,u)=>e.jsxs("tr",{style:{borderTop:u>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||u))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:a?"Close":"Dismiss (job continues in background)"})})]})}function di({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:r,onCreateNode:a,refreshKey:o,toast:i,panelSection:c="MAIN",basketView:u=!1,basketItems:d={}}){const p=ae(W=>W.items),h=ae(W=>W.itemsStatus),b=ae(W=>W.addToBasket),E=ae(W=>W.removeFromBasket),R=ae(W=>W.lockedByMe),$=ae(W=>W.userId);ae(W=>W.projectSpaceId);const f=l.useMemo(()=>{const W=String(c||"MAIN").toUpperCase();return p.filter(J=>J.list&&String(J.panelSection||"MAIN").toUpperCase()===W)},[p,c]),[g,m]=l.useState({}),[j,x]=l.useState({}),[k,_]=l.useState(new Set),[G,K]=l.useState(new Set),B=l.useRef({}),[,P]=l.useState(0),[S,N]=l.useState(null),[V,Y]=l.useState(null),[z,U]=l.useState({}),[A,I]=l.useState(!1),[v,y]=l.useState(null),[F,C]=l.useState(null),M=l.useRef(null),O=l.useMemo(()=>({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:r}),[t,s,n,r]),L=l.useCallback(W=>`${W.serviceCode}:${W.itemCode}`,[]);l.useEffect(()=>()=>{M.current&&clearInterval(M.current)},[]),l.useEffect(()=>{f.length!==0&&(_(new Set(f.map(L))),f.forEach(W=>w(W,0).catch(()=>null)))},[f,o]),l.useEffect(()=>{if(s){for(const[W,J]of Object.entries(g))if(((J==null?void 0:J.items)||[]).some(re=>(re.id||re.ID)===s)){_(re=>new Set([...re,W]));return}}},[s,g]);async function w(W,J){const re=L(W);x(X=>({...X,[re]:!0}));try{const X=await Z.fetchListableItems(t,W,J,on);m(se=>{const oe=se[re],pe=J===0||!oe?X:{...X,items:[...oe.items||[],...X.items||[]]};return{...se,[re]:pe}})}catch{m(X=>({...X,[re]:{items:[],totalElements:0,page:0,size:on}}))}finally{x(X=>({...X,[re]:!1}))}}function D(W){const J=L(W);_(re=>{const X=new Set(re);return X.has(J)?X.delete(J):(X.add(J),!g[J]&&!j[J]&&w(W,0)),X})}function q(W){const J=L(W),re=g[J];if(!re||j[J])return;const X=(re.page??0)+1;X>=(re.totalPages??0)||w(W,X)}const te=l.useCallback(async(W,J,re,X)=>{X&&X.stopPropagation(),K(pe=>{const de=new Set(pe);return de.has(W)?de.delete(W):de.add(W),de});const se=J.id||J.ID;if(B.current[se]!==void 0)return;const oe=Yt(re);if(!oe.fetchChildren){B.current[se]=[];return}B.current[se]="loading",P(pe=>pe+1);try{const pe=await oe.fetchChildren(J,O);B.current[se]=Array.isArray(pe)?pe:[]}catch{B.current[se]=[]}P(pe=>pe+1)},[O]);function le(W,J,re,X,se,oe){if(se>li)return null;const pe=re.id||re.ID||X,de=B.current[pe];return!Array.isArray(de)||de.length===0||!W.ChildRow?null:de.map(ie=>{const me=ie.targetNodeId||ie.id||ie.ID,fe=`${X}/${ie.linkId||me}`,ke=!oe.has(me)&&G.has(fe);return e.jsxs(Oe.Fragment,{children:[e.jsx(W.ChildRow,{link:ie,child:ie,depth:se,parentPath:fe,ancestorIds:oe,ctx:O,childCacheRef:B,expandedPaths:G,toggleNodeChildren:(Te,Se,Ae)=>te(Te,{id:Se},J,Ae)}),ke&&le(W,J,{id:me},fe,se+1,new Set([...oe,me]))]},fe)})}const H=l.useMemo(()=>{const W=String(c||"MAIN").toUpperCase(),J=f.filter(se=>String(se.panelSection||"MAIN").toUpperCase()===W),re=new Map;for(const se of J){const oe=se.serviceCode||"_unknown";re.has(oe)||re.set(oe,[]),re.get(oe).push(se)}const X=[];for(const[se,oe]of re.entries()){oe.sort((ie,me)=>(me.priority??100)-(ie.priority??100));const pe=oe.reduce((ie,me)=>Math.max(ie,me.priority??100),0),de=oe[0].sourceLabel||se;X.push({serviceCode:se,label:de,maxPriority:pe,descriptors:oe})}return X.sort((se,oe)=>oe.maxPriority-se.maxPriority),X},[f,c]);async function ne(){if(!S||!V)return;const{descriptor:W,action:J}=S,re=`/api/${W.serviceCode}${J.path}`,X=new FormData;X.append("file",V),(J.parameters||[]).forEach(de=>{const ie=z[de.name];ie!=null&&ie!==""&&X.append(de.name,ie)});const se={},oe=ft(),pe=Rt();oe&&(se.Authorization=`Bearer ${oe}`),pe&&(se["X-PLM-ProjectSpace"]=pe),I(!0),y(0);try{const de=await Mt(re,"POST",se,X,me=>y(me));if(!de.ok){const me=await de.json().catch(()=>({}));throw new Error(me.error||me.message||`HTTP ${de.status}`)}const ie=await de.json().catch(()=>null);if(N(null),y(null),ie!=null&&ie.jobId&&J.jobStatusPath){const me=J.jobStatusPath.replace("{jobId}",ie.jobId);C({id:ie.jobId,data:{job:{id:ie.jobId,status:ie.status||"PENDING"},results:[]}}),M.current&&clearInterval(M.current),M.current=setInterval(async()=>{var fe,ye,ke;try{const Te=await Cs(W.serviceCode,me);C(Se=>Se?{...Se,data:Te}:null),(((fe=Te.job)==null?void 0:fe.status)==="DONE"||((ye=Te.job)==null?void 0:ye.status)==="FAILED")&&(clearInterval(M.current),M.current=null,((ke=Te.job)==null?void 0:ke.status)==="DONE"&&w(W,0))}catch{}},2e3)}else i==null||i(`${V.name} imported`,"success"),w(W,0)}catch(de){N(null),y(null),i==null||i(de,"error")}finally{I(!1)}}return h!=="loaded"&&c==="MAIN"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):H.length===0?null:e.jsxs(e.Fragment,{children:[S&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:W=>{W.target===W.currentTarget&&!A&&N(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:S.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!A&&N(null),disabled:A,children:e.jsx(xt,{size:14})})]}),S.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:S.action.description}),v!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[v,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${v}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:S.action.acceptedTypes||void 0,disabled:A,onChange:W=>{var J;return Y(((J=W.target.files)==null?void 0:J[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),V&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[V.name," (",(V.size/1024).toFixed(1)," KB)"]}),(S.action.parameters||[]).map(W=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[W.label,W.required?" *":""]}),W.widgetType==="DROPDOWN"&&W.allowedValues?e.jsx("select",{disabled:A,value:z[W.name]??(W.defaultValue||""),onChange:J=>U(re=>({...re,[W.name]:J.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(W.allowedValues).map(J=>e.jsx("option",{value:J.value,children:J.label},J.value))}):e.jsx("input",{type:"text",disabled:A,value:z[W.name]??(W.defaultValue||""),onChange:J=>U(re=>({...re,[W.name]:J.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),W.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:W.tooltip})]},W.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!A&&N(null),disabled:A,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:ne,disabled:!V||A,children:A?"Importing…":"Import"})]})]})}),F&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:W=>{W.target===W.currentTarget&&C(null)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:W=>W.stopPropagation(),children:e.jsx(ci,{jobData:F.data,onClose:()=>C(null)})})}),H.map(({serviceCode:W,label:J,descriptors:re})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Zt,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:J})]})}),e.jsx("div",{className:"node-list",children:re.map(X=>{var Te;const se=L(X),oe=k.has(se),pe=!!j[se],de=g[se],ie=(de==null?void 0:de.items)||[],me=(de==null?void 0:de.totalElements)??ie.length,fe=X.icon?qe[X.icon]:null,ye=de&&(de.totalPages??0)>(de.page??0)+1,ke=Yt(X);return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>D(X),children:[e.jsx("span",{className:"type-chevron",children:oe?e.jsx(Ve,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Ue,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),fe?e.jsx(fe,{size:11,color:X.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):X.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:X.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:X.description||void 0,children:X.displayName}),e.jsx("span",{className:"type-group-count",children:pe&&ie.length===0?"…":me}),X.create&&a&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${X.displayName}`,onClick:Se=>{Se.stopPropagation(),a(X)},children:e.jsx(De,{size:10,strokeWidth:2.5})}),((Te=X.importActions)==null?void 0:Te.length)>0&&e.jsx("button",{className:"type-group-create-btn",title:X.importActions[0].name||`Import ${X.displayName}`,onClick:Se=>{Se.stopPropagation(),Y(null),U({}),N({descriptor:X,action:X.importActions[0]})},children:e.jsx(Cn,{size:10,strokeWidth:2.5})})]}),oe&&e.jsxs(e.Fragment,{children:[pe&&ie.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Loading…"}),!pe&&ie.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),ie.length>0&&ie.map(Se=>{const Ae=Se.id||Se.ID,_e=Object.values(d).some(We=>We.has(Ae));if(u&&!_e)return null;const nt=X.serviceCode==="psm"&&R.has(Ae),Ye=`${se}/${Ae}`,Ze=G.has(Ye),Ge=B.current[Ae]==="loading",Qe=ke.hasItemChildren?ke.hasItemChildren(Se):!1;return e.jsxs(Oe.Fragment,{children:[e.jsx(Mn,{descriptor:X,item:Se,ctx:O,isActive:Ae===s,isOpen:!1,isPinned:_e,hasChildren:Qe,isExpanded:Ze,isLoading:Ge,onToggleExpand:We=>te(Ye,Se,X,We),onToggleChildren:We=>te(Ye,Se,X,We),onPin:()=>b($,X.serviceCode,X.itemCode,Ae),onUnpin:nt?null:()=>E($,X.serviceCode,X.itemCode,Ae)}),Ze&&le(ke,X,Se,Ye,1,new Set([Ae]))]},Ae)}),ye&&e.jsx("div",{className:"panel-empty",style:{fontSize:10,cursor:"pointer",color:"var(--muted2)"},onClick:()=>q(X),children:pe?"Loading…":`Load more (${me-ie.length} remaining)`})]})]},se)})})]},W))]})}function pi({descriptor:t,openItemIds:s,pinnedItemIds:n,openItemDataMap:r,ctx:a,onCreateNode:o,onOpenImport:i}){var b;const[c,u]=l.useState(!0),d=l.useMemo(()=>{const E=new Set,R=[];for(const $ of n)E.has($)||(E.add($),R.push({id:$,isPinned:!0,isOpen:s.includes($)}));for(const $ of s)E.has($)||(E.add($),R.push({id:$,isPinned:!1,isOpen:!0}));return R},[s,n]),p=t.icon?qe[t.icon]:null,h=d.length;return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>u(E=>!E),children:[e.jsx("span",{className:"type-chevron",children:c?e.jsx(Ve,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Ue,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),p?e.jsx(p,{size:11,color:t.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):t.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:t.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:t.description||void 0,children:t.displayName}),e.jsx("span",{className:"type-group-count",children:h||""}),t.create&&o&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${t.displayName}`,onClick:E=>{E.stopPropagation(),o(t)},children:e.jsx(De,{size:10,strokeWidth:2.5})}),((b=t.importActions)==null?void 0:b.length)>0&&i&&e.jsx("button",{className:"type-group-create-btn",title:t.importActions[0].name||`Import ${t.displayName}`,onClick:E=>{E.stopPropagation(),i(t,t.importActions[0])},children:e.jsx(Cn,{size:10,strokeWidth:2.5})})]}),c&&e.jsxs("div",{className:"node-list",children:[d.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),d.map(({id:E,isPinned:R,isOpen:$})=>e.jsx(On,{descriptor:t,itemRef:{source:t.serviceCode,type:t.itemCode||"",key:E},initialItem:r[E]||void 0,ctx:a,isOpen:$,isPinned:R},E))]})]})}function ui({openItems:t=[],openItemDataMap:s={},activeNodeId:n,stateColorMap:r,onNavigate:a,onCreateNode:o,toast:i}){const c=ae(z=>z.items),u=ae(z=>z.itemsStatus),d=ae(z=>z.basketItems),p=ae(z=>z.userId),[h,b]=l.useState(null),[E,R]=l.useState(null),[$,f]=l.useState({}),[g,m]=l.useState(!1),[j,x]=l.useState(null),[k,_]=l.useState(null),[G,K]=l.useState(!1),B=l.useRef(null);l.useEffect(()=>()=>{B.current&&clearInterval(B.current)},[]);const P=l.useMemo(()=>({userId:p,activeNodeId:n,stateColorMap:r,onNavigate:a}),[p,n,r,a]),S=l.useMemo(()=>c.filter(z=>{var A;return(z.panelSection||"MAIN").toUpperCase()==="MAIN"&&(z.list||z.create||((A=z.importActions)==null?void 0:A.length)>0)}),[c]),N=l.useMemo(()=>{const z=new Map;for(const A of S){const I=A.serviceCode||"_unknown";z.has(I)||z.set(I,[]),z.get(I).push(A)}const U=[];for(const[A,I]of z.entries()){I.sort((F,C)=>(C.priority??100)-(F.priority??100));const v=I.reduce((F,C)=>Math.max(F,C.priority??100),0),y=I[0].sourceLabel||A;U.push({serviceCode:A,label:y,maxPriority:v,descriptors:I})}return U.sort((A,I)=>I.maxPriority-A.maxPriority),U},[S]),V=l.useMemo(()=>{const z={};for(const U of t){const A=S.find(v=>za(v,U));if(!A)continue;const I=as(A);z[I]||(z[I]={openIds:[],pinnedIds:[]}),z[I].openIds.includes(U.key)||z[I].openIds.push(U.key)}for(const[U,A]of Object.entries(d)){const I=U.indexOf(":"),v=I>-1?U.slice(0,I):U,y=I>-1?U.slice(I+1):"",F=S.find(M=>M.serviceCode===v&&M.itemCode===y);if(!F)continue;const C=as(F);z[C]||(z[C]={openIds:[],pinnedIds:[]});for(const M of A)z[C].pinnedIds.includes(M)||z[C].pinnedIds.push(M)}return z},[t,d,S]);async function Y(){if(!h||!E)return;const{descriptor:z,action:U}=h,A=`/api/${z.serviceCode}${U.path}`,I=new FormData;I.append("file",E),(U.parameters||[]).forEach(C=>{const M=$[C.name];M!=null&&M!==""&&I.append(C.name,M)});const v={},y=ft(),F=Rt();y&&(v.Authorization=`Bearer ${y}`),F&&(v["X-PLM-ProjectSpace"]=F),m(!0),x(0);try{const C=await Mt(A,"POST",v,I,O=>x(O));if(!C.ok){const O=await C.json().catch(()=>({}));throw new Error(O.error||O.message||`HTTP ${C.status}`)}const M=await C.json().catch(()=>null);if(b(null),x(null),M!=null&&M.jobId&&U.jobStatusPath){const O=U.jobStatusPath.replace("{jobId}",M.jobId),L=M.jobId;_({id:L,data:{job:{id:L,status:M.status||"PENDING"},results:[]}}),K(!0),be.getState().registerBgJob(L,U.name||"Import",()=>K(!0)),B.current&&clearInterval(B.current),B.current=setInterval(async()=>{var w;try{const D=await Cs(z.serviceCode,O);_(te=>te?{...te,data:D}:null);const q=(w=D.job)==null?void 0:w.status;(q==="DONE"||q==="FAILED")&&(be.getState().updateBgJob(L,q==="DONE"?"done":"failed"),clearInterval(B.current),B.current=null)}catch{}},2e3)}else i==null||i(`${E.name} imported`,"success")}catch(C){b(null),x(null),i==null||i(C,"error")}finally{m(!1)}}return u!=="loaded"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):e.jsxs(e.Fragment,{children:[h&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:z=>{z.target===z.currentTarget&&!g&&b(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:h.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!g&&b(null),disabled:g,children:e.jsx(xt,{size:14})})]}),h.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:h.action.description}),j!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[j,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${j}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:h.action.acceptedTypes||void 0,disabled:g,onChange:z=>{var U;return R(((U=z.target.files)==null?void 0:U[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),E&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[E.name," (",(E.size/1024).toFixed(1)," KB)"]}),(h.action.parameters||[]).map(z=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[z.label,z.required?" *":""]}),z.widgetType==="DROPDOWN"&&z.allowedValues?e.jsx("select",{disabled:g,value:$[z.name]??(z.defaultValue||""),onChange:U=>f(A=>({...A,[z.name]:U.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(z.allowedValues).map(U=>e.jsx("option",{value:U.value,children:U.label},U.value))}):e.jsx("input",{type:"text",disabled:g,value:$[z.name]??(z.defaultValue||""),onChange:U=>f(A=>({...A,[z.name]:U.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),z.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:z.tooltip})]},z.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!g&&b(null),disabled:g,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:Y,disabled:!E||g,children:g?"Importing…":"Import"})]})]})}),k&&G&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:z=>{z.target===z.currentTarget&&K(!1)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:z=>z.stopPropagation(),children:e.jsx(mi,{jobData:k.data,onClose:()=>{var U,A;(((U=k.data.job)==null?void 0:U.status)==="DONE"||((A=k.data.job)==null?void 0:A.status)==="FAILED")&&(be.getState().removeBgJob(k.id),_(null)),K(!1)}})})}),N.map(({serviceCode:z,label:U,descriptors:A})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Zt,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:U})]})}),e.jsx("div",{className:"node-list",children:A.map(I=>{const v=as(I),{openIds:y=[],pinnedIds:F=[]}=V[v]||{};return e.jsx(pi,{descriptor:I,openItemIds:y,pinnedItemIds:F,openItemDataMap:s,ctx:P,onCreateNode:o,onOpenImport:(C,M)=>{R(null),f({}),b({descriptor:C,action:M})}},v)})})]},z))]})}function mi({jobData:t,onClose:s}){const{job:n,results:r=[]}=t,a=n.status==="DONE"||n.status==="FAILED",o=r.reduce((c,u)=>(c[u.action]=(c[u.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${r.length} node${r.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,u])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",u]},c))}),r.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:r.map((c,u)=>e.jsxs("tr",{style:{borderTop:u>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||u))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:a?"Close":"Dismiss (job continues in background)"})})]})}const ln={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function hi({nodeTypes:t,tx:s,txNodes:n,userId:r,activeNodeId:a,stateColorMap:o,onNavigate:i,canCreateNode:c,onCreateNode:u,onCommit:d,onRollback:p,onReleaseNode:h,showSettings:b,activeSettingsSection:E,onSettingsSectionChange:R,settingsSections:$,isDashboardOpen:f,onOpenDashboard:g,browseRefreshKey:m,openItems:j,openItemDataMap:x,style:k,toast:_}){const[G,K]=l.useState(null),B=(s==null?void 0:s.txId)||(s==null?void 0:s.ID)||(s==null?void 0:s.id),P=n||[],S=Oe.useMemo(()=>{const N=new Map;return(t||[]).forEach(V=>{const Y=V.id||V.ID;N.set(Y,{name:V.name||V.NAME||Y,color:V.color||V.COLOR||null,icon:V.icon||V.ICON||null})}),N},[t]);return e.jsx("aside",{className:"left-panel",style:k,children:b?e.jsx("div",{className:"settings-section-nav",children:($||[]).map(N=>e.jsxs("div",{children:[e.jsx("div",{className:"settings-nav-group-label",children:N.groupLabel}),N.sections.map(({key:V,label:Y,icon:z})=>{const U=z?Sa[z]:null;return e.jsxs("div",{className:`settings-nav-item${E===V?" active":""}`,onClick:()=>R(V),children:[U&&e.jsx(U,{size:13,strokeWidth:1.8,color:E===V?"var(--accent)":"var(--muted)"}),Y]},V)})]},N.groupKey))}):e.jsxs(e.Fragment,{children:[!f&&e.jsxs("button",{className:"panel-dash-btn",onClick:g,title:"Open dashboard",children:[e.jsx("span",{style:{opacity:.7,lineHeight:1},children:"⬡"}),"Dashboard"]}),c&&e.jsxs("div",{className:"panel-section-header",style:{flex:"0 0 auto"},children:[e.jsx("div",{style:{flex:1}}),e.jsx("button",{className:"panel-icon-btn",title:"Create new object",onClick:()=>u(),children:e.jsx(De,{size:13,color:"var(--accent)",strokeWidth:2.5})})]}),e.jsx("div",{style:{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column"},children:e.jsx(ui,{openItems:j,openItemDataMap:x,activeNodeId:a,stateColorMap:o,onNavigate:i,onCreateNode:u,toast:_})}),e.jsx(di,{userId:r,activeNodeId:a,stateColorMap:o,onNavigate:i,refreshKey:m,panelSection:"INFO",toast:_}),e.jsxs("div",{className:"panel-section tx-panel",children:[e.jsxs("div",{className:"panel-section-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Bs,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsxs("span",{className:"panel-label",children:["Transaction",B&&e.jsxs("span",{className:"tx-id-badge",children:[B.slice(0,8),"…"]})]})]}),P.length>0&&e.jsx("span",{className:"tx-count-badge",children:P.length})]}),e.jsx("div",{className:"tx-list",children:B?P.length===0?e.jsxs("div",{className:"panel-empty",children:["Transaction open —",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"no objects checked out yet."})]}):P.map((N,V)=>{const Y=N.itemId||N.node_id||N.NODE_ID,z=N.logicalId||N.logical_id||N.LOGICAL_ID||"",U=N.nodeTypeName||N.node_type_name||N.NODE_TYPE_NAME||"",A=N.nodeTypeId||N.node_type_id||N.NODE_TYPE_ID||"",I=N.revision||N.REVISION||"A",v=N.iteration??N.ITERATION??1,y=(N.changeType||N.change_type||N.CHANGE_TYPE||"CONTENT").toUpperCase(),F=N.lifecycleStateId||N.lifecycle_state_id||N.LIFECYCLE_STATE_ID||"",C=ln[y]||ln.CONTENT,M=Y===a,O=G===Y,L=S.get(A),w=(L==null?void 0:L.color)||null,D=L!=null&&L.icon?qe[L.icon]:null;return O?e.jsxs("div",{className:"tx-item tx-item-confirm",onClick:q=>q.stopPropagation(),children:[e.jsx("span",{className:"tx-type-icon",children:D?e.jsx(D,{size:11,color:w||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:w||"var(--muted2)",display:"inline-block"}})}),e.jsxs("span",{className:"tx-confirm-msg",children:["Release ",z||Y,"?"]}),e.jsx("button",{className:"btn btn-danger btn-xs",onClick:()=>{h&&h(Y),K(null)},children:"Yes"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>K(null),children:"No"})]},V):e.jsxs("div",{className:`tx-item${M?" active":""}`,onClick:()=>i(Y,z||void 0,Ot),title:U,children:[e.jsx("span",{className:"tx-type-icon",children:D?e.jsx(D,{size:11,color:w||"var(--muted2)",strokeWidth:2}):w?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:w,display:"inline-block"}}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:"var(--muted2)",display:"inline-block"}})}),e.jsx("span",{className:"tx-logical",children:z||Y}),e.jsx("span",{className:"tx-reviter",style:{color:(o==null?void 0:o[F])||"var(--muted2)"},children:v===0?I:`${I}.${v}`}),e.jsx("span",{className:"tx-ct-badge",style:{background:C.bg,color:C.color},children:C.label}),e.jsx("button",{className:"tx-release-btn",title:"Release from transaction",onClick:q=>{q.stopPropagation(),K(Y)},children:e.jsx(Ur,{size:12,strokeWidth:2,color:"var(--muted)"})})]},V)}):e.jsxs("div",{className:"panel-empty",children:["No active transaction.",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"Checkout an object to begin."})]})}),B&&e.jsxs("div",{className:"tx-actions",children:[e.jsxs("button",{className:"btn btn-success btn-sm",style:{flex:1},onClick:d,children:[e.jsx(Bs,{size:12,strokeWidth:2}),"Commit"]}),e.jsxs("button",{className:"btn btn-danger btn-sm",onClick:p,children:[e.jsx(Gr,{size:12,strokeWidth:2}),"Rollback"]})]})]})]})})}const xi=Oe.memo(hi);function fi(t){return e.jsx(xi,{...t})}const cn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}},gi={PRIMARY:"var(--accent)",SECONDARY:"var(--muted)",DANGEROUS:"var(--danger)"};function Kn({revision:t,iteration:s}){const n=s===0?t:`${t}.${s}`;return e.jsx("span",{className:"dash-rev",children:n})}function Jn({lifecycleStateId:t,stateColorMap:s}){const n=(s==null?void 0:s[t])||"#6b7280";return e.jsx("span",{className:"dash-state-dot",style:{background:n},title:t})}function Xn({nodeTypeId:t,nodeTypeName:s,nodeTypes:n}){const r=(n||[]).find(c=>(c.id||c.ID)===t),a=(r==null?void 0:r.color)||(r==null?void 0:r.COLOR)||null,o=(r==null?void 0:r.icon)||(r==null?void 0:r.ICON)||null,i=o?qe[o]:null;return e.jsxs("span",{className:"dash-type-chip",children:[i?e.jsx(i,{size:9,color:a||"var(--muted2)",strokeWidth:2}):a?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:a,display:"inline-block",flexShrink:0}}):null,e.jsx("span",{style:{color:"var(--muted2)"},children:s||t})]})}function bi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){var h,b,E,R;const[a,o]=l.useState(void 0),[i,c]=l.useState(!0),[u,d]=l.useState(null),p=l.useCallback(async()=>{c(!0),d(null);try{const $=await Z.getDashboardTransaction(t);o($||null)}catch($){d($.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{p()},[p]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Open transaction"}),e.jsx("button",{className:"dash-refresh-btn",onClick:p,title:"Refresh",disabled:i,children:e.jsx("span",{style:{display:"inline-block",transform:"none"},children:"⟳"})})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),u&&e.jsx("div",{className:"dash-error",children:u}),!i&&!u&&!a&&e.jsx("div",{className:"dash-empty",children:"No open transaction"}),!i&&!u&&a&&e.jsxs("div",{className:"dash-tx-card",children:[e.jsxs("div",{className:"dash-tx-header",children:[e.jsxs("span",{className:"dash-tx-id",children:[(h=a.txId)==null?void 0:h.slice(0,8),"…"]}),e.jsx("span",{className:"dash-tx-title",children:a.title}),e.jsxs("span",{className:"dash-tx-count",children:[((b=a.nodes)==null?void 0:b.length)||0," object",((E=a.nodes)==null?void 0:E.length)!==1?"s":""]})]}),((R=a.nodes)==null?void 0:R.length)>0&&e.jsx("div",{className:"dash-tx-nodes",children:a.nodes.map($=>{const f=cn[($.changeType||"CONTENT").toUpperCase()]||cn.CONTENT;return e.jsxs("button",{className:"dash-tx-node",onClick:()=>r($.nodeId,$.logicalId||$.nodeId,Ot),children:[e.jsx(Jn,{lifecycleStateId:$.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:$.logicalId||$.nodeId}),e.jsx(Kn,{revision:$.revision,iteration:$.iteration}),e.jsx(Xn,{nodeTypeId:$.nodeTypeId,nodeTypeName:$.nodeTypeName,nodeTypes:n}),e.jsx("span",{className:"dash-badge",style:{background:f.bg,color:f.color},children:f.label})]},$.nodeId)})})]})]})}function vi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){const[a,o]=l.useState(null),[i,c]=l.useState(!0),[u,d]=l.useState(null),p=l.useCallback(async()=>{c(!0),d(null);try{const h=await Z.getDashboardWorkItems(t);o(Array.isArray(h)?h:[])}catch(h){d(h.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{p()},[p]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Objects you can work on"}),e.jsx("span",{className:"dash-section-hint",children:"last 10 · sorted by available actions"}),e.jsx("button",{className:"dash-refresh-btn",onClick:p,title:"Refresh",disabled:i,children:"⟳"})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),u&&e.jsx("div",{className:"dash-error",children:u}),!i&&!u&&(a==null?void 0:a.length)===0&&e.jsx("div",{className:"dash-empty",children:"No actionable objects found"}),!i&&!u&&(a==null?void 0:a.length)>0&&e.jsx("div",{className:"dash-work-list",children:a.map(h=>e.jsxs("button",{className:"dash-work-item",onClick:()=>r(h.nodeId,h.logicalId||h.nodeId,Ot),children:[e.jsxs("div",{className:"dash-work-row",children:[e.jsx(Jn,{lifecycleStateId:h.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:h.logicalId||h.nodeId}),e.jsx(Kn,{revision:h.revision,iteration:h.iteration}),e.jsx(Xn,{nodeTypeId:h.nodeTypeId,nodeTypeName:h.nodeTypeName,nodeTypes:n})]}),e.jsx("div",{className:"dash-action-chips",children:h.actions.map(b=>{var $,f;const E=(($=b.guardViolations)==null?void 0:$.length)>0,R=E?"Blocked: "+b.guardViolations.map(g=>g.message||g.code).join("; "):b.description||b.label;return e.jsx("span",{className:"dash-action-chip",title:R,style:{color:gi[(f=b.metadata)==null?void 0:f.displayCategory]||"var(--muted)",opacity:E?.45:1},children:b.label},b.code)})})]},h.nodeId))})]})}function yi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){return e.jsxs("div",{className:"dashboard",children:[e.jsxs("div",{className:"dash-hero",children:[e.jsx("span",{className:"dash-hero-icon",children:"⬡"}),e.jsxs("div",{children:[e.jsx("div",{className:"dash-hero-title",children:"Dashboard"}),e.jsx("div",{className:"dash-hero-sub",children:"Quick overview of your work session"})]})]}),e.jsxs("div",{className:"dash-body",children:[e.jsx(bi,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}),e.jsx(vi,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r})]})]})}function ji({tabs:t,activeTabId:s,userId:n,tx:r,toast:a,nodeTypes:o,stateColorMap:i,onTabActivate:c,onTabClose:u,onTabPin:d,onSubTabChange:p,onNavigate:h,onAutoOpenTx:b,onDescriptionLoaded:E,onRefreshItemData:R,onOpenCommentsForVersion:$,onCommentAttribute:f,tabItemData:g}){const m=be(O=>O.showCollab),j=be(O=>O.toggleCollab),x="dashboard",k=t.find(O=>O.id===s),_=!!(k!=null&&k.nodeId),[G,K]=l.useState({}),B=l.useRef(null),P=l.useRef({});l.useEffect(()=>{var L,w;const O=new Set(t.map(D=>D.id));K(D=>Object.fromEntries(Object.entries(D).filter(([q])=>O.has(q))));for(const D of Object.keys(P.current))O.has(D)||((w=(L=P.current)[D])==null||w.call(L),delete P.current[D])},[t]),l.useEffect(()=>()=>{var O,L;s&&((L=(O=P.current)[s])==null||L.call(O),delete P.current[s])},[s]);const S=s?G[s]??{data:null,closed:!1,maximized:!1,splitPos:50}:null;function N(O){s&&K(L=>({...L,[s]:{closed:!1,maximized:!1,splitPos:50,...L[s],...O}}))}function V(O){s&&K(L=>({...L,[s]:{closed:!1,maximized:!1,splitPos:50,...L[s],data:O}}))}function Y(O){var L,w;s&&((w=(L=P.current)[s])==null||w.call(L),P.current[s]=O)}function z(O){O.preventDefault();const L=B.current;if(!L)return;function w(q){const te=L.getBoundingClientRect();N({splitPos:Math.max(20,Math.min(80,(q.clientX-te.left)/te.width*100))})}function D(){window.removeEventListener("mousemove",w),window.removeEventListener("mouseup",D)}window.addEventListener("mousemove",w),window.addEventListener("mouseup",D)}const U=k&&k.id!==x?Na(k):null,A=k&&k.id!==x?Ya(k)??U:null,I=(U==null?void 0:U.Preview)??null,v=(U==null?void 0:U.previewLabel)??"Preview",y=!!I,F=(S==null?void 0:S.closed)??!1,C=(S==null?void 0:S.maximized)??!1,M=(S==null?void 0:S.splitPos)??50;return e.jsx("div",{className:"editor-area",children:e.jsxs("div",{className:"editor-main",children:[e.jsxs("div",{className:"tab-bar",children:[t.length===0?e.jsx("div",{className:"tab-bar-empty",children:"Open an object from the navigation panel"}):t.map(O=>{var le;const L=O.id===x,w=O.nodeTypeId?(o||[]).find(H=>(H.id||H.ID)===O.nodeTypeId):null,D=(w==null?void 0:w.color)||(w==null?void 0:w.COLOR)||null,q=(w==null?void 0:w.icon)||(w==null?void 0:w.ICON)||null,te=q?qe[q]:null;return e.jsxs("div",{className:`editor-tab ${O.id===s?"active":""}`,onClick:()=>c(O.id),children:[L&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0,opacity:.6},children:"⬡"}),!L&&(te||D)&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:te?e.jsx(te,{size:10,color:D||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:D,display:"inline-block"}})}),e.jsx("span",{className:"tab-node-id",children:O.label||((le=O.nodeId)==null?void 0:le.slice(0,10))+"…"}),e.jsx("button",{className:`tab-pin ${O.pinned?"active":""}`,title:O.pinned?"Unpin tab":"Pin tab",onClick:H=>{H.stopPropagation(),d(O.id)},children:O.pinned?e.jsx(ts,{size:11,color:"var(--accent)",strokeWidth:2}):e.jsx(es,{size:11,color:"var(--muted)",strokeWidth:2})}),e.jsx("button",{className:"tab-close",title:"Close tab",onClick:H=>{H.stopPropagation(),u(O.id)},children:e.jsx(xt,{size:11,color:"var(--muted)",strokeWidth:2.5})})]},O.id)}),t.length>0&&e.jsx("div",{className:"tab-add",title:"Pin a tab or navigate to open a new one",children:e.jsx(De,{size:13,color:"var(--muted)",strokeWidth:2})}),_&&e.jsx("button",{className:`tab-comments-toggle${m?" active":""}`,onClick:j,title:m?"Hide comments":"Show comments",children:"💬"})]}),e.jsxs("div",{ref:B,style:{flex:1,display:"flex",overflow:"hidden",minHeight:0},children:[e.jsx("div",{className:"editor-content",style:y?{width:F?"calc(100% - 28px)":C?0:`${M}%`,flex:"none",overflow:C?"hidden":void 0,transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"}:void 0,children:k?k.id===x?e.jsx(yi,{userId:n,stateColorMap:i,nodeTypes:o,onNavigate:h}):(()=>{const O=(A==null?void 0:A.Editor)??(A==null?void 0:A.Component),L={userId:n,tx:r,nodeTypes:o,stateColorMap:i,toast:a,onAutoOpenTx:b,onDescriptionLoaded:E,onRefreshItemData:R,onOpenCommentsForVersion:$,onCommentAttribute:f,onSubTabChange:p,onNavigate:h,onRegisterPreview:V,onRegisterCancel:Y,itemData:g};return O?e.jsx(O,{tab:k,ctx:L}):e.jsx("div",{className:"editor-empty",children:e.jsx("div",{className:"editor-empty-text",children:"Loading editor…"})})})():e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⬡"}),e.jsx("div",{className:"editor-empty-text",children:"No object open"}),e.jsx("div",{className:"editor-empty-hint",children:"Select an object in the navigation panel to open it here"})]})}),y&&(F?e.jsx("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderLeft:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--surface)",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onClick:()=>N({closed:!1}),title:`Open ${v}`,children:e.jsxs("span",{style:{writingMode:"vertical-rl",fontSize:11,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1},children:[v," ▶"]})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{width:C?0:5,cursor:"col-resize",background:"var(--border)",flexShrink:0,userSelect:"none",overflow:"hidden",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onMouseDown:C?void 0:z}),e.jsxs("div",{style:{flex:1,minWidth:0,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1},children:[e.jsx("span",{children:v}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:2},children:[e.jsx("button",{className:"panel-icon-btn",title:C?"Restore":`Maximize ${v}`,onClick:()=>N({maximized:!C}),children:C?e.jsx(Hr,{size:13}):e.jsx(Vr,{size:13})}),e.jsx("button",{className:"panel-icon-btn",title:`Collapse ${v}`,onClick:()=>N({closed:!0}),children:e.jsx(xt,{size:13})})]})]}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(I,{data:(S==null?void 0:S.data)??null,tab:k,ctx:{userId:n,tx:r,nodeTypes:o,stateColorMap:i,toast:a,onAutoOpenTx:b,onDescriptionLoaded:E,onRefreshItemData:R,onOpenCommentsForVersion:$,onCommentAttribute:f,onSubTabChange:p,onNavigate:h,onRegisterPreview:V,itemData:g}})})]})]}))]})]})})}function wi(t){const s=be(a=>a.openCollab),n=be(a=>a.setVersionFilter),r=be(a=>a.setTriggerText);return e.jsx(ji,{...t,onOpenCommentsForVersion:a=>{n(a),s()},onCommentAttribute:a=>{r("#"+a+" "),s()}})}function ki(t){const s={};t.forEach(a=>{s[a.id]={...a,children:[]}});const n=[];t.forEach(a=>{a.parentCommentId&&s[a.parentCommentId]?s[a.parentCommentId].children.push(s[a.id]):n.push(s[a.id])});function r(a){a.sort((o,i)=>new Date(o.createdAt)-new Date(i.createdAt)),a.forEach(o=>r(o.children))}return r(n),n}function Si(t){const s=t.match(/#(\S+)/);return s?s[1]:null}function Ni(t,s){const n=t.slice(0,s);for(let r=n.length-1;r>=0;r--){const a=n[r];if(a==="#"||a==="@"){if(r===0||/\s/.test(n[r-1])){const o=n.slice(r+1);if(!/\s/.test(o))return{type:a,query:o,start:r}}return null}if(/\s/.test(a))return null}return null}function Ci({text:t,attrMap:s,userMap:n}){const r=[],a=/(#\S+|@\S+)/g;let o=0,i;for(;(i=a.exec(t))!==null;){i.index>o&&r.push({kind:"text",value:t.slice(o,i.index)});const c=i[0];if(c.startsWith("#")){const u=c.slice(1),d=s[u];r.push({kind:"attr",id:u,label:d})}else{const u=c.slice(1),d=n[u];r.push({kind:"user",id:u,name:d})}o=i.index+c.length}return o<t.length&&r.push({kind:"text",value:t.slice(o)}),e.jsx("span",{children:r.map((c,u)=>c.kind==="text"?e.jsx("span",{children:c.value},u):c.kind==="attr"?e.jsxs("span",{className:"mention-chip mention-attr",title:`Attribute: ${c.id}`,children:["#",c.label||c.id]},u):e.jsxs("span",{className:"mention-chip mention-user",title:`User: ${c.id}`,children:["@",c.name||c.id]},u))})}function Ei({items:t,activeIdx:s,onSelect:n,onHover:r}){return e.jsx("ul",{className:"autocomplete-dropdown",children:t.map((a,o)=>e.jsxs("li",{className:`autocomplete-item${o===s?" active":""}`,onMouseEnter:()=>r(o),onMouseDown:i=>{i.preventDefault(),n(a)},children:[e.jsxs("span",{className:"autocomplete-item-id",children:[a.prefix,a.id]}),a.label&&e.jsx("span",{className:"autocomplete-item-label",children:a.label})]},a.id))})}function Ti({nodeId:t,userId:s,width:n,onClose:r,filterVersionId:a,onClearFilter:o,users:i,triggerText:c,onClearTrigger:u,versionId:d,attributes:p,revision:h,iteration:b}){const[E,R]=l.useState([]),[$,f]=l.useState(""),[g,m]=l.useState(null),[j,x]=l.useState(!1),[k,_]=l.useState(null),[G,K]=l.useState(0),B=l.useRef(null),P=l.useMemo(()=>{const C={};return(p||[]).forEach(M=>{C[M.id]=M.label}),C},[p]),S=l.useMemo(()=>{const C={};return(i||[]).forEach(M=>{C[M.id]=M.displayName||M.username}),C},[i]),N=l.useMemo(()=>{if(!k)return[];const C=k.query.toLowerCase();return k.type==="#"?(p||[]).filter(M=>M.id.toLowerCase().includes(C)||M.label.toLowerCase().includes(C)).slice(0,8).map(M=>({id:M.id,label:M.label,prefix:"#"})):(i||[]).filter(M=>M.id.toLowerCase().includes(C)||(M.displayName||M.username||"").toLowerCase().includes(C)).slice(0,8).map(M=>({id:M.id,label:M.displayName||M.username,prefix:"@"}))},[k,p,i]),V=l.useCallback(async()=>{if(t)try{const C=await Z.getComments(s,t);R(Array.isArray(C)?C:[])}catch{}},[t,s]);l.useEffect(()=>{V()},[V]),Da(C=>{C.nodeId&&C.nodeId!==t||C.event==="COMMENT_ADDED"&&V()}),l.useEffect(()=>{c&&(f(c),u==null||u(),setTimeout(()=>{const C=B.current;C&&(C.focus(),C.setSelectionRange(c.length,c.length))},50))},[c]),l.useEffect(()=>{m(null),f(""),_(null)},[t]);const Y=l.useMemo(()=>ki(E),[E]),z=l.useMemo(()=>a?Y.filter(C=>C.versionId===a):Y,[Y,a]),U=l.useMemo(()=>{function C(M){return M.reduce((O,L)=>O+1+C(L.children),0)}return C(z)},[z]);function A(C){const M=C.target.value,O=C.target.selectionStart;f(M);const L=Ni(M,O);_(L),K(0)}function I(C){if(!k)return;const M=$.slice(0,k.start),O=$.slice(k.start+1+k.query.length),L=C.prefix+C.id+" ",w=M+L+O;f(w),_(null),setTimeout(()=>{const D=B.current;if(D){const q=M.length+L.length;D.focus(),D.setSelectionRange(q,q)}},0)}function v(C){if(k&&N.length>0){if(C.key==="ArrowDown"){C.preventDefault(),K(M=>Math.min(M+1,N.length-1));return}if(C.key==="ArrowUp"){C.preventDefault(),K(M=>Math.max(M-1,0));return}if(C.key==="Enter"||C.key==="Tab"){C.preventDefault(),I(N[G]);return}if(C.key==="Escape"){_(null);return}}C.key==="Enter"&&C.ctrlKey&&$.trim()&&y()}async function y(){if(!(!$.trim()||!d)){x(!0);try{const C=Si($.trim());await Z.addComment(s,t,d,$.trim(),(g==null?void 0:g.id)||null,C||null),f(""),m(null),_(null),await V()}catch{}finally{x(!1)}}}const F=h!=null?`${h??""}${b!=null?"."+b:""}`:"";return e.jsxs("div",{className:"comment-panel",style:{width:n},onClick:()=>k&&_(null),children:[e.jsxs("div",{className:"comment-panel-header",children:[e.jsxs("span",{children:["Comments",E.length>0&&e.jsx("span",{className:"comment-count-badge",children:E.length})]}),e.jsx("button",{className:"comment-close-btn",onClick:r,title:"Close",children:"✕"})]}),a&&e.jsxs("div",{className:"comment-filter-banner",children:[e.jsxs("span",{children:["Filtered: rev ",(()=>{const C=E.find(M=>M.versionId===a);return C?`${C.revision}.${C.iteration}`:a.slice(0,8)+"…"})()," · ",U," comment",U!==1?"s":""]}),e.jsx("button",{className:"comment-filter-clear",onClick:o,children:"Show all"})]}),e.jsx("div",{className:"comment-panel-list",children:z.length===0?e.jsx("div",{className:"comment-empty",children:a?"No comments on this version":"No comments yet"}):z.map(C=>e.jsx(Yn,{node:C,depth:0,onReply:m,activeReplyId:g==null?void 0:g.id,userId:s,attrMap:P,userMap:S},C.id))}),e.jsxs("div",{className:"comment-panel-input",onClick:C=>C.stopPropagation(),children:[d&&F&&e.jsxs("div",{className:"comment-version-context",children:["Commenting on rev ",e.jsx("strong",{children:F})]}),g&&e.jsxs("div",{className:"comment-reply-context",children:[e.jsxs("span",{children:["↩ Replying to ",e.jsx("strong",{children:g.author})]}),e.jsx("button",{className:"comment-cancel-reply",onClick:()=>m(null),children:"✕"})]}),e.jsxs("div",{className:"comment-input-wrap",children:[e.jsx("textarea",{ref:B,className:"field-input comment-textarea",rows:3,placeholder:d?"Write a comment… (# attr, @ user, Ctrl+Enter to post)":"No version available",value:$,onChange:A,onKeyDown:v,disabled:!d||j}),k&&N.length>0&&e.jsx(Ei,{items:N,activeIdx:G,onSelect:I,onHover:K})]}),e.jsx("button",{className:"btn btn-sm btn-success comment-post-btn",disabled:!$.trim()||!d||j,onClick:y,children:g?"↩ Post reply":"Post comment"})]})]})}const zi=72,Ii=16;function Yn({node:t,depth:s,onReply:n,activeReplyId:r,userId:a,attrMap:o,userMap:i}){const c=Math.min(s*Ii,zi),u=r===t.id;return e.jsxs("div",{style:{marginLeft:s>0?c:0},children:[e.jsx(Ai,{comment:t,onReply:n,isReply:s>0,isHighlighted:u,isOwn:t.author===a,attrMap:o,userMap:i}),t.children.length>0&&e.jsx("div",{className:"comment-children",style:{borderLeft:"2px solid var(--border2)",marginLeft:10},children:t.children.map(d=>e.jsx(Yn,{node:d,depth:s+1,onReply:n,activeReplyId:r,userId:a,attrMap:o,userMap:i},d.id))})]})}function Ai({comment:t,onReply:s,isReply:n,isHighlighted:r,isOwn:a,attrMap:o,userMap:i}){const c=t.createdAt?new Date(t.createdAt).toLocaleString(void 0,{dateStyle:"short",timeStyle:"short"}):"",u=["comment-item",n?"comment-reply":"",r?"comment-highlighted":"",a?"comment-own":""].filter(Boolean).join(" ");return e.jsxs("div",{className:u,children:[e.jsxs("div",{className:"comment-meta",children:[e.jsxs("span",{className:a?"comment-author comment-author-own":"comment-author",children:[t.author,a&&e.jsx("span",{className:"comment-you-badge",children:"you"})]}),t.attributeName&&e.jsxs("span",{className:"comment-attr-badge",title:`Attribute: ${t.attributeName}`,children:["#",o[t.attributeName]||t.attributeName]}),e.jsxs("span",{className:"comment-version",title:`Version ID: ${t.versionId}`,children:[t.revision,".",t.iteration]}),e.jsx("span",{className:"comment-time",children:c})]}),e.jsx("div",{className:"comment-text",children:e.jsx(Ci,{text:t.text,attrMap:o,userMap:i})}),e.jsx("button",{className:"comment-reply-btn",onClick:()=>s({id:t.id,author:t.author}),children:"↩ Reply"})]})}function $i({activeNodeId:t,userId:s,users:n,activeNodeDesc:r}){var m,j,x;const a=be(k=>k.showCollab),o=be(k=>k.collabWidth),i=be(k=>k.setCollabWidth),c=be(k=>k.closeCollab),u=be(k=>k.collabVersionFilter),d=be(k=>k.setVersionFilter),p=be(k=>k.collabTriggerText),h=be(k=>k.clearTriggerText),b=be(k=>k.collabTabs),E=l.useCallback(k=>{const _=k.clientX,G=o;function K(P){i(Math.max(240,Math.min(560,G+_-P.clientX)))}function B(){document.removeEventListener("mousemove",K),document.removeEventListener("mouseup",B)}document.addEventListener("mousemove",K),document.addEventListener("mouseup",B)},[o,i]),R=((m=r==null?void 0:r.metadata)==null?void 0:m.currentVersionId)??null,$=((j=r==null?void 0:r.metadata)==null?void 0:j.revision)??null,f=((x=r==null?void 0:r.metadata)==null?void 0:x.iteration)??null,g=l.useMemo(()=>{var _;const k=((_=r==null?void 0:r.metadata)==null?void 0:_.attributeMeta)||{};return((r==null?void 0:r.fields)||[]).filter(G=>k[G.name]).map(G=>({id:G.name,label:G.label}))},[r]);return!a||!t?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"resize-handle comment-resize",onMouseDown:E}),e.jsx(Ti,{nodeId:t,userId:s,width:o,onClose:c,filterVersionId:u,onClearFilter:()=>d(null),users:n,triggerText:p,onClearTrigger:h,versionId:R,attributes:g,revision:$,iteration:f}),b.map(k=>e.jsx("div",{style:{display:"none"}},k.id))]})}const Ri={error:"var(--danger, #fc8181)",warn:"var(--warning, #f0b429)",info:"var(--muted)",debug:"var(--muted2)"};function Pi(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function dn(){const t=be(n=>n.consoleLog),s=l.useRef(null);return l.useEffect(()=>{var n;(n=s.current)==null||n.scrollIntoView({behavior:"smooth"})},[t.length]),t.length===0?e.jsx("div",{style:{padding:"16px",color:"var(--muted)",fontSize:12,fontStyle:"italic"},children:"No platform events yet."}):e.jsxs("div",{style:{fontFamily:"monospace",fontSize:11,overflow:"auto",height:"100%",padding:"4px 8px"},children:[t.map((n,r)=>{var a;return e.jsxs("div",{style:{display:"flex",gap:8,lineHeight:"18px"},children:[e.jsx("span",{style:{color:"var(--muted2)",flexShrink:0},children:Pi(n.ts)}),e.jsx("span",{style:{color:Ri[n.level]??"inherit",flexShrink:0,width:40},children:(a=n.level)==null?void 0:a.toUpperCase()}),e.jsx("span",{style:{wordBreak:"break-all"},children:n.message})]},r)}),e.jsx("div",{ref:s})]})}function Li(){var d;const t=be(p=>p.consoleVisible),s=be(p=>p.consoleHeight),n=be(p=>p.setConsoleHeight),r=be(p=>p.consoleTabs),[a,o]=l.useState("console"),i=[{id:"console",label:"Console",Component:dn},...r],c=l.useCallback(p=>{p.preventDefault();const h=p.clientY,b=s;function E($){n(Math.max(80,Math.min(600,b+h-$.clientY)))}function R(){document.removeEventListener("mousemove",E),document.removeEventListener("mouseup",R)}document.addEventListener("mousemove",E),document.addEventListener("mouseup",R)},[s,n]);if(!t)return null;const u=((d=i.find(p=>p.id===a))==null?void 0:d.Component)??dn;return e.jsxs("div",{style:{height:s,flexShrink:0,display:"flex",flexDirection:"column",borderTop:"1px solid var(--border)"},children:[e.jsx("div",{style:{height:4,cursor:"row-resize",background:"var(--border)",flexShrink:0},onMouseDown:c}),e.jsx("div",{style:{display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:i.map(p=>e.jsx("button",{onClick:()=>o(p.id),style:{padding:"4px 12px",fontSize:11,fontWeight:a===p.id?600:400,color:a===p.id?"var(--fg)":"var(--muted)",background:"none",border:"none",borderBottom:a===p.id?"2px solid var(--accent)":"2px solid transparent",cursor:"pointer"},children:p.label},p.id))}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(u,{})})]})}const Bi=[];function Mi(){return[...Bi]}const ms={},Oi=1e4,Vt=3e4,Di=1e3,_i=(ms==null?void 0:ms.VITE_JAEGER_URL)||"http://localhost:16686",ws=100,Kt=1e3;function pn(t,s=0){if(t==null||Number.isNaN(t))return"hsl(210, 10%, 55%)";s>0&&t<Kt&&(t=Math.max(t,Kt*.75));const n=Math.max(0,Math.min(1,(t-ws)/(Kt-ws))),r=150-150*n,a=60+25*n,o=55-5*n;return`hsl(${r.toFixed(0)}, ${a.toFixed(0)}%, ${o.toFixed(0)}%)`}function un(t,s){return s===0?"IDLE":t<ws?"FAST":t<400?"OK":t<Kt?"SLOW":"BAD"}const kt={up:{dot:"#4dd4a0",label:"UP"},degraded:{dot:"#f0b429",label:"DEGRADED"},down:{dot:"#fc8181",label:"DOWN"},unknown:{dot:"#6b8099",label:"UNKNOWN"}};function Wi(t){return t==null?"—":t<60?`${t}s`:t<3600?`${Math.floor(t/60)}m`:`${Math.floor(t/3600)}h`}function Fi(t){if(t==null)return"—";const s=Math.floor(t/3600),n=Math.floor(t%3600/60),r=t%60;return s?`${s}h ${n}m`:n?`${n}m ${r}s`:`${r}s`}function $e(t){return t==null||Number.isNaN(t)?"—":t<10?`${t.toFixed(1)}ms`:t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(2)}s`}function It(t){return t==null?"—":t<1e3?String(t):t<1e6?`${(t/1e3).toFixed(1)}K`:`${(t/1e6).toFixed(1)}M`}function Je(t){return t==null?"—":t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`}function tt(t){return t<100?"lat-fast":t<400?"lat-ok":t<1e3?"lat-slow":"lat-bad"}function Ui({sorted:t}){if(!t||t.length<2)return e.jsx("div",{className:"perf-chart-empty",children:"Need at least 2 calls to plot distribution."});const s=600,n=90,r=34,a=6,o=8,i=18,c=s-r-a,u=n-o-i,d=t[t.length-1]||1,p=g=>r+c*g/(t.length-1),h=g=>o+u-u*g/d;let b="";for(let g=0;g<t.length;g++){const m=p(g).toFixed(1),j=h(t[g]).toFixed(1);b+=(g===0?"M":"L")+m+","+j+" "}const E=b+`L${p(t.length-1).toFixed(1)},${(o+u).toFixed(1)} L${r},${(o+u).toFixed(1)} Z`,R=[.5,.75,.9,.95,.99],$=g=>{const m=Math.min(t.length-1,Math.floor(t.length*g));return{p:g,v:t[m],x:p(m),y:h(t[m])}},f=[0,d/2,d];return e.jsxs("svg",{viewBox:`0 0 ${s} ${n}`,className:"perf-chart",preserveAspectRatio:"none",children:[f.map((g,m)=>{const j=h(g);return e.jsxs("g",{children:[e.jsx("line",{x1:r,y1:j,x2:s-a,y2:j,stroke:"var(--border)",strokeWidth:"0.5",strokeDasharray:"2,3"}),e.jsx("text",{x:r-4,y:j+3,textAnchor:"end",fontSize:"9",fill:"var(--muted2)",fontFamily:"var(--mono)",children:$e(g)})]},m)}),e.jsx("path",{d:E,fill:"rgba(106,172,255,0.18)"}),e.jsx("path",{d:b,stroke:"#6aacff",strokeWidth:"1.5",fill:"none"}),R.map(g=>{const m=$(g);return e.jsxs("g",{children:[e.jsx("line",{x1:m.x,y1:o,x2:m.x,y2:o+u,stroke:"#f0b429",strokeWidth:"0.6",strokeDasharray:"1,3",opacity:"0.65"}),e.jsx("circle",{cx:m.x,cy:m.y,r:"2",fill:"#f0b429"}),e.jsxs("text",{x:m.x,y:n-5,textAnchor:"middle",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:["p",Math.round(g*100)]})]},g)}),e.jsx("text",{x:r,y:n-5,textAnchor:"start",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p0"}),e.jsx("text",{x:s-a,y:n-5,textAnchor:"end",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p100"})]})}function Gi({showSettings:t,onToggleSettings:s,consoleVisible:n,onToggleConsole:r,leftSlots:a=[],rightSlots:o=[]}){const[i,c]=l.useState(null),[u,d]=l.useState(null),[p,h]=l.useState(!1),[b,E]=l.useState("services"),[R,$]=l.useState(null),[f,g]=l.useState(null),[m,j]=l.useState(Dt()),[x,k]=l.useState(()=>_t(Vt));l.useEffect(()=>{k(_t(Vt));const N=setInterval(()=>k(_t(Vt)),Di),V=Ds(()=>k(_t(Vt)));return()=>{clearInterval(N),V()}},[]);const _=l.useCallback(async()=>{try{const N=await mt.getStatus();c(N),d(null)}catch(N){d(N.message||String(N))}},[]);l.useEffect(()=>{_();const N=setInterval(_,Oi);return()=>clearInterval(N)},[_]),l.useEffect(()=>p?(j(Dt()),Ds(()=>j(Dt()))):void 0,[p]);const G=l.useCallback(async()=>{try{const N=await mt.getNatsStatus();$(N),g(null)}catch(N){g(N.message||String(N))}},[]);l.useEffect(()=>{if(!p||b!=="nats")return;G();const N=setInterval(G,5e3);return()=>clearInterval(N)},[p,b,G]);const K=Ho(),B=l.useMemo(()=>Mi(),[]),P=u?"down":(i==null?void 0:i.overall)||"unknown",S=kt[P]||kt.unknown;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-bar-row",children:[s&&e.jsxs("button",{type:"button",className:`status-bar-settings${t?" active":""}`,onClick:s,title:"Settings",children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]}),e.jsx("span",{children:"Settings"})]}),r&&e.jsxs("button",{type:"button",className:`status-bar-settings${n?" active":""}`,onClick:r,title:n?"Hide console":"Show console",style:{marginLeft:4},children:[e.jsx("span",{style:{fontSize:11},children:"≡"}),e.jsx("span",{children:"Console"})]}),a.map(N=>e.jsx(N.Component,{},N.id)),e.jsxs("button",{type:"button",className:"status-bar",onClick:()=>h(!0),title:"Click for platform status + API perf",children:[e.jsx("span",{className:"status-dot",style:{background:S.dot}}),e.jsx("span",{className:"status-label",children:"PLATFORM"}),e.jsx("span",{className:"status-value",style:{color:S.dot},children:S.label}),(i==null?void 0:i.services)&&e.jsxs("span",{className:"status-count",children:[i.services.filter(N=>N.healthy).length,"/",i.services.length," svc",i.totalInstances!=null&&e.jsxs(e.Fragment,{children:[" · ",i.totalHealthyInstances,"/",i.totalInstances," inst"]})]}),e.jsxs("span",{className:"perf-chip",style:{background:pn(x.p95,x.errorCount)},title:`30s window: ${x.count} calls · p95 ${$e(x.p95)} · avg ${$e(x.avgMs)}${x.errorCount?` · ${x.errorCount} err`:""}`,children:[e.jsx("span",{className:"perf-chip-dot"}),un(x.p95,x.count),x.count>0&&e.jsx("span",{className:"perf-chip-val",children:$e(x.p95)})]}),K.cacheBytes>0&&e.jsxs("span",{className:"cache-chip",title:`3D cache: ${K.entries} part${K.entries!==1?"s":""} · ${Je(K.cacheBytes)} / ${Je(K.maxBytes)}`,children:["3D · ",Je(K.cacheBytes)]})]})]}),p&&e.jsx("div",{className:"status-modal-overlay",onClick:()=>h(!1),children:e.jsxs("div",{className:"status-modal",onClick:N=>N.stopPropagation(),role:"dialog","aria-label":"Platform status",children:[e.jsxs("div",{className:"status-modal-header",children:[e.jsx("h3",{children:"Platform Status"}),e.jsxs("a",{className:"status-modal-jaeger",href:_i,target:"_blank",rel:"noopener noreferrer",title:"Open Jaeger tracing UI",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),e.jsx("polyline",{points:"15 3 21 3 21 9"}),e.jsx("line",{x1:"10",y1:"14",x2:"21",y2:"3"})]}),e.jsx("span",{children:"Traces"})]}),e.jsx("button",{className:"status-modal-close",onClick:()=>h(!1),"aria-label":"Close",children:"×"})]}),e.jsxs("div",{className:"status-tabs",children:[e.jsx("button",{className:`status-tab${b==="services"?" status-tab-active":""}`,onClick:()=>E("services"),children:"Services"}),e.jsxs("button",{className:`status-tab${b==="perf"?" status-tab-active":""}`,onClick:()=>E("perf"),children:["API Perf (",m.overall.total,")"]}),e.jsx("button",{className:`status-tab${b==="nats"?" status-tab-active":""}`,onClick:()=>E("nats"),children:"NATS"}),e.jsx("button",{className:`status-tab${b==="workers"?" status-tab-active":""}`,onClick:()=>E("workers"),children:"3D Workers"}),B.map(N=>e.jsx("button",{className:`status-tab${b===N.key?" status-tab-active":""}`,onClick:()=>E(N.key),children:N.label},N.key))]}),b==="services"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[e.jsx("span",{className:"status-dot",style:{background:S.dot}}),e.jsx("span",{className:"status-modal-overall",style:{color:S.dot},children:S.label}),(i==null?void 0:i.gatewayVersion)&&e.jsxs("span",{className:"status-modal-uptime",children:["spe-api ",e.jsx("code",{children:i.gatewayVersion})]}),(i==null?void 0:i.gatewayUptimeSeconds)!=null&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",Fi(i.gatewayUptimeSeconds)]}),e.jsx("button",{className:"status-modal-refresh",onClick:_,children:"refresh"})]}),u&&e.jsxs("div",{className:"status-modal-error",children:["Gateway unreachable: ",u]}),e.jsxs("table",{className:"status-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service / Instance"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Path"}),e.jsx("th",{children:"Affinity"}),e.jsx("th",{children:"Last HB"}),e.jsx("th",{children:"Failures"})]})}),e.jsx("tbody",{children:((i==null?void 0:i.services)||[]).flatMap(N=>{const V=N.status||(N.healthy?"up":"down"),Y=kt[V]||kt.unknown,z=e.jsxs("tr",{className:"status-row-service",children:[e.jsxs("td",{children:[e.jsx("code",{children:N.serviceCode}),N.instanceCount!=null&&e.jsxs("span",{className:"status-inst-badge",title:"healthy / total instances",children:[N.healthyInstances,"/",N.instanceCount," inst"]})]}),e.jsx("td",{children:N.version?e.jsx("code",{children:N.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:Y.dot}}),e.jsx("span",{style:{color:Y.dot},children:Y.label})]}),e.jsx("td",{children:N.path?e.jsx("code",{children:N.path}):e.jsx("span",{className:"muted",children:"—"})}),e.jsx("td",{children:N.instances&&N.instances.length>0&&(()=>{const A=N.instances.filter(y=>!y.untagged),I=N.instances.filter(y=>y.untagged);if(A.length===0)return e.jsx("span",{className:"muted",children:"all untagged"});const v=[...new Set(A.map(y=>y.spaceTag))].sort().join(", ");return e.jsxs("span",{className:"muted",children:[v,I.length?` + ${I.length} untagged`:""]})})()}),e.jsx("td",{colSpan:"2",children:N.registered?e.jsxs("span",{className:"muted",children:["pool of ",N.instanceCount]}):e.jsx("span",{className:"muted",children:"no instances registered"})})]},N.serviceCode),U=(N.instances||[]).map(A=>{const I=A.status||(A.healthy?"up":"down"),v=kt[I]||kt.unknown;return e.jsxs("tr",{className:"status-row-instance",children:[e.jsxs("td",{children:[e.jsx("span",{className:"status-inst-leaf",children:"↳"})," ",e.jsx("code",{className:"muted",children:A.instanceId})]}),e.jsx("td",{children:A.version?e.jsx("code",{children:A.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:v.dot}}),e.jsx("span",{style:{color:v.dot},children:v.label})]}),e.jsx("td",{children:A.untagged?e.jsx("span",{className:"muted",children:"—"}):e.jsx("code",{style:{fontSize:"0.85em"},children:A.spaceTag})}),e.jsx("td",{children:A.lastHeartbeatOk?Wi(A.ageSeconds)+" ago":e.jsx("span",{className:"muted",children:"never"})}),e.jsx("td",{children:A.consecutiveFailures??0})]},N.serviceCode+"/"+A.instanceId)});return[z,...U]})})]}),(i==null?void 0:i.timestamp)&&e.jsxs("div",{className:"status-modal-timestamp",children:["server time: ",i.timestamp]})]}),b==="perf"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"perf-window-banner",style:{"--perf-color":pn(x.p95,x.errorCount)},children:[e.jsx("span",{className:"perf-chip-dot perf-chip-dot-lg"}),e.jsxs("span",{className:"perf-window-label",children:["last 30s — ",un(x.p95,x.count)]}),e.jsxs("span",{className:"perf-window-metrics",children:[x.count," calls · p50 ",$e(x.p50)," · p95 ",$e(x.p95)," · max ",$e(x.maxMs),x.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[" · ",x.errorCount," err"]})]})]}),e.jsxs("div",{className:"status-modal-summary",children:[e.jsxs("span",{className:"status-perf-summary",children:[e.jsxs("span",{children:[m.overall.total," calls"]}),e.jsxs("span",{children:["avg ",e.jsx("strong",{className:tt(m.overall.avgMs),children:$e(m.overall.avgMs)})]}),e.jsxs("span",{children:["p50 ",e.jsx("strong",{className:tt(m.overall.p50),children:$e(m.overall.p50)})]}),e.jsxs("span",{children:["p95 ",e.jsx("strong",{className:tt(m.overall.p95),children:$e(m.overall.p95)})]}),e.jsxs("span",{children:["p99 ",e.jsx("strong",{className:tt(m.overall.p99),children:$e(m.overall.p99)})]}),e.jsxs("span",{children:["max ",e.jsx("strong",{className:tt(m.overall.maxMs),children:$e(m.overall.maxMs)})]}),m.overall.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[m.overall.errorCount," err"]})]}),e.jsx("button",{className:"status-modal-refresh",onClick:()=>{ua(),j(Dt())},children:"reset"})]}),e.jsxs("div",{className:"status-perf-note",children:["Window = last ",m.overall.windowSize," calls. Latency = browser-observed time through nginx → spe-api → ","{","psm,pno","}","."]}),e.jsx(Ui,{sorted:m.overall.sorted}),m.byEndpoint.length===0?e.jsx("div",{className:"status-perf-empty",children:"No API calls recorded yet."}):e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Method"}),e.jsx("th",{children:"Endpoint"}),e.jsx("th",{children:"#"}),e.jsx("th",{children:"avg"}),e.jsx("th",{children:"p50"}),e.jsx("th",{children:"p95"}),e.jsx("th",{title:"sorted desc by p95",children:"max ▼"}),e.jsx("th",{children:"last"}),e.jsx("th",{children:"err"})]})}),e.jsx("tbody",{children:[...m.byEndpoint].sort((N,V)=>V.p95-N.p95).map(N=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:N.method})}),e.jsx("td",{children:e.jsx("code",{title:N.endpoint,children:N.endpoint})}),e.jsx("td",{children:N.count}),e.jsx("td",{className:tt(N.avgMs),children:$e(N.avgMs)}),e.jsx("td",{className:tt(N.p50),children:$e(N.p50)}),e.jsx("td",{className:tt(N.p95),children:$e(N.p95)}),e.jsx("td",{className:tt(N.maxMs),children:$e(N.maxMs)}),e.jsx("td",{className:tt(N.lastMs),children:$e(N.lastMs)}),e.jsx("td",{className:N.errorCount?"lat-bad":"muted",children:N.errorCount||0})]},`${N.method} ${N.endpoint}`))})]})})]}),b==="nats"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[R?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-dot",style:{background:R.status==="up"?"#4dd4a0":"#fc8181"}}),e.jsx("span",{className:"status-modal-overall",style:{color:R.status==="up"?"#4dd4a0":"#fc8181"},children:R.status==="up"?"UP":"DOWN"}),R.version&&e.jsxs("span",{className:"status-modal-uptime",children:["v",R.version]}),R.uptime&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",R.uptime]})]}):e.jsx("span",{className:"muted",children:f?`Error: ${f}`:"Loading..."}),e.jsx("button",{className:"status-modal-refresh",onClick:G,children:"refresh"})]}),R&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nats-stats-grid",children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Connections"}),e.jsx("span",{className:"nats-stat-value",children:R.connections??0}),e.jsxs("span",{className:"nats-stat-sub",children:["total: ",R.totalConnections??0]})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Subscriptions"}),e.jsx("span",{className:"nats-stat-value",children:R.subscriptions??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages In"}),e.jsx("span",{className:"nats-stat-value",children:It(R.inMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:Je(R.inBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages Out"}),e.jsx("span",{className:"nats-stat-value",children:It(R.outMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:Je(R.outBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Slow Consumers"}),e.jsx("span",{className:`nats-stat-value${R.slowConsumers>0?" lat-bad":""}`,children:R.slowConsumers??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Sub Cache"}),e.jsx("span",{className:"nats-stat-value",children:R.numCache??0}),e.jsxs("span",{className:"nats-stat-sub",children:["matches: ",It(R.numMatches)]})]})]}),R.connectionDetails&&R.connectionDetails.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("h4",{className:"nats-section-title",children:["Client Connections (",R.numConnections,")"]}),e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"CID"}),e.jsx("th",{children:"Name"}),e.jsx("th",{children:"Lang"}),e.jsx("th",{children:"Subs"}),e.jsx("th",{children:"Msgs In"}),e.jsx("th",{children:"Msgs Out"}),e.jsx("th",{children:"Bytes In"}),e.jsx("th",{children:"Bytes Out"}),e.jsx("th",{children:"Uptime"}),e.jsx("th",{children:"Idle"})]})}),e.jsx("tbody",{children:R.connectionDetails.map(N=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:N.cid})}),e.jsx("td",{children:e.jsx("code",{title:N.name,children:N.name||"—"})}),e.jsx("td",{children:N.lang||"—"}),e.jsx("td",{children:typeof N.subscriptions=="number"?N.subscriptions:Array.isArray(N.subscriptions)?N.subscriptions.length:"—"}),e.jsx("td",{children:It(N.inMsgs)}),e.jsx("td",{children:It(N.outMsgs)}),e.jsx("td",{children:Je(N.inBytes)}),e.jsx("td",{children:Je(N.outBytes)}),e.jsx("td",{children:N.uptime||"—"}),e.jsx("td",{children:N.idle||"—"})]},N.cid))})]})})]})]})]}),b==="workers"&&e.jsxs("div",{style:{padding:"12px 16px",overflowY:"auto"},children:[e.jsx("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"},children:[{v:K.workers,l:"Workers"},{v:K.entries,l:"Cached Parts"},{v:Je(K.cacheBytes),l:"Memory Used"},{v:Je(K.maxBytes),l:"Memory Limit"},{v:K.memHits,l:"Mem Hits"},{v:K.idbHits,l:"IDB Hits"},{v:K.netFetches,l:"Downloads"},{v:$e(K.avgDownloadMs),l:"Avg Download"},{v:$e(K.avgParseMs),l:"Avg Parse"}].map(({v:N,l:V})=>e.jsxs("div",{style:{background:"var(--surface2)",borderRadius:6,padding:"8px 14px",minWidth:90},children:[e.jsx("div",{style:{fontSize:17,fontWeight:700,color:"var(--text)",lineHeight:1.2},children:N??"—"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginTop:2},children:V})]},V))}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted2)"},children:["Cache: ",Je(K.cacheBytes)," / ",Je(K.maxBytes)," (",K.maxBytes>0?(K.cacheBytes/K.maxBytes*100).toFixed(1):0,"%)"]}),e.jsx("div",{style:{marginTop:6,height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${K.maxBytes>0?Math.min(100,K.cacheBytes/K.maxBytes*100):0}%`,background:"var(--accent)",borderRadius:3,transition:"width .3s"}})}),e.jsxs("div",{style:{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginRight:4},children:"Limit / worker"}),[{label:"128 MB",bytes:128*1024*1024},{label:"256 MB",bytes:256*1024*1024},{label:"512 MB",bytes:512*1024*1024},{label:"1 GB",bytes:1024*1024*1024}].map(({label:N,bytes:V})=>{const Y=K.workers>0?K.maxBytes/K.workers:0,z=Math.abs(Y-V)<1024;return e.jsx("button",{type:"button",onClick:()=>Uo(V),style:{padding:"3px 10px",fontSize:11,borderRadius:4,border:"1px solid",borderColor:z?"var(--accent)":"var(--border)",background:z?"var(--accent)":"var(--surface2)",color:z?"#fff":"var(--text)",cursor:"pointer",fontWeight:z?700:400},children:N},N)})]}),e.jsxs("div",{style:{marginTop:10,display:"flex",gap:8},children:[e.jsx("button",{type:"button",onClick:()=>tn({idb:!1}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear Memory"}),e.jsx("button",{type:"button",onClick:()=>tn({idb:!0}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear All + IDB"})]}),e.jsx("div",{style:{marginTop:12,fontSize:11,color:"var(--muted2)"},children:"Avg timings = rolling average over last 50 loads per worker. IDB = IndexedDB persistent cache. Mem = in-memory LRU."})]}),B.map(N=>b===N.key&&e.jsx(N.Component,{},N.key))]})})]})}function Hi(){const t=be(s=>s.bgJobs);return t.length===0?null:e.jsx(e.Fragment,{children:t.map(s=>{const n=s.status==="done"||s.status==="failed",r=s.status==="failed";return e.jsxs("button",{className:"bg-job-chip",onClick:s.onOpen,title:`${s.label} — click to view`,children:[e.jsx("span",{className:`bg-job-dot${n?"":" bg-job-dot-pulse"}`,style:{background:r?"#fc8181":n?"#4dd4a0":"var(--accent)"}}),e.jsxs("span",{children:[s.label,n?r?" — Failed":" — Done":"…"]})]},s.id)})})}function mn(t){const s=be(i=>i.statusSlots),n=be(i=>i.consoleVisible),r=be(i=>i.toggleConsole),a=[{id:"_bg-jobs",Component:Hi,position:"left"},...s.filter(i=>i.position!=="right")],o=s.filter(i=>i.position==="right");return e.jsx(Gi,{...t,leftSlots:a,rightSlots:o,consoleVisible:n,onToggleConsole:r})}const Vi=350,qi=["_type","*"],Ki={_type:"Type"};function hn(t){return Ki[t]??t.replace(/_/g," ").replace(/\b\w/g,s=>s.toUpperCase())}function xn(t){return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(t)}function Ji({query:t,onQueryChange:s,onClose:n,onNavigate:r}){const[a,o]=l.useState(t||""),[i,c]=l.useState(null),[u,d]=l.useState(!1),[p,h]=l.useState({}),[b,E]=l.useState(null),[R,$]=l.useState(560),[f,g]=l.useState({}),[m,j]=l.useState({}),[x,k]=l.useState({}),_=l.useRef(null),G=ae(H=>H.basketItems),K=ae(H=>H.addToBasket),B=ae(H=>H.removeFromBasket),P=ae(H=>H.userId),S=ae(H=>H.items),N=ae(H=>H.itemsStatus),V=ae(H=>H.refreshItems),Y=ae(H=>H.stateColorMap),z=l.useMemo(()=>({onNavigate:r,userId:P,stateColorMap:Y,icons:qe}),[r,P,Y]),U=l.useMemo(()=>{const H={};for(const ne of S)ne.itemCode&&ne.displayName&&(H[ne.itemCode]=ne.displayName);return H},[S]);l.useEffect(()=>{Z.searchInfo().then(E).catch(()=>E({available:!1}))},[]);const A=(i==null?void 0:i.hits)||[];l.useEffect(()=>{if(!A.length||N==="loading"||N==="loaded")return;A.some(ne=>{const W=ne.serviceCode||"psm",J=ne.itemCode||ne.type;return!S.find(re=>re.serviceCode===W&&re.itemCode===J)})&&V()},[A,N,S,V]);const I=l.useRef([]),v=l.useCallback(async(H,ne)=>{if(!(H!=null&&H.trim())){c(null),g({}),j({});return}d(!0),g({}),j({});const W=I.current;try{const J=Object.fromEntries(Object.entries(ne).filter(([se,oe])=>(oe==null?void 0:oe.length)>0&&!W.includes(se))),re=Object.fromEntries(Object.entries(ne).filter(([se,oe])=>W.includes(se)&&(oe==null?void 0:oe[0])!=null&&(oe==null?void 0:oe[1])!=null).map(([se,oe])=>[se,[parseFloat(oe[0]),parseFloat(oe[1])]]).filter(([,se])=>!isNaN(se[0])&&!isNaN(se[1]))),X=await Z.searchNodes(H.trim(),J,re,qi,100);c(X)}catch{c(null)}finally{d(!1)}},[]),y=l.useCallback(async H=>{if(f[H]){g(ne=>({...ne,[H]:!1}));return}if(m[H]){g(ne=>({...ne,[H]:!0}));return}k(ne=>({...ne,[H]:!0}));try{const ne=await Z.searchChildren(H);j(W=>({...W,[H]:ne})),g(W=>({...W,[H]:ne.length>0}))}catch{g(ne=>({...ne,[H]:!1}))}finally{k(ne=>({...ne,[H]:!1}))}},[f,m]);l.useEffect(()=>{o(t||"")},[t]);const F=l.useMemo(()=>Object.keys((i==null?void 0:i.rangeFacets)||{}),[i]);l.useEffect(()=>{I.current=F},[F]),l.useEffect(()=>(clearTimeout(_.current),_.current=setTimeout(()=>v(a,p),Vi),()=>clearTimeout(_.current)),[a,p,v]);function C(H){o(H.target.value),s==null||s(H.target.value)}function M(H,ne){h(W=>{const J=W[H]||[],re=J.includes(ne)?J.filter(X=>X!==ne):[...J,ne];if(re.length===0){const{[H]:X,...se}=W;return se}return{...W,[H]:re}})}function O(){h({})}function L(H){H.preventDefault();const ne=H.clientX,W=R,J=X=>$(Math.max(420,Math.min(900,W+X.clientX-ne))),re=()=>{document.removeEventListener("mousemove",J),document.removeEventListener("mouseup",re)};document.addEventListener("mousemove",J),document.addEventListener("mouseup",re)}const w=(i==null?void 0:i.facets)||{},D=(i==null?void 0:i.rangeFacets)||{},q=(i==null?void 0:i.totalHits)??0,te=Object.values(p).some(H=>(H==null?void 0:H.length)>0),le=Object.keys(w).length>0||Object.keys(D).length>0;return e.jsxs("div",{className:"search-panel",style:{width:R},children:[e.jsx("div",{className:"resize-handle search-panel-resize",onMouseDown:L}),e.jsxs("div",{className:"search-panel-header",children:[e.jsx("span",{className:"search-panel-title",children:"Search"}),e.jsxs("div",{className:"search-panel-header-right",children:[b&&e.jsx("span",{className:`search-index-badge${b.available?"":" unavail"}`,title:b.available?`${b.nodeCount} nodes · ${b.edgeCount} edges indexed`:"Search index unavailable",children:b.available?`${xn(b.nodeCount)} nodes · ${xn(b.edgeCount)} edges`:"index unavailable"}),e.jsx("button",{className:"panel-icon-btn",onClick:n,title:"Close search",children:e.jsx(xt,{size:13,strokeWidth:2})})]})]}),e.jsx("div",{className:"search-panel-input-wrap",children:e.jsx("input",{autoFocus:!0,className:"search-panel-input",type:"text",placeholder:"Search nodes…",value:a,onChange:C})}),e.jsxs("div",{className:"search-panel-body",children:[e.jsx("div",{className:"search-facets",children:le?e.jsxs(e.Fragment,{children:[Object.entries(w).map(([H,ne])=>{const W=hn(H),J=p[H]||[];return e.jsxs("div",{className:"search-facet-group",children:[e.jsxs("div",{className:"search-facet-dim",children:[W,J.length>0&&e.jsx("span",{className:"search-facet-dim-count",children:J.length})]}),Object.entries(ne).slice(0,10).map(([re,X])=>{const se=J.includes(re),oe=H==="_type"&&U[re]||re;return e.jsxs("label",{className:`search-facet-item${se?" active":""}`,title:`${se?"Remove: ":"Add: "}${oe}`,children:[e.jsx("input",{type:"checkbox",className:"search-facet-checkbox",checked:se,onChange:()=>M(H,re)}),e.jsx("span",{className:"search-facet-val",children:oe}),e.jsx("span",{className:"search-facet-count",children:X})]},re)})]},H)}),Object.entries(D).map(([H,[ne,W]])=>{const J=p[H]||[],re=J[0]??"",X=J[1]??"",se=re!==""||X!=="";return e.jsxs("div",{className:"search-facet-group",children:[e.jsxs("div",{className:"search-facet-dim",children:[hn(H),se&&e.jsx("span",{className:"search-facet-dim-count",children:"1"})]}),e.jsxs("div",{className:"search-facet-range",children:[e.jsx("input",{type:"number",className:"search-facet-range-input",placeholder:ne!=null?String(Math.floor(ne)):"Min",value:re,onChange:oe=>h(pe=>({...pe,[H]:[oe.target.value,(pe[H]||[])[1]??""]}))}),e.jsx("span",{className:"search-facet-range-sep",children:"–"}),e.jsx("input",{type:"number",className:"search-facet-range-input",placeholder:W!=null?String(Math.ceil(W)):"Max",value:X,onChange:oe=>h(pe=>({...pe,[H]:[(pe[H]||[])[0]??"",oe.target.value]}))})]})]},H)}),te&&e.jsx("button",{className:"search-facet-clear",onClick:O,children:"Clear filters"})]}):e.jsx("div",{className:"search-facets-empty",children:a.trim()&&!u?"No facets":"Facets appear after search"})}),e.jsxs("div",{className:"search-panel-results",children:[u&&e.jsx("div",{className:"panel-empty",children:"Searching…"}),!u&&a.trim()&&i!==null&&q===0&&e.jsxs("div",{className:"panel-empty",children:['No results for "',a,'"']}),!u&&q>0&&e.jsxs("div",{className:"search-results-count",children:[q," result",q!==1?"s":"",te?" (filtered)":""]}),!u&&A.map(H=>{var me;const ne=H.serviceCode||"psm",W=H.itemCode||H.type,J=`${ne}:${W}`,re=!!((me=G[J])!=null&&me.has(H.id)),se=S.find(fe=>fe.serviceCode===ne&&fe.itemCode===W)??{serviceCode:ne,itemCode:W},oe=en(ne,W),pe=!!f[H.id],de=!!x[H.id],ie=m[H.id]||[];return e.jsxs("div",{className:"search-result-group",children:[e.jsxs("div",{className:"search-result-row-wrap",children:[e.jsx("button",{className:`search-expand-btn${pe?" open":""}${ie.length===0&&!pe&&m[H.id]!==void 0?" empty":""}`,title:pe?"Collapse":"Expand children",onClick:()=>y(H.id),disabled:de,children:de?"…":"▶"}),e.jsx("div",{style:{flex:1,minWidth:0},children:e.jsx(oe,{hit:H,descriptor:se,isPinned:re,onPin:()=>K(P,ne,W,H.id),onUnpin:()=>B(P,ne,W,H.id),ctx:z})})]}),pe&&ie.length>0&&e.jsx("div",{className:"search-children",children:ie.map(fe=>{var _e;const ye=fe.serviceCode||"psm",ke=fe.itemCode||fe.type,Te=`${ye}:${ke}`,Se=S.find(nt=>nt.serviceCode===ye&&nt.itemCode===ke)??{serviceCode:ye,itemCode:ke},Ae=en(ye,ke);return e.jsx(Ae,{hit:fe,descriptor:Se,isPinned:!!((_e=G[Te])!=null&&_e.has(fe.id)),onPin:()=>K(P,ye,ke,fe.id),onUnpin:()=>B(P,ye,ke,fe.id),ctx:z},fe.id)})}),pe&&ie.length===0&&m[H.id]!==void 0&&e.jsx("div",{className:"search-children-empty",children:"No children"})]},H.id)})]})]})]})}ti();const fn="ps-default";let Xi=0;function Yi(){const[t,s]=l.useState([]),[n,r]=l.useState(null),a=l.useCallback((o,i="info")=>{const c=typeof o=="string"?o:(o==null?void 0:o.message)||String(o),u=typeof o!="string"&&(o!=null&&o.detail)?o.detail:null;if(i==="error"){r(u??{error:c});return}const d=++Xi;s(p=>[...p,{id:d,msg:c,type:i}]),setTimeout(()=>s(p=>p.filter(h=>h.id!==d)),4e3)},[]);return{toasts:t,toast:a,errorDetail:n,setErrDetail:r}}function Zi({toasts:t}){return e.jsx("div",{className:"toasts",role:"status","aria-live":"polite",children:t.map(s=>e.jsxs("div",{className:`toast toast-${s.type}`,children:[e.jsx("span",{"aria-hidden":"true",children:s.type==="success"?"✓":s.type==="error"?"✗":s.type==="warn"?"⚠":"ℹ"}),s.msg]},s.id))})}function Qi(){var Ls;const{toasts:t,toast:s,errorDetail:n,setErrDetail:r}=Yi(),[a,o]=l.useState("user-alice"),[i,c]=l.useState(fn),u=ae(T=>T.setUserId),d=ae(T=>T.setProjectSpaceId),p=ae(T=>T.nodes),h=ae(T=>T.nodeTypes),b=ae(T=>T.resources),E=ae(T=>T.stateColorMap),R=ae(T=>T.stateColorMapLoaded),$=ae(T=>T.projectSpaces),f=ae(T=>T.users),g=ae(T=>T.activeTx),m=ae(T=>T.txNodes),j=ae(T=>T.refreshNodes),x=ae(T=>T.refreshTx),k=ae(T=>T.refreshAll),_=ae(T=>T.refreshItems),G=ae(T=>T.refreshStateColorMap),K=ae(T=>T.refreshProjectSpaces),B=ae(T=>T.refreshUsers),P=ae(T=>T.clearTx),S=ae(T=>T.loadBasket);ae(T=>T.addToBasket),ae(T=>T.basketItems);const N=ae(T=>T.syncBasketAdd),V=ae(T=>T.syncBasketRemove),Y=ae(T=>T.syncBasketClear),z=ae(T=>T.removeBasketItemIds),U=ae(T=>T.lockItem),A=ae(T=>T.unlockItem),I=ae(T=>T.unlockAll),[v,y]=l.useState(0),[F,C]=l.useState(!1),[M,O]=l.useState(""),L=l.useCallback(()=>y(T=>T+1),[]),[w,D]=l.useState(""),[q,te]=l.useState(""),le={id:"dashboard",nodeId:null,label:"Dashboard",pinned:!0},[H,ne]=l.useState([le]),[W,J]=l.useState("dashboard"),[re,X]=l.useState(null),[se,oe]=l.useState({}),pe=l.useRef(new Set),de=l.useCallback(T=>{var je;const ee=H.find(ge=>ge.nodeId===T);if(!((je=ee==null?void 0:ee.get)!=null&&je.path))return;const ce=(g==null?void 0:g.txId)||null;oe(ge=>({...ge,[T]:{...ge[T]??{},status:"loading"}})),In(ee.serviceCode,ee.get,T,ce?{txId:ce}:{}).then(ge=>oe(we=>({...we,[T]:{status:"ok",data:ge}}))).catch(ge=>{(ge==null?void 0:ge.status)===404?(pe.current.delete(T),oe(we=>{const Re={...we};return delete Re[T],Re}),ne(we=>{const Re=we.filter(ut=>ut.nodeId!==T);return J(ut=>{var Pe;return ut===ee.id?((Pe=Re.at(-1))==null?void 0:Pe.id)??null:ut}),Re})):oe(we=>({...we,[T]:{status:"error",error:ge.message}}))})},[H,g]),ie=l.useCallback(()=>{H.filter(T=>{var ee;return T.nodeId&&((ee=T.get)==null?void 0:ee.path)}).forEach(T=>de(T.nodeId))},[H,de]);l.useEffect(()=>{var ee;if(!W||W==="dashboard")return;const T=H.find(ce=>ce.id===W);!((ee=T==null?void 0:T.get)!=null&&ee.path)||!T.nodeId||pe.current.has(T.nodeId)||(pe.current.add(T.nodeId),de(T.nodeId))},[W,H]);const me=l.useRef(null);l.useEffect(()=>{const T=(g==null?void 0:g.txId)||null;if(T===me.current||(me.current=T,!W||W==="dashboard"))return;const ee=H.find(ce=>ce.id===W);ee!=null&&ee.nodeId&&de(ee.nodeId)},[g,W,H,de]);const[fe,ye]=l.useState(!1),[ke,Te]=l.useState(!1),[Se,Ae]=l.useState(null),[_e,nt]=l.useState(!1),[Ye,Ze]=l.useState(null),[vt,Ge]=l.useState(null),[Qe,We]=l.useState(268),[rt,zs]=l.useState(!1),[Is,As]=l.useState(null),[Qn,er]=l.useState(0),[tr,sr]=l.useState(!1),it=l.useCallback((T,ee,ce)=>{if(!ce||!ce.serviceCode)throw new Error("navigate(): descriptor is required");const je={serviceCode:ce.serviceCode,itemCode:ce.itemCode,itemKey:ce.itemKey,get:ce.get||null};ne(ge=>{const we=ge.find(Pe=>Pe.nodeId===T);if(we)return J(we.id),ge.map(Pe=>Pe.id===we.id?{...Pe,...je}:Pe);const Re=ge.find(Pe=>!Pe.pinned&&Pe.id!=="dashboard");if(Re)return J(Re.id),ge.map(Pe=>Pe.id===Re.id?{...Pe,nodeId:T,label:ee||T.slice(0,10),...je}:Pe);const ut=`tab-${Date.now()}`;return J(ut),[...ge,{id:ut,nodeId:T,label:ee||T.slice(0,10),pinned:!1,...je}]})},[]),nr=l.useCallback(T=>it(T.nodeId,T.label,T),[it]),$s=l.useCallback(T=>{ne(ee=>{const ce=ee.find(ge=>ge.id===T);ce!=null&&ce.nodeId&&(pe.current.delete(ce.nodeId),oe(ge=>{const we={...ge};return delete we[ce.nodeId],we}));const je=ee.filter(ge=>ge.id!==T);return W===T&&(J(je.length>0?je[je.length-1].id:null),X(null)),je})},[W]),Rs=l.useMemo(()=>oi({navigate:it,openTab:nr,closeTab:$s}),[]);Pn(["/topic/transactions","/topic/global","/topic/metamodel"],async T=>{if(T.event==="LOCK_ACQUIRED")T.lockedBy===a&&U(T.nodeId);else if(T.event==="LOCK_RELEASED")T.releasedBy===a&&A(T.nodeId);else if(T.event==="TX_COMMITTED")T.byUser===a&&I(),await x(),T.byUser&&T.byUser!==a&&s(`${T.byUser} committed a transaction`,"info");else if(T.event==="ITEM_DELETED"){const ee=T.nodeId||T.itemId;ee&&(z([ee]),ne(ce=>{const je=ce.find(we=>we.nodeId===ee);if(!je)return ce;pe.current.delete(ee),oe(we=>{const Re={...we};return delete Re[ee],Re});const ge=ce.filter(we=>we.nodeId!==ee);return J(we=>{var Re;return we===je.id?((Re=ge.at(-1))==null?void 0:Re.id)??null:we}),ge})),j(),L()}else if(T.event==="TX_ROLLED_BACK")T.byUser===a&&I(),await x(),await j(),ie(),L(),T.byUser&&T.byUser!==a&&s(`${T.byUser} rolled back a transaction`,"warn");else if(T.event==="ITEMS_RELEASED")T.byUser===a&&(T.nodeIds||[]).forEach(A),x(),L();else if(T.event==="ITEM_CREATED")j(),x(),L();else if(T.event==="ITEM_CAPTURED")x();else if(T.event==="BASKET_ITEM_ADDED")N(T.key,T.value);else if(T.event==="BASKET_ITEM_REMOVED")V(T.key,T.value);else if(T.event==="BASKET_CLEARED")Y();else if(T.event==="ITEM_VERSION_CREATED"||T.event==="ITEM_UPDATED"){const ee=T.nodeId||T.itemId;ee&&de(ee),j(),L()}else T.event==="METAMODEL_CHANGED"?(Oo(),_(),L(),R&&G(),T.byUser&&T.byUser!==a&&s(`${T.byUser} updated the metamodel`,"info")):T.event==="PNO_CHANGED"&&(B(),K(),T.byUser&&T.byUser!==a&&s(`${T.byUser} updated ${(T.entity||"PNO data").toLowerCase()}`,"info"))},a,i);function Ps(){nt(T=>(!T&&a&&(Z.getSettingsSections(a).then(ee=>{var je,ge,we;Ge(ee);const ce=(we=(ge=(je=ee==null?void 0:ee[0])==null?void 0:je.sections)==null?void 0:ge[0])==null?void 0:we.key;ce&&Ze(ce)}).catch(()=>Ge([])),G()),!T))}l.useEffect(()=>{Ws(fn),ha(T=>s(T,"error"))},[s]),l.useEffect(()=>{let T=!1;return zs(!1),As(null),(async()=>{try{await Fs.login(a)}catch(ee){T||As(ee.message||String(ee));return}if(!T){xa(async()=>{try{return(await Fs.login(a)).token}catch{return null}}),zs(!0),u(a),d(i),k(),K(),B(),G(),S(a),ya(a),_e&&Z.getSettingsSections(a).then(ee=>{var je,ge,we;Ge(ee);const ce=(we=(ge=(je=ee==null?void 0:ee[0])==null?void 0:je.sections)==null?void 0:ge[0])==null?void 0:we.key;ce&&Ze(ce)}).catch(()=>Ge([]));try{const ee=await ii(Rs);ee.length>0&&s(`Some plugins failed to load: ${ee.join("; ")}`,"error")}catch(ee){s(`Plugin manifest unavailable: ${ee.message||ee}`,"error")}finally{sr(!0),y(ee=>ee+1)}}})(),()=>{T=!0}},[a,i,Qn]);function rr(T){o(T),ne([le]),J("dashboard"),X(null),D("")}function ar(T){c(T),Ws(T),d(T),S(a),ne([le]),J("dashboard"),X(null),k()}function or(T){const ee=T.clientX,ce=Qe;function je(we){We(Math.max(160,Math.min(600,ce+we.clientX-ee)))}function ge(){document.removeEventListener("mousemove",je),document.removeEventListener("mouseup",ge)}document.addEventListener("mousemove",je),document.addEventListener("mouseup",ge)}async function ir(){if(g)return g.txId;try{const T=await ht.open(a,"Work session");return await x(),T.txId}catch(T){return s(T,"error"),null}}async function lr(){if(g)try{await ht.rollback(a,g.serviceCode,g.txId),s("Transaction rolled back","warn"),P(),await j(),ie()}catch(T){s(T,"error")}}async function cr(T){if(g)try{await ht.release(a,g.serviceCode,g.txId,[T]),s("Object released from transaction","info"),await k()}catch(ee){s(ee,"error")}}async function dr(T,ee){if(await k(),ie(),T&&ee>0){const ce=ee;s(`${ce} object${ce>1?"s":""} deferred — new transaction opened`,"info")}}const dt=H.find(T=>T.id===W),pt=dt==null?void 0:dt.nodeId,pr=W==="dashboard",ur=l.useMemo(()=>H.filter(T=>T.id!=="dashboard"&&T.nodeId).map(Ta).filter(Boolean),[H]),mr=l.useMemo(()=>{const T={};for(const ee of H){if(!ee.nodeId||ee.id==="dashboard")continue;const ce=se[ee.nodeId];(ce==null?void 0:ce.status)==="ok"&&ce.data&&(T[ee.nodeId]=Bn(ce.data))}return T},[H,se]),hr=l.useCallback(T=>{if((T==null?void 0:T.nodeId)===pt&&X(T),T!=null&&T.nodeId){const ee=T.logicalId||T.identity||void 0;ne(ce=>ce.map(je=>je.nodeId===T.nodeId?{...je,...T.nodeTypeId&&{nodeTypeId:T.nodeTypeId},...ee&&{label:ee}}:je))}},[pt]);return rt?e.jsx(ai.Provider,{value:Rs,children:e.jsxs("div",{className:"shell",children:[e.jsx(Oa,{userId:a,onUserChange:rr,users:f,nodeTypes:h,stateColorMap:E,searchQuery:w,searchType:q,onSearchChange:D,onSearchTypeChange:te,onSearchSubmit:T=>{O(T),C(!0)},projectSpaces:$,projectSpaceId:i,onProjectSpaceChange:ar,nodes:p,onNavigate:it}),e.jsxs("div",{className:"body",children:[e.jsx("div",{className:`search-strip${F?" search-strip--open":""}`,onClick:()=>C(T=>!T),title:F?"Close search":"Search items",children:e.jsxs("span",{className:"search-strip-label",children:[F?"◀":"▶"," Search"]})}),e.jsx(ds,{children:e.jsx(fi,{nodeTypes:h,tx:g,txNodes:m,userId:a,activeNodeId:pt,stateColorMap:E,onNavigate:it,canCreateNode:b.length>0,onCreateNode:T=>{Ae(T||null),Te(!0)},onCommit:()=>ye(!0),onRollback:lr,onReleaseNode:cr,showSettings:_e,onToggleSettings:Ps,activeSettingsSection:Ye,onSettingsSectionChange:Ze,settingsSections:vt,isDashboardOpen:pr,onOpenDashboard:()=>J("dashboard"),browseRefreshKey:v,openItems:ur,openItemDataMap:mr,style:{width:Qe},toast:s})}),e.jsx("div",{className:"resize-handle",onMouseDown:or}),e.jsxs("div",{className:"editor-column",children:[_e?e.jsx(ds,{children:e.jsx(zo,{userId:a,projectSpaceId:i,activeSection:Ye,onSectionChange:Ze,settingsSections:vt,pluginsLoaded:tr,toast:s})}):e.jsx(ds,{children:e.jsx(wi,{tabs:H,activeTabId:W,userId:a,tx:g,toast:s,nodeTypes:h,stateColorMap:E,onTabActivate:T=>J(T),onTabClose:$s,onTabPin:T=>ne(ee=>ee.map(ce=>ce.id===T?{...ce,pinned:!ce.pinned}:ce)),onSubTabChange:(T,ee)=>ne(ce=>ce.map(je=>je.id===T?{...je,activeSubTab:ee}:je)),onNavigate:it,onAutoOpenTx:ir,onDescriptionLoaded:hr,onRefreshItemData:de,tabItemData:dt!=null&&dt.nodeId?se[dt.nodeId]??null:null})}),e.jsx(Li,{})]}),e.jsx($i,{activeNodeId:pt,userId:a,users:f,activeNodeDesc:pt&&((Ls=se[pt])==null?void 0:Ls.status)==="ok"?se[pt].data:null})]}),F&&e.jsx(Ji,{query:M,onQueryChange:O,onClose:()=>C(!1),userId:a,projectSpaceId:i,onNavigate:it}),fe&&g&&e.jsx(Io,{userId:a,serviceCode:g.serviceCode,txId:g.txId,txNodes:m,stateColorMap:E,onCommitted:dr,onClose:()=>ye(!1),toast:s}),ke&&b.length>0&&e.jsx(Ao,{resources:b,initialDescriptor:Se,onCreated:async(T,ee)=>{await k(),(ee==null?void 0:ee.serviceCode)==="psm"&&(T!=null&&T.nodeId)&&it(T.nodeId,void 0,Ot)},onClose:()=>{Te(!1),Ae(null)},toast:s}),n&&e.jsx(Po,{detail:n,onClose:()=>r(null)}),e.jsx(Zi,{toasts:t}),e.jsx(mn,{showSettings:_e,onToggleSettings:Ps})]})}):e.jsxs("div",{className:"shell",children:[e.jsx("div",{className:"auth-splash",children:Is?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-error",children:"Login failed"}),e.jsx("div",{className:"auth-splash-detail",children:Is}),e.jsx("button",{className:"auth-splash-retry",onClick:()=>er(T=>T+1),children:"retry"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-spinner"}),e.jsxs("div",{className:"auth-splash-label",children:["Signing in as ",a,"…"]})]})}),e.jsx(mn,{})]})}const el=`
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ── Design tokens ───────────────────────────────────────────────── */
:root, [data-theme="dark"]{
  /* Surfaces */
  --bg:#0d0f12;--surface:#13161b;--surface2:#181c22;--bg2:#10131a;
  --border:#222831;--border2:#2d3748;

  /* Text — bumped for WCAG AA contrast */
  --text:#e8edf4;
  --muted:#8fa3bd;       /* ≥4.5:1 on --bg */
  --muted2:#6b8099;      /* ~3.5:1 — secondary only */

  /* Semantic */
  --accent:#6aacff;      /* slightly brighter blue — better contrast */
  --accent-dim:rgba(106,172,255,.11);
  --accent-hover:#88beff;
  --danger:#fc8181;
  --danger-rgb:252,129,129;
  --danger-bg:rgba(var(--danger-rgb),.08);--danger-border:rgba(var(--danger-rgb),.5);
  --success:#4dd4a0;     /* slightly adjusted for readability */
  --warn:#f0b429;

  /* Overlay — used for subtle hover/focus highlights */
  --overlay:255,255,255;
  --shadow:0,0,0;
  --subtle-bg:rgba(255,255,255,.02);
  --subtle-bg2:rgba(255,255,255,.01);

  /* Three.js scene background */
  --scene-bg:#1c1c2a;

  /* Geometry */
  --r:5px;--r2:8px;
  --mono:'DM Mono',monospace;--sans:'Syne',sans-serif;
  --panel-w:268px;--header-h:52px;--search-strip-w:28px;
}

[data-theme="light"]{
  --bg:#f5f6f8;--surface:#ffffff;--surface2:#ebedf0;--bg2:#eef0f4;
  --border:#d4d8e0;--border2:#c0c6d0;

  --text:#1a1d23;
  --muted:#5a6577;
  --muted2:#8590a2;

  --accent:#2b6cb0;
  --accent-dim:rgba(43,108,176,.09);
  --accent-hover:#2c5282;
  --danger:#c53030;
  --danger-rgb:197,48,48;
  --danger-bg:rgba(var(--danger-rgb),.08);--danger-border:rgba(var(--danger-rgb),.5);
  --success:#2f855a;
  --warn:#b7791f;

  --overlay:0,0,0;
  --shadow:0,0,0;
  --subtle-bg:rgba(0,0,0,.02);
  --subtle-bg2:rgba(0,0,0,.01);

  --scene-bg:#e8ecf4;
}


html,body,#root{height:100%;overflow:hidden}
body{background:var(--bg);color:var(--text);font-family:var(--mono);font-size:13px;line-height:1.5;-webkit-font-smoothing:antialiased}

/* ── Accessibility: global focus ring ───────────────────────────── */
:focus-visible{
  outline:2px solid var(--accent);
  outline-offset:2px;
  border-radius:3px;
}
/* Remove focus ring when interacting with mouse */
:focus:not(:focus-visible){outline:none}

/* ── Scrollbar ───────────────────────────────────────────────────── */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px}

/* ── Shell ───────────────────────────────────────────────────────── */
.shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}

/* ── Header ──────────────────────────────────────────────────────── */
.header{
  display:grid;grid-template-columns:auto 1fr auto;align-items:center;
  padding:0 16px;height:var(--header-h);flex-shrink:0;
  background:var(--surface);border-bottom:1px solid var(--border);
  position:relative;z-index:100;
}
.header-left{display:flex;align-items:center;gap:10px}
.header-center{display:flex;align-items:center;justify-content:center;padding:0 16px}
.header-right{display:flex;align-items:center;gap:10px;justify-content:flex-end}

.brand{
  font-family:var(--sans);font-weight:800;font-size:14px;
  letter-spacing:.05em;white-space:nowrap;color:var(--text);
  display:flex;align-items:center;gap:6px;
}
.brand-mark{
  width:24px;height:24px;border-radius:5px;
  background:linear-gradient(135deg,var(--accent) 0%,#7c3aed 100%);
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:800;color:#fff;flex-shrink:0;
}
.brand-sep{width:1px;height:20px;background:var(--border2);margin:0 4px}

.search-group{
  display:flex;align-items:center;width:100%;max-width:480px;
  background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  overflow:hidden;transition:border-color .15s;
}
.search-group:focus-within{border-color:var(--accent);outline:none}
.search-icon{padding:0 10px;color:var(--muted);font-size:13px;flex-shrink:0;pointer-events:none}
.search-input{
  flex:1;padding:8px 0;background:transparent;border:none;
  color:var(--text);font-family:var(--mono);font-size:12px;outline:none;
  min-width:0;
}
.search-input::placeholder{color:var(--muted2)}
.search-divider{width:1px;height:22px;background:var(--border2);flex-shrink:0}
.search-type{
  padding:0 10px 0 8px;background:transparent;border:none;
  color:var(--muted);font-family:var(--mono);font-size:11px;cursor:pointer;outline:none;
  -webkit-appearance:none;appearance:none;
}
.search-type option{background:var(--surface)}

.search-wrap{position:relative;width:100%;max-width:480px}
.search-suggestions{
  position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:300;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.35);
  overflow:hidden;
}
.search-sug-item{
  display:flex;align-items:center;gap:8px;
  padding:7px 12px;cursor:pointer;transition:background .1s;
}
.search-sug-item:hover,.search-sug-item.hi{background:var(--hover)}
.sug-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sug-lid{font-family:var(--mono);font-size:12px;color:var(--text);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}
.sug-dname{font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.sug-meta{font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap;flex-shrink:0}

.user-select-wrap{position:relative;display:flex;align-items:center;gap:8px}
.profile-avatar-btn{background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;border-radius:50%;transition:box-shadow .15s}
.profile-avatar-btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.profile-menu-wrap{position:relative}
.profile-menu{
  position:absolute;top:calc(100% + 8px);right:0;z-index:999;
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--r2);
  box-shadow:0 8px 24px rgba(0,0,0,.22);min-width:220px;padding:6px 0;
  animation:profile-menu-in .12s ease;
}
@keyframes profile-menu-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.profile-menu-header{padding:10px 14px 8px;border-bottom:1px solid var(--border)}
.profile-menu-name{font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.profile-menu-username{font-size:10px;color:var(--muted);margin-top:2px;font-family:var(--mono)}
.profile-menu-section{padding:4px 0}
.profile-menu-label{padding:6px 14px 2px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.profile-menu-select-row{padding:4px 10px}
.profile-menu-item{
  display:flex;align-items:center;gap:9px;width:100%;padding:8px 14px;
  background:none;border:none;font-family:var(--sans);font-size:12px;font-weight:500;
  color:var(--text);cursor:pointer;text-align:left;transition:background .1s;
}
.profile-menu-item:hover{background:var(--surface2)}
.profile-menu-item:disabled{color:var(--muted);cursor:not-allowed}
.profile-menu-item:disabled:hover{background:none}
.profile-menu-divider{height:1px;background:var(--border);margin:4px 0}

/* ── Basket button ──────────────────────────────────────────────────── */
.basket-btn-wrap {
  position: relative;
}
.basket-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: var(--r);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
  transition: background .15s;
  position: relative;
}
.basket-btn:hover { background: var(--hover); }
.basket-btn svg { display: block; }
.basket-badge {
  position: absolute;
  top: -4px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
}
.basket-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 280px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  box-shadow: 0 4px 16px rgba(0,0,0,.25);
  z-index: 200;
  overflow: hidden;
}
.basket-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}
.basket-dropdown-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: .05em;
}
.basket-dropdown-count {
  font-size: 11px;
  color: var(--muted);
}
.basket-dropdown-divider { height: 1px; background: var(--border); }
.basket-dropdown-action {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}
.basket-dropdown-action:hover:not(:disabled) { background: var(--hover); }
.basket-dropdown-action:disabled { color: var(--muted); cursor: default; }
.basket-dropdown-empty { padding: 10px 12px; font-size: 11px; color: var(--muted); }
.basket-dropdown-list { max-height: 280px; overflow-y: auto; }
.basket-dropdown-item {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px 4px 8px;
  border-radius: 3px;
  cursor: default;
}
.basket-dropdown-item:hover { background: var(--hover); }
.basket-item-icon {
  flex-shrink: 0; width: 13px; height: 13px;
  display: flex; align-items: center; justify-content: center;
}
.basket-item-state-dot {
  flex-shrink: 0; width: 5px; height: 5px; border-radius: 50%;
}
.basket-item-id {
  flex: 1; min-width: 0;
  font-size: 11px; color: var(--text);
  font-family: var(--mono);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.basket-item-rev {
  flex-shrink: 0; font-size: 10px; font-family: var(--mono);
  opacity: .8;
}
.basket-item-unpin {
  flex-shrink: 0; width: 16px; height: 16px;
  border: none; background: transparent; cursor: pointer;
  color: var(--muted); font-size: 14px; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  border-radius: 3px; padding: 0;
}
.basket-item-unpin:hover { background: var(--hover); color: var(--text); }
.basket-item-locked {
  flex-shrink: 0; width: 16px; height: 16px;
  display: flex; align-items: center; justify-content: center;
  color: var(--warn, #e8c547); opacity: .75;
}

.profile-modal-overlay{
  position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.45);
  display:flex;align-items:center;justify-content:center;
  animation:fade-in .15s ease;
}
.profile-modal{
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--r2);
  box-shadow:0 16px 48px rgba(0,0,0,.32);width:420px;max-width:calc(100vw - 32px);
  display:flex;flex-direction:column;max-height:80vh;
}
.profile-modal-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.profile-modal-title{font-size:13px;font-weight:700;color:var(--text)}
.profile-modal-body{overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:12px}
.user-avatar{position:relative;width:28px;height:28px;border-radius:50%;border:2px solid var(--avatar-color);background:color-mix(in srgb,var(--avatar-color) 12%,var(--surface));display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:visible}
.user-avatar-initials{font-size:10px;font-weight:700;color:var(--avatar-color);user-select:none;line-height:1}
.user-avatar-img{width:100%;height:100%;border-radius:50%;object-fit:cover}
.user-avatar-badge{position:absolute;top:-3px;right:-3px;width:13px;height:13px;border-radius:50%;background:#f59e0b;color:#fff;font-size:7px;font-weight:800;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--surface2);line-height:1}
.user-select{
  appearance:none;-webkit-appearance:none;
  background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--text);font-family:var(--sans);font-size:12px;font-weight:600;
  padding:6px 28px 6px 10px;cursor:pointer;outline:none;
  transition:border-color .15s;min-height:32px;
}
.user-select:hover{border-color:var(--border2)}
.user-select:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px}
.user-select option{background:var(--surface)}
.user-select-chevron{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);
  color:var(--muted);font-size:10px;pointer-events:none;
}
.ps-select-wrap{display:flex;align-items:center;gap:6px;margin-right:6px}
.ps-select{
  appearance:none;-webkit-appearance:none;
  background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--muted);font-family:var(--sans);font-size:11px;font-weight:600;
  padding:5px 24px 5px 8px;cursor:pointer;transition:border-color .15s;
}
.ps-select:focus-visible{border-color:var(--accent);outline:2px solid var(--accent);outline-offset:2px;color:var(--text)}
.ps-select option{background:var(--surface)}

/* ── Body layout ─────────────────────────────────────────────────── */
.body{display:flex;flex:1;overflow:hidden}
.editor-column{display:flex;flex-direction:column;flex:1;overflow:hidden;min-width:0}
.resize-handle{width:4px;flex-shrink:0;cursor:col-resize;background:transparent;transition:background .15s}
.resize-handle:hover,.resize-handle:active{background:var(--border2)}

/* ── Left Panel ──────────────────────────────────────────────────── */
.left-panel{
  width:var(--panel-w);flex-shrink:0;display:flex;flex-direction:column;
  background:var(--surface);border-right:1px solid var(--border);overflow:hidden;
}
.settings-section-nav{display:flex;flex-direction:column;flex:1;overflow-y:auto;padding:8px 6px}
.panel-section{display:flex;flex-direction:column;border-bottom:1px solid var(--border)}
.panel-section-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 10px;flex-shrink:0;border-bottom:1px solid var(--border);
  min-height:34px;
}
.panel-label{
  font-family:var(--sans);font-size:10px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:var(--muted);
}
.panel-icon-btn{
  display:flex;align-items:center;justify-content:center;
  background:none;border:none;padding:4px;cursor:pointer;
  border-radius:4px;transition:background .1s;line-height:0;
  color:var(--muted);
}
.panel-icon-btn:hover{background:var(--accent-dim);color:var(--fg)}
.panel-icon-btn:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.panel-empty{padding:16px 12px;font-size:11px;color:var(--muted2);font-style:italic;text-align:center}

/* Node list */
.node-list{flex:1;overflow-y:auto;min-height:0}

/* Type group header */
.type-group-hd{
  display:flex;align-items:center;gap:4px;
  padding:5px 10px;cursor:pointer;
  background:transparent;
  transition:background .1s;
  user-select:none;
}
.type-group-hd:hover{background:rgba(var(--overlay),.03)}
.type-chevron{display:flex;align-items:center;flex-shrink:0;width:16px}
.type-group-name{
  flex:1;font-family:var(--sans);font-size:11px;font-weight:700;
  color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.type-group-count{
  font-family:var(--sans);font-size:10px;font-weight:700;
  color:var(--muted2);background:rgba(var(--overlay),.05);
  padding:1px 6px;border-radius:99px;
}
.type-group-create-btn{
  display:none;background:none;border:none;
  padding:2px 3px;cursor:pointer;
  color:var(--muted);border-radius:var(--r);line-height:1;
  align-items:center;flex-shrink:0;
}
.type-group-hd:hover .type-group-create-btn{display:flex}
.type-group-create-btn:hover{color:var(--accent);background:var(--accent-dim)}

/* Node item (under type group) */
.node-item{
  display:flex;align-items:center;gap:6px;
  padding:5px 10px 5px 12px;cursor:grab;
  border-left:2px solid transparent;
  transition:background .1s,border-color .1s;
  user-select:none;
}
.node-item:active{cursor:grabbing}
.node-item:hover{background:rgba(var(--overlay),.03)}
.node-item.active{background:var(--accent-dim);border-left-color:var(--accent)}
.ni-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ni-id{font-family:var(--sans);font-weight:700;font-size:11px;color:var(--accent);white-space:nowrap}
.ni-open{font-size:8px;color:var(--warn);flex-shrink:0;margin-left:-2px}
/* Expand toggle — shared by node rows and link rows */
.ni-expand{
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;width:14px;height:14px;
  cursor:pointer;border-radius:2px;
  transition:background .1s;
}
.ni-expand:hover{background:rgba(var(--overlay),.08)}
/* Logical ID text */
.ni-logical{
  font-family:var(--mono);font-size:11px;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.ni-no-id{color:var(--muted2)}
.ni-dname{font-size:10px;color:var(--muted);margin-left:4px;font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Rev.iter */
.ni-reviter{
  font-family:var(--mono);font-size:10px;color:var(--muted);
  flex-shrink:0;
}
/* Link row — child of a node in the tree */
.ni-link-row{
  display:flex;align-items:center;gap:5px;
  padding-right:10px;
  min-height:22px;cursor:pointer;
  border-left:3px solid transparent;
  transition:background .1s;
  user-select:none;
}
.ni-link-row:hover{background:rgba(var(--overlay),.03)}
.ni-link-row.active{background:var(--accent-dim)}
/* Link logical ID inside a link row */
.ni-link-id{
  font-family:var(--mono);font-size:9px;font-weight:500;
  color:var(--muted);white-space:nowrap;
  max-width:64px;overflow:hidden;text-overflow:ellipsis;
  flex-shrink:0;
}
/* Version policy badge (V2M / V2V) */
.ni-policy{
  font-family:var(--sans);font-size:8px;font-weight:700;
  padding:1px 4px;border-radius:3px;flex-shrink:0;
}
.ni-policy-v2m{background:rgba(106,172,255,.15);color:var(--accent)}
.ni-policy-v2v{background:rgba(240,180,41,.15);color:var(--warn)}
/* Empty children placeholder */
.ni-child-empty{
  font-size:10px;color:var(--muted2);
  padding:3px 10px;user-select:none;
}

/* Lifecycle panel */
.lc-panel{flex:0 0 auto;max-height:38%}
.lc-list{overflow-y:auto;flex:1}
.lc-item{
  display:flex;align-items:center;gap:4px;
  padding:5px 10px;cursor:pointer;
  transition:background .1s;user-select:none;
}
.lc-item:hover{background:rgba(var(--overlay),.03)}
.lc-chevron{display:flex;align-items:center;flex-shrink:0;width:16px}
.lc-name{font-size:11px;color:var(--text);font-weight:600}
.lc-loading{font-size:11px;color:var(--muted);margin-left:4px}
.lc-states{padding:2px 0 4px 26px;display:flex;flex-direction:column;gap:1px}
.lc-state-item{display:flex;align-items:center;gap:6px;padding:3px 10px 3px 0}
.lc-state-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.lc-state-name{font-size:11px;color:var(--muted);flex:1}
.lc-state-flag{
  font-size:9px;font-family:var(--sans);font-weight:700;
  padding:1px 4px;border-radius:3px;
  background:rgba(var(--overlay),.07);color:var(--muted2);
}

/* Transaction panel (left panel bottom) */
.tx-panel{flex:0 0 auto;max-height:55%;display:flex;flex-direction:column}
.tx-list{flex:1;overflow-y:auto;min-height:0}
.tx-id-badge{
  margin-left:6px;font-family:var(--mono);font-size:9px;
  color:var(--accent);background:var(--accent-dim);
  padding:1px 5px;border-radius:99px;font-weight:400;vertical-align:middle;
}
.tx-count-badge{
  font-family:var(--sans);font-size:10px;font-weight:700;
  color:var(--muted2);background:rgba(var(--overlay),.06);
  padding:1px 7px;border-radius:99px;
}
.tx-item{
  display:flex;align-items:center;gap:6px;
  padding:4px 10px;cursor:pointer;
  border-left:2px solid transparent;
  transition:background .1s,border-color .1s;
}
.tx-item:hover{background:rgba(106,172,255,.06);border-left-color:rgba(106,172,255,.35)}
.tx-item.active{background:var(--accent-dim);border-left-color:var(--accent)}
.tx-type-icon{display:inline-flex;align-items:center;flex-shrink:0}
.tx-logical{
  font-family:var(--sans);font-weight:700;font-size:11px;color:var(--text);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
}
.tx-reviter{font-family:var(--mono);font-size:10px;color:var(--muted2);white-space:nowrap;flex-shrink:0}
.tx-ct-badge{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.04em;
  padding:1px 5px;border-radius:3px;white-space:nowrap;flex-shrink:0;
}
.tx-actions{
  display:flex;gap:6px;padding:8px 10px;flex-shrink:0;
  border-top:1px solid var(--border);
}

/* Panel footer — unused, settings moved to status bar */

/* ── Editor Area ─────────────────────────────────────────────────── */
.editor-area{flex:1;display:flex;flex-direction:row;overflow:hidden;background:var(--bg)}
.editor-main{display:flex;flex-direction:column;flex:1;overflow:hidden}

/* Tab bar */
.tab-bar{
  display:flex;align-items:stretch;
  background:var(--surface);border-bottom:1px solid var(--border);
  overflow-x:auto;flex-shrink:0;min-height:38px;
}
.tab-bar::-webkit-scrollbar{height:2px}
.editor-tab{
  display:flex;align-items:center;gap:5px;
  padding:0 10px;min-width:110px;max-width:170px;
  cursor:pointer;border-right:1px solid var(--border);
  font-size:11px;color:var(--muted);
  transition:background .1s,color .1s;
  border-bottom:2px solid transparent;flex-shrink:0;user-select:none;
}
.editor-tab:hover{background:var(--accent-dim);color:var(--text)}
.editor-tab.active{background:var(--bg);color:var(--text);border-bottom-color:var(--accent)}
.tab-node-id{
  font-family:var(--sans);font-weight:700;font-size:11px;color:inherit;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
}
.tab-pin{
  display:flex;align-items:center;justify-content:center;
  opacity:.3;cursor:pointer;transition:opacity .15s;
  background:none;border:none;padding:3px;flex-shrink:0;line-height:0;border-radius:3px;
}
.tab-pin:hover{opacity:.8;background:rgba(var(--overlay),.06)}
.tab-pin.active{opacity:1}
.tab-pin:focus-visible{outline:2px solid var(--accent)}
.tab-close{
  display:flex;align-items:center;justify-content:center;line-height:0;
  opacity:0;cursor:pointer;transition:opacity .1s;
  background:none;border:none;padding:3px;flex-shrink:0;border-radius:3px;
}
.editor-tab:hover .tab-close{opacity:.5}
.tab-close:hover{opacity:1!important;background:rgba(var(--danger-rgb),.12)}
.tab-close:focus-visible{opacity:1;outline:2px solid var(--danger)}
.tab-add{
  display:flex;align-items:center;justify-content:center;
  padding:0 12px;cursor:pointer;flex-shrink:0;line-height:0;
  border-radius:3px;margin:6px 4px;transition:background .12s;
}
.tab-add:hover{background:var(--accent-dim)}
.tab-bar-empty{
  flex:1;display:flex;align-items:center;padding:0 16px;
  font-size:12px;color:var(--muted2);font-style:italic;
}

/* Editor content */
.editor-content{flex:1;display:flex;flex-direction:column;overflow:hidden}
.editor-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:var(--muted2);text-align:center;gap:12px;
}
.editor-empty-icon{font-size:40px;opacity:.25}
.editor-empty-text{font-family:var(--sans);font-size:13px;color:var(--muted)}
.editor-empty-hint{font-size:11px;color:var(--muted2)}


/* ── Node Editor ─────────────────────────────────────────────────── */
.node-header{
  display:flex;align-items:flex-start;justify-content:space-between;
  padding-top:12px;margin-bottom:16px;gap:12px;
}
.node-title-group{display:flex;flex-direction:column;gap:6px}
.node-identity{font-family:var(--sans);font-weight:700;font-size:18px;color:var(--text);line-height:1}
.node-display-name{font-size:15px;color:var(--muted);font-weight:400;margin-left:2px}
.node-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.node-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0}

.open-banner{
  display:flex;align-items:center;gap:8px;padding:6px 12px;margin-bottom:14px;
  background:rgba(240,180,41,.06);border:1px solid rgba(240,180,41,.2);
  border-radius:var(--r);color:var(--warn);font-size:11px;
}
/* ── PBS drop zone ───────────────────────────────────────────────── */
.pbs-drop-zone{position:relative;transition:outline .1s}
.pbs-drop-zone.drag-over{
  outline:2px dashed var(--accent);outline-offset:4px;border-radius:var(--r2);
}
.pbs-drop-hint{
  position:absolute;inset:0;z-index:10;
  display:flex;align-items:center;justify-content:center;
  background:rgba(var(--shadow),.7);border-radius:var(--r2);
  font-size:13px;font-weight:600;color:var(--accent);
  pointer-events:none;
}
/* ── Link creation panel ─────────────────────────────────────────── */
.link-panel{
  display:flex;align-items:flex-end;flex-wrap:wrap;gap:8px;
  padding:10px 12px;margin-bottom:12px;
  background:rgba(106,172,255,.04);border:1px solid rgba(106,172,255,.18);
  border-radius:var(--r);
}
.violations-banner{
  padding:8px 12px;margin-bottom:12px;
  background:rgba(var(--danger-rgb),.06);border:1px solid rgba(var(--danger-rgb),.25);
  border-radius:var(--r);
}
.violations-banner-title{
  display:block;font-size:11px;font-weight:600;color:var(--danger);margin-bottom:4px;
}
.violations-banner-list{
  margin:0;padding-left:16px;list-style:disc;
}
.violations-banner-list li{
  font-size:11px;color:var(--danger);opacity:.9;line-height:1.6;
}

/* Sub-tabs */
.subtabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:18px}
.subtab{
  padding:8px 16px;cursor:pointer;font-size:12px;
  color:var(--muted);font-family:var(--sans);font-weight:600;
  border-bottom:2px solid transparent;transition:color .12s,border-color .12s;
}
.subtab:hover{color:var(--text)}
.subtab.active{color:var(--accent);border-bottom-color:var(--accent)}
.subtab:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.subtab-badge{
  display:inline-block;margin-left:5px;padding:1px 5px;
  border-radius:99px;font-size:9px;font-family:var(--sans);font-weight:700;
}

/* Attribute fields */
.attr-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.field{display:flex;flex-direction:column;gap:4px}
.field-label{
  font-size:10px;color:var(--muted);letter-spacing:.04em;
  display:flex;align-items:center;gap:3px;font-weight:500;
}
.field-req{color:var(--danger);font-weight:700}
.field-input{
  padding:8px 10px;background:var(--bg);border:1px solid var(--border2);
  border-radius:var(--r);color:var(--text);font-family:var(--mono);font-size:12px;
  transition:border-color .12s;outline:none;width:100%;
}
.field-input:focus{border-color:var(--accent)}
.field-input:focus-visible{border-color:var(--accent);outline:2px solid rgba(106,172,255,.3);outline-offset:0}
.field-input[readonly]{color:var(--muted);cursor:default;border-color:var(--border)}
.field-input.error{border-color:var(--danger)}
.field-input.ok{border-color:var(--success)}
select.field-input{cursor:pointer;appearance:none;-webkit-appearance:none}
.field-hint{font-size:11px;color:var(--muted);margin-top:1px}
.field-hint.error{color:var(--danger)}
.field-hint.warn{color:var(--warn)}

/* ── Logical-id pattern hint ─────────────────────────────────────── */
.logical-id-wrap{position:relative;display:flex;align-items:center}
.logical-id-wrap .field-input{padding-right:32px}
.logical-id-badge{
  position:absolute;right:8px;
  font-size:13px;font-weight:700;line-height:1;
  transition:color .15s;
}
.logical-id-badge.ok{color:var(--success)}
.logical-id-badge.err{color:var(--danger)}
.logical-id-hint{
  display:flex;align-items:center;flex-wrap:wrap;gap:6px;
  margin-top:4px;padding:5px 8px;
  background:rgba(var(--overlay),.03);border:1px solid var(--border);
  border-radius:var(--r);
}
.logical-id-hint-label{
  font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:var(--muted2);flex-shrink:0;
}
.logical-id-hint-code{
  font-family:var(--mono);font-size:11px;color:var(--accent);
  background:rgba(106,172,255,.08);padding:1px 5px;border-radius:3px;
  word-break:break-all;
}
.logical-id-hint-idle{font-size:10px;color:var(--muted2);margin-left:auto}
.logical-id-hint-ok{font-size:10px;font-weight:600;color:var(--success);margin-left:auto}
.logical-id-hint-err{font-size:10px;font-weight:600;color:var(--danger);margin-left:auto}

.section-label{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--muted);
  padding-bottom:6px;border-bottom:1px solid var(--border);margin:16px 0 10px;
}
.section-label:first-child{margin-top:0}

/* History table */
.history-table{width:100%;border-collapse:collapse}
.history-table th{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);
  padding:7px 10px;text-align:left;border-bottom:1px solid var(--border);
}
.history-table td{padding:7px 10px;border-bottom:1px solid var(--border);font-size:11px;vertical-align:middle}
.history-table tr:last-child td{border-bottom:none}
.history-table tr:hover td{background:rgba(var(--overlay),.02)}
.history-table tr.link-selected td{background:var(--surface2,rgba(0,0,0,.06))}
.history-table tr.link-selected:hover td{background:var(--surface2,rgba(0,0,0,.06))}
.link-detail-expand td{padding:0;border-bottom:1px solid var(--border)}
.link-detail-inner{padding:10px 14px;animation:link-detail-in .15s ease}
@keyframes link-detail-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
.history-table tr.pending-row td{background:rgba(232,169,71,.06);border-bottom:1px solid rgba(232,169,71,.18)}
.history-table tr.pending-row:hover td{background:rgba(232,169,71,.1)}
.history-table tr.historical-row td{background:rgba(251,191,36,.08);border-bottom:1px solid rgba(251,191,36,.25)}
.history-table tr.historical-row:hover td{background:rgba(251,191,36,.14)}
.pending-badge{
  display:inline-block;margin-left:6px;
  font-family:var(--sans);font-size:8px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;padding:1px 5px;border-radius:3px;vertical-align:middle;
  background:rgba(232,169,71,.18);color:var(--warn);border:1px solid rgba(232,169,71,.35);
}
.ver-num{font-family:var(--sans);font-weight:800;font-size:13px;color:var(--accent)}
.hist-type-badge{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;padding:2px 6px;border-radius:3px;
  background:rgba(106,172,255,.12);color:var(--accent);
}
.hist-type-badge[data-type="LIFECYCLE"]{background:rgba(77,212,160,.12);color:var(--success)}
.hist-type-badge[data-type="SIGNATURE"]{background:rgba(240,180,41,.12);color:var(--warn)}
.hist-comment{
  color:var(--muted);max-width:180px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;
}
.hist-state{color:var(--muted);font-size:11px;white-space:nowrap}
.hist-by{color:var(--muted);font-size:11px}
.hist-date{color:var(--muted2);font-size:10px;white-space:nowrap}
.hist-fp{
  font-family:var(--mono);font-size:10px;
  cursor:help;letter-spacing:.03em;
}

/* Diff button in history table */
.btn-diff{
  font-family:var(--mono);font-size:10px;letter-spacing:.04em;
  padding:2px 7px;border-radius:3px;cursor:pointer;
  background:rgba(106,172,255,.08);color:var(--accent);
  border:1px solid rgba(106,172,255,.18);
  transition:background .15s,border-color .15s;white-space:nowrap;
}
.btn-diff:hover{background:rgba(106,172,255,.18);border-color:rgba(106,172,255,.35)}
.btn-diff:disabled{opacity:.4;cursor:default}

/* Diff modal overlay */
.diff-overlay{
  position:fixed;inset:0;z-index:500;
  background:rgba(0,0,0,.6);backdrop-filter:blur(3px);
  display:flex;align-items:center;justify-content:center;
}
.diff-modal{
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--r2);
  width:min(760px,95vw);max-height:85vh;overflow:hidden;
  display:flex;flex-direction:column;
  box-shadow:0 24px 64px rgba(0,0,0,.5);
}
.diff-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;border-bottom:1px solid var(--border);
  flex-shrink:0;
}
.diff-title{font-family:var(--sans);font-weight:700;font-size:14px;color:var(--text)}
.diff-close{
  background:none;border:none;cursor:pointer;
  color:var(--muted);font-size:16px;padding:2px 6px;border-radius:var(--r);
  transition:color .15s;
}
.diff-close:hover{color:var(--text)}
.diff-meta-row{
  display:flex;align-items:stretch;gap:0;
  border-bottom:1px solid var(--border);flex-shrink:0;
}
.diff-meta-cell{flex:1;padding:12px 20px}
.diff-meta-old{border-right:1px solid var(--border);background:rgba(var(--danger-rgb),.03)}
.diff-meta-new{background:rgba(77,212,160,.03)}
.diff-arrow{
  display:flex;align-items:center;padding:0 10px;
  color:var(--muted2);font-size:18px;flex-shrink:0;
}
.diff-meta-label{font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.diff-meta-rev{font-family:var(--sans);font-weight:800;font-size:20px;color:var(--accent);margin-bottom:6px}
.diff-meta-sub{font-size:10px;color:var(--muted2);margin-top:6px}
.diff-state-change{
  padding:8px 20px;font-size:11px;
  background:rgba(240,180,41,.05);border-bottom:1px solid rgba(240,180,41,.15);
  flex-shrink:0;display:flex;align-items:center;gap:6px;
}
.diff-no-changes{
  padding:32px 20px;text-align:center;color:var(--muted);font-size:12px;
}
.diff-body{overflow-y:auto;flex:1;padding:0}
.diff-attr-section{padding:0}
.diff-section-title{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--muted);
  padding:10px 20px 6px;
}
.diff-empty-section{padding:0 20px 12px;color:var(--muted2);font-size:11px}
.diff-table{width:100%;border-collapse:collapse}
.diff-table th{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);
  padding:5px 12px;text-align:left;border-bottom:1px solid var(--border);
}
.diff-table td{padding:7px 12px;border-bottom:1px solid var(--border);font-size:11px;vertical-align:top}
.diff-table tr:last-child td{border-bottom:none}
.diff-attr-name{color:var(--muted);width:150px;min-width:100px;white-space:nowrap}
.diff-old-col{background:rgba(var(--danger-rgb),.04)}
.diff-new-col{background:rgba(77,212,160,.04)}
.diff-val-old{color:var(--danger);background:rgba(var(--danger-rgb),.06)}
.diff-val-new{color:var(--success);background:rgba(77,212,160,.06)}
.diff-row-unchanged td{opacity:.55}
.diff-empty{opacity:.4}
.diff-unchanged-details{border-top:1px solid var(--border);padding:0}
.diff-unchanged-details summary{padding:10px 20px 6px;list-style:none}
.diff-unchanged-details summary::-webkit-details-marker{display:none}
.diff-unchanged-details[open] summary{border-bottom:1px solid var(--border)}
/* Link diff */
.diff-link-entry{border-top:1px solid var(--border)}
.diff-link-entry:first-of-type{border-top:none}
.diff-link-summary{
  list-style:none;cursor:pointer;
  padding:7px 20px;display:flex;align-items:center;gap:0;font-size:12px;
  user-select:none;
}
.diff-link-summary::-webkit-details-marker{display:none}
.diff-link-summary:hover{background:rgba(var(--overlay),.03)}
.diff-link-detail{
  padding:6px 20px 10px 36px;border-top:1px solid var(--border);
  background:rgba(0,0,0,.12);
}
.diff-link-detail-row{
  display:flex;align-items:baseline;gap:12px;
  padding:3px 0;font-size:11px;
}
.diff-link-unch-row{
  display:flex;align-items:center;
  padding:4px 20px;font-size:11px;color:var(--muted2);
  border-top:1px solid var(--border);
}
.diff-link-unch-row:first-child{border-top:none}
.diff-fp-row{
  display:flex;align-items:center;gap:4px;
  padding:8px 20px;border-top:1px solid var(--border);
  font-family:var(--mono);font-size:10px;flex-shrink:0;
}
.diff-fp-label{color:var(--muted);margin-right:8px;font-family:var(--sans);font-size:9px;letter-spacing:.05em;text-transform:uppercase}
.diff-fp-val{letter-spacing:.03em}

/* Signatures */
.sig-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.sig-item:last-child{border-bottom:none}
.sig-meaning{font-family:var(--sans);font-weight:700;font-size:11px;color:var(--success)}
.sig-by{flex:1;font-size:11px;color:var(--muted)}
.sig-comment{font-size:11px;color:var(--muted2);font-style:italic}
.sign-panel{
  display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;
  padding:10px 14px;margin-bottom:14px;
  background:rgba(77,212,160,.05);border:1px solid rgba(77,212,160,.15);border-radius:var(--r);
}
/* Signature modal */
.signature-modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;
  display:flex;align-items:center;justify-content:center;
}
.signature-modal{
  background:var(--bg);border:1px solid var(--border);border-radius:var(--r);
  width:520px;max-height:80vh;display:flex;flex-direction:column;
  box-shadow:0 8px 32px rgba(0,0,0,.3);
}
.signature-modal-header{
  display:flex;justify-content:space-between;align-items:center;
  padding:12px 16px;border-bottom:1px solid var(--border);
  font-family:var(--sans);font-weight:700;font-size:14px;
}
.signature-modal-body{flex:1;overflow-y:auto;padding:12px 16px}
.signature-modal-form{padding:12px 16px;border-top:1px solid var(--border)}
.sig-group{margin-bottom:14px}
.sig-group-header{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--muted);margin-bottom:6px;
}
.sig-entry{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:12px}
.sig-entry:last-child{border-bottom:none}
.sig-meaning-badge{
  font-family:var(--sans);font-weight:700;font-size:10px;
  padding:2px 8px;border-radius:10px;
}
.sig-approved{background:rgba(86,209,142,.15);color:var(--success)}
.sig-rejected{background:rgba(239,68,68,.15);color:var(--danger)}
.sig-by{font-size:11px;color:var(--text)}
.sig-comment-text{flex:1;font-size:11px;color:var(--muted2);font-style:italic}
.sig-date{font-size:10px;color:var(--muted);margin-left:auto}
.history-sig-section{display:flex;align-items:center;gap:10px;padding:8px 0}

/* History + lifecycle merged tab */
.history-lc-section{padding-bottom:4px}
.history-lc-label{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.07em;
  text-transform:uppercase;color:var(--muted);margin-bottom:8px;
  display:flex;align-items:center;gap:8px;
}
.history-lc-divider{
  display:flex;align-items:center;gap:10px;
  margin:16px 0 12px;color:var(--muted);font-size:10px;
  font-family:var(--sans);font-weight:700;letter-spacing:.07em;text-transform:uppercase;
}
.history-lc-divider::before,.history-lc-divider::after{
  content:'';flex:1;height:1px;background:var(--border);
}

/* Lifecycle diagram */
.lc-diagram{overflow-x:auto;padding:8px 0;display:flex;justify-content:center}
.lc-diagram svg{display:block}
.lc-empty{padding:24px;color:var(--muted2);font-size:12px;font-style:italic}

/* ── Settings Page ───────────────────────────────────────────────── */
.settings-page{display:flex;flex:1;overflow:hidden;background:var(--bg)}
.settings-sidenav{
  width:200px;flex-shrink:0;background:var(--surface);
  border-right:1px solid var(--border);display:flex;flex-direction:column;padding:16px 0;
}
.settings-sidenav-title{
  display:flex;align-items:center;gap:8px;padding:0 14px 14px;
  font-family:var(--sans);font-size:11px;font-weight:700;color:var(--text);
  letter-spacing:.04em;border-bottom:1px solid var(--border);margin-bottom:8px;
}
.settings-sidenav-items{display:flex;flex-direction:column;gap:1px;padding:4px 6px}
.settings-nav-item{
  display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;
  border-radius:var(--r);font-family:var(--sans);font-size:12px;font-weight:600;
  color:var(--muted);transition:all .12s;
}
.settings-nav-item:hover{background:var(--surface2);color:var(--text)}
.settings-nav-item.active{background:var(--accent-dim);color:var(--accent)}
.settings-nav-item:focus-visible{outline:2px solid var(--accent)}
.settings-nav-group-label{
  font-size:10px;text-transform:uppercase;letter-spacing:.06em;
  color:var(--muted);padding:12px 10px 4px;font-weight:600;
  font-family:var(--sans);
}
.settings-section-nav > div:first-child .settings-nav-group-label{padding-top:4px}

.settings-content{display:flex;flex-direction:column;flex:1;overflow:hidden}
.settings-content-hd{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.settings-content-title{
  font-family:var(--sans);font-weight:800;font-size:16px;color:var(--text);
}
.settings-content-body{flex:1;overflow-y:auto;padding:16px 20px}
.settings-loading{padding:24px;color:var(--muted2);font-style:italic;font-size:12px}
.settings-list{display:flex;flex-direction:column;gap:8px}
.settings-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);overflow:hidden;
}
.settings-card--flat{
  display:flex;align-items:center;gap:10px;padding:10px 14px;
}
.settings-card-hd{
  display:flex;align-items:center;gap:8px;padding:10px 14px;cursor:pointer;
  transition:background .1s;
}
.settings-card-hd:hover{background:rgba(var(--overlay),.02)}
.settings-card-chevron{display:flex;align-items:center;flex-shrink:0}
.settings-card-name{font-family:var(--sans);font-weight:700;font-size:12px;color:var(--text);flex:1}
.settings-card-id{font-family:var(--mono);font-size:10px;color:var(--muted2)}
.settings-card-body{padding:0 14px 14px;border-top:1px solid var(--border)}
.settings-sub-label{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);margin:12px 0 6px;
}
.settings-lc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.settings-state-row{display:flex;align-items:center;gap:6px;padding:3px 0}
.settings-state-name{font-size:12px;color:var(--muted);flex:1}
.settings-transition-row{display:flex;align-items:center;justify-content:space-between;padding:3px 0}
.settings-tx-arrow{font-family:var(--mono);font-size:11px;color:var(--muted)}
.settings-empty-row{font-size:11px;color:var(--muted2);font-style:italic;padding:8px 0}
.settings-add-link-form{margin-top:8px;background:rgba(var(--overlay),.03);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;display:flex;flex-direction:column;gap:8px}
.settings-add-link-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.settings-add-link-row .field-input{font-size:11px;padding:4px 8px;height:28px}
.settings-add-link-actions{display:flex;justify-content:flex-end;gap:6px}
.settings-form-error{font-size:11px;color:var(--danger);background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:3px;padding:5px 9px}
.settings-badge{
  font-family:var(--sans);font-size:10px;font-weight:700;padding:2px 7px;
  border-radius:3px;background:rgba(var(--overlay),.07);color:var(--muted);
  white-space:nowrap;
}
.settings-badge--warn{background:rgba(240,180,41,.12);color:var(--warn)}
.settings-table{width:100%;border-collapse:collapse;margin-top:4px}
.settings-table th{
  font-family:var(--sans);font-size:10px;font-weight:700;letter-spacing:.08em;
  text-transform:uppercase;color:var(--muted);padding:6px 10px;text-align:left;
  border-bottom:1px solid var(--border);
}
.settings-table td{padding:6px 10px;border-bottom:1px solid var(--border);font-size:11px;vertical-align:middle}
.settings-table tr:last-child td{border-bottom:none}
.settings-table tr:hover td{background:rgba(var(--overlay),.02)}
.settings-td-mono{font-family:var(--mono);color:var(--accent)}

/* ── Shared Components ───────────────────────────────────────────── */

/* State pill */
.pill{
  display:inline-flex;align-items:center;gap:4px;
  padding:3px 9px;border-radius:99px;
  font-size:11px;font-family:var(--sans);font-weight:600;
}
.pill-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}

/* Buttons */
.btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:6px 12px;border-radius:var(--r);
  font-family:var(--mono);font-size:12px;line-height:1.2;
  border:1px solid var(--border2);cursor:pointer;
  transition:all .12s;background:var(--surface);color:var(--text);
  white-space:nowrap;min-height:30px;
}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.btn-primary{background:var(--accent);color:#05070a;border-color:var(--accent);font-weight:700}
.btn-primary:hover{background:var(--accent-hover);border-color:var(--accent-hover);color:#05070a}
.btn-success{border-color:rgba(77,212,160,.5);color:var(--success);background:rgba(77,212,160,.08)}
.btn-success:hover{background:rgba(77,212,160,.18);border-color:var(--success)}
.btn-danger{border-color:var(--danger-border);color:var(--danger);background:var(--danger-bg)}
.btn-danger:hover{background:rgba(var(--danger-rgb),.18);border-color:var(--danger)}
.btn-warn{border-color:rgba(240,180,41,.5);color:var(--warn)}
.btn-warn:hover{background:rgba(240,180,41,.1);border-color:var(--warn)}
.btn-sm{padding:4px 9px;font-size:11px;min-height:26px}
.btn-xs{padding:2px 7px;font-size:10px;min-height:22px}
.btn:disabled{opacity:.4;cursor:not-allowed;pointer-events:none}

/* Card */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);overflow:hidden}
.card-hd{
  padding:12px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.card-title{font-family:var(--sans);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.card-body{padding:16px}

/* Overlay / modal */
.overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.8);
  display:flex;align-items:center;justify-content:center;z-index:2000;
  backdrop-filter:blur(3px);
}

/* Toasts */
.toasts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:400}
.toast{
  padding:9px 14px;border-radius:var(--r);background:var(--surface);
  border:1px solid var(--border2);font-size:12px;min-width:240px;
  animation:toastIn .18s ease;display:flex;align-items:center;gap:8px;
  box-shadow:0 4px 24px rgba(0,0,0,.5);color:var(--text);
}
.toast-info{border-left:3px solid var(--accent)}
.toast-success{border-left:3px solid var(--success)}
.toast-error{border-left:3px solid var(--danger)}
.toast-warn{border-left:3px solid var(--warn)}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}

/* Error detail */
.err-card-func{width:460px;max-width:95vw}
.err-card-tech{width:740px;max-width:95vw;max-height:88vh;display:flex;flex-direction:column;overflow:hidden}
.err-body{display:flex;flex-direction:column;gap:10px;min-height:0;flex:1;overflow:hidden}
.err-message{font-weight:700;font-size:13px;color:var(--text);word-break:break-word;line-height:1.4}
.err-meta{font-size:11px;color:var(--muted)}
.stack-trace{
  background:#050709;border:1px solid var(--border2);border-radius:4px;
  padding:12px;font-family:var(--mono);font-size:10px;color:#7b96b2;
  overflow:auto;flex:1;white-space:pre;line-height:1.7;min-height:80px;
}
.violations-list{margin:4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.violation-item{
  font-size:12px;color:var(--danger);padding:4px 8px;
  background:rgba(var(--danger-rgb),.07);border-left:2px solid var(--danger);border-radius:2px;
}

/* Modals */
.commit-modal{width:500px;max-width:95vw}
.create-node-modal{width:480px;max-width:95vw;max-height:85vh;display:flex;flex-direction:column}
.modal-scroll{flex:1;overflow-y:auto;padding:16px}
.modal-identity-sep{display:flex;align-items:center;gap:8px;margin:12px 0 8px;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted2)}
.modal-identity-sep::before,.modal-identity-sep::after{content:'';flex:1;height:1px;background:var(--border2)}

/* Misc */
.row{display:flex;align-items:center;gap:8px}
.empty{text-align:center;padding:32px 16px}
.empty-icon{font-size:24px;margin-bottom:6px;opacity:.3;color:var(--muted)}
.empty-text{font-size:12px;color:var(--muted)}
.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}
.flex-end{justify-content:flex-end}

/* ── API Playground ──────────────────────────────────────────────── */

/* Shell: flex column filling the settings-content area */
.pg-shell{
  display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0;
}

/* Top bar */
.pg-topbar{
  display:flex;align-items:center;gap:10px;padding:9px 16px;
  background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;
}
.pg-topbar-title{font-family:var(--sans);font-weight:800;font-size:13px;color:var(--text)}
.pg-topbar-ver{
  font-family:var(--mono);font-size:10px;color:var(--accent);
  background:var(--accent-dim);padding:2px 7px;border-radius:99px;
}
.pg-topbar-meta{font-size:10px;color:var(--muted2)}
.pg-topbar-user{font-size:10px;color:var(--muted2);margin-left:auto}
.pg-topbar-user strong{color:var(--muted)}
.pg-topbar-refresh{}

/* Filter bar */
.pg-filter{
  display:flex;align-items:center;gap:8px;
  padding:8px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.pg-filter-input{
  flex:1;background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--text);font-family:var(--mono);font-size:12px;padding:6px 10px;
  outline:none;transition:border-color .15s;
}
.pg-filter-input:focus{border-color:var(--accent)}
.pg-filter-input::placeholder{color:var(--muted2)}

/* Scrollable endpoint list */
.pg-list{flex:1;overflow-y:auto;min-height:0}

/* Tag group */
.pg-group{border-bottom:1px solid var(--border)}
.pg-group-hd{
  display:flex;align-items:center;gap:8px;
  padding:8px 16px;cursor:pointer;user-select:none;
  background:var(--surface);border-bottom:1px solid var(--border);
  transition:background .1s;position:sticky;top:0;z-index:1;
}
.pg-group-hd:hover{background:var(--surface2)}
.pg-group-name{
  font-family:var(--sans);font-weight:700;font-size:11px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--muted);flex:1;
}
.pg-group-count{
  font-family:var(--sans);font-size:10px;font-weight:700;color:var(--muted2);
}
.pg-chevron{display:flex;align-items:center;width:14px;flex-shrink:0}

/* Endpoint row */
.pg-row{border-bottom:1px solid var(--border)}
.pg-row:last-child{border-bottom:none}
.pg-row-hd{
  display:flex;align-items:center;gap:10px;
  padding:8px 16px 8px 32px;cursor:pointer;
  transition:background .1s;min-height:38px;
}
.pg-row-hd:hover{background:rgba(var(--overlay),.02)}
.pg-row--open .pg-row-hd{background:rgba(106,172,255,.05)}
.pg-path{
  font-family:var(--mono);font-size:12px;color:var(--text);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0;max-width:340px;
}
.pg-summary{
  font-size:11px;color:var(--muted2);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;
}

/* Expanded body */
.pg-row-body{
  padding:16px 20px 20px 32px;
  background:rgba(0,0,0,.18);border-top:1px solid var(--border);
  display:flex;flex-direction:column;gap:16px;
}

/* Section within body */
.pg-section{display:flex;flex-direction:column;gap:8px}
.pg-section-label{
  font-family:var(--sans);font-size:10px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
  display:flex;align-items:center;gap:8px;
}
.pg-section-sub{
  font-size:10px;color:var(--muted2);font-weight:400;
  letter-spacing:0;text-transform:none;
}

/* PLM header grid */
.pg-header-grid{display:flex;flex-direction:column;gap:6px}
.pg-header-row{display:flex;align-items:center;gap:10px}
.pg-header-name{
  font-family:var(--mono);font-size:11px;color:var(--muted);
  width:190px;flex-shrink:0;
}
.pg-header-input{max-width:260px}

/* Params grid */
.pg-params-grid{display:flex;flex-direction:column;gap:10px}
.pg-param{display:flex;flex-direction:column;gap:4px}
.pg-param-hd{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pg-param-name{font-family:var(--mono);font-size:11px;color:var(--accent)}
.pg-param-in{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;color:var(--muted2);background:rgba(var(--overlay),.06);
  padding:1px 5px;border-radius:3px;
}
.pg-param-req{
  font-family:var(--sans);font-size:9px;font-weight:700;letter-spacing:.05em;
  text-transform:uppercase;color:var(--danger);background:rgba(var(--danger-rgb),.1);
  padding:1px 5px;border-radius:3px;
}
.pg-param-desc{font-size:10px;color:var(--muted2)}
.pg-input{
  background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  color:var(--text);font-family:var(--mono);font-size:11px;padding:5px 9px;
  outline:none;transition:border-color .15s;max-width:480px;
}
.pg-input:focus{border-color:var(--accent)}
.pg-input::placeholder{color:var(--muted2)}

/* ── Tx release button & confirmation ───────────────────────────── */
.tx-item{position:relative}
.tx-release-btn{
  display:none;flex-shrink:0;
  background:none;border:none;cursor:pointer;
  padding:2px;border-radius:3px;
  opacity:.6;transition:opacity .15s;
  margin-left:auto;
}
.tx-item:hover .tx-release-btn{display:flex}
.tx-release-btn:hover{opacity:1}

.tx-item-confirm{
  display:flex;align-items:center;gap:6px;
  padding:5px 8px;cursor:default;
  background:rgba(var(--danger-rgb),.07);
}
.tx-confirm-msg{
  font-size:11px;color:var(--muted);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.btn-xs{
  font-size:10px;padding:2px 7px;line-height:1.4;
  border-radius:3px;border:1px solid var(--border2);
  background:var(--surface2);color:var(--text);cursor:pointer;
}
.btn-xs:hover{border-color:var(--muted2)}
.btn-danger.btn-xs{
  background:rgba(var(--danger-rgb),.12);border-color:rgba(var(--danger-rgb),.3);color:var(--danger);
}
.btn-danger.btn-xs:hover{background:rgba(var(--danger-rgb),.22)}

/* ── Commit modal node list ─────────────────────────────────────── */
.commit-node-list{
  border:1px solid var(--border2);border-radius:var(--r);
  overflow:hidden;margin-bottom:14px;
  max-height:240px;display:flex;flex-direction:column;
}
.commit-node-list-scroll{overflow-y:auto;flex:1}
.commit-node-list-hd{
  padding:6px 10px;background:rgba(var(--overlay),.03);
  border-bottom:1px solid var(--border2);
}
.commit-node-all{
  display:flex;align-items:center;gap:7px;cursor:pointer;
  font-size:11px;color:var(--muted);
}
.commit-node-all input{cursor:pointer;accent-color:var(--accent)}
.commit-node-count{
  margin-left:auto;font-size:10px;color:var(--muted2);
  background:rgba(var(--overlay),.06);padding:1px 6px;border-radius:10px;
}
.commit-node-item{
  display:flex;align-items:center;gap:6px;
  padding:5px 10px;cursor:pointer;
  border-bottom:1px solid var(--border);
  font-size:11px;
  transition:background .1s;
}
.commit-node-item:last-child{border-bottom:none}
.commit-node-item:hover{background:rgba(var(--overlay),.04)}
.commit-node-item input{cursor:pointer;accent-color:var(--accent);flex-shrink:0}
.commit-node-dot{
  width:6px;height:6px;border-radius:50%;flex-shrink:0;
}
.commit-node-lid{color:var(--text);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.commit-node-rev{color:var(--muted2);font-size:10px;flex-shrink:0}
.commit-node-type{color:var(--muted2);font-size:10px;flex-shrink:0;max-width:80px;overflow:hidden;text-overflow:ellipsis}
.commit-node-badge{
  font-size:9px;padding:1px 5px;border-radius:3px;flex-shrink:0;
  font-family:var(--sans);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
}

/* Body editor */
.pg-body-editor{
  width:100%;max-width:600px;
  background:var(--bg);border:1px solid var(--border2);border-radius:var(--r);
  color:#7fb4d4;font-family:var(--mono);font-size:11px;line-height:1.65;
  padding:9px 11px;resize:vertical;outline:none;transition:border-color .15s;
}
.pg-body-editor:focus{border-color:var(--accent)}

/* Execute bar */
.pg-exec-bar{display:flex;align-items:center;gap:10px}
.pg-exec-meta{font-size:11px;color:var(--muted2)}
.pg-exec-meta strong{color:var(--muted);font-weight:600}

/* Response */
.pg-response{
  border:1px solid var(--border2);border-radius:var(--r);overflow:hidden;
  max-width:700px;
}
.pg-response-hd{
  display:flex;align-items:center;gap:8px;
  padding:7px 12px;background:rgba(var(--overlay),.03);border-bottom:1px solid var(--border2);
}
.pg-status{
  font-family:var(--sans);font-size:11px;font-weight:800;
  padding:2px 8px;border-radius:3px;
}
.pg-response-label{font-size:11px;color:var(--muted)}
.pg-response-body{
  font-family:var(--mono);font-size:11px;line-height:1.65;color:#7fb4d4;
  padding:12px 14px;max-height:300px;overflow:auto;white-space:pre;
  background:#060810;
}

/* ── Dashboard ──────────────────────────────────────────────────────── */
.dashboard{display:flex;flex-direction:column;height:100%;overflow:hidden;background:var(--bg)}

.dash-hero{
  display:flex;align-items:center;gap:14px;
  padding:20px 28px 16px;flex-shrink:0;
  border-bottom:1px solid var(--border);
}
.dash-hero-icon{font-size:24px;opacity:.35;line-height:1}
.dash-hero-title{
  font-family:var(--sans);font-size:16px;font-weight:700;
  color:var(--text);
}
.dash-hero-sub{font-size:11px;color:var(--muted2);margin-top:2px}

.dash-body{
  flex:1;overflow-y:auto;padding:20px 28px;
  display:flex;flex-direction:column;gap:24px;
}

/* ── Sections ── */
.dash-section{display:flex;flex-direction:column;gap:10px}

.dash-section-hd{
  display:flex;align-items:center;gap:10px;
}
.dash-section-title{
  font-family:var(--sans);font-size:11px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;color:var(--muted);
}
.dash-section-hint{
  font-size:10px;color:var(--muted2);
}
.dash-refresh-btn{
  margin-left:auto;background:none;border:none;cursor:pointer;
  color:var(--muted2);font-size:13px;padding:2px 5px;border-radius:3px;
  line-height:1;transition:color .15s,background .15s;
}
.dash-refresh-btn:hover:not(:disabled){color:var(--accent);background:var(--accent-dim)}
.dash-refresh-btn:disabled{opacity:.4;cursor:default}

.dash-loading{font-size:11px;color:var(--muted2);padding:12px 0}
.dash-error{font-size:11px;color:var(--danger);padding:12px 0}
.dash-empty{font-size:11px;color:var(--muted2);font-style:italic;padding:12px 0}

/* ── TX card ── */
.dash-tx-card{
  border:1px solid var(--border2);border-radius:var(--r2);
  overflow:hidden;
}
.dash-tx-header{
  display:flex;align-items:center;gap:10px;
  padding:8px 14px;background:rgba(var(--overlay),.02);
  border-bottom:1px solid var(--border);
}
.dash-tx-id{
  font-family:var(--mono);font-size:10px;color:var(--muted2);
  background:rgba(var(--overlay),.05);padding:1px 6px;border-radius:3px;flex-shrink:0;
}
.dash-tx-title{font-size:12px;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dash-tx-count{font-size:10px;color:var(--muted2);flex-shrink:0}

.dash-tx-nodes{display:flex;flex-direction:column}

.dash-tx-node{
  display:flex;align-items:center;gap:8px;
  padding:6px 14px;
  background:none;border:none;border-bottom:1px solid var(--border);
  text-align:left;cursor:pointer;
  transition:background .1s;width:100%;
}
.dash-tx-node:last-child{border-bottom:none}
.dash-tx-node:hover{background:rgba(var(--overlay),.04)}

/* ── Work items ── */
.dash-work-list{display:flex;flex-direction:column;gap:6px}

.dash-work-item{
  display:flex;flex-direction:column;gap:6px;
  padding:10px 14px;
  background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);
  text-align:left;cursor:pointer;
  transition:background .1s,border-color .1s;width:100%;
}
.dash-work-item:hover{background:var(--surface2);border-color:var(--accent)}

.dash-work-row{display:flex;align-items:center;gap:8px}

.dash-action-chips{display:flex;flex-wrap:wrap;gap:4px}
.dash-action-chip{
  font-size:9px;padding:1px 6px;border-radius:3px;
  font-family:var(--sans);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
  background:rgba(var(--overlay),.06);
}

/* ── Shared atoms ── */
.dash-state-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dash-rev{
  font-family:var(--mono);font-size:10px;color:var(--muted2);
  background:rgba(var(--overlay),.05);padding:1px 5px;border-radius:3px;flex-shrink:0;
}
.dash-node-lid{
  font-family:var(--mono);font-size:12px;color:var(--text);
  flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.dash-type-chip{
  display:inline-flex;align-items:center;gap:4px;
  font-size:10px;color:var(--muted2);flex-shrink:0;
}
.dash-badge{
  font-size:9px;padding:1px 5px;border-radius:3px;flex-shrink:0;
  font-family:var(--sans);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
}

/* ── Dashboard button in left panel ── */
.panel-dash-btn{
  display:flex;align-items:center;gap:7px;
  margin:8px 10px 4px;padding:6px 10px;
  background:var(--accent-dim);border:1px solid rgba(106,172,255,.2);
  border-radius:var(--r);cursor:pointer;
  font-family:var(--sans);font-size:11px;font-weight:600;color:var(--accent);
  transition:background .15s,border-color .15s;
}
.panel-dash-btn:hover{background:rgba(106,172,255,.18);border-color:rgba(106,172,255,.35)}

/* ── Comment panel ───────────────────────────────────────────────── */
.tab-comments-toggle{
  margin-left:auto;flex-shrink:0;
  padding:0 10px;height:100%;
  background:transparent;border:none;border-left:1px solid var(--border);
  cursor:pointer;font-size:15px;opacity:.6;
  transition:opacity .15s,color .15s;color:var(--muted);
}
.tab-comments-toggle:hover{opacity:1;color:var(--accent)}
.tab-comments-toggle.active{opacity:1;color:var(--accent);background:var(--accent-dim)}

.comment-resize{cursor:col-resize}

.comment-panel{
  flex-shrink:0;display:flex;flex-direction:column;
  background:var(--surface);border-left:1px solid var(--border);
  overflow:hidden;
}
.comment-panel-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;font-family:var(--sans);font-weight:600;font-size:12px;
  border-bottom:1px solid var(--border);flex-shrink:0;
  text-transform:uppercase;letter-spacing:.05em;color:var(--muted);
}
.comment-count-badge{
  display:inline-block;margin-left:6px;padding:1px 6px;
  background:rgba(106,172,255,.15);color:var(--accent);
  border-radius:10px;font-size:10px;font-family:var(--sans);
}
.comment-close-btn{
  background:transparent;border:none;cursor:pointer;
  color:var(--muted);font-size:13px;padding:2px 4px;border-radius:3px;
}
.comment-close-btn:hover{color:var(--text)}

.comment-panel-list{flex:1;overflow-y:auto;padding:10px 12px}
.comment-panel-input{flex-shrink:0;padding:10px 12px;border-top:1px solid var(--border)}

.comment-version-context{
  font-size:10px;color:var(--muted);margin-bottom:6px;
  font-family:var(--sans);
}
.comment-reply-context{
  display:flex;align-items:center;justify-content:space-between;
  font-size:11px;color:var(--muted);padding:4px 8px 6px;
  background:var(--accent-dim);border-radius:4px;margin-bottom:6px;
  font-family:var(--sans);
}
.comment-cancel-reply{
  background:transparent;border:none;cursor:pointer;
  color:var(--muted);font-size:11px;padding:0 2px;
}
.comment-cancel-reply:hover{color:var(--text)}
.comment-textarea{width:100%;resize:vertical;box-sizing:border-box}
.comment-post-btn{margin-top:6px;width:100%}

.comment-empty{font-size:12px;color:var(--muted);font-style:italic;padding:8px 0}

.comment-thread{
  margin-bottom:10px;padding-bottom:10px;
  border-bottom:1px solid var(--border);
}
.comment-thread:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.comment-thread-active>.comment-item{border-color:rgba(106,172,255,.3)}

.comment-replies{margin-top:6px;margin-left:14px;border-left:2px solid var(--border2);padding-left:10px}

.comment-item{
  padding:8px 10px;border-radius:6px;
  background:var(--bg);border:1px solid transparent;
  transition:border-color .15s;
}
.comment-reply{background:transparent;border-left:none}
.comment-meta{
  display:flex;gap:6px;align-items:baseline;flex-wrap:wrap;
  margin-bottom:5px;
}
.comment-author{font-family:var(--sans);font-weight:600;font-size:12px;color:var(--text)}
.comment-attr-badge{
  font-size:10px;background:rgba(91,156,246,.15);
  color:var(--accent);padding:1px 5px;border-radius:3px;
  font-family:var(--sans);
}
.comment-version{font-size:10px;color:var(--muted2);font-family:var(--sans)}
.comment-time{font-size:10px;color:var(--muted2);margin-left:auto;font-family:var(--sans)}
.comment-text{font-size:13px;white-space:pre-wrap;line-height:1.55;color:var(--text)}
.comment-reply-btn{
  background:none;border:none;font-size:11px;color:var(--muted);
  cursor:pointer;padding:3px 0;margin-top:4px;font-family:var(--sans);
}
.comment-reply-btn:hover{color:var(--accent)}

.comment-filter-banner{
  display:flex;align-items:center;justify-content:space-between;
  padding:6px 12px;font-size:11px;font-family:var(--sans);
  background:var(--accent-dim);border-bottom:1px solid rgba(106,172,255,.2);
  flex-shrink:0;color:var(--accent);
}
.comment-filter-clear{
  background:transparent;border:none;cursor:pointer;
  font-size:11px;color:var(--accent);text-decoration:underline;font-family:var(--sans);
  padding:0;
}
.comment-filter-clear:hover{color:var(--text)}
.comment-children{padding-left:6px;margin-top:2px}
.comment-highlighted{border-color:rgba(106,172,255,.4) !important}

/* ── Attribute context menu ── */
.attr-ctx-menu{
  position:fixed;z-index:9000;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.25);
  padding:4px;min-width:200px;
}
.attr-ctx-item{
  display:block;width:100%;text-align:left;
  background:none;border:none;padding:7px 10px;border-radius:4px;
  font-size:13px;color:var(--text);cursor:pointer;font-family:var(--sans);
}
.attr-ctx-item:hover{background:var(--bg3)}
.attr-ctx-item code{
  font-family:var(--mono);font-size:11px;
  color:var(--accent);background:rgba(91,156,246,.12);
  padding:1px 4px;border-radius:3px;
}

/* ── Autocomplete dropdown ── */
.comment-input-wrap{position:relative}
.autocomplete-dropdown{
  position:absolute;bottom:calc(100% + 4px);left:0;right:0;
  background:var(--bg2);border:1px solid var(--border2);
  border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.25);
  list-style:none;margin:0;padding:4px;z-index:200;
  max-height:200px;overflow-y:auto;
}
.autocomplete-item{
  display:flex;align-items:baseline;gap:8px;
  padding:6px 8px;border-radius:4px;cursor:pointer;
}
.autocomplete-item.active,.autocomplete-item:hover{background:var(--accent-dim)}
.autocomplete-item-id{
  font-family:var(--mono);font-size:12px;font-weight:600;color:var(--accent);
}
.autocomplete-item-label{font-size:12px;color:var(--muted);font-family:var(--sans)}

/* ── Mention chips in rendered text ── */
.mention-chip{
  display:inline-block;border-radius:3px;
  padding:0 4px;font-size:12px;font-weight:600;
  font-family:var(--mono);line-height:1.6;
}
.mention-attr{color:var(--accent);background:rgba(91,156,246,.14)}
.mention-user{color:#a78bfa;background:rgba(167,139,250,.14)}
.comment-own{
  background:rgba(91,156,246,.06);
  border-color:rgba(91,156,246,.25);
  border-left:3px solid var(--accent);
  padding-left:8px;
}
.comment-author-own{color:var(--accent)}
.comment-you-badge{
  display:inline-block;margin-left:5px;
  font-size:9px;font-weight:700;letter-spacing:.03em;
  background:rgba(91,156,246,.18);color:var(--accent);
  padding:1px 4px;border-radius:3px;vertical-align:middle;
  text-transform:uppercase;
}

/* ── Auth splash (pre-login loading screen) ─────────────────────── */
.auth-splash{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:16px;background:var(--bg);color:var(--muted);
  font-family:var(--mono);font-size:12px;letter-spacing:.05em;
}
.auth-splash-spinner{
  width:32px;height:32px;border-radius:50%;
  border:2px solid var(--border2);border-top-color:var(--accent);
  animation:auth-spin 0.8s linear infinite;
}
@keyframes auth-spin{to{transform:rotate(360deg)}}
.auth-splash-label{color:var(--muted)}
.auth-splash-error{
  color:var(--danger);font-family:var(--sans);font-size:16px;font-weight:700;letter-spacing:.05em;
}
.auth-splash-detail{
  color:var(--muted2);max-width:420px;text-align:center;line-height:1.5;
}
.auth-splash-retry{
  margin-top:8px;padding:6px 16px;
  background:var(--bg);border:1px solid var(--accent);color:var(--accent);
  font-family:var(--mono);font-size:11px;letter-spacing:.08em;
  border-radius:var(--r);cursor:pointer;text-transform:uppercase;
}
.auth-splash-retry:hover{background:var(--accent-dim)}

/* ── Platform status bar ─────────────────────────────────────────── */
.status-bar-row{
  display:flex;align-items:stretch;flex-shrink:0;
  border-top:1px solid var(--border);background:var(--surface);
}
.status-bar-settings{
  display:flex;align-items:center;gap:6px;
  padding:6px 12px;height:28px;
  background:none;border:none;border-right:1px solid var(--border);
  color:var(--muted);font-family:var(--sans);font-size:11px;font-weight:600;
  cursor:pointer;user-select:none;white-space:nowrap;
  transition:all .12s;
}
.status-bar-settings:hover{background:var(--surface2);color:var(--text)}
.status-bar-settings.active{background:var(--accent-dim);color:var(--accent)}
.status-bar{
  display:flex;align-items:center;gap:10px;
  padding:6px 14px;height:28px;flex:1;
  background:none;
  color:var(--muted);font-family:var(--mono);font-size:11px;
  cursor:pointer;user-select:none;letter-spacing:.04em;
  border:none;text-align:left;
}
.status-bar:hover{background:var(--surface2);color:var(--text)}
.status-dot{
  display:inline-block;width:9px;height:9px;border-radius:50%;
  box-shadow:0 0 6px currentColor;flex-shrink:0;
}
.status-dot-sm{width:7px;height:7px;margin-right:6px}
.status-label{font-weight:600;color:var(--text)}
.status-value{font-weight:700;letter-spacing:.06em}
.status-count{margin-left:auto;color:var(--muted2)}
.bg-job-chip{
  display:flex;align-items:center;gap:6px;
  padding:0 12px;height:28px;
  background:none;border:none;border-right:1px solid var(--border);
  color:var(--muted);font-family:var(--mono);font-size:11px;font-weight:600;
  cursor:pointer;user-select:none;white-space:nowrap;letter-spacing:.04em;
  transition:all .12s;
}
.bg-job-chip:hover{background:var(--surface2);color:var(--text)}
.bg-job-dot{
  width:7px;height:7px;border-radius:50%;flex-shrink:0;
}
.bg-job-dot-pulse{animation:perf-pulse 1.2s ease-in-out infinite}

/* Modal overlay */
.status-modal-overlay{
  position:fixed;inset:0;background:rgba(5,7,10,.7);
  display:flex;align-items:center;justify-content:center;
  z-index:10000;backdrop-filter:blur(2px);
}
.status-modal{
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r2);min-width:640px;max-width:90vw;max-height:80vh;
  overflow:auto;padding:20px 24px;
  box-shadow:0 10px 40px rgba(0,0,0,.6);
}
.status-modal-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border);
}
.status-modal-header h3{
  font-family:var(--sans);font-weight:700;font-size:14px;
  letter-spacing:.05em;color:var(--text);
}
.status-modal-close{
  background:transparent;border:0;color:var(--muted);
  font-size:22px;line-height:1;cursor:pointer;padding:0 4px;
}
.status-modal-close:hover{color:var(--text)}
.status-modal-jaeger{
  display:inline-flex;align-items:center;gap:6px;
  margin-left:auto;margin-right:12px;
  padding:4px 10px;border-radius:4px;
  font-family:var(--mono);font-size:11px;letter-spacing:.04em;
  color:var(--muted);background:transparent;
  border:1px solid var(--border);text-decoration:none;
  transition:color .15s,border-color .15s,background .15s;
}
.status-modal-jaeger:hover{
  color:var(--text);border-color:var(--text);
  background:rgba(106,172,255,.08);
}
.status-modal-summary{
  display:flex;align-items:center;gap:12px;
  margin-bottom:16px;font-size:12px;color:var(--muted);
}
.status-modal-overall{font-weight:700;letter-spacing:.06em}
.status-modal-uptime{color:var(--muted2)}
.status-modal-refresh{
  margin-left:auto;
  background:var(--bg);border:1px solid var(--border2);color:var(--muted);
  font-family:var(--mono);font-size:10px;letter-spacing:.06em;
  padding:4px 10px;border-radius:var(--r);cursor:pointer;text-transform:uppercase;
}
.status-modal-refresh:hover{color:var(--text);border-color:var(--accent)}
.status-modal-error{
  padding:8px 12px;background:rgba(var(--danger-rgb),.1);
  border:1px solid var(--danger);border-radius:var(--r);
  color:var(--danger);font-size:11px;margin-bottom:12px;
}
.status-table{
  width:100%;border-collapse:collapse;font-size:11px;
}
.status-table th{
  text-align:left;padding:6px 10px;
  color:var(--muted2);font-weight:600;letter-spacing:.05em;
  text-transform:uppercase;font-size:9px;
  border-bottom:1px solid var(--border);
}
.status-table td{
  padding:8px 10px;border-bottom:1px solid var(--border);
  color:var(--text);
}
.status-table code{
  font-family:var(--mono);color:var(--muted);font-size:10px;
}
.status-table .muted{color:var(--muted2)}
.status-row-service td{background:rgba(255,255,255,0.02)}
.status-row-instance td{padding-top:4px;padding-bottom:4px;font-size:10px}
.status-row-instance td:first-child{padding-left:24px}
.status-inst-leaf{color:var(--muted2);margin-right:4px}
.status-inst-badge{
  margin-left:8px;padding:2px 6px;border-radius:3px;
  background:var(--border);color:var(--muted);
  font-family:var(--mono);font-size:9px;letter-spacing:.04em;
}
.status-modal-timestamp{
  margin-top:12px;font-size:10px;color:var(--muted2);
  font-family:var(--mono);text-align:right;
}

/* Tabs */
.status-tabs{display:flex;gap:2px;margin-bottom:14px;border-bottom:1px solid var(--border)}
.status-tab{
  background:transparent;border:0;color:var(--muted2);
  font-family:var(--mono);font-size:11px;letter-spacing:.05em;
  padding:8px 14px;cursor:pointer;text-transform:uppercase;
  border-bottom:2px solid transparent;margin-bottom:-1px;
}
.status-tab:hover{color:var(--text)}
.status-tab-active{color:var(--accent);border-bottom-color:var(--accent)}

/* Perf summary in bar */
.status-perf{margin-left:14px;color:var(--muted2);font-size:10px;letter-spacing:.04em}
.status-perf strong{font-weight:700;margin-left:4px}

/* Perf summary in modal */
.status-perf-summary{display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:var(--muted)}
.status-perf-summary strong{font-weight:700;margin-left:4px}
.status-perf-note{
  font-size:10px;color:var(--muted2);margin-bottom:10px;font-style:italic;
}
.status-perf-empty{
  text-align:center;padding:28px 0;color:var(--muted2);font-size:11px;
}

/* Percentile chart */
.perf-chart{
  width:100%;height:90px;margin:4px 0 14px;
  background:var(--bg);border:1px solid var(--border);border-radius:var(--r);
  display:block;
}
.perf-chart-empty{
  height:90px;margin:4px 0 14px;
  background:var(--bg);border:1px solid var(--border);border-radius:var(--r);
  display:flex;align-items:center;justify-content:center;
  color:var(--muted2);font-size:10px;font-style:italic;
}

/* Scrollable table wrapper */
.status-perf-scroll{
  max-height:320px;overflow-y:auto;overflow-x:auto;
  border:1px solid var(--border);border-radius:var(--r);
}
.status-perf-scroll .status-table{margin:0}
.status-table-sticky thead th{
  position:sticky;top:0;z-index:1;
  background:var(--surface);
  box-shadow:inset 0 -1px 0 var(--border);
}

/* Latency color bands */
.lat-fast{color:#4dd4a0}
.lat-ok  {color:#6aacff}
.lat-slow{color:#f0b429}
.lat-bad {color:#fc8181}

/* Live perf chip (30s window) — smooth color from green→red */
.perf-chip{
  display:inline-flex;align-items:center;gap:6px;
  margin-left:12px;padding:2px 9px;border-radius:99px;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  color:#0b0e13;transition:background .6s ease;
  text-transform:uppercase;
}
.perf-chip-dot{
  width:7px;height:7px;border-radius:50%;
  background:rgba(0,0,0,.35);flex-shrink:0;
  animation:perf-pulse 1.8s ease-in-out infinite;
}
.perf-chip-dot-lg{width:12px;height:12px;animation-duration:2.2s}
.perf-chip-val{font-weight:500;opacity:.8;margin-left:4px}
.cache-chip{
  display:inline-flex;align-items:center;gap:5px;
  margin-left:8px;padding:2px 8px;border-radius:99px;
  font-size:10px;font-weight:700;letter-spacing:.08em;
  background:#1a3350;color:#7eb8f7;text-transform:uppercase;
}
@keyframes perf-pulse{
  0%,100%{opacity:.55;transform:scale(1)}
  50%    {opacity:1;transform:scale(1.2)}
}

/* Big window banner at top of perf tab */
.perf-window-banner{
  display:flex;align-items:center;gap:12px;
  margin:0 0 12px;padding:10px 14px;border-radius:var(--r);
  background:color-mix(in srgb, var(--perf-color) 22%, var(--bg));
  border-left:3px solid var(--perf-color);
  font-family:var(--mono);
}
.perf-window-banner .perf-chip-dot{background:var(--perf-color)}
.perf-window-label{
  font-weight:700;font-size:12px;letter-spacing:.08em;
  color:var(--perf-color);text-transform:uppercase;
}
.perf-window-metrics{
  margin-left:auto;font-size:11px;color:var(--muted);
}

/* ── NATS tab ───────────────────────────────────────────────────── */
.nats-stats-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:10px;
  margin-bottom:14px;
}
.nats-stat{
  display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:10px 8px;border-radius:var(--r);
  background:var(--surface);border:1px solid var(--border);
}
.nats-stat-label{
  font-size:10px;font-weight:600;letter-spacing:.06em;
  color:var(--muted);text-transform:uppercase;
}
.nats-stat-value{
  font-family:var(--mono);font-size:18px;font-weight:700;
  color:var(--text);
}
.nats-stat-sub{
  font-family:var(--mono);font-size:10px;color:var(--muted2);
}
.nats-section-title{
  margin:14px 0 6px;font-size:11px;font-weight:700;
  letter-spacing:.06em;color:var(--muted);text-transform:uppercase;
}

/* ── Theme selector ─────────────────────────────────────────────── */
.theme-selector{
  display:flex;gap:6px;
}
.theme-option{
  flex:1;display:flex;align-items:center;justify-content:center;gap:6px;
  padding:7px 10px;border:1px solid var(--border2);border-radius:var(--r);
  background:var(--bg);color:var(--muted);
  font-family:var(--mono);font-size:11px;font-weight:500;
  cursor:pointer;transition:border-color .15s,color .15s,background .15s;
}
.theme-option:hover{
  border-color:var(--accent);color:var(--text);
}
.theme-option--active{
  border-color:var(--accent);color:var(--accent);
  background:var(--accent-dim);
}
.theme-option-icon{
  font-size:13px;line-height:1;
}

/* ── Basket toggle ───────────────────────────────────────────────── */
.panel-icon-btn--active{color:var(--accent);background:var(--accent-dim)}

/* ── Search panel ────────────────────────────────────────────────── */
.search-strip{
  width:var(--search-strip-w,28px);flex-shrink:0;cursor:pointer;
  border-right:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  background:var(--surface);transition:background .15s;
  user-select:none;
}
.search-strip:hover{background:var(--hover)}
.search-strip--open{background:color-mix(in srgb,var(--accent) 10%,var(--surface));border-right-color:var(--accent)}
.search-strip-label{
  writing-mode:vertical-rl;font-size:10px;font-weight:700;
  color:var(--muted);letter-spacing:.08em;text-transform:uppercase;
}
.search-strip--open .search-strip-label{color:var(--accent)}

/* Panel shell */
.search-panel{
  position:fixed;left:calc(var(--search-strip-w,28px));top:var(--header-h);
  height:calc(100vh - var(--header-h));
  display:flex;flex-direction:column;flex-shrink:0;
  border-right:1px solid var(--border);background:var(--bg);
  overflow:hidden;z-index:120;
  box-shadow:4px 0 16px rgba(0,0,0,.18);
}
.search-panel-resize{position:absolute;top:0;right:0;bottom:0;width:4px;cursor:col-resize;z-index:1}
.search-panel-resize:hover,.search-panel-resize:active{background:var(--border2)}

/* Header */
.search-panel-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:8px 10px 6px;border-bottom:1px solid var(--border);flex-shrink:0;gap:6px;
}
.search-panel-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);flex-shrink:0}
.search-panel-header-right{display:flex;align-items:center;gap:6px;min-width:0;flex:1;justify-content:flex-end}
.search-index-badge{
  font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  background:var(--surface);border:1px solid var(--border);border-radius:10px;
  padding:1px 7px;letter-spacing:.01em;
}
.search-index-badge.unavail{color:var(--warn,#b45309);border-color:currentColor}

/* Query input */
.search-panel-input-wrap{padding:8px 10px 6px;flex-shrink:0}
.search-panel-input{
  width:100%;box-sizing:border-box;padding:7px 10px;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r);color:var(--fg);font-size:13px;outline:none;
}
.search-panel-input:focus{border-color:var(--accent)}

/* Body: side-by-side */
.search-panel-body{display:flex;flex:1;overflow:hidden;border-top:1px solid var(--border)}

/* Left facets toolbar */
.search-facets{
  width:155px;flex-shrink:0;overflow-y:auto;border-right:1px solid var(--border);
  padding:6px 0;background:var(--surface);
}
.search-facets-empty{padding:10px 10px;font-size:11px;color:var(--muted);line-height:1.4}
.search-facet-group{margin-bottom:10px}
.search-facet-dim{
  display:flex;align-items:center;gap:4px;
  padding:4px 10px 3px;font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:.06em;color:var(--muted);
}
.search-facet-dim-count{
  font-size:9px;font-weight:700;background:var(--accent);color:#fff;
  border-radius:8px;padding:0 4px;line-height:14px;
}
.search-facet-item{
  display:flex;align-items:center;gap:5px;width:100%;
  padding:3px 10px;cursor:pointer;
  font-size:11px;color:var(--fg);
}
.search-facet-item:hover{background:var(--hover)}
.search-facet-item.active{background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent)}
.search-facet-checkbox{
  flex-shrink:0;width:11px;height:11px;cursor:pointer;
  accent-color:var(--accent);margin:0;
}
.search-facet-val{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.search-facet-count{flex-shrink:0;font-size:10px;color:var(--muted);background:var(--border);border-radius:8px;padding:0 5px;line-height:16px}
.search-facet-item.active .search-facet-count{background:color-mix(in srgb,var(--accent) 20%,transparent);color:var(--accent)}
.search-facet-range{display:flex;align-items:center;gap:4px;padding:3px 10px}
.search-facet-range-input{
  flex:1;min-width:0;padding:2px 4px;font-size:11px;
  border:1px solid var(--border2);border-radius:var(--r);
  background:var(--surface);color:var(--fg);
}
.search-facet-range-input:focus{outline:none;border-color:var(--accent)}
.search-facet-range-sep{font-size:11px;color:var(--muted);flex-shrink:0}
.search-facet-clear{
  display:block;margin:4px 8px 2px;padding:3px 8px;font-size:10px;
  border:1px solid var(--border2);border-radius:var(--r);background:none;
  cursor:pointer;color:var(--muted);width:calc(100% - 16px);text-align:center;
}
.search-facet-clear:hover{border-color:var(--accent);color:var(--accent)}

/* Results pane */
.search-panel-results{flex:1;overflow-y:auto;padding:4px 0}
.search-results-count{padding:6px 10px 3px;font-size:10px;color:var(--muted);font-weight:500}
.search-result-row{display:flex;align-items:center;gap:6px;padding:5px 10px;cursor:pointer}
.search-result-row:hover{background:var(--hover)}
.search-result-label{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.search-result-type{font-size:10px;opacity:.7}
.search-result-name{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.search-result-rev{font-size:10px;color:var(--muted)}
.search-pin-btn{flex-shrink:0;background:none;border:none;cursor:pointer;padding:2px;font-size:12px;opacity:.5;line-height:1}
.search-pin-btn:hover,.search-pin-btn.pinned{opacity:1}
.search-result-group{display:flex;flex-direction:column}
.search-result-row-wrap{display:flex;align-items:center;gap:2px;padding-right:4px}
.search-expand-btn{
  flex-shrink:0;width:16px;height:16px;padding:0;margin-left:4px;
  background:none;border:none;cursor:pointer;
  font-size:7px;color:var(--muted);line-height:1;
  display:flex;align-items:center;justify-content:center;
  border-radius:2px;transition:background .1s,color .1s,transform .15s;
}
.search-expand-btn:hover{background:var(--hover);color:var(--text)}
.search-expand-btn.open{transform:rotate(90deg);color:var(--accent)}
.search-expand-btn.empty{opacity:.25;cursor:default}
.search-expand-btn:disabled{opacity:.4;cursor:default}
.search-children{padding-left:20px;border-left:1px solid var(--border);margin-left:12px}
.search-children-empty{padding:4px 10px 4px 28px;font-size:10px;color:var(--muted);font-style:italic}
`,Zn=document.createElement("style");Zn.textContent=el;document.head.appendChild(Zn);wa();const tl=xr.createRoot(document.getElementById("root"));tl.render(e.jsx(Oe.StrictMode,{children:e.jsx(Qi,{})}));
//# sourceMappingURL=index-DDEVBPrT.js.map
