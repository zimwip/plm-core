import{j as e}from"./react-jsx-runtime-shim-DtcNtlUI.js";import{c as dn,r as l,R as De}from"./vendor-Dw91Z_SL.js";import{c as ir}from"./react-dom-shim-u_SHOSaN.js";import{S as lr,R as cr,G as dr,C as pr,B as mr,a as ur,L as hr,A as pn,b as ft,U as mn,c as xr,H as Bt,d as un,F as fr,e as Yt,M as gr,f as br,Z as bs,g as vr,h as yr,T as jr,i as wr,j as hn,k as xn,D as fn,l as kr,W as Sr,m as vs,P as gn,n as Nr,o as Cr,N as Er,K as Tr,p as bn,q as zr,r as Ir,s as Zt,t as Ge,u as Fe,v as vn,w as yn,x as Ar,y as $r,X as ht,z as gt,E as St,I as Me,J as Pr,O as Rr,Q as jn,V as $s,Y as Lr,_ as Br,$ as Dr,a0 as Or}from"./icons-CwfpQ0Z8.js";import{C as At,S as Mr,A as _r,D as Wr,P as Fr,W as Ur,O as Gr,X as Hr,V as Vr,M as es,B as Kr,a as Ps,R as qr,G as Jr,b as Xr,c as ts,d as Rs,e as Yr,f as Zr,g as Qr,h as ea}from"./three-DAyMVibd.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const wn=500,rt=[],ps=new Set;function kn(){ps.forEach(t=>{try{t()}catch{}})}function Ls(t){return ps.add(t),()=>ps.delete(t)}const ta=/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,sa=/\/\d+(?=\/|$)/g;function na(t){return t.split("?")[0].replace(ta,"/{id}").replace(sa,"/{n}")}function Bs({method:t,endpoint:s,status:n,durationMs:r,ok:a}){rt.push({method:t,endpoint:na(s),status:n,durationMs:r,ok:a,at:Date.now()}),rt.length>wn&&rt.shift(),kn()}function nt(t,s){if(t.length===0)return 0;const n=Math.min(t.length-1,Math.floor(t.length*s));return t[n]}function Mt(){const t=new Map;for(const o of rt){const i=`${o.method} ${o.endpoint}`;let c=t.get(i);c||(c={method:o.method,endpoint:o.endpoint,durations:[],errorCount:0,lastMs:0,lastAt:0},t.set(i,c)),c.durations.push(o.durationMs),o.ok||c.errorCount++,c.lastMs=o.durationMs,c.lastAt=o.at}const s=[];for(const o of t.values()){const i=[...o.durations].sort((p,d)=>p-d),c=o.durations.reduce((p,d)=>p+d,0);s.push({method:o.method,endpoint:o.endpoint,count:o.durations.length,avgMs:c/o.durations.length,p50:nt(i,.5),p95:nt(i,.95),maxMs:i[i.length-1],lastMs:o.lastMs,lastAt:o.lastAt,errorCount:o.errorCount})}s.sort((o,i)=>i.count-o.count);const n=rt.map(o=>o.durationMs).sort((o,i)=>o-i),r=n.reduce((o,i)=>o+i,0);return{overall:{total:rt.length,windowSize:wn,avgMs:n.length?r/n.length:0,p50:nt(n,.5),p75:nt(n,.75),p90:nt(n,.9),p95:nt(n,.95),p99:nt(n,.99),maxMs:n.length?n[n.length-1]:0,errorCount:rt.filter(o=>!o.ok).length,sorted:n},byEndpoint:s}}function ra(){rt.length=0,kn()}function _t(t){const s=Date.now()-t,n=rt.filter(o=>o.at>=s),r=n.map(o=>o.durationMs).sort((o,i)=>o-i),a=r.reduce((o,i)=>o+i,0);return{windowMs:t,count:n.length,avgMs:r.length?a/r.length:0,p50:nt(r,.5),p95:nt(r,.95),maxMs:r.length?r[r.length-1]:0,errorCount:n.filter(o=>!o.ok).length}}const it="/api/platform";function et(t){return`/api/${t}`}class Sn extends Error{constructor(s,n,r){super(n),this.name="ApiError",this.status=s,this.detail=r}}function Dt(t,s,n,r,a){return new Promise((o,i)=>{const c=new XMLHttpRequest;c.open(s,t),Object.entries(n).forEach(([p,d])=>c.setRequestHeader(p,d)),c.upload.addEventListener("progress",p=>{p.lengthComputable&&a(Math.round(p.loaded/p.total*100))}),c.onload=()=>{const p=()=>Promise.resolve(c.responseText),d=()=>Promise.resolve(JSON.parse(c.responseText));o({ok:c.status>=200&&c.status<300,status:c.status,text:p,json:d})},c.onerror=()=>i(new Error("Network error during upload")),c.onabort=()=>i(new Error("Upload cancelled")),c.send(r)})}async function Oe(t,s,n){const r=performance.now();let a,o;try{a=await fetch(t,s)}catch(p){o=p}const i=performance.now()-r,c=t.split("?")[0];if(o)throw Bs({method:n,endpoint:c,status:0,durationMs:i,ok:!1}),o;return Bs({method:n,endpoint:c,status:a.status,durationMs:i,ok:a.ok}),a}function aa(t,s,n){return Array.isArray(t)?{items:t,totalElements:t.length,totalPages:1,page:s,size:n}:t&&Array.isArray(t.content)?{items:t.content,totalElements:t.totalElements??t.content.length,totalPages:t.totalPages??1,page:t.number??s,size:t.size??n}:t&&Array.isArray(t.items)?{items:t.items,totalElements:t.totalElements??t.items.length,totalPages:t.totalPages??1,page:t.page??s,size:t.size??n}:{items:[],totalElements:0,totalPages:0,page:s,size:n}}let Ee=null;function Ds(t){Ee=t}function Pt(){return Ee}let Ve=null;function oa(t){Ve=t}let ve=null;function xt(){return ve}let Rt=null;function ia(t){Rt=t}const Os={login:async t=>{const s=await Oe("/api/spe/auth/login",{method:"POST",headers:{"X-User":t}},"POST");if(!s.ok){const r=await s.json().catch(()=>({error:s.statusText}));throw new Error(r.error||`HTTP ${s.status}`)}const n=await s.json();return ve=n.token,n},logout:async()=>{const t=ve;if(ve=null,!!t)try{await Oe("/api/spe/auth/logout",{method:"POST",headers:{Authorization:`Bearer ${t}`}},"POST")}catch{}}};let Ms=!1,_s=null;function qt(){if(!Ms){if(Ms=!0,!document.getElementById("plm-reconnect-banner")){const t=document.createElement("div");t.id="plm-reconnect-banner",t.style.cssText=["position:fixed","top:0","left:0","right:0","z-index:99999","background:#b45309","color:#fff","text-align:center","padding:8px 16px","font-size:13px","font-family:monospace","letter-spacing:.02em","box-shadow:0 2px 8px rgba(0,0,0,.4)"].join(";"),t.textContent="⟳  Backend is restarting — reconnecting…",document.body.prepend(t)}_s=setInterval(async()=>{try{(await fetch("/actuator/health",{cache:"no-store"})).ok&&(clearInterval(_s),window.location.reload())}catch{}},3e3)}}async function ys(t,s,n,r=!1){var c,p;const a={};ve&&(a.Authorization=`Bearer ${ve}`),Ee&&(a["X-PLM-ProjectSpace"]=Ee),n!==void 0&&(a["Content-Type"]="application/json");let o;try{o=await Oe(s,{method:t,headers:a,body:n!==void 0?JSON.stringify(n):void 0},t)}catch{qt();const d=new Error("Backend unreachable");throw Ve&&Ve(d),d}if(o.status===401&&!r&&Rt){const d=await Rt().catch(()=>null);if(d)return ve=d,ys(t,s,n,!0)}if(!o.ok){(o.status===502||o.status===503)&&qt();const d=await o.json().catch(()=>({error:o.statusText})),x=(c=d.violations)!=null&&c.length?d.violations.map(T=>typeof T=="string"?T:T.message).join("; "):d.error||d.message||`HTTP ${o.status}`,f=new Error(x);f.status=o.status,f.detail=d;const k=(p=d.violations)==null?void 0:p.some(T=>T==null?void 0:T.attrCode);throw Ve&&!k&&Ve(f),f}const i=await o.text();return i?JSON.parse(i):null}async function Be(t,s,n,r,{txId:a,psOverride:o}={},i=!1){var f,k;const c={"Content-Type":"application/json"};ve&&(c.Authorization=`Bearer ${ve}`);const p=o??Ee;p&&(c["X-PLM-ProjectSpace"]=p),a&&(c["X-PLM-Tx"]=a);let d;try{d=await Oe(`${t}${n}`,{method:s,headers:c,body:r?JSON.stringify(r):void 0},s)}catch{qt();const T=new Error("Backend unreachable");throw Ve&&Ve(T),T}if(d.status===401&&!i&&Rt){const T=await Rt().catch(()=>null);if(T)return ve=T,Be(t,s,n,r,{txId:a,psOverride:o},!0)}if(!d.ok){(d.status===502||d.status===503)&&qt();const T=await d.json().catch(()=>({error:d.statusText})),P=(f=T.violations)!=null&&f.length?T.violations.map(y=>typeof y=="string"?y:y.message).join("; "):T.error||T.message||`HTTP ${d.status}`,$=new Sn(d.status,P,T),u=(k=T.violations)==null?void 0:k.some(y=>y==null?void 0:y.attrCode);throw Ve&&!u&&Ve($),$}const x=await d.text();return x?JSON.parse(x):null}async function ce(t,s,n,r,a={}){return Be(et("pno"),t,s,r,a)}async function oe(t,s,n,r){return Be(it,t,s,r)}function Nn(t,s,n,r={}){let a=s.path.replace("{id}",n);const o=Object.entries(r).filter(([,i])=>i!=null).map(([i,c])=>`${i}=${encodeURIComponent(c)}`).join("&");return o&&(a+=`?${o}`),ys(s.httpMethod||"GET",et(t)+a,void 0)}async function la(t,s){var d;const n=t.create,r=et(t.serviceCode)+n.path,a=(n.httpMethod||"POST").toUpperCase(),o={};ve&&(o.Authorization=`Bearer ${ve}`),Ee&&(o["X-PLM-ProjectSpace"]=Ee);let i;if((n.bodyShape||"RAW").toUpperCase()==="MULTIPART"){const x=new FormData;for(const[f,k]of Object.entries(s||{}))k==null||k===""||x.append(f,k);i=x}else{o["Content-Type"]="application/json";const x=(n.bodyShape||"RAW").toUpperCase()==="WRAPPED"?{parameters:s||{}}:s||{};i=JSON.stringify(x)}const c=await Oe(r,{method:a,headers:o,body:i},a);if(!c.ok){const x=await c.json().catch(()=>({error:c.statusText})),f=(d=x.violations)!=null&&d.length?x.violations.join("; "):x.error||x.message||`HTTP ${c.status}`,k=new Error(f);throw k.detail=x,Ve&&Ve(k),k}const p=await c.text();return p?JSON.parse(p):null}async function ze(t,s,n,r,a){return Be(et("psm"),t,s,r,{psOverride:a})}async function J(t,s,n,r){return Be(et("psa"),t,s,r)}function ca(t,s,n,r){return Be(et(t),s,n,r)}const mt={getStatus:async()=>Be(it,"GET","/status"),getRegistryTags:async()=>Be(it,"GET","/admin/registry/tags"),getEnvironment:async()=>Be(it,"GET","/admin/environment/expected-services"),updateEnvironment:async t=>Be(it,"PUT","/admin/environment/expected-services",{expectedServices:t}),addExpectedService:async t=>Be(it,"POST","/admin/environment/expected-services/services",{serviceCode:t}),removeExpectedService:async t=>Be(it,"DELETE",`/admin/environment/expected-services/services/${t}`),getNatsStatus:async()=>Be(it,"GET","/status/nats")},X={getMetadataKeys:(t,s)=>J("GET",s?`/metamodel/metadata/keys/${s}`:"/metamodel/metadata/keys"),getNodeTypes:t=>J("GET","/metamodel/nodetypes"),getVersionHistory:(t,s)=>ze("GET",`/nodes/${s}/versions`),getVersionDiff:(t,s,n,r)=>ze("GET",`/nodes/${s}/versions/diff?v1=${n}&v2=${r}`),createNode:(t,s,n,r,a)=>ze("POST",`/actions/create_node/${s}`,t,{parameters:{...n,_logicalId:r||null,_externalId:a||null}}),getNodeDescription:(t,s,n,r)=>{const a=[];n&&a.push(`txId=${n}`),r&&a.push(`versionNumber=${r}`);const o=a.length?`?${a.join("&")}`:"";return ze("GET",`/nodes/${s}/description${o}`)},updateExternalId:(t,s,n)=>ze("PATCH",`/nodes/${s}/external-id`,t,{externalId:n}),getSignatures:(t,s)=>ze("GET",`/nodes/${s}/signatures`),getSignatureHistory:(t,s)=>ze("GET",`/nodes/${s}/signatures/history`),getComments:(t,s)=>ze("GET",`/nodes/${s}/comments`),addComment:(t,s,n,r,a,o)=>ze("POST",`/nodes/${s}/comments`,t,{nodeVersionId:n,text:r,...a?{parentCommentId:a}:{},...o?{attributeName:o}:{}}),getLinkTypes:t=>J("GET","/metamodel/linktypes"),getNodeTypeLinkTypes:(t,s)=>J("GET",`/metamodel/nodetypes/${s}/linktypes`),getRegistryGrouped:t=>oe("GET","/admin/registry/grouped"),getRegistryTagsAdmin:t=>oe("GET","/admin/registry/tags"),getRegistryOverview:t=>oe("GET","/admin/registry/overview"),getItems:t=>oe("GET","/items"),gatewayJson:(t,s,n)=>ys(t,s,n),gatewayRawText:async(t,s=64*1024)=>{const n={};ve&&(n.Authorization=`Bearer ${ve}`),Ee&&(n["X-PLM-ProjectSpace"]=Ee),n.Range=`bytes=0-${s-1}`;const r=await Oe(t,{method:"GET",headers:n},"GET");if(!r.ok&&r.status!==206)throw new Error(`HTTP ${r.status}`);const a=r.body.getReader(),o=[];let i=0;for(;;){const{done:T,value:P}=await a.read();if(T)break;if(P&&(o.push(P),i+=P.length),i>=s){a.cancel();break}}const c=new Uint8Array(i);let p=0;for(const T of o)c.set(T,p),p+=T.length;const d=new TextDecoder("utf-8",{fatal:!1}).decode(c),x=r.headers.get("Content-Range"),f=x&&parseInt(x.split("/")[1],10)||null,k=r.status===206||i>=s;return{text:d,truncated:k,totalBytes:f}},fetchListableItems:async(t,s,n=0,r=50)=>{var P;const a=s.list,o=s.serviceCode?et(s.serviceCode):"",i=a.path.includes("?")?"&":"?",c=a.pageParam||"page",p=a.sizeParam||"size",d=`${o}${a.path}${i}${c}=${n}&${p}=${r}`,x={};ve&&(x.Authorization=`Bearer ${ve}`),Ee&&(x["X-PLM-ProjectSpace"]=Ee);const f=await Oe(d,{method:"GET",headers:x},"GET");if(!f.ok){const $=await f.json().catch(()=>({error:f.statusText})),u=(P=$.violations)!=null&&P.length?$.violations.join("; "):$.error||$.message||`HTTP ${f.status}`,y=new Error(u);throw y.detail=$,y}const k=await f.text(),T=k?JSON.parse(k):null;return aa(T,n,r)},searchNodes:async(t,s={},n=["_type","_projectSpaceId"],r=100)=>{const a=`${et("search")}/search`,o={"Content-Type":"application/json"};ve&&(o.Authorization=`Bearer ${ve}`),Ee&&(o["X-PLM-ProjectSpace"]=Ee);const i=JSON.stringify({query:t,filterTerms:s,facetOn:n,size:r}),c=await Oe(a,{method:"POST",headers:o,body:i},"POST");if(!c.ok){const p=await c.json().catch(()=>({error:c.statusText}));throw new Sn(c.status,p.error||`HTTP ${c.status}`,p)}return c.json()},searchInfo:async()=>{const t=`${et("search")}/search/info`,s={};ve&&(s.Authorization=`Bearer ${ve}`);const n=await Oe(t,{method:"GET",headers:s},"GET");return n.ok?n.json():{available:!1,nodeCount:0,edgeCount:0}},getSources:t=>ze("GET","/sources"),getSourceKeys:(t,s,n,r="",a=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),r&&o.set("q",r),o.set("limit",String(a)),ze("GET",`/sources/${encodeURIComponent(s)}/keys?${o.toString()}`)},getChildLinks:(t,s)=>ze("GET",`/nodes/${s}/links/children`),getParentLinks:(t,s)=>ze("GET",`/nodes/${s}/links/parents`),getLifecycles:t=>J("GET","/metamodel/lifecycles"),getLifecycleStates:(t,s)=>J("GET",`/metamodel/lifecycles/${s}/states`),getLifecycleTransitions:(t,s)=>J("GET",`/metamodel/lifecycles/${s}/transitions`),createLifecycle:(t,s)=>J("POST","/metamodel/lifecycles",t,s),duplicateLifecycle:(t,s,n)=>J("POST",`/metamodel/lifecycles/${s}/duplicate`,t,{name:n}),deleteLifecycle:(t,s)=>J("DELETE",`/metamodel/lifecycles/${s}`),addLifecycleState:(t,s,n)=>J("POST",`/metamodel/lifecycles/${s}/states`,t,n),updateLifecycleState:(t,s,n,r)=>J("PUT",`/metamodel/lifecycles/${s}/states/${n}`,t,r),deleteLifecycleState:(t,s,n)=>J("DELETE",`/metamodel/lifecycles/${s}/states/${n}`),listLifecycleStateActions:(t,s,n)=>J("GET",`/metamodel/lifecycles/${s}/states/${n}/actions`),attachLifecycleStateAction:(t,s,n,r,a,o,i=0)=>J("POST",`/metamodel/lifecycles/${s}/states/${n}/actions`,t,{instanceId:r,trigger:a,executionMode:o,displayOrder:i}),detachLifecycleStateAction:(t,s,n,r)=>J("DELETE",`/metamodel/lifecycles/${s}/states/${n}/actions/${r}`),addLifecycleTransition:(t,s,n)=>J("POST",`/metamodel/lifecycles/${s}/transitions`,t,n),updateLifecycleTransition:(t,s,n,r)=>J("PUT",`/metamodel/lifecycles/${s}/transitions/${n}`,t,r),deleteLifecycleTransition:(t,s,n)=>J("DELETE",`/metamodel/lifecycles/${s}/transitions/${n}`),addTransitionSignatureRequirement:(t,s,n,r=0)=>J("POST",`/metamodel/transitions/${s}/signature-requirements`,t,{roleId:n,displayOrder:r}),removeTransitionSignatureRequirement:(t,s,n)=>J("DELETE",`/metamodel/transitions/${s}/signature-requirements/${n}`),deleteNodeType:(t,s)=>J("DELETE",`/metamodel/nodetypes/${s}`),updateNodeTypeIdentity:(t,s,n)=>J("PUT",`/metamodel/nodetypes/${s}/identity`,t,n),updateNodeTypeNumberingScheme:(t,s,n)=>J("PUT",`/metamodel/nodetypes/${s}/numbering-scheme`,t,{numberingScheme:n}),updateNodeTypeVersionPolicy:(t,s,n)=>J("PUT",`/metamodel/nodetypes/${s}/version-policy`,t,{versionPolicy:n}),updateNodeTypeCollapseHistory:(t,s,n)=>J("PUT",`/metamodel/nodetypes/${s}/collapse-history`,t,{collapseHistory:n}),updateNodeTypeLifecycle:(t,s,n)=>J("PUT",`/metamodel/nodetypes/${s}/lifecycle`,t,{lifecycleId:n||null}),updateNodeTypeAppearance:(t,s,n,r)=>J("PUT",`/metamodel/nodetypes/${s}/appearance`,t,{color:n||null,icon:r||null}),updateAttribute:(t,s,n,r)=>J("PUT",`/metamodel/nodetypes/${s}/attributes/${n}`,t,r),deleteAttribute:(t,s,n)=>J("DELETE",`/metamodel/nodetypes/${s}/attributes/${n}`),updateLinkType:(t,s,n)=>J("PUT",`/metamodel/linktypes/${s}`,t,n),deleteLinkType:(t,s)=>J("DELETE",`/metamodel/linktypes/${s}`),getLinkTypeAttributes:(t,s)=>J("GET",`/metamodel/linktypes/${s}/attributes`),createLinkTypeAttribute:(t,s,n)=>J("POST",`/metamodel/linktypes/${s}/attributes`,t,n),updateLinkTypeAttribute:(t,s,n,r)=>J("PUT",`/metamodel/linktypes/${s}/attributes/${n}`,t,r),deleteLinkTypeAttribute:(t,s,n)=>J("DELETE",`/metamodel/linktypes/${s}/attributes/${n}`),getLinkTypeCascades:(t,s)=>J("GET",`/metamodel/linktypes/${s}/cascades`),createLinkTypeCascade:(t,s,n,r,a)=>J("POST",`/metamodel/linktypes/${s}/cascades`,t,{parentTransitionId:n,childFromStateId:r,childTransitionId:a}),deleteLinkTypeCascade:(t,s,n)=>J("DELETE",`/metamodel/linktypes/${s}/cascades/${n}`),getNodeTypeAttributes:(t,s)=>J("GET",`/metamodel/nodetypes/${s}/attributes`),createNodeType:(t,s)=>J("POST","/metamodel/nodetypes",t,s),updateNodeTypeParent:(t,s,n)=>J("PUT",`/metamodel/nodetypes/${s}/parent`,t,{parentNodeTypeId:n||null}),createAttribute:(t,s,n)=>J("POST",`/metamodel/nodetypes/${s}/attributes`,t,n),createLinkType:(t,s)=>J("POST","/metamodel/linktypes",t,s),getSourcesAdmin:t=>J("GET","/sources"),getSourceResolversAdmin:t=>J("GET","/sources/resolvers"),createSource:(t,s)=>J("POST","/sources",t,s),updateSource:(t,s,n)=>J("PUT",`/sources/${s}`,t,n),deleteSource:(t,s)=>J("DELETE",`/sources/${s}`),getImportContexts:()=>J("GET","/admin/import-contexts"),createImportContext:t=>J("POST","/admin/import-contexts",null,t),updateImportContext:(t,s)=>J("PUT",`/admin/import-contexts/${t}`,null,s),deleteImportContext:t=>J("DELETE",`/admin/import-contexts/${t}`),getImportAlgorithmInstances:()=>J("GET","/admin/import-contexts/algorithm-instances/import"),getValidationAlgorithmInstances:()=>J("GET","/admin/import-contexts/algorithm-instances/validation"),getSources:t=>ze("GET","/sources"),getSourceTypes:(t,s)=>ze("GET",`/sources/${s}/types`),suggestSourceKeys:(t,s,n,r,a=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),r&&o.set("q",r),o.set("limit",String(a)),ze("GET",`/sources/${s}/keys?${o.toString()}`)},getAllActions:t=>J("GET","/metamodel/actions"),getActionsForNodeType:(t,s)=>J("GET",`/metamodel/nodetypes/${s}/actions`),registerCustomAction:(t,s)=>J("POST","/metamodel/actions",t,s),getPermissionGrants:(t,s,n,r)=>ce("GET",`/nodetypes/${s}/permissions/${n}${r?`?transitionId=${encodeURIComponent(r)}`:""}`),addPermissionGrant:(t,s,n,r,a)=>ce("POST",`/nodetypes/${s}/permissions/${n}`,t,{roleId:r,transitionId:a||null}),removePermissionGrant:(t,s,n,r,a)=>ce("DELETE",`/nodetypes/${s}/permissions/${n}`,t,{roleId:r,transitionId:a||null}),getDomains:t=>J("GET","/domains"),createDomain:(t,s)=>J("POST","/domains",t,s),updateDomain:(t,s,n)=>J("PUT",`/domains/${s}`,t,n),deleteDomain:(t,s)=>J("DELETE",`/domains/${s}`),getDomainAttributes:(t,s)=>J("GET",`/domains/${s}/attributes`),createDomainAttribute:(t,s,n)=>J("POST",`/domains/${s}/attributes`,t,n),updateDomainAttribute:(t,s,n,r)=>J("PUT",`/domains/${s}/attributes/${n}`,t,r),deleteDomainAttribute:(t,s,n)=>J("DELETE",`/domains/${s}/attributes/${n}`),getEnums:t=>J("GET","/enums"),getEnumDetail:(t,s)=>J("GET",`/enums/${s}`),createEnum:(t,s)=>J("POST","/enums",t,s),updateEnum:(t,s,n)=>J("PUT",`/enums/${s}`,t,n),deleteEnum:(t,s)=>J("DELETE",`/enums/${s}`),getEnumValues:(t,s)=>J("GET",`/enums/${s}/values`),addEnumValue:(t,s,n)=>J("POST",`/enums/${s}/values`,t,n),updateEnumValue:(t,s,n,r)=>J("PUT",`/enums/${s}/values/${n}`,t,r),deleteEnumValue:(t,s,n)=>J("DELETE",`/enums/${s}/values/${n}`),reorderEnumValues:(t,s,n)=>J("PUT",`/enums/${s}/values/reorder`,t,n),listBaselines:t=>ze("GET","/baselines"),createBaseline:(t,s,n,r)=>ze("POST","/baselines",t,{userId:t,rootNodeId:s,name:n,description:r}),getBaselineContent:(t,s)=>ze("GET",`/baselines/${s}/content`),getRoles:t=>ce("GET","/roles"),createRole:(t,s,n)=>ce("POST","/roles",t,{name:s,description:n}),updateRole:(t,s,n,r)=>ce("PUT",`/roles/${s}`,t,{name:n,description:r}),deleteRole:(t,s)=>ce("DELETE",`/roles/${s}`),listProjectSpaces:t=>ce("GET",`/project-spaces${t?`?userId=${encodeURIComponent(t)}`:""}`),createProjectSpace:(t,s,n)=>ce("POST","/project-spaces",t,{name:s,description:n}),deactivateProjectSpace:(t,s)=>ce("DELETE",`/project-spaces/${s}`),getProjectSpaceServiceTags:(t,s)=>ce("GET",`/project-spaces/${s}/service-tags`),setProjectSpaceServiceTags:(t,s,n,r)=>ce("PUT",`/project-spaces/${s}/service-tags/${n}`,t,{tags:r}),setProjectSpaceIsolated:(t,s,n)=>ce("PUT",`/project-spaces/${s}/isolated`,t,{isolated:n}),listUsers:t=>ce("GET","/users"),getUser:(t,s)=>ce("GET",`/users/${s}`),updateUser:(t,s,n,r)=>ce("PUT",`/users/${s}`,t,{displayName:n,email:r}),createUser:(t,s,n,r)=>ce("POST","/users",t,{username:s,displayName:n,email:r}),deactivateUser:(t,s)=>ce("DELETE",`/users/${s}`),getUserRoles:(t,s,n)=>ce("GET",`/users/${s}/roles${n?`?projectSpaceId=${encodeURIComponent(n)}`:""}`),assignRole:(t,s,n,r)=>ce("POST",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(r)}`),removeRole:(t,s,n,r)=>ce("DELETE",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(r)}`),setUserAdmin:(t,s,n)=>ce("PUT",`/users/${s}/admin`,t,{isAdmin:n}),getUserContext:(t,s)=>ce("GET",`/users/${t}/context${s?`?projectSpaceId=${encodeURIComponent(s)}`:""}`),getDashboardTransaction:t=>ze("GET","/dashboard/transaction"),getDashboardWorkItems:t=>ze("GET","/dashboard/workitems"),listPermissions:t=>ce("GET","/permissions"),createPermission:(t,s,n,r,a,o)=>ce("POST","/permissions",t,{permissionCode:s,scope:n,displayName:r,description:a,displayOrder:o}),updatePermission:(t,s,n,r,a)=>ce("PUT",`/permissions/${s}`,t,{displayName:n,description:r,displayOrder:a}),getRolePolicies:(t,s)=>ce("GET",`/roles/${s}/policies`),listGlobalActions:t=>ce("GET","/global-actions"),getMyGlobalPermissions:t=>ce("GET","/my-global-permissions"),getSettingsSections:t=>oe("GET","/sections"),getUiManifest:()=>oe("GET","/ui/manifest"),createResource:(t,s)=>la(t,s),getRoleGlobalPermissions:(t,s)=>ce("GET",`/roles/${s}/global-permissions`),addRoleGlobalPermission:(t,s,n)=>ce("POST",`/roles/${s}/global-permissions`,t,{permissionCode:n}),removeRoleGlobalPermission:(t,s,n)=>ce("DELETE",`/roles/${s}/global-permissions/${n}`),getRoleScopePermissions:(t,s,n)=>ce("GET",`/roles/${s}/scope-permissions/${n}`),addRoleScopePermission:(t,s,n,r)=>ce("POST",`/roles/${s}/scope-permissions/${n}`,t,{permissionCode:r}),removeRoleScopePermission:(t,s,n,r)=>ce("DELETE",`/roles/${s}/scope-permissions/${n}/${r}`),getAccessRightsTree:(t,s)=>ce("GET",`/access-rights/tree${s?`?projectSpaceId=${s}`:""}`),getGrantsForRoleAndScope:(t,s,n)=>ce("GET",`/access-rights/roles/${s}/grants?scopeCode=${n}`),addScopedGrant:(t,s)=>ce("POST","/access-rights/grants",t,s),removeScopedGrant:(t,s)=>ce("DELETE","/access-rights/grants",t,s),listSecrets:t=>oe("GET","/admin/secrets"),revealSecret:(t,s)=>oe("GET",`/admin/secrets/${encodeURIComponent(s)}`),createSecret:(t,s,n)=>oe("POST","/admin/secrets",t,{key:s,value:n}),updateSecret:(t,s,n)=>oe("PUT",`/admin/secrets/${encodeURIComponent(s)}`,t,{value:n}),deleteSecret:(t,s)=>oe("DELETE",`/admin/secrets/${encodeURIComponent(s)}`),listAllInstances:t=>oe("GET","/algorithms/instances"),listTransitionGuards:(t,s)=>J("GET",`/metamodel/lifecycles/transitions/${s}/guards`),attachTransitionGuard:(t,s,n,r,a)=>J("POST",`/metamodel/lifecycles/transitions/${s}/guards`,t,{instanceId:n,effect:r,displayOrder:a}),updateTransitionGuard:(t,s,n)=>J("PUT",`/metamodel/lifecycles/transitions/guards/${s}`,t,{effect:n}),detachTransitionGuard:(t,s)=>J("DELETE",`/metamodel/lifecycles/transitions/guards/${s}`)},Ne={listActions:(t,s)=>oe("GET",`/actions${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAction:(t,s)=>oe("GET",`/actions/${s}`),createAction:(t,s)=>oe("POST","/actions",t,s),updateAction:(t,s,n)=>oe("PUT",`/actions/${s}`,t,n),deleteAction:(t,s)=>oe("DELETE",`/actions/${s}`),listParameters:(t,s)=>oe("GET",`/actions/${s}/parameters`),addParameter:(t,s,n)=>oe("POST",`/actions/${s}/parameters`,t,n),listActionGuards:(t,s)=>oe("GET",`/actions/${s}/guards`),attachActionGuard:(t,s,n,r,a)=>oe("POST",`/actions/${s}/guards`,t,{instanceId:n,effect:r,displayOrder:a}),updateActionGuard:(t,s,n,r)=>oe("PUT",`/actions/${s}/guards/${n}`,t,{effect:r}),detachActionGuard:(t,s,n)=>oe("DELETE",`/actions/${s}/guards/${n}`),listAlgorithmTypes:(t,s)=>oe("GET",`/algorithms/types${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithms:(t,s)=>oe("GET",`/algorithms${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithmParameters:(t,s)=>oe("GET",`/algorithms/${s}/parameters`),listAllInstances:(t,s)=>oe("GET",`/algorithms/instances${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),createInstance:(t,s,n,r)=>oe("POST","/algorithms/instances",t,{algorithmId:s,name:n,serviceCode:r}),updateInstance:(t,s,n)=>oe("PUT",`/algorithms/instances/${s}`,t,{name:n}),deleteInstance:(t,s)=>oe("DELETE",`/algorithms/instances/${s}`),getInstanceParams:(t,s)=>oe("GET",`/algorithms/instances/${s}/params`),setInstanceParam:(t,s,n,r)=>oe("PUT",`/algorithms/instances/${s}/params/${n}`,t,{value:r}),getAlgorithmStats:(t,s)=>oe("GET",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAlgorithmTimeseries:(t,s=24,n)=>oe("GET",`/algorithms/stats/timeseries?hours=${s}${n?`&serviceCode=${encodeURIComponent(n)}`:""}`),resetAlgorithmStats:(t,s)=>oe("DELETE",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listActionWrappers:(t,s)=>oe("GET",`/algorithms/actions/${s}/wrappers`),attachActionWrapper:(t,s,n,r,a)=>oe("POST",`/algorithms/actions/${s}/wrappers`,t,{instanceId:n,executionOrder:r,serviceCode:a}),detachActionWrapper:(t,s,n)=>oe("DELETE",`/algorithms/actions/${s}/wrappers/${n}`),getRegisteredServices:()=>oe("GET","/algorithms/services"),getServiceCatalog:t=>oe("GET","/registry/actions").then(s=>{var n;return((n=s==null?void 0:s.services)==null?void 0:n[t])||{handlers:[],guards:[]}})},ut={open:(t,s,n="psm")=>oe("POST",`/transactions/${n}`),current:async t=>{const s=await oe("GET","/transactions?status=OPEN");return Array.isArray(s)&&s.length>0?s[0]:null},commit:(t,s,n,r,a)=>oe("POST",`/transactions/${s}/${n}/commit`,null,{comment:r,...a!=null&&a.length?{itemIds:a}:{}}),release:(t,s,n,r)=>oe("DELETE",`/transactions/${s}/${n}/items`,null,{itemIds:r}),rollback:(t,s,n)=>oe("POST",`/transactions/${s}/${n}/rollback`),get:(t,s,n)=>oe("GET",`/transactions/${s}/${n}`),nodes:async(t,s,n)=>{const r=await oe("GET",`/transactions/${s}/${n}`);return(r==null?void 0:r.items)||[]},versions:(t,s)=>ze("GET",`/transactions/${s}/versions`)};async function Ws(t,s,n,r,a){return Be(et("psm"),t,s,a,{txId:r})}async function js(t,s){const n={"Content-Type":"application/json"};ve&&(n.Authorization=`Bearer ${ve}`),Ee&&(n["X-PLM-ProjectSpace"]=Ee);const r=await Oe(`/api/${t}${s}`,{method:"GET",headers:n},"GET");if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}const da={submitImport:async(t,s,n,r)=>{const a={};ve&&(a.Authorization=`Bearer ${ve}`),Ee&&(a["X-PLM-ProjectSpace"]=Ee);const o=new FormData;o.append("file",t),n&&o.append("contextCode",n);const i=r?await Dt(`/api/psm/cad/import/${s}`,"POST",a,o,r):await Oe(`/api/psm/cad/import/${s}`,{method:"POST",headers:a,body:o},"POST");if(!i.ok){const c=await i.text();throw new Error(`HTTP ${i.status}: ${c}`)}return i.json()},getJobStatus:async t=>{const s={"Content-Type":"application/json"};ve&&(s.Authorization=`Bearer ${ve}`),Ee&&(s["X-PLM-ProjectSpace"]=Ee);const n=await Oe(`/api/psm/cad/jobs/${t}`,{method:"GET",headers:s},"GET");if(!n.ok)throw new Error(`HTTP ${n.status}`);return n.json()},getImportContexts:async()=>{const t={"Content-Type":"application/json"};ve&&(t.Authorization=`Bearer ${ve}`),Ee&&(t["X-PLM-ProjectSpace"]=Ee);const s=await Oe("/api/psm/cad/import-contexts",{method:"GET",headers:t},"GET");return s.ok?s.json():[]}},pa={executeAction:(t,s,n,r,a,o)=>{const i=o?`/actions/${s}/${t}/${o}`:`/actions/${s}/${t}`;return Ws("POST",i,n,r,{parameters:a||{}})},executeViaDescriptor:async(t,s,n,r,a,o)=>{var p;const i=(t.path||"").replace("{id}",s).replace("{transitionId}",((p=t.metadata)==null?void 0:p.transitionId)||""),c=t.httpMethod||"POST";if(t.bodyShape==="MULTIPART"){const d=new FormData;for(const[T,P]of Object.entries(a||{}))P!=null&&d.append(T,P);const x={};ve&&(x.Authorization=`Bearer ${ve}`),Ee&&(x["X-PLM-ProjectSpace"]=Ee),r&&(x["X-PLM-Tx"]=r);const f=o?await Dt("/api/psm"+i,c,x,d,o):await Oe("/api/psm"+i,{method:c,headers:x,body:d},c);if(!f.ok){const T=await f.text();throw new Error(`HTTP ${f.status}: ${T}`)}const k=await f.text();return k?JSON.parse(k):null}return Ws(c,i,n,r,{parameters:a||{}})}},Ct={list:t=>ce("GET",`/users/${encodeURIComponent(t)}/basket`),add:(t,s,n,r)=>ce("PUT",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(r)}`),remove:(t,s,n,r)=>ce("DELETE",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(r)}`),clear:t=>ce("DELETE",`/users/${encodeURIComponent(t)}/basket`)},Cn={getSingle:(t,s,n)=>ce("GET",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}`,void 0,void 0,{psOverride:""}),setSingle:(t,s,n,r)=>ce("PUT",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}/${encodeURIComponent(r)}`,void 0,void 0,{psOverride:""})},te=dn((t,s)=>({userId:null,setUserId:n=>t({userId:n}),projectSpaceId:null,setProjectSpaceId:n=>t({projectSpaceId:n}),items:[],nodeTypes:[],resources:[],itemsStatus:"idle",refreshItems:async()=>{const{userId:n}=s();if(n){t({itemsStatus:"loading"});try{const r=await X.getItems(n),a=Array.isArray(r)?r:[],o=a.filter(d=>d.serviceCode==="psm"&&d.list).map(d=>({id:d.itemCode,name:d.displayName,description:d.description,color:d.color,icon:d.icon})),i=a.filter(d=>d.create),c=a.filter(d=>d.serviceCode==="psm"&&d.list),p=await Promise.all(c.map(d=>X.fetchListableItems(n,d,0,50).then(x=>x.items||[]).catch(()=>[])));t({items:a,nodeTypes:o,resources:i,itemsStatus:"loaded",nodes:p.flat()})}catch{t({items:[],nodeTypes:[],resources:[],itemsStatus:"idle"})}}},stateColorMap:{},stateColorMapLoaded:!1,refreshStateColorMap:async()=>{const{userId:n}=s();if(n)try{const r=await X.getLifecycles(n);if(!Array.isArray(r))return;const a=await Promise.all(r.map(i=>X.getLifecycleStates(n,i.id||i.ID).catch(()=>[]))),o={};a.forEach(i=>i.forEach(c=>{const p=c.id||c.ID,d=c.color||c.COLOR;p&&d&&(o[p]=d)})),t({stateColorMap:o,stateColorMapLoaded:!0})}catch{}},projectSpaces:[],users:[],refreshProjectSpaces:async()=>{const{userId:n}=s();if(n)try{const r=await X.listProjectSpaces(n);t({projectSpaces:Array.isArray(r)?r:[]})}catch{}},refreshUsers:async()=>{const{userId:n}=s();if(n)try{const r=await X.listUsers(n);t({users:Array.isArray(r)?r.filter(a=>a.active!==!1):[]})}catch{}},nodes:[],refreshNodes:async()=>{const{userId:n,items:r}=s();if(n)try{const a=r.filter(i=>i.serviceCode==="psm"&&i.list),o=await Promise.all(a.map(i=>X.fetchListableItems(n,i,0,50).then(c=>c.items||[]).catch(()=>[])));t({nodes:o.flat()})}catch{}},activeTx:null,txNodes:[],lockedByMe:new Set,lockItem:n=>t(r=>{const a=new Set(r.lockedByMe);return a.add(n),{lockedByMe:a}}),unlockItem:n=>t(r=>{const a=new Set(r.lockedByMe);return a.delete(n),{lockedByMe:a}}),unlockAll:()=>t({lockedByMe:new Set}),refreshTx:async()=>{const{userId:n}=s();if(n)try{const r=await ut.current(n);if(r){const a=await ut.nodes(n,r.serviceCode,r.txId).catch(()=>[]),o=Array.isArray(a)?a:[],i=new Set(o.map(c=>c.itemId).filter(Boolean));t({activeTx:r,txNodes:o,lockedByMe:i})}else t({activeTx:null,txNodes:[],lockedByMe:new Set})}catch{t({activeTx:null,txNodes:[],lockedByMe:new Set})}},clearTx:()=>t({activeTx:null,txNodes:[],lockedByMe:new Set}),refreshAll:async()=>{const{refreshItems:n,refreshTx:r}=s();await Promise.all([n(),r()])},basketItems:{},basketLoaded:!1,loadBasket:async n=>{if(n)try{const r=await Ct.list(n),a={};(r||[]).forEach(({source:o,typeCode:i,itemId:c})=>{const p=`${o}:${i}`;a[p]||(a[p]=new Set),a[p].add(c)}),t({basketItems:a,basketLoaded:!0})}catch{t({basketItems:{},basketLoaded:!0})}},addToBasket:async(n,r,a,o)=>{const i=`${r}:${a}`;t(c=>{const p=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return p.add(o),{basketItems:{...c.basketItems,[i]:p}}});try{await Ct.add(n,r,a,o)}catch{}},removeFromBasket:async(n,r,a,o)=>{const i=`${r}:${a}`;t(c=>{const p=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return p.delete(o),{basketItems:{...c.basketItems,[i]:p}}});try{await Ct.remove(n,r,a,o)}catch{}},emptyBasket:async n=>{const{lockedByMe:r,basketItems:a}=s(),o=new Set(r);if(![...Object.entries(a)].some(([d,x])=>d.startsWith("psm:")&&[...x].some(f=>o.has(f)))){t({basketItems:{}});try{await Ct.clear(n)}catch{}return}const c={},p=[];for(const[d,x]of Object.entries(a)){const f=d.indexOf(":"),k=f>-1?d.slice(0,f):d,T=f>-1?d.slice(f+1):"",P=new Set;for(const $ of x){if(k==="psm"&&o.has($)){P.add($);continue}p.push(Ct.remove(n,k,T,$).catch(()=>{}))}P.size>0&&(c[d]=P)}t({basketItems:c}),await Promise.all(p)},isInBasket:(n,r,a)=>{const o=`${n}:${r}`,{basketItems:i}=te.getState();return!!(i[o]&&i[o].has(a))},syncBasketAdd:(n,r)=>t(a=>{const o=a.basketItems[n]?new Set(a.basketItems[n]):new Set;return o.add(r),{basketItems:{...a.basketItems,[n]:o}}}),syncBasketRemove:(n,r)=>t(a=>{if(!a.basketItems[n])return{};const o=new Set(a.basketItems[n]);return o.delete(r),{basketItems:{...a.basketItems,[n]:o}}}),syncBasketClear:()=>t({basketItems:{}}),removeBasketItemIds:n=>t(r=>{const a=new Set(n),o={};for(const[i,c]of Object.entries(r.basketItems)){const p=new Set([...c].filter(d=>!a.has(d)));p.size>0&&(o[i]=p)}return{basketItems:o}}),_slices:{},_sliceActions:{}})),En="plm-theme",Tn="UI_PREF";function ms(t){return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function us(t){document.documentElement.setAttribute("data-theme",t)}function Jt(){return localStorage.getItem(En)||"dark"}function ws(t){localStorage.setItem(En,t),us(ms(t))}async function ma(t){try{const s=await Cn.getSingle(t,Tn,"theme");s!=null&&s.value&&ws(s.value)}catch{}}async function ua(t,s){try{await Cn.setSingle(t,Tn,"theme",s)}catch{}}function ha(){const t=Jt();us(ms(t)),window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{Jt()==="system"&&us(ms("system"))})}const fe=dn(t=>({showCollab:!1,collabWidth:320,collabVersionFilter:null,collabTriggerText:null,collabTabs:[],toggleCollab:()=>t(s=>({showCollab:!s.showCollab})),openCollab:()=>t({showCollab:!0}),closeCollab:()=>t({showCollab:!1}),setCollabWidth:s=>t({collabWidth:s}),setVersionFilter:s=>t({collabVersionFilter:s}),setTriggerText:s=>t({collabTriggerText:s}),clearTriggerText:()=>t({collabTriggerText:null}),addCollabTab:(s,n,r)=>t(a=>({collabTabs:a.collabTabs.some(o=>o.id===s)?a.collabTabs:[...a.collabTabs,{id:s,label:n,Component:r}]})),removeCollabTab:s=>t(n=>({collabTabs:n.collabTabs.filter(r=>r.id!==s)})),consoleVisible:!1,consoleHeight:220,consoleTabs:[],consoleLog:[],toggleConsole:()=>t(s=>({consoleVisible:!s.consoleVisible})),openConsole:()=>t({consoleVisible:!0}),setConsoleHeight:s=>t({consoleHeight:s}),addConsoleTab:(s,n,r)=>t(a=>({consoleTabs:a.consoleTabs.some(o=>o.id===s)?a.consoleTabs:[...a.consoleTabs,{id:s,label:n,Component:r}]})),removeConsoleTab:s=>t(n=>({consoleTabs:n.consoleTabs.filter(r=>r.id!==s)})),appendLog:(s,n)=>t(r=>({consoleLog:[...r.consoleLog.slice(-500),{level:s,message:n,ts:Date.now()}]})),statusSlots:[],registerStatus:(s,n,r="left")=>t(a=>({statusSlots:a.statusSlots.some(o=>o.id===s)?a.statusSlots.map(o=>o.id===s?{id:s,Component:n,position:r}:o):[...a.statusSlots,{id:s,Component:n,position:r}]})),unregisterStatus:s=>t(n=>({statusSlots:n.statusSlots.filter(r=>r.id!==s)})),bgJobs:[],registerBgJob:(s,n,r)=>t(a=>({bgJobs:a.bgJobs.some(o=>o.id===s)?a.bgJobs.map(o=>o.id===s?{...o,label:n,onOpen:r}:o):[...a.bgJobs,{id:s,label:n,status:"running",onOpen:r}]})),updateBgJob:(s,n)=>t(r=>({bgJobs:r.bgJobs.map(a=>a.id===s?{...a,status:n}:a)})),removeBgJob:s=>t(n=>({bgJobs:n.bgJobs.filter(r=>r.id!==s)})),_wsListeners:new Set,fireWsEvent:s=>{fe.getState()._wsListeners.forEach(n=>n(s))},subscribeWsEvent:s=>(fe.getState()._wsListeners.add(s),()=>fe.getState()._wsListeners.delete(s))}));function Et(t,s){fe.getState().appendLog(t,s)}function xa(t){if(!t.event)return`[WS] (unknown) ${JSON.stringify(t)}`;const s=[t.event];return t.byUser&&s.push(`by ${t.byUser}`),(t.nodeId||t.itemId)&&s.push(`node=${t.nodeId||t.itemId}`),t.userId&&s.push(`user=${t.userId}`),t.entity&&s.push(t.entity),t.status&&s.push(t.status),t.jobId&&s.push(`job=${t.jobId}`),`[WS] ${s.join(" · ")}`}function zn(t,s,n,r){const a=l.useRef(s);a.current=s;const o=l.useRef(r);o.current=r;const i=l.useRef(null),c=Array.isArray(t)?t:t?[t]:[],p=c.join("\0");l.useEffect(()=>{if(c.length===0)return;let d=null,x=null,f=1e3,k=!1;function T($){const u=o.current;u&&$&&$.readyState===WebSocket.OPEN&&$.send(JSON.stringify({type:"subscribe",projectSpaceId:u}))}function P(){if(k)return;const $=xt(),u=location.protocol==="https:"?"wss:":"ws:",y=$?`${u}//${location.host}/api/ws/?token=${encodeURIComponent($)}`:`${u}//${location.host}/api/ws/`;d=new WebSocket(y),i.current=d,d.onopen=()=>{f=1e3,Et("debug","[WS] connected"),T(d)},d.onmessage=m=>{try{const j=JSON.parse(m.data);Et("info",xa(j)),a.current(j),fe.getState().fireWsEvent(j)}catch(j){console.warn("WS parse error",j),Et("warn",`[WS] parse error: ${j.message}`)}},d.onclose=m=>{i.current=null,!k&&(Et("warn",`[WS] disconnected — reconnecting in ${f}ms`),x=setTimeout(()=>{f=Math.min(f*2,3e4),P()},f))},d.onerror=()=>{Et("warn","[WS] connection error")}}return P(),()=>{k=!0,i.current=null,x&&clearTimeout(x),d&&(d.onclose=null,d.close())}},[p,n]),l.useEffect(()=>{const d=i.current;d&&d.readyState===WebSocket.OPEN&&r&&d.send(JSON.stringify({type:"subscribe",projectSpaceId:r}))},[r])}const lt={Box:Nr,Package:gn,Cpu:vs,Wrench:Sr,Cog:kr,Database:fn,Globe:xn,BookOpen:hn,Clipboard:wr,Tag:jr,FolderOpen:yr,Archive:vr,Zap:bs,FlaskConical:br,Microscope:gr,Layers:Yt,FileText:fr,GitBranch:un,Hexagon:Bt,Circle:xr,Users:mn,Shield:ft,Award:pn,LayoutDashboard:hr,Component:ur,Blocks:mr,Cable:pr,Gauge:dr,Radio:cr,Scan:lr},fa={user:Zt,layers:Yt,database:fn,list:Ir,lifecycle:un,plug:zr,hexagon:Bt,users:mn,shield:ft,cpu:vs,workflow:bn,key:Tr,network:Er,globe:xn,terminal:Cr,book:hn,zap:bs,package:gn},Ot=Object.freeze({serviceCode:"psm",get:Object.freeze({httpMethod:"GET",path:"/nodes/{id}/description"})}),Nt=[];function hs(t){if(!t||!t.match||!t.match.serviceCode)throw new Error("Plugin requires match.serviceCode");const s=(t.match.itemKey?4:0)+(t.match.itemCode?2:0)+(t.match.serviceCode==="*"?0:1);t._specificity=s,Nt.push(t),Nt.sort((n,r)=>(r._specificity||0)-(n._specificity||0))}function In(t,s){const n=t.match;return!(n.serviceCode!=="*"&&n.serviceCode!==s.serviceCode||n.itemCode&&n.itemCode!==s.itemCode||n.itemKey&&n.itemKey!==s.itemKey)}function Xt(t){for(const s of Nt)if(In(s,t||{}))return s;return Lt}function ga(t){if(!t)return Lt;for(const s of Nt)if(In(s,t))return s;return Lt}let Lt={match:{serviceCode:"*"},name:"default",hasItemChildren:()=>!1};function ba(t){Lt={...Lt,...t,match:{serviceCode:"*"}}}function va(t){for(const s of Nt)if(s.LinkRow&&(s.match.serviceCode==="*"||s.match.serviceCode===t))return s.LinkRow;return null}function Fs(t,s,n){const r=Nt.find(a=>a.match.serviceCode===t&&(!s||a.match.itemCode===s));r?Object.assign(r,n):hs({match:{serviceCode:t,itemCode:s},...n})}function ya(t){return!t||t.id==="dashboard"||!t.nodeId?null:{source:t.serviceCode||"",type:t.itemCode||"",key:t.nodeId}}function ss(t){return`${t.serviceCode}:${t.itemCode||""}`}function ja(t,s){return t.serviceCode===s.source&&t.itemCode===s.type}function An(t){if(!t)return null;const s={id:t.id,_title:t.title};t.itemType&&(s._serviceCode=t.itemType.serviceCode,s._itemCode=t.itemType.itemCode,s._itemKey=t.itemType.itemKey??null);for(const n of t.fields||[])s[n.name]=n.value;return s}function ks({descriptor:t,item:s,ctx:n,isActive:r,isOpen:a,isPinned:o,hasChildren:i,isExpanded:c,isLoading:p,onToggleExpand:d,onToggleChildren:x,onPin:f,onUnpin:k}){var W,F,H,R,L;const T=d||x,P=Xt(t),$=P==null?void 0:P.NavLabel,u=((W=P==null?void 0:P.getRowProps)==null?void 0:W.call(P,s,t,n))??{},y=((H=(F=t.list)==null?void 0:F.itemShape)==null?void 0:H.idField)||"id",m=((L=(R=t.list)==null?void 0:R.itemShape)==null?void 0:L.labelField)||"_title",j=(s==null?void 0:s[y])||(s==null?void 0:s.id)||(s==null?void 0:s.ID),h=(s==null?void 0:s[m])||(s==null?void 0:s._title)||j,S=t.icon?lt[t.icon]:null;return e.jsxs("div",{className:`node-item${r?" active":""}`,onClick:()=>n.onNavigate(j,h,t),title:u.title??h,...u,children:[e.jsx("span",{className:"ni-expand",style:{visibility:p||i?"visible":"hidden"},onClick:C=>{C.stopPropagation(),T==null||T(C)},children:p?e.jsx("span",{style:{fontSize:9,color:"var(--muted)",lineHeight:1},children:"…"}):c?e.jsx(Ge,{size:9,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Fe,{size:9,strokeWidth:2.5,color:"var(--muted)"})}),S?e.jsx(S,{size:11,color:t.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):t.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:t.color,flexShrink:0,display:"inline-block"}}):null,a&&!o&&e.jsx("span",{title:"Open",style:{width:5,height:5,borderRadius:"50%",background:"var(--accent)",flexShrink:0,display:"inline-block"}}),$?e.jsx($,{item:s,descriptor:t,ctx:n}):e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:h||j}),(f||k)&&e.jsx("button",{className:`search-pin-btn${o?" pinned":""}`,title:o?"Remove from basket":"Add to basket",onClick:C=>{C.stopPropagation(),o?k==null||k():f==null||f()},children:o?e.jsx(vn,{size:11,strokeWidth:2}):e.jsx(yn,{size:11,strokeWidth:2})})]})}const wa=8;function $n({descriptor:t,itemRef:s,initialItem:n,ctx:r,isOpen:a,isPinned:o}){const[i,c]=l.useState(n??null),[p,d]=l.useState(!n&&!!(t!=null&&t.get)),[x,f]=l.useState(!1),[k,T]=l.useState(!1),[P,$]=l.useState(!1),u=l.useRef({}),[y,m]=l.useState(new Set),[,j]=l.useState(0),h=te(N=>N.addToBasket),S=te(N=>N.removeFromBasket),W=te(N=>N.lockedByMe),F=te(N=>N.userId);l.useEffect(()=>{n&&(c(n),d(!1),f(!1))},[n]),l.useEffect(()=>{if(n||!(t!=null&&t.get)){n||d(!1);return}let N=!1;return d(!0),f(!1),Nn(t.serviceCode,t.get,s.key).then(D=>{if(!N){const O=An(D);O?(c(O),f(!1)):f(!0),d(!1)}}).catch(()=>{N||(f(!0),d(!1))}),()=>{N=!0}},[s.key,t==null?void 0:t.serviceCode]);const H=Xt(t),R=i||{id:s.key,_title:s.key},L=R.id||R.ID||s.key,C=r.activeNodeId===L,E=(t==null?void 0:t.serviceCode)==="psm"&&W.has(L),U=!p&&i&&H.hasItemChildren?H.hasItemChildren(R):!1,q=l.useCallback(()=>{h(F,t.serviceCode,t.itemCode,L)},[h,F,t,L]),w=l.useCallback(()=>{S(F,t.serviceCode,t.itemCode,L)},[S,F,t,L]),A=E?null:w,g=l.useCallback(async N=>{N==null||N.stopPropagation();const D=!k;if(T(D),!!D&&u.current[L]===void 0){if(!H.fetchChildren){u.current[L]=[];return}u.current[L]="loading",$(!0),j(O=>O+1);try{const O=await H.fetchChildren(R,r);u.current[L]=Array.isArray(O)?O:[]}catch{u.current[L]=[]}finally{$(!1),j(O=>O+1)}}},[k,L,H,R,r]),B=l.useCallback(async(N,D,O)=>{if(O&&O.stopPropagation(),m(G=>{const z=new Set(G);return z.has(N)?z.delete(N):z.add(N),z}),u.current[D]===void 0){if(!H.fetchChildren){u.current[D]=[];return}u.current[D]="loading",j(G=>G+1);try{const G=await H.fetchChildren({id:D},r);u.current[D]=Array.isArray(G)?G:[]}catch{u.current[D]=[]}j(G=>G+1)}},[H,r]);function v(N,D,O,G){if(O>wa)return null;const z=N.id||N.ID||D,_=u.current[z];return!Array.isArray(_)||_.length===0||!H.ChildRow?null:_.map(K=>{const ee=K.targetNodeId||K.id||K.ID,re=`${D}/${K.linkId||ee}`,je=!G.has(ee)&&y.has(re);return e.jsxs(De.Fragment,{children:[e.jsx(H.ChildRow,{link:K,child:K,depth:O,parentPath:re,ancestorIds:G,ctx:r,childCacheRef:u,expandedPaths:y,toggleNodeChildren:(V,Q,ie)=>B(V,Q,ie)}),je&&v({id:ee},re,O+1,new Set([...G,ee]))]},re)})}const b=`${(t==null?void 0:t.serviceCode)||""}:${(t==null?void 0:t.itemCode)||""}:${L}`,M=u.current[L]==="loading"||P;return p?e.jsx("div",{className:"node-item",style:{color:"var(--muted)",fontSize:10,paddingLeft:24},children:"…"}):x?e.jsxs("div",{className:"node-item",title:`Could not resolve item: ${s.key}`,style:{color:"var(--danger, #e55)",fontSize:10,gap:6,cursor:"default"},children:[e.jsx("span",{style:{opacity:.7},children:"⚠"}),e.jsx("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"},children:s.key})]}):e.jsxs(e.Fragment,{children:[e.jsx(ks,{descriptor:t,item:R,ctx:r,isActive:C,isOpen:a,isPinned:o,hasChildren:U,isExpanded:k,isLoading:M,onToggleExpand:g,onToggleChildren:g,onPin:q,onUnpin:A}),k&&v(R,b,1,new Set([L]))]})}const ka=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function Sa({userId:t}){const[s,n]=l.useState(Jt);function r(a){n(a),ws(a),t&&ua(t,a)}return e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:8},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:ka.map(a=>e.jsxs("button",{type:"button",className:`theme-option${s===a.value?" theme-option--active":""}`,onClick:()=>r(a.value),children:[e.jsx("span",{className:"theme-option-icon",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))})]})}const Us=["#5b9cf6","#56d18e","#e8c547","#a78bfa","#f87171","#34d399","#fb923c","#60a5fa"];function Pn(t){if(!t)return"#64748b";let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)&4294967295;return Us[Math.abs(s)%Us.length]}function Rn(t){const s=(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||"?",n=s.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():s[0].toUpperCase()}function Na({user:t,userId:s}){const n=Pn((t==null?void 0:t.id)||s);return e.jsxs("div",{className:"user-avatar",style:{"--avatar-color":n},title:(t==null?void 0:t.displayName)||(t==null?void 0:t.username),children:[t!=null&&t.avatarUrl?e.jsx("img",{className:"user-avatar-img",src:t.avatarUrl,alt:""}):e.jsx("span",{className:"user-avatar-initials",children:Rn(t)}),(t==null?void 0:t.isAdmin)&&e.jsx("span",{className:"user-avatar-badge",title:"Administrator",children:"A"})]})}function Ca({userId:t,onClose:s}){const[n,r]=l.useState(null),[a,o]=l.useState(!1),[i,c]=l.useState({displayName:"",email:""}),[p,d]=l.useState(!1),[x,f]=l.useState(null);l.useEffect(()=>{X.getUser(t,t).then(r).catch(()=>{})},[t]);function k(u,y){f({msg:u,type:y}),setTimeout(()=>f(null),2500)}function T(){c({displayName:(n==null?void 0:n.displayName)||"",email:(n==null?void 0:n.email)||""}),o(!0)}async function P(){d(!0);try{await X.updateUser(t,t,i.displayName.trim(),i.email.trim());const u=await X.getUser(t,t);r(u),o(!1),k("Profile updated","success")}catch{k("Failed to update profile","error")}finally{d(!1)}}l.useEffect(()=>{function u(y){y.key==="Escape"&&s()}return document.addEventListener("keydown",u),()=>document.removeEventListener("keydown",u)},[s]);const $=Pn(t);return e.jsx("div",{className:"profile-modal-overlay",onMouseDown:u=>{u.target===u.currentTarget&&s()},children:e.jsxs("div",{className:"profile-modal",children:[e.jsxs("div",{className:"profile-modal-header",children:[e.jsx("span",{className:"profile-modal-title",children:"My Profile"}),e.jsx("button",{className:"icon-btn",onClick:s,title:"Close",children:e.jsx(ht,{size:14,strokeWidth:2})})]}),e.jsxs("div",{className:"profile-modal-body",children:[x&&e.jsx("div",{style:{padding:"7px 12px",borderRadius:"var(--r)",fontSize:12,fontWeight:500,background:x.type==="success"?"rgba(56,212,113,.15)":"rgba(248,113,113,.15)",color:x.type==="success"?"#34d399":"#f87171",border:`1px solid ${x.type==="success"?"#34d39940":"#f8717140"}`},children:x.msg}),n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:"50%",border:`3px solid ${$}`,background:`color-mix(in srgb, ${$} 12%, var(--surface))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:$,flexShrink:0},children:n.avatarUrl?e.jsx("img",{src:n.avatarUrl,alt:"",style:{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}):Rn(n)}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:14,fontWeight:700,color:"var(--text)"},children:n.displayName||n.username}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2},children:n.username}),n.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",style:{marginTop:4,display:"inline-block"},children:"Admin"})]})]}),a?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Display Name"}),e.jsx("input",{className:"field-input",autoFocus:!0,value:i.displayName,onChange:u=>c(y=>({...y,displayName:u.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Email"}),e.jsx("input",{className:"field-input",type:"email",value:i.email,onChange:u=>c(y=>({...y,email:u.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("button",{className:"btn btn-primary",onClick:P,disabled:p,children:p?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>o(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.email||"—"})]}),e.jsx("div",{children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:T,children:[e.jsx(gt,{size:11,strokeWidth:2}),"Edit"]})})]}),e.jsx("div",{style:{borderTop:"1px solid var(--border)",paddingTop:12,marginTop:4},children:e.jsx(Sa,{userId:t})})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})]})]})})}function Ea({currentUser:t,userId:s,users:n,onUserChange:r,onOpenProfile:a,onClose:o}){const i=l.useRef(null);return l.useEffect(()=>{function c(p){i.current&&!i.current.contains(p.target)&&o()}return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[o]),e.jsxs("div",{className:"profile-menu",ref:i,children:[e.jsxs("div",{className:"profile-menu-header",children:[e.jsx("div",{className:"profile-menu-name",children:(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||s}),(t==null?void 0:t.username)&&t.username!==t.displayName&&e.jsx("div",{className:"profile-menu-username",children:t.username})]}),(n||[]).length>1&&e.jsxs("div",{className:"profile-menu-section",children:[e.jsx("div",{className:"profile-menu-label",children:"Switch user"}),e.jsx("div",{className:"profile-menu-select-row",children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"user-select",style:{width:"100%",paddingRight:28},value:s,onChange:c=>{r(c.target.value),o()},children:n.map(c=>e.jsx("option",{value:c.id,children:c.displayName||c.username},c.id))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})})]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",onClick:()=>{a(),o()},children:[e.jsx(Zt,{size:13,strokeWidth:2,color:"var(--muted)"}),"My Profile"]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",disabled:!0,title:"Not yet implemented",children:[e.jsx($r,{size:13,strokeWidth:2,color:"var(--muted)"}),"Logout"]})]})}function Ta({onNavigate:t}){const s=te(k=>k.basketItems),n=te(k=>k.emptyBasket),r=te(k=>k.userId),a=te(k=>k.items),o=te(k=>k.stateColorMap),[i,c]=De.useState(!1),p=De.useRef(null),d=Object.values(s).reduce((k,T)=>k+T.size,0);De.useEffect(()=>{if(!i)return;function k(T){p.current&&!p.current.contains(T.target)&&c(!1)}return document.addEventListener("mousedown",k),()=>document.removeEventListener("mousedown",k)},[i]);const x=De.useMemo(()=>({userId:r,activeNodeId:null,stateColorMap:o,onNavigate:(k,T,P)=>{t==null||t(k,T,P),c(!1)}}),[r,o,t]),f=De.useMemo(()=>{const k=[];for(const[T,P]of Object.entries(s)){const $=T.indexOf(":"),u=$>-1?T.slice(0,$):T,y=$>-1?T.slice($+1):"",m=a.find(j=>j.serviceCode===u&&j.itemCode===y);if(m)for(const j of P)k.push({descriptor:m,itemRef:{source:u,type:y,key:j}})}return k},[s,a]);return e.jsxs("div",{className:"basket-btn-wrap",ref:p,children:[e.jsxs("button",{className:"basket-btn",title:"Basket",onClick:()=>c(k=>!k),children:[e.jsx(Ar,{size:15,strokeWidth:1.8}),d>0&&e.jsx("span",{className:"basket-badge",children:d>99?"99+":d})]}),i&&e.jsxs("div",{className:"basket-dropdown",children:[e.jsxs("div",{className:"basket-dropdown-header",children:[e.jsx("span",{className:"basket-dropdown-title",children:"Basket"}),e.jsxs("span",{className:"basket-dropdown-count",children:[d," item",d!==1?"s":""]})]}),e.jsx("div",{className:"basket-dropdown-divider"}),d===0?e.jsx("div",{className:"basket-dropdown-empty",children:"No items pinned"}):e.jsx("div",{className:"basket-dropdown-list",children:f.map(({descriptor:k,itemRef:T})=>e.jsx($n,{descriptor:k,itemRef:T,ctx:x,isOpen:!1,isPinned:!0},`${T.source}:${T.type}:${T.key}`))}),e.jsx("div",{className:"basket-dropdown-divider"}),e.jsx("button",{className:"basket-dropdown-action",disabled:d===0,onClick:()=>{r&&n(r),c(!1)},children:"Empty basket"})]})]})}function za({userId:t,onUserChange:s,users:n,nodeTypes:r,stateColorMap:a,nodes:o,searchQuery:i,searchType:c,onSearchChange:p,onSearchTypeChange:d,onSearchSubmit:x,projectSpaces:f,projectSpaceId:k,onProjectSpaceChange:T,onNavigate:P}){const $=l.useMemo(()=>(n||[]).find(A=>A.id===t),[n,t]),[u,y]=l.useState([]),[m,j]=l.useState(!1),[h,S]=l.useState(-1),[W,F]=l.useState(!1),[H,R]=l.useState(!1),L=l.useRef(null),C=l.useRef(null);l.useEffect(()=>{const A=(i||"").trim().toLowerCase();if(A.length<2){y([]),j(!1);return}const g=(o||[]).filter(B=>{const v=(B.logical_id||B.LOGICAL_ID||"").toLowerCase(),b=(B.display_name||B.DISPLAY_NAME||"").toLowerCase();return v&&v.includes(A)||b&&b.includes(A)}).slice(0,8);y(g),j(g.length>0),S(-1)},[i,o]);const E=l.useCallback(A=>{const g=A.id||A.ID;clearTimeout(L.current),p(""),j(!1),y([]),P&&P(g,void 0,Ot)},[p,P]),U=l.useCallback(A=>{if(A.key==="Enter"){h>=0&&u.length>0?(A.preventDefault(),E(u[h])):i&&i.trim()&&(A.preventDefault(),j(!1),x&&x(i.trim()));return}!m||u.length===0||(A.key==="ArrowDown"?(A.preventDefault(),S(g=>Math.min(g+1,u.length-1))):A.key==="ArrowUp"?(A.preventDefault(),S(g=>Math.max(g-1,0))):A.key==="Escape"&&j(!1))},[m,u,h,E,i,x]),q=l.useCallback(()=>{L.current=setTimeout(()=>j(!1),150)},[]),w=l.useCallback(()=>{clearTimeout(L.current),u.length>0&&j(!0)},[u.length]);return e.jsxs("header",{className:"header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"brand",children:[e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{flexShrink:0},children:[e.jsx("rect",{width:"24",height:"24",rx:"5",fill:"url(#psm-grad)"}),e.jsx("circle",{cx:"12",cy:"6",r:"2.2",fill:"white",fillOpacity:"0.95"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"6.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"17.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"12",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("circle",{cx:"6.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"12",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"17.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"psm-grad",x1:"0",y1:"0",x2:"24",y2:"24",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"var(--accent)"}),e.jsx("stop",{offset:"100%",stopColor:"#7c3aed"})]})})]}),e.jsx("span",{children:"PSM"})]}),e.jsx("div",{className:"brand-sep"})]}),e.jsx("div",{className:"header-center",children:e.jsxs("div",{className:"search-wrap",children:[e.jsxs("div",{className:"search-group",children:[e.jsx("span",{className:"search-icon",children:"⌕"}),e.jsx("input",{className:"search-input",placeholder:"Search by logical ID…",value:i,onChange:A=>p(A.target.value),onKeyDown:U,onFocus:w,onBlur:q,autoComplete:"off"}),e.jsx("div",{className:"search-divider"}),e.jsxs("select",{className:"search-type",value:c,onChange:A=>d(A.target.value),title:"Filter by type",children:[e.jsx("option",{value:"",children:"All types"}),(r||[]).map(A=>e.jsx("option",{value:A.id||A.ID,children:A.name||A.NAME},A.id||A.ID))]})]}),m&&u.length>0&&e.jsx("div",{className:"search-suggestions",children:u.map((A,g)=>{const B=A.id||A.ID,v=A.logical_id||A.LOGICAL_ID||"",b=A.node_type_name||A.NODE_TYPE_NAME||"",M=A.node_type_id||A.NODE_TYPE_ID||"",N=A.revision||A.REVISION||"A",D=A.iteration??A.ITERATION??1,O=A.lifecycle_state_id||A.LIFECYCLE_STATE_ID||"",G=(a==null?void 0:a[O])||"#6b7280",z=(r||[]).find(re=>(re.id||re.ID)===M),_=(z==null?void 0:z.color)||(z==null?void 0:z.COLOR)||null,K=(z==null?void 0:z.icon)||(z==null?void 0:z.ICON)||null,ee=K?lt[K]:null;return e.jsxs("div",{className:`search-sug-item${g===h?" hi":""}`,onMouseDown:()=>E(A),onMouseEnter:()=>S(g),children:[e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:ee?e.jsx(ee,{size:11,color:_||"var(--muted)",strokeWidth:2}):_?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:_,display:"inline-block"}}):null}),e.jsx("span",{className:"sug-dot",style:{background:G}}),e.jsx("span",{className:"sug-lid",children:v}),(A.display_name||A.DISPLAY_NAME)&&e.jsx("span",{className:"sug-dname",children:A.display_name||A.DISPLAY_NAME}),e.jsxs("span",{className:"sug-meta",children:[b," · ",D===0?N:`${N}.${D}`]})]},B)})})]})}),e.jsxs("div",{className:"header-right",children:[e.jsx(Ta,{onNavigate:P}),(f||[]).length>0&&e.jsxs("div",{className:"ps-select-wrap",title:"Active project space",children:[e.jsx(Bt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"ps-select",value:k,onChange:A=>T(A.target.value),children:f.map(A=>e.jsx("option",{value:A.id||A.ID,children:A.name||A.NAME},A.id||A.ID))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})]}),e.jsxs("div",{className:"profile-menu-wrap",ref:C,children:[e.jsx("button",{className:"profile-avatar-btn",onClick:()=>F(A=>!A),title:"Profile & settings",children:e.jsx(Na,{user:$,userId:t})}),W&&e.jsx(Ea,{currentUser:$,userId:t,users:n,onUserChange:s,onOpenProfile:()=>R(!0),onClose:()=>F(!1)})]})]}),H&&e.jsx(Ca,{userId:t,onClose:()=>R(!1)})]})}const Ia=De.memo(za);function Aa(t){const s=l.useRef(t);s.current=t,l.useEffect(()=>fe.getState().subscribeWsEvent(n=>s.current(n)),[])}function xs(){const t=xt();return t?{Authorization:`Bearer ${t}`}:{}}const Gs={get:{bg:"rgba(56,189,248,.13)",text:"#38bdf8",border:"rgba(56,189,248,.28)"},post:{bg:"rgba(74,222,128,.13)",text:"#4ade80",border:"rgba(74,222,128,.28)"},put:{bg:"rgba(251,191,36,.13)",text:"#fbbf24",border:"rgba(251,191,36,.28)"},delete:{bg:"rgba(252,129,129,.13)",text:"#fc8181",border:"rgba(252,129,129,.28)"},patch:{bg:"rgba(167,139,250,.13)",text:"#a78bfa",border:"rgba(167,139,250,.28)"}};function $a({method:t}){const s=Gs[t]||Gs.get;return e.jsx("span",{style:{background:s.bg,color:s.text,border:`1px solid ${s.border}`,borderRadius:3,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"var(--sans)",letterSpacing:".07em",textTransform:"uppercase",flexShrink:0,width:58,textAlign:"center",display:"inline-block"},children:t})}function fs(t,s=0){var n;if(!t||s>4)return null;if(t.example!==void 0)return t.example;if(t.type==="object"||t.properties){const r={};return Object.entries(t.properties||{}).forEach(([a,o])=>{r[a]=fs(o,s+1)}),r}return t.type==="array"?[fs(t.items,s+1)]:t.type==="string"?((n=t.enum)==null?void 0:n[0])??"":t.type==="boolean"?!1:t.type==="integer"||t.type==="number"?0:null}function Pa({method:t,path:s,operation:n,userId:r,projectSpaceId:a,basePath:o}){const[i,c]=l.useState(!1),[p,d]=l.useState({}),[x,f]=l.useState(""),[k,T]=l.useState(null),[P,$]=l.useState(!1),[u,y]=l.useState(r),[m,j]=l.useState(a||"");l.useEffect(()=>{y(r)},[r]),l.useEffect(()=>{j(a||"")},[a]);const h=n.parameters||[],S=["post","put","patch"].includes(t);l.useEffect(()=>{var R,L,C;if(!i||!S||x)return;const F=(L=(R=n.requestBody)==null?void 0:R.content)==null?void 0:L["application/json"];if(!F)return;let H=F.example??((C=F.schema)==null?void 0:C.example);H===void 0&&F.schema&&(H=fs(F.schema)),H!=null&&f(JSON.stringify(H,null,2))},[i,S,n,x]);async function W(){$(!0),T(null);let F=(o||"")+s;h.filter(C=>C.in==="path").forEach(C=>{F=F.replace(`{${C.name}}`,encodeURIComponent(p[C.name]??""))});const H=new URLSearchParams;h.filter(C=>C.in==="query").forEach(C=>{p[C.name]&&H.append(C.name,p[C.name])});const R=H.toString();R&&(F+="?"+R);const L={"Content-Type":"application/json",...xs()};m&&(L["X-PLM-ProjectSpace"]=m),h.filter(C=>C.in==="header").forEach(C=>{p[C.name]&&(L[C.name]=p[C.name])});try{const C=await fetch(F,{method:t.toUpperCase(),headers:L,body:S&&x.trim()?x:void 0}),E=await C.text();let U=E;try{U=JSON.stringify(JSON.parse(E),null,2)}catch{}T({status:C.status,ok:C.ok,body:U||"(empty)"})}catch(C){T({status:0,ok:!1,body:`Network error: ${C.message}`})}finally{$(!1)}}return e.jsxs("div",{className:`pg-row${i?" pg-row--open":""}`,children:[e.jsxs("div",{className:"pg-row-hd",onClick:()=>c(F=>!F),children:[e.jsx("span",{className:"pg-chevron",children:i?e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Fe,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx($a,{method:t}),e.jsx("code",{className:"pg-path",children:s}),n.summary&&e.jsx("span",{className:"pg-summary",children:n.summary})]}),i&&e.jsxs("div",{className:"pg-row-body",children:[e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Headers"}),e.jsxs("div",{className:"pg-header-grid",children:[e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-User"}),e.jsx("input",{className:"pg-input pg-header-input",value:u,onChange:F=>y(F.target.value),placeholder:"user-alice"})]}),e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-ProjectSpace"}),e.jsx("input",{className:"pg-input pg-header-input",value:m,onChange:F=>j(F.target.value),placeholder:"ps-default"})]})]})]}),h.length>0&&e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Parameters"}),e.jsx("div",{className:"pg-params-grid",children:h.map(F=>{var H,R;return e.jsxs("div",{className:"pg-param",children:[e.jsxs("div",{className:"pg-param-hd",children:[e.jsx("code",{className:"pg-param-name",children:F.name}),e.jsx("span",{className:"pg-param-in",children:F.in}),F.required&&e.jsx("span",{className:"pg-param-req",children:"req"}),F.description&&e.jsx("span",{className:"pg-param-desc",children:F.description})]}),e.jsx("input",{className:"pg-input",placeholder:String(((H=F.schema)==null?void 0:H.example)??((R=F.schema)==null?void 0:R.type)??""),value:p[F.name]??"",onChange:L=>d(C=>({...C,[F.name]:L.target.value}))})]},F.name)})})]}),S&&e.jsxs("div",{className:"pg-section",children:[e.jsxs("div",{className:"pg-section-label",children:["Body",e.jsx("span",{className:"pg-section-sub",children:"application/json"})]}),e.jsx("textarea",{className:"pg-body-editor",value:x,onChange:F=>f(F.target.value),rows:5,spellCheck:!1,placeholder:"{}"})]}),e.jsxs("div",{className:"pg-exec-bar",children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:W,disabled:P,style:{minWidth:90},children:P?"Sending…":"▶ Execute"}),e.jsxs("span",{className:"pg-exec-meta",children:["as ",e.jsx("strong",{children:r})]}),k&&e.jsx("button",{className:"btn btn-xs",style:{marginLeft:"auto"},onClick:()=>T(null),children:"Clear"})]}),k&&e.jsxs("div",{className:"pg-response",children:[e.jsxs("div",{className:"pg-response-hd",children:[e.jsx("span",{className:"pg-status",style:{background:k.ok?"rgba(77,212,160,.15)":"rgba(252,129,129,.15)",color:k.ok?"var(--success)":"var(--danger)",border:`1px solid ${k.ok?"rgba(77,212,160,.3)":"rgba(252,129,129,.3)"}`},children:k.status||"ERR"}),e.jsx("span",{className:"pg-response-label",children:k.ok?"OK":"Error"})]}),e.jsx("pre",{className:"pg-response-body",children:k.body})]})]})]})}function Ra(t){return t?t.endsWith("/")?t.slice(0,-1):t:""}function La({userId:t,projectSpaceId:s}){var R,L;const[n,r]=l.useState([]),[a,o]=l.useState(null),[i,c]=l.useState(null),[p,d]=l.useState(!0),[x,f]=l.useState(null),[k,T]=l.useState(""),[P,$]=l.useState({}),u=l.useMemo(()=>n.find(C=>C.serviceCode===a)||null,[n,a]),y=Ra(u==null?void 0:u.path),m=l.useCallback(()=>{d(!0),f(null),fetch("/api/platform/status",{headers:xs(),cache:"no-store"}).then(C=>{if(!C.ok)throw new Error(`HTTP ${C.status} on /api/platform/status`);return C.json()}).then(C=>{const E=(C.services||[]).filter(U=>U.registered&&U.path&&U.serviceCode!=="spe"&&U.serviceCode!=="ws").sort((U,q)=>U.serviceCode.localeCompare(q.serviceCode));r(E),E.length===0?(o(null),d(!1),f("No services registered — start backend services first.")):o(U=>E.some(q=>q.serviceCode===U)?U:E[0].serviceCode)}).catch(C=>{f(C.message),d(!1)})},[]),j=l.useCallback(()=>{y&&(d(!0),f(null),c(null),fetch(`${y}/v3/api-docs`,{headers:xs(),cache:"no-store"}).then(async C=>{if(!C.ok){const U=await C.text().catch(()=>"");throw new Error(`HTTP ${C.status}${U?" — "+U.slice(0,200):""}`)}const E=C.headers.get("content-type")||"";if(!E.includes("json"))throw new Error(`Expected JSON spec, got ${E||"unknown"}.`);return C.json()}).then(C=>{c(C),d(!1)}).catch(C=>{f(C.message),d(!1)}))},[y]);l.useEffect(()=>{m()},[m]),l.useEffect(()=>{j()},[j]),l.useEffect(()=>{T(""),$({})},[a]);const h=l.useMemo(()=>{if(!(i!=null&&i.paths))return[];const C={};Object.entries(i.paths).forEach(([U,q])=>{Object.entries(q).forEach(([w,A])=>{var B;if(!["get","post","put","delete","patch"].includes(w))return;const g=((B=A.tags)==null?void 0:B[0])??"default";C[g]||(C[g]=[]),C[g].push({method:w,path:U,operation:A})})});const E=["get","post","put","patch","delete"];return Object.entries(C).sort(([U],[q])=>U.localeCompare(q)).map(([U,q])=>[U,[...q].sort((w,A)=>E.indexOf(w.method)-E.indexOf(A.method))])},[i]),S=l.useMemo(()=>{const C=k.trim().toLowerCase();return C?h.map(([E,U])=>[E,U.filter(({method:q,path:w,operation:A})=>q.includes(C)||w.toLowerCase().includes(C)||(A.summary||"").toLowerCase().includes(C)||E.toLowerCase().includes(C))]).filter(([,E])=>E.length>0):h},[h,k]);function W(C){$(E=>({...E,[C]:!E[C]}))}const F=i?Object.keys(i.paths||{}).length:0,H=e.jsx("select",{className:"pg-service-select",value:a||"",onChange:C=>o(C.target.value),disabled:n.length===0,style:{background:"var(--bg-elev-1)",color:"var(--fg)",border:"1px solid var(--border)",borderRadius:4,padding:"4px 8px",fontSize:12,fontFamily:"var(--mono)",minWidth:160},children:n.map(C=>e.jsxs("option",{value:C.serviceCode,children:[C.serviceCode,"  (",C.path,")"]},C.serviceCode))});return p&&!i?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[H,e.jsx("span",{className:"pg-topbar-meta",children:"loading…"}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:m,title:"Reload services",children:"⟳"})]}),e.jsx("div",{className:"settings-loading",children:"Fetching OpenAPI spec…"})]}):x?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[H,e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:m,title:"Reload services",children:"⟳"})]}),e.jsxs("div",{style:{padding:24,display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("span",{style:{fontSize:12,color:"var(--danger)"},children:["✗ ",x]}),e.jsx("button",{className:"btn btn-sm",style:{alignSelf:"flex-start"},onClick:j,children:"Retry"})]})]}):e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[H,e.jsx("span",{className:"pg-topbar-title",children:(R=i==null?void 0:i.info)==null?void 0:R.title}),e.jsxs("span",{className:"pg-topbar-ver",children:["v",(L=i==null?void 0:i.info)==null?void 0:L.version]}),e.jsxs("span",{className:"pg-topbar-meta",children:[F," paths"]}),e.jsxs("span",{className:"pg-topbar-user",children:["as ",e.jsx("strong",{children:t}),s&&e.jsxs("span",{style:{marginLeft:8,color:"var(--accent)",opacity:.75},children:["· ",s]})]}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:j,title:"Reload spec",children:"⟳ Reload"})]}),e.jsxs("div",{className:"pg-filter",children:[e.jsx("input",{className:"pg-filter-input",placeholder:"Filter endpoints…",value:k,onChange:C=>T(C.target.value)}),k&&e.jsx("button",{className:"btn btn-xs",onClick:()=>T(""),children:"Clear"})]}),e.jsxs("div",{className:"pg-list",children:[S.length===0&&e.jsxs("div",{style:{padding:"32px 20px",fontSize:12,color:"var(--muted2)",fontStyle:"italic"},children:["No endpoints match “",k,"”"]}),S.map(([C,E])=>{const U=!!P[C];return e.jsxs("div",{className:"pg-group",children:[e.jsxs("div",{className:"pg-group-hd",onClick:()=>W(C),children:[e.jsx("span",{className:"pg-chevron",children:U?e.jsx(Fe,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx("span",{className:"pg-group-name",children:C}),e.jsx("span",{className:"pg-group-count",children:E.length})]}),!U&&E.map(({method:q,path:w,operation:A})=>e.jsx(Pa,{method:q,path:w,operation:A,userId:t,projectSpaceId:s,basePath:y},`${q}:${w}`))]},C)})]})]})}function Tt({id:t,children:s}){return e.jsx("h2",{id:t,style:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 10px",paddingTop:4,borderBottom:"1px solid var(--border)",paddingBottom:8},children:s})}function Le({children:t}){return e.jsx("h3",{style:{fontSize:13,fontWeight:600,color:"var(--accent)",margin:"20px 0 6px",textTransform:"uppercase",letterSpacing:".06em"},children:t})}function Te({children:t}){return e.jsx("p",{style:{margin:"0 0 10px",fontSize:13,lineHeight:1.65,color:"var(--text)"},children:t})}function ye({children:t}){return e.jsx("code",{style:{fontFamily:"var(--mono)",fontSize:11,background:"rgba(100,116,139,.15)",border:"1px solid rgba(100,116,139,.2)",borderRadius:3,padding:"1px 5px",color:"var(--accent)"},children:t})}function Wt({children:t}){return e.jsxs("div",{style:{background:"rgba(232,169,71,.08)",border:"1px solid rgba(232,169,71,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"#e8a947"},children:"Note: "}),t]})}function ns({children:t}){return e.jsxs("div",{style:{background:"rgba(91,156,246,.08)",border:"1px solid rgba(91,156,246,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"var(--accent)"},children:"Tip: "}),t]})}function pe({name:t,type:s,children:n}){return e.jsxs("div",{style:{marginBottom:10},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:8,marginBottom:3},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13,color:"var(--text)"},children:t}),s&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",textTransform:"uppercase"},children:s})]}),e.jsx("div",{style:{fontSize:12,lineHeight:1.6,color:"var(--muted)",paddingLeft:10,borderLeft:"2px solid var(--border)"},children:n})]})}function Ze({rows:t}){return e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:10},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:600,width:"30%"},children:"Value"}),e.jsx("th",{style:{textAlign:"left",padding:"4px 0",color:"var(--muted)",fontWeight:600},children:"Meaning"})]})}),e.jsx("tbody",{children:t.map(([s,n])=>e.jsxs("tr",{style:{borderBottom:"1px solid rgba(100,116,139,.08)"},children:[e.jsx("td",{style:{padding:"5px 8px 5px 0",verticalAlign:"top"},children:e.jsx(ye,{children:s})}),e.jsx("td",{style:{padding:"5px 0",verticalAlign:"top",color:"var(--text)",lineHeight:1.55},children:n})]},s))})]})}function Ft(){return e.jsx("hr",{style:{border:"none",borderTop:"1px solid var(--border)",margin:"28px 0"}})}const Ba=[{id:"node-types",label:"Node Types"},{id:"lifecycles",label:"Lifecycles"},{id:"proj-spaces",label:"Project Spaces"},{id:"users-roles",label:"Users & Roles"},{id:"access-rights",label:"Access Rights"}];function Da(){const[t,s]=l.useState("node-types"),n=l.useRef(null);function r(a){s(a);const o=document.getElementById("manual-"+a);o&&n.current&&n.current.scrollTo({top:o.offsetTop-16,behavior:"smooth"})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[e.jsxs("div",{style:{width:160,flexShrink:0,borderRight:"1px solid var(--border)",padding:"16px 0",overflowY:"auto"},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",padding:"0 14px 10px"},children:"Contents"}),Ba.map(({id:a,label:o})=>e.jsx("div",{onClick:()=>r(a),style:{padding:"6px 14px",fontSize:12,cursor:"pointer",color:t===a?"var(--accent)":"var(--muted)",background:t===a?"rgba(91,156,246,.08)":"transparent",borderLeft:t===a?"2px solid var(--accent)":"2px solid transparent",transition:"all .15s"},children:o},a))]}),e.jsxs("div",{ref:n,style:{flex:1,overflowY:"auto",padding:"20px 28px 40px"},children:[e.jsxs("div",{id:"manual-node-types",children:[e.jsx(Tt,{id:"node-types",children:"Node Types"}),e.jsxs(Te,{children:["A ",e.jsx("strong",{children:"Node Type"})," is the blueprint for any object you create in the product structure — a component, an assembly, a document, a requirement, etc. Every node belongs to exactly one type and inherits that type's attributes, lifecycle, versioning rules, and link constraints."]}),e.jsx(Le,{children:"Identity"}),e.jsxs(Te,{children:["Each node can carry a human-readable ",e.jsx("em",{children:"logical identifier"})," (separate from its internal UUID). The identity settings control how that identifier is displayed and validated."]}),e.jsx(pe,{name:"Label",type:"text",children:'The display label used in the UI for the identifier field (e.g. "Part Number", "Doc ID"). Defaults to "Identifier".'}),e.jsxs(pe,{name:"Validation Pattern",type:"regex",children:["An optional regular expression that the logical ID must match. If blank, any value is accepted. Example: ",e.jsx(ye,{children:"^[A-Z]{2}-\\d{4}$"})," enforces two uppercase letters, a dash, and four digits."]}),e.jsx(Le,{children:"Lifecycle"}),e.jsx(Te,{children:"Assign a lifecycle to the node type to enable state-based workflows (Draft → Review → Frozen → Released). Nodes without a lifecycle remain in their initial state and cannot be transitioned."}),e.jsx(pe,{name:"Lifecycle",type:"select",children:'The lifecycle that governs nodes of this type. Setting it to "None" disables lifecycle management for this node type.'}),e.jsx(Le,{children:"Versioning"}),e.jsxs(Te,{children:["Versioning settings control how the visible version identifier (",e.jsx(ye,{children:"revision.iteration"}),", e.g. ",e.jsx(ye,{children:"A.3"}),") advances when a node is checked out or released."]}),e.jsxs(pe,{name:"Numbering Scheme",type:"select",children:["Determines the alphabet used for revision letters.",e.jsx(Ze,{rows:[["ALPHA_NUMERIC","Revisions advance A → B → … → Z → AA → AB … Standard PLM convention."]]})]}),e.jsxs(pe,{name:"Version Policy",type:"select",children:["Controls what happens to the version number when a user checks out a node.",e.jsx(Ze,{rows:[["NONE","Checkout creates a new technical version for traceability but does not advance the visible revision.iteration. Use for types where every save is tracked internally but the displayed identifier must stay stable."],["ITERATE","Checkout increments the iteration: A.1 → A.2. Use for normal work-in-progress types where each save is a new draft of the same revision."],["RELEASE","Checkout starts a new revision and resets iteration to 1: A.3 → B.1. Use for types that follow a formal release cycle where a new revision means a significant change."]]})]}),e.jsxs(pe,{name:"Collapse history on release",type:"checkbox",children:["When enabled, the intermediate working iterations are purged from history each time a node enters a ",e.jsx("strong",{children:"Released"})," state.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"What happens:"}),e.jsxs("ul",{style:{margin:"6px 0 0 16px",paddingLeft:0,listStyleType:"disc",fontSize:12,lineHeight:1.7},children:[e.jsxs("li",{children:["All working iterations of the previous revision are deleted (",e.jsx(ye,{children:"A.1"}),", ",e.jsx(ye,{children:"A.2"}),", ",e.jsx(ye,{children:"A.3"})," — all gone)."]}),e.jsxs("li",{children:["The new Released version has its iteration stripped and displays as the bare revision letter (e.g. ",e.jsx(ye,{children:"B.1"})," → ",e.jsx(ye,{children:"B"}),")."]}),e.jsx("li",{children:"Versions that are pinned in a baseline or referenced by a VERSION_TO_VERSION link are never deleted."})]}),e.jsx("br",{}),e.jsx("strong",{children:"Result:"})," version history reads ",e.jsx(ye,{children:"B"}),", ",e.jsx(ye,{children:"C"}),", ",e.jsx(ye,{children:"D"})," (one entry per release) instead of ",e.jsx(ye,{children:"A.1"}),", ",e.jsx(ye,{children:"A.2"}),", ",e.jsx(ye,{children:"A.3"}),", ",e.jsx(ye,{children:"B.1"}),", …",e.jsxs(Wt,{children:["Only applies to node types whose lifecycle has a Released state (",e.jsx(ye,{children:"isReleased = true"}),")."]})]}),e.jsx(Le,{children:"Attributes"}),e.jsx(Te,{children:"Attributes are the structured data fields attached to every version of a node of this type (title, description, material, weight, etc.). Each attribute is independently configurable."}),e.jsxs(pe,{name:"Name (internal key)",type:"text",children:["The machine-readable key stored in the database. Must be unique within the node type. Cannot be changed after creation. Use camelCase or snake_case (e.g. ",e.jsx(ye,{children:"reviewNote"}),", ",e.jsx(ye,{children:"material_grade"}),")."]}),e.jsx(pe,{name:"Label (display)",type:"text",children:'The human-readable label shown in forms and tables (e.g. "Review Note", "Material Grade").'}),e.jsxs(pe,{name:"Data Type",type:"select",children:["The underlying data type for validation and storage.",e.jsx(Ze,{rows:[["STRING","Free text."],["NUMBER","Numeric value (integer or decimal)."],["DATE","ISO date value."],["BOOLEAN","True / False toggle."],["ENUM","One value from a predefined list (configure the list separately)."]]})]}),e.jsxs(pe,{name:"Widget",type:"select",children:["The UI control rendered in the editor for this attribute.",e.jsx(Ze,{rows:[["TEXT","Single-line text input."],["TEXTAREA","Multi-line text area."],["DROPDOWN","Dropdown selector (required for ENUM type)."],["DATE_PICKER","Calendar date picker (recommended for DATE type)."],["CHECKBOX","Toggle checkbox (recommended for BOOLEAN type)."]]})]}),e.jsx(pe,{name:"Section",type:"text",children:'Groups this attribute under a named panel in the editor (e.g. "Mechanical", "Review"). Attributes with no section appear in the default group.'}),e.jsx(pe,{name:"Order",type:"number",children:"Display order within the section. Lower numbers appear first."}),e.jsx(pe,{name:"Required field",type:"checkbox",children:"When checked, this attribute must be filled before a node can advance past states configured as requiring it (via Attribute State Rules). Does not block saving; only blocks lifecycle transitions where the rule is active."}),e.jsx(pe,{name:"Use as display name ★",type:"checkbox",children:"Marks this attribute as the human-readable title of the node. Its value appears in node lists, search results, and link pickers. Only one attribute per node type can be the display name."}),e.jsx(Le,{children:"Link Types (Outgoing)"}),e.jsx(Te,{children:"A link type defines an allowed relationship from this node type to another. Links are version-aware and carry a versioning policy."}),e.jsxs(pe,{name:"Link Name",type:"text",children:["Internal name for the relationship (e.g. ",e.jsx(ye,{children:"composed_of"}),", ",e.jsx(ye,{children:"references"}),")."]}),e.jsx(pe,{name:"Target Node Type",type:"select",children:"The node type that can appear on the other end of this link."}),e.jsxs(pe,{name:"Link Policy",type:"select",children:["Controls how the link resolves over time.",e.jsx(Ze,{rows:[["VERSION_TO_MASTER","The link always points to the latest committed version of the target. When the target is updated and committed, all parents automatically see the new version. Use for live BOM structures. Requires the parent to be locked (checked out) when the target is modified."],["VERSION_TO_VERSION","The link is frozen to the exact target version at the time the link was created. The parent always sees the same snapshot of the child regardless of future changes. Use for reference documentation or frozen configurations."]]})]}),e.jsxs(pe,{name:"Min Cardinality",type:"number",children:["Minimum number of links of this type required per node version. ",e.jsx(ye,{children:"0"})," means the link is optional."]}),e.jsx(pe,{name:"Max (blank = unlimited)",type:"number",children:"Maximum number of links allowed. Leave blank for no upper limit."}),e.jsx(pe,{name:"Color",type:"color",children:"Visual color used to draw this link in the graph view."}),e.jsx(ns,{children:'After creating a link type you can add attributes to it (e.g. "quantity", "reference designator") via the Edit link type panel. You can also define cascade rules that automatically propagate lifecycle transitions through the link.'})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-lifecycles",children:[e.jsx(Tt,{id:"lifecycles",children:"Lifecycles"}),e.jsxs(Te,{children:["A ",e.jsx("strong",{children:"Lifecycle"})," defines the states an object can be in and the valid transitions between them. It encodes the approval and release workflow for a node type."]}),e.jsx(Le,{children:"Lifecycle Properties"}),e.jsx(pe,{name:"Name",type:"text",children:"Name displayed in the UI and referenced by node types."}),e.jsx(pe,{name:"Description",type:"text",children:"Optional free-text explanation of the lifecycle's purpose."}),e.jsx(Le,{children:"States"}),e.jsx(Te,{children:"States represent stages in the lifecycle (e.g. Draft, In Review, Frozen, Released). Every node version has exactly one current state."}),e.jsx(pe,{name:"State Name",type:"text",children:'Display label for the state. Short, descriptive names work best (e.g. "Draft", "Frozen").'}),e.jsx(pe,{name:"Display Order",type:"number",children:"Order in which states appear in dropdowns and diagrams. Lower = earlier in the flow."}),e.jsx(pe,{name:"Color",type:"color",children:"Color used to represent this state in the UI (state pills, timeline dots). Pick a color that intuitively maps to the state's meaning — green for released, yellow for in-review, grey for draft."}),e.jsx(pe,{name:"isInitial",type:"tag",children:"Marks this as the entry state. Every newly created node starts here. Only one state per lifecycle can be initial."}),e.jsx(pe,{name:"isFrozen",type:"tag",children:"A frozen state locks the node's content. When a node enters a frozen state, the lock cascades to all children connected via VERSION_TO_MASTER links — they cannot be independently modified until the parent is unfrozen. Required before a baseline can be taken."}),e.jsxs(pe,{name:"isReleased",type:"tag",children:["Marks the state as a release milestone. Reaching this state is what triggers the ",e.jsx("em",{children:"Collapse history"})," feature (if enabled on the node type). Typically only one state per lifecycle is released."]}),e.jsx(Le,{children:"Transitions"}),e.jsx(Te,{children:"Transitions define which state changes are allowed and under what conditions. A transition always goes from one specific state to another."}),e.jsx(pe,{name:"Transition Name",type:"text",children:'Label shown on the action button that triggers this transition (e.g. "Freeze", "Release", "Reject"). Keep it short and verb-form.'}),e.jsx(pe,{name:"From State / To State",type:"select",children:"The source and target states for this transition. A node must be in the From State for the transition to appear."}),e.jsxs(pe,{name:"Guard Expression",type:"text",children:["An optional server-side condition that must be satisfied before the transition is allowed. If the guard fails, the transition button is blocked and an error is shown.",e.jsx(Ze,{rows:[["all_required_filled","All attributes marked Required must have a non-empty value in the current version."],["all_signatures_done","All signature requirements for this transition must have been fulfilled."],["(blank)","No guard — the transition is always allowed when the node is in the From State."]]})]}),e.jsxs(pe,{name:"Action Type",type:"select",children:["A server-side action executed as part of this transition.",e.jsx(Ze,{rows:[["NONE","No action — the transition simply changes the state."],["REQUIRE_SIGNATURE","Collects an electronic signature from the current user as part of the transition. The signature is stored permanently against the version."]]})]}),e.jsxs(pe,{name:"Version Strategy",type:"select",children:["Controls how the version number changes when this transition is triggered.",e.jsx(Ze,{rows:[["NONE","Creates a new technical version (for audit trail) but keeps the same revision.iteration visible to users. Used for state changes that are purely administrative."],["ITERATE","Increments the iteration (A.2 → A.3). Unusual for a lifecycle transition; more common for checkouts."],["REVISE","Starts a new revision and resets iteration to 1 (A.3 → B.1). Typically used on the Release transition to mark a new formal revision of the product."]]})]}),e.jsx(Le,{children:"Cascade Rules"}),e.jsx(Te,{children:"Cascade rules automate lifecycle propagation through links. When a parent node undergoes a transition, eligible child nodes are automatically transitioned as well — without manual action."}),e.jsx(Te,{children:"Rules are configured inside the link type: you specify which parent transition triggers which child transition, and from which child state. Children not in the expected state are silently skipped (they are already beyond or not yet at that stage)."}),e.jsx(Wt,{children:"Cascade is only applied through VERSION_TO_MASTER links. VERSION_TO_VERSION links point to frozen snapshots and are never cascaded."})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-proj-spaces",children:[e.jsx(Tt,{id:"proj-spaces",children:"Project Spaces"}),e.jsxs(Te,{children:["A ",e.jsx("strong",{children:"Project Space"})," is an organisational container that groups nodes and controls access. Every node creation request must specify a project space. Access rights (which roles can do what) are configured per project space."]}),e.jsx(Te,{children:'Think of a project space as a "workspace" or "programme" — you might have one per product line, customer project, or development phase.'}),e.jsx(pe,{name:"Name",type:"text",children:'Short, unique name for the space (e.g. "Prototype-2026", "Certification-A320"). Shown in the project space selector at the top of the application.'}),e.jsx(pe,{name:"Description",type:"text",children:"Optional free-text explaining the purpose or scope of this project space."}),e.jsx(Wt,{children:"Deleting a project space does not delete the nodes inside it — it removes only the space record. Nodes retain their project_space_id as a plain reference."})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-users-roles",children:[e.jsx(Tt,{id:"users-roles",children:"Users & Roles"}),e.jsx(Le,{children:"Roles"}),e.jsxs(Te,{children:["A ",e.jsx("strong",{children:"Role"})," is a named group of permissions (e.g. DESIGNER, REVIEWER, READER). Users are assigned roles within a project space. The role determines what actions the user can perform on which node types."]}),e.jsxs(pe,{name:"Name",type:"text",children:["Internal name for the role. By convention use UPPER_CASE (e.g. ",e.jsx(ye,{children:"DESIGNER"}),"). This name is referenced in permission rules and signature requirements."]}),e.jsx(pe,{name:"Description",type:"textarea",children:'Human-readable explanation of who should hold this role (e.g. "Engineers who create and modify parts").'}),e.jsx(ns,{children:"Create roles that map to real job functions, not individual people. A user can hold multiple roles — combine them to grant additive permissions."}),e.jsx(Le,{children:"Users"}),e.jsxs(Te,{children:["Users are the people who log in to the system. Each user is identified by a username (sent in the ",e.jsx(ye,{children:"X-PLM-User"})," HTTP header). Users are created here and then assigned roles in specific project spaces."]}),e.jsxs(pe,{name:"Username",type:"text",children:["Unique login identifier (e.g. ",e.jsx(ye,{children:"john.doe"}),"). This is the value placed in the ",e.jsx(ye,{children:"X-PLM-User"})," header. Cannot be changed after creation."]}),e.jsx(pe,{name:"Display Name",type:"text",children:'Full human-readable name shown in the UI (e.g. "John Doe").'}),e.jsx(pe,{name:"Email",type:"email",children:"Contact email address. Stored for reference; not used for authentication in the current setup."}),e.jsx(pe,{name:"Admin status",type:"select",children:e.jsx(Ze,{rows:[["User","Standard user — access governed entirely by role assignments."],["Admin","System administrator — bypasses all permission checks and can perform any action in any project space. Use sparingly."]]})}),e.jsx(Le,{children:"Role Assignments"}),e.jsxs(Te,{children:["A role assignment connects a ",e.jsx("strong",{children:"user"}),", a ",e.jsx("strong",{children:"role"}),", and a ",e.jsx("strong",{children:"project space"}),". The user gains all permissions granted to that role within that specific project space."]}),e.jsx(Te,{children:"A user can hold multiple role assignments — for example, DESIGNER in Project-A and READER in Project-B, or DESIGNER + REVIEWER in the same project space (permissions are additive)."})]}),e.jsx(Ft,{}),e.jsxs("div",{id:"manual-access-rights",children:[e.jsx(Tt,{id:"access-rights",children:"Access Rights"}),e.jsxs(Te,{children:["Access Rights define what each role is allowed to do. The system uses two levels of permissions: ",e.jsx("strong",{children:"global actions"})," and ",e.jsx("strong",{children:"node-type/project-space actions"}),"."]}),e.jsx(Le,{children:"Global Permissions"}),e.jsx(Te,{children:"Global permissions control system-wide administrative capabilities, independent of any project space or node type."}),e.jsx(Wt,{children:'"Zero grants = action open to all roles." — If no role has been granted a global permission, the action is unrestricted. As soon as any role is granted a permission, only that role (and admins) can perform it.'}),e.jsx(Ze,{rows:[["MANAGE_METAMODEL","Create and edit node types, lifecycles, attributes, link types, and cascade rules."],["MANAGE_ROLES","Create and edit roles, users, project spaces, and role assignments."],["CREATE_NODE","Create new nodes (top-level action, independently of node type)."]]}),e.jsx(Le,{children:"Node Type × Project Space Permission Matrix"}),e.jsx(Te,{children:"The matrix table shows all combinations of node types (rows) and actions (columns) for a given project space. Toggle the circle icon in any cell to grant or revoke that permission for the current role."}),e.jsx(Te,{children:e.jsx("strong",{children:"Action column types:"})}),e.jsx(pe,{name:"NODE scope actions",type:"column",children:"Standard CRUD and workflow actions that apply to nodes of that type (e.g. checkout, checkin, create link, delete)."}),e.jsxs(pe,{name:"LIFECYCLE scope actions",type:"column",children:['Columns labelled "',e.jsx("em",{children:"From State → Transition Name"}),'" represent individual lifecycle transitions. Granting this permission allows the role to fire that specific transition on nodes of that type within this project space.']}),e.jsx(Le,{children:"How Permissions Stack"}),e.jsx(Te,{children:"Permissions are evaluated in this order. Each layer can only restrict, never expand, what the higher layer allowed:"}),e.jsxs("ol",{style:{margin:"0 0 12px 18px",paddingLeft:0,fontSize:13,lineHeight:2,color:"var(--text)"},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute State Rules"})," — declares which attributes are editable, visible, or required based on the lifecycle state."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute Views"})," — can further restrict (never widen) attribute visibility/editability for a specific role × state combination."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Node Type Permission ",e.jsx(ye,{children:"can_write"})]})," — if false for the role, the entire node type becomes read-only regardless of other rules."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Transition Permission"})," — filters the list of lifecycle transitions available to the role."]})]}),e.jsx(ns,{children:"Start with broad node-type permissions and use attribute views to fine-tune field-level access by role. Only add transition restrictions when you need formal approval gates."})]})]})]})}const Oa="#5b9cf6";function Hs(t){return(t==null?void 0:t.color)||(t==null?void 0:t.COLOR)||Oa}const yt=110,jt=36,rs=72,Ut=28,as=46,os=32,ot=10,zt=16,Vs=8,Gt=4;function Ma({lifecycleId:t,currentStateId:s,userId:n,onTransition:r,availableTransitionNames:a,transitionGuardViolations:o,previewMode:i}){const[c,p]=l.useState([]),[d,x]=l.useState([]),[f,k]=l.useState(!1),[T,P]=l.useState(null);if(l.useEffect(()=>{!t||!n||(k(!0),Promise.all([X.getLifecycleStates(n,t).catch(()=>[]),X.getLifecycleTransitions(n,t).catch(()=>[])]).then(([v,b])=>{p(Array.isArray(v)?v:[]),x(Array.isArray(b)?b:[])}).finally(()=>k(!1)))},[t,n]),f)return e.jsx("div",{className:"lc-empty",children:"Loading diagram…"});if(!t)return e.jsx("div",{className:"lc-empty",children:"No lifecycle associated with this object type."});if(!c.length)return e.jsx("div",{className:"lc-empty",children:"No lifecycle states defined."});const $=[...c].sort((v,b)=>(v.display_order??v.DISPLAY_ORDER??0)-(b.display_order??b.DISPLAY_ORDER??0)),u={};$.forEach((v,b)=>{u[v.id||v.ID]=b});const y={};$.forEach((v,b)=>{y[v.id||v.ID]=Ut+b*(yt+rs)+yt/2});const m=d.map((v,b)=>{const M=v.from_state_id||v.FROM_STATE_ID,N=v.to_state_id||v.TO_STATE_ID,D=u[M]??0,O=u[N]??0,G=O-D;return{...v,fromId:M,toId:N,fromIdx:D,toIdx:O,span:G,i:b}}).filter(v=>y[v.fromId]&&y[v.toId]&&v.span!==0),j=yt*.6,h=new Map,S=(v,b,M,N,D)=>{const O=`${v}::${b}`;h.has(O)||h.set(O,[]),h.get(O).push({tIdx:M,role:N,otherIdx:D})};for(const v of m){const b=v.span>0?"top":"bot";S(v.fromId,b,v.i,"from",v.toIdx),S(v.toId,b,v.i,"to",v.fromIdx)}const W=new Map(m.map(v=>[v.i,{x1:y[v.fromId],x2:y[v.toId]}]));for(const[v,b]of h){if(b.length<=1)continue;const M=v.indexOf("::"),N=v.slice(0,M),D=v.slice(M+2),O=u[N],G=y[N],z=V=>Math.abs(V.otherIdx-O),_=b.filter(V=>V.role==="to"),K=b.filter(V=>V.role==="from");let ee;D==="top"?(_.sort((V,Q)=>z(V)-z(Q)),K.sort((V,Q)=>z(Q)-z(V)),ee=[..._,...K]):(K.sort((V,Q)=>z(V)-z(Q)),_.sort((V,Q)=>z(Q)-z(V)),ee=[...K,..._]);const re=ee.length,de=G-j/2,je=j/(re-1);ee.forEach(({tIdx:V,role:Q},ie)=>{const Z=de+ie*je,ne=W.get(V);Q==="from"?ne.x1=Z:ne.x2=Z})}const F=m.filter(v=>v.span>0),H=m.filter(v=>v.span<0),R=F.length?Math.max(...F.map(v=>v.span)):0,L=H.length?Math.max(...H.map(v=>-v.span)):0,C=R>0?as+(R-1)*os+zt+16:20,E=L>0?as+(L-1)*os+zt+28:30,U=Ut+C+jt/2,q=Ut*2+$.length*(yt+rs)-rs,w=U+jt/2+E+Ut,A=U-jt/2,g=U+jt/2,B=v=>{const{fromId:b,span:M,i:N}=v,D=v.name||v.NAME||"",O=M>0,G=Math.abs(M),z=as+(G-1)*os,{x1:_,x2:K}=W.get(N),ee=O?A:g,re=O?ee-z:ee+z,de=(_+K)/2,je=!i&&b===s,V=(o==null?void 0:o.get(D))??[],Q=V.length>0,ie=Q||je&&a!=null&&!a.has(D),Z=ie?`✕ ${D}`:D,ne=Z?Math.max(44,Z.length*6+18)/2:0;let ue,he;O?(ue=[`M ${_},${ee}`,`V ${re+ot}`,`Q ${_},${re} ${_+ot},${re}`,`H ${de-ne-Gt}`].join(" "),he=[`M ${de+ne+Gt},${re}`,`H ${K-ot}`,`Q ${K},${re} ${K},${re+ot}`,`V ${ee}`].join(" ")):(ue=[`M ${_},${ee}`,`V ${re-ot}`,`Q ${_},${re} ${_-ot},${re}`,`H ${de+ne+Gt}`].join(" "),he=[`M ${de-ne-Gt},${re}`,`H ${K+ot}`,`Q ${K},${re} ${K},${re-ot}`,`V ${ee}`].join(" "));const le=je,se=ie,me=le&&!se,we=me&&T===N,Se=me&&!!r&&!i,Ce=i||le,Ie=$.find(st=>(st.id||st.ID)===v.toId),ke=se?"#dc2626":Hs(Ie)||(O?"#5b9cf6":"#e8a947"),$e=ke,qe=Ce?.7:.3,bt=Ce?1.5:1,Je=ne*2,Xe=de-ne,vt=re-zt/2;let Ue,Ye,_e;return se?(Ue="#1c0808",Ye="#7f1d1d",_e="var(--danger)"):me||i?we?(Ue=ke,Ye=ke,_e="#ffffff"):(Ue=`${ke}18`,Ye=`${ke}70`,_e=ke):(Ue="var(--surface2)",Ye="var(--border2)",_e="var(--muted2)"),e.jsxs("g",{children:[e.jsx("path",{d:ue,fill:"none",style:{stroke:Ce?$e:"var(--border2)"},strokeWidth:bt,strokeDasharray:O?"none":"4,3",opacity:qe}),e.jsx("path",{d:he,fill:"none",style:{stroke:Ce?$e:"var(--border2)"},strokeWidth:bt,strokeDasharray:O?"none":"4,3",opacity:qe,markerEnd:"url(#arr)"}),Z&&e.jsxs("g",{style:{cursor:Se?"pointer":"default"},onMouseEnter:me?()=>P(N):void 0,onMouseLeave:me?()=>P(null):void 0,onClick:Se?()=>r(v):void 0,children:[Q&&e.jsx("title",{children:`Blocked:
• `+V.map(st=>typeof st=="string"?st:st.message||st.guardCode).join(`
• `)}),e.jsx("rect",{x:Xe-4,y:vt-4,width:Je+8,height:zt+8,rx:Vs+4,fill:"transparent"}),e.jsx("rect",{x:Xe,y:vt,width:Je,height:zt,rx:Vs,style:{fill:Ue,stroke:Ye},strokeWidth:le?1:.5}),e.jsx("text",{x:de,y:re+5,textAnchor:"middle",fontSize:"9",fontFamily:"var(--sans)",fontWeight:"700",style:{fill:_e,userSelect:"none",pointerEvents:"none"},children:Z})]})]},`t-${N}`)};return e.jsx("div",{className:"lc-diagram",children:e.jsxs("svg",{width:q,height:w,viewBox:`0 0 ${q} ${w}`,style:{fontFamily:"var(--mono)",overflow:"visible"},children:[e.jsxs("defs",{children:[e.jsx("marker",{id:"arr",markerWidth:"7",markerHeight:"7",refX:"5",refY:"3.5",orient:"auto",children:e.jsx("path",{d:"M0,0.5 L0,6.5 L6,3.5 z",fill:"context-stroke",opacity:"0.7"})}),e.jsxs("filter",{id:"glow",children:[e.jsx("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),H.map(B),F.map(B),$.map(v=>{const b=v.id||v.ID,M=v.name||v.NAME||b,N=v.is_frozen===1||v.IS_FROZEN===1,D=v.is_released===1||v.IS_RELEASED===1,G=[v.is_initial===1||v.IS_INITIAL===1?"INIT":null,N?"FROZEN":null,D?"REL":null].filter(Boolean).join(" · "),z=y[b],_=z-yt/2,K=U-jt/2,ee=i||b===s;let re,de,je;if(ee){const V=Hs(v);re=`${V}22`,de=V,je=V}else re="var(--surface2)",de="var(--border2)",je="var(--muted)";return e.jsxs("g",{filter:ee?"url(#glow)":void 0,children:[e.jsx("rect",{x:_,y:K,width:yt,height:jt,rx:6,style:{fill:re,stroke:de},strokeWidth:ee?1.5:1}),e.jsx("text",{x:z,y:U+(G?1:4),textAnchor:"middle",fontSize:"11",fontFamily:"var(--sans)",fontWeight:ee?"700":"600",style:{fill:je},children:M}),G&&e.jsx("text",{x:z,y:U+13,textAnchor:"middle",fontSize:"7",fontFamily:"var(--sans)",style:{fill:ee?je:"var(--muted2)"},opacity:"0.7",children:G})]},b)})]})})}const Ln=new Map;function Ke(t,s,{wrapBody:n=!0}={}){Ln.set(t,{Component:s,wrapBody:n})}function _a(t){return Ln.get(t)??null}const Wa=new Map,$t=new Map;function Fa(t){t!=null&&t.id&&(Wa.set(t.id,t),$t.has(t.zone)||$t.set(t.zone,[]),$t.get(t.zone).push(t))}function Ua(t){return($t.get("editor")??[]).find(n=>{var r;return(r=n.matches)==null?void 0:r.call(n,t)})??null}function Ga(t){var s;for(const n of $t.get("settings")??[])if((s=n.sections)!=null&&s[t])return{Component:n.sections[t],wrapBody:!0};return null}function Ha({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(""),[c,p]=l.useState("actions");if(l.useEffect(()=>{Ne.listActions(t).then(f=>{const k=Array.isArray(f)?f:[];if(a(k),!o){const T=[...new Set(k.map(P=>P.serviceCode).filter(Boolean))].sort();T.length>0&&i(T[0])}}).catch(()=>a([]))},[t]),r===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const d=[...new Set(r.map(f=>f.serviceCode).filter(Boolean))].sort(),x=f=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:c===f?"var(--accent)":"var(--muted)",borderBottom:c===f?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:o,onChange:f=>i(f.target.value),children:d.map(f=>e.jsx("option",{value:f,children:f},f))})]}),e.jsxs("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[e.jsx("button",{style:x("actions"),onClick:()=>p("actions"),children:"Actions"}),e.jsx("button",{style:x("algorithm-catalog"),onClick:()=>p("algorithm-catalog"),children:"Algorithm Catalog"})]}),c==="actions"&&e.jsx(Va,{userId:t,serviceCode:o,dbActions:r.filter(f=>f.serviceCode===o),canWrite:s,toast:n}),c==="algorithm-catalog"&&e.jsx(Ka,{userId:t,serviceCode:o,canWrite:s,toast:n})]})}function Va({userId:t,serviceCode:s,dbActions:n,canWrite:r,toast:a}){const[o,i]=l.useState(null),[c,p]=l.useState(null),[d,x]=l.useState(null),[f,k]=l.useState(null),[T,P]=l.useState({}),[$,u]=l.useState({}),y=o??n;function m(g,B){i(v=>(v??n).map(b=>b.id===g?{...b,description:B}:b))}l.useEffect(()=>{s&&(i(null),p(null),k(null),P({}),u({}),Promise.all([Ne.getServiceCatalog(s),Ne.listAllInstances(t,s)]).then(([g,B])=>{p(g),x(Array.isArray(B)?B:[])}).catch(()=>{p({handlers:[],guards:[]}),x([])}))},[t,s]);async function j(g){const B=await Ne.listActionGuards(t,g).catch(()=>[]);P(v=>({...v,[g]:Array.isArray(B)?B:[]}))}async function h(g){const B=await Ne.listActionWrappers(t,g).catch(()=>[]);u(v=>({...v,[g]:Array.isArray(B)?B:[]}))}function S(g){if(f===g){k(null);return}k(g),T[g]||j(g),$[g]||h(g)}async function W(g,B,v){try{await Ne.attachActionGuard(t,g,B,v||"HIDE",0),j(g),a("Guard attached","success")}catch(b){a(String(b),"error")}}async function F(g,B){try{await Ne.detachActionGuard(t,g,B),j(g),a("Guard detached","success")}catch(v){a(String(v),"error")}}async function H(g,B,v){try{await Ne.updateActionGuard(t,g,B,v),P(b=>({...b,[g]:(b[g]||[]).map(M=>M.id===B?{...M,effect:v}:M)}))}catch(b){a(String(b),"error")}}async function R(g,B,v){try{await Ne.attachActionWrapper(t,g,B,v,s),h(g),a("Wrapper attached","success")}catch(b){a(String(b),"error")}}if(c===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const L={};y.forEach(g=>{L[(g.actionCode||g.action_code||"").toUpperCase()]=g});const C=c.handlers||[],E=new Set([...C.map(g=>(g.code||"").toUpperCase()),...Object.keys(L)]),U=Array.from(E).map(g=>{const B=L[g],v=C.find(b=>(b.code||"").toUpperCase()===g);return B?{...B,_fromDb:!0,_module:B.handlerModuleName||B.handler_module_name||(v==null?void 0:v.module)||"unknown"}:{id:null,actionCode:v.code,displayName:v.label||v.code,scope:null,displayCategory:null,displayOrder:9999,description:null,_fromDb:!1,_module:v.module||"unknown"}});if(U.sort((g,B)=>g._fromDb&&B._fromDb?(g.displayOrder??0)-(B.displayOrder??0):g._fromDb?-1:B._fromDb?1:(g.actionCode||"").localeCompare(B.actionCode||"")),U.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No actions registered for ",e.jsx("strong",{children:s}),"."]});const q={};U.forEach(g=>{const B=g._module||"unknown";q[B]||(q[B]=[]),q[B].push(g)});const w=(d||[]).filter(g=>(g.typeName||"").toLowerCase().includes("guard")),A=(d||[]).filter(g=>(g.typeName||"").toLowerCase().includes("wrapper"));return e.jsx("div",{className:"settings-list",children:Object.entries(q).sort(([g],[B])=>g.localeCompare(B)).map(([g,B])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx(Bn,{module:g}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",B.length,")"]})]}),B.map(v=>{const b=v.id||v.actionCode,M=f===b,N=v.actionCode||v.action_code,D=v.displayName||v.display_name||N,O=v.scope,G=v.displayCategory||v.display_category,z=T[b]||[],_=$[b]||[];return e.jsxs("div",{className:"settings-card",style:{marginBottom:4,opacity:v._fromDb?1:.6},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>v._fromDb&&S(b),style:{display:"flex",alignItems:"center",cursor:v._fromDb?"pointer":"default"},children:[v._fromDb?e.jsx("span",{className:"settings-card-chevron",children:M?e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Fe,{size:13,strokeWidth:2,color:"var(--muted)"})}):e.jsx("span",{className:"settings-card-chevron",style:{width:18,color:"var(--muted2)",fontSize:9},children:"—"}),e.jsx("span",{className:"settings-card-name",children:D}),!v._fromDb&&e.jsx("span",{style:{fontSize:9,color:"var(--muted2)",marginLeft:6,fontStyle:"italic"},children:"not seeded"}),e.jsx("span",{style:{flex:1}}),O&&e.jsx("span",{className:"settings-badge",children:O}),G&&e.jsx("span",{className:"settings-badge",style:{marginLeft:4},children:G})]}),M&&v._fromDb&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:e.jsxs("span",{children:["Code: ",e.jsx("code",{children:N})]})}),e.jsx(qa,{description:v.description,actionId:b,userId:t,canWrite:r,onSaved:K=>m(b,K)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Guards"}),z.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No guards attached"}),z.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%",marginBottom:8},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Guard"}),e.jsx("th",{children:"Effect"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:z.map(K=>e.jsxs("tr",{children:[e.jsxs("td",{children:[K.algorithmName||K.algorithm_name,(K.algorithmCode||K.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",K.algorithmCode||K.algorithm_code,")"]})]}),e.jsx("td",{children:r?e.jsxs("select",{className:"field-input",style:{fontSize:11,padding:"1px 4px"},value:K.effect,onChange:ee=>H(b,K.id,ee.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}):e.jsx("span",{className:`settings-badge${K.effect==="BLOCK"?" badge-warn":""}`,children:K.effect})}),e.jsx("td",{style:{textAlign:"right"},children:r&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>F(b,K.id),children:e.jsx(St,{size:10})})})]},K.id))})]}),r&&w.length>0&&e.jsx(Xa,{instances:w,onAttach:(K,ee)=>W(b,K,ee)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4,marginTop:12},children:"Wrappers"}),_.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No wrappers"}),_.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Order"}),e.jsx("th",{children:"Wrapper"}),e.jsx("th",{children:"Instance"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:_.map(K=>e.jsxs("tr",{children:[e.jsx("td",{style:{width:50},children:K.executionOrder||K.execution_order}),e.jsxs("td",{children:[K.algorithmName||K.algorithm_name,(K.algorithmCode||K.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",K.algorithmCode||K.algorithm_code,")"]})]}),e.jsx("td",{style:{fontSize:11,color:"var(--muted)"},children:K.instanceName||K.instance_name}),e.jsx("td",{style:{textAlign:"right"},children:r&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:async()=>{try{await Ne.detachActionWrapper(t,b,K.id),h(b),a("Wrapper detached","success")}catch(ee){a(String(ee),"error")}},children:e.jsx(St,{size:10})})})]},K.id))})]}),r&&A.length>0&&e.jsx(Ja,{instances:A,onAttach:(K,ee)=>R(b,K,ee)})]})]},b)})]},g))})}const Ks=[{key:"handler",label:"Action Handler",filter:t=>t.toLowerCase().includes("handler")},{key:"guard",label:"Guard",filter:t=>t.toLowerCase().includes("guard")},{key:"wrapper",label:"Wrapper",filter:t=>t.toLowerCase().includes("wrapper")}];function Ka({userId:t,serviceCode:s}){const[n,r]=l.useState(null),[a,o]=l.useState("handler");l.useEffect(()=>{s&&(r(null),Ne.listAllInstances(t,s).then(d=>r(Array.isArray(d)?d:[])).catch(()=>r([])))},[t,s]);const i=d=>({padding:"4px 12px",fontSize:11,cursor:"pointer",background:"none",border:"none",color:a===d?"var(--accent)":"var(--muted)",borderBottom:a===d?"2px solid var(--accent)":"2px solid transparent"});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const c=Ks.find(d=>d.key===a),p=(n||[]).filter(d=>c==null?void 0:c.filter(d.typeName||d.type_name||""));return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:Ks.map(d=>e.jsx("button",{style:i(d.key),onClick:()=>o(d.key),children:d.label},d.key))}),p.length===0?e.jsxs("div",{style:{padding:"16px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No ",c==null?void 0:c.label.toLowerCase()," instances for ",e.jsx("strong",{children:s}),"."]}):e.jsx("div",{className:"settings-list",children:p.map(d=>{const x=a==="guard"?e.jsx(ft,{size:12,color:"var(--accent)",strokeWidth:1.8}):a==="wrapper"?e.jsx(vs,{size:12,color:"var(--muted2)",strokeWidth:1.8}):e.jsx(bs,{size:12,color:"var(--muted)",strokeWidth:1.8});return e.jsxs("div",{className:"settings-card",style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"},children:[x,e.jsx("span",{className:"settings-card-name",style:{flex:1,fontSize:12},children:d.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:d.algorithmCode||d.algorithm_code})]},d.id)})})]})}function qa({description:t,actionId:s,userId:n,canWrite:r,onSaved:a}){const[o,i]=l.useState(!1),[c,p]=l.useState(t||""),d=l.useCallback(async()=>{await Ne.updateAction(n,s,{description:c}),a(c),i(!1)},[n,s,c,a]);return e.jsxs("div",{style:{marginBottom:10},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Description"}),o?e.jsxs("div",{style:{display:"flex",gap:6},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11},value:c,onChange:x=>p(x.target.value)}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:d,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{p(t||""),i(!1)},children:"✕"})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{style:{fontSize:11,color:t?"var(--text)":"var(--muted)",fontStyle:t?"normal":"italic"},children:t||"No description"}),r&&e.jsx("button",{className:"btn btn-xs",onClick:()=>i(!0),children:"Edit"})]})]})}function Ja({instances:t,onAttach:s}){const[n,r]=l.useState(""),[a,o]=l.useState(10);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>r(i.target.value),children:[e.jsx("option",{value:"",children:"— attach wrapper —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsx("input",{type:"number",className:"field-input",style:{fontSize:11,width:60,padding:"3px 4px"},value:a,min:1,onChange:i=>o(Number(i.target.value)),placeholder:"Order"}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,a),r(""))},children:[e.jsx(Me,{size:10})," Attach"]})]})}function Xa({instances:t,onAttach:s}){const[n,r]=l.useState(""),[a,o]=l.useState("HIDE");return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>r(i.target.value),children:[e.jsx("option",{value:"",children:"— attach guard —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsxs("select",{className:"field-input",style:{fontSize:11,width:90,padding:"3px 4px"},value:a,onChange:i=>o(i.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,a),r(""))},children:[e.jsx(Me,{size:10})," Attach"]})]})}function Ya({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(null),[c,p]=l.useState(""),[d,x]=l.useState("catalog"),[f,k]=l.useState(null),[T,P]=l.useState(null),[$,u]=l.useState(24),y=l.useCallback(()=>{a(null),i(null),Promise.all([Ne.listAlgorithms(t),Ne.listAllInstances(t)]).then(([W,F])=>{const H=Array.isArray(W)?W:[],R=Array.isArray(F)?F:[];if(a(H),i(R),!c){const L=[...new Set(H.map(C=>C.serviceCode).filter(Boolean))].sort();L.length>0&&p(L[0])}}).catch(()=>{a([]),i([])})},[t]);l.useEffect(()=>{y()},[y]),l.useEffect(()=>{k(null),P(null)},[c]);const m=l.useCallback(()=>{Ne.getAlgorithmStats(t,c).then(W=>k(Array.isArray(W)?W:[])).catch(()=>k([]))},[t,c]),j=l.useCallback(W=>{Ne.getAlgorithmTimeseries(t,W,c).then(F=>P(Array.isArray(F)?F:[])).catch(()=>P([]))},[t,c]);if(r===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const h=[...new Set(r.map(W=>W.serviceCode).filter(Boolean))].sort(),S=W=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:d===W?"var(--accent)":"var(--muted)",borderBottom:d===W?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:c,onChange:W=>p(W.target.value),children:h.map(W=>e.jsx("option",{value:W,children:W},W))})]}),e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[["catalog","Catalog"],["stats","Execution Stats"],["graph","Usage Graph"]].map(([W,F])=>e.jsx("button",{style:S(W),onClick:()=>{x(W),W==="stats"&&!f&&m(),W==="graph"&&!T&&j($)},children:F},W))}),c&&d==="catalog"&&e.jsx(Za,{userId:t,serviceCode:c,algorithms:r.filter(W=>W.serviceCode===c),instances:o?o.filter(W=>W.serviceCode===c):[],canWrite:s,toast:n,onReload:y}),d==="stats"&&c&&e.jsx(eo,{userId:t,serviceCode:c,canWrite:s,toast:n,stats:f,onLoad:m,onReset:async()=>{await Ne.resetAlgorithmStats(t,c).catch(()=>{}),k([]),n("Stats reset","success")}}),d==="graph"&&c&&e.jsx(to,{timeseries:T,tsHours:$,onLoad:W=>{u(W),j(W)}})]})}function Za({userId:t,serviceCode:s,algorithms:n,instances:r,canWrite:a,toast:o,onReload:i}){const[c,p]=l.useState(null),[d,x]=l.useState(""),[f,k]=l.useState({});l.useEffect(()=>{p(null),x(""),k({})},[s]);async function T(u){const y=d.trim();if(!y){o("Instance name is required","error");return}try{await Ne.createInstance(t,u,y,s),x(""),i(),o("Instance created","success")}catch(m){o(String(m),"error")}}if(n.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No algorithms registered for ",e.jsx("strong",{children:s}),"."]});const P={};n.forEach(u=>{const y=u.typeName||u.type_name||"Unknown",m=u.moduleName||u.module_name||"unknown";P[y]||(P[y]={}),P[y][m]||(P[y][m]=[]),P[y][m].push(u)});const $={};return(r||[]).forEach(u=>{const y=u.algorithmId||u.algorithm_id;$[y]||($[y]=[]),$[y].push(u)}),e.jsx("div",{className:"settings-list",children:Object.entries(P).sort(([u],[y])=>u.localeCompare(y)).map(([u,y])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx("span",{style:{fontSize:12,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".04em"},children:u}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".06em"},children:"type"})]}),Object.entries(y).sort(([m],[j])=>m.localeCompare(j)).map(([m,j])=>e.jsxs("div",{style:{marginBottom:14,marginLeft:4},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6},children:[e.jsx(Bn,{module:m}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",j.length,")"]})]}),j.map(h=>{const S=h.id,W=c===S,F=$[S]||[],H=h.code,R=h.name||H;return e.jsxs("div",{className:"settings-card",style:{marginBottom:4},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>{const L=W?null:S;p(L),x(""),L&&!f[L]&&Ne.listAlgorithmParameters(t,L).then(C=>k(E=>({...E,[L]:Array.isArray(C)?C:[]}))).catch(()=>k(C=>({...C,[L]:[]})))},style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:W?e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Fe,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(bn,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:R}),e.jsx("span",{className:"settings-card-id",children:H}),e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:h.description||""}),e.jsxs("span",{className:"settings-badge",style:{marginLeft:8},children:[F.length," instance",F.length!==1?"s":""]})]}),W&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsxs("div",{style:{display:"flex",gap:16,fontSize:11,color:"var(--muted)",marginBottom:10},children:[e.jsxs("span",{children:["Handler: ",e.jsx("code",{style:{color:"var(--text)"},children:h.handlerRef||h.handler_ref||"—"})]}),e.jsxs("span",{children:["Type: ",e.jsx("code",{style:{color:"var(--text)"},children:u})]})]}),(()=>{const L=f[S];return!L||L.length===0?null:e.jsxs("div",{style:{marginBottom:12},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Parameter Schema"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsx("tr",{style:{borderBottom:"1px solid var(--border)"},children:["Name","Label","Type","Req.","Default"].map(C=>e.jsx("th",{style:{textAlign:C==="Req."?"center":"left",padding:"3px 6px",color:"var(--muted)",fontWeight:600,fontSize:10},children:C},C))})}),e.jsx("tbody",{children:L.map(C=>{const E=C.paramName||C.param_name,U=C.paramLabel||C.param_label||E,q=C.dataType||C.data_type||"STRING",w=C.required===1||C.required===!0,A=C.defaultValue||C.default_value||"";return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--accent)"},children:E}),e.jsx("td",{style:{padding:"3px 6px"},children:U}),e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--muted)",fontSize:10},children:q}),e.jsx("td",{style:{padding:"3px 6px",textAlign:"center"},children:w?"✓":""}),e.jsx("td",{style:{padding:"3px 6px",color:A?"var(--text)":"var(--muted)",fontFamily:"var(--mono)",fontSize:10},children:A||"—"})]},C.id||E)})})]})]})})(),e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Instances"}),F.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"No instances"}),F.map(L=>e.jsx(Qa,{inst:L,algo:h,userId:t,canWrite:a,toast:o,onReload:i},L.id)),a&&e.jsxs("div",{style:{display:"flex",gap:6,marginTop:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11,padding:"3px 6px"},placeholder:"New instance name…",value:d,onChange:L=>x(L.target.value),onKeyDown:L=>{L.key==="Enter"&&T(S)}}),e.jsxs("button",{className:"btn btn-sm",style:{fontSize:10},disabled:!d.trim(),onClick:()=>T(S),children:[e.jsx(Me,{size:10,strokeWidth:2.5})," Create"]})]})]})]},S)})]},m))]},u))})}function Qa({inst:t,algo:s,userId:n,canWrite:r,toast:a,onReload:o}){var j;const[i,c]=l.useState(!1),[p,d]=l.useState(null),[x,f]=l.useState(!1),[k,T]=l.useState(t.name||"");async function P(){if(p===null)try{const h=await Ne.getInstanceParams(n,t.id);d(Array.isArray(h)?h:[])}catch{d([])}}function $(){i||P(),c(h=>!h)}async function u(){if(!k.trim()||k.trim()===t.name){f(!1);return}try{await Ne.updateInstance(n,t.id,k.trim()),a("Instance renamed","success"),o()}catch(h){a(String(h),"error")}f(!1)}async function y(){try{await Ne.deleteInstance(n,t.id),a("Instance deleted","success"),o()}catch(h){a(String(h),"error")}}async function m(h,S){try{await Ne.setInstanceParam(n,t.id,h,S);const W=await Ne.getInstanceParams(n,t.id);d(Array.isArray(W)?W:[])}catch(W){a(String(W),"error")}}return e.jsxs("div",{className:"settings-card",style:{marginBottom:2},children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",cursor:"pointer"},onClick:$,children:[e.jsx("span",{className:"settings-card-chevron",children:i?e.jsx(Ge,{size:11,strokeWidth:2,color:"var(--muted)"}):e.jsx(Fe,{size:11,strokeWidth:2,color:"var(--muted)"})}),x?e.jsx("input",{className:"field-input",style:{fontSize:12,padding:"1px 4px",flex:1},autoFocus:!0,value:k,onChange:h=>T(h.target.value),onBlur:u,onKeyDown:h=>{h.key==="Enter"&&u(),h.key==="Escape"&&(f(!1),T(t.name))},onClick:h=>h.stopPropagation()}):e.jsx("span",{className:"settings-card-name",style:{fontSize:12,flex:1},children:t.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:(j=t.id)==null?void 0:j.slice(-8)}),r&&e.jsxs("span",{style:{display:"flex",gap:4,marginLeft:8},onClick:h=>h.stopPropagation(),children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>{f(!0),T(t.name)},children:e.jsx(gt,{size:10})}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:y,children:e.jsx(St,{size:10})})]})]}),i&&e.jsxs("div",{className:"settings-card-body",style:{padding:"6px 12px 8px 26px"},children:[p===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading params…"}),p!==null&&p.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No parameters"}),p!==null&&p.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Parameter"}),e.jsx("th",{children:"Value"})]})}),e.jsx("tbody",{children:p.map(h=>e.jsxs("tr",{children:[e.jsxs("td",{style:{fontSize:11},children:[h.paramLabel||h.param_label||h.paramName||h.param_name,(h.dataType||h.data_type)&&e.jsx("span",{style:{color:"var(--muted2)",fontSize:9,marginLeft:4},children:h.dataType||h.data_type})]}),e.jsx("td",{children:r?e.jsx(so,{param:h,onSave:S=>m(h.algorithmParameterId||h.algorithm_parameter_id||h.id,S)}):e.jsx("span",{style:{fontSize:11,fontFamily:"var(--mono)"},children:h.value||e.jsx("em",{style:{color:"var(--muted)"},children:"—"})})})]},h.id))})]})]})]})}function eo({stats:t,onLoad:s,onReset:n}){return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:s,children:"Refresh"}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:n,children:"Reset"})]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading stats…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No algorithm executions recorded yet"}),t&&t.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Algorithm"}),e.jsx("th",{style:{textAlign:"right"},children:"Calls"}),e.jsx("th",{style:{textAlign:"right"},children:"Min (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Avg (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Max (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Total (ms)"}),e.jsx("th",{children:"Last Update"})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:r.algorithmCode})}),e.jsx("td",{style:{textAlign:"right"},children:r.callCount}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.minMs=="number"?r.minMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.avgMs=="number"?r.avgMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.maxMs=="number"?r.maxMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.totalMs=="number"?r.totalMs.toFixed(1):"—"}),e.jsx("td",{style:{fontSize:10,color:"var(--muted)"},children:r.lastFlushed||"—"})]},r.algorithmCode))})]})]})}function to({timeseries:t,tsHours:s,onLoad:n}){const o={t:20,r:20,b:40,l:50},i=800-o.l-o.r,c=200-o.t-o.b;function p(f,k,T){if(f.length===0)return e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No data"});const P=Math.max(...f.map($=>$.calls),1);return e.jsxs("svg",{viewBox:"0 0 800 200",style:{width:"100%",height:200,display:"block"},children:[[0,.25,.5,.75,1].map($=>{const u=o.t+c*(1-$);return e.jsxs("g",{children:[e.jsx("line",{x1:o.l,x2:800-o.r,y1:u,y2:u,stroke:"var(--border)",strokeWidth:.5}),e.jsx("text",{x:o.l-4,y:u+3,textAnchor:"end",fill:"var(--muted)",fontSize:9,children:Math.round(P*$)})]},$)}),f.map(($,u)=>{const y=Math.max(i/f.length-1,2),m=o.l+u/f.length*i,j=$.calls/P*c,h=o.t+c-j,S=f.length<20||u%Math.ceil(f.length/12)===0,W=$.windowStart.replace("T"," ").slice(11,16);return e.jsxs("g",{children:[e.jsx("rect",{x:m,y:h,width:y,height:j,fill:T,opacity:.8,rx:1,children:e.jsxs("title",{children:[$.windowStart.replace("T"," ").slice(0,16)," — ",$.calls," calls, ",$.totalMs.toFixed(1),"ms"]})}),S&&e.jsx("text",{x:m+y/2,y:200-o.b+14,textAnchor:"middle",fill:"var(--muted)",fontSize:8,transform:`rotate(-45, ${m+y/2}, ${200-o.b+14})`,children:W})]},u)}),e.jsx("text",{x:12,y:o.t+c/2,textAnchor:"middle",fill:"var(--muted)",fontSize:9,transform:`rotate(-90, 12, ${o.t+c/2})`,children:"Calls"}),e.jsx("text",{x:o.l,y:12,fill:"var(--text)",fontSize:11,fontWeight:600,children:k})]})}const d={};(t||[]).forEach(f=>{d[f.windowStart]||(d[f.windowStart]={calls:0,totalMs:0}),d[f.windowStart].calls+=f.callCount||0,d[f.windowStart].totalMs+=f.totalMs||0});const x=Object.keys(d).sort().map(f=>({windowStart:f,...d[f]}));return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12,alignItems:"center"},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>n(s),children:"Refresh"}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)"},children:"Window:"}),[6,12,24,48].map(f=>e.jsxs("button",{className:"btn btn-xs",onClick:()=>n(f),style:{background:s===f?"var(--accent)":void 0,color:s===f?"#fff":void 0},children:[f,"h"]},f))]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No windowed data yet. Stats are bucketed every 15 seconds on flush."}),t&&t.length>0&&e.jsx("div",{style:{background:"var(--bg2)",borderRadius:6,padding:12},children:p(x,"All Algorithms (aggregate)","#3b82f6")})]})}function so({param:t,onSave:s}){const[n,r]=l.useState(t.value||""),[a,o]=l.useState(!1);function i(c){r(c),o(c!==(t.value||""))}return e.jsxs("div",{style:{display:"flex",gap:4,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{fontSize:11,padding:"1px 4px",flex:1},value:n,onChange:c=>i(c.target.value),onBlur:()=>{a&&(s(n),o(!1))}}),a&&e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>{s(n),o(!1)},children:"Save"})]})}function no(t){if(!t)return{fg:"var(--muted2)",bg:"rgba(120,130,150,.14)"};let s=0;for(let r=0;r<t.length;r++)s=s*31+t.charCodeAt(r)&16777215;const n=s%360;return{fg:`hsl(${n},70%,72%)`,bg:`hsl(${n},55%,22%)`}}function Bn({module:t}){if(!t)return null;const s=no(t);return e.jsx("span",{title:`Spring Modulith module: ${t}`,style:{display:"inline-block",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700,letterSpacing:".06em",fontFamily:"var(--mono)",textTransform:"uppercase",background:s.bg,color:s.fg,border:`1px solid ${s.fg}33`,verticalAlign:"middle"},children:t})}function ro({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(!1),[c,p]=l.useState({displayName:"",email:""}),[d,x]=l.useState(!1);l.useEffect(()=>{X.getUser(t,t).then(a).catch(()=>{})},[t]);function f(){p({displayName:(r==null?void 0:r.displayName)||"",email:(r==null?void 0:r.email)||""}),i(!0)}async function k(){x(!0);try{await X.updateUser(t,t,c.displayName.trim(),c.email.trim());const T=await X.getUser(t,t);a(T),i(!1),n("Profile updated","success")}catch{n("Failed to update profile","error")}finally{x(!1)}}return r?e.jsxs("div",{className:"settings-list",children:[e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx(Zt,{size:15,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{fontSize:13},children:r.username}),r.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",children:"Admin"})]}),o?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(We,{label:"Display Name",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.displayName,onChange:T=>p(P=>({...P,displayName:T.target.value}))})}),e.jsx(We,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:c.email,onChange:T=>p(P=>({...P,email:T.target.value}))})}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:4},children:[e.jsx("button",{className:"btn btn-primary",onClick:k,disabled:d,children:d?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>i(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,paddingLeft:23},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:r.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:r.email||"—"})]}),s&&e.jsx("div",{style:{marginTop:4},children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:f,children:[e.jsx(gt,{size:11,strokeWidth:2}),"Edit"]})})]})]}),e.jsx(oo,{})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}const ao=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function oo(){const[t,s]=l.useState(Jt);function n(r){s(r),ws(r)}return e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:10},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:ao.map(r=>e.jsxs("button",{type:"button",className:`theme-option${t===r.value?" theme-option--active":""}`,onClick:()=>n(r.value),children:[e.jsx("span",{className:"theme-option-icon",children:r.icon}),e.jsx("span",{children:r.label})]},r.value))})]})}function Qt({title:t,onClose:s,onSave:n,saving:r,saveLabel:a="Save",children:o,width:i=480}){return e.jsx("div",{className:"diff-overlay",style:{zIndex:600},onClick:c=>{c.target===c.currentTarget&&s()},children:e.jsxs("div",{className:"diff-modal",style:{width:i,maxHeight:"85vh",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"diff-header",children:[e.jsx("span",{className:"diff-title",children:t}),e.jsx("button",{className:"diff-close",onClick:s,children:"×"})]}),e.jsx("div",{style:{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12},children:o}),e.jsxs("div",{style:{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0},children:[e.jsx("button",{className:"btn",onClick:s,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:n,disabled:r,children:r?"Saving…":a})]})]})})}function We({label:t,children:s}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx("label",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:t}),s]})}function io({userId:t,roleId:s,canWrite:n,toast:r,nodePerms:a,lcPerms:o,nodeTypes:i,transitions:c}){const[p,d]=l.useState(null);l.useEffect(()=>{d(null),X.getRolePolicies(t,s).then(u=>{const y=new Set;(Array.isArray(u)?u:[]).forEach(m=>{const j=m.permissionCode||m.permission_code,h=m.nodeTypeId||m.node_type_id||"",S=m.transitionId||m.transition_id||"";y.add(`${j}|${h}|${S}`)}),d(y)}).catch(()=>d(new Set))},[t,s]);const x=(u,y,m)=>`${u}|${y||""}|${m||""}`;async function f(u,y,m){if(!n||!p)return;const j=x(u,y,m),h=p.has(j);d(S=>{const W=new Set(S);return h?W.delete(j):W.add(j),W});try{h?await X.removePermissionGrant(t,y,u,s,m||null):await X.addPermissionGrant(t,y,u,s,m||null)}catch(S){d(W=>{const F=new Set(W);return h?F.add(j):F.delete(j),F}),r(S,"error")}}if(!p)return e.jsx("div",{style:{padding:"4px 0",color:"var(--muted)",fontSize:11},children:"Loading policies…"});if(i.length===0)return e.jsx("div",{className:"settings-empty-row",children:"No node types defined."});const k={padding:"4px 8px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)",background:"var(--bg2, var(--bg))",whiteSpace:"nowrap",verticalAlign:"bottom"},T={padding:"3px 6px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)"};function P({permCode:u,ntId:y,transId:m}){const j=p.has(x(u,y,m));return e.jsx("td",{style:T,children:e.jsx("button",{className:"panel-icon-btn",disabled:!n,title:n?j?"Revoke":"Grant":"Requires MANAGE_ROLES",onClick:()=>f(u,y,m),style:{margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",width:22,height:22,cursor:n?"pointer":"default"},children:j?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})})})}function $({ntId:u,ntName:y}){return e.jsxs("td",{style:{...T,textAlign:"left",position:"sticky",left:0,background:"var(--bg)",zIndex:1,minWidth:120},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"var(--text)"},children:y}),e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--muted)"},children:u})]})}return e.jsxs("div",{children:[a.length>0&&e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Node Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...k,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),a.map(u=>e.jsxs("th",{style:{...k,minWidth:72},children:[e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--accent)",marginBottom:1},children:u.permissionCode}),e.jsx("div",{style:{fontSize:9,color:"var(--muted)",fontWeight:400},children:u.displayName})]},u.permissionCode))]})}),e.jsx("tbody",{children:i.map(u=>{const y=u.id||u.ID,m=u.name||u.NAME||y;return e.jsxs("tr",{children:[e.jsx($,{ntId:y,ntName:m}),a.map(j=>e.jsx(P,{permCode:j.permissionCode,ntId:y,transId:null},j.permissionCode))]},y)})})]})})]}),o.length>0&&c.length>0&&e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Lifecycle Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type + transition check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...k,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),c.map(u=>e.jsx("th",{style:{...k,minWidth:100},children:e.jsx("div",{style:{fontSize:9,color:"var(--text)",fontWeight:500},children:u.label})},u.id))]})}),e.jsx("tbody",{children:i.filter(u=>u.lifecycle_id||u.lifecycleId).map(u=>{const y=u.id||u.ID,m=u.name||u.NAME||y,j=u.lifecycle_id||u.lifecycleId;return e.jsxs("tr",{children:[e.jsx($,{ntId:y,ntName:m}),c.map(h=>h.lifecycleId!==j?e.jsx("td",{style:T,children:e.jsx("span",{style:{color:"var(--border)",fontSize:11},children:"—"})},h.id):e.jsx(P,{permCode:o[0].permissionCode,ntId:y,transId:h.id},h.id))]},y)})})]})})]}),a.length===0&&o.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No permissions configured."})]})}function lo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState([]),[o,i]=l.useState(!0),[c,p]=l.useState(!1),[d,x]=l.useState({name:"",description:""}),[f,k]=l.useState(!1),[T,P]=l.useState(null),[$,u]=l.useState({}),[y,m]=l.useState({}),[j,h]=l.useState(!1);function S(){return X.listProjectSpaces(t).then(L=>a(Array.isArray(L)?L:[]))}l.useEffect(()=>{S().finally(()=>i(!1))},[t]),l.useEffect(()=>{mt.getRegistryTags().then(u).catch(()=>{})},[]);async function W(){if(d.name.trim()){k(!0);try{await X.createProjectSpace(t,d.name.trim(),d.description.trim()||null),await S(),p(!1),x({name:"",description:""})}catch(L){n(L,"error")}finally{k(!1)}}}async function F(L){if(T===L){P(null);return}P(L);try{const C=await X.getProjectSpaceServiceTags(t,L);m(C||{})}catch{m({})}}async function H(L){const C=L.id||L.ID,E=L.isolated===!0;try{await X.setProjectSpaceIsolated(t,C,!E),await S(),n(E?"Isolation disabled":"Isolation enabled")}catch(U){n(U,"error")}}async function R(L,C,E){h(!0);try{await X.setProjectSpaceServiceTags(t,L,C,E);const U=await X.getProjectSpaceServiceTags(t,L);m(U||{}),n("Tags updated")}catch(U){n(U,"error")}finally{h(!1)}}return o?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-list",children:[c&&e.jsxs(Qt,{title:"New Project Space",onClose:()=>{p(!1),x({name:"",description:""})},onSave:W,saving:f,saveLabel:"Create",children:[e.jsx(We,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:d.name,onChange:L=>x(C=>({...C,name:L.target.value})),placeholder:"e.g. Prototype-2026"})}),e.jsx(We,{label:"Description",children:e.jsx("input",{className:"field-input",value:d.description,onChange:L=>x(C=>({...C,description:L.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{x({name:"",description:""}),p(!0)},children:[e.jsx(Me,{size:11,strokeWidth:2.5}),"New space"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No project spaces yet."}),r.map(L=>{const C=L.id||L.ID,E=L.name||L.NAME||C,U=L.description||L.DESCRIPTION||"",q=L.active!==!1&&L.ACTIVE!==!1,w=L.isolated===!0,A=L.parentId||L.PARENT_ID||null,g=T===C;return e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer"},onClick:()=>F(C),children:[g?e.jsx(Ge,{size:12}):e.jsx(Fe,{size:12}),e.jsx(Bt,{size:13,color:q?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:E}),e.jsx("span",{className:"settings-card-id",children:C}),A&&e.jsx("span",{className:"settings-badge",title:`Child of ${A}`,children:"child"}),w&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Isolated"}),!q&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"})]}),U&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:19},children:U}),g&&e.jsxs("div",{style:{marginTop:10,paddingLeft:19,borderTop:"1px solid var(--border)",paddingTop:10},children:[s&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10},children:[e.jsxs("label",{style:{fontSize:11,display:"flex",alignItems:"center",gap:6,cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:w,onChange:()=>H(L)}),e.jsx("span",{children:"Isolated"})]}),e.jsx("span",{className:"muted",style:{fontSize:10},children:"Exclusive tag ownership, no untagged routing"})]}),e.jsx("div",{style:{fontSize:11,fontWeight:600,marginBottom:6},children:"Service Tags"}),Object.keys($).length===0?e.jsx("div",{className:"muted",style:{fontSize:11},children:"No services registered with tags."}):e.jsxs("table",{className:"status-table",style:{fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service"}),e.jsx("th",{children:"Available Tags"}),e.jsx("th",{children:"Assigned"}),s&&e.jsx("th",{})]})}),e.jsx("tbody",{children:Object.entries($).map(([B,v])=>{const b=y[B]||[];return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:B})}),e.jsx("td",{children:v.length===0?e.jsx("span",{className:"muted",children:"none"}):v.map(M=>e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",margin:"1px 2px",borderRadius:3,fontSize:10,background:b.includes(M)?"var(--accent-bg)":"var(--bg2)",color:b.includes(M)?"var(--accent)":"var(--muted)",border:`1px solid ${b.includes(M)?"var(--accent)":"var(--border)"}`,cursor:s?"pointer":"default"},onClick:s?()=>{const N=b.includes(M)?b.filter(D=>D!==M):[...b,M];R(C,B,N)}:void 0,title:s?b.includes(M)?"Click to remove":"Click to assign":"",children:M},M))}),e.jsx("td",{children:b.length===0?e.jsx("span",{className:"muted",children:"—"}):b.join(", ")}),s&&e.jsx("td",{children:b.length>0&&e.jsx("button",{className:"btn btn-sm btn-ghost",style:{fontSize:10,padding:"1px 6px"},onClick:()=>R(C,B,[]),disabled:j,children:"clear"})})]},B)})})]})]})]},C)})]})}function co({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(null),[c,p]=l.useState({}),[d,x]=l.useState(!1),[f,k]=l.useState(null),T=l.useCallback(()=>X.getRoles(t).then(u=>a(Array.isArray(u)?u:[])),[t]);l.useEffect(()=>{T()},[T]);async function P(){var u,y,m;if((u=c.name)!=null&&u.trim()){x(!0);try{o==="create"?await X.createRole(t,c.name.trim(),((y=c.description)==null?void 0:y.trim())||null):await X.updateRole(t,o.role.id,c.name.trim(),((m=c.description)==null?void 0:m.trim())||null),await T(),i(null)}catch(j){n(j,"error")}finally{x(!1)}}}async function $(u){if(window.confirm(`Delete role "${u.name}"?
All user assignments for this role will also be removed.`)){k(u.id);try{await X.deleteRole(t,u.id),await T()}catch(y){n(y,"error")}finally{k(null)}}}return r?e.jsxs("div",{className:"settings-list",children:[o&&e.jsxs(Qt,{title:o==="create"?"New Role":`Edit — ${o.role.name}`,onClose:()=>i(null),onSave:P,saving:d,saveLabel:o==="create"?"Create":"Save",children:[e.jsx(We,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.name||"",onChange:u=>p(y=>({...y,name:u.target.value})),placeholder:"e.g. APPROVER"})}),e.jsx(We,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,style:{resize:"vertical"},value:c.description||"",onChange:u=>p(y=>({...y,description:u.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{p({name:"",description:""}),i("create")},children:[e.jsx(Me,{size:11,strokeWidth:2.5})," New role"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No roles yet."}),r.map(u=>e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx(ft,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,fontSize:13,flex:1},children:u.name}),e.jsx("span",{className:"settings-card-id",children:u.id}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Edit role",onClick:()=>{p({name:u.name,description:u.description||""}),i({role:u})},children:e.jsx(gt,{size:11,strokeWidth:2,color:"var(--accent)"})}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Delete role",disabled:f===u.id,onClick:()=>$(u),children:e.jsx(St,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),u.description&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:21},children:u.description})]},u.id))]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function po({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState([]),[c,p]=l.useState([]),[d,x]=l.useState(null),[f,k]=l.useState({}),[T,P]=l.useState(!1),[$,u]=l.useState({username:"",displayName:"",email:""}),[y,m]=l.useState(!1),[j,h]=l.useState({}),[S,W]=l.useState(null),[F,H]=l.useState(null),[R,L]=l.useState(null),C=l.useCallback(()=>X.listUsers(t).then(v=>a(Array.isArray(v)?v:[])),[t]),E=l.useCallback(async v=>{const b=await X.getUserRoles(t,v).catch(()=>[]);k(M=>({...M,[v]:Array.isArray(b)?b:[]}))},[t]);l.useEffect(()=>{C(),X.getRoles(t).then(v=>i(Array.isArray(v)?v:[])),X.listProjectSpaces(t).then(v=>p(Array.isArray(v)?v:[]))},[t]);async function U(v){const b=v.id;if(d===b){x(null);return}x(b),await E(b),h(M=>{var N,D,O;return{...M,[b]:M[b]||{roleId:((N=o[0])==null?void 0:N.id)||"",spaceId:((D=c[0])==null?void 0:D.id)||((O=c[0])==null?void 0:O.ID)||""}}})}async function q(){if($.username.trim()){m(!0);try{await X.createUser(t,$.username.trim(),$.displayName.trim()||null,$.email.trim()||null),await C(),P(!1),u({username:"",displayName:"",email:""})}catch(v){n(v,"error")}finally{m(!1)}}}async function w(v){if(window.confirm(`Deactivate user "${v.username}"?`))try{await X.deactivateUser(t,v.id),await C()}catch(b){n(b,"error")}}async function A(v){const{roleId:b,spaceId:M}=j[v]||{};if(!(!b||!M)){W(v);try{await X.assignRole(t,v,b,M),await E(v)}catch(N){n(N,"error")}finally{W(null)}}}async function g(v,b,M){const N=`${v}:${b}:${M}`;H(N);try{await X.removeRole(t,v,b,M),await E(v)}catch(D){n(D,"error")}finally{H(null)}}async function B(v,b){L(v.id);try{await X.setUserAdmin(t,v.id,b),await C()}catch(M){n(M,"error")}finally{L(null)}}return r?e.jsxs("div",{className:"settings-list",children:[T&&e.jsxs(Qt,{title:"New User",onClose:()=>{P(!1),u({username:"",displayName:"",email:""})},onSave:q,saving:y,saveLabel:"Create",children:[e.jsx(We,{label:"Username *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:$.username,onChange:v=>u(b=>({...b,username:v.target.value})),placeholder:"e.g. john.doe"})}),e.jsx(We,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:$.displayName,onChange:v=>u(b=>({...b,displayName:v.target.value})),placeholder:"e.g. John Doe"})}),e.jsx(We,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:$.email,onChange:v=>u(b=>({...b,email:v.target.value})),placeholder:"e.g. john@company.com"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{u({username:"",displayName:"",email:""}),P(!0)},children:[e.jsx(Me,{size:11,strokeWidth:2.5})," New user"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No users found."}),r.map(v=>{var O,G;const b=v.id,M=d===b,N=f[b]||[],D=v.active!==!1;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center"},onClick:()=>U(v),children:[e.jsx("span",{className:"settings-card-chevron",children:M?e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Fe,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(Zt,{size:13,color:D?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:v.username}),v.displayName&&e.jsx("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:6},children:v.displayName}),e.jsx("span",{className:"settings-card-id",children:b}),v.email&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:v.email}),!D&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"}),v.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--warn",title:"Administrator",children:"Admin"}),s&&e.jsxs("select",{className:"field-input",style:{height:22,fontSize:10,padding:"0 4px",width:"auto",marginLeft:6,flexShrink:0},value:v.isAdmin?"admin":"user",disabled:R===b,onClick:z=>z.stopPropagation(),onChange:z=>{z.stopPropagation(),B(v,z.target.value==="admin")},title:"Admin status",children:[e.jsx("option",{value:"user",children:"User"}),e.jsx("option",{value:"admin",children:"Admin"})]}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Deactivate user",style:{marginLeft:4},onClick:z=>{z.stopPropagation(),w(v)},children:e.jsx(St,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),M&&e.jsxs("div",{className:"settings-card-body",style:{paddingTop:10},children:[e.jsx("span",{className:"settings-sub-label",style:{display:"block",margin:"0 0 8px"},children:"Role Assignments"}),N.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No role assignments yet."}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},children:N.map(z=>{const _=`${b}:${z.id}:${z.projectSpaceId}`;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,padding:"3px 0"},children:[e.jsx(ft,{size:11,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,minWidth:80},children:z.name}),e.jsx("span",{style:{color:"var(--muted)",fontSize:11},children:"in"}),e.jsx(Bt,{size:10,color:"var(--muted)",strokeWidth:1.5}),e.jsx("span",{style:{color:"var(--fg)",fontSize:11},children:z.projectSpaceName}),e.jsx("button",{className:"panel-icon-btn",title:"Remove assignment",disabled:F===_,onClick:()=>g(b,z.id,z.projectSpaceId),children:e.jsx(ht,{size:10,strokeWidth:2.5,color:"var(--danger, #f87171)"})})]},_)})}),s&&o.length>0&&c.length>0&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,paddingTop:6,borderTop:"1px solid var(--border)"},children:[e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((O=j[b])==null?void 0:O.roleId)||"",onChange:z=>h(_=>({..._,[b]:{..._[b]||{},roleId:z.target.value}})),children:o.map(z=>e.jsx("option",{value:z.id,children:z.name},z.id))}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",flexShrink:0},children:"in"}),e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((G=j[b])==null?void 0:G.spaceId)||"",onChange:z=>h(_=>({..._,[b]:{..._[b]||{},spaceId:z.target.value}})),children:c.map(z=>e.jsx("option",{value:z.id||z.ID,children:z.name||z.NAME},z.id||z.ID))}),e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:4,flexShrink:0},disabled:S===b,onClick:()=>A(b),children:[e.jsx(Me,{size:10,strokeWidth:2.5})," Assign"]})]})]})]},b)})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function mo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState("roles");return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid var(--border)"},children:[["roles","Roles"],["users","Users"]].map(([o,i])=>e.jsx("button",{onClick:()=>a(o),style:{background:"none",border:"none",cursor:"pointer",padding:"6px 16px",fontSize:12,fontWeight:600,color:r===o?"var(--accent)":"var(--muted)",borderBottom:r===o?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,letterSpacing:".02em"},children:i},o))}),r==="roles"?e.jsx(co,{userId:t,canWrite:s,toast:n}):e.jsx(po,{userId:t,canWrite:s,toast:n})]})}function uo({permissions:t,userId:s,canWrite:n,toast:r,onReload:a}){const[o,i]=l.useState(!1),[c,p]=l.useState(null),[d,x]=l.useState(!1),[f,k]=l.useState({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0});function T(){k({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0}),p("create")}function P(j){k({code:j.permissionCode,scope:j.scope,displayName:j.displayName,description:j.description||"",displayOrder:0}),p(j.permissionCode)}async function $(){x(!0);try{if(c==="create"){if(!f.code.trim()||!f.displayName.trim()){r("Code and label required","error"),x(!1);return}await X.createPermission(s,f.code.trim().toUpperCase(),f.scope,f.displayName.trim(),f.description.trim()||null,f.displayOrder),r("Permission created")}else await X.updatePermission(s,c,f.displayName.trim(),f.description.trim()||null,f.displayOrder),r("Permission updated");p(null),a()}catch(j){r(j,"error")}x(!1)}const u=["GLOBAL","NODE","LIFECYCLE"],y={};t.forEach(j=>{j.scope&&(y[j.scope]||(y[j.scope]=[]),y[j.scope].push(j))});const m=[...u.filter(j=>y[j]),...Object.keys(y).filter(j=>!u.includes(j)).sort()];return e.jsxs("div",{style:{marginBottom:16},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:4},onClick:()=>i(!o),children:[o?e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Fe,{size:13,strokeWidth:2,color:"var(--muted)"}),e.jsx(ft,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontSize:13,fontWeight:700},children:"Permission Catalog"}),e.jsxs("span",{style:{fontSize:11,color:"var(--muted)"},children:["(",t.length,")"]}),n&&o&&e.jsxs("button",{className:"btn btn-sm",style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:4},onClick:j=>{j.stopPropagation(),T()},children:[e.jsx(Me,{size:11})," Add"]})]}),o&&e.jsx("div",{style:{border:"1px solid var(--border)",borderRadius:6,overflow:"hidden",marginBottom:8},children:m.map(j=>{const h=y[j]||[];return h.length===0?null:e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--muted)",padding:"6px 10px",background:"var(--subtle-bg)",borderBottom:"1px solid var(--border)"},children:[j," scope"]}),h.map(S=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderBottom:"1px solid var(--border)",fontSize:12},children:[e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:180,fontWeight:500},children:S.permissionCode}),e.jsx("span",{style:{flex:1,color:"var(--text)"},children:S.displayName}),S.description&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:S.description}),n&&e.jsx("button",{className:"panel-icon-btn",title:"Edit",onClick:()=>P(S),style:{flexShrink:0,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(gt,{size:12})})]},S.permissionCode))]},j)})}),c&&e.jsxs(Qt,{title:c==="create"?"New Permission":`Edit ${c}`,onClose:()=>p(null),onSave:$,saving:d,saveLabel:c==="create"?"Create":"Save",children:[c==="create"&&e.jsxs(e.Fragment,{children:[e.jsx(We,{label:"Permission Code",children:e.jsx("input",{className:"field-input",value:f.code,onChange:j=>k(h=>({...h,code:j.target.value})),placeholder:"e.g. MANAGE_EXPORTS",style:{textTransform:"uppercase",fontFamily:"monospace"}})}),e.jsx(We,{label:"Scope",children:e.jsx("select",{className:"field-input",value:f.scope,onChange:j=>k(h=>({...h,scope:j.target.value})),children:[...u,...Object.keys(y).filter(j=>!u.includes(j)).sort()].filter((j,h,S)=>S.indexOf(j)===h).map(j=>e.jsx("option",{value:j,children:j},j))})})]}),e.jsx(We,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:f.displayName,onChange:j=>k(h=>({...h,displayName:j.target.value})),placeholder:"e.g. Manage Exports"})}),e.jsx(We,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,value:f.description,onChange:j=>k(h=>({...h,description:j.target.value})),placeholder:"Optional description"})})]})]})}function ho({scopeDef:t,allPermissions:s,roleId:n,projectSpaceId:r,userId:a,canWrite:o,toast:i}){const[c,p]=l.useState(null);l.useEffect(()=>{X.getGrantsForRoleAndScope(a,n,t.code).then(u=>{const y=(t.keys||[]).find(h=>{var S;return((S=h.values)==null?void 0:S.length)>0}),m=y==null?void 0:y.name,j=new Set((Array.isArray(u)?u:[]).map(h=>{var S;return`${h.permission_code}|${(S=h.keys)==null?void 0:S[m]}`}));p(j)}).catch(()=>p(new Set))},[n,t.code,a]);const d=(t.keys||[]).find(u=>{var y;return((y=u.values)==null?void 0:y.length)>0});if(!d)return null;const{name:x,values:f}=d,k=(s||[]).filter(u=>u.scope===t.code);if(k.length===0||f.length===0)return null;async function T(u,y){if(!o)return;const m=`${u}|${y}`,j=c==null?void 0:c.has(m);p(h=>{const S=new Set(h);return j?S.delete(m):S.add(m),S});try{const h={permissionCode:u,scopeCode:t.code,roleId:n,projectSpaceId:r,keys:{[x]:y}};j?await X.removeScopedGrant(a,h):await X.addScopedGrant(a,h)}catch(h){p(S=>{const W=new Set(S);return j?W.add(m):W.delete(m),W}),i(h,"error")}}const P=e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}),$=e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})});return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[t.code," Permissions"]}),t.description&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:t.description}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)"},children:e.jsx("code",{children:x})}),k.map(u=>e.jsx("th",{style:{textAlign:"center",padding:"4px 8px",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)",minWidth:80},children:e.jsx("code",{style:{color:"var(--accent)",fontSize:10},children:u.permissionCode})},u.permissionCode))]})}),e.jsx("tbody",{children:f.map(u=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 8px 4px 0"},children:e.jsx("code",{style:{color:"var(--text)"},children:u.label})}),k.map(y=>{const m=c===null,j=!m&&c.has(`${y.permissionCode}|${u.id}`);return e.jsx("td",{style:{textAlign:"center",padding:"4px 8px"},children:e.jsx("button",{className:"panel-icon-btn",disabled:m||!o,title:o?j?"Revoke from this role":"Grant to this role":"Requires MANAGE_ROLES",onClick:()=>T(y.permissionCode,u.id),style:{width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:m?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):j?P:$})},y.permissionCode)})]},u.id))})]})]})}function xo({userId:t,projectSpaceId:s,canWrite:n,toast:r}){const[a,o]=l.useState(null),[i,c]=l.useState([]),[p,d]=l.useState([]),[x,f]=l.useState([]),[k,T]=l.useState(null),[P,$]=l.useState({}),[u,y]=l.useState({}),[m,j]=l.useState(null);l.useEffect(()=>{Promise.all([X.getRoles(t),X.listPermissions(t),X.getNodeTypes(t),X.getLifecycles(t)]).then(async([w,A,g,B])=>{o(Array.isArray(w)?w:[]);const v=(Array.isArray(A)?A:[]).map(N=>({...N,permissionCode:N.permissionCode||N.permission_code,displayName:N.displayName||N.display_name,displayOrder:N.displayOrder??N.display_order}));c(v),d(Array.isArray(g)?g:[]);const b=Array.isArray(B)?B:[],M=[];await Promise.all(b.map(async N=>{const D=N.id||N.ID,O=await X.getLifecycleTransitions(t,D).catch(()=>[]);(Array.isArray(O)?O:[]).forEach(G=>{const z=G.from_state_name||G.fromStateName||"",_=G.name||G.NAME||G.id;M.push({id:G.id||G.ID,label:z?`${z} → ${_}`:_,lifecycleId:D})})})),f(M)}).catch(()=>{o([])}),X.getAccessRightsTree(t,s).then(j).catch(()=>j({scopes:[]}))},[t,s]);async function h(){const w=await X.listPermissions(t).catch(()=>[]),A=(Array.isArray(w)?w:[]).map(g=>({...g,permissionCode:g.permissionCode||g.permission_code,displayName:g.displayName||g.display_name,displayOrder:g.displayOrder??g.display_order}));c(A)}const S=i.filter(w=>w.scope==="GLOBAL"),W=i.filter(w=>w.scope==="NODE"),F=i.filter(w=>w.scope==="LIFECYCLE"),H=Object.fromEntries(((m==null?void 0:m.scopes)||[]).filter(w=>{var A;return(A=w.keys)==null?void 0:A.some(g=>{var B;return((B=g.values)==null?void 0:B.length)>0})}).map(w=>[w.code,w])),R=new Set(["GLOBAL","NODE","LIFECYCLE",...Object.keys(H)]),L=[...new Set(i.map(w=>w.scope).filter(w=>w&&!R.has(w)))],C=w=>i.filter(A=>A.scope===w);async function E(w){if(k===w){T(null);return}if(T(w),P[w]===void 0){const g=await X.getRoleGlobalPermissions(t,w).catch(()=>[]),B=new Set((Array.isArray(g)?g:[]).map(v=>v.permissionCode||v.permission_code));$(v=>({...v,[w]:B}))}const A=L.filter(g=>!H[g]);if(A.length>0&&!u[w]){const g=await Promise.all(A.map(async B=>{const v=await X.getRoleScopePermissions(t,w,B).catch(()=>[]),b=new Set((Array.isArray(v)?v:[]).map(M=>M.permissionCode||M.permission_code));return[B,b]}));y(B=>({...B,[w]:Object.fromEntries(g)}))}}async function U(w,A){if(!n)return;const g=(P[w]||new Set).has(A);$(B=>{const v=new Set(B[w]||[]);return g?v.delete(A):v.add(A),{...B,[w]:v}});try{g?await X.removeRoleGlobalPermission(t,w,A):await X.addRoleGlobalPermission(t,w,A)}catch(B){$(v=>{const b=new Set(v[w]||[]);return g?b.add(A):b.delete(A),{...v,[w]:b}}),r(B,"error")}}async function q(w,A,g){if(!n)return;const B=u[w]&&u[w][A]||new Set,v=B.has(g),b=new Set(B);v?b.delete(g):b.add(g),y(M=>({...M,[w]:{...M[w]||{},[A]:b}}));try{v?await X.removeRoleScopePermission(t,w,A,g):await X.addRoleScopePermission(t,w,A,g)}catch(M){y(N=>({...N,[w]:{...N[w]||{},[A]:B}})),r(M,"error")}}return a===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):a.length===0?e.jsx("div",{className:"settings-empty-row",children:"No roles defined. Create roles first in Users & Roles."}):e.jsxs("div",{className:"settings-list",children:[!n&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_ROLES"})]}),e.jsx(uo,{permissions:i,userId:t,canWrite:n,toast:r,onReload:h}),e.jsx("div",{className:"settings-sub-label",style:{marginBottom:6},children:"Role Grants"}),a.map(w=>{const A=k===w.id,g=P[w.id];return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>E(w.id),style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:A?e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Fe,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(ft,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:w.name}),e.jsx("span",{className:"settings-card-id",children:w.id}),w.description&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:w.description})]}),A&&e.jsxs("div",{className:"settings-card-body",children:[S.length>0&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("div",{className:"settings-sub-label",children:"Global Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role-only check — no node type context."}),S.map(B=>{const v=g===void 0,b=!v&&g.has(B.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:v||!n,title:n?b?`Revoke from ${w.name}`:`Grant to ${w.name}`:"Requires MANAGE_ROLES",onClick:()=>U(w.id,B.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:v?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):b?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:B.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:B.displayName})]},B.permissionCode)})]}),L.map(B=>{const v=C(B);if(v.length===0)return null;const b=u[w.id]&&u[w.id][B];return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[B," Permissions"]}),e.jsxs("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:["Role-only check — scope ",B," has no key context."]}),v.map(M=>{const N=b===void 0,D=!N&&b.has(M.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:N||!n,title:n?D?`Revoke from ${w.name}`:`Grant to ${w.name}`:"Requires MANAGE_ROLES",onClick:()=>q(w.id,B,M.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:N?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):D?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:M.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:M.displayName})]},M.permissionCode)})]},B)}),Object.values(H).map(B=>C(B.code).length>0?e.jsx(ho,{scopeDef:B,allPermissions:i,roleId:w.id,projectSpaceId:s,userId:t,canWrite:n,toast:r},B.code):null),(W.length>0||F.length>0)&&e.jsx(io,{userId:t,roleId:w.id,canWrite:n,toast:r,nodePerms:W,lcPerms:F,nodeTypes:p,transitions:x})]})]},w.id)})]})}function fo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState([]),[o,i]=l.useState(null),[c,p]=l.useState(!1),[d,x]=l.useState(""),[f,k]=l.useState(!1),T=["pno","platform","spe"];async function P(){try{const[m,j]=await Promise.all([mt.getEnvironment(),mt.getStatus()]);a(m.expectedServices||[]),i(j)}catch(m){n((m==null?void 0:m.message)||String(m),"error")}}l.useEffect(()=>{P()},[]);const $={};((o==null?void 0:o.services)||[]).forEach(m=>{$[m.serviceCode]=m});async function u(){const m=d.trim();if(m){k(!0);try{await mt.addExpectedService(m),x(""),p(!1),n("Service added","success"),P()}catch(j){n((j==null?void 0:j.message)||String(j),"error")}finally{k(!1)}}}async function y(m){if(window.confirm(`Remove expected service '${m}'?`)){k(!0);try{const j=await mt.removeExpectedService(m);j!=null&&j.baseline?n("Cannot remove baseline service","error"):n("Service removed","success"),P()}catch(j){n((j==null?void 0:j.message)||String(j),"error")}finally{k(!1)}}}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Expected Services"}),e.jsx("span",{style:{fontSize:12,color:"var(--muted2)"},children:"Services the platform expects to be running"}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!c&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>p(!0),children:[e.jsx(Me,{size:11,strokeWidth:2}),"Add service"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only access"}),c&&e.jsx("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",placeholder:"Service code (e.g. my-service)",value:d,onChange:m=>x(m.target.value),onKeyDown:m=>m.key==="Enter"&&u(),style:{flex:1,maxWidth:300},autoFocus:!0}),e.jsx("button",{className:"btn btn-primary btn-xs",onClick:u,disabled:f,children:"Add"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{p(!1),x("")},children:"Cancel"})]})}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service Code"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Instances"}),e.jsx("th",{children:"Version"}),e.jsx("th",{style:{width:80}})]})}),e.jsxs("tbody",{children:[r.map(m=>{const j=$[m],h=T.includes(m),S=(j==null?void 0:j.status)||"missing",W={up:"#4dd4a0",degraded:"#f0b429",down:"#fc8181",missing:"#6b8099"},F=W[S]||W.missing;return e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("code",{style:{fontSize:12},children:m}),h&&e.jsx("span",{className:"settings-badge",style:{marginLeft:8,fontSize:10},children:"baseline"})]}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot",style:{marginRight:6,background:F,boxShadow:`0 0 6px ${F}`}}),S]}),e.jsx("td",{children:j?`${j.healthyInstances??0}/${j.instanceCount??0}`:"–"}),e.jsx("td",{style:{fontFamily:"var(--mono)",fontSize:11},children:(j==null?void 0:j.version)||"–"}),e.jsx("td",{children:s&&!h&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>y(m),disabled:f,children:"Remove"})})]},m)}),r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{textAlign:"center",color:"var(--muted)",padding:24},children:"No expected services configured (dynamic discovery mode)"})})]})]})]})}function go({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState({}),[c,p]=l.useState({}),[d,x]=l.useState(null),[f,k]=l.useState(!1);async function T(){try{const h=await X.listSecrets(t);a(Array.isArray(h)?h.map(S=>S.key).sort():[])}catch(h){n((h==null?void 0:h.message)||String(h),"error"),a([])}}l.useEffect(()=>{T()},[t]);async function P(h){if(o[h]!==void 0){i(S=>{const W={...S};return delete W[h],W});return}i(S=>({...S,[h]:null}));try{const S=await X.revealSecret(t,h);i(W=>({...W,[h]:(S==null?void 0:S.value)??""}))}catch(S){n((S==null?void 0:S.message)||String(S),"error"),i(W=>{const F={...W};return delete F[h],F})}}function $(h){p(S=>({...S,[h]:o[h]??""}))}function u(h){p(S=>{const W={...S};return delete W[h],W})}async function y(h){k(!0);try{await X.updateSecret(t,h,c[h]),n(`Updated '${h}'`,"success"),u(h),o[h]!==void 0&&i(S=>({...S,[h]:c[h]}))}catch(S){n((S==null?void 0:S.message)||String(S),"error")}finally{k(!1)}}async function m(h){if(window.confirm(`Delete secret '${h}'? This cannot be undone.`)){k(!0);try{await X.deleteSecret(t,h),n(`Deleted '${h}'`,"success"),i(S=>{const W={...S};return delete W[h],W}),T()}catch(S){n((S==null?void 0:S.message)||String(S),"error")}finally{k(!1)}}}async function j(){var h;if(!((h=d==null?void 0:d.key)!=null&&h.trim())){n("Key required","error");return}k(!0);try{await X.createSecret(t,d.key.trim(),d.value??""),n(`Created '${d.key}'`,"success"),x(null),T()}catch(S){const W=((S==null?void 0:S.message)||String(S)).includes("409")?"Key already exists":(S==null?void 0:S.message)||String(S);n(W,"error")}finally{k(!1)}}return r===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Secrets"}),e.jsxs("span",{style:{fontSize:12,color:"var(--muted2)"},children:["Vault path: ",e.jsx("code",{children:"secret/plm"})]}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!d&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>x({key:"",value:""}),children:[e.jsx(Me,{size:11,strokeWidth:2}),"Add secret"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only — MANAGE_SECRETS not granted to your role."}),d&&e.jsxs("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:8},children:[e.jsx("input",{className:"field-input",placeholder:"key (e.g. plm.s3.access-key)",value:d.key,onChange:h=>x(S=>({...S,key:h.target.value})),style:{flex:1}}),e.jsx("input",{className:"field-input",placeholder:"value",value:d.value,onChange:h=>x(S=>({...S,value:h.target.value})),style:{flex:2}})]}),e.jsxs("div",{style:{display:"flex",gap:6,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>x(null),disabled:f,children:"Cancel"}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:j,disabled:f,children:"Create"})]})]}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"40%"},children:"Key"}),e.jsx("th",{children:"Value"}),e.jsx("th",{style:{width:220,textAlign:"right"},children:"Actions"})]})}),e.jsxs("tbody",{children:[r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:3,style:{color:"var(--muted2)"},children:"No secrets yet."})}),r.map(h=>{const S=o[h],W=c[h]!==void 0,F=S!==void 0;return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:h})}),e.jsx("td",{children:W?e.jsx("input",{className:"field-input",value:c[h],onChange:H=>p(R=>({...R,[h]:H.target.value})),style:{width:"100%"},autoFocus:!0}):F?S===null?e.jsx("span",{style:{color:"var(--muted2)"},children:"loading…"}):e.jsx("code",{children:S}):e.jsx("span",{style:{letterSpacing:2,color:"var(--muted2)"},children:"••••••••"})}),e.jsx("td",{style:{textAlign:"right"},children:e.jsx("div",{style:{display:"inline-flex",gap:6,justifyContent:"flex-end"},children:W?e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>y(h),disabled:f,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>u(h),disabled:f,children:"Cancel"})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>P(h),title:F?"Hide value":"Reveal value",children:F?"Hide":"Reveal"}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn btn-xs",style:{display:"inline-flex",alignItems:"center",gap:4},onClick:()=>$(h),disabled:!F,title:F?"Edit value":"Reveal first to edit",children:[e.jsx(gt,{size:10,strokeWidth:2}),"Edit"]}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>m(h),disabled:f,title:"Delete secret",children:e.jsx(St,{size:10,strokeWidth:2})})]})]})})})]},h)})]})]})]})}function bo({userId:t,toast:s}){const[n,r]=l.useState(null),[a,o]=l.useState(null),[i,c]=l.useState(null),[p,d]=l.useState(null),[x,f]=l.useState(null);async function k(){try{const[m,j,h,S]=await Promise.all([X.getRegistryGrouped(t).catch(()=>({})),X.getRegistryTagsAdmin(t).catch(()=>null),X.getRegistryOverview(t).catch(()=>null),X.getUiManifest().catch(()=>null)]);r(m),o(j),c(h),f(S),d(null)}catch(m){d(m.message||String(m))}}if(l.useEffect(()=>{k();const m=setInterval(k,5e3);return()=>clearInterval(m)},[]),p)return e.jsxs("div",{className:"settings-empty-row",children:["Failed to load registry: ",p]});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const T=Object.keys(n).sort(),P=m=>{if(!m)return null;const j=Date.now()-new Date(m).getTime();return Math.max(0,Math.round(j/1e3))},$=m=>m==null?"—":m<60?`${m}s`:m<3600?`${Math.round(m/60)}m`:`${Math.round(m/3600)}h`,u=(i==null?void 0:i.services)||{},y=(i==null?void 0:i.settingsRegistrations)||[];return e.jsxs("div",{className:"settings-list",children:[e.jsx("div",{className:"settings-sub-label",children:"Platform Federation"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Per-service summary as seen by platform-api (",(i==null?void 0:i.self)||"platform","). Settings tabs registered, live item contributions probed via ","/internal/items/visible",". Refreshes every 5s."]}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instances"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Settings tabs"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Items"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Creatable"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Listable"})]})}),e.jsxs("tbody",{children:[Object.keys(u).sort().map(m=>{const j=u[m]||{};return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m}),e.jsx("td",{style:{padding:"4px 6px"},children:j.instances??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.settingsSections??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.itemDescriptors??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.creatableItems??0}),e.jsx("td",{style:{padding:"4px 6px"},children:j.listableItems??0})]},m)}),Object.keys(u).length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:6,style:{padding:"4px 6px",color:"var(--muted2)"},children:"No services known."})})]})]}),y.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",children:"Settings Registrations"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"Sections actively registered by each service against this platform-api."}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Sections"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Registered at"})]})}),e.jsx("tbody",{children:y.map(m=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.instanceId}),e.jsx("td",{style:{padding:"4px 6px"},children:(m.sections||[]).map(j=>j.key).join(", ")||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:m.registeredAt||"—"})]},m.serviceCode+":"+m.instanceId))})]})]}),e.jsx("div",{className:"settings-sub-label",children:"UI Plugin Registrations"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:["Plugin bundles declared by each service and loaded by the shell at boot. Source: ",e.jsx("code",{style:{fontSize:11},children:"/api/platform/ui/manifest"}),"."]}),x==null?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"Manifest unavailable."}):x.length===0?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"No UI plugins declared."}):e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Plugin ID"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Zone"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Bundle URL"})]})}),e.jsx("tbody",{children:x.map(m=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.pluginId}),e.jsx("td",{style:{padding:"4px 6px"},children:e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)"},children:m.zone})}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace",color:"var(--muted2)"},children:m.url})]},m.pluginId))})]}),e.jsx("div",{className:"settings-sub-label",children:"Registered Services (platform-api)"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Live snapshot from platform-api environment registry. ",T.length," service",T.length===1?"":"s"," known."]}),T.length===0?e.jsx("div",{className:"settings-empty-row",children:"No services registered."}):T.map(m=>{const j=n[m]||[],h=j.filter(S=>S.healthy).length;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{className:"settings-card-name",style:{fontFamily:"monospace"},children:m}),e.jsxs("span",{style:{fontSize:10,color:h===j.length?"var(--success)":"var(--warn)"},children:[h,"/",j.length," healthy"]})]}),e.jsx("div",{className:"settings-card-body",children:e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Base URL"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Version"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Tag"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Health"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Last HB"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Failures"})]})}),e.jsx("tbody",{children:j.map(S=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:S.instanceId}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:S.baseUrl}),e.jsx("td",{style:{padding:"4px 6px"},children:S.version||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:S.spaceTag||"—"}),e.jsx("td",{style:{padding:"4px 6px",color:S.healthy?"var(--success)":"var(--danger, #e05252)"},children:S.healthy?"OK":"DOWN"}),e.jsx("td",{style:{padding:"4px 6px"},children:$(P(S.lastHeartbeatOk))}),e.jsx("td",{style:{padding:"4px 6px"},children:S.consecutiveFailures??0})]},S.instanceId))})]})})]},m)}),a&&Object.keys(a).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",style:{marginTop:16},children:"Project Space Tags"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Service ↔ space-tag affinity (used by gateway routing)."}),e.jsx("pre",{style:{fontSize:11,background:"var(--bg2)",padding:8,borderRadius:4},children:JSON.stringify(a,null,2)})]})]})}function vo({sectionKey:t,userId:s,projectSpaceId:n,canWrite:r,toast:a,pluginsLoaded:o}){if(t===null)return e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading…"});const c=Ga(t)??_a(t);if(!c)return o?e.jsxs("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:["Unknown section: ",t]}):e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading plugins…"});const{Component:p,wrapBody:d}=c,x=e.jsx(p,{userId:s,projectSpaceId:n,canWrite:r,toast:a});return d?e.jsx("div",{className:"settings-content-body",children:x}):x}function yo({userId:t,projectSpaceId:s,activeSection:n,onSectionChange:r,settingsSections:a,pluginsLoaded:o,toast:i}){const c=l.useMemo(()=>{const d={};return(a||[]).forEach(x=>x.sections.forEach(f=>{d[f.key]=f.canWrite})),d},[a]),p=l.useMemo(()=>{if(!a)return n;for(const d of a){const x=d.sections.find(f=>f.key===n);if(x)return x.label}return n},[a,n]);return e.jsxs("div",{className:"settings-content",children:[e.jsx("div",{className:"settings-content-hd",children:e.jsx("span",{className:"settings-content-title",children:p})}),e.jsx(vo,{sectionKey:n,userId:t,projectSpaceId:s,canWrite:c[n]??!1,pluginsLoaded:o,toast:i})]})}Ke("my-profile",ro);Ke("api-playground",La,{wrapBody:!1});Ke("user-manual",Da,{wrapBody:!1});Ke("proj-spaces",lo);Ke("users-roles",mo);Ke("access-rights",xo);Ke("secrets",go);Ke("service-registry",bo);Ke("platform-environment",fo);Ke("actions-catalog",Ha);Ke("platform-algorithms",Ya);class is extends De.Component{constructor(s){super(s),this.state={hasError:!1,error:null}}static getDerivedStateFromError(s){return{hasError:!0,error:s}}componentDidCatch(s,n){console.error("ErrorBoundary caught:",s,n)}render(){var s;return this.state.hasError?this.props.fallback||e.jsxs("div",{style:{padding:24,color:"#e74c3c"},children:[e.jsx("strong",{children:"Something went wrong."}),e.jsx("pre",{style:{fontSize:12,marginTop:8},children:(s=this.state.error)==null?void 0:s.message})]}):this.props.children}}const qs={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function jo({userId:t,serviceCode:s,txId:n,txNodes:r,stateColorMap:a,onCommitted:o,onClose:i,toast:c}){const[p,d]=l.useState(""),[x,f]=l.useState(!1),k=(r||[]).map(m=>m.itemId||m.node_id||m.NODE_ID),[T,P]=l.useState(()=>new Set(k));function $(m){P(j=>{const h=new Set(j);return h.has(m)?h.delete(m):h.add(m),h})}function u(){P(T.size===k.length?new Set:new Set(k))}async function y(){if(!p.trim()){c("Commit comment is required","warn");return}if(T.size===0){c("Select at least one object to commit","warn");return}f(!0);try{const m=T.size===k.length?null:[...T],j=await ut.commit(t,s,n,p,m),h=(j==null?void 0:j.continuationTxId)||null,S=k.length-T.size;c("Transaction committed","success"),o(h,S),i()}catch(m){c(m,"error")}finally{f(!1)}}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true","aria-labelledby":"commit-title",children:e.jsxs("div",{className:"card commit-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",id:"commit-title",children:"Commit transaction"}),e.jsx("button",{className:"btn btn-sm",onClick:i,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:"commit-comment",children:["Commit comment ",e.jsx("span",{className:"field-req","aria-label":"required",children:"*"})]}),e.jsx("input",{id:"commit-comment",className:"field-input",placeholder:"Describe what you changed…",value:p,onChange:m=>d(m.target.value),autoFocus:!0})]}),(r==null?void 0:r.length)>0&&e.jsxs("div",{className:"commit-node-list",children:[e.jsx("div",{className:"commit-node-list-hd",children:e.jsxs("label",{className:"commit-node-all",children:[e.jsx("input",{type:"checkbox",checked:T.size===k.length,onChange:u}),e.jsx("span",{children:"Objects to commit"}),e.jsxs("span",{className:"commit-node-count",children:[T.size,"/",k.length]})]})}),e.jsx("div",{className:"commit-node-list-scroll",children:r.map(m=>{const j=m.itemId||m.node_id||m.NODE_ID,h=m.logicalId||m.logical_id||m.LOGICAL_ID||j,S=m.nodeTypeName||m.node_type_name||m.NODE_TYPE_NAME||"",W=m.revision||m.REVISION||"A",F=m.iteration??m.ITERATION??1,H=(m.changeType||m.change_type||m.CHANGE_TYPE||"CONTENT").toUpperCase(),R=m.lifecycleStateId||m.lifecycle_state_id||m.LIFECYCLE_STATE_ID||"",L=qs[H]||qs.CONTENT;return e.jsxs("label",{className:"commit-node-item",children:[e.jsx("input",{type:"checkbox",checked:T.has(j),onChange:()=>$(j)}),e.jsx("span",{className:"commit-node-dot",style:{background:(a==null?void 0:a[R])||"#6b7280"}}),e.jsx("span",{className:"commit-node-lid",children:h}),e.jsx("span",{className:"commit-node-rev",children:F===0?W:`${W}.${F}`}),e.jsx("span",{className:"commit-node-type",children:S}),e.jsx("span",{className:"commit-node-badge",style:{background:L.bg,color:L.color},children:L.label})]},j)})})]}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:14},children:"Committed objects become visible to everyone. Uncommitted objects stay in a new transaction."}),e.jsxs("div",{className:"row flex-end",style:{gap:8},children:[e.jsx("button",{className:"btn",onClick:i,children:"Cancel"}),e.jsx("button",{className:"btn btn-success",onClick:y,disabled:x||!p.trim()||T.size===0,children:x?"Committing…":"✓ Commit"})]})]})]})})}function wo({resources:t,onCreated:s,onClose:n,toast:r,initialDescriptor:a}){const o=l.useMemo(()=>{const R=new Set,L=[];for(const C of t||[]){const E=C.sourceLabel||"OTHER";R.has(E)||(R.add(E),L.push(E))}return L},[t]),[i,c]=l.useState((a==null?void 0:a.sourceLabel)||o[0]||""),p=l.useMemo(()=>(t||[]).filter(R=>(R.sourceLabel||"OTHER")===i),[t,i]),[d,x]=l.useState(()=>a?(t||[]).find(R=>R.serviceCode===a.serviceCode&&R.itemCode===a.itemCode)||null:p[0]||null);l.useEffect(()=>{a||x(p[0]||null)},[i]);const[f,k]=l.useState({}),[T,P]=l.useState({}),[$,u]=l.useState(!1);if(l.useEffect(()=>{k({}),P({})},[d]),!d)return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsx("div",{className:"modal-scroll",style:{padding:24,color:"var(--muted)"},children:"No creatable resources available."})]})});const y=d.create,m=((y==null?void 0:y.parameters)||[]).slice().sort((R,L)=>(R.displayOrder||0)-(L.displayOrder||0)),j=[];let h=null;for(const R of m){const L=R.displaySection||"Fields";(j.length===0||L!==h)&&(j.push({section:L,items:[]}),h=L),j[j.length-1].items.push(R)}function S(R,L){k(C=>({...C,[R]:L})),P(C=>({...C,[R]:null}))}function W(){const R={};for(const L of m){const C=f[L.name];if(L.required&&(C==null||C===""||C instanceof File&&C.size===0)&&(R[L.name]="Required"),L.validationRegex&&typeof C=="string"&&C.trim())try{new RegExp(`^(?:${L.validationRegex})$`).test(C.trim())||(R[L.name]=`Does not match pattern: ${L.validationRegex}`)}catch{}}return P(R),Object.keys(R).length===0}async function F(){if(W()){u(!0);try{const R=await X.createResource(d,f);r(`${d.displayName||d.itemCode} created`,"success"),s==null||s(R,d),n()}catch(R){r(R,"error")}finally{u(!1)}}}function H(R){const L=(R.widgetType||"TEXT").toUpperCase(),C=T[R.name],E=f[R.name];if(L==="FILE")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("input",{id:`f-${R.name}`,type:"file",className:`field-input${C?" error":""}`,onChange:A=>{var g;return S(R.name,((g=A.target.files)==null?void 0:g[0])||null)}}),R.tooltip&&e.jsx("span",{className:"field-hint",children:R.tooltip}),C&&e.jsx("span",{className:"field-hint error",role:"alert",children:C})]},R.name);if(L==="TEXTAREA")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("textarea",{id:`f-${R.name}`,className:`field-input${C?" error":""}`,placeholder:R.tooltip||"",value:E||"",onChange:A=>S(R.name,A.target.value)}),C&&e.jsx("span",{className:"field-hint error",role:"alert",children:C})]},R.name);if(L==="DROPDOWN"||L==="SELECT"){const A=R.allowedValues?So(R.allowedValues):[];return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("select",{id:`f-${R.name}`,className:`field-input${C?" error":""}`,value:E||"",onChange:g=>S(R.name,g.target.value),children:[e.jsx("option",{value:"",children:"— select —"}),A.map(g=>e.jsx("option",{children:g},g))]}),C&&e.jsx("span",{className:"field-hint error",role:"alert",children:C})]},R.name)}const U=(E||"").toString().trim(),q=R.validationRegex?ko(`^(?:${R.validationRegex})$`):null,w=!q||!U?null:q.test(U);return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("div",{className:"logical-id-wrap",children:[e.jsx("input",{id:`f-${R.name}`,type:L==="NUMBER"?"number":"text",className:`field-input${C?" error":w===!0?" ok":w===!1?" error":""}`,placeholder:R.tooltip||(R.validationRegex?`pattern: ${R.validationRegex}`:""),value:E||"",onChange:A=>S(R.name,A.target.value)}),U&&q&&e.jsx("span",{className:`logical-id-badge ${w?"ok":"err"}`,children:w?"✓":"✗"})]}),R.validationRegex&&e.jsxs("div",{className:"logical-id-hint",children:[e.jsx("span",{className:"logical-id-hint-label",children:"Pattern"}),e.jsx("code",{className:"logical-id-hint-code",children:R.validationRegex}),!U&&e.jsx("span",{className:"logical-id-hint-idle",children:"start typing to validate"}),U&&w===!1&&e.jsx("span",{className:"logical-id-hint-err",children:"no match"}),U&&w===!0&&e.jsx("span",{className:"logical-id-hint-ok",children:"matches"})]}),!R.validationRegex&&R.tooltip&&e.jsx("span",{className:"field-hint",children:R.tooltip}),C&&e.jsx("span",{className:"field-hint error",role:"alert",children:C})]},R.name)}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"modal-scroll",children:[e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsxs("div",{className:"field",style:{margin:0,flex:"0 0 180px"},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-source",children:"Source"}),e.jsx("select",{id:"rc-source",className:"field-input",value:i,onChange:R=>c(R.target.value),disabled:!!a,children:o.map(R=>e.jsx("option",{value:R,children:R},R))})]}),e.jsxs("div",{className:"field",style:{margin:0,flex:1},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-type",children:"Type"}),e.jsx("select",{id:"rc-type",className:"field-input",value:d?`${d.serviceCode}/${d.itemCode}/${d.itemKey||""}`:"",onChange:R=>{const L=R.target.value,C=p.find(E=>`${E.serviceCode}/${E.itemCode}`===L);C&&x(C)},disabled:!!a,children:p.map(R=>{const L=`${R.serviceCode}/${R.itemCode}`;return e.jsx("option",{value:L,children:R.displayName},L)})})]})]}),d.description&&e.jsx("div",{style:{padding:"12px 0 0",color:"var(--muted)",fontSize:12},children:d.description}),j.map((R,L)=>e.jsxs(De.Fragment,{children:[e.jsx("div",{className:"modal-identity-sep",style:{marginTop:L===0?16:18},children:e.jsx("span",{children:R.section})}),R.items.map(C=>H(C))]},`grp-${L}-${R.section}`))]}),e.jsx("div",{className:"card-hd",style:{borderTop:"1px solid var(--border)",borderBottom:"none"},children:e.jsxs("div",{className:"row flex-end",style:{width:"100%",gap:8},children:[e.jsx("button",{className:"btn",onClick:n,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:F,disabled:$,children:$?"Creating…":"Create"})]})})]})})}function ko(t){try{return new RegExp(t)}catch{return null}}function So(t){try{return JSON.parse(t)}catch{return[]}}function No({detail:t,onClose:s}){var a;const n=t.category==="TECHNICAL",r=n&&Array.isArray(t.stackTrace)?t.stackTrace.join(`
`):null;return e.jsx("div",{className:"overlay",onClick:s,role:"dialog","aria-modal":"true","aria-label":"Error detail",children:e.jsxs("div",{className:`card ${n?"err-card-tech":"err-card-func"}`,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",style:{color:n?"var(--danger)":"var(--warn)"},children:n?"✗ Unexpected error":"⚠ Error"}),e.jsx("button",{className:"btn btn-sm",onClick:s,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:`card-body ${n?"err-body":""}`,children:[e.jsx("div",{className:"err-message",children:t.error}),((a=t.violations)==null?void 0:a.length)>0&&e.jsx("ul",{className:"violations-list",children:t.violations.map((o,i)=>e.jsx("li",{className:"violation-item",children:typeof o=="string"?o:o.message},i))}),n&&t.type&&e.jsx("div",{className:"err-meta",children:t.type}),t.path&&e.jsx("div",{className:"err-meta",children:t.path}),r&&e.jsx("pre",{className:"stack-trace",children:r})]})]})})}function Co(t){const s=t.value;if(s==null||s==="")return e.jsx("span",{style:{color:"var(--muted2)"},children:"—"});switch(t.widget){case"datetime":{try{const n=new Date(s);if(!isNaN(n.getTime()))return n.toLocaleString()}catch{}return String(s)}case"code":return e.jsx("code",{style:{fontSize:10,wordBreak:"break-all"},children:String(s)});case"number":return e.jsx("span",{style:{fontFamily:"var(--mono)"},children:Number(s).toLocaleString()});case"link":return e.jsx("a",{href:String(s),target:"_blank",rel:"noreferrer",children:String(s)});case"badge":return e.jsx("span",{className:"settings-badge",children:String(s)});case"image":return e.jsx("img",{src:String(s),alt:t.label,style:{maxWidth:"100%",maxHeight:240}});case"multiline":return e.jsx("pre",{style:{margin:0,whiteSpace:"pre-wrap",fontSize:12},children:String(s)});default:return String(s)}}function Dn({tab:t,ctx:s,descriptorOverride:n}){var E,U,q;const{userId:r,toast:a}=s||{},o=n||t.get||{},i=o.path,c=(o.httpMethod||"GET").toUpperCase(),p=(n==null?void 0:n.serviceCode)||t.serviceCode,d=p?`/api/${p}`:"",[x,f]=l.useState(null),[k,T]=l.useState(null),[P,$]=l.useState(!0),[u,y]=l.useState(null),[m,j]=l.useState(null),[h,S]=l.useState(!1),[W,F]=l.useState(!1),[H,R]=l.useState(null),L=l.useCallback(async()=>{if(!i||!t.nodeId){T("No get action declared for this source"),$(!1);return}$(!0),T(null);try{const w=d+i.replace("{id}",encodeURIComponent(t.nodeId)),A=await X.gatewayJson(c,w);f(A)}catch(w){T((w==null?void 0:w.message)||String(w))}finally{$(!1)}},[i,c,t.nodeId,d]);l.useEffect(()=>{L()},[L]),l.useEffect(()=>{var g;const w=(g=x==null?void 0:x.metadata)==null?void 0:g.downloadUrl;if(!w){j(null),F(!1),R(null);return}let A=!1;return S(!0),X.gatewayRawText(w).then(({text:B,truncated:v,totalBytes:b})=>{A||(j(B),F(v),R(b),S(!1))}).catch(()=>{A||(j(null),S(!1))}),()=>{A=!0}},[(E=x==null?void 0:x.metadata)==null?void 0:E.downloadUrl]),l.useEffect(()=>{var w;(w=s==null?void 0:s.onRegisterPreview)==null||w.call(s,{text:m,truncated:W,totalBytes:H,loading:h})},[m,h,W,H]),l.useEffect(()=>()=>{var w;(w=s==null?void 0:s.onRegisterPreview)==null||w.call(s,null)},[t.nodeId]);async function C(w){var A,g;if(!(w.confirmRequired&&!window.confirm(`${w.label}?

${w.description||""}`))){if((A=w.metadata)!=null&&A.openInNewTab){window.open(d+w.path.replace("{id}",encodeURIComponent(t.nodeId)),"_blank","noreferrer");return}y(w.code);try{const B=d+w.path.replace("{id}",encodeURIComponent(t.nodeId));await X.gatewayJson(w.httpMethod,B,(g=w.parameters)!=null&&g.length?{}:void 0),a&&a(`${w.label} done`,"success"),L()}catch(B){a&&a(B,"error")}finally{y(null)}}}return P?e.jsx("div",{className:"settings-loading",children:"Loading…"}):k?e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⚠"}),e.jsx("div",{className:"editor-empty-text",children:"Failed to load"}),e.jsx("div",{className:"editor-empty-hint",children:k})]}):x?e.jsxs("div",{style:{padding:24,overflow:"auto",height:"100%",boxSizing:"border-box"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:4},children:[x.color&&e.jsx("span",{style:{width:10,height:10,borderRadius:2,background:x.color,flexShrink:0}}),e.jsx("h2",{style:{margin:0,fontSize:18},children:x.title||x.id}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"},children:x.id})]}),x.subtitle&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:16},children:x.subtitle}),x.actions&&x.actions.length>0&&e.jsx("div",{style:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},children:x.actions.map(w=>e.jsx("button",{className:`btn btn-sm ${w.dangerous?"btn-danger":"btn-primary"}`,onClick:()=>C(w),disabled:u===w.code,title:w.description||w.label,children:u===w.code?"…":w.label},w.code))}),e.jsx("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse",marginBottom:24},children:e.jsx("tbody",{children:x.fields.map(w=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsxs("td",{style:{padding:"6px 8px",color:"var(--muted)",width:180,verticalAlign:"top"},children:[w.label,w.hint&&e.jsx("div",{style:{fontSize:10,color:"var(--muted2)"},children:w.hint})]}),e.jsx("td",{style:{padding:"6px 8px"},children:Co(w)})]},w.name))})}),((U=x.metadata)==null?void 0:U.isImage)&&((q=x.metadata)==null?void 0:q.downloadUrl)&&e.jsxs("div",{children:[e.jsx("div",{className:"settings-sub-label",style:{marginBottom:8},children:"Preview"}),e.jsx("img",{src:x.metadata.downloadUrl,alt:x.title,style:{maxWidth:"100%",maxHeight:480,border:"1px solid var(--border)",borderRadius:4}})]})]}):null}const Eo={match:{serviceCode:"*"},name:"default",Editor:Dn,hasItemChildren:()=>!1},On=256*1024*1024,Ss=Math.max(1,Math.min(navigator.hardwareConcurrency||2,4)),tt=Array.from({length:Ss},()=>new Worker(new URL("/assets/stepWorker-BXK_CxMf.js",import.meta.url),{type:"module"}));tt.forEach(t=>{t.addEventListener("message",({data:s})=>{s.type==="log"&&fe.getState().appendLog(s.level,s.message)})});function To(t){let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)>>>0;return tt[s%Ss]}function Js({idb:t=!1}={}){tt.forEach(s=>s.postMessage({type:"clear",idb:t}))}function zo(t){tt.forEach(s=>s.postMessage({type:"setMaxBytes",maxBytes:t}))}const ls={postMessage(t){t.uuid?To(t.uuid).postMessage(t):tt.forEach(s=>s.postMessage(t))},addEventListener(t,s){tt.forEach(n=>n.addEventListener(t,s))},removeEventListener(t,s){tt.forEach(n=>n.removeEventListener(t,s))}},Io=()=>({entries:0,cacheBytes:0,maxBytes:On,memHits:0,idbHits:0,netFetches:0,avgDownloadMs:null,avgParseMs:null});function Xs(t,s){const n=t.map(r=>r[s]).filter(r=>r!=null);return n.length?n.reduce((r,a)=>r+a,0)/n.length:null}function Ao(){const t=l.useRef(tt.map(Io)),[,s]=l.useState(0);l.useEffect(()=>{const r=tt.map((a,o)=>{const i=({data:c})=>{c.type==="stats"&&(t.current[o]={entries:c.entries,cacheBytes:c.cacheBytes,maxBytes:c.maxBytes??On,memHits:c.memHits??0,idbHits:c.idbHits??0,netFetches:c.netFetches??0,avgDownloadMs:c.avgDownloadMs??null,avgParseMs:c.avgParseMs??null},s(p=>p+1))};return a.addEventListener("message",i),a.postMessage({type:"stats"}),i});return()=>tt.forEach((a,o)=>a.removeEventListener("message",r[o]))},[]);const n=t.current;return{workers:Ss,entries:n.reduce((r,a)=>r+a.entries,0),cacheBytes:n.reduce((r,a)=>r+a.cacheBytes,0),maxBytes:n.reduce((r,a)=>r+a.maxBytes,0),memHits:n.reduce((r,a)=>r+a.memHits,0),idbHits:n.reduce((r,a)=>r+a.idbHits,0),netFetches:n.reduce((r,a)=>r+a.netFetches,0),avgDownloadMs:Xs(n,"avgDownloadMs"),avgParseMs:Xs(n,"avgParseMs")}}function $o({nodes:t=[],loading:s=!1,onNavigateToNode:n}){var v;const r=l.useRef(null),a=l.useRef(null),o=l.useRef(null),i=l.useRef(null),c=l.useRef(null),p=l.useRef(null),d=l.useRef(null),x=l.useRef({}),f=l.useRef(new Set),k=l.useRef({}),T=l.useRef({}),P=l.useRef(n),$=l.useRef(null),u=l.useRef({}),y=l.useRef([]),m=l.useRef(null);l.useEffect(()=>{P.current=n},[n]);const[j,h]=l.useState({}),[S,W]=l.useState(()=>new Set),[F,H]=l.useState(()=>new Set),R=(v=t[0])==null?void 0:v.nodeId;l.useEffect(()=>{W(new Set)},[R]);const[L,C]=l.useState(!1);l.useEffect(()=>{const b={},M={};t.forEach(N=>N.parts.forEach(D=>{const O=D.instanceKey||D.uuid;b[O]=N.nodeId,M[O]=N.stateColor||"#6b7280"})),k.current=b,T.current=M,Object.entries(M).forEach(([N,D])=>{const O=x.current[N];if(!O)return;const G=new At(D);O.traverse(z=>{z.isMesh&&z.userData.isOutline&&z.material.uniforms.color.value.copy(G)})})},[t]);const U=t.flatMap(b=>b.parts).filter(b=>!S.has(b.instanceKey||b.uuid)),q=U.map(b=>`${b.instanceKey||b.uuid}@${b.matrix?b.matrix.join(","):"I"}`).join("|");y.current=U,l.useEffect(()=>{const b=r.current;if(!b)return;const M=b.clientWidth||600,N=b.clientHeight||400,D=()=>{const se=getComputedStyle(document.documentElement).getPropertyValue("--scene-bg").trim();return new At(se||"#1c1c2a")},O=new Mr;O.background=D(),O.add(new _r(16777215,.7));const G=new Wr(16777215,1.2);G.position.set(8,12,6),O.add(G);const z=new Fr(45,M/N,1e-4,1e5);z.position.set(0,5,10);const _=new Ur({antialias:!0});_.setPixelRatio(window.devicePixelRatio),_.setSize(M,N),b.appendChild(_.domElement);const K=new Gr(z,_.domElement);K.enableDamping=!0,K.dampingFactor=.08;const ee=new Hr(z,_,{size:80,container:b});ee.attachControls(K),a.current=O,o.current=_,i.current=z,c.current=K,p.current=ee;function re(){d.current=requestAnimationFrame(re),K.update(),_.render(O,z),ee.render()}re();function de(){const se=b.clientWidth,me=b.clientHeight;!se||!me||(z.aspect=se/me,z.updateProjectionMatrix(),_.setSize(se,me),ee.update())}m.current=de;const je=new MutationObserver(()=>{a.current&&(a.current.background=D())});je.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});const V=new ResizeObserver(()=>de());V.observe(b);const Q=new qr,ie=new Vr;function Z(se){const me=b.getBoundingClientRect();ie.set((se.clientX-me.left)/b.clientWidth*2-1,(se.clientY-me.top)/b.clientHeight*-2+1),Q.setFromCamera(ie,z);const we=[];O.traverse(Ie=>{Ie.isMesh&&!Ie.userData.isOutline&&Ie.visible&&we.push(Ie)});const Se=Q.intersectObjects(we,!1);if(!Se.length)return null;let Ce=Se[0].object;for(;Ce&&!Ce.name;)Ce=Ce.parent;return(Ce==null?void 0:Ce.name)||null}function ne(se){const me=$.current;if(me!==se){if(me){const we=x.current[me];we&&we.traverse(Se=>{Se.isMesh&&(Se.userData.isOutline?Se.material.uniforms.color.value.set(T.current[me]||"#6b7280"):Se.material.emissive.set(0))})}if(se){const we=x.current[se];we&&we.traverse(Se=>{Se.isMesh&&(Se.userData.isOutline?Se.material.uniforms.color.value.set(16777215):Se.material.emissive.set(6710886))})}$.current=se,_.domElement.style.cursor=se?"pointer":"default"}}function ue(se){ne(Z(se))}function he(){ne(null)}function le(se){if(!se.ctrlKey&&!se.metaKey)return;const me=Z(se);if(!me)return;const we=k.current[me];we&&P.current&&P.current(we)}return _.domElement.addEventListener("mousemove",ue),_.domElement.addEventListener("mouseleave",he),_.domElement.addEventListener("click",le),()=>{cancelAnimationFrame(d.current),je.disconnect(),V.disconnect(),_.domElement.removeEventListener("mousemove",ue),_.domElement.removeEventListener("mouseleave",he),_.domElement.removeEventListener("click",le),ee.dispose(),_.dispose(),b.contains(_.domElement)&&b.removeChild(_.domElement)}},[]),l.useEffect(()=>{const b=({data:M})=>{var O;const{type:N,uuid:D}=M;if(f.current.has(D)){if(f.current.delete(D),N==="ready"){u.current[D]=M.meshes;const G=y.current.filter(_=>_.uuid===D),z={};for(const _ of G){const K=_.instanceKey||_.uuid;if(x.current[K])continue;const ee=T.current[K]||"#6b7280",re=Ys(M.meshes,ee);if(re.name=K,_.matrix){const de=new es;de.set(_.matrix[0],_.matrix[1],_.matrix[2],_.matrix[3],_.matrix[4],_.matrix[5],_.matrix[6],_.matrix[7],_.matrix[8],_.matrix[9],_.matrix[10],_.matrix[11],_.matrix[12],_.matrix[13],_.matrix[14],_.matrix[15]),re.matrix.copy(de),re.matrixAutoUpdate=!1}(O=a.current)==null||O.add(re),x.current[K]=re,z[K]={phase:"ready",error:null,visible:!0}}w(),Object.keys(z).length>0&&h(_=>({..._,...z}))}else if(N==="error"){const G=y.current.filter(_=>_.uuid===D),z={};for(const _ of G){const K=_.instanceKey||_.uuid;z[K]={phase:"error",error:M.message,visible:!1}}Object.keys(z).length>0&&h(_=>({..._,...z}))}}};return ls.addEventListener("message",b),()=>ls.removeEventListener("message",b)},[]),l.useEffect(()=>{var O,G;const b=new Set(U.map(z=>z.instanceKey||z.uuid)),M=new Set(U.map(z=>z.uuid));for(const z of Object.keys(x.current))b.has(z)||(Zs(x.current[z]),(O=a.current)==null||O.remove(x.current[z]),delete x.current[z]);for(const z of[...f.current])M.has(z)||f.current.delete(z);for(const z of Object.keys(u.current))M.has(z)||delete u.current[z];h(z=>{const _={...z};for(const K of Object.keys(_))b.has(K)||delete _[K];return _});const N={};let D=!1;for(const z of U){const _=z.instanceKey||z.uuid;if(x.current[_]){if(z.matrix){const K=new es;K.set(z.matrix[0],z.matrix[1],z.matrix[2],z.matrix[3],z.matrix[4],z.matrix[5],z.matrix[6],z.matrix[7],z.matrix[8],z.matrix[9],z.matrix[10],z.matrix[11],z.matrix[12],z.matrix[13],z.matrix[14],z.matrix[15]),x.current[_].matrix.equals(K)||(x.current[_].matrix.copy(K),x.current[_].matrixAutoUpdate=!1,D=!0)}continue}if(u.current[z.uuid]){const K=T.current[_]||"#6b7280",ee=Ys(u.current[z.uuid],K);if(ee.name=_,z.matrix){const re=new es;re.set(z.matrix[0],z.matrix[1],z.matrix[2],z.matrix[3],z.matrix[4],z.matrix[5],z.matrix[6],z.matrix[7],z.matrix[8],z.matrix[9],z.matrix[10],z.matrix[11],z.matrix[12],z.matrix[13],z.matrix[14],z.matrix[15]),ee.matrix.copy(re),ee.matrixAutoUpdate=!1}(G=a.current)==null||G.add(ee),x.current[_]=ee,N[_]={phase:"ready",error:null,visible:!0},D=!0}else f.current.has(z.uuid)?N[_]={phase:"loading",error:null,visible:!0}:(f.current.add(z.uuid),N[_]={phase:"loading",error:null,visible:!0},ls.postMessage({type:"load",uuid:z.uuid,kind:z.kind||"design",token:xt(),projectSpace:Pt()}))}D&&w(),Object.keys(N).length>0&&h(z=>({...z,...N}))},[q]);function w(){var _;(_=m.current)==null||_.call(m);const b=a.current,M=i.current,N=c.current;if(!b||!M)return;const D=new Kr;if(b.traverse(K=>{K.isMesh&&!K.userData.isOutline&&K.visible&&D.expandByObject(K)}),D.isEmpty())return;const O=new Ps,G=new Ps;D.getCenter(O),D.getSize(G);const z=Math.max(G.x,G.y,G.z)||1;M.near=z*1e-4,M.far=z*200,M.position.set(O.x+z*1.5,O.y+z,O.z+z*2),M.lookAt(O),N&&(N.target.copy(O),N.update()),M.updateProjectionMatrix()}function A(b){const M=x.current[b];if(!M)return;const N=!M.visible;M.visible=N,h(D=>({...D,[b]:{...D[b],visible:N}}))}function g(b){var N;const M=x.current[b];M&&(Zs(M),(N=a.current)==null||N.remove(M),delete x.current[b]),W(D=>new Set([...D,b])),h(D=>{const O={...D};return delete O[b],O})}function B(b){H(M=>{const N=new Set(M);return N.has(b)?N.delete(b):N.add(b),N})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[L?e.jsxs("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,background:"var(--surface)"},onClick:()=>C(!1),title:"Show parts panel",children:[e.jsx(Fe,{size:12,style:{color:"var(--muted)",flexShrink:0}}),e.jsx("span",{style:{writingMode:"vertical-rl",fontSize:10,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1,textTransform:"uppercase"},children:"Parts"})]}):e.jsxs("div",{style:{width:220,flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"5px 8px 5px 10px",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:"Parts"}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>C(!0),title:"Collapse parts panel",children:e.jsx(Pr,{size:13})})]}),s&&e.jsx("div",{style:{padding:"6px 10px",fontSize:11,color:"var(--muted)",flexShrink:0},children:"Loading…"}),!s&&t.length===0&&e.jsx("div",{style:{padding:"10px 12px",fontSize:12,color:"var(--muted)"},children:"No parts"}),e.jsx("div",{style:{flex:1,overflowY:"auto"},children:t.map(b=>{const M=b.parts.filter(O=>!S.has(O.instanceKey||O.uuid));if(M.length===0)return null;const N=F.has(b.nodeId),D=b.stateColor||"#6b7280";return e.jsxs("div",{children:[e.jsxs("div",{onClick:()=>B(b.nodeId),style:{display:"flex",alignItems:"center",gap:5,padding:`4px 8px 4px ${8+b.depth*12}px`,cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--muted)",borderBottom:"1px solid var(--border)",background:"var(--surface)",userSelect:"none"},children:[e.jsx("span",{style:{width:7,height:7,borderRadius:2,background:D,flexShrink:0,display:"inline-block"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:b.nodeLabel,children:b.nodeLabel}),e.jsx("span",{style:{fontSize:9,flexShrink:0},children:N?"▶":"▼"})]}),!N&&M.map(O=>{const G=O.instanceKey||O.uuid,z=j[G]||{},_=z.visible!==!1;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,padding:`4px 8px 4px ${14+b.depth*12}px`,fontSize:12,borderBottom:"1px solid var(--border)"},children:[e.jsx("input",{type:"checkbox",checked:_,disabled:z.phase!=="ready",onChange:()=>A(G),style:{flexShrink:0,cursor:z.phase==="ready"?"pointer":"default"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:z.phase==="error"?"var(--danger, #e05252)":"inherit",opacity:_?1:.45},title:z.phase==="error"?z.error:O.fileName,children:O.fileName||O.uuid}),e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",flexShrink:0},children:[z.phase==="loading"&&"…",z.phase==="error"&&"✗"]}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>g(G),title:"Remove from scene",style:{fontSize:13,lineHeight:1},children:"×"})]},G)})]},b.instanceId||b.nodeId)})})]}),e.jsx("div",{ref:r,style:{flex:1,overflow:"hidden",minWidth:0,position:"relative"}})]})}function Ys(t,s="#6b7280"){const n=new Jr,r=new At(s);for(const a of t){if(!a.positions)continue;const o=new Xr;o.setAttribute("position",new ts(a.positions,3)),a.normals&&o.setAttribute("normal",new ts(a.normals,3)),a.indices&&o.setIndex(new ts(a.indices,1));const i=a.color?new At(a.color[0],a.color[1],a.color[2]):new At(6003958),c=new Rs(o,new Yr({color:i,side:Zr}));n.add(c);const p=new Rs(o,new Qr({side:ea,uniforms:{color:{value:r.clone()},thickness:{value:.007}},vertexShader:`
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
void main() { gl_FragColor = vec4(color, 1.0); }`}));p.renderOrder=1,p.userData.isOutline=!0,n.add(p)}return n}function Zs(t){t.traverse(s=>{var n,r;(n=s.geometry)==null||n.dispose(),Array.isArray(s.material)?s.material.forEach(a=>a.dispose()):(r=s.material)==null||r.dispose()})}function Po({data:t,tab:s,ctx:n}){const{nodes:r=[],loading:a=!1}=t||{};return e.jsx($o,{nodes:r,loading:a,onNavigateToNode:n!=null&&n.onNavigate?o=>n.onNavigate(o,void 0,{serviceCode:"psm"}):void 0})}function Ro(t){return t?t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`:""}function Lo({data:t}){const{text:s,loading:n,truncated:r,totalBytes:a}=t||{};return n?e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"Loading…"}):s?e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"},children:[e.jsx("pre",{style:{margin:0,padding:14,fontSize:11,lineHeight:1.55,fontFamily:"var(--mono)",whiteSpace:"pre-wrap",wordBreak:"break-all",color:"var(--text)",overflow:"auto",flex:1,boxSizing:"border-box"},children:s}),r&&e.jsxs("div",{style:{padding:"6px 14px",fontSize:11,color:"var(--muted)",borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:["Preview limited to first 64 KB",a?` — file is ${Ro(a)}`:"","."]})]}):e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"No preview available"})}function Bo({item:t,ctx:s}){const{userId:n,stateColorMap:r}=s,a=t.revision||t.REVISION||"A",o=t.iteration??t.ITERATION??1,i=t.lifecycle_state_id||t.LIFECYCLE_STATE_ID,c=t.logical_id||t.LOGICAL_ID||"",p=t.locked_by||t.LOCKED_BY||null,x=(t.tx_status||t.TX_STATUS||"COMMITTED")==="OPEN",f=p&&p!==n,k=p&&p===n;return e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"ni-dot",style:{background:(r==null?void 0:r[i])||"#6b7280"}}),e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[c||e.jsx("span",{className:"ni-no-id",children:"—"}),(t.display_name||t.DISPLAY_NAME)&&e.jsx("span",{className:"ni-dname",children:t.display_name||t.DISPLAY_NAME})]}),e.jsx("span",{className:"ni-reviter",style:x?{color:"var(--warn)"}:void 0,children:o===0?a:`${a}.${o}`}),f&&e.jsx(Rr,{size:10,strokeWidth:2.5,color:"var(--muted)",style:{flexShrink:0}}),k&&e.jsx(gt,{size:10,strokeWidth:2.5,color:"var(--accent)",style:{flexShrink:0}})]})}function Do({item:t}){const s=t.originalName||t.ORIGINAL_NAME||t.id;return e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:s})}let Qs=!1;function Oo(){Qs||(Qs=!0,ba(Eo),hs({match:{serviceCode:"psm"},name:"psm-shell",NavLabel:Bo,Preview:Po,previewLabel:"3D Preview",hasItemChildren:t=>{const s=t.children_count??t.CHILDREN_COUNT;return s==null||s>0}}),hs({match:{serviceCode:"dst",itemCode:"data-object"},name:"dst-shell",NavLabel:Do,Editor:Dn,Preview:Lo,previewLabel:"Preview",hasItemChildren:()=>!1}))}const wt={},Ht=[];function Mo(t,s){return t.length!==s.length?!1:s.every((n,r)=>n==="*"||n===t[r])}const cs={emit(t){const s=t==null?void 0:t.type;if(!s)return;(wt[s]||[]).slice().forEach(r=>r(t));const n=s.split(":");Ht.forEach(({glob:r,handler:a})=>{Mo(n,r)&&a(t)})},on(t,s){return(wt[t]??(wt[t]=[])).push(s),()=>this.off(t,s)},onPattern(t,s){const n={glob:t.split(":"),handler:s};return Ht.push(n),()=>{const r=Ht.indexOf(n);r!==-1&&Ht.splice(r,1)}},off(t,s){wt[t]=(wt[t]||[]).filter(n=>n!==s)}};let Mn=null;function _o(){Mn=null}function Wo(){return Mn}const Fo=l.createContext(null);function Uo({navigate:t,openTab:s,closeTab:n}){const r=fe.getState;return{navigate:t,openTab:s,closeTab:n,getToken:()=>xt(),getProjectSpaceId:()=>Pt(),emit:(a,o)=>cs.emit(a,o),on:(a,o)=>(cs.on(a,o),()=>cs.off(a,o)),getStore:()=>te.getState(),usePlmStore:te,useWebSocket:zn,api:X,txApi:ut,authoringApi:pa,cadApi:da,pollJobStatus:js,getDraggedNode:Wo,clearDraggedNode:_o,getLinkRowForSource:va,icons:{NODE_ICONS:lt,SignIcon:pn},components:{LifecycleDiagram:Ma},http:{serviceRequest:(a,o,i,c)=>ca(a,o,i,c),serviceUpload:(a,o,i,c)=>Dt(`/api/${a}${o}`,"POST",{Authorization:`Bearer ${xt()}`,"X-PLM-ProjectSpace":Pt()||""},i,c)},store:{registerSlice(a,o){te.setState(i=>({_slices:{...i._slices,[a]:o.state??{}},_sliceActions:{...i._sliceActions,[a]:o.actions??{}}}))},getSlice:a=>{var o;return(o=te.getState()._slices)==null?void 0:o[a]},useSlice:a=>te(o=>{var i;return(i=o._slices)==null?void 0:i[a]}),dispatch(a,o,...i){var p,d;const c=(d=(p=te.getState()._sliceActions)==null?void 0:p[a])==null?void 0:d[o];c&&c(te.setState,te.getState,...i)}},console:{addTab:(a,o,i)=>r().addConsoleTab(a,o,i),removeTab:a=>r().removeConsoleTab(a),log:(a,o)=>r().appendLog(a,o)},status:{register:(a,o,i)=>r().registerStatus(a,o,i),unregister:a=>r().unregisterStatus(a)},collab:{addTab:(a,o,i)=>r().addCollabTab(a,o,i),removeTab:a=>r().removeCollabTab(a)},jobs:{register:(a,o,i)=>r().registerBgJob(a,o,i),update:(a,o)=>r().updateBgJob(a,o),remove:a=>r().removeBgJob(a)}}}async function Go(t){const s=await X.getUiManifest();return(await Promise.allSettled(s.map(async r=>{const o=(await import(r.url)).default;if(!(o!=null&&o.id))throw new Error(`Plugin at ${r.url} has no id`);if(o.init&&o.init(t),Fa(o),o.zone==="nav"&&o.match&&(Fs(o.match.serviceCode,o.match.itemCode,{NavLabel:o.NavLabel??null,getRowProps:o.getRowProps??null,ChildRow:o.ChildRow??null,hasItemChildren:o.hasItemChildren??(()=>!1),fetchChildren:o.fetchChildren??null,LinkRow:o.LinkRow??null}),o.linkSources&&o.LinkRow))for(const i of o.linkSources)Fs(i,null,{LinkRow:o.LinkRow})}))).map((r,a)=>{var o,i,c;return r.status==="rejected"?`${((o=s[a])==null?void 0:o.pluginId)??((i=s[a])==null?void 0:i.url)}: ${((c=r.reason)==null?void 0:c.message)??r.reason}`:null}).filter(Boolean)}const en=50,Ho=8;function Vo({jobData:t,onClose:s}){const{job:n,results:r=[]}=t,a=n.status==="DONE"||n.status==="FAILED",o=r.reduce((c,p)=>(c[p.action]=(c[p.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${r.length} node${r.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,p])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",p]},c))}),r.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:r.map((c,p)=>e.jsxs("tr",{style:{borderTop:p>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||p))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:a?"Close":"Dismiss (job continues in background)"})})]})}function Ko({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:r,onCreateNode:a,refreshKey:o,toast:i,panelSection:c="MAIN",basketView:p=!1,basketItems:d={}}){const x=te(V=>V.items),f=te(V=>V.itemsStatus),k=te(V=>V.addToBasket),T=te(V=>V.removeFromBasket),P=te(V=>V.lockedByMe),$=te(V=>V.userId);te(V=>V.projectSpaceId);const u=l.useMemo(()=>x.filter(V=>V.list),[x]),[y,m]=l.useState({}),[j,h]=l.useState({}),[S,W]=l.useState(new Set),[F,H]=l.useState(new Set),R=l.useRef({}),[,L]=l.useState(0),[C,E]=l.useState(null),[U,q]=l.useState(null),[w,A]=l.useState({}),[g,B]=l.useState(!1),[v,b]=l.useState(null),[M,N]=l.useState(null),D=l.useRef(null),O=l.useMemo(()=>({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:r}),[t,s,n,r]),G=l.useCallback(V=>`${V.serviceCode}:${V.itemCode}`,[]);l.useEffect(()=>()=>{D.current&&clearInterval(D.current)},[]),l.useEffect(()=>{u.length!==0&&(W(new Set(u.map(G))),u.forEach(V=>z(V,0).catch(()=>null)))},[u,o]),l.useEffect(()=>{if(s){for(const[V,Q]of Object.entries(y))if(((Q==null?void 0:Q.items)||[]).some(ie=>(ie.id||ie.ID)===s)){W(ie=>new Set([...ie,V]));return}}},[s,y]);async function z(V,Q){const ie=G(V);h(Z=>({...Z,[ie]:!0}));try{const Z=await X.fetchListableItems(t,V,Q,en);m(ne=>{const ue=ne[ie],he=Q===0||!ue?Z:{...Z,items:[...ue.items||[],...Z.items||[]]};return{...ne,[ie]:he}})}catch{m(Z=>({...Z,[ie]:{items:[],totalElements:0,page:0,size:en}}))}finally{h(Z=>({...Z,[ie]:!1}))}}function _(V){const Q=G(V);W(ie=>{const Z=new Set(ie);return Z.has(Q)?Z.delete(Q):(Z.add(Q),!y[Q]&&!j[Q]&&z(V,0)),Z})}function K(V){const Q=G(V),ie=y[Q];if(!ie||j[Q])return;const Z=(ie.page??0)+1;Z>=(ie.totalPages??0)||z(V,Z)}const ee=l.useCallback(async(V,Q,ie,Z)=>{Z&&Z.stopPropagation(),H(he=>{const le=new Set(he);return le.has(V)?le.delete(V):le.add(V),le});const ne=Q.id||Q.ID;if(R.current[ne]!==void 0)return;const ue=Xt(ie);if(!ue.fetchChildren){R.current[ne]=[];return}R.current[ne]="loading",L(he=>he+1);try{const he=await ue.fetchChildren(Q,O);R.current[ne]=Array.isArray(he)?he:[]}catch{R.current[ne]=[]}L(he=>he+1)},[O]);function re(V,Q,ie,Z,ne,ue){if(ne>Ho)return null;const he=ie.id||ie.ID||Z,le=R.current[he];return!Array.isArray(le)||le.length===0||!V.ChildRow?null:le.map(se=>{const me=se.targetNodeId||se.id||se.ID,we=`${Z}/${se.linkId||me}`,Ce=!ue.has(me)&&F.has(we);return e.jsxs(De.Fragment,{children:[e.jsx(V.ChildRow,{link:se,child:se,depth:ne,parentPath:we,ancestorIds:ue,ctx:O,childCacheRef:R,expandedPaths:F,toggleNodeChildren:(Ie,ke,$e)=>ee(Ie,{id:ke},Q,$e)}),Ce&&re(V,Q,{id:me},we,ne+1,new Set([...ue,me]))]},we)})}const de=l.useMemo(()=>{const V=String(c||"MAIN").toUpperCase(),Q=u.filter(ne=>String(ne.panelSection||"MAIN").toUpperCase()===V),ie=new Map;for(const ne of Q){const ue=ne.serviceCode||"_unknown";ie.has(ue)||ie.set(ue,[]),ie.get(ue).push(ne)}const Z=[];for(const[ne,ue]of ie.entries()){ue.sort((se,me)=>(me.priority??100)-(se.priority??100));const he=ue.reduce((se,me)=>Math.max(se,me.priority??100),0),le=ue[0].sourceLabel||ne;Z.push({serviceCode:ne,label:le,maxPriority:he,descriptors:ue})}return Z.sort((ne,ue)=>ue.maxPriority-ne.maxPriority),Z},[u,c]);async function je(){if(!C||!U)return;const{descriptor:V,action:Q}=C,ie=`/api/${V.serviceCode}${Q.path}`,Z=new FormData;Z.append("file",U),(Q.parameters||[]).forEach(le=>{const se=w[le.name];se!=null&&se!==""&&Z.append(le.name,se)});const ne={},ue=xt(),he=Pt();ue&&(ne.Authorization=`Bearer ${ue}`),he&&(ne["X-PLM-ProjectSpace"]=he),B(!0),b(0);try{const le=await Dt(ie,"POST",ne,Z,me=>b(me));if(!le.ok){const me=await le.json().catch(()=>({}));throw new Error(me.error||me.message||`HTTP ${le.status}`)}const se=await le.json().catch(()=>null);if(E(null),b(null),se!=null&&se.jobId&&Q.jobStatusPath){const me=Q.jobStatusPath.replace("{jobId}",se.jobId);N({id:se.jobId,data:{job:{id:se.jobId,status:se.status||"PENDING"},results:[]}}),D.current&&clearInterval(D.current),D.current=setInterval(async()=>{var we,Se,Ce;try{const Ie=await js(V.serviceCode,me);N(ke=>ke?{...ke,data:Ie}:null),(((we=Ie.job)==null?void 0:we.status)==="DONE"||((Se=Ie.job)==null?void 0:Se.status)==="FAILED")&&(clearInterval(D.current),D.current=null,((Ce=Ie.job)==null?void 0:Ce.status)==="DONE"&&z(V,0))}catch{}},2e3)}else i==null||i(`${U.name} imported`,"success"),z(V,0)}catch(le){E(null),b(null),i==null||i(le,"error")}finally{B(!1)}}return f!=="loaded"&&c==="MAIN"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):de.length===0?null:e.jsxs(e.Fragment,{children:[C&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:V=>{V.target===V.currentTarget&&!g&&E(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:C.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!g&&E(null),disabled:g,children:e.jsx(ht,{size:14})})]}),C.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:C.action.description}),v!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[v,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${v}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:C.action.acceptedTypes||void 0,disabled:g,onChange:V=>{var Q;return q(((Q=V.target.files)==null?void 0:Q[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),U&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[U.name," (",(U.size/1024).toFixed(1)," KB)"]}),(C.action.parameters||[]).map(V=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[V.label,V.required?" *":""]}),V.widgetType==="DROPDOWN"&&V.allowedValues?e.jsx("select",{disabled:g,value:w[V.name]??(V.defaultValue||""),onChange:Q=>A(ie=>({...ie,[V.name]:Q.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(V.allowedValues).map(Q=>e.jsx("option",{value:Q.value,children:Q.label},Q.value))}):e.jsx("input",{type:"text",disabled:g,value:w[V.name]??(V.defaultValue||""),onChange:Q=>A(ie=>({...ie,[V.name]:Q.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),V.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:V.tooltip})]},V.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!g&&E(null),disabled:g,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:je,disabled:!U||g,children:g?"Importing…":"Import"})]})]})}),M&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:V=>{V.target===V.currentTarget&&N(null)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:V=>V.stopPropagation(),children:e.jsx(Vo,{jobData:M.data,onClose:()=>N(null)})})}),de.map(({serviceCode:V,label:Q,descriptors:ie})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Yt,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:Q})]})}),e.jsx("div",{className:"node-list",children:ie.map(Z=>{var Ie;const ne=G(Z),ue=S.has(ne),he=!!j[ne],le=y[ne],se=(le==null?void 0:le.items)||[],me=(le==null?void 0:le.totalElements)??se.length,we=Z.icon?lt[Z.icon]:null,Se=le&&(le.totalPages??0)>(le.page??0)+1,Ce=Xt(Z);return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>_(Z),children:[e.jsx("span",{className:"type-chevron",children:ue?e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Fe,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),we?e.jsx(we,{size:11,color:Z.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):Z.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:Z.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:Z.description||void 0,children:Z.displayName}),e.jsx("span",{className:"type-group-count",children:he&&se.length===0?"…":me}),Z.create&&a&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${Z.displayName}`,onClick:ke=>{ke.stopPropagation(),a(Z)},children:e.jsx(Me,{size:10,strokeWidth:2.5})}),((Ie=Z.importActions)==null?void 0:Ie.length)>0&&e.jsx("button",{className:"type-group-create-btn",title:Z.importActions[0].name||`Import ${Z.displayName}`,onClick:ke=>{ke.stopPropagation(),q(null),A({}),E({descriptor:Z,action:Z.importActions[0]})},children:e.jsx(jn,{size:10,strokeWidth:2.5})})]}),ue&&e.jsxs(e.Fragment,{children:[he&&se.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Loading…"}),!he&&se.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),se.length>0&&se.map(ke=>{const $e=ke.id||ke.ID,qe=Object.values(d).some(_e=>_e.has($e));if(p&&!qe)return null;const bt=Z.serviceCode==="psm"&&P.has($e),Je=`${ne}/${$e}`,Xe=F.has(Je),Ue=R.current[$e]==="loading",Ye=Ce.hasItemChildren?Ce.hasItemChildren(ke):!1;return e.jsxs(De.Fragment,{children:[e.jsx(ks,{descriptor:Z,item:ke,ctx:O,isActive:$e===s,isOpen:!1,isPinned:qe,hasChildren:Ye,isExpanded:Xe,isLoading:Ue,onToggleExpand:_e=>ee(Je,ke,Z,_e),onToggleChildren:_e=>ee(Je,ke,Z,_e),onPin:()=>k($,Z.serviceCode,Z.itemCode,$e),onUnpin:bt?null:()=>T($,Z.serviceCode,Z.itemCode,$e)}),Xe&&re(Ce,Z,ke,Je,1,new Set([$e]))]},$e)}),Se&&e.jsx("div",{className:"panel-empty",style:{fontSize:10,cursor:"pointer",color:"var(--muted2)"},onClick:()=>K(Z),children:he?"Loading…":`Load more (${me-se.length} remaining)`})]})]},ne)})})]},V))]})}function qo({descriptor:t,openItemIds:s,pinnedItemIds:n,openItemDataMap:r,ctx:a,onCreateNode:o,onOpenImport:i}){var k;const[c,p]=l.useState(!0),d=l.useMemo(()=>{const T=new Set,P=[];for(const $ of n)T.has($)||(T.add($),P.push({id:$,isPinned:!0,isOpen:s.includes($)}));for(const $ of s)T.has($)||(T.add($),P.push({id:$,isPinned:!1,isOpen:!0}));return P},[s,n]),x=t.icon?lt[t.icon]:null,f=d.length;return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>p(T=>!T),children:[e.jsx("span",{className:"type-chevron",children:c?e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Fe,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),x?e.jsx(x,{size:11,color:t.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):t.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:t.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:t.description||void 0,children:t.displayName}),e.jsx("span",{className:"type-group-count",children:f||""}),t.create&&o&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${t.displayName}`,onClick:T=>{T.stopPropagation(),o(t)},children:e.jsx(Me,{size:10,strokeWidth:2.5})}),((k=t.importActions)==null?void 0:k.length)>0&&i&&e.jsx("button",{className:"type-group-create-btn",title:t.importActions[0].name||`Import ${t.displayName}`,onClick:T=>{T.stopPropagation(),i(t,t.importActions[0])},children:e.jsx(jn,{size:10,strokeWidth:2.5})})]}),c&&e.jsxs("div",{className:"node-list",children:[d.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),d.map(({id:T,isPinned:P,isOpen:$})=>e.jsx($n,{descriptor:t,itemRef:{source:t.serviceCode,type:t.itemCode||"",key:T},initialItem:r[T]||void 0,ctx:a,isOpen:$,isPinned:P},T))]})]})}function Jo({openItems:t=[],openItemDataMap:s={},activeNodeId:n,stateColorMap:r,onNavigate:a,onCreateNode:o,toast:i}){const c=te(w=>w.items),p=te(w=>w.itemsStatus),d=te(w=>w.basketItems),x=te(w=>w.userId),[f,k]=l.useState(null),[T,P]=l.useState(null),[$,u]=l.useState({}),[y,m]=l.useState(!1),[j,h]=l.useState(null),[S,W]=l.useState(null),[F,H]=l.useState(!1),R=l.useRef(null);l.useEffect(()=>()=>{R.current&&clearInterval(R.current)},[]);const L=l.useMemo(()=>({userId:x,activeNodeId:n,stateColorMap:r,onNavigate:a}),[x,n,r,a]),C=l.useMemo(()=>c.filter(w=>{var g;return(w.panelSection||"MAIN").toUpperCase()==="MAIN"&&(w.list||w.create||((g=w.importActions)==null?void 0:g.length)>0)}),[c]),E=l.useMemo(()=>{const w=new Map;for(const g of C){const B=g.serviceCode||"_unknown";w.has(B)||w.set(B,[]),w.get(B).push(g)}const A=[];for(const[g,B]of w.entries()){B.sort((M,N)=>(N.priority??100)-(M.priority??100));const v=B.reduce((M,N)=>Math.max(M,N.priority??100),0),b=B[0].sourceLabel||g;A.push({serviceCode:g,label:b,maxPriority:v,descriptors:B})}return A.sort((g,B)=>B.maxPriority-g.maxPriority),A},[C]),U=l.useMemo(()=>{const w={};for(const A of t){const g=C.find(v=>ja(v,A));if(!g)continue;const B=ss(g);w[B]||(w[B]={openIds:[],pinnedIds:[]}),w[B].openIds.includes(A.key)||w[B].openIds.push(A.key)}for(const[A,g]of Object.entries(d)){const B=A.indexOf(":"),v=B>-1?A.slice(0,B):A,b=B>-1?A.slice(B+1):"",M=C.find(D=>D.serviceCode===v&&D.itemCode===b);if(!M)continue;const N=ss(M);w[N]||(w[N]={openIds:[],pinnedIds:[]});for(const D of g)w[N].pinnedIds.includes(D)||w[N].pinnedIds.push(D)}return w},[t,d,C]);async function q(){if(!f||!T)return;const{descriptor:w,action:A}=f,g=`/api/${w.serviceCode}${A.path}`,B=new FormData;B.append("file",T),(A.parameters||[]).forEach(N=>{const D=$[N.name];D!=null&&D!==""&&B.append(N.name,D)});const v={},b=xt(),M=Pt();b&&(v.Authorization=`Bearer ${b}`),M&&(v["X-PLM-ProjectSpace"]=M),m(!0),h(0);try{const N=await Dt(g,"POST",v,B,O=>h(O));if(!N.ok){const O=await N.json().catch(()=>({}));throw new Error(O.error||O.message||`HTTP ${N.status}`)}const D=await N.json().catch(()=>null);if(k(null),h(null),D!=null&&D.jobId&&A.jobStatusPath){const O=A.jobStatusPath.replace("{jobId}",D.jobId),G=D.jobId;W({id:G,data:{job:{id:G,status:D.status||"PENDING"},results:[]}}),H(!0),fe.getState().registerBgJob(G,A.name||"Import",()=>H(!0)),R.current&&clearInterval(R.current),R.current=setInterval(async()=>{var z;try{const _=await js(w.serviceCode,O);W(ee=>ee?{...ee,data:_}:null);const K=(z=_.job)==null?void 0:z.status;(K==="DONE"||K==="FAILED")&&(fe.getState().updateBgJob(G,K==="DONE"?"done":"failed"),clearInterval(R.current),R.current=null)}catch{}},2e3)}else i==null||i(`${T.name} imported`,"success")}catch(N){k(null),h(null),i==null||i(N,"error")}finally{m(!1)}}return p!=="loaded"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):e.jsxs(e.Fragment,{children:[f&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:w=>{w.target===w.currentTarget&&!y&&k(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:f.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!y&&k(null),disabled:y,children:e.jsx(ht,{size:14})})]}),f.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:f.action.description}),j!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[j,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${j}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:f.action.acceptedTypes||void 0,disabled:y,onChange:w=>{var A;return P(((A=w.target.files)==null?void 0:A[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),T&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[T.name," (",(T.size/1024).toFixed(1)," KB)"]}),(f.action.parameters||[]).map(w=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[w.label,w.required?" *":""]}),w.widgetType==="DROPDOWN"&&w.allowedValues?e.jsx("select",{disabled:y,value:$[w.name]??(w.defaultValue||""),onChange:A=>u(g=>({...g,[w.name]:A.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(w.allowedValues).map(A=>e.jsx("option",{value:A.value,children:A.label},A.value))}):e.jsx("input",{type:"text",disabled:y,value:$[w.name]??(w.defaultValue||""),onChange:A=>u(g=>({...g,[w.name]:A.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),w.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:w.tooltip})]},w.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!y&&k(null),disabled:y,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:q,disabled:!T||y,children:y?"Importing…":"Import"})]})]})}),S&&F&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:w=>{w.target===w.currentTarget&&H(!1)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:w=>w.stopPropagation(),children:e.jsx(Xo,{jobData:S.data,onClose:()=>{var A,g;(((A=S.data.job)==null?void 0:A.status)==="DONE"||((g=S.data.job)==null?void 0:g.status)==="FAILED")&&(fe.getState().removeBgJob(S.id),W(null)),H(!1)}})})}),E.map(({serviceCode:w,label:A,descriptors:g})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Yt,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:A})]})}),e.jsx("div",{className:"node-list",children:g.map(B=>{const v=ss(B),{openIds:b=[],pinnedIds:M=[]}=U[v]||{};return e.jsx(qo,{descriptor:B,openItemIds:b,pinnedItemIds:M,openItemDataMap:s,ctx:L,onCreateNode:o,onOpenImport:(N,D)=>{P(null),u({}),k({descriptor:N,action:D})}},v)})})]},w))]})}function Xo({jobData:t,onClose:s}){const{job:n,results:r=[]}=t,a=n.status==="DONE"||n.status==="FAILED",o=r.reduce((c,p)=>(c[p.action]=(c[p.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${r.length} node${r.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,p])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",p]},c))}),r.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:r.map((c,p)=>e.jsxs("tr",{style:{borderTop:p>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||p))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:a?"Close":"Dismiss (job continues in background)"})})]})}const tn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function Yo({nodeTypes:t,tx:s,txNodes:n,userId:r,activeNodeId:a,stateColorMap:o,onNavigate:i,canCreateNode:c,onCreateNode:p,onCommit:d,onRollback:x,onReleaseNode:f,showSettings:k,activeSettingsSection:T,onSettingsSectionChange:P,settingsSections:$,isDashboardOpen:u,onOpenDashboard:y,browseRefreshKey:m,openItems:j,openItemDataMap:h,style:S,toast:W}){const[F,H]=l.useState(null),R=(s==null?void 0:s.txId)||(s==null?void 0:s.ID)||(s==null?void 0:s.id),L=n||[],C=De.useMemo(()=>{const E=new Map;return(t||[]).forEach(U=>{const q=U.id||U.ID;E.set(q,{name:U.name||U.NAME||q,color:U.color||U.COLOR||null,icon:U.icon||U.ICON||null})}),E},[t]);return e.jsx("aside",{className:"left-panel",style:S,children:k?e.jsx("div",{className:"settings-section-nav",children:($||[]).map(E=>e.jsxs("div",{children:[e.jsx("div",{className:"settings-nav-group-label",children:E.groupLabel}),E.sections.map(({key:U,label:q,icon:w})=>{const A=w?fa[w]:null;return e.jsxs("div",{className:`settings-nav-item${T===U?" active":""}`,onClick:()=>P(U),children:[A&&e.jsx(A,{size:13,strokeWidth:1.8,color:T===U?"var(--accent)":"var(--muted)"}),q]},U)})]},E.groupKey))}):e.jsxs(e.Fragment,{children:[!u&&e.jsxs("button",{className:"panel-dash-btn",onClick:y,title:"Open dashboard",children:[e.jsx("span",{style:{opacity:.7,lineHeight:1},children:"⬡"}),"Dashboard"]}),c&&e.jsxs("div",{className:"panel-section-header",style:{flex:"0 0 auto"},children:[e.jsx("div",{style:{flex:1}}),e.jsx("button",{className:"panel-icon-btn",title:"Create new object",onClick:()=>p(),children:e.jsx(Me,{size:13,color:"var(--accent)",strokeWidth:2.5})})]}),e.jsx("div",{style:{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column"},children:e.jsx(Jo,{openItems:j,openItemDataMap:h,activeNodeId:a,stateColorMap:o,onNavigate:i,onCreateNode:p,toast:W})}),e.jsx(Ko,{userId:r,activeNodeId:a,stateColorMap:o,onNavigate:i,refreshKey:m,panelSection:"INFO",toast:W}),e.jsxs("div",{className:"panel-section tx-panel",children:[e.jsxs("div",{className:"panel-section-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx($s,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsxs("span",{className:"panel-label",children:["Transaction",R&&e.jsxs("span",{className:"tx-id-badge",children:[R.slice(0,8),"…"]})]})]}),L.length>0&&e.jsx("span",{className:"tx-count-badge",children:L.length})]}),e.jsx("div",{className:"tx-list",children:R?L.length===0?e.jsxs("div",{className:"panel-empty",children:["Transaction open —",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"no objects checked out yet."})]}):L.map((E,U)=>{const q=E.itemId||E.node_id||E.NODE_ID,w=E.logicalId||E.logical_id||E.LOGICAL_ID||"",A=E.nodeTypeName||E.node_type_name||E.NODE_TYPE_NAME||"",g=E.nodeTypeId||E.node_type_id||E.NODE_TYPE_ID||"",B=E.revision||E.REVISION||"A",v=E.iteration??E.ITERATION??1,b=(E.changeType||E.change_type||E.CHANGE_TYPE||"CONTENT").toUpperCase(),M=E.lifecycleStateId||E.lifecycle_state_id||E.LIFECYCLE_STATE_ID||"",N=tn[b]||tn.CONTENT,D=q===a,O=F===q,G=C.get(g),z=(G==null?void 0:G.color)||null,_=G!=null&&G.icon?lt[G.icon]:null;return O?e.jsxs("div",{className:"tx-item tx-item-confirm",onClick:K=>K.stopPropagation(),children:[e.jsx("span",{className:"tx-type-icon",children:_?e.jsx(_,{size:11,color:z||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:z||"var(--muted2)",display:"inline-block"}})}),e.jsxs("span",{className:"tx-confirm-msg",children:["Release ",w||q,"?"]}),e.jsx("button",{className:"btn btn-danger btn-xs",onClick:()=>{f&&f(q),H(null)},children:"Yes"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>H(null),children:"No"})]},U):e.jsxs("div",{className:`tx-item${D?" active":""}`,onClick:()=>i(q,w||void 0,Ot),title:A,children:[e.jsx("span",{className:"tx-type-icon",children:_?e.jsx(_,{size:11,color:z||"var(--muted2)",strokeWidth:2}):z?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:z,display:"inline-block"}}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:"var(--muted2)",display:"inline-block"}})}),e.jsx("span",{className:"tx-logical",children:w||q}),e.jsx("span",{className:"tx-reviter",style:{color:(o==null?void 0:o[M])||"var(--muted2)"},children:v===0?B:`${B}.${v}`}),e.jsx("span",{className:"tx-ct-badge",style:{background:N.bg,color:N.color},children:N.label}),e.jsx("button",{className:"tx-release-btn",title:"Release from transaction",onClick:K=>{K.stopPropagation(),H(q)},children:e.jsx(Lr,{size:12,strokeWidth:2,color:"var(--muted)"})})]},U)}):e.jsxs("div",{className:"panel-empty",children:["No active transaction.",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"Checkout an object to begin."})]})}),R&&e.jsxs("div",{className:"tx-actions",children:[e.jsxs("button",{className:"btn btn-success btn-sm",style:{flex:1},onClick:d,children:[e.jsx($s,{size:12,strokeWidth:2}),"Commit"]}),e.jsxs("button",{className:"btn btn-danger btn-sm",onClick:x,children:[e.jsx(Br,{size:12,strokeWidth:2}),"Rollback"]})]})]})]})})}const Zo=De.memo(Yo);function Qo(t){return e.jsx(Zo,{...t})}const sn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}},ei={PRIMARY:"var(--accent)",SECONDARY:"var(--muted)",DANGEROUS:"var(--danger)"};function _n({revision:t,iteration:s}){const n=s===0?t:`${t}.${s}`;return e.jsx("span",{className:"dash-rev",children:n})}function Wn({lifecycleStateId:t,stateColorMap:s}){const n=(s==null?void 0:s[t])||"#6b7280";return e.jsx("span",{className:"dash-state-dot",style:{background:n},title:t})}function Fn({nodeTypeId:t,nodeTypeName:s,nodeTypes:n}){const r=(n||[]).find(c=>(c.id||c.ID)===t),a=(r==null?void 0:r.color)||(r==null?void 0:r.COLOR)||null,o=(r==null?void 0:r.icon)||(r==null?void 0:r.ICON)||null,i=o?lt[o]:null;return e.jsxs("span",{className:"dash-type-chip",children:[i?e.jsx(i,{size:9,color:a||"var(--muted2)",strokeWidth:2}):a?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:a,display:"inline-block",flexShrink:0}}):null,e.jsx("span",{style:{color:"var(--muted2)"},children:s||t})]})}function ti({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){var f,k,T,P;const[a,o]=l.useState(void 0),[i,c]=l.useState(!0),[p,d]=l.useState(null),x=l.useCallback(async()=>{c(!0),d(null);try{const $=await X.getDashboardTransaction(t);o($||null)}catch($){d($.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{x()},[x]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Open transaction"}),e.jsx("button",{className:"dash-refresh-btn",onClick:x,title:"Refresh",disabled:i,children:e.jsx("span",{style:{display:"inline-block",transform:"none"},children:"⟳"})})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),p&&e.jsx("div",{className:"dash-error",children:p}),!i&&!p&&!a&&e.jsx("div",{className:"dash-empty",children:"No open transaction"}),!i&&!p&&a&&e.jsxs("div",{className:"dash-tx-card",children:[e.jsxs("div",{className:"dash-tx-header",children:[e.jsxs("span",{className:"dash-tx-id",children:[(f=a.txId)==null?void 0:f.slice(0,8),"…"]}),e.jsx("span",{className:"dash-tx-title",children:a.title}),e.jsxs("span",{className:"dash-tx-count",children:[((k=a.nodes)==null?void 0:k.length)||0," object",((T=a.nodes)==null?void 0:T.length)!==1?"s":""]})]}),((P=a.nodes)==null?void 0:P.length)>0&&e.jsx("div",{className:"dash-tx-nodes",children:a.nodes.map($=>{const u=sn[($.changeType||"CONTENT").toUpperCase()]||sn.CONTENT;return e.jsxs("button",{className:"dash-tx-node",onClick:()=>r($.nodeId,$.logicalId||$.nodeId,Ot),children:[e.jsx(Wn,{lifecycleStateId:$.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:$.logicalId||$.nodeId}),e.jsx(_n,{revision:$.revision,iteration:$.iteration}),e.jsx(Fn,{nodeTypeId:$.nodeTypeId,nodeTypeName:$.nodeTypeName,nodeTypes:n}),e.jsx("span",{className:"dash-badge",style:{background:u.bg,color:u.color},children:u.label})]},$.nodeId)})})]})]})}function si({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){const[a,o]=l.useState(null),[i,c]=l.useState(!0),[p,d]=l.useState(null),x=l.useCallback(async()=>{c(!0),d(null);try{const f=await X.getDashboardWorkItems(t);o(Array.isArray(f)?f:[])}catch(f){d(f.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{x()},[x]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Objects you can work on"}),e.jsx("span",{className:"dash-section-hint",children:"last 10 · sorted by available actions"}),e.jsx("button",{className:"dash-refresh-btn",onClick:x,title:"Refresh",disabled:i,children:"⟳"})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),p&&e.jsx("div",{className:"dash-error",children:p}),!i&&!p&&(a==null?void 0:a.length)===0&&e.jsx("div",{className:"dash-empty",children:"No actionable objects found"}),!i&&!p&&(a==null?void 0:a.length)>0&&e.jsx("div",{className:"dash-work-list",children:a.map(f=>e.jsxs("button",{className:"dash-work-item",onClick:()=>r(f.nodeId,f.logicalId||f.nodeId,Ot),children:[e.jsxs("div",{className:"dash-work-row",children:[e.jsx(Wn,{lifecycleStateId:f.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:f.logicalId||f.nodeId}),e.jsx(_n,{revision:f.revision,iteration:f.iteration}),e.jsx(Fn,{nodeTypeId:f.nodeTypeId,nodeTypeName:f.nodeTypeName,nodeTypes:n})]}),e.jsx("div",{className:"dash-action-chips",children:f.actions.map(k=>{var $,u;const T=(($=k.guardViolations)==null?void 0:$.length)>0,P=T?"Blocked: "+k.guardViolations.map(y=>y.message||y.code).join("; "):k.description||k.label;return e.jsx("span",{className:"dash-action-chip",title:P,style:{color:ei[(u=k.metadata)==null?void 0:u.displayCategory]||"var(--muted)",opacity:T?.45:1},children:k.label},k.code)})})]},f.nodeId))})]})}function ni({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){return e.jsxs("div",{className:"dashboard",children:[e.jsxs("div",{className:"dash-hero",children:[e.jsx("span",{className:"dash-hero-icon",children:"⬡"}),e.jsxs("div",{children:[e.jsx("div",{className:"dash-hero-title",children:"Dashboard"}),e.jsx("div",{className:"dash-hero-sub",children:"Quick overview of your work session"})]})]}),e.jsxs("div",{className:"dash-body",children:[e.jsx(ti,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}),e.jsx(si,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r})]})]})}function ri({tabs:t,activeTabId:s,userId:n,tx:r,toast:a,nodeTypes:o,stateColorMap:i,onTabActivate:c,onTabClose:p,onTabPin:d,onSubTabChange:x,onNavigate:f,onAutoOpenTx:k,onDescriptionLoaded:T,onRefreshItemData:P,onOpenCommentsForVersion:$,onCommentAttribute:u,tabItemData:y}){const m=fe(O=>O.showCollab),j=fe(O=>O.toggleCollab),h="dashboard",S=t.find(O=>O.id===s),W=!!(S!=null&&S.nodeId),[F,H]=l.useState({}),R=l.useRef(null),L=l.useRef({});l.useEffect(()=>{var G,z;const O=new Set(t.map(_=>_.id));H(_=>Object.fromEntries(Object.entries(_).filter(([K])=>O.has(K))));for(const _ of Object.keys(L.current))O.has(_)||((z=(G=L.current)[_])==null||z.call(G),delete L.current[_])},[t]),l.useEffect(()=>()=>{var O,G;s&&((G=(O=L.current)[s])==null||G.call(O),delete L.current[s])},[s]);const C=s?F[s]??{data:null,closed:!1,maximized:!1,splitPos:50}:null;function E(O){s&&H(G=>({...G,[s]:{closed:!1,maximized:!1,splitPos:50,...G[s],...O}}))}function U(O){s&&H(G=>({...G,[s]:{closed:!1,maximized:!1,splitPos:50,...G[s],data:O}}))}function q(O){var G,z;s&&((z=(G=L.current)[s])==null||z.call(G),L.current[s]=O)}function w(O){O.preventDefault();const G=R.current;if(!G)return;function z(K){const ee=G.getBoundingClientRect();E({splitPos:Math.max(20,Math.min(80,(K.clientX-ee.left)/ee.width*100))})}function _(){window.removeEventListener("mousemove",z),window.removeEventListener("mouseup",_)}window.addEventListener("mousemove",z),window.addEventListener("mouseup",_)}const A=S&&S.id!==h?ga(S):null,g=S&&S.id!==h?Ua(S)??A:null,B=(A==null?void 0:A.Preview)??null,v=(A==null?void 0:A.previewLabel)??"Preview",b=!!B,M=(C==null?void 0:C.closed)??!1,N=(C==null?void 0:C.maximized)??!1,D=(C==null?void 0:C.splitPos)??50;return e.jsx("div",{className:"editor-area",children:e.jsxs("div",{className:"editor-main",children:[e.jsxs("div",{className:"tab-bar",children:[t.length===0?e.jsx("div",{className:"tab-bar-empty",children:"Open an object from the navigation panel"}):t.map(O=>{var re;const G=O.id===h,z=O.nodeTypeId?(o||[]).find(de=>(de.id||de.ID)===O.nodeTypeId):null,_=(z==null?void 0:z.color)||(z==null?void 0:z.COLOR)||null,K=(z==null?void 0:z.icon)||(z==null?void 0:z.ICON)||null,ee=K?lt[K]:null;return e.jsxs("div",{className:`editor-tab ${O.id===s?"active":""}`,onClick:()=>c(O.id),children:[G&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0,opacity:.6},children:"⬡"}),!G&&(ee||_)&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:ee?e.jsx(ee,{size:10,color:_||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:_,display:"inline-block"}})}),e.jsx("span",{className:"tab-node-id",children:O.label||((re=O.nodeId)==null?void 0:re.slice(0,10))+"…"}),e.jsx("button",{className:`tab-pin ${O.pinned?"active":""}`,title:O.pinned?"Unpin tab":"Pin tab",onClick:de=>{de.stopPropagation(),d(O.id)},children:O.pinned?e.jsx(yn,{size:11,color:"var(--accent)",strokeWidth:2}):e.jsx(vn,{size:11,color:"var(--muted)",strokeWidth:2})}),e.jsx("button",{className:"tab-close",title:"Close tab",onClick:de=>{de.stopPropagation(),p(O.id)},children:e.jsx(ht,{size:11,color:"var(--muted)",strokeWidth:2.5})})]},O.id)}),t.length>0&&e.jsx("div",{className:"tab-add",title:"Pin a tab or navigate to open a new one",children:e.jsx(Me,{size:13,color:"var(--muted)",strokeWidth:2})}),W&&e.jsx("button",{className:`tab-comments-toggle${m?" active":""}`,onClick:j,title:m?"Hide comments":"Show comments",children:"💬"})]}),e.jsxs("div",{ref:R,style:{flex:1,display:"flex",overflow:"hidden",minHeight:0},children:[e.jsx("div",{className:"editor-content",style:b?{width:M?"calc(100% - 28px)":N?0:`${D}%`,flex:"none",overflow:N?"hidden":void 0,transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"}:void 0,children:S?S.id===h?e.jsx(ni,{userId:n,stateColorMap:i,nodeTypes:o,onNavigate:f}):(()=>{const O=(g==null?void 0:g.Editor)??(g==null?void 0:g.Component),G={userId:n,tx:r,nodeTypes:o,stateColorMap:i,toast:a,onAutoOpenTx:k,onDescriptionLoaded:T,onRefreshItemData:P,onOpenCommentsForVersion:$,onCommentAttribute:u,onSubTabChange:x,onNavigate:f,onRegisterPreview:U,onRegisterCancel:q,itemData:y};return O?e.jsx(O,{tab:S,ctx:G}):e.jsx("div",{className:"editor-empty",children:e.jsx("div",{className:"editor-empty-text",children:"Loading editor…"})})})():e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⬡"}),e.jsx("div",{className:"editor-empty-text",children:"No object open"}),e.jsx("div",{className:"editor-empty-hint",children:"Select an object in the navigation panel to open it here"})]})}),b&&(M?e.jsx("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderLeft:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--surface)",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onClick:()=>E({closed:!1}),title:`Open ${v}`,children:e.jsxs("span",{style:{writingMode:"vertical-rl",fontSize:11,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1},children:[v," ▶"]})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{width:N?0:5,cursor:"col-resize",background:"var(--border)",flexShrink:0,userSelect:"none",overflow:"hidden",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onMouseDown:N?void 0:w}),e.jsxs("div",{style:{flex:1,minWidth:0,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1},children:[e.jsx("span",{children:v}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:2},children:[e.jsx("button",{className:"panel-icon-btn",title:N?"Restore":`Maximize ${v}`,onClick:()=>E({maximized:!N}),children:N?e.jsx(Dr,{size:13}):e.jsx(Or,{size:13})}),e.jsx("button",{className:"panel-icon-btn",title:`Collapse ${v}`,onClick:()=>E({closed:!0}),children:e.jsx(ht,{size:13})})]})]}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(B,{data:(C==null?void 0:C.data)??null,tab:S,ctx:{userId:n,tx:r,nodeTypes:o,stateColorMap:i,toast:a,onAutoOpenTx:k,onDescriptionLoaded:T,onRefreshItemData:P,onOpenCommentsForVersion:$,onCommentAttribute:u,onSubTabChange:x,onNavigate:f,onRegisterPreview:U,itemData:y}})})]})]}))]})]})})}function ai(t){const s=fe(a=>a.openCollab),n=fe(a=>a.setVersionFilter),r=fe(a=>a.setTriggerText);return e.jsx(ri,{...t,onOpenCommentsForVersion:a=>{n(a),s()},onCommentAttribute:a=>{r("#"+a+" "),s()}})}function oi(t){const s={};t.forEach(a=>{s[a.id]={...a,children:[]}});const n=[];t.forEach(a=>{a.parentCommentId&&s[a.parentCommentId]?s[a.parentCommentId].children.push(s[a.id]):n.push(s[a.id])});function r(a){a.sort((o,i)=>new Date(o.createdAt)-new Date(i.createdAt)),a.forEach(o=>r(o.children))}return r(n),n}function ii(t){const s=t.match(/#(\S+)/);return s?s[1]:null}function li(t,s){const n=t.slice(0,s);for(let r=n.length-1;r>=0;r--){const a=n[r];if(a==="#"||a==="@"){if(r===0||/\s/.test(n[r-1])){const o=n.slice(r+1);if(!/\s/.test(o))return{type:a,query:o,start:r}}return null}if(/\s/.test(a))return null}return null}function ci({text:t,attrMap:s,userMap:n}){const r=[],a=/(#\S+|@\S+)/g;let o=0,i;for(;(i=a.exec(t))!==null;){i.index>o&&r.push({kind:"text",value:t.slice(o,i.index)});const c=i[0];if(c.startsWith("#")){const p=c.slice(1),d=s[p];r.push({kind:"attr",id:p,label:d})}else{const p=c.slice(1),d=n[p];r.push({kind:"user",id:p,name:d})}o=i.index+c.length}return o<t.length&&r.push({kind:"text",value:t.slice(o)}),e.jsx("span",{children:r.map((c,p)=>c.kind==="text"?e.jsx("span",{children:c.value},p):c.kind==="attr"?e.jsxs("span",{className:"mention-chip mention-attr",title:`Attribute: ${c.id}`,children:["#",c.label||c.id]},p):e.jsxs("span",{className:"mention-chip mention-user",title:`User: ${c.id}`,children:["@",c.name||c.id]},p))})}function di({items:t,activeIdx:s,onSelect:n,onHover:r}){return e.jsx("ul",{className:"autocomplete-dropdown",children:t.map((a,o)=>e.jsxs("li",{className:`autocomplete-item${o===s?" active":""}`,onMouseEnter:()=>r(o),onMouseDown:i=>{i.preventDefault(),n(a)},children:[e.jsxs("span",{className:"autocomplete-item-id",children:[a.prefix,a.id]}),a.label&&e.jsx("span",{className:"autocomplete-item-label",children:a.label})]},a.id))})}function pi({nodeId:t,userId:s,width:n,onClose:r,filterVersionId:a,onClearFilter:o,users:i,triggerText:c,onClearTrigger:p,versionId:d,attributes:x,revision:f,iteration:k}){const[T,P]=l.useState([]),[$,u]=l.useState(""),[y,m]=l.useState(null),[j,h]=l.useState(!1),[S,W]=l.useState(null),[F,H]=l.useState(0),R=l.useRef(null),L=l.useMemo(()=>{const N={};return(x||[]).forEach(D=>{N[D.id]=D.label}),N},[x]),C=l.useMemo(()=>{const N={};return(i||[]).forEach(D=>{N[D.id]=D.displayName||D.username}),N},[i]),E=l.useMemo(()=>{if(!S)return[];const N=S.query.toLowerCase();return S.type==="#"?(x||[]).filter(D=>D.id.toLowerCase().includes(N)||D.label.toLowerCase().includes(N)).slice(0,8).map(D=>({id:D.id,label:D.label,prefix:"#"})):(i||[]).filter(D=>D.id.toLowerCase().includes(N)||(D.displayName||D.username||"").toLowerCase().includes(N)).slice(0,8).map(D=>({id:D.id,label:D.displayName||D.username,prefix:"@"}))},[S,x,i]),U=l.useCallback(async()=>{if(t)try{const N=await X.getComments(s,t);P(Array.isArray(N)?N:[])}catch{}},[t,s]);l.useEffect(()=>{U()},[U]),Aa(N=>{N.nodeId&&N.nodeId!==t||N.event==="COMMENT_ADDED"&&U()}),l.useEffect(()=>{c&&(u(c),p==null||p(),setTimeout(()=>{const N=R.current;N&&(N.focus(),N.setSelectionRange(c.length,c.length))},50))},[c]),l.useEffect(()=>{m(null),u(""),W(null)},[t]);const q=l.useMemo(()=>oi(T),[T]),w=l.useMemo(()=>a?q.filter(N=>N.versionId===a):q,[q,a]),A=l.useMemo(()=>{function N(D){return D.reduce((O,G)=>O+1+N(G.children),0)}return N(w)},[w]);function g(N){const D=N.target.value,O=N.target.selectionStart;u(D);const G=li(D,O);W(G),H(0)}function B(N){if(!S)return;const D=$.slice(0,S.start),O=$.slice(S.start+1+S.query.length),G=N.prefix+N.id+" ",z=D+G+O;u(z),W(null),setTimeout(()=>{const _=R.current;if(_){const K=D.length+G.length;_.focus(),_.setSelectionRange(K,K)}},0)}function v(N){if(S&&E.length>0){if(N.key==="ArrowDown"){N.preventDefault(),H(D=>Math.min(D+1,E.length-1));return}if(N.key==="ArrowUp"){N.preventDefault(),H(D=>Math.max(D-1,0));return}if(N.key==="Enter"||N.key==="Tab"){N.preventDefault(),B(E[F]);return}if(N.key==="Escape"){W(null);return}}N.key==="Enter"&&N.ctrlKey&&$.trim()&&b()}async function b(){if(!(!$.trim()||!d)){h(!0);try{const N=ii($.trim());await X.addComment(s,t,d,$.trim(),(y==null?void 0:y.id)||null,N||null),u(""),m(null),W(null),await U()}catch{}finally{h(!1)}}}const M=f!=null?`${f??""}${k!=null?"."+k:""}`:"";return e.jsxs("div",{className:"comment-panel",style:{width:n},onClick:()=>S&&W(null),children:[e.jsxs("div",{className:"comment-panel-header",children:[e.jsxs("span",{children:["Comments",T.length>0&&e.jsx("span",{className:"comment-count-badge",children:T.length})]}),e.jsx("button",{className:"comment-close-btn",onClick:r,title:"Close",children:"✕"})]}),a&&e.jsxs("div",{className:"comment-filter-banner",children:[e.jsxs("span",{children:["Filtered: rev ",(()=>{const N=T.find(D=>D.versionId===a);return N?`${N.revision}.${N.iteration}`:a.slice(0,8)+"…"})()," · ",A," comment",A!==1?"s":""]}),e.jsx("button",{className:"comment-filter-clear",onClick:o,children:"Show all"})]}),e.jsx("div",{className:"comment-panel-list",children:w.length===0?e.jsx("div",{className:"comment-empty",children:a?"No comments on this version":"No comments yet"}):w.map(N=>e.jsx(Un,{node:N,depth:0,onReply:m,activeReplyId:y==null?void 0:y.id,userId:s,attrMap:L,userMap:C},N.id))}),e.jsxs("div",{className:"comment-panel-input",onClick:N=>N.stopPropagation(),children:[d&&M&&e.jsxs("div",{className:"comment-version-context",children:["Commenting on rev ",e.jsx("strong",{children:M})]}),y&&e.jsxs("div",{className:"comment-reply-context",children:[e.jsxs("span",{children:["↩ Replying to ",e.jsx("strong",{children:y.author})]}),e.jsx("button",{className:"comment-cancel-reply",onClick:()=>m(null),children:"✕"})]}),e.jsxs("div",{className:"comment-input-wrap",children:[e.jsx("textarea",{ref:R,className:"field-input comment-textarea",rows:3,placeholder:d?"Write a comment… (# attr, @ user, Ctrl+Enter to post)":"No version available",value:$,onChange:g,onKeyDown:v,disabled:!d||j}),S&&E.length>0&&e.jsx(di,{items:E,activeIdx:F,onSelect:B,onHover:H})]}),e.jsx("button",{className:"btn btn-sm btn-success comment-post-btn",disabled:!$.trim()||!d||j,onClick:b,children:y?"↩ Post reply":"Post comment"})]})]})}const mi=72,ui=16;function Un({node:t,depth:s,onReply:n,activeReplyId:r,userId:a,attrMap:o,userMap:i}){const c=Math.min(s*ui,mi),p=r===t.id;return e.jsxs("div",{style:{marginLeft:s>0?c:0},children:[e.jsx(hi,{comment:t,onReply:n,isReply:s>0,isHighlighted:p,isOwn:t.author===a,attrMap:o,userMap:i}),t.children.length>0&&e.jsx("div",{className:"comment-children",style:{borderLeft:"2px solid var(--border2)",marginLeft:10},children:t.children.map(d=>e.jsx(Un,{node:d,depth:s+1,onReply:n,activeReplyId:r,userId:a,attrMap:o,userMap:i},d.id))})]})}function hi({comment:t,onReply:s,isReply:n,isHighlighted:r,isOwn:a,attrMap:o,userMap:i}){const c=t.createdAt?new Date(t.createdAt).toLocaleString(void 0,{dateStyle:"short",timeStyle:"short"}):"",p=["comment-item",n?"comment-reply":"",r?"comment-highlighted":"",a?"comment-own":""].filter(Boolean).join(" ");return e.jsxs("div",{className:p,children:[e.jsxs("div",{className:"comment-meta",children:[e.jsxs("span",{className:a?"comment-author comment-author-own":"comment-author",children:[t.author,a&&e.jsx("span",{className:"comment-you-badge",children:"you"})]}),t.attributeName&&e.jsxs("span",{className:"comment-attr-badge",title:`Attribute: ${t.attributeName}`,children:["#",o[t.attributeName]||t.attributeName]}),e.jsxs("span",{className:"comment-version",title:`Version ID: ${t.versionId}`,children:[t.revision,".",t.iteration]}),e.jsx("span",{className:"comment-time",children:c})]}),e.jsx("div",{className:"comment-text",children:e.jsx(ci,{text:t.text,attrMap:o,userMap:i})}),e.jsx("button",{className:"comment-reply-btn",onClick:()=>s({id:t.id,author:t.author}),children:"↩ Reply"})]})}function xi({activeNodeId:t,userId:s,users:n,activeNodeDesc:r}){var m,j,h;const a=fe(S=>S.showCollab),o=fe(S=>S.collabWidth),i=fe(S=>S.setCollabWidth),c=fe(S=>S.closeCollab),p=fe(S=>S.collabVersionFilter),d=fe(S=>S.setVersionFilter),x=fe(S=>S.collabTriggerText),f=fe(S=>S.clearTriggerText),k=fe(S=>S.collabTabs),T=l.useCallback(S=>{const W=S.clientX,F=o;function H(L){i(Math.max(240,Math.min(560,F+W-L.clientX)))}function R(){document.removeEventListener("mousemove",H),document.removeEventListener("mouseup",R)}document.addEventListener("mousemove",H),document.addEventListener("mouseup",R)},[o,i]),P=((m=r==null?void 0:r.metadata)==null?void 0:m.currentVersionId)??null,$=((j=r==null?void 0:r.metadata)==null?void 0:j.revision)??null,u=((h=r==null?void 0:r.metadata)==null?void 0:h.iteration)??null,y=l.useMemo(()=>{var W;const S=((W=r==null?void 0:r.metadata)==null?void 0:W.attributeMeta)||{};return((r==null?void 0:r.fields)||[]).filter(F=>S[F.name]).map(F=>({id:F.name,label:F.label}))},[r]);return!a||!t?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"resize-handle comment-resize",onMouseDown:T}),e.jsx(pi,{nodeId:t,userId:s,width:o,onClose:c,filterVersionId:p,onClearFilter:()=>d(null),users:n,triggerText:x,onClearTrigger:f,versionId:P,attributes:y,revision:$,iteration:u}),k.map(S=>e.jsx("div",{style:{display:"none"}},S.id))]})}const fi={error:"var(--danger, #fc8181)",warn:"var(--warning, #f0b429)",info:"var(--muted)",debug:"var(--muted2)"};function gi(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function nn(){const t=fe(n=>n.consoleLog),s=l.useRef(null);return l.useEffect(()=>{var n;(n=s.current)==null||n.scrollIntoView({behavior:"smooth"})},[t.length]),t.length===0?e.jsx("div",{style:{padding:"16px",color:"var(--muted)",fontSize:12,fontStyle:"italic"},children:"No platform events yet."}):e.jsxs("div",{style:{fontFamily:"monospace",fontSize:11,overflow:"auto",height:"100%",padding:"4px 8px"},children:[t.map((n,r)=>{var a;return e.jsxs("div",{style:{display:"flex",gap:8,lineHeight:"18px"},children:[e.jsx("span",{style:{color:"var(--muted2)",flexShrink:0},children:gi(n.ts)}),e.jsx("span",{style:{color:fi[n.level]??"inherit",flexShrink:0,width:40},children:(a=n.level)==null?void 0:a.toUpperCase()}),e.jsx("span",{style:{wordBreak:"break-all"},children:n.message})]},r)}),e.jsx("div",{ref:s})]})}function bi(){var d;const t=fe(x=>x.consoleVisible),s=fe(x=>x.consoleHeight),n=fe(x=>x.setConsoleHeight),r=fe(x=>x.consoleTabs),[a,o]=l.useState("console"),i=[{id:"console",label:"Console",Component:nn},...r],c=l.useCallback(x=>{x.preventDefault();const f=x.clientY,k=s;function T($){n(Math.max(80,Math.min(600,k+f-$.clientY)))}function P(){document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",P)}document.addEventListener("mousemove",T),document.addEventListener("mouseup",P)},[s,n]);if(!t)return null;const p=((d=i.find(x=>x.id===a))==null?void 0:d.Component)??nn;return e.jsxs("div",{style:{height:s,flexShrink:0,display:"flex",flexDirection:"column",borderTop:"1px solid var(--border)"},children:[e.jsx("div",{style:{height:4,cursor:"row-resize",background:"var(--border)",flexShrink:0},onMouseDown:c}),e.jsx("div",{style:{display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:i.map(x=>e.jsx("button",{onClick:()=>o(x.id),style:{padding:"4px 12px",fontSize:11,fontWeight:a===x.id?600:400,color:a===x.id?"var(--fg)":"var(--muted)",background:"none",border:"none",borderBottom:a===x.id?"2px solid var(--accent)":"2px solid transparent",cursor:"pointer"},children:x.label},x.id))}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(p,{})})]})}const vi=[];function yi(){return[...vi]}const ds={},ji=1e4,Vt=3e4,wi=1e3,ki=(ds==null?void 0:ds.VITE_JAEGER_URL)||"http://localhost:16686",gs=100,Kt=1e3;function rn(t,s=0){if(t==null||Number.isNaN(t))return"hsl(210, 10%, 55%)";s>0&&t<Kt&&(t=Math.max(t,Kt*.75));const n=Math.max(0,Math.min(1,(t-gs)/(Kt-gs))),r=150-150*n,a=60+25*n,o=55-5*n;return`hsl(${r.toFixed(0)}, ${a.toFixed(0)}%, ${o.toFixed(0)}%)`}function an(t,s){return s===0?"IDLE":t<gs?"FAST":t<400?"OK":t<Kt?"SLOW":"BAD"}const kt={up:{dot:"#4dd4a0",label:"UP"},degraded:{dot:"#f0b429",label:"DEGRADED"},down:{dot:"#fc8181",label:"DOWN"},unknown:{dot:"#6b8099",label:"UNKNOWN"}};function Si(t){return t==null?"—":t<60?`${t}s`:t<3600?`${Math.floor(t/60)}m`:`${Math.floor(t/3600)}h`}function Ni(t){if(t==null)return"—";const s=Math.floor(t/3600),n=Math.floor(t%3600/60),r=t%60;return s?`${s}h ${n}m`:n?`${n}m ${r}s`:`${r}s`}function Ae(t){return t==null||Number.isNaN(t)?"—":t<10?`${t.toFixed(1)}ms`:t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(2)}s`}function It(t){return t==null?"—":t<1e3?String(t):t<1e6?`${(t/1e3).toFixed(1)}K`:`${(t/1e6).toFixed(1)}M`}function He(t){return t==null?"—":t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`}function Qe(t){return t<100?"lat-fast":t<400?"lat-ok":t<1e3?"lat-slow":"lat-bad"}function Ci({sorted:t}){if(!t||t.length<2)return e.jsx("div",{className:"perf-chart-empty",children:"Need at least 2 calls to plot distribution."});const s=600,n=90,r=34,a=6,o=8,i=18,c=s-r-a,p=n-o-i,d=t[t.length-1]||1,x=y=>r+c*y/(t.length-1),f=y=>o+p-p*y/d;let k="";for(let y=0;y<t.length;y++){const m=x(y).toFixed(1),j=f(t[y]).toFixed(1);k+=(y===0?"M":"L")+m+","+j+" "}const T=k+`L${x(t.length-1).toFixed(1)},${(o+p).toFixed(1)} L${r},${(o+p).toFixed(1)} Z`,P=[.5,.75,.9,.95,.99],$=y=>{const m=Math.min(t.length-1,Math.floor(t.length*y));return{p:y,v:t[m],x:x(m),y:f(t[m])}},u=[0,d/2,d];return e.jsxs("svg",{viewBox:`0 0 ${s} ${n}`,className:"perf-chart",preserveAspectRatio:"none",children:[u.map((y,m)=>{const j=f(y);return e.jsxs("g",{children:[e.jsx("line",{x1:r,y1:j,x2:s-a,y2:j,stroke:"var(--border)",strokeWidth:"0.5",strokeDasharray:"2,3"}),e.jsx("text",{x:r-4,y:j+3,textAnchor:"end",fontSize:"9",fill:"var(--muted2)",fontFamily:"var(--mono)",children:Ae(y)})]},m)}),e.jsx("path",{d:T,fill:"rgba(106,172,255,0.18)"}),e.jsx("path",{d:k,stroke:"#6aacff",strokeWidth:"1.5",fill:"none"}),P.map(y=>{const m=$(y);return e.jsxs("g",{children:[e.jsx("line",{x1:m.x,y1:o,x2:m.x,y2:o+p,stroke:"#f0b429",strokeWidth:"0.6",strokeDasharray:"1,3",opacity:"0.65"}),e.jsx("circle",{cx:m.x,cy:m.y,r:"2",fill:"#f0b429"}),e.jsxs("text",{x:m.x,y:n-5,textAnchor:"middle",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:["p",Math.round(y*100)]})]},y)}),e.jsx("text",{x:r,y:n-5,textAnchor:"start",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p0"}),e.jsx("text",{x:s-a,y:n-5,textAnchor:"end",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p100"})]})}function Ei({showSettings:t,onToggleSettings:s,consoleVisible:n,onToggleConsole:r,leftSlots:a=[],rightSlots:o=[]}){const[i,c]=l.useState(null),[p,d]=l.useState(null),[x,f]=l.useState(!1),[k,T]=l.useState("services"),[P,$]=l.useState(null),[u,y]=l.useState(null),[m,j]=l.useState(Mt()),[h,S]=l.useState(()=>_t(Vt));l.useEffect(()=>{S(_t(Vt));const E=setInterval(()=>S(_t(Vt)),wi),U=Ls(()=>S(_t(Vt)));return()=>{clearInterval(E),U()}},[]);const W=l.useCallback(async()=>{try{const E=await mt.getStatus();c(E),d(null)}catch(E){d(E.message||String(E))}},[]);l.useEffect(()=>{W();const E=setInterval(W,ji);return()=>clearInterval(E)},[W]),l.useEffect(()=>x?(j(Mt()),Ls(()=>j(Mt()))):void 0,[x]);const F=l.useCallback(async()=>{try{const E=await mt.getNatsStatus();$(E),y(null)}catch(E){y(E.message||String(E))}},[]);l.useEffect(()=>{if(!x||k!=="nats")return;F();const E=setInterval(F,5e3);return()=>clearInterval(E)},[x,k,F]);const H=Ao(),R=l.useMemo(()=>yi(),[]),L=p?"down":(i==null?void 0:i.overall)||"unknown",C=kt[L]||kt.unknown;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-bar-row",children:[s&&e.jsxs("button",{type:"button",className:`status-bar-settings${t?" active":""}`,onClick:s,title:"Settings",children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]}),e.jsx("span",{children:"Settings"})]}),r&&e.jsxs("button",{type:"button",className:`status-bar-settings${n?" active":""}`,onClick:r,title:n?"Hide console":"Show console",style:{marginLeft:4},children:[e.jsx("span",{style:{fontSize:11},children:"≡"}),e.jsx("span",{children:"Console"})]}),a.map(E=>e.jsx(E.Component,{},E.id)),e.jsxs("button",{type:"button",className:"status-bar",onClick:()=>f(!0),title:"Click for platform status + API perf",children:[e.jsx("span",{className:"status-dot",style:{background:C.dot}}),e.jsx("span",{className:"status-label",children:"PLATFORM"}),e.jsx("span",{className:"status-value",style:{color:C.dot},children:C.label}),(i==null?void 0:i.services)&&e.jsxs("span",{className:"status-count",children:[i.services.filter(E=>E.healthy).length,"/",i.services.length," svc",i.totalInstances!=null&&e.jsxs(e.Fragment,{children:[" · ",i.totalHealthyInstances,"/",i.totalInstances," inst"]})]}),e.jsxs("span",{className:"perf-chip",style:{background:rn(h.p95,h.errorCount)},title:`30s window: ${h.count} calls · p95 ${Ae(h.p95)} · avg ${Ae(h.avgMs)}${h.errorCount?` · ${h.errorCount} err`:""}`,children:[e.jsx("span",{className:"perf-chip-dot"}),an(h.p95,h.count),h.count>0&&e.jsx("span",{className:"perf-chip-val",children:Ae(h.p95)})]}),H.cacheBytes>0&&e.jsxs("span",{className:"cache-chip",title:`3D cache: ${H.entries} part${H.entries!==1?"s":""} · ${He(H.cacheBytes)} / ${He(H.maxBytes)}`,children:["3D · ",He(H.cacheBytes)]})]})]}),x&&e.jsx("div",{className:"status-modal-overlay",onClick:()=>f(!1),children:e.jsxs("div",{className:"status-modal",onClick:E=>E.stopPropagation(),role:"dialog","aria-label":"Platform status",children:[e.jsxs("div",{className:"status-modal-header",children:[e.jsx("h3",{children:"Platform Status"}),e.jsxs("a",{className:"status-modal-jaeger",href:ki,target:"_blank",rel:"noopener noreferrer",title:"Open Jaeger tracing UI",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),e.jsx("polyline",{points:"15 3 21 3 21 9"}),e.jsx("line",{x1:"10",y1:"14",x2:"21",y2:"3"})]}),e.jsx("span",{children:"Traces"})]}),e.jsx("button",{className:"status-modal-close",onClick:()=>f(!1),"aria-label":"Close",children:"×"})]}),e.jsxs("div",{className:"status-tabs",children:[e.jsx("button",{className:`status-tab${k==="services"?" status-tab-active":""}`,onClick:()=>T("services"),children:"Services"}),e.jsxs("button",{className:`status-tab${k==="perf"?" status-tab-active":""}`,onClick:()=>T("perf"),children:["API Perf (",m.overall.total,")"]}),e.jsx("button",{className:`status-tab${k==="nats"?" status-tab-active":""}`,onClick:()=>T("nats"),children:"NATS"}),e.jsx("button",{className:`status-tab${k==="workers"?" status-tab-active":""}`,onClick:()=>T("workers"),children:"3D Workers"}),R.map(E=>e.jsx("button",{className:`status-tab${k===E.key?" status-tab-active":""}`,onClick:()=>T(E.key),children:E.label},E.key))]}),k==="services"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[e.jsx("span",{className:"status-dot",style:{background:C.dot}}),e.jsx("span",{className:"status-modal-overall",style:{color:C.dot},children:C.label}),(i==null?void 0:i.gatewayVersion)&&e.jsxs("span",{className:"status-modal-uptime",children:["spe-api ",e.jsx("code",{children:i.gatewayVersion})]}),(i==null?void 0:i.gatewayUptimeSeconds)!=null&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",Ni(i.gatewayUptimeSeconds)]}),e.jsx("button",{className:"status-modal-refresh",onClick:W,children:"refresh"})]}),p&&e.jsxs("div",{className:"status-modal-error",children:["Gateway unreachable: ",p]}),e.jsxs("table",{className:"status-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service / Instance"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Path"}),e.jsx("th",{children:"Affinity"}),e.jsx("th",{children:"Last HB"}),e.jsx("th",{children:"Failures"})]})}),e.jsx("tbody",{children:((i==null?void 0:i.services)||[]).flatMap(E=>{const U=E.status||(E.healthy?"up":"down"),q=kt[U]||kt.unknown,w=e.jsxs("tr",{className:"status-row-service",children:[e.jsxs("td",{children:[e.jsx("code",{children:E.serviceCode}),E.instanceCount!=null&&e.jsxs("span",{className:"status-inst-badge",title:"healthy / total instances",children:[E.healthyInstances,"/",E.instanceCount," inst"]})]}),e.jsx("td",{children:E.version?e.jsx("code",{children:E.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:q.dot}}),e.jsx("span",{style:{color:q.dot},children:q.label})]}),e.jsx("td",{children:E.path?e.jsx("code",{children:E.path}):e.jsx("span",{className:"muted",children:"—"})}),e.jsx("td",{children:E.instances&&E.instances.length>0&&(()=>{const g=E.instances.filter(b=>!b.untagged),B=E.instances.filter(b=>b.untagged);if(g.length===0)return e.jsx("span",{className:"muted",children:"all untagged"});const v=[...new Set(g.map(b=>b.spaceTag))].sort().join(", ");return e.jsxs("span",{className:"muted",children:[v,B.length?` + ${B.length} untagged`:""]})})()}),e.jsx("td",{colSpan:"2",children:E.registered?e.jsxs("span",{className:"muted",children:["pool of ",E.instanceCount]}):e.jsx("span",{className:"muted",children:"no instances registered"})})]},E.serviceCode),A=(E.instances||[]).map(g=>{const B=g.status||(g.healthy?"up":"down"),v=kt[B]||kt.unknown;return e.jsxs("tr",{className:"status-row-instance",children:[e.jsxs("td",{children:[e.jsx("span",{className:"status-inst-leaf",children:"↳"})," ",e.jsx("code",{className:"muted",children:g.instanceId})]}),e.jsx("td",{children:g.version?e.jsx("code",{children:g.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:v.dot}}),e.jsx("span",{style:{color:v.dot},children:v.label})]}),e.jsx("td",{children:g.untagged?e.jsx("span",{className:"muted",children:"—"}):e.jsx("code",{style:{fontSize:"0.85em"},children:g.spaceTag})}),e.jsx("td",{children:g.lastHeartbeatOk?Si(g.ageSeconds)+" ago":e.jsx("span",{className:"muted",children:"never"})}),e.jsx("td",{children:g.consecutiveFailures??0})]},E.serviceCode+"/"+g.instanceId)});return[w,...A]})})]}),(i==null?void 0:i.timestamp)&&e.jsxs("div",{className:"status-modal-timestamp",children:["server time: ",i.timestamp]})]}),k==="perf"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"perf-window-banner",style:{"--perf-color":rn(h.p95,h.errorCount)},children:[e.jsx("span",{className:"perf-chip-dot perf-chip-dot-lg"}),e.jsxs("span",{className:"perf-window-label",children:["last 30s — ",an(h.p95,h.count)]}),e.jsxs("span",{className:"perf-window-metrics",children:[h.count," calls · p50 ",Ae(h.p50)," · p95 ",Ae(h.p95)," · max ",Ae(h.maxMs),h.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[" · ",h.errorCount," err"]})]})]}),e.jsxs("div",{className:"status-modal-summary",children:[e.jsxs("span",{className:"status-perf-summary",children:[e.jsxs("span",{children:[m.overall.total," calls"]}),e.jsxs("span",{children:["avg ",e.jsx("strong",{className:Qe(m.overall.avgMs),children:Ae(m.overall.avgMs)})]}),e.jsxs("span",{children:["p50 ",e.jsx("strong",{className:Qe(m.overall.p50),children:Ae(m.overall.p50)})]}),e.jsxs("span",{children:["p95 ",e.jsx("strong",{className:Qe(m.overall.p95),children:Ae(m.overall.p95)})]}),e.jsxs("span",{children:["p99 ",e.jsx("strong",{className:Qe(m.overall.p99),children:Ae(m.overall.p99)})]}),e.jsxs("span",{children:["max ",e.jsx("strong",{className:Qe(m.overall.maxMs),children:Ae(m.overall.maxMs)})]}),m.overall.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[m.overall.errorCount," err"]})]}),e.jsx("button",{className:"status-modal-refresh",onClick:()=>{ra(),j(Mt())},children:"reset"})]}),e.jsxs("div",{className:"status-perf-note",children:["Window = last ",m.overall.windowSize," calls. Latency = browser-observed time through nginx → spe-api → ","{","psm,pno","}","."]}),e.jsx(Ci,{sorted:m.overall.sorted}),m.byEndpoint.length===0?e.jsx("div",{className:"status-perf-empty",children:"No API calls recorded yet."}):e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Method"}),e.jsx("th",{children:"Endpoint"}),e.jsx("th",{children:"#"}),e.jsx("th",{children:"avg"}),e.jsx("th",{children:"p50"}),e.jsx("th",{children:"p95"}),e.jsx("th",{title:"sorted desc by p95",children:"max ▼"}),e.jsx("th",{children:"last"}),e.jsx("th",{children:"err"})]})}),e.jsx("tbody",{children:[...m.byEndpoint].sort((E,U)=>U.p95-E.p95).map(E=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:E.method})}),e.jsx("td",{children:e.jsx("code",{title:E.endpoint,children:E.endpoint})}),e.jsx("td",{children:E.count}),e.jsx("td",{className:Qe(E.avgMs),children:Ae(E.avgMs)}),e.jsx("td",{className:Qe(E.p50),children:Ae(E.p50)}),e.jsx("td",{className:Qe(E.p95),children:Ae(E.p95)}),e.jsx("td",{className:Qe(E.maxMs),children:Ae(E.maxMs)}),e.jsx("td",{className:Qe(E.lastMs),children:Ae(E.lastMs)}),e.jsx("td",{className:E.errorCount?"lat-bad":"muted",children:E.errorCount||0})]},`${E.method} ${E.endpoint}`))})]})})]}),k==="nats"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[P?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-dot",style:{background:P.status==="up"?"#4dd4a0":"#fc8181"}}),e.jsx("span",{className:"status-modal-overall",style:{color:P.status==="up"?"#4dd4a0":"#fc8181"},children:P.status==="up"?"UP":"DOWN"}),P.version&&e.jsxs("span",{className:"status-modal-uptime",children:["v",P.version]}),P.uptime&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",P.uptime]})]}):e.jsx("span",{className:"muted",children:u?`Error: ${u}`:"Loading..."}),e.jsx("button",{className:"status-modal-refresh",onClick:F,children:"refresh"})]}),P&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nats-stats-grid",children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Connections"}),e.jsx("span",{className:"nats-stat-value",children:P.connections??0}),e.jsxs("span",{className:"nats-stat-sub",children:["total: ",P.totalConnections??0]})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Subscriptions"}),e.jsx("span",{className:"nats-stat-value",children:P.subscriptions??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages In"}),e.jsx("span",{className:"nats-stat-value",children:It(P.inMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:He(P.inBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages Out"}),e.jsx("span",{className:"nats-stat-value",children:It(P.outMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:He(P.outBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Slow Consumers"}),e.jsx("span",{className:`nats-stat-value${P.slowConsumers>0?" lat-bad":""}`,children:P.slowConsumers??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Sub Cache"}),e.jsx("span",{className:"nats-stat-value",children:P.numCache??0}),e.jsxs("span",{className:"nats-stat-sub",children:["matches: ",It(P.numMatches)]})]})]}),P.connectionDetails&&P.connectionDetails.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("h4",{className:"nats-section-title",children:["Client Connections (",P.numConnections,")"]}),e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"CID"}),e.jsx("th",{children:"Name"}),e.jsx("th",{children:"Lang"}),e.jsx("th",{children:"Subs"}),e.jsx("th",{children:"Msgs In"}),e.jsx("th",{children:"Msgs Out"}),e.jsx("th",{children:"Bytes In"}),e.jsx("th",{children:"Bytes Out"}),e.jsx("th",{children:"Uptime"}),e.jsx("th",{children:"Idle"})]})}),e.jsx("tbody",{children:P.connectionDetails.map(E=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:E.cid})}),e.jsx("td",{children:e.jsx("code",{title:E.name,children:E.name||"—"})}),e.jsx("td",{children:E.lang||"—"}),e.jsx("td",{children:typeof E.subscriptions=="number"?E.subscriptions:Array.isArray(E.subscriptions)?E.subscriptions.length:"—"}),e.jsx("td",{children:It(E.inMsgs)}),e.jsx("td",{children:It(E.outMsgs)}),e.jsx("td",{children:He(E.inBytes)}),e.jsx("td",{children:He(E.outBytes)}),e.jsx("td",{children:E.uptime||"—"}),e.jsx("td",{children:E.idle||"—"})]},E.cid))})]})})]})]})]}),k==="workers"&&e.jsxs("div",{style:{padding:"12px 16px",overflowY:"auto"},children:[e.jsx("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"},children:[{v:H.workers,l:"Workers"},{v:H.entries,l:"Cached Parts"},{v:He(H.cacheBytes),l:"Memory Used"},{v:He(H.maxBytes),l:"Memory Limit"},{v:H.memHits,l:"Mem Hits"},{v:H.idbHits,l:"IDB Hits"},{v:H.netFetches,l:"Downloads"},{v:Ae(H.avgDownloadMs),l:"Avg Download"},{v:Ae(H.avgParseMs),l:"Avg Parse"}].map(({v:E,l:U})=>e.jsxs("div",{style:{background:"var(--surface2)",borderRadius:6,padding:"8px 14px",minWidth:90},children:[e.jsx("div",{style:{fontSize:17,fontWeight:700,color:"var(--text)",lineHeight:1.2},children:E??"—"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginTop:2},children:U})]},U))}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted2)"},children:["Cache: ",He(H.cacheBytes)," / ",He(H.maxBytes)," (",H.maxBytes>0?(H.cacheBytes/H.maxBytes*100).toFixed(1):0,"%)"]}),e.jsx("div",{style:{marginTop:6,height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${H.maxBytes>0?Math.min(100,H.cacheBytes/H.maxBytes*100):0}%`,background:"var(--accent)",borderRadius:3,transition:"width .3s"}})}),e.jsxs("div",{style:{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginRight:4},children:"Limit / worker"}),[{label:"128 MB",bytes:128*1024*1024},{label:"256 MB",bytes:256*1024*1024},{label:"512 MB",bytes:512*1024*1024},{label:"1 GB",bytes:1024*1024*1024}].map(({label:E,bytes:U})=>{const q=H.workers>0?H.maxBytes/H.workers:0,w=Math.abs(q-U)<1024;return e.jsx("button",{type:"button",onClick:()=>zo(U),style:{padding:"3px 10px",fontSize:11,borderRadius:4,border:"1px solid",borderColor:w?"var(--accent)":"var(--border)",background:w?"var(--accent)":"var(--surface2)",color:w?"#fff":"var(--text)",cursor:"pointer",fontWeight:w?700:400},children:E},E)})]}),e.jsxs("div",{style:{marginTop:10,display:"flex",gap:8},children:[e.jsx("button",{type:"button",onClick:()=>Js({idb:!1}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear Memory"}),e.jsx("button",{type:"button",onClick:()=>Js({idb:!0}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear All + IDB"})]}),e.jsx("div",{style:{marginTop:12,fontSize:11,color:"var(--muted2)"},children:"Avg timings = rolling average over last 50 loads per worker. IDB = IndexedDB persistent cache. Mem = in-memory LRU."})]}),R.map(E=>k===E.key&&e.jsx(E.Component,{},E.key))]})})]})}function Ti(){const t=fe(s=>s.bgJobs);return t.length===0?null:e.jsx(e.Fragment,{children:t.map(s=>{const n=s.status==="done"||s.status==="failed",r=s.status==="failed";return e.jsxs("button",{className:"bg-job-chip",onClick:s.onOpen,title:`${s.label} — click to view`,children:[e.jsx("span",{className:`bg-job-dot${n?"":" bg-job-dot-pulse"}`,style:{background:r?"#fc8181":n?"#4dd4a0":"var(--accent)"}}),e.jsxs("span",{children:[s.label,n?r?" — Failed":" — Done":"…"]})]},s.id)})})}function on(t){const s=fe(i=>i.statusSlots),n=fe(i=>i.consoleVisible),r=fe(i=>i.toggleConsole),a=[{id:"_bg-jobs",Component:Ti,position:"left"},...s.filter(i=>i.position!=="right")],o=s.filter(i=>i.position==="right");return e.jsx(Ei,{...t,leftSlots:a,rightSlots:o,consoleVisible:n,onToggleConsole:r})}const zi=350,Ii=["_type","_projectSpaceId"],Ai={_type:"Type",_projectSpaceId:"Project"},$i=[];function ln(t){return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(t)}function Pi({query:t,onQueryChange:s,onClose:n,onNavigate:r}){const[a,o]=l.useState(t||""),[i,c]=l.useState(null),[p,d]=l.useState(!1),[x,f]=l.useState({}),[k,T]=l.useState(null),[P,$]=l.useState(560),u=l.useRef(null),y=te(g=>g.basketItems),m=te(g=>g.addToBasket),j=te(g=>g.removeFromBasket),h=te(g=>g.userId),S=te(g=>g.items),W=l.useMemo(()=>({onNavigate:r}),[r]);l.useEffect(()=>{X.searchInfo().then(T).catch(()=>T({available:!1}))},[]);const F=l.useCallback(async(g,B)=>{if(!(g!=null&&g.trim())){c(null);return}d(!0);try{const v=Object.fromEntries(Object.entries(B).filter(([,M])=>(M==null?void 0:M.length)>0)),b=await X.searchNodes(g.trim(),v,Ii,100);c(b)}catch{c(null)}finally{d(!1)}},[]);l.useEffect(()=>{o(t||"")},[t]),l.useEffect(()=>(clearTimeout(u.current),u.current=setTimeout(()=>F(a,x),zi),()=>clearTimeout(u.current)),[a,x,F]);function H(g){o(g.target.value),s==null||s(g.target.value)}function R(g,B){f(v=>{const b=v[g]||[],M=b.includes(B)?b.filter(N=>N!==B):[...b,B];if(M.length===0){const{[g]:N,...D}=v;return D}return{...v,[g]:M}})}function L(){f({})}function C(g){g.preventDefault();const B=g.clientX,v=P,b=N=>$(Math.max(420,Math.min(900,v+N.clientX-B))),M=()=>{document.removeEventListener("mousemove",b),document.removeEventListener("mouseup",M)};document.addEventListener("mousemove",b),document.addEventListener("mouseup",M)}const E=(i==null?void 0:i.hits)||[],U=(i==null?void 0:i.facets)||{},q=(i==null?void 0:i.totalHits)??0,w=Object.values(x).some(g=>(g==null?void 0:g.length)>0),A=Object.keys(U).length>0;return e.jsxs("div",{className:"search-panel",style:{width:P},children:[e.jsx("div",{className:"resize-handle search-panel-resize",onMouseDown:C}),e.jsxs("div",{className:"search-panel-header",children:[e.jsx("span",{className:"search-panel-title",children:"Search"}),e.jsxs("div",{className:"search-panel-header-right",children:[k&&e.jsx("span",{className:`search-index-badge${k.available?"":" unavail"}`,title:k.available?`${k.nodeCount} nodes · ${k.edgeCount} edges indexed`:"Search index unavailable",children:k.available?`${ln(k.nodeCount)} nodes · ${ln(k.edgeCount)} edges`:"index unavailable"}),e.jsx("button",{className:"panel-icon-btn",onClick:n,title:"Close search",children:e.jsx(ht,{size:13,strokeWidth:2})})]})]}),e.jsx("div",{className:"search-panel-input-wrap",children:e.jsx("input",{autoFocus:!0,className:"search-panel-input",type:"text",placeholder:"Search nodes…",value:a,onChange:H})}),e.jsxs("div",{className:"search-panel-body",children:[e.jsx("div",{className:"search-facets",children:A?e.jsxs(e.Fragment,{children:[Object.entries(U).map(([g,B])=>{const v=Ai[g]||g,b=x[g]||[],M=$i.includes(g);return e.jsxs("div",{className:"search-facet-group",children:[e.jsxs("div",{className:"search-facet-dim",children:[v,b.length>0&&e.jsx("span",{className:"search-facet-dim-count",children:b.length})]}),M?e.jsxs("div",{className:"search-facet-range",children:[e.jsx("input",{type:"number",className:"search-facet-range-input",placeholder:"Min",value:b[0]??"",onChange:N=>f(D=>({...D,[g]:[N.target.value,(D[g]||[])[1]??""]}))}),e.jsx("span",{className:"search-facet-range-sep",children:"–"}),e.jsx("input",{type:"number",className:"search-facet-range-input",placeholder:"Max",value:b[1]??"",onChange:N=>f(D=>({...D,[g]:[(D[g]||[])[0]??"",N.target.value]}))})]}):Object.entries(B).slice(0,10).map(([N,D])=>{const O=b.includes(N);return e.jsxs("label",{className:`search-facet-item${O?" active":""}`,title:`${O?"Remove: ":"Add: "}${N}`,children:[e.jsx("input",{type:"checkbox",className:"search-facet-checkbox",checked:O,onChange:()=>R(g,N)}),e.jsx("span",{className:"search-facet-val",children:N}),e.jsx("span",{className:"search-facet-count",children:D})]},N)})]},g)}),w&&e.jsx("button",{className:"search-facet-clear",onClick:L,children:"Clear filters"})]}):e.jsx("div",{className:"search-facets-empty",children:a.trim()&&!p?"No facets":"Facets appear after search"})}),e.jsxs("div",{className:"search-panel-results",children:[p&&e.jsx("div",{className:"panel-empty",children:"Searching…"}),!p&&a.trim()&&i!==null&&q===0&&e.jsxs("div",{className:"panel-empty",children:['No results for "',a,'"']}),!p&&q>0&&e.jsxs("div",{className:"search-results-count",children:[q," result",q!==1?"s":"",w?" (filtered)":""]}),!p&&E.map(g=>{var _;let B={};try{B=JSON.parse(g.sourceJson||"{}")}catch{}const v=B.logicalId||g.id,b=g.serviceCode||"psm",M=g.itemCode||g.type,N=`${b}:${M}`,D=!!((_=y[N])!=null&&_.has(g.id)),G=S.find(K=>K.serviceCode===b&&K.itemCode===M)||{serviceCode:b,itemCode:M,displayName:g.type},z={id:g.id,_title:v,...B};return e.jsx(ks,{descriptor:G,item:z,ctx:W,isPinned:D,onPin:()=>m(h,b,M,g.id),onUnpin:()=>j(h,b,M,g.id)},g.id)})]})]})]})}Oo();const cn="ps-default";let Ri=0;function Li(){const[t,s]=l.useState([]),[n,r]=l.useState(null),a=l.useCallback((o,i="info")=>{const c=typeof o=="string"?o:(o==null?void 0:o.message)||String(o),p=typeof o!="string"&&(o!=null&&o.detail)?o.detail:null;if(i==="error"){r(p??{error:c});return}const d=++Ri;s(x=>[...x,{id:d,msg:c,type:i}]),setTimeout(()=>s(x=>x.filter(f=>f.id!==d)),4e3)},[]);return{toasts:t,toast:a,errorDetail:n,setErrDetail:r}}function Bi({toasts:t}){return e.jsx("div",{className:"toasts",role:"status","aria-live":"polite",children:t.map(s=>e.jsxs("div",{className:`toast toast-${s.type}`,children:[e.jsx("span",{"aria-hidden":"true",children:s.type==="success"?"✓":s.type==="error"?"✗":s.type==="warn"?"⚠":"ℹ"}),s.msg]},s.id))})}function Di(){var As;const{toasts:t,toast:s,errorDetail:n,setErrDetail:r}=Li(),[a,o]=l.useState("user-alice"),[i,c]=l.useState(cn),p=te(I=>I.setUserId),d=te(I=>I.setProjectSpaceId),x=te(I=>I.nodes),f=te(I=>I.nodeTypes),k=te(I=>I.resources),T=te(I=>I.stateColorMap),P=te(I=>I.stateColorMapLoaded),$=te(I=>I.projectSpaces),u=te(I=>I.users),y=te(I=>I.activeTx),m=te(I=>I.txNodes),j=te(I=>I.refreshNodes),h=te(I=>I.refreshTx),S=te(I=>I.refreshAll),W=te(I=>I.refreshItems),F=te(I=>I.refreshStateColorMap),H=te(I=>I.refreshProjectSpaces),R=te(I=>I.refreshUsers),L=te(I=>I.clearTx),C=te(I=>I.loadBasket);te(I=>I.addToBasket),te(I=>I.basketItems);const E=te(I=>I.syncBasketAdd),U=te(I=>I.syncBasketRemove),q=te(I=>I.syncBasketClear),w=te(I=>I.removeBasketItemIds),A=te(I=>I.lockItem),g=te(I=>I.unlockItem),B=te(I=>I.unlockAll),[v,b]=l.useState(0),[M,N]=l.useState(!1),[D,O]=l.useState(""),G=l.useCallback(()=>b(I=>I+1),[]),[z,_]=l.useState(""),[K,ee]=l.useState(""),re={id:"dashboard",nodeId:null,label:"Dashboard",pinned:!0},[de,je]=l.useState([re]),[V,Q]=l.useState("dashboard"),[ie,Z]=l.useState(null),[ne,ue]=l.useState({}),he=l.useRef(new Set),le=l.useCallback(I=>{var ge;const Y=de.find(xe=>xe.nodeId===I);if(!((ge=Y==null?void 0:Y.get)!=null&&ge.path))return;const ae=(y==null?void 0:y.txId)||null;ue(xe=>({...xe,[I]:{...xe[I]??{},status:"loading"}})),Nn(Y.serviceCode,Y.get,I,ae?{txId:ae}:{}).then(xe=>ue(be=>({...be,[I]:{status:"ok",data:xe}}))).catch(xe=>{(xe==null?void 0:xe.status)===404?(he.current.delete(I),ue(be=>{const Pe={...be};return delete Pe[I],Pe}),je(be=>{const Pe=be.filter(pt=>pt.nodeId!==I);return Q(pt=>{var Re;return pt===Y.id?((Re=Pe.at(-1))==null?void 0:Re.id)??null:pt}),Pe})):ue(be=>({...be,[I]:{status:"error",error:xe.message}}))})},[de,y]),se=l.useCallback(()=>{de.filter(I=>{var Y;return I.nodeId&&((Y=I.get)==null?void 0:Y.path)}).forEach(I=>le(I.nodeId))},[de,le]);l.useEffect(()=>{var Y;if(!V||V==="dashboard")return;const I=de.find(ae=>ae.id===V);!((Y=I==null?void 0:I.get)!=null&&Y.path)||!I.nodeId||he.current.has(I.nodeId)||(he.current.add(I.nodeId),le(I.nodeId))},[V,de]);const me=l.useRef(null);l.useEffect(()=>{const I=(y==null?void 0:y.txId)||null;if(I===me.current||(me.current=I,!V||V==="dashboard"))return;const Y=de.find(ae=>ae.id===V);Y!=null&&Y.nodeId&&le(Y.nodeId)},[y,V,de,le]);const[we,Se]=l.useState(!1),[Ce,Ie]=l.useState(!1),[ke,$e]=l.useState(null),[qe,bt]=l.useState(!1),[Je,Xe]=l.useState(null),[vt,Ue]=l.useState(null),[Ye,_e]=l.useState(268),[st,Ns]=l.useState(!1),[Cs,Es]=l.useState(null),[Hn,Vn]=l.useState(0),[Kn,qn]=l.useState(!1),at=l.useCallback((I,Y,ae)=>{if(!ae||!ae.serviceCode)throw new Error("navigate(): descriptor is required");const ge={serviceCode:ae.serviceCode,itemCode:ae.itemCode,itemKey:ae.itemKey,get:ae.get||null};je(xe=>{const be=xe.find(Re=>Re.nodeId===I);if(be)return Q(be.id),xe.map(Re=>Re.id===be.id?{...Re,...ge}:Re);const Pe=xe.find(Re=>!Re.pinned&&Re.id!=="dashboard");if(Pe)return Q(Pe.id),xe.map(Re=>Re.id===Pe.id?{...Re,nodeId:I,label:Y||I.slice(0,10),...ge}:Re);const pt=`tab-${Date.now()}`;return Q(pt),[...xe,{id:pt,nodeId:I,label:Y||I.slice(0,10),pinned:!1,...ge}]})},[]),Jn=l.useCallback(I=>at(I.nodeId,I.label,I),[at]),Ts=l.useCallback(I=>{je(Y=>{const ae=Y.find(xe=>xe.id===I);ae!=null&&ae.nodeId&&(he.current.delete(ae.nodeId),ue(xe=>{const be={...xe};return delete be[ae.nodeId],be}));const ge=Y.filter(xe=>xe.id!==I);return V===I&&(Q(ge.length>0?ge[ge.length-1].id:null),Z(null)),ge})},[V]),zs=l.useMemo(()=>Uo({navigate:at,openTab:Jn,closeTab:Ts}),[]);zn(["/topic/transactions","/topic/global","/topic/metamodel"],async I=>{if(I.event==="LOCK_ACQUIRED")I.lockedBy===a&&A(I.nodeId);else if(I.event==="LOCK_RELEASED")I.releasedBy===a&&g(I.nodeId);else if(I.event==="TX_COMMITTED")I.byUser===a&&B(),await h(),I.byUser&&I.byUser!==a&&s(`${I.byUser} committed a transaction`,"info");else if(I.event==="ITEM_DELETED"){const Y=I.nodeId||I.itemId;Y&&(w([Y]),je(ae=>{const ge=ae.find(be=>be.nodeId===Y);if(!ge)return ae;he.current.delete(Y),ue(be=>{const Pe={...be};return delete Pe[Y],Pe});const xe=ae.filter(be=>be.nodeId!==Y);return Q(be=>{var Pe;return be===ge.id?((Pe=xe.at(-1))==null?void 0:Pe.id)??null:be}),xe})),j(),G()}else if(I.event==="TX_ROLLED_BACK")I.byUser===a&&B(),await h(),await j(),se(),G(),I.byUser&&I.byUser!==a&&s(`${I.byUser} rolled back a transaction`,"warn");else if(I.event==="ITEMS_RELEASED")I.byUser===a&&(I.nodeIds||[]).forEach(g),h(),G();else if(I.event==="ITEM_CREATED")j(),h(),G();else if(I.event==="ITEM_CAPTURED")h();else if(I.event==="BASKET_ITEM_ADDED")E(I.key,I.value);else if(I.event==="BASKET_ITEM_REMOVED")U(I.key,I.value);else if(I.event==="BASKET_CLEARED")q();else if(I.event==="ITEM_VERSION_CREATED"||I.event==="ITEM_UPDATED"){const Y=I.nodeId||I.itemId;Y&&le(Y),j(),G()}else I.event==="METAMODEL_CHANGED"?(W(),G(),P&&F(),I.byUser&&I.byUser!==a&&s(`${I.byUser} updated the metamodel`,"info")):I.event==="PNO_CHANGED"&&(R(),H(),I.byUser&&I.byUser!==a&&s(`${I.byUser} updated ${(I.entity||"PNO data").toLowerCase()}`,"info"))},a,i);function Is(){bt(I=>(!I&&a&&(X.getSettingsSections(a).then(Y=>{var ge,xe,be;Ue(Y);const ae=(be=(xe=(ge=Y==null?void 0:Y[0])==null?void 0:ge.sections)==null?void 0:xe[0])==null?void 0:be.key;ae&&Xe(ae)}).catch(()=>Ue([])),F()),!I))}l.useEffect(()=>{Ds(cn),oa(I=>s(I,"error"))},[s]),l.useEffect(()=>{let I=!1;return Ns(!1),Es(null),(async()=>{try{await Os.login(a)}catch(Y){I||Es(Y.message||String(Y));return}if(!I){ia(async()=>{try{return(await Os.login(a)).token}catch{return null}}),Ns(!0),p(a),d(i),S(),H(),R(),F(),C(a),ma(a),qe&&X.getSettingsSections(a).then(Y=>{var ge,xe,be;Ue(Y);const ae=(be=(xe=(ge=Y==null?void 0:Y[0])==null?void 0:ge.sections)==null?void 0:xe[0])==null?void 0:be.key;ae&&Xe(ae)}).catch(()=>Ue([]));try{const Y=await Go(zs);Y.length>0&&s(`Some plugins failed to load: ${Y.join("; ")}`,"error")}catch(Y){s(`Plugin manifest unavailable: ${Y.message||Y}`,"error")}finally{qn(!0),b(Y=>Y+1)}}})(),()=>{I=!0}},[a,i,Hn]);function Xn(I){o(I),je([re]),Q("dashboard"),Z(null),_("")}function Yn(I){c(I),Ds(I),d(I),C(a),je([re]),Q("dashboard"),Z(null),S()}function Zn(I){const Y=I.clientX,ae=Ye;function ge(be){_e(Math.max(160,Math.min(600,ae+be.clientX-Y)))}function xe(){document.removeEventListener("mousemove",ge),document.removeEventListener("mouseup",xe)}document.addEventListener("mousemove",ge),document.addEventListener("mouseup",xe)}async function Qn(){if(y)return y.txId;try{const I=await ut.open(a,"Work session");return await h(),I.txId}catch(I){return s(I,"error"),null}}async function er(){if(y)try{await ut.rollback(a,y.serviceCode,y.txId),s("Transaction rolled back","warn"),L(),await j(),se()}catch(I){s(I,"error")}}async function tr(I){if(y)try{await ut.release(a,y.serviceCode,y.txId,[I]),s("Object released from transaction","info"),await S()}catch(Y){s(Y,"error")}}async function sr(I,Y){if(await S(),se(),I&&Y>0){const ae=Y;s(`${ae} object${ae>1?"s":""} deferred — new transaction opened`,"info")}}const ct=de.find(I=>I.id===V),dt=ct==null?void 0:ct.nodeId,nr=V==="dashboard",rr=l.useMemo(()=>de.filter(I=>I.id!=="dashboard"&&I.nodeId).map(ya).filter(Boolean),[de]),ar=l.useMemo(()=>{const I={};for(const Y of de){if(!Y.nodeId||Y.id==="dashboard")continue;const ae=ne[Y.nodeId];(ae==null?void 0:ae.status)==="ok"&&ae.data&&(I[Y.nodeId]=An(ae.data))}return I},[de,ne]),or=l.useCallback(I=>{if((I==null?void 0:I.nodeId)===dt&&Z(I),I!=null&&I.nodeId){const Y=I.logicalId||I.identity||void 0;je(ae=>ae.map(ge=>ge.nodeId===I.nodeId?{...ge,...I.nodeTypeId&&{nodeTypeId:I.nodeTypeId},...Y&&{label:Y}}:ge))}},[dt]);return st?e.jsx(Fo.Provider,{value:zs,children:e.jsxs("div",{className:"shell",children:[e.jsx(Ia,{userId:a,onUserChange:Xn,users:u,nodeTypes:f,stateColorMap:T,searchQuery:z,searchType:K,onSearchChange:_,onSearchTypeChange:ee,onSearchSubmit:I=>{O(I),N(!0)},projectSpaces:$,projectSpaceId:i,onProjectSpaceChange:Yn,nodes:x,onNavigate:at}),e.jsxs("div",{className:"body",children:[e.jsx("div",{className:`search-strip${M?" search-strip--open":""}`,onClick:()=>N(I=>!I),title:M?"Close search":"Search items",children:e.jsxs("span",{className:"search-strip-label",children:[M?"◀":"▶"," Search"]})}),e.jsx(is,{children:e.jsx(Qo,{nodeTypes:f,tx:y,txNodes:m,userId:a,activeNodeId:dt,stateColorMap:T,onNavigate:at,canCreateNode:k.length>0,onCreateNode:I=>{$e(I||null),Ie(!0)},onCommit:()=>Se(!0),onRollback:er,onReleaseNode:tr,showSettings:qe,onToggleSettings:Is,activeSettingsSection:Je,onSettingsSectionChange:Xe,settingsSections:vt,isDashboardOpen:nr,onOpenDashboard:()=>Q("dashboard"),browseRefreshKey:v,openItems:rr,openItemDataMap:ar,style:{width:Ye},toast:s})}),e.jsx("div",{className:"resize-handle",onMouseDown:Zn}),e.jsxs("div",{className:"editor-column",children:[qe?e.jsx(is,{children:e.jsx(yo,{userId:a,projectSpaceId:i,activeSection:Je,onSectionChange:Xe,settingsSections:vt,pluginsLoaded:Kn,toast:s})}):e.jsx(is,{children:e.jsx(ai,{tabs:de,activeTabId:V,userId:a,tx:y,toast:s,nodeTypes:f,stateColorMap:T,onTabActivate:I=>Q(I),onTabClose:Ts,onTabPin:I=>je(Y=>Y.map(ae=>ae.id===I?{...ae,pinned:!ae.pinned}:ae)),onSubTabChange:(I,Y)=>je(ae=>ae.map(ge=>ge.id===I?{...ge,activeSubTab:Y}:ge)),onNavigate:at,onAutoOpenTx:Qn,onDescriptionLoaded:or,onRefreshItemData:le,tabItemData:ct!=null&&ct.nodeId?ne[ct.nodeId]??null:null})}),e.jsx(bi,{})]}),e.jsx(xi,{activeNodeId:dt,userId:a,users:u,activeNodeDesc:dt&&((As=ne[dt])==null?void 0:As.status)==="ok"?ne[dt].data:null})]}),M&&e.jsx(Pi,{query:D,onQueryChange:O,onClose:()=>N(!1),userId:a,projectSpaceId:i,onNavigate:at}),we&&y&&e.jsx(jo,{userId:a,serviceCode:y.serviceCode,txId:y.txId,txNodes:m,stateColorMap:T,onCommitted:sr,onClose:()=>Se(!1),toast:s}),Ce&&k.length>0&&e.jsx(wo,{resources:k,initialDescriptor:ke,onCreated:async(I,Y)=>{await S(),(Y==null?void 0:Y.serviceCode)==="psm"&&(I!=null&&I.nodeId)&&at(I.nodeId,void 0,Ot)},onClose:()=>{Ie(!1),$e(null)},toast:s}),n&&e.jsx(No,{detail:n,onClose:()=>r(null)}),e.jsx(Bi,{toasts:t}),e.jsx(on,{showSettings:qe,onToggleSettings:Is})]})}):e.jsxs("div",{className:"shell",children:[e.jsx("div",{className:"auth-splash",children:Cs?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-error",children:"Login failed"}),e.jsx("div",{className:"auth-splash-detail",children:Cs}),e.jsx("button",{className:"auth-splash-retry",onClick:()=>Vn(I=>I+1),children:"retry"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-spinner"}),e.jsxs("div",{className:"auth-splash-label",children:["Signing in as ",a,"…"]})]})}),e.jsx(on,{})]})}const Oi=`
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
.tab-close:hover{opacity:1!important;background:rgba(252,129,129,.12)}
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
  background:rgba(252,129,129,.06);border:1px solid rgba(252,129,129,.25);
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
.diff-meta-old{border-right:1px solid var(--border);background:rgba(252,129,129,.03)}
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
.diff-old-col{background:rgba(252,129,129,.04)}
.diff-new-col{background:rgba(77,212,160,.04)}
.diff-val-old{color:var(--danger);background:rgba(252,129,129,.06)}
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
.btn-danger{border-color:rgba(252,129,129,.5);color:var(--danger);background:rgba(252,129,129,.08)}
.btn-danger:hover{background:rgba(252,129,129,.18);border-color:var(--danger)}
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
  background:rgba(252,129,129,.07);border-left:2px solid var(--danger);border-radius:2px;
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
  text-transform:uppercase;color:var(--danger);background:rgba(252,129,129,.1);
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
  background:rgba(252,129,129,.07);
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
  background:rgba(252,129,129,.12);border-color:rgba(252,129,129,.3);color:var(--danger);
}
.btn-danger.btn-xs:hover{background:rgba(252,129,129,.22)}

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
  padding:8px 12px;background:rgba(252,129,129,.1);
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
`,Gn=document.createElement("style");Gn.textContent=Oi;document.head.appendChild(Gn);ha();const Mi=ir.createRoot(document.getElementById("root"));Mi.render(e.jsx(De.StrictMode,{children:e.jsx(Di,{})}));
//# sourceMappingURL=index-vihOeAd4.js.map
