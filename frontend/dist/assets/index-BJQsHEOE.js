import{j as e}from"./react-jsx-runtime-shim-DtcNtlUI.js";import{c as Js,r as l,R as et}from"./vendor-Dw91Z_SL.js";import{c as Rn}from"./react-dom-shim-u_SHOSaN.js";import{S as $n,R as Ln,G as Dn,C as On,B as Mn,a as Bn,L as _n,A as Zs,b as at,U as Qs,c as Wn,H as Et,d as en,F as Gn,e as ps,M as Fn,f as Un,Z as ms,g as Hn,h as Vn,T as qn,i as Kn,j as tn,k as sn,D as nn,l as Xn,W as Yn,m as us,P as rn,n as Jn,o as Zn,N as Qn,K as er,p as an,q as tr,r as sr,s as Ht,t as nr,X as kt,u as it,v as $e,w as Me,x as ut,y as Re,z as rr,E as ar,I as ir,J as bs,O as or,Q as lr,V as cr,Y as dr,_ as pr,$ as mr}from"./icons-S3AOjxSR.js";import{C as wt,S as ur,A as hr,D as xr,P as fr,W as gr,O as br,X as vr,V as yr,M as vs,B as jr,a as ys,G as wr,b as Sr,c as Xt,d as js,e as kr,f as Nr,g as Cr,h as Er,R as Tr}from"./three-DAyMVibd.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();const on=500,qe=[],rs=new Set;function ln(){rs.forEach(t=>{try{t()}catch{}})}function ws(t){return rs.add(t),()=>rs.delete(t)}const zr=/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,Ar=/\/\d+(?=\/|$)/g;function Ir(t){return t.split("?")[0].replace(zr,"/{id}").replace(Ar,"/{n}")}function Ss({method:t,endpoint:s,status:n,durationMs:a,ok:r}){qe.push({method:t,endpoint:Ir(s),status:n,durationMs:a,ok:r,at:Date.now()}),qe.length>on&&qe.shift(),ln()}function Ve(t,s){if(t.length===0)return 0;const n=Math.min(t.length-1,Math.floor(t.length*s));return t[n]}function Rt(){const t=new Map;for(const i of qe){const o=`${i.method} ${i.endpoint}`;let c=t.get(o);c||(c={method:i.method,endpoint:i.endpoint,durations:[],errorCount:0,lastMs:0,lastAt:0},t.set(o,c)),c.durations.push(i.durationMs),i.ok||c.errorCount++,c.lastMs=i.durationMs,c.lastAt=i.at}const s=[];for(const i of t.values()){const o=[...i.durations].sort((g,p)=>g-p),c=i.durations.reduce((g,p)=>g+p,0);s.push({method:i.method,endpoint:i.endpoint,count:i.durations.length,avgMs:c/i.durations.length,p50:Ve(o,.5),p95:Ve(o,.95),maxMs:o[o.length-1],lastMs:i.lastMs,lastAt:i.lastAt,errorCount:i.errorCount})}s.sort((i,o)=>o.count-i.count);const n=qe.map(i=>i.durationMs).sort((i,o)=>i-o),a=n.reduce((i,o)=>i+o,0);return{overall:{total:qe.length,windowSize:on,avgMs:n.length?a/n.length:0,p50:Ve(n,.5),p75:Ve(n,.75),p90:Ve(n,.9),p95:Ve(n,.95),p99:Ve(n,.99),maxMs:n.length?n[n.length-1]:0,errorCount:qe.filter(i=>!i.ok).length,sorted:n},byEndpoint:s}}function Pr(){qe.length=0,ln()}function $t(t){const s=Date.now()-t,n=qe.filter(i=>i.at>=s),a=n.map(i=>i.durationMs).sort((i,o)=>i-o),r=a.reduce((i,o)=>i+o,0);return{windowMs:t,count:n.length,avgMs:a.length?r/a.length:0,p50:Ve(a,.5),p95:Ve(a,.95),maxMs:a.length?a[a.length-1]:0,errorCount:n.filter(i=>!i.ok).length}}const Qe="/api/platform";function tt(t){return`/api/${t}`}function Vt(t,s,n,a,r){return new Promise((i,o)=>{const c=new XMLHttpRequest;c.open(s,t),Object.entries(n).forEach(([g,p])=>c.setRequestHeader(g,p)),c.upload.addEventListener("progress",g=>{g.lengthComputable&&r(Math.round(g.loaded/g.total*100))}),c.onload=()=>{const g=()=>Promise.resolve(c.responseText),p=()=>Promise.resolve(JSON.parse(c.responseText));i({ok:c.status>=200&&c.status<300,status:c.status,text:g,json:p})},c.onerror=()=>o(new Error("Network error during upload")),c.onabort=()=>o(new Error("Upload cancelled")),c.send(a)})}async function Pe(t,s,n){const a=performance.now();let r,i;try{r=await fetch(t,s)}catch(g){i=g}const o=performance.now()-a,c=t.split("?")[0];if(i)throw Ss({method:n,endpoint:c,status:0,durationMs:o,ok:!1}),i;return Ss({method:n,endpoint:c,status:r.status,durationMs:o,ok:r.ok}),r}function Rr(t,s,n){return Array.isArray(t)?{items:t,totalElements:t.length,totalPages:1,page:s,size:n}:t&&Array.isArray(t.content)?{items:t.content,totalElements:t.totalElements??t.content.length,totalPages:t.totalPages??1,page:t.number??s,size:t.size??n}:t&&Array.isArray(t.items)?{items:t.items,totalElements:t.totalElements??t.items.length,totalPages:t.totalPages??1,page:t.page??s,size:t.size??n}:{items:[],totalElements:0,totalPages:0,page:s,size:n}}let ke=null;function ks(t){ke=t}function Gt(){return ke}let Oe=null;function $r(t){Oe=t}let ve=null;function ht(){return ve}let Nt=null;function Lr(t){Nt=t}const Ns={login:async(t,s)=>{const n=await Pe("/api/spe/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t,projectSpaceId:s})},"POST");if(!n.ok){const r=await n.json().catch(()=>({error:n.statusText}));throw new Error(r.error||`HTTP ${n.status}`)}const a=await n.json();return ve=a.token,a},logout:async()=>{const t=ve;if(ve=null,!!t)try{await Pe("/api/spe/auth/logout",{method:"POST",headers:{Authorization:`Bearer ${t}`}},"POST")}catch{}}};let Cs=!1,Es=null;function Ft(){if(!Cs){if(Cs=!0,!document.getElementById("plm-reconnect-banner")){const t=document.createElement("div");t.id="plm-reconnect-banner",t.style.cssText=["position:fixed","top:0","left:0","right:0","z-index:99999","background:#b45309","color:#fff","text-align:center","padding:8px 16px","font-size:13px","font-family:monospace","letter-spacing:.02em","box-shadow:0 2px 8px rgba(0,0,0,.4)"].join(";"),t.textContent="⟳  Backend is restarting — reconnecting…",document.body.prepend(t)}Es=setInterval(async()=>{try{(await fetch("/actuator/health",{cache:"no-store"})).ok&&(clearInterval(Es),window.location.reload())}catch{}},3e3)}}async function hs(t,s,n,a=!1){var c,g;const r={};ve&&(r.Authorization=`Bearer ${ve}`),ke&&(r["X-PLM-ProjectSpace"]=ke),n!==void 0&&(r["Content-Type"]="application/json");let i;try{i=await Pe(s,{method:t,headers:r,body:n!==void 0?JSON.stringify(n):void 0},t)}catch{Ft();const p=new Error("Backend unreachable");throw Oe&&Oe(p),p}if(i.status===401&&!a&&Nt){const p=await Nt().catch(()=>null);if(p)return ve=p,hs(t,s,n,!0)}if(!i.ok){(i.status===502||i.status===503)&&Ft();const p=await i.json().catch(()=>({error:i.statusText})),h=(c=p.violations)!=null&&c.length?p.violations.map(N=>typeof N=="string"?N:N.message).join("; "):p.error||p.message||`HTTP ${i.status}`,x=new Error(h);x.detail=p;const k=(g=p.violations)==null?void 0:g.some(N=>N==null?void 0:N.attrCode);throw Oe&&!k&&Oe(x),x}const o=await i.text();return o?JSON.parse(o):null}async function ze(t,s,n,a,{txId:r,psOverride:i}={},o=!1){var x,k;const c={"Content-Type":"application/json"};ve&&(c.Authorization=`Bearer ${ve}`);const g=i??ke;g&&(c["X-PLM-ProjectSpace"]=g),r&&(c["X-PLM-Tx"]=r);let p;try{p=await Pe(`${t}${n}`,{method:s,headers:c,body:a?JSON.stringify(a):void 0},s)}catch{Ft();const N=new Error("Backend unreachable");throw Oe&&Oe(N),N}if(p.status===401&&!o&&Nt){const N=await Nt().catch(()=>null);if(N)return ve=N,ze(t,s,n,a,{txId:r,psOverride:i},!0)}if(!p.ok){(p.status===502||p.status===503)&&Ft();const N=await p.json().catch(()=>({error:p.statusText})),_=(x=N.violations)!=null&&x.length?N.violations.map(v=>typeof v=="string"?v:v.message).join("; "):N.error||N.message||`HTTP ${p.status}`,z=new Error(_);z.detail=N;const u=(k=N.violations)==null?void 0:k.some(v=>v==null?void 0:v.attrCode);throw Oe&&!u&&Oe(z),z}const h=await p.text();return h?JSON.parse(h):null}async function oe(t,s,n,a){return ze(tt("pno"),t,s,a)}async function ae(t,s,n,a){return ze(Qe,t,s,a)}function Dr(t,s,n,a={}){let r=s.path.replace("{id}",n);const i=Object.entries(a).filter(([,o])=>o!=null).map(([o,c])=>`${o}=${encodeURIComponent(c)}`).join("&");return i&&(r+=`?${i}`),hs(s.httpMethod||"GET",tt(t)+r,void 0)}async function Or(t,s){var p;const n=t.create,a=tt(t.serviceCode)+n.path,r=(n.httpMethod||"POST").toUpperCase(),i={};ve&&(i.Authorization=`Bearer ${ve}`),ke&&(i["X-PLM-ProjectSpace"]=ke);let o;if((n.bodyShape||"RAW").toUpperCase()==="MULTIPART"){const h=new FormData;for(const[x,k]of Object.entries(s||{}))k==null||k===""||h.append(x,k);o=h}else{i["Content-Type"]="application/json";const h=(n.bodyShape||"RAW").toUpperCase()==="WRAPPED"?{parameters:s||{}}:s||{};o=JSON.stringify(h)}const c=await Pe(a,{method:r,headers:i,body:o},r);if(!c.ok){const h=await c.json().catch(()=>({error:c.statusText})),x=(p=h.violations)!=null&&p.length?h.violations.join("; "):h.error||h.message||`HTTP ${c.status}`,k=new Error(x);throw k.detail=h,Oe&&Oe(k),k}const g=await c.text();return g?JSON.parse(g):null}async function xe(t,s,n,a,r){return ze(tt("psm"),t,s,a,{psOverride:r})}async function q(t,s,n,a){return ze(tt("psa"),t,s,a)}function Mr(t,s,n,a){return ze(tt(t),s,n,a)}const nt={getStatus:async()=>ze(Qe,"GET","/status"),getRegistryTags:async()=>ze(Qe,"GET","/admin/registry/tags"),getEnvironment:async()=>ze(Qe,"GET","/admin/environment/expected-services"),updateEnvironment:async t=>ze(Qe,"PUT","/admin/environment/expected-services",{expectedServices:t}),addExpectedService:async t=>ze(Qe,"POST","/admin/environment/expected-services/services",{serviceCode:t}),removeExpectedService:async t=>ze(Qe,"DELETE",`/admin/environment/expected-services/services/${t}`),getNatsStatus:async()=>ze(Qe,"GET","/status/nats")},X={getMetadataKeys:(t,s)=>q("GET",s?`/metamodel/metadata/keys/${s}`:"/metamodel/metadata/keys"),getNodeTypes:t=>q("GET","/metamodel/nodetypes"),getVersionHistory:(t,s)=>xe("GET",`/nodes/${s}/versions`),getVersionDiff:(t,s,n,a)=>xe("GET",`/nodes/${s}/versions/diff?v1=${n}&v2=${a}`),createNode:(t,s,n,a,r)=>xe("POST",`/actions/create_node/${s}`,t,{parameters:{...n,_logicalId:a||null,_externalId:r||null}}),getNodeDescription:(t,s,n,a)=>{const r=[];n&&r.push(`txId=${n}`),a&&r.push(`versionNumber=${a}`);const i=r.length?`?${r.join("&")}`:"";return xe("GET",`/nodes/${s}/description${i}`)},updateExternalId:(t,s,n)=>xe("PATCH",`/nodes/${s}/external-id`,t,{externalId:n}),getSignatures:(t,s)=>xe("GET",`/nodes/${s}/signatures`),getSignatureHistory:(t,s)=>xe("GET",`/nodes/${s}/signatures/history`),getComments:(t,s)=>xe("GET",`/nodes/${s}/comments`),addComment:(t,s,n,a,r,i)=>xe("POST",`/nodes/${s}/comments`,t,{nodeVersionId:n,text:a,...r?{parentCommentId:r}:{},...i?{attributeName:i}:{}}),getLinkTypes:t=>q("GET","/metamodel/linktypes"),getNodeTypeLinkTypes:(t,s)=>q("GET",`/metamodel/nodetypes/${s}/linktypes`),getRegistryGrouped:t=>ae("GET","/admin/registry/grouped"),getRegistryTagsAdmin:t=>ae("GET","/admin/registry/tags"),getRegistryOverview:t=>ae("GET","/admin/registry/overview"),getItems:t=>ae("GET","/items"),gatewayJson:(t,s,n)=>hs(t,s,n),gatewayRawText:async(t,s=64*1024)=>{const n={};ve&&(n.Authorization=`Bearer ${ve}`),ke&&(n["X-PLM-ProjectSpace"]=ke),n.Range=`bytes=0-${s-1}`;const a=await Pe(t,{method:"GET",headers:n},"GET");if(!a.ok&&a.status!==206)throw new Error(`HTTP ${a.status}`);const r=a.body.getReader(),i=[];let o=0;for(;;){const{done:N,value:_}=await r.read();if(N)break;if(_&&(i.push(_),o+=_.length),o>=s){r.cancel();break}}const c=new Uint8Array(o);let g=0;for(const N of i)c.set(N,g),g+=N.length;const p=new TextDecoder("utf-8",{fatal:!1}).decode(c),h=a.headers.get("Content-Range"),x=h&&parseInt(h.split("/")[1],10)||null,k=a.status===206||o>=s;return{text:p,truncated:k,totalBytes:x}},fetchListableItems:async(t,s,n=0,a=50)=>{var _;const r=s.list,i=s.serviceCode?tt(s.serviceCode):"",o=r.path.includes("?")?"&":"?",c=r.pageParam||"page",g=r.sizeParam||"size",p=`${i}${r.path}${o}${c}=${n}&${g}=${a}`,h={};ve&&(h.Authorization=`Bearer ${ve}`),ke&&(h["X-PLM-ProjectSpace"]=ke);const x=await Pe(p,{method:"GET",headers:h},"GET");if(!x.ok){const z=await x.json().catch(()=>({error:x.statusText})),u=(_=z.violations)!=null&&_.length?z.violations.join("; "):z.error||z.message||`HTTP ${x.status}`,v=new Error(u);throw v.detail=z,v}const k=await x.text(),N=k?JSON.parse(k):null;return Rr(N,n,a)},getSources:t=>xe("GET","/sources"),getSourceKeys:(t,s,n,a="",r=25)=>{const i=new URLSearchParams;return n&&i.set("type",n),a&&i.set("q",a),i.set("limit",String(r)),xe("GET",`/sources/${encodeURIComponent(s)}/keys?${i.toString()}`)},getChildLinks:(t,s)=>xe("GET",`/nodes/${s}/links/children`),getParentLinks:(t,s)=>xe("GET",`/nodes/${s}/links/parents`),getLifecycles:t=>q("GET","/metamodel/lifecycles"),getLifecycleStates:(t,s)=>q("GET",`/metamodel/lifecycles/${s}/states`),getLifecycleTransitions:(t,s)=>q("GET",`/metamodel/lifecycles/${s}/transitions`),createLifecycle:(t,s)=>q("POST","/metamodel/lifecycles",t,s),duplicateLifecycle:(t,s,n)=>q("POST",`/metamodel/lifecycles/${s}/duplicate`,t,{name:n}),deleteLifecycle:(t,s)=>q("DELETE",`/metamodel/lifecycles/${s}`),addLifecycleState:(t,s,n)=>q("POST",`/metamodel/lifecycles/${s}/states`,t,n),updateLifecycleState:(t,s,n,a)=>q("PUT",`/metamodel/lifecycles/${s}/states/${n}`,t,a),deleteLifecycleState:(t,s,n)=>q("DELETE",`/metamodel/lifecycles/${s}/states/${n}`),listLifecycleStateActions:(t,s,n)=>q("GET",`/metamodel/lifecycles/${s}/states/${n}/actions`),attachLifecycleStateAction:(t,s,n,a,r,i,o=0)=>q("POST",`/metamodel/lifecycles/${s}/states/${n}/actions`,t,{instanceId:a,trigger:r,executionMode:i,displayOrder:o}),detachLifecycleStateAction:(t,s,n,a)=>q("DELETE",`/metamodel/lifecycles/${s}/states/${n}/actions/${a}`),addLifecycleTransition:(t,s,n)=>q("POST",`/metamodel/lifecycles/${s}/transitions`,t,n),updateLifecycleTransition:(t,s,n,a)=>q("PUT",`/metamodel/lifecycles/${s}/transitions/${n}`,t,a),deleteLifecycleTransition:(t,s,n)=>q("DELETE",`/metamodel/lifecycles/${s}/transitions/${n}`),addTransitionSignatureRequirement:(t,s,n,a=0)=>q("POST",`/metamodel/transitions/${s}/signature-requirements`,t,{roleId:n,displayOrder:a}),removeTransitionSignatureRequirement:(t,s,n)=>q("DELETE",`/metamodel/transitions/${s}/signature-requirements/${n}`),deleteNodeType:(t,s)=>q("DELETE",`/metamodel/nodetypes/${s}`),updateNodeTypeIdentity:(t,s,n)=>q("PUT",`/metamodel/nodetypes/${s}/identity`,t,n),updateNodeTypeNumberingScheme:(t,s,n)=>q("PUT",`/metamodel/nodetypes/${s}/numbering-scheme`,t,{numberingScheme:n}),updateNodeTypeVersionPolicy:(t,s,n)=>q("PUT",`/metamodel/nodetypes/${s}/version-policy`,t,{versionPolicy:n}),updateNodeTypeCollapseHistory:(t,s,n)=>q("PUT",`/metamodel/nodetypes/${s}/collapse-history`,t,{collapseHistory:n}),updateNodeTypeLifecycle:(t,s,n)=>q("PUT",`/metamodel/nodetypes/${s}/lifecycle`,t,{lifecycleId:n||null}),updateNodeTypeAppearance:(t,s,n,a)=>q("PUT",`/metamodel/nodetypes/${s}/appearance`,t,{color:n||null,icon:a||null}),updateAttribute:(t,s,n,a)=>q("PUT",`/metamodel/nodetypes/${s}/attributes/${n}`,t,a),deleteAttribute:(t,s,n)=>q("DELETE",`/metamodel/nodetypes/${s}/attributes/${n}`),updateLinkType:(t,s,n)=>q("PUT",`/metamodel/linktypes/${s}`,t,n),deleteLinkType:(t,s)=>q("DELETE",`/metamodel/linktypes/${s}`),getLinkTypeAttributes:(t,s)=>q("GET",`/metamodel/linktypes/${s}/attributes`),createLinkTypeAttribute:(t,s,n)=>q("POST",`/metamodel/linktypes/${s}/attributes`,t,n),updateLinkTypeAttribute:(t,s,n,a)=>q("PUT",`/metamodel/linktypes/${s}/attributes/${n}`,t,a),deleteLinkTypeAttribute:(t,s,n)=>q("DELETE",`/metamodel/linktypes/${s}/attributes/${n}`),getLinkTypeCascades:(t,s)=>q("GET",`/metamodel/linktypes/${s}/cascades`),createLinkTypeCascade:(t,s,n,a,r)=>q("POST",`/metamodel/linktypes/${s}/cascades`,t,{parentTransitionId:n,childFromStateId:a,childTransitionId:r}),deleteLinkTypeCascade:(t,s,n)=>q("DELETE",`/metamodel/linktypes/${s}/cascades/${n}`),getNodeTypeAttributes:(t,s)=>q("GET",`/metamodel/nodetypes/${s}/attributes`),createNodeType:(t,s)=>q("POST","/metamodel/nodetypes",t,s),updateNodeTypeParent:(t,s,n)=>q("PUT",`/metamodel/nodetypes/${s}/parent`,t,{parentNodeTypeId:n||null}),createAttribute:(t,s,n)=>q("POST",`/metamodel/nodetypes/${s}/attributes`,t,n),createLinkType:(t,s)=>q("POST","/metamodel/linktypes",t,s),getSourcesAdmin:t=>q("GET","/sources"),getSourceResolversAdmin:t=>q("GET","/sources/resolvers"),createSource:(t,s)=>q("POST","/sources",t,s),updateSource:(t,s,n)=>q("PUT",`/sources/${s}`,t,n),deleteSource:(t,s)=>q("DELETE",`/sources/${s}`),getImportContexts:()=>q("GET","/admin/import-contexts"),createImportContext:t=>q("POST","/admin/import-contexts",null,t),updateImportContext:(t,s)=>q("PUT",`/admin/import-contexts/${t}`,null,s),deleteImportContext:t=>q("DELETE",`/admin/import-contexts/${t}`),getImportAlgorithmInstances:()=>q("GET","/admin/import-contexts/algorithm-instances/import"),getValidationAlgorithmInstances:()=>q("GET","/admin/import-contexts/algorithm-instances/validation"),getSources:t=>xe("GET","/sources"),getSourceTypes:(t,s)=>xe("GET",`/sources/${s}/types`),suggestSourceKeys:(t,s,n,a,r=25)=>{const i=new URLSearchParams;return n&&i.set("type",n),a&&i.set("q",a),i.set("limit",String(r)),xe("GET",`/sources/${s}/keys?${i.toString()}`)},getAllActions:t=>q("GET","/metamodel/actions"),getActionsForNodeType:(t,s)=>q("GET",`/metamodel/nodetypes/${s}/actions`),registerCustomAction:(t,s)=>q("POST","/metamodel/actions",t,s),getPermissionGrants:(t,s,n,a)=>oe("GET",`/nodetypes/${s}/permissions/${n}${a?`?transitionId=${encodeURIComponent(a)}`:""}`),addPermissionGrant:(t,s,n,a,r)=>oe("POST",`/nodetypes/${s}/permissions/${n}`,t,{roleId:a,transitionId:r||null}),removePermissionGrant:(t,s,n,a,r)=>oe("DELETE",`/nodetypes/${s}/permissions/${n}`,t,{roleId:a,transitionId:r||null}),getDomains:t=>q("GET","/domains"),createDomain:(t,s)=>q("POST","/domains",t,s),updateDomain:(t,s,n)=>q("PUT",`/domains/${s}`,t,n),deleteDomain:(t,s)=>q("DELETE",`/domains/${s}`),getDomainAttributes:(t,s)=>q("GET",`/domains/${s}/attributes`),createDomainAttribute:(t,s,n)=>q("POST",`/domains/${s}/attributes`,t,n),updateDomainAttribute:(t,s,n,a)=>q("PUT",`/domains/${s}/attributes/${n}`,t,a),deleteDomainAttribute:(t,s,n)=>q("DELETE",`/domains/${s}/attributes/${n}`),getEnums:t=>q("GET","/enums"),getEnumDetail:(t,s)=>q("GET",`/enums/${s}`),createEnum:(t,s)=>q("POST","/enums",t,s),updateEnum:(t,s,n)=>q("PUT",`/enums/${s}`,t,n),deleteEnum:(t,s)=>q("DELETE",`/enums/${s}`),getEnumValues:(t,s)=>q("GET",`/enums/${s}/values`),addEnumValue:(t,s,n)=>q("POST",`/enums/${s}/values`,t,n),updateEnumValue:(t,s,n,a)=>q("PUT",`/enums/${s}/values/${n}`,t,a),deleteEnumValue:(t,s,n)=>q("DELETE",`/enums/${s}/values/${n}`),reorderEnumValues:(t,s,n)=>q("PUT",`/enums/${s}/values/reorder`,t,n),listBaselines:t=>xe("GET","/baselines"),createBaseline:(t,s,n,a)=>xe("POST","/baselines",t,{userId:t,rootNodeId:s,name:n,description:a}),getBaselineContent:(t,s)=>xe("GET",`/baselines/${s}/content`),getRoles:t=>oe("GET","/roles"),createRole:(t,s,n)=>oe("POST","/roles",t,{name:s,description:n}),updateRole:(t,s,n,a)=>oe("PUT",`/roles/${s}`,t,{name:n,description:a}),deleteRole:(t,s)=>oe("DELETE",`/roles/${s}`),listProjectSpaces:t=>oe("GET",`/project-spaces${t?`?userId=${encodeURIComponent(t)}`:""}`),createProjectSpace:(t,s,n)=>oe("POST","/project-spaces",t,{name:s,description:n}),deactivateProjectSpace:(t,s)=>oe("DELETE",`/project-spaces/${s}`),getProjectSpaceServiceTags:(t,s)=>oe("GET",`/project-spaces/${s}/service-tags`),setProjectSpaceServiceTags:(t,s,n,a)=>oe("PUT",`/project-spaces/${s}/service-tags/${n}`,t,{tags:a}),setProjectSpaceIsolated:(t,s,n)=>oe("PUT",`/project-spaces/${s}/isolated`,t,{isolated:n}),listUsers:t=>oe("GET","/users"),getUser:(t,s)=>oe("GET",`/users/${s}`),updateUser:(t,s,n,a)=>oe("PUT",`/users/${s}`,t,{displayName:n,email:a}),createUser:(t,s,n,a)=>oe("POST","/users",t,{username:s,displayName:n,email:a}),deactivateUser:(t,s)=>oe("DELETE",`/users/${s}`),getUserRoles:(t,s,n)=>oe("GET",`/users/${s}/roles${n?`?projectSpaceId=${encodeURIComponent(n)}`:""}`),assignRole:(t,s,n,a)=>oe("POST",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(a)}`),removeRole:(t,s,n,a)=>oe("DELETE",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(a)}`),setUserAdmin:(t,s,n)=>oe("PUT",`/users/${s}/admin`,t,{isAdmin:n}),getUserContext:(t,s)=>oe("GET",`/users/${t}/context${s?`?projectSpaceId=${encodeURIComponent(s)}`:""}`),getDashboardTransaction:t=>xe("GET","/dashboard/transaction"),getDashboardWorkItems:t=>xe("GET","/dashboard/workitems"),listPermissions:t=>oe("GET","/permissions"),createPermission:(t,s,n,a,r,i)=>oe("POST","/permissions",t,{permissionCode:s,scope:n,displayName:a,description:r,displayOrder:i}),updatePermission:(t,s,n,a,r)=>oe("PUT",`/permissions/${s}`,t,{displayName:n,description:a,displayOrder:r}),getRolePolicies:(t,s)=>oe("GET",`/roles/${s}/policies`),listGlobalActions:t=>oe("GET","/global-actions"),getMyGlobalPermissions:t=>oe("GET","/my-global-permissions"),getSettingsSections:t=>ae("GET","/sections"),getUiManifest:()=>ae("GET","/ui/manifest"),createResource:(t,s)=>Or(t,s),getRoleGlobalPermissions:(t,s)=>oe("GET",`/roles/${s}/global-permissions`),addRoleGlobalPermission:(t,s,n)=>oe("POST",`/roles/${s}/global-permissions`,t,{permissionCode:n}),removeRoleGlobalPermission:(t,s,n)=>oe("DELETE",`/roles/${s}/global-permissions/${n}`),getRoleScopePermissions:(t,s,n)=>oe("GET",`/roles/${s}/scope-permissions/${n}`),addRoleScopePermission:(t,s,n,a)=>oe("POST",`/roles/${s}/scope-permissions/${n}`,t,{permissionCode:a}),removeRoleScopePermission:(t,s,n,a)=>oe("DELETE",`/roles/${s}/scope-permissions/${n}/${a}`),listSecrets:t=>ae("GET","/admin/secrets"),revealSecret:(t,s)=>ae("GET",`/admin/secrets/${encodeURIComponent(s)}`),createSecret:(t,s,n)=>ae("POST","/admin/secrets",t,{key:s,value:n}),updateSecret:(t,s,n)=>ae("PUT",`/admin/secrets/${encodeURIComponent(s)}`,t,{value:n}),deleteSecret:(t,s)=>ae("DELETE",`/admin/secrets/${encodeURIComponent(s)}`),listAllInstances:t=>ae("GET","/algorithms/instances"),listTransitionGuards:(t,s)=>q("GET",`/metamodel/lifecycles/transitions/${s}/guards`),attachTransitionGuard:(t,s,n,a,r)=>q("POST",`/metamodel/lifecycles/transitions/${s}/guards`,t,{instanceId:n,effect:a,displayOrder:r}),updateTransitionGuard:(t,s,n)=>q("PUT",`/metamodel/lifecycles/transitions/guards/${s}`,t,{effect:n}),detachTransitionGuard:(t,s)=>q("DELETE",`/metamodel/lifecycles/transitions/guards/${s}`)},we={listActions:(t,s)=>ae("GET",`/actions${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAction:(t,s)=>ae("GET",`/actions/${s}`),createAction:(t,s)=>ae("POST","/actions",t,s),updateAction:(t,s,n)=>ae("PUT",`/actions/${s}`,t,n),deleteAction:(t,s)=>ae("DELETE",`/actions/${s}`),listParameters:(t,s)=>ae("GET",`/actions/${s}/parameters`),addParameter:(t,s,n)=>ae("POST",`/actions/${s}/parameters`,t,n),listActionGuards:(t,s)=>ae("GET",`/actions/${s}/guards`),attachActionGuard:(t,s,n,a,r)=>ae("POST",`/actions/${s}/guards`,t,{instanceId:n,effect:a,displayOrder:r}),updateActionGuard:(t,s,n,a)=>ae("PUT",`/actions/${s}/guards/${n}`,t,{effect:a}),detachActionGuard:(t,s,n)=>ae("DELETE",`/actions/${s}/guards/${n}`),listAlgorithmTypes:(t,s)=>ae("GET",`/algorithms/types${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithms:(t,s)=>ae("GET",`/algorithms${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithmParameters:(t,s)=>ae("GET",`/algorithms/${s}/parameters`),listAllInstances:(t,s)=>ae("GET",`/algorithms/instances${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),createInstance:(t,s,n,a)=>ae("POST","/algorithms/instances",t,{algorithmId:s,name:n,serviceCode:a}),updateInstance:(t,s,n)=>ae("PUT",`/algorithms/instances/${s}`,t,{name:n}),deleteInstance:(t,s)=>ae("DELETE",`/algorithms/instances/${s}`),getInstanceParams:(t,s)=>ae("GET",`/algorithms/instances/${s}/params`),setInstanceParam:(t,s,n,a)=>ae("PUT",`/algorithms/instances/${s}/params/${n}`,t,{value:a}),getAlgorithmStats:(t,s)=>ae("GET",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAlgorithmTimeseries:(t,s=24,n)=>ae("GET",`/algorithms/stats/timeseries?hours=${s}${n?`&serviceCode=${encodeURIComponent(n)}`:""}`),resetAlgorithmStats:(t,s)=>ae("DELETE",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listActionWrappers:(t,s)=>ae("GET",`/algorithms/actions/${s}/wrappers`),attachActionWrapper:(t,s,n,a,r)=>ae("POST",`/algorithms/actions/${s}/wrappers`,t,{instanceId:n,executionOrder:a,serviceCode:r}),detachActionWrapper:(t,s,n)=>ae("DELETE",`/algorithms/actions/${s}/wrappers/${n}`),getRegisteredServices:()=>ae("GET","/algorithms/services"),getServiceCatalog:t=>ae("GET","/registry/actions").then(s=>{var n;return((n=s==null?void 0:s.services)==null?void 0:n[t])||{handlers:[],guards:[]}})},rt={open:(t,s)=>xe("POST","/transactions",t,{title:s}),current:t=>xe("GET","/transactions/current"),commit:(t,s,n,a)=>xe("POST",`/actions/commit/${s}`,t,{parameters:{comment:n,...a?{nodeIds:a.join(",")}:{}}}),release:(t,s,n)=>xe("POST",`/transactions/${s}/release`,t,{nodeIds:n}),rollback:(t,s)=>xe("POST",`/actions/rollback/${s}`,t,{parameters:{}}),get:(t,s)=>xe("GET",`/transactions/${s}`),versions:(t,s)=>xe("GET",`/transactions/${s}/versions`),nodes:(t,s)=>xe("GET",`/transactions/${s}/nodes`)};async function Ts(t,s,n,a,r){return ze(tt("psm"),t,s,r,{txId:a})}async function cn(t,s){const n={"Content-Type":"application/json"};ve&&(n.Authorization=`Bearer ${ve}`),ke&&(n["X-PLM-ProjectSpace"]=ke);const a=await Pe(`/api/${t}${s}`,{method:"GET",headers:n},"GET");if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}const Br={submitImport:async(t,s,n,a)=>{const r={};ve&&(r.Authorization=`Bearer ${ve}`),ke&&(r["X-PLM-ProjectSpace"]=ke);const i=new FormData;i.append("file",t),n&&i.append("contextCode",n);const o=a?await Vt(`/api/psm/cad/import/${s}`,"POST",r,i,a):await Pe(`/api/psm/cad/import/${s}`,{method:"POST",headers:r,body:i},"POST");if(!o.ok){const c=await o.text();throw new Error(`HTTP ${o.status}: ${c}`)}return o.json()},getJobStatus:async t=>{const s={"Content-Type":"application/json"};ve&&(s.Authorization=`Bearer ${ve}`),ke&&(s["X-PLM-ProjectSpace"]=ke);const n=await Pe(`/api/psm/cad/jobs/${t}`,{method:"GET",headers:s},"GET");if(!n.ok)throw new Error(`HTTP ${n.status}`);return n.json()},getImportContexts:async()=>{const t={"Content-Type":"application/json"};ve&&(t.Authorization=`Bearer ${ve}`),ke&&(t["X-PLM-ProjectSpace"]=ke);const s=await Pe("/api/psm/cad/import-contexts",{method:"GET",headers:t},"GET");return s.ok?s.json():[]}},_r={executeAction:(t,s,n,a,r,i)=>{const o=i?`/actions/${s}/${t}/${i}`:`/actions/${s}/${t}`;return Ts("POST",o,n,a,{parameters:r||{}})},executeViaDescriptor:async(t,s,n,a,r,i)=>{var g;const o=(t.path||"").replace("{id}",s).replace("{transitionId}",((g=t.metadata)==null?void 0:g.transitionId)||""),c=t.httpMethod||"POST";if(t.bodyShape==="MULTIPART"){const p=new FormData;for(const[N,_]of Object.entries(r||{}))_!=null&&p.append(N,_);const h={};ve&&(h.Authorization=`Bearer ${ve}`),ke&&(h["X-PLM-ProjectSpace"]=ke),a&&(h["X-PLM-Tx"]=a);const x=i?await Vt("/api/psm"+o,c,h,p,i):await Pe("/api/psm"+o,{method:c,headers:h,body:p},c);if(!x.ok){const N=await x.text();throw new Error(`HTTP ${x.status}: ${N}`)}const k=await x.text();return k?JSON.parse(k):null}return Ts(c,o,n,a,{parameters:r||{}})}},fe=Js((t,s)=>({userId:null,setUserId:n=>t({userId:n}),items:[],nodeTypes:[],resources:[],itemsStatus:"idle",refreshItems:async()=>{const{userId:n}=s();if(n){t({itemsStatus:"loading"});try{const a=await X.getItems(n),r=Array.isArray(a)?a:[],i=r.filter(p=>p.serviceCode==="psm"&&p.itemCode==="node"&&p.itemKey&&p.list).map(p=>({id:p.itemKey,name:p.displayName,description:p.description,color:p.color,icon:p.icon})),o=r.filter(p=>p.create),c=r.filter(p=>p.serviceCode==="psm"&&p.itemCode==="node"&&p.list),g=await Promise.all(c.map(p=>X.fetchListableItems(n,p,0,50).then(h=>h.items||[]).catch(()=>[])));t({items:r,nodeTypes:i,resources:o,itemsStatus:"loaded",nodes:g.flat()})}catch{t({items:[],nodeTypes:[],resources:[],itemsStatus:"idle"})}}},stateColorMap:{},stateColorMapLoaded:!1,refreshStateColorMap:async()=>{const{userId:n}=s();if(n)try{const a=await X.getLifecycles(n);if(!Array.isArray(a))return;const r=await Promise.all(a.map(o=>X.getLifecycleStates(n,o.id||o.ID).catch(()=>[]))),i={};r.forEach(o=>o.forEach(c=>{const g=c.id||c.ID,p=c.color||c.COLOR;g&&p&&(i[g]=p)})),t({stateColorMap:i,stateColorMapLoaded:!0})}catch{}},projectSpaces:[],users:[],refreshProjectSpaces:async()=>{const{userId:n}=s();if(n)try{const a=await X.listProjectSpaces(n);t({projectSpaces:Array.isArray(a)?a:[]})}catch{}},refreshUsers:async()=>{const{userId:n}=s();if(n)try{const a=await X.listUsers(n);t({users:Array.isArray(a)?a.filter(r=>r.active!==!1):[]})}catch{}},nodes:[],refreshNodes:async()=>{const{userId:n,items:a}=s();if(n)try{const r=a.filter(o=>o.serviceCode==="psm"&&o.itemCode==="node"&&o.list),i=await Promise.all(r.map(o=>X.fetchListableItems(n,o,0,50).then(c=>c.items||[]).catch(()=>[])));t({nodes:i.flat()})}catch{}},activeTx:null,txNodes:[],refreshTx:async()=>{const{userId:n}=s();if(n)try{const a=await rt.current(n);if(a){const r=a.ID||a.id,i=await rt.nodes(n,r).catch(()=>[]);t({activeTx:a,txNodes:Array.isArray(i)?i:[]})}else t({activeTx:null,txNodes:[]})}catch{t({activeTx:null,txNodes:[]})}},clearTx:()=>t({activeTx:null,txNodes:[]}),refreshAll:async()=>{const{refreshItems:n,refreshTx:a}=s();await Promise.all([n(),a()])},_slices:{},_sliceActions:{}})),je=Js(t=>({showCollab:!1,collabWidth:320,collabVersionFilter:null,collabTriggerText:null,collabTabs:[],toggleCollab:()=>t(s=>({showCollab:!s.showCollab})),openCollab:()=>t({showCollab:!0}),closeCollab:()=>t({showCollab:!1}),setCollabWidth:s=>t({collabWidth:s}),setVersionFilter:s=>t({collabVersionFilter:s}),setTriggerText:s=>t({collabTriggerText:s}),clearTriggerText:()=>t({collabTriggerText:null}),addCollabTab:(s,n,a)=>t(r=>({collabTabs:r.collabTabs.some(i=>i.id===s)?r.collabTabs:[...r.collabTabs,{id:s,label:n,Component:a}]})),removeCollabTab:s=>t(n=>({collabTabs:n.collabTabs.filter(a=>a.id!==s)})),consoleVisible:!1,consoleHeight:220,consoleTabs:[],consoleLog:[],toggleConsole:()=>t(s=>({consoleVisible:!s.consoleVisible})),openConsole:()=>t({consoleVisible:!0}),setConsoleHeight:s=>t({consoleHeight:s}),addConsoleTab:(s,n,a)=>t(r=>({consoleTabs:r.consoleTabs.some(i=>i.id===s)?r.consoleTabs:[...r.consoleTabs,{id:s,label:n,Component:a}]})),removeConsoleTab:s=>t(n=>({consoleTabs:n.consoleTabs.filter(a=>a.id!==s)})),appendLog:(s,n)=>t(a=>({consoleLog:[...a.consoleLog.slice(-500),{level:s,message:n,ts:Date.now()}]})),statusSlots:[],registerStatus:(s,n,a="left")=>t(r=>({statusSlots:r.statusSlots.some(i=>i.id===s)?r.statusSlots.map(i=>i.id===s?{id:s,Component:n,position:a}:i):[...r.statusSlots,{id:s,Component:n,position:a}]})),unregisterStatus:s=>t(n=>({statusSlots:n.statusSlots.filter(a=>a.id!==s)}))}));function bt(t,s){je.getState().appendLog(t,s)}function Wr(t){if(!t.event)return`[WS] (unknown) ${JSON.stringify(t)}`;const s=[t.event];return t.byUser&&s.push(`by ${t.byUser}`),t.nodeId&&s.push(`node=${t.nodeId}`),t.userId&&s.push(`user=${t.userId}`),t.entity&&s.push(t.entity),t.status&&s.push(t.status),t.jobId&&s.push(`job=${t.jobId}`),`[WS] ${s.join(" · ")}`}function xs(t,s,n){const a=l.useRef(s);a.current=s;const r=Array.isArray(t)?t:t?[t]:[],i=r.join("\0");l.useEffect(()=>{if(r.length===0)return;let o=null,c=null,g=1e3,p=!1;function h(){if(p)return;const x=ht(),k=location.protocol==="https:"?"wss:":"ws:",N=x?`${k}//${location.host}/api/ws/?token=${encodeURIComponent(x)}`:`${k}//${location.host}/api/ws/`;o=new WebSocket(N),o.onopen=()=>{g=1e3,bt("debug","[WS] connected")},o.onmessage=_=>{try{const z=JSON.parse(_.data);bt("info",Wr(z)),a.current(z)}catch(z){console.warn("WS parse error",z),bt("warn",`[WS] parse error: ${z.message}`)}},o.onclose=_=>{p||(bt("warn",`[WS] disconnected — reconnecting in ${g}ms`),c=setTimeout(()=>{g=Math.min(g*2,3e4),h()},g))},o.onerror=()=>{bt("warn","[WS] connection error")}}return h(),()=>{p=!0,c&&clearTimeout(c),o&&(o.onclose=null,o.close())}},[i,n])}const ft={Box:Jn,Package:rn,Cpu:us,Wrench:Yn,Cog:Xn,Database:nn,Globe:sn,BookOpen:tn,Clipboard:Kn,Tag:qn,FolderOpen:Vn,Archive:Hn,Zap:ms,FlaskConical:Un,Microscope:Fn,Layers:ps,FileText:Gn,GitBranch:en,Hexagon:Et,Circle:Wn,Users:Qs,Shield:at,Award:Zs,LayoutDashboard:_n,Component:Bn,Blocks:Mn,Cable:On,Gauge:Dn,Radio:Ln,Scan:$n},Gr={user:Ht,layers:ps,database:nn,list:sr,lifecycle:en,plug:tr,hexagon:Et,users:Qs,shield:at,cpu:us,workflow:an,key:er,network:Qn,globe:sn,terminal:Zn,book:tn,zap:ms,package:rn},Tt=Object.freeze({serviceCode:"psm",itemCode:"node",itemKey:null,get:Object.freeze({httpMethod:"GET",path:"/nodes/{id}/description"})}),dn="plm-theme";function as(t){return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function is(t){document.documentElement.setAttribute("data-theme",t)}function Ut(){return localStorage.getItem(dn)||"dark"}function pn(t){localStorage.setItem(dn,t),is(as(t))}function Fr(){const t=Ut();is(as(t)),window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{Ut()==="system"&&is(as("system"))})}const Ur=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function Hr(){const[t,s]=l.useState(Ut);function n(a){s(a),pn(a)}return e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:8},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:Ur.map(a=>e.jsxs("button",{type:"button",className:`theme-option${t===a.value?" theme-option--active":""}`,onClick:()=>n(a.value),children:[e.jsx("span",{className:"theme-option-icon",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))})]})}const zs=["#5b9cf6","#56d18e","#e8c547","#a78bfa","#f87171","#34d399","#fb923c","#60a5fa"];function mn(t){if(!t)return"#64748b";let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)&4294967295;return zs[Math.abs(s)%zs.length]}function un(t){const s=(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||"?",n=s.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():s[0].toUpperCase()}function Vr({user:t,userId:s}){const n=mn((t==null?void 0:t.id)||s);return e.jsxs("div",{className:"user-avatar",style:{"--avatar-color":n},title:(t==null?void 0:t.displayName)||(t==null?void 0:t.username),children:[t!=null&&t.avatarUrl?e.jsx("img",{className:"user-avatar-img",src:t.avatarUrl,alt:""}):e.jsx("span",{className:"user-avatar-initials",children:un(t)}),(t==null?void 0:t.isAdmin)&&e.jsx("span",{className:"user-avatar-badge",title:"Administrator",children:"A"})]})}function qr({userId:t,onClose:s}){const[n,a]=l.useState(null),[r,i]=l.useState(!1),[o,c]=l.useState({displayName:"",email:""}),[g,p]=l.useState(!1),[h,x]=l.useState(null);l.useEffect(()=>{X.getUser(t,t).then(a).catch(()=>{})},[t]);function k(u,v){x({msg:u,type:v}),setTimeout(()=>x(null),2500)}function N(){c({displayName:(n==null?void 0:n.displayName)||"",email:(n==null?void 0:n.email)||""}),i(!0)}async function _(){p(!0);try{await X.updateUser(t,t,o.displayName.trim(),o.email.trim());const u=await X.getUser(t,t);a(u),i(!1),k("Profile updated","success")}catch{k("Failed to update profile","error")}finally{p(!1)}}l.useEffect(()=>{function u(v){v.key==="Escape"&&s()}return document.addEventListener("keydown",u),()=>document.removeEventListener("keydown",u)},[s]);const z=mn(t);return e.jsx("div",{className:"profile-modal-overlay",onMouseDown:u=>{u.target===u.currentTarget&&s()},children:e.jsxs("div",{className:"profile-modal",children:[e.jsxs("div",{className:"profile-modal-header",children:[e.jsx("span",{className:"profile-modal-title",children:"My Profile"}),e.jsx("button",{className:"icon-btn",onClick:s,title:"Close",children:e.jsx(kt,{size:14,strokeWidth:2})})]}),e.jsxs("div",{className:"profile-modal-body",children:[h&&e.jsx("div",{style:{padding:"7px 12px",borderRadius:"var(--r)",fontSize:12,fontWeight:500,background:h.type==="success"?"rgba(56,212,113,.15)":"rgba(248,113,113,.15)",color:h.type==="success"?"#34d399":"#f87171",border:`1px solid ${h.type==="success"?"#34d39940":"#f8717140"}`},children:h.msg}),n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:"50%",border:`3px solid ${z}`,background:`color-mix(in srgb, ${z} 12%, var(--surface))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:z,flexShrink:0},children:n.avatarUrl?e.jsx("img",{src:n.avatarUrl,alt:"",style:{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}):un(n)}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:14,fontWeight:700,color:"var(--text)"},children:n.displayName||n.username}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2},children:n.username}),n.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",style:{marginTop:4,display:"inline-block"},children:"Admin"})]})]}),r?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Display Name"}),e.jsx("input",{className:"field-input",autoFocus:!0,value:o.displayName,onChange:u=>c(v=>({...v,displayName:u.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Email"}),e.jsx("input",{className:"field-input",type:"email",value:o.email,onChange:u=>c(v=>({...v,email:u.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("button",{className:"btn btn-primary",onClick:_,disabled:g,children:g?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>i(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.email||"—"})]}),e.jsx("div",{children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:N,children:[e.jsx(it,{size:11,strokeWidth:2}),"Edit"]})})]}),e.jsx("div",{style:{borderTop:"1px solid var(--border)",paddingTop:12,marginTop:4},children:e.jsx(Hr,{})})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})]})]})})}function Kr({currentUser:t,userId:s,users:n,onUserChange:a,onOpenProfile:r,onClose:i}){const o=l.useRef(null);return l.useEffect(()=>{function c(g){o.current&&!o.current.contains(g.target)&&i()}return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[i]),e.jsxs("div",{className:"profile-menu",ref:o,children:[e.jsxs("div",{className:"profile-menu-header",children:[e.jsx("div",{className:"profile-menu-name",children:(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||s}),(t==null?void 0:t.username)&&t.username!==t.displayName&&e.jsx("div",{className:"profile-menu-username",children:t.username})]}),(n||[]).length>1&&e.jsxs("div",{className:"profile-menu-section",children:[e.jsx("div",{className:"profile-menu-label",children:"Switch user"}),e.jsx("div",{className:"profile-menu-select-row",children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"user-select",style:{width:"100%",paddingRight:28},value:s,onChange:c=>{a(c.target.value),i()},children:n.map(c=>e.jsx("option",{value:c.id,children:c.displayName||c.username},c.id))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})})]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",onClick:()=>{r(),i()},children:[e.jsx(Ht,{size:13,strokeWidth:2,color:"var(--muted)"}),"My Profile"]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",disabled:!0,title:"Not yet implemented",children:[e.jsx(nr,{size:13,strokeWidth:2,color:"var(--muted)"}),"Logout"]})]})}function Xr({userId:t,onUserChange:s,users:n,nodeTypes:a,stateColorMap:r,nodes:i,searchQuery:o,searchType:c,onSearchChange:g,onSearchTypeChange:p,projectSpaces:h,projectSpaceId:x,onProjectSpaceChange:k,onNavigate:N}){const _=l.useMemo(()=>(n||[]).find(f=>f.id===t),[n,t]),[z,u]=l.useState([]),[v,b]=l.useState(!1),[y,j]=l.useState(-1),[C,T]=l.useState(!1),[G,J]=l.useState(!1),I=l.useRef(null),m=l.useRef(null);l.useEffect(()=>{const f=(o||"").trim().toLowerCase();if(f.length<2){u([]),b(!1);return}const D=(i||[]).filter(E=>{const L=(E.logical_id||E.LOGICAL_ID||"").toLowerCase(),S=(E.display_name||E.DISPLAY_NAME||"").toLowerCase();return L&&L.includes(f)||S&&S.includes(f)}).slice(0,8);u(D),b(D.length>0),j(-1)},[o,i]);const d=l.useCallback(f=>{const D=f.id||f.ID;clearTimeout(I.current),g(""),b(!1),u([]),N&&N(D,void 0,Tt)},[g,N]),$=l.useCallback(f=>{!v||z.length===0||(f.key==="ArrowDown"?(f.preventDefault(),j(D=>Math.min(D+1,z.length-1))):f.key==="ArrowUp"?(f.preventDefault(),j(D=>Math.max(D-1,0))):f.key==="Enter"&&y>=0?(f.preventDefault(),d(z[y])):f.key==="Escape"&&b(!1))},[v,z,y,d]),M=l.useCallback(()=>{I.current=setTimeout(()=>b(!1),150)},[]),U=l.useCallback(()=>{clearTimeout(I.current),z.length>0&&b(!0)},[z.length]);return e.jsxs("header",{className:"header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"brand",children:[e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{flexShrink:0},children:[e.jsx("rect",{width:"24",height:"24",rx:"5",fill:"url(#psm-grad)"}),e.jsx("circle",{cx:"12",cy:"6",r:"2.2",fill:"white",fillOpacity:"0.95"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"6.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"17.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"12",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("circle",{cx:"6.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"12",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"17.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"psm-grad",x1:"0",y1:"0",x2:"24",y2:"24",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"var(--accent)"}),e.jsx("stop",{offset:"100%",stopColor:"#7c3aed"})]})})]}),e.jsx("span",{children:"PSM"})]}),e.jsx("div",{className:"brand-sep"})]}),e.jsx("div",{className:"header-center",children:e.jsxs("div",{className:"search-wrap",children:[e.jsxs("div",{className:"search-group",children:[e.jsx("span",{className:"search-icon",children:"⌕"}),e.jsx("input",{className:"search-input",placeholder:"Search by logical ID…",value:o,onChange:f=>g(f.target.value),onKeyDown:$,onFocus:U,onBlur:M,autoComplete:"off"}),e.jsx("div",{className:"search-divider"}),e.jsxs("select",{className:"search-type",value:c,onChange:f=>p(f.target.value),title:"Filter by type",children:[e.jsx("option",{value:"",children:"All types"}),(a||[]).map(f=>e.jsx("option",{value:f.id||f.ID,children:f.name||f.NAME},f.id||f.ID))]})]}),v&&z.length>0&&e.jsx("div",{className:"search-suggestions",children:z.map((f,D)=>{const E=f.id||f.ID,L=f.logical_id||f.LOGICAL_ID||"",S=f.node_type_name||f.NODE_TYPE_NAME||"",w=f.node_type_id||f.NODE_TYPE_ID||"",R=f.revision||f.REVISION||"A",W=f.iteration??f.ITERATION??1,F=f.lifecycle_state_id||f.LIFECYCLE_STATE_ID||"",P=(r==null?void 0:r[F])||"#6b7280",H=(a||[]).find(Y=>(Y.id||Y.ID)===w),B=(H==null?void 0:H.color)||(H==null?void 0:H.COLOR)||null,O=(H==null?void 0:H.icon)||(H==null?void 0:H.ICON)||null,K=O?ft[O]:null;return e.jsxs("div",{className:`search-sug-item${D===y?" hi":""}`,onMouseDown:()=>d(f),onMouseEnter:()=>j(D),children:[e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:K?e.jsx(K,{size:11,color:B||"var(--muted)",strokeWidth:2}):B?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:B,display:"inline-block"}}):null}),e.jsx("span",{className:"sug-dot",style:{background:P}}),e.jsx("span",{className:"sug-lid",children:L}),(f.display_name||f.DISPLAY_NAME)&&e.jsx("span",{className:"sug-dname",children:f.display_name||f.DISPLAY_NAME}),e.jsxs("span",{className:"sug-meta",children:[S," · ",W===0?R:`${R}.${W}`]})]},E)})})]})}),e.jsxs("div",{className:"header-right",children:[(h||[]).length>0&&e.jsxs("div",{className:"ps-select-wrap",title:"Active project space",children:[e.jsx(Et,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"ps-select",value:x,onChange:f=>k(f.target.value),children:h.map(f=>e.jsx("option",{value:f.id||f.ID,children:f.name||f.NAME},f.id||f.ID))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})]}),e.jsxs("div",{className:"profile-menu-wrap",ref:m,children:[e.jsx("button",{className:"profile-avatar-btn",onClick:()=>T(f=>!f),title:"Profile & settings",children:e.jsx(Vr,{user:_,userId:t})}),C&&e.jsx(Kr,{currentUser:_,userId:t,users:n,onUserChange:s,onOpenProfile:()=>J(!0),onClose:()=>T(!1)})]})]}),G&&e.jsx(qr,{userId:t,onClose:()=>J(!1)})]})}const Yr=et.memo(Xr);function os(){const t=ht();return t?{Authorization:`Bearer ${t}`}:{}}const As={get:{bg:"rgba(56,189,248,.13)",text:"#38bdf8",border:"rgba(56,189,248,.28)"},post:{bg:"rgba(74,222,128,.13)",text:"#4ade80",border:"rgba(74,222,128,.28)"},put:{bg:"rgba(251,191,36,.13)",text:"#fbbf24",border:"rgba(251,191,36,.28)"},delete:{bg:"rgba(252,129,129,.13)",text:"#fc8181",border:"rgba(252,129,129,.28)"},patch:{bg:"rgba(167,139,250,.13)",text:"#a78bfa",border:"rgba(167,139,250,.28)"}};function Jr({method:t}){const s=As[t]||As.get;return e.jsx("span",{style:{background:s.bg,color:s.text,border:`1px solid ${s.border}`,borderRadius:3,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"var(--sans)",letterSpacing:".07em",textTransform:"uppercase",flexShrink:0,width:58,textAlign:"center",display:"inline-block"},children:t})}function ls(t,s=0){var n;if(!t||s>4)return null;if(t.example!==void 0)return t.example;if(t.type==="object"||t.properties){const a={};return Object.entries(t.properties||{}).forEach(([r,i])=>{a[r]=ls(i,s+1)}),a}return t.type==="array"?[ls(t.items,s+1)]:t.type==="string"?((n=t.enum)==null?void 0:n[0])??"":t.type==="boolean"?!1:t.type==="integer"||t.type==="number"?0:null}function Zr({method:t,path:s,operation:n,userId:a,projectSpaceId:r,basePath:i}){const[o,c]=l.useState(!1),[g,p]=l.useState({}),[h,x]=l.useState(""),[k,N]=l.useState(null),[_,z]=l.useState(!1),[u,v]=l.useState(a),[b,y]=l.useState(r||"");l.useEffect(()=>{v(a)},[a]),l.useEffect(()=>{y(r||"")},[r]);const j=n.parameters||[],C=["post","put","patch"].includes(t);l.useEffect(()=>{var I,m,d;if(!o||!C||h)return;const G=(m=(I=n.requestBody)==null?void 0:I.content)==null?void 0:m["application/json"];if(!G)return;let J=G.example??((d=G.schema)==null?void 0:d.example);J===void 0&&G.schema&&(J=ls(G.schema)),J!=null&&x(JSON.stringify(J,null,2))},[o,C,n,h]);async function T(){z(!0),N(null);let G=(i||"")+s;j.filter(d=>d.in==="path").forEach(d=>{G=G.replace(`{${d.name}}`,encodeURIComponent(g[d.name]??""))});const J=new URLSearchParams;j.filter(d=>d.in==="query").forEach(d=>{g[d.name]&&J.append(d.name,g[d.name])});const I=J.toString();I&&(G+="?"+I);const m={"Content-Type":"application/json",...os()};b&&(m["X-PLM-ProjectSpace"]=b),j.filter(d=>d.in==="header").forEach(d=>{g[d.name]&&(m[d.name]=g[d.name])});try{const d=await fetch(G,{method:t.toUpperCase(),headers:m,body:C&&h.trim()?h:void 0}),$=await d.text();let M=$;try{M=JSON.stringify(JSON.parse($),null,2)}catch{}N({status:d.status,ok:d.ok,body:M||"(empty)"})}catch(d){N({status:0,ok:!1,body:`Network error: ${d.message}`})}finally{z(!1)}}return e.jsxs("div",{className:`pg-row${o?" pg-row--open":""}`,children:[e.jsxs("div",{className:"pg-row-hd",onClick:()=>c(G=>!G),children:[e.jsx("span",{className:"pg-chevron",children:o?e.jsx(Me,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx($e,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx(Jr,{method:t}),e.jsx("code",{className:"pg-path",children:s}),n.summary&&e.jsx("span",{className:"pg-summary",children:n.summary})]}),o&&e.jsxs("div",{className:"pg-row-body",children:[e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Headers"}),e.jsxs("div",{className:"pg-header-grid",children:[e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-User"}),e.jsx("input",{className:"pg-input pg-header-input",value:u,onChange:G=>v(G.target.value),placeholder:"user-alice"})]}),e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-ProjectSpace"}),e.jsx("input",{className:"pg-input pg-header-input",value:b,onChange:G=>y(G.target.value),placeholder:"ps-default"})]})]})]}),j.length>0&&e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Parameters"}),e.jsx("div",{className:"pg-params-grid",children:j.map(G=>{var J,I;return e.jsxs("div",{className:"pg-param",children:[e.jsxs("div",{className:"pg-param-hd",children:[e.jsx("code",{className:"pg-param-name",children:G.name}),e.jsx("span",{className:"pg-param-in",children:G.in}),G.required&&e.jsx("span",{className:"pg-param-req",children:"req"}),G.description&&e.jsx("span",{className:"pg-param-desc",children:G.description})]}),e.jsx("input",{className:"pg-input",placeholder:String(((J=G.schema)==null?void 0:J.example)??((I=G.schema)==null?void 0:I.type)??""),value:g[G.name]??"",onChange:m=>p(d=>({...d,[G.name]:m.target.value}))})]},G.name)})})]}),C&&e.jsxs("div",{className:"pg-section",children:[e.jsxs("div",{className:"pg-section-label",children:["Body",e.jsx("span",{className:"pg-section-sub",children:"application/json"})]}),e.jsx("textarea",{className:"pg-body-editor",value:h,onChange:G=>x(G.target.value),rows:5,spellCheck:!1,placeholder:"{}"})]}),e.jsxs("div",{className:"pg-exec-bar",children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:T,disabled:_,style:{minWidth:90},children:_?"Sending…":"▶ Execute"}),e.jsxs("span",{className:"pg-exec-meta",children:["as ",e.jsx("strong",{children:a})]}),k&&e.jsx("button",{className:"btn btn-xs",style:{marginLeft:"auto"},onClick:()=>N(null),children:"Clear"})]}),k&&e.jsxs("div",{className:"pg-response",children:[e.jsxs("div",{className:"pg-response-hd",children:[e.jsx("span",{className:"pg-status",style:{background:k.ok?"rgba(77,212,160,.15)":"rgba(252,129,129,.15)",color:k.ok?"var(--success)":"var(--danger)",border:`1px solid ${k.ok?"rgba(77,212,160,.3)":"rgba(252,129,129,.3)"}`},children:k.status||"ERR"}),e.jsx("span",{className:"pg-response-label",children:k.ok?"OK":"Error"})]}),e.jsx("pre",{className:"pg-response-body",children:k.body})]})]})]})}function Qr(t){return t?t.endsWith("/")?t.slice(0,-1):t:""}function ea({userId:t,projectSpaceId:s}){var I,m;const[n,a]=l.useState([]),[r,i]=l.useState(null),[o,c]=l.useState(null),[g,p]=l.useState(!0),[h,x]=l.useState(null),[k,N]=l.useState(""),[_,z]=l.useState({}),u=l.useMemo(()=>n.find(d=>d.serviceCode===r)||null,[n,r]),v=Qr(u==null?void 0:u.path),b=l.useCallback(()=>{p(!0),x(null),fetch("/api/platform/status",{headers:os(),cache:"no-store"}).then(d=>{if(!d.ok)throw new Error(`HTTP ${d.status} on /api/platform/status`);return d.json()}).then(d=>{const $=(d.services||[]).filter(M=>M.registered&&M.path&&M.serviceCode!=="spe"&&M.serviceCode!=="ws").sort((M,U)=>M.serviceCode.localeCompare(U.serviceCode));a($),$.length===0?(i(null),p(!1),x("No services registered — start backend services first.")):i(M=>$.some(U=>U.serviceCode===M)?M:$[0].serviceCode)}).catch(d=>{x(d.message),p(!1)})},[]),y=l.useCallback(()=>{v&&(p(!0),x(null),c(null),fetch(`${v}/v3/api-docs`,{headers:os(),cache:"no-store"}).then(async d=>{if(!d.ok){const M=await d.text().catch(()=>"");throw new Error(`HTTP ${d.status}${M?" — "+M.slice(0,200):""}`)}const $=d.headers.get("content-type")||"";if(!$.includes("json"))throw new Error(`Expected JSON spec, got ${$||"unknown"}.`);return d.json()}).then(d=>{c(d),p(!1)}).catch(d=>{x(d.message),p(!1)}))},[v]);l.useEffect(()=>{b()},[b]),l.useEffect(()=>{y()},[y]),l.useEffect(()=>{N(""),z({})},[r]);const j=l.useMemo(()=>{if(!(o!=null&&o.paths))return[];const d={};Object.entries(o.paths).forEach(([M,U])=>{Object.entries(U).forEach(([f,D])=>{var L;if(!["get","post","put","delete","patch"].includes(f))return;const E=((L=D.tags)==null?void 0:L[0])??"default";d[E]||(d[E]=[]),d[E].push({method:f,path:M,operation:D})})});const $=["get","post","put","patch","delete"];return Object.entries(d).sort(([M],[U])=>M.localeCompare(U)).map(([M,U])=>[M,[...U].sort((f,D)=>$.indexOf(f.method)-$.indexOf(D.method))])},[o]),C=l.useMemo(()=>{const d=k.trim().toLowerCase();return d?j.map(([$,M])=>[$,M.filter(({method:U,path:f,operation:D})=>U.includes(d)||f.toLowerCase().includes(d)||(D.summary||"").toLowerCase().includes(d)||$.toLowerCase().includes(d))]).filter(([,$])=>$.length>0):j},[j,k]);function T(d){z($=>({...$,[d]:!$[d]}))}const G=o?Object.keys(o.paths||{}).length:0,J=e.jsx("select",{className:"pg-service-select",value:r||"",onChange:d=>i(d.target.value),disabled:n.length===0,style:{background:"var(--bg-elev-1)",color:"var(--fg)",border:"1px solid var(--border)",borderRadius:4,padding:"4px 8px",fontSize:12,fontFamily:"var(--mono)",minWidth:160},children:n.map(d=>e.jsxs("option",{value:d.serviceCode,children:[d.serviceCode,"  (",d.path,")"]},d.serviceCode))});return g&&!o?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[J,e.jsx("span",{className:"pg-topbar-meta",children:"loading…"}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:b,title:"Reload services",children:"⟳"})]}),e.jsx("div",{className:"settings-loading",children:"Fetching OpenAPI spec…"})]}):h?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[J,e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:b,title:"Reload services",children:"⟳"})]}),e.jsxs("div",{style:{padding:24,display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("span",{style:{fontSize:12,color:"var(--danger)"},children:["✗ ",h]}),e.jsx("button",{className:"btn btn-sm",style:{alignSelf:"flex-start"},onClick:y,children:"Retry"})]})]}):e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[J,e.jsx("span",{className:"pg-topbar-title",children:(I=o==null?void 0:o.info)==null?void 0:I.title}),e.jsxs("span",{className:"pg-topbar-ver",children:["v",(m=o==null?void 0:o.info)==null?void 0:m.version]}),e.jsxs("span",{className:"pg-topbar-meta",children:[G," paths"]}),e.jsxs("span",{className:"pg-topbar-user",children:["as ",e.jsx("strong",{children:t}),s&&e.jsxs("span",{style:{marginLeft:8,color:"var(--accent)",opacity:.75},children:["· ",s]})]}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:y,title:"Reload spec",children:"⟳ Reload"})]}),e.jsxs("div",{className:"pg-filter",children:[e.jsx("input",{className:"pg-filter-input",placeholder:"Filter endpoints…",value:k,onChange:d=>N(d.target.value)}),k&&e.jsx("button",{className:"btn btn-xs",onClick:()=>N(""),children:"Clear"})]}),e.jsxs("div",{className:"pg-list",children:[C.length===0&&e.jsxs("div",{style:{padding:"32px 20px",fontSize:12,color:"var(--muted2)",fontStyle:"italic"},children:["No endpoints match “",k,"”"]}),C.map(([d,$])=>{const M=!!_[d];return e.jsxs("div",{className:"pg-group",children:[e.jsxs("div",{className:"pg-group-hd",onClick:()=>T(d),children:[e.jsx("span",{className:"pg-chevron",children:M?e.jsx($e,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Me,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx("span",{className:"pg-group-name",children:d}),e.jsx("span",{className:"pg-group-count",children:$.length})]}),!M&&$.map(({method:U,path:f,operation:D})=>e.jsx(Zr,{method:U,path:f,operation:D,userId:t,projectSpaceId:s,basePath:v},`${U}:${f}`))]},d)})]})]})}function vt({id:t,children:s}){return e.jsx("h2",{id:t,style:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 10px",paddingTop:4,borderBottom:"1px solid var(--border)",paddingBottom:8},children:s})}function Ee({children:t}){return e.jsx("h3",{style:{fontSize:13,fontWeight:600,color:"var(--accent)",margin:"20px 0 6px",textTransform:"uppercase",letterSpacing:".06em"},children:t})}function Se({children:t}){return e.jsx("p",{style:{margin:"0 0 10px",fontSize:13,lineHeight:1.65,color:"var(--text)"},children:t})}function be({children:t}){return e.jsx("code",{style:{fontFamily:"var(--mono)",fontSize:11,background:"rgba(100,116,139,.15)",border:"1px solid rgba(100,116,139,.2)",borderRadius:3,padding:"1px 5px",color:"var(--accent)"},children:t})}function Lt({children:t}){return e.jsxs("div",{style:{background:"rgba(232,169,71,.08)",border:"1px solid rgba(232,169,71,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"#e8a947"},children:"Note: "}),t]})}function Yt({children:t}){return e.jsxs("div",{style:{background:"rgba(91,156,246,.08)",border:"1px solid rgba(91,156,246,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"var(--accent)"},children:"Tip: "}),t]})}function se({name:t,type:s,children:n}){return e.jsxs("div",{style:{marginBottom:10},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:8,marginBottom:3},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13,color:"var(--text)"},children:t}),s&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",textTransform:"uppercase"},children:s})]}),e.jsx("div",{style:{fontSize:12,lineHeight:1.6,color:"var(--muted)",paddingLeft:10,borderLeft:"2px solid var(--border)"},children:n})]})}function Ge({rows:t}){return e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:10},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:600,width:"30%"},children:"Value"}),e.jsx("th",{style:{textAlign:"left",padding:"4px 0",color:"var(--muted)",fontWeight:600},children:"Meaning"})]})}),e.jsx("tbody",{children:t.map(([s,n])=>e.jsxs("tr",{style:{borderBottom:"1px solid rgba(100,116,139,.08)"},children:[e.jsx("td",{style:{padding:"5px 8px 5px 0",verticalAlign:"top"},children:e.jsx(be,{children:s})}),e.jsx("td",{style:{padding:"5px 0",verticalAlign:"top",color:"var(--text)",lineHeight:1.55},children:n})]},s))})]})}function Dt(){return e.jsx("hr",{style:{border:"none",borderTop:"1px solid var(--border)",margin:"28px 0"}})}const ta=[{id:"node-types",label:"Node Types"},{id:"lifecycles",label:"Lifecycles"},{id:"proj-spaces",label:"Project Spaces"},{id:"users-roles",label:"Users & Roles"},{id:"access-rights",label:"Access Rights"}];function sa(){const[t,s]=l.useState("node-types"),n=l.useRef(null);function a(r){s(r);const i=document.getElementById("manual-"+r);i&&n.current&&n.current.scrollTo({top:i.offsetTop-16,behavior:"smooth"})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[e.jsxs("div",{style:{width:160,flexShrink:0,borderRight:"1px solid var(--border)",padding:"16px 0",overflowY:"auto"},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",padding:"0 14px 10px"},children:"Contents"}),ta.map(({id:r,label:i})=>e.jsx("div",{onClick:()=>a(r),style:{padding:"6px 14px",fontSize:12,cursor:"pointer",color:t===r?"var(--accent)":"var(--muted)",background:t===r?"rgba(91,156,246,.08)":"transparent",borderLeft:t===r?"2px solid var(--accent)":"2px solid transparent",transition:"all .15s"},children:i},r))]}),e.jsxs("div",{ref:n,style:{flex:1,overflowY:"auto",padding:"20px 28px 40px"},children:[e.jsxs("div",{id:"manual-node-types",children:[e.jsx(vt,{id:"node-types",children:"Node Types"}),e.jsxs(Se,{children:["A ",e.jsx("strong",{children:"Node Type"})," is the blueprint for any object you create in the product structure — a component, an assembly, a document, a requirement, etc. Every node belongs to exactly one type and inherits that type's attributes, lifecycle, versioning rules, and link constraints."]}),e.jsx(Ee,{children:"Identity"}),e.jsxs(Se,{children:["Each node can carry a human-readable ",e.jsx("em",{children:"logical identifier"})," (separate from its internal UUID). The identity settings control how that identifier is displayed and validated."]}),e.jsx(se,{name:"Label",type:"text",children:'The display label used in the UI for the identifier field (e.g. "Part Number", "Doc ID"). Defaults to "Identifier".'}),e.jsxs(se,{name:"Validation Pattern",type:"regex",children:["An optional regular expression that the logical ID must match. If blank, any value is accepted. Example: ",e.jsx(be,{children:"^[A-Z]{2}-\\d{4}$"})," enforces two uppercase letters, a dash, and four digits."]}),e.jsx(Ee,{children:"Lifecycle"}),e.jsx(Se,{children:"Assign a lifecycle to the node type to enable state-based workflows (Draft → Review → Frozen → Released). Nodes without a lifecycle remain in their initial state and cannot be transitioned."}),e.jsx(se,{name:"Lifecycle",type:"select",children:'The lifecycle that governs nodes of this type. Setting it to "None" disables lifecycle management for this node type.'}),e.jsx(Ee,{children:"Versioning"}),e.jsxs(Se,{children:["Versioning settings control how the visible version identifier (",e.jsx(be,{children:"revision.iteration"}),", e.g. ",e.jsx(be,{children:"A.3"}),") advances when a node is checked out or released."]}),e.jsxs(se,{name:"Numbering Scheme",type:"select",children:["Determines the alphabet used for revision letters.",e.jsx(Ge,{rows:[["ALPHA_NUMERIC","Revisions advance A → B → … → Z → AA → AB … Standard PLM convention."]]})]}),e.jsxs(se,{name:"Version Policy",type:"select",children:["Controls what happens to the version number when a user checks out a node.",e.jsx(Ge,{rows:[["NONE","Checkout creates a new technical version for traceability but does not advance the visible revision.iteration. Use for types where every save is tracked internally but the displayed identifier must stay stable."],["ITERATE","Checkout increments the iteration: A.1 → A.2. Use for normal work-in-progress types where each save is a new draft of the same revision."],["RELEASE","Checkout starts a new revision and resets iteration to 1: A.3 → B.1. Use for types that follow a formal release cycle where a new revision means a significant change."]]})]}),e.jsxs(se,{name:"Collapse history on release",type:"checkbox",children:["When enabled, the intermediate working iterations are purged from history each time a node enters a ",e.jsx("strong",{children:"Released"})," state.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"What happens:"}),e.jsxs("ul",{style:{margin:"6px 0 0 16px",paddingLeft:0,listStyleType:"disc",fontSize:12,lineHeight:1.7},children:[e.jsxs("li",{children:["All working iterations of the previous revision are deleted (",e.jsx(be,{children:"A.1"}),", ",e.jsx(be,{children:"A.2"}),", ",e.jsx(be,{children:"A.3"})," — all gone)."]}),e.jsxs("li",{children:["The new Released version has its iteration stripped and displays as the bare revision letter (e.g. ",e.jsx(be,{children:"B.1"})," → ",e.jsx(be,{children:"B"}),")."]}),e.jsx("li",{children:"Versions that are pinned in a baseline or referenced by a VERSION_TO_VERSION link are never deleted."})]}),e.jsx("br",{}),e.jsx("strong",{children:"Result:"})," version history reads ",e.jsx(be,{children:"B"}),", ",e.jsx(be,{children:"C"}),", ",e.jsx(be,{children:"D"})," (one entry per release) instead of ",e.jsx(be,{children:"A.1"}),", ",e.jsx(be,{children:"A.2"}),", ",e.jsx(be,{children:"A.3"}),", ",e.jsx(be,{children:"B.1"}),", …",e.jsxs(Lt,{children:["Only applies to node types whose lifecycle has a Released state (",e.jsx(be,{children:"isReleased = true"}),")."]})]}),e.jsx(Ee,{children:"Attributes"}),e.jsx(Se,{children:"Attributes are the structured data fields attached to every version of a node of this type (title, description, material, weight, etc.). Each attribute is independently configurable."}),e.jsxs(se,{name:"Name (internal key)",type:"text",children:["The machine-readable key stored in the database. Must be unique within the node type. Cannot be changed after creation. Use camelCase or snake_case (e.g. ",e.jsx(be,{children:"reviewNote"}),", ",e.jsx(be,{children:"material_grade"}),")."]}),e.jsx(se,{name:"Label (display)",type:"text",children:'The human-readable label shown in forms and tables (e.g. "Review Note", "Material Grade").'}),e.jsxs(se,{name:"Data Type",type:"select",children:["The underlying data type for validation and storage.",e.jsx(Ge,{rows:[["STRING","Free text."],["NUMBER","Numeric value (integer or decimal)."],["DATE","ISO date value."],["BOOLEAN","True / False toggle."],["ENUM","One value from a predefined list (configure the list separately)."]]})]}),e.jsxs(se,{name:"Widget",type:"select",children:["The UI control rendered in the editor for this attribute.",e.jsx(Ge,{rows:[["TEXT","Single-line text input."],["TEXTAREA","Multi-line text area."],["DROPDOWN","Dropdown selector (required for ENUM type)."],["DATE_PICKER","Calendar date picker (recommended for DATE type)."],["CHECKBOX","Toggle checkbox (recommended for BOOLEAN type)."]]})]}),e.jsx(se,{name:"Section",type:"text",children:'Groups this attribute under a named panel in the editor (e.g. "Mechanical", "Review"). Attributes with no section appear in the default group.'}),e.jsx(se,{name:"Order",type:"number",children:"Display order within the section. Lower numbers appear first."}),e.jsx(se,{name:"Required field",type:"checkbox",children:"When checked, this attribute must be filled before a node can advance past states configured as requiring it (via Attribute State Rules). Does not block saving; only blocks lifecycle transitions where the rule is active."}),e.jsx(se,{name:"Use as display name ★",type:"checkbox",children:"Marks this attribute as the human-readable title of the node. Its value appears in node lists, search results, and link pickers. Only one attribute per node type can be the display name."}),e.jsx(Ee,{children:"Link Types (Outgoing)"}),e.jsx(Se,{children:"A link type defines an allowed relationship from this node type to another. Links are version-aware and carry a versioning policy."}),e.jsxs(se,{name:"Link Name",type:"text",children:["Internal name for the relationship (e.g. ",e.jsx(be,{children:"composed_of"}),", ",e.jsx(be,{children:"references"}),")."]}),e.jsx(se,{name:"Target Node Type",type:"select",children:"The node type that can appear on the other end of this link."}),e.jsxs(se,{name:"Link Policy",type:"select",children:["Controls how the link resolves over time.",e.jsx(Ge,{rows:[["VERSION_TO_MASTER","The link always points to the latest committed version of the target. When the target is updated and committed, all parents automatically see the new version. Use for live BOM structures. Requires the parent to be locked (checked out) when the target is modified."],["VERSION_TO_VERSION","The link is frozen to the exact target version at the time the link was created. The parent always sees the same snapshot of the child regardless of future changes. Use for reference documentation or frozen configurations."]]})]}),e.jsxs(se,{name:"Min Cardinality",type:"number",children:["Minimum number of links of this type required per node version. ",e.jsx(be,{children:"0"})," means the link is optional."]}),e.jsx(se,{name:"Max (blank = unlimited)",type:"number",children:"Maximum number of links allowed. Leave blank for no upper limit."}),e.jsx(se,{name:"Color",type:"color",children:"Visual color used to draw this link in the graph view."}),e.jsx(Yt,{children:'After creating a link type you can add attributes to it (e.g. "quantity", "reference designator") via the Edit link type panel. You can also define cascade rules that automatically propagate lifecycle transitions through the link.'})]}),e.jsx(Dt,{}),e.jsxs("div",{id:"manual-lifecycles",children:[e.jsx(vt,{id:"lifecycles",children:"Lifecycles"}),e.jsxs(Se,{children:["A ",e.jsx("strong",{children:"Lifecycle"})," defines the states an object can be in and the valid transitions between them. It encodes the approval and release workflow for a node type."]}),e.jsx(Ee,{children:"Lifecycle Properties"}),e.jsx(se,{name:"Name",type:"text",children:"Name displayed in the UI and referenced by node types."}),e.jsx(se,{name:"Description",type:"text",children:"Optional free-text explanation of the lifecycle's purpose."}),e.jsx(Ee,{children:"States"}),e.jsx(Se,{children:"States represent stages in the lifecycle (e.g. Draft, In Review, Frozen, Released). Every node version has exactly one current state."}),e.jsx(se,{name:"State Name",type:"text",children:'Display label for the state. Short, descriptive names work best (e.g. "Draft", "Frozen").'}),e.jsx(se,{name:"Display Order",type:"number",children:"Order in which states appear in dropdowns and diagrams. Lower = earlier in the flow."}),e.jsx(se,{name:"Color",type:"color",children:"Color used to represent this state in the UI (state pills, timeline dots). Pick a color that intuitively maps to the state's meaning — green for released, yellow for in-review, grey for draft."}),e.jsx(se,{name:"isInitial",type:"tag",children:"Marks this as the entry state. Every newly created node starts here. Only one state per lifecycle can be initial."}),e.jsx(se,{name:"isFrozen",type:"tag",children:"A frozen state locks the node's content. When a node enters a frozen state, the lock cascades to all children connected via VERSION_TO_MASTER links — they cannot be independently modified until the parent is unfrozen. Required before a baseline can be taken."}),e.jsxs(se,{name:"isReleased",type:"tag",children:["Marks the state as a release milestone. Reaching this state is what triggers the ",e.jsx("em",{children:"Collapse history"})," feature (if enabled on the node type). Typically only one state per lifecycle is released."]}),e.jsx(Ee,{children:"Transitions"}),e.jsx(Se,{children:"Transitions define which state changes are allowed and under what conditions. A transition always goes from one specific state to another."}),e.jsx(se,{name:"Transition Name",type:"text",children:'Label shown on the action button that triggers this transition (e.g. "Freeze", "Release", "Reject"). Keep it short and verb-form.'}),e.jsx(se,{name:"From State / To State",type:"select",children:"The source and target states for this transition. A node must be in the From State for the transition to appear."}),e.jsxs(se,{name:"Guard Expression",type:"text",children:["An optional server-side condition that must be satisfied before the transition is allowed. If the guard fails, the transition button is blocked and an error is shown.",e.jsx(Ge,{rows:[["all_required_filled","All attributes marked Required must have a non-empty value in the current version."],["all_signatures_done","All signature requirements for this transition must have been fulfilled."],["(blank)","No guard — the transition is always allowed when the node is in the From State."]]})]}),e.jsxs(se,{name:"Action Type",type:"select",children:["A server-side action executed as part of this transition.",e.jsx(Ge,{rows:[["NONE","No action — the transition simply changes the state."],["REQUIRE_SIGNATURE","Collects an electronic signature from the current user as part of the transition. The signature is stored permanently against the version."]]})]}),e.jsxs(se,{name:"Version Strategy",type:"select",children:["Controls how the version number changes when this transition is triggered.",e.jsx(Ge,{rows:[["NONE","Creates a new technical version (for audit trail) but keeps the same revision.iteration visible to users. Used for state changes that are purely administrative."],["ITERATE","Increments the iteration (A.2 → A.3). Unusual for a lifecycle transition; more common for checkouts."],["REVISE","Starts a new revision and resets iteration to 1 (A.3 → B.1). Typically used on the Release transition to mark a new formal revision of the product."]]})]}),e.jsx(Ee,{children:"Cascade Rules"}),e.jsx(Se,{children:"Cascade rules automate lifecycle propagation through links. When a parent node undergoes a transition, eligible child nodes are automatically transitioned as well — without manual action."}),e.jsx(Se,{children:"Rules are configured inside the link type: you specify which parent transition triggers which child transition, and from which child state. Children not in the expected state are silently skipped (they are already beyond or not yet at that stage)."}),e.jsx(Lt,{children:"Cascade is only applied through VERSION_TO_MASTER links. VERSION_TO_VERSION links point to frozen snapshots and are never cascaded."})]}),e.jsx(Dt,{}),e.jsxs("div",{id:"manual-proj-spaces",children:[e.jsx(vt,{id:"proj-spaces",children:"Project Spaces"}),e.jsxs(Se,{children:["A ",e.jsx("strong",{children:"Project Space"})," is an organisational container that groups nodes and controls access. Every node creation request must specify a project space. Access rights (which roles can do what) are configured per project space."]}),e.jsx(Se,{children:'Think of a project space as a "workspace" or "programme" — you might have one per product line, customer project, or development phase.'}),e.jsx(se,{name:"Name",type:"text",children:'Short, unique name for the space (e.g. "Prototype-2026", "Certification-A320"). Shown in the project space selector at the top of the application.'}),e.jsx(se,{name:"Description",type:"text",children:"Optional free-text explaining the purpose or scope of this project space."}),e.jsx(Lt,{children:"Deleting a project space does not delete the nodes inside it — it removes only the space record. Nodes retain their project_space_id as a plain reference."})]}),e.jsx(Dt,{}),e.jsxs("div",{id:"manual-users-roles",children:[e.jsx(vt,{id:"users-roles",children:"Users & Roles"}),e.jsx(Ee,{children:"Roles"}),e.jsxs(Se,{children:["A ",e.jsx("strong",{children:"Role"})," is a named group of permissions (e.g. DESIGNER, REVIEWER, READER). Users are assigned roles within a project space. The role determines what actions the user can perform on which node types."]}),e.jsxs(se,{name:"Name",type:"text",children:["Internal name for the role. By convention use UPPER_CASE (e.g. ",e.jsx(be,{children:"DESIGNER"}),"). This name is referenced in permission rules and signature requirements."]}),e.jsx(se,{name:"Description",type:"textarea",children:'Human-readable explanation of who should hold this role (e.g. "Engineers who create and modify parts").'}),e.jsx(Yt,{children:"Create roles that map to real job functions, not individual people. A user can hold multiple roles — combine them to grant additive permissions."}),e.jsx(Ee,{children:"Users"}),e.jsxs(Se,{children:["Users are the people who log in to the system. Each user is identified by a username (sent in the ",e.jsx(be,{children:"X-PLM-User"})," HTTP header). Users are created here and then assigned roles in specific project spaces."]}),e.jsxs(se,{name:"Username",type:"text",children:["Unique login identifier (e.g. ",e.jsx(be,{children:"john.doe"}),"). This is the value placed in the ",e.jsx(be,{children:"X-PLM-User"})," header. Cannot be changed after creation."]}),e.jsx(se,{name:"Display Name",type:"text",children:'Full human-readable name shown in the UI (e.g. "John Doe").'}),e.jsx(se,{name:"Email",type:"email",children:"Contact email address. Stored for reference; not used for authentication in the current setup."}),e.jsx(se,{name:"Admin status",type:"select",children:e.jsx(Ge,{rows:[["User","Standard user — access governed entirely by role assignments."],["Admin","System administrator — bypasses all permission checks and can perform any action in any project space. Use sparingly."]]})}),e.jsx(Ee,{children:"Role Assignments"}),e.jsxs(Se,{children:["A role assignment connects a ",e.jsx("strong",{children:"user"}),", a ",e.jsx("strong",{children:"role"}),", and a ",e.jsx("strong",{children:"project space"}),". The user gains all permissions granted to that role within that specific project space."]}),e.jsx(Se,{children:"A user can hold multiple role assignments — for example, DESIGNER in Project-A and READER in Project-B, or DESIGNER + REVIEWER in the same project space (permissions are additive)."})]}),e.jsx(Dt,{}),e.jsxs("div",{id:"manual-access-rights",children:[e.jsx(vt,{id:"access-rights",children:"Access Rights"}),e.jsxs(Se,{children:["Access Rights define what each role is allowed to do. The system uses two levels of permissions: ",e.jsx("strong",{children:"global actions"})," and ",e.jsx("strong",{children:"node-type/project-space actions"}),"."]}),e.jsx(Ee,{children:"Global Permissions"}),e.jsx(Se,{children:"Global permissions control system-wide administrative capabilities, independent of any project space or node type."}),e.jsx(Lt,{children:'"Zero grants = action open to all roles." — If no role has been granted a global permission, the action is unrestricted. As soon as any role is granted a permission, only that role (and admins) can perform it.'}),e.jsx(Ge,{rows:[["MANAGE_METAMODEL","Create and edit node types, lifecycles, attributes, link types, and cascade rules."],["MANAGE_ROLES","Create and edit roles, users, project spaces, and role assignments."],["CREATE_NODE","Create new nodes (top-level action, independently of node type)."]]}),e.jsx(Ee,{children:"Node Type × Project Space Permission Matrix"}),e.jsx(Se,{children:"The matrix table shows all combinations of node types (rows) and actions (columns) for a given project space. Toggle the circle icon in any cell to grant or revoke that permission for the current role."}),e.jsx(Se,{children:e.jsx("strong",{children:"Action column types:"})}),e.jsx(se,{name:"NODE scope actions",type:"column",children:"Standard CRUD and workflow actions that apply to nodes of that type (e.g. checkout, checkin, create link, delete)."}),e.jsxs(se,{name:"LIFECYCLE scope actions",type:"column",children:['Columns labelled "',e.jsx("em",{children:"From State → Transition Name"}),'" represent individual lifecycle transitions. Granting this permission allows the role to fire that specific transition on nodes of that type within this project space.']}),e.jsx(Ee,{children:"How Permissions Stack"}),e.jsx(Se,{children:"Permissions are evaluated in this order. Each layer can only restrict, never expand, what the higher layer allowed:"}),e.jsxs("ol",{style:{margin:"0 0 12px 18px",paddingLeft:0,fontSize:13,lineHeight:2,color:"var(--text)"},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute State Rules"})," — declares which attributes are editable, visible, or required based on the lifecycle state."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute Views"})," — can further restrict (never widen) attribute visibility/editability for a specific role × state combination."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Node Type Permission ",e.jsx(be,{children:"can_write"})]})," — if false for the role, the entire node type becomes read-only regardless of other rules."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Transition Permission"})," — filters the list of lifecycle transitions available to the role."]})]}),e.jsx(Yt,{children:"Start with broad node-type permissions and use attribute views to fine-tune field-level access by role. Only add transition restrictions when you need formal approval gates."})]})]})]})}const na="#5b9cf6";function Is(t){return(t==null?void 0:t.color)||(t==null?void 0:t.COLOR)||na}const ct=110,dt=36,Jt=72,Ot=28,Zt=46,Qt=32,Ze=10,yt=16,Ps=8,Mt=4;function ra({lifecycleId:t,currentStateId:s,userId:n,onTransition:a,availableTransitionNames:r,transitionGuardViolations:i,previewMode:o}){const[c,g]=l.useState([]),[p,h]=l.useState([]),[x,k]=l.useState(!1),[N,_]=l.useState(null);if(l.useEffect(()=>{!t||!n||(k(!0),Promise.all([X.getLifecycleStates(n,t).catch(()=>[]),X.getLifecycleTransitions(n,t).catch(()=>[])]).then(([S,w])=>{g(Array.isArray(S)?S:[]),h(Array.isArray(w)?w:[])}).finally(()=>k(!1)))},[t,n]),x)return e.jsx("div",{className:"lc-empty",children:"Loading diagram…"});if(!t)return e.jsx("div",{className:"lc-empty",children:"No lifecycle associated with this object type."});if(!c.length)return e.jsx("div",{className:"lc-empty",children:"No lifecycle states defined."});const z=[...c].sort((S,w)=>(S.display_order??S.DISPLAY_ORDER??0)-(w.display_order??w.DISPLAY_ORDER??0)),u={};z.forEach((S,w)=>{u[S.id||S.ID]=w});const v={};z.forEach((S,w)=>{v[S.id||S.ID]=Ot+w*(ct+Jt)+ct/2});const b=p.map((S,w)=>{const R=S.from_state_id||S.FROM_STATE_ID,W=S.to_state_id||S.TO_STATE_ID,F=u[R]??0,P=u[W]??0,H=P-F;return{...S,fromId:R,toId:W,fromIdx:F,toIdx:P,span:H,i:w}}).filter(S=>v[S.fromId]&&v[S.toId]&&S.span!==0),y=ct*.6,j=new Map,C=(S,w,R,W,F)=>{const P=`${S}::${w}`;j.has(P)||j.set(P,[]),j.get(P).push({tIdx:R,role:W,otherIdx:F})};for(const S of b){const w=S.span>0?"top":"bot";C(S.fromId,w,S.i,"from",S.toIdx),C(S.toId,w,S.i,"to",S.fromIdx)}const T=new Map(b.map(S=>[S.i,{x1:v[S.fromId],x2:v[S.toId]}]));for(const[S,w]of j){if(w.length<=1)continue;const R=S.indexOf("::"),W=S.slice(0,R),F=S.slice(R+2),P=u[W],H=v[W],B=ee=>Math.abs(ee.otherIdx-P),O=w.filter(ee=>ee.role==="to"),K=w.filter(ee=>ee.role==="from");let Y;F==="top"?(O.sort((ee,te)=>B(ee)-B(te)),K.sort((ee,te)=>B(te)-B(ee)),Y=[...O,...K]):(K.sort((ee,te)=>B(ee)-B(te)),O.sort((ee,te)=>B(te)-B(ee)),Y=[...K,...O]);const V=Y.length,Q=H-y/2,ne=y/(V-1);Y.forEach(({tIdx:ee,role:te},re)=>{const le=Q+re*ne,ye=T.get(ee);te==="from"?ye.x1=le:ye.x2=le})}const G=b.filter(S=>S.span>0),J=b.filter(S=>S.span<0),I=G.length?Math.max(...G.map(S=>S.span)):0,m=J.length?Math.max(...J.map(S=>-S.span)):0,d=I>0?Zt+(I-1)*Qt+yt+16:20,$=m>0?Zt+(m-1)*Qt+yt+28:30,M=Ot+d+dt/2,U=Ot*2+z.length*(ct+Jt)-Jt,f=M+dt/2+$+Ot,D=M-dt/2,E=M+dt/2,L=S=>{const{fromId:w,span:R,i:W}=S,F=S.name||S.NAME||"",P=R>0,H=Math.abs(R),B=Zt+(H-1)*Qt,{x1:O,x2:K}=T.get(W),Y=P?D:E,V=P?Y-B:Y+B,Q=(O+K)/2,ne=!o&&w===s,ee=(i==null?void 0:i.get(F))??[],te=ee.length>0,re=te||ne&&r!=null&&!r.has(F),le=re?`✕ ${F}`:F,ye=le?Math.max(44,le.length*6+18)/2:0;let ce,de;P?(ce=[`M ${O},${Y}`,`V ${V+Ze}`,`Q ${O},${V} ${O+Ze},${V}`,`H ${Q-ye-Mt}`].join(" "),de=[`M ${Q+ye+Mt},${V}`,`H ${K-Ze}`,`Q ${K},${V} ${K},${V+Ze}`,`V ${Y}`].join(" ")):(ce=[`M ${O},${Y}`,`V ${V-Ze}`,`Q ${O},${V} ${O-Ze},${V}`,`H ${Q+ye+Mt}`].join(" "),de=[`M ${Q-ye-Mt},${V}`,`H ${K+Ze}`,`Q ${K},${V} ${K},${V-Ze}`,`V ${Y}`].join(" "));const pe=ne,me=re,ue=pe&&!me,Te=ue&&N===W,Ke=ue&&!!a&&!o,_e=o||pe,gt=z.find(He=>(He.id||He.ID)===S.toId),Le=me?"#dc2626":Is(gt)||(P?"#5b9cf6":"#e8a947"),ot=Le,lt=_e?.7:.3,zt=_e?1.5:1,At=ye*2,We=Q-ye,It=V-yt/2;let Xe,Ye,Je;return me?(Xe="#1c0808",Ye="#7f1d1d",Je="var(--danger)"):ue||o?Te?(Xe=Le,Ye=Le,Je="#ffffff"):(Xe=`${Le}18`,Ye=`${Le}70`,Je=Le):(Xe="var(--surface2)",Ye="var(--border2)",Je="var(--muted2)"),e.jsxs("g",{children:[e.jsx("path",{d:ce,fill:"none",style:{stroke:_e?ot:"var(--border2)"},strokeWidth:zt,strokeDasharray:P?"none":"4,3",opacity:lt}),e.jsx("path",{d:de,fill:"none",style:{stroke:_e?ot:"var(--border2)"},strokeWidth:zt,strokeDasharray:P?"none":"4,3",opacity:lt,markerEnd:"url(#arr)"}),le&&e.jsxs("g",{style:{cursor:Ke?"pointer":"default"},onMouseEnter:ue?()=>_(W):void 0,onMouseLeave:ue?()=>_(null):void 0,onClick:Ke?()=>a(S):void 0,children:[te&&e.jsx("title",{children:`Blocked:
• `+ee.map(He=>typeof He=="string"?He:He.message||He.guardCode).join(`
• `)}),e.jsx("rect",{x:We-4,y:It-4,width:At+8,height:yt+8,rx:Ps+4,fill:"transparent"}),e.jsx("rect",{x:We,y:It,width:At,height:yt,rx:Ps,style:{fill:Xe,stroke:Ye},strokeWidth:pe?1:.5}),e.jsx("text",{x:Q,y:V+5,textAnchor:"middle",fontSize:"9",fontFamily:"var(--sans)",fontWeight:"700",style:{fill:Je,userSelect:"none",pointerEvents:"none"},children:le})]})]},`t-${W}`)};return e.jsx("div",{className:"lc-diagram",children:e.jsxs("svg",{width:U,height:f,viewBox:`0 0 ${U} ${f}`,style:{fontFamily:"var(--mono)",overflow:"visible"},children:[e.jsxs("defs",{children:[e.jsx("marker",{id:"arr",markerWidth:"7",markerHeight:"7",refX:"5",refY:"3.5",orient:"auto",children:e.jsx("path",{d:"M0,0.5 L0,6.5 L6,3.5 z",fill:"context-stroke",opacity:"0.7"})}),e.jsxs("filter",{id:"glow",children:[e.jsx("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),J.map(L),G.map(L),z.map(S=>{const w=S.id||S.ID,R=S.name||S.NAME||w,W=S.is_frozen===1||S.IS_FROZEN===1,F=S.is_released===1||S.IS_RELEASED===1,H=[S.is_initial===1||S.IS_INITIAL===1?"INIT":null,W?"FROZEN":null,F?"REL":null].filter(Boolean).join(" · "),B=v[w],O=B-ct/2,K=M-dt/2,Y=o||w===s;let V,Q,ne;if(Y){const ee=Is(S);V=`${ee}22`,Q=ee,ne=ee}else V="var(--surface2)",Q="var(--border2)",ne="var(--muted)";return e.jsxs("g",{filter:Y?"url(#glow)":void 0,children:[e.jsx("rect",{x:O,y:K,width:ct,height:dt,rx:6,style:{fill:V,stroke:Q},strokeWidth:Y?1.5:1}),e.jsx("text",{x:B,y:M+(H?1:4),textAnchor:"middle",fontSize:"11",fontFamily:"var(--sans)",fontWeight:Y?"700":"600",style:{fill:ne},children:R}),H&&e.jsx("text",{x:B,y:M+13,textAnchor:"middle",fontSize:"7",fontFamily:"var(--sans)",style:{fill:Y?ne:"var(--muted2)"},opacity:"0.7",children:H})]},w)})]})})}const hn=new Map;function Be(t,s,{wrapBody:n=!0}={}){hn.set(t,{Component:s,wrapBody:n})}function aa(t){return hn.get(t)??null}const ia=new Map,St=new Map;function oa(t){t!=null&&t.id&&(ia.set(t.id,t),St.has(t.zone)||St.set(t.zone,[]),St.get(t.zone).push(t))}function la(t){return(St.get("editor")??[]).find(n=>{var a;return(a=n.matches)==null?void 0:a.call(n,t)})??null}function ca(t){var s;for(const n of St.get("settings")??[])if((s=n.sections)!=null&&s[t])return{Component:n.sections[t],wrapBody:!0};return null}function da({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState(""),[c,g]=l.useState("actions");if(l.useEffect(()=>{we.listActions(t).then(x=>{const k=Array.isArray(x)?x:[];if(r(k),!i){const N=[...new Set(k.map(_=>_.serviceCode).filter(Boolean))].sort();N.length>0&&o(N[0])}}).catch(()=>r([]))},[t]),a===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const p=[...new Set(a.map(x=>x.serviceCode).filter(Boolean))].sort(),h=x=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:c===x?"var(--accent)":"var(--muted)",borderBottom:c===x?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:i,onChange:x=>o(x.target.value),children:p.map(x=>e.jsx("option",{value:x,children:x},x))})]}),e.jsxs("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[e.jsx("button",{style:h("actions"),onClick:()=>g("actions"),children:"Actions"}),e.jsx("button",{style:h("algorithm-catalog"),onClick:()=>g("algorithm-catalog"),children:"Algorithm Catalog"})]}),c==="actions"&&e.jsx(pa,{userId:t,serviceCode:i,dbActions:a.filter(x=>x.serviceCode===i),canWrite:s,toast:n}),c==="algorithm-catalog"&&e.jsx(ma,{userId:t,serviceCode:i,canWrite:s,toast:n})]})}function pa({userId:t,serviceCode:s,dbActions:n,canWrite:a,toast:r}){const[i,o]=l.useState(null),[c,g]=l.useState(null),[p,h]=l.useState(null),[x,k]=l.useState(null),[N,_]=l.useState({}),[z,u]=l.useState({}),v=i??n;function b(f,D){o(E=>(E??n).map(L=>L.id===f?{...L,description:D}:L))}l.useEffect(()=>{s&&(o(null),g(null),k(null),_({}),u({}),Promise.all([we.getServiceCatalog(s),we.listAllInstances(t,s)]).then(([f,D])=>{g(f),h(Array.isArray(D)?D:[])}).catch(()=>{g({handlers:[],guards:[]}),h([])}))},[t,s]);async function y(f){const D=await we.listActionGuards(t,f).catch(()=>[]);_(E=>({...E,[f]:Array.isArray(D)?D:[]}))}async function j(f){const D=await we.listActionWrappers(t,f).catch(()=>[]);u(E=>({...E,[f]:Array.isArray(D)?D:[]}))}function C(f){if(x===f){k(null);return}k(f),N[f]||y(f),z[f]||j(f)}async function T(f,D,E){try{await we.attachActionGuard(t,f,D,E||"HIDE",0),y(f),r("Guard attached","success")}catch(L){r(String(L),"error")}}async function G(f,D){try{await we.detachActionGuard(t,f,D),y(f),r("Guard detached","success")}catch(E){r(String(E),"error")}}async function J(f,D,E){try{await we.updateActionGuard(t,f,D,E),_(L=>({...L,[f]:(L[f]||[]).map(S=>S.id===D?{...S,effect:E}:S)}))}catch(L){r(String(L),"error")}}if(c===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const I={};v.forEach(f=>{I[(f.actionCode||f.action_code||"").toUpperCase()]=f});const m=c.handlers||[],d=new Set([...m.map(f=>(f.code||"").toUpperCase()),...Object.keys(I)]),$=Array.from(d).map(f=>{const D=I[f],E=m.find(L=>(L.code||"").toUpperCase()===f);return D?{...D,_fromDb:!0,_module:D.handlerModuleName||D.handler_module_name||(E==null?void 0:E.module)||"unknown"}:{id:null,actionCode:E.code,displayName:E.label||E.code,scope:null,displayCategory:null,displayOrder:9999,description:null,_fromDb:!1,_module:E.module||"unknown"}});if($.sort((f,D)=>f._fromDb&&D._fromDb?(f.displayOrder??0)-(D.displayOrder??0):f._fromDb?-1:D._fromDb?1:(f.actionCode||"").localeCompare(D.actionCode||"")),$.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No actions registered for ",e.jsx("strong",{children:s}),"."]});const M={};$.forEach(f=>{const D=f._module||"unknown";M[D]||(M[D]=[]),M[D].push(f)});const U=(p||[]).filter(f=>(f.typeName||"").toLowerCase().includes("guard"));return e.jsx("div",{className:"settings-list",children:Object.entries(M).sort(([f],[D])=>f.localeCompare(D)).map(([f,D])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx(xn,{module:f}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",D.length,")"]})]}),D.map(E=>{const L=E.id||E.actionCode,S=x===L,w=E.actionCode||E.action_code,R=E.displayName||E.display_name||w,W=E.scope,F=E.displayCategory||E.display_category,P=N[L]||[],H=z[L]||[];return e.jsxs("div",{className:"settings-card",style:{marginBottom:4,opacity:E._fromDb?1:.6},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>E._fromDb&&C(L),style:{display:"flex",alignItems:"center",cursor:E._fromDb?"pointer":"default"},children:[E._fromDb?e.jsx("span",{className:"settings-card-chevron",children:S?e.jsx(Me,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx($e,{size:13,strokeWidth:2,color:"var(--muted)"})}):e.jsx("span",{className:"settings-card-chevron",style:{width:18,color:"var(--muted2)",fontSize:9},children:"—"}),e.jsx("span",{className:"settings-card-name",children:R}),!E._fromDb&&e.jsx("span",{style:{fontSize:9,color:"var(--muted2)",marginLeft:6,fontStyle:"italic"},children:"not seeded"}),e.jsx("span",{style:{flex:1}}),W&&e.jsx("span",{className:"settings-badge",children:W}),F&&e.jsx("span",{className:"settings-badge",style:{marginLeft:4},children:F})]}),S&&E._fromDb&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:e.jsxs("span",{children:["Code: ",e.jsx("code",{children:w})]})}),e.jsx(ua,{description:E.description,actionId:L,userId:t,canWrite:a,onSaved:B=>b(L,B)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Guards"}),P.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No guards attached"}),P.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%",marginBottom:8},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Guard"}),e.jsx("th",{children:"Effect"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:P.map(B=>e.jsxs("tr",{children:[e.jsxs("td",{children:[B.algorithmName||B.algorithm_name,(B.algorithmCode||B.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",B.algorithmCode||B.algorithm_code,")"]})]}),e.jsx("td",{children:a?e.jsxs("select",{className:"field-input",style:{fontSize:11,padding:"1px 4px"},value:B.effect,onChange:O=>J(L,B.id,O.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}):e.jsx("span",{className:`settings-badge${B.effect==="BLOCK"?" badge-warn":""}`,children:B.effect})}),e.jsx("td",{style:{textAlign:"right"},children:a&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>G(L,B.id),children:e.jsx(ut,{size:10})})})]},B.id))})]}),a&&U.length>0&&e.jsx(ha,{instances:U,onAttach:(B,O)=>T(L,B,O)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4,marginTop:12},children:"Wrappers"}),H.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No wrappers"}),H.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Order"}),e.jsx("th",{children:"Wrapper"}),e.jsx("th",{children:"Instance"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:H.map(B=>e.jsxs("tr",{children:[e.jsx("td",{style:{width:50},children:B.executionOrder||B.execution_order}),e.jsxs("td",{children:[B.algorithmName||B.algorithm_name,(B.algorithmCode||B.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",B.algorithmCode||B.algorithm_code,")"]})]}),e.jsx("td",{style:{fontSize:11,color:"var(--muted)"},children:B.instanceName||B.instance_name}),e.jsx("td",{style:{textAlign:"right"},children:a&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:async()=>{try{await we.detachActionWrapper(t,L,B.id),j(L),r("Wrapper detached","success")}catch(O){r(String(O),"error")}},children:e.jsx(ut,{size:10})})})]},B.id))})]})]})]},L)})]},f))})}const Rs=[{key:"handler",label:"Action Handler",filter:t=>t.toLowerCase().includes("handler")},{key:"guard",label:"Guard",filter:t=>t.toLowerCase().includes("guard")},{key:"wrapper",label:"Wrapper",filter:t=>t.toLowerCase().includes("wrapper")}];function ma({userId:t,serviceCode:s}){const[n,a]=l.useState(null),[r,i]=l.useState("handler");l.useEffect(()=>{s&&(a(null),we.listAllInstances(t,s).then(p=>a(Array.isArray(p)?p:[])).catch(()=>a([])))},[t,s]);const o=p=>({padding:"4px 12px",fontSize:11,cursor:"pointer",background:"none",border:"none",color:r===p?"var(--accent)":"var(--muted)",borderBottom:r===p?"2px solid var(--accent)":"2px solid transparent"});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const c=Rs.find(p=>p.key===r),g=(n||[]).filter(p=>c==null?void 0:c.filter(p.typeName||p.type_name||""));return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:Rs.map(p=>e.jsx("button",{style:o(p.key),onClick:()=>i(p.key),children:p.label},p.key))}),g.length===0?e.jsxs("div",{style:{padding:"16px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No ",c==null?void 0:c.label.toLowerCase()," instances for ",e.jsx("strong",{children:s}),"."]}):e.jsx("div",{className:"settings-list",children:g.map(p=>{const h=r==="guard"?e.jsx(at,{size:12,color:"var(--accent)",strokeWidth:1.8}):r==="wrapper"?e.jsx(us,{size:12,color:"var(--muted2)",strokeWidth:1.8}):e.jsx(ms,{size:12,color:"var(--muted)",strokeWidth:1.8});return e.jsxs("div",{className:"settings-card",style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"},children:[h,e.jsx("span",{className:"settings-card-name",style:{flex:1,fontSize:12},children:p.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:p.algorithmCode||p.algorithm_code})]},p.id)})})]})}function ua({description:t,actionId:s,userId:n,canWrite:a,onSaved:r}){const[i,o]=l.useState(!1),[c,g]=l.useState(t||""),p=l.useCallback(async()=>{await we.updateAction(n,s,{description:c}),r(c),o(!1)},[n,s,c,r]);return e.jsxs("div",{style:{marginBottom:10},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Description"}),i?e.jsxs("div",{style:{display:"flex",gap:6},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11},value:c,onChange:h=>g(h.target.value)}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:p,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{g(t||""),o(!1)},children:"✕"})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{style:{fontSize:11,color:t?"var(--text)":"var(--muted)",fontStyle:t?"normal":"italic"},children:t||"No description"}),a&&e.jsx("button",{className:"btn btn-xs",onClick:()=>o(!0),children:"Edit"})]})]})}function ha({instances:t,onAttach:s}){const[n,a]=l.useState(""),[r,i]=l.useState("HIDE");return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:o=>a(o.target.value),children:[e.jsx("option",{value:"",children:"— attach guard —"}),t.map(o=>e.jsxs("option",{value:o.id,children:[o.algorithmName||o.algorithm_name," — ",o.name||o.id]},o.id))]}),e.jsxs("select",{className:"field-input",style:{fontSize:11,width:90,padding:"3px 4px"},value:r,onChange:o=>i(o.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,r),a(""))},children:[e.jsx(Re,{size:10})," Attach"]})]})}function xa({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState(null),[c,g]=l.useState(""),[p,h]=l.useState("catalog"),[x,k]=l.useState(null),[N,_]=l.useState(null),[z,u]=l.useState(24),v=l.useCallback(()=>{r(null),o(null),Promise.all([we.listAlgorithms(t),we.listAllInstances(t)]).then(([T,G])=>{const J=Array.isArray(T)?T:[],I=Array.isArray(G)?G:[];if(r(J),o(I),!c){const m=[...new Set(J.map(d=>d.serviceCode).filter(Boolean))].sort();m.length>0&&g(m[0])}}).catch(()=>{r([]),o([])})},[t]);l.useEffect(()=>{v()},[v]),l.useEffect(()=>{k(null),_(null)},[c]);const b=l.useCallback(()=>{we.getAlgorithmStats(t,c).then(T=>k(Array.isArray(T)?T:[])).catch(()=>k([]))},[t,c]),y=l.useCallback(T=>{we.getAlgorithmTimeseries(t,T,c).then(G=>_(Array.isArray(G)?G:[])).catch(()=>_([]))},[t,c]);if(a===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const j=[...new Set(a.map(T=>T.serviceCode).filter(Boolean))].sort(),C=T=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:p===T?"var(--accent)":"var(--muted)",borderBottom:p===T?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:c,onChange:T=>g(T.target.value),children:j.map(T=>e.jsx("option",{value:T,children:T},T))})]}),e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[["catalog","Catalog"],["stats","Execution Stats"],["graph","Usage Graph"]].map(([T,G])=>e.jsx("button",{style:C(T),onClick:()=>{h(T),T==="stats"&&!x&&b(),T==="graph"&&!N&&y(z)},children:G},T))}),c&&p==="catalog"&&e.jsx(fa,{userId:t,serviceCode:c,algorithms:a.filter(T=>T.serviceCode===c),instances:i?i.filter(T=>T.serviceCode===c):[],canWrite:s,toast:n,onReload:v}),p==="stats"&&c&&e.jsx(ba,{userId:t,serviceCode:c,canWrite:s,toast:n,stats:x,onLoad:b,onReset:async()=>{await we.resetAlgorithmStats(t,c).catch(()=>{}),k([]),n("Stats reset","success")}}),p==="graph"&&c&&e.jsx(va,{timeseries:N,tsHours:z,onLoad:T=>{u(T),y(T)}})]})}function fa({userId:t,serviceCode:s,algorithms:n,instances:a,canWrite:r,toast:i,onReload:o}){const[c,g]=l.useState(null),[p,h]=l.useState(""),[x,k]=l.useState({});l.useEffect(()=>{g(null),h(""),k({})},[s]);async function N(u){const v=p.trim();if(!v){i("Instance name is required","error");return}try{await we.createInstance(t,u,v,s),h(""),o(),i("Instance created","success")}catch(b){i(String(b),"error")}}if(n.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No algorithms registered for ",e.jsx("strong",{children:s}),"."]});const _={};n.forEach(u=>{const v=u.typeName||u.type_name||"Unknown",b=u.moduleName||u.module_name||"unknown";_[v]||(_[v]={}),_[v][b]||(_[v][b]=[]),_[v][b].push(u)});const z={};return(a||[]).forEach(u=>{const v=u.algorithmId||u.algorithm_id;z[v]||(z[v]=[]),z[v].push(u)}),e.jsx("div",{className:"settings-list",children:Object.entries(_).sort(([u],[v])=>u.localeCompare(v)).map(([u,v])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx("span",{style:{fontSize:12,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".04em"},children:u}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".06em"},children:"type"})]}),Object.entries(v).sort(([b],[y])=>b.localeCompare(y)).map(([b,y])=>e.jsxs("div",{style:{marginBottom:14,marginLeft:4},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6},children:[e.jsx(xn,{module:b}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",y.length,")"]})]}),y.map(j=>{const C=j.id,T=c===C,G=z[C]||[],J=j.code,I=j.name||J;return e.jsxs("div",{className:"settings-card",style:{marginBottom:4},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>{const m=T?null:C;g(m),h(""),m&&!x[m]&&we.listAlgorithmParameters(t,m).then(d=>k($=>({...$,[m]:Array.isArray(d)?d:[]}))).catch(()=>k(d=>({...d,[m]:[]})))},style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:T?e.jsx(Me,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx($e,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(an,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:I}),e.jsx("span",{className:"settings-card-id",children:J}),e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:j.description||""}),e.jsxs("span",{className:"settings-badge",style:{marginLeft:8},children:[G.length," instance",G.length!==1?"s":""]})]}),T&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsxs("div",{style:{display:"flex",gap:16,fontSize:11,color:"var(--muted)",marginBottom:10},children:[e.jsxs("span",{children:["Handler: ",e.jsx("code",{style:{color:"var(--text)"},children:j.handlerRef||j.handler_ref||"—"})]}),e.jsxs("span",{children:["Type: ",e.jsx("code",{style:{color:"var(--text)"},children:u})]})]}),(()=>{const m=x[C];return!m||m.length===0?null:e.jsxs("div",{style:{marginBottom:12},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Parameter Schema"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsx("tr",{style:{borderBottom:"1px solid var(--border)"},children:["Name","Label","Type","Req.","Default"].map(d=>e.jsx("th",{style:{textAlign:d==="Req."?"center":"left",padding:"3px 6px",color:"var(--muted)",fontWeight:600,fontSize:10},children:d},d))})}),e.jsx("tbody",{children:m.map(d=>{const $=d.paramName||d.param_name,M=d.paramLabel||d.param_label||$,U=d.dataType||d.data_type||"STRING",f=d.required===1||d.required===!0,D=d.defaultValue||d.default_value||"";return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--accent)"},children:$}),e.jsx("td",{style:{padding:"3px 6px"},children:M}),e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--muted)",fontSize:10},children:U}),e.jsx("td",{style:{padding:"3px 6px",textAlign:"center"},children:f?"✓":""}),e.jsx("td",{style:{padding:"3px 6px",color:D?"var(--text)":"var(--muted)",fontFamily:"var(--mono)",fontSize:10},children:D||"—"})]},d.id||$)})})]})]})})(),e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Instances"}),G.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"No instances"}),G.map(m=>e.jsx(ga,{inst:m,algo:j,userId:t,canWrite:r,toast:i,onReload:o},m.id)),r&&e.jsxs("div",{style:{display:"flex",gap:6,marginTop:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11,padding:"3px 6px"},placeholder:"New instance name…",value:p,onChange:m=>h(m.target.value),onKeyDown:m=>{m.key==="Enter"&&N(C)}}),e.jsxs("button",{className:"btn btn-sm",style:{fontSize:10},disabled:!p.trim(),onClick:()=>N(C),children:[e.jsx(Re,{size:10,strokeWidth:2.5})," Create"]})]})]})]},C)})]},b))]},u))})}function ga({inst:t,algo:s,userId:n,canWrite:a,toast:r,onReload:i}){var y;const[o,c]=l.useState(!1),[g,p]=l.useState(null),[h,x]=l.useState(!1),[k,N]=l.useState(t.name||"");async function _(){if(g===null)try{const j=await we.getInstanceParams(n,t.id);p(Array.isArray(j)?j:[])}catch{p([])}}function z(){o||_(),c(j=>!j)}async function u(){if(!k.trim()||k.trim()===t.name){x(!1);return}try{await we.updateInstance(n,t.id,k.trim()),r("Instance renamed","success"),i()}catch(j){r(String(j),"error")}x(!1)}async function v(){try{await we.deleteInstance(n,t.id),r("Instance deleted","success"),i()}catch(j){r(String(j),"error")}}async function b(j,C){try{await we.setInstanceParam(n,t.id,j,C);const T=await we.getInstanceParams(n,t.id);p(Array.isArray(T)?T:[])}catch(T){r(String(T),"error")}}return e.jsxs("div",{className:"settings-card",style:{marginBottom:2},children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",cursor:"pointer"},onClick:z,children:[e.jsx("span",{className:"settings-card-chevron",children:o?e.jsx(Me,{size:11,strokeWidth:2,color:"var(--muted)"}):e.jsx($e,{size:11,strokeWidth:2,color:"var(--muted)"})}),h?e.jsx("input",{className:"field-input",style:{fontSize:12,padding:"1px 4px",flex:1},autoFocus:!0,value:k,onChange:j=>N(j.target.value),onBlur:u,onKeyDown:j=>{j.key==="Enter"&&u(),j.key==="Escape"&&(x(!1),N(t.name))},onClick:j=>j.stopPropagation()}):e.jsx("span",{className:"settings-card-name",style:{fontSize:12,flex:1},children:t.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:(y=t.id)==null?void 0:y.slice(-8)}),a&&e.jsxs("span",{style:{display:"flex",gap:4,marginLeft:8},onClick:j=>j.stopPropagation(),children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>{x(!0),N(t.name)},children:e.jsx(it,{size:10})}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:v,children:e.jsx(ut,{size:10})})]})]}),o&&e.jsxs("div",{className:"settings-card-body",style:{padding:"6px 12px 8px 26px"},children:[g===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading params…"}),g!==null&&g.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No parameters"}),g!==null&&g.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Parameter"}),e.jsx("th",{children:"Value"})]})}),e.jsx("tbody",{children:g.map(j=>e.jsxs("tr",{children:[e.jsxs("td",{style:{fontSize:11},children:[j.paramLabel||j.param_label||j.paramName||j.param_name,(j.dataType||j.data_type)&&e.jsx("span",{style:{color:"var(--muted2)",fontSize:9,marginLeft:4},children:j.dataType||j.data_type})]}),e.jsx("td",{children:a?e.jsx(ya,{param:j,onSave:C=>b(j.algorithmParameterId||j.algorithm_parameter_id||j.id,C)}):e.jsx("span",{style:{fontSize:11,fontFamily:"var(--mono)"},children:j.value||e.jsx("em",{style:{color:"var(--muted)"},children:"—"})})})]},j.id))})]})]})]})}function ba({stats:t,onLoad:s,onReset:n}){return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:s,children:"Refresh"}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:n,children:"Reset"})]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading stats…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No algorithm executions recorded yet"}),t&&t.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Algorithm"}),e.jsx("th",{style:{textAlign:"right"},children:"Calls"}),e.jsx("th",{style:{textAlign:"right"},children:"Min (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Avg (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Max (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Total (ms)"}),e.jsx("th",{children:"Last Update"})]})}),e.jsx("tbody",{children:t.map(a=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:a.algorithmCode})}),e.jsx("td",{style:{textAlign:"right"},children:a.callCount}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.minMs=="number"?a.minMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.avgMs=="number"?a.avgMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.maxMs=="number"?a.maxMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.totalMs=="number"?a.totalMs.toFixed(1):"—"}),e.jsx("td",{style:{fontSize:10,color:"var(--muted)"},children:a.lastFlushed||"—"})]},a.algorithmCode))})]})]})}function va({timeseries:t,tsHours:s,onLoad:n}){const i={t:20,r:20,b:40,l:50},o=800-i.l-i.r,c=200-i.t-i.b;function g(x,k,N){if(x.length===0)return e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No data"});const _=Math.max(...x.map(z=>z.calls),1);return e.jsxs("svg",{viewBox:"0 0 800 200",style:{width:"100%",height:200,display:"block"},children:[[0,.25,.5,.75,1].map(z=>{const u=i.t+c*(1-z);return e.jsxs("g",{children:[e.jsx("line",{x1:i.l,x2:800-i.r,y1:u,y2:u,stroke:"var(--border)",strokeWidth:.5}),e.jsx("text",{x:i.l-4,y:u+3,textAnchor:"end",fill:"var(--muted)",fontSize:9,children:Math.round(_*z)})]},z)}),x.map((z,u)=>{const v=Math.max(o/x.length-1,2),b=i.l+u/x.length*o,y=z.calls/_*c,j=i.t+c-y,C=x.length<20||u%Math.ceil(x.length/12)===0,T=z.windowStart.replace("T"," ").slice(11,16);return e.jsxs("g",{children:[e.jsx("rect",{x:b,y:j,width:v,height:y,fill:N,opacity:.8,rx:1,children:e.jsxs("title",{children:[z.windowStart.replace("T"," ").slice(0,16)," — ",z.calls," calls, ",z.totalMs.toFixed(1),"ms"]})}),C&&e.jsx("text",{x:b+v/2,y:200-i.b+14,textAnchor:"middle",fill:"var(--muted)",fontSize:8,transform:`rotate(-45, ${b+v/2}, ${200-i.b+14})`,children:T})]},u)}),e.jsx("text",{x:12,y:i.t+c/2,textAnchor:"middle",fill:"var(--muted)",fontSize:9,transform:`rotate(-90, 12, ${i.t+c/2})`,children:"Calls"}),e.jsx("text",{x:i.l,y:12,fill:"var(--text)",fontSize:11,fontWeight:600,children:k})]})}const p={};(t||[]).forEach(x=>{p[x.windowStart]||(p[x.windowStart]={calls:0,totalMs:0}),p[x.windowStart].calls+=x.callCount||0,p[x.windowStart].totalMs+=x.totalMs||0});const h=Object.keys(p).sort().map(x=>({windowStart:x,...p[x]}));return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12,alignItems:"center"},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>n(s),children:"Refresh"}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)"},children:"Window:"}),[6,12,24,48].map(x=>e.jsxs("button",{className:"btn btn-xs",onClick:()=>n(x),style:{background:s===x?"var(--accent)":void 0,color:s===x?"#fff":void 0},children:[x,"h"]},x))]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No windowed data yet. Stats are bucketed every 15 seconds on flush."}),t&&t.length>0&&e.jsx("div",{style:{background:"var(--bg2)",borderRadius:6,padding:12},children:g(h,"All Algorithms (aggregate)","#3b82f6")})]})}function ya({param:t,onSave:s}){const[n,a]=l.useState(t.value||""),[r,i]=l.useState(!1);function o(c){a(c),i(c!==(t.value||""))}return e.jsxs("div",{style:{display:"flex",gap:4,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{fontSize:11,padding:"1px 4px",flex:1},value:n,onChange:c=>o(c.target.value),onBlur:()=>{r&&(s(n),i(!1))}}),r&&e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>{s(n),i(!1)},children:"Save"})]})}function ja(t){if(!t)return{fg:"var(--muted2)",bg:"rgba(120,130,150,.14)"};let s=0;for(let a=0;a<t.length;a++)s=s*31+t.charCodeAt(a)&16777215;const n=s%360;return{fg:`hsl(${n},70%,72%)`,bg:`hsl(${n},55%,22%)`}}function xn({module:t}){if(!t)return null;const s=ja(t);return e.jsx("span",{title:`Spring Modulith module: ${t}`,style:{display:"inline-block",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700,letterSpacing:".06em",fontFamily:"var(--mono)",textTransform:"uppercase",background:s.bg,color:s.fg,border:`1px solid ${s.fg}33`,verticalAlign:"middle"},children:t})}function wa({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState(!1),[c,g]=l.useState({displayName:"",email:""}),[p,h]=l.useState(!1);l.useEffect(()=>{X.getUser(t,t).then(r).catch(()=>{})},[t]);function x(){g({displayName:(a==null?void 0:a.displayName)||"",email:(a==null?void 0:a.email)||""}),o(!0)}async function k(){h(!0);try{await X.updateUser(t,t,c.displayName.trim(),c.email.trim());const N=await X.getUser(t,t);r(N),o(!1),n("Profile updated","success")}catch{n("Failed to update profile","error")}finally{h(!1)}}return a?e.jsxs("div",{className:"settings-list",children:[e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx(Ht,{size:15,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{fontSize:13},children:a.username}),a.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",children:"Admin"})]}),i?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(Ae,{label:"Display Name",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.displayName,onChange:N=>g(_=>({..._,displayName:N.target.value}))})}),e.jsx(Ae,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:c.email,onChange:N=>g(_=>({..._,email:N.target.value}))})}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:4},children:[e.jsx("button",{className:"btn btn-primary",onClick:k,disabled:p,children:p?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>o(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,paddingLeft:23},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:a.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:a.email||"—"})]}),s&&e.jsx("div",{style:{marginTop:4},children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:x,children:[e.jsx(it,{size:11,strokeWidth:2}),"Edit"]})})]})]}),e.jsx(ka,{})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}const Sa=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function ka(){const[t,s]=l.useState(Ut);function n(a){s(a),pn(a)}return e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:10},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:Sa.map(a=>e.jsxs("button",{type:"button",className:`theme-option${t===a.value?" theme-option--active":""}`,onClick:()=>n(a.value),children:[e.jsx("span",{className:"theme-option-icon",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))})]})}function qt({title:t,onClose:s,onSave:n,saving:a,saveLabel:r="Save",children:i,width:o=480}){return e.jsx("div",{className:"diff-overlay",style:{zIndex:600},onClick:c=>{c.target===c.currentTarget&&s()},children:e.jsxs("div",{className:"diff-modal",style:{width:o,maxHeight:"85vh",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"diff-header",children:[e.jsx("span",{className:"diff-title",children:t}),e.jsx("button",{className:"diff-close",onClick:s,children:"×"})]}),e.jsx("div",{style:{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12},children:i}),e.jsxs("div",{style:{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0},children:[e.jsx("button",{className:"btn",onClick:s,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:n,disabled:a,children:a?"Saving…":r})]})]})})}function Ae({label:t,children:s}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx("label",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:t}),s]})}function Na({userId:t,roleId:s,canWrite:n,toast:a,nodePerms:r,lcPerms:i,nodeTypes:o,transitions:c}){const[g,p]=l.useState(null);l.useEffect(()=>{p(null),X.getRolePolicies(t,s).then(u=>{const v=new Set;(Array.isArray(u)?u:[]).forEach(b=>{const y=b.permissionCode||b.permission_code,j=b.nodeTypeId||b.node_type_id||"",C=b.transitionId||b.transition_id||"";v.add(`${y}|${j}|${C}`)}),p(v)}).catch(()=>p(new Set))},[t,s]);const h=(u,v,b)=>`${u}|${v||""}|${b||""}`;async function x(u,v,b){if(!n||!g)return;const y=h(u,v,b),j=g.has(y);p(C=>{const T=new Set(C);return j?T.delete(y):T.add(y),T});try{j?await X.removePermissionGrant(t,v,u,s,b||null):await X.addPermissionGrant(t,v,u,s,b||null)}catch(C){p(T=>{const G=new Set(T);return j?G.add(y):G.delete(y),G}),a(C,"error")}}if(!g)return e.jsx("div",{style:{padding:"4px 0",color:"var(--muted)",fontSize:11},children:"Loading policies…"});if(o.length===0)return e.jsx("div",{className:"settings-empty-row",children:"No node types defined."});const k={padding:"4px 8px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)",background:"var(--bg2, var(--bg))",whiteSpace:"nowrap",verticalAlign:"bottom"},N={padding:"3px 6px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)"};function _({permCode:u,ntId:v,transId:b}){const y=g.has(h(u,v,b));return e.jsx("td",{style:N,children:e.jsx("button",{className:"panel-icon-btn",disabled:!n,title:n?y?"Revoke":"Grant":"Requires MANAGE_ROLES",onClick:()=>x(u,v,b),style:{margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",width:22,height:22,cursor:n?"pointer":"default"},children:y?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})})})}function z({ntId:u,ntName:v}){return e.jsxs("td",{style:{...N,textAlign:"left",position:"sticky",left:0,background:"var(--bg)",zIndex:1,minWidth:120},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"var(--text)"},children:v}),e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--muted)"},children:u})]})}return e.jsxs("div",{children:[r.length>0&&e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Node Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...k,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),r.map(u=>e.jsxs("th",{style:{...k,minWidth:72},children:[e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--accent)",marginBottom:1},children:u.permissionCode}),e.jsx("div",{style:{fontSize:9,color:"var(--muted)",fontWeight:400},children:u.displayName})]},u.permissionCode))]})}),e.jsx("tbody",{children:o.map(u=>{const v=u.id||u.ID,b=u.name||u.NAME||v;return e.jsxs("tr",{children:[e.jsx(z,{ntId:v,ntName:b}),r.map(y=>e.jsx(_,{permCode:y.permissionCode,ntId:v,transId:null},y.permissionCode))]},v)})})]})})]}),i.length>0&&c.length>0&&e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Lifecycle Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type + transition check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...k,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),c.map(u=>e.jsx("th",{style:{...k,minWidth:100},children:e.jsx("div",{style:{fontSize:9,color:"var(--text)",fontWeight:500},children:u.label})},u.id))]})}),e.jsx("tbody",{children:o.filter(u=>u.lifecycle_id||u.lifecycleId).map(u=>{const v=u.id||u.ID,b=u.name||u.NAME||v,y=u.lifecycle_id||u.lifecycleId;return e.jsxs("tr",{children:[e.jsx(z,{ntId:v,ntName:b}),c.map(j=>j.lifecycleId!==y?e.jsx("td",{style:N,children:e.jsx("span",{style:{color:"var(--border)",fontSize:11},children:"—"})},j.id):e.jsx(_,{permCode:i[0].permissionCode,ntId:v,transId:j.id},j.id))]},v)})})]})})]}),r.length===0&&i.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No permissions configured."})]})}function Ca({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState([]),[i,o]=l.useState(!0),[c,g]=l.useState(!1),[p,h]=l.useState({name:"",description:""}),[x,k]=l.useState(!1),[N,_]=l.useState(null),[z,u]=l.useState({}),[v,b]=l.useState({}),[y,j]=l.useState(!1);function C(){return X.listProjectSpaces(t).then(m=>r(Array.isArray(m)?m:[]))}l.useEffect(()=>{C().finally(()=>o(!1))},[t]),l.useEffect(()=>{nt.getRegistryTags().then(u).catch(()=>{})},[]);async function T(){if(p.name.trim()){k(!0);try{await X.createProjectSpace(t,p.name.trim(),p.description.trim()||null),await C(),g(!1),h({name:"",description:""})}catch(m){n(m,"error")}finally{k(!1)}}}async function G(m){if(N===m){_(null);return}_(m);try{const d=await X.getProjectSpaceServiceTags(t,m);b(d||{})}catch{b({})}}async function J(m){const d=m.id||m.ID,$=m.isolated===!0;try{await X.setProjectSpaceIsolated(t,d,!$),await C(),n($?"Isolation disabled":"Isolation enabled")}catch(M){n(M,"error")}}async function I(m,d,$){j(!0);try{await X.setProjectSpaceServiceTags(t,m,d,$);const M=await X.getProjectSpaceServiceTags(t,m);b(M||{}),n("Tags updated")}catch(M){n(M,"error")}finally{j(!1)}}return i?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-list",children:[c&&e.jsxs(qt,{title:"New Project Space",onClose:()=>{g(!1),h({name:"",description:""})},onSave:T,saving:x,saveLabel:"Create",children:[e.jsx(Ae,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:p.name,onChange:m=>h(d=>({...d,name:m.target.value})),placeholder:"e.g. Prototype-2026"})}),e.jsx(Ae,{label:"Description",children:e.jsx("input",{className:"field-input",value:p.description,onChange:m=>h(d=>({...d,description:m.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{h({name:"",description:""}),g(!0)},children:[e.jsx(Re,{size:11,strokeWidth:2.5}),"New space"]})}),a.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No project spaces yet."}),a.map(m=>{const d=m.id||m.ID,$=m.name||m.NAME||d,M=m.description||m.DESCRIPTION||"",U=m.active!==!1&&m.ACTIVE!==!1,f=m.isolated===!0,D=m.parentId||m.PARENT_ID||null,E=N===d;return e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer"},onClick:()=>G(d),children:[E?e.jsx(Me,{size:12}):e.jsx($e,{size:12}),e.jsx(Et,{size:13,color:U?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:$}),e.jsx("span",{className:"settings-card-id",children:d}),D&&e.jsx("span",{className:"settings-badge",title:`Child of ${D}`,children:"child"}),f&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Isolated"}),!U&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"})]}),M&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:19},children:M}),E&&e.jsxs("div",{style:{marginTop:10,paddingLeft:19,borderTop:"1px solid var(--border)",paddingTop:10},children:[s&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10},children:[e.jsxs("label",{style:{fontSize:11,display:"flex",alignItems:"center",gap:6,cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:f,onChange:()=>J(m)}),e.jsx("span",{children:"Isolated"})]}),e.jsx("span",{className:"muted",style:{fontSize:10},children:"Exclusive tag ownership, no untagged routing"})]}),e.jsx("div",{style:{fontSize:11,fontWeight:600,marginBottom:6},children:"Service Tags"}),Object.keys(z).length===0?e.jsx("div",{className:"muted",style:{fontSize:11},children:"No services registered with tags."}):e.jsxs("table",{className:"status-table",style:{fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service"}),e.jsx("th",{children:"Available Tags"}),e.jsx("th",{children:"Assigned"}),s&&e.jsx("th",{})]})}),e.jsx("tbody",{children:Object.entries(z).map(([L,S])=>{const w=v[L]||[];return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:L})}),e.jsx("td",{children:S.length===0?e.jsx("span",{className:"muted",children:"none"}):S.map(R=>e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",margin:"1px 2px",borderRadius:3,fontSize:10,background:w.includes(R)?"var(--accent-bg)":"var(--bg2)",color:w.includes(R)?"var(--accent)":"var(--muted)",border:`1px solid ${w.includes(R)?"var(--accent)":"var(--border)"}`,cursor:s?"pointer":"default"},onClick:s?()=>{const W=w.includes(R)?w.filter(F=>F!==R):[...w,R];I(d,L,W)}:void 0,title:s?w.includes(R)?"Click to remove":"Click to assign":"",children:R},R))}),e.jsx("td",{children:w.length===0?e.jsx("span",{className:"muted",children:"—"}):w.join(", ")}),s&&e.jsx("td",{children:w.length>0&&e.jsx("button",{className:"btn btn-sm btn-ghost",style:{fontSize:10,padding:"1px 6px"},onClick:()=>I(d,L,[]),disabled:y,children:"clear"})})]},L)})})]})]})]},d)})]})}function Ea({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState(null),[c,g]=l.useState({}),[p,h]=l.useState(!1),[x,k]=l.useState(null),N=l.useCallback(()=>X.getRoles(t).then(u=>r(Array.isArray(u)?u:[])),[t]);l.useEffect(()=>{N()},[N]);async function _(){var u,v,b;if((u=c.name)!=null&&u.trim()){h(!0);try{i==="create"?await X.createRole(t,c.name.trim(),((v=c.description)==null?void 0:v.trim())||null):await X.updateRole(t,i.role.id,c.name.trim(),((b=c.description)==null?void 0:b.trim())||null),await N(),o(null)}catch(y){n(y,"error")}finally{h(!1)}}}async function z(u){if(window.confirm(`Delete role "${u.name}"?
All user assignments for this role will also be removed.`)){k(u.id);try{await X.deleteRole(t,u.id),await N()}catch(v){n(v,"error")}finally{k(null)}}}return a?e.jsxs("div",{className:"settings-list",children:[i&&e.jsxs(qt,{title:i==="create"?"New Role":`Edit — ${i.role.name}`,onClose:()=>o(null),onSave:_,saving:p,saveLabel:i==="create"?"Create":"Save",children:[e.jsx(Ae,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.name||"",onChange:u=>g(v=>({...v,name:u.target.value})),placeholder:"e.g. APPROVER"})}),e.jsx(Ae,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,style:{resize:"vertical"},value:c.description||"",onChange:u=>g(v=>({...v,description:u.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{g({name:"",description:""}),o("create")},children:[e.jsx(Re,{size:11,strokeWidth:2.5})," New role"]})}),a.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No roles yet."}),a.map(u=>e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx(at,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,fontSize:13,flex:1},children:u.name}),e.jsx("span",{className:"settings-card-id",children:u.id}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Edit role",onClick:()=>{g({name:u.name,description:u.description||""}),o({role:u})},children:e.jsx(it,{size:11,strokeWidth:2,color:"var(--accent)"})}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Delete role",disabled:x===u.id,onClick:()=>z(u),children:e.jsx(ut,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),u.description&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:21},children:u.description})]},u.id))]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function Ta({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState([]),[c,g]=l.useState([]),[p,h]=l.useState(null),[x,k]=l.useState({}),[N,_]=l.useState(!1),[z,u]=l.useState({username:"",displayName:"",email:""}),[v,b]=l.useState(!1),[y,j]=l.useState({}),[C,T]=l.useState(null),[G,J]=l.useState(null),[I,m]=l.useState(null),d=l.useCallback(()=>X.listUsers(t).then(S=>r(Array.isArray(S)?S:[])),[t]),$=l.useCallback(async S=>{const w=await X.getUserRoles(t,S).catch(()=>[]);k(R=>({...R,[S]:Array.isArray(w)?w:[]}))},[t]);l.useEffect(()=>{d(),X.getRoles(t).then(S=>o(Array.isArray(S)?S:[])),X.listProjectSpaces(t).then(S=>g(Array.isArray(S)?S:[]))},[t]);async function M(S){const w=S.id;if(p===w){h(null);return}h(w),await $(w),j(R=>{var W,F,P;return{...R,[w]:R[w]||{roleId:((W=i[0])==null?void 0:W.id)||"",spaceId:((F=c[0])==null?void 0:F.id)||((P=c[0])==null?void 0:P.ID)||""}}})}async function U(){if(z.username.trim()){b(!0);try{await X.createUser(t,z.username.trim(),z.displayName.trim()||null,z.email.trim()||null),await d(),_(!1),u({username:"",displayName:"",email:""})}catch(S){n(S,"error")}finally{b(!1)}}}async function f(S){if(window.confirm(`Deactivate user "${S.username}"?`))try{await X.deactivateUser(t,S.id),await d()}catch(w){n(w,"error")}}async function D(S){const{roleId:w,spaceId:R}=y[S]||{};if(!(!w||!R)){T(S);try{await X.assignRole(t,S,w,R),await $(S)}catch(W){n(W,"error")}finally{T(null)}}}async function E(S,w,R){const W=`${S}:${w}:${R}`;J(W);try{await X.removeRole(t,S,w,R),await $(S)}catch(F){n(F,"error")}finally{J(null)}}async function L(S,w){m(S.id);try{await X.setUserAdmin(t,S.id,w),await d()}catch(R){n(R,"error")}finally{m(null)}}return a?e.jsxs("div",{className:"settings-list",children:[N&&e.jsxs(qt,{title:"New User",onClose:()=>{_(!1),u({username:"",displayName:"",email:""})},onSave:U,saving:v,saveLabel:"Create",children:[e.jsx(Ae,{label:"Username *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:z.username,onChange:S=>u(w=>({...w,username:S.target.value})),placeholder:"e.g. john.doe"})}),e.jsx(Ae,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:z.displayName,onChange:S=>u(w=>({...w,displayName:S.target.value})),placeholder:"e.g. John Doe"})}),e.jsx(Ae,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:z.email,onChange:S=>u(w=>({...w,email:S.target.value})),placeholder:"e.g. john@company.com"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{u({username:"",displayName:"",email:""}),_(!0)},children:[e.jsx(Re,{size:11,strokeWidth:2.5})," New user"]})}),a.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No users found."}),a.map(S=>{var P,H;const w=S.id,R=p===w,W=x[w]||[],F=S.active!==!1;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center"},onClick:()=>M(S),children:[e.jsx("span",{className:"settings-card-chevron",children:R?e.jsx(Me,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx($e,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(Ht,{size:13,color:F?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:S.username}),S.displayName&&e.jsx("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:6},children:S.displayName}),e.jsx("span",{className:"settings-card-id",children:w}),S.email&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:S.email}),!F&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"}),S.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--warn",title:"Administrator",children:"Admin"}),s&&e.jsxs("select",{className:"field-input",style:{height:22,fontSize:10,padding:"0 4px",width:"auto",marginLeft:6,flexShrink:0},value:S.isAdmin?"admin":"user",disabled:I===w,onClick:B=>B.stopPropagation(),onChange:B=>{B.stopPropagation(),L(S,B.target.value==="admin")},title:"Admin status",children:[e.jsx("option",{value:"user",children:"User"}),e.jsx("option",{value:"admin",children:"Admin"})]}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Deactivate user",style:{marginLeft:4},onClick:B=>{B.stopPropagation(),f(S)},children:e.jsx(ut,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),R&&e.jsxs("div",{className:"settings-card-body",style:{paddingTop:10},children:[e.jsx("span",{className:"settings-sub-label",style:{display:"block",margin:"0 0 8px"},children:"Role Assignments"}),W.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No role assignments yet."}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},children:W.map(B=>{const O=`${w}:${B.id}:${B.projectSpaceId}`;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,padding:"3px 0"},children:[e.jsx(at,{size:11,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,minWidth:80},children:B.name}),e.jsx("span",{style:{color:"var(--muted)",fontSize:11},children:"in"}),e.jsx(Et,{size:10,color:"var(--muted)",strokeWidth:1.5}),e.jsx("span",{style:{color:"var(--fg)",fontSize:11},children:B.projectSpaceName}),e.jsx("button",{className:"panel-icon-btn",title:"Remove assignment",disabled:G===O,onClick:()=>E(w,B.id,B.projectSpaceId),children:e.jsx(kt,{size:10,strokeWidth:2.5,color:"var(--danger, #f87171)"})})]},O)})}),s&&i.length>0&&c.length>0&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,paddingTop:6,borderTop:"1px solid var(--border)"},children:[e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((P=y[w])==null?void 0:P.roleId)||"",onChange:B=>j(O=>({...O,[w]:{...O[w]||{},roleId:B.target.value}})),children:i.map(B=>e.jsx("option",{value:B.id,children:B.name},B.id))}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",flexShrink:0},children:"in"}),e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((H=y[w])==null?void 0:H.spaceId)||"",onChange:B=>j(O=>({...O,[w]:{...O[w]||{},spaceId:B.target.value}})),children:c.map(B=>e.jsx("option",{value:B.id||B.ID,children:B.name||B.NAME},B.id||B.ID))}),e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:4,flexShrink:0},disabled:C===w,onClick:()=>D(w),children:[e.jsx(Re,{size:10,strokeWidth:2.5})," Assign"]})]})]})]},w)})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function za({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState("roles");return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid var(--border)"},children:[["roles","Roles"],["users","Users"]].map(([i,o])=>e.jsx("button",{onClick:()=>r(i),style:{background:"none",border:"none",cursor:"pointer",padding:"6px 16px",fontSize:12,fontWeight:600,color:a===i?"var(--accent)":"var(--muted)",borderBottom:a===i?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,letterSpacing:".02em"},children:o},i))}),a==="roles"?e.jsx(Ea,{userId:t,canWrite:s,toast:n}):e.jsx(Ta,{userId:t,canWrite:s,toast:n})]})}function Aa({permissions:t,userId:s,canWrite:n,toast:a,onReload:r}){const[i,o]=l.useState(!1),[c,g]=l.useState(null),[p,h]=l.useState(!1),[x,k]=l.useState({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0});function N(){k({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0}),g("create")}function _(y){k({code:y.permissionCode,scope:y.scope,displayName:y.displayName,description:y.description||"",displayOrder:0}),g(y.permissionCode)}async function z(){h(!0);try{if(c==="create"){if(!x.code.trim()||!x.displayName.trim()){a("Code and label required","error"),h(!1);return}await X.createPermission(s,x.code.trim().toUpperCase(),x.scope,x.displayName.trim(),x.description.trim()||null,x.displayOrder),a("Permission created")}else await X.updatePermission(s,c,x.displayName.trim(),x.description.trim()||null,x.displayOrder),a("Permission updated");g(null),r()}catch(y){a(y,"error")}h(!1)}const u=["GLOBAL","NODE","LIFECYCLE"],v={};t.forEach(y=>{y.scope&&(v[y.scope]||(v[y.scope]=[]),v[y.scope].push(y))});const b=[...u.filter(y=>v[y]),...Object.keys(v).filter(y=>!u.includes(y)).sort()];return e.jsxs("div",{style:{marginBottom:16},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:4},onClick:()=>o(!i),children:[i?e.jsx(Me,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx($e,{size:13,strokeWidth:2,color:"var(--muted)"}),e.jsx(at,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontSize:13,fontWeight:700},children:"Permission Catalog"}),e.jsxs("span",{style:{fontSize:11,color:"var(--muted)"},children:["(",t.length,")"]}),n&&i&&e.jsxs("button",{className:"btn btn-sm",style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:4},onClick:y=>{y.stopPropagation(),N()},children:[e.jsx(Re,{size:11})," Add"]})]}),i&&e.jsx("div",{style:{border:"1px solid var(--border)",borderRadius:6,overflow:"hidden",marginBottom:8},children:b.map(y=>{const j=v[y]||[];return j.length===0?null:e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--muted)",padding:"6px 10px",background:"var(--subtle-bg)",borderBottom:"1px solid var(--border)"},children:[y," scope"]}),j.map(C=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderBottom:"1px solid var(--border)",fontSize:12},children:[e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:180,fontWeight:500},children:C.permissionCode}),e.jsx("span",{style:{flex:1,color:"var(--text)"},children:C.displayName}),C.description&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:C.description}),n&&e.jsx("button",{className:"panel-icon-btn",title:"Edit",onClick:()=>_(C),style:{flexShrink:0,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(it,{size:12})})]},C.permissionCode))]},y)})}),c&&e.jsxs(qt,{title:c==="create"?"New Permission":`Edit ${c}`,onClose:()=>g(null),onSave:z,saving:p,saveLabel:c==="create"?"Create":"Save",children:[c==="create"&&e.jsxs(e.Fragment,{children:[e.jsx(Ae,{label:"Permission Code",children:e.jsx("input",{className:"field-input",value:x.code,onChange:y=>k(j=>({...j,code:y.target.value})),placeholder:"e.g. MANAGE_EXPORTS",style:{textTransform:"uppercase",fontFamily:"monospace"}})}),e.jsx(Ae,{label:"Scope",children:e.jsx("select",{className:"field-input",value:x.scope,onChange:y=>k(j=>({...j,scope:y.target.value})),children:[...u,...Object.keys(v).filter(y=>!u.includes(y)).sort()].filter((y,j,C)=>C.indexOf(y)===j).map(y=>e.jsx("option",{value:y,children:y},y))})})]}),e.jsx(Ae,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:x.displayName,onChange:y=>k(j=>({...j,displayName:y.target.value})),placeholder:"e.g. Manage Exports"})}),e.jsx(Ae,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,value:x.description,onChange:y=>k(j=>({...j,description:y.target.value})),placeholder:"Optional description"})})]})]})}function Ia({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState([]),[c,g]=l.useState([]),[p,h]=l.useState([]),[x,k]=l.useState(null),[N,_]=l.useState({}),[z,u]=l.useState({});l.useEffect(()=>{Promise.all([X.getRoles(t),X.listPermissions(t),X.getNodeTypes(t),X.getLifecycles(t)]).then(async([d,$,M,U])=>{r(Array.isArray(d)?d:[]);const f=(Array.isArray($)?$:[]).map(L=>({...L,permissionCode:L.permissionCode||L.permission_code,displayName:L.displayName||L.display_name,displayOrder:L.displayOrder??L.display_order}));o(f),g(Array.isArray(M)?M:[]);const D=Array.isArray(U)?U:[],E=[];await Promise.all(D.map(async L=>{const S=L.id||L.ID,w=await X.getLifecycleTransitions(t,S).catch(()=>[]);(Array.isArray(w)?w:[]).forEach(R=>{const W=R.from_state_name||R.fromStateName||"",F=R.name||R.NAME||R.id;E.push({id:R.id||R.ID,label:W?`${W} → ${F}`:F,lifecycleId:S})})})),h(E)}).catch(()=>{r([])})},[t]);async function v(){const d=await X.listPermissions(t).catch(()=>[]),$=(Array.isArray(d)?d:[]).map(M=>({...M,permissionCode:M.permissionCode||M.permission_code,displayName:M.displayName||M.display_name,displayOrder:M.displayOrder??M.display_order}));o($)}const b=i.filter(d=>d.scope==="GLOBAL"),y=i.filter(d=>d.scope==="NODE"),j=i.filter(d=>d.scope==="LIFECYCLE"),C=new Set(["GLOBAL","NODE","LIFECYCLE"]),T=[...new Set(i.map(d=>d.scope).filter(d=>d&&!C.has(d)))],G=d=>i.filter($=>$.scope===d);async function J(d){if(x===d){k(null);return}if(k(d),N[d]===void 0){const $=await X.getRoleGlobalPermissions(t,d).catch(()=>[]),M=new Set((Array.isArray($)?$:[]).map(U=>U.permissionCode||U.permission_code));_(U=>({...U,[d]:M}))}if(T.length>0&&!z[d]){const $=await Promise.all(T.map(async M=>{const U=await X.getRoleScopePermissions(t,d,M).catch(()=>[]),f=new Set((Array.isArray(U)?U:[]).map(D=>D.permissionCode||D.permission_code));return[M,f]}));u(M=>({...M,[d]:Object.fromEntries($)}))}}async function I(d,$){if(!s)return;const M=(N[d]||new Set).has($);_(U=>{const f=new Set(U[d]||[]);return M?f.delete($):f.add($),{...U,[d]:f}});try{M?await X.removeRoleGlobalPermission(t,d,$):await X.addRoleGlobalPermission(t,d,$)}catch(U){_(f=>{const D=new Set(f[d]||[]);return M?D.add($):D.delete($),{...f,[d]:D}}),n(U,"error")}}async function m(d,$,M){if(!s)return;const U=z[d]&&z[d][$]||new Set,f=U.has(M),D=new Set(U);f?D.delete(M):D.add(M),u(E=>({...E,[d]:{...E[d]||{},[$]:D}}));try{f?await X.removeRoleScopePermission(t,d,$,M):await X.addRoleScopePermission(t,d,$,M)}catch(E){u(L=>({...L,[d]:{...L[d]||{},[$]:U}})),n(E,"error")}}return a===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):a.length===0?e.jsx("div",{className:"settings-empty-row",children:"No roles defined. Create roles first in Users & Roles."}):e.jsxs("div",{className:"settings-list",children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_ROLES"})]}),e.jsx(Aa,{permissions:i,userId:t,canWrite:s,toast:n,onReload:v}),e.jsx("div",{className:"settings-sub-label",style:{marginBottom:6},children:"Role Grants"}),a.map(d=>{const $=x===d.id,M=N[d.id];return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>J(d.id),style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:$?e.jsx(Me,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx($e,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(at,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:d.name}),e.jsx("span",{className:"settings-card-id",children:d.id}),d.description&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:d.description})]}),$&&e.jsxs("div",{className:"settings-card-body",children:[b.length>0&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("div",{className:"settings-sub-label",children:"Global Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role-only check — no node type context."}),b.map(U=>{const f=M===void 0,D=!f&&M.has(U.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:f||!s,title:s?D?`Revoke from ${d.name}`:`Grant to ${d.name}`:"Requires MANAGE_ROLES",onClick:()=>I(d.id,U.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:f?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):D?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:U.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:U.displayName})]},U.permissionCode)})]}),T.map(U=>{const f=G(U);if(f.length===0)return null;const D=z[d.id]&&z[d.id][U];return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[U," Permissions"]}),e.jsxs("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:["Role-only check — scope ",U," has no key context."]}),f.map(E=>{const L=D===void 0,S=!L&&D.has(E.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:L||!s,title:s?S?`Revoke from ${d.name}`:`Grant to ${d.name}`:"Requires MANAGE_ROLES",onClick:()=>m(d.id,U,E.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:L?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):S?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:E.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:E.displayName})]},E.permissionCode)})]},U)}),(y.length>0||j.length>0)&&e.jsx(Na,{userId:t,roleId:d.id,canWrite:s,toast:n,nodePerms:y,lcPerms:j,nodeTypes:c,transitions:p})]})]},d.id)})]})}function Pa({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState([]),[i,o]=l.useState(null),[c,g]=l.useState(!1),[p,h]=l.useState(""),[x,k]=l.useState(!1),N=["pno","platform","spe"];async function _(){try{const[b,y]=await Promise.all([nt.getEnvironment(),nt.getStatus()]);r(b.expectedServices||[]),o(y)}catch(b){n((b==null?void 0:b.message)||String(b),"error")}}l.useEffect(()=>{_()},[]);const z={};((i==null?void 0:i.services)||[]).forEach(b=>{z[b.serviceCode]=b});async function u(){const b=p.trim();if(b){k(!0);try{await nt.addExpectedService(b),h(""),g(!1),n("Service added","success"),_()}catch(y){n((y==null?void 0:y.message)||String(y),"error")}finally{k(!1)}}}async function v(b){if(window.confirm(`Remove expected service '${b}'?`)){k(!0);try{const y=await nt.removeExpectedService(b);y!=null&&y.baseline?n("Cannot remove baseline service","error"):n("Service removed","success"),_()}catch(y){n((y==null?void 0:y.message)||String(y),"error")}finally{k(!1)}}}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Expected Services"}),e.jsx("span",{style:{fontSize:12,color:"var(--muted2)"},children:"Services the platform expects to be running"}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!c&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>g(!0),children:[e.jsx(Re,{size:11,strokeWidth:2}),"Add service"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only access"}),c&&e.jsx("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",placeholder:"Service code (e.g. my-service)",value:p,onChange:b=>h(b.target.value),onKeyDown:b=>b.key==="Enter"&&u(),style:{flex:1,maxWidth:300},autoFocus:!0}),e.jsx("button",{className:"btn btn-primary btn-xs",onClick:u,disabled:x,children:"Add"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{g(!1),h("")},children:"Cancel"})]})}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service Code"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Instances"}),e.jsx("th",{children:"Version"}),e.jsx("th",{style:{width:80}})]})}),e.jsxs("tbody",{children:[a.map(b=>{const y=z[b],j=N.includes(b),C=(y==null?void 0:y.status)||"missing",T={up:"#4dd4a0",degraded:"#f0b429",down:"#fc8181",missing:"#6b8099"},G=T[C]||T.missing;return e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("code",{style:{fontSize:12},children:b}),j&&e.jsx("span",{className:"settings-badge",style:{marginLeft:8,fontSize:10},children:"baseline"})]}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot",style:{marginRight:6,background:G,boxShadow:`0 0 6px ${G}`}}),C]}),e.jsx("td",{children:y?`${y.healthyInstances??0}/${y.instanceCount??0}`:"–"}),e.jsx("td",{style:{fontFamily:"var(--mono)",fontSize:11},children:(y==null?void 0:y.version)||"–"}),e.jsx("td",{children:s&&!j&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>v(b),disabled:x,children:"Remove"})})]},b)}),a.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{textAlign:"center",color:"var(--muted)",padding:24},children:"No expected services configured (dynamic discovery mode)"})})]})]})]})}function Ra({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[i,o]=l.useState({}),[c,g]=l.useState({}),[p,h]=l.useState(null),[x,k]=l.useState(!1);async function N(){try{const j=await X.listSecrets(t);r(Array.isArray(j)?j.map(C=>C.key).sort():[])}catch(j){n((j==null?void 0:j.message)||String(j),"error"),r([])}}l.useEffect(()=>{N()},[t]);async function _(j){if(i[j]!==void 0){o(C=>{const T={...C};return delete T[j],T});return}o(C=>({...C,[j]:null}));try{const C=await X.revealSecret(t,j);o(T=>({...T,[j]:(C==null?void 0:C.value)??""}))}catch(C){n((C==null?void 0:C.message)||String(C),"error"),o(T=>{const G={...T};return delete G[j],G})}}function z(j){g(C=>({...C,[j]:i[j]??""}))}function u(j){g(C=>{const T={...C};return delete T[j],T})}async function v(j){k(!0);try{await X.updateSecret(t,j,c[j]),n(`Updated '${j}'`,"success"),u(j),i[j]!==void 0&&o(C=>({...C,[j]:c[j]}))}catch(C){n((C==null?void 0:C.message)||String(C),"error")}finally{k(!1)}}async function b(j){if(window.confirm(`Delete secret '${j}'? This cannot be undone.`)){k(!0);try{await X.deleteSecret(t,j),n(`Deleted '${j}'`,"success"),o(C=>{const T={...C};return delete T[j],T}),N()}catch(C){n((C==null?void 0:C.message)||String(C),"error")}finally{k(!1)}}}async function y(){var j;if(!((j=p==null?void 0:p.key)!=null&&j.trim())){n("Key required","error");return}k(!0);try{await X.createSecret(t,p.key.trim(),p.value??""),n(`Created '${p.key}'`,"success"),h(null),N()}catch(C){const T=((C==null?void 0:C.message)||String(C)).includes("409")?"Key already exists":(C==null?void 0:C.message)||String(C);n(T,"error")}finally{k(!1)}}return a===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Secrets"}),e.jsxs("span",{style:{fontSize:12,color:"var(--muted2)"},children:["Vault path: ",e.jsx("code",{children:"secret/plm"})]}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!p&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>h({key:"",value:""}),children:[e.jsx(Re,{size:11,strokeWidth:2}),"Add secret"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only — MANAGE_SECRETS not granted to your role."}),p&&e.jsxs("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:8},children:[e.jsx("input",{className:"field-input",placeholder:"key (e.g. plm.s3.access-key)",value:p.key,onChange:j=>h(C=>({...C,key:j.target.value})),style:{flex:1}}),e.jsx("input",{className:"field-input",placeholder:"value",value:p.value,onChange:j=>h(C=>({...C,value:j.target.value})),style:{flex:2}})]}),e.jsxs("div",{style:{display:"flex",gap:6,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>h(null),disabled:x,children:"Cancel"}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:y,disabled:x,children:"Create"})]})]}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"40%"},children:"Key"}),e.jsx("th",{children:"Value"}),e.jsx("th",{style:{width:220,textAlign:"right"},children:"Actions"})]})}),e.jsxs("tbody",{children:[a.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:3,style:{color:"var(--muted2)"},children:"No secrets yet."})}),a.map(j=>{const C=i[j],T=c[j]!==void 0,G=C!==void 0;return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:j})}),e.jsx("td",{children:T?e.jsx("input",{className:"field-input",value:c[j],onChange:J=>g(I=>({...I,[j]:J.target.value})),style:{width:"100%"},autoFocus:!0}):G?C===null?e.jsx("span",{style:{color:"var(--muted2)"},children:"loading…"}):e.jsx("code",{children:C}):e.jsx("span",{style:{letterSpacing:2,color:"var(--muted2)"},children:"••••••••"})}),e.jsx("td",{style:{textAlign:"right"},children:e.jsx("div",{style:{display:"inline-flex",gap:6,justifyContent:"flex-end"},children:T?e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>v(j),disabled:x,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>u(j),disabled:x,children:"Cancel"})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>_(j),title:G?"Hide value":"Reveal value",children:G?"Hide":"Reveal"}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn btn-xs",style:{display:"inline-flex",alignItems:"center",gap:4},onClick:()=>z(j),disabled:!G,title:G?"Edit value":"Reveal first to edit",children:[e.jsx(it,{size:10,strokeWidth:2}),"Edit"]}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>b(j),disabled:x,title:"Delete secret",children:e.jsx(ut,{size:10,strokeWidth:2})})]})]})})})]},j)})]})]})]})}function $a({userId:t,toast:s}){const[n,a]=l.useState(null),[r,i]=l.useState(null),[o,c]=l.useState(null),[g,p]=l.useState(null),[h,x]=l.useState(null);async function k(){try{const[b,y,j,C]=await Promise.all([X.getRegistryGrouped(t).catch(()=>({})),X.getRegistryTagsAdmin(t).catch(()=>null),X.getRegistryOverview(t).catch(()=>null),X.getUiManifest().catch(()=>null)]);a(b),i(y),c(j),x(C),p(null)}catch(b){p(b.message||String(b))}}if(l.useEffect(()=>{k();const b=setInterval(k,5e3);return()=>clearInterval(b)},[]),g)return e.jsxs("div",{className:"settings-empty-row",children:["Failed to load registry: ",g]});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const N=Object.keys(n).sort(),_=b=>{if(!b)return null;const y=Date.now()-new Date(b).getTime();return Math.max(0,Math.round(y/1e3))},z=b=>b==null?"—":b<60?`${b}s`:b<3600?`${Math.round(b/60)}m`:`${Math.round(b/3600)}h`,u=(o==null?void 0:o.services)||{},v=(o==null?void 0:o.settingsRegistrations)||[];return e.jsxs("div",{className:"settings-list",children:[e.jsx("div",{className:"settings-sub-label",children:"Platform Federation"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Per-service summary as seen by platform-api (",(o==null?void 0:o.self)||"platform","). Settings tabs registered, live item contributions probed via ","/internal/items/visible",". Refreshes every 5s."]}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instances"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Settings tabs"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Items"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Creatable"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Listable"})]})}),e.jsxs("tbody",{children:[Object.keys(u).sort().map(b=>{const y=u[b]||{};return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:b}),e.jsx("td",{style:{padding:"4px 6px"},children:y.instances??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.settingsSections??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.itemDescriptors??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.creatableItems??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.listableItems??0})]},b)}),Object.keys(u).length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:6,style:{padding:"4px 6px",color:"var(--muted2)"},children:"No services known."})})]})]}),v.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",children:"Settings Registrations"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"Sections actively registered by each service against this platform-api."}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Sections"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Registered at"})]})}),e.jsx("tbody",{children:v.map(b=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:b.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:b.instanceId}),e.jsx("td",{style:{padding:"4px 6px"},children:(b.sections||[]).map(y=>y.key).join(", ")||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:b.registeredAt||"—"})]},b.serviceCode+":"+b.instanceId))})]})]}),e.jsx("div",{className:"settings-sub-label",children:"UI Plugin Registrations"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:["Plugin bundles declared by each service and loaded by the shell at boot. Source: ",e.jsx("code",{style:{fontSize:11},children:"/api/platform/ui/manifest"}),"."]}),h==null?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"Manifest unavailable."}):h.length===0?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"No UI plugins declared."}):e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Plugin ID"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Zone"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Bundle URL"})]})}),e.jsx("tbody",{children:h.map(b=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:b.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:b.pluginId}),e.jsx("td",{style:{padding:"4px 6px"},children:e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)"},children:b.zone})}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace",color:"var(--muted2)"},children:b.url})]},b.pluginId))})]}),e.jsx("div",{className:"settings-sub-label",children:"Registered Services (platform-api)"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Live snapshot from platform-api environment registry. ",N.length," service",N.length===1?"":"s"," known."]}),N.length===0?e.jsx("div",{className:"settings-empty-row",children:"No services registered."}):N.map(b=>{const y=n[b]||[],j=y.filter(C=>C.healthy).length;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{className:"settings-card-name",style:{fontFamily:"monospace"},children:b}),e.jsxs("span",{style:{fontSize:10,color:j===y.length?"var(--success)":"var(--warn)"},children:[j,"/",y.length," healthy"]})]}),e.jsx("div",{className:"settings-card-body",children:e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Base URL"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Version"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Tag"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Health"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Last HB"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Failures"})]})}),e.jsx("tbody",{children:y.map(C=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:C.instanceId}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:C.baseUrl}),e.jsx("td",{style:{padding:"4px 6px"},children:C.version||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:C.spaceTag||"—"}),e.jsx("td",{style:{padding:"4px 6px",color:C.healthy?"var(--success)":"var(--danger, #e05252)"},children:C.healthy?"OK":"DOWN"}),e.jsx("td",{style:{padding:"4px 6px"},children:z(_(C.lastHeartbeatOk))}),e.jsx("td",{style:{padding:"4px 6px"},children:C.consecutiveFailures??0})]},C.instanceId))})]})})]},b)}),r&&Object.keys(r).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",style:{marginTop:16},children:"Project Space Tags"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Service ↔ space-tag affinity (used by gateway routing)."}),e.jsx("pre",{style:{fontSize:11,background:"var(--bg2)",padding:8,borderRadius:4},children:JSON.stringify(r,null,2)})]})]})}function La({sectionKey:t,userId:s,projectSpaceId:n,canWrite:a,toast:r,pluginsLoaded:i}){if(t===null)return e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading…"});const c=ca(t)??aa(t);if(!c)return i?e.jsxs("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:["Unknown section: ",t]}):e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading plugins…"});const{Component:g,wrapBody:p}=c,h=e.jsx(g,{userId:s,projectSpaceId:n,canWrite:a,toast:r});return p?e.jsx("div",{className:"settings-content-body",children:h}):h}function Da({userId:t,projectSpaceId:s,activeSection:n,onSectionChange:a,settingsSections:r,pluginsLoaded:i,toast:o}){const c=l.useMemo(()=>{const p={};return(r||[]).forEach(h=>h.sections.forEach(x=>{p[x.key]=x.canWrite})),p},[r]),g=l.useMemo(()=>{if(!r)return n;for(const p of r){const h=p.sections.find(x=>x.key===n);if(h)return h.label}return n},[r,n]);return e.jsxs("div",{className:"settings-content",children:[e.jsx("div",{className:"settings-content-hd",children:e.jsx("span",{className:"settings-content-title",children:g})}),e.jsx(La,{sectionKey:n,userId:t,projectSpaceId:s,canWrite:c[n]??!1,pluginsLoaded:i,toast:o})]})}Be("my-profile",wa);Be("api-playground",ea,{wrapBody:!1});Be("user-manual",sa,{wrapBody:!1});Be("proj-spaces",Ca);Be("users-roles",za);Be("access-rights",Ia);Be("secrets",Ra);Be("service-registry",$a);Be("platform-environment",Pa);Be("actions-catalog",da);Be("platform-algorithms",xa);class es extends et.Component{constructor(s){super(s),this.state={hasError:!1,error:null}}static getDerivedStateFromError(s){return{hasError:!0,error:s}}componentDidCatch(s,n){console.error("ErrorBoundary caught:",s,n)}render(){var s;return this.state.hasError?this.props.fallback||e.jsxs("div",{style:{padding:24,color:"#e74c3c"},children:[e.jsx("strong",{children:"Something went wrong."}),e.jsx("pre",{style:{fontSize:12,marginTop:8},children:(s=this.state.error)==null?void 0:s.message})]}):this.props.children}}const $s={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function Oa({userId:t,txId:s,txNodes:n,stateColorMap:a,onCommitted:r,onClose:i,toast:o}){const[c,g]=l.useState(""),[p,h]=l.useState(!1),x=(n||[]).map(v=>v.node_id||v.NODE_ID),[k,N]=l.useState(()=>new Set(x));function _(v){N(b=>{const y=new Set(b);return y.has(v)?y.delete(v):y.add(v),y})}function z(){N(k.size===x.length?new Set:new Set(x))}async function u(){if(!c.trim()){o("Commit comment is required","warn");return}if(k.size===0){o("Select at least one object to commit","warn");return}h(!0);try{const v=k.size===x.length?null:[...k],b=await rt.commit(t,s,c,v),y=(b==null?void 0:b.continuationTxId)||null,j=x.length-k.size;o("Transaction committed","success"),r(y,j),i()}catch(v){o(v,"error")}finally{h(!1)}}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true","aria-labelledby":"commit-title",children:e.jsxs("div",{className:"card commit-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",id:"commit-title",children:"Commit transaction"}),e.jsx("button",{className:"btn btn-sm",onClick:i,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:"commit-comment",children:["Commit comment ",e.jsx("span",{className:"field-req","aria-label":"required",children:"*"})]}),e.jsx("input",{id:"commit-comment",className:"field-input",placeholder:"Describe what you changed…",value:c,onChange:v=>g(v.target.value),autoFocus:!0})]}),(n==null?void 0:n.length)>0&&e.jsxs("div",{className:"commit-node-list",children:[e.jsx("div",{className:"commit-node-list-hd",children:e.jsxs("label",{className:"commit-node-all",children:[e.jsx("input",{type:"checkbox",checked:k.size===x.length,onChange:z}),e.jsx("span",{children:"Objects to commit"}),e.jsxs("span",{className:"commit-node-count",children:[k.size,"/",x.length]})]})}),e.jsx("div",{className:"commit-node-list-scroll",children:n.map(v=>{const b=v.node_id||v.NODE_ID,y=v.logical_id||v.LOGICAL_ID||b,j=v.node_type_name||v.NODE_TYPE_NAME||"",C=v.revision||v.REVISION||"A",T=v.iteration??v.ITERATION??1,G=(v.change_type||v.CHANGE_TYPE||"CONTENT").toUpperCase(),J=v.lifecycle_state_id||v.LIFECYCLE_STATE_ID||"",I=$s[G]||$s.CONTENT;return e.jsxs("label",{className:"commit-node-item",children:[e.jsx("input",{type:"checkbox",checked:k.has(b),onChange:()=>_(b)}),e.jsx("span",{className:"commit-node-dot",style:{background:(a==null?void 0:a[J])||"#6b7280"}}),e.jsx("span",{className:"commit-node-lid",children:y}),e.jsx("span",{className:"commit-node-rev",children:T===0?C:`${C}.${T}`}),e.jsx("span",{className:"commit-node-type",children:j}),e.jsx("span",{className:"commit-node-badge",style:{background:I.bg,color:I.color},children:I.label})]},b)})})]}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:14},children:"Committed objects become visible to everyone. Uncommitted objects stay in a new transaction."}),e.jsxs("div",{className:"row flex-end",style:{gap:8},children:[e.jsx("button",{className:"btn",onClick:i,children:"Cancel"}),e.jsx("button",{className:"btn btn-success",onClick:u,disabled:p||!c.trim()||k.size===0,children:p?"Committing…":"✓ Commit"})]})]})]})})}function Ma({resources:t,onCreated:s,onClose:n,toast:a,initialDescriptor:r}){const i=l.useMemo(()=>{const I=new Set,m=[];for(const d of t||[]){const $=d.sourceLabel||"OTHER";I.has($)||(I.add($),m.push($))}return m},[t]),[o,c]=l.useState((r==null?void 0:r.sourceLabel)||i[0]||""),g=l.useMemo(()=>(t||[]).filter(I=>(I.sourceLabel||"OTHER")===o),[t,o]),[p,h]=l.useState(()=>r?(t||[]).find(I=>I.serviceCode===r.serviceCode&&I.itemCode===r.itemCode&&(I.itemKey||"")===(r.itemKey||""))||null:g[0]||null);l.useEffect(()=>{r||h(g[0]||null)},[o]);const[x,k]=l.useState({}),[N,_]=l.useState({}),[z,u]=l.useState(!1);if(l.useEffect(()=>{k({}),_({})},[p]),!p)return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsx("div",{className:"modal-scroll",style:{padding:24,color:"var(--muted)"},children:"No creatable resources available."})]})});const v=p.create,b=((v==null?void 0:v.parameters)||[]).slice().sort((I,m)=>(I.displayOrder||0)-(m.displayOrder||0)),y=[];let j=null;for(const I of b){const m=I.displaySection||"Fields";(y.length===0||m!==j)&&(y.push({section:m,items:[]}),j=m),y[y.length-1].items.push(I)}function C(I,m){k(d=>({...d,[I]:m})),_(d=>({...d,[I]:null}))}function T(){const I={};for(const m of b){const d=x[m.name];if(m.required&&(d==null||d===""||d instanceof File&&d.size===0)&&(I[m.name]="Required"),m.validationRegex&&typeof d=="string"&&d.trim())try{new RegExp(`^(?:${m.validationRegex})$`).test(d.trim())||(I[m.name]=`Does not match pattern: ${m.validationRegex}`)}catch{}}return _(I),Object.keys(I).length===0}async function G(){if(T()){u(!0);try{const I=await X.createResource(p,x);a(`${p.displayName||p.itemCode} created`,"success"),s==null||s(I,p),n()}catch(I){a(I,"error")}finally{u(!1)}}}function J(I){const m=(I.widgetType||"TEXT").toUpperCase(),d=N[I.name],$=x[I.name];if(m==="FILE")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${I.name}`,children:[I.label,I.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("input",{id:`f-${I.name}`,type:"file",className:`field-input${d?" error":""}`,onChange:D=>{var E;return C(I.name,((E=D.target.files)==null?void 0:E[0])||null)}}),I.tooltip&&e.jsx("span",{className:"field-hint",children:I.tooltip}),d&&e.jsx("span",{className:"field-hint error",role:"alert",children:d})]},I.name);if(m==="TEXTAREA")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${I.name}`,children:[I.label,I.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("textarea",{id:`f-${I.name}`,className:`field-input${d?" error":""}`,placeholder:I.tooltip||"",value:$||"",onChange:D=>C(I.name,D.target.value)}),d&&e.jsx("span",{className:"field-hint error",role:"alert",children:d})]},I.name);if(m==="DROPDOWN"||m==="SELECT"){const D=I.allowedValues?_a(I.allowedValues):[];return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${I.name}`,children:[I.label,I.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("select",{id:`f-${I.name}`,className:`field-input${d?" error":""}`,value:$||"",onChange:E=>C(I.name,E.target.value),children:[e.jsx("option",{value:"",children:"— select —"}),D.map(E=>e.jsx("option",{children:E},E))]}),d&&e.jsx("span",{className:"field-hint error",role:"alert",children:d})]},I.name)}const M=($||"").toString().trim(),U=I.validationRegex?Ba(`^(?:${I.validationRegex})$`):null,f=!U||!M?null:U.test(M);return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${I.name}`,children:[I.label,I.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("div",{className:"logical-id-wrap",children:[e.jsx("input",{id:`f-${I.name}`,type:m==="NUMBER"?"number":"text",className:`field-input${d?" error":f===!0?" ok":f===!1?" error":""}`,placeholder:I.tooltip||(I.validationRegex?`pattern: ${I.validationRegex}`:""),value:$||"",onChange:D=>C(I.name,D.target.value)}),M&&U&&e.jsx("span",{className:`logical-id-badge ${f?"ok":"err"}`,children:f?"✓":"✗"})]}),I.validationRegex&&e.jsxs("div",{className:"logical-id-hint",children:[e.jsx("span",{className:"logical-id-hint-label",children:"Pattern"}),e.jsx("code",{className:"logical-id-hint-code",children:I.validationRegex}),!M&&e.jsx("span",{className:"logical-id-hint-idle",children:"start typing to validate"}),M&&f===!1&&e.jsx("span",{className:"logical-id-hint-err",children:"no match"}),M&&f===!0&&e.jsx("span",{className:"logical-id-hint-ok",children:"matches"})]}),!I.validationRegex&&I.tooltip&&e.jsx("span",{className:"field-hint",children:I.tooltip}),d&&e.jsx("span",{className:"field-hint error",role:"alert",children:d})]},I.name)}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"modal-scroll",children:[e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsxs("div",{className:"field",style:{margin:0,flex:"0 0 180px"},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-source",children:"Source"}),e.jsx("select",{id:"rc-source",className:"field-input",value:o,onChange:I=>c(I.target.value),disabled:!!r,children:i.map(I=>e.jsx("option",{value:I,children:I},I))})]}),e.jsxs("div",{className:"field",style:{margin:0,flex:1},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-type",children:"Type"}),e.jsx("select",{id:"rc-type",className:"field-input",value:p?`${p.serviceCode}/${p.itemCode}/${p.itemKey||""}`:"",onChange:I=>{const m=I.target.value,d=g.find($=>`${$.serviceCode}/${$.itemCode}/${$.itemKey||""}`===m);d&&h(d)},disabled:!!r,children:g.map(I=>{const m=`${I.serviceCode}/${I.itemCode}/${I.itemKey||""}`;return e.jsx("option",{value:m,children:I.displayName},m)})})]})]}),p.description&&e.jsx("div",{style:{padding:"12px 0 0",color:"var(--muted)",fontSize:12},children:p.description}),y.map((I,m)=>e.jsxs(et.Fragment,{children:[e.jsx("div",{className:"modal-identity-sep",style:{marginTop:m===0?16:18},children:e.jsx("span",{children:I.section})}),I.items.map(d=>J(d))]},`grp-${m}-${I.section}`))]}),e.jsx("div",{className:"card-hd",style:{borderTop:"1px solid var(--border)",borderBottom:"none"},children:e.jsxs("div",{className:"row flex-end",style:{width:"100%",gap:8},children:[e.jsx("button",{className:"btn",onClick:n,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:G,disabled:z,children:z?"Creating…":"Create"})]})})]})})}function Ba(t){try{return new RegExp(t)}catch{return null}}function _a(t){try{return JSON.parse(t)}catch{return[]}}function Wa({detail:t,onClose:s}){var r;const n=t.category==="TECHNICAL",a=n&&Array.isArray(t.stackTrace)?t.stackTrace.join(`
`):null;return e.jsx("div",{className:"overlay",onClick:s,role:"dialog","aria-modal":"true","aria-label":"Error detail",children:e.jsxs("div",{className:`card ${n?"err-card-tech":"err-card-func"}`,onClick:i=>i.stopPropagation(),children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",style:{color:n?"var(--danger)":"var(--warn)"},children:n?"✗ Unexpected error":"⚠ Error"}),e.jsx("button",{className:"btn btn-sm",onClick:s,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:`card-body ${n?"err-body":""}`,children:[e.jsx("div",{className:"err-message",children:t.error}),((r=t.violations)==null?void 0:r.length)>0&&e.jsx("ul",{className:"violations-list",children:t.violations.map((i,o)=>e.jsx("li",{className:"violation-item",children:typeof i=="string"?i:i.message},o))}),n&&t.type&&e.jsx("div",{className:"err-meta",children:t.type}),t.path&&e.jsx("div",{className:"err-meta",children:t.path}),a&&e.jsx("pre",{className:"stack-trace",children:a})]})]})})}const xt=[];function cs(t){if(!t||!t.match||!t.match.serviceCode)throw new Error("Plugin requires match.serviceCode");const s=(t.match.itemKey?4:0)+(t.match.itemCode?2:0)+(t.match.serviceCode==="*"?0:1);t._specificity=s,xt.push(t),xt.sort((n,a)=>(a._specificity||0)-(n._specificity||0))}function fn(t,s){const n=t.match;return!(n.serviceCode!=="*"&&n.serviceCode!==s.serviceCode||n.itemCode&&n.itemCode!==s.itemCode||n.itemKey&&n.itemKey!==s.itemKey)}function Ls(t){for(const s of xt)if(fn(s,t||{}))return s;return Ct}function Ga(t){if(!t)return Ct;for(const s of xt)if(fn(s,t))return s;return Ct}let Ct={match:{serviceCode:"*"},name:"default",hasItemChildren:()=>!1};function Fa(t){Ct={...Ct,...t,match:{serviceCode:"*"}}}function Ua(t){for(const s of xt)if(s.LinkRow&&(s.match.serviceCode==="*"||s.match.serviceCode===t))return s.LinkRow;return null}function Ds(t,s,n){const a=xt.find(r=>r.match.serviceCode===t&&(!s||r.match.itemCode===s));a?Object.assign(a,n):cs({match:{serviceCode:t,itemCode:s},...n})}function Ha(t){const s=t.value;if(s==null||s==="")return e.jsx("span",{style:{color:"var(--muted2)"},children:"—"});switch(t.widget){case"datetime":{try{const n=new Date(s);if(!isNaN(n.getTime()))return n.toLocaleString()}catch{}return String(s)}case"code":return e.jsx("code",{style:{fontSize:10,wordBreak:"break-all"},children:String(s)});case"number":return e.jsx("span",{style:{fontFamily:"var(--mono)"},children:Number(s).toLocaleString()});case"link":return e.jsx("a",{href:String(s),target:"_blank",rel:"noreferrer",children:String(s)});case"badge":return e.jsx("span",{className:"settings-badge",children:String(s)});case"image":return e.jsx("img",{src:String(s),alt:t.label,style:{maxWidth:"100%",maxHeight:240}});case"multiline":return e.jsx("pre",{style:{margin:0,whiteSpace:"pre-wrap",fontSize:12},children:String(s)});default:return String(s)}}function gn({tab:t,ctx:s,descriptorOverride:n}){var $,M,U;const{userId:a,toast:r}=s||{},i=n||t.get||{},o=i.path,c=(i.httpMethod||"GET").toUpperCase(),g=(n==null?void 0:n.serviceCode)||t.serviceCode,p=g?`/api/${g}`:"",[h,x]=l.useState(null),[k,N]=l.useState(null),[_,z]=l.useState(!0),[u,v]=l.useState(null),[b,y]=l.useState(null),[j,C]=l.useState(!1),[T,G]=l.useState(!1),[J,I]=l.useState(null),m=l.useCallback(async()=>{if(!o||!t.nodeId){N("No get action declared for this source"),z(!1);return}z(!0),N(null);try{const f=p+o.replace("{id}",encodeURIComponent(t.nodeId)),D=await X.gatewayJson(c,f);x(D)}catch(f){N((f==null?void 0:f.message)||String(f))}finally{z(!1)}},[o,c,t.nodeId,p]);l.useEffect(()=>{m()},[m]),l.useEffect(()=>{var E;const f=(E=h==null?void 0:h.metadata)==null?void 0:E.downloadUrl;if(!f){y(null),G(!1),I(null);return}let D=!1;return C(!0),X.gatewayRawText(f).then(({text:L,truncated:S,totalBytes:w})=>{D||(y(L),G(S),I(w),C(!1))}).catch(()=>{D||(y(null),C(!1))}),()=>{D=!0}},[($=h==null?void 0:h.metadata)==null?void 0:$.downloadUrl]),l.useEffect(()=>{var f;(f=s==null?void 0:s.onRegisterPreview)==null||f.call(s,{text:b,truncated:T,totalBytes:J,loading:j})},[b,j,T,J]),l.useEffect(()=>()=>{var f;(f=s==null?void 0:s.onRegisterPreview)==null||f.call(s,null)},[t.nodeId]);async function d(f){var D,E;if(!(f.confirmRequired&&!window.confirm(`${f.label}?

${f.description||""}`))){if((D=f.metadata)!=null&&D.openInNewTab){window.open(p+f.path.replace("{id}",encodeURIComponent(t.nodeId)),"_blank","noreferrer");return}v(f.code);try{const L=p+f.path.replace("{id}",encodeURIComponent(t.nodeId));await X.gatewayJson(f.httpMethod,L,(E=f.parameters)!=null&&E.length?{}:void 0),r&&r(`${f.label} done`,"success"),m()}catch(L){r&&r(L,"error")}finally{v(null)}}}return _?e.jsx("div",{className:"settings-loading",children:"Loading…"}):k?e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⚠"}),e.jsx("div",{className:"editor-empty-text",children:"Failed to load"}),e.jsx("div",{className:"editor-empty-hint",children:k})]}):h?e.jsxs("div",{style:{padding:24,overflow:"auto",height:"100%",boxSizing:"border-box"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:4},children:[h.color&&e.jsx("span",{style:{width:10,height:10,borderRadius:2,background:h.color,flexShrink:0}}),e.jsx("h2",{style:{margin:0,fontSize:18},children:h.title||h.id}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"},children:h.id})]}),h.subtitle&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:16},children:h.subtitle}),h.actions&&h.actions.length>0&&e.jsx("div",{style:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},children:h.actions.map(f=>e.jsx("button",{className:`btn btn-sm ${f.dangerous?"btn-danger":"btn-primary"}`,onClick:()=>d(f),disabled:u===f.code,title:f.description||f.label,children:u===f.code?"…":f.label},f.code))}),e.jsx("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse",marginBottom:24},children:e.jsx("tbody",{children:h.fields.map(f=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsxs("td",{style:{padding:"6px 8px",color:"var(--muted)",width:180,verticalAlign:"top"},children:[f.label,f.hint&&e.jsx("div",{style:{fontSize:10,color:"var(--muted2)"},children:f.hint})]}),e.jsx("td",{style:{padding:"6px 8px"},children:Ha(f)})]},f.name))})}),((M=h.metadata)==null?void 0:M.isImage)&&((U=h.metadata)==null?void 0:U.downloadUrl)&&e.jsxs("div",{children:[e.jsx("div",{className:"settings-sub-label",style:{marginBottom:8},children:"Preview"}),e.jsx("img",{src:h.metadata.downloadUrl,alt:h.title,style:{maxWidth:"100%",maxHeight:480,border:"1px solid var(--border)",borderRadius:4}})]})]}):null}function Va({descriptor:t,item:s,ctx:n,isActive:a}){var g,p,h,x;const r=((p=(g=t.list)==null?void 0:g.itemShape)==null?void 0:p.idField)||"id",i=((x=(h=t.list)==null?void 0:h.itemShape)==null?void 0:x.labelField)||"id",o=s[r]||s.id,c=s[i]||o;return e.jsxs("div",{className:`node-item${a?" active":""}`,onClick:()=>n.onNavigate(o,c,t),title:c,children:[e.jsx("span",{className:"ni-expand",style:{visibility:"hidden"}}),e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:c})]})}const qa={match:{serviceCode:"*"},name:"default",NavRow:Va,Editor:gn,hasItemChildren:()=>!1},bn=256*1024*1024,fs=Math.max(1,Math.min(navigator.hardwareConcurrency||2,4)),Ue=Array.from({length:fs},()=>new Worker(new URL("/assets/stepWorker-BEb5tBaE.js",import.meta.url),{type:"module"}));Ue.forEach(t=>{t.addEventListener("message",({data:s})=>{s.type==="log"&&je.getState().appendLog(s.level,s.message)})});function Ka(t){let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)>>>0;return Ue[s%fs]}function Os({idb:t=!1}={}){Ue.forEach(s=>s.postMessage({type:"clear",idb:t}))}function Xa(t){Ue.forEach(s=>s.postMessage({type:"setMaxBytes",maxBytes:t}))}const ts={postMessage(t){t.uuid?Ka(t.uuid).postMessage(t):Ue.forEach(s=>s.postMessage(t))},addEventListener(t,s){Ue.forEach(n=>n.addEventListener(t,s))},removeEventListener(t,s){Ue.forEach(n=>n.removeEventListener(t,s))}},Ya=()=>({entries:0,cacheBytes:0,maxBytes:bn,memHits:0,idbHits:0,netFetches:0,avgDownloadMs:null,avgParseMs:null});function Ms(t,s){const n=t.map(a=>a[s]).filter(a=>a!=null);return n.length?n.reduce((a,r)=>a+r,0)/n.length:null}function Ja(){const t=l.useRef(Ue.map(Ya)),[,s]=l.useState(0);l.useEffect(()=>{const a=Ue.map((r,i)=>{const o=({data:c})=>{c.type==="stats"&&(t.current[i]={entries:c.entries,cacheBytes:c.cacheBytes,maxBytes:c.maxBytes??bn,memHits:c.memHits??0,idbHits:c.idbHits??0,netFetches:c.netFetches??0,avgDownloadMs:c.avgDownloadMs??null,avgParseMs:c.avgParseMs??null},s(g=>g+1))};return r.addEventListener("message",o),r.postMessage({type:"stats"}),o});return()=>Ue.forEach((r,i)=>r.removeEventListener("message",a[i]))},[]);const n=t.current;return{workers:fs,entries:n.reduce((a,r)=>a+r.entries,0),cacheBytes:n.reduce((a,r)=>a+r.cacheBytes,0),maxBytes:n.reduce((a,r)=>a+r.maxBytes,0),memHits:n.reduce((a,r)=>a+r.memHits,0),idbHits:n.reduce((a,r)=>a+r.idbHits,0),netFetches:n.reduce((a,r)=>a+r.netFetches,0),avgDownloadMs:Ms(n,"avgDownloadMs"),avgParseMs:Ms(n,"avgParseMs")}}function Za({nodes:t=[],loading:s=!1,onNavigateToNode:n}){const a=l.useRef(null),r=l.useRef(null),i=l.useRef(null),o=l.useRef(null),c=l.useRef(null),g=l.useRef(null),p=l.useRef(null),h=l.useRef({}),x=l.useRef(new Set),k=l.useRef({}),N=l.useRef({}),_=l.useRef(n),z=l.useRef(null),u=l.useRef({}),v=l.useRef([]);l.useEffect(()=>{_.current=n},[n]);const[b,y]=l.useState({}),[j,C]=l.useState(()=>new Set),[T,G]=l.useState(()=>new Set),[J,I]=l.useState(!1);l.useEffect(()=>{const E={},L={};t.forEach(S=>S.parts.forEach(w=>{const R=w.instanceKey||w.uuid;E[R]=S.nodeId,L[R]=S.stateColor||"#6b7280"})),k.current=E,N.current=L,Object.entries(L).forEach(([S,w])=>{const R=h.current[S];if(!R)return;const W=new wt(w);R.traverse(F=>{F.isMesh&&F.userData.isOutline&&F.material.uniforms.color.value.copy(W)})})},[t]);const d=t.flatMap(E=>E.parts).filter(E=>!j.has(E.instanceKey||E.uuid)),$=d.map(E=>E.instanceKey||E.uuid).join(",");v.current=d,l.useEffect(()=>{const E=a.current;if(!E)return;const L=E.clientWidth||600,S=E.clientHeight||400,w=()=>{const ce=getComputedStyle(document.documentElement).getPropertyValue("--scene-bg").trim();return new wt(ce||"#1c1c2a")},R=new ur;R.background=w(),R.add(new hr(16777215,.7));const W=new xr(16777215,1.2);W.position.set(8,12,6),R.add(W);const F=new fr(45,L/S,1e-4,1e5);F.position.set(0,5,10);const P=new gr({antialias:!0});P.setPixelRatio(window.devicePixelRatio),P.setSize(L,S),E.appendChild(P.domElement);const H=new br(F,P.domElement);H.enableDamping=!0,H.dampingFactor=.08;const B=new vr(F,P,{size:80,container:E});B.attachControls(H),r.current=R,i.current=P,o.current=F,c.current=H,g.current=B;function O(){p.current=requestAnimationFrame(O),H.update(),P.render(R,F),B.render()}O();function K(){const ce=E.clientWidth,de=E.clientHeight;!ce||!de||(F.aspect=ce/de,F.updateProjectionMatrix(),P.setSize(ce,de),B.update())}const Y=new MutationObserver(()=>{r.current&&(r.current.background=w())});Y.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});const V=new ResizeObserver(()=>K());V.observe(E);const Q=new Tr,ne=new yr;function ee(ce){const de=E.getBoundingClientRect();ne.set((ce.clientX-de.left)/E.clientWidth*2-1,(ce.clientY-de.top)/E.clientHeight*-2+1),Q.setFromCamera(ne,F);const pe=[];R.traverse(Te=>{Te.isMesh&&!Te.userData.isOutline&&Te.visible&&pe.push(Te)});const me=Q.intersectObjects(pe,!1);if(!me.length)return null;let ue=me[0].object;for(;ue&&!ue.name;)ue=ue.parent;return(ue==null?void 0:ue.name)||null}function te(ce){const de=z.current;if(de!==ce){if(de){const pe=h.current[de];pe&&pe.traverse(me=>{me.isMesh&&(me.userData.isOutline?me.material.uniforms.color.value.set(N.current[de]||"#6b7280"):me.material.emissive.set(0))})}if(ce){const pe=h.current[ce];pe&&pe.traverse(me=>{me.isMesh&&(me.userData.isOutline?me.material.uniforms.color.value.set(16777215):me.material.emissive.set(6710886))})}z.current=ce,P.domElement.style.cursor=ce?"pointer":"default"}}function re(ce){te(ee(ce))}function le(){te(null)}function ye(ce){if(!ce.ctrlKey&&!ce.metaKey)return;const de=ee(ce);if(!de)return;const pe=k.current[de];pe&&_.current&&_.current(pe)}return P.domElement.addEventListener("mousemove",re),P.domElement.addEventListener("mouseleave",le),P.domElement.addEventListener("click",ye),()=>{cancelAnimationFrame(p.current),Y.disconnect(),V.disconnect(),P.domElement.removeEventListener("mousemove",re),P.domElement.removeEventListener("mouseleave",le),P.domElement.removeEventListener("click",ye),B.dispose(),P.dispose(),E.contains(P.domElement)&&E.removeChild(P.domElement)}},[]),l.useEffect(()=>{const E=({data:L})=>{var R;const{type:S,uuid:w}=L;if(x.current.has(w)){if(x.current.delete(w),S==="ready"){u.current[w]=L.meshes;const W=v.current.filter(P=>P.uuid===w),F={};for(const P of W){const H=P.instanceKey||P.uuid;if(h.current[H])continue;const B=N.current[H]||"#6b7280",O=Bs(L.meshes,B);if(O.name=H,P.matrix){const K=new vs;K.set(P.matrix[0],P.matrix[1],P.matrix[2],P.matrix[3],P.matrix[4],P.matrix[5],P.matrix[6],P.matrix[7],P.matrix[8],P.matrix[9],P.matrix[10],P.matrix[11],P.matrix[12],P.matrix[13],P.matrix[14],P.matrix[15]),O.matrix.copy(K),O.matrixAutoUpdate=!1}(R=r.current)==null||R.add(O),h.current[H]=O,F[H]={phase:"ready",error:null,visible:!0}}M(),Object.keys(F).length>0&&y(P=>({...P,...F}))}else if(S==="error"){const W=v.current.filter(P=>P.uuid===w),F={};for(const P of W){const H=P.instanceKey||P.uuid;F[H]={phase:"error",error:L.message,visible:!1}}Object.keys(F).length>0&&y(P=>({...P,...F}))}}};return ts.addEventListener("message",E),()=>ts.removeEventListener("message",E)},[]),l.useEffect(()=>{var w,R;const E=new Set(d.map(W=>W.instanceKey||W.uuid)),L=new Set(d.map(W=>W.uuid));for(const W of Object.keys(h.current))E.has(W)||(_s(h.current[W]),(w=r.current)==null||w.remove(h.current[W]),delete h.current[W]);for(const W of[...x.current])L.has(W)||x.current.delete(W);for(const W of Object.keys(u.current))L.has(W)||delete u.current[W];y(W=>{const F={...W};for(const P of Object.keys(F))E.has(P)||delete F[P];return F});const S={};for(const W of d){const F=W.instanceKey||W.uuid;if(!h.current[F])if(u.current[W.uuid]){const P=N.current[F]||"#6b7280",H=Bs(u.current[W.uuid],P);if(H.name=F,W.matrix){const B=new vs;B.set(W.matrix[0],W.matrix[1],W.matrix[2],W.matrix[3],W.matrix[4],W.matrix[5],W.matrix[6],W.matrix[7],W.matrix[8],W.matrix[9],W.matrix[10],W.matrix[11],W.matrix[12],W.matrix[13],W.matrix[14],W.matrix[15]),H.matrix.copy(B),H.matrixAutoUpdate=!1}(R=r.current)==null||R.add(H),h.current[F]=H,S[F]={phase:"ready",error:null,visible:!0}}else x.current.has(W.uuid)?S[F]={phase:"loading",error:null,visible:!0}:(x.current.add(W.uuid),S[F]={phase:"loading",error:null,visible:!0},ts.postMessage({type:"load",uuid:W.uuid,token:ht(),projectSpace:Gt()}))}Object.keys(S).length>0&&y(W=>({...W,...S}))},[$]);function M(){const E=r.current,L=o.current,S=c.current;if(!E||!L)return;const w=new jr;if(E.traverse(P=>{P.isMesh&&!P.userData.isOutline&&P.visible&&w.expandByObject(P)}),w.isEmpty())return;const R=new ys,W=new ys;w.getCenter(R),w.getSize(W);const F=Math.max(W.x,W.y,W.z)||1;L.near=F*1e-4,L.far=F*200,L.position.set(R.x+F*1.5,R.y+F,R.z+F*2),L.lookAt(R),S&&(S.target.copy(R),S.update()),L.updateProjectionMatrix()}function U(E){const L=h.current[E];if(!L)return;const S=!L.visible;L.visible=S,y(w=>({...w,[E]:{...w[E],visible:S}}))}function f(E){var S;const L=h.current[E];L&&(_s(L),(S=r.current)==null||S.remove(L),delete h.current[E]),C(w=>new Set([...w,E])),y(w=>{const R={...w};return delete R[E],R})}function D(E){G(L=>{const S=new Set(L);return S.has(E)?S.delete(E):S.add(E),S})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[J?e.jsxs("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,background:"var(--surface)"},onClick:()=>I(!1),title:"Show parts panel",children:[e.jsx($e,{size:12,style:{color:"var(--muted)",flexShrink:0}}),e.jsx("span",{style:{writingMode:"vertical-rl",fontSize:10,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1,textTransform:"uppercase"},children:"Parts"})]}):e.jsxs("div",{style:{width:220,flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"5px 8px 5px 10px",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:"Parts"}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>I(!0),title:"Collapse parts panel",children:e.jsx(rr,{size:13})})]}),s&&e.jsx("div",{style:{padding:"6px 10px",fontSize:11,color:"var(--muted)",flexShrink:0},children:"Loading…"}),!s&&t.length===0&&e.jsx("div",{style:{padding:"10px 12px",fontSize:12,color:"var(--muted)"},children:"No parts"}),e.jsx("div",{style:{flex:1,overflowY:"auto"},children:t.map(E=>{const L=E.parts.filter(R=>!j.has(R.instanceKey||R.uuid));if(L.length===0)return null;const S=T.has(E.nodeId),w=E.stateColor||"#6b7280";return e.jsxs("div",{children:[e.jsxs("div",{onClick:()=>D(E.nodeId),style:{display:"flex",alignItems:"center",gap:5,padding:`4px 8px 4px ${8+E.depth*12}px`,cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--muted)",borderBottom:"1px solid var(--border)",background:"var(--surface)",userSelect:"none"},children:[e.jsx("span",{style:{width:7,height:7,borderRadius:2,background:w,flexShrink:0,display:"inline-block"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:E.nodeLabel,children:E.nodeLabel}),e.jsx("span",{style:{fontSize:9,flexShrink:0},children:S?"▶":"▼"})]}),!S&&L.map(R=>{const W=R.instanceKey||R.uuid,F=b[W]||{},P=F.visible!==!1;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,padding:`4px 8px 4px ${14+E.depth*12}px`,fontSize:12,borderBottom:"1px solid var(--border)"},children:[e.jsx("input",{type:"checkbox",checked:P,disabled:F.phase!=="ready",onChange:()=>U(W),style:{flexShrink:0,cursor:F.phase==="ready"?"pointer":"default"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:F.phase==="error"?"var(--danger, #e05252)":"inherit",opacity:P?1:.45},title:F.phase==="error"?F.error:R.fileName,children:R.fileName||R.uuid}),e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",flexShrink:0},children:[F.phase==="loading"&&"…",F.phase==="error"&&"✗"]}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>f(W),title:"Remove from scene",style:{fontSize:13,lineHeight:1},children:"×"})]},W)})]},E.instanceId||E.nodeId)})})]}),e.jsx("div",{ref:a,style:{flex:1,overflow:"hidden",minWidth:0,position:"relative"}})]})}function Bs(t,s="#6b7280"){const n=new wr,a=new wt(s);for(const r of t){if(!r.positions)continue;const i=new Sr;i.setAttribute("position",new Xt(r.positions,3)),r.normals&&i.setAttribute("normal",new Xt(r.normals,3)),r.indices&&i.setIndex(new Xt(r.indices,1));const o=r.color?new wt(r.color[0],r.color[1],r.color[2]):new wt(6003958),c=new js(i,new kr({color:o,side:Nr}));n.add(c);const g=new js(i,new Cr({side:Er,uniforms:{color:{value:a.clone()},thickness:{value:.007}},vertexShader:`
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
void main() { gl_FragColor = vec4(color, 1.0); }`}));g.renderOrder=1,g.userData.isOutline=!0,n.add(g)}return n}function _s(t){t.traverse(s=>{var n,a;(n=s.geometry)==null||n.dispose(),Array.isArray(s.material)?s.material.forEach(r=>r.dispose()):(a=s.material)==null||a.dispose()})}function Qa({data:t,tab:s,ctx:n}){const{nodes:a=[],loading:r=!1}=t||{};return e.jsx(Za,{nodes:a,loading:r,onNavigateToNode:n!=null&&n.onNavigate?i=>n.onNavigate(i,void 0,{serviceCode:"psm",itemCode:"node"}):void 0})}function ei(t){return t?t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`:""}function ti({data:t}){const{text:s,loading:n,truncated:a,totalBytes:r}=t||{};return n?e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"Loading…"}):s?e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"},children:[e.jsx("pre",{style:{margin:0,padding:14,fontSize:11,lineHeight:1.55,fontFamily:"var(--mono)",whiteSpace:"pre-wrap",wordBreak:"break-all",color:"var(--text)",overflow:"auto",flex:1,boxSizing:"border-box"},children:s}),a&&e.jsxs("div",{style:{padding:"6px 14px",fontSize:11,color:"var(--muted)",borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:["Preview limited to first 64 KB",r?` — file is ${ei(r)}`:"","."]})]}):e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"No preview available"})}function si({descriptor:t,item:s,ctx:n,isActive:a,hasChildren:r,isExpanded:i,isLoading:o,onToggleChildren:c}){const{userId:g,stateColorMap:p,onNavigate:h}=n,x=s.id||s.ID,k=s.revision||s.REVISION||"A",N=s.iteration??s.ITERATION??1,_=s.lifecycle_state_id||s.LIFECYCLE_STATE_ID,z=s.logical_id||s.LOGICAL_ID||"",u=s.locked_by||s.LOCKED_BY||null,b=(s.tx_status||s.TX_STATUS||"COMMITTED")==="OPEN",y=u&&u!==g,j=u&&u===g,C=(t==null?void 0:t.color)??null;return e.jsxs("div",{className:`node-item${a?" active":""}`,onClick:()=>h(x,z||void 0,t),title:z||x,children:[e.jsx("span",{className:"ni-expand",style:{visibility:o||r?"visible":"hidden"},onClick:T=>c&&c(T),children:o?e.jsx("span",{style:{fontSize:9,color:"var(--muted)",lineHeight:1},children:"…"}):i?e.jsx(Me,{size:9,strokeWidth:2.5,color:"var(--muted)"}):e.jsx($e,{size:9,strokeWidth:2.5,color:"var(--muted)"})}),C&&e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:C,flexShrink:0,display:"inline-block"}}),e.jsx("span",{className:"ni-dot",style:{background:(p==null?void 0:p[_])||"#6b7280"}}),e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[z||e.jsx("span",{className:"ni-no-id",children:"—"}),(s.display_name||s.DISPLAY_NAME)&&e.jsx("span",{className:"ni-dname",children:s.display_name||s.DISPLAY_NAME})]}),e.jsx("span",{className:"ni-reviter",style:b?{color:"var(--warn)"}:void 0,children:N===0?k:`${k}.${N}`}),y&&e.jsx(ar,{size:10,strokeWidth:2.5,color:"var(--muted)",style:{flexShrink:0}}),j&&e.jsx(it,{size:10,strokeWidth:2.5,color:"var(--accent)",style:{flexShrink:0}})]})}function ni({descriptor:t,item:s,ctx:n,isActive:a}){const r=s.id,i=s.originalName||r,o=(t==null?void 0:t.color)||"var(--muted2)";return e.jsxs("div",{className:`node-item${a?" active":""}`,onClick:()=>n.onNavigate(r,i,t),title:i,children:[e.jsx("span",{className:"ni-expand",style:{visibility:"hidden"}}),e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:o,flexShrink:0,display:"inline-block"}}),e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:i})]})}let Ws=!1;function ri(){Ws||(Ws=!0,Fa(qa),cs({match:{serviceCode:"psm",itemCode:"node"},name:"psm-shell",NavRow:si,Preview:Qa,previewLabel:"3D Preview",hasItemChildren:t=>{const s=t.children_count??t.CHILDREN_COUNT;return s==null||s>0}}),cs({match:{serviceCode:"dst",itemCode:"data-object"},name:"dst-shell",NavRow:ni,Editor:gn,Preview:ti,previewLabel:"Preview",hasItemChildren:()=>!1}))}const pt={},Bt=[];function ai(t,s){return t.length!==s.length?!1:s.every((n,a)=>n==="*"||n===t[a])}const ss={emit(t){const s=t==null?void 0:t.type;if(!s)return;(pt[s]||[]).slice().forEach(a=>a(t));const n=s.split(":");Bt.forEach(({glob:a,handler:r})=>{ai(n,a)&&r(t)})},on(t,s){return(pt[t]??(pt[t]=[])).push(s),()=>this.off(t,s)},onPattern(t,s){const n={glob:t.split(":"),handler:s};return Bt.push(n),()=>{const a=Bt.indexOf(n);a!==-1&&Bt.splice(a,1)}},off(t,s){pt[t]=(pt[t]||[]).filter(n=>n!==s)}};let vn=null;function ii(){vn=null}function oi(){return vn}const li=l.createContext(null);function ci({navigate:t,openTab:s,closeTab:n}){const a=je.getState;return{navigate:t,openTab:s,closeTab:n,getToken:()=>ht(),getProjectSpaceId:()=>Gt(),emit:(r,i)=>ss.emit(r,i),on:(r,i)=>(ss.on(r,i),()=>ss.off(r,i)),getStore:()=>fe.getState(),usePlmStore:fe,useWebSocket:xs,api:X,txApi:rt,authoringApi:_r,cadApi:Br,pollJobStatus:cn,getDraggedNode:oi,clearDraggedNode:ii,getLinkRowForSource:Ua,icons:{NODE_ICONS:ft,SignIcon:Zs},components:{LifecycleDiagram:ra},http:{serviceRequest:(r,i,o,c)=>Mr(r,i,o,c),serviceUpload:(r,i,o,c)=>Vt(`/api/${r}${i}`,"POST",{Authorization:`Bearer ${ht()}`,"X-PLM-ProjectSpace":Gt()||""},o,c)},store:{registerSlice(r,i){fe.setState(o=>({_slices:{...o._slices,[r]:i.state??{}},_sliceActions:{...o._sliceActions,[r]:i.actions??{}}}))},getSlice:r=>{var i;return(i=fe.getState()._slices)==null?void 0:i[r]},useSlice:r=>fe(i=>{var o;return(o=i._slices)==null?void 0:o[r]}),dispatch(r,i,...o){var g,p;const c=(p=(g=fe.getState()._sliceActions)==null?void 0:g[r])==null?void 0:p[i];c&&c(fe.setState,fe.getState,...o)}},console:{addTab:(r,i,o)=>a().addConsoleTab(r,i,o),removeTab:r=>a().removeConsoleTab(r),log:(r,i)=>a().appendLog(r,i)},status:{register:(r,i,o)=>a().registerStatus(r,i,o),unregister:r=>a().unregisterStatus(r)},collab:{addTab:(r,i,o)=>a().addCollabTab(r,i,o),removeTab:r=>a().removeCollabTab(r)}}}async function di(t){const s=await X.getUiManifest();return(await Promise.allSettled(s.map(async a=>{const i=(await import(a.url)).default;if(!(i!=null&&i.id))throw new Error(`Plugin at ${a.url} has no id`);if(i.init&&i.init(t),oa(i),i.zone==="nav"&&i.match&&i.NavRow&&(Ds(i.match.serviceCode,i.match.itemCode,{NavRow:i.NavRow,ChildRow:i.ChildRow??null,hasItemChildren:i.hasItemChildren??(()=>!1),fetchChildren:i.fetchChildren??null,LinkRow:i.LinkRow??null}),i.linkSources&&i.LinkRow))for(const o of i.linkSources)Ds(o,null,{LinkRow:i.LinkRow})}))).map((a,r)=>{var i,o,c;return a.status==="rejected"?`${((i=s[r])==null?void 0:i.pluginId)??((o=s[r])==null?void 0:o.url)}: ${((c=a.reason)==null?void 0:c.message)??a.reason}`:null}).filter(Boolean)}const Gs=50,pi=8;function mi({jobData:t,onClose:s}){const{job:n,results:a=[]}=t,r=n.status==="DONE"||n.status==="FAILED",i=a.reduce((c,g)=>(c[g.action]=(c[g.action]||0)+1,c),{}),o=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${a.length} node${a.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(i).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(i).map(([c,g])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${o(c)}40`,color:o(c)},children:[c,": ",g]},c))}),a.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:a.map((c,g)=>e.jsxs("tr",{style:{borderTop:g>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:o(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||g))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:r?"Close":"Dismiss (job continues in background)"})})]})}function Fs({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:a,onCreateNode:r,refreshKey:i,toast:o,panelSection:c="MAIN"}){const g=fe(O=>O.items),p=fe(O=>O.itemsStatus),h=l.useMemo(()=>g.filter(O=>O.list),[g]),[x,k]=l.useState({}),[N,_]=l.useState({}),[z,u]=l.useState(new Set),[v,b]=l.useState(new Set),y=l.useRef({}),[,j]=l.useState(0),[C,T]=l.useState(null),[G,J]=l.useState(null),[I,m]=l.useState({}),[d,$]=l.useState(!1),[M,U]=l.useState(null),[f,D]=l.useState(null),E=l.useRef(null),L=l.useMemo(()=>({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:a}),[t,s,n,a]),S=l.useCallback(O=>`${O.serviceCode}:${O.itemCode}:${O.itemKey||""}`,[]);l.useEffect(()=>()=>{E.current&&clearInterval(E.current)},[]),l.useEffect(()=>{h.length!==0&&(u(new Set(h.map(S))),h.forEach(O=>w(O,0).catch(()=>null)))},[h,i]),l.useEffect(()=>{if(s){for(const[O,K]of Object.entries(x))if(((K==null?void 0:K.items)||[]).some(Y=>(Y.id||Y.ID)===s)){u(Y=>new Set([...Y,O]));return}}},[s,x]);async function w(O,K){const Y=S(O);_(V=>({...V,[Y]:!0}));try{const V=await X.fetchListableItems(t,O,K,Gs);k(Q=>{const ne=Q[Y],ee=K===0||!ne?V:{...V,items:[...ne.items||[],...V.items||[]]};return{...Q,[Y]:ee}})}catch{k(V=>({...V,[Y]:{items:[],totalElements:0,page:0,size:Gs}}))}finally{_(V=>({...V,[Y]:!1}))}}function R(O){const K=S(O);u(Y=>{const V=new Set(Y);return V.has(K)?V.delete(K):(V.add(K),!x[K]&&!N[K]&&w(O,0)),V})}function W(O){const K=S(O),Y=x[K];if(!Y||N[K])return;const V=(Y.page??0)+1;V>=(Y.totalPages??0)||w(O,V)}const F=l.useCallback(async(O,K,Y,V)=>{V&&V.stopPropagation(),b(ee=>{const te=new Set(ee);return te.has(O)?te.delete(O):te.add(O),te});const Q=K.id||K.ID;if(y.current[Q]!==void 0)return;const ne=Ls(Y);if(!ne.fetchChildren){y.current[Q]=[];return}y.current[Q]="loading",j(ee=>ee+1);try{const ee=await ne.fetchChildren(K,L);y.current[Q]=Array.isArray(ee)?ee:[]}catch{y.current[Q]=[]}j(ee=>ee+1)},[L]);function P(O,K,Y,V,Q,ne){if(Q>pi)return null;const ee=Y.id||Y.ID||V,te=y.current[ee];return!Array.isArray(te)||te.length===0||!O.ChildRow?null:te.map(re=>{const le=re.targetNodeId||re.id||re.ID,ye=`${V}/${re.linkId||le}`,de=!ne.has(le)&&v.has(ye);return e.jsxs(et.Fragment,{children:[e.jsx(O.ChildRow,{link:re,child:re,depth:Q,parentPath:ye,ancestorIds:ne,ctx:L,childCacheRef:y,expandedPaths:v,toggleNodeChildren:(pe,me,ue)=>F(pe,{id:me},K,ue)}),de&&P(O,K,{id:le},ye,Q+1,new Set([...ne,le]))]},ye)})}const H=l.useMemo(()=>{const O=String(c||"MAIN").toUpperCase(),K=h.filter(Q=>String(Q.panelSection||"MAIN").toUpperCase()===O),Y=new Map;for(const Q of K){const ne=Q.serviceCode||"_unknown";Y.has(ne)||Y.set(ne,[]),Y.get(ne).push(Q)}const V=[];for(const[Q,ne]of Y.entries()){ne.sort((re,le)=>(le.priority??100)-(re.priority??100));const ee=ne.reduce((re,le)=>Math.max(re,le.priority??100),0),te=ne[0].sourceLabel||Q;V.push({serviceCode:Q,label:te,maxPriority:ee,descriptors:ne})}return V.sort((Q,ne)=>ne.maxPriority-Q.maxPriority),V},[h,c]);async function B(){if(!C||!G)return;const{descriptor:O,action:K}=C,Y=`/api/${O.serviceCode}${K.path}`,V=new FormData;V.append("file",G),(K.parameters||[]).forEach(te=>{const re=I[te.name];re!=null&&re!==""&&V.append(te.name,re)});const Q={},ne=ht(),ee=Gt();ne&&(Q.Authorization=`Bearer ${ne}`),ee&&(Q["X-PLM-ProjectSpace"]=ee),$(!0),U(0);try{const te=await Vt(Y,"POST",Q,V,le=>U(le));if(!te.ok){const le=await te.json().catch(()=>({}));throw new Error(le.error||le.message||`HTTP ${te.status}`)}const re=await te.json().catch(()=>null);if(T(null),U(null),re!=null&&re.jobId&&K.jobStatusPath){const le=K.jobStatusPath.replace("{jobId}",re.jobId);D({id:re.jobId,data:{job:{id:re.jobId,status:re.status||"PENDING"},results:[]}}),E.current&&clearInterval(E.current),E.current=setInterval(async()=>{var ye,ce,de;try{const pe=await cn(O.serviceCode,le);D(me=>me?{...me,data:pe}:null),(((ye=pe.job)==null?void 0:ye.status)==="DONE"||((ce=pe.job)==null?void 0:ce.status)==="FAILED")&&(clearInterval(E.current),E.current=null,((de=pe.job)==null?void 0:de.status)==="DONE"&&w(O,0))}catch{}},2e3)}else o==null||o(`${G.name} imported`,"success"),w(O,0)}catch(te){T(null),U(null),o==null||o(te,"error")}finally{$(!1)}}return p!=="loaded"&&c==="MAIN"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):H.length===0?null:e.jsxs(e.Fragment,{children:[C&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:O=>{O.target===O.currentTarget&&!d&&T(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:C.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!d&&T(null),disabled:d,children:e.jsx(kt,{size:14})})]}),C.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:C.action.description}),M!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[M,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${M}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:C.action.acceptedTypes||void 0,disabled:d,onChange:O=>{var K;return J(((K=O.target.files)==null?void 0:K[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),G&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[G.name," (",(G.size/1024).toFixed(1)," KB)"]}),(C.action.parameters||[]).map(O=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[O.label,O.required?" *":""]}),O.widgetType==="DROPDOWN"&&O.allowedValues?e.jsx("select",{disabled:d,value:I[O.name]??(O.defaultValue||""),onChange:K=>m(Y=>({...Y,[O.name]:K.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(O.allowedValues).map(K=>e.jsx("option",{value:K.value,children:K.label},K.value))}):e.jsx("input",{type:"text",disabled:d,value:I[O.name]??(O.defaultValue||""),onChange:K=>m(Y=>({...Y,[O.name]:K.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),O.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:O.tooltip})]},O.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!d&&T(null),disabled:d,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:B,disabled:!G||d,children:d?"Importing…":"Import"})]})]})}),f&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:O=>{O.target===O.currentTarget&&D(null)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:O=>O.stopPropagation(),children:e.jsx(mi,{jobData:f.data,onClose:()=>D(null)})})}),H.map(({serviceCode:O,label:K,descriptors:Y})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(ps,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:K})]})}),e.jsx("div",{className:"node-list",children:Y.map(V=>{var me;const Q=S(V),ne=z.has(Q),ee=!!N[Q],te=x[Q],re=(te==null?void 0:te.items)||[],le=(te==null?void 0:te.totalElements)??re.length,ye=V.icon?ft[V.icon]:null,ce=te&&(te.totalPages??0)>(te.page??0)+1,de=Ls(V),pe=de.NavRow;return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>R(V),children:[e.jsx("span",{className:"type-chevron",children:ne?e.jsx(Me,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx($e,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),ye?e.jsx(ye,{size:11,color:V.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):V.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:V.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:V.description||void 0,children:V.displayName}),e.jsx("span",{className:"type-group-count",children:ee&&re.length===0?"…":le}),V.create&&r&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${V.displayName}`,onClick:ue=>{ue.stopPropagation(),r(V)},children:e.jsx(Re,{size:10,strokeWidth:2.5})}),((me=V.importActions)==null?void 0:me.length)>0&&e.jsx("button",{className:"type-group-create-btn",title:V.importActions[0].name||`Import ${V.displayName}`,onClick:ue=>{ue.stopPropagation(),J(null),m({}),T({descriptor:V,action:V.importActions[0]})},children:e.jsx(ir,{size:10,strokeWidth:2.5})})]}),ne&&e.jsxs(e.Fragment,{children:[ee&&re.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Loading…"}),!ee&&re.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),re.length>0&&re.map(ue=>{const Te=ue.id||ue.ID,Ke=`${Q}/${Te}`,_e=v.has(Ke),Le=y.current[Te]==="loading",ot=de.hasItemChildren?de.hasItemChildren(ue):!1;return e.jsxs(et.Fragment,{children:[pe&&e.jsx(pe,{descriptor:V,item:ue,ctx:L,isActive:Te===s,hasChildren:ot,isExpanded:_e,isLoading:Le,onToggleChildren:lt=>F(Ke,ue,V,lt)}),_e&&P(de,V,ue,Ke,1,new Set([Te]))]},Te)}),ce&&e.jsx("div",{className:"panel-empty",style:{fontSize:10,cursor:"pointer",color:"var(--muted2)"},onClick:()=>W(V),children:ee?"Loading…":`Load more (${le-re.length} remaining)`})]})]},Q)})})]},O))]})}const Us={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function ui({nodeTypes:t,tx:s,txNodes:n,userId:a,activeNodeId:r,stateColorMap:i,onNavigate:o,canCreateNode:c,onCreateNode:g,onCommit:p,onRollback:h,onReleaseNode:x,showSettings:k,activeSettingsSection:N,onSettingsSectionChange:_,settingsSections:z,isDashboardOpen:u,onOpenDashboard:v,browseRefreshKey:b,style:y,toast:j}){const[C,T]=l.useState(null),G=(s==null?void 0:s.ID)||(s==null?void 0:s.id),J=n||[],I=et.useMemo(()=>{const m=new Map;return(t||[]).forEach(d=>{const $=d.id||d.ID;m.set($,{name:d.name||d.NAME||$,color:d.color||d.COLOR||null,icon:d.icon||d.ICON||null})}),m},[t]);return e.jsx("aside",{className:"left-panel",style:y,children:k?e.jsx("div",{className:"settings-section-nav",children:(z||[]).map(m=>e.jsxs("div",{children:[e.jsx("div",{className:"settings-nav-group-label",children:m.groupLabel}),m.sections.map(({key:d,label:$,icon:M})=>{const U=M?Gr[M]:null;return e.jsxs("div",{className:`settings-nav-item${N===d?" active":""}`,onClick:()=>_(d),children:[U&&e.jsx(U,{size:13,strokeWidth:1.8,color:N===d?"var(--accent)":"var(--muted)"}),$]},d)})]},m.groupKey))}):e.jsxs(e.Fragment,{children:[!u&&e.jsxs("button",{className:"panel-dash-btn",onClick:v,title:"Open dashboard",children:[e.jsx("span",{style:{opacity:.7,lineHeight:1},children:"⬡"}),"Dashboard"]}),c&&e.jsxs("div",{className:"panel-section-header",style:{flex:"0 0 auto"},children:[e.jsx("div",{style:{flex:1}}),e.jsx("button",{className:"panel-icon-btn",title:"Create new object",onClick:()=>g(),children:e.jsx(Re,{size:13,color:"var(--accent)",strokeWidth:2.5})})]}),e.jsx("div",{style:{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column"},children:e.jsx(Fs,{userId:a,activeNodeId:r,stateColorMap:i,onNavigate:o,onCreateNode:g,refreshKey:b,panelSection:"MAIN",toast:j})}),e.jsx(Fs,{userId:a,activeNodeId:r,stateColorMap:i,onNavigate:o,refreshKey:b,panelSection:"INFO",toast:j}),e.jsxs("div",{className:"panel-section tx-panel",children:[e.jsxs("div",{className:"panel-section-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(bs,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsxs("span",{className:"panel-label",children:["Transaction",G&&e.jsxs("span",{className:"tx-id-badge",children:[G.slice(0,8),"…"]})]})]}),J.length>0&&e.jsx("span",{className:"tx-count-badge",children:J.length})]}),e.jsx("div",{className:"tx-list",children:G?J.length===0?e.jsxs("div",{className:"panel-empty",children:["Transaction open —",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"no objects checked out yet."})]}):J.map((m,d)=>{const $=m.node_id||m.NODE_ID,M=m.logical_id||m.LOGICAL_ID||"",U=m.node_type_name||m.NODE_TYPE_NAME||"",f=m.node_type_id||m.NODE_TYPE_ID||"",D=m.revision||m.REVISION||"A",E=m.iteration??m.ITERATION??1,L=(m.change_type||m.CHANGE_TYPE||"CONTENT").toUpperCase(),S=m.lifecycle_state_id||m.LIFECYCLE_STATE_ID||"",w=Us[L]||Us.CONTENT,R=$===r,W=C===$,F=I.get(f),P=(F==null?void 0:F.color)||null,H=F!=null&&F.icon?ft[F.icon]:null;return W?e.jsxs("div",{className:"tx-item tx-item-confirm",onClick:B=>B.stopPropagation(),children:[e.jsx("span",{className:"tx-type-icon",children:H?e.jsx(H,{size:11,color:P||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:P||"var(--muted2)",display:"inline-block"}})}),e.jsxs("span",{className:"tx-confirm-msg",children:["Release ",M||$,"?"]}),e.jsx("button",{className:"btn btn-danger btn-xs",onClick:()=>{x&&x($),T(null)},children:"Yes"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>T(null),children:"No"})]},d):e.jsxs("div",{className:`tx-item${R?" active":""}`,onClick:()=>o($,M||void 0,Tt),title:U,children:[e.jsx("span",{className:"tx-type-icon",children:H?e.jsx(H,{size:11,color:P||"var(--muted2)",strokeWidth:2}):P?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:P,display:"inline-block"}}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:"var(--muted2)",display:"inline-block"}})}),e.jsx("span",{className:"tx-logical",children:M||$}),e.jsx("span",{className:"tx-reviter",style:{color:(i==null?void 0:i[S])||"var(--muted2)"},children:E===0?D:`${D}.${E}`}),e.jsx("span",{className:"tx-ct-badge",style:{background:w.bg,color:w.color},children:w.label}),e.jsx("button",{className:"tx-release-btn",title:"Release from transaction",onClick:B=>{B.stopPropagation(),T($)},children:e.jsx(or,{size:12,strokeWidth:2,color:"var(--muted)"})})]},d)}):e.jsxs("div",{className:"panel-empty",children:["No active transaction.",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"Checkout an object to begin."})]})}),G&&e.jsxs("div",{className:"tx-actions",children:[e.jsxs("button",{className:"btn btn-success btn-sm",style:{flex:1},onClick:p,children:[e.jsx(bs,{size:12,strokeWidth:2}),"Commit"]}),e.jsxs("button",{className:"btn btn-danger btn-sm",onClick:h,children:[e.jsx(lr,{size:12,strokeWidth:2}),"Rollback"]})]})]})]})})}const hi=et.memo(ui);function xi(t){return e.jsx(hi,{...t})}const Hs={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}},fi={PRIMARY:"var(--accent)",SECONDARY:"var(--muted)",DANGEROUS:"var(--danger)"};function yn({revision:t,iteration:s}){const n=s===0?t:`${t}.${s}`;return e.jsx("span",{className:"dash-rev",children:n})}function jn({lifecycleStateId:t,stateColorMap:s}){const n=(s==null?void 0:s[t])||"#6b7280";return e.jsx("span",{className:"dash-state-dot",style:{background:n},title:t})}function wn({nodeTypeId:t,nodeTypeName:s,nodeTypes:n}){const a=(n||[]).find(c=>(c.id||c.ID)===t),r=(a==null?void 0:a.color)||(a==null?void 0:a.COLOR)||null,i=(a==null?void 0:a.icon)||(a==null?void 0:a.ICON)||null,o=i?ft[i]:null;return e.jsxs("span",{className:"dash-type-chip",children:[o?e.jsx(o,{size:9,color:r||"var(--muted2)",strokeWidth:2}):r?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:r,display:"inline-block",flexShrink:0}}):null,e.jsx("span",{style:{color:"var(--muted2)"},children:s||t})]})}function gi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}){var x,k,N,_;const[r,i]=l.useState(void 0),[o,c]=l.useState(!0),[g,p]=l.useState(null),h=l.useCallback(async()=>{c(!0),p(null);try{const z=await X.getDashboardTransaction(t);i(z||null)}catch(z){p(z.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{h()},[h]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Open transaction"}),e.jsx("button",{className:"dash-refresh-btn",onClick:h,title:"Refresh",disabled:o,children:e.jsx("span",{style:{display:"inline-block",transform:"none"},children:"⟳"})})]}),o&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),g&&e.jsx("div",{className:"dash-error",children:g}),!o&&!g&&!r&&e.jsx("div",{className:"dash-empty",children:"No open transaction"}),!o&&!g&&r&&e.jsxs("div",{className:"dash-tx-card",children:[e.jsxs("div",{className:"dash-tx-header",children:[e.jsxs("span",{className:"dash-tx-id",children:[(x=r.txId)==null?void 0:x.slice(0,8),"…"]}),e.jsx("span",{className:"dash-tx-title",children:r.title}),e.jsxs("span",{className:"dash-tx-count",children:[((k=r.nodes)==null?void 0:k.length)||0," object",((N=r.nodes)==null?void 0:N.length)!==1?"s":""]})]}),((_=r.nodes)==null?void 0:_.length)>0&&e.jsx("div",{className:"dash-tx-nodes",children:r.nodes.map(z=>{const u=Hs[(z.changeType||"CONTENT").toUpperCase()]||Hs.CONTENT;return e.jsxs("button",{className:"dash-tx-node",onClick:()=>a(z.nodeId,z.logicalId||z.nodeId,Tt),children:[e.jsx(jn,{lifecycleStateId:z.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:z.logicalId||z.nodeId}),e.jsx(yn,{revision:z.revision,iteration:z.iteration}),e.jsx(wn,{nodeTypeId:z.nodeTypeId,nodeTypeName:z.nodeTypeName,nodeTypes:n}),e.jsx("span",{className:"dash-badge",style:{background:u.bg,color:u.color},children:u.label})]},z.nodeId)})})]})]})}function bi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}){const[r,i]=l.useState(null),[o,c]=l.useState(!0),[g,p]=l.useState(null),h=l.useCallback(async()=>{c(!0),p(null);try{const x=await X.getDashboardWorkItems(t);i(Array.isArray(x)?x:[])}catch(x){p(x.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{h()},[h]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Objects you can work on"}),e.jsx("span",{className:"dash-section-hint",children:"last 10 · sorted by available actions"}),e.jsx("button",{className:"dash-refresh-btn",onClick:h,title:"Refresh",disabled:o,children:"⟳"})]}),o&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),g&&e.jsx("div",{className:"dash-error",children:g}),!o&&!g&&(r==null?void 0:r.length)===0&&e.jsx("div",{className:"dash-empty",children:"No actionable objects found"}),!o&&!g&&(r==null?void 0:r.length)>0&&e.jsx("div",{className:"dash-work-list",children:r.map(x=>e.jsxs("button",{className:"dash-work-item",onClick:()=>a(x.nodeId,x.logicalId||x.nodeId,Tt),children:[e.jsxs("div",{className:"dash-work-row",children:[e.jsx(jn,{lifecycleStateId:x.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:x.logicalId||x.nodeId}),e.jsx(yn,{revision:x.revision,iteration:x.iteration}),e.jsx(wn,{nodeTypeId:x.nodeTypeId,nodeTypeName:x.nodeTypeName,nodeTypes:n})]}),e.jsx("div",{className:"dash-action-chips",children:x.actions.map(k=>{var z,u;const N=((z=k.guardViolations)==null?void 0:z.length)>0,_=N?"Blocked: "+k.guardViolations.map(v=>v.message||v.code).join("; "):k.description||k.label;return e.jsx("span",{className:"dash-action-chip",title:_,style:{color:fi[(u=k.metadata)==null?void 0:u.displayCategory]||"var(--muted)",opacity:N?.45:1},children:k.label},k.code)})})]},x.nodeId))})]})}function vi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}){return e.jsxs("div",{className:"dashboard",children:[e.jsxs("div",{className:"dash-hero",children:[e.jsx("span",{className:"dash-hero-icon",children:"⬡"}),e.jsxs("div",{children:[e.jsx("div",{className:"dash-hero-title",children:"Dashboard"}),e.jsx("div",{className:"dash-hero-sub",children:"Quick overview of your work session"})]})]}),e.jsxs("div",{className:"dash-body",children:[e.jsx(gi,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}),e.jsx(bi,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a})]})]})}function yi({tabs:t,activeTabId:s,userId:n,tx:a,toast:r,nodeTypes:i,stateColorMap:o,onTabActivate:c,onTabClose:g,onTabPin:p,onSubTabChange:h,onNavigate:x,onAutoOpenTx:k,onDescriptionLoaded:N,onRefreshItemData:_,onOpenCommentsForVersion:z,onCommentAttribute:u,tabItemData:v}){const b=je(P=>P.showCollab),y=je(P=>P.toggleCollab),j="dashboard",C=t.find(P=>P.id===s),T=!!(C!=null&&C.nodeId),[G,J]=l.useState({}),I=l.useRef(null),m=l.useRef({});l.useEffect(()=>{var H,B;const P=new Set(t.map(O=>O.id));J(O=>Object.fromEntries(Object.entries(O).filter(([K])=>P.has(K))));for(const O of Object.keys(m.current))P.has(O)||((B=(H=m.current)[O])==null||B.call(H),delete m.current[O])},[t]),l.useEffect(()=>()=>{var P,H;s&&((H=(P=m.current)[s])==null||H.call(P),delete m.current[s])},[s]);const d=s?G[s]??{data:null,closed:!1,maximized:!1,splitPos:50}:null;function $(P){s&&J(H=>({...H,[s]:{closed:!1,maximized:!1,splitPos:50,...H[s],...P}}))}function M(P){s&&J(H=>({...H,[s]:{closed:!1,maximized:!1,splitPos:50,...H[s],data:P}}))}function U(P){var H,B;s&&((B=(H=m.current)[s])==null||B.call(H),m.current[s]=P)}function f(P){P.preventDefault();const H=I.current;if(!H)return;function B(K){const Y=H.getBoundingClientRect();$({splitPos:Math.max(20,Math.min(80,(K.clientX-Y.left)/Y.width*100))})}function O(){window.removeEventListener("mousemove",B),window.removeEventListener("mouseup",O)}window.addEventListener("mousemove",B),window.addEventListener("mouseup",O)}const D=C&&C.id!==j?Ga(C):null,E=C&&C.id!==j?la(C)??D:null,L=(D==null?void 0:D.Preview)??null,S=(D==null?void 0:D.previewLabel)??"Preview",w=!!L,R=(d==null?void 0:d.closed)??!1,W=(d==null?void 0:d.maximized)??!1,F=(d==null?void 0:d.splitPos)??50;return e.jsx("div",{className:"editor-area",children:e.jsxs("div",{className:"editor-main",children:[e.jsxs("div",{className:"tab-bar",children:[t.length===0?e.jsx("div",{className:"tab-bar-empty",children:"Open an object from the navigation panel"}):t.map(P=>{var V;const H=P.id===j,B=P.nodeTypeId?(i||[]).find(Q=>(Q.id||Q.ID)===P.nodeTypeId):null,O=(B==null?void 0:B.color)||(B==null?void 0:B.COLOR)||null,K=(B==null?void 0:B.icon)||(B==null?void 0:B.ICON)||null,Y=K?ft[K]:null;return e.jsxs("div",{className:`editor-tab ${P.id===s?"active":""}`,onClick:()=>c(P.id),children:[H&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0,opacity:.6},children:"⬡"}),!H&&(Y||O)&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:Y?e.jsx(Y,{size:10,color:O||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:O,display:"inline-block"}})}),e.jsx("span",{className:"tab-node-id",children:P.label||((V=P.nodeId)==null?void 0:V.slice(0,10))+"…"}),e.jsx("button",{className:`tab-pin ${P.pinned?"active":""}`,title:P.pinned?"Unpin tab":"Pin tab",onClick:Q=>{Q.stopPropagation(),p(P.id)},children:P.pinned?e.jsx(cr,{size:11,color:"var(--accent)",strokeWidth:2}):e.jsx(dr,{size:11,color:"var(--muted)",strokeWidth:2})}),e.jsx("button",{className:"tab-close",title:"Close tab",onClick:Q=>{Q.stopPropagation(),g(P.id)},children:e.jsx(kt,{size:11,color:"var(--muted)",strokeWidth:2.5})})]},P.id)}),t.length>0&&e.jsx("div",{className:"tab-add",title:"Pin a tab or navigate to open a new one",children:e.jsx(Re,{size:13,color:"var(--muted)",strokeWidth:2})}),T&&e.jsx("button",{className:`tab-comments-toggle${b?" active":""}`,onClick:y,title:b?"Hide comments":"Show comments",children:"💬"})]}),e.jsxs("div",{ref:I,style:{flex:1,display:"flex",overflow:"hidden",minHeight:0},children:[e.jsx("div",{className:"editor-content",style:w?{width:R?"calc(100% - 28px)":W?0:`${F}%`,flex:"none",overflow:W?"hidden":void 0,transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"}:void 0,children:C?C.id===j?e.jsx(vi,{userId:n,stateColorMap:o,nodeTypes:i,onNavigate:x}):(()=>{const P=(E==null?void 0:E.Editor)??(E==null?void 0:E.Component),H={userId:n,tx:a,nodeTypes:i,stateColorMap:o,toast:r,onAutoOpenTx:k,onDescriptionLoaded:N,onRefreshItemData:_,onOpenCommentsForVersion:z,onCommentAttribute:u,onSubTabChange:h,onNavigate:x,onRegisterPreview:M,onRegisterCancel:U,itemData:v};return P?e.jsx(P,{tab:C,ctx:H}):e.jsx("div",{className:"editor-empty",children:e.jsx("div",{className:"editor-empty-text",children:"Loading editor…"})})})():e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⬡"}),e.jsx("div",{className:"editor-empty-text",children:"No object open"}),e.jsx("div",{className:"editor-empty-hint",children:"Select an object in the navigation panel to open it here"})]})}),w&&(R?e.jsx("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderLeft:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--surface)",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onClick:()=>$({closed:!1}),title:`Open ${S}`,children:e.jsxs("span",{style:{writingMode:"vertical-rl",fontSize:11,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1},children:[S," ▶"]})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{width:W?0:5,cursor:"col-resize",background:"var(--border)",flexShrink:0,userSelect:"none",overflow:"hidden",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onMouseDown:W?void 0:f}),e.jsxs("div",{style:{flex:1,minWidth:0,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1},children:[e.jsx("span",{children:S}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:2},children:[e.jsx("button",{className:"panel-icon-btn",title:W?"Restore":`Maximize ${S}`,onClick:()=>$({maximized:!W}),children:W?e.jsx(pr,{size:13}):e.jsx(mr,{size:13})}),e.jsx("button",{className:"panel-icon-btn",title:`Collapse ${S}`,onClick:()=>$({closed:!0}),children:e.jsx(kt,{size:13})})]})]}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(L,{data:(d==null?void 0:d.data)??null,tab:C,ctx:{userId:n,tx:a,nodeTypes:i,stateColorMap:o,toast:r,onAutoOpenTx:k,onDescriptionLoaded:N,onRefreshItemData:_,onOpenCommentsForVersion:z,onCommentAttribute:u,onSubTabChange:h,onNavigate:x,onRegisterPreview:M,itemData:v}})})]})]}))]})]})})}function ji(t){const s=je(r=>r.openCollab),n=je(r=>r.setVersionFilter),a=je(r=>r.setTriggerText);return e.jsx(yi,{...t,onOpenCommentsForVersion:r=>{n(r),s()},onCommentAttribute:r=>{a("#"+r+" "),s()}})}function wi(t){const s={};t.forEach(r=>{s[r.id]={...r,children:[]}});const n=[];t.forEach(r=>{r.parentCommentId&&s[r.parentCommentId]?s[r.parentCommentId].children.push(s[r.id]):n.push(s[r.id])});function a(r){r.sort((i,o)=>new Date(i.createdAt)-new Date(o.createdAt)),r.forEach(i=>a(i.children))}return a(n),n}function Si(t){const s=t.match(/#(\S+)/);return s?s[1]:null}function ki(t,s){const n=t.slice(0,s);for(let a=n.length-1;a>=0;a--){const r=n[a];if(r==="#"||r==="@"){if(a===0||/\s/.test(n[a-1])){const i=n.slice(a+1);if(!/\s/.test(i))return{type:r,query:i,start:a}}return null}if(/\s/.test(r))return null}return null}function Ni({text:t,attrMap:s,userMap:n}){const a=[],r=/(#\S+|@\S+)/g;let i=0,o;for(;(o=r.exec(t))!==null;){o.index>i&&a.push({kind:"text",value:t.slice(i,o.index)});const c=o[0];if(c.startsWith("#")){const g=c.slice(1),p=s[g];a.push({kind:"attr",id:g,label:p})}else{const g=c.slice(1),p=n[g];a.push({kind:"user",id:g,name:p})}i=o.index+c.length}return i<t.length&&a.push({kind:"text",value:t.slice(i)}),e.jsx("span",{children:a.map((c,g)=>c.kind==="text"?e.jsx("span",{children:c.value},g):c.kind==="attr"?e.jsxs("span",{className:"mention-chip mention-attr",title:`Attribute: ${c.id}`,children:["#",c.label||c.id]},g):e.jsxs("span",{className:"mention-chip mention-user",title:`User: ${c.id}`,children:["@",c.name||c.id]},g))})}function Ci({items:t,activeIdx:s,onSelect:n,onHover:a}){return e.jsx("ul",{className:"autocomplete-dropdown",children:t.map((r,i)=>e.jsxs("li",{className:`autocomplete-item${i===s?" active":""}`,onMouseEnter:()=>a(i),onMouseDown:o=>{o.preventDefault(),n(r)},children:[e.jsxs("span",{className:"autocomplete-item-id",children:[r.prefix,r.id]}),r.label&&e.jsx("span",{className:"autocomplete-item-label",children:r.label})]},r.id))})}function Ei({nodeId:t,userId:s,width:n,onClose:a,filterVersionId:r,onClearFilter:i,users:o,triggerText:c,onClearTrigger:g}){const[p,h]=l.useState([]),[x,k]=l.useState(""),[N,_]=l.useState(null),[z,u]=l.useState(!1),[v,b]=l.useState(null),[y,j]=l.useState(0),C=l.useRef(null),T=fe(w=>w.activeNodeDescs[t]),G=T==null?void 0:T.currentVersionId,J=l.useMemo(()=>{const w={};return((T==null?void 0:T.attributes)||[]).forEach(R=>{w[R.id]=R.label}),w},[T==null?void 0:T.attributes]),I=l.useMemo(()=>{const w={};return(o||[]).forEach(R=>{w[R.id]=R.displayName||R.username}),w},[o]),m=l.useMemo(()=>{if(!v)return[];const w=v.query.toLowerCase();return v.type==="#"?((T==null?void 0:T.attributes)||[]).filter(R=>R.id.toLowerCase().includes(w)||R.label.toLowerCase().includes(w)).slice(0,8).map(R=>({id:R.id,label:R.label,prefix:"#"})):(o||[]).filter(R=>R.id.toLowerCase().includes(w)||(R.displayName||R.username||"").toLowerCase().includes(w)).slice(0,8).map(R=>({id:R.id,label:R.displayName||R.username,prefix:"@"}))},[v,T==null?void 0:T.attributes,o]),d=l.useCallback(async()=>{if(t)try{const w=await X.getComments(s,t);h(Array.isArray(w)?w:[])}catch{}},[t,s]);l.useEffect(()=>{d()},[d]),xs(t?`/topic/nodes/${t}`:null,w=>{w.nodeId&&w.nodeId!==t||w.event==="COMMENT_ADDED"&&d()},s),l.useEffect(()=>{c&&(k(c),g==null||g(),setTimeout(()=>{const w=C.current;w&&(w.focus(),w.setSelectionRange(c.length,c.length))},50))},[c]),l.useEffect(()=>{_(null),k(""),b(null)},[t]);const $=l.useMemo(()=>wi(p),[p]),M=l.useMemo(()=>r?$.filter(w=>w.versionId===r):$,[$,r]),U=l.useMemo(()=>{function w(R){return R.reduce((W,F)=>W+1+w(F.children),0)}return w(M)},[M]);function f(w){const R=w.target.value,W=w.target.selectionStart;k(R);const F=ki(R,W);b(F),j(0)}function D(w){if(!v)return;const R=x.slice(0,v.start),W=x.slice(v.start+1+v.query.length),F=w.prefix+w.id+" ",P=R+F+W;k(P),b(null),setTimeout(()=>{const H=C.current;if(H){const B=R.length+F.length;H.focus(),H.setSelectionRange(B,B)}},0)}function E(w){if(v&&m.length>0){if(w.key==="ArrowDown"){w.preventDefault(),j(R=>Math.min(R+1,m.length-1));return}if(w.key==="ArrowUp"){w.preventDefault(),j(R=>Math.max(R-1,0));return}if(w.key==="Enter"||w.key==="Tab"){w.preventDefault(),D(m[y]);return}if(w.key==="Escape"){b(null);return}}w.key==="Enter"&&w.ctrlKey&&x.trim()&&L()}async function L(){if(!(!x.trim()||!G)){u(!0);try{const w=Si(x.trim());await X.addComment(s,t,G,x.trim(),(N==null?void 0:N.id)||null,w||null),k(""),_(null),b(null),await d()}catch{}finally{u(!1)}}}const S=T?`${T.revision??""}${T.iteration!=null?"."+T.iteration:""}`:"";return e.jsxs("div",{className:"comment-panel",style:{width:n},onClick:()=>v&&b(null),children:[e.jsxs("div",{className:"comment-panel-header",children:[e.jsxs("span",{children:["Comments",p.length>0&&e.jsx("span",{className:"comment-count-badge",children:p.length})]}),e.jsx("button",{className:"comment-close-btn",onClick:a,title:"Close",children:"✕"})]}),r&&e.jsxs("div",{className:"comment-filter-banner",children:[e.jsxs("span",{children:["Filtered: rev ",(()=>{const w=p.find(R=>R.versionId===r);return w?`${w.revision}.${w.iteration}`:r.slice(0,8)+"…"})()," · ",U," comment",U!==1?"s":""]}),e.jsx("button",{className:"comment-filter-clear",onClick:i,children:"Show all"})]}),e.jsx("div",{className:"comment-panel-list",children:M.length===0?e.jsx("div",{className:"comment-empty",children:r?"No comments on this version":"No comments yet"}):M.map(w=>e.jsx(Sn,{node:w,depth:0,onReply:_,activeReplyId:N==null?void 0:N.id,userId:s,attrMap:J,userMap:I},w.id))}),e.jsxs("div",{className:"comment-panel-input",onClick:w=>w.stopPropagation(),children:[G&&S&&e.jsxs("div",{className:"comment-version-context",children:["Commenting on rev ",e.jsx("strong",{children:S})]}),N&&e.jsxs("div",{className:"comment-reply-context",children:[e.jsxs("span",{children:["↩ Replying to ",e.jsx("strong",{children:N.author})]}),e.jsx("button",{className:"comment-cancel-reply",onClick:()=>_(null),children:"✕"})]}),e.jsxs("div",{className:"comment-input-wrap",children:[e.jsx("textarea",{ref:C,className:"field-input comment-textarea",rows:3,placeholder:G?"Write a comment… (# attr, @ user, Ctrl+Enter to post)":"No version available",value:x,onChange:f,onKeyDown:E,disabled:!G||z}),v&&m.length>0&&e.jsx(Ci,{items:m,activeIdx:y,onSelect:D,onHover:j})]}),e.jsx("button",{className:"btn btn-sm btn-success comment-post-btn",disabled:!x.trim()||!G||z,onClick:L,children:N?"↩ Post reply":"Post comment"})]})]})}const Ti=72,zi=16;function Sn({node:t,depth:s,onReply:n,activeReplyId:a,userId:r,attrMap:i,userMap:o}){const c=Math.min(s*zi,Ti),g=a===t.id;return e.jsxs("div",{style:{marginLeft:s>0?c:0},children:[e.jsx(Ai,{comment:t,onReply:n,isReply:s>0,isHighlighted:g,isOwn:t.author===r,attrMap:i,userMap:o}),t.children.length>0&&e.jsx("div",{className:"comment-children",style:{borderLeft:"2px solid var(--border2)",marginLeft:10},children:t.children.map(p=>e.jsx(Sn,{node:p,depth:s+1,onReply:n,activeReplyId:a,userId:r,attrMap:i,userMap:o},p.id))})]})}function Ai({comment:t,onReply:s,isReply:n,isHighlighted:a,isOwn:r,attrMap:i,userMap:o}){const c=t.createdAt?new Date(t.createdAt).toLocaleString(void 0,{dateStyle:"short",timeStyle:"short"}):"",g=["comment-item",n?"comment-reply":"",a?"comment-highlighted":"",r?"comment-own":""].filter(Boolean).join(" ");return e.jsxs("div",{className:g,children:[e.jsxs("div",{className:"comment-meta",children:[e.jsxs("span",{className:r?"comment-author comment-author-own":"comment-author",children:[t.author,r&&e.jsx("span",{className:"comment-you-badge",children:"you"})]}),t.attributeName&&e.jsxs("span",{className:"comment-attr-badge",title:`Attribute: ${t.attributeName}`,children:["#",i[t.attributeName]||t.attributeName]}),e.jsxs("span",{className:"comment-version",title:`Version ID: ${t.versionId}`,children:[t.revision,".",t.iteration]}),e.jsx("span",{className:"comment-time",children:c})]}),e.jsx("div",{className:"comment-text",children:e.jsx(Ni,{text:t.text,attrMap:i,userMap:o})}),e.jsx("button",{className:"comment-reply-btn",onClick:()=>s({id:t.id,author:t.author}),children:"↩ Reply"})]})}function Ii({activeNodeId:t,userId:s,users:n}){const a=je(N=>N.showCollab),r=je(N=>N.collabWidth),i=je(N=>N.setCollabWidth),o=je(N=>N.closeCollab),c=je(N=>N.collabVersionFilter),g=je(N=>N.setVersionFilter),p=je(N=>N.collabTriggerText),h=je(N=>N.clearTriggerText),x=je(N=>N.collabTabs),k=l.useCallback(N=>{const _=N.clientX,z=r;function u(b){i(Math.max(240,Math.min(560,z+_-b.clientX)))}function v(){document.removeEventListener("mousemove",u),document.removeEventListener("mouseup",v)}document.addEventListener("mousemove",u),document.addEventListener("mouseup",v)},[r,i]);return!a||!t?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"resize-handle comment-resize",onMouseDown:k}),e.jsx(Ei,{nodeId:t,userId:s,width:r,onClose:o,filterVersionId:c,onClearFilter:()=>g(null),users:n,triggerText:p,onClearTrigger:h}),x.map(N=>e.jsx("div",{style:{display:"none"}},N.id))]})}const Pi={error:"var(--danger, #fc8181)",warn:"var(--warning, #f0b429)",info:"var(--muted)",debug:"var(--muted2)"};function Ri(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function Vs(){const t=je(n=>n.consoleLog),s=l.useRef(null);return l.useEffect(()=>{var n;(n=s.current)==null||n.scrollIntoView({behavior:"smooth"})},[t.length]),t.length===0?e.jsx("div",{style:{padding:"16px",color:"var(--muted)",fontSize:12,fontStyle:"italic"},children:"No platform events yet."}):e.jsxs("div",{style:{fontFamily:"monospace",fontSize:11,overflow:"auto",height:"100%",padding:"4px 8px"},children:[t.map((n,a)=>{var r;return e.jsxs("div",{style:{display:"flex",gap:8,lineHeight:"18px"},children:[e.jsx("span",{style:{color:"var(--muted2)",flexShrink:0},children:Ri(n.ts)}),e.jsx("span",{style:{color:Pi[n.level]??"inherit",flexShrink:0,width:40},children:(r=n.level)==null?void 0:r.toUpperCase()}),e.jsx("span",{style:{wordBreak:"break-all"},children:n.message})]},a)}),e.jsx("div",{ref:s})]})}function $i(){var p;const t=je(h=>h.consoleVisible),s=je(h=>h.consoleHeight),n=je(h=>h.setConsoleHeight),a=je(h=>h.consoleTabs),[r,i]=l.useState("console"),o=[{id:"console",label:"Console",Component:Vs},...a],c=l.useCallback(h=>{h.preventDefault();const x=h.clientY,k=s;function N(z){n(Math.max(80,Math.min(600,k+x-z.clientY)))}function _(){document.removeEventListener("mousemove",N),document.removeEventListener("mouseup",_)}document.addEventListener("mousemove",N),document.addEventListener("mouseup",_)},[s,n]);if(!t)return null;const g=((p=o.find(h=>h.id===r))==null?void 0:p.Component)??Vs;return e.jsxs("div",{style:{height:s,flexShrink:0,display:"flex",flexDirection:"column",borderTop:"1px solid var(--border)"},children:[e.jsx("div",{style:{height:4,cursor:"row-resize",background:"var(--border)",flexShrink:0},onMouseDown:c}),e.jsx("div",{style:{display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:o.map(h=>e.jsx("button",{onClick:()=>i(h.id),style:{padding:"4px 12px",fontSize:11,fontWeight:r===h.id?600:400,color:r===h.id?"var(--fg)":"var(--muted)",background:"none",border:"none",borderBottom:r===h.id?"2px solid var(--accent)":"2px solid transparent",cursor:"pointer"},children:h.label},h.id))}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(g,{})})]})}const Li=[];function Di(){return[...Li]}const ns={},Oi=1e4,_t=3e4,Mi=1e3,Bi=(ns==null?void 0:ns.VITE_JAEGER_URL)||"http://localhost:16686",ds=100,Wt=1e3;function qs(t,s=0){if(t==null||Number.isNaN(t))return"hsl(210, 10%, 55%)";s>0&&t<Wt&&(t=Math.max(t,Wt*.75));const n=Math.max(0,Math.min(1,(t-ds)/(Wt-ds))),a=150-150*n,r=60+25*n,i=55-5*n;return`hsl(${a.toFixed(0)}, ${r.toFixed(0)}%, ${i.toFixed(0)}%)`}function Ks(t,s){return s===0?"IDLE":t<ds?"FAST":t<400?"OK":t<Wt?"SLOW":"BAD"}const mt={up:{dot:"#4dd4a0",label:"UP"},degraded:{dot:"#f0b429",label:"DEGRADED"},down:{dot:"#fc8181",label:"DOWN"},unknown:{dot:"#6b8099",label:"UNKNOWN"}};function _i(t){return t==null?"—":t<60?`${t}s`:t<3600?`${Math.floor(t/60)}m`:`${Math.floor(t/3600)}h`}function Wi(t){if(t==null)return"—";const s=Math.floor(t/3600),n=Math.floor(t%3600/60),a=t%60;return s?`${s}h ${n}m`:n?`${n}m ${a}s`:`${a}s`}function Ne(t){return t==null||Number.isNaN(t)?"—":t<10?`${t.toFixed(1)}ms`:t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(2)}s`}function jt(t){return t==null?"—":t<1e3?String(t):t<1e6?`${(t/1e3).toFixed(1)}K`:`${(t/1e6).toFixed(1)}M`}function De(t){return t==null?"—":t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`}function Fe(t){return t<100?"lat-fast":t<400?"lat-ok":t<1e3?"lat-slow":"lat-bad"}function Gi({sorted:t}){if(!t||t.length<2)return e.jsx("div",{className:"perf-chart-empty",children:"Need at least 2 calls to plot distribution."});const s=600,n=90,a=34,r=6,i=8,o=18,c=s-a-r,g=n-i-o,p=t[t.length-1]||1,h=v=>a+c*v/(t.length-1),x=v=>i+g-g*v/p;let k="";for(let v=0;v<t.length;v++){const b=h(v).toFixed(1),y=x(t[v]).toFixed(1);k+=(v===0?"M":"L")+b+","+y+" "}const N=k+`L${h(t.length-1).toFixed(1)},${(i+g).toFixed(1)} L${a},${(i+g).toFixed(1)} Z`,_=[.5,.75,.9,.95,.99],z=v=>{const b=Math.min(t.length-1,Math.floor(t.length*v));return{p:v,v:t[b],x:h(b),y:x(t[b])}},u=[0,p/2,p];return e.jsxs("svg",{viewBox:`0 0 ${s} ${n}`,className:"perf-chart",preserveAspectRatio:"none",children:[u.map((v,b)=>{const y=x(v);return e.jsxs("g",{children:[e.jsx("line",{x1:a,y1:y,x2:s-r,y2:y,stroke:"var(--border)",strokeWidth:"0.5",strokeDasharray:"2,3"}),e.jsx("text",{x:a-4,y:y+3,textAnchor:"end",fontSize:"9",fill:"var(--muted2)",fontFamily:"var(--mono)",children:Ne(v)})]},b)}),e.jsx("path",{d:N,fill:"rgba(106,172,255,0.18)"}),e.jsx("path",{d:k,stroke:"#6aacff",strokeWidth:"1.5",fill:"none"}),_.map(v=>{const b=z(v);return e.jsxs("g",{children:[e.jsx("line",{x1:b.x,y1:i,x2:b.x,y2:i+g,stroke:"#f0b429",strokeWidth:"0.6",strokeDasharray:"1,3",opacity:"0.65"}),e.jsx("circle",{cx:b.x,cy:b.y,r:"2",fill:"#f0b429"}),e.jsxs("text",{x:b.x,y:n-5,textAnchor:"middle",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:["p",Math.round(v*100)]})]},v)}),e.jsx("text",{x:a,y:n-5,textAnchor:"start",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p0"}),e.jsx("text",{x:s-r,y:n-5,textAnchor:"end",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p100"})]})}function Fi({showSettings:t,onToggleSettings:s,consoleVisible:n,onToggleConsole:a}){const[r,i]=l.useState(null),[o,c]=l.useState(null),[g,p]=l.useState(!1),[h,x]=l.useState("services"),[k,N]=l.useState(null),[_,z]=l.useState(null),[u,v]=l.useState(Rt()),[b,y]=l.useState(()=>$t(_t));l.useEffect(()=>{y($t(_t));const m=setInterval(()=>y($t(_t)),Mi),d=ws(()=>y($t(_t)));return()=>{clearInterval(m),d()}},[]);const j=l.useCallback(async()=>{try{const m=await nt.getStatus();i(m),c(null)}catch(m){c(m.message||String(m))}},[]);l.useEffect(()=>{j();const m=setInterval(j,Oi);return()=>clearInterval(m)},[j]),l.useEffect(()=>g?(v(Rt()),ws(()=>v(Rt()))):void 0,[g]);const C=l.useCallback(async()=>{try{const m=await nt.getNatsStatus();N(m),z(null)}catch(m){z(m.message||String(m))}},[]);l.useEffect(()=>{if(!g||h!=="nats")return;C();const m=setInterval(C,5e3);return()=>clearInterval(m)},[g,h,C]);const T=Ja(),G=l.useMemo(()=>Di(),[]),J=o?"down":(r==null?void 0:r.overall)||"unknown",I=mt[J]||mt.unknown;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-bar-row",children:[s&&e.jsxs("button",{type:"button",className:`status-bar-settings${t?" active":""}`,onClick:s,title:"Settings",children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]}),e.jsx("span",{children:"Settings"})]}),a&&e.jsxs("button",{type:"button",className:`status-bar-settings${n?" active":""}`,onClick:a,title:n?"Hide console":"Show console",style:{marginLeft:4},children:[e.jsx("span",{style:{fontSize:11},children:"≡"}),e.jsx("span",{children:"Console"})]}),e.jsxs("button",{type:"button",className:"status-bar",onClick:()=>p(!0),title:"Click for platform status + API perf",children:[e.jsx("span",{className:"status-dot",style:{background:I.dot}}),e.jsx("span",{className:"status-label",children:"PLATFORM"}),e.jsx("span",{className:"status-value",style:{color:I.dot},children:I.label}),(r==null?void 0:r.services)&&e.jsxs("span",{className:"status-count",children:[r.services.filter(m=>m.healthy).length,"/",r.services.length," svc",r.totalInstances!=null&&e.jsxs(e.Fragment,{children:[" · ",r.totalHealthyInstances,"/",r.totalInstances," inst"]})]}),e.jsxs("span",{className:"perf-chip",style:{background:qs(b.p95,b.errorCount)},title:`30s window: ${b.count} calls · p95 ${Ne(b.p95)} · avg ${Ne(b.avgMs)}${b.errorCount?` · ${b.errorCount} err`:""}`,children:[e.jsx("span",{className:"perf-chip-dot"}),Ks(b.p95,b.count),b.count>0&&e.jsx("span",{className:"perf-chip-val",children:Ne(b.p95)})]}),T.cacheBytes>0&&e.jsxs("span",{className:"cache-chip",title:`3D cache: ${T.entries} part${T.entries!==1?"s":""} · ${De(T.cacheBytes)} / ${De(T.maxBytes)}`,children:["3D · ",De(T.cacheBytes)]})]})]}),g&&e.jsx("div",{className:"status-modal-overlay",onClick:()=>p(!1),children:e.jsxs("div",{className:"status-modal",onClick:m=>m.stopPropagation(),role:"dialog","aria-label":"Platform status",children:[e.jsxs("div",{className:"status-modal-header",children:[e.jsx("h3",{children:"Platform Status"}),e.jsxs("a",{className:"status-modal-jaeger",href:Bi,target:"_blank",rel:"noopener noreferrer",title:"Open Jaeger tracing UI",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),e.jsx("polyline",{points:"15 3 21 3 21 9"}),e.jsx("line",{x1:"10",y1:"14",x2:"21",y2:"3"})]}),e.jsx("span",{children:"Traces"})]}),e.jsx("button",{className:"status-modal-close",onClick:()=>p(!1),"aria-label":"Close",children:"×"})]}),e.jsxs("div",{className:"status-tabs",children:[e.jsx("button",{className:`status-tab${h==="services"?" status-tab-active":""}`,onClick:()=>x("services"),children:"Services"}),e.jsxs("button",{className:`status-tab${h==="perf"?" status-tab-active":""}`,onClick:()=>x("perf"),children:["API Perf (",u.overall.total,")"]}),e.jsx("button",{className:`status-tab${h==="nats"?" status-tab-active":""}`,onClick:()=>x("nats"),children:"NATS"}),e.jsx("button",{className:`status-tab${h==="workers"?" status-tab-active":""}`,onClick:()=>x("workers"),children:"3D Workers"}),G.map(m=>e.jsx("button",{className:`status-tab${h===m.key?" status-tab-active":""}`,onClick:()=>x(m.key),children:m.label},m.key))]}),h==="services"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[e.jsx("span",{className:"status-dot",style:{background:I.dot}}),e.jsx("span",{className:"status-modal-overall",style:{color:I.dot},children:I.label}),(r==null?void 0:r.gatewayVersion)&&e.jsxs("span",{className:"status-modal-uptime",children:["spe-api ",e.jsx("code",{children:r.gatewayVersion})]}),(r==null?void 0:r.gatewayUptimeSeconds)!=null&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",Wi(r.gatewayUptimeSeconds)]}),e.jsx("button",{className:"status-modal-refresh",onClick:j,children:"refresh"})]}),o&&e.jsxs("div",{className:"status-modal-error",children:["Gateway unreachable: ",o]}),e.jsxs("table",{className:"status-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service / Instance"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Path"}),e.jsx("th",{children:"Affinity"}),e.jsx("th",{children:"Last HB"}),e.jsx("th",{children:"Failures"})]})}),e.jsx("tbody",{children:((r==null?void 0:r.services)||[]).flatMap(m=>{const d=m.status||(m.healthy?"up":"down"),$=mt[d]||mt.unknown,M=e.jsxs("tr",{className:"status-row-service",children:[e.jsxs("td",{children:[e.jsx("code",{children:m.serviceCode}),m.instanceCount!=null&&e.jsxs("span",{className:"status-inst-badge",title:"healthy / total instances",children:[m.healthyInstances,"/",m.instanceCount," inst"]})]}),e.jsx("td",{children:m.version?e.jsx("code",{children:m.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:$.dot}}),e.jsx("span",{style:{color:$.dot},children:$.label})]}),e.jsx("td",{children:m.path?e.jsx("code",{children:m.path}):e.jsx("span",{className:"muted",children:"—"})}),e.jsx("td",{children:m.instances&&m.instances.length>0&&(()=>{const f=m.instances.filter(L=>!L.untagged),D=m.instances.filter(L=>L.untagged);if(f.length===0)return e.jsx("span",{className:"muted",children:"all untagged"});const E=[...new Set(f.map(L=>L.spaceTag))].sort().join(", ");return e.jsxs("span",{className:"muted",children:[E,D.length?` + ${D.length} untagged`:""]})})()}),e.jsx("td",{colSpan:"2",children:m.registered?e.jsxs("span",{className:"muted",children:["pool of ",m.instanceCount]}):e.jsx("span",{className:"muted",children:"no instances registered"})})]},m.serviceCode),U=(m.instances||[]).map(f=>{const D=f.status||(f.healthy?"up":"down"),E=mt[D]||mt.unknown;return e.jsxs("tr",{className:"status-row-instance",children:[e.jsxs("td",{children:[e.jsx("span",{className:"status-inst-leaf",children:"↳"})," ",e.jsx("code",{className:"muted",children:f.instanceId})]}),e.jsx("td",{children:f.version?e.jsx("code",{children:f.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:E.dot}}),e.jsx("span",{style:{color:E.dot},children:E.label})]}),e.jsx("td",{children:f.untagged?e.jsx("span",{className:"muted",children:"—"}):e.jsx("code",{style:{fontSize:"0.85em"},children:f.spaceTag})}),e.jsx("td",{children:f.lastHeartbeatOk?_i(f.ageSeconds)+" ago":e.jsx("span",{className:"muted",children:"never"})}),e.jsx("td",{children:f.consecutiveFailures??0})]},m.serviceCode+"/"+f.instanceId)});return[M,...U]})})]}),(r==null?void 0:r.timestamp)&&e.jsxs("div",{className:"status-modal-timestamp",children:["server time: ",r.timestamp]})]}),h==="perf"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"perf-window-banner",style:{"--perf-color":qs(b.p95,b.errorCount)},children:[e.jsx("span",{className:"perf-chip-dot perf-chip-dot-lg"}),e.jsxs("span",{className:"perf-window-label",children:["last 30s — ",Ks(b.p95,b.count)]}),e.jsxs("span",{className:"perf-window-metrics",children:[b.count," calls · p50 ",Ne(b.p50)," · p95 ",Ne(b.p95)," · max ",Ne(b.maxMs),b.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[" · ",b.errorCount," err"]})]})]}),e.jsxs("div",{className:"status-modal-summary",children:[e.jsxs("span",{className:"status-perf-summary",children:[e.jsxs("span",{children:[u.overall.total," calls"]}),e.jsxs("span",{children:["avg ",e.jsx("strong",{className:Fe(u.overall.avgMs),children:Ne(u.overall.avgMs)})]}),e.jsxs("span",{children:["p50 ",e.jsx("strong",{className:Fe(u.overall.p50),children:Ne(u.overall.p50)})]}),e.jsxs("span",{children:["p95 ",e.jsx("strong",{className:Fe(u.overall.p95),children:Ne(u.overall.p95)})]}),e.jsxs("span",{children:["p99 ",e.jsx("strong",{className:Fe(u.overall.p99),children:Ne(u.overall.p99)})]}),e.jsxs("span",{children:["max ",e.jsx("strong",{className:Fe(u.overall.maxMs),children:Ne(u.overall.maxMs)})]}),u.overall.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[u.overall.errorCount," err"]})]}),e.jsx("button",{className:"status-modal-refresh",onClick:()=>{Pr(),v(Rt())},children:"reset"})]}),e.jsxs("div",{className:"status-perf-note",children:["Window = last ",u.overall.windowSize," calls. Latency = browser-observed time through nginx → spe-api → ","{","psm,pno","}","."]}),e.jsx(Gi,{sorted:u.overall.sorted}),u.byEndpoint.length===0?e.jsx("div",{className:"status-perf-empty",children:"No API calls recorded yet."}):e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Method"}),e.jsx("th",{children:"Endpoint"}),e.jsx("th",{children:"#"}),e.jsx("th",{children:"avg"}),e.jsx("th",{children:"p50"}),e.jsx("th",{children:"p95"}),e.jsx("th",{title:"sorted desc by p95",children:"max ▼"}),e.jsx("th",{children:"last"}),e.jsx("th",{children:"err"})]})}),e.jsx("tbody",{children:[...u.byEndpoint].sort((m,d)=>d.p95-m.p95).map(m=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:m.method})}),e.jsx("td",{children:e.jsx("code",{title:m.endpoint,children:m.endpoint})}),e.jsx("td",{children:m.count}),e.jsx("td",{className:Fe(m.avgMs),children:Ne(m.avgMs)}),e.jsx("td",{className:Fe(m.p50),children:Ne(m.p50)}),e.jsx("td",{className:Fe(m.p95),children:Ne(m.p95)}),e.jsx("td",{className:Fe(m.maxMs),children:Ne(m.maxMs)}),e.jsx("td",{className:Fe(m.lastMs),children:Ne(m.lastMs)}),e.jsx("td",{className:m.errorCount?"lat-bad":"muted",children:m.errorCount||0})]},`${m.method} ${m.endpoint}`))})]})})]}),h==="nats"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[k?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-dot",style:{background:k.status==="up"?"#4dd4a0":"#fc8181"}}),e.jsx("span",{className:"status-modal-overall",style:{color:k.status==="up"?"#4dd4a0":"#fc8181"},children:k.status==="up"?"UP":"DOWN"}),k.version&&e.jsxs("span",{className:"status-modal-uptime",children:["v",k.version]}),k.uptime&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",k.uptime]})]}):e.jsx("span",{className:"muted",children:_?`Error: ${_}`:"Loading..."}),e.jsx("button",{className:"status-modal-refresh",onClick:C,children:"refresh"})]}),k&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nats-stats-grid",children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Connections"}),e.jsx("span",{className:"nats-stat-value",children:k.connections??0}),e.jsxs("span",{className:"nats-stat-sub",children:["total: ",k.totalConnections??0]})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Subscriptions"}),e.jsx("span",{className:"nats-stat-value",children:k.subscriptions??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages In"}),e.jsx("span",{className:"nats-stat-value",children:jt(k.inMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:De(k.inBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages Out"}),e.jsx("span",{className:"nats-stat-value",children:jt(k.outMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:De(k.outBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Slow Consumers"}),e.jsx("span",{className:`nats-stat-value${k.slowConsumers>0?" lat-bad":""}`,children:k.slowConsumers??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Sub Cache"}),e.jsx("span",{className:"nats-stat-value",children:k.numCache??0}),e.jsxs("span",{className:"nats-stat-sub",children:["matches: ",jt(k.numMatches)]})]})]}),k.connectionDetails&&k.connectionDetails.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("h4",{className:"nats-section-title",children:["Client Connections (",k.numConnections,")"]}),e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"CID"}),e.jsx("th",{children:"Name"}),e.jsx("th",{children:"Lang"}),e.jsx("th",{children:"Subs"}),e.jsx("th",{children:"Msgs In"}),e.jsx("th",{children:"Msgs Out"}),e.jsx("th",{children:"Bytes In"}),e.jsx("th",{children:"Bytes Out"}),e.jsx("th",{children:"Uptime"}),e.jsx("th",{children:"Idle"})]})}),e.jsx("tbody",{children:k.connectionDetails.map(m=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:m.cid})}),e.jsx("td",{children:e.jsx("code",{title:m.name,children:m.name||"—"})}),e.jsx("td",{children:m.lang||"—"}),e.jsx("td",{children:typeof m.subscriptions=="number"?m.subscriptions:Array.isArray(m.subscriptions)?m.subscriptions.length:"—"}),e.jsx("td",{children:jt(m.inMsgs)}),e.jsx("td",{children:jt(m.outMsgs)}),e.jsx("td",{children:De(m.inBytes)}),e.jsx("td",{children:De(m.outBytes)}),e.jsx("td",{children:m.uptime||"—"}),e.jsx("td",{children:m.idle||"—"})]},m.cid))})]})})]})]})]}),h==="workers"&&e.jsxs("div",{style:{padding:"12px 16px",overflowY:"auto"},children:[e.jsx("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"},children:[{v:T.workers,l:"Workers"},{v:T.entries,l:"Cached Parts"},{v:De(T.cacheBytes),l:"Memory Used"},{v:De(T.maxBytes),l:"Memory Limit"},{v:T.memHits,l:"Mem Hits"},{v:T.idbHits,l:"IDB Hits"},{v:T.netFetches,l:"Downloads"},{v:Ne(T.avgDownloadMs),l:"Avg Download"},{v:Ne(T.avgParseMs),l:"Avg Parse"}].map(({v:m,l:d})=>e.jsxs("div",{style:{background:"var(--surface2)",borderRadius:6,padding:"8px 14px",minWidth:90},children:[e.jsx("div",{style:{fontSize:17,fontWeight:700,color:"var(--text)",lineHeight:1.2},children:m??"—"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginTop:2},children:d})]},d))}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted2)"},children:["Cache: ",De(T.cacheBytes)," / ",De(T.maxBytes)," (",T.maxBytes>0?(T.cacheBytes/T.maxBytes*100).toFixed(1):0,"%)"]}),e.jsx("div",{style:{marginTop:6,height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${T.maxBytes>0?Math.min(100,T.cacheBytes/T.maxBytes*100):0}%`,background:"var(--accent)",borderRadius:3,transition:"width .3s"}})}),e.jsxs("div",{style:{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginRight:4},children:"Limit / worker"}),[{label:"128 MB",bytes:128*1024*1024},{label:"256 MB",bytes:256*1024*1024},{label:"512 MB",bytes:512*1024*1024},{label:"1 GB",bytes:1024*1024*1024}].map(({label:m,bytes:d})=>{const $=T.workers>0?T.maxBytes/T.workers:0,M=Math.abs($-d)<1024;return e.jsx("button",{type:"button",onClick:()=>Xa(d),style:{padding:"3px 10px",fontSize:11,borderRadius:4,border:"1px solid",borderColor:M?"var(--accent)":"var(--border)",background:M?"var(--accent)":"var(--surface2)",color:M?"#fff":"var(--text)",cursor:"pointer",fontWeight:M?700:400},children:m},m)})]}),e.jsxs("div",{style:{marginTop:10,display:"flex",gap:8},children:[e.jsx("button",{type:"button",onClick:()=>Os({idb:!1}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear Memory"}),e.jsx("button",{type:"button",onClick:()=>Os({idb:!0}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear All + IDB"})]}),e.jsx("div",{style:{marginTop:12,fontSize:11,color:"var(--muted2)"},children:"Avg timings = rolling average over last 50 loads per worker. IDB = IndexedDB persistent cache. Mem = in-memory LRU."})]}),G.map(m=>h===m.key&&e.jsx(m.Component,{},m.key))]})})]})}function Xs(t){const s=je(o=>o.statusSlots),n=je(o=>o.consoleVisible),a=je(o=>o.toggleConsole),r=s.filter(o=>o.position!=="right"),i=s.filter(o=>o.position==="right");return e.jsx(Fi,{...t,leftSlots:r,rightSlots:i,consoleVisible:n,onToggleConsole:a})}ri();const Ys="ps-default";let Ui=0;function Hi(){const[t,s]=l.useState([]),[n,a]=l.useState(null),r=l.useCallback((i,o="info")=>{const c=typeof i=="string"?i:(i==null?void 0:i.message)||String(i),g=typeof i!="string"&&(i!=null&&i.detail)?i.detail:null;if(o==="error"){a(g??{error:c});return}const p=++Ui;s(h=>[...h,{id:p,msg:c,type:o}]),setTimeout(()=>s(h=>h.filter(x=>x.id!==p)),4e3)},[]);return{toasts:t,toast:r,errorDetail:n,setErrDetail:a}}function Vi({toasts:t}){return e.jsx("div",{className:"toasts",role:"status","aria-live":"polite",children:t.map(s=>e.jsxs("div",{className:`toast toast-${s.type}`,children:[e.jsx("span",{"aria-hidden":"true",children:s.type==="success"?"✓":s.type==="error"?"✗":s.type==="warn"?"⚠":"ℹ"}),s.msg]},s.id))})}function qi(){const{toasts:t,toast:s,errorDetail:n,setErrDetail:a}=Hi(),[r,i]=l.useState("user-alice"),[o,c]=l.useState(Ys),g=fe(A=>A.setUserId),p=fe(A=>A.nodes),h=fe(A=>A.nodeTypes),x=fe(A=>A.resources),k=fe(A=>A.stateColorMap),N=fe(A=>A.stateColorMapLoaded),_=fe(A=>A.projectSpaces),z=fe(A=>A.users),u=fe(A=>A.activeTx),v=fe(A=>A.txNodes),b=fe(A=>A.refreshNodes),y=fe(A=>A.refreshTx),j=fe(A=>A.refreshAll),C=fe(A=>A.refreshItems),T=fe(A=>A.refreshStateColorMap),G=fe(A=>A.refreshProjectSpaces),J=fe(A=>A.refreshUsers),I=fe(A=>A.clearTx),[m,d]=l.useState(0),$=l.useCallback(()=>d(A=>A+1),[]),[M,U]=l.useState(""),[f,D]=l.useState(""),E={id:"dashboard",nodeId:null,label:"Dashboard",pinned:!0},[L,S]=l.useState([E]),[w,R]=l.useState("dashboard"),[W,F]=l.useState(null),[P,H]=l.useState({}),B=l.useRef(new Set),O=l.useCallback(A=>{var ge;const Z=L.find(he=>he.nodeId===A);if(!((ge=Z==null?void 0:Z.get)!=null&&ge.path))return;const ie=(u==null?void 0:u.ID)||(u==null?void 0:u.id)||null;H(he=>({...he,[A]:{...he[A]??{},status:"loading"}})),Dr(Z.serviceCode,Z.get,A,ie?{txId:ie}:{}).then(he=>H(Ce=>({...Ce,[A]:{status:"ok",data:he}}))).catch(he=>H(Ce=>({...Ce,[A]:{status:"error",error:he.message}})))},[L,u]),K=l.useCallback(()=>{L.filter(A=>{var Z;return A.nodeId&&((Z=A.get)==null?void 0:Z.path)}).forEach(A=>O(A.nodeId))},[L,O]);l.useEffect(()=>{var Z;if(!w||w==="dashboard")return;const A=L.find(ie=>ie.id===w);!((Z=A==null?void 0:A.get)!=null&&Z.path)||!A.nodeId||B.current.has(A.nodeId)||(B.current.add(A.nodeId),O(A.nodeId))},[w,L]);const Y=l.useRef(null);l.useEffect(()=>{const A=(u==null?void 0:u.ID)||(u==null?void 0:u.id)||null;if(A===Y.current||(Y.current=A,!w||w==="dashboard"))return;const Z=L.find(ie=>ie.id===w);Z!=null&&Z.nodeId&&O(Z.nodeId)},[u,w,L,O]);const[V,Q]=l.useState(!1),[ne,ee]=l.useState(!1),[te,re]=l.useState(null),[le,ye]=l.useState(!1),[ce,de]=l.useState(null),[pe,me]=l.useState(null),[ue,Te]=l.useState(268),[Ke,_e]=l.useState(!1),[gt,Le]=l.useState(null),[ot,lt]=l.useState(0),[zt,At]=l.useState(!1),We=l.useCallback((A,Z,ie)=>{if(!ie||!ie.serviceCode)throw new Error("navigate(): descriptor is required");const ge={serviceCode:ie.serviceCode,itemCode:ie.itemCode,itemKey:ie.itemKey,get:ie.get||null};S(he=>{const Ce=he.find(Ie=>Ie.nodeId===A);if(Ce)return R(Ce.id),he.map(Ie=>Ie.id===Ce.id?{...Ie,...ge}:Ie);const Kt=he.find(Ie=>!Ie.pinned&&Ie.id!=="dashboard");if(Kt)return R(Kt.id),he.map(Ie=>Ie.id===Kt.id?{...Ie,nodeId:A,label:Z||A.slice(0,10),...ge}:Ie);const gs=`tab-${Date.now()}`;return R(gs),[...he,{id:gs,nodeId:A,label:Z||A.slice(0,10),pinned:!1,...ge}]})},[]),It=l.useCallback(A=>We(A.nodeId,A.label,A),[We]),Xe=l.useCallback(A=>{S(Z=>{const ie=Z.find(he=>he.id===A);ie!=null&&ie.nodeId&&(B.current.delete(ie.nodeId),H(he=>{const Ce={...he};return delete Ce[ie.nodeId],Ce}));const ge=Z.filter(he=>he.id!==A);return w===A&&(R(ge.length>0?ge[ge.length-1].id:null),F(null)),ge})},[w]),Ye=l.useMemo(()=>ci({navigate:We,openTab:It,closeTab:Xe}),[]);xs(["/topic/transactions","/topic/global","/topic/metamodel"],async A=>{A.event==="TX_COMMITTED"?(await y(),A.byUser&&A.byUser!==r&&s(`${A.byUser} committed a transaction`,"info")):A.event==="TX_ROLLED_BACK"?(await y(),await b(),K(),$(),A.byUser&&A.byUser!==r&&s(`${A.byUser} rolled back a transaction`,"warn")):A.event==="NODES_RELEASED"?(y(),$()):A.event==="NODE_CREATED"?(b(),y(),$()):A.event==="NODE_UPDATED"?(A.nodeId&&O(A.nodeId),b(),$()):A.event==="METAMODEL_CHANGED"?(C(),$(),N&&T(),A.byUser&&A.byUser!==r&&s(`${A.byUser} updated the metamodel`,"info")):A.event==="PNO_CHANGED"&&(J(),G(),A.byUser&&A.byUser!==r&&s(`${A.byUser} updated ${(A.entity||"PNO data").toLowerCase()}`,"info"))},r);function Je(){ye(A=>(!A&&r&&(X.getSettingsSections(r).then(Z=>{var ge,he,Ce;me(Z);const ie=(Ce=(he=(ge=Z==null?void 0:Z[0])==null?void 0:ge.sections)==null?void 0:he[0])==null?void 0:Ce.key;ie&&de(ie)}).catch(()=>me([])),T()),!A))}l.useEffect(()=>{ks(Ys),$r(A=>s(A,"error"))},[s]),l.useEffect(()=>{let A=!1;return _e(!1),Le(null),(async()=>{try{await Ns.login(r,o)}catch(Z){A||Le(Z.message||String(Z));return}if(!A){Lr(async()=>{try{return(await Ns.login(r,o)).token}catch{return null}}),_e(!0),g(r),j(),G(),J(),T(),le&&X.getSettingsSections(r).then(Z=>{var ge,he,Ce;me(Z);const ie=(Ce=(he=(ge=Z==null?void 0:Z[0])==null?void 0:ge.sections)==null?void 0:he[0])==null?void 0:Ce.key;ie&&de(ie)}).catch(()=>me([]));try{const Z=await di(Ye);Z.length>0&&s(`Some plugins failed to load: ${Z.join("; ")}`,"error")}catch(Z){s(`Plugin manifest unavailable: ${Z.message||Z}`,"error")}finally{At(!0),d(Z=>Z+1)}}})(),()=>{A=!0}},[r,o,ot]);function He(A){i(A),S([E]),R("dashboard"),F(null),U("")}function Nn(A){c(A),ks(A),S([E]),R("dashboard"),F(null),j()}function Cn(A){const Z=A.clientX,ie=ue;function ge(Ce){Te(Math.max(160,Math.min(600,ie+Ce.clientX-Z)))}function he(){document.removeEventListener("mousemove",ge),document.removeEventListener("mouseup",he)}document.addEventListener("mousemove",ge),document.addEventListener("mouseup",he)}async function En(){if(u)return u.ID||u.id;try{const A=await rt.open(r,"Work session");return await y(),A.txId}catch(A){return s(A,"error"),null}}async function Tn(){if(u)try{await rt.rollback(r,u.ID||u.id),s("Transaction rolled back","warn"),I(),await b(),K()}catch(A){s(A,"error")}}async function zn(A){if(u)try{await rt.release(r,u.ID||u.id,[A]),s("Object released from transaction","info"),await j()}catch(Z){s(Z,"error")}}async function An(A,Z){if(await j(),K(),A&&Z>0){const ie=Z;s(`${ie} object${ie>1?"s":""} deferred — new transaction opened`,"info")}}const st=L.find(A=>A.id===w),Pt=st==null?void 0:st.nodeId,In=w==="dashboard",Pn=l.useCallback(A=>{if((A==null?void 0:A.nodeId)===Pt&&F(A),A!=null&&A.nodeId){const Z=A.logicalId||A.identity||void 0;S(ie=>ie.map(ge=>ge.nodeId===A.nodeId?{...ge,...A.nodeTypeId&&{nodeTypeId:A.nodeTypeId},...Z&&{label:Z}}:ge))}},[Pt]);return Ke?e.jsx(li.Provider,{value:Ye,children:e.jsxs("div",{className:"shell",children:[e.jsx(Yr,{userId:r,onUserChange:He,users:z,nodeTypes:h,stateColorMap:k,searchQuery:M,searchType:f,onSearchChange:U,onSearchTypeChange:D,projectSpaces:_,projectSpaceId:o,onProjectSpaceChange:Nn,nodes:p,onNavigate:We}),e.jsxs("div",{className:"body",children:[e.jsx(es,{children:e.jsx(xi,{nodeTypes:h,tx:u,txNodes:v,userId:r,activeNodeId:Pt,stateColorMap:k,onNavigate:We,canCreateNode:x.length>0,onCreateNode:A=>{re(A||null),ee(!0)},onCommit:()=>Q(!0),onRollback:Tn,onReleaseNode:zn,showSettings:le,onToggleSettings:Je,activeSettingsSection:ce,onSettingsSectionChange:de,settingsSections:pe,isDashboardOpen:In,onOpenDashboard:()=>R("dashboard"),browseRefreshKey:m,style:{width:ue},toast:s})}),e.jsx("div",{className:"resize-handle",onMouseDown:Cn}),e.jsxs("div",{className:"editor-column",children:[le?e.jsx(es,{children:e.jsx(Da,{userId:r,projectSpaceId:o,activeSection:ce,onSectionChange:de,settingsSections:pe,pluginsLoaded:zt,toast:s})}):e.jsx(es,{children:e.jsx(ji,{tabs:L,activeTabId:w,userId:r,tx:u,toast:s,nodeTypes:h,stateColorMap:k,onTabActivate:A=>R(A),onTabClose:Xe,onTabPin:A=>S(Z=>Z.map(ie=>ie.id===A?{...ie,pinned:!ie.pinned}:ie)),onSubTabChange:(A,Z)=>S(ie=>ie.map(ge=>ge.id===A?{...ge,activeSubTab:Z}:ge)),onNavigate:We,onAutoOpenTx:En,onDescriptionLoaded:Pn,onRefreshItemData:O,tabItemData:st!=null&&st.nodeId?P[st.nodeId]??null:null})}),e.jsx($i,{})]}),e.jsx(Ii,{activeNodeId:Pt,userId:r,users:z})]}),V&&u&&e.jsx(Oa,{userId:r,txId:u.ID||u.id,txNodes:v,stateColorMap:k,onCommitted:An,onClose:()=>Q(!1),toast:s}),ne&&x.length>0&&e.jsx(Ma,{resources:x,initialDescriptor:te,onCreated:async(A,Z)=>{await j(),(Z==null?void 0:Z.serviceCode)==="psm"&&(A!=null&&A.nodeId)&&We(A.nodeId,void 0,Tt)},onClose:()=>{ee(!1),re(null)},toast:s}),n&&e.jsx(Wa,{detail:n,onClose:()=>a(null)}),e.jsx(Vi,{toasts:t}),e.jsx(Xs,{showSettings:le,onToggleSettings:Je})]})}):e.jsxs("div",{className:"shell",children:[e.jsx("div",{className:"auth-splash",children:gt?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-error",children:"Login failed"}),e.jsx("div",{className:"auth-splash-detail",children:gt}),e.jsx("button",{className:"auth-splash-retry",onClick:()=>lt(A=>A+1),children:"retry"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-spinner"}),e.jsxs("div",{className:"auth-splash-label",children:["Signing in as ",r,"…"]})]})}),e.jsx(Xs,{})]})}const Ki=`
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
  --panel-w:268px;--header-h:52px;
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
`,kn=document.createElement("style");kn.textContent=Ki;document.head.appendChild(kn);Fr();const Xi=Rn.createRoot(document.getElementById("root"));Xi.render(e.jsx(et.StrictMode,{children:e.jsx(qi,{})}));
//# sourceMappingURL=index-BJQsHEOE.js.map
