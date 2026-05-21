import{j as e}from"./react-jsx-runtime-shim-DtcNtlUI.js";import{c as bn,r as l,R as We}from"./vendor-Dw91Z_SL.js";import{c as fr}from"./react-dom-shim-u_SHOSaN.js";import{S as gr,R as br,G as vr,C as yr,B as jr,a as wr,L as kr,A as vn,b as gt,U as yn,c as Sr,H as Mt,d as jn,F as Nr,e as Qt,M as Cr,f as Er,Z as ks,g as Tr,h as zr,T as Ir,i as Ar,j as wn,k as kn,D as Sn,l as $r,W as Rr,m as Ss,P as Nn,n as Pr,o as Lr,N as Br,K as Mr,p as Cn,q as Or,r as Dr,s as es,t as Ke,u as He,v as ts,w as ss,x as _r,y as Wr,X as xt,z as bt,E as Nt,I as Fe,J as Fr,O as Ur,Q as En,V as Bs,Y as Gr,_ as Hr,$ as Vr,a0 as qr}from"./icons-CwfpQ0Z8.js";import{C as $t,S as Kr,A as Jr,D as Xr,P as Yr,W as Zr,O as Qr,X as ea,V as ta,M as rs,B as sa,a as Ms,R as na,G as ra,b as aa,c as as,d as Os,e as oa,f as ia,g as la,h as ca}from"./three-DAyMVibd.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();const Tn=500,ot=[],hs=new Set;function zn(){hs.forEach(t=>{try{t()}catch{}})}function Ds(t){return hs.add(t),()=>hs.delete(t)}const da=/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,pa=/\/\d+(?=\/|$)/g;function ua(t){return t.split("?")[0].replace(da,"/{id}").replace(pa,"/{n}")}function _s({method:t,endpoint:s,status:n,durationMs:r,ok:a}){ot.push({method:t,endpoint:ua(s),status:n,durationMs:r,ok:a,at:Date.now()}),ot.length>Tn&&ot.shift(),zn()}function at(t,s){if(t.length===0)return 0;const n=Math.min(t.length-1,Math.floor(t.length*s));return t[n]}function _t(){const t=new Map;for(const o of ot){const i=`${o.method} ${o.endpoint}`;let c=t.get(i);c||(c={method:o.method,endpoint:o.endpoint,durations:[],errorCount:0,lastMs:0,lastAt:0},t.set(i,c)),c.durations.push(o.durationMs),o.ok||c.errorCount++,c.lastMs=o.durationMs,c.lastAt=o.at}const s=[];for(const o of t.values()){const i=[...o.durations].sort((p,d)=>p-d),c=o.durations.reduce((p,d)=>p+d,0);s.push({method:o.method,endpoint:o.endpoint,count:o.durations.length,avgMs:c/o.durations.length,p50:at(i,.5),p95:at(i,.95),maxMs:i[i.length-1],lastMs:o.lastMs,lastAt:o.lastAt,errorCount:o.errorCount})}s.sort((o,i)=>i.count-o.count);const n=ot.map(o=>o.durationMs).sort((o,i)=>o-i),r=n.reduce((o,i)=>o+i,0);return{overall:{total:ot.length,windowSize:Tn,avgMs:n.length?r/n.length:0,p50:at(n,.5),p75:at(n,.75),p90:at(n,.9),p95:at(n,.95),p99:at(n,.99),maxMs:n.length?n[n.length-1]:0,errorCount:ot.filter(o=>!o.ok).length,sorted:n},byEndpoint:s}}function ma(){ot.length=0,zn()}function Wt(t){const s=Date.now()-t,n=ot.filter(o=>o.at>=s),r=n.map(o=>o.durationMs).sort((o,i)=>o-i),a=r.reduce((o,i)=>o+i,0);return{windowMs:t,count:n.length,avgMs:r.length?a/r.length:0,p50:at(r,.5),p95:at(r,.95),maxMs:r.length?r[r.length-1]:0,errorCount:n.filter(o=>!o.ok).length}}const ct="/api/platform";function qe(t){return`/api/${t}`}class In extends Error{constructor(s,n,r){super(n),this.name="ApiError",this.status=s,this.detail=r}}function Ot(t,s,n,r,a){return new Promise((o,i)=>{const c=new XMLHttpRequest;c.open(s,t),Object.entries(n).forEach(([p,d])=>c.setRequestHeader(p,d)),c.upload.addEventListener("progress",p=>{p.lengthComputable&&a(Math.round(p.loaded/p.total*100))}),c.onload=()=>{const p=()=>Promise.resolve(c.responseText),d=()=>Promise.resolve(JSON.parse(c.responseText));o({ok:c.status>=200&&c.status<300,status:c.status,text:p,json:d})},c.onerror=()=>i(new Error("Network error during upload")),c.onabort=()=>i(new Error("Upload cancelled")),c.send(r)})}async function _e(t,s,n){const r=performance.now();let a,o;try{a=await fetch(t,s)}catch(p){o=p}const i=performance.now()-r,c=t.split("?")[0];if(o)throw _s({method:n,endpoint:c,status:0,durationMs:i,ok:!1}),o;return _s({method:n,endpoint:c,status:a.status,durationMs:i,ok:a.ok}),a}function ha(t,s,n){return Array.isArray(t)?{items:t,totalElements:t.length,totalPages:1,page:s,size:n}:t&&Array.isArray(t.content)?{items:t.content,totalElements:t.totalElements??t.content.length,totalPages:t.totalPages??1,page:t.number??s,size:t.size??n}:t&&Array.isArray(t.items)?{items:t.items,totalElements:t.totalElements??t.items.length,totalPages:t.totalPages??1,page:t.page??s,size:t.size??n}:{items:[],totalElements:0,totalPages:0,page:s,size:n}}let Te=null;function Ws(t){Te=t}function Pt(){return Te}let Ze=null;function xa(t){Ze=t}let ye=null;function ft(){return ye}let Lt=null;function fa(t){Lt=t}const Fs={login:async t=>{const s=await _e("/api/spe/auth/login",{method:"POST",headers:{"X-User":t}},"POST");if(!s.ok){const r=await s.json().catch(()=>({error:s.statusText}));throw new Error(r.error||`HTTP ${s.status}`)}const n=await s.json();return ye=n.token,n},logout:async()=>{const t=ye;if(ye=null,!!t)try{await _e("/api/spe/auth/logout",{method:"POST",headers:{Authorization:`Bearer ${t}`}},"POST")}catch{}}};let Us=!1,Gs=null;function Xt(){if(!Us){if(Us=!0,!document.getElementById("plm-reconnect-banner")){const t=document.createElement("div");t.id="plm-reconnect-banner",t.style.cssText=["position:fixed","top:0","left:0","right:0","z-index:99999","background:#b45309","color:#fff","text-align:center","padding:8px 16px","font-size:13px","font-family:monospace","letter-spacing:.02em","box-shadow:0 2px 8px rgba(0,0,0,.4)"].join(";"),t.textContent="⟳  Backend is restarting — reconnecting…",document.body.prepend(t)}Gs=setInterval(async()=>{try{(await fetch("/actuator/health",{cache:"no-store"})).ok&&(clearInterval(Gs),window.location.reload())}catch{}},3e3)}}async function Ns(t,s,n,r=!1){var c,p;const a={};ye&&(a.Authorization=`Bearer ${ye}`),Te&&(a["X-PLM-ProjectSpace"]=Te),n!==void 0&&(a["Content-Type"]="application/json");let o;try{o=await _e(s,{method:t,headers:a,body:n!==void 0?JSON.stringify(n):void 0},t)}catch{Xt();const d=new Error("Backend unreachable");throw Ze&&Ze(d),d}if(o.status===401&&!r&&Lt){const d=await Lt().catch(()=>null);if(d)return ye=d,Ns(t,s,n,!0)}if(!o.ok){(o.status===502||o.status===503)&&Xt();const d=await o.json().catch(()=>({error:o.statusText})),u=(c=d.violations)!=null&&c.length?d.violations.map(N=>typeof N=="string"?N:N.message).join("; "):d.error||d.message||`HTTP ${o.status}`,b=new Error(u);b.status=o.status,b.detail=d;const h=(p=d.violations)==null?void 0:p.some(N=>N==null?void 0:N.attrCode);throw Ze&&!h&&Ze(b),b}const i=await o.text();return i?JSON.parse(i):null}async function De(t,s,n,r,{txId:a,psOverride:o}={},i=!1){var b,h;const c={"Content-Type":"application/json"};ye&&(c.Authorization=`Bearer ${ye}`);const p=o??Te;p&&(c["X-PLM-ProjectSpace"]=p),a&&(c["X-PLM-Tx"]=a);let d;try{d=await _e(`${t}${n}`,{method:s,headers:c,body:r?JSON.stringify(r):void 0},s)}catch{Xt();const N=new Error("Backend unreachable");throw Ze&&Ze(N),N}if(d.status===401&&!i&&Lt){const N=await Lt().catch(()=>null);if(N)return ye=N,De(t,s,n,r,{txId:a,psOverride:o},!0)}if(!d.ok){(d.status===502||d.status===503)&&Xt();const N=await d.json().catch(()=>({error:d.statusText})),R=(b=N.violations)!=null&&b.length?N.violations.map(x=>typeof x=="string"?x:x.message).join("; "):N.error||N.message||`HTTP ${d.status}`,A=new In(d.status,R,N),f=(h=N.violations)==null?void 0:h.some(x=>x==null?void 0:x.attrCode);throw Ze&&!f&&Ze(A),A}const u=await d.text();return u?JSON.parse(u):null}async function he(t,s,n,r,a={}){return De(qe("pno"),t,s,r,a)}async function pe(t,s,n,r){return De(ct,t,s,r)}function An(t,s,n,r={}){let a=s.path.replace("{id}",n);const o=Object.entries(r).filter(([,i])=>i!=null).map(([i,c])=>`${i}=${encodeURIComponent(c)}`).join("&");return o&&(a+=`?${o}`),Ns(s.httpMethod||"GET",qe(t)+a,void 0)}async function ga(t,s){var d;const n=t.create,r=qe(t.serviceCode)+n.path,a=(n.httpMethod||"POST").toUpperCase(),o={};ye&&(o.Authorization=`Bearer ${ye}`),Te&&(o["X-PLM-ProjectSpace"]=Te);let i;if((n.bodyShape||"RAW").toUpperCase()==="MULTIPART"){const u=new FormData;for(const[b,h]of Object.entries(s||{}))h==null||h===""||u.append(b,h);i=u}else{o["Content-Type"]="application/json";const u=(n.bodyShape||"RAW").toUpperCase()==="WRAPPED"?{parameters:s||{}}:s||{};i=JSON.stringify(u)}const c=await _e(r,{method:a,headers:o,body:i},a);if(!c.ok){const u=await c.json().catch(()=>({error:c.statusText})),b=(d=u.violations)!=null&&d.length?u.violations.join("; "):u.error||u.message||`HTTP ${c.status}`,h=new Error(b);throw h.detail=u,Ze&&Ze(h),h}const p=await c.text();return p?JSON.parse(p):null}async function $e(t,s,n,r,a){return De(qe("psm"),t,s,r,{psOverride:a})}async function te(t,s,n,r){return De(qe("psa"),t,s,r)}function ba(t,s,n,r){return De(qe(t),s,n,r)}const mt={getStatus:async()=>De(ct,"GET","/status"),getRegistryTags:async()=>De(ct,"GET","/admin/registry/tags"),getEnvironment:async()=>De(ct,"GET","/admin/environment/expected-services"),updateEnvironment:async t=>De(ct,"PUT","/admin/environment/expected-services",{expectedServices:t}),addExpectedService:async t=>De(ct,"POST","/admin/environment/expected-services/services",{serviceCode:t}),removeExpectedService:async t=>De(ct,"DELETE",`/admin/environment/expected-services/services/${t}`),getNatsStatus:async()=>De(ct,"GET","/status/nats")},ee={getMetadataKeys:(t,s)=>te("GET",s?`/metamodel/metadata/keys/${s}`:"/metamodel/metadata/keys"),getNodeTypes:t=>te("GET","/metamodel/nodetypes"),getVersionHistory:(t,s)=>$e("GET",`/nodes/${s}/versions`),getVersionDiff:(t,s,n,r)=>$e("GET",`/nodes/${s}/versions/diff?v1=${n}&v2=${r}`),createNode:(t,s,n,r,a)=>$e("POST",`/actions/create_node/${s}`,t,{parameters:{...n,_logicalId:r||null,_externalId:a||null}}),getNodeDescription:(t,s,n,r)=>{const a=[];n&&a.push(`txId=${n}`),r&&a.push(`versionNumber=${r}`);const o=a.length?`?${a.join("&")}`:"";return $e("GET",`/nodes/${s}/description${o}`)},updateExternalId:(t,s,n)=>$e("PATCH",`/nodes/${s}/external-id`,t,{externalId:n}),getSignatures:(t,s)=>$e("GET",`/nodes/${s}/signatures`),getSignatureHistory:(t,s)=>$e("GET",`/nodes/${s}/signatures/history`),getComments:(t,s)=>$e("GET",`/nodes/${s}/comments`),addComment:(t,s,n,r,a,o)=>$e("POST",`/nodes/${s}/comments`,t,{nodeVersionId:n,text:r,...a?{parentCommentId:a}:{},...o?{attributeName:o}:{}}),getLinkTypes:t=>te("GET","/metamodel/linktypes"),getNodeTypeLinkTypes:(t,s)=>te("GET",`/metamodel/nodetypes/${s}/linktypes`),getRegistryGrouped:t=>pe("GET","/admin/registry/grouped"),getRegistryTagsAdmin:t=>pe("GET","/admin/registry/tags"),getRegistryOverview:t=>pe("GET","/admin/registry/overview"),getItems:t=>pe("GET","/items"),gatewayJson:(t,s,n)=>Ns(t,s,n),gatewayRawText:async(t,s=64*1024)=>{const n={};ye&&(n.Authorization=`Bearer ${ye}`),Te&&(n["X-PLM-ProjectSpace"]=Te),n.Range=`bytes=0-${s-1}`;const r=await _e(t,{method:"GET",headers:n},"GET");if(!r.ok&&r.status!==206)throw new Error(`HTTP ${r.status}`);const a=r.body.getReader(),o=[];let i=0;for(;;){const{done:N,value:R}=await a.read();if(N)break;if(R&&(o.push(R),i+=R.length),i>=s){a.cancel();break}}const c=new Uint8Array(i);let p=0;for(const N of o)c.set(N,p),p+=N.length;const d=new TextDecoder("utf-8",{fatal:!1}).decode(c),u=r.headers.get("Content-Range"),b=u&&parseInt(u.split("/")[1],10)||null,h=r.status===206||i>=s;return{text:d,truncated:h,totalBytes:b}},fetchListableItems:async(t,s,n=0,r=50)=>{var R;const a=s.list,o=s.serviceCode?qe(s.serviceCode):"",i=a.path.includes("?")?"&":"?",c=a.pageParam||"page",p=a.sizeParam||"size",d=`${o}${a.path}${i}${c}=${n}&${p}=${r}`,u={};ye&&(u.Authorization=`Bearer ${ye}`),Te&&(u["X-PLM-ProjectSpace"]=Te);const b=await _e(d,{method:"GET",headers:u},"GET");if(!b.ok){const A=await b.json().catch(()=>({error:b.statusText})),f=(R=A.violations)!=null&&R.length?A.violations.join("; "):A.error||A.message||`HTTP ${b.status}`,x=new Error(f);throw x.detail=A,x}const h=await b.text(),N=h?JSON.parse(h):null;return ha(N,n,r)},searchNodes:async(t,s={},n={},r=["_type","*"],a=100)=>{const o=`${qe("search")}/search`,i={"Content-Type":"application/json"};ye&&(i.Authorization=`Bearer ${ye}`),Te&&(i["X-PLM-ProjectSpace"]=Te);const c=JSON.stringify({query:t,filterTerms:s,rangeFilters:n,facetOn:r,size:a}),p=await _e(o,{method:"POST",headers:i,body:c},"POST");if(!p.ok){const d=await p.json().catch(()=>({error:p.statusText}));throw new In(p.status,d.error||`HTTP ${p.status}`,d)}return p.json()},searchInfo:async()=>{const t=`${qe("search")}/search/info`,s={};ye&&(s.Authorization=`Bearer ${ye}`);const n=await _e(t,{method:"GET",headers:s},"GET");return n.ok?n.json():{available:!1,nodeCount:0,edgeCount:0}},reindexSearch:()=>De(qe("psm"),"POST","/nodes/internal/search/reindex",{}),searchChildren:async t=>{const s=`${qe("search")}/search/children/${encodeURIComponent(t)}`,n={};ye&&(n.Authorization=`Bearer ${ye}`),Te&&(n["X-PLM-ProjectSpace"]=Te);const r=await _e(s,{method:"GET",headers:n},"GET");if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()},getSources:t=>$e("GET","/sources"),getSourceKeys:(t,s,n,r="",a=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),r&&o.set("q",r),o.set("limit",String(a)),$e("GET",`/sources/${encodeURIComponent(s)}/keys?${o.toString()}`)},getChildLinks:(t,s)=>$e("GET",`/nodes/${s}/links/children`),getParentLinks:(t,s)=>$e("GET",`/nodes/${s}/links/parents`),getLifecycles:t=>te("GET","/metamodel/lifecycles"),getLifecycleStates:(t,s)=>te("GET",`/metamodel/lifecycles/${s}/states`),getLifecycleTransitions:(t,s)=>te("GET",`/metamodel/lifecycles/${s}/transitions`),createLifecycle:(t,s)=>te("POST","/metamodel/lifecycles",t,s),duplicateLifecycle:(t,s,n)=>te("POST",`/metamodel/lifecycles/${s}/duplicate`,t,{name:n}),deleteLifecycle:(t,s)=>te("DELETE",`/metamodel/lifecycles/${s}`),addLifecycleState:(t,s,n)=>te("POST",`/metamodel/lifecycles/${s}/states`,t,n),updateLifecycleState:(t,s,n,r)=>te("PUT",`/metamodel/lifecycles/${s}/states/${n}`,t,r),deleteLifecycleState:(t,s,n)=>te("DELETE",`/metamodel/lifecycles/${s}/states/${n}`),listLifecycleStateActions:(t,s,n)=>te("GET",`/metamodel/lifecycles/${s}/states/${n}/actions`),attachLifecycleStateAction:(t,s,n,r,a,o,i=0)=>te("POST",`/metamodel/lifecycles/${s}/states/${n}/actions`,t,{instanceId:r,trigger:a,executionMode:o,displayOrder:i}),detachLifecycleStateAction:(t,s,n,r)=>te("DELETE",`/metamodel/lifecycles/${s}/states/${n}/actions/${r}`),addLifecycleTransition:(t,s,n)=>te("POST",`/metamodel/lifecycles/${s}/transitions`,t,n),updateLifecycleTransition:(t,s,n,r)=>te("PUT",`/metamodel/lifecycles/${s}/transitions/${n}`,t,r),deleteLifecycleTransition:(t,s,n)=>te("DELETE",`/metamodel/lifecycles/${s}/transitions/${n}`),addTransitionSignatureRequirement:(t,s,n,r=0)=>te("POST",`/metamodel/transitions/${s}/signature-requirements`,t,{roleId:n,displayOrder:r}),removeTransitionSignatureRequirement:(t,s,n)=>te("DELETE",`/metamodel/transitions/${s}/signature-requirements/${n}`),deleteNodeType:(t,s)=>te("DELETE",`/metamodel/nodetypes/${s}`),updateNodeTypeIdentity:(t,s,n)=>te("PUT",`/metamodel/nodetypes/${s}/identity`,t,n),updateNodeTypeNumberingScheme:(t,s,n)=>te("PUT",`/metamodel/nodetypes/${s}/numbering-scheme`,t,{numberingScheme:n}),updateNodeTypeVersionPolicy:(t,s,n)=>te("PUT",`/metamodel/nodetypes/${s}/version-policy`,t,{versionPolicy:n}),updateNodeTypeCollapseHistory:(t,s,n)=>te("PUT",`/metamodel/nodetypes/${s}/collapse-history`,t,{collapseHistory:n}),updateNodeTypeLifecycle:(t,s,n)=>te("PUT",`/metamodel/nodetypes/${s}/lifecycle`,t,{lifecycleId:n||null}),updateNodeTypeAppearance:(t,s,n,r)=>te("PUT",`/metamodel/nodetypes/${s}/appearance`,t,{color:n||null,icon:r||null}),updateAttribute:(t,s,n,r)=>te("PUT",`/metamodel/nodetypes/${s}/attributes/${n}`,t,r),deleteAttribute:(t,s,n)=>te("DELETE",`/metamodel/nodetypes/${s}/attributes/${n}`),updateLinkType:(t,s,n)=>te("PUT",`/metamodel/linktypes/${s}`,t,n),deleteLinkType:(t,s)=>te("DELETE",`/metamodel/linktypes/${s}`),getLinkTypeAttributes:(t,s)=>te("GET",`/metamodel/linktypes/${s}/attributes`),createLinkTypeAttribute:(t,s,n)=>te("POST",`/metamodel/linktypes/${s}/attributes`,t,n),updateLinkTypeAttribute:(t,s,n,r)=>te("PUT",`/metamodel/linktypes/${s}/attributes/${n}`,t,r),deleteLinkTypeAttribute:(t,s,n)=>te("DELETE",`/metamodel/linktypes/${s}/attributes/${n}`),getLinkTypeCascades:(t,s)=>te("GET",`/metamodel/linktypes/${s}/cascades`),createLinkTypeCascade:(t,s,n,r,a)=>te("POST",`/metamodel/linktypes/${s}/cascades`,t,{parentTransitionId:n,childFromStateId:r,childTransitionId:a}),deleteLinkTypeCascade:(t,s,n)=>te("DELETE",`/metamodel/linktypes/${s}/cascades/${n}`),getNodeTypeAttributes:(t,s)=>te("GET",`/metamodel/nodetypes/${s}/attributes`),createNodeType:(t,s)=>te("POST","/metamodel/nodetypes",t,s),updateNodeTypeParent:(t,s,n)=>te("PUT",`/metamodel/nodetypes/${s}/parent`,t,{parentNodeTypeId:n||null}),createAttribute:(t,s,n)=>te("POST",`/metamodel/nodetypes/${s}/attributes`,t,n),createLinkType:(t,s)=>te("POST","/metamodel/linktypes",t,s),getSourcesAdmin:t=>te("GET","/sources"),getSourceResolversAdmin:t=>te("GET","/sources/resolvers"),createSource:(t,s)=>te("POST","/sources",t,s),updateSource:(t,s,n)=>te("PUT",`/sources/${s}`,t,n),deleteSource:(t,s)=>te("DELETE",`/sources/${s}`),getImportContexts:()=>te("GET","/admin/import-contexts"),createImportContext:t=>te("POST","/admin/import-contexts",null,t),updateImportContext:(t,s)=>te("PUT",`/admin/import-contexts/${t}`,null,s),deleteImportContext:t=>te("DELETE",`/admin/import-contexts/${t}`),getImportAlgorithmInstances:()=>te("GET","/admin/import-contexts/algorithm-instances/import"),getValidationAlgorithmInstances:()=>te("GET","/admin/import-contexts/algorithm-instances/validation"),getSources:t=>$e("GET","/sources"),getSourceTypes:(t,s)=>$e("GET",`/sources/${s}/types`),suggestSourceKeys:(t,s,n,r,a=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),r&&o.set("q",r),o.set("limit",String(a)),$e("GET",`/sources/${s}/keys?${o.toString()}`)},getAllActions:t=>te("GET","/metamodel/actions"),getActionsForNodeType:(t,s)=>te("GET",`/metamodel/nodetypes/${s}/actions`),registerCustomAction:(t,s)=>te("POST","/metamodel/actions",t,s),getPermissionGrants:(t,s,n,r)=>he("GET",`/nodetypes/${s}/permissions/${n}${r?`?transitionId=${encodeURIComponent(r)}`:""}`),addPermissionGrant:(t,s,n,r,a)=>he("POST",`/nodetypes/${s}/permissions/${n}`,t,{roleId:r,transitionId:a||null}),removePermissionGrant:(t,s,n,r,a)=>he("DELETE",`/nodetypes/${s}/permissions/${n}`,t,{roleId:r,transitionId:a||null}),getDomains:t=>te("GET","/domains"),createDomain:(t,s)=>te("POST","/domains",t,s),updateDomain:(t,s,n)=>te("PUT",`/domains/${s}`,t,n),deleteDomain:(t,s)=>te("DELETE",`/domains/${s}`),getDomainAttributes:(t,s)=>te("GET",`/domains/${s}/attributes`),createDomainAttribute:(t,s,n)=>te("POST",`/domains/${s}/attributes`,t,n),updateDomainAttribute:(t,s,n,r)=>te("PUT",`/domains/${s}/attributes/${n}`,t,r),deleteDomainAttribute:(t,s,n)=>te("DELETE",`/domains/${s}/attributes/${n}`),getEnums:t=>te("GET","/enums"),getEnumDetail:(t,s)=>te("GET",`/enums/${s}`),createEnum:(t,s)=>te("POST","/enums",t,s),updateEnum:(t,s,n)=>te("PUT",`/enums/${s}`,t,n),deleteEnum:(t,s)=>te("DELETE",`/enums/${s}`),getEnumValues:(t,s)=>te("GET",`/enums/${s}/values`),addEnumValue:(t,s,n)=>te("POST",`/enums/${s}/values`,t,n),updateEnumValue:(t,s,n,r)=>te("PUT",`/enums/${s}/values/${n}`,t,r),deleteEnumValue:(t,s,n)=>te("DELETE",`/enums/${s}/values/${n}`),reorderEnumValues:(t,s,n)=>te("PUT",`/enums/${s}/values/reorder`,t,n),listBaselines:t=>$e("GET","/baselines"),createBaseline:(t,s,n,r)=>$e("POST","/baselines",t,{userId:t,rootNodeId:s,name:n,description:r}),getBaselineContent:(t,s)=>$e("GET",`/baselines/${s}/content`),getRoles:t=>he("GET","/roles"),createRole:(t,s,n)=>he("POST","/roles",t,{name:s,description:n}),updateRole:(t,s,n,r)=>he("PUT",`/roles/${s}`,t,{name:n,description:r}),deleteRole:(t,s)=>he("DELETE",`/roles/${s}`),listProjectSpaces:t=>he("GET",`/project-spaces${t?`?userId=${encodeURIComponent(t)}`:""}`),createProjectSpace:(t,s,n)=>he("POST","/project-spaces",t,{name:s,description:n}),deactivateProjectSpace:(t,s)=>he("DELETE",`/project-spaces/${s}`),getProjectSpaceServiceTags:(t,s)=>he("GET",`/project-spaces/${s}/service-tags`),setProjectSpaceServiceTags:(t,s,n,r)=>he("PUT",`/project-spaces/${s}/service-tags/${n}`,t,{tags:r}),setProjectSpaceIsolated:(t,s,n)=>he("PUT",`/project-spaces/${s}/isolated`,t,{isolated:n}),listUsers:t=>he("GET","/users"),getUser:(t,s)=>he("GET",`/users/${s}`),updateUser:(t,s,n,r)=>he("PUT",`/users/${s}`,t,{displayName:n,email:r}),createUser:(t,s,n,r)=>he("POST","/users",t,{username:s,displayName:n,email:r}),deactivateUser:(t,s)=>he("DELETE",`/users/${s}`),getUserRoles:(t,s,n)=>he("GET",`/users/${s}/roles${n?`?projectSpaceId=${encodeURIComponent(n)}`:""}`),assignRole:(t,s,n,r)=>he("POST",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(r)}`),removeRole:(t,s,n,r)=>he("DELETE",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(r)}`),setUserAdmin:(t,s,n)=>he("PUT",`/users/${s}/admin`,t,{isAdmin:n}),getUserContext:(t,s)=>he("GET",`/users/${t}/context${s?`?projectSpaceId=${encodeURIComponent(s)}`:""}`),getDashboardTransaction:t=>$e("GET","/dashboard/transaction"),getDashboardWorkItems:t=>$e("GET","/dashboard/workitems"),listPermissions:t=>he("GET","/permissions"),createPermission:(t,s,n,r,a,o)=>he("POST","/permissions",t,{permissionCode:s,scope:n,displayName:r,description:a,displayOrder:o}),updatePermission:(t,s,n,r,a)=>he("PUT",`/permissions/${s}`,t,{displayName:n,description:r,displayOrder:a}),getRolePolicies:(t,s)=>he("GET",`/roles/${s}/policies`),listGlobalActions:t=>he("GET","/global-actions"),getMyGlobalPermissions:t=>he("GET","/my-global-permissions"),getSettingsSections:t=>pe("GET","/sections"),getUiManifest:()=>pe("GET","/ui/manifest"),createResource:(t,s)=>ga(t,s),getRoleGlobalPermissions:(t,s)=>he("GET",`/roles/${s}/global-permissions`),addRoleGlobalPermission:(t,s,n)=>he("POST",`/roles/${s}/global-permissions`,t,{permissionCode:n}),removeRoleGlobalPermission:(t,s,n)=>he("DELETE",`/roles/${s}/global-permissions/${n}`),getRoleScopePermissions:(t,s,n)=>he("GET",`/roles/${s}/scope-permissions/${n}`),addRoleScopePermission:(t,s,n,r)=>he("POST",`/roles/${s}/scope-permissions/${n}`,t,{permissionCode:r}),removeRoleScopePermission:(t,s,n,r)=>he("DELETE",`/roles/${s}/scope-permissions/${n}/${r}`),getAccessRightsTree:(t,s)=>he("GET",`/access-rights/tree${s?`?projectSpaceId=${s}`:""}`),getGrantsForRoleAndScope:(t,s,n)=>he("GET",`/access-rights/roles/${s}/grants?scopeCode=${n}`),addScopedGrant:(t,s)=>he("POST","/access-rights/grants",t,s),removeScopedGrant:(t,s)=>he("DELETE","/access-rights/grants",t,s),listSecrets:t=>pe("GET","/admin/secrets"),revealSecret:(t,s)=>pe("GET",`/admin/secrets/${encodeURIComponent(s)}`),createSecret:(t,s,n)=>pe("POST","/admin/secrets",t,{key:s,value:n}),updateSecret:(t,s,n)=>pe("PUT",`/admin/secrets/${encodeURIComponent(s)}`,t,{value:n}),deleteSecret:(t,s)=>pe("DELETE",`/admin/secrets/${encodeURIComponent(s)}`),listAllInstances:t=>pe("GET","/algorithms/instances"),listTransitionGuards:(t,s)=>te("GET",`/metamodel/lifecycles/transitions/${s}/guards`),attachTransitionGuard:(t,s,n,r,a)=>te("POST",`/metamodel/lifecycles/transitions/${s}/guards`,t,{instanceId:n,effect:r,displayOrder:a}),updateTransitionGuard:(t,s,n)=>te("PUT",`/metamodel/lifecycles/transitions/guards/${s}`,t,{effect:n}),detachTransitionGuard:(t,s)=>te("DELETE",`/metamodel/lifecycles/transitions/guards/${s}`)},ze={listActions:(t,s)=>pe("GET",`/actions${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAction:(t,s)=>pe("GET",`/actions/${s}`),createAction:(t,s)=>pe("POST","/actions",t,s),updateAction:(t,s,n)=>pe("PUT",`/actions/${s}`,t,n),deleteAction:(t,s)=>pe("DELETE",`/actions/${s}`),listParameters:(t,s)=>pe("GET",`/actions/${s}/parameters`),addParameter:(t,s,n)=>pe("POST",`/actions/${s}/parameters`,t,n),listActionGuards:(t,s)=>pe("GET",`/actions/${s}/guards`),attachActionGuard:(t,s,n,r,a)=>pe("POST",`/actions/${s}/guards`,t,{instanceId:n,effect:r,displayOrder:a}),updateActionGuard:(t,s,n,r)=>pe("PUT",`/actions/${s}/guards/${n}`,t,{effect:r}),detachActionGuard:(t,s,n)=>pe("DELETE",`/actions/${s}/guards/${n}`),listAlgorithmTypes:(t,s)=>pe("GET",`/algorithms/types${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithms:(t,s)=>pe("GET",`/algorithms${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithmParameters:(t,s)=>pe("GET",`/algorithms/${s}/parameters`),listAllInstances:(t,s)=>pe("GET",`/algorithms/instances${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),createInstance:(t,s,n,r)=>pe("POST","/algorithms/instances",t,{algorithmId:s,name:n,serviceCode:r}),updateInstance:(t,s,n)=>pe("PUT",`/algorithms/instances/${s}`,t,{name:n}),deleteInstance:(t,s)=>pe("DELETE",`/algorithms/instances/${s}`),getInstanceParams:(t,s)=>pe("GET",`/algorithms/instances/${s}/params`),setInstanceParam:(t,s,n,r)=>pe("PUT",`/algorithms/instances/${s}/params/${n}`,t,{value:r}),getAlgorithmStats:(t,s)=>pe("GET",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAlgorithmTimeseries:(t,s=24,n)=>pe("GET",`/algorithms/stats/timeseries?hours=${s}${n?`&serviceCode=${encodeURIComponent(n)}`:""}`),resetAlgorithmStats:(t,s)=>pe("DELETE",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listActionWrappers:(t,s)=>pe("GET",`/algorithms/actions/${s}/wrappers`),attachActionWrapper:(t,s,n,r,a)=>pe("POST",`/algorithms/actions/${s}/wrappers`,t,{instanceId:n,executionOrder:r,serviceCode:a}),detachActionWrapper:(t,s,n)=>pe("DELETE",`/algorithms/actions/${s}/wrappers/${n}`),getRegisteredServices:()=>pe("GET","/algorithms/services"),getServiceCatalog:t=>pe("GET","/registry/actions").then(s=>{var n;return((n=s==null?void 0:s.services)==null?void 0:n[t])||{handlers:[],guards:[]}})},ht={open:(t,s,n="psm")=>pe("POST",`/transactions/${n}`),current:async t=>{const s=await pe("GET","/transactions?status=OPEN");return Array.isArray(s)&&s.length>0?s[0]:null},commit:(t,s,n,r,a)=>pe("POST",`/transactions/${s}/${n}/commit`,null,{comment:r,...a!=null&&a.length?{itemIds:a}:{}}),release:(t,s,n,r)=>pe("DELETE",`/transactions/${s}/${n}/items`,null,{itemIds:r}),rollback:(t,s,n)=>pe("POST",`/transactions/${s}/${n}/rollback`),get:(t,s,n)=>pe("GET",`/transactions/${s}/${n}`),nodes:async(t,s,n)=>{const r=await pe("GET",`/transactions/${s}/${n}`);return(r==null?void 0:r.items)||[]},versions:(t,s)=>$e("GET",`/transactions/${s}/versions`)};async function Hs(t,s,n,r,a){return De(qe("psm"),t,s,a,{txId:r})}async function Cs(t,s){const n={"Content-Type":"application/json"};ye&&(n.Authorization=`Bearer ${ye}`),Te&&(n["X-PLM-ProjectSpace"]=Te);const r=await _e(`/api/${t}${s}`,{method:"GET",headers:n},"GET");if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}const va={submitImport:async(t,s,n,r)=>{const a={};ye&&(a.Authorization=`Bearer ${ye}`),Te&&(a["X-PLM-ProjectSpace"]=Te);const o=new FormData;o.append("file",t),n&&o.append("contextCode",n);const i=r?await Ot(`/api/psm/cad/import/${s}`,"POST",a,o,r):await _e(`/api/psm/cad/import/${s}`,{method:"POST",headers:a,body:o},"POST");if(!i.ok){const c=await i.text();throw new Error(`HTTP ${i.status}: ${c}`)}return i.json()},getJobStatus:async t=>{const s={"Content-Type":"application/json"};ye&&(s.Authorization=`Bearer ${ye}`),Te&&(s["X-PLM-ProjectSpace"]=Te);const n=await _e(`/api/psm/cad/jobs/${t}`,{method:"GET",headers:s},"GET");if(!n.ok)throw new Error(`HTTP ${n.status}`);return n.json()},getImportContexts:async()=>{const t={"Content-Type":"application/json"};ye&&(t.Authorization=`Bearer ${ye}`),Te&&(t["X-PLM-ProjectSpace"]=Te);const s=await _e("/api/psm/cad/import-contexts",{method:"GET",headers:t},"GET");return s.ok?s.json():[]}},ya={executeAction:(t,s,n,r,a,o)=>{const i=o?`/actions/${s}/${t}/${o}`:`/actions/${s}/${t}`;return Hs("POST",i,n,r,{parameters:a||{}})},executeViaDescriptor:async(t,s,n,r,a,o)=>{var p;const i=(t.path||"").replace("{id}",s).replace("{transitionId}",((p=t.metadata)==null?void 0:p.transitionId)||""),c=t.httpMethod||"POST";if(t.bodyShape==="MULTIPART"){const d=new FormData;for(const[N,R]of Object.entries(a||{}))R!=null&&d.append(N,R);const u={};ye&&(u.Authorization=`Bearer ${ye}`),Te&&(u["X-PLM-ProjectSpace"]=Te),r&&(u["X-PLM-Tx"]=r);const b=o?await Ot("/api/psm"+i,c,u,d,o):await _e("/api/psm"+i,{method:c,headers:u,body:d},c);if(!b.ok){const N=await b.text();throw new Error(`HTTP ${b.status}: ${N}`)}const h=await b.text();return h?JSON.parse(h):null}return Hs(c,i,n,r,{parameters:a||{}})}},Et={list:t=>he("GET",`/users/${encodeURIComponent(t)}/basket`),add:(t,s,n,r)=>he("PUT",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(r)}`),remove:(t,s,n,r)=>he("DELETE",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(r)}`),clear:t=>he("DELETE",`/users/${encodeURIComponent(t)}/basket`)},$n={getSingle:(t,s,n)=>he("GET",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}`,void 0,void 0,{psOverride:""}),setSingle:(t,s,n,r)=>he("PUT",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}/${encodeURIComponent(r)}`,void 0,void 0,{psOverride:""})},ae=bn((t,s)=>({userId:null,setUserId:n=>t({userId:n}),projectSpaceId:null,setProjectSpaceId:n=>t({projectSpaceId:n}),items:[],nodeTypes:[],resources:[],itemsStatus:"idle",refreshItems:async()=>{const{userId:n}=s();if(n){t({itemsStatus:"loading"});try{const r=await ee.getItems(n),a=Array.isArray(r)?r:[],o=a.filter(c=>c.serviceCode==="psm"&&c.list).map(c=>({id:c.itemCode,name:c.displayName,description:c.description,color:c.color,icon:c.icon})),i=a.filter(c=>c.create);t({items:a,nodeTypes:o,resources:i,itemsStatus:"loaded"})}catch{t({items:[],nodeTypes:[],resources:[],itemsStatus:"idle"})}}},stateColorMap:{},stateColorMapLoaded:!1,refreshStateColorMap:async()=>{const{userId:n}=s();if(n)try{const r=await ee.getLifecycles(n);if(!Array.isArray(r))return;const a=await Promise.all(r.map(i=>ee.getLifecycleStates(n,i.id||i.ID).catch(()=>[]))),o={};a.forEach(i=>i.forEach(c=>{const p=c.id||c.ID,d=c.color||c.COLOR;p&&d&&(o[p]=d)})),t({stateColorMap:o,stateColorMapLoaded:!0})}catch{}},projectSpaces:[],users:[],refreshProjectSpaces:async()=>{const{userId:n}=s();if(n)try{const r=await ee.listProjectSpaces(n);t({projectSpaces:Array.isArray(r)?r:[]})}catch{}},refreshUsers:async()=>{const{userId:n}=s();if(n)try{const r=await ee.listUsers(n);t({users:Array.isArray(r)?r.filter(a=>a.active!==!1):[]})}catch{}},nodes:[],refreshNodes:async()=>{const{userId:n,items:r}=s();if(n)try{const a=r.filter(i=>i.serviceCode==="psm"&&i.list),o=await Promise.all(a.map(i=>ee.fetchListableItems(n,i,0,50).then(c=>c.items||[]).catch(()=>[])));t({nodes:o.flat()})}catch{}},activeTx:null,txNodes:[],lockedByMe:new Set,lockItem:n=>t(r=>{const a=new Set(r.lockedByMe);return a.add(n),{lockedByMe:a}}),unlockItem:n=>t(r=>{const a=new Set(r.lockedByMe);return a.delete(n),{lockedByMe:a}}),unlockAll:()=>t({lockedByMe:new Set}),refreshTx:async()=>{const{userId:n}=s();if(n)try{const r=await ht.current(n);if(r){const a=await ht.nodes(n,r.serviceCode,r.txId).catch(()=>[]),o=Array.isArray(a)?a:[],i=new Set(o.map(c=>c.itemId).filter(Boolean));t({activeTx:r,txNodes:o,lockedByMe:i})}else t({activeTx:null,txNodes:[],lockedByMe:new Set})}catch{t({activeTx:null,txNodes:[],lockedByMe:new Set})}},clearTx:()=>t({activeTx:null,txNodes:[],lockedByMe:new Set}),refreshAll:async()=>{const{refreshItems:n,refreshTx:r}=s();await Promise.all([n(),r()])},basketItems:{},basketLoaded:!1,loadBasket:async n=>{if(n)try{const r=await Et.list(n),a={};(r||[]).forEach(({source:o,typeCode:i,itemId:c})=>{const p=`${o}:${i}`;a[p]||(a[p]=new Set),a[p].add(c)}),t({basketItems:a,basketLoaded:!0})}catch{t({basketItems:{},basketLoaded:!0})}},addToBasket:async(n,r,a,o)=>{const i=`${r}:${a}`;t(c=>{const p=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return p.add(o),{basketItems:{...c.basketItems,[i]:p}}});try{await Et.add(n,r,a,o)}catch{}},removeFromBasket:async(n,r,a,o)=>{const i=`${r}:${a}`;t(c=>{const p=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return p.delete(o),{basketItems:{...c.basketItems,[i]:p}}});try{await Et.remove(n,r,a,o)}catch{}},emptyBasket:async n=>{const{lockedByMe:r,basketItems:a}=s(),o=new Set(r);if(![...Object.entries(a)].some(([d,u])=>d.startsWith("psm:")&&[...u].some(b=>o.has(b)))){t({basketItems:{}});try{await Et.clear(n)}catch{}return}const c={},p=[];for(const[d,u]of Object.entries(a)){const b=d.indexOf(":"),h=b>-1?d.slice(0,b):d,N=b>-1?d.slice(b+1):"",R=new Set;for(const A of u){if(h==="psm"&&o.has(A)){R.add(A);continue}p.push(Et.remove(n,h,N,A).catch(()=>{}))}R.size>0&&(c[d]=R)}t({basketItems:c}),await Promise.all(p)},isInBasket:(n,r,a)=>{const o=`${n}:${r}`,{basketItems:i}=ae.getState();return!!(i[o]&&i[o].has(a))},syncBasketAdd:(n,r)=>t(a=>{const o=a.basketItems[n]?new Set(a.basketItems[n]):new Set;return o.add(r),{basketItems:{...a.basketItems,[n]:o}}}),syncBasketRemove:(n,r)=>t(a=>{if(!a.basketItems[n])return{};const o=new Set(a.basketItems[n]);return o.delete(r),{basketItems:{...a.basketItems,[n]:o}}}),syncBasketClear:()=>t({basketItems:{}}),removeBasketItemIds:n=>t(r=>{const a=new Set(n),o={};for(const[i,c]of Object.entries(r.basketItems)){const p=new Set([...c].filter(d=>!a.has(d)));p.size>0&&(o[i]=p)}return{basketItems:o}}),_slices:{},_sliceActions:{}})),Rn="plm-theme",Pn="UI_PREF";function xs(t){return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function fs(t){document.documentElement.setAttribute("data-theme",t)}function Yt(){return localStorage.getItem(Rn)||"dark"}function Es(t){localStorage.setItem(Rn,t),fs(xs(t))}async function ja(t){try{const s=await $n.getSingle(t,Pn,"theme");s!=null&&s.value&&Es(s.value)}catch{}}async function wa(t,s){try{await $n.setSingle(t,Pn,"theme",s)}catch{}}function ka(){const t=Yt();fs(xs(t)),window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{Yt()==="system"&&fs(xs("system"))})}const be=bn(t=>({showCollab:!1,collabWidth:320,collabVersionFilter:null,collabTriggerText:null,collabTabs:[],toggleCollab:()=>t(s=>({showCollab:!s.showCollab})),openCollab:()=>t({showCollab:!0}),closeCollab:()=>t({showCollab:!1}),setCollabWidth:s=>t({collabWidth:s}),setVersionFilter:s=>t({collabVersionFilter:s}),setTriggerText:s=>t({collabTriggerText:s}),clearTriggerText:()=>t({collabTriggerText:null}),addCollabTab:(s,n,r)=>t(a=>({collabTabs:a.collabTabs.some(o=>o.id===s)?a.collabTabs:[...a.collabTabs,{id:s,label:n,Component:r}]})),removeCollabTab:s=>t(n=>({collabTabs:n.collabTabs.filter(r=>r.id!==s)})),consoleVisible:!1,consoleHeight:220,consoleTabs:[],consoleLog:[],toggleConsole:()=>t(s=>({consoleVisible:!s.consoleVisible})),openConsole:()=>t({consoleVisible:!0}),setConsoleHeight:s=>t({consoleHeight:s}),addConsoleTab:(s,n,r)=>t(a=>({consoleTabs:a.consoleTabs.some(o=>o.id===s)?a.consoleTabs:[...a.consoleTabs,{id:s,label:n,Component:r}]})),removeConsoleTab:s=>t(n=>({consoleTabs:n.consoleTabs.filter(r=>r.id!==s)})),appendLog:(s,n)=>t(r=>({consoleLog:[...r.consoleLog.slice(-500),{level:s,message:n,ts:Date.now()}]})),statusSlots:[],registerStatus:(s,n,r="left")=>t(a=>({statusSlots:a.statusSlots.some(o=>o.id===s)?a.statusSlots.map(o=>o.id===s?{id:s,Component:n,position:r}:o):[...a.statusSlots,{id:s,Component:n,position:r}]})),unregisterStatus:s=>t(n=>({statusSlots:n.statusSlots.filter(r=>r.id!==s)})),bgJobs:[],registerBgJob:(s,n,r)=>t(a=>({bgJobs:a.bgJobs.some(o=>o.id===s)?a.bgJobs.map(o=>o.id===s?{...o,label:n,onOpen:r}:o):[...a.bgJobs,{id:s,label:n,status:"running",onOpen:r}]})),updateBgJob:(s,n)=>t(r=>({bgJobs:r.bgJobs.map(a=>a.id===s?{...a,status:n}:a)})),removeBgJob:s=>t(n=>({bgJobs:n.bgJobs.filter(r=>r.id!==s)})),_wsListeners:new Set,fireWsEvent:s=>{be.getState()._wsListeners.forEach(n=>n(s))},subscribeWsEvent:s=>(be.getState()._wsListeners.add(s),()=>be.getState()._wsListeners.delete(s))}));function Tt(t,s){be.getState().appendLog(t,s)}function Sa(t){if(!t.event)return`[WS] (unknown) ${JSON.stringify(t)}`;const s=[t.event];return t.byUser&&s.push(`by ${t.byUser}`),(t.nodeId||t.itemId)&&s.push(`node=${t.nodeId||t.itemId}`),t.userId&&s.push(`user=${t.userId}`),t.entity&&s.push(t.entity),t.status&&s.push(t.status),t.jobId&&s.push(`job=${t.jobId}`),`[WS] ${s.join(" · ")}`}function Ln(t,s,n,r){const a=l.useRef(s);a.current=s;const o=l.useRef(r);o.current=r;const i=l.useRef(null),c=Array.isArray(t)?t:t?[t]:[],p=c.join("\0");l.useEffect(()=>{if(c.length===0)return;let d=null,u=null,b=1e3,h=!1;function N(A){const f=o.current;f&&A&&A.readyState===WebSocket.OPEN&&A.send(JSON.stringify({type:"subscribe",projectSpaceId:f}))}function R(){if(h)return;const A=ft(),f=location.protocol==="https:"?"wss:":"ws:",x=A?`${f}//${location.host}/api/ws/?token=${encodeURIComponent(A)}`:`${f}//${location.host}/api/ws/`;d=new WebSocket(x),i.current=d,d.onopen=()=>{b=1e3,Tt("debug","[WS] connected"),N(d)},d.onmessage=m=>{try{const y=JSON.parse(m.data);Tt("info",Sa(y)),a.current(y),be.getState().fireWsEvent(y)}catch(y){console.warn("WS parse error",y),Tt("warn",`[WS] parse error: ${y.message}`)}},d.onclose=m=>{i.current=null,!h&&(Tt("warn",`[WS] disconnected — reconnecting in ${b}ms`),u=setTimeout(()=>{b=Math.min(b*2,3e4),R()},b))},d.onerror=()=>{Tt("warn","[WS] connection error")}}return R(),()=>{h=!0,i.current=null,u&&clearTimeout(u),d&&(d.onclose=null,d.close())}},[p,n]),l.useEffect(()=>{const d=i.current;d&&d.readyState===WebSocket.OPEN&&r&&d.send(JSON.stringify({type:"subscribe",projectSpaceId:r}))},[r])}const Je={Box:Pr,Package:Nn,Cpu:Ss,Wrench:Rr,Cog:$r,Database:Sn,Globe:kn,BookOpen:wn,Clipboard:Ar,Tag:Ir,FolderOpen:zr,Archive:Tr,Zap:ks,FlaskConical:Er,Microscope:Cr,Layers:Qt,FileText:Nr,GitBranch:jn,Hexagon:Mt,Circle:Sr,Users:yn,Shield:gt,Award:vn,LayoutDashboard:kr,Component:wr,Blocks:jr,Cable:yr,Gauge:vr,Radio:br,Scan:gr},Na={user:es,layers:Qt,database:Sn,list:Dr,lifecycle:jn,plug:Or,hexagon:Mt,users:yn,shield:gt,cpu:Ss,workflow:Cn,key:Mr,network:Br,globe:kn,terminal:Lr,book:wn,zap:ks,package:Nn},Dt=Object.freeze({serviceCode:"psm",get:Object.freeze({httpMethod:"GET",path:"/nodes/{id}/description"})}),Ct=[];function gs(t){if(!t||!t.match||!t.match.serviceCode)throw new Error("Plugin requires match.serviceCode");const s=(t.match.itemKey?4:0)+(t.match.itemCode?2:0)+(t.match.serviceCode==="*"?0:1);t._specificity=s,Ct.push(t),Ct.sort((n,r)=>(r._specificity||0)-(n._specificity||0))}function Bn(t,s){const n=t.match;return!(n.serviceCode!=="*"&&n.serviceCode!==s.serviceCode||n.itemCode&&n.itemCode!==s.itemCode||n.itemKey&&n.itemKey!==s.itemKey)}function Zt(t){for(const s of Ct)if(Bn(s,t||{}))return s;return Bt}function Ca(t){if(!t)return Bt;for(const s of Ct)if(Bn(s,t))return s;return Bt}let Bt={match:{serviceCode:"*"},name:"default",hasItemChildren:()=>!1};function Ea(t){Bt={...Bt,...t,match:{serviceCode:"*"}}}function Ta(t){for(const s of Ct)if(s.LinkRow&&(s.match.serviceCode==="*"||s.match.serviceCode===t))return s.LinkRow;return null}function Vs(t,s,n){const r=Ct.find(a=>a.match.serviceCode===t&&(!s||a.match.itemCode===s));r?Object.assign(r,n):gs({match:{serviceCode:t,itemCode:s},...n})}function za(t){return!t||t.id==="dashboard"||!t.nodeId?null:{source:t.serviceCode||"",type:t.itemCode||"",key:t.nodeId}}function os(t){return`${t.serviceCode}:${t.itemCode||""}`}function Ia(t,s){return t.serviceCode===s.source&&t.itemCode===s.type}function Mn(t){if(!t)return null;const s={id:t.id,_title:t.title};t.itemType&&(s._serviceCode=t.itemType.serviceCode,s._itemCode=t.itemType.itemCode,s._itemKey=t.itemType.itemKey??null);for(const n of t.values??t.fields??[])s[n.name]=n.value;return s}function On({descriptor:t,item:s,ctx:n,isActive:r,isOpen:a,isPinned:o,hasChildren:i,isExpanded:c,isLoading:p,onToggleExpand:d,onToggleChildren:u,onPin:b,onUnpin:h}){var D,G,H,B,L;const N=d||u,R=Zt(t),A=R==null?void 0:R.NavLabel,f=((D=R==null?void 0:R.getRowProps)==null?void 0:D.call(R,s,t,n))??{},x=((H=(G=t.list)==null?void 0:G.itemShape)==null?void 0:H.idField)||"id",m=((L=(B=t.list)==null?void 0:B.itemShape)==null?void 0:L.labelField)||"_title",y=(s==null?void 0:s[x])||(s==null?void 0:s.id)||(s==null?void 0:s.ID),g=(s==null?void 0:s[m])||(s==null?void 0:s._title)||y,j=t.icon?Je[t.icon]:null;return e.jsxs("div",{className:`node-item${r?" active":""}`,onClick:()=>n.onNavigate(y,g,t),title:f.title??g,...f,children:[e.jsx("span",{className:"ni-expand",style:{visibility:p||i?"visible":"hidden"},onClick:w=>{w.stopPropagation(),N==null||N(w)},children:p?e.jsx("span",{style:{fontSize:9,color:"var(--muted)",lineHeight:1},children:"…"}):c?e.jsx(Ke,{size:9,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(He,{size:9,strokeWidth:2.5,color:"var(--muted)"})}),j?e.jsx(j,{size:11,color:t.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):t.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:t.color,flexShrink:0,display:"inline-block"}}):null,a&&!o&&e.jsx("span",{title:"Open",style:{width:5,height:5,borderRadius:"50%",background:"var(--accent)",flexShrink:0,display:"inline-block"}}),A?e.jsx(A,{item:s,descriptor:t,ctx:n}):e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:g||y}),(b||h)&&e.jsx("button",{className:`search-pin-btn${o?" pinned":""}`,title:o?"Remove from basket":"Add to basket",onClick:w=>{w.stopPropagation(),o?h==null||h():b==null||b()},children:o?e.jsx(ts,{size:11,strokeWidth:2}):e.jsx(ss,{size:11,strokeWidth:2})})]})}const Aa=8;function Dn({descriptor:t,itemRef:s,initialItem:n,ctx:r,isOpen:a,isPinned:o}){const[i,c]=l.useState(n??null),[p,d]=l.useState(!n&&!!(t!=null&&t.get)),[u,b]=l.useState(!1),[h,N]=l.useState(!1),[R,A]=l.useState(!1),f=l.useRef({}),[x,m]=l.useState(new Set),[,y]=l.useState(0),g=ae($=>$.addToBasket),j=ae($=>$.removeFromBasket),D=ae($=>$.lockedByMe),G=ae($=>$.userId);l.useEffect(()=>{n&&(c(n),d(!1),b(!1))},[n]),l.useEffect(()=>{if(n||!(t!=null&&t.get)){n||d(!1);return}let $=!1;return d(!0),b(!1),An(t.serviceCode,t.get,s.key).then(U=>{if(!$){const K=Mn(U);K?(c(K),b(!1)):b(!0),d(!1)}}).catch(()=>{$||(b(!0),d(!1))}),()=>{$=!0}},[s.key,t==null?void 0:t.serviceCode]);const H=Zt(t),B=i||{id:s.key,_title:s.key},L=B.id||B.ID||s.key,w=r.activeNodeId===L,k=(t==null?void 0:t.serviceCode)==="psm"&&D.has(L),q=!p&&i&&H.hasItemChildren?H.hasItemChildren(B):!1,Q=l.useCallback(()=>{g(G,t.serviceCode,t.itemCode,L)},[g,G,t,L]),T=l.useCallback(()=>{j(G,t.serviceCode,t.itemCode,L)},[j,G,t,L]),F=k?null:T,I=l.useCallback(async $=>{$==null||$.stopPropagation();const U=!h;if(N(U),!!U&&f.current[L]===void 0){if(!H.fetchChildren){f.current[L]=[];return}f.current[L]="loading",A(!0),y(K=>K+1);try{const K=await H.fetchChildren(B,r);f.current[L]=Array.isArray(K)?K:[]}catch{f.current[L]=[]}finally{A(!1),y(K=>K+1)}}},[h,L,H,B,r]),z=l.useCallback(async($,U,K)=>{if(K&&K.stopPropagation(),m(C=>{const M=new Set(C);return M.has($)?M.delete($):M.add($),M}),f.current[U]===void 0){if(!H.fetchChildren){f.current[U]=[];return}f.current[U]="loading",y(C=>C+1);try{const C=await H.fetchChildren({id:U},r);f.current[U]=Array.isArray(C)?C:[]}catch{f.current[U]=[]}y(C=>C+1)}},[H,r]);function v($,U,K,C){if(K>Aa)return null;const M=$.id||$.ID||U,V=f.current[M];return!Array.isArray(V)||V.length===0||!H.ChildRow?null:V.map(W=>{const Y=W.targetNodeId||W.id||W.ID,oe=`${U}/${W.linkId||Y}`,_=!C.has(Y)&&x.has(oe);return e.jsxs(We.Fragment,{children:[e.jsx(H.ChildRow,{link:W,child:W,depth:K,parentPath:oe,ancestorIds:C,ctx:r,childCacheRef:f,expandedPaths:x,toggleNodeChildren:(O,X,se)=>z(O,X,se)}),_&&v({id:Y},oe,K+1,new Set([...C,Y]))]},oe)})}const P=`${(t==null?void 0:t.serviceCode)||""}:${(t==null?void 0:t.itemCode)||""}:${L}`,J=f.current[L]==="loading"||R;return p?e.jsx("div",{className:"node-item",style:{color:"var(--muted)",fontSize:10,paddingLeft:24},children:"…"}):u?e.jsxs("div",{className:"node-item",title:`Could not resolve item: ${s.key}`,style:{color:"var(--danger, #e55)",fontSize:10,gap:6,cursor:"default"},children:[e.jsx("span",{style:{opacity:.7},children:"⚠"}),e.jsx("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"monospace"},children:s.key})]}):e.jsxs(e.Fragment,{children:[e.jsx(On,{descriptor:t,item:B,ctx:r,isActive:w,isOpen:a,isPinned:o,hasChildren:q,isExpanded:h,isLoading:J,onToggleExpand:I,onToggleChildren:I,onPin:Q,onUnpin:F}),h&&v(B,P,1,new Set([L]))]})}const $a=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function Ra({userId:t}){const[s,n]=l.useState(Yt);function r(a){n(a),Es(a),t&&wa(t,a)}return e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:8},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:$a.map(a=>e.jsxs("button",{type:"button",className:`theme-option${s===a.value?" theme-option--active":""}`,onClick:()=>r(a.value),children:[e.jsx("span",{className:"theme-option-icon",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))})]})}const qs=["#5b9cf6","#56d18e","#e8c547","#a78bfa","#f87171","#34d399","#fb923c","#60a5fa"];function _n(t){if(!t)return"#64748b";let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)&4294967295;return qs[Math.abs(s)%qs.length]}function Wn(t){const s=(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||"?",n=s.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():s[0].toUpperCase()}function Pa({user:t,userId:s}){const n=_n((t==null?void 0:t.id)||s);return e.jsxs("div",{className:"user-avatar",style:{"--avatar-color":n},title:(t==null?void 0:t.displayName)||(t==null?void 0:t.username),children:[t!=null&&t.avatarUrl?e.jsx("img",{className:"user-avatar-img",src:t.avatarUrl,alt:""}):e.jsx("span",{className:"user-avatar-initials",children:Wn(t)}),(t==null?void 0:t.isAdmin)&&e.jsx("span",{className:"user-avatar-badge",title:"Administrator",children:"A"})]})}function La({userId:t,onClose:s}){const[n,r]=l.useState(null),[a,o]=l.useState(!1),[i,c]=l.useState({displayName:"",email:""}),[p,d]=l.useState(!1),[u,b]=l.useState(null);l.useEffect(()=>{ee.getUser(t,t).then(r).catch(()=>{})},[t]);function h(f,x){b({msg:f,type:x}),setTimeout(()=>b(null),2500)}function N(){c({displayName:(n==null?void 0:n.displayName)||"",email:(n==null?void 0:n.email)||""}),o(!0)}async function R(){d(!0);try{await ee.updateUser(t,t,i.displayName.trim(),i.email.trim());const f=await ee.getUser(t,t);r(f),o(!1),h("Profile updated","success")}catch{h("Failed to update profile","error")}finally{d(!1)}}l.useEffect(()=>{function f(x){x.key==="Escape"&&s()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[s]);const A=_n(t);return e.jsx("div",{className:"profile-modal-overlay",onMouseDown:f=>{f.target===f.currentTarget&&s()},children:e.jsxs("div",{className:"profile-modal",children:[e.jsxs("div",{className:"profile-modal-header",children:[e.jsx("span",{className:"profile-modal-title",children:"My Profile"}),e.jsx("button",{className:"icon-btn",onClick:s,title:"Close",children:e.jsx(xt,{size:14,strokeWidth:2})})]}),e.jsxs("div",{className:"profile-modal-body",children:[u&&e.jsx("div",{style:{padding:"7px 12px",borderRadius:"var(--r)",fontSize:12,fontWeight:500,background:u.type==="success"?"rgba(56,212,113,.15)":"rgba(248,113,113,.15)",color:u.type==="success"?"#34d399":"#f87171",border:`1px solid ${u.type==="success"?"#34d39940":"#f8717140"}`},children:u.msg}),n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:"50%",border:`3px solid ${A}`,background:`color-mix(in srgb, ${A} 12%, var(--surface))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:A,flexShrink:0},children:n.avatarUrl?e.jsx("img",{src:n.avatarUrl,alt:"",style:{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}):Wn(n)}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:14,fontWeight:700,color:"var(--text)"},children:n.displayName||n.username}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2},children:n.username}),n.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",style:{marginTop:4,display:"inline-block"},children:"Admin"})]})]}),a?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Display Name"}),e.jsx("input",{className:"field-input",autoFocus:!0,value:i.displayName,onChange:f=>c(x=>({...x,displayName:f.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Email"}),e.jsx("input",{className:"field-input",type:"email",value:i.email,onChange:f=>c(x=>({...x,email:f.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("button",{className:"btn btn-primary",onClick:R,disabled:p,children:p?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>o(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.email||"—"})]}),e.jsx("div",{children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:N,children:[e.jsx(bt,{size:11,strokeWidth:2}),"Edit"]})})]}),e.jsx("div",{style:{borderTop:"1px solid var(--border)",paddingTop:12,marginTop:4},children:e.jsx(Ra,{userId:t})})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})]})]})})}function Ba({currentUser:t,userId:s,users:n,onUserChange:r,onOpenProfile:a,onClose:o}){const i=l.useRef(null);return l.useEffect(()=>{function c(p){i.current&&!i.current.contains(p.target)&&o()}return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[o]),e.jsxs("div",{className:"profile-menu",ref:i,children:[e.jsxs("div",{className:"profile-menu-header",children:[e.jsx("div",{className:"profile-menu-name",children:(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||s}),(t==null?void 0:t.username)&&t.username!==t.displayName&&e.jsx("div",{className:"profile-menu-username",children:t.username})]}),(n||[]).length>1&&e.jsxs("div",{className:"profile-menu-section",children:[e.jsx("div",{className:"profile-menu-label",children:"Switch user"}),e.jsx("div",{className:"profile-menu-select-row",children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"user-select",style:{width:"100%",paddingRight:28},value:s,onChange:c=>{r(c.target.value),o()},children:n.map(c=>e.jsx("option",{value:c.id,children:c.displayName||c.username},c.id))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})})]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",onClick:()=>{a(),o()},children:[e.jsx(es,{size:13,strokeWidth:2,color:"var(--muted)"}),"My Profile"]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",disabled:!0,title:"Not yet implemented",children:[e.jsx(Wr,{size:13,strokeWidth:2,color:"var(--muted)"}),"Logout"]})]})}function Ma({onNavigate:t}){const s=ae(h=>h.basketItems),n=ae(h=>h.emptyBasket),r=ae(h=>h.userId),a=ae(h=>h.items),o=ae(h=>h.stateColorMap),[i,c]=We.useState(!1),p=We.useRef(null),d=Object.values(s).reduce((h,N)=>h+N.size,0);We.useEffect(()=>{if(!i)return;function h(N){p.current&&!p.current.contains(N.target)&&c(!1)}return document.addEventListener("mousedown",h),()=>document.removeEventListener("mousedown",h)},[i]);const u=We.useMemo(()=>({userId:r,activeNodeId:null,stateColorMap:o,onNavigate:(h,N,R)=>{t==null||t(h,N,R),c(!1)}}),[r,o,t]),b=We.useMemo(()=>{const h=[];for(const[N,R]of Object.entries(s)){const A=N.indexOf(":"),f=A>-1?N.slice(0,A):N,x=A>-1?N.slice(A+1):"",m=a.find(y=>y.serviceCode===f&&y.itemCode===x);if(m)for(const y of R)h.push({descriptor:m,itemRef:{source:f,type:x,key:y}})}return h},[s,a]);return e.jsxs("div",{className:"basket-btn-wrap",ref:p,children:[e.jsxs("button",{className:"basket-btn",title:"Basket",onClick:()=>c(h=>!h),children:[e.jsx(_r,{size:15,strokeWidth:1.8}),d>0&&e.jsx("span",{className:"basket-badge",children:d>99?"99+":d})]}),i&&e.jsxs("div",{className:"basket-dropdown",children:[e.jsxs("div",{className:"basket-dropdown-header",children:[e.jsx("span",{className:"basket-dropdown-title",children:"Basket"}),e.jsxs("span",{className:"basket-dropdown-count",children:[d," item",d!==1?"s":""]})]}),e.jsx("div",{className:"basket-dropdown-divider"}),d===0?e.jsx("div",{className:"basket-dropdown-empty",children:"No items pinned"}):e.jsx("div",{className:"basket-dropdown-list",children:b.map(({descriptor:h,itemRef:N})=>e.jsx(Dn,{descriptor:h,itemRef:N,ctx:u,isOpen:!1,isPinned:!0},`${N.source}:${N.type}:${N.key}`))}),e.jsx("div",{className:"basket-dropdown-divider"}),e.jsx("button",{className:"basket-dropdown-action",disabled:d===0,onClick:()=>{r&&n(r),c(!1)},children:"Empty basket"})]})]})}function Oa({userId:t,onUserChange:s,users:n,nodeTypes:r,stateColorMap:a,nodes:o,searchQuery:i,searchType:c,onSearchChange:p,onSearchTypeChange:d,onSearchSubmit:u,projectSpaces:b,projectSpaceId:h,onProjectSpaceChange:N,onNavigate:R}){const A=l.useMemo(()=>(n||[]).find(z=>z.id===t),[n,t]),f=ae(z=>z.items),[x,m]=l.useState([]),[y,g]=l.useState(!1),[j,D]=l.useState(-1),[G,H]=l.useState(!1),[B,L]=l.useState(!1),w=l.useRef(null),k=l.useRef(null),q=l.useRef(0);l.useEffect(()=>{const z=(i||"").trim();if(z.length<2){m([]),g(!1);return}const v=++q.current,P=setTimeout(async()=>{try{const J=await ee.searchNodes(z,{},[],6);if(q.current!==v)return;const $=J.hits||[];m($),g($.length>0),D(-1)}catch{q.current===v&&(m([]),g(!1))}},200);return()=>clearTimeout(P)},[i]);const Q=l.useCallback(z=>{if(clearTimeout(w.current),p(""),g(!1),m([]),R){const v=z.serviceCode||"psm",P=z.itemCode||z.type||"",J=f.find($=>$.serviceCode===v&&$.itemCode===P)||(v==="psm"?Dt:{serviceCode:v,itemCode:P});R(z.id,void 0,J)}},[p,R,f]),T=l.useCallback(z=>{if(z.key==="Enter"){j>=0&&x.length>0?(z.preventDefault(),Q(x[j])):i&&i.trim()&&(z.preventDefault(),g(!1),u&&u(i.trim()));return}!y||x.length===0||(z.key==="ArrowDown"?(z.preventDefault(),D(v=>Math.min(v+1,x.length-1))):z.key==="ArrowUp"?(z.preventDefault(),D(v=>Math.max(v-1,0))):z.key==="Escape"&&g(!1))},[y,x,j,Q,i,u]),F=l.useCallback(()=>{w.current=setTimeout(()=>g(!1),150)},[]),I=l.useCallback(()=>{clearTimeout(w.current),x.length>0&&g(!0)},[x.length]);return e.jsxs("header",{className:"header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"brand",children:[e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{flexShrink:0},children:[e.jsx("rect",{width:"24",height:"24",rx:"5",fill:"url(#psm-grad)"}),e.jsx("circle",{cx:"12",cy:"6",r:"2.2",fill:"white",fillOpacity:"0.95"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"6.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"17.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"12",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("circle",{cx:"6.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"12",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"17.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"psm-grad",x1:"0",y1:"0",x2:"24",y2:"24",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"var(--accent)"}),e.jsx("stop",{offset:"100%",stopColor:"#7c3aed"})]})})]}),e.jsx("span",{children:"PSM"})]}),e.jsx("div",{className:"brand-sep"})]}),e.jsx("div",{className:"header-center",children:e.jsxs("div",{className:"search-wrap",children:[e.jsxs("div",{className:"search-group",children:[e.jsx("span",{className:"search-icon",children:"⌕"}),e.jsx("input",{className:"search-input",placeholder:"Search by logical ID…",value:i,onChange:z=>p(z.target.value),onKeyDown:T,onFocus:I,onBlur:F,autoComplete:"off"}),e.jsx("div",{className:"search-divider"}),e.jsxs("select",{className:"search-type",value:c,onChange:z=>d(z.target.value),title:"Filter by type",children:[e.jsx("option",{value:"",children:"All types"}),(r||[]).map(z=>e.jsx("option",{value:z.id||z.ID,children:z.name||z.NAME},z.id||z.ID))]})]}),y&&x.length>0&&e.jsx("div",{className:"search-suggestions",children:x.map((z,v)=>{const P=(()=>{try{return JSON.parse(z.sourceJson||"{}")}catch{return{}}})(),J=z.serviceCode||"psm",$=z.itemCode||z.type||"",U=f.find(S=>S.serviceCode===J&&S.itemCode===$),K=(U==null?void 0:U.color)||null,C=(U==null?void 0:U.icon)||null,M=C?Je[C]:null,V=P.logicalId||P.logical_id||P.originalName||z.id,W=P.name||P.displayName||"",Y=P.revision||"",oe=P.iteration;return e.jsxs("div",{className:`search-sug-item${v===j?" hi":""}`,onMouseDown:()=>Q(z),onMouseEnter:()=>D(v),children:[e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:M?e.jsx(M,{size:11,color:K||"var(--muted)",strokeWidth:2}):K?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:K,display:"inline-block"}}):null}),e.jsx("span",{className:"sug-lid",children:V}),W&&e.jsx("span",{className:"sug-dname",children:W}),Y&&e.jsxs("span",{className:"sug-meta",children:[$,oe!=null?` · ${Y}.${oe}`:` · ${Y}`]})]},z.id)})})]})}),e.jsxs("div",{className:"header-right",children:[e.jsx(Ma,{onNavigate:R}),(b||[]).length>0&&e.jsxs("div",{className:"ps-select-wrap",title:"Active project space",children:[e.jsx(Mt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"ps-select",value:h,onChange:z=>N(z.target.value),children:b.map(z=>e.jsx("option",{value:z.id||z.ID,children:z.name||z.NAME},z.id||z.ID))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})]}),e.jsxs("div",{className:"profile-menu-wrap",ref:k,children:[e.jsx("button",{className:"profile-avatar-btn",onClick:()=>H(z=>!z),title:"Profile & settings",children:e.jsx(Pa,{user:A,userId:t})}),G&&e.jsx(Ba,{currentUser:A,userId:t,users:n,onUserChange:s,onOpenProfile:()=>L(!0),onClose:()=>H(!1)})]})]}),B&&e.jsx(La,{userId:t,onClose:()=>L(!1)})]})}const Da=We.memo(Oa);function _a(t){const s=l.useRef(t);s.current=t,l.useEffect(()=>be.getState().subscribeWsEvent(n=>s.current(n)),[])}function bs(){const t=ft();return t?{Authorization:`Bearer ${t}`}:{}}const Ks={get:{bg:"rgba(56,189,248,.13)",text:"#38bdf8",border:"rgba(56,189,248,.28)"},post:{bg:"rgba(74,222,128,.13)",text:"#4ade80",border:"rgba(74,222,128,.28)"},put:{bg:"rgba(251,191,36,.13)",text:"#fbbf24",border:"rgba(251,191,36,.28)"},delete:{bg:"rgba(var(--danger-rgb),.13)",text:"var(--danger)",border:"rgba(var(--danger-rgb),.28)"},patch:{bg:"rgba(167,139,250,.13)",text:"#a78bfa",border:"rgba(167,139,250,.28)"}};function Wa({method:t}){const s=Ks[t]||Ks.get;return e.jsx("span",{style:{background:s.bg,color:s.text,border:`1px solid ${s.border}`,borderRadius:3,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"var(--sans)",letterSpacing:".07em",textTransform:"uppercase",flexShrink:0,width:58,textAlign:"center",display:"inline-block"},children:t})}function vs(t,s=0){var n;if(!t||s>4)return null;if(t.example!==void 0)return t.example;if(t.type==="object"||t.properties){const r={};return Object.entries(t.properties||{}).forEach(([a,o])=>{r[a]=vs(o,s+1)}),r}return t.type==="array"?[vs(t.items,s+1)]:t.type==="string"?((n=t.enum)==null?void 0:n[0])??"":t.type==="boolean"?!1:t.type==="integer"||t.type==="number"?0:null}function Fa({method:t,path:s,operation:n,userId:r,projectSpaceId:a,basePath:o}){const[i,c]=l.useState(!1),[p,d]=l.useState({}),[u,b]=l.useState(""),[h,N]=l.useState(null),[R,A]=l.useState(!1),[f,x]=l.useState(r),[m,y]=l.useState(a||"");l.useEffect(()=>{x(r)},[r]),l.useEffect(()=>{y(a||"")},[a]);const g=n.parameters||[],j=["post","put","patch"].includes(t);l.useEffect(()=>{var B,L,w;if(!i||!j||u)return;const G=(L=(B=n.requestBody)==null?void 0:B.content)==null?void 0:L["application/json"];if(!G)return;let H=G.example??((w=G.schema)==null?void 0:w.example);H===void 0&&G.schema&&(H=vs(G.schema)),H!=null&&b(JSON.stringify(H,null,2))},[i,j,n,u]);async function D(){A(!0),N(null);let G=(o||"")+s;g.filter(w=>w.in==="path").forEach(w=>{G=G.replace(`{${w.name}}`,encodeURIComponent(p[w.name]??""))});const H=new URLSearchParams;g.filter(w=>w.in==="query").forEach(w=>{p[w.name]&&H.append(w.name,p[w.name])});const B=H.toString();B&&(G+="?"+B);const L={"Content-Type":"application/json",...bs()};m&&(L["X-PLM-ProjectSpace"]=m),g.filter(w=>w.in==="header").forEach(w=>{p[w.name]&&(L[w.name]=p[w.name])});try{const w=await fetch(G,{method:t.toUpperCase(),headers:L,body:j&&u.trim()?u:void 0}),k=await w.text();let q=k;try{q=JSON.stringify(JSON.parse(k),null,2)}catch{}N({status:w.status,ok:w.ok,body:q||"(empty)"})}catch(w){N({status:0,ok:!1,body:`Network error: ${w.message}`})}finally{A(!1)}}return e.jsxs("div",{className:`pg-row${i?" pg-row--open":""}`,children:[e.jsxs("div",{className:"pg-row-hd",onClick:()=>c(G=>!G),children:[e.jsx("span",{className:"pg-chevron",children:i?e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(He,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx(Wa,{method:t}),e.jsx("code",{className:"pg-path",children:s}),n.summary&&e.jsx("span",{className:"pg-summary",children:n.summary})]}),i&&e.jsxs("div",{className:"pg-row-body",children:[e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Headers"}),e.jsxs("div",{className:"pg-header-grid",children:[e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-User"}),e.jsx("input",{className:"pg-input pg-header-input",value:f,onChange:G=>x(G.target.value),placeholder:"user-alice"})]}),e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-ProjectSpace"}),e.jsx("input",{className:"pg-input pg-header-input",value:m,onChange:G=>y(G.target.value),placeholder:"ps-default"})]})]})]}),g.length>0&&e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Parameters"}),e.jsx("div",{className:"pg-params-grid",children:g.map(G=>{var H,B;return e.jsxs("div",{className:"pg-param",children:[e.jsxs("div",{className:"pg-param-hd",children:[e.jsx("code",{className:"pg-param-name",children:G.name}),e.jsx("span",{className:"pg-param-in",children:G.in}),G.required&&e.jsx("span",{className:"pg-param-req",children:"req"}),G.description&&e.jsx("span",{className:"pg-param-desc",children:G.description})]}),e.jsx("input",{className:"pg-input",placeholder:String(((H=G.schema)==null?void 0:H.example)??((B=G.schema)==null?void 0:B.type)??""),value:p[G.name]??"",onChange:L=>d(w=>({...w,[G.name]:L.target.value}))})]},G.name)})})]}),j&&e.jsxs("div",{className:"pg-section",children:[e.jsxs("div",{className:"pg-section-label",children:["Body",e.jsx("span",{className:"pg-section-sub",children:"application/json"})]}),e.jsx("textarea",{className:"pg-body-editor",value:u,onChange:G=>b(G.target.value),rows:5,spellCheck:!1,placeholder:"{}"})]}),e.jsxs("div",{className:"pg-exec-bar",children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:D,disabled:R,style:{minWidth:90},children:R?"Sending…":"▶ Execute"}),e.jsxs("span",{className:"pg-exec-meta",children:["as ",e.jsx("strong",{children:r})]}),h&&e.jsx("button",{className:"btn btn-xs",style:{marginLeft:"auto"},onClick:()=>N(null),children:"Clear"})]}),h&&e.jsxs("div",{className:"pg-response",children:[e.jsxs("div",{className:"pg-response-hd",children:[e.jsx("span",{className:"pg-status",style:{background:h.ok?"rgba(77,212,160,.15)":"rgba(var(--danger-rgb),.15)",color:h.ok?"var(--success)":"var(--danger)",border:`1px solid ${h.ok?"rgba(77,212,160,.3)":"rgba(var(--danger-rgb),.3)"}`},children:h.status||"ERR"}),e.jsx("span",{className:"pg-response-label",children:h.ok?"OK":"Error"})]}),e.jsx("pre",{className:"pg-response-body",children:h.body})]})]})]})}function Ua(t){return t?t.endsWith("/")?t.slice(0,-1):t:""}function Ga({userId:t,projectSpaceId:s}){var B,L;const[n,r]=l.useState([]),[a,o]=l.useState(null),[i,c]=l.useState(null),[p,d]=l.useState(!0),[u,b]=l.useState(null),[h,N]=l.useState(""),[R,A]=l.useState({}),f=l.useMemo(()=>n.find(w=>w.serviceCode===a)||null,[n,a]),x=Ua(f==null?void 0:f.path),m=l.useCallback(()=>{d(!0),b(null),fetch("/api/platform/status",{headers:bs(),cache:"no-store"}).then(w=>{if(!w.ok)throw new Error(`HTTP ${w.status} on /api/platform/status`);return w.json()}).then(w=>{const k=(w.services||[]).filter(q=>q.registered&&q.path&&q.serviceCode!=="spe"&&q.serviceCode!=="ws").sort((q,Q)=>q.serviceCode.localeCompare(Q.serviceCode));r(k),k.length===0?(o(null),d(!1),b("No services registered — start backend services first.")):o(q=>k.some(Q=>Q.serviceCode===q)?q:k[0].serviceCode)}).catch(w=>{b(w.message),d(!1)})},[]),y=l.useCallback(()=>{x&&(d(!0),b(null),c(null),fetch(`${x}/v3/api-docs`,{headers:bs(),cache:"no-store"}).then(async w=>{if(!w.ok){const q=await w.text().catch(()=>"");throw new Error(`HTTP ${w.status}${q?" — "+q.slice(0,200):""}`)}const k=w.headers.get("content-type")||"";if(!k.includes("json"))throw new Error(`Expected JSON spec, got ${k||"unknown"}.`);return w.json()}).then(w=>{c(w),d(!1)}).catch(w=>{b(w.message),d(!1)}))},[x]);l.useEffect(()=>{m()},[m]),l.useEffect(()=>{y()},[y]),l.useEffect(()=>{N(""),A({})},[a]);const g=l.useMemo(()=>{if(!(i!=null&&i.paths))return[];const w={};Object.entries(i.paths).forEach(([q,Q])=>{Object.entries(Q).forEach(([T,F])=>{var z;if(!["get","post","put","delete","patch"].includes(T))return;const I=((z=F.tags)==null?void 0:z[0])??"default";w[I]||(w[I]=[]),w[I].push({method:T,path:q,operation:F})})});const k=["get","post","put","patch","delete"];return Object.entries(w).sort(([q],[Q])=>q.localeCompare(Q)).map(([q,Q])=>[q,[...Q].sort((T,F)=>k.indexOf(T.method)-k.indexOf(F.method))])},[i]),j=l.useMemo(()=>{const w=h.trim().toLowerCase();return w?g.map(([k,q])=>[k,q.filter(({method:Q,path:T,operation:F})=>Q.includes(w)||T.toLowerCase().includes(w)||(F.summary||"").toLowerCase().includes(w)||k.toLowerCase().includes(w))]).filter(([,k])=>k.length>0):g},[g,h]);function D(w){A(k=>({...k,[w]:!k[w]}))}const G=i?Object.keys(i.paths||{}).length:0,H=e.jsx("select",{className:"pg-service-select",value:a||"",onChange:w=>o(w.target.value),disabled:n.length===0,style:{background:"var(--bg-elev-1)",color:"var(--fg)",border:"1px solid var(--border)",borderRadius:4,padding:"4px 8px",fontSize:12,fontFamily:"var(--mono)",minWidth:160},children:n.map(w=>e.jsxs("option",{value:w.serviceCode,children:[w.serviceCode,"  (",w.path,")"]},w.serviceCode))});return p&&!i?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[H,e.jsx("span",{className:"pg-topbar-meta",children:"loading…"}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:m,title:"Reload services",children:"⟳"})]}),e.jsx("div",{className:"settings-loading",children:"Fetching OpenAPI spec…"})]}):u?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[H,e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:m,title:"Reload services",children:"⟳"})]}),e.jsxs("div",{style:{padding:24,display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("span",{style:{fontSize:12,color:"var(--danger)"},children:["✗ ",u]}),e.jsx("button",{className:"btn btn-sm",style:{alignSelf:"flex-start"},onClick:y,children:"Retry"})]})]}):e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[H,e.jsx("span",{className:"pg-topbar-title",children:(B=i==null?void 0:i.info)==null?void 0:B.title}),e.jsxs("span",{className:"pg-topbar-ver",children:["v",(L=i==null?void 0:i.info)==null?void 0:L.version]}),e.jsxs("span",{className:"pg-topbar-meta",children:[G," paths"]}),e.jsxs("span",{className:"pg-topbar-user",children:["as ",e.jsx("strong",{children:t}),s&&e.jsxs("span",{style:{marginLeft:8,color:"var(--accent)",opacity:.75},children:["· ",s]})]}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:y,title:"Reload spec",children:"⟳ Reload"})]}),e.jsxs("div",{className:"pg-filter",children:[e.jsx("input",{className:"pg-filter-input",placeholder:"Filter endpoints…",value:h,onChange:w=>N(w.target.value)}),h&&e.jsx("button",{className:"btn btn-xs",onClick:()=>N(""),children:"Clear"})]}),e.jsxs("div",{className:"pg-list",children:[j.length===0&&e.jsxs("div",{style:{padding:"32px 20px",fontSize:12,color:"var(--muted2)",fontStyle:"italic"},children:["No endpoints match “",h,"”"]}),j.map(([w,k])=>{const q=!!R[w];return e.jsxs("div",{className:"pg-group",children:[e.jsxs("div",{className:"pg-group-hd",onClick:()=>D(w),children:[e.jsx("span",{className:"pg-chevron",children:q?e.jsx(He,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx("span",{className:"pg-group-name",children:w}),e.jsx("span",{className:"pg-group-count",children:k.length})]}),!q&&k.map(({method:Q,path:T,operation:F})=>e.jsx(Fa,{method:Q,path:T,operation:F,userId:t,projectSpaceId:s,basePath:x},`${Q}:${T}`))]},w)})]})]})}function zt({id:t,children:s}){return e.jsx("h2",{id:t,style:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 10px",paddingTop:4,borderBottom:"1px solid var(--border)",paddingBottom:8},children:s})}function Oe({children:t}){return e.jsx("h3",{style:{fontSize:13,fontWeight:600,color:"var(--accent)",margin:"20px 0 6px",textTransform:"uppercase",letterSpacing:".06em"},children:t})}function Ae({children:t}){return e.jsx("p",{style:{margin:"0 0 10px",fontSize:13,lineHeight:1.65,color:"var(--text)"},children:t})}function Ce({children:t}){return e.jsx("code",{style:{fontFamily:"var(--mono)",fontSize:11,background:"rgba(100,116,139,.15)",border:"1px solid rgba(100,116,139,.2)",borderRadius:3,padding:"1px 5px",color:"var(--accent)"},children:t})}function Ft({children:t}){return e.jsxs("div",{style:{background:"rgba(232,169,71,.08)",border:"1px solid rgba(232,169,71,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"#e8a947"},children:"Note: "}),t]})}function is({children:t}){return e.jsxs("div",{style:{background:"rgba(91,156,246,.08)",border:"1px solid rgba(91,156,246,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"var(--accent)"},children:"Tip: "}),t]})}function xe({name:t,type:s,children:n}){return e.jsxs("div",{style:{marginBottom:10},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:8,marginBottom:3},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13,color:"var(--text)"},children:t}),s&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",textTransform:"uppercase"},children:s})]}),e.jsx("div",{style:{fontSize:12,lineHeight:1.6,color:"var(--muted)",paddingLeft:10,borderLeft:"2px solid var(--border)"},children:n})]})}function tt({rows:t}){return e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:10},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:600,width:"30%"},children:"Value"}),e.jsx("th",{style:{textAlign:"left",padding:"4px 0",color:"var(--muted)",fontWeight:600},children:"Meaning"})]})}),e.jsx("tbody",{children:t.map(([s,n])=>e.jsxs("tr",{style:{borderBottom:"1px solid rgba(100,116,139,.08)"},children:[e.jsx("td",{style:{padding:"5px 8px 5px 0",verticalAlign:"top"},children:e.jsx(Ce,{children:s})}),e.jsx("td",{style:{padding:"5px 0",verticalAlign:"top",color:"var(--text)",lineHeight:1.55},children:n})]},s))})]})}function Ut(){return e.jsx("hr",{style:{border:"none",borderTop:"1px solid var(--border)",margin:"28px 0"}})}const Ha=[{id:"node-types",label:"Node Types"},{id:"lifecycles",label:"Lifecycles"},{id:"proj-spaces",label:"Project Spaces"},{id:"users-roles",label:"Users & Roles"},{id:"access-rights",label:"Access Rights"}];function Va(){const[t,s]=l.useState("node-types"),n=l.useRef(null);function r(a){s(a);const o=document.getElementById("manual-"+a);o&&n.current&&n.current.scrollTo({top:o.offsetTop-16,behavior:"smooth"})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[e.jsxs("div",{style:{width:160,flexShrink:0,borderRight:"1px solid var(--border)",padding:"16px 0",overflowY:"auto"},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",padding:"0 14px 10px"},children:"Contents"}),Ha.map(({id:a,label:o})=>e.jsx("div",{onClick:()=>r(a),style:{padding:"6px 14px",fontSize:12,cursor:"pointer",color:t===a?"var(--accent)":"var(--muted)",background:t===a?"rgba(91,156,246,.08)":"transparent",borderLeft:t===a?"2px solid var(--accent)":"2px solid transparent",transition:"all .15s"},children:o},a))]}),e.jsxs("div",{ref:n,style:{flex:1,overflowY:"auto",padding:"20px 28px 40px"},children:[e.jsxs("div",{id:"manual-node-types",children:[e.jsx(zt,{id:"node-types",children:"Node Types"}),e.jsxs(Ae,{children:["A ",e.jsx("strong",{children:"Node Type"})," is the blueprint for any object you create in the product structure — a component, an assembly, a document, a requirement, etc. Every node belongs to exactly one type and inherits that type's attributes, lifecycle, versioning rules, and link constraints."]}),e.jsx(Oe,{children:"Identity"}),e.jsxs(Ae,{children:["Each node can carry a human-readable ",e.jsx("em",{children:"logical identifier"})," (separate from its internal UUID). The identity settings control how that identifier is displayed and validated."]}),e.jsx(xe,{name:"Label",type:"text",children:'The display label used in the UI for the identifier field (e.g. "Part Number", "Doc ID"). Defaults to "Identifier".'}),e.jsxs(xe,{name:"Validation Pattern",type:"regex",children:["An optional regular expression that the logical ID must match. If blank, any value is accepted. Example: ",e.jsx(Ce,{children:"^[A-Z]{2}-\\d{4}$"})," enforces two uppercase letters, a dash, and four digits."]}),e.jsx(Oe,{children:"Lifecycle"}),e.jsx(Ae,{children:"Assign a lifecycle to the node type to enable state-based workflows (Draft → Review → Frozen → Released). Nodes without a lifecycle remain in their initial state and cannot be transitioned."}),e.jsx(xe,{name:"Lifecycle",type:"select",children:'The lifecycle that governs nodes of this type. Setting it to "None" disables lifecycle management for this node type.'}),e.jsx(Oe,{children:"Versioning"}),e.jsxs(Ae,{children:["Versioning settings control how the visible version identifier (",e.jsx(Ce,{children:"revision.iteration"}),", e.g. ",e.jsx(Ce,{children:"A.3"}),") advances when a node is checked out or released."]}),e.jsxs(xe,{name:"Numbering Scheme",type:"select",children:["Determines the alphabet used for revision letters.",e.jsx(tt,{rows:[["ALPHA_NUMERIC","Revisions advance A → B → … → Z → AA → AB … Standard PLM convention."]]})]}),e.jsxs(xe,{name:"Version Policy",type:"select",children:["Controls what happens to the version number when a user checks out a node.",e.jsx(tt,{rows:[["NONE","Checkout creates a new technical version for traceability but does not advance the visible revision.iteration. Use for types where every save is tracked internally but the displayed identifier must stay stable."],["ITERATE","Checkout increments the iteration: A.1 → A.2. Use for normal work-in-progress types where each save is a new draft of the same revision."],["RELEASE","Checkout starts a new revision and resets iteration to 1: A.3 → B.1. Use for types that follow a formal release cycle where a new revision means a significant change."]]})]}),e.jsxs(xe,{name:"Collapse history on release",type:"checkbox",children:["When enabled, the intermediate working iterations are purged from history each time a node enters a ",e.jsx("strong",{children:"Released"})," state.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"What happens:"}),e.jsxs("ul",{style:{margin:"6px 0 0 16px",paddingLeft:0,listStyleType:"disc",fontSize:12,lineHeight:1.7},children:[e.jsxs("li",{children:["All working iterations of the previous revision are deleted (",e.jsx(Ce,{children:"A.1"}),", ",e.jsx(Ce,{children:"A.2"}),", ",e.jsx(Ce,{children:"A.3"})," — all gone)."]}),e.jsxs("li",{children:["The new Released version has its iteration stripped and displays as the bare revision letter (e.g. ",e.jsx(Ce,{children:"B.1"})," → ",e.jsx(Ce,{children:"B"}),")."]}),e.jsx("li",{children:"Versions that are pinned in a baseline or referenced by a VERSION_TO_VERSION link are never deleted."})]}),e.jsx("br",{}),e.jsx("strong",{children:"Result:"})," version history reads ",e.jsx(Ce,{children:"B"}),", ",e.jsx(Ce,{children:"C"}),", ",e.jsx(Ce,{children:"D"})," (one entry per release) instead of ",e.jsx(Ce,{children:"A.1"}),", ",e.jsx(Ce,{children:"A.2"}),", ",e.jsx(Ce,{children:"A.3"}),", ",e.jsx(Ce,{children:"B.1"}),", …",e.jsxs(Ft,{children:["Only applies to node types whose lifecycle has a Released state (",e.jsx(Ce,{children:"isReleased = true"}),")."]})]}),e.jsx(Oe,{children:"Attributes"}),e.jsx(Ae,{children:"Attributes are the structured data fields attached to every version of a node of this type (title, description, material, weight, etc.). Each attribute is independently configurable."}),e.jsxs(xe,{name:"Name (internal key)",type:"text",children:["The machine-readable key stored in the database. Must be unique within the node type. Cannot be changed after creation. Use camelCase or snake_case (e.g. ",e.jsx(Ce,{children:"reviewNote"}),", ",e.jsx(Ce,{children:"material_grade"}),")."]}),e.jsx(xe,{name:"Label (display)",type:"text",children:'The human-readable label shown in forms and tables (e.g. "Review Note", "Material Grade").'}),e.jsxs(xe,{name:"Data Type",type:"select",children:["The underlying data type for validation and storage.",e.jsx(tt,{rows:[["STRING","Free text."],["NUMBER","Numeric value (integer or decimal)."],["DATE","ISO date value."],["BOOLEAN","True / False toggle."],["ENUM","One value from a predefined list (configure the list separately)."]]})]}),e.jsxs(xe,{name:"Widget",type:"select",children:["The UI control rendered in the editor for this attribute.",e.jsx(tt,{rows:[["TEXT","Single-line text input."],["TEXTAREA","Multi-line text area."],["DROPDOWN","Dropdown selector (required for ENUM type)."],["DATE_PICKER","Calendar date picker (recommended for DATE type)."],["CHECKBOX","Toggle checkbox (recommended for BOOLEAN type)."]]})]}),e.jsx(xe,{name:"Section",type:"text",children:'Groups this attribute under a named panel in the editor (e.g. "Mechanical", "Review"). Attributes with no section appear in the default group.'}),e.jsx(xe,{name:"Order",type:"number",children:"Display order within the section. Lower numbers appear first."}),e.jsx(xe,{name:"Required field",type:"checkbox",children:"When checked, this attribute must be filled before a node can advance past states configured as requiring it (via Attribute State Rules). Does not block saving; only blocks lifecycle transitions where the rule is active."}),e.jsx(xe,{name:"Use as display name ★",type:"checkbox",children:"Marks this attribute as the human-readable title of the node. Its value appears in node lists, search results, and link pickers. Only one attribute per node type can be the display name."}),e.jsx(Oe,{children:"Link Types (Outgoing)"}),e.jsx(Ae,{children:"A link type defines an allowed relationship from this node type to another. Links are version-aware and carry a versioning policy."}),e.jsxs(xe,{name:"Link Name",type:"text",children:["Internal name for the relationship (e.g. ",e.jsx(Ce,{children:"composed_of"}),", ",e.jsx(Ce,{children:"references"}),")."]}),e.jsx(xe,{name:"Target Node Type",type:"select",children:"The node type that can appear on the other end of this link."}),e.jsxs(xe,{name:"Link Policy",type:"select",children:["Controls how the link resolves over time.",e.jsx(tt,{rows:[["VERSION_TO_MASTER","The link always points to the latest committed version of the target. When the target is updated and committed, all parents automatically see the new version. Use for live BOM structures. Requires the parent to be locked (checked out) when the target is modified."],["VERSION_TO_VERSION","The link is frozen to the exact target version at the time the link was created. The parent always sees the same snapshot of the child regardless of future changes. Use for reference documentation or frozen configurations."]]})]}),e.jsxs(xe,{name:"Min Cardinality",type:"number",children:["Minimum number of links of this type required per node version. ",e.jsx(Ce,{children:"0"})," means the link is optional."]}),e.jsx(xe,{name:"Max (blank = unlimited)",type:"number",children:"Maximum number of links allowed. Leave blank for no upper limit."}),e.jsx(xe,{name:"Color",type:"color",children:"Visual color used to draw this link in the graph view."}),e.jsx(is,{children:'After creating a link type you can add attributes to it (e.g. "quantity", "reference designator") via the Edit link type panel. You can also define cascade rules that automatically propagate lifecycle transitions through the link.'})]}),e.jsx(Ut,{}),e.jsxs("div",{id:"manual-lifecycles",children:[e.jsx(zt,{id:"lifecycles",children:"Lifecycles"}),e.jsxs(Ae,{children:["A ",e.jsx("strong",{children:"Lifecycle"})," defines the states an object can be in and the valid transitions between them. It encodes the approval and release workflow for a node type."]}),e.jsx(Oe,{children:"Lifecycle Properties"}),e.jsx(xe,{name:"Name",type:"text",children:"Name displayed in the UI and referenced by node types."}),e.jsx(xe,{name:"Description",type:"text",children:"Optional free-text explanation of the lifecycle's purpose."}),e.jsx(Oe,{children:"States"}),e.jsx(Ae,{children:"States represent stages in the lifecycle (e.g. Draft, In Review, Frozen, Released). Every node version has exactly one current state."}),e.jsx(xe,{name:"State Name",type:"text",children:'Display label for the state. Short, descriptive names work best (e.g. "Draft", "Frozen").'}),e.jsx(xe,{name:"Display Order",type:"number",children:"Order in which states appear in dropdowns and diagrams. Lower = earlier in the flow."}),e.jsx(xe,{name:"Color",type:"color",children:"Color used to represent this state in the UI (state pills, timeline dots). Pick a color that intuitively maps to the state's meaning — green for released, yellow for in-review, grey for draft."}),e.jsx(xe,{name:"isInitial",type:"tag",children:"Marks this as the entry state. Every newly created node starts here. Only one state per lifecycle can be initial."}),e.jsx(xe,{name:"isFrozen",type:"tag",children:"A frozen state locks the node's content. When a node enters a frozen state, the lock cascades to all children connected via VERSION_TO_MASTER links — they cannot be independently modified until the parent is unfrozen. Required before a baseline can be taken."}),e.jsxs(xe,{name:"isReleased",type:"tag",children:["Marks the state as a release milestone. Reaching this state is what triggers the ",e.jsx("em",{children:"Collapse history"})," feature (if enabled on the node type). Typically only one state per lifecycle is released."]}),e.jsx(Oe,{children:"Transitions"}),e.jsx(Ae,{children:"Transitions define which state changes are allowed and under what conditions. A transition always goes from one specific state to another."}),e.jsx(xe,{name:"Transition Name",type:"text",children:'Label shown on the action button that triggers this transition (e.g. "Freeze", "Release", "Reject"). Keep it short and verb-form.'}),e.jsx(xe,{name:"From State / To State",type:"select",children:"The source and target states for this transition. A node must be in the From State for the transition to appear."}),e.jsxs(xe,{name:"Guard Expression",type:"text",children:["An optional server-side condition that must be satisfied before the transition is allowed. If the guard fails, the transition button is blocked and an error is shown.",e.jsx(tt,{rows:[["all_required_filled","All attributes marked Required must have a non-empty value in the current version."],["all_signatures_done","All signature requirements for this transition must have been fulfilled."],["(blank)","No guard — the transition is always allowed when the node is in the From State."]]})]}),e.jsxs(xe,{name:"Action Type",type:"select",children:["A server-side action executed as part of this transition.",e.jsx(tt,{rows:[["NONE","No action — the transition simply changes the state."],["REQUIRE_SIGNATURE","Collects an electronic signature from the current user as part of the transition. The signature is stored permanently against the version."]]})]}),e.jsxs(xe,{name:"Version Strategy",type:"select",children:["Controls how the version number changes when this transition is triggered.",e.jsx(tt,{rows:[["NONE","Creates a new technical version (for audit trail) but keeps the same revision.iteration visible to users. Used for state changes that are purely administrative."],["ITERATE","Increments the iteration (A.2 → A.3). Unusual for a lifecycle transition; more common for checkouts."],["REVISE","Starts a new revision and resets iteration to 1 (A.3 → B.1). Typically used on the Release transition to mark a new formal revision of the product."]]})]}),e.jsx(Oe,{children:"Cascade Rules"}),e.jsx(Ae,{children:"Cascade rules automate lifecycle propagation through links. When a parent node undergoes a transition, eligible child nodes are automatically transitioned as well — without manual action."}),e.jsx(Ae,{children:"Rules are configured inside the link type: you specify which parent transition triggers which child transition, and from which child state. Children not in the expected state are silently skipped (they are already beyond or not yet at that stage)."}),e.jsx(Ft,{children:"Cascade is only applied through VERSION_TO_MASTER links. VERSION_TO_VERSION links point to frozen snapshots and are never cascaded."})]}),e.jsx(Ut,{}),e.jsxs("div",{id:"manual-proj-spaces",children:[e.jsx(zt,{id:"proj-spaces",children:"Project Spaces"}),e.jsxs(Ae,{children:["A ",e.jsx("strong",{children:"Project Space"})," is an organisational container that groups nodes and controls access. Every node creation request must specify a project space. Access rights (which roles can do what) are configured per project space."]}),e.jsx(Ae,{children:'Think of a project space as a "workspace" or "programme" — you might have one per product line, customer project, or development phase.'}),e.jsx(xe,{name:"Name",type:"text",children:'Short, unique name for the space (e.g. "Prototype-2026", "Certification-A320"). Shown in the project space selector at the top of the application.'}),e.jsx(xe,{name:"Description",type:"text",children:"Optional free-text explaining the purpose or scope of this project space."}),e.jsx(Ft,{children:"Deleting a project space does not delete the nodes inside it — it removes only the space record. Nodes retain their project_space_id as a plain reference."})]}),e.jsx(Ut,{}),e.jsxs("div",{id:"manual-users-roles",children:[e.jsx(zt,{id:"users-roles",children:"Users & Roles"}),e.jsx(Oe,{children:"Roles"}),e.jsxs(Ae,{children:["A ",e.jsx("strong",{children:"Role"})," is a named group of permissions (e.g. DESIGNER, REVIEWER, READER). Users are assigned roles within a project space. The role determines what actions the user can perform on which node types."]}),e.jsxs(xe,{name:"Name",type:"text",children:["Internal name for the role. By convention use UPPER_CASE (e.g. ",e.jsx(Ce,{children:"DESIGNER"}),"). This name is referenced in permission rules and signature requirements."]}),e.jsx(xe,{name:"Description",type:"textarea",children:'Human-readable explanation of who should hold this role (e.g. "Engineers who create and modify parts").'}),e.jsx(is,{children:"Create roles that map to real job functions, not individual people. A user can hold multiple roles — combine them to grant additive permissions."}),e.jsx(Oe,{children:"Users"}),e.jsxs(Ae,{children:["Users are the people who log in to the system. Each user is identified by a username (sent in the ",e.jsx(Ce,{children:"X-PLM-User"})," HTTP header). Users are created here and then assigned roles in specific project spaces."]}),e.jsxs(xe,{name:"Username",type:"text",children:["Unique login identifier (e.g. ",e.jsx(Ce,{children:"john.doe"}),"). This is the value placed in the ",e.jsx(Ce,{children:"X-PLM-User"})," header. Cannot be changed after creation."]}),e.jsx(xe,{name:"Display Name",type:"text",children:'Full human-readable name shown in the UI (e.g. "John Doe").'}),e.jsx(xe,{name:"Email",type:"email",children:"Contact email address. Stored for reference; not used for authentication in the current setup."}),e.jsx(xe,{name:"Admin status",type:"select",children:e.jsx(tt,{rows:[["User","Standard user — access governed entirely by role assignments."],["Admin","System administrator — bypasses all permission checks and can perform any action in any project space. Use sparingly."]]})}),e.jsx(Oe,{children:"Role Assignments"}),e.jsxs(Ae,{children:["A role assignment connects a ",e.jsx("strong",{children:"user"}),", a ",e.jsx("strong",{children:"role"}),", and a ",e.jsx("strong",{children:"project space"}),". The user gains all permissions granted to that role within that specific project space."]}),e.jsx(Ae,{children:"A user can hold multiple role assignments — for example, DESIGNER in Project-A and READER in Project-B, or DESIGNER + REVIEWER in the same project space (permissions are additive)."})]}),e.jsx(Ut,{}),e.jsxs("div",{id:"manual-access-rights",children:[e.jsx(zt,{id:"access-rights",children:"Access Rights"}),e.jsxs(Ae,{children:["Access Rights define what each role is allowed to do. The system uses two levels of permissions: ",e.jsx("strong",{children:"global actions"})," and ",e.jsx("strong",{children:"node-type/project-space actions"}),"."]}),e.jsx(Oe,{children:"Global Permissions"}),e.jsx(Ae,{children:"Global permissions control system-wide administrative capabilities, independent of any project space or node type."}),e.jsx(Ft,{children:'"Zero grants = action open to all roles." — If no role has been granted a global permission, the action is unrestricted. As soon as any role is granted a permission, only that role (and admins) can perform it.'}),e.jsx(tt,{rows:[["MANAGE_METAMODEL","Create and edit node types, lifecycles, attributes, link types, and cascade rules."],["MANAGE_ROLES","Create and edit roles, users, project spaces, and role assignments."],["CREATE_NODE","Create new nodes (top-level action, independently of node type)."]]}),e.jsx(Oe,{children:"Node Type × Project Space Permission Matrix"}),e.jsx(Ae,{children:"The matrix table shows all combinations of node types (rows) and actions (columns) for a given project space. Toggle the circle icon in any cell to grant or revoke that permission for the current role."}),e.jsx(Ae,{children:e.jsx("strong",{children:"Action column types:"})}),e.jsx(xe,{name:"NODE scope actions",type:"column",children:"Standard CRUD and workflow actions that apply to nodes of that type (e.g. checkout, checkin, create link, delete)."}),e.jsxs(xe,{name:"LIFECYCLE scope actions",type:"column",children:['Columns labelled "',e.jsx("em",{children:"From State → Transition Name"}),'" represent individual lifecycle transitions. Granting this permission allows the role to fire that specific transition on nodes of that type within this project space.']}),e.jsx(Oe,{children:"How Permissions Stack"}),e.jsx(Ae,{children:"Permissions are evaluated in this order. Each layer can only restrict, never expand, what the higher layer allowed:"}),e.jsxs("ol",{style:{margin:"0 0 12px 18px",paddingLeft:0,fontSize:13,lineHeight:2,color:"var(--text)"},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute State Rules"})," — declares which attributes are editable, visible, or required based on the lifecycle state."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute Views"})," — can further restrict (never widen) attribute visibility/editability for a specific role × state combination."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Node Type Permission ",e.jsx(Ce,{children:"can_write"})]})," — if false for the role, the entire node type becomes read-only regardless of other rules."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Transition Permission"})," — filters the list of lifecycle transitions available to the role."]})]}),e.jsx(is,{children:"Start with broad node-type permissions and use attribute views to fine-tune field-level access by role. Only add transition restrictions when you need formal approval gates."})]})]})]})}const qa="#5b9cf6";function Js(t){return(t==null?void 0:t.color)||(t==null?void 0:t.COLOR)||qa}const yt=110,jt=36,ls=72,Gt=28,cs=46,ds=32,lt=10,It=16,Xs=8,Ht=4;function Ka({lifecycleId:t,currentStateId:s,userId:n,onTransition:r,availableTransitionNames:a,transitionGuardViolations:o,previewMode:i}){const[c,p]=l.useState([]),[d,u]=l.useState([]),[b,h]=l.useState(!1),[N,R]=l.useState(null);if(l.useEffect(()=>{!t||!n||(h(!0),Promise.all([ee.getLifecycleStates(n,t).catch(()=>[]),ee.getLifecycleTransitions(n,t).catch(()=>[])]).then(([v,P])=>{p(Array.isArray(v)?v:[]),u(Array.isArray(P)?P:[])}).finally(()=>h(!1)))},[t,n]),b)return e.jsx("div",{className:"lc-empty",children:"Loading diagram…"});if(!t)return e.jsx("div",{className:"lc-empty",children:"No lifecycle associated with this object type."});if(!c.length)return e.jsx("div",{className:"lc-empty",children:"No lifecycle states defined."});const A=[...c].sort((v,P)=>(v.display_order??v.DISPLAY_ORDER??0)-(P.display_order??P.DISPLAY_ORDER??0)),f={};A.forEach((v,P)=>{f[v.id||v.ID]=P});const x={};A.forEach((v,P)=>{x[v.id||v.ID]=Gt+P*(yt+ls)+yt/2});const m=d.map((v,P)=>{const J=v.from_state_id||v.FROM_STATE_ID,$=v.to_state_id||v.TO_STATE_ID,U=f[J]??0,K=f[$]??0,C=K-U;return{...v,fromId:J,toId:$,fromIdx:U,toIdx:K,span:C,i:P}}).filter(v=>x[v.fromId]&&x[v.toId]&&v.span!==0),y=yt*.6,g=new Map,j=(v,P,J,$,U)=>{const K=`${v}::${P}`;g.has(K)||g.set(K,[]),g.get(K).push({tIdx:J,role:$,otherIdx:U})};for(const v of m){const P=v.span>0?"top":"bot";j(v.fromId,P,v.i,"from",v.toIdx),j(v.toId,P,v.i,"to",v.fromIdx)}const D=new Map(m.map(v=>[v.i,{x1:x[v.fromId],x2:x[v.toId]}]));for(const[v,P]of g){if(P.length<=1)continue;const J=v.indexOf("::"),$=v.slice(0,J),U=v.slice(J+2),K=f[$],C=x[$],M=O=>Math.abs(O.otherIdx-K),V=P.filter(O=>O.role==="to"),W=P.filter(O=>O.role==="from");let Y;U==="top"?(V.sort((O,X)=>M(O)-M(X)),W.sort((O,X)=>M(X)-M(O)),Y=[...V,...W]):(W.sort((O,X)=>M(O)-M(X)),V.sort((O,X)=>M(X)-M(O)),Y=[...W,...V]);const oe=Y.length,S=C-y/2,_=y/(oe-1);Y.forEach(({tIdx:O,role:X},se)=>{const Z=S+se*_,re=D.get(O);X==="from"?re.x1=Z:re.x2=Z})}const G=m.filter(v=>v.span>0),H=m.filter(v=>v.span<0),B=G.length?Math.max(...G.map(v=>v.span)):0,L=H.length?Math.max(...H.map(v=>-v.span)):0,w=B>0?cs+(B-1)*ds+It+16:20,k=L>0?cs+(L-1)*ds+It+28:30,q=Gt+w+jt/2,Q=Gt*2+A.length*(yt+ls)-ls,T=q+jt/2+k+Gt,F=q-jt/2,I=q+jt/2,z=v=>{const{fromId:P,span:J,i:$}=v,U=v.name||v.NAME||"",K=J>0,C=Math.abs(J),M=cs+(C-1)*ds,{x1:V,x2:W}=D.get($),Y=K?F:I,oe=K?Y-M:Y+M,S=(V+W)/2,_=!i&&P===s,O=(o==null?void 0:o.get(U))??[],X=O.length>0,se=X||_&&a!=null&&!a.has(U),Z=se?`✕ ${U}`:U,re=Z?Math.max(44,Z.length*6+18)/2:0;let ie,de;K?(ie=[`M ${V},${Y}`,`V ${oe+lt}`,`Q ${V},${oe} ${V+lt},${oe}`,`H ${S-re-Ht}`].join(" "),de=[`M ${S+re+Ht},${oe}`,`H ${W-lt}`,`Q ${W},${oe} ${W},${oe+lt}`,`V ${Y}`].join(" ")):(ie=[`M ${V},${Y}`,`V ${oe-lt}`,`Q ${V},${oe} ${V-lt},${oe}`,`H ${S+re+Ht}`].join(" "),de=[`M ${S-re-Ht},${oe}`,`H ${W+lt}`,`Q ${W},${oe} ${W},${oe-lt}`,`V ${Y}`].join(" "));const ce=_,ue=se,ve=ce&&!ue,Se=ve&&N===$,Re=ve&&!!r&&!i,Ee=i||ce,fe=A.find(rt=>(rt.id||rt.ID)===v.toId),me=ue?"#dc2626":Js(fe)||(K?"#5b9cf6":"#e8a947"),je=me,Ne=Ee?.7:.3,Ie=Ee?1.5:1,Le=re*2,Qe=S-re,vt=oe-It/2;let Ve,et,Ue;return ue?(Ve="var(--danger-bg)",et="var(--danger-border)",Ue="var(--danger)"):ve||i?Se?(Ve=me,et=me,Ue="#ffffff"):(Ve=`${me}18`,et=`${me}70`,Ue=me):(Ve="var(--surface2)",et="var(--border2)",Ue="var(--muted2)"),e.jsxs("g",{children:[e.jsx("path",{d:ie,fill:"none",style:{stroke:Ee?je:"var(--border2)"},strokeWidth:Ie,strokeDasharray:K?"none":"4,3",opacity:Ne}),e.jsx("path",{d:de,fill:"none",style:{stroke:Ee?je:"var(--border2)"},strokeWidth:Ie,strokeDasharray:K?"none":"4,3",opacity:Ne,markerEnd:"url(#arr)"}),Z&&e.jsxs("g",{style:{cursor:Re?"pointer":"default"},onMouseEnter:ve?()=>R($):void 0,onMouseLeave:ve?()=>R(null):void 0,onClick:Re?()=>r(v):void 0,children:[X&&e.jsx("title",{children:`Blocked:
• `+O.map(rt=>typeof rt=="string"?rt:rt.message||rt.guardCode).join(`
• `)}),e.jsx("rect",{x:Qe-4,y:vt-4,width:Le+8,height:It+8,rx:Xs+4,fill:"transparent"}),e.jsx("rect",{x:Qe,y:vt,width:Le,height:It,rx:Xs,style:{fill:Ve,stroke:et},strokeWidth:ce?1:.5}),e.jsx("text",{x:S,y:oe+5,textAnchor:"middle",fontSize:"9",fontFamily:"var(--sans)",fontWeight:"700",style:{fill:Ue,userSelect:"none",pointerEvents:"none"},children:Z})]})]},`t-${$}`)};return e.jsx("div",{className:"lc-diagram",children:e.jsxs("svg",{width:Q,height:T,viewBox:`0 0 ${Q} ${T}`,style:{fontFamily:"var(--mono)",overflow:"visible"},children:[e.jsxs("defs",{children:[e.jsx("marker",{id:"arr",markerWidth:"7",markerHeight:"7",refX:"5",refY:"3.5",orient:"auto",children:e.jsx("path",{d:"M0,0.5 L0,6.5 L6,3.5 z",fill:"context-stroke",opacity:"0.7"})}),e.jsxs("filter",{id:"glow",children:[e.jsx("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),H.map(z),G.map(z),A.map(v=>{const P=v.id||v.ID,J=v.name||v.NAME||P,$=v.is_frozen===1||v.IS_FROZEN===1,U=v.is_released===1||v.IS_RELEASED===1,C=[v.is_initial===1||v.IS_INITIAL===1?"INIT":null,$?"FROZEN":null,U?"REL":null].filter(Boolean).join(" · "),M=x[P],V=M-yt/2,W=q-jt/2,Y=i||P===s;let oe,S,_;if(Y){const O=Js(v);oe=`${O}22`,S=O,_=O}else oe="var(--surface2)",S="var(--border2)",_="var(--muted)";return e.jsxs("g",{filter:Y?"url(#glow)":void 0,children:[e.jsx("rect",{x:V,y:W,width:yt,height:jt,rx:6,style:{fill:oe,stroke:S},strokeWidth:Y?1.5:1}),e.jsx("text",{x:M,y:q+(C?1:4),textAnchor:"middle",fontSize:"11",fontFamily:"var(--sans)",fontWeight:Y?"700":"600",style:{fill:_},children:J}),C&&e.jsx("text",{x:M,y:q+13,textAnchor:"middle",fontSize:"7",fontFamily:"var(--sans)",style:{fill:Y?_:"var(--muted2)"},opacity:"0.7",children:C})]},P)})]})})}const Fn=new Map;function Xe(t,s,{wrapBody:n=!0}={}){Fn.set(t,{Component:s,wrapBody:n})}function Ja(t){return Fn.get(t)??null}const Xa=new Map,Rt=new Map;function Ya(t){t!=null&&t.id&&(Xa.set(t.id,t),Rt.has(t.zone)||Rt.set(t.zone,[]),Rt.get(t.zone).push(t))}function Za(t){return(Rt.get("editor")??[]).find(n=>{var r;return(r=n.matches)==null?void 0:r.call(n,t)})??null}function Qa(t){var s;for(const n of Rt.get("settings")??[])if((s=n.sections)!=null&&s[t])return{Component:n.sections[t],wrapBody:!0};return null}function eo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(""),[c,p]=l.useState("actions");if(l.useEffect(()=>{ze.listActions(t).then(b=>{const h=Array.isArray(b)?b:[];if(a(h),!o){const N=[...new Set(h.map(R=>R.serviceCode).filter(Boolean))].sort();N.length>0&&i(N[0])}}).catch(()=>a([]))},[t]),r===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const d=[...new Set(r.map(b=>b.serviceCode).filter(Boolean))].sort(),u=b=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:c===b?"var(--accent)":"var(--muted)",borderBottom:c===b?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:o,onChange:b=>i(b.target.value),children:d.map(b=>e.jsx("option",{value:b,children:b},b))})]}),e.jsxs("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[e.jsx("button",{style:u("actions"),onClick:()=>p("actions"),children:"Actions"}),e.jsx("button",{style:u("algorithm-catalog"),onClick:()=>p("algorithm-catalog"),children:"Algorithm Catalog"})]}),c==="actions"&&e.jsx(to,{userId:t,serviceCode:o,dbActions:r.filter(b=>b.serviceCode===o),canWrite:s,toast:n}),c==="algorithm-catalog"&&e.jsx(so,{userId:t,serviceCode:o,canWrite:s,toast:n})]})}function to({userId:t,serviceCode:s,dbActions:n,canWrite:r,toast:a}){const[o,i]=l.useState(null),[c,p]=l.useState(null),[d,u]=l.useState(null),[b,h]=l.useState(null),[N,R]=l.useState({}),[A,f]=l.useState({}),x=o??n;function m(I,z){i(v=>(v??n).map(P=>P.id===I?{...P,description:z}:P))}l.useEffect(()=>{s&&(i(null),p(null),h(null),R({}),f({}),Promise.all([ze.getServiceCatalog(s),ze.listAllInstances(t,s)]).then(([I,z])=>{p(I),u(Array.isArray(z)?z:[])}).catch(()=>{p({handlers:[],guards:[]}),u([])}))},[t,s]);async function y(I){const z=await ze.listActionGuards(t,I).catch(()=>[]);R(v=>({...v,[I]:Array.isArray(z)?z:[]}))}async function g(I){const z=await ze.listActionWrappers(t,I).catch(()=>[]);f(v=>({...v,[I]:Array.isArray(z)?z:[]}))}function j(I){if(b===I){h(null);return}h(I),N[I]||y(I),A[I]||g(I)}async function D(I,z,v){try{await ze.attachActionGuard(t,I,z,v||"HIDE",0),y(I),a("Guard attached","success")}catch(P){a(String(P),"error")}}async function G(I,z){try{await ze.detachActionGuard(t,I,z),y(I),a("Guard detached","success")}catch(v){a(String(v),"error")}}async function H(I,z,v){try{await ze.updateActionGuard(t,I,z,v),R(P=>({...P,[I]:(P[I]||[]).map(J=>J.id===z?{...J,effect:v}:J)}))}catch(P){a(String(P),"error")}}async function B(I,z,v){try{await ze.attachActionWrapper(t,I,z,v,s),g(I),a("Wrapper attached","success")}catch(P){a(String(P),"error")}}if(c===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const L={};x.forEach(I=>{L[(I.actionCode||I.action_code||"").toUpperCase()]=I});const w=c.handlers||[],k=new Set([...w.map(I=>(I.code||"").toUpperCase()),...Object.keys(L)]),q=Array.from(k).map(I=>{const z=L[I],v=w.find(P=>(P.code||"").toUpperCase()===I);return z?{...z,_fromDb:!0,_module:z.handlerModuleName||z.handler_module_name||(v==null?void 0:v.module)||"unknown"}:{id:null,actionCode:v.code,displayName:v.label||v.code,scope:null,displayCategory:null,displayOrder:9999,description:null,_fromDb:!1,_module:v.module||"unknown"}});if(q.sort((I,z)=>I._fromDb&&z._fromDb?(I.displayOrder??0)-(z.displayOrder??0):I._fromDb?-1:z._fromDb?1:(I.actionCode||"").localeCompare(z.actionCode||"")),q.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No actions registered for ",e.jsx("strong",{children:s}),"."]});const Q={};q.forEach(I=>{const z=I._module||"unknown";Q[z]||(Q[z]=[]),Q[z].push(I)});const T=(d||[]).filter(I=>(I.typeName||"").toLowerCase().includes("guard")),F=(d||[]).filter(I=>(I.typeName||"").toLowerCase().includes("wrapper"));return e.jsx("div",{className:"settings-list",children:Object.entries(Q).sort(([I],[z])=>I.localeCompare(z)).map(([I,z])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx(Un,{module:I}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",z.length,")"]})]}),z.map(v=>{const P=v.id||v.actionCode,J=b===P,$=v.actionCode||v.action_code,U=v.displayName||v.display_name||$,K=v.scope,C=v.displayCategory||v.display_category,M=N[P]||[],V=A[P]||[];return e.jsxs("div",{className:"settings-card",style:{marginBottom:4,opacity:v._fromDb?1:.6},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>v._fromDb&&j(P),style:{display:"flex",alignItems:"center",cursor:v._fromDb?"pointer":"default"},children:[v._fromDb?e.jsx("span",{className:"settings-card-chevron",children:J?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(He,{size:13,strokeWidth:2,color:"var(--muted)"})}):e.jsx("span",{className:"settings-card-chevron",style:{width:18,color:"var(--muted2)",fontSize:9},children:"—"}),e.jsx("span",{className:"settings-card-name",children:U}),!v._fromDb&&e.jsx("span",{style:{fontSize:9,color:"var(--muted2)",marginLeft:6,fontStyle:"italic"},children:"not seeded"}),e.jsx("span",{style:{flex:1}}),K&&e.jsx("span",{className:"settings-badge",children:K}),C&&e.jsx("span",{className:"settings-badge",style:{marginLeft:4},children:C})]}),J&&v._fromDb&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:e.jsxs("span",{children:["Code: ",e.jsx("code",{children:$})]})}),e.jsx(no,{description:v.description,actionId:P,userId:t,canWrite:r,onSaved:W=>m(P,W)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Guards"}),M.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No guards attached"}),M.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%",marginBottom:8},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Guard"}),e.jsx("th",{children:"Effect"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:M.map(W=>e.jsxs("tr",{children:[e.jsxs("td",{children:[W.algorithmName||W.algorithm_name,(W.algorithmCode||W.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",W.algorithmCode||W.algorithm_code,")"]})]}),e.jsx("td",{children:r?e.jsxs("select",{className:"field-input",style:{fontSize:11,padding:"1px 4px"},value:W.effect,onChange:Y=>H(P,W.id,Y.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}):e.jsx("span",{className:`settings-badge${W.effect==="BLOCK"?" badge-warn":""}`,children:W.effect})}),e.jsx("td",{style:{textAlign:"right"},children:r&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>G(P,W.id),children:e.jsx(Nt,{size:10})})})]},W.id))})]}),r&&T.length>0&&e.jsx(ao,{instances:T,onAttach:(W,Y)=>D(P,W,Y)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4,marginTop:12},children:"Wrappers"}),V.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No wrappers"}),V.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Order"}),e.jsx("th",{children:"Wrapper"}),e.jsx("th",{children:"Instance"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:V.map(W=>e.jsxs("tr",{children:[e.jsx("td",{style:{width:50},children:W.executionOrder||W.execution_order}),e.jsxs("td",{children:[W.algorithmName||W.algorithm_name,(W.algorithmCode||W.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",W.algorithmCode||W.algorithm_code,")"]})]}),e.jsx("td",{style:{fontSize:11,color:"var(--muted)"},children:W.instanceName||W.instance_name}),e.jsx("td",{style:{textAlign:"right"},children:r&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:async()=>{try{await ze.detachActionWrapper(t,P,W.id),g(P),a("Wrapper detached","success")}catch(Y){a(String(Y),"error")}},children:e.jsx(Nt,{size:10})})})]},W.id))})]}),r&&F.length>0&&e.jsx(ro,{instances:F,onAttach:(W,Y)=>B(P,W,Y)})]})]},P)})]},I))})}const Ys=[{key:"handler",label:"Action Handler",filter:t=>t.toLowerCase().includes("handler")},{key:"guard",label:"Guard",filter:t=>t.toLowerCase().includes("guard")},{key:"wrapper",label:"Wrapper",filter:t=>t.toLowerCase().includes("wrapper")}];function so({userId:t,serviceCode:s}){const[n,r]=l.useState(null),[a,o]=l.useState("handler");l.useEffect(()=>{s&&(r(null),ze.listAllInstances(t,s).then(d=>r(Array.isArray(d)?d:[])).catch(()=>r([])))},[t,s]);const i=d=>({padding:"4px 12px",fontSize:11,cursor:"pointer",background:"none",border:"none",color:a===d?"var(--accent)":"var(--muted)",borderBottom:a===d?"2px solid var(--accent)":"2px solid transparent"});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const c=Ys.find(d=>d.key===a),p=(n||[]).filter(d=>c==null?void 0:c.filter(d.typeName||d.type_name||""));return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:Ys.map(d=>e.jsx("button",{style:i(d.key),onClick:()=>o(d.key),children:d.label},d.key))}),p.length===0?e.jsxs("div",{style:{padding:"16px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No ",c==null?void 0:c.label.toLowerCase()," instances for ",e.jsx("strong",{children:s}),"."]}):e.jsx("div",{className:"settings-list",children:p.map(d=>{const u=a==="guard"?e.jsx(gt,{size:12,color:"var(--accent)",strokeWidth:1.8}):a==="wrapper"?e.jsx(Ss,{size:12,color:"var(--muted2)",strokeWidth:1.8}):e.jsx(ks,{size:12,color:"var(--muted)",strokeWidth:1.8});return e.jsxs("div",{className:"settings-card",style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"},children:[u,e.jsx("span",{className:"settings-card-name",style:{flex:1,fontSize:12},children:d.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:d.algorithmCode||d.algorithm_code})]},d.id)})})]})}function no({description:t,actionId:s,userId:n,canWrite:r,onSaved:a}){const[o,i]=l.useState(!1),[c,p]=l.useState(t||""),d=l.useCallback(async()=>{await ze.updateAction(n,s,{description:c}),a(c),i(!1)},[n,s,c,a]);return e.jsxs("div",{style:{marginBottom:10},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Description"}),o?e.jsxs("div",{style:{display:"flex",gap:6},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11},value:c,onChange:u=>p(u.target.value)}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:d,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{p(t||""),i(!1)},children:"✕"})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{style:{fontSize:11,color:t?"var(--text)":"var(--muted)",fontStyle:t?"normal":"italic"},children:t||"No description"}),r&&e.jsx("button",{className:"btn btn-xs",onClick:()=>i(!0),children:"Edit"})]})]})}function ro({instances:t,onAttach:s}){const[n,r]=l.useState(""),[a,o]=l.useState(10);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>r(i.target.value),children:[e.jsx("option",{value:"",children:"— attach wrapper —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsx("input",{type:"number",className:"field-input",style:{fontSize:11,width:60,padding:"3px 4px"},value:a,min:1,onChange:i=>o(Number(i.target.value)),placeholder:"Order"}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,a),r(""))},children:[e.jsx(Fe,{size:10})," Attach"]})]})}function ao({instances:t,onAttach:s}){const[n,r]=l.useState(""),[a,o]=l.useState("HIDE");return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>r(i.target.value),children:[e.jsx("option",{value:"",children:"— attach guard —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsxs("select",{className:"field-input",style:{fontSize:11,width:90,padding:"3px 4px"},value:a,onChange:i=>o(i.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,a),r(""))},children:[e.jsx(Fe,{size:10})," Attach"]})]})}function oo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(null),[c,p]=l.useState(""),[d,u]=l.useState("catalog"),[b,h]=l.useState(null),[N,R]=l.useState(null),[A,f]=l.useState(24),x=l.useCallback(()=>{a(null),i(null),Promise.all([ze.listAlgorithms(t),ze.listAllInstances(t)]).then(([D,G])=>{const H=Array.isArray(D)?D:[],B=Array.isArray(G)?G:[];if(a(H),i(B),!c){const L=[...new Set(H.map(w=>w.serviceCode).filter(Boolean))].sort();L.length>0&&p(L[0])}}).catch(()=>{a([]),i([])})},[t]);l.useEffect(()=>{x()},[x]),l.useEffect(()=>{h(null),R(null)},[c]);const m=l.useCallback(()=>{ze.getAlgorithmStats(t,c).then(D=>h(Array.isArray(D)?D:[])).catch(()=>h([]))},[t,c]),y=l.useCallback(D=>{ze.getAlgorithmTimeseries(t,D,c).then(G=>R(Array.isArray(G)?G:[])).catch(()=>R([]))},[t,c]);if(r===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const g=[...new Set(r.map(D=>D.serviceCode).filter(Boolean))].sort(),j=D=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:d===D?"var(--accent)":"var(--muted)",borderBottom:d===D?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:c,onChange:D=>p(D.target.value),children:g.map(D=>e.jsx("option",{value:D,children:D},D))})]}),e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[["catalog","Catalog"],["stats","Execution Stats"],["graph","Usage Graph"]].map(([D,G])=>e.jsx("button",{style:j(D),onClick:()=>{u(D),D==="stats"&&!b&&m(),D==="graph"&&!N&&y(A)},children:G},D))}),c&&d==="catalog"&&e.jsx(io,{userId:t,serviceCode:c,algorithms:r.filter(D=>D.serviceCode===c),instances:o?o.filter(D=>D.serviceCode===c):[],canWrite:s,toast:n,onReload:x}),d==="stats"&&c&&e.jsx(co,{userId:t,serviceCode:c,canWrite:s,toast:n,stats:b,onLoad:m,onReset:async()=>{await ze.resetAlgorithmStats(t,c).catch(()=>{}),h([]),n("Stats reset","success")}}),d==="graph"&&c&&e.jsx(po,{timeseries:N,tsHours:A,onLoad:D=>{f(D),y(D)}})]})}function io({userId:t,serviceCode:s,algorithms:n,instances:r,canWrite:a,toast:o,onReload:i}){const[c,p]=l.useState(null),[d,u]=l.useState(""),[b,h]=l.useState({});l.useEffect(()=>{p(null),u(""),h({})},[s]);async function N(f){const x=d.trim();if(!x){o("Instance name is required","error");return}try{await ze.createInstance(t,f,x,s),u(""),i(),o("Instance created","success")}catch(m){o(String(m),"error")}}if(n.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No algorithms registered for ",e.jsx("strong",{children:s}),"."]});const R={};n.forEach(f=>{const x=f.typeName||f.type_name||"Unknown",m=f.moduleName||f.module_name||"unknown";R[x]||(R[x]={}),R[x][m]||(R[x][m]=[]),R[x][m].push(f)});const A={};return(r||[]).forEach(f=>{const x=f.algorithmId||f.algorithm_id;A[x]||(A[x]=[]),A[x].push(f)}),e.jsx("div",{className:"settings-list",children:Object.entries(R).sort(([f],[x])=>f.localeCompare(x)).map(([f,x])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx("span",{style:{fontSize:12,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".04em"},children:f}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".06em"},children:"type"})]}),Object.entries(x).sort(([m],[y])=>m.localeCompare(y)).map(([m,y])=>e.jsxs("div",{style:{marginBottom:14,marginLeft:4},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6},children:[e.jsx(Un,{module:m}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",y.length,")"]})]}),y.map(g=>{const j=g.id,D=c===j,G=A[j]||[],H=g.code,B=g.name||H;return e.jsxs("div",{className:"settings-card",style:{marginBottom:4},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>{const L=D?null:j;p(L),u(""),L&&!b[L]&&ze.listAlgorithmParameters(t,L).then(w=>h(k=>({...k,[L]:Array.isArray(w)?w:[]}))).catch(()=>h(w=>({...w,[L]:[]})))},style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:D?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(He,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(Cn,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:B}),e.jsx("span",{className:"settings-card-id",children:H}),e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:g.description||""}),e.jsxs("span",{className:"settings-badge",style:{marginLeft:8},children:[G.length," instance",G.length!==1?"s":""]})]}),D&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsxs("div",{style:{display:"flex",gap:16,fontSize:11,color:"var(--muted)",marginBottom:10},children:[e.jsxs("span",{children:["Handler: ",e.jsx("code",{style:{color:"var(--text)"},children:g.handlerRef||g.handler_ref||"—"})]}),e.jsxs("span",{children:["Type: ",e.jsx("code",{style:{color:"var(--text)"},children:f})]})]}),(()=>{const L=b[j];return!L||L.length===0?null:e.jsxs("div",{style:{marginBottom:12},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Parameter Schema"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsx("tr",{style:{borderBottom:"1px solid var(--border)"},children:["Name","Label","Type","Req.","Default"].map(w=>e.jsx("th",{style:{textAlign:w==="Req."?"center":"left",padding:"3px 6px",color:"var(--muted)",fontWeight:600,fontSize:10},children:w},w))})}),e.jsx("tbody",{children:L.map(w=>{const k=w.paramName||w.param_name,q=w.paramLabel||w.param_label||k,Q=w.dataType||w.data_type||"STRING",T=w.required===1||w.required===!0,F=w.defaultValue||w.default_value||"";return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--accent)"},children:k}),e.jsx("td",{style:{padding:"3px 6px"},children:q}),e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--muted)",fontSize:10},children:Q}),e.jsx("td",{style:{padding:"3px 6px",textAlign:"center"},children:T?"✓":""}),e.jsx("td",{style:{padding:"3px 6px",color:F?"var(--text)":"var(--muted)",fontFamily:"var(--mono)",fontSize:10},children:F||"—"})]},w.id||k)})})]})]})})(),e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Instances"}),G.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"No instances"}),G.map(L=>e.jsx(lo,{inst:L,algo:g,userId:t,canWrite:a,toast:o,onReload:i},L.id)),a&&e.jsxs("div",{style:{display:"flex",gap:6,marginTop:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11,padding:"3px 6px"},placeholder:"New instance name…",value:d,onChange:L=>u(L.target.value),onKeyDown:L=>{L.key==="Enter"&&N(j)}}),e.jsxs("button",{className:"btn btn-sm",style:{fontSize:10},disabled:!d.trim(),onClick:()=>N(j),children:[e.jsx(Fe,{size:10,strokeWidth:2.5})," Create"]})]})]})]},j)})]},m))]},f))})}function lo({inst:t,algo:s,userId:n,canWrite:r,toast:a,onReload:o}){var y;const[i,c]=l.useState(!1),[p,d]=l.useState(null),[u,b]=l.useState(!1),[h,N]=l.useState(t.name||"");async function R(){if(p===null)try{const g=await ze.getInstanceParams(n,t.id);d(Array.isArray(g)?g:[])}catch{d([])}}function A(){i||R(),c(g=>!g)}async function f(){if(!h.trim()||h.trim()===t.name){b(!1);return}try{await ze.updateInstance(n,t.id,h.trim()),a("Instance renamed","success"),o()}catch(g){a(String(g),"error")}b(!1)}async function x(){try{await ze.deleteInstance(n,t.id),a("Instance deleted","success"),o()}catch(g){a(String(g),"error")}}async function m(g,j){try{await ze.setInstanceParam(n,t.id,g,j);const D=await ze.getInstanceParams(n,t.id);d(Array.isArray(D)?D:[])}catch(D){a(String(D),"error")}}return e.jsxs("div",{className:"settings-card",style:{marginBottom:2},children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",cursor:"pointer"},onClick:A,children:[e.jsx("span",{className:"settings-card-chevron",children:i?e.jsx(Ke,{size:11,strokeWidth:2,color:"var(--muted)"}):e.jsx(He,{size:11,strokeWidth:2,color:"var(--muted)"})}),u?e.jsx("input",{className:"field-input",style:{fontSize:12,padding:"1px 4px",flex:1},autoFocus:!0,value:h,onChange:g=>N(g.target.value),onBlur:f,onKeyDown:g=>{g.key==="Enter"&&f(),g.key==="Escape"&&(b(!1),N(t.name))},onClick:g=>g.stopPropagation()}):e.jsx("span",{className:"settings-card-name",style:{fontSize:12,flex:1},children:t.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:(y=t.id)==null?void 0:y.slice(-8)}),r&&e.jsxs("span",{style:{display:"flex",gap:4,marginLeft:8},onClick:g=>g.stopPropagation(),children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>{b(!0),N(t.name)},children:e.jsx(bt,{size:10})}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:x,children:e.jsx(Nt,{size:10})})]})]}),i&&e.jsxs("div",{className:"settings-card-body",style:{padding:"6px 12px 8px 26px"},children:[p===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading params…"}),p!==null&&p.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No parameters"}),p!==null&&p.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Parameter"}),e.jsx("th",{children:"Value"})]})}),e.jsx("tbody",{children:p.map(g=>e.jsxs("tr",{children:[e.jsxs("td",{style:{fontSize:11},children:[g.paramLabel||g.param_label||g.paramName||g.param_name,(g.dataType||g.data_type)&&e.jsx("span",{style:{color:"var(--muted2)",fontSize:9,marginLeft:4},children:g.dataType||g.data_type})]}),e.jsx("td",{children:r?e.jsx(uo,{param:g,onSave:j=>m(g.algorithmParameterId||g.algorithm_parameter_id||g.id,j)}):e.jsx("span",{style:{fontSize:11,fontFamily:"var(--mono)"},children:g.value||e.jsx("em",{style:{color:"var(--muted)"},children:"—"})})})]},g.id))})]})]})]})}function co({stats:t,onLoad:s,onReset:n}){return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:s,children:"Refresh"}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:n,children:"Reset"})]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading stats…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No algorithm executions recorded yet"}),t&&t.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Algorithm"}),e.jsx("th",{style:{textAlign:"right"},children:"Calls"}),e.jsx("th",{style:{textAlign:"right"},children:"Min (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Avg (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Max (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Total (ms)"}),e.jsx("th",{children:"Last Update"})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:r.algorithmCode})}),e.jsx("td",{style:{textAlign:"right"},children:r.callCount}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.minMs=="number"?r.minMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.avgMs=="number"?r.avgMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.maxMs=="number"?r.maxMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof r.totalMs=="number"?r.totalMs.toFixed(1):"—"}),e.jsx("td",{style:{fontSize:10,color:"var(--muted)"},children:r.lastFlushed||"—"})]},r.algorithmCode))})]})]})}function po({timeseries:t,tsHours:s,onLoad:n}){const o={t:20,r:20,b:40,l:50},i=800-o.l-o.r,c=200-o.t-o.b;function p(b,h,N){if(b.length===0)return e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No data"});const R=Math.max(...b.map(A=>A.calls),1);return e.jsxs("svg",{viewBox:"0 0 800 200",style:{width:"100%",height:200,display:"block"},children:[[0,.25,.5,.75,1].map(A=>{const f=o.t+c*(1-A);return e.jsxs("g",{children:[e.jsx("line",{x1:o.l,x2:800-o.r,y1:f,y2:f,stroke:"var(--border)",strokeWidth:.5}),e.jsx("text",{x:o.l-4,y:f+3,textAnchor:"end",fill:"var(--muted)",fontSize:9,children:Math.round(R*A)})]},A)}),b.map((A,f)=>{const x=Math.max(i/b.length-1,2),m=o.l+f/b.length*i,y=A.calls/R*c,g=o.t+c-y,j=b.length<20||f%Math.ceil(b.length/12)===0,D=A.windowStart.replace("T"," ").slice(11,16);return e.jsxs("g",{children:[e.jsx("rect",{x:m,y:g,width:x,height:y,fill:N,opacity:.8,rx:1,children:e.jsxs("title",{children:[A.windowStart.replace("T"," ").slice(0,16)," — ",A.calls," calls, ",A.totalMs.toFixed(1),"ms"]})}),j&&e.jsx("text",{x:m+x/2,y:200-o.b+14,textAnchor:"middle",fill:"var(--muted)",fontSize:8,transform:`rotate(-45, ${m+x/2}, ${200-o.b+14})`,children:D})]},f)}),e.jsx("text",{x:12,y:o.t+c/2,textAnchor:"middle",fill:"var(--muted)",fontSize:9,transform:`rotate(-90, 12, ${o.t+c/2})`,children:"Calls"}),e.jsx("text",{x:o.l,y:12,fill:"var(--text)",fontSize:11,fontWeight:600,children:h})]})}const d={};(t||[]).forEach(b=>{d[b.windowStart]||(d[b.windowStart]={calls:0,totalMs:0}),d[b.windowStart].calls+=b.callCount||0,d[b.windowStart].totalMs+=b.totalMs||0});const u=Object.keys(d).sort().map(b=>({windowStart:b,...d[b]}));return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12,alignItems:"center"},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>n(s),children:"Refresh"}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)"},children:"Window:"}),[6,12,24,48].map(b=>e.jsxs("button",{className:"btn btn-xs",onClick:()=>n(b),style:{background:s===b?"var(--accent)":void 0,color:s===b?"#fff":void 0},children:[b,"h"]},b))]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No windowed data yet. Stats are bucketed every 15 seconds on flush."}),t&&t.length>0&&e.jsx("div",{style:{background:"var(--bg2)",borderRadius:6,padding:12},children:p(u,"All Algorithms (aggregate)","#3b82f6")})]})}function uo({param:t,onSave:s}){const[n,r]=l.useState(t.value||""),[a,o]=l.useState(!1);function i(c){r(c),o(c!==(t.value||""))}return e.jsxs("div",{style:{display:"flex",gap:4,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{fontSize:11,padding:"1px 4px",flex:1},value:n,onChange:c=>i(c.target.value),onBlur:()=>{a&&(s(n),o(!1))}}),a&&e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>{s(n),o(!1)},children:"Save"})]})}function Zs(t){return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(t??"—")}function mo({canWrite:t,toast:s}){const[n,r]=l.useState(null),[a,o]=l.useState(!1),[i,c]=l.useState(null);function p(){ee.searchInfo().then(r).catch(()=>r({available:!1}))}l.useEffect(()=>{p()},[]);async function d(){o(!0);try{const b=await ee.reindexSearch();c(b.queued),s==null||s(`Re-index queued: ${b.queued} nodes`),setTimeout(p,2e3)}catch{s==null||s("Re-index failed — check psm-api logs")}finally{o(!1)}}const u=(n==null?void 0:n.available)!==!1;return e.jsxs("div",{children:[e.jsx("div",{className:"nats-section-title",children:"Index statistics"}),e.jsxs("div",{className:"nats-stats-grid",style:{gridTemplateColumns:"repeat(3,1fr)"},children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Status"}),e.jsx("span",{className:"nats-stat-value",style:{fontSize:13,color:u?"var(--success)":"var(--warn)"},children:n===null?"…":u?"Online":"Unavailable"})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Nodes"}),e.jsx("span",{className:"nats-stat-value",children:n===null?"…":Zs(n.nodeCount)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Edges"}),e.jsx("span",{className:"nats-stat-value",children:n===null?"…":Zs(n.edgeCount)})]})]}),e.jsx("div",{className:"nats-section-title",style:{marginTop:20},children:"Re-index"}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:10,lineHeight:1.5},children:"Republishes all PSM nodes through the event pipeline so the search index picks up any new stored fields (e.g. after updating the extractor)."}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:d,disabled:a||!t,children:a?"Queuing…":"Re-index now"}),i!=null&&e.jsxs("span",{style:{fontSize:12,color:"var(--muted)"},children:["Last run: ",i," nodes queued"]})]})]})}function ho(t){if(!t)return{fg:"var(--muted2)",bg:"rgba(120,130,150,.14)"};let s=0;for(let r=0;r<t.length;r++)s=s*31+t.charCodeAt(r)&16777215;const n=s%360;return{fg:`hsl(${n},70%,72%)`,bg:`hsl(${n},55%,22%)`}}function Un({module:t}){if(!t)return null;const s=ho(t);return e.jsx("span",{title:`Spring Modulith module: ${t}`,style:{display:"inline-block",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700,letterSpacing:".06em",fontFamily:"var(--mono)",textTransform:"uppercase",background:s.bg,color:s.fg,border:`1px solid ${s.fg}33`,verticalAlign:"middle"},children:t})}function xo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(!1),[c,p]=l.useState({displayName:"",email:""}),[d,u]=l.useState(!1);l.useEffect(()=>{ee.getUser(t,t).then(a).catch(()=>{})},[t]);function b(){p({displayName:(r==null?void 0:r.displayName)||"",email:(r==null?void 0:r.email)||""}),i(!0)}async function h(){u(!0);try{await ee.updateUser(t,t,c.displayName.trim(),c.email.trim());const N=await ee.getUser(t,t);a(N),i(!1),n("Profile updated","success")}catch{n("Failed to update profile","error")}finally{u(!1)}}return r?e.jsxs("div",{className:"settings-list",children:[e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx(es,{size:15,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{fontSize:13},children:r.username}),r.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",children:"Admin"})]}),o?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(Ge,{label:"Display Name",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.displayName,onChange:N=>p(R=>({...R,displayName:N.target.value}))})}),e.jsx(Ge,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:c.email,onChange:N=>p(R=>({...R,email:N.target.value}))})}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:4},children:[e.jsx("button",{className:"btn btn-primary",onClick:h,disabled:d,children:d?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>i(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,paddingLeft:23},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:r.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:r.email||"—"})]}),s&&e.jsx("div",{style:{marginTop:4},children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:b,children:[e.jsx(bt,{size:11,strokeWidth:2}),"Edit"]})})]})]}),e.jsx(go,{})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}const fo=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function go(){const[t,s]=l.useState(Yt);function n(r){s(r),Es(r)}return e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:10},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:fo.map(r=>e.jsxs("button",{type:"button",className:`theme-option${t===r.value?" theme-option--active":""}`,onClick:()=>n(r.value),children:[e.jsx("span",{className:"theme-option-icon",children:r.icon}),e.jsx("span",{children:r.label})]},r.value))})]})}function ns({title:t,onClose:s,onSave:n,saving:r,saveLabel:a="Save",children:o,width:i=480}){return e.jsx("div",{className:"diff-overlay",style:{zIndex:600},onClick:c=>{c.target===c.currentTarget&&s()},children:e.jsxs("div",{className:"diff-modal",style:{width:i,maxHeight:"85vh",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"diff-header",children:[e.jsx("span",{className:"diff-title",children:t}),e.jsx("button",{className:"diff-close",onClick:s,children:"×"})]}),e.jsx("div",{style:{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12},children:o}),e.jsxs("div",{style:{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0},children:[e.jsx("button",{className:"btn",onClick:s,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:n,disabled:r,children:r?"Saving…":a})]})]})})}function Ge({label:t,children:s}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx("label",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:t}),s]})}function bo({userId:t,roleId:s,canWrite:n,toast:r,nodePerms:a,lcPerms:o,nodeTypes:i,transitions:c}){const[p,d]=l.useState(null);l.useEffect(()=>{d(null),ee.getRolePolicies(t,s).then(f=>{const x=new Set;(Array.isArray(f)?f:[]).forEach(m=>{const y=m.permissionCode||m.permission_code,g=m.nodeTypeId||m.node_type_id||"",j=m.transitionId||m.transition_id||"";x.add(`${y}|${g}|${j}`)}),d(x)}).catch(()=>d(new Set))},[t,s]);const u=(f,x,m)=>`${f}|${x||""}|${m||""}`;async function b(f,x,m){if(!n||!p)return;const y=u(f,x,m),g=p.has(y);d(j=>{const D=new Set(j);return g?D.delete(y):D.add(y),D});try{g?await ee.removePermissionGrant(t,x,f,s,m||null):await ee.addPermissionGrant(t,x,f,s,m||null)}catch(j){d(D=>{const G=new Set(D);return g?G.add(y):G.delete(y),G}),r(j,"error")}}if(!p)return e.jsx("div",{style:{padding:"4px 0",color:"var(--muted)",fontSize:11},children:"Loading policies…"});if(i.length===0)return e.jsx("div",{className:"settings-empty-row",children:"No node types defined."});const h={padding:"4px 8px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)",background:"var(--bg2, var(--bg))",whiteSpace:"nowrap",verticalAlign:"bottom"},N={padding:"3px 6px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)"};function R({permCode:f,ntId:x,transId:m}){const y=p.has(u(f,x,m));return e.jsx("td",{style:N,children:e.jsx("button",{className:"panel-icon-btn",disabled:!n,title:n?y?"Revoke":"Grant":"Requires MANAGE_ROLES",onClick:()=>b(f,x,m),style:{margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",width:22,height:22,cursor:n?"pointer":"default"},children:y?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})})})}function A({ntId:f,ntName:x}){return e.jsxs("td",{style:{...N,textAlign:"left",position:"sticky",left:0,background:"var(--bg)",zIndex:1,minWidth:120},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"var(--text)"},children:x}),e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--muted)"},children:f})]})}return e.jsxs("div",{children:[a.length>0&&e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Node Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...h,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),a.map(f=>e.jsxs("th",{style:{...h,minWidth:72},children:[e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--accent)",marginBottom:1},children:f.permissionCode}),e.jsx("div",{style:{fontSize:9,color:"var(--muted)",fontWeight:400},children:f.displayName})]},f.permissionCode))]})}),e.jsx("tbody",{children:i.map(f=>{const x=f.id||f.ID,m=f.name||f.NAME||x;return e.jsxs("tr",{children:[e.jsx(A,{ntId:x,ntName:m}),a.map(y=>e.jsx(R,{permCode:y.permissionCode,ntId:x,transId:null},y.permissionCode))]},x)})})]})})]}),o.length>0&&c.length>0&&e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Lifecycle Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type + transition check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...h,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),c.map(f=>e.jsx("th",{style:{...h,minWidth:100},children:e.jsx("div",{style:{fontSize:9,color:"var(--text)",fontWeight:500},children:f.label})},f.id))]})}),e.jsx("tbody",{children:i.filter(f=>f.lifecycle_id||f.lifecycleId).map(f=>{const x=f.id||f.ID,m=f.name||f.NAME||x,y=f.lifecycle_id||f.lifecycleId;return e.jsxs("tr",{children:[e.jsx(A,{ntId:x,ntName:m}),c.map(g=>g.lifecycleId!==y?e.jsx("td",{style:N,children:e.jsx("span",{style:{color:"var(--border)",fontSize:11},children:"—"})},g.id):e.jsx(R,{permCode:o[0].permissionCode,ntId:x,transId:g.id},g.id))]},x)})})]})})]}),a.length===0&&o.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No permissions configured."})]})}function vo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState([]),[o,i]=l.useState(!0),[c,p]=l.useState(!1),[d,u]=l.useState({name:"",description:""}),[b,h]=l.useState(!1),[N,R]=l.useState(null),[A,f]=l.useState({}),[x,m]=l.useState({}),[y,g]=l.useState(!1);function j(){return ee.listProjectSpaces(t).then(L=>a(Array.isArray(L)?L:[]))}l.useEffect(()=>{j().finally(()=>i(!1))},[t]),l.useEffect(()=>{mt.getRegistryTags().then(f).catch(()=>{})},[]);async function D(){if(d.name.trim()){h(!0);try{await ee.createProjectSpace(t,d.name.trim(),d.description.trim()||null),await j(),p(!1),u({name:"",description:""})}catch(L){n(L,"error")}finally{h(!1)}}}async function G(L){if(N===L){R(null);return}R(L);try{const w=await ee.getProjectSpaceServiceTags(t,L);m(w||{})}catch{m({})}}async function H(L){const w=L.id||L.ID,k=L.isolated===!0;try{await ee.setProjectSpaceIsolated(t,w,!k),await j(),n(k?"Isolation disabled":"Isolation enabled")}catch(q){n(q,"error")}}async function B(L,w,k){g(!0);try{await ee.setProjectSpaceServiceTags(t,L,w,k);const q=await ee.getProjectSpaceServiceTags(t,L);m(q||{}),n("Tags updated")}catch(q){n(q,"error")}finally{g(!1)}}return o?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-list",children:[c&&e.jsxs(ns,{title:"New Project Space",onClose:()=>{p(!1),u({name:"",description:""})},onSave:D,saving:b,saveLabel:"Create",children:[e.jsx(Ge,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:d.name,onChange:L=>u(w=>({...w,name:L.target.value})),placeholder:"e.g. Prototype-2026"})}),e.jsx(Ge,{label:"Description",children:e.jsx("input",{className:"field-input",value:d.description,onChange:L=>u(w=>({...w,description:L.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{u({name:"",description:""}),p(!0)},children:[e.jsx(Fe,{size:11,strokeWidth:2.5}),"New space"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No project spaces yet."}),r.map(L=>{const w=L.id||L.ID,k=L.name||L.NAME||w,q=L.description||L.DESCRIPTION||"",Q=L.active!==!1&&L.ACTIVE!==!1,T=L.isolated===!0,F=L.parentId||L.PARENT_ID||null,I=N===w;return e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer"},onClick:()=>G(w),children:[I?e.jsx(Ke,{size:12}):e.jsx(He,{size:12}),e.jsx(Mt,{size:13,color:Q?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:k}),e.jsx("span",{className:"settings-card-id",children:w}),F&&e.jsx("span",{className:"settings-badge",title:`Child of ${F}`,children:"child"}),T&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Isolated"}),!Q&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"})]}),q&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:19},children:q}),I&&e.jsxs("div",{style:{marginTop:10,paddingLeft:19,borderTop:"1px solid var(--border)",paddingTop:10},children:[s&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10},children:[e.jsxs("label",{style:{fontSize:11,display:"flex",alignItems:"center",gap:6,cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:T,onChange:()=>H(L)}),e.jsx("span",{children:"Isolated"})]}),e.jsx("span",{className:"muted",style:{fontSize:10},children:"Exclusive tag ownership, no untagged routing"})]}),e.jsx("div",{style:{fontSize:11,fontWeight:600,marginBottom:6},children:"Service Tags"}),Object.keys(A).length===0?e.jsx("div",{className:"muted",style:{fontSize:11},children:"No services registered with tags."}):e.jsxs("table",{className:"status-table",style:{fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service"}),e.jsx("th",{children:"Available Tags"}),e.jsx("th",{children:"Assigned"}),s&&e.jsx("th",{})]})}),e.jsx("tbody",{children:Object.entries(A).map(([z,v])=>{const P=x[z]||[];return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:z})}),e.jsx("td",{children:v.length===0?e.jsx("span",{className:"muted",children:"none"}):v.map(J=>e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",margin:"1px 2px",borderRadius:3,fontSize:10,background:P.includes(J)?"var(--accent-bg)":"var(--bg2)",color:P.includes(J)?"var(--accent)":"var(--muted)",border:`1px solid ${P.includes(J)?"var(--accent)":"var(--border)"}`,cursor:s?"pointer":"default"},onClick:s?()=>{const $=P.includes(J)?P.filter(U=>U!==J):[...P,J];B(w,z,$)}:void 0,title:s?P.includes(J)?"Click to remove":"Click to assign":"",children:J},J))}),e.jsx("td",{children:P.length===0?e.jsx("span",{className:"muted",children:"—"}):P.join(", ")}),s&&e.jsx("td",{children:P.length>0&&e.jsx("button",{className:"btn btn-sm btn-ghost",style:{fontSize:10,padding:"1px 6px"},onClick:()=>B(w,z,[]),disabled:y,children:"clear"})})]},z)})})]})]})]},w)})]})}function yo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState(null),[c,p]=l.useState({}),[d,u]=l.useState(!1),[b,h]=l.useState(null),N=l.useCallback(()=>ee.getRoles(t).then(f=>a(Array.isArray(f)?f:[])),[t]);l.useEffect(()=>{N()},[N]);async function R(){var f,x,m;if((f=c.name)!=null&&f.trim()){u(!0);try{o==="create"?await ee.createRole(t,c.name.trim(),((x=c.description)==null?void 0:x.trim())||null):await ee.updateRole(t,o.role.id,c.name.trim(),((m=c.description)==null?void 0:m.trim())||null),await N(),i(null)}catch(y){n(y,"error")}finally{u(!1)}}}async function A(f){if(window.confirm(`Delete role "${f.name}"?
All user assignments for this role will also be removed.`)){h(f.id);try{await ee.deleteRole(t,f.id),await N()}catch(x){n(x,"error")}finally{h(null)}}}return r?e.jsxs("div",{className:"settings-list",children:[o&&e.jsxs(ns,{title:o==="create"?"New Role":`Edit — ${o.role.name}`,onClose:()=>i(null),onSave:R,saving:d,saveLabel:o==="create"?"Create":"Save",children:[e.jsx(Ge,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.name||"",onChange:f=>p(x=>({...x,name:f.target.value})),placeholder:"e.g. APPROVER"})}),e.jsx(Ge,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,style:{resize:"vertical"},value:c.description||"",onChange:f=>p(x=>({...x,description:f.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{p({name:"",description:""}),i("create")},children:[e.jsx(Fe,{size:11,strokeWidth:2.5})," New role"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No roles yet."}),r.map(f=>e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx(gt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,fontSize:13,flex:1},children:f.name}),e.jsx("span",{className:"settings-card-id",children:f.id}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Edit role",onClick:()=>{p({name:f.name,description:f.description||""}),i({role:f})},children:e.jsx(bt,{size:11,strokeWidth:2,color:"var(--accent)"})}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Delete role",disabled:b===f.id,onClick:()=>A(f),children:e.jsx(Nt,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),f.description&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:21},children:f.description})]},f.id))]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function jo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState([]),[c,p]=l.useState([]),[d,u]=l.useState(null),[b,h]=l.useState({}),[N,R]=l.useState(!1),[A,f]=l.useState({username:"",displayName:"",email:""}),[x,m]=l.useState(!1),[y,g]=l.useState({}),[j,D]=l.useState(null),[G,H]=l.useState(null),[B,L]=l.useState(null),w=l.useCallback(()=>ee.listUsers(t).then(v=>a(Array.isArray(v)?v:[])),[t]),k=l.useCallback(async v=>{const P=await ee.getUserRoles(t,v).catch(()=>[]);h(J=>({...J,[v]:Array.isArray(P)?P:[]}))},[t]);l.useEffect(()=>{w(),ee.getRoles(t).then(v=>i(Array.isArray(v)?v:[])),ee.listProjectSpaces(t).then(v=>p(Array.isArray(v)?v:[]))},[t]);async function q(v){const P=v.id;if(d===P){u(null);return}u(P),await k(P),g(J=>{var $,U,K;return{...J,[P]:J[P]||{roleId:(($=o[0])==null?void 0:$.id)||"",spaceId:((U=c[0])==null?void 0:U.id)||((K=c[0])==null?void 0:K.ID)||""}}})}async function Q(){if(A.username.trim()){m(!0);try{await ee.createUser(t,A.username.trim(),A.displayName.trim()||null,A.email.trim()||null),await w(),R(!1),f({username:"",displayName:"",email:""})}catch(v){n(v,"error")}finally{m(!1)}}}async function T(v){if(window.confirm(`Deactivate user "${v.username}"?`))try{await ee.deactivateUser(t,v.id),await w()}catch(P){n(P,"error")}}async function F(v){const{roleId:P,spaceId:J}=y[v]||{};if(!(!P||!J)){D(v);try{await ee.assignRole(t,v,P,J),await k(v)}catch($){n($,"error")}finally{D(null)}}}async function I(v,P,J){const $=`${v}:${P}:${J}`;H($);try{await ee.removeRole(t,v,P,J),await k(v)}catch(U){n(U,"error")}finally{H(null)}}async function z(v,P){L(v.id);try{await ee.setUserAdmin(t,v.id,P),await w()}catch(J){n(J,"error")}finally{L(null)}}return r?e.jsxs("div",{className:"settings-list",children:[N&&e.jsxs(ns,{title:"New User",onClose:()=>{R(!1),f({username:"",displayName:"",email:""})},onSave:Q,saving:x,saveLabel:"Create",children:[e.jsx(Ge,{label:"Username *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:A.username,onChange:v=>f(P=>({...P,username:v.target.value})),placeholder:"e.g. john.doe"})}),e.jsx(Ge,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:A.displayName,onChange:v=>f(P=>({...P,displayName:v.target.value})),placeholder:"e.g. John Doe"})}),e.jsx(Ge,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:A.email,onChange:v=>f(P=>({...P,email:v.target.value})),placeholder:"e.g. john@company.com"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{f({username:"",displayName:"",email:""}),R(!0)},children:[e.jsx(Fe,{size:11,strokeWidth:2.5})," New user"]})}),r.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No users found."}),r.map(v=>{var K,C;const P=v.id,J=d===P,$=b[P]||[],U=v.active!==!1;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center"},onClick:()=>q(v),children:[e.jsx("span",{className:"settings-card-chevron",children:J?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(He,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(es,{size:13,color:U?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:v.username}),v.displayName&&e.jsx("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:6},children:v.displayName}),e.jsx("span",{className:"settings-card-id",children:P}),v.email&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:v.email}),!U&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"}),v.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--warn",title:"Administrator",children:"Admin"}),s&&e.jsxs("select",{className:"field-input",style:{height:22,fontSize:10,padding:"0 4px",width:"auto",marginLeft:6,flexShrink:0},value:v.isAdmin?"admin":"user",disabled:B===P,onClick:M=>M.stopPropagation(),onChange:M=>{M.stopPropagation(),z(v,M.target.value==="admin")},title:"Admin status",children:[e.jsx("option",{value:"user",children:"User"}),e.jsx("option",{value:"admin",children:"Admin"})]}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Deactivate user",style:{marginLeft:4},onClick:M=>{M.stopPropagation(),T(v)},children:e.jsx(Nt,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),J&&e.jsxs("div",{className:"settings-card-body",style:{paddingTop:10},children:[e.jsx("span",{className:"settings-sub-label",style:{display:"block",margin:"0 0 8px"},children:"Role Assignments"}),$.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No role assignments yet."}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},children:$.map(M=>{const V=`${P}:${M.id}:${M.projectSpaceId}`;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,padding:"3px 0"},children:[e.jsx(gt,{size:11,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,minWidth:80},children:M.name}),e.jsx("span",{style:{color:"var(--muted)",fontSize:11},children:"in"}),e.jsx(Mt,{size:10,color:"var(--muted)",strokeWidth:1.5}),e.jsx("span",{style:{color:"var(--fg)",fontSize:11},children:M.projectSpaceName}),e.jsx("button",{className:"panel-icon-btn",title:"Remove assignment",disabled:G===V,onClick:()=>I(P,M.id,M.projectSpaceId),children:e.jsx(xt,{size:10,strokeWidth:2.5,color:"var(--danger, #f87171)"})})]},V)})}),s&&o.length>0&&c.length>0&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,paddingTop:6,borderTop:"1px solid var(--border)"},children:[e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((K=y[P])==null?void 0:K.roleId)||"",onChange:M=>g(V=>({...V,[P]:{...V[P]||{},roleId:M.target.value}})),children:o.map(M=>e.jsx("option",{value:M.id,children:M.name},M.id))}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",flexShrink:0},children:"in"}),e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((C=y[P])==null?void 0:C.spaceId)||"",onChange:M=>g(V=>({...V,[P]:{...V[P]||{},spaceId:M.target.value}})),children:c.map(M=>e.jsx("option",{value:M.id||M.ID,children:M.name||M.NAME},M.id||M.ID))}),e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:4,flexShrink:0},disabled:j===P,onClick:()=>F(P),children:[e.jsx(Fe,{size:10,strokeWidth:2.5})," Assign"]})]})]})]},P)})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function wo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState("roles");return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid var(--border)"},children:[["roles","Roles"],["users","Users"]].map(([o,i])=>e.jsx("button",{onClick:()=>a(o),style:{background:"none",border:"none",cursor:"pointer",padding:"6px 16px",fontSize:12,fontWeight:600,color:r===o?"var(--accent)":"var(--muted)",borderBottom:r===o?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,letterSpacing:".02em"},children:i},o))}),r==="roles"?e.jsx(yo,{userId:t,canWrite:s,toast:n}):e.jsx(jo,{userId:t,canWrite:s,toast:n})]})}function ko({permissions:t,userId:s,canWrite:n,toast:r,onReload:a}){const[o,i]=l.useState(!1),[c,p]=l.useState(null),[d,u]=l.useState(!1),[b,h]=l.useState({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0});function N(){h({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0}),p("create")}function R(y){h({code:y.permissionCode,scope:y.scope,displayName:y.displayName,description:y.description||"",displayOrder:0}),p(y.permissionCode)}async function A(){u(!0);try{if(c==="create"){if(!b.code.trim()||!b.displayName.trim()){r("Code and label required","error"),u(!1);return}await ee.createPermission(s,b.code.trim().toUpperCase(),b.scope,b.displayName.trim(),b.description.trim()||null,b.displayOrder),r("Permission created")}else await ee.updatePermission(s,c,b.displayName.trim(),b.description.trim()||null,b.displayOrder),r("Permission updated");p(null),a()}catch(y){r(y,"error")}u(!1)}const f=["GLOBAL","NODE","LIFECYCLE"],x={};t.forEach(y=>{y.scope&&(x[y.scope]||(x[y.scope]=[]),x[y.scope].push(y))});const m=[...f.filter(y=>x[y]),...Object.keys(x).filter(y=>!f.includes(y)).sort()];return e.jsxs("div",{style:{marginBottom:16},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:4},onClick:()=>i(!o),children:[o?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(He,{size:13,strokeWidth:2,color:"var(--muted)"}),e.jsx(gt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontSize:13,fontWeight:700},children:"Permission Catalog"}),e.jsxs("span",{style:{fontSize:11,color:"var(--muted)"},children:["(",t.length,")"]}),n&&o&&e.jsxs("button",{className:"btn btn-sm",style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:4},onClick:y=>{y.stopPropagation(),N()},children:[e.jsx(Fe,{size:11})," Add"]})]}),o&&e.jsx("div",{style:{border:"1px solid var(--border)",borderRadius:6,overflow:"hidden",marginBottom:8},children:m.map(y=>{const g=x[y]||[];return g.length===0?null:e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--muted)",padding:"6px 10px",background:"var(--subtle-bg)",borderBottom:"1px solid var(--border)"},children:[y," scope"]}),g.map(j=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderBottom:"1px solid var(--border)",fontSize:12},children:[e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:180,fontWeight:500},children:j.permissionCode}),e.jsx("span",{style:{flex:1,color:"var(--text)"},children:j.displayName}),j.description&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:j.description}),n&&e.jsx("button",{className:"panel-icon-btn",title:"Edit",onClick:()=>R(j),style:{flexShrink:0,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(bt,{size:12})})]},j.permissionCode))]},y)})}),c&&e.jsxs(ns,{title:c==="create"?"New Permission":`Edit ${c}`,onClose:()=>p(null),onSave:A,saving:d,saveLabel:c==="create"?"Create":"Save",children:[c==="create"&&e.jsxs(e.Fragment,{children:[e.jsx(Ge,{label:"Permission Code",children:e.jsx("input",{className:"field-input",value:b.code,onChange:y=>h(g=>({...g,code:y.target.value})),placeholder:"e.g. MANAGE_EXPORTS",style:{textTransform:"uppercase",fontFamily:"monospace"}})}),e.jsx(Ge,{label:"Scope",children:e.jsx("select",{className:"field-input",value:b.scope,onChange:y=>h(g=>({...g,scope:y.target.value})),children:[...f,...Object.keys(x).filter(y=>!f.includes(y)).sort()].filter((y,g,j)=>j.indexOf(y)===g).map(y=>e.jsx("option",{value:y,children:y},y))})})]}),e.jsx(Ge,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:b.displayName,onChange:y=>h(g=>({...g,displayName:y.target.value})),placeholder:"e.g. Manage Exports"})}),e.jsx(Ge,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,value:b.description,onChange:y=>h(g=>({...g,description:y.target.value})),placeholder:"Optional description"})})]})]})}function So({scopeDef:t,allPermissions:s,roleId:n,projectSpaceId:r,userId:a,canWrite:o,toast:i}){const[c,p]=l.useState(null);l.useEffect(()=>{ee.getGrantsForRoleAndScope(a,n,t.code).then(f=>{const x=(t.keys||[]).find(g=>{var j;return((j=g.values)==null?void 0:j.length)>0}),m=x==null?void 0:x.name,y=new Set((Array.isArray(f)?f:[]).map(g=>{var j;return`${g.permission_code}|${(j=g.keys)==null?void 0:j[m]}`}));p(y)}).catch(()=>p(new Set))},[n,t.code,a]);const d=(t.keys||[]).find(f=>{var x;return((x=f.values)==null?void 0:x.length)>0});if(!d)return null;const{name:u,values:b}=d,h=(s||[]).filter(f=>f.scope===t.code);if(h.length===0||b.length===0)return null;async function N(f,x){if(!o)return;const m=`${f}|${x}`,y=c==null?void 0:c.has(m);p(g=>{const j=new Set(g);return y?j.delete(m):j.add(m),j});try{const g={permissionCode:f,scopeCode:t.code,roleId:n,projectSpaceId:r,keys:{[u]:x}};y?await ee.removeScopedGrant(a,g):await ee.addScopedGrant(a,g)}catch(g){p(j=>{const D=new Set(j);return y?D.add(m):D.delete(m),D}),i(g,"error")}}const R=e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}),A=e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})});return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[t.code," Permissions"]}),t.description&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:t.description}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)"},children:e.jsx("code",{children:u})}),h.map(f=>e.jsx("th",{style:{textAlign:"center",padding:"4px 8px",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)",minWidth:80},children:e.jsx("code",{style:{color:"var(--accent)",fontSize:10},children:f.permissionCode})},f.permissionCode))]})}),e.jsx("tbody",{children:b.map(f=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 8px 4px 0"},children:e.jsx("code",{style:{color:"var(--text)"},children:f.label})}),h.map(x=>{const m=c===null,y=!m&&c.has(`${x.permissionCode}|${f.id}`);return e.jsx("td",{style:{textAlign:"center",padding:"4px 8px"},children:e.jsx("button",{className:"panel-icon-btn",disabled:m||!o,title:o?y?"Revoke from this role":"Grant to this role":"Requires MANAGE_ROLES",onClick:()=>N(x.permissionCode,f.id),style:{width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:m?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):y?R:A})},x.permissionCode)})]},f.id))})]})]})}function No({userId:t,projectSpaceId:s,canWrite:n,toast:r}){const[a,o]=l.useState(null),[i,c]=l.useState([]),[p,d]=l.useState([]),[u,b]=l.useState([]),[h,N]=l.useState(null),[R,A]=l.useState({}),[f,x]=l.useState({}),[m,y]=l.useState(null);l.useEffect(()=>{Promise.all([ee.getRoles(t),ee.listPermissions(t),ee.getNodeTypes(t),ee.getLifecycles(t)]).then(async([T,F,I,z])=>{o(Array.isArray(T)?T:[]);const v=(Array.isArray(F)?F:[]).map($=>({...$,permissionCode:$.permissionCode||$.permission_code,displayName:$.displayName||$.display_name,displayOrder:$.displayOrder??$.display_order}));c(v),d(Array.isArray(I)?I:[]);const P=Array.isArray(z)?z:[],J=[];await Promise.all(P.map(async $=>{const U=$.id||$.ID,K=await ee.getLifecycleTransitions(t,U).catch(()=>[]);(Array.isArray(K)?K:[]).forEach(C=>{const M=C.from_state_name||C.fromStateName||"",V=C.name||C.NAME||C.id;J.push({id:C.id||C.ID,label:M?`${M} → ${V}`:V,lifecycleId:U})})})),b(J)}).catch(()=>{o([])}),ee.getAccessRightsTree(t,s).then(y).catch(()=>y({scopes:[]}))},[t,s]);async function g(){const T=await ee.listPermissions(t).catch(()=>[]),F=(Array.isArray(T)?T:[]).map(I=>({...I,permissionCode:I.permissionCode||I.permission_code,displayName:I.displayName||I.display_name,displayOrder:I.displayOrder??I.display_order}));c(F)}const j=i.filter(T=>T.scope==="GLOBAL"),D=i.filter(T=>T.scope==="NODE"),G=i.filter(T=>T.scope==="LIFECYCLE"),H=Object.fromEntries(((m==null?void 0:m.scopes)||[]).filter(T=>{var F;return(F=T.keys)==null?void 0:F.some(I=>{var z;return((z=I.values)==null?void 0:z.length)>0})}).map(T=>[T.code,T])),B=new Set(["GLOBAL","NODE","LIFECYCLE",...Object.keys(H)]),L=[...new Set(i.map(T=>T.scope).filter(T=>T&&!B.has(T)))],w=T=>i.filter(F=>F.scope===T);async function k(T){if(h===T){N(null);return}if(N(T),R[T]===void 0){const I=await ee.getRoleGlobalPermissions(t,T).catch(()=>[]),z=new Set((Array.isArray(I)?I:[]).map(v=>v.permissionCode||v.permission_code));A(v=>({...v,[T]:z}))}const F=L.filter(I=>!H[I]);if(F.length>0&&!f[T]){const I=await Promise.all(F.map(async z=>{const v=await ee.getRoleScopePermissions(t,T,z).catch(()=>[]),P=new Set((Array.isArray(v)?v:[]).map(J=>J.permissionCode||J.permission_code));return[z,P]}));x(z=>({...z,[T]:Object.fromEntries(I)}))}}async function q(T,F){if(!n)return;const I=(R[T]||new Set).has(F);A(z=>{const v=new Set(z[T]||[]);return I?v.delete(F):v.add(F),{...z,[T]:v}});try{I?await ee.removeRoleGlobalPermission(t,T,F):await ee.addRoleGlobalPermission(t,T,F)}catch(z){A(v=>{const P=new Set(v[T]||[]);return I?P.add(F):P.delete(F),{...v,[T]:P}}),r(z,"error")}}async function Q(T,F,I){if(!n)return;const z=f[T]&&f[T][F]||new Set,v=z.has(I),P=new Set(z);v?P.delete(I):P.add(I),x(J=>({...J,[T]:{...J[T]||{},[F]:P}}));try{v?await ee.removeRoleScopePermission(t,T,F,I):await ee.addRoleScopePermission(t,T,F,I)}catch(J){x($=>({...$,[T]:{...$[T]||{},[F]:z}})),r(J,"error")}}return a===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):a.length===0?e.jsx("div",{className:"settings-empty-row",children:"No roles defined. Create roles first in Users & Roles."}):e.jsxs("div",{className:"settings-list",children:[!n&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_ROLES"})]}),e.jsx(ko,{permissions:i,userId:t,canWrite:n,toast:r,onReload:g}),e.jsx("div",{className:"settings-sub-label",style:{marginBottom:6},children:"Role Grants"}),a.map(T=>{const F=h===T.id,I=R[T.id];return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>k(T.id),style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:F?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(He,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(gt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:T.name}),e.jsx("span",{className:"settings-card-id",children:T.id}),T.description&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:T.description})]}),F&&e.jsxs("div",{className:"settings-card-body",children:[j.length>0&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("div",{className:"settings-sub-label",children:"Global Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role-only check — no node type context."}),j.map(z=>{const v=I===void 0,P=!v&&I.has(z.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:v||!n,title:n?P?`Revoke from ${T.name}`:`Grant to ${T.name}`:"Requires MANAGE_ROLES",onClick:()=>q(T.id,z.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:v?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):P?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:z.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:z.displayName})]},z.permissionCode)})]}),L.map(z=>{const v=w(z);if(v.length===0)return null;const P=f[T.id]&&f[T.id][z];return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[z," Permissions"]}),e.jsxs("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:["Role-only check — scope ",z," has no key context."]}),v.map(J=>{const $=P===void 0,U=!$&&P.has(J.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:$||!n,title:n?U?`Revoke from ${T.name}`:`Grant to ${T.name}`:"Requires MANAGE_ROLES",onClick:()=>Q(T.id,z,J.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:$?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):U?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:J.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:J.displayName})]},J.permissionCode)})]},z)}),Object.values(H).map(z=>w(z.code).length>0?e.jsx(So,{scopeDef:z,allPermissions:i,roleId:T.id,projectSpaceId:s,userId:t,canWrite:n,toast:r},z.code):null),(D.length>0||G.length>0)&&e.jsx(bo,{userId:t,roleId:T.id,canWrite:n,toast:r,nodePerms:D,lcPerms:G,nodeTypes:p,transitions:u})]})]},T.id)})]})}function Co({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState([]),[o,i]=l.useState(null),[c,p]=l.useState(!1),[d,u]=l.useState(""),[b,h]=l.useState(!1),N=["pno","platform","spe"];async function R(){try{const[m,y]=await Promise.all([mt.getEnvironment(),mt.getStatus()]);a(m.expectedServices||[]),i(y)}catch(m){n((m==null?void 0:m.message)||String(m),"error")}}l.useEffect(()=>{R()},[]);const A={};((o==null?void 0:o.services)||[]).forEach(m=>{A[m.serviceCode]=m});async function f(){const m=d.trim();if(m){h(!0);try{await mt.addExpectedService(m),u(""),p(!1),n("Service added","success"),R()}catch(y){n((y==null?void 0:y.message)||String(y),"error")}finally{h(!1)}}}async function x(m){if(window.confirm(`Remove expected service '${m}'?`)){h(!0);try{const y=await mt.removeExpectedService(m);y!=null&&y.baseline?n("Cannot remove baseline service","error"):n("Service removed","success"),R()}catch(y){n((y==null?void 0:y.message)||String(y),"error")}finally{h(!1)}}}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Expected Services"}),e.jsx("span",{style:{fontSize:12,color:"var(--muted2)"},children:"Services the platform expects to be running"}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!c&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>p(!0),children:[e.jsx(Fe,{size:11,strokeWidth:2}),"Add service"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only access"}),c&&e.jsx("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",placeholder:"Service code (e.g. my-service)",value:d,onChange:m=>u(m.target.value),onKeyDown:m=>m.key==="Enter"&&f(),style:{flex:1,maxWidth:300},autoFocus:!0}),e.jsx("button",{className:"btn btn-primary btn-xs",onClick:f,disabled:b,children:"Add"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{p(!1),u("")},children:"Cancel"})]})}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service Code"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Instances"}),e.jsx("th",{children:"Version"}),e.jsx("th",{style:{width:80}})]})}),e.jsxs("tbody",{children:[r.map(m=>{const y=A[m],g=N.includes(m),j=(y==null?void 0:y.status)||"missing",D={up:"#4dd4a0",degraded:"#f0b429",down:"#fc8181",missing:"#6b8099"},G=D[j]||D.missing;return e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("code",{style:{fontSize:12},children:m}),g&&e.jsx("span",{className:"settings-badge",style:{marginLeft:8,fontSize:10},children:"baseline"})]}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot",style:{marginRight:6,background:G,boxShadow:`0 0 6px ${G}`}}),j]}),e.jsx("td",{children:y?`${y.healthyInstances??0}/${y.instanceCount??0}`:"–"}),e.jsx("td",{style:{fontFamily:"var(--mono)",fontSize:11},children:(y==null?void 0:y.version)||"–"}),e.jsx("td",{children:s&&!g&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>x(m),disabled:b,children:"Remove"})})]},m)}),r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{textAlign:"center",color:"var(--muted)",padding:24},children:"No expected services configured (dynamic discovery mode)"})})]})]})]})}function Eo({userId:t,canWrite:s,toast:n}){const[r,a]=l.useState(null),[o,i]=l.useState({}),[c,p]=l.useState({}),[d,u]=l.useState(null),[b,h]=l.useState(!1);async function N(){try{const g=await ee.listSecrets(t);a(Array.isArray(g)?g.map(j=>j.key).sort():[])}catch(g){n((g==null?void 0:g.message)||String(g),"error"),a([])}}l.useEffect(()=>{N()},[t]);async function R(g){if(o[g]!==void 0){i(j=>{const D={...j};return delete D[g],D});return}i(j=>({...j,[g]:null}));try{const j=await ee.revealSecret(t,g);i(D=>({...D,[g]:(j==null?void 0:j.value)??""}))}catch(j){n((j==null?void 0:j.message)||String(j),"error"),i(D=>{const G={...D};return delete G[g],G})}}function A(g){p(j=>({...j,[g]:o[g]??""}))}function f(g){p(j=>{const D={...j};return delete D[g],D})}async function x(g){h(!0);try{await ee.updateSecret(t,g,c[g]),n(`Updated '${g}'`,"success"),f(g),o[g]!==void 0&&i(j=>({...j,[g]:c[g]}))}catch(j){n((j==null?void 0:j.message)||String(j),"error")}finally{h(!1)}}async function m(g){if(window.confirm(`Delete secret '${g}'? This cannot be undone.`)){h(!0);try{await ee.deleteSecret(t,g),n(`Deleted '${g}'`,"success"),i(j=>{const D={...j};return delete D[g],D}),N()}catch(j){n((j==null?void 0:j.message)||String(j),"error")}finally{h(!1)}}}async function y(){var g;if(!((g=d==null?void 0:d.key)!=null&&g.trim())){n("Key required","error");return}h(!0);try{await ee.createSecret(t,d.key.trim(),d.value??""),n(`Created '${d.key}'`,"success"),u(null),N()}catch(j){const D=((j==null?void 0:j.message)||String(j)).includes("409")?"Key already exists":(j==null?void 0:j.message)||String(j);n(D,"error")}finally{h(!1)}}return r===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Secrets"}),e.jsxs("span",{style:{fontSize:12,color:"var(--muted2)"},children:["Vault path: ",e.jsx("code",{children:"secret/plm"})]}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!d&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>u({key:"",value:""}),children:[e.jsx(Fe,{size:11,strokeWidth:2}),"Add secret"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only — MANAGE_SECRETS not granted to your role."}),d&&e.jsxs("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:8},children:[e.jsx("input",{className:"field-input",placeholder:"key (e.g. plm.s3.access-key)",value:d.key,onChange:g=>u(j=>({...j,key:g.target.value})),style:{flex:1}}),e.jsx("input",{className:"field-input",placeholder:"value",value:d.value,onChange:g=>u(j=>({...j,value:g.target.value})),style:{flex:2}})]}),e.jsxs("div",{style:{display:"flex",gap:6,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>u(null),disabled:b,children:"Cancel"}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:y,disabled:b,children:"Create"})]})]}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"40%"},children:"Key"}),e.jsx("th",{children:"Value"}),e.jsx("th",{style:{width:220,textAlign:"right"},children:"Actions"})]})}),e.jsxs("tbody",{children:[r.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:3,style:{color:"var(--muted2)"},children:"No secrets yet."})}),r.map(g=>{const j=o[g],D=c[g]!==void 0,G=j!==void 0;return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:g})}),e.jsx("td",{children:D?e.jsx("input",{className:"field-input",value:c[g],onChange:H=>p(B=>({...B,[g]:H.target.value})),style:{width:"100%"},autoFocus:!0}):G?j===null?e.jsx("span",{style:{color:"var(--muted2)"},children:"loading…"}):e.jsx("code",{children:j}):e.jsx("span",{style:{letterSpacing:2,color:"var(--muted2)"},children:"••••••••"})}),e.jsx("td",{style:{textAlign:"right"},children:e.jsx("div",{style:{display:"inline-flex",gap:6,justifyContent:"flex-end"},children:D?e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>x(g),disabled:b,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>f(g),disabled:b,children:"Cancel"})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>R(g),title:G?"Hide value":"Reveal value",children:G?"Hide":"Reveal"}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn btn-xs",style:{display:"inline-flex",alignItems:"center",gap:4},onClick:()=>A(g),disabled:!G,title:G?"Edit value":"Reveal first to edit",children:[e.jsx(bt,{size:10,strokeWidth:2}),"Edit"]}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>m(g),disabled:b,title:"Delete secret",children:e.jsx(Nt,{size:10,strokeWidth:2})})]})]})})})]},g)})]})]})]})}function To({userId:t,toast:s}){const[n,r]=l.useState(null),[a,o]=l.useState(null),[i,c]=l.useState(null),[p,d]=l.useState(null),[u,b]=l.useState(null);async function h(){try{const[m,y,g,j]=await Promise.all([ee.getRegistryGrouped(t).catch(()=>({})),ee.getRegistryTagsAdmin(t).catch(()=>null),ee.getRegistryOverview(t).catch(()=>null),ee.getUiManifest().catch(()=>null)]);r(m),o(y),c(g),b(j),d(null)}catch(m){d(m.message||String(m))}}if(l.useEffect(()=>{h();const m=setInterval(h,5e3);return()=>clearInterval(m)},[]),p)return e.jsxs("div",{className:"settings-empty-row",children:["Failed to load registry: ",p]});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const N=Object.keys(n).sort(),R=m=>{if(!m)return null;const y=Date.now()-new Date(m).getTime();return Math.max(0,Math.round(y/1e3))},A=m=>m==null?"—":m<60?`${m}s`:m<3600?`${Math.round(m/60)}m`:`${Math.round(m/3600)}h`,f=(i==null?void 0:i.services)||{},x=(i==null?void 0:i.settingsRegistrations)||[];return e.jsxs("div",{className:"settings-list",children:[e.jsx("div",{className:"settings-sub-label",children:"Platform Federation"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Per-service summary as seen by platform-api (",(i==null?void 0:i.self)||"platform","). Settings tabs registered, live item contributions probed via ","/internal/items/visible",". Refreshes every 5s."]}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instances"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Settings tabs"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Items"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Creatable"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Listable"})]})}),e.jsxs("tbody",{children:[Object.keys(f).sort().map(m=>{const y=f[m]||{};return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m}),e.jsx("td",{style:{padding:"4px 6px"},children:y.instances??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.settingsSections??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.itemDescriptors??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.creatableItems??0}),e.jsx("td",{style:{padding:"4px 6px"},children:y.listableItems??0})]},m)}),Object.keys(f).length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:6,style:{padding:"4px 6px",color:"var(--muted2)"},children:"No services known."})})]})]}),x.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",children:"Settings Registrations"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"Sections actively registered by each service against this platform-api."}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Sections"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Registered at"})]})}),e.jsx("tbody",{children:x.map(m=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.instanceId}),e.jsx("td",{style:{padding:"4px 6px"},children:(m.sections||[]).map(y=>y.key).join(", ")||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:m.registeredAt||"—"})]},m.serviceCode+":"+m.instanceId))})]})]}),e.jsx("div",{className:"settings-sub-label",children:"UI Plugin Registrations"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:["Plugin bundles declared by each service and loaded by the shell at boot. Source: ",e.jsx("code",{style:{fontSize:11},children:"/api/platform/ui/manifest"}),"."]}),u==null?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"Manifest unavailable."}):u.length===0?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"No UI plugins declared."}):e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Plugin ID"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Zone"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Bundle URL"})]})}),e.jsx("tbody",{children:u.map(m=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:m.pluginId}),e.jsx("td",{style:{padding:"4px 6px"},children:e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)"},children:m.zone})}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace",color:"var(--muted2)"},children:m.url})]},m.pluginId))})]}),e.jsx("div",{className:"settings-sub-label",children:"Registered Services (platform-api)"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Live snapshot from platform-api environment registry. ",N.length," service",N.length===1?"":"s"," known."]}),N.length===0?e.jsx("div",{className:"settings-empty-row",children:"No services registered."}):N.map(m=>{const y=n[m]||[],g=y.filter(j=>j.healthy).length;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{className:"settings-card-name",style:{fontFamily:"monospace"},children:m}),e.jsxs("span",{style:{fontSize:10,color:g===y.length?"var(--success)":"var(--warn)"},children:[g,"/",y.length," healthy"]})]}),e.jsx("div",{className:"settings-card-body",children:e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Base URL"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Version"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Tag"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Health"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Last HB"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Failures"})]})}),e.jsx("tbody",{children:y.map(j=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:j.instanceId}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:j.baseUrl}),e.jsx("td",{style:{padding:"4px 6px"},children:j.version||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:j.spaceTag||"—"}),e.jsx("td",{style:{padding:"4px 6px",color:j.healthy?"var(--success)":"var(--danger, #e05252)"},children:j.healthy?"OK":"DOWN"}),e.jsx("td",{style:{padding:"4px 6px"},children:A(R(j.lastHeartbeatOk))}),e.jsx("td",{style:{padding:"4px 6px"},children:j.consecutiveFailures??0})]},j.instanceId))})]})})]},m)}),a&&Object.keys(a).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",style:{marginTop:16},children:"Project Space Tags"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Service ↔ space-tag affinity (used by gateway routing)."}),e.jsx("pre",{style:{fontSize:11,background:"var(--bg2)",padding:8,borderRadius:4},children:JSON.stringify(a,null,2)})]})]})}function zo({sectionKey:t,userId:s,projectSpaceId:n,canWrite:r,toast:a,pluginsLoaded:o}){if(t===null)return e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading…"});const c=Qa(t)??Ja(t);if(!c)return o?e.jsxs("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:["Unknown section: ",t]}):e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading plugins…"});const{Component:p,wrapBody:d}=c,u=e.jsx(p,{userId:s,projectSpaceId:n,canWrite:r,toast:a});return d?e.jsx("div",{className:"settings-content-body",children:u}):u}function Io({userId:t,projectSpaceId:s,activeSection:n,onSectionChange:r,settingsSections:a,pluginsLoaded:o,toast:i}){const c=l.useMemo(()=>{const d={};return(a||[]).forEach(u=>u.sections.forEach(b=>{d[b.key]=b.canWrite})),d},[a]),p=l.useMemo(()=>{if(!a)return n;for(const d of a){const u=d.sections.find(b=>b.key===n);if(u)return u.label}return n},[a,n]);return e.jsxs("div",{className:"settings-content",children:[e.jsx("div",{className:"settings-content-hd",children:e.jsx("span",{className:"settings-content-title",children:p})}),e.jsx(zo,{sectionKey:n,userId:t,projectSpaceId:s,canWrite:c[n]??!1,pluginsLoaded:o,toast:i})]})}Xe("my-profile",xo);Xe("api-playground",Ga,{wrapBody:!1});Xe("user-manual",Va,{wrapBody:!1});Xe("proj-spaces",vo);Xe("users-roles",wo);Xe("access-rights",No);Xe("secrets",Eo);Xe("service-registry",To);Xe("platform-environment",Co);Xe("actions-catalog",eo);Xe("platform-algorithms",oo);Xe("search-index",mo);class ps extends We.Component{constructor(s){super(s),this.state={hasError:!1,error:null}}static getDerivedStateFromError(s){return{hasError:!0,error:s}}componentDidCatch(s,n){console.error("ErrorBoundary caught:",s,n)}render(){var s;return this.state.hasError?this.props.fallback||e.jsxs("div",{style:{padding:24,color:"#e74c3c"},children:[e.jsx("strong",{children:"Something went wrong."}),e.jsx("pre",{style:{fontSize:12,marginTop:8},children:(s=this.state.error)==null?void 0:s.message})]}):this.props.children}}const Qs={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function Ao({userId:t,serviceCode:s,txId:n,txNodes:r,stateColorMap:a,onCommitted:o,onClose:i,toast:c}){const[p,d]=l.useState(""),[u,b]=l.useState(!1),h=(r||[]).map(m=>m.itemId||m.node_id||m.NODE_ID),[N,R]=l.useState(()=>new Set(h));function A(m){R(y=>{const g=new Set(y);return g.has(m)?g.delete(m):g.add(m),g})}function f(){R(N.size===h.length?new Set:new Set(h))}async function x(){if(!p.trim()){c("Commit comment is required","warn");return}if(N.size===0){c("Select at least one object to commit","warn");return}b(!0);try{const m=N.size===h.length?null:[...N],y=await ht.commit(t,s,n,p,m),g=(y==null?void 0:y.continuationTxId)||null,j=h.length-N.size;c("Transaction committed","success"),o(g,j),i()}catch(m){c(m,"error")}finally{b(!1)}}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true","aria-labelledby":"commit-title",children:e.jsxs("div",{className:"card commit-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",id:"commit-title",children:"Commit transaction"}),e.jsx("button",{className:"btn btn-sm",onClick:i,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:"commit-comment",children:["Commit comment ",e.jsx("span",{className:"field-req","aria-label":"required",children:"*"})]}),e.jsx("input",{id:"commit-comment",className:"field-input",placeholder:"Describe what you changed…",value:p,onChange:m=>d(m.target.value),autoFocus:!0})]}),(r==null?void 0:r.length)>0&&e.jsxs("div",{className:"commit-node-list",children:[e.jsx("div",{className:"commit-node-list-hd",children:e.jsxs("label",{className:"commit-node-all",children:[e.jsx("input",{type:"checkbox",checked:N.size===h.length,onChange:f}),e.jsx("span",{children:"Objects to commit"}),e.jsxs("span",{className:"commit-node-count",children:[N.size,"/",h.length]})]})}),e.jsx("div",{className:"commit-node-list-scroll",children:r.map(m=>{const y=m.itemId||m.node_id||m.NODE_ID,g=m.logicalId||m.logical_id||m.LOGICAL_ID||y,j=m.nodeTypeName||m.node_type_name||m.NODE_TYPE_NAME||"",D=m.revision||m.REVISION||"A",G=m.iteration??m.ITERATION??1,H=(m.changeType||m.change_type||m.CHANGE_TYPE||"CONTENT").toUpperCase(),B=m.lifecycleStateId||m.lifecycle_state_id||m.LIFECYCLE_STATE_ID||"",L=Qs[H]||Qs.CONTENT;return e.jsxs("label",{className:"commit-node-item",children:[e.jsx("input",{type:"checkbox",checked:N.has(y),onChange:()=>A(y)}),e.jsx("span",{className:"commit-node-dot",style:{background:(a==null?void 0:a[B])||"#6b7280"}}),e.jsx("span",{className:"commit-node-lid",children:g}),e.jsx("span",{className:"commit-node-rev",children:G===0?D:`${D}.${G}`}),e.jsx("span",{className:"commit-node-type",children:j}),e.jsx("span",{className:"commit-node-badge",style:{background:L.bg,color:L.color},children:L.label})]},y)})})]}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:14},children:"Committed objects become visible to everyone. Uncommitted objects stay in a new transaction."}),e.jsxs("div",{className:"row flex-end",style:{gap:8},children:[e.jsx("button",{className:"btn",onClick:i,children:"Cancel"}),e.jsx("button",{className:"btn btn-success",onClick:x,disabled:u||!p.trim()||N.size===0,children:u?"Committing…":"✓ Commit"})]})]})]})})}function $o({resources:t,onCreated:s,onClose:n,toast:r,initialDescriptor:a}){const o=l.useMemo(()=>{const B=new Set,L=[];for(const w of t||[]){const k=w.sourceLabel||"OTHER";B.has(k)||(B.add(k),L.push(k))}return L},[t]),[i,c]=l.useState((a==null?void 0:a.sourceLabel)||o[0]||""),p=l.useMemo(()=>(t||[]).filter(B=>(B.sourceLabel||"OTHER")===i),[t,i]),[d,u]=l.useState(()=>a?(t||[]).find(B=>B.serviceCode===a.serviceCode&&B.itemCode===a.itemCode)||null:p[0]||null);l.useEffect(()=>{a||u(p[0]||null)},[i]);const[b,h]=l.useState({}),[N,R]=l.useState({}),[A,f]=l.useState(!1);if(l.useEffect(()=>{h({}),R({})},[d]),!d)return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsx("div",{className:"modal-scroll",style:{padding:24,color:"var(--muted)"},children:"No creatable resources available."})]})});const x=d.create,m=((x==null?void 0:x.parameters)||[]).slice().sort((B,L)=>(B.displayOrder||0)-(L.displayOrder||0)),y=[];let g=null;for(const B of m){const L=B.displaySection||"Fields";(y.length===0||L!==g)&&(y.push({section:L,items:[]}),g=L),y[y.length-1].items.push(B)}function j(B,L){h(w=>({...w,[B]:L})),R(w=>({...w,[B]:null}))}function D(){const B={};for(const L of m){const w=b[L.name];if(L.required&&(w==null||w===""||w instanceof File&&w.size===0)&&(B[L.name]="Required"),L.validationRegex&&typeof w=="string"&&w.trim())try{new RegExp(`^(?:${L.validationRegex})$`).test(w.trim())||(B[L.name]=`Does not match pattern: ${L.validationRegex}`)}catch{}}return R(B),Object.keys(B).length===0}async function G(){if(D()){f(!0);try{const B=await ee.createResource(d,b);r(`${d.displayName||d.itemCode} created`,"success"),s==null||s(B,d),n()}catch(B){r(B,"error")}finally{f(!1)}}}function H(B){const L=(B.widgetType||"TEXT").toUpperCase(),w=N[B.name],k=b[B.name];if(L==="FILE")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("input",{id:`f-${B.name}`,type:"file",className:`field-input${w?" error":""}`,onChange:F=>{var I;return j(B.name,((I=F.target.files)==null?void 0:I[0])||null)}}),B.tooltip&&e.jsx("span",{className:"field-hint",children:B.tooltip}),w&&e.jsx("span",{className:"field-hint error",role:"alert",children:w})]},B.name);if(L==="TEXTAREA")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("textarea",{id:`f-${B.name}`,className:`field-input${w?" error":""}`,placeholder:B.tooltip||"",value:k||"",onChange:F=>j(B.name,F.target.value)}),w&&e.jsx("span",{className:"field-hint error",role:"alert",children:w})]},B.name);if(L==="DROPDOWN"||L==="SELECT"){const F=B.allowedValues?Po(B.allowedValues):[];return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("select",{id:`f-${B.name}`,className:`field-input${w?" error":""}`,value:k||"",onChange:I=>j(B.name,I.target.value),children:[e.jsx("option",{value:"",children:"— select —"}),F.map(I=>e.jsx("option",{children:I},I))]}),w&&e.jsx("span",{className:"field-hint error",role:"alert",children:w})]},B.name)}const q=(k||"").toString().trim(),Q=B.validationRegex?Ro(`^(?:${B.validationRegex})$`):null,T=!Q||!q?null:Q.test(q);return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${B.name}`,children:[B.label,B.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("div",{className:"logical-id-wrap",children:[e.jsx("input",{id:`f-${B.name}`,type:L==="NUMBER"?"number":"text",className:`field-input${w?" error":T===!0?" ok":T===!1?" error":""}`,placeholder:B.tooltip||(B.validationRegex?`pattern: ${B.validationRegex}`:""),value:k||"",onChange:F=>j(B.name,F.target.value)}),q&&Q&&e.jsx("span",{className:`logical-id-badge ${T?"ok":"err"}`,children:T?"✓":"✗"})]}),B.validationRegex&&e.jsxs("div",{className:"logical-id-hint",children:[e.jsx("span",{className:"logical-id-hint-label",children:"Pattern"}),e.jsx("code",{className:"logical-id-hint-code",children:B.validationRegex}),!q&&e.jsx("span",{className:"logical-id-hint-idle",children:"start typing to validate"}),q&&T===!1&&e.jsx("span",{className:"logical-id-hint-err",children:"no match"}),q&&T===!0&&e.jsx("span",{className:"logical-id-hint-ok",children:"matches"})]}),!B.validationRegex&&B.tooltip&&e.jsx("span",{className:"field-hint",children:B.tooltip}),w&&e.jsx("span",{className:"field-hint error",role:"alert",children:w})]},B.name)}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"modal-scroll",children:[e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsxs("div",{className:"field",style:{margin:0,flex:"0 0 180px"},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-source",children:"Source"}),e.jsx("select",{id:"rc-source",className:"field-input",value:i,onChange:B=>c(B.target.value),disabled:!!a,children:o.map(B=>e.jsx("option",{value:B,children:B},B))})]}),e.jsxs("div",{className:"field",style:{margin:0,flex:1},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-type",children:"Type"}),e.jsx("select",{id:"rc-type",className:"field-input",value:d?`${d.serviceCode}/${d.itemCode}`:"",onChange:B=>{const L=B.target.value,w=p.find(k=>`${k.serviceCode}/${k.itemCode}`===L);w&&u(w)},disabled:!!a,children:p.map(B=>{const L=`${B.serviceCode}/${B.itemCode}`;return e.jsx("option",{value:L,children:B.displayName},L)})})]})]}),d.description&&e.jsx("div",{style:{padding:"12px 0 0",color:"var(--muted)",fontSize:12},children:d.description}),y.map((B,L)=>e.jsxs(We.Fragment,{children:[e.jsx("div",{className:"modal-identity-sep",style:{marginTop:L===0?16:18},children:e.jsx("span",{children:B.section})}),B.items.map(w=>H(w))]},`grp-${L}-${B.section}`))]}),e.jsx("div",{className:"card-hd",style:{borderTop:"1px solid var(--border)",borderBottom:"none"},children:e.jsxs("div",{className:"row flex-end",style:{width:"100%",gap:8},children:[e.jsx("button",{className:"btn",onClick:n,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:G,disabled:A,children:A?"Creating…":"Create"})]})})]})})}function Ro(t){try{return new RegExp(t)}catch{return null}}function Po(t){try{return JSON.parse(t)}catch{return[]}}function Lo({detail:t,onClose:s}){var a;const n=t.category==="TECHNICAL",r=n&&Array.isArray(t.stackTrace)?t.stackTrace.join(`
`):null;return e.jsx("div",{className:"overlay",onClick:s,role:"dialog","aria-modal":"true","aria-label":"Error detail",children:e.jsxs("div",{className:`card ${n?"err-card-tech":"err-card-func"}`,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",style:{color:n?"var(--danger)":"var(--warn)"},children:n?"✗ Unexpected error":"⚠ Error"}),e.jsx("button",{className:"btn btn-sm",onClick:s,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:`card-body ${n?"err-body":""}`,children:[e.jsx("div",{className:"err-message",children:t.error}),((a=t.violations)==null?void 0:a.length)>0&&e.jsx("ul",{className:"violations-list",children:t.violations.map((o,i)=>e.jsx("li",{className:"violation-item",children:typeof o=="string"?o:o.message},i))}),n&&t.type&&e.jsx("div",{className:"err-meta",children:t.type}),t.path&&e.jsx("div",{className:"err-meta",children:t.path}),r&&e.jsx("pre",{className:"stack-trace",children:r})]})]})})}const Kt=new Map;function Bo({serviceCode:t,itemCode:s,itemKey:n}){return`${t}:${s}:${n??""}`}function Mo({serviceCode:t,itemCode:s,itemKey:n}){return`/api/${t}/item-type/${encodeURIComponent(n??s)}`}async function Oo(t){if(!(t!=null&&t.serviceCode))return null;const s=Bo(t);if(Kt.has(s))return Kt.get(s);try{const n=await ee.gatewayJson("GET",Mo(t));return Kt.set(s,n),n}catch{return null}}function Do(){Kt.clear()}const ys=new Map;let Gn=null;function js(t,s,n){ys.set(s?`${t}:${s}`:`${t}:`,n)}function _o(t){Gn=t}function en(t,s){return ys.get(`${t}:${s}`)??ys.get(`${t}:`)??Gn}function Wo(t){const s=t.value;if(s==null||s==="")return e.jsx("span",{style:{color:"var(--muted2)"},children:"—"});switch(t.widget){case"datetime":{try{const n=new Date(s);if(!isNaN(n.getTime()))return n.toLocaleString()}catch{}return String(s)}case"code":return e.jsx("code",{style:{fontSize:10,wordBreak:"break-all"},children:String(s)});case"number":return e.jsx("span",{style:{fontFamily:"var(--mono)"},children:Number(s).toLocaleString()});case"link":return e.jsx("a",{href:String(s),target:"_blank",rel:"noreferrer",children:String(s)});case"badge":return e.jsx("span",{className:"settings-badge",children:String(s)});case"image":return e.jsx("img",{src:String(s),alt:t.label,style:{maxWidth:"100%",maxHeight:240}});case"multiline":return e.jsx("pre",{style:{margin:0,whiteSpace:"pre-wrap",fontSize:12},children:String(s)});default:return String(s)}}function Hn({tab:t,ctx:s,descriptorOverride:n}){var v,P,J,$,U,K;const{userId:r,toast:a}=s||{},o=n||t.get||{},i=o.path,c=(o.httpMethod||"GET").toUpperCase(),p=(n==null?void 0:n.serviceCode)||t.serviceCode,d=p?`/api/${p}`:"",[u,b]=l.useState(null),[h,N]=l.useState(null),[R,A]=l.useState(null),[f,x]=l.useState(!0),[m,y]=l.useState(null),[g,j]=l.useState(null),[D,G]=l.useState(!1),[H,B]=l.useState(!1),[L,w]=l.useState(null),k=l.useCallback(async()=>{if(!i||!t.nodeId){A("No get action declared for this source"),x(!1);return}x(!0),A(null);try{const C=d+i.replace("{id}",encodeURIComponent(t.nodeId)),M=await ee.gatewayJson(c,C);b(M)}catch(C){A((C==null?void 0:C.message)||String(C))}finally{x(!1)}},[i,c,t.nodeId,d]);l.useEffect(()=>{k()},[k]),l.useEffect(()=>{u!=null&&u.itemType&&Oo(u.itemType).then(N).catch(()=>N(null))},[(v=u==null?void 0:u.itemType)==null?void 0:v.serviceCode,(P=u==null?void 0:u.itemType)==null?void 0:P.itemCode,(J=u==null?void 0:u.itemType)==null?void 0:J.itemKey]),l.useEffect(()=>{var V;const C=(V=u==null?void 0:u.metadata)==null?void 0:V.downloadUrl;if(!C){j(null),B(!1),w(null);return}let M=!1;return G(!0),ee.gatewayRawText(C).then(({text:W,truncated:Y,totalBytes:oe})=>{M||(j(W),B(Y),w(oe),G(!1))}).catch(()=>{M||(j(null),G(!1))}),()=>{M=!0}},[($=u==null?void 0:u.metadata)==null?void 0:$.downloadUrl]),l.useEffect(()=>{var C;(C=s==null?void 0:s.onRegisterPreview)==null||C.call(s,{text:g,truncated:H,totalBytes:L,loading:D})},[g,D,H,L]),l.useEffect(()=>()=>{var C;(C=s==null?void 0:s.onRegisterPreview)==null||C.call(s,null)},[t.nodeId]);async function q(C){var M,V;if(!(C.confirmRequired&&!window.confirm(`${C.label}?

${C.description||""}`))){if((M=C.metadata)!=null&&M.openInNewTab){window.open(d+C.path.replace("{id}",encodeURIComponent(t.nodeId)),"_blank","noreferrer");return}y(C.code);try{const W=d+C.path.replace("{id}",encodeURIComponent(t.nodeId));await ee.gatewayJson(C.httpMethod,W,(V=C.parameters)!=null&&V.length?{}:void 0),a&&a(`${C.label} done`,"success"),k()}catch(W){a&&a(W,"error")}finally{y(null)}}}const Q=l.useMemo(()=>{const C={};for(const M of(h==null?void 0:h.fields)??[])C[M.name]=M;return C},[h]),T=l.useMemo(()=>((u==null?void 0:u.values)??(u==null?void 0:u.fields)??[]).map(M=>{var V,W,Y;return{name:M.name,value:M.value,editable:M.editable,required:M.required??!1,label:((V=Q[M.name])==null?void 0:V.label)??M.label??M.name,widget:((W=Q[M.name])==null?void 0:W.widget)??M.widget??"text",hint:((Y=Q[M.name])==null?void 0:Y.hint)??M.hint??null}}),[u,Q]),F=l.useMemo(()=>{if(h!=null&&h.titleField){const C=T.find(M=>M.name===h.titleField);if(C!=null&&C.value)return String(C.value)}return(u==null?void 0:u.title)??(u==null?void 0:u.id)},[h,T,u]),I=l.useMemo(()=>{if(h!=null&&h.subtitleField){const C=T.find(M=>M.name===h.subtitleField);if(C!=null&&C.value)return String(C.value)}return(u==null?void 0:u.subtitle)??null},[h,T,u]),z=(h==null?void 0:h.color)??(u==null?void 0:u.color);return f?e.jsx("div",{className:"settings-loading",children:"Loading…"}):R?e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⚠"}),e.jsx("div",{className:"editor-empty-text",children:"Failed to load"}),e.jsx("div",{className:"editor-empty-hint",children:R})]}):u?e.jsxs("div",{style:{padding:24,overflow:"auto",height:"100%",boxSizing:"border-box"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:4},children:[z&&e.jsx("span",{style:{width:10,height:10,borderRadius:2,background:z,flexShrink:0}}),e.jsx("h2",{style:{margin:0,fontSize:18},children:F}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"},children:u.id})]}),I&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:16},children:I}),u.actions&&u.actions.length>0&&e.jsx("div",{style:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},children:u.actions.map(C=>e.jsx("button",{className:`btn btn-sm ${C.dangerous?"btn-danger":"btn-primary"}`,onClick:()=>q(C),disabled:m===C.code,title:C.description||C.label,children:m===C.code?"…":C.label},C.code))}),e.jsx("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse",marginBottom:24},children:e.jsx("tbody",{children:T.map(C=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsxs("td",{style:{padding:"6px 8px",color:"var(--muted)",width:180,verticalAlign:"top"},children:[C.label,C.hint&&e.jsx("div",{style:{fontSize:10,color:"var(--muted2)"},children:C.hint})]}),e.jsx("td",{style:{padding:"6px 8px"},children:Wo(C)})]},C.name))})}),((U=u.metadata)==null?void 0:U.isImage)&&((K=u.metadata)==null?void 0:K.downloadUrl)&&e.jsxs("div",{children:[e.jsx("div",{className:"settings-sub-label",style:{marginBottom:8},children:"Preview"}),e.jsx("img",{src:u.metadata.downloadUrl,alt:F,style:{maxWidth:"100%",maxHeight:480,border:"1px solid var(--border)",borderRadius:4}})]})]}):null}const Fo={match:{serviceCode:"*"},name:"default",Editor:Hn,hasItemChildren:()=>!1},Vn=256*1024*1024,Ts=Math.max(1,Math.min(navigator.hardwareConcurrency||2,4)),nt=Array.from({length:Ts},()=>new Worker(new URL("/assets/stepWorker-BXK_CxMf.js",import.meta.url),{type:"module"}));nt.forEach(t=>{t.addEventListener("message",({data:s})=>{s.type==="log"&&be.getState().appendLog(s.level,s.message)})});function Uo(t){let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)>>>0;return nt[s%Ts]}function tn({idb:t=!1}={}){nt.forEach(s=>s.postMessage({type:"clear",idb:t}))}function Go(t){nt.forEach(s=>s.postMessage({type:"setMaxBytes",maxBytes:t}))}const us={postMessage(t){t.uuid?Uo(t.uuid).postMessage(t):nt.forEach(s=>s.postMessage(t))},addEventListener(t,s){nt.forEach(n=>n.addEventListener(t,s))},removeEventListener(t,s){nt.forEach(n=>n.removeEventListener(t,s))}},Ho=()=>({entries:0,cacheBytes:0,maxBytes:Vn,memHits:0,idbHits:0,netFetches:0,avgDownloadMs:null,avgParseMs:null});function sn(t,s){const n=t.map(r=>r[s]).filter(r=>r!=null);return n.length?n.reduce((r,a)=>r+a,0)/n.length:null}function Vo(){const t=l.useRef(nt.map(Ho)),[,s]=l.useState(0);l.useEffect(()=>{const r=nt.map((a,o)=>{const i=({data:c})=>{c.type==="stats"&&(t.current[o]={entries:c.entries,cacheBytes:c.cacheBytes,maxBytes:c.maxBytes??Vn,memHits:c.memHits??0,idbHits:c.idbHits??0,netFetches:c.netFetches??0,avgDownloadMs:c.avgDownloadMs??null,avgParseMs:c.avgParseMs??null},s(p=>p+1))};return a.addEventListener("message",i),a.postMessage({type:"stats"}),i});return()=>nt.forEach((a,o)=>a.removeEventListener("message",r[o]))},[]);const n=t.current;return{workers:Ts,entries:n.reduce((r,a)=>r+a.entries,0),cacheBytes:n.reduce((r,a)=>r+a.cacheBytes,0),maxBytes:n.reduce((r,a)=>r+a.maxBytes,0),memHits:n.reduce((r,a)=>r+a.memHits,0),idbHits:n.reduce((r,a)=>r+a.idbHits,0),netFetches:n.reduce((r,a)=>r+a.netFetches,0),avgDownloadMs:sn(n,"avgDownloadMs"),avgParseMs:sn(n,"avgParseMs")}}function qo({nodes:t=[],loading:s=!1,onNavigateToNode:n,highlightedInstanceKeys:r=[],onPartSelected:a}){var K;const o=l.useRef(null),i=l.useRef(null),c=l.useRef(null),p=l.useRef(null),d=l.useRef(null),u=l.useRef(null),b=l.useRef(null),h=l.useRef({}),N=l.useRef(new Set),R=l.useRef({}),A=l.useRef({}),f=l.useRef(n),x=l.useRef(null),m=l.useRef(new Set),y=l.useRef(a),g=l.useRef({}),j=l.useRef([]),D=l.useRef(null);l.useEffect(()=>{f.current=n},[n]),l.useEffect(()=>{y.current=a},[a]);const[G,H]=l.useState({}),[B,L]=l.useState(()=>new Set),[w,k]=l.useState(()=>new Set),q=(K=t[0])==null?void 0:K.nodeId;l.useEffect(()=>{L(new Set)},[q]);const[Q,T]=l.useState(!1);l.useEffect(()=>{const C={},M={};t.forEach(V=>V.parts.forEach(W=>{const Y=W.instanceKey||W.uuid;C[Y]=V.nodeId,M[Y]=V.stateColor||"#6b7280"})),R.current=C,A.current=M,Object.entries(M).forEach(([V,W])=>{const Y=h.current[V];if(!Y)return;const oe=new $t(W);Y.traverse(S=>{S.isMesh&&S.userData.isOutline&&S.material.uniforms.color.value.copy(oe)})})},[t]);const I=t.flatMap(C=>C.parts).filter(C=>!B.has(C.instanceKey||C.uuid)),z=I.map(C=>`${C.instanceKey||C.uuid}@${C.matrix?C.matrix.join(","):"I"}`).join("|");j.current=I,l.useEffect(()=>{const C=o.current;if(!C)return;const M=C.clientWidth||600,V=C.clientHeight||400,W=()=>{const fe=getComputedStyle(document.documentElement).getPropertyValue("--scene-bg").trim();return new $t(fe||"#1c1c2a")},Y=new Kr;Y.background=W(),Y.add(new Jr(16777215,.7));const oe=new Xr(16777215,1.2);oe.position.set(8,12,6),Y.add(oe);const S=new Yr(45,M/V,1e-4,1e5);S.position.set(0,5,10);const _=new Zr({antialias:!0});_.setPixelRatio(window.devicePixelRatio),_.setSize(M,V),C.appendChild(_.domElement);const O=new Qr(S,_.domElement);O.enableDamping=!0,O.dampingFactor=.08;const X=new ea(S,_,{size:80,container:C});X.attachControls(O),i.current=Y,c.current=_,p.current=S,d.current=O,u.current=X;function se(){b.current=requestAnimationFrame(se),O.update(),_.render(Y,S),X.render()}se();function Z(){const fe=C.clientWidth,me=C.clientHeight;!fe||!me||(S.aspect=fe/me,S.updateProjectionMatrix(),_.setSize(fe,me),X.update())}D.current=Z;const re=new MutationObserver(()=>{i.current&&(i.current.background=W())});re.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});const ie=new ResizeObserver(()=>Z());ie.observe(C);const de=new na,ce=new ta;function ue(fe){const me=C.getBoundingClientRect();ce.set((fe.clientX-me.left)/C.clientWidth*2-1,(fe.clientY-me.top)/C.clientHeight*-2+1),de.setFromCamera(ce,S);const je=[];Y.traverse(Le=>{Le.isMesh&&!Le.userData.isOutline&&Le.visible&&je.push(Le)});const Ne=de.intersectObjects(je,!1);if(!Ne.length)return null;let Ie=Ne[0].object;for(;Ie&&!Ie.name;)Ie=Ie.parent;return(Ie==null?void 0:Ie.name)||null}function ve(fe){const me=x.current;if(me!==fe){if(me){const je=m.current.has(me),Ne=h.current[me];Ne&&Ne.traverse(Ie=>{Ie.isMesh&&(Ie.userData.isOutline?Ie.material.uniforms.color.value.set(je?"#3b82f6":A.current[me]||"#6b7280"):Ie.material.emissive.set(je?1718894:0))})}if(fe){const je=h.current[fe];je&&je.traverse(Ne=>{Ne.isMesh&&(Ne.userData.isOutline?Ne.material.uniforms.color.value.set(16777215):Ne.material.emissive.set(6710886))})}x.current=fe,_.domElement.style.cursor=fe?"pointer":"default"}}function Se(fe){ve(ue(fe))}function Re(){ve(null)}function Ee(fe){var je;const me=ue(fe);if(fe.ctrlKey||fe.metaKey){if(!me)return;const Ne=R.current[me];Ne&&f.current&&f.current(Ne)}else(je=y.current)==null||je.call(y,me||null,me?R.current[me]:null)}return _.domElement.addEventListener("mousemove",Se),_.domElement.addEventListener("mouseleave",Re),_.domElement.addEventListener("click",Ee),()=>{cancelAnimationFrame(b.current),re.disconnect(),ie.disconnect(),_.domElement.removeEventListener("mousemove",Se),_.domElement.removeEventListener("mouseleave",Re),_.domElement.removeEventListener("click",Ee),X.dispose(),_.dispose(),C.contains(_.domElement)&&C.removeChild(_.domElement)}},[]),l.useEffect(()=>{const C=({data:M})=>{var Y;const{type:V,uuid:W}=M;if(N.current.has(W)){if(N.current.delete(W),V==="ready"){g.current[W]=M.meshes;const oe=j.current.filter(_=>_.uuid===W),S={};for(const _ of oe){const O=_.instanceKey||_.uuid;if(h.current[O])continue;const X=A.current[O]||"#6b7280",se=nn(M.meshes,X);if(se.name=O,_.matrix){const Z=new rs;Z.set(_.matrix[0],_.matrix[1],_.matrix[2],_.matrix[3],_.matrix[4],_.matrix[5],_.matrix[6],_.matrix[7],_.matrix[8],_.matrix[9],_.matrix[10],_.matrix[11],_.matrix[12],_.matrix[13],_.matrix[14],_.matrix[15]),se.matrix.copy(Z),se.matrixAutoUpdate=!1}(Y=i.current)==null||Y.add(se),h.current[O]=se,S[O]={phase:"ready",error:null,visible:!0}}v(),Object.keys(S).length>0&&H(_=>({..._,...S}))}else if(V==="error"){const oe=j.current.filter(_=>_.uuid===W),S={};for(const _ of oe){const O=_.instanceKey||_.uuid;S[O]={phase:"error",error:M.message,visible:!1}}Object.keys(S).length>0&&H(_=>({..._,...S}))}}};return us.addEventListener("message",C),()=>us.removeEventListener("message",C)},[]),l.useEffect(()=>{var Y,oe;const C=new Set(I.map(S=>S.instanceKey||S.uuid)),M=new Set(I.map(S=>S.uuid));for(const S of Object.keys(h.current))C.has(S)||(rn(h.current[S]),(Y=i.current)==null||Y.remove(h.current[S]),delete h.current[S]);for(const S of[...N.current])M.has(S)||N.current.delete(S);for(const S of Object.keys(g.current))M.has(S)||delete g.current[S];H(S=>{const _={...S};for(const O of Object.keys(_))C.has(O)||delete _[O];return _});const V={};let W=!1;for(const S of I){const _=S.instanceKey||S.uuid;if(h.current[_]){if(S.matrix){const O=new rs;O.set(S.matrix[0],S.matrix[1],S.matrix[2],S.matrix[3],S.matrix[4],S.matrix[5],S.matrix[6],S.matrix[7],S.matrix[8],S.matrix[9],S.matrix[10],S.matrix[11],S.matrix[12],S.matrix[13],S.matrix[14],S.matrix[15]),h.current[_].matrix.equals(O)||(h.current[_].matrix.copy(O),h.current[_].matrixAutoUpdate=!1,W=!0)}continue}if(g.current[S.uuid]){const O=A.current[_]||"#6b7280",X=nn(g.current[S.uuid],O);if(X.name=_,S.matrix){const se=new rs;se.set(S.matrix[0],S.matrix[1],S.matrix[2],S.matrix[3],S.matrix[4],S.matrix[5],S.matrix[6],S.matrix[7],S.matrix[8],S.matrix[9],S.matrix[10],S.matrix[11],S.matrix[12],S.matrix[13],S.matrix[14],S.matrix[15]),X.matrix.copy(se),X.matrixAutoUpdate=!1}(oe=i.current)==null||oe.add(X),h.current[_]=X,V[_]={phase:"ready",error:null,visible:!0},W=!0}else N.current.has(S.uuid)?V[_]={phase:"loading",error:null,visible:!0}:(N.current.add(S.uuid),V[_]={phase:"loading",error:null,visible:!0},us.postMessage({type:"load",uuid:S.uuid,kind:S.kind||"design",token:ft(),projectSpace:Pt()}))}W&&v(),Object.keys(V).length>0&&H(S=>({...S,...V}))},[z]);function v(){var _;(_=D.current)==null||_.call(D);const C=i.current,M=p.current,V=d.current;if(!C||!M)return;C.updateMatrixWorld(!0);const W=new sa;if(C.traverse(O=>{O.isMesh&&!O.userData.isOutline&&O.visible&&W.expandByObject(O)}),W.isEmpty())return;const Y=new Ms,oe=new Ms;W.getCenter(Y),W.getSize(oe);const S=Math.max(oe.x,oe.y,oe.z)||1;M.near=S*1e-4,M.far=S*200,M.position.set(Y.x+S*1.5,Y.y+S,Y.z+S*2),M.lookAt(Y),V&&(V.target.copy(Y),V.update()),M.updateProjectionMatrix()}function P(C){const M=h.current[C];if(!M)return;const V=!M.visible;M.visible=V,H(W=>({...W,[C]:{...W[C],visible:V}}))}function J(C){var V;const M=h.current[C];M&&(rn(M),(V=i.current)==null||V.remove(M),delete h.current[C]),L(W=>new Set([...W,C])),H(W=>{const Y={...W};return delete Y[C],Y})}function $(C){k(M=>{const V=new Set(M);return V.has(C)?V.delete(C):V.add(C),V})}function U(C){for(const M of m.current){if(x.current===M)continue;const V=h.current[M];V&&V.traverse(W=>{W.isMesh&&(W.userData.isOutline?W.material.uniforms.color.value.set(A.current[M]||"#6b7280"):W.material.emissive.set(0))})}m.current=new Set(C);for(const M of m.current){if(x.current===M)continue;const V=h.current[M];V&&V.traverse(W=>{W.isMesh&&(W.userData.isOutline?W.material.uniforms.color.value.set("#3b82f6"):W.material.emissive.set(1718894))})}}return l.useEffect(()=>{U(r)},[r]),e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[Q?e.jsxs("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,background:"var(--surface)"},onClick:()=>T(!1),title:"Show parts panel",children:[e.jsx(He,{size:12,style:{color:"var(--muted)",flexShrink:0}}),e.jsx("span",{style:{writingMode:"vertical-rl",fontSize:10,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1,textTransform:"uppercase"},children:"Parts"})]}):e.jsxs("div",{style:{width:220,flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"5px 8px 5px 10px",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:"Parts"}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>T(!0),title:"Collapse parts panel",children:e.jsx(Fr,{size:13})})]}),s&&e.jsx("div",{style:{padding:"6px 10px",fontSize:11,color:"var(--muted)",flexShrink:0},children:"Loading…"}),!s&&t.length===0&&e.jsx("div",{style:{padding:"10px 12px",fontSize:12,color:"var(--muted)"},children:"No parts"}),e.jsx("div",{style:{flex:1,overflowY:"auto"},children:t.map(C=>{const M=C.parts.filter(Y=>!B.has(Y.instanceKey||Y.uuid));if(M.length===0)return null;const V=w.has(C.nodeId),W=C.stateColor||"#6b7280";return e.jsxs("div",{children:[e.jsxs("div",{onClick:()=>$(C.nodeId),style:{display:"flex",alignItems:"center",gap:5,padding:`4px 8px 4px ${8+C.depth*12}px`,cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--muted)",borderBottom:"1px solid var(--border)",background:"var(--surface)",userSelect:"none"},children:[e.jsx("span",{style:{width:7,height:7,borderRadius:2,background:W,flexShrink:0,display:"inline-block"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:C.nodeLabel,children:C.nodeLabel}),e.jsx("span",{style:{fontSize:9,flexShrink:0},children:V?"▶":"▼"})]}),!V&&M.map(Y=>{const oe=Y.instanceKey||Y.uuid,S=G[oe]||{},_=S.visible!==!1;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,padding:`4px 8px 4px ${14+C.depth*12}px`,fontSize:12,borderBottom:"1px solid var(--border)"},children:[e.jsx("input",{type:"checkbox",checked:_,disabled:S.phase!=="ready",onChange:()=>P(oe),style:{flexShrink:0,cursor:S.phase==="ready"?"pointer":"default"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:S.phase==="error"?"var(--danger, #e05252)":"inherit",opacity:_?1:.45},title:S.phase==="error"?S.error:Y.fileName,children:Y.fileName||Y.uuid}),e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",flexShrink:0},children:[S.phase==="loading"&&"…",S.phase==="error"&&"✗"]}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>J(oe),title:"Remove from scene",style:{fontSize:13,lineHeight:1},children:"×"})]},oe)})]},C.instanceId||C.nodeId)})})]}),e.jsx("div",{ref:o,style:{flex:1,overflow:"hidden",minWidth:0,position:"relative"}})]})}function nn(t,s="#6b7280"){const n=new ra,r=new $t(s);for(const a of t){if(!a.positions)continue;const o=new aa;o.setAttribute("position",new as(a.positions,3)),a.normals&&o.setAttribute("normal",new as(a.normals,3)),a.indices&&o.setIndex(new as(a.indices,1));const i=a.color?new $t(a.color[0],a.color[1],a.color[2]):new $t(6003958),c=new Os(o,new oa({color:i,side:ia}));n.add(c);const p=new Os(o,new la({side:ca,uniforms:{color:{value:r.clone()},thickness:{value:.007}},vertexShader:`
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
void main() { gl_FragColor = vec4(color, 1.0); }`}));p.renderOrder=1,p.userData.isOutline=!0,n.add(p)}return n}function rn(t){t.traverse(s=>{var n,r;(n=s.geometry)==null||n.dispose(),Array.isArray(s.material)?s.material.forEach(a=>a.dispose()):(r=s.material)==null||r.dispose()})}const wt={},Vt=[];function Ko(t,s){return t.length!==s.length?!1:s.every((n,r)=>n==="*"||n===t[r])}const St={emit(t){const s=t==null?void 0:t.type;if(!s)return;(wt[s]||[]).slice().forEach(r=>r(t));const n=s.split(":");Vt.forEach(({glob:r,handler:a})=>{Ko(n,r)&&a(t)})},on(t,s){return(wt[t]??(wt[t]=[])).push(s),()=>this.off(t,s)},onPattern(t,s){const n={glob:t.split(":"),handler:s};return Vt.push(n),()=>{const r=Vt.indexOf(n);r!==-1&&Vt.splice(r,1)}},off(t,s){wt[t]=(wt[t]||[]).filter(n=>n!==s)}};function Jo(t,s){return!s||Object.keys(s).length===0?t:t.map(n=>({...n,parts:n.parts.map(r=>{const a=r.instanceKey||r.uuid,o=a.indexOf("#");if(o===-1)return r;const i=a.slice(o+1);return s[i]?{...r,matrix:s[i]}:r})}))}function an(t){if(!t)return null;const s=t.indexOf("#");return s===-1?null:t.slice(s+1).split("/")[0]||null}function Xo({data:t,tab:s,ctx:n}){var R;const{nodes:r=[],loading:a=!1}=t||{},[o,i]=l.useState({}),[c,p]=l.useState(null),d=(R=r[0])==null?void 0:R.nodeId,u=s==null?void 0:s.id;l.useEffect(()=>{i({}),p(null)},[u,d]),l.useEffect(()=>{const A=St.on("psm:link:positionChange",({linkId:x,matrix:m})=>{i(y=>{if(m===null){const g={...y};return delete g[x],g}return{...y,[x]:m}})}),f=St.on("psm:link:selected",({linkId:x})=>{p(x??null)});return()=>{A(),f()}},[]);const b=Jo(r,o),h=c?b.flatMap(A=>A.parts.filter(f=>an(f.instanceKey||f.uuid)===c).map(f=>f.instanceKey||f.uuid)):[];function N(A,f){const x=an(A);p(x),St.emit({type:"psm:part:selected",linkId:x})}return e.jsx(qo,{nodes:b,loading:a,highlightedInstanceKeys:h,onNavigateToNode:n!=null&&n.onNavigate?A=>n.onNavigate(A,void 0,{serviceCode:"psm"}):void 0,onPartSelected:N})}function Yo(t){return t?t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`:""}function Zo({data:t}){const{text:s,loading:n,truncated:r,totalBytes:a}=t||{};return n?e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"Loading…"}):s?e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"},children:[e.jsx("pre",{style:{margin:0,padding:14,fontSize:11,lineHeight:1.55,fontFamily:"var(--mono)",whiteSpace:"pre-wrap",wordBreak:"break-all",color:"var(--text)",overflow:"auto",flex:1,boxSizing:"border-box"},children:s}),r&&e.jsxs("div",{style:{padding:"6px 14px",fontSize:11,color:"var(--muted)",borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:["Preview limited to first 64 KB",a?` — file is ${Yo(a)}`:"","."]})]}):e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"No preview available"})}function Qo({hit:t,descriptor:s,isPinned:n,onPin:r,onUnpin:a,ctx:o}){let i={};try{i=JSON.parse(t.sourceJson||"{}")}catch{}const c=i.logicalId||i.logical_id||i.originalName||t.id,p=(s==null?void 0:s.displayName)||t.itemCode||t.type||"",{onNavigate:d}=o,u=s!=null&&s.icon?Je[s.icon]:null;return e.jsxs("div",{className:"node-item",onClick:()=>d(t.id,c,s),title:c,children:[u?e.jsx(u,{size:11,color:s.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):s!=null&&s.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:s.color,flexShrink:0,display:"inline-block"}}):null,e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:c}),p&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",flexShrink:0},children:p}),e.jsx("button",{className:`search-pin-btn${n?" pinned":""}`,title:n?"Remove from basket":"Add to basket",onClick:b=>{b.stopPropagation(),n?a==null||a():r==null||r()},children:n?e.jsx(ts,{size:11,strokeWidth:2}):e.jsx(ss,{size:11,strokeWidth:2})})]})}function ei({item:t,ctx:s}){const{userId:n,stateColorMap:r}=s,a=t.revision||t.REVISION||"A",o=t.iteration??t.ITERATION??1,i=t.lifecycle_state_id||t.LIFECYCLE_STATE_ID,c=t.logical_id||t.LOGICAL_ID||"",p=t.locked_by||t.LOCKED_BY||null,u=(t.tx_status||t.TX_STATUS||"COMMITTED")==="OPEN",b=p&&p!==n,h=p&&p===n;return e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"ni-dot",style:{background:(r==null?void 0:r[i])||"#6b7280"}}),e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[c||e.jsx("span",{className:"ni-no-id",children:"—"}),(t.display_name||t.DISPLAY_NAME)&&e.jsx("span",{className:"ni-dname",children:t.display_name||t.DISPLAY_NAME})]}),e.jsx("span",{className:"ni-reviter",style:u?{color:"var(--warn)"}:void 0,children:o===0?a:`${a}.${o}`}),b&&e.jsx(Ur,{size:10,strokeWidth:2.5,color:"var(--muted)",style:{flexShrink:0}}),h&&e.jsx(bt,{size:10,strokeWidth:2.5,color:"var(--accent)",style:{flexShrink:0}})]})}function ti({item:t}){const s=t.originalName||t.ORIGINAL_NAME||t.id;return e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:s})}function qn({isPinned:t,onPin:s,onUnpin:n}){return e.jsx("button",{className:`search-pin-btn${t?" pinned":""}`,title:t?"Remove from basket":"Add to basket",onClick:r=>{r.stopPropagation(),t?n==null||n():s==null||s()},children:t?e.jsx(ts,{size:11,strokeWidth:2}):e.jsx(ss,{size:11,strokeWidth:2})})}function si({hit:t,descriptor:s,isPinned:n,onPin:r,onUnpin:a,ctx:o}){let i={};try{i=JSON.parse(t.sourceJson||"{}")}catch{}const{onNavigate:c}=o,p=i.revision||"A",d=i.iteration??1,u=i.logicalId||"",b=i.name||"",h=s!=null&&s.icon?Je[s.icon]:null;return e.jsxs("div",{className:"node-item",onClick:()=>c(t.id,u||t.id,s),title:[u,b].filter(Boolean).join(" · ")||t.id,children:[h?e.jsx(h,{size:11,color:s.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):s!=null&&s.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:s.color,flexShrink:0,display:"inline-block"}}):null,e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[u||e.jsx("span",{className:"ni-no-id",children:"—"}),b&&e.jsx("span",{className:"ni-dname",children:b})]}),e.jsx("span",{className:"ni-reviter",children:d===0?p:`${p}.${d}`}),e.jsx(qn,{isPinned:n,onPin:r,onUnpin:a})]})}function ni({hit:t,descriptor:s,isPinned:n,onPin:r,onUnpin:a,ctx:o}){let i={};try{i=JSON.parse(t.sourceJson||"{}")}catch{}const{onNavigate:c}=o,p=i.originalName||t.id,d=s!=null&&s.icon?Je[s.icon]:null;return e.jsxs("div",{className:"node-item",onClick:()=>c(t.id,p,s),title:p,children:[d?e.jsx(d,{size:11,color:s.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):s!=null&&s.color?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:s.color,flexShrink:0,display:"inline-block"}}):null,e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:p}),e.jsx(qn,{isPinned:n,onPin:r,onUnpin:a})]})}let on=!1;function ri(){on||(on=!0,Ea(Fo),gs({match:{serviceCode:"psm"},name:"psm-shell",NavLabel:ei,Preview:Xo,previewLabel:"3D Preview",hasItemChildren:t=>{const s=t.children_count??t.CHILDREN_COUNT;return s==null||s>0}}),gs({match:{serviceCode:"dst",itemCode:"data-object"},name:"dst-shell",NavLabel:ti,Editor:Hn,Preview:Zo,previewLabel:"Preview",hasItemChildren:()=>!1}),_o(Qo),js("psm",null,si),js("dst","data-object",ni))}let Kn=null;function ai(){Kn=null}function oi(){return Kn}const ii=l.createContext(null);function li({navigate:t,openTab:s,closeTab:n}){const r=be.getState;return{navigate:t,openTab:s,closeTab:n,getToken:()=>ft(),getProjectSpaceId:()=>Pt(),emit:(a,o)=>St.emit(a,o),on:(a,o)=>(St.on(a,o),()=>St.off(a,o)),getStore:()=>ae.getState(),usePlmStore:ae,useWebSocket:Ln,api:ee,txApi:ht,authoringApi:ya,cadApi:va,pollJobStatus:Cs,getDraggedNode:oi,clearDraggedNode:ai,getLinkRowForSource:Ta,icons:{NODE_ICONS:Je,SignIcon:vn},components:{LifecycleDiagram:Ka},http:{serviceRequest:(a,o,i,c)=>ba(a,o,i,c),serviceUpload:(a,o,i,c)=>Ot(`/api/${a}${o}`,"POST",{Authorization:`Bearer ${ft()}`,"X-PLM-ProjectSpace":Pt()||""},i,c)},store:{registerSlice(a,o){ae.setState(i=>({_slices:{...i._slices,[a]:o.state??{}},_sliceActions:{...i._sliceActions,[a]:o.actions??{}}}))},getSlice:a=>{var o;return(o=ae.getState()._slices)==null?void 0:o[a]},useSlice:a=>ae(o=>{var i;return(i=o._slices)==null?void 0:i[a]}),dispatch(a,o,...i){var p,d;const c=(d=(p=ae.getState()._sliceActions)==null?void 0:p[a])==null?void 0:d[o];c&&c(ae.setState,ae.getState,...i)}},console:{addTab:(a,o,i)=>r().addConsoleTab(a,o,i),removeTab:a=>r().removeConsoleTab(a),log:(a,o)=>r().appendLog(a,o)},status:{register:(a,o,i)=>r().registerStatus(a,o,i),unregister:a=>r().unregisterStatus(a)},collab:{addTab:(a,o,i)=>r().addCollabTab(a,o,i),removeTab:a=>r().removeCollabTab(a)},jobs:{register:(a,o,i)=>r().registerBgJob(a,o,i),update:(a,o)=>r().updateBgJob(a,o),remove:a=>r().removeBgJob(a)}}}async function ci(t){const s=await ee.getUiManifest();return(await Promise.allSettled(s.map(async r=>{const o=(await import(r.url)).default;if(!(o!=null&&o.id))throw new Error(`Plugin at ${r.url} has no id`);if(o.init&&o.init(t),Ya(o),o.zone==="nav"&&o.match&&(Vs(o.match.serviceCode,o.match.itemCode,{NavLabel:o.NavLabel??null,getRowProps:o.getRowProps??null,ChildRow:o.ChildRow??null,hasItemChildren:o.hasItemChildren??(()=>!1),fetchChildren:o.fetchChildren??null,LinkRow:o.LinkRow??null}),o.SearchItem&&js(o.match.serviceCode,o.match.itemCode??null,o.SearchItem),o.linkSources&&o.LinkRow))for(const i of o.linkSources)Vs(i,null,{LinkRow:o.LinkRow})}))).map((r,a)=>{var o,i,c;return r.status==="rejected"?`${((o=s[a])==null?void 0:o.pluginId)??((i=s[a])==null?void 0:i.url)}: ${((c=r.reason)==null?void 0:c.message)??r.reason}`:null}).filter(Boolean)}const ln=50,di=8;function pi({jobData:t,onClose:s}){const{job:n,results:r=[]}=t,a=n.status==="DONE"||n.status==="FAILED",o=r.reduce((c,p)=>(c[p.action]=(c[p.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${r.length} node${r.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,p])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",p]},c))}),r.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:r.map((c,p)=>e.jsxs("tr",{style:{borderTop:p>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||p))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:a?"Close":"Dismiss (job continues in background)"})})]})}function ui({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:r,onCreateNode:a,refreshKey:o,toast:i,panelSection:c="MAIN",basketView:p=!1,basketItems:d={}}){const u=ae(O=>O.items),b=ae(O=>O.itemsStatus),h=ae(O=>O.addToBasket),N=ae(O=>O.removeFromBasket),R=ae(O=>O.lockedByMe),A=ae(O=>O.userId);ae(O=>O.projectSpaceId);const f=l.useMemo(()=>{const O=String(c||"MAIN").toUpperCase();return u.filter(X=>X.list&&String(X.panelSection||"MAIN").toUpperCase()===O)},[u,c]),[x,m]=l.useState({}),[y,g]=l.useState({}),[j,D]=l.useState(new Set),[G,H]=l.useState(new Set),B=l.useRef({}),[,L]=l.useState(0),[w,k]=l.useState(null),[q,Q]=l.useState(null),[T,F]=l.useState({}),[I,z]=l.useState(!1),[v,P]=l.useState(null),[J,$]=l.useState(null),U=l.useRef(null),K=l.useMemo(()=>({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:r}),[t,s,n,r]),C=l.useCallback(O=>`${O.serviceCode}:${O.itemCode}`,[]);l.useEffect(()=>()=>{U.current&&clearInterval(U.current)},[]),l.useEffect(()=>{f.length!==0&&(D(new Set(f.map(C))),f.forEach(O=>M(O,0).catch(()=>null)))},[f,o]),l.useEffect(()=>{if(s){for(const[O,X]of Object.entries(x))if(((X==null?void 0:X.items)||[]).some(se=>(se.id||se.ID)===s)){D(se=>new Set([...se,O]));return}}},[s,x]);async function M(O,X){const se=C(O);g(Z=>({...Z,[se]:!0}));try{const Z=await ee.fetchListableItems(t,O,X,ln);m(re=>{const ie=re[se],de=X===0||!ie?Z:{...Z,items:[...ie.items||[],...Z.items||[]]};return{...re,[se]:de}})}catch{m(Z=>({...Z,[se]:{items:[],totalElements:0,page:0,size:ln}}))}finally{g(Z=>({...Z,[se]:!1}))}}function V(O){const X=C(O);D(se=>{const Z=new Set(se);return Z.has(X)?Z.delete(X):(Z.add(X),!x[X]&&!y[X]&&M(O,0)),Z})}function W(O){const X=C(O),se=x[X];if(!se||y[X])return;const Z=(se.page??0)+1;Z>=(se.totalPages??0)||M(O,Z)}const Y=l.useCallback(async(O,X,se,Z)=>{Z&&Z.stopPropagation(),H(de=>{const ce=new Set(de);return ce.has(O)?ce.delete(O):ce.add(O),ce});const re=X.id||X.ID;if(B.current[re]!==void 0)return;const ie=Zt(se);if(!ie.fetchChildren){B.current[re]=[];return}B.current[re]="loading",L(de=>de+1);try{const de=await ie.fetchChildren(X,K);B.current[re]=Array.isArray(de)?de:[]}catch{B.current[re]=[]}L(de=>de+1)},[K]);function oe(O,X,se,Z,re,ie){if(re>di)return null;const de=se.id||se.ID||Z,ce=B.current[de];return!Array.isArray(ce)||ce.length===0||!O.ChildRow?null:ce.map(ue=>{const ve=ue.targetNodeId||ue.id||ue.ID,Se=`${Z}/${ue.linkId||ve}`,Ee=!ie.has(ve)&&G.has(Se);return e.jsxs(We.Fragment,{children:[e.jsx(O.ChildRow,{link:ue,child:ue,depth:re,parentPath:Se,ancestorIds:ie,ctx:K,childCacheRef:B,expandedPaths:G,toggleNodeChildren:(fe,me,je)=>Y(fe,{id:me},X,je)}),Ee&&oe(O,X,{id:ve},Se,re+1,new Set([...ie,ve]))]},Se)})}const S=l.useMemo(()=>{const O=String(c||"MAIN").toUpperCase(),X=f.filter(re=>String(re.panelSection||"MAIN").toUpperCase()===O),se=new Map;for(const re of X){const ie=re.serviceCode||"_unknown";se.has(ie)||se.set(ie,[]),se.get(ie).push(re)}const Z=[];for(const[re,ie]of se.entries()){ie.sort((ue,ve)=>(ve.priority??100)-(ue.priority??100));const de=ie.reduce((ue,ve)=>Math.max(ue,ve.priority??100),0),ce=ie[0].sourceLabel||re;Z.push({serviceCode:re,label:ce,maxPriority:de,descriptors:ie})}return Z.sort((re,ie)=>ie.maxPriority-re.maxPriority),Z},[f,c]);async function _(){if(!w||!q)return;const{descriptor:O,action:X}=w,se=`/api/${O.serviceCode}${X.path}`,Z=new FormData;Z.append("file",q),(X.parameters||[]).forEach(ce=>{const ue=T[ce.name];ue!=null&&ue!==""&&Z.append(ce.name,ue)});const re={},ie=ft(),de=Pt();ie&&(re.Authorization=`Bearer ${ie}`),de&&(re["X-PLM-ProjectSpace"]=de),z(!0),P(0);try{const ce=await Ot(se,"POST",re,Z,ve=>P(ve));if(!ce.ok){const ve=await ce.json().catch(()=>({}));throw new Error(ve.error||ve.message||`HTTP ${ce.status}`)}const ue=await ce.json().catch(()=>null);if(k(null),P(null),ue!=null&&ue.jobId&&X.jobStatusPath){const ve=X.jobStatusPath.replace("{jobId}",ue.jobId);$({id:ue.jobId,data:{job:{id:ue.jobId,status:ue.status||"PENDING"},results:[]}}),U.current&&clearInterval(U.current),U.current=setInterval(async()=>{var Se,Re,Ee;try{const fe=await Cs(O.serviceCode,ve);$(me=>me?{...me,data:fe}:null),(((Se=fe.job)==null?void 0:Se.status)==="DONE"||((Re=fe.job)==null?void 0:Re.status)==="FAILED")&&(clearInterval(U.current),U.current=null,((Ee=fe.job)==null?void 0:Ee.status)==="DONE"&&M(O,0))}catch{}},2e3)}else i==null||i(`${q.name} imported`,"success"),M(O,0)}catch(ce){k(null),P(null),i==null||i(ce,"error")}finally{z(!1)}}return b!=="loaded"&&c==="MAIN"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):S.length===0?null:e.jsxs(e.Fragment,{children:[w&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:O=>{O.target===O.currentTarget&&!I&&k(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:w.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!I&&k(null),disabled:I,children:e.jsx(xt,{size:14})})]}),w.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:w.action.description}),v!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[v,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${v}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:w.action.acceptedTypes||void 0,disabled:I,onChange:O=>{var X;return Q(((X=O.target.files)==null?void 0:X[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),q&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[q.name," (",(q.size/1024).toFixed(1)," KB)"]}),(w.action.parameters||[]).map(O=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[O.label,O.required?" *":""]}),O.widgetType==="DROPDOWN"&&O.allowedValues?e.jsx("select",{disabled:I,value:T[O.name]??(O.defaultValue||""),onChange:X=>F(se=>({...se,[O.name]:X.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(O.allowedValues).map(X=>e.jsx("option",{value:X.value,children:X.label},X.value))}):e.jsx("input",{type:"text",disabled:I,value:T[O.name]??(O.defaultValue||""),onChange:X=>F(se=>({...se,[O.name]:X.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),O.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:O.tooltip})]},O.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!I&&k(null),disabled:I,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:_,disabled:!q||I,children:I?"Importing…":"Import"})]})]})}),J&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:O=>{O.target===O.currentTarget&&$(null)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:O=>O.stopPropagation(),children:e.jsx(pi,{jobData:J.data,onClose:()=>$(null)})})}),S.map(({serviceCode:O,label:X,descriptors:se})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Qt,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:X})]})}),e.jsx("div",{className:"node-list",children:se.map(Z=>{var fe;const re=C(Z),ie=j.has(re),de=!!y[re],ce=x[re],ue=(ce==null?void 0:ce.items)||[],ve=(ce==null?void 0:ce.totalElements)??ue.length,Se=Z.icon?Je[Z.icon]:null,Re=ce&&(ce.totalPages??0)>(ce.page??0)+1,Ee=Zt(Z);return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>V(Z),children:[e.jsx("span",{className:"type-chevron",children:ie?e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(He,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),Se?e.jsx(Se,{size:11,color:Z.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):Z.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:Z.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:Z.description||void 0,children:Z.displayName}),e.jsx("span",{className:"type-group-count",children:de&&ue.length===0?"…":ve}),Z.create&&a&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${Z.displayName}`,onClick:me=>{me.stopPropagation(),a(Z)},children:e.jsx(Fe,{size:10,strokeWidth:2.5})}),((fe=Z.importActions)==null?void 0:fe.length)>0&&e.jsx("button",{className:"type-group-create-btn",title:Z.importActions[0].name||`Import ${Z.displayName}`,onClick:me=>{me.stopPropagation(),Q(null),F({}),k({descriptor:Z,action:Z.importActions[0]})},children:e.jsx(En,{size:10,strokeWidth:2.5})})]}),ie&&e.jsxs(e.Fragment,{children:[de&&ue.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Loading…"}),!de&&ue.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),ue.length>0&&ue.map(me=>{const je=me.id||me.ID,Ne=Object.values(d).some(Ue=>Ue.has(je));if(p&&!Ne)return null;const Ie=Z.serviceCode==="psm"&&R.has(je),Le=`${re}/${je}`,Qe=G.has(Le),Ve=B.current[je]==="loading",et=Ee.hasItemChildren?Ee.hasItemChildren(me):!1;return e.jsxs(We.Fragment,{children:[e.jsx(On,{descriptor:Z,item:me,ctx:K,isActive:je===s,isOpen:!1,isPinned:Ne,hasChildren:et,isExpanded:Qe,isLoading:Ve,onToggleExpand:Ue=>Y(Le,me,Z,Ue),onToggleChildren:Ue=>Y(Le,me,Z,Ue),onPin:()=>h(A,Z.serviceCode,Z.itemCode,je),onUnpin:Ie?null:()=>N(A,Z.serviceCode,Z.itemCode,je)}),Qe&&oe(Ee,Z,me,Le,1,new Set([je]))]},je)}),Re&&e.jsx("div",{className:"panel-empty",style:{fontSize:10,cursor:"pointer",color:"var(--muted2)"},onClick:()=>W(Z),children:de?"Loading…":`Load more (${ve-ue.length} remaining)`})]})]},re)})})]},O))]})}function mi({descriptor:t,openItemIds:s,pinnedItemIds:n,openItemDataMap:r,ctx:a,onCreateNode:o,onOpenImport:i}){var h;const[c,p]=l.useState(!0),d=l.useMemo(()=>{const N=new Set,R=[];for(const A of n)N.has(A)||(N.add(A),R.push({id:A,isPinned:!0,isOpen:s.includes(A)}));for(const A of s)N.has(A)||(N.add(A),R.push({id:A,isPinned:!1,isOpen:!0}));return R},[s,n]),u=t.icon?Je[t.icon]:null,b=d.length;return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>p(N=>!N),children:[e.jsx("span",{className:"type-chevron",children:c?e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(He,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),u?e.jsx(u,{size:11,color:t.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):t.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:t.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:t.description||void 0,children:t.displayName}),e.jsx("span",{className:"type-group-count",children:b||""}),t.create&&o&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${t.displayName}`,onClick:N=>{N.stopPropagation(),o(t)},children:e.jsx(Fe,{size:10,strokeWidth:2.5})}),((h=t.importActions)==null?void 0:h.length)>0&&i&&e.jsx("button",{className:"type-group-create-btn",title:t.importActions[0].name||`Import ${t.displayName}`,onClick:N=>{N.stopPropagation(),i(t,t.importActions[0])},children:e.jsx(En,{size:10,strokeWidth:2.5})})]}),c&&e.jsxs("div",{className:"node-list",children:[d.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),d.map(({id:N,isPinned:R,isOpen:A})=>e.jsx(Dn,{descriptor:t,itemRef:{source:t.serviceCode,type:t.itemCode||"",key:N},initialItem:r[N]||void 0,ctx:a,isOpen:A,isPinned:R},N))]})]})}function hi({openItems:t=[],openItemDataMap:s={},activeNodeId:n,stateColorMap:r,onNavigate:a,onCreateNode:o,toast:i}){const c=ae(T=>T.items),p=ae(T=>T.itemsStatus),d=ae(T=>T.basketItems),u=ae(T=>T.userId),[b,h]=l.useState(null),[N,R]=l.useState(null),[A,f]=l.useState({}),[x,m]=l.useState(!1),[y,g]=l.useState(null),[j,D]=l.useState(null),[G,H]=l.useState(!1),B=l.useRef(null);l.useEffect(()=>()=>{B.current&&clearInterval(B.current)},[]);const L=l.useMemo(()=>({userId:u,activeNodeId:n,stateColorMap:r,onNavigate:a}),[u,n,r,a]),w=l.useMemo(()=>c.filter(T=>{var I;return(T.panelSection||"MAIN").toUpperCase()==="MAIN"&&(T.list||T.create||((I=T.importActions)==null?void 0:I.length)>0)}),[c]),k=l.useMemo(()=>{const T=new Map;for(const I of w){const z=I.serviceCode||"_unknown";T.has(z)||T.set(z,[]),T.get(z).push(I)}const F=[];for(const[I,z]of T.entries()){z.sort((J,$)=>($.priority??100)-(J.priority??100));const v=z.reduce((J,$)=>Math.max(J,$.priority??100),0),P=z[0].sourceLabel||I;F.push({serviceCode:I,label:P,maxPriority:v,descriptors:z})}return F.sort((I,z)=>z.maxPriority-I.maxPriority),F},[w]),q=l.useMemo(()=>{const T={};for(const F of t){const I=w.find(v=>Ia(v,F));if(!I)continue;const z=os(I);T[z]||(T[z]={openIds:[],pinnedIds:[]}),T[z].openIds.includes(F.key)||T[z].openIds.push(F.key)}for(const[F,I]of Object.entries(d)){const z=F.indexOf(":"),v=z>-1?F.slice(0,z):F,P=z>-1?F.slice(z+1):"",J=w.find(U=>U.serviceCode===v&&U.itemCode===P);if(!J)continue;const $=os(J);T[$]||(T[$]={openIds:[],pinnedIds:[]});for(const U of I)T[$].pinnedIds.includes(U)||T[$].pinnedIds.push(U)}return T},[t,d,w]);async function Q(){if(!b||!N)return;const{descriptor:T,action:F}=b,I=`/api/${T.serviceCode}${F.path}`,z=new FormData;z.append("file",N),(F.parameters||[]).forEach($=>{const U=A[$.name];U!=null&&U!==""&&z.append($.name,U)});const v={},P=ft(),J=Pt();P&&(v.Authorization=`Bearer ${P}`),J&&(v["X-PLM-ProjectSpace"]=J),m(!0),g(0);try{const $=await Ot(I,"POST",v,z,K=>g(K));if(!$.ok){const K=await $.json().catch(()=>({}));throw new Error(K.error||K.message||`HTTP ${$.status}`)}const U=await $.json().catch(()=>null);if(h(null),g(null),U!=null&&U.jobId&&F.jobStatusPath){const K=F.jobStatusPath.replace("{jobId}",U.jobId),C=U.jobId;D({id:C,data:{job:{id:C,status:U.status||"PENDING"},results:[]}}),H(!0),be.getState().registerBgJob(C,F.name||"Import",()=>H(!0)),B.current&&clearInterval(B.current),B.current=setInterval(async()=>{var M;try{const V=await Cs(T.serviceCode,K);D(Y=>Y?{...Y,data:V}:null);const W=(M=V.job)==null?void 0:M.status;(W==="DONE"||W==="FAILED")&&(be.getState().updateBgJob(C,W==="DONE"?"done":"failed"),clearInterval(B.current),B.current=null)}catch{}},2e3)}else i==null||i(`${N.name} imported`,"success")}catch($){h(null),g(null),i==null||i($,"error")}finally{m(!1)}}return p!=="loaded"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):e.jsxs(e.Fragment,{children:[b&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:T=>{T.target===T.currentTarget&&!x&&h(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:b.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!x&&h(null),disabled:x,children:e.jsx(xt,{size:14})})]}),b.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:b.action.description}),y!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[y,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${y}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:b.action.acceptedTypes||void 0,disabled:x,onChange:T=>{var F;return R(((F=T.target.files)==null?void 0:F[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),N&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[N.name," (",(N.size/1024).toFixed(1)," KB)"]}),(b.action.parameters||[]).map(T=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[T.label,T.required?" *":""]}),T.widgetType==="DROPDOWN"&&T.allowedValues?e.jsx("select",{disabled:x,value:A[T.name]??(T.defaultValue||""),onChange:F=>f(I=>({...I,[T.name]:F.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(T.allowedValues).map(F=>e.jsx("option",{value:F.value,children:F.label},F.value))}):e.jsx("input",{type:"text",disabled:x,value:A[T.name]??(T.defaultValue||""),onChange:F=>f(I=>({...I,[T.name]:F.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),T.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:T.tooltip})]},T.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!x&&h(null),disabled:x,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:Q,disabled:!N||x,children:x?"Importing…":"Import"})]})]})}),j&&G&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:T=>{T.target===T.currentTarget&&H(!1)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:T=>T.stopPropagation(),children:e.jsx(xi,{jobData:j.data,onClose:()=>{var F,I;(((F=j.data.job)==null?void 0:F.status)==="DONE"||((I=j.data.job)==null?void 0:I.status)==="FAILED")&&(be.getState().removeBgJob(j.id),D(null)),H(!1)}})})}),k.map(({serviceCode:T,label:F,descriptors:I})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Qt,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:F})]})}),e.jsx("div",{className:"node-list",children:I.map(z=>{const v=os(z),{openIds:P=[],pinnedIds:J=[]}=q[v]||{};return e.jsx(mi,{descriptor:z,openItemIds:P,pinnedItemIds:J,openItemDataMap:s,ctx:L,onCreateNode:o,onOpenImport:($,U)=>{R(null),f({}),h({descriptor:$,action:U})}},v)})})]},T))]})}function xi({jobData:t,onClose:s}){const{job:n,results:r=[]}=t,a=n.status==="DONE"||n.status==="FAILED",o=r.reduce((c,p)=>(c[p.action]=(c[p.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${r.length} node${r.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,p])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",p]},c))}),r.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:r.map((c,p)=>e.jsxs("tr",{style:{borderTop:p>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||p))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:a?"Close":"Dismiss (job continues in background)"})})]})}const cn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function fi({nodeTypes:t,tx:s,txNodes:n,userId:r,activeNodeId:a,stateColorMap:o,onNavigate:i,canCreateNode:c,onCreateNode:p,onCommit:d,onRollback:u,onReleaseNode:b,showSettings:h,activeSettingsSection:N,onSettingsSectionChange:R,settingsSections:A,isDashboardOpen:f,onOpenDashboard:x,browseRefreshKey:m,openItems:y,openItemDataMap:g,style:j,toast:D}){const[G,H]=l.useState(null),B=(s==null?void 0:s.txId)||(s==null?void 0:s.ID)||(s==null?void 0:s.id),L=n||[],w=We.useMemo(()=>{const k=new Map;return(t||[]).forEach(q=>{const Q=q.id||q.ID;k.set(Q,{name:q.name||q.NAME||Q,color:q.color||q.COLOR||null,icon:q.icon||q.ICON||null})}),k},[t]);return e.jsx("aside",{className:"left-panel",style:j,children:h?e.jsx("div",{className:"settings-section-nav",children:(A||[]).map(k=>e.jsxs("div",{children:[e.jsx("div",{className:"settings-nav-group-label",children:k.groupLabel}),k.sections.map(({key:q,label:Q,icon:T})=>{const F=T?Na[T]:null;return e.jsxs("div",{className:`settings-nav-item${N===q?" active":""}`,onClick:()=>R(q),children:[F&&e.jsx(F,{size:13,strokeWidth:1.8,color:N===q?"var(--accent)":"var(--muted)"}),Q]},q)})]},k.groupKey))}):e.jsxs(e.Fragment,{children:[!f&&e.jsxs("button",{className:"panel-dash-btn",onClick:x,title:"Open dashboard",children:[e.jsx("span",{style:{opacity:.7,lineHeight:1},children:"⬡"}),"Dashboard"]}),c&&e.jsxs("div",{className:"panel-section-header",style:{flex:"0 0 auto"},children:[e.jsx("div",{style:{flex:1}}),e.jsx("button",{className:"panel-icon-btn",title:"Create new object",onClick:()=>p(),children:e.jsx(Fe,{size:13,color:"var(--accent)",strokeWidth:2.5})})]}),e.jsx("div",{style:{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column"},children:e.jsx(hi,{openItems:y,openItemDataMap:g,activeNodeId:a,stateColorMap:o,onNavigate:i,onCreateNode:p,toast:D})}),e.jsx(ui,{userId:r,activeNodeId:a,stateColorMap:o,onNavigate:i,refreshKey:m,panelSection:"INFO",toast:D}),e.jsxs("div",{className:"panel-section tx-panel",children:[e.jsxs("div",{className:"panel-section-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Bs,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsxs("span",{className:"panel-label",children:["Transaction",B&&e.jsxs("span",{className:"tx-id-badge",children:[B.slice(0,8),"…"]})]})]}),L.length>0&&e.jsx("span",{className:"tx-count-badge",children:L.length})]}),e.jsx("div",{className:"tx-list",children:B?L.length===0?e.jsxs("div",{className:"panel-empty",children:["Transaction open —",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"no objects checked out yet."})]}):L.map((k,q)=>{const Q=k.itemId||k.node_id||k.NODE_ID,T=k.logicalId||k.logical_id||k.LOGICAL_ID||"",F=k.nodeTypeName||k.node_type_name||k.NODE_TYPE_NAME||"",I=k.nodeTypeId||k.node_type_id||k.NODE_TYPE_ID||"",z=k.revision||k.REVISION||"A",v=k.iteration??k.ITERATION??1,P=(k.changeType||k.change_type||k.CHANGE_TYPE||"CONTENT").toUpperCase(),J=k.lifecycleStateId||k.lifecycle_state_id||k.LIFECYCLE_STATE_ID||"",$=cn[P]||cn.CONTENT,U=Q===a,K=G===Q,C=w.get(I),M=(C==null?void 0:C.color)||null,V=C!=null&&C.icon?Je[C.icon]:null;return K?e.jsxs("div",{className:"tx-item tx-item-confirm",onClick:W=>W.stopPropagation(),children:[e.jsx("span",{className:"tx-type-icon",children:V?e.jsx(V,{size:11,color:M||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:M||"var(--muted2)",display:"inline-block"}})}),e.jsxs("span",{className:"tx-confirm-msg",children:["Release ",T||Q,"?"]}),e.jsx("button",{className:"btn btn-danger btn-xs",onClick:()=>{b&&b(Q),H(null)},children:"Yes"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>H(null),children:"No"})]},q):e.jsxs("div",{className:`tx-item${U?" active":""}`,onClick:()=>i(Q,T||void 0,Dt),title:F,children:[e.jsx("span",{className:"tx-type-icon",children:V?e.jsx(V,{size:11,color:M||"var(--muted2)",strokeWidth:2}):M?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:M,display:"inline-block"}}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:"var(--muted2)",display:"inline-block"}})}),e.jsx("span",{className:"tx-logical",children:T||Q}),e.jsx("span",{className:"tx-reviter",style:{color:(o==null?void 0:o[J])||"var(--muted2)"},children:v===0?z:`${z}.${v}`}),e.jsx("span",{className:"tx-ct-badge",style:{background:$.bg,color:$.color},children:$.label}),e.jsx("button",{className:"tx-release-btn",title:"Release from transaction",onClick:W=>{W.stopPropagation(),H(Q)},children:e.jsx(Gr,{size:12,strokeWidth:2,color:"var(--muted)"})})]},q)}):e.jsxs("div",{className:"panel-empty",children:["No active transaction.",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"Checkout an object to begin."})]})}),B&&e.jsxs("div",{className:"tx-actions",children:[e.jsxs("button",{className:"btn btn-success btn-sm",style:{flex:1},onClick:d,children:[e.jsx(Bs,{size:12,strokeWidth:2}),"Commit"]}),e.jsxs("button",{className:"btn btn-danger btn-sm",onClick:u,children:[e.jsx(Hr,{size:12,strokeWidth:2}),"Rollback"]})]})]})]})})}const gi=We.memo(fi);function bi(t){return e.jsx(gi,{...t})}const dn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}},vi={PRIMARY:"var(--accent)",SECONDARY:"var(--muted)",DANGEROUS:"var(--danger)"};function Jn({revision:t,iteration:s}){const n=s===0?t:`${t}.${s}`;return e.jsx("span",{className:"dash-rev",children:n})}function Xn({lifecycleStateId:t,stateColorMap:s}){const n=(s==null?void 0:s[t])||"#6b7280";return e.jsx("span",{className:"dash-state-dot",style:{background:n},title:t})}function Yn({nodeTypeId:t,nodeTypeName:s,nodeTypes:n}){const r=(n||[]).find(c=>(c.id||c.ID)===t),a=(r==null?void 0:r.color)||(r==null?void 0:r.COLOR)||null,o=(r==null?void 0:r.icon)||(r==null?void 0:r.ICON)||null,i=o?Je[o]:null;return e.jsxs("span",{className:"dash-type-chip",children:[i?e.jsx(i,{size:9,color:a||"var(--muted2)",strokeWidth:2}):a?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:a,display:"inline-block",flexShrink:0}}):null,e.jsx("span",{style:{color:"var(--muted2)"},children:s||t})]})}function yi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){var b,h,N,R;const[a,o]=l.useState(void 0),[i,c]=l.useState(!0),[p,d]=l.useState(null),u=l.useCallback(async()=>{c(!0),d(null);try{const A=await ee.getDashboardTransaction(t);o(A||null)}catch(A){d(A.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{u()},[u]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Open transaction"}),e.jsx("button",{className:"dash-refresh-btn",onClick:u,title:"Refresh",disabled:i,children:e.jsx("span",{style:{display:"inline-block",transform:"none"},children:"⟳"})})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),p&&e.jsx("div",{className:"dash-error",children:p}),!i&&!p&&!a&&e.jsx("div",{className:"dash-empty",children:"No open transaction"}),!i&&!p&&a&&e.jsxs("div",{className:"dash-tx-card",children:[e.jsxs("div",{className:"dash-tx-header",children:[e.jsxs("span",{className:"dash-tx-id",children:[(b=a.txId)==null?void 0:b.slice(0,8),"…"]}),e.jsx("span",{className:"dash-tx-title",children:a.title}),e.jsxs("span",{className:"dash-tx-count",children:[((h=a.nodes)==null?void 0:h.length)||0," object",((N=a.nodes)==null?void 0:N.length)!==1?"s":""]})]}),((R=a.nodes)==null?void 0:R.length)>0&&e.jsx("div",{className:"dash-tx-nodes",children:a.nodes.map(A=>{const f=dn[(A.changeType||"CONTENT").toUpperCase()]||dn.CONTENT;return e.jsxs("button",{className:"dash-tx-node",onClick:()=>r(A.nodeId,A.logicalId||A.nodeId,Dt),children:[e.jsx(Xn,{lifecycleStateId:A.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:A.logicalId||A.nodeId}),e.jsx(Jn,{revision:A.revision,iteration:A.iteration}),e.jsx(Yn,{nodeTypeId:A.nodeTypeId,nodeTypeName:A.nodeTypeName,nodeTypes:n}),e.jsx("span",{className:"dash-badge",style:{background:f.bg,color:f.color},children:f.label})]},A.nodeId)})})]})]})}function ji({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){const[a,o]=l.useState(null),[i,c]=l.useState(!0),[p,d]=l.useState(null),u=l.useCallback(async()=>{c(!0),d(null);try{const b=await ee.getDashboardWorkItems(t);o(Array.isArray(b)?b:[])}catch(b){d(b.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{u()},[u]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Objects you can work on"}),e.jsx("span",{className:"dash-section-hint",children:"last 10 · sorted by available actions"}),e.jsx("button",{className:"dash-refresh-btn",onClick:u,title:"Refresh",disabled:i,children:"⟳"})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),p&&e.jsx("div",{className:"dash-error",children:p}),!i&&!p&&(a==null?void 0:a.length)===0&&e.jsx("div",{className:"dash-empty",children:"No actionable objects found"}),!i&&!p&&(a==null?void 0:a.length)>0&&e.jsx("div",{className:"dash-work-list",children:a.map(b=>e.jsxs("button",{className:"dash-work-item",onClick:()=>r(b.nodeId,b.logicalId||b.nodeId,Dt),children:[e.jsxs("div",{className:"dash-work-row",children:[e.jsx(Xn,{lifecycleStateId:b.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:b.logicalId||b.nodeId}),e.jsx(Jn,{revision:b.revision,iteration:b.iteration}),e.jsx(Yn,{nodeTypeId:b.nodeTypeId,nodeTypeName:b.nodeTypeName,nodeTypes:n})]}),e.jsx("div",{className:"dash-action-chips",children:b.actions.map(h=>{var A,f;const N=((A=h.guardViolations)==null?void 0:A.length)>0,R=N?"Blocked: "+h.guardViolations.map(x=>x.message||x.code).join("; "):h.description||h.label;return e.jsx("span",{className:"dash-action-chip",title:R,style:{color:vi[(f=h.metadata)==null?void 0:f.displayCategory]||"var(--muted)",opacity:N?.45:1},children:h.label},h.code)})})]},b.nodeId))})]})}function wi({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}){return e.jsxs("div",{className:"dashboard",children:[e.jsxs("div",{className:"dash-hero",children:[e.jsx("span",{className:"dash-hero-icon",children:"⬡"}),e.jsxs("div",{children:[e.jsx("div",{className:"dash-hero-title",children:"Dashboard"}),e.jsx("div",{className:"dash-hero-sub",children:"Quick overview of your work session"})]})]}),e.jsxs("div",{className:"dash-body",children:[e.jsx(yi,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r}),e.jsx(ji,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:r})]})]})}function ki({tabs:t,activeTabId:s,userId:n,tx:r,toast:a,nodeTypes:o,stateColorMap:i,onTabActivate:c,onTabClose:p,onTabPin:d,onSubTabChange:u,onNavigate:b,onAutoOpenTx:h,onDescriptionLoaded:N,onRefreshItemData:R,onOpenCommentsForVersion:A,onCommentAttribute:f,tabItemData:x}){const m=be(K=>K.showCollab),y=be(K=>K.toggleCollab),g="dashboard",j=t.find(K=>K.id===s),D=!!(j!=null&&j.nodeId),[G,H]=l.useState({}),B=l.useRef(null),L=l.useRef({});l.useEffect(()=>{var C,M;const K=new Set(t.map(V=>V.id));H(V=>Object.fromEntries(Object.entries(V).filter(([W])=>K.has(W))));for(const V of Object.keys(L.current))K.has(V)||((M=(C=L.current)[V])==null||M.call(C),delete L.current[V])},[t]),l.useEffect(()=>()=>{var K,C;s&&((C=(K=L.current)[s])==null||C.call(K),delete L.current[s])},[s]);const w=s?G[s]??{data:null,closed:!0,maximized:!1,splitPos:50}:null;function k(K){s&&H(C=>({...C,[s]:{closed:!0,maximized:!1,splitPos:50,...C[s],...K}}))}function q(K){s&&H(C=>({...C,[s]:{closed:!0,maximized:!1,splitPos:50,...C[s],data:K}}))}function Q(K){var C,M;s&&((M=(C=L.current)[s])==null||M.call(C),L.current[s]=K)}function T(K){K.preventDefault();const C=B.current;if(!C)return;function M(W){const Y=C.getBoundingClientRect();k({splitPos:Math.max(20,Math.min(80,(W.clientX-Y.left)/Y.width*100))})}function V(){window.removeEventListener("mousemove",M),window.removeEventListener("mouseup",V)}window.addEventListener("mousemove",M),window.addEventListener("mouseup",V)}const F=j&&j.id!==g?Ca(j):null,I=j&&j.id!==g?Za(j)??F:null,z=(F==null?void 0:F.Preview)??null,v=(F==null?void 0:F.previewLabel)??"Preview",P=!!z,J=(w==null?void 0:w.closed)??!1,$=(w==null?void 0:w.maximized)??!1,U=(w==null?void 0:w.splitPos)??50;return e.jsx("div",{className:"editor-area",children:e.jsxs("div",{className:"editor-main",children:[e.jsxs("div",{className:"tab-bar",children:[t.length===0?e.jsx("div",{className:"tab-bar-empty",children:"Open an object from the navigation panel"}):t.map(K=>{var oe;const C=K.id===g,M=K.nodeTypeId?(o||[]).find(S=>(S.id||S.ID)===K.nodeTypeId):null,V=(M==null?void 0:M.color)||(M==null?void 0:M.COLOR)||null,W=(M==null?void 0:M.icon)||(M==null?void 0:M.ICON)||null,Y=W?Je[W]:null;return e.jsxs("div",{className:`editor-tab ${K.id===s?"active":""}`,onClick:()=>c(K.id),children:[C&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0,opacity:.6},children:"⬡"}),!C&&(Y||V)&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:Y?e.jsx(Y,{size:10,color:V||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:V,display:"inline-block"}})}),e.jsx("span",{className:"tab-node-id",children:K.label||((oe=K.nodeId)==null?void 0:oe.slice(0,10))+"…"}),e.jsx("button",{className:`tab-pin ${K.pinned?"active":""}`,title:K.pinned?"Unpin tab":"Pin tab",onClick:S=>{S.stopPropagation(),d(K.id)},children:K.pinned?e.jsx(ss,{size:11,color:"var(--accent)",strokeWidth:2}):e.jsx(ts,{size:11,color:"var(--muted)",strokeWidth:2})}),e.jsx("button",{className:"tab-close",title:"Close tab",onClick:S=>{S.stopPropagation(),p(K.id)},children:e.jsx(xt,{size:11,color:"var(--muted)",strokeWidth:2.5})})]},K.id)}),t.length>0&&e.jsx("div",{className:"tab-add",title:"Pin a tab or navigate to open a new one",children:e.jsx(Fe,{size:13,color:"var(--muted)",strokeWidth:2})}),D&&e.jsx("button",{className:`tab-comments-toggle${m?" active":""}`,onClick:y,title:m?"Hide comments":"Show comments",children:"💬"})]}),e.jsxs("div",{ref:B,style:{flex:1,display:"flex",overflow:"hidden",minHeight:0},children:[e.jsx("div",{className:"editor-content",style:P?{width:J?"calc(100% - 28px)":$?0:`${U}%`,flex:"none",overflow:$?"hidden":void 0,transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"}:void 0,children:j?j.id===g?e.jsx(wi,{userId:n,stateColorMap:i,nodeTypes:o,onNavigate:b}):(()=>{const K=(I==null?void 0:I.Editor)??(I==null?void 0:I.Component),C={userId:n,tx:r,nodeTypes:o,stateColorMap:i,toast:a,onAutoOpenTx:h,onDescriptionLoaded:N,onRefreshItemData:R,onOpenCommentsForVersion:A,onCommentAttribute:f,onSubTabChange:u,onNavigate:b,onRegisterPreview:q,onRegisterCancel:Q,itemData:x};return K?e.jsx(K,{tab:j,ctx:C}):e.jsx("div",{className:"editor-empty",children:e.jsx("div",{className:"editor-empty-text",children:"Loading editor…"})})})():e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⬡"}),e.jsx("div",{className:"editor-empty-text",children:"No object open"}),e.jsx("div",{className:"editor-empty-hint",children:"Select an object in the navigation panel to open it here"})]})}),P&&(J?e.jsx("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderLeft:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--surface)",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onClick:()=>k({closed:!1}),title:`Open ${v}`,children:e.jsxs("span",{style:{writingMode:"vertical-rl",fontSize:11,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1},children:[v," ▶"]})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{width:$?0:5,cursor:"col-resize",background:"var(--border)",flexShrink:0,userSelect:"none",overflow:"hidden",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onMouseDown:$?void 0:T}),e.jsxs("div",{style:{flex:1,minWidth:0,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1},children:[e.jsx("span",{children:v}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:2},children:[e.jsx("button",{className:"panel-icon-btn",title:$?"Restore":`Maximize ${v}`,onClick:()=>k({maximized:!$}),children:$?e.jsx(Vr,{size:13}):e.jsx(qr,{size:13})}),e.jsx("button",{className:"panel-icon-btn",title:`Collapse ${v}`,onClick:()=>k({closed:!0}),children:e.jsx(xt,{size:13})})]})]}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(z,{data:(w==null?void 0:w.data)??null,tab:j,ctx:{userId:n,tx:r,nodeTypes:o,stateColorMap:i,toast:a,onAutoOpenTx:h,onDescriptionLoaded:N,onRefreshItemData:R,onOpenCommentsForVersion:A,onCommentAttribute:f,onSubTabChange:u,onNavigate:b,onRegisterPreview:q,itemData:x}})})]})]}))]})]})})}function Si(t){const s=be(a=>a.openCollab),n=be(a=>a.setVersionFilter),r=be(a=>a.setTriggerText);return e.jsx(ki,{...t,onOpenCommentsForVersion:a=>{n(a),s()},onCommentAttribute:a=>{r("#"+a+" "),s()}})}function Ni(t){const s={};t.forEach(a=>{s[a.id]={...a,children:[]}});const n=[];t.forEach(a=>{a.parentCommentId&&s[a.parentCommentId]?s[a.parentCommentId].children.push(s[a.id]):n.push(s[a.id])});function r(a){a.sort((o,i)=>new Date(o.createdAt)-new Date(i.createdAt)),a.forEach(o=>r(o.children))}return r(n),n}function Ci(t){const s=t.match(/#(\S+)/);return s?s[1]:null}function Ei(t,s){const n=t.slice(0,s);for(let r=n.length-1;r>=0;r--){const a=n[r];if(a==="#"||a==="@"){if(r===0||/\s/.test(n[r-1])){const o=n.slice(r+1);if(!/\s/.test(o))return{type:a,query:o,start:r}}return null}if(/\s/.test(a))return null}return null}function Ti({text:t,attrMap:s,userMap:n}){const r=[],a=/(#\S+|@\S+)/g;let o=0,i;for(;(i=a.exec(t))!==null;){i.index>o&&r.push({kind:"text",value:t.slice(o,i.index)});const c=i[0];if(c.startsWith("#")){const p=c.slice(1),d=s[p];r.push({kind:"attr",id:p,label:d})}else{const p=c.slice(1),d=n[p];r.push({kind:"user",id:p,name:d})}o=i.index+c.length}return o<t.length&&r.push({kind:"text",value:t.slice(o)}),e.jsx("span",{children:r.map((c,p)=>c.kind==="text"?e.jsx("span",{children:c.value},p):c.kind==="attr"?e.jsxs("span",{className:"mention-chip mention-attr",title:`Attribute: ${c.id}`,children:["#",c.label||c.id]},p):e.jsxs("span",{className:"mention-chip mention-user",title:`User: ${c.id}`,children:["@",c.name||c.id]},p))})}function zi({items:t,activeIdx:s,onSelect:n,onHover:r}){return e.jsx("ul",{className:"autocomplete-dropdown",children:t.map((a,o)=>e.jsxs("li",{className:`autocomplete-item${o===s?" active":""}`,onMouseEnter:()=>r(o),onMouseDown:i=>{i.preventDefault(),n(a)},children:[e.jsxs("span",{className:"autocomplete-item-id",children:[a.prefix,a.id]}),a.label&&e.jsx("span",{className:"autocomplete-item-label",children:a.label})]},a.id))})}function Ii({nodeId:t,userId:s,width:n,onClose:r,filterVersionId:a,onClearFilter:o,users:i,triggerText:c,onClearTrigger:p,versionId:d,attributes:u,revision:b,iteration:h}){const[N,R]=l.useState([]),[A,f]=l.useState(""),[x,m]=l.useState(null),[y,g]=l.useState(!1),[j,D]=l.useState(null),[G,H]=l.useState(0),B=l.useRef(null),L=l.useMemo(()=>{const $={};return(u||[]).forEach(U=>{$[U.id]=U.label}),$},[u]),w=l.useMemo(()=>{const $={};return(i||[]).forEach(U=>{$[U.id]=U.displayName||U.username}),$},[i]),k=l.useMemo(()=>{if(!j)return[];const $=j.query.toLowerCase();return j.type==="#"?(u||[]).filter(U=>U.id.toLowerCase().includes($)||U.label.toLowerCase().includes($)).slice(0,8).map(U=>({id:U.id,label:U.label,prefix:"#"})):(i||[]).filter(U=>U.id.toLowerCase().includes($)||(U.displayName||U.username||"").toLowerCase().includes($)).slice(0,8).map(U=>({id:U.id,label:U.displayName||U.username,prefix:"@"}))},[j,u,i]),q=l.useCallback(async()=>{if(t)try{const $=await ee.getComments(s,t);R(Array.isArray($)?$:[])}catch{}},[t,s]);l.useEffect(()=>{q()},[q]),_a($=>{$.nodeId&&$.nodeId!==t||$.event==="COMMENT_ADDED"&&q()}),l.useEffect(()=>{c&&(f(c),p==null||p(),setTimeout(()=>{const $=B.current;$&&($.focus(),$.setSelectionRange(c.length,c.length))},50))},[c]),l.useEffect(()=>{m(null),f(""),D(null)},[t]);const Q=l.useMemo(()=>Ni(N),[N]),T=l.useMemo(()=>a?Q.filter($=>$.versionId===a):Q,[Q,a]),F=l.useMemo(()=>{function $(U){return U.reduce((K,C)=>K+1+$(C.children),0)}return $(T)},[T]);function I($){const U=$.target.value,K=$.target.selectionStart;f(U);const C=Ei(U,K);D(C),H(0)}function z($){if(!j)return;const U=A.slice(0,j.start),K=A.slice(j.start+1+j.query.length),C=$.prefix+$.id+" ",M=U+C+K;f(M),D(null),setTimeout(()=>{const V=B.current;if(V){const W=U.length+C.length;V.focus(),V.setSelectionRange(W,W)}},0)}function v($){if(j&&k.length>0){if($.key==="ArrowDown"){$.preventDefault(),H(U=>Math.min(U+1,k.length-1));return}if($.key==="ArrowUp"){$.preventDefault(),H(U=>Math.max(U-1,0));return}if($.key==="Enter"||$.key==="Tab"){$.preventDefault(),z(k[G]);return}if($.key==="Escape"){D(null);return}}$.key==="Enter"&&$.ctrlKey&&A.trim()&&P()}async function P(){if(!(!A.trim()||!d)){g(!0);try{const $=Ci(A.trim());await ee.addComment(s,t,d,A.trim(),(x==null?void 0:x.id)||null,$||null),f(""),m(null),D(null),await q()}catch{}finally{g(!1)}}}const J=b!=null?`${b??""}${h!=null?"."+h:""}`:"";return e.jsxs("div",{className:"comment-panel",style:{width:n},onClick:()=>j&&D(null),children:[e.jsxs("div",{className:"comment-panel-header",children:[e.jsxs("span",{children:["Comments",N.length>0&&e.jsx("span",{className:"comment-count-badge",children:N.length})]}),e.jsx("button",{className:"comment-close-btn",onClick:r,title:"Close",children:"✕"})]}),a&&e.jsxs("div",{className:"comment-filter-banner",children:[e.jsxs("span",{children:["Filtered: rev ",(()=>{const $=N.find(U=>U.versionId===a);return $?`${$.revision}.${$.iteration}`:a.slice(0,8)+"…"})()," · ",F," comment",F!==1?"s":""]}),e.jsx("button",{className:"comment-filter-clear",onClick:o,children:"Show all"})]}),e.jsx("div",{className:"comment-panel-list",children:T.length===0?e.jsx("div",{className:"comment-empty",children:a?"No comments on this version":"No comments yet"}):T.map($=>e.jsx(Zn,{node:$,depth:0,onReply:m,activeReplyId:x==null?void 0:x.id,userId:s,attrMap:L,userMap:w},$.id))}),e.jsxs("div",{className:"comment-panel-input",onClick:$=>$.stopPropagation(),children:[d&&J&&e.jsxs("div",{className:"comment-version-context",children:["Commenting on rev ",e.jsx("strong",{children:J})]}),x&&e.jsxs("div",{className:"comment-reply-context",children:[e.jsxs("span",{children:["↩ Replying to ",e.jsx("strong",{children:x.author})]}),e.jsx("button",{className:"comment-cancel-reply",onClick:()=>m(null),children:"✕"})]}),e.jsxs("div",{className:"comment-input-wrap",children:[e.jsx("textarea",{ref:B,className:"field-input comment-textarea",rows:3,placeholder:d?"Write a comment… (# attr, @ user, Ctrl+Enter to post)":"No version available",value:A,onChange:I,onKeyDown:v,disabled:!d||y}),j&&k.length>0&&e.jsx(zi,{items:k,activeIdx:G,onSelect:z,onHover:H})]}),e.jsx("button",{className:"btn btn-sm btn-success comment-post-btn",disabled:!A.trim()||!d||y,onClick:P,children:x?"↩ Post reply":"Post comment"})]})]})}const Ai=72,$i=16;function Zn({node:t,depth:s,onReply:n,activeReplyId:r,userId:a,attrMap:o,userMap:i}){const c=Math.min(s*$i,Ai),p=r===t.id;return e.jsxs("div",{style:{marginLeft:s>0?c:0},children:[e.jsx(Ri,{comment:t,onReply:n,isReply:s>0,isHighlighted:p,isOwn:t.author===a,attrMap:o,userMap:i}),t.children.length>0&&e.jsx("div",{className:"comment-children",style:{borderLeft:"2px solid var(--border2)",marginLeft:10},children:t.children.map(d=>e.jsx(Zn,{node:d,depth:s+1,onReply:n,activeReplyId:r,userId:a,attrMap:o,userMap:i},d.id))})]})}function Ri({comment:t,onReply:s,isReply:n,isHighlighted:r,isOwn:a,attrMap:o,userMap:i}){const c=t.createdAt?new Date(t.createdAt).toLocaleString(void 0,{dateStyle:"short",timeStyle:"short"}):"",p=["comment-item",n?"comment-reply":"",r?"comment-highlighted":"",a?"comment-own":""].filter(Boolean).join(" ");return e.jsxs("div",{className:p,children:[e.jsxs("div",{className:"comment-meta",children:[e.jsxs("span",{className:a?"comment-author comment-author-own":"comment-author",children:[t.author,a&&e.jsx("span",{className:"comment-you-badge",children:"you"})]}),t.attributeName&&e.jsxs("span",{className:"comment-attr-badge",title:`Attribute: ${t.attributeName}`,children:["#",o[t.attributeName]||t.attributeName]}),e.jsxs("span",{className:"comment-version",title:`Version ID: ${t.versionId}`,children:[t.revision,".",t.iteration]}),e.jsx("span",{className:"comment-time",children:c})]}),e.jsx("div",{className:"comment-text",children:e.jsx(Ti,{text:t.text,attrMap:o,userMap:i})}),e.jsx("button",{className:"comment-reply-btn",onClick:()=>s({id:t.id,author:t.author}),children:"↩ Reply"})]})}function Pi({activeNodeId:t,userId:s,users:n,activeNodeDesc:r}){var m,y,g;const a=be(j=>j.showCollab),o=be(j=>j.collabWidth),i=be(j=>j.setCollabWidth),c=be(j=>j.closeCollab),p=be(j=>j.collabVersionFilter),d=be(j=>j.setVersionFilter),u=be(j=>j.collabTriggerText),b=be(j=>j.clearTriggerText),h=be(j=>j.collabTabs),N=l.useCallback(j=>{const D=j.clientX,G=o;function H(L){i(Math.max(240,Math.min(560,G+D-L.clientX)))}function B(){document.removeEventListener("mousemove",H),document.removeEventListener("mouseup",B)}document.addEventListener("mousemove",H),document.addEventListener("mouseup",B)},[o,i]),R=((m=r==null?void 0:r.metadata)==null?void 0:m.currentVersionId)??null,A=((y=r==null?void 0:r.metadata)==null?void 0:y.revision)??null,f=((g=r==null?void 0:r.metadata)==null?void 0:g.iteration)??null,x=l.useMemo(()=>{var D;const j=((D=r==null?void 0:r.metadata)==null?void 0:D.attributeMeta)||{};return((r==null?void 0:r.fields)||[]).filter(G=>j[G.name]).map(G=>({id:G.name,label:G.label}))},[r]);return!a||!t?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"resize-handle comment-resize",onMouseDown:N}),e.jsx(Ii,{nodeId:t,userId:s,width:o,onClose:c,filterVersionId:p,onClearFilter:()=>d(null),users:n,triggerText:u,onClearTrigger:b,versionId:R,attributes:x,revision:A,iteration:f}),h.map(j=>e.jsx("div",{style:{display:"none"}},j.id))]})}const Li={error:"var(--danger, #fc8181)",warn:"var(--warning, #f0b429)",info:"var(--muted)",debug:"var(--muted2)"};function Bi(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function pn(){const t=be(n=>n.consoleLog),s=l.useRef(null);return l.useEffect(()=>{var n;(n=s.current)==null||n.scrollIntoView({behavior:"smooth"})},[t.length]),t.length===0?e.jsx("div",{style:{padding:"16px",color:"var(--muted)",fontSize:12,fontStyle:"italic"},children:"No platform events yet."}):e.jsxs("div",{style:{fontFamily:"monospace",fontSize:11,overflow:"auto",height:"100%",padding:"4px 8px"},children:[t.map((n,r)=>{var a;return e.jsxs("div",{style:{display:"flex",gap:8,lineHeight:"18px"},children:[e.jsx("span",{style:{color:"var(--muted2)",flexShrink:0},children:Bi(n.ts)}),e.jsx("span",{style:{color:Li[n.level]??"inherit",flexShrink:0,width:40},children:(a=n.level)==null?void 0:a.toUpperCase()}),e.jsx("span",{style:{wordBreak:"break-all"},children:n.message})]},r)}),e.jsx("div",{ref:s})]})}function Mi(){var d;const t=be(u=>u.consoleVisible),s=be(u=>u.consoleHeight),n=be(u=>u.setConsoleHeight),r=be(u=>u.consoleTabs),[a,o]=l.useState("console"),i=[{id:"console",label:"Console",Component:pn},...r],c=l.useCallback(u=>{u.preventDefault();const b=u.clientY,h=s;function N(A){n(Math.max(80,Math.min(600,h+b-A.clientY)))}function R(){document.removeEventListener("mousemove",N),document.removeEventListener("mouseup",R)}document.addEventListener("mousemove",N),document.addEventListener("mouseup",R)},[s,n]);if(!t)return null;const p=((d=i.find(u=>u.id===a))==null?void 0:d.Component)??pn;return e.jsxs("div",{style:{height:s,flexShrink:0,display:"flex",flexDirection:"column",borderTop:"1px solid var(--border)"},children:[e.jsx("div",{style:{height:4,cursor:"row-resize",background:"var(--border)",flexShrink:0},onMouseDown:c}),e.jsx("div",{style:{display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:i.map(u=>e.jsx("button",{onClick:()=>o(u.id),style:{padding:"4px 12px",fontSize:11,fontWeight:a===u.id?600:400,color:a===u.id?"var(--fg)":"var(--muted)",background:"none",border:"none",borderBottom:a===u.id?"2px solid var(--accent)":"2px solid transparent",cursor:"pointer"},children:u.label},u.id))}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(p,{})})]})}const Oi=[];function Di(){return[...Oi]}const ms={},_i=1e4,qt=3e4,Wi=1e3,Fi=(ms==null?void 0:ms.VITE_JAEGER_URL)||"http://localhost:16686",ws=100,Jt=1e3;function un(t,s=0){if(t==null||Number.isNaN(t))return"hsl(210, 10%, 55%)";s>0&&t<Jt&&(t=Math.max(t,Jt*.75));const n=Math.max(0,Math.min(1,(t-ws)/(Jt-ws))),r=150-150*n,a=60+25*n,o=55-5*n;return`hsl(${r.toFixed(0)}, ${a.toFixed(0)}%, ${o.toFixed(0)}%)`}function mn(t,s){return s===0?"IDLE":t<ws?"FAST":t<400?"OK":t<Jt?"SLOW":"BAD"}const kt={up:{dot:"#4dd4a0",label:"UP"},degraded:{dot:"#f0b429",label:"DEGRADED"},down:{dot:"#fc8181",label:"DOWN"},unknown:{dot:"#6b8099",label:"UNKNOWN"}};function Ui(t){return t==null?"—":t<60?`${t}s`:t<3600?`${Math.floor(t/60)}m`:`${Math.floor(t/3600)}h`}function Gi(t){if(t==null)return"—";const s=Math.floor(t/3600),n=Math.floor(t%3600/60),r=t%60;return s?`${s}h ${n}m`:n?`${n}m ${r}s`:`${r}s`}function Pe(t){return t==null||Number.isNaN(t)?"—":t<10?`${t.toFixed(1)}ms`:t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(2)}s`}function At(t){return t==null?"—":t<1e3?String(t):t<1e6?`${(t/1e3).toFixed(1)}K`:`${(t/1e6).toFixed(1)}M`}function Ye(t){return t==null?"—":t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`}function st(t){return t<100?"lat-fast":t<400?"lat-ok":t<1e3?"lat-slow":"lat-bad"}function Hi({sorted:t}){if(!t||t.length<2)return e.jsx("div",{className:"perf-chart-empty",children:"Need at least 2 calls to plot distribution."});const s=600,n=90,r=34,a=6,o=8,i=18,c=s-r-a,p=n-o-i,d=t[t.length-1]||1,u=x=>r+c*x/(t.length-1),b=x=>o+p-p*x/d;let h="";for(let x=0;x<t.length;x++){const m=u(x).toFixed(1),y=b(t[x]).toFixed(1);h+=(x===0?"M":"L")+m+","+y+" "}const N=h+`L${u(t.length-1).toFixed(1)},${(o+p).toFixed(1)} L${r},${(o+p).toFixed(1)} Z`,R=[.5,.75,.9,.95,.99],A=x=>{const m=Math.min(t.length-1,Math.floor(t.length*x));return{p:x,v:t[m],x:u(m),y:b(t[m])}},f=[0,d/2,d];return e.jsxs("svg",{viewBox:`0 0 ${s} ${n}`,className:"perf-chart",preserveAspectRatio:"none",children:[f.map((x,m)=>{const y=b(x);return e.jsxs("g",{children:[e.jsx("line",{x1:r,y1:y,x2:s-a,y2:y,stroke:"var(--border)",strokeWidth:"0.5",strokeDasharray:"2,3"}),e.jsx("text",{x:r-4,y:y+3,textAnchor:"end",fontSize:"9",fill:"var(--muted2)",fontFamily:"var(--mono)",children:Pe(x)})]},m)}),e.jsx("path",{d:N,fill:"rgba(106,172,255,0.18)"}),e.jsx("path",{d:h,stroke:"#6aacff",strokeWidth:"1.5",fill:"none"}),R.map(x=>{const m=A(x);return e.jsxs("g",{children:[e.jsx("line",{x1:m.x,y1:o,x2:m.x,y2:o+p,stroke:"#f0b429",strokeWidth:"0.6",strokeDasharray:"1,3",opacity:"0.65"}),e.jsx("circle",{cx:m.x,cy:m.y,r:"2",fill:"#f0b429"}),e.jsxs("text",{x:m.x,y:n-5,textAnchor:"middle",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:["p",Math.round(x*100)]})]},x)}),e.jsx("text",{x:r,y:n-5,textAnchor:"start",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p0"}),e.jsx("text",{x:s-a,y:n-5,textAnchor:"end",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p100"})]})}function Vi({showSettings:t,onToggleSettings:s,consoleVisible:n,onToggleConsole:r,leftSlots:a=[],rightSlots:o=[]}){const[i,c]=l.useState(null),[p,d]=l.useState(null),[u,b]=l.useState(!1),[h,N]=l.useState("services"),[R,A]=l.useState(null),[f,x]=l.useState(null),[m,y]=l.useState(_t()),[g,j]=l.useState(()=>Wt(qt));l.useEffect(()=>{j(Wt(qt));const k=setInterval(()=>j(Wt(qt)),Wi),q=Ds(()=>j(Wt(qt)));return()=>{clearInterval(k),q()}},[]);const D=l.useCallback(async()=>{try{const k=await mt.getStatus();c(k),d(null)}catch(k){d(k.message||String(k))}},[]);l.useEffect(()=>{D();const k=setInterval(D,_i);return()=>clearInterval(k)},[D]),l.useEffect(()=>u?(y(_t()),Ds(()=>y(_t()))):void 0,[u]);const G=l.useCallback(async()=>{try{const k=await mt.getNatsStatus();A(k),x(null)}catch(k){x(k.message||String(k))}},[]);l.useEffect(()=>{if(!u||h!=="nats")return;G();const k=setInterval(G,5e3);return()=>clearInterval(k)},[u,h,G]);const H=Vo(),B=l.useMemo(()=>Di(),[]),L=p?"down":(i==null?void 0:i.overall)||"unknown",w=kt[L]||kt.unknown;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-bar-row",children:[s&&e.jsxs("button",{type:"button",className:`status-bar-settings${t?" active":""}`,onClick:s,title:"Settings",children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]}),e.jsx("span",{children:"Settings"})]}),r&&e.jsxs("button",{type:"button",className:`status-bar-settings${n?" active":""}`,onClick:r,title:n?"Hide console":"Show console",style:{marginLeft:4},children:[e.jsx("span",{style:{fontSize:11},children:"≡"}),e.jsx("span",{children:"Console"})]}),a.map(k=>e.jsx(k.Component,{},k.id)),e.jsxs("button",{type:"button",className:"status-bar",onClick:()=>b(!0),title:"Click for platform status + API perf",children:[e.jsx("span",{className:"status-dot",style:{background:w.dot}}),e.jsx("span",{className:"status-label",children:"PLATFORM"}),e.jsx("span",{className:"status-value",style:{color:w.dot},children:w.label}),(i==null?void 0:i.services)&&e.jsxs("span",{className:"status-count",children:[i.services.filter(k=>k.healthy).length,"/",i.services.length," svc",i.totalInstances!=null&&e.jsxs(e.Fragment,{children:[" · ",i.totalHealthyInstances,"/",i.totalInstances," inst"]})]}),e.jsxs("span",{className:"perf-chip",style:{background:un(g.p95,g.errorCount)},title:`30s window: ${g.count} calls · p95 ${Pe(g.p95)} · avg ${Pe(g.avgMs)}${g.errorCount?` · ${g.errorCount} err`:""}`,children:[e.jsx("span",{className:"perf-chip-dot"}),mn(g.p95,g.count),g.count>0&&e.jsx("span",{className:"perf-chip-val",children:Pe(g.p95)})]}),H.cacheBytes>0&&e.jsxs("span",{className:"cache-chip",title:`3D cache: ${H.entries} part${H.entries!==1?"s":""} · ${Ye(H.cacheBytes)} / ${Ye(H.maxBytes)}`,children:["3D · ",Ye(H.cacheBytes)]})]})]}),u&&e.jsx("div",{className:"status-modal-overlay",onClick:()=>b(!1),children:e.jsxs("div",{className:"status-modal",onClick:k=>k.stopPropagation(),role:"dialog","aria-label":"Platform status",children:[e.jsxs("div",{className:"status-modal-header",children:[e.jsx("h3",{children:"Platform Status"}),e.jsxs("a",{className:"status-modal-jaeger",href:Fi,target:"_blank",rel:"noopener noreferrer",title:"Open Jaeger tracing UI",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),e.jsx("polyline",{points:"15 3 21 3 21 9"}),e.jsx("line",{x1:"10",y1:"14",x2:"21",y2:"3"})]}),e.jsx("span",{children:"Traces"})]}),e.jsx("button",{className:"status-modal-close",onClick:()=>b(!1),"aria-label":"Close",children:"×"})]}),e.jsxs("div",{className:"status-tabs",children:[e.jsx("button",{className:`status-tab${h==="services"?" status-tab-active":""}`,onClick:()=>N("services"),children:"Services"}),e.jsxs("button",{className:`status-tab${h==="perf"?" status-tab-active":""}`,onClick:()=>N("perf"),children:["API Perf (",m.overall.total,")"]}),e.jsx("button",{className:`status-tab${h==="nats"?" status-tab-active":""}`,onClick:()=>N("nats"),children:"NATS"}),e.jsx("button",{className:`status-tab${h==="workers"?" status-tab-active":""}`,onClick:()=>N("workers"),children:"3D Workers"}),B.map(k=>e.jsx("button",{className:`status-tab${h===k.key?" status-tab-active":""}`,onClick:()=>N(k.key),children:k.label},k.key))]}),h==="services"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[e.jsx("span",{className:"status-dot",style:{background:w.dot}}),e.jsx("span",{className:"status-modal-overall",style:{color:w.dot},children:w.label}),(i==null?void 0:i.gatewayVersion)&&e.jsxs("span",{className:"status-modal-uptime",children:["spe-api ",e.jsx("code",{children:i.gatewayVersion})]}),(i==null?void 0:i.gatewayUptimeSeconds)!=null&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",Gi(i.gatewayUptimeSeconds)]}),e.jsx("button",{className:"status-modal-refresh",onClick:D,children:"refresh"})]}),p&&e.jsxs("div",{className:"status-modal-error",children:["Gateway unreachable: ",p]}),e.jsxs("table",{className:"status-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service / Instance"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Path"}),e.jsx("th",{children:"Affinity"}),e.jsx("th",{children:"Last HB"}),e.jsx("th",{children:"Failures"})]})}),e.jsx("tbody",{children:((i==null?void 0:i.services)||[]).flatMap(k=>{const q=k.status||(k.healthy?"up":"down"),Q=kt[q]||kt.unknown,T=e.jsxs("tr",{className:"status-row-service",children:[e.jsxs("td",{children:[e.jsx("code",{children:k.serviceCode}),k.instanceCount!=null&&e.jsxs("span",{className:"status-inst-badge",title:"healthy / total instances",children:[k.healthyInstances,"/",k.instanceCount," inst"]})]}),e.jsx("td",{children:k.version?e.jsx("code",{children:k.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:Q.dot}}),e.jsx("span",{style:{color:Q.dot},children:Q.label})]}),e.jsx("td",{children:k.path?e.jsx("code",{children:k.path}):e.jsx("span",{className:"muted",children:"—"})}),e.jsx("td",{children:k.instances&&k.instances.length>0&&(()=>{const I=k.instances.filter(P=>!P.untagged),z=k.instances.filter(P=>P.untagged);if(I.length===0)return e.jsx("span",{className:"muted",children:"all untagged"});const v=[...new Set(I.map(P=>P.spaceTag))].sort().join(", ");return e.jsxs("span",{className:"muted",children:[v,z.length?` + ${z.length} untagged`:""]})})()}),e.jsx("td",{colSpan:"2",children:k.registered?e.jsxs("span",{className:"muted",children:["pool of ",k.instanceCount]}):e.jsx("span",{className:"muted",children:"no instances registered"})})]},k.serviceCode),F=(k.instances||[]).map(I=>{const z=I.status||(I.healthy?"up":"down"),v=kt[z]||kt.unknown;return e.jsxs("tr",{className:"status-row-instance",children:[e.jsxs("td",{children:[e.jsx("span",{className:"status-inst-leaf",children:"↳"})," ",e.jsx("code",{className:"muted",children:I.instanceId})]}),e.jsx("td",{children:I.version?e.jsx("code",{children:I.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:v.dot}}),e.jsx("span",{style:{color:v.dot},children:v.label})]}),e.jsx("td",{children:I.untagged?e.jsx("span",{className:"muted",children:"—"}):e.jsx("code",{style:{fontSize:"0.85em"},children:I.spaceTag})}),e.jsx("td",{children:I.lastHeartbeatOk?Ui(I.ageSeconds)+" ago":e.jsx("span",{className:"muted",children:"never"})}),e.jsx("td",{children:I.consecutiveFailures??0})]},k.serviceCode+"/"+I.instanceId)});return[T,...F]})})]}),(i==null?void 0:i.timestamp)&&e.jsxs("div",{className:"status-modal-timestamp",children:["server time: ",i.timestamp]})]}),h==="perf"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"perf-window-banner",style:{"--perf-color":un(g.p95,g.errorCount)},children:[e.jsx("span",{className:"perf-chip-dot perf-chip-dot-lg"}),e.jsxs("span",{className:"perf-window-label",children:["last 30s — ",mn(g.p95,g.count)]}),e.jsxs("span",{className:"perf-window-metrics",children:[g.count," calls · p50 ",Pe(g.p50)," · p95 ",Pe(g.p95)," · max ",Pe(g.maxMs),g.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[" · ",g.errorCount," err"]})]})]}),e.jsxs("div",{className:"status-modal-summary",children:[e.jsxs("span",{className:"status-perf-summary",children:[e.jsxs("span",{children:[m.overall.total," calls"]}),e.jsxs("span",{children:["avg ",e.jsx("strong",{className:st(m.overall.avgMs),children:Pe(m.overall.avgMs)})]}),e.jsxs("span",{children:["p50 ",e.jsx("strong",{className:st(m.overall.p50),children:Pe(m.overall.p50)})]}),e.jsxs("span",{children:["p95 ",e.jsx("strong",{className:st(m.overall.p95),children:Pe(m.overall.p95)})]}),e.jsxs("span",{children:["p99 ",e.jsx("strong",{className:st(m.overall.p99),children:Pe(m.overall.p99)})]}),e.jsxs("span",{children:["max ",e.jsx("strong",{className:st(m.overall.maxMs),children:Pe(m.overall.maxMs)})]}),m.overall.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[m.overall.errorCount," err"]})]}),e.jsx("button",{className:"status-modal-refresh",onClick:()=>{ma(),y(_t())},children:"reset"})]}),e.jsxs("div",{className:"status-perf-note",children:["Window = last ",m.overall.windowSize," calls. Latency = browser-observed time through nginx → spe-api → ","{","psm,pno","}","."]}),e.jsx(Hi,{sorted:m.overall.sorted}),m.byEndpoint.length===0?e.jsx("div",{className:"status-perf-empty",children:"No API calls recorded yet."}):e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Method"}),e.jsx("th",{children:"Endpoint"}),e.jsx("th",{children:"#"}),e.jsx("th",{children:"avg"}),e.jsx("th",{children:"p50"}),e.jsx("th",{children:"p95"}),e.jsx("th",{title:"sorted desc by p95",children:"max ▼"}),e.jsx("th",{children:"last"}),e.jsx("th",{children:"err"})]})}),e.jsx("tbody",{children:[...m.byEndpoint].sort((k,q)=>q.p95-k.p95).map(k=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:k.method})}),e.jsx("td",{children:e.jsx("code",{title:k.endpoint,children:k.endpoint})}),e.jsx("td",{children:k.count}),e.jsx("td",{className:st(k.avgMs),children:Pe(k.avgMs)}),e.jsx("td",{className:st(k.p50),children:Pe(k.p50)}),e.jsx("td",{className:st(k.p95),children:Pe(k.p95)}),e.jsx("td",{className:st(k.maxMs),children:Pe(k.maxMs)}),e.jsx("td",{className:st(k.lastMs),children:Pe(k.lastMs)}),e.jsx("td",{className:k.errorCount?"lat-bad":"muted",children:k.errorCount||0})]},`${k.method} ${k.endpoint}`))})]})})]}),h==="nats"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[R?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-dot",style:{background:R.status==="up"?"#4dd4a0":"#fc8181"}}),e.jsx("span",{className:"status-modal-overall",style:{color:R.status==="up"?"#4dd4a0":"#fc8181"},children:R.status==="up"?"UP":"DOWN"}),R.version&&e.jsxs("span",{className:"status-modal-uptime",children:["v",R.version]}),R.uptime&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",R.uptime]})]}):e.jsx("span",{className:"muted",children:f?`Error: ${f}`:"Loading..."}),e.jsx("button",{className:"status-modal-refresh",onClick:G,children:"refresh"})]}),R&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nats-stats-grid",children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Connections"}),e.jsx("span",{className:"nats-stat-value",children:R.connections??0}),e.jsxs("span",{className:"nats-stat-sub",children:["total: ",R.totalConnections??0]})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Subscriptions"}),e.jsx("span",{className:"nats-stat-value",children:R.subscriptions??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages In"}),e.jsx("span",{className:"nats-stat-value",children:At(R.inMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:Ye(R.inBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages Out"}),e.jsx("span",{className:"nats-stat-value",children:At(R.outMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:Ye(R.outBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Slow Consumers"}),e.jsx("span",{className:`nats-stat-value${R.slowConsumers>0?" lat-bad":""}`,children:R.slowConsumers??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Sub Cache"}),e.jsx("span",{className:"nats-stat-value",children:R.numCache??0}),e.jsxs("span",{className:"nats-stat-sub",children:["matches: ",At(R.numMatches)]})]})]}),R.connectionDetails&&R.connectionDetails.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("h4",{className:"nats-section-title",children:["Client Connections (",R.numConnections,")"]}),e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"CID"}),e.jsx("th",{children:"Name"}),e.jsx("th",{children:"Lang"}),e.jsx("th",{children:"Subs"}),e.jsx("th",{children:"Msgs In"}),e.jsx("th",{children:"Msgs Out"}),e.jsx("th",{children:"Bytes In"}),e.jsx("th",{children:"Bytes Out"}),e.jsx("th",{children:"Uptime"}),e.jsx("th",{children:"Idle"})]})}),e.jsx("tbody",{children:R.connectionDetails.map(k=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:k.cid})}),e.jsx("td",{children:e.jsx("code",{title:k.name,children:k.name||"—"})}),e.jsx("td",{children:k.lang||"—"}),e.jsx("td",{children:typeof k.subscriptions=="number"?k.subscriptions:Array.isArray(k.subscriptions)?k.subscriptions.length:"—"}),e.jsx("td",{children:At(k.inMsgs)}),e.jsx("td",{children:At(k.outMsgs)}),e.jsx("td",{children:Ye(k.inBytes)}),e.jsx("td",{children:Ye(k.outBytes)}),e.jsx("td",{children:k.uptime||"—"}),e.jsx("td",{children:k.idle||"—"})]},k.cid))})]})})]})]})]}),h==="workers"&&e.jsxs("div",{style:{padding:"12px 16px",overflowY:"auto"},children:[e.jsx("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"},children:[{v:H.workers,l:"Workers"},{v:H.entries,l:"Cached Parts"},{v:Ye(H.cacheBytes),l:"Memory Used"},{v:Ye(H.maxBytes),l:"Memory Limit"},{v:H.memHits,l:"Mem Hits"},{v:H.idbHits,l:"IDB Hits"},{v:H.netFetches,l:"Downloads"},{v:Pe(H.avgDownloadMs),l:"Avg Download"},{v:Pe(H.avgParseMs),l:"Avg Parse"}].map(({v:k,l:q})=>e.jsxs("div",{style:{background:"var(--surface2)",borderRadius:6,padding:"8px 14px",minWidth:90},children:[e.jsx("div",{style:{fontSize:17,fontWeight:700,color:"var(--text)",lineHeight:1.2},children:k??"—"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginTop:2},children:q})]},q))}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted2)"},children:["Cache: ",Ye(H.cacheBytes)," / ",Ye(H.maxBytes)," (",H.maxBytes>0?(H.cacheBytes/H.maxBytes*100).toFixed(1):0,"%)"]}),e.jsx("div",{style:{marginTop:6,height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${H.maxBytes>0?Math.min(100,H.cacheBytes/H.maxBytes*100):0}%`,background:"var(--accent)",borderRadius:3,transition:"width .3s"}})}),e.jsxs("div",{style:{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginRight:4},children:"Limit / worker"}),[{label:"128 MB",bytes:128*1024*1024},{label:"256 MB",bytes:256*1024*1024},{label:"512 MB",bytes:512*1024*1024},{label:"1 GB",bytes:1024*1024*1024}].map(({label:k,bytes:q})=>{const Q=H.workers>0?H.maxBytes/H.workers:0,T=Math.abs(Q-q)<1024;return e.jsx("button",{type:"button",onClick:()=>Go(q),style:{padding:"3px 10px",fontSize:11,borderRadius:4,border:"1px solid",borderColor:T?"var(--accent)":"var(--border)",background:T?"var(--accent)":"var(--surface2)",color:T?"#fff":"var(--text)",cursor:"pointer",fontWeight:T?700:400},children:k},k)})]}),e.jsxs("div",{style:{marginTop:10,display:"flex",gap:8},children:[e.jsx("button",{type:"button",onClick:()=>tn({idb:!1}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear Memory"}),e.jsx("button",{type:"button",onClick:()=>tn({idb:!0}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear All + IDB"})]}),e.jsx("div",{style:{marginTop:12,fontSize:11,color:"var(--muted2)"},children:"Avg timings = rolling average over last 50 loads per worker. IDB = IndexedDB persistent cache. Mem = in-memory LRU."})]}),B.map(k=>h===k.key&&e.jsx(k.Component,{},k.key))]})})]})}function qi(){const t=be(s=>s.bgJobs);return t.length===0?null:e.jsx(e.Fragment,{children:t.map(s=>{const n=s.status==="done"||s.status==="failed",r=s.status==="failed";return e.jsxs("button",{className:"bg-job-chip",onClick:s.onOpen,title:`${s.label} — click to view`,children:[e.jsx("span",{className:`bg-job-dot${n?"":" bg-job-dot-pulse"}`,style:{background:r?"#fc8181":n?"#4dd4a0":"var(--accent)"}}),e.jsxs("span",{children:[s.label,n?r?" — Failed":" — Done":"…"]})]},s.id)})})}function hn(t){const s=be(i=>i.statusSlots),n=be(i=>i.consoleVisible),r=be(i=>i.toggleConsole),a=[{id:"_bg-jobs",Component:qi,position:"left"},...s.filter(i=>i.position!=="right")],o=s.filter(i=>i.position==="right");return e.jsx(Vi,{...t,leftSlots:a,rightSlots:o,consoleVisible:n,onToggleConsole:r})}const Ki=350,Ji=["_type","*"],Xi={_type:"Type"};function xn(t){return Xi[t]??t.replace(/_/g," ").replace(/\b\w/g,s=>s.toUpperCase())}function fn(t){return t>=1e3?`${(t/1e3).toFixed(1)}k`:String(t)}function Yi({query:t,onQueryChange:s,onClose:n,onNavigate:r}){const[a,o]=l.useState(t||""),[i,c]=l.useState(null),[p,d]=l.useState(!1),[u,b]=l.useState({}),[h,N]=l.useState(null),[R,A]=l.useState(560),[f,x]=l.useState({}),[m,y]=l.useState({}),[g,j]=l.useState({}),D=l.useRef(null),G=ae(S=>S.basketItems),H=ae(S=>S.addToBasket),B=ae(S=>S.removeFromBasket),L=ae(S=>S.userId),w=ae(S=>S.items),k=ae(S=>S.itemsStatus),q=ae(S=>S.refreshItems),Q=ae(S=>S.stateColorMap),T=l.useMemo(()=>({onNavigate:r,userId:L,stateColorMap:Q,icons:Je}),[r,L,Q]),F=l.useMemo(()=>{const S={};for(const _ of w)_.itemCode&&_.displayName&&(S[_.itemCode]=_.displayName);return S},[w]);l.useEffect(()=>{ee.searchInfo().then(N).catch(()=>N({available:!1}))},[]);const I=(i==null?void 0:i.hits)||[];l.useEffect(()=>{if(!I.length||k==="loading"||k==="loaded")return;I.some(_=>{const O=_.serviceCode||"psm",X=_.itemCode||_.type;return!w.find(se=>se.serviceCode===O&&se.itemCode===X)})&&q()},[I,k,w,q]);const z=l.useRef([]),v=l.useCallback(async(S,_)=>{if(!(S!=null&&S.trim())){c(null),x({}),y({});return}d(!0),x({}),y({});const O=z.current;try{const X=Object.fromEntries(Object.entries(_).filter(([re,ie])=>(ie==null?void 0:ie.length)>0&&!O.includes(re))),se=Object.fromEntries(Object.entries(_).filter(([re,ie])=>O.includes(re)&&(ie==null?void 0:ie[0])!=null&&(ie==null?void 0:ie[1])!=null).map(([re,ie])=>[re,[parseFloat(ie[0]),parseFloat(ie[1])]]).filter(([,re])=>!isNaN(re[0])&&!isNaN(re[1]))),Z=await ee.searchNodes(S.trim(),X,se,Ji,100);c(Z)}catch{c(null)}finally{d(!1)}},[]),P=l.useCallback(async S=>{if(f[S]){x(_=>({..._,[S]:!1}));return}if(m[S]){x(_=>({..._,[S]:!0}));return}j(_=>({..._,[S]:!0}));try{const _=await ee.searchChildren(S);y(O=>({...O,[S]:_})),x(O=>({...O,[S]:_.length>0}))}catch{x(_=>({..._,[S]:!1}))}finally{j(_=>({..._,[S]:!1}))}},[f,m]);l.useEffect(()=>{o(t||"")},[t]);const J=l.useMemo(()=>Object.keys((i==null?void 0:i.rangeFacets)||{}),[i]);l.useEffect(()=>{z.current=J},[J]),l.useEffect(()=>(clearTimeout(D.current),D.current=setTimeout(()=>v(a,u),Ki),()=>clearTimeout(D.current)),[a,u,v]);function $(S){o(S.target.value),s==null||s(S.target.value)}function U(S,_){b(O=>{const X=O[S]||[],se=X.includes(_)?X.filter(Z=>Z!==_):[...X,_];if(se.length===0){const{[S]:Z,...re}=O;return re}return{...O,[S]:se}})}function K(){b({})}function C(S){S.preventDefault();const _=S.clientX,O=R,X=Z=>A(Math.max(420,Math.min(900,O+Z.clientX-_))),se=()=>{document.removeEventListener("mousemove",X),document.removeEventListener("mouseup",se)};document.addEventListener("mousemove",X),document.addEventListener("mouseup",se)}const M=(i==null?void 0:i.facets)||{},V=(i==null?void 0:i.rangeFacets)||{},W=(i==null?void 0:i.totalHits)??0,Y=Object.values(u).some(S=>(S==null?void 0:S.length)>0),oe=Object.keys(M).length>0||Object.keys(V).length>0;return e.jsxs("div",{className:"search-panel",style:{width:R},children:[e.jsx("div",{className:"resize-handle search-panel-resize",onMouseDown:C}),e.jsxs("div",{className:"search-panel-header",children:[e.jsx("span",{className:"search-panel-title",children:"Search"}),e.jsxs("div",{className:"search-panel-header-right",children:[h&&e.jsx("span",{className:`search-index-badge${h.available?"":" unavail"}`,title:h.available?`${h.nodeCount} nodes · ${h.edgeCount} edges indexed`:"Search index unavailable",children:h.available?`${fn(h.nodeCount)} nodes · ${fn(h.edgeCount)} edges`:"index unavailable"}),e.jsx("button",{className:"panel-icon-btn",onClick:n,title:"Close search",children:e.jsx(xt,{size:13,strokeWidth:2})})]})]}),e.jsx("div",{className:"search-panel-input-wrap",children:e.jsx("input",{autoFocus:!0,className:"search-panel-input",type:"text",placeholder:"Search nodes…",value:a,onChange:$})}),e.jsxs("div",{className:"search-panel-body",children:[e.jsx("div",{className:"search-facets",children:oe?e.jsxs(e.Fragment,{children:[Object.entries(M).map(([S,_])=>{const O=xn(S),X=u[S]||[];return e.jsxs("div",{className:"search-facet-group",children:[e.jsxs("div",{className:"search-facet-dim",children:[O,X.length>0&&e.jsx("span",{className:"search-facet-dim-count",children:X.length})]}),Object.entries(_).slice(0,10).map(([se,Z])=>{const re=X.includes(se),ie=S==="_type"&&F[se]||se;return e.jsxs("label",{className:`search-facet-item${re?" active":""}`,title:`${re?"Remove: ":"Add: "}${ie}`,children:[e.jsx("input",{type:"checkbox",className:"search-facet-checkbox",checked:re,onChange:()=>U(S,se)}),e.jsx("span",{className:"search-facet-val",children:ie}),e.jsx("span",{className:"search-facet-count",children:Z})]},se)})]},S)}),Object.entries(V).map(([S,[_,O]])=>{const X=u[S]||[],se=X[0]??"",Z=X[1]??"",re=se!==""||Z!=="";return e.jsxs("div",{className:"search-facet-group",children:[e.jsxs("div",{className:"search-facet-dim",children:[xn(S),re&&e.jsx("span",{className:"search-facet-dim-count",children:"1"})]}),e.jsxs("div",{className:"search-facet-range",children:[e.jsx("input",{type:"number",className:"search-facet-range-input",placeholder:_!=null?String(Math.floor(_)):"Min",value:se,onChange:ie=>b(de=>({...de,[S]:[ie.target.value,(de[S]||[])[1]??""]}))}),e.jsx("span",{className:"search-facet-range-sep",children:"–"}),e.jsx("input",{type:"number",className:"search-facet-range-input",placeholder:O!=null?String(Math.ceil(O)):"Max",value:Z,onChange:ie=>b(de=>({...de,[S]:[(de[S]||[])[0]??"",ie.target.value]}))})]})]},S)}),Y&&e.jsx("button",{className:"search-facet-clear",onClick:K,children:"Clear filters"})]}):e.jsx("div",{className:"search-facets-empty",children:a.trim()&&!p?"No facets":"Facets appear after search"})}),e.jsxs("div",{className:"search-panel-results",children:[p&&e.jsx("div",{className:"panel-empty",children:"Searching…"}),!p&&a.trim()&&i!==null&&W===0&&e.jsxs("div",{className:"panel-empty",children:['No results for "',a,'"']}),!p&&W>0&&e.jsxs("div",{className:"search-results-count",children:[W," result",W!==1?"s":"",Y?" (filtered)":""]}),!p&&I.map(S=>{var ve;const _=S.serviceCode||"psm",O=S.itemCode||S.type,X=`${_}:${O}`,se=!!((ve=G[X])!=null&&ve.has(S.id)),re=w.find(Se=>Se.serviceCode===_&&Se.itemCode===O)??{serviceCode:_,itemCode:O},ie=en(_,O),de=!!f[S.id],ce=!!g[S.id],ue=m[S.id]||[];return e.jsxs("div",{className:"search-result-group",children:[e.jsxs("div",{className:"search-result-row-wrap",children:[e.jsx("button",{className:`search-expand-btn${de?" open":""}${ue.length===0&&!de&&m[S.id]!==void 0?" empty":""}`,title:de?"Collapse":"Expand children",onClick:()=>P(S.id),disabled:ce,children:ce?"…":"▶"}),e.jsx("div",{style:{flex:1,minWidth:0},children:e.jsx(ie,{hit:S,descriptor:re,isPinned:se,onPin:()=>H(L,_,O,S.id),onUnpin:()=>B(L,_,O,S.id),ctx:T})})]}),de&&ue.length>0&&e.jsx("div",{className:"search-children",children:ue.map(Se=>{var Ne;const Re=Se.serviceCode||"psm",Ee=Se.itemCode||Se.type,fe=`${Re}:${Ee}`,me=w.find(Ie=>Ie.serviceCode===Re&&Ie.itemCode===Ee)??{serviceCode:Re,itemCode:Ee},je=en(Re,Ee);return e.jsx(je,{hit:Se,descriptor:me,isPinned:!!((Ne=G[fe])!=null&&Ne.has(Se.id)),onPin:()=>H(L,Re,Ee,Se.id),onUnpin:()=>B(L,Re,Ee,Se.id),ctx:T},Se.id)})}),de&&ue.length===0&&m[S.id]!==void 0&&e.jsx("div",{className:"search-children-empty",children:"No children"})]},S.id)})]})]})]})}ri();const gn="ps-default";let Zi=0;function Qi(){const[t,s]=l.useState([]),[n,r]=l.useState(null),a=l.useCallback((o,i="info")=>{const c=typeof o=="string"?o:(o==null?void 0:o.message)||String(o),p=typeof o!="string"&&(o!=null&&o.detail)?o.detail:null;if(i==="error"){r(p??{error:c});return}const d=++Zi;s(u=>[...u,{id:d,msg:c,type:i}]),setTimeout(()=>s(u=>u.filter(b=>b.id!==d)),4e3)},[]);return{toasts:t,toast:a,errorDetail:n,setErrDetail:r}}function el({toasts:t}){return e.jsx("div",{className:"toasts",role:"status","aria-live":"polite",children:t.map(s=>e.jsxs("div",{className:`toast toast-${s.type}`,children:[e.jsx("span",{"aria-hidden":"true",children:s.type==="success"?"✓":s.type==="error"?"✗":s.type==="warn"?"⚠":"ℹ"}),s.msg]},s.id))})}function tl(){var Ls;const{toasts:t,toast:s,errorDetail:n,setErrDetail:r}=Qi(),[a,o]=l.useState("user-alice"),[i,c]=l.useState(gn),p=ae(E=>E.setUserId),d=ae(E=>E.setProjectSpaceId),u=ae(E=>E.nodes),b=ae(E=>E.nodeTypes),h=ae(E=>E.resources),N=ae(E=>E.stateColorMap),R=ae(E=>E.stateColorMapLoaded),A=ae(E=>E.projectSpaces),f=ae(E=>E.users),x=ae(E=>E.activeTx),m=ae(E=>E.txNodes),y=ae(E=>E.refreshNodes),g=ae(E=>E.refreshTx),j=ae(E=>E.refreshAll),D=ae(E=>E.refreshItems),G=ae(E=>E.refreshStateColorMap),H=ae(E=>E.refreshProjectSpaces),B=ae(E=>E.refreshUsers),L=ae(E=>E.clearTx),w=ae(E=>E.loadBasket);ae(E=>E.addToBasket),ae(E=>E.basketItems);const k=ae(E=>E.syncBasketAdd),q=ae(E=>E.syncBasketRemove),Q=ae(E=>E.syncBasketClear),T=ae(E=>E.removeBasketItemIds),F=ae(E=>E.lockItem),I=ae(E=>E.unlockItem),z=ae(E=>E.unlockAll),[v,P]=l.useState(0),[J,$]=l.useState(!1),[U,K]=l.useState(""),C=l.useCallback(()=>P(E=>E+1),[]),[M,V]=l.useState(""),[W,Y]=l.useState(""),oe={id:"dashboard",nodeId:null,label:"Dashboard",pinned:!0},[S,_]=l.useState([oe]),[O,X]=l.useState("dashboard"),[se,Z]=l.useState(null),[re,ie]=l.useState({}),de=l.useRef(new Set),ce=l.useCallback(E=>{var we;const ne=S.find(ge=>ge.nodeId===E);if(!((we=ne==null?void 0:ne.get)!=null&&we.path))return;const le=(x==null?void 0:x.txId)||null;ie(ge=>({...ge,[E]:{...ge[E]??{},status:"loading"}})),An(ne.serviceCode,ne.get,E,le?{txId:le}:{}).then(ge=>ie(ke=>({...ke,[E]:{status:"ok",data:ge}}))).catch(ge=>{(ge==null?void 0:ge.status)===404?(de.current.delete(E),ie(ke=>{const Be={...ke};return delete Be[E],Be}),_(ke=>{const Be=ke.filter(ut=>ut.nodeId!==E);return X(ut=>{var Me;return ut===ne.id?((Me=Be.at(-1))==null?void 0:Me.id)??null:ut}),Be})):ie(ke=>({...ke,[E]:{status:"error",error:ge.message}}))})},[S,x]),ue=l.useCallback(()=>{S.filter(E=>{var ne;return E.nodeId&&((ne=E.get)==null?void 0:ne.path)}).forEach(E=>ce(E.nodeId))},[S,ce]);l.useEffect(()=>{var ne;if(!O||O==="dashboard")return;const E=S.find(le=>le.id===O);!((ne=E==null?void 0:E.get)!=null&&ne.path)||!E.nodeId||de.current.has(E.nodeId)||(de.current.add(E.nodeId),ce(E.nodeId))},[O,S]);const ve=l.useRef(null);l.useEffect(()=>{const E=(x==null?void 0:x.txId)||null;if(E===ve.current||(ve.current=E,!O||O==="dashboard"))return;const ne=S.find(le=>le.id===O);ne!=null&&ne.nodeId&&ce(ne.nodeId)},[x,O,S,ce]);const[Se,Re]=l.useState(!1),[Ee,fe]=l.useState(!1),[me,je]=l.useState(null),[Ne,Ie]=l.useState(!1),[Le,Qe]=l.useState(null),[vt,Ve]=l.useState(null),[et,Ue]=l.useState(268),[rt,zs]=l.useState(!1),[Is,As]=l.useState(null),[er,tr]=l.useState(0),[sr,nr]=l.useState(!1),it=l.useCallback((E,ne,le)=>{if(!le||!le.serviceCode)throw new Error("navigate(): descriptor is required");const we={serviceCode:le.serviceCode,itemCode:le.itemCode,itemKey:le.itemKey,get:le.get||null};_(ge=>{const ke=ge.find(Me=>Me.nodeId===E);if(ke)return X(ke.id),ge.map(Me=>Me.id===ke.id?{...Me,...we}:Me);const Be=ge.find(Me=>!Me.pinned&&Me.id!=="dashboard");if(Be)return X(Be.id),ge.map(Me=>Me.id===Be.id?{...Me,nodeId:E,label:ne||E.slice(0,10),...we}:Me);const ut=`tab-${Date.now()}`;return X(ut),[...ge,{id:ut,nodeId:E,label:ne||E.slice(0,10),pinned:!1,...we}]})},[]),rr=l.useCallback(E=>it(E.nodeId,E.label,E),[it]),$s=l.useCallback(E=>{_(ne=>{const le=ne.find(ge=>ge.id===E);le!=null&&le.nodeId&&(de.current.delete(le.nodeId),ie(ge=>{const ke={...ge};return delete ke[le.nodeId],ke}));const we=ne.filter(ge=>ge.id!==E);return O===E&&(X(we.length>0?we[we.length-1].id:null),Z(null)),we})},[O]),Rs=l.useMemo(()=>li({navigate:it,openTab:rr,closeTab:$s}),[]);Ln(["/topic/transactions","/topic/global","/topic/metamodel"],async E=>{if(E.event==="LOCK_ACQUIRED")E.lockedBy===a&&F(E.nodeId);else if(E.event==="LOCK_RELEASED")E.releasedBy===a&&I(E.nodeId);else if(E.event==="TX_COMMITTED")E.byUser===a&&z(),await g(),E.byUser&&E.byUser!==a&&s(`${E.byUser} committed a transaction`,"info");else if(E.event==="ITEM_DELETED"){const ne=E.nodeId||E.itemId;ne&&(T([ne]),_(le=>{const we=le.find(ke=>ke.nodeId===ne);if(!we)return le;de.current.delete(ne),ie(ke=>{const Be={...ke};return delete Be[ne],Be});const ge=le.filter(ke=>ke.nodeId!==ne);return X(ke=>{var Be;return ke===we.id?((Be=ge.at(-1))==null?void 0:Be.id)??null:ke}),ge})),y(),C()}else if(E.event==="TX_ROLLED_BACK")E.byUser===a&&z(),await g(),await y(),ue(),C(),E.byUser&&E.byUser!==a&&s(`${E.byUser} rolled back a transaction`,"warn");else if(E.event==="ITEMS_RELEASED")E.byUser===a&&(E.nodeIds||[]).forEach(I),g(),C();else if(E.event==="ITEM_CREATED")y(),g(),C();else if(E.event==="ITEM_CAPTURED")g();else if(E.event==="BASKET_ITEM_ADDED")k(E.key,E.value);else if(E.event==="BASKET_ITEM_REMOVED")q(E.key,E.value);else if(E.event==="BASKET_CLEARED")Q();else if(E.event==="ITEM_VERSION_CREATED"||E.event==="ITEM_UPDATED"){const ne=E.nodeId||E.itemId;ne&&ce(ne),y(),C()}else E.event==="METAMODEL_CHANGED"?(Do(),D(),C(),R&&G(),E.byUser&&E.byUser!==a&&s(`${E.byUser} updated the metamodel`,"info")):E.event==="PNO_CHANGED"&&(B(),H(),E.byUser&&E.byUser!==a&&s(`${E.byUser} updated ${(E.entity||"PNO data").toLowerCase()}`,"info"))},a,i);function Ps(){Ie(E=>(!E&&a&&(ee.getSettingsSections(a).then(ne=>{var we,ge,ke;Ve(ne);const le=(ke=(ge=(we=ne==null?void 0:ne[0])==null?void 0:we.sections)==null?void 0:ge[0])==null?void 0:ke.key;le&&Qe(le)}).catch(()=>Ve([])),G()),!E))}l.useEffect(()=>{Ws(gn),xa(E=>s(E,"error"))},[s]),l.useEffect(()=>{let E=!1;return zs(!1),As(null),(async()=>{try{await Fs.login(a)}catch(ne){E||As(ne.message||String(ne));return}if(!E){fa(async()=>{try{return(await Fs.login(a)).token}catch{return null}}),zs(!0),p(a),d(i),j(),H(),B(),G(),w(a),ja(a),Ne&&ee.getSettingsSections(a).then(ne=>{var we,ge,ke;Ve(ne);const le=(ke=(ge=(we=ne==null?void 0:ne[0])==null?void 0:we.sections)==null?void 0:ge[0])==null?void 0:ke.key;le&&Qe(le)}).catch(()=>Ve([]));try{const ne=await ci(Rs);ne.length>0&&s(`Some plugins failed to load: ${ne.join("; ")}`,"error")}catch(ne){s(`Plugin manifest unavailable: ${ne.message||ne}`,"error")}finally{nr(!0),P(ne=>ne+1)}}})(),()=>{E=!0}},[a,i,er]);function ar(E){o(E),_([oe]),X("dashboard"),Z(null),V("")}function or(E){c(E),Ws(E),d(E),w(a),_([oe]),X("dashboard"),Z(null),j()}function ir(E){const ne=E.clientX,le=et;function we(ke){Ue(Math.max(160,Math.min(600,le+ke.clientX-ne)))}function ge(){document.removeEventListener("mousemove",we),document.removeEventListener("mouseup",ge)}document.addEventListener("mousemove",we),document.addEventListener("mouseup",ge)}async function lr(){if(x)return x.txId;try{const E=await ht.open(a,"Work session");return await g(),E.txId}catch(E){return s(E,"error"),null}}async function cr(){if(x)try{await ht.rollback(a,x.serviceCode,x.txId),s("Transaction rolled back","warn"),L(),await y(),ue()}catch(E){s(E,"error")}}async function dr(E){if(x)try{await ht.release(a,x.serviceCode,x.txId,[E]),s("Object released from transaction","info"),await j()}catch(ne){s(ne,"error")}}async function pr(E,ne){if(await j(),ue(),E&&ne>0){const le=ne;s(`${le} object${le>1?"s":""} deferred — new transaction opened`,"info")}}const dt=S.find(E=>E.id===O),pt=dt==null?void 0:dt.nodeId,ur=O==="dashboard",mr=l.useMemo(()=>S.filter(E=>E.id!=="dashboard"&&E.nodeId).map(za).filter(Boolean),[S]),hr=l.useMemo(()=>{const E={};for(const ne of S){if(!ne.nodeId||ne.id==="dashboard")continue;const le=re[ne.nodeId];(le==null?void 0:le.status)==="ok"&&le.data&&(E[ne.nodeId]=Mn(le.data))}return E},[S,re]),xr=l.useCallback(E=>{if((E==null?void 0:E.nodeId)===pt&&Z(E),E!=null&&E.nodeId){const ne=E.logicalId||E.identity||void 0;_(le=>le.map(we=>we.nodeId===E.nodeId?{...we,...E.nodeTypeId&&{nodeTypeId:E.nodeTypeId},...ne&&{label:ne}}:we))}},[pt]);return rt?e.jsx(ii.Provider,{value:Rs,children:e.jsxs("div",{className:"shell",children:[e.jsx(Da,{userId:a,onUserChange:ar,users:f,nodeTypes:b,stateColorMap:N,searchQuery:M,searchType:W,onSearchChange:V,onSearchTypeChange:Y,onSearchSubmit:E=>{K(E),$(!0)},projectSpaces:A,projectSpaceId:i,onProjectSpaceChange:or,nodes:u,onNavigate:it}),e.jsxs("div",{className:"body",children:[e.jsx("div",{className:`search-strip${J?" search-strip--open":""}`,onClick:()=>$(E=>!E),title:J?"Close search":"Search items",children:e.jsxs("span",{className:"search-strip-label",children:[J?"◀":"▶"," Search"]})}),e.jsx(ps,{children:e.jsx(bi,{nodeTypes:b,tx:x,txNodes:m,userId:a,activeNodeId:pt,stateColorMap:N,onNavigate:it,canCreateNode:h.length>0,onCreateNode:E=>{je(E||null),fe(!0)},onCommit:()=>Re(!0),onRollback:cr,onReleaseNode:dr,showSettings:Ne,onToggleSettings:Ps,activeSettingsSection:Le,onSettingsSectionChange:Qe,settingsSections:vt,isDashboardOpen:ur,onOpenDashboard:()=>X("dashboard"),browseRefreshKey:v,openItems:mr,openItemDataMap:hr,style:{width:et},toast:s})}),e.jsx("div",{className:"resize-handle",onMouseDown:ir}),e.jsxs("div",{className:"editor-column",children:[Ne?e.jsx(ps,{children:e.jsx(Io,{userId:a,projectSpaceId:i,activeSection:Le,onSectionChange:Qe,settingsSections:vt,pluginsLoaded:sr,toast:s})}):e.jsx(ps,{children:e.jsx(Si,{tabs:S,activeTabId:O,userId:a,tx:x,toast:s,nodeTypes:b,stateColorMap:N,onTabActivate:E=>X(E),onTabClose:$s,onTabPin:E=>_(ne=>ne.map(le=>le.id===E?{...le,pinned:!le.pinned}:le)),onSubTabChange:(E,ne)=>_(le=>le.map(we=>we.id===E?{...we,activeSubTab:ne}:we)),onNavigate:it,onAutoOpenTx:lr,onDescriptionLoaded:xr,onRefreshItemData:ce,tabItemData:dt!=null&&dt.nodeId?re[dt.nodeId]??null:null})}),e.jsx(Mi,{})]}),e.jsx(Pi,{activeNodeId:pt,userId:a,users:f,activeNodeDesc:pt&&((Ls=re[pt])==null?void 0:Ls.status)==="ok"?re[pt].data:null})]}),J&&e.jsx(Yi,{query:U,onQueryChange:K,onClose:()=>$(!1),userId:a,projectSpaceId:i,onNavigate:it}),Se&&x&&e.jsx(Ao,{userId:a,serviceCode:x.serviceCode,txId:x.txId,txNodes:m,stateColorMap:N,onCommitted:pr,onClose:()=>Re(!1),toast:s}),Ee&&h.length>0&&e.jsx($o,{resources:h,initialDescriptor:me,onCreated:async(E,ne)=>{await j(),(ne==null?void 0:ne.serviceCode)==="psm"&&(E!=null&&E.nodeId)&&it(E.nodeId,void 0,Dt)},onClose:()=>{fe(!1),je(null)},toast:s}),n&&e.jsx(Lo,{detail:n,onClose:()=>r(null)}),e.jsx(el,{toasts:t}),e.jsx(hn,{showSettings:Ne,onToggleSettings:Ps})]})}):e.jsxs("div",{className:"shell",children:[e.jsx("div",{className:"auth-splash",children:Is?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-error",children:"Login failed"}),e.jsx("div",{className:"auth-splash-detail",children:Is}),e.jsx("button",{className:"auth-splash-retry",onClick:()=>tr(E=>E+1),children:"retry"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-spinner"}),e.jsxs("div",{className:"auth-splash-label",children:["Signing in as ",a,"…"]})]})}),e.jsx(hn,{})]})}const sl=`
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
`,Qn=document.createElement("style");Qn.textContent=sl;document.head.appendChild(Qn);ka();const nl=fr.createRoot(document.getElementById("root"));nl.render(e.jsx(We.StrictMode,{children:e.jsx(tl,{})}));
//# sourceMappingURL=index-Cmhah2jA.js.map
