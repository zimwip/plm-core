import{j as e}from"./react-jsx-runtime-shim-DtcNtlUI.js";import{c as cn,r as l,R as Be}from"./vendor-Dw91Z_SL.js";import{c as Zn}from"./react-dom-shim-u_SHOSaN.js";import{S as Qn,R as er,G as tr,C as sr,B as nr,a as rr,L as ar,A as dn,b as ht,U as pn,c as or,H as Lt,d as mn,F as ir,e as bs,M as lr,f as cr,Z as vs,g as dr,h as pr,T as mr,i as ur,j as un,k as hn,D as xn,l as hr,W as xr,m as ys,P as fn,n as fr,o as gr,N as br,K as vr,p as gn,q as yr,r as jr,s as Jt,t as wr,u as bn,v as Nt,w as kr,X as jt,x as xt,y as Ge,z as Ke,E as wt,I as We,J as Dt,O as Sr,Q as Nr,V as Is,Y as Cr,_ as Er,$ as Tr,a0 as zr}from"./icons-IhDrqDp6.js";import{C as It,S as Ar,A as Ir,D as Rr,P as $r,W as Pr,O as Lr,X as Dr,V as Br,M as es,B as Mr,a as Rs,R as Or,G as _r,b as Wr,c as ts,d as $s,e as Gr,f as Ur,g as Fr,h as Hr}from"./three-DAyMVibd.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=n(r);fetch(r.href,o)}})();const vn=500,st=[],ds=new Set;function yn(){ds.forEach(t=>{try{t()}catch{}})}function Ps(t){return ds.add(t),()=>ds.delete(t)}const Vr=/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,Kr=/\/\d+(?=\/|$)/g;function qr(t){return t.split("?")[0].replace(Vr,"/{id}").replace(Kr,"/{n}")}function Ls({method:t,endpoint:s,status:n,durationMs:a,ok:r}){st.push({method:t,endpoint:qr(s),status:n,durationMs:a,ok:r,at:Date.now()}),st.length>vn&&st.shift(),yn()}function tt(t,s){if(t.length===0)return 0;const n=Math.min(t.length-1,Math.floor(t.length*s));return t[n]}function Ot(){const t=new Map;for(const o of st){const i=`${o.method} ${o.endpoint}`;let c=t.get(i);c||(c={method:o.method,endpoint:o.endpoint,durations:[],errorCount:0,lastMs:0,lastAt:0},t.set(i,c)),c.durations.push(o.durationMs),o.ok||c.errorCount++,c.lastMs=o.durationMs,c.lastAt=o.at}const s=[];for(const o of t.values()){const i=[...o.durations].sort((u,p)=>u-p),c=o.durations.reduce((u,p)=>u+p,0);s.push({method:o.method,endpoint:o.endpoint,count:o.durations.length,avgMs:c/o.durations.length,p50:tt(i,.5),p95:tt(i,.95),maxMs:i[i.length-1],lastMs:o.lastMs,lastAt:o.lastAt,errorCount:o.errorCount})}s.sort((o,i)=>i.count-o.count);const n=st.map(o=>o.durationMs).sort((o,i)=>o-i),a=n.reduce((o,i)=>o+i,0);return{overall:{total:st.length,windowSize:vn,avgMs:n.length?a/n.length:0,p50:tt(n,.5),p75:tt(n,.75),p90:tt(n,.9),p95:tt(n,.95),p99:tt(n,.99),maxMs:n.length?n[n.length-1]:0,errorCount:st.filter(o=>!o.ok).length,sorted:n},byEndpoint:s}}function Xr(){st.length=0,yn()}function _t(t){const s=Date.now()-t,n=st.filter(o=>o.at>=s),a=n.map(o=>o.durationMs).sort((o,i)=>o-i),r=a.reduce((o,i)=>o+i,0);return{windowMs:t,count:n.length,avgMs:a.length?r/a.length:0,p50:tt(a,.5),p95:tt(a,.95),maxMs:a.length?a[a.length-1]:0,errorCount:n.filter(o=>!o.ok).length}}const ot="/api/platform";function it(t){return`/api/${t}`}class Yr extends Error{constructor(s,n,a){super(n),this.name="ApiError",this.status=s,this.detail=a}}function Zt(t,s,n,a,r){return new Promise((o,i)=>{const c=new XMLHttpRequest;c.open(s,t),Object.entries(n).forEach(([u,p])=>c.setRequestHeader(u,p)),c.upload.addEventListener("progress",u=>{u.lengthComputable&&r(Math.round(u.loaded/u.total*100))}),c.onload=()=>{const u=()=>Promise.resolve(c.responseText),p=()=>Promise.resolve(JSON.parse(c.responseText));o({ok:c.status>=200&&c.status<300,status:c.status,text:u,json:p})},c.onerror=()=>i(new Error("Network error during upload")),c.onabort=()=>i(new Error("Upload cancelled")),c.send(a)})}async function _e(t,s,n){const a=performance.now();let r,o;try{r=await fetch(t,s)}catch(u){o=u}const i=performance.now()-a,c=t.split("?")[0];if(o)throw Ls({method:n,endpoint:c,status:0,durationMs:i,ok:!1}),o;return Ls({method:n,endpoint:c,status:r.status,durationMs:i,ok:r.ok}),r}function Jr(t,s,n){return Array.isArray(t)?{items:t,totalElements:t.length,totalPages:1,page:s,size:n}:t&&Array.isArray(t.content)?{items:t.content,totalElements:t.totalElements??t.content.length,totalPages:t.totalPages??1,page:t.number??s,size:t.size??n}:t&&Array.isArray(t.items)?{items:t.items,totalElements:t.totalElements??t.items.length,totalPages:t.totalPages??1,page:t.page??s,size:t.size??n}:{items:[],totalElements:0,totalPages:0,page:s,size:n}}let Ee=null;function Ds(t){Ee=t}function qt(){return Ee}let Ve=null;function Zr(t){Ve=t}let je=null;function kt(){return je}let $t=null;function Qr(t){$t=t}const Bs={login:async(t,s)=>{const n=await _e("/api/spe/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t,projectSpaceId:s})},"POST");if(!n.ok){const r=await n.json().catch(()=>({error:n.statusText}));throw new Error(r.error||`HTTP ${n.status}`)}const a=await n.json();return je=a.token,a},logout:async()=>{const t=je;if(je=null,!!t)try{await _e("/api/spe/auth/logout",{method:"POST",headers:{Authorization:`Bearer ${t}`}},"POST")}catch{}}};let Ms=!1,Os=null;function Xt(){if(!Ms){if(Ms=!0,!document.getElementById("plm-reconnect-banner")){const t=document.createElement("div");t.id="plm-reconnect-banner",t.style.cssText=["position:fixed","top:0","left:0","right:0","z-index:99999","background:#b45309","color:#fff","text-align:center","padding:8px 16px","font-size:13px","font-family:monospace","letter-spacing:.02em","box-shadow:0 2px 8px rgba(0,0,0,.4)"].join(";"),t.textContent="⟳  Backend is restarting — reconnecting…",document.body.prepend(t)}Os=setInterval(async()=>{try{(await fetch("/actuator/health",{cache:"no-store"})).ok&&(clearInterval(Os),window.location.reload())}catch{}},3e3)}}async function js(t,s,n,a=!1){var c,u;const r={};je&&(r.Authorization=`Bearer ${je}`),Ee&&(r["X-PLM-ProjectSpace"]=Ee),n!==void 0&&(r["Content-Type"]="application/json");let o;try{o=await _e(s,{method:t,headers:r,body:n!==void 0?JSON.stringify(n):void 0},t)}catch{Xt();const p=new Error("Backend unreachable");throw Ve&&Ve(p),p}if(o.status===401&&!a&&$t){const p=await $t().catch(()=>null);if(p)return je=p,js(t,s,n,!0)}if(!o.ok){(o.status===502||o.status===503)&&Xt();const p=await o.json().catch(()=>({error:o.statusText})),x=(c=p.violations)!=null&&c.length?p.violations.map(z=>typeof z=="string"?z:z.message).join("; "):p.error||p.message||`HTTP ${o.status}`,g=new Error(x);g.status=o.status,g.detail=p;const k=(u=p.violations)==null?void 0:u.some(z=>z==null?void 0:z.attrCode);throw Ve&&!k&&Ve(g),g}const i=await o.text();return i?JSON.parse(i):null}async function De(t,s,n,a,{txId:r,psOverride:o}={},i=!1){var g,k;const c={"Content-Type":"application/json"};je&&(c.Authorization=`Bearer ${je}`);const u=o??Ee;u&&(c["X-PLM-ProjectSpace"]=u),r&&(c["X-PLM-Tx"]=r);let p;try{p=await _e(`${t}${n}`,{method:s,headers:c,body:a?JSON.stringify(a):void 0},s)}catch{Xt();const z=new Error("Backend unreachable");throw Ve&&Ve(z),z}if(p.status===401&&!i&&$t){const z=await $t().catch(()=>null);if(z)return je=z,De(t,s,n,a,{txId:r,psOverride:o},!0)}if(!p.ok){(p.status===502||p.status===503)&&Xt();const z=await p.json().catch(()=>({error:p.statusText})),D=(g=z.violations)!=null&&g.length?z.violations.map(d=>typeof d=="string"?d:d.message).join("; "):z.error||z.message||`HTTP ${p.status}`,$=new Yr(p.status,D,z),f=(k=z.violations)==null?void 0:k.some(d=>d==null?void 0:d.attrCode);throw Ve&&!f&&Ve($),$}const x=await p.text();return x?JSON.parse(x):null}async function ne(t,s,n,a,r={}){return De(it("pno"),t,s,a,r)}async function pe(t,s,n,a){return De(ot,t,s,a)}function ea(t,s,n,a={}){let r=s.path.replace("{id}",n);const o=Object.entries(a).filter(([,i])=>i!=null).map(([i,c])=>`${i}=${encodeURIComponent(c)}`).join("&");return o&&(r+=`?${o}`),js(s.httpMethod||"GET",it(t)+r,void 0)}async function ta(t,s){var p;const n=t.create,a=it(t.serviceCode)+n.path,r=(n.httpMethod||"POST").toUpperCase(),o={};je&&(o.Authorization=`Bearer ${je}`),Ee&&(o["X-PLM-ProjectSpace"]=Ee);let i;if((n.bodyShape||"RAW").toUpperCase()==="MULTIPART"){const x=new FormData;for(const[g,k]of Object.entries(s||{}))k==null||k===""||x.append(g,k);i=x}else{o["Content-Type"]="application/json";const x=(n.bodyShape||"RAW").toUpperCase()==="WRAPPED"?{parameters:s||{}}:s||{};i=JSON.stringify(x)}const c=await _e(a,{method:r,headers:o,body:i},r);if(!c.ok){const x=await c.json().catch(()=>({error:c.statusText})),g=(p=x.violations)!=null&&p.length?x.violations.join("; "):x.error||x.message||`HTTP ${c.status}`,k=new Error(g);throw k.detail=x,Ve&&Ve(k),k}const u=await c.text();return u?JSON.parse(u):null}async function ge(t,s,n,a,r){return De(it("psm"),t,s,a,{psOverride:r})}async function V(t,s,n,a){return De(it("psa"),t,s,a)}function sa(t,s,n,a){return De(it(t),s,n,a)}const mt={getStatus:async()=>De(ot,"GET","/status"),getRegistryTags:async()=>De(ot,"GET","/admin/registry/tags"),getEnvironment:async()=>De(ot,"GET","/admin/environment/expected-services"),updateEnvironment:async t=>De(ot,"PUT","/admin/environment/expected-services",{expectedServices:t}),addExpectedService:async t=>De(ot,"POST","/admin/environment/expected-services/services",{serviceCode:t}),removeExpectedService:async t=>De(ot,"DELETE",`/admin/environment/expected-services/services/${t}`),getNatsStatus:async()=>De(ot,"GET","/status/nats")},q={getMetadataKeys:(t,s)=>V("GET",s?`/metamodel/metadata/keys/${s}`:"/metamodel/metadata/keys"),getNodeTypes:t=>V("GET","/metamodel/nodetypes"),getVersionHistory:(t,s)=>ge("GET",`/nodes/${s}/versions`),getVersionDiff:(t,s,n,a)=>ge("GET",`/nodes/${s}/versions/diff?v1=${n}&v2=${a}`),createNode:(t,s,n,a,r)=>ge("POST",`/actions/create_node/${s}`,t,{parameters:{...n,_logicalId:a||null,_externalId:r||null}}),getNodeDescription:(t,s,n,a)=>{const r=[];n&&r.push(`txId=${n}`),a&&r.push(`versionNumber=${a}`);const o=r.length?`?${r.join("&")}`:"";return ge("GET",`/nodes/${s}/description${o}`)},updateExternalId:(t,s,n)=>ge("PATCH",`/nodes/${s}/external-id`,t,{externalId:n}),getSignatures:(t,s)=>ge("GET",`/nodes/${s}/signatures`),getSignatureHistory:(t,s)=>ge("GET",`/nodes/${s}/signatures/history`),getComments:(t,s)=>ge("GET",`/nodes/${s}/comments`),addComment:(t,s,n,a,r,o)=>ge("POST",`/nodes/${s}/comments`,t,{nodeVersionId:n,text:a,...r?{parentCommentId:r}:{},...o?{attributeName:o}:{}}),getLinkTypes:t=>V("GET","/metamodel/linktypes"),getNodeTypeLinkTypes:(t,s)=>V("GET",`/metamodel/nodetypes/${s}/linktypes`),getRegistryGrouped:t=>pe("GET","/admin/registry/grouped"),getRegistryTagsAdmin:t=>pe("GET","/admin/registry/tags"),getRegistryOverview:t=>pe("GET","/admin/registry/overview"),getItems:t=>pe("GET","/items"),gatewayJson:(t,s,n)=>js(t,s,n),gatewayRawText:async(t,s=64*1024)=>{const n={};je&&(n.Authorization=`Bearer ${je}`),Ee&&(n["X-PLM-ProjectSpace"]=Ee),n.Range=`bytes=0-${s-1}`;const a=await _e(t,{method:"GET",headers:n},"GET");if(!a.ok&&a.status!==206)throw new Error(`HTTP ${a.status}`);const r=a.body.getReader(),o=[];let i=0;for(;;){const{done:z,value:D}=await r.read();if(z)break;if(D&&(o.push(D),i+=D.length),i>=s){r.cancel();break}}const c=new Uint8Array(i);let u=0;for(const z of o)c.set(z,u),u+=z.length;const p=new TextDecoder("utf-8",{fatal:!1}).decode(c),x=a.headers.get("Content-Range"),g=x&&parseInt(x.split("/")[1],10)||null,k=a.status===206||i>=s;return{text:p,truncated:k,totalBytes:g}},fetchListableItems:async(t,s,n=0,a=50)=>{var D;const r=s.list,o=s.serviceCode?it(s.serviceCode):"",i=r.path.includes("?")?"&":"?",c=r.pageParam||"page",u=r.sizeParam||"size",p=`${o}${r.path}${i}${c}=${n}&${u}=${a}`,x={};je&&(x.Authorization=`Bearer ${je}`),Ee&&(x["X-PLM-ProjectSpace"]=Ee);const g=await _e(p,{method:"GET",headers:x},"GET");if(!g.ok){const $=await g.json().catch(()=>({error:g.statusText})),f=(D=$.violations)!=null&&D.length?$.violations.join("; "):$.error||$.message||`HTTP ${g.status}`,d=new Error(f);throw d.detail=$,d}const k=await g.text(),z=k?JSON.parse(k):null;return Jr(z,n,a)},getSources:t=>ge("GET","/sources"),getSourceKeys:(t,s,n,a="",r=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),a&&o.set("q",a),o.set("limit",String(r)),ge("GET",`/sources/${encodeURIComponent(s)}/keys?${o.toString()}`)},getChildLinks:(t,s)=>ge("GET",`/nodes/${s}/links/children`),getParentLinks:(t,s)=>ge("GET",`/nodes/${s}/links/parents`),getLifecycles:t=>V("GET","/metamodel/lifecycles"),getLifecycleStates:(t,s)=>V("GET",`/metamodel/lifecycles/${s}/states`),getLifecycleTransitions:(t,s)=>V("GET",`/metamodel/lifecycles/${s}/transitions`),createLifecycle:(t,s)=>V("POST","/metamodel/lifecycles",t,s),duplicateLifecycle:(t,s,n)=>V("POST",`/metamodel/lifecycles/${s}/duplicate`,t,{name:n}),deleteLifecycle:(t,s)=>V("DELETE",`/metamodel/lifecycles/${s}`),addLifecycleState:(t,s,n)=>V("POST",`/metamodel/lifecycles/${s}/states`,t,n),updateLifecycleState:(t,s,n,a)=>V("PUT",`/metamodel/lifecycles/${s}/states/${n}`,t,a),deleteLifecycleState:(t,s,n)=>V("DELETE",`/metamodel/lifecycles/${s}/states/${n}`),listLifecycleStateActions:(t,s,n)=>V("GET",`/metamodel/lifecycles/${s}/states/${n}/actions`),attachLifecycleStateAction:(t,s,n,a,r,o,i=0)=>V("POST",`/metamodel/lifecycles/${s}/states/${n}/actions`,t,{instanceId:a,trigger:r,executionMode:o,displayOrder:i}),detachLifecycleStateAction:(t,s,n,a)=>V("DELETE",`/metamodel/lifecycles/${s}/states/${n}/actions/${a}`),addLifecycleTransition:(t,s,n)=>V("POST",`/metamodel/lifecycles/${s}/transitions`,t,n),updateLifecycleTransition:(t,s,n,a)=>V("PUT",`/metamodel/lifecycles/${s}/transitions/${n}`,t,a),deleteLifecycleTransition:(t,s,n)=>V("DELETE",`/metamodel/lifecycles/${s}/transitions/${n}`),addTransitionSignatureRequirement:(t,s,n,a=0)=>V("POST",`/metamodel/transitions/${s}/signature-requirements`,t,{roleId:n,displayOrder:a}),removeTransitionSignatureRequirement:(t,s,n)=>V("DELETE",`/metamodel/transitions/${s}/signature-requirements/${n}`),deleteNodeType:(t,s)=>V("DELETE",`/metamodel/nodetypes/${s}`),updateNodeTypeIdentity:(t,s,n)=>V("PUT",`/metamodel/nodetypes/${s}/identity`,t,n),updateNodeTypeNumberingScheme:(t,s,n)=>V("PUT",`/metamodel/nodetypes/${s}/numbering-scheme`,t,{numberingScheme:n}),updateNodeTypeVersionPolicy:(t,s,n)=>V("PUT",`/metamodel/nodetypes/${s}/version-policy`,t,{versionPolicy:n}),updateNodeTypeCollapseHistory:(t,s,n)=>V("PUT",`/metamodel/nodetypes/${s}/collapse-history`,t,{collapseHistory:n}),updateNodeTypeLifecycle:(t,s,n)=>V("PUT",`/metamodel/nodetypes/${s}/lifecycle`,t,{lifecycleId:n||null}),updateNodeTypeAppearance:(t,s,n,a)=>V("PUT",`/metamodel/nodetypes/${s}/appearance`,t,{color:n||null,icon:a||null}),updateAttribute:(t,s,n,a)=>V("PUT",`/metamodel/nodetypes/${s}/attributes/${n}`,t,a),deleteAttribute:(t,s,n)=>V("DELETE",`/metamodel/nodetypes/${s}/attributes/${n}`),updateLinkType:(t,s,n)=>V("PUT",`/metamodel/linktypes/${s}`,t,n),deleteLinkType:(t,s)=>V("DELETE",`/metamodel/linktypes/${s}`),getLinkTypeAttributes:(t,s)=>V("GET",`/metamodel/linktypes/${s}/attributes`),createLinkTypeAttribute:(t,s,n)=>V("POST",`/metamodel/linktypes/${s}/attributes`,t,n),updateLinkTypeAttribute:(t,s,n,a)=>V("PUT",`/metamodel/linktypes/${s}/attributes/${n}`,t,a),deleteLinkTypeAttribute:(t,s,n)=>V("DELETE",`/metamodel/linktypes/${s}/attributes/${n}`),getLinkTypeCascades:(t,s)=>V("GET",`/metamodel/linktypes/${s}/cascades`),createLinkTypeCascade:(t,s,n,a,r)=>V("POST",`/metamodel/linktypes/${s}/cascades`,t,{parentTransitionId:n,childFromStateId:a,childTransitionId:r}),deleteLinkTypeCascade:(t,s,n)=>V("DELETE",`/metamodel/linktypes/${s}/cascades/${n}`),getNodeTypeAttributes:(t,s)=>V("GET",`/metamodel/nodetypes/${s}/attributes`),createNodeType:(t,s)=>V("POST","/metamodel/nodetypes",t,s),updateNodeTypeParent:(t,s,n)=>V("PUT",`/metamodel/nodetypes/${s}/parent`,t,{parentNodeTypeId:n||null}),createAttribute:(t,s,n)=>V("POST",`/metamodel/nodetypes/${s}/attributes`,t,n),createLinkType:(t,s)=>V("POST","/metamodel/linktypes",t,s),getSourcesAdmin:t=>V("GET","/sources"),getSourceResolversAdmin:t=>V("GET","/sources/resolvers"),createSource:(t,s)=>V("POST","/sources",t,s),updateSource:(t,s,n)=>V("PUT",`/sources/${s}`,t,n),deleteSource:(t,s)=>V("DELETE",`/sources/${s}`),getImportContexts:()=>V("GET","/admin/import-contexts"),createImportContext:t=>V("POST","/admin/import-contexts",null,t),updateImportContext:(t,s)=>V("PUT",`/admin/import-contexts/${t}`,null,s),deleteImportContext:t=>V("DELETE",`/admin/import-contexts/${t}`),getImportAlgorithmInstances:()=>V("GET","/admin/import-contexts/algorithm-instances/import"),getValidationAlgorithmInstances:()=>V("GET","/admin/import-contexts/algorithm-instances/validation"),getSources:t=>ge("GET","/sources"),getSourceTypes:(t,s)=>ge("GET",`/sources/${s}/types`),suggestSourceKeys:(t,s,n,a,r=25)=>{const o=new URLSearchParams;return n&&o.set("type",n),a&&o.set("q",a),o.set("limit",String(r)),ge("GET",`/sources/${s}/keys?${o.toString()}`)},getAllActions:t=>V("GET","/metamodel/actions"),getActionsForNodeType:(t,s)=>V("GET",`/metamodel/nodetypes/${s}/actions`),registerCustomAction:(t,s)=>V("POST","/metamodel/actions",t,s),getPermissionGrants:(t,s,n,a)=>ne("GET",`/nodetypes/${s}/permissions/${n}${a?`?transitionId=${encodeURIComponent(a)}`:""}`),addPermissionGrant:(t,s,n,a,r)=>ne("POST",`/nodetypes/${s}/permissions/${n}`,t,{roleId:a,transitionId:r||null}),removePermissionGrant:(t,s,n,a,r)=>ne("DELETE",`/nodetypes/${s}/permissions/${n}`,t,{roleId:a,transitionId:r||null}),getDomains:t=>V("GET","/domains"),createDomain:(t,s)=>V("POST","/domains",t,s),updateDomain:(t,s,n)=>V("PUT",`/domains/${s}`,t,n),deleteDomain:(t,s)=>V("DELETE",`/domains/${s}`),getDomainAttributes:(t,s)=>V("GET",`/domains/${s}/attributes`),createDomainAttribute:(t,s,n)=>V("POST",`/domains/${s}/attributes`,t,n),updateDomainAttribute:(t,s,n,a)=>V("PUT",`/domains/${s}/attributes/${n}`,t,a),deleteDomainAttribute:(t,s,n)=>V("DELETE",`/domains/${s}/attributes/${n}`),getEnums:t=>V("GET","/enums"),getEnumDetail:(t,s)=>V("GET",`/enums/${s}`),createEnum:(t,s)=>V("POST","/enums",t,s),updateEnum:(t,s,n)=>V("PUT",`/enums/${s}`,t,n),deleteEnum:(t,s)=>V("DELETE",`/enums/${s}`),getEnumValues:(t,s)=>V("GET",`/enums/${s}/values`),addEnumValue:(t,s,n)=>V("POST",`/enums/${s}/values`,t,n),updateEnumValue:(t,s,n,a)=>V("PUT",`/enums/${s}/values/${n}`,t,a),deleteEnumValue:(t,s,n)=>V("DELETE",`/enums/${s}/values/${n}`),reorderEnumValues:(t,s,n)=>V("PUT",`/enums/${s}/values/reorder`,t,n),listBaselines:t=>ge("GET","/baselines"),createBaseline:(t,s,n,a)=>ge("POST","/baselines",t,{userId:t,rootNodeId:s,name:n,description:a}),getBaselineContent:(t,s)=>ge("GET",`/baselines/${s}/content`),getRoles:t=>ne("GET","/roles"),createRole:(t,s,n)=>ne("POST","/roles",t,{name:s,description:n}),updateRole:(t,s,n,a)=>ne("PUT",`/roles/${s}`,t,{name:n,description:a}),deleteRole:(t,s)=>ne("DELETE",`/roles/${s}`),listProjectSpaces:t=>ne("GET",`/project-spaces${t?`?userId=${encodeURIComponent(t)}`:""}`),createProjectSpace:(t,s,n)=>ne("POST","/project-spaces",t,{name:s,description:n}),deactivateProjectSpace:(t,s)=>ne("DELETE",`/project-spaces/${s}`),getProjectSpaceServiceTags:(t,s)=>ne("GET",`/project-spaces/${s}/service-tags`),setProjectSpaceServiceTags:(t,s,n,a)=>ne("PUT",`/project-spaces/${s}/service-tags/${n}`,t,{tags:a}),setProjectSpaceIsolated:(t,s,n)=>ne("PUT",`/project-spaces/${s}/isolated`,t,{isolated:n}),listUsers:t=>ne("GET","/users"),getUser:(t,s)=>ne("GET",`/users/${s}`),updateUser:(t,s,n,a)=>ne("PUT",`/users/${s}`,t,{displayName:n,email:a}),createUser:(t,s,n,a)=>ne("POST","/users",t,{username:s,displayName:n,email:a}),deactivateUser:(t,s)=>ne("DELETE",`/users/${s}`),getUserRoles:(t,s,n)=>ne("GET",`/users/${s}/roles${n?`?projectSpaceId=${encodeURIComponent(n)}`:""}`),assignRole:(t,s,n,a)=>ne("POST",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(a)}`),removeRole:(t,s,n,a)=>ne("DELETE",`/users/${s}/roles/${n}?projectSpaceId=${encodeURIComponent(a)}`),setUserAdmin:(t,s,n)=>ne("PUT",`/users/${s}/admin`,t,{isAdmin:n}),getUserContext:(t,s)=>ne("GET",`/users/${t}/context${s?`?projectSpaceId=${encodeURIComponent(s)}`:""}`),getDashboardTransaction:t=>ge("GET","/dashboard/transaction"),getDashboardWorkItems:t=>ge("GET","/dashboard/workitems"),listPermissions:t=>ne("GET","/permissions"),createPermission:(t,s,n,a,r,o)=>ne("POST","/permissions",t,{permissionCode:s,scope:n,displayName:a,description:r,displayOrder:o}),updatePermission:(t,s,n,a,r)=>ne("PUT",`/permissions/${s}`,t,{displayName:n,description:a,displayOrder:r}),getRolePolicies:(t,s)=>ne("GET",`/roles/${s}/policies`),listGlobalActions:t=>ne("GET","/global-actions"),getMyGlobalPermissions:t=>ne("GET","/my-global-permissions"),getSettingsSections:t=>pe("GET","/sections"),getUiManifest:()=>pe("GET","/ui/manifest"),createResource:(t,s)=>ta(t,s),getRoleGlobalPermissions:(t,s)=>ne("GET",`/roles/${s}/global-permissions`),addRoleGlobalPermission:(t,s,n)=>ne("POST",`/roles/${s}/global-permissions`,t,{permissionCode:n}),removeRoleGlobalPermission:(t,s,n)=>ne("DELETE",`/roles/${s}/global-permissions/${n}`),getRoleScopePermissions:(t,s,n)=>ne("GET",`/roles/${s}/scope-permissions/${n}`),addRoleScopePermission:(t,s,n,a)=>ne("POST",`/roles/${s}/scope-permissions/${n}`,t,{permissionCode:a}),removeRoleScopePermission:(t,s,n,a)=>ne("DELETE",`/roles/${s}/scope-permissions/${n}/${a}`),getAccessRightsTree:(t,s)=>ne("GET",`/access-rights/tree${s?`?projectSpaceId=${s}`:""}`),getGrantsForRoleAndScope:(t,s,n)=>ne("GET",`/access-rights/roles/${s}/grants?scopeCode=${n}`),addScopedGrant:(t,s)=>ne("POST","/access-rights/grants",t,s),removeScopedGrant:(t,s)=>ne("DELETE","/access-rights/grants",t,s),listSecrets:t=>pe("GET","/admin/secrets"),revealSecret:(t,s)=>pe("GET",`/admin/secrets/${encodeURIComponent(s)}`),createSecret:(t,s,n)=>pe("POST","/admin/secrets",t,{key:s,value:n}),updateSecret:(t,s,n)=>pe("PUT",`/admin/secrets/${encodeURIComponent(s)}`,t,{value:n}),deleteSecret:(t,s)=>pe("DELETE",`/admin/secrets/${encodeURIComponent(s)}`),listAllInstances:t=>pe("GET","/algorithms/instances"),listTransitionGuards:(t,s)=>V("GET",`/metamodel/lifecycles/transitions/${s}/guards`),attachTransitionGuard:(t,s,n,a,r)=>V("POST",`/metamodel/lifecycles/transitions/${s}/guards`,t,{instanceId:n,effect:a,displayOrder:r}),updateTransitionGuard:(t,s,n)=>V("PUT",`/metamodel/lifecycles/transitions/guards/${s}`,t,{effect:n}),detachTransitionGuard:(t,s)=>V("DELETE",`/metamodel/lifecycles/transitions/guards/${s}`)},Se={listActions:(t,s)=>pe("GET",`/actions${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAction:(t,s)=>pe("GET",`/actions/${s}`),createAction:(t,s)=>pe("POST","/actions",t,s),updateAction:(t,s,n)=>pe("PUT",`/actions/${s}`,t,n),deleteAction:(t,s)=>pe("DELETE",`/actions/${s}`),listParameters:(t,s)=>pe("GET",`/actions/${s}/parameters`),addParameter:(t,s,n)=>pe("POST",`/actions/${s}/parameters`,t,n),listActionGuards:(t,s)=>pe("GET",`/actions/${s}/guards`),attachActionGuard:(t,s,n,a,r)=>pe("POST",`/actions/${s}/guards`,t,{instanceId:n,effect:a,displayOrder:r}),updateActionGuard:(t,s,n,a)=>pe("PUT",`/actions/${s}/guards/${n}`,t,{effect:a}),detachActionGuard:(t,s,n)=>pe("DELETE",`/actions/${s}/guards/${n}`),listAlgorithmTypes:(t,s)=>pe("GET",`/algorithms/types${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithms:(t,s)=>pe("GET",`/algorithms${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listAlgorithmParameters:(t,s)=>pe("GET",`/algorithms/${s}/parameters`),listAllInstances:(t,s)=>pe("GET",`/algorithms/instances${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),createInstance:(t,s,n,a)=>pe("POST","/algorithms/instances",t,{algorithmId:s,name:n,serviceCode:a}),updateInstance:(t,s,n)=>pe("PUT",`/algorithms/instances/${s}`,t,{name:n}),deleteInstance:(t,s)=>pe("DELETE",`/algorithms/instances/${s}`),getInstanceParams:(t,s)=>pe("GET",`/algorithms/instances/${s}/params`),setInstanceParam:(t,s,n,a)=>pe("PUT",`/algorithms/instances/${s}/params/${n}`,t,{value:a}),getAlgorithmStats:(t,s)=>pe("GET",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),getAlgorithmTimeseries:(t,s=24,n)=>pe("GET",`/algorithms/stats/timeseries?hours=${s}${n?`&serviceCode=${encodeURIComponent(n)}`:""}`),resetAlgorithmStats:(t,s)=>pe("DELETE",`/algorithms/stats${s?`?serviceCode=${encodeURIComponent(s)}`:""}`),listActionWrappers:(t,s)=>pe("GET",`/algorithms/actions/${s}/wrappers`),attachActionWrapper:(t,s,n,a,r)=>pe("POST",`/algorithms/actions/${s}/wrappers`,t,{instanceId:n,executionOrder:a,serviceCode:r}),detachActionWrapper:(t,s,n)=>pe("DELETE",`/algorithms/actions/${s}/wrappers/${n}`),getRegisteredServices:()=>pe("GET","/algorithms/services"),getServiceCatalog:t=>pe("GET","/registry/actions").then(s=>{var n;return((n=s==null?void 0:s.services)==null?void 0:n[t])||{handlers:[],guards:[]}})},ut={open:(t,s)=>ge("POST","/transactions",t,{title:s}),current:t=>ge("GET","/transactions/current"),commit:(t,s,n,a)=>ge("POST",`/actions/commit/${s}`,t,{parameters:{comment:n,...a?{nodeIds:a.join(",")}:{}}}),release:(t,s,n)=>ge("POST",`/transactions/${s}/release`,t,{nodeIds:n}),rollback:(t,s)=>ge("POST",`/actions/rollback/${s}`,t,{parameters:{}}),get:(t,s)=>ge("GET",`/transactions/${s}`),versions:(t,s)=>ge("GET",`/transactions/${s}/versions`),nodes:(t,s)=>ge("GET",`/transactions/${s}/nodes`)};async function _s(t,s,n,a,r){return De(it("psm"),t,s,r,{txId:a})}async function jn(t,s){const n={"Content-Type":"application/json"};je&&(n.Authorization=`Bearer ${je}`),Ee&&(n["X-PLM-ProjectSpace"]=Ee);const a=await _e(`/api/${t}${s}`,{method:"GET",headers:n},"GET");if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}const na={submitImport:async(t,s,n,a)=>{const r={};je&&(r.Authorization=`Bearer ${je}`),Ee&&(r["X-PLM-ProjectSpace"]=Ee);const o=new FormData;o.append("file",t),n&&o.append("contextCode",n);const i=a?await Zt(`/api/psm/cad/import/${s}`,"POST",r,o,a):await _e(`/api/psm/cad/import/${s}`,{method:"POST",headers:r,body:o},"POST");if(!i.ok){const c=await i.text();throw new Error(`HTTP ${i.status}: ${c}`)}return i.json()},getJobStatus:async t=>{const s={"Content-Type":"application/json"};je&&(s.Authorization=`Bearer ${je}`),Ee&&(s["X-PLM-ProjectSpace"]=Ee);const n=await _e(`/api/psm/cad/jobs/${t}`,{method:"GET",headers:s},"GET");if(!n.ok)throw new Error(`HTTP ${n.status}`);return n.json()},getImportContexts:async()=>{const t={"Content-Type":"application/json"};je&&(t.Authorization=`Bearer ${je}`),Ee&&(t["X-PLM-ProjectSpace"]=Ee);const s=await _e("/api/psm/cad/import-contexts",{method:"GET",headers:t},"GET");return s.ok?s.json():[]}},ra={executeAction:(t,s,n,a,r,o)=>{const i=o?`/actions/${s}/${t}/${o}`:`/actions/${s}/${t}`;return _s("POST",i,n,a,{parameters:r||{}})},executeViaDescriptor:async(t,s,n,a,r,o)=>{var u;const i=(t.path||"").replace("{id}",s).replace("{transitionId}",((u=t.metadata)==null?void 0:u.transitionId)||""),c=t.httpMethod||"POST";if(t.bodyShape==="MULTIPART"){const p=new FormData;for(const[z,D]of Object.entries(r||{}))D!=null&&p.append(z,D);const x={};je&&(x.Authorization=`Bearer ${je}`),Ee&&(x["X-PLM-ProjectSpace"]=Ee),a&&(x["X-PLM-Tx"]=a);const g=o?await Zt("/api/psm"+i,c,x,p,o):await _e("/api/psm"+i,{method:c,headers:x,body:p},c);if(!g.ok){const z=await g.text();throw new Error(`HTTP ${g.status}: ${z}`)}const k=await g.text();return k?JSON.parse(k):null}return _s(c,i,n,a,{parameters:r||{}})}},Ct={list:t=>ne("GET",`/users/${encodeURIComponent(t)}/basket`),add:(t,s,n,a)=>ne("PUT",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(a)}`),remove:(t,s,n,a)=>ne("DELETE",`/users/${encodeURIComponent(t)}/basket/${encodeURIComponent(s)}/${encodeURIComponent(n)}/${encodeURIComponent(a)}`),clear:t=>ne("DELETE",`/users/${encodeURIComponent(t)}/basket`)},wn={getSingle:(t,s,n)=>ne("GET",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}`,void 0,void 0,{psOverride:""}),setSingle:(t,s,n,a)=>ne("PUT",`/users/${encodeURIComponent(t)}/kv/${encodeURIComponent(s)}/single/${encodeURIComponent(n)}/${encodeURIComponent(a)}`,void 0,void 0,{psOverride:""})},ee=cn((t,s)=>({userId:null,setUserId:n=>t({userId:n}),projectSpaceId:null,setProjectSpaceId:n=>t({projectSpaceId:n}),items:[],nodeTypes:[],resources:[],itemsStatus:"idle",refreshItems:async()=>{const{userId:n}=s();if(n){t({itemsStatus:"loading"});try{const a=await q.getItems(n),r=Array.isArray(a)?a:[],o=r.filter(p=>p.serviceCode==="psm"&&p.itemCode==="node"&&p.itemKey&&p.list).map(p=>({id:p.itemKey,name:p.displayName,description:p.description,color:p.color,icon:p.icon})),i=r.filter(p=>p.create),c=r.filter(p=>p.serviceCode==="psm"&&p.itemCode==="node"&&p.list),u=await Promise.all(c.map(p=>q.fetchListableItems(n,p,0,50).then(x=>x.items||[]).catch(()=>[])));t({items:r,nodeTypes:o,resources:i,itemsStatus:"loaded",nodes:u.flat()})}catch{t({items:[],nodeTypes:[],resources:[],itemsStatus:"idle"})}}},stateColorMap:{},stateColorMapLoaded:!1,refreshStateColorMap:async()=>{const{userId:n}=s();if(n)try{const a=await q.getLifecycles(n);if(!Array.isArray(a))return;const r=await Promise.all(a.map(i=>q.getLifecycleStates(n,i.id||i.ID).catch(()=>[]))),o={};r.forEach(i=>i.forEach(c=>{const u=c.id||c.ID,p=c.color||c.COLOR;u&&p&&(o[u]=p)})),t({stateColorMap:o,stateColorMapLoaded:!0})}catch{}},projectSpaces:[],users:[],refreshProjectSpaces:async()=>{const{userId:n}=s();if(n)try{const a=await q.listProjectSpaces(n);t({projectSpaces:Array.isArray(a)?a:[]})}catch{}},refreshUsers:async()=>{const{userId:n}=s();if(n)try{const a=await q.listUsers(n);t({users:Array.isArray(a)?a.filter(r=>r.active!==!1):[]})}catch{}},nodes:[],refreshNodes:async()=>{const{userId:n,items:a}=s();if(n)try{const r=a.filter(i=>i.serviceCode==="psm"&&i.itemCode==="node"&&i.list),o=await Promise.all(r.map(i=>q.fetchListableItems(n,i,0,50).then(c=>c.items||[]).catch(()=>[])));t({nodes:o.flat()})}catch{}},activeTx:null,txNodes:[],lockedByMe:new Set,lockItem:n=>t(a=>{const r=new Set(a.lockedByMe);return r.add(n),{lockedByMe:r}}),unlockItem:n=>t(a=>{const r=new Set(a.lockedByMe);return r.delete(n),{lockedByMe:r}}),unlockAll:()=>t({lockedByMe:new Set}),refreshTx:async()=>{const{userId:n}=s();if(n)try{const a=await ut.current(n);if(a){const r=a.ID||a.id,o=await ut.nodes(n,r).catch(()=>[]),i=Array.isArray(o)?o:[],c=new Set(i.map(u=>u.node_id||u.NODE_ID).filter(Boolean));t({activeTx:a,txNodes:i,lockedByMe:c})}else t({activeTx:null,txNodes:[],lockedByMe:new Set})}catch{t({activeTx:null,txNodes:[],lockedByMe:new Set})}},clearTx:()=>t({activeTx:null,txNodes:[],lockedByMe:new Set}),refreshAll:async()=>{const{refreshItems:n,refreshTx:a}=s();await Promise.all([n(),a()])},basketItems:{},basketLoaded:!1,loadBasket:async n=>{if(n)try{const a=await Ct.list(n),r={};(a||[]).forEach(({source:o,typeCode:i,itemId:c})=>{const u=`${o}:${i}`;r[u]||(r[u]=new Set),r[u].add(c)}),t({basketItems:r,basketLoaded:!0})}catch{t({basketItems:{},basketLoaded:!0})}},addToBasket:async(n,a,r,o)=>{const i=`${a}:${r}`;t(c=>{const u=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return u.add(o),{basketItems:{...c.basketItems,[i]:u}}});try{await Ct.add(n,a,r,o)}catch{}},removeFromBasket:async(n,a,r,o)=>{const i=`${a}:${r}`;t(c=>{const u=c.basketItems[i]?new Set(c.basketItems[i]):new Set;return u.delete(o),{basketItems:{...c.basketItems,[i]:u}}});try{await Ct.remove(n,a,r,o)}catch{}},emptyBasket:async n=>{const{lockedByMe:a,basketItems:r}=s(),o=new Set(a);if(![...Object.entries(r)].some(([p,x])=>p.startsWith("psm:")&&[...x].some(g=>o.has(g)))){t({basketItems:{}});try{await Ct.clear(n)}catch{}return}const c={},u=[];for(const[p,x]of Object.entries(r)){const g=p.indexOf(":"),k=g>-1?p.slice(0,g):p,z=g>-1?p.slice(g+1):"",D=new Set;for(const $ of x){if(k==="psm"&&o.has($)){D.add($);continue}u.push(Ct.remove(n,k,z,$).catch(()=>{}))}D.size>0&&(c[p]=D)}t({basketItems:c}),await Promise.all(u)},isInBasket:(n,a,r)=>{const o=`${n}:${a}`,{basketItems:i}=ee.getState();return!!(i[o]&&i[o].has(r))},syncBasketAdd:(n,a)=>t(r=>{const o=r.basketItems[n]?new Set(r.basketItems[n]):new Set;return o.add(a),{basketItems:{...r.basketItems,[n]:o}}}),syncBasketRemove:(n,a)=>t(r=>{if(!r.basketItems[n])return{};const o=new Set(r.basketItems[n]);return o.delete(a),{basketItems:{...r.basketItems,[n]:o}}}),syncBasketClear:()=>t({basketItems:{}}),removeBasketItemIds:n=>t(a=>{const r=new Set(n),o={};for(const[i,c]of Object.entries(a.basketItems)){const u=new Set([...c].filter(p=>!r.has(p)));u.size>0&&(o[i]=u)}return{basketItems:o}}),_slices:{},_sliceActions:{}})),kn="plm-theme",Sn="UI_PREF";function ps(t){return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}function ms(t){document.documentElement.setAttribute("data-theme",t)}function Yt(){return localStorage.getItem(kn)||"dark"}function ws(t){localStorage.setItem(kn,t),ms(ps(t))}async function aa(t){try{const s=await wn.getSingle(t,Sn,"theme");s!=null&&s.value&&ws(s.value)}catch{}}async function oa(t,s){try{await wn.setSingle(t,Sn,"theme",s)}catch{}}function ia(){const t=Yt();ms(ps(t)),window.matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{Yt()==="system"&&ms(ps("system"))})}const we=cn(t=>({showCollab:!1,collabWidth:320,collabVersionFilter:null,collabTriggerText:null,collabTabs:[],toggleCollab:()=>t(s=>({showCollab:!s.showCollab})),openCollab:()=>t({showCollab:!0}),closeCollab:()=>t({showCollab:!1}),setCollabWidth:s=>t({collabWidth:s}),setVersionFilter:s=>t({collabVersionFilter:s}),setTriggerText:s=>t({collabTriggerText:s}),clearTriggerText:()=>t({collabTriggerText:null}),addCollabTab:(s,n,a)=>t(r=>({collabTabs:r.collabTabs.some(o=>o.id===s)?r.collabTabs:[...r.collabTabs,{id:s,label:n,Component:a}]})),removeCollabTab:s=>t(n=>({collabTabs:n.collabTabs.filter(a=>a.id!==s)})),consoleVisible:!1,consoleHeight:220,consoleTabs:[],consoleLog:[],toggleConsole:()=>t(s=>({consoleVisible:!s.consoleVisible})),openConsole:()=>t({consoleVisible:!0}),setConsoleHeight:s=>t({consoleHeight:s}),addConsoleTab:(s,n,a)=>t(r=>({consoleTabs:r.consoleTabs.some(o=>o.id===s)?r.consoleTabs:[...r.consoleTabs,{id:s,label:n,Component:a}]})),removeConsoleTab:s=>t(n=>({consoleTabs:n.consoleTabs.filter(a=>a.id!==s)})),appendLog:(s,n)=>t(a=>({consoleLog:[...a.consoleLog.slice(-500),{level:s,message:n,ts:Date.now()}]})),statusSlots:[],registerStatus:(s,n,a="left")=>t(r=>({statusSlots:r.statusSlots.some(o=>o.id===s)?r.statusSlots.map(o=>o.id===s?{id:s,Component:n,position:a}:o):[...r.statusSlots,{id:s,Component:n,position:a}]})),unregisterStatus:s=>t(n=>({statusSlots:n.statusSlots.filter(a=>a.id!==s)}))}));function Et(t,s){we.getState().appendLog(t,s)}function la(t){if(!t.event)return`[WS] (unknown) ${JSON.stringify(t)}`;const s=[t.event];return t.byUser&&s.push(`by ${t.byUser}`),t.nodeId&&s.push(`node=${t.nodeId}`),t.userId&&s.push(`user=${t.userId}`),t.entity&&s.push(t.entity),t.status&&s.push(t.status),t.jobId&&s.push(`job=${t.jobId}`),`[WS] ${s.join(" · ")}`}function ks(t,s,n){const a=l.useRef(s);a.current=s;const r=Array.isArray(t)?t:t?[t]:[],o=r.join("\0");l.useEffect(()=>{if(r.length===0)return;let i=null,c=null,u=1e3,p=!1;function x(){if(p)return;const g=kt(),k=location.protocol==="https:"?"wss:":"ws:",z=g?`${k}//${location.host}/api/ws/?token=${encodeURIComponent(g)}`:`${k}//${location.host}/api/ws/`;i=new WebSocket(z),i.onopen=()=>{u=1e3,Et("debug","[WS] connected")},i.onmessage=D=>{try{const $=JSON.parse(D.data);Et("info",la($)),a.current($)}catch($){console.warn("WS parse error",$),Et("warn",`[WS] parse error: ${$.message}`)}},i.onclose=D=>{p||(Et("warn",`[WS] disconnected — reconnecting in ${u}ms`),c=setTimeout(()=>{u=Math.min(u*2,3e4),x()},u))},i.onerror=()=>{Et("warn","[WS] connection error")}}return x(),()=>{p=!0,c&&clearTimeout(c),i&&(i.onclose=null,i.close())}},[o,n])}const ft={Box:fr,Package:fn,Cpu:ys,Wrench:xr,Cog:hr,Database:xn,Globe:hn,BookOpen:un,Clipboard:ur,Tag:mr,FolderOpen:pr,Archive:dr,Zap:vs,FlaskConical:cr,Microscope:lr,Layers:bs,FileText:ir,GitBranch:mn,Hexagon:Lt,Circle:or,Users:pn,Shield:ht,Award:dn,LayoutDashboard:ar,Component:rr,Blocks:nr,Cable:sr,Gauge:tr,Radio:er,Scan:Qn},ca={user:Jt,layers:bs,database:xn,list:jr,lifecycle:mn,plug:yr,hexagon:Lt,users:pn,shield:ht,cpu:ys,workflow:gn,key:vr,network:br,globe:hn,terminal:gr,book:un,zap:vs,package:fn},Bt=Object.freeze({serviceCode:"psm",itemCode:"node",itemKey:null,get:Object.freeze({httpMethod:"GET",path:"/nodes/{id}/description"})}),da=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function pa({userId:t}){const[s,n]=l.useState(Yt);function a(r){n(r),ws(r),t&&oa(t,r)}return e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:8},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:da.map(r=>e.jsxs("button",{type:"button",className:`theme-option${s===r.value?" theme-option--active":""}`,onClick:()=>a(r.value),children:[e.jsx("span",{className:"theme-option-icon",children:r.icon}),e.jsx("span",{children:r.label})]},r.value))})]})}const Ws=["#5b9cf6","#56d18e","#e8c547","#a78bfa","#f87171","#34d399","#fb923c","#60a5fa"];function Nn(t){if(!t)return"#64748b";let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)&4294967295;return Ws[Math.abs(s)%Ws.length]}function Cn(t){const s=(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||"?",n=s.trim().split(/\s+/);return n.length>=2?(n[0][0]+n[1][0]).toUpperCase():s[0].toUpperCase()}function ma({user:t,userId:s}){const n=Nn((t==null?void 0:t.id)||s);return e.jsxs("div",{className:"user-avatar",style:{"--avatar-color":n},title:(t==null?void 0:t.displayName)||(t==null?void 0:t.username),children:[t!=null&&t.avatarUrl?e.jsx("img",{className:"user-avatar-img",src:t.avatarUrl,alt:""}):e.jsx("span",{className:"user-avatar-initials",children:Cn(t)}),(t==null?void 0:t.isAdmin)&&e.jsx("span",{className:"user-avatar-badge",title:"Administrator",children:"A"})]})}function ua({userId:t,onClose:s}){const[n,a]=l.useState(null),[r,o]=l.useState(!1),[i,c]=l.useState({displayName:"",email:""}),[u,p]=l.useState(!1),[x,g]=l.useState(null);l.useEffect(()=>{q.getUser(t,t).then(a).catch(()=>{})},[t]);function k(f,d){g({msg:f,type:d}),setTimeout(()=>g(null),2500)}function z(){c({displayName:(n==null?void 0:n.displayName)||"",email:(n==null?void 0:n.email)||""}),o(!0)}async function D(){p(!0);try{await q.updateUser(t,t,i.displayName.trim(),i.email.trim());const f=await q.getUser(t,t);a(f),o(!1),k("Profile updated","success")}catch{k("Failed to update profile","error")}finally{p(!1)}}l.useEffect(()=>{function f(d){d.key==="Escape"&&s()}return document.addEventListener("keydown",f),()=>document.removeEventListener("keydown",f)},[s]);const $=Nn(t);return e.jsx("div",{className:"profile-modal-overlay",onMouseDown:f=>{f.target===f.currentTarget&&s()},children:e.jsxs("div",{className:"profile-modal",children:[e.jsxs("div",{className:"profile-modal-header",children:[e.jsx("span",{className:"profile-modal-title",children:"My Profile"}),e.jsx("button",{className:"icon-btn",onClick:s,title:"Close",children:e.jsx(jt,{size:14,strokeWidth:2})})]}),e.jsxs("div",{className:"profile-modal-body",children:[x&&e.jsx("div",{style:{padding:"7px 12px",borderRadius:"var(--r)",fontSize:12,fontWeight:500,background:x.type==="success"?"rgba(56,212,113,.15)":"rgba(248,113,113,.15)",color:x.type==="success"?"#34d399":"#f87171",border:`1px solid ${x.type==="success"?"#34d39940":"#f8717140"}`},children:x.msg}),n?e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:"50%",border:`3px solid ${$}`,background:`color-mix(in srgb, ${$} 12%, var(--surface))`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:$,flexShrink:0},children:n.avatarUrl?e.jsx("img",{src:n.avatarUrl,alt:"",style:{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}):Cn(n)}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:14,fontWeight:700,color:"var(--text)"},children:n.displayName||n.username}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)",marginTop:2},children:n.username}),n.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",style:{marginTop:4,display:"inline-block"},children:"Admin"})]})]}),r?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Display Name"}),e.jsx("input",{className:"field-input",autoFocus:!0,value:i.displayName,onChange:f=>c(d=>({...d,displayName:f.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:4},children:"Email"}),e.jsx("input",{className:"field-input",type:"email",value:i.email,onChange:f=>c(d=>({...d,email:f.target.value})),style:{width:"100%"}})]}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx("button",{className:"btn btn-primary",onClick:D,disabled:u,children:u?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>o(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:n.email||"—"})]}),e.jsx("div",{children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:z,children:[e.jsx(xt,{size:11,strokeWidth:2}),"Edit"]})})]}),e.jsx("div",{style:{borderTop:"1px solid var(--border)",paddingTop:12,marginTop:4},children:e.jsx(pa,{userId:t})})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})]})]})})}function ha({currentUser:t,userId:s,users:n,onUserChange:a,onOpenProfile:r,onClose:o}){const i=l.useRef(null);return l.useEffect(()=>{function c(u){i.current&&!i.current.contains(u.target)&&o()}return document.addEventListener("mousedown",c),()=>document.removeEventListener("mousedown",c)},[o]),e.jsxs("div",{className:"profile-menu",ref:i,children:[e.jsxs("div",{className:"profile-menu-header",children:[e.jsx("div",{className:"profile-menu-name",children:(t==null?void 0:t.displayName)||(t==null?void 0:t.username)||s}),(t==null?void 0:t.username)&&t.username!==t.displayName&&e.jsx("div",{className:"profile-menu-username",children:t.username})]}),(n||[]).length>1&&e.jsxs("div",{className:"profile-menu-section",children:[e.jsx("div",{className:"profile-menu-label",children:"Switch user"}),e.jsx("div",{className:"profile-menu-select-row",children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"user-select",style:{width:"100%",paddingRight:28},value:s,onChange:c=>{a(c.target.value),o()},children:n.map(c=>e.jsx("option",{value:c.id,children:c.displayName||c.username},c.id))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})})]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",onClick:()=>{r(),o()},children:[e.jsx(Jt,{size:13,strokeWidth:2,color:"var(--muted)"}),"My Profile"]}),e.jsx("div",{className:"profile-menu-divider"}),e.jsxs("button",{className:"profile-menu-item",disabled:!0,title:"Not yet implemented",children:[e.jsx(kr,{size:13,strokeWidth:2,color:"var(--muted)"}),"Logout"]})]})}function xa({onNavigate:t}){const s=ee(d=>d.basketItems),n=ee(d=>d.emptyBasket),a=ee(d=>d.removeFromBasket),r=ee(d=>d.lockedByMe),o=ee(d=>d.userId);ee(d=>d.projectSpaceId);const i=ee(d=>d.nodes),c=ee(d=>d.nodeTypes),u=ee(d=>d.stateColorMap),p=ee(d=>d.items),[x,g]=Be.useState(!1),k=Be.useRef(null),z=Object.values(s).reduce((d,h)=>d+h.size,0);Be.useEffect(()=>{if(!x)return;function d(h){k.current&&!k.current.contains(h.target)&&g(!1)}return document.addEventListener("mousedown",d),()=>document.removeEventListener("mousedown",d)},[x]);const D=Be.useMemo(()=>{const d=new Map;return(i||[]).forEach(h=>{const w=h.id||h.ID;w&&d.set(w,h)}),d},[i]),$=Be.useMemo(()=>{const d=new Map;return(c||[]).forEach(h=>d.set(h.id,h)),d},[c]),f=Be.useMemo(()=>{const d=[];for(const[h,w]of Object.entries(s)){const j=h.indexOf(":"),A=j>-1?h.slice(0,j):h,T=j>-1?h.slice(j+1):"";for(const O of w)d.push({key:h,source:A,typeCode:T,itemId:O})}return d},[s]);return e.jsxs("div",{className:"basket-btn-wrap",ref:k,children:[e.jsxs("button",{className:"basket-btn",title:"Basket",onClick:()=>g(d=>!d),children:[e.jsx(wr,{size:15,strokeWidth:1.8}),z>0&&e.jsx("span",{className:"basket-badge",children:z>99?"99+":z})]}),x&&e.jsxs("div",{className:"basket-dropdown",children:[e.jsxs("div",{className:"basket-dropdown-header",children:[e.jsx("span",{className:"basket-dropdown-title",children:"Basket"}),e.jsxs("span",{className:"basket-dropdown-count",children:[z," item",z!==1?"s":""]})]}),e.jsx("div",{className:"basket-dropdown-divider"}),z===0?e.jsx("div",{className:"basket-dropdown-empty",children:"No items pinned"}):e.jsx("div",{className:"basket-dropdown-list",children:f.map(({key:d,source:h,typeCode:w,itemId:j})=>{const A=h==="psm"&&r.has(j),T=D.get(j),O=(T==null?void 0:T.node_type_id)||(T==null?void 0:T.NODE_TYPE_ID)||"",K=$.get(O),R=K!=null&&K.icon?ft[K.icon]:null,b=(K==null?void 0:K.color)||null,m=(T==null?void 0:T.logical_id)||(T==null?void 0:T.LOGICAL_ID)||j.slice(0,8)+"…",B=(T==null?void 0:T.revision)||(T==null?void 0:T.REVISION)||"",_=(T==null?void 0:T.iteration)??(T==null?void 0:T.ITERATION)??null,Y=(T==null?void 0:T.lifecycle_state_id)||(T==null?void 0:T.LIFECYCLE_STATE_ID)||"",y=(u==null?void 0:u[Y])||"var(--muted2)",C=_===0?B:B&&_!=null?`${B}.${_}`:"",P=p.find(M=>M.serviceCode===h&&(M.itemKey===w||M.itemCode===w)&&M.get)||(h?{serviceCode:h,itemCode:"node",itemKey:w,get:{path:"/nodes/{id}/description"}}:null);return e.jsxs("div",{className:"basket-dropdown-item",onClick:()=>{!t||!P||(t(j,m,P),g(!1))},style:{cursor:t&&P?"pointer":"default"},children:[e.jsx("span",{className:"basket-item-icon",children:R?e.jsx(R,{size:11,color:b||"var(--muted2)",strokeWidth:2}):b?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:b,display:"inline-block"}}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:"var(--muted2)",display:"inline-block"}})}),Y&&e.jsx("span",{className:"basket-item-state-dot",style:{background:y}}),e.jsx("span",{className:"basket-item-id",title:j,children:m}),C&&e.jsx("span",{className:"basket-item-rev",style:{color:y},children:C}),A?e.jsx("span",{className:"basket-item-locked",title:"Locked in transaction",children:e.jsx(bn,{size:10,strokeWidth:2})}):e.jsx("button",{className:"basket-item-unpin",title:"Unpin",onClick:M=>{M.stopPropagation(),o&&a(o,h,w,j)},children:e.jsx(Nt,{size:11,strokeWidth:2})})]},`${d}:${j}`)})}),e.jsx("div",{className:"basket-dropdown-divider"}),e.jsx("button",{className:"basket-dropdown-action",disabled:z===0,onClick:()=>{o&&n(o),g(!1)},children:"Empty basket"})]})]})}function fa({userId:t,onUserChange:s,users:n,nodeTypes:a,stateColorMap:r,nodes:o,searchQuery:i,searchType:c,onSearchChange:u,onSearchTypeChange:p,onSearchSubmit:x,projectSpaces:g,projectSpaceId:k,onProjectSpaceChange:z,onNavigate:D}){const $=l.useMemo(()=>(n||[]).find(C=>C.id===t),[n,t]),[f,d]=l.useState([]),[h,w]=l.useState(!1),[j,A]=l.useState(-1),[T,O]=l.useState(!1),[K,R]=l.useState(!1),b=l.useRef(null),m=l.useRef(null);l.useEffect(()=>{const C=(i||"").trim().toLowerCase();if(C.length<2){d([]),w(!1);return}const P=(o||[]).filter(M=>{const v=(M.logical_id||M.LOGICAL_ID||"").toLowerCase(),S=(M.display_name||M.DISPLAY_NAME||"").toLowerCase();return v&&v.includes(C)||S&&S.includes(C)}).slice(0,8);d(P),w(P.length>0),A(-1)},[i,o]);const B=l.useCallback(C=>{const P=C.id||C.ID;clearTimeout(b.current),u(""),w(!1),d([]),D&&D(P,void 0,Bt)},[u,D]),_=l.useCallback(C=>{if(C.key==="Enter"){j>=0&&f.length>0?(C.preventDefault(),B(f[j])):i&&i.trim()&&(C.preventDefault(),w(!1),x&&x(i.trim()));return}!h||f.length===0||(C.key==="ArrowDown"?(C.preventDefault(),A(P=>Math.min(P+1,f.length-1))):C.key==="ArrowUp"?(C.preventDefault(),A(P=>Math.max(P-1,0))):C.key==="Escape"&&w(!1))},[h,f,j,B,i,x]),Y=l.useCallback(()=>{b.current=setTimeout(()=>w(!1),150)},[]),y=l.useCallback(()=>{clearTimeout(b.current),f.length>0&&w(!0)},[f.length]);return e.jsxs("header",{className:"header",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("div",{className:"brand",children:[e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{flexShrink:0},children:[e.jsx("rect",{width:"24",height:"24",rx:"5",fill:"url(#psm-grad)"}),e.jsx("circle",{cx:"12",cy:"6",r:"2.2",fill:"white",fillOpacity:"0.95"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"6.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"17.5",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("line",{x1:"12",y1:"8.2",x2:"12",y2:"14.8",stroke:"white",strokeWidth:"1.2",strokeOpacity:"0.7",strokeLinecap:"round"}),e.jsx("circle",{cx:"6.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"12",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("circle",{cx:"17.5",cy:"17",r:"1.8",fill:"white",fillOpacity:"0.85"}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"psm-grad",x1:"0",y1:"0",x2:"24",y2:"24",gradientUnits:"userSpaceOnUse",children:[e.jsx("stop",{offset:"0%",stopColor:"var(--accent)"}),e.jsx("stop",{offset:"100%",stopColor:"#7c3aed"})]})})]}),e.jsx("span",{children:"PSM"})]}),e.jsx("div",{className:"brand-sep"})]}),e.jsx("div",{className:"header-center",children:e.jsxs("div",{className:"search-wrap",children:[e.jsxs("div",{className:"search-group",children:[e.jsx("span",{className:"search-icon",children:"⌕"}),e.jsx("input",{className:"search-input",placeholder:"Search by logical ID…",value:i,onChange:C=>u(C.target.value),onKeyDown:_,onFocus:y,onBlur:Y,autoComplete:"off"}),e.jsx("div",{className:"search-divider"}),e.jsxs("select",{className:"search-type",value:c,onChange:C=>p(C.target.value),title:"Filter by type",children:[e.jsx("option",{value:"",children:"All types"}),(a||[]).map(C=>e.jsx("option",{value:C.id||C.ID,children:C.name||C.NAME},C.id||C.ID))]})]}),h&&f.length>0&&e.jsx("div",{className:"search-suggestions",children:f.map((C,P)=>{const M=C.id||C.ID,v=C.logical_id||C.LOGICAL_ID||"",S=C.node_type_name||C.NODE_TYPE_NAME||"",L=C.node_type_id||C.NODE_TYPE_ID||"",U=C.revision||C.REVISION||"A",F=C.iteration??C.ITERATION??1,G=C.lifecycle_state_id||C.LIFECYCLE_STATE_ID||"",I=(r==null?void 0:r[G])||"#6b7280",E=(a||[]).find(ue=>(ue.id||ue.ID)===L),H=(E==null?void 0:E.color)||(E==null?void 0:E.COLOR)||null,ie=(E==null?void 0:E.icon)||(E==null?void 0:E.ICON)||null,re=ie?ft[ie]:null;return e.jsxs("div",{className:`search-sug-item${P===j?" hi":""}`,onMouseDown:()=>B(C),onMouseEnter:()=>A(P),children:[e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:re?e.jsx(re,{size:11,color:H||"var(--muted)",strokeWidth:2}):H?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:H,display:"inline-block"}}):null}),e.jsx("span",{className:"sug-dot",style:{background:I}}),e.jsx("span",{className:"sug-lid",children:v}),(C.display_name||C.DISPLAY_NAME)&&e.jsx("span",{className:"sug-dname",children:C.display_name||C.DISPLAY_NAME}),e.jsxs("span",{className:"sug-meta",children:[S," · ",F===0?U:`${U}.${F}`]})]},M)})})]})}),e.jsxs("div",{className:"header-right",children:[e.jsx(xa,{onNavigate:D}),(g||[]).length>0&&e.jsxs("div",{className:"ps-select-wrap",title:"Active project space",children:[e.jsx(Lt,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("select",{className:"ps-select",value:k,onChange:C=>z(C.target.value),children:g.map(C=>e.jsx("option",{value:C.id||C.ID,children:C.name||C.NAME},C.id||C.ID))}),e.jsx("span",{className:"user-select-chevron",children:"▾"})]})]}),e.jsxs("div",{className:"profile-menu-wrap",ref:m,children:[e.jsx("button",{className:"profile-avatar-btn",onClick:()=>O(C=>!C),title:"Profile & settings",children:e.jsx(ma,{user:$,userId:t})}),T&&e.jsx(ha,{currentUser:$,userId:t,users:n,onUserChange:s,onOpenProfile:()=>R(!0),onClose:()=>O(!1)})]})]}),K&&e.jsx(ua,{userId:t,onClose:()=>R(!1)})]})}const ga=Be.memo(fa);function us(){const t=kt();return t?{Authorization:`Bearer ${t}`}:{}}const Gs={get:{bg:"rgba(56,189,248,.13)",text:"#38bdf8",border:"rgba(56,189,248,.28)"},post:{bg:"rgba(74,222,128,.13)",text:"#4ade80",border:"rgba(74,222,128,.28)"},put:{bg:"rgba(251,191,36,.13)",text:"#fbbf24",border:"rgba(251,191,36,.28)"},delete:{bg:"rgba(252,129,129,.13)",text:"#fc8181",border:"rgba(252,129,129,.28)"},patch:{bg:"rgba(167,139,250,.13)",text:"#a78bfa",border:"rgba(167,139,250,.28)"}};function ba({method:t}){const s=Gs[t]||Gs.get;return e.jsx("span",{style:{background:s.bg,color:s.text,border:`1px solid ${s.border}`,borderRadius:3,padding:"2px 8px",fontSize:10,fontWeight:700,fontFamily:"var(--sans)",letterSpacing:".07em",textTransform:"uppercase",flexShrink:0,width:58,textAlign:"center",display:"inline-block"},children:t})}function hs(t,s=0){var n;if(!t||s>4)return null;if(t.example!==void 0)return t.example;if(t.type==="object"||t.properties){const a={};return Object.entries(t.properties||{}).forEach(([r,o])=>{a[r]=hs(o,s+1)}),a}return t.type==="array"?[hs(t.items,s+1)]:t.type==="string"?((n=t.enum)==null?void 0:n[0])??"":t.type==="boolean"?!1:t.type==="integer"||t.type==="number"?0:null}function va({method:t,path:s,operation:n,userId:a,projectSpaceId:r,basePath:o}){const[i,c]=l.useState(!1),[u,p]=l.useState({}),[x,g]=l.useState(""),[k,z]=l.useState(null),[D,$]=l.useState(!1),[f,d]=l.useState(a),[h,w]=l.useState(r||"");l.useEffect(()=>{d(a)},[a]),l.useEffect(()=>{w(r||"")},[r]);const j=n.parameters||[],A=["post","put","patch"].includes(t);l.useEffect(()=>{var R,b,m;if(!i||!A||x)return;const O=(b=(R=n.requestBody)==null?void 0:R.content)==null?void 0:b["application/json"];if(!O)return;let K=O.example??((m=O.schema)==null?void 0:m.example);K===void 0&&O.schema&&(K=hs(O.schema)),K!=null&&g(JSON.stringify(K,null,2))},[i,A,n,x]);async function T(){$(!0),z(null);let O=(o||"")+s;j.filter(m=>m.in==="path").forEach(m=>{O=O.replace(`{${m.name}}`,encodeURIComponent(u[m.name]??""))});const K=new URLSearchParams;j.filter(m=>m.in==="query").forEach(m=>{u[m.name]&&K.append(m.name,u[m.name])});const R=K.toString();R&&(O+="?"+R);const b={"Content-Type":"application/json",...us()};h&&(b["X-PLM-ProjectSpace"]=h),j.filter(m=>m.in==="header").forEach(m=>{u[m.name]&&(b[m.name]=u[m.name])});try{const m=await fetch(O,{method:t.toUpperCase(),headers:b,body:A&&x.trim()?x:void 0}),B=await m.text();let _=B;try{_=JSON.stringify(JSON.parse(B),null,2)}catch{}z({status:m.status,ok:m.ok,body:_||"(empty)"})}catch(m){z({status:0,ok:!1,body:`Network error: ${m.message}`})}finally{$(!1)}}return e.jsxs("div",{className:`pg-row${i?" pg-row--open":""}`,children:[e.jsxs("div",{className:"pg-row-hd",onClick:()=>c(O=>!O),children:[e.jsx("span",{className:"pg-chevron",children:i?e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx(ba,{method:t}),e.jsx("code",{className:"pg-path",children:s}),n.summary&&e.jsx("span",{className:"pg-summary",children:n.summary})]}),i&&e.jsxs("div",{className:"pg-row-body",children:[e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Headers"}),e.jsxs("div",{className:"pg-header-grid",children:[e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-User"}),e.jsx("input",{className:"pg-input pg-header-input",value:f,onChange:O=>d(O.target.value),placeholder:"user-alice"})]}),e.jsxs("div",{className:"pg-header-row",children:[e.jsx("code",{className:"pg-header-name",children:"X-PLM-ProjectSpace"}),e.jsx("input",{className:"pg-input pg-header-input",value:h,onChange:O=>w(O.target.value),placeholder:"ps-default"})]})]})]}),j.length>0&&e.jsxs("div",{className:"pg-section",children:[e.jsx("div",{className:"pg-section-label",children:"Parameters"}),e.jsx("div",{className:"pg-params-grid",children:j.map(O=>{var K,R;return e.jsxs("div",{className:"pg-param",children:[e.jsxs("div",{className:"pg-param-hd",children:[e.jsx("code",{className:"pg-param-name",children:O.name}),e.jsx("span",{className:"pg-param-in",children:O.in}),O.required&&e.jsx("span",{className:"pg-param-req",children:"req"}),O.description&&e.jsx("span",{className:"pg-param-desc",children:O.description})]}),e.jsx("input",{className:"pg-input",placeholder:String(((K=O.schema)==null?void 0:K.example)??((R=O.schema)==null?void 0:R.type)??""),value:u[O.name]??"",onChange:b=>p(m=>({...m,[O.name]:b.target.value}))})]},O.name)})})]}),A&&e.jsxs("div",{className:"pg-section",children:[e.jsxs("div",{className:"pg-section-label",children:["Body",e.jsx("span",{className:"pg-section-sub",children:"application/json"})]}),e.jsx("textarea",{className:"pg-body-editor",value:x,onChange:O=>g(O.target.value),rows:5,spellCheck:!1,placeholder:"{}"})]}),e.jsxs("div",{className:"pg-exec-bar",children:[e.jsx("button",{className:"btn btn-primary btn-sm",onClick:T,disabled:D,style:{minWidth:90},children:D?"Sending…":"▶ Execute"}),e.jsxs("span",{className:"pg-exec-meta",children:["as ",e.jsx("strong",{children:a})]}),k&&e.jsx("button",{className:"btn btn-xs",style:{marginLeft:"auto"},onClick:()=>z(null),children:"Clear"})]}),k&&e.jsxs("div",{className:"pg-response",children:[e.jsxs("div",{className:"pg-response-hd",children:[e.jsx("span",{className:"pg-status",style:{background:k.ok?"rgba(77,212,160,.15)":"rgba(252,129,129,.15)",color:k.ok?"var(--success)":"var(--danger)",border:`1px solid ${k.ok?"rgba(77,212,160,.3)":"rgba(252,129,129,.3)"}`},children:k.status||"ERR"}),e.jsx("span",{className:"pg-response-label",children:k.ok?"OK":"Error"})]}),e.jsx("pre",{className:"pg-response-body",children:k.body})]})]})]})}function ya(t){return t?t.endsWith("/")?t.slice(0,-1):t:""}function ja({userId:t,projectSpaceId:s}){var R,b;const[n,a]=l.useState([]),[r,o]=l.useState(null),[i,c]=l.useState(null),[u,p]=l.useState(!0),[x,g]=l.useState(null),[k,z]=l.useState(""),[D,$]=l.useState({}),f=l.useMemo(()=>n.find(m=>m.serviceCode===r)||null,[n,r]),d=ya(f==null?void 0:f.path),h=l.useCallback(()=>{p(!0),g(null),fetch("/api/platform/status",{headers:us(),cache:"no-store"}).then(m=>{if(!m.ok)throw new Error(`HTTP ${m.status} on /api/platform/status`);return m.json()}).then(m=>{const B=(m.services||[]).filter(_=>_.registered&&_.path&&_.serviceCode!=="spe"&&_.serviceCode!=="ws").sort((_,Y)=>_.serviceCode.localeCompare(Y.serviceCode));a(B),B.length===0?(o(null),p(!1),g("No services registered — start backend services first.")):o(_=>B.some(Y=>Y.serviceCode===_)?_:B[0].serviceCode)}).catch(m=>{g(m.message),p(!1)})},[]),w=l.useCallback(()=>{d&&(p(!0),g(null),c(null),fetch(`${d}/v3/api-docs`,{headers:us(),cache:"no-store"}).then(async m=>{if(!m.ok){const _=await m.text().catch(()=>"");throw new Error(`HTTP ${m.status}${_?" — "+_.slice(0,200):""}`)}const B=m.headers.get("content-type")||"";if(!B.includes("json"))throw new Error(`Expected JSON spec, got ${B||"unknown"}.`);return m.json()}).then(m=>{c(m),p(!1)}).catch(m=>{g(m.message),p(!1)}))},[d]);l.useEffect(()=>{h()},[h]),l.useEffect(()=>{w()},[w]),l.useEffect(()=>{z(""),$({})},[r]);const j=l.useMemo(()=>{if(!(i!=null&&i.paths))return[];const m={};Object.entries(i.paths).forEach(([_,Y])=>{Object.entries(Y).forEach(([y,C])=>{var M;if(!["get","post","put","delete","patch"].includes(y))return;const P=((M=C.tags)==null?void 0:M[0])??"default";m[P]||(m[P]=[]),m[P].push({method:y,path:_,operation:C})})});const B=["get","post","put","patch","delete"];return Object.entries(m).sort(([_],[Y])=>_.localeCompare(Y)).map(([_,Y])=>[_,[...Y].sort((y,C)=>B.indexOf(y.method)-B.indexOf(C.method))])},[i]),A=l.useMemo(()=>{const m=k.trim().toLowerCase();return m?j.map(([B,_])=>[B,_.filter(({method:Y,path:y,operation:C})=>Y.includes(m)||y.toLowerCase().includes(m)||(C.summary||"").toLowerCase().includes(m)||B.toLowerCase().includes(m))]).filter(([,B])=>B.length>0):j},[j,k]);function T(m){$(B=>({...B,[m]:!B[m]}))}const O=i?Object.keys(i.paths||{}).length:0,K=e.jsx("select",{className:"pg-service-select",value:r||"",onChange:m=>o(m.target.value),disabled:n.length===0,style:{background:"var(--bg-elev-1)",color:"var(--fg)",border:"1px solid var(--border)",borderRadius:4,padding:"4px 8px",fontSize:12,fontFamily:"var(--mono)",minWidth:160},children:n.map(m=>e.jsxs("option",{value:m.serviceCode,children:[m.serviceCode,"  (",m.path,")"]},m.serviceCode))});return u&&!i?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[K,e.jsx("span",{className:"pg-topbar-meta",children:"loading…"}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:h,title:"Reload services",children:"⟳"})]}),e.jsx("div",{className:"settings-loading",children:"Fetching OpenAPI spec…"})]}):x?e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[K,e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:h,title:"Reload services",children:"⟳"})]}),e.jsxs("div",{style:{padding:24,display:"flex",flexDirection:"column",gap:12},children:[e.jsxs("span",{style:{fontSize:12,color:"var(--danger)"},children:["✗ ",x]}),e.jsx("button",{className:"btn btn-sm",style:{alignSelf:"flex-start"},onClick:w,children:"Retry"})]})]}):e.jsxs("div",{className:"pg-shell",children:[e.jsxs("div",{className:"pg-topbar",children:[K,e.jsx("span",{className:"pg-topbar-title",children:(R=i==null?void 0:i.info)==null?void 0:R.title}),e.jsxs("span",{className:"pg-topbar-ver",children:["v",(b=i==null?void 0:i.info)==null?void 0:b.version]}),e.jsxs("span",{className:"pg-topbar-meta",children:[O," paths"]}),e.jsxs("span",{className:"pg-topbar-user",children:["as ",e.jsx("strong",{children:t}),s&&e.jsxs("span",{style:{marginLeft:8,color:"var(--accent)",opacity:.75},children:["· ",s]})]}),e.jsx("button",{className:"btn btn-xs pg-topbar-refresh",onClick:w,title:"Reload spec",children:"⟳ Reload"})]}),e.jsxs("div",{className:"pg-filter",children:[e.jsx("input",{className:"pg-filter-input",placeholder:"Filter endpoints…",value:k,onChange:m=>z(m.target.value)}),k&&e.jsx("button",{className:"btn btn-xs",onClick:()=>z(""),children:"Clear"})]}),e.jsxs("div",{className:"pg-list",children:[A.length===0&&e.jsxs("div",{style:{padding:"32px 20px",fontSize:12,color:"var(--muted2)",fontStyle:"italic"},children:["No endpoints match “",k,"”"]}),A.map(([m,B])=>{const _=!!D[m];return e.jsxs("div",{className:"pg-group",children:[e.jsxs("div",{className:"pg-group-hd",onClick:()=>T(m),children:[e.jsx("span",{className:"pg-chevron",children:_?e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted2)"}):e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted2)"})}),e.jsx("span",{className:"pg-group-name",children:m}),e.jsx("span",{className:"pg-group-count",children:B.length})]}),!_&&B.map(({method:Y,path:y,operation:C})=>e.jsx(va,{method:Y,path:y,operation:C,userId:t,projectSpaceId:s,basePath:d},`${Y}:${y}`))]},m)})]})]})}function Tt({id:t,children:s}){return e.jsx("h2",{id:t,style:{fontSize:16,fontWeight:700,color:"var(--text)",margin:"0 0 10px",paddingTop:4,borderBottom:"1px solid var(--border)",paddingBottom:8},children:s})}function Le({children:t}){return e.jsx("h3",{style:{fontSize:13,fontWeight:600,color:"var(--accent)",margin:"20px 0 6px",textTransform:"uppercase",letterSpacing:".06em"},children:t})}function Ne({children:t}){return e.jsx("p",{style:{margin:"0 0 10px",fontSize:13,lineHeight:1.65,color:"var(--text)"},children:t})}function ye({children:t}){return e.jsx("code",{style:{fontFamily:"var(--mono)",fontSize:11,background:"rgba(100,116,139,.15)",border:"1px solid rgba(100,116,139,.2)",borderRadius:3,padding:"1px 5px",color:"var(--accent)"},children:t})}function Wt({children:t}){return e.jsxs("div",{style:{background:"rgba(232,169,71,.08)",border:"1px solid rgba(232,169,71,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"#e8a947"},children:"Note: "}),t]})}function ss({children:t}){return e.jsxs("div",{style:{background:"rgba(91,156,246,.08)",border:"1px solid rgba(91,156,246,.25)",borderRadius:6,padding:"8px 12px",fontSize:12,lineHeight:1.6,color:"var(--text)",margin:"10px 0"},children:[e.jsx("strong",{style:{color:"var(--accent)"},children:"Tip: "}),t]})}function oe({name:t,type:s,children:n}){return e.jsxs("div",{style:{marginBottom:10},children:[e.jsxs("div",{style:{display:"flex",alignItems:"baseline",gap:8,marginBottom:3},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13,color:"var(--text)"},children:t}),s&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",fontFamily:"var(--mono)",textTransform:"uppercase"},children:s})]}),e.jsx("div",{style:{fontSize:12,lineHeight:1.6,color:"var(--muted)",paddingLeft:10,borderLeft:"2px solid var(--border)"},children:n})]})}function Ye({rows:t}){return e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:10},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:600,width:"30%"},children:"Value"}),e.jsx("th",{style:{textAlign:"left",padding:"4px 0",color:"var(--muted)",fontWeight:600},children:"Meaning"})]})}),e.jsx("tbody",{children:t.map(([s,n])=>e.jsxs("tr",{style:{borderBottom:"1px solid rgba(100,116,139,.08)"},children:[e.jsx("td",{style:{padding:"5px 8px 5px 0",verticalAlign:"top"},children:e.jsx(ye,{children:s})}),e.jsx("td",{style:{padding:"5px 0",verticalAlign:"top",color:"var(--text)",lineHeight:1.55},children:n})]},s))})]})}function Gt(){return e.jsx("hr",{style:{border:"none",borderTop:"1px solid var(--border)",margin:"28px 0"}})}const wa=[{id:"node-types",label:"Node Types"},{id:"lifecycles",label:"Lifecycles"},{id:"proj-spaces",label:"Project Spaces"},{id:"users-roles",label:"Users & Roles"},{id:"access-rights",label:"Access Rights"}];function ka(){const[t,s]=l.useState("node-types"),n=l.useRef(null);function a(r){s(r);const o=document.getElementById("manual-"+r);o&&n.current&&n.current.scrollTo({top:o.offsetTop-16,behavior:"smooth"})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[e.jsxs("div",{style:{width:160,flexShrink:0,borderRight:"1px solid var(--border)",padding:"16px 0",overflowY:"auto"},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".08em",padding:"0 14px 10px"},children:"Contents"}),wa.map(({id:r,label:o})=>e.jsx("div",{onClick:()=>a(r),style:{padding:"6px 14px",fontSize:12,cursor:"pointer",color:t===r?"var(--accent)":"var(--muted)",background:t===r?"rgba(91,156,246,.08)":"transparent",borderLeft:t===r?"2px solid var(--accent)":"2px solid transparent",transition:"all .15s"},children:o},r))]}),e.jsxs("div",{ref:n,style:{flex:1,overflowY:"auto",padding:"20px 28px 40px"},children:[e.jsxs("div",{id:"manual-node-types",children:[e.jsx(Tt,{id:"node-types",children:"Node Types"}),e.jsxs(Ne,{children:["A ",e.jsx("strong",{children:"Node Type"})," is the blueprint for any object you create in the product structure — a component, an assembly, a document, a requirement, etc. Every node belongs to exactly one type and inherits that type's attributes, lifecycle, versioning rules, and link constraints."]}),e.jsx(Le,{children:"Identity"}),e.jsxs(Ne,{children:["Each node can carry a human-readable ",e.jsx("em",{children:"logical identifier"})," (separate from its internal UUID). The identity settings control how that identifier is displayed and validated."]}),e.jsx(oe,{name:"Label",type:"text",children:'The display label used in the UI for the identifier field (e.g. "Part Number", "Doc ID"). Defaults to "Identifier".'}),e.jsxs(oe,{name:"Validation Pattern",type:"regex",children:["An optional regular expression that the logical ID must match. If blank, any value is accepted. Example: ",e.jsx(ye,{children:"^[A-Z]{2}-\\d{4}$"})," enforces two uppercase letters, a dash, and four digits."]}),e.jsx(Le,{children:"Lifecycle"}),e.jsx(Ne,{children:"Assign a lifecycle to the node type to enable state-based workflows (Draft → Review → Frozen → Released). Nodes without a lifecycle remain in their initial state and cannot be transitioned."}),e.jsx(oe,{name:"Lifecycle",type:"select",children:'The lifecycle that governs nodes of this type. Setting it to "None" disables lifecycle management for this node type.'}),e.jsx(Le,{children:"Versioning"}),e.jsxs(Ne,{children:["Versioning settings control how the visible version identifier (",e.jsx(ye,{children:"revision.iteration"}),", e.g. ",e.jsx(ye,{children:"A.3"}),") advances when a node is checked out or released."]}),e.jsxs(oe,{name:"Numbering Scheme",type:"select",children:["Determines the alphabet used for revision letters.",e.jsx(Ye,{rows:[["ALPHA_NUMERIC","Revisions advance A → B → … → Z → AA → AB … Standard PLM convention."]]})]}),e.jsxs(oe,{name:"Version Policy",type:"select",children:["Controls what happens to the version number when a user checks out a node.",e.jsx(Ye,{rows:[["NONE","Checkout creates a new technical version for traceability but does not advance the visible revision.iteration. Use for types where every save is tracked internally but the displayed identifier must stay stable."],["ITERATE","Checkout increments the iteration: A.1 → A.2. Use for normal work-in-progress types where each save is a new draft of the same revision."],["RELEASE","Checkout starts a new revision and resets iteration to 1: A.3 → B.1. Use for types that follow a formal release cycle where a new revision means a significant change."]]})]}),e.jsxs(oe,{name:"Collapse history on release",type:"checkbox",children:["When enabled, the intermediate working iterations are purged from history each time a node enters a ",e.jsx("strong",{children:"Released"})," state.",e.jsx("br",{}),e.jsx("br",{}),e.jsx("strong",{children:"What happens:"}),e.jsxs("ul",{style:{margin:"6px 0 0 16px",paddingLeft:0,listStyleType:"disc",fontSize:12,lineHeight:1.7},children:[e.jsxs("li",{children:["All working iterations of the previous revision are deleted (",e.jsx(ye,{children:"A.1"}),", ",e.jsx(ye,{children:"A.2"}),", ",e.jsx(ye,{children:"A.3"})," — all gone)."]}),e.jsxs("li",{children:["The new Released version has its iteration stripped and displays as the bare revision letter (e.g. ",e.jsx(ye,{children:"B.1"})," → ",e.jsx(ye,{children:"B"}),")."]}),e.jsx("li",{children:"Versions that are pinned in a baseline or referenced by a VERSION_TO_VERSION link are never deleted."})]}),e.jsx("br",{}),e.jsx("strong",{children:"Result:"})," version history reads ",e.jsx(ye,{children:"B"}),", ",e.jsx(ye,{children:"C"}),", ",e.jsx(ye,{children:"D"})," (one entry per release) instead of ",e.jsx(ye,{children:"A.1"}),", ",e.jsx(ye,{children:"A.2"}),", ",e.jsx(ye,{children:"A.3"}),", ",e.jsx(ye,{children:"B.1"}),", …",e.jsxs(Wt,{children:["Only applies to node types whose lifecycle has a Released state (",e.jsx(ye,{children:"isReleased = true"}),")."]})]}),e.jsx(Le,{children:"Attributes"}),e.jsx(Ne,{children:"Attributes are the structured data fields attached to every version of a node of this type (title, description, material, weight, etc.). Each attribute is independently configurable."}),e.jsxs(oe,{name:"Name (internal key)",type:"text",children:["The machine-readable key stored in the database. Must be unique within the node type. Cannot be changed after creation. Use camelCase or snake_case (e.g. ",e.jsx(ye,{children:"reviewNote"}),", ",e.jsx(ye,{children:"material_grade"}),")."]}),e.jsx(oe,{name:"Label (display)",type:"text",children:'The human-readable label shown in forms and tables (e.g. "Review Note", "Material Grade").'}),e.jsxs(oe,{name:"Data Type",type:"select",children:["The underlying data type for validation and storage.",e.jsx(Ye,{rows:[["STRING","Free text."],["NUMBER","Numeric value (integer or decimal)."],["DATE","ISO date value."],["BOOLEAN","True / False toggle."],["ENUM","One value from a predefined list (configure the list separately)."]]})]}),e.jsxs(oe,{name:"Widget",type:"select",children:["The UI control rendered in the editor for this attribute.",e.jsx(Ye,{rows:[["TEXT","Single-line text input."],["TEXTAREA","Multi-line text area."],["DROPDOWN","Dropdown selector (required for ENUM type)."],["DATE_PICKER","Calendar date picker (recommended for DATE type)."],["CHECKBOX","Toggle checkbox (recommended for BOOLEAN type)."]]})]}),e.jsx(oe,{name:"Section",type:"text",children:'Groups this attribute under a named panel in the editor (e.g. "Mechanical", "Review"). Attributes with no section appear in the default group.'}),e.jsx(oe,{name:"Order",type:"number",children:"Display order within the section. Lower numbers appear first."}),e.jsx(oe,{name:"Required field",type:"checkbox",children:"When checked, this attribute must be filled before a node can advance past states configured as requiring it (via Attribute State Rules). Does not block saving; only blocks lifecycle transitions where the rule is active."}),e.jsx(oe,{name:"Use as display name ★",type:"checkbox",children:"Marks this attribute as the human-readable title of the node. Its value appears in node lists, search results, and link pickers. Only one attribute per node type can be the display name."}),e.jsx(Le,{children:"Link Types (Outgoing)"}),e.jsx(Ne,{children:"A link type defines an allowed relationship from this node type to another. Links are version-aware and carry a versioning policy."}),e.jsxs(oe,{name:"Link Name",type:"text",children:["Internal name for the relationship (e.g. ",e.jsx(ye,{children:"composed_of"}),", ",e.jsx(ye,{children:"references"}),")."]}),e.jsx(oe,{name:"Target Node Type",type:"select",children:"The node type that can appear on the other end of this link."}),e.jsxs(oe,{name:"Link Policy",type:"select",children:["Controls how the link resolves over time.",e.jsx(Ye,{rows:[["VERSION_TO_MASTER","The link always points to the latest committed version of the target. When the target is updated and committed, all parents automatically see the new version. Use for live BOM structures. Requires the parent to be locked (checked out) when the target is modified."],["VERSION_TO_VERSION","The link is frozen to the exact target version at the time the link was created. The parent always sees the same snapshot of the child regardless of future changes. Use for reference documentation or frozen configurations."]]})]}),e.jsxs(oe,{name:"Min Cardinality",type:"number",children:["Minimum number of links of this type required per node version. ",e.jsx(ye,{children:"0"})," means the link is optional."]}),e.jsx(oe,{name:"Max (blank = unlimited)",type:"number",children:"Maximum number of links allowed. Leave blank for no upper limit."}),e.jsx(oe,{name:"Color",type:"color",children:"Visual color used to draw this link in the graph view."}),e.jsx(ss,{children:'After creating a link type you can add attributes to it (e.g. "quantity", "reference designator") via the Edit link type panel. You can also define cascade rules that automatically propagate lifecycle transitions through the link.'})]}),e.jsx(Gt,{}),e.jsxs("div",{id:"manual-lifecycles",children:[e.jsx(Tt,{id:"lifecycles",children:"Lifecycles"}),e.jsxs(Ne,{children:["A ",e.jsx("strong",{children:"Lifecycle"})," defines the states an object can be in and the valid transitions between them. It encodes the approval and release workflow for a node type."]}),e.jsx(Le,{children:"Lifecycle Properties"}),e.jsx(oe,{name:"Name",type:"text",children:"Name displayed in the UI and referenced by node types."}),e.jsx(oe,{name:"Description",type:"text",children:"Optional free-text explanation of the lifecycle's purpose."}),e.jsx(Le,{children:"States"}),e.jsx(Ne,{children:"States represent stages in the lifecycle (e.g. Draft, In Review, Frozen, Released). Every node version has exactly one current state."}),e.jsx(oe,{name:"State Name",type:"text",children:'Display label for the state. Short, descriptive names work best (e.g. "Draft", "Frozen").'}),e.jsx(oe,{name:"Display Order",type:"number",children:"Order in which states appear in dropdowns and diagrams. Lower = earlier in the flow."}),e.jsx(oe,{name:"Color",type:"color",children:"Color used to represent this state in the UI (state pills, timeline dots). Pick a color that intuitively maps to the state's meaning — green for released, yellow for in-review, grey for draft."}),e.jsx(oe,{name:"isInitial",type:"tag",children:"Marks this as the entry state. Every newly created node starts here. Only one state per lifecycle can be initial."}),e.jsx(oe,{name:"isFrozen",type:"tag",children:"A frozen state locks the node's content. When a node enters a frozen state, the lock cascades to all children connected via VERSION_TO_MASTER links — they cannot be independently modified until the parent is unfrozen. Required before a baseline can be taken."}),e.jsxs(oe,{name:"isReleased",type:"tag",children:["Marks the state as a release milestone. Reaching this state is what triggers the ",e.jsx("em",{children:"Collapse history"})," feature (if enabled on the node type). Typically only one state per lifecycle is released."]}),e.jsx(Le,{children:"Transitions"}),e.jsx(Ne,{children:"Transitions define which state changes are allowed and under what conditions. A transition always goes from one specific state to another."}),e.jsx(oe,{name:"Transition Name",type:"text",children:'Label shown on the action button that triggers this transition (e.g. "Freeze", "Release", "Reject"). Keep it short and verb-form.'}),e.jsx(oe,{name:"From State / To State",type:"select",children:"The source and target states for this transition. A node must be in the From State for the transition to appear."}),e.jsxs(oe,{name:"Guard Expression",type:"text",children:["An optional server-side condition that must be satisfied before the transition is allowed. If the guard fails, the transition button is blocked and an error is shown.",e.jsx(Ye,{rows:[["all_required_filled","All attributes marked Required must have a non-empty value in the current version."],["all_signatures_done","All signature requirements for this transition must have been fulfilled."],["(blank)","No guard — the transition is always allowed when the node is in the From State."]]})]}),e.jsxs(oe,{name:"Action Type",type:"select",children:["A server-side action executed as part of this transition.",e.jsx(Ye,{rows:[["NONE","No action — the transition simply changes the state."],["REQUIRE_SIGNATURE","Collects an electronic signature from the current user as part of the transition. The signature is stored permanently against the version."]]})]}),e.jsxs(oe,{name:"Version Strategy",type:"select",children:["Controls how the version number changes when this transition is triggered.",e.jsx(Ye,{rows:[["NONE","Creates a new technical version (for audit trail) but keeps the same revision.iteration visible to users. Used for state changes that are purely administrative."],["ITERATE","Increments the iteration (A.2 → A.3). Unusual for a lifecycle transition; more common for checkouts."],["REVISE","Starts a new revision and resets iteration to 1 (A.3 → B.1). Typically used on the Release transition to mark a new formal revision of the product."]]})]}),e.jsx(Le,{children:"Cascade Rules"}),e.jsx(Ne,{children:"Cascade rules automate lifecycle propagation through links. When a parent node undergoes a transition, eligible child nodes are automatically transitioned as well — without manual action."}),e.jsx(Ne,{children:"Rules are configured inside the link type: you specify which parent transition triggers which child transition, and from which child state. Children not in the expected state are silently skipped (they are already beyond or not yet at that stage)."}),e.jsx(Wt,{children:"Cascade is only applied through VERSION_TO_MASTER links. VERSION_TO_VERSION links point to frozen snapshots and are never cascaded."})]}),e.jsx(Gt,{}),e.jsxs("div",{id:"manual-proj-spaces",children:[e.jsx(Tt,{id:"proj-spaces",children:"Project Spaces"}),e.jsxs(Ne,{children:["A ",e.jsx("strong",{children:"Project Space"})," is an organisational container that groups nodes and controls access. Every node creation request must specify a project space. Access rights (which roles can do what) are configured per project space."]}),e.jsx(Ne,{children:'Think of a project space as a "workspace" or "programme" — you might have one per product line, customer project, or development phase.'}),e.jsx(oe,{name:"Name",type:"text",children:'Short, unique name for the space (e.g. "Prototype-2026", "Certification-A320"). Shown in the project space selector at the top of the application.'}),e.jsx(oe,{name:"Description",type:"text",children:"Optional free-text explaining the purpose or scope of this project space."}),e.jsx(Wt,{children:"Deleting a project space does not delete the nodes inside it — it removes only the space record. Nodes retain their project_space_id as a plain reference."})]}),e.jsx(Gt,{}),e.jsxs("div",{id:"manual-users-roles",children:[e.jsx(Tt,{id:"users-roles",children:"Users & Roles"}),e.jsx(Le,{children:"Roles"}),e.jsxs(Ne,{children:["A ",e.jsx("strong",{children:"Role"})," is a named group of permissions (e.g. DESIGNER, REVIEWER, READER). Users are assigned roles within a project space. The role determines what actions the user can perform on which node types."]}),e.jsxs(oe,{name:"Name",type:"text",children:["Internal name for the role. By convention use UPPER_CASE (e.g. ",e.jsx(ye,{children:"DESIGNER"}),"). This name is referenced in permission rules and signature requirements."]}),e.jsx(oe,{name:"Description",type:"textarea",children:'Human-readable explanation of who should hold this role (e.g. "Engineers who create and modify parts").'}),e.jsx(ss,{children:"Create roles that map to real job functions, not individual people. A user can hold multiple roles — combine them to grant additive permissions."}),e.jsx(Le,{children:"Users"}),e.jsxs(Ne,{children:["Users are the people who log in to the system. Each user is identified by a username (sent in the ",e.jsx(ye,{children:"X-PLM-User"})," HTTP header). Users are created here and then assigned roles in specific project spaces."]}),e.jsxs(oe,{name:"Username",type:"text",children:["Unique login identifier (e.g. ",e.jsx(ye,{children:"john.doe"}),"). This is the value placed in the ",e.jsx(ye,{children:"X-PLM-User"})," header. Cannot be changed after creation."]}),e.jsx(oe,{name:"Display Name",type:"text",children:'Full human-readable name shown in the UI (e.g. "John Doe").'}),e.jsx(oe,{name:"Email",type:"email",children:"Contact email address. Stored for reference; not used for authentication in the current setup."}),e.jsx(oe,{name:"Admin status",type:"select",children:e.jsx(Ye,{rows:[["User","Standard user — access governed entirely by role assignments."],["Admin","System administrator — bypasses all permission checks and can perform any action in any project space. Use sparingly."]]})}),e.jsx(Le,{children:"Role Assignments"}),e.jsxs(Ne,{children:["A role assignment connects a ",e.jsx("strong",{children:"user"}),", a ",e.jsx("strong",{children:"role"}),", and a ",e.jsx("strong",{children:"project space"}),". The user gains all permissions granted to that role within that specific project space."]}),e.jsx(Ne,{children:"A user can hold multiple role assignments — for example, DESIGNER in Project-A and READER in Project-B, or DESIGNER + REVIEWER in the same project space (permissions are additive)."})]}),e.jsx(Gt,{}),e.jsxs("div",{id:"manual-access-rights",children:[e.jsx(Tt,{id:"access-rights",children:"Access Rights"}),e.jsxs(Ne,{children:["Access Rights define what each role is allowed to do. The system uses two levels of permissions: ",e.jsx("strong",{children:"global actions"})," and ",e.jsx("strong",{children:"node-type/project-space actions"}),"."]}),e.jsx(Le,{children:"Global Permissions"}),e.jsx(Ne,{children:"Global permissions control system-wide administrative capabilities, independent of any project space or node type."}),e.jsx(Wt,{children:'"Zero grants = action open to all roles." — If no role has been granted a global permission, the action is unrestricted. As soon as any role is granted a permission, only that role (and admins) can perform it.'}),e.jsx(Ye,{rows:[["MANAGE_METAMODEL","Create and edit node types, lifecycles, attributes, link types, and cascade rules."],["MANAGE_ROLES","Create and edit roles, users, project spaces, and role assignments."],["CREATE_NODE","Create new nodes (top-level action, independently of node type)."]]}),e.jsx(Le,{children:"Node Type × Project Space Permission Matrix"}),e.jsx(Ne,{children:"The matrix table shows all combinations of node types (rows) and actions (columns) for a given project space. Toggle the circle icon in any cell to grant or revoke that permission for the current role."}),e.jsx(Ne,{children:e.jsx("strong",{children:"Action column types:"})}),e.jsx(oe,{name:"NODE scope actions",type:"column",children:"Standard CRUD and workflow actions that apply to nodes of that type (e.g. checkout, checkin, create link, delete)."}),e.jsxs(oe,{name:"LIFECYCLE scope actions",type:"column",children:['Columns labelled "',e.jsx("em",{children:"From State → Transition Name"}),'" represent individual lifecycle transitions. Granting this permission allows the role to fire that specific transition on nodes of that type within this project space.']}),e.jsx(Le,{children:"How Permissions Stack"}),e.jsx(Ne,{children:"Permissions are evaluated in this order. Each layer can only restrict, never expand, what the higher layer allowed:"}),e.jsxs("ol",{style:{margin:"0 0 12px 18px",paddingLeft:0,fontSize:13,lineHeight:2,color:"var(--text)"},children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute State Rules"})," — declares which attributes are editable, visible, or required based on the lifecycle state."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Attribute Views"})," — can further restrict (never widen) attribute visibility/editability for a specific role × state combination."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Node Type Permission ",e.jsx(ye,{children:"can_write"})]})," — if false for the role, the entire node type becomes read-only regardless of other rules."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Transition Permission"})," — filters the list of lifecycle transitions available to the role."]})]}),e.jsx(ss,{children:"Start with broad node-type permissions and use attribute views to fine-tune field-level access by role. Only add transition restrictions when you need formal approval gates."})]})]})]})}const Sa="#5b9cf6";function Us(t){return(t==null?void 0:t.color)||(t==null?void 0:t.COLOR)||Sa}const gt=110,bt=36,ns=72,Ut=28,rs=46,as=32,at=10,zt=16,Fs=8,Ft=4;function Na({lifecycleId:t,currentStateId:s,userId:n,onTransition:a,availableTransitionNames:r,transitionGuardViolations:o,previewMode:i}){const[c,u]=l.useState([]),[p,x]=l.useState([]),[g,k]=l.useState(!1),[z,D]=l.useState(null);if(l.useEffect(()=>{!t||!n||(k(!0),Promise.all([q.getLifecycleStates(n,t).catch(()=>[]),q.getLifecycleTransitions(n,t).catch(()=>[])]).then(([v,S])=>{u(Array.isArray(v)?v:[]),x(Array.isArray(S)?S:[])}).finally(()=>k(!1)))},[t,n]),g)return e.jsx("div",{className:"lc-empty",children:"Loading diagram…"});if(!t)return e.jsx("div",{className:"lc-empty",children:"No lifecycle associated with this object type."});if(!c.length)return e.jsx("div",{className:"lc-empty",children:"No lifecycle states defined."});const $=[...c].sort((v,S)=>(v.display_order??v.DISPLAY_ORDER??0)-(S.display_order??S.DISPLAY_ORDER??0)),f={};$.forEach((v,S)=>{f[v.id||v.ID]=S});const d={};$.forEach((v,S)=>{d[v.id||v.ID]=Ut+S*(gt+ns)+gt/2});const h=p.map((v,S)=>{const L=v.from_state_id||v.FROM_STATE_ID,U=v.to_state_id||v.TO_STATE_ID,F=f[L]??0,G=f[U]??0,I=G-F;return{...v,fromId:L,toId:U,fromIdx:F,toIdx:G,span:I,i:S}}).filter(v=>d[v.fromId]&&d[v.toId]&&v.span!==0),w=gt*.6,j=new Map,A=(v,S,L,U,F)=>{const G=`${v}::${S}`;j.has(G)||j.set(G,[]),j.get(G).push({tIdx:L,role:U,otherIdx:F})};for(const v of h){const S=v.span>0?"top":"bot";A(v.fromId,S,v.i,"from",v.toIdx),A(v.toId,S,v.i,"to",v.fromIdx)}const T=new Map(h.map(v=>[v.i,{x1:d[v.fromId],x2:d[v.toId]}]));for(const[v,S]of j){if(S.length<=1)continue;const L=v.indexOf("::"),U=v.slice(0,L),F=v.slice(L+2),G=f[U],I=d[U],E=W=>Math.abs(W.otherIdx-G),H=S.filter(W=>W.role==="to"),ie=S.filter(W=>W.role==="from");let re;F==="top"?(H.sort((W,J)=>E(W)-E(J)),ie.sort((W,J)=>E(J)-E(W)),re=[...H,...ie]):(ie.sort((W,J)=>E(W)-E(J)),H.sort((W,J)=>E(J)-E(W)),re=[...ie,...H]);const ue=re.length,he=I-w/2,ke=w/(ue-1);re.forEach(({tIdx:W,role:J},ae)=>{const X=he+ae*ke,se=T.get(W);J==="from"?se.x1=X:se.x2=X})}const O=h.filter(v=>v.span>0),K=h.filter(v=>v.span<0),R=O.length?Math.max(...O.map(v=>v.span)):0,b=K.length?Math.max(...K.map(v=>-v.span)):0,m=R>0?rs+(R-1)*as+zt+16:20,B=b>0?rs+(b-1)*as+zt+28:30,_=Ut+m+bt/2,Y=Ut*2+$.length*(gt+ns)-ns,y=_+bt/2+B+Ut,C=_-bt/2,P=_+bt/2,M=v=>{const{fromId:S,span:L,i:U}=v,F=v.name||v.NAME||"",G=L>0,I=Math.abs(L),E=rs+(I-1)*as,{x1:H,x2:ie}=T.get(U),re=G?C:P,ue=G?re-E:re+E,he=(H+ie)/2,ke=!i&&S===s,W=(o==null?void 0:o.get(F))??[],J=W.length>0,ae=J||ke&&r!=null&&!r.has(F),X=ae?`✕ ${F}`:F,se=X?Math.max(44,X.length*6+18)/2:0;let ce,xe;G?(ce=[`M ${H},${re}`,`V ${ue+at}`,`Q ${H},${ue} ${H+at},${ue}`,`H ${he-se-Ft}`].join(" "),xe=[`M ${he+se+Ft},${ue}`,`H ${ie-at}`,`Q ${ie},${ue} ${ie},${ue+at}`,`V ${re}`].join(" ")):(ce=[`M ${H},${re}`,`V ${ue-at}`,`Q ${H},${ue} ${H-at},${ue}`,`H ${he+se+Ft}`].join(" "),xe=[`M ${he-se-Ft},${ue}`,`H ${ie+at}`,`Q ${ie},${ue} ${ie},${ue-at}`,`V ${re}`].join(" "));const Q=ke,te=ae,me=Q&&!te,ve=me&&z===U,Te=me&&!!a&&!i,Ce=i||Q,$e=$.find(Me=>(Me.id||Me.ID)===v.toId),Re=te?"#dc2626":Us($e)||(G?"#5b9cf6":"#e8a947"),Ae=Re,Ie=Ce?.7:.3,lt=Ce?1.5:1,ct=se*2,Ue=he-se,nt=ue-zt/2;let Fe,Xe,Qe;return te?(Fe="#1c0808",Xe="#7f1d1d",Qe="var(--danger)"):me||i?ve?(Fe=Re,Xe=Re,Qe="#ffffff"):(Fe=`${Re}18`,Xe=`${Re}70`,Qe=Re):(Fe="var(--surface2)",Xe="var(--border2)",Qe="var(--muted2)"),e.jsxs("g",{children:[e.jsx("path",{d:ce,fill:"none",style:{stroke:Ce?Ae:"var(--border2)"},strokeWidth:lt,strokeDasharray:G?"none":"4,3",opacity:Ie}),e.jsx("path",{d:xe,fill:"none",style:{stroke:Ce?Ae:"var(--border2)"},strokeWidth:lt,strokeDasharray:G?"none":"4,3",opacity:Ie,markerEnd:"url(#arr)"}),X&&e.jsxs("g",{style:{cursor:Te?"pointer":"default"},onMouseEnter:me?()=>D(U):void 0,onMouseLeave:me?()=>D(null):void 0,onClick:Te?()=>a(v):void 0,children:[J&&e.jsx("title",{children:`Blocked:
• `+W.map(Me=>typeof Me=="string"?Me:Me.message||Me.guardCode).join(`
• `)}),e.jsx("rect",{x:Ue-4,y:nt-4,width:ct+8,height:zt+8,rx:Fs+4,fill:"transparent"}),e.jsx("rect",{x:Ue,y:nt,width:ct,height:zt,rx:Fs,style:{fill:Fe,stroke:Xe},strokeWidth:Q?1:.5}),e.jsx("text",{x:he,y:ue+5,textAnchor:"middle",fontSize:"9",fontFamily:"var(--sans)",fontWeight:"700",style:{fill:Qe,userSelect:"none",pointerEvents:"none"},children:X})]})]},`t-${U}`)};return e.jsx("div",{className:"lc-diagram",children:e.jsxs("svg",{width:Y,height:y,viewBox:`0 0 ${Y} ${y}`,style:{fontFamily:"var(--mono)",overflow:"visible"},children:[e.jsxs("defs",{children:[e.jsx("marker",{id:"arr",markerWidth:"7",markerHeight:"7",refX:"5",refY:"3.5",orient:"auto",children:e.jsx("path",{d:"M0,0.5 L0,6.5 L6,3.5 z",fill:"context-stroke",opacity:"0.7"})}),e.jsxs("filter",{id:"glow",children:[e.jsx("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),e.jsxs("feMerge",{children:[e.jsx("feMergeNode",{in:"blur"}),e.jsx("feMergeNode",{in:"SourceGraphic"})]})]})]}),K.map(M),O.map(M),$.map(v=>{const S=v.id||v.ID,L=v.name||v.NAME||S,U=v.is_frozen===1||v.IS_FROZEN===1,F=v.is_released===1||v.IS_RELEASED===1,I=[v.is_initial===1||v.IS_INITIAL===1?"INIT":null,U?"FROZEN":null,F?"REL":null].filter(Boolean).join(" · "),E=d[S],H=E-gt/2,ie=_-bt/2,re=i||S===s;let ue,he,ke;if(re){const W=Us(v);ue=`${W}22`,he=W,ke=W}else ue="var(--surface2)",he="var(--border2)",ke="var(--muted)";return e.jsxs("g",{filter:re?"url(#glow)":void 0,children:[e.jsx("rect",{x:H,y:ie,width:gt,height:bt,rx:6,style:{fill:ue,stroke:he},strokeWidth:re?1.5:1}),e.jsx("text",{x:E,y:_+(I?1:4),textAnchor:"middle",fontSize:"11",fontFamily:"var(--sans)",fontWeight:re?"700":"600",style:{fill:ke},children:L}),I&&e.jsx("text",{x:E,y:_+13,textAnchor:"middle",fontSize:"7",fontFamily:"var(--sans)",style:{fill:re?ke:"var(--muted2)"},opacity:"0.7",children:I})]},S)})]})})}const En=new Map;function qe(t,s,{wrapBody:n=!0}={}){En.set(t,{Component:s,wrapBody:n})}function Ca(t){return En.get(t)??null}const Ea=new Map,Rt=new Map;function Ta(t){t!=null&&t.id&&(Ea.set(t.id,t),Rt.has(t.zone)||Rt.set(t.zone,[]),Rt.get(t.zone).push(t))}function za(t){return(Rt.get("editor")??[]).find(n=>{var a;return(a=n.matches)==null?void 0:a.call(n,t)})??null}function Aa(t){var s;for(const n of Rt.get("settings")??[])if((s=n.sections)!=null&&s[t])return{Component:n.sections[t],wrapBody:!0};return null}function Ia({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[o,i]=l.useState(""),[c,u]=l.useState("actions");if(l.useEffect(()=>{Se.listActions(t).then(g=>{const k=Array.isArray(g)?g:[];if(r(k),!o){const z=[...new Set(k.map(D=>D.serviceCode).filter(Boolean))].sort();z.length>0&&i(z[0])}}).catch(()=>r([]))},[t]),a===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const p=[...new Set(a.map(g=>g.serviceCode).filter(Boolean))].sort(),x=g=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:c===g?"var(--accent)":"var(--muted)",borderBottom:c===g?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:o,onChange:g=>i(g.target.value),children:p.map(g=>e.jsx("option",{value:g,children:g},g))})]}),e.jsxs("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[e.jsx("button",{style:x("actions"),onClick:()=>u("actions"),children:"Actions"}),e.jsx("button",{style:x("algorithm-catalog"),onClick:()=>u("algorithm-catalog"),children:"Algorithm Catalog"})]}),c==="actions"&&e.jsx(Ra,{userId:t,serviceCode:o,dbActions:a.filter(g=>g.serviceCode===o),canWrite:s,toast:n}),c==="algorithm-catalog"&&e.jsx($a,{userId:t,serviceCode:o,canWrite:s,toast:n})]})}function Ra({userId:t,serviceCode:s,dbActions:n,canWrite:a,toast:r}){const[o,i]=l.useState(null),[c,u]=l.useState(null),[p,x]=l.useState(null),[g,k]=l.useState(null),[z,D]=l.useState({}),[$,f]=l.useState({}),d=o??n;function h(y,C){i(P=>(P??n).map(M=>M.id===y?{...M,description:C}:M))}l.useEffect(()=>{s&&(i(null),u(null),k(null),D({}),f({}),Promise.all([Se.getServiceCatalog(s),Se.listAllInstances(t,s)]).then(([y,C])=>{u(y),x(Array.isArray(C)?C:[])}).catch(()=>{u({handlers:[],guards:[]}),x([])}))},[t,s]);async function w(y){const C=await Se.listActionGuards(t,y).catch(()=>[]);D(P=>({...P,[y]:Array.isArray(C)?C:[]}))}async function j(y){const C=await Se.listActionWrappers(t,y).catch(()=>[]);f(P=>({...P,[y]:Array.isArray(C)?C:[]}))}function A(y){if(g===y){k(null);return}k(y),z[y]||w(y),$[y]||j(y)}async function T(y,C,P){try{await Se.attachActionGuard(t,y,C,P||"HIDE",0),w(y),r("Guard attached","success")}catch(M){r(String(M),"error")}}async function O(y,C){try{await Se.detachActionGuard(t,y,C),w(y),r("Guard detached","success")}catch(P){r(String(P),"error")}}async function K(y,C,P){try{await Se.updateActionGuard(t,y,C,P),D(M=>({...M,[y]:(M[y]||[]).map(v=>v.id===C?{...v,effect:P}:v)}))}catch(M){r(String(M),"error")}}if(c===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const R={};d.forEach(y=>{R[(y.actionCode||y.action_code||"").toUpperCase()]=y});const b=c.handlers||[],m=new Set([...b.map(y=>(y.code||"").toUpperCase()),...Object.keys(R)]),B=Array.from(m).map(y=>{const C=R[y],P=b.find(M=>(M.code||"").toUpperCase()===y);return C?{...C,_fromDb:!0,_module:C.handlerModuleName||C.handler_module_name||(P==null?void 0:P.module)||"unknown"}:{id:null,actionCode:P.code,displayName:P.label||P.code,scope:null,displayCategory:null,displayOrder:9999,description:null,_fromDb:!1,_module:P.module||"unknown"}});if(B.sort((y,C)=>y._fromDb&&C._fromDb?(y.displayOrder??0)-(C.displayOrder??0):y._fromDb?-1:C._fromDb?1:(y.actionCode||"").localeCompare(C.actionCode||"")),B.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No actions registered for ",e.jsx("strong",{children:s}),"."]});const _={};B.forEach(y=>{const C=y._module||"unknown";_[C]||(_[C]=[]),_[C].push(y)});const Y=(p||[]).filter(y=>(y.typeName||"").toLowerCase().includes("guard"));return e.jsx("div",{className:"settings-list",children:Object.entries(_).sort(([y],[C])=>y.localeCompare(C)).map(([y,C])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx(Tn,{module:y}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",C.length,")"]})]}),C.map(P=>{const M=P.id||P.actionCode,v=g===M,S=P.actionCode||P.action_code,L=P.displayName||P.display_name||S,U=P.scope,F=P.displayCategory||P.display_category,G=z[M]||[],I=$[M]||[];return e.jsxs("div",{className:"settings-card",style:{marginBottom:4,opacity:P._fromDb?1:.6},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>P._fromDb&&A(M),style:{display:"flex",alignItems:"center",cursor:P._fromDb?"pointer":"default"},children:[P._fromDb?e.jsx("span",{className:"settings-card-chevron",children:v?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"})}):e.jsx("span",{className:"settings-card-chevron",style:{width:18,color:"var(--muted2)",fontSize:9},children:"—"}),e.jsx("span",{className:"settings-card-name",children:L}),!P._fromDb&&e.jsx("span",{style:{fontSize:9,color:"var(--muted2)",marginLeft:6,fontStyle:"italic"},children:"not seeded"}),e.jsx("span",{style:{flex:1}}),U&&e.jsx("span",{className:"settings-badge",children:U}),F&&e.jsx("span",{className:"settings-badge",style:{marginLeft:4},children:F})]}),v&&P._fromDb&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:e.jsxs("span",{children:["Code: ",e.jsx("code",{children:S})]})}),e.jsx(Pa,{description:P.description,actionId:M,userId:t,canWrite:a,onSaved:E=>h(M,E)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Guards"}),G.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No guards attached"}),G.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%",marginBottom:8},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Guard"}),e.jsx("th",{children:"Effect"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:G.map(E=>e.jsxs("tr",{children:[e.jsxs("td",{children:[E.algorithmName||E.algorithm_name,(E.algorithmCode||E.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",E.algorithmCode||E.algorithm_code,")"]})]}),e.jsx("td",{children:a?e.jsxs("select",{className:"field-input",style:{fontSize:11,padding:"1px 4px"},value:E.effect,onChange:H=>K(M,E.id,H.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}):e.jsx("span",{className:`settings-badge${E.effect==="BLOCK"?" badge-warn":""}`,children:E.effect})}),e.jsx("td",{style:{textAlign:"right"},children:a&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>O(M,E.id),children:e.jsx(wt,{size:10})})})]},E.id))})]}),a&&Y.length>0&&e.jsx(La,{instances:Y,onAttach:(E,H)=>T(M,E,H)}),e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4,marginTop:12},children:"Wrappers"}),I.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No wrappers"}),I.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Order"}),e.jsx("th",{children:"Wrapper"}),e.jsx("th",{children:"Instance"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:I.map(E=>e.jsxs("tr",{children:[e.jsx("td",{style:{width:50},children:E.executionOrder||E.execution_order}),e.jsxs("td",{children:[E.algorithmName||E.algorithm_name,(E.algorithmCode||E.algorithm_code)&&e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",marginLeft:6},children:["(",E.algorithmCode||E.algorithm_code,")"]})]}),e.jsx("td",{style:{fontSize:11,color:"var(--muted)"},children:E.instanceName||E.instance_name}),e.jsx("td",{style:{textAlign:"right"},children:a&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:async()=>{try{await Se.detachActionWrapper(t,M,E.id),j(M),r("Wrapper detached","success")}catch(H){r(String(H),"error")}},children:e.jsx(wt,{size:10})})})]},E.id))})]})]})]},M)})]},y))})}const Hs=[{key:"handler",label:"Action Handler",filter:t=>t.toLowerCase().includes("handler")},{key:"guard",label:"Guard",filter:t=>t.toLowerCase().includes("guard")},{key:"wrapper",label:"Wrapper",filter:t=>t.toLowerCase().includes("wrapper")}];function $a({userId:t,serviceCode:s}){const[n,a]=l.useState(null),[r,o]=l.useState("handler");l.useEffect(()=>{s&&(a(null),Se.listAllInstances(t,s).then(p=>a(Array.isArray(p)?p:[])).catch(()=>a([])))},[t,s]);const i=p=>({padding:"4px 12px",fontSize:11,cursor:"pointer",background:"none",border:"none",color:r===p?"var(--accent)":"var(--muted)",borderBottom:r===p?"2px solid var(--accent)":"2px solid transparent"});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const c=Hs.find(p=>p.key===r),u=(n||[]).filter(p=>c==null?void 0:c.filter(p.typeName||p.type_name||""));return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:Hs.map(p=>e.jsx("button",{style:i(p.key),onClick:()=>o(p.key),children:p.label},p.key))}),u.length===0?e.jsxs("div",{style:{padding:"16px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No ",c==null?void 0:c.label.toLowerCase()," instances for ",e.jsx("strong",{children:s}),"."]}):e.jsx("div",{className:"settings-list",children:u.map(p=>{const x=r==="guard"?e.jsx(ht,{size:12,color:"var(--accent)",strokeWidth:1.8}):r==="wrapper"?e.jsx(ys,{size:12,color:"var(--muted2)",strokeWidth:1.8}):e.jsx(vs,{size:12,color:"var(--muted)",strokeWidth:1.8});return e.jsxs("div",{className:"settings-card",style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px"},children:[x,e.jsx("span",{className:"settings-card-name",style:{flex:1,fontSize:12},children:p.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:p.algorithmCode||p.algorithm_code})]},p.id)})})]})}function Pa({description:t,actionId:s,userId:n,canWrite:a,onSaved:r}){const[o,i]=l.useState(!1),[c,u]=l.useState(t||""),p=l.useCallback(async()=>{await Se.updateAction(n,s,{description:c}),r(c),i(!1)},[n,s,c,r]);return e.jsxs("div",{style:{marginBottom:10},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,marginBottom:4},children:"Description"}),o?e.jsxs("div",{style:{display:"flex",gap:6},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11},value:c,onChange:x=>u(x.target.value)}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:p,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{u(t||""),i(!1)},children:"✕"})]}):e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{style:{fontSize:11,color:t?"var(--text)":"var(--muted)",fontStyle:t?"normal":"italic"},children:t||"No description"}),a&&e.jsx("button",{className:"btn btn-xs",onClick:()=>i(!0),children:"Edit"})]})]})}function La({instances:t,onAttach:s}){const[n,a]=l.useState(""),[r,o]=l.useState("HIDE");return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:4},children:[e.jsxs("select",{className:"field-input",style:{fontSize:11,flex:1},value:n,onChange:i=>a(i.target.value),children:[e.jsx("option",{value:"",children:"— attach guard —"}),t.map(i=>e.jsxs("option",{value:i.id,children:[i.algorithmName||i.algorithm_name," — ",i.name||i.id]},i.id))]}),e.jsxs("select",{className:"field-input",style:{fontSize:11,width:90,padding:"3px 4px"},value:r,onChange:i=>o(i.target.value),children:[e.jsx("option",{value:"HIDE",children:"HIDE"}),e.jsx("option",{value:"BLOCK",children:"BLOCK"})]}),e.jsxs("button",{className:"btn btn-xs btn-primary",disabled:!n,onClick:()=>{n&&(s(n,r),a(""))},children:[e.jsx(We,{size:10})," Attach"]})]})}function Da({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[o,i]=l.useState(null),[c,u]=l.useState(""),[p,x]=l.useState("catalog"),[g,k]=l.useState(null),[z,D]=l.useState(null),[$,f]=l.useState(24),d=l.useCallback(()=>{r(null),i(null),Promise.all([Se.listAlgorithms(t),Se.listAllInstances(t)]).then(([T,O])=>{const K=Array.isArray(T)?T:[],R=Array.isArray(O)?O:[];if(r(K),i(R),!c){const b=[...new Set(K.map(m=>m.serviceCode).filter(Boolean))].sort();b.length>0&&u(b[0])}}).catch(()=>{r([]),i([])})},[t]);l.useEffect(()=>{d()},[d]),l.useEffect(()=>{k(null),D(null)},[c]);const h=l.useCallback(()=>{Se.getAlgorithmStats(t,c).then(T=>k(Array.isArray(T)?T:[])).catch(()=>k([]))},[t,c]),w=l.useCallback(T=>{Se.getAlgorithmTimeseries(t,T,c).then(O=>D(Array.isArray(O)?O:[])).catch(()=>D([]))},[t,c]);if(a===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const j=[...new Set(a.map(T=>T.serviceCode).filter(Boolean))].sort(),A=T=>({padding:"6px 14px",fontSize:12,cursor:"pointer",background:"none",border:"none",color:p===T?"var(--accent)":"var(--muted)",borderBottom:p===T?"2px solid var(--accent)":"2px solid transparent"});return e.jsxs("div",{children:[!s&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_PLATFORM"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:"Service"}),e.jsx("select",{className:"field-input",style:{width:120,fontSize:12,padding:"3px 6px"},value:c,onChange:T=>u(T.target.value),children:j.map(T=>e.jsx("option",{value:T,children:T},T))})]}),e.jsx("div",{style:{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:12},children:[["catalog","Catalog"],["stats","Execution Stats"],["graph","Usage Graph"]].map(([T,O])=>e.jsx("button",{style:A(T),onClick:()=>{x(T),T==="stats"&&!g&&h(),T==="graph"&&!z&&w($)},children:O},T))}),c&&p==="catalog"&&e.jsx(Ba,{userId:t,serviceCode:c,algorithms:a.filter(T=>T.serviceCode===c),instances:o?o.filter(T=>T.serviceCode===c):[],canWrite:s,toast:n,onReload:d}),p==="stats"&&c&&e.jsx(Oa,{userId:t,serviceCode:c,canWrite:s,toast:n,stats:g,onLoad:h,onReset:async()=>{await Se.resetAlgorithmStats(t,c).catch(()=>{}),k([]),n("Stats reset","success")}}),p==="graph"&&c&&e.jsx(_a,{timeseries:z,tsHours:$,onLoad:T=>{f(T),w(T)}})]})}function Ba({userId:t,serviceCode:s,algorithms:n,instances:a,canWrite:r,toast:o,onReload:i}){const[c,u]=l.useState(null),[p,x]=l.useState(""),[g,k]=l.useState({});l.useEffect(()=>{u(null),x(""),k({})},[s]);async function z(f){const d=p.trim();if(!d){o("Instance name is required","error");return}try{await Se.createInstance(t,f,d,s),x(""),i(),o("Instance created","success")}catch(h){o(String(h),"error")}}if(n.length===0)return e.jsxs("div",{style:{padding:"24px 0",textAlign:"center",color:"var(--muted)",fontSize:12},children:["No algorithms registered for ",e.jsx("strong",{children:s}),"."]});const D={};n.forEach(f=>{const d=f.typeName||f.type_name||"Unknown",h=f.moduleName||f.module_name||"unknown";D[d]||(D[d]={}),D[d][h]||(D[d][h]=[]),D[d][h].push(f)});const $={};return(a||[]).forEach(f=>{const d=f.algorithmId||f.algorithm_id;$[d]||($[d]=[]),$[d].push(f)}),e.jsx("div",{className:"settings-list",children:Object.entries(D).sort(([f],[d])=>f.localeCompare(d)).map(([f,d])=>e.jsxs("div",{style:{marginBottom:22},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"},children:[e.jsx("span",{style:{fontSize:12,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:".04em"},children:f}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:".06em"},children:"type"})]}),Object.entries(d).sort(([h],[w])=>h.localeCompare(w)).map(([h,w])=>e.jsxs("div",{style:{marginBottom:14,marginLeft:4},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:6},children:[e.jsx(Tn,{module:h}),e.jsxs("span",{style:{fontSize:9,color:"var(--muted2)"},children:["(",w.length,")"]})]}),w.map(j=>{const A=j.id,T=c===A,O=$[A]||[],K=j.code,R=j.name||K;return e.jsxs("div",{className:"settings-card",style:{marginBottom:4},children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>{const b=T?null:A;u(b),x(""),b&&!g[b]&&Se.listAlgorithmParameters(t,b).then(m=>k(B=>({...B,[b]:Array.isArray(m)?m:[]}))).catch(()=>k(m=>({...m,[b]:[]})))},style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:T?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(gn,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:R}),e.jsx("span",{className:"settings-card-id",children:K}),e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:j.description||""}),e.jsxs("span",{className:"settings-badge",style:{marginLeft:8},children:[O.length," instance",O.length!==1?"s":""]})]}),T&&e.jsxs("div",{className:"settings-card-body",style:{padding:"8px 12px 12px 28px"},children:[e.jsxs("div",{style:{display:"flex",gap:16,fontSize:11,color:"var(--muted)",marginBottom:10},children:[e.jsxs("span",{children:["Handler: ",e.jsx("code",{style:{color:"var(--text)"},children:j.handlerRef||j.handler_ref||"—"})]}),e.jsxs("span",{children:["Type: ",e.jsx("code",{style:{color:"var(--text)"},children:f})]})]}),(()=>{const b=g[A];return!b||b.length===0?null:e.jsxs("div",{style:{marginBottom:12},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Parameter Schema"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsx("tr",{style:{borderBottom:"1px solid var(--border)"},children:["Name","Label","Type","Req.","Default"].map(m=>e.jsx("th",{style:{textAlign:m==="Req."?"center":"left",padding:"3px 6px",color:"var(--muted)",fontWeight:600,fontSize:10},children:m},m))})}),e.jsx("tbody",{children:b.map(m=>{const B=m.paramName||m.param_name,_=m.paramLabel||m.param_label||B,Y=m.dataType||m.data_type||"STRING",y=m.required===1||m.required===!0,C=m.defaultValue||m.default_value||"";return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--accent)"},children:B}),e.jsx("td",{style:{padding:"3px 6px"},children:_}),e.jsx("td",{style:{padding:"3px 6px",fontFamily:"var(--mono)",color:"var(--muted)",fontSize:10},children:Y}),e.jsx("td",{style:{padding:"3px 6px",textAlign:"center"},children:y?"✓":""}),e.jsx("td",{style:{padding:"3px 6px",color:C?"var(--text)":"var(--muted)",fontFamily:"var(--mono)",fontSize:10},children:C||"—"})]},m.id||B)})})]})]})})(),e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6},children:"Instances"}),O.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"No instances"}),O.map(b=>e.jsx(Ma,{inst:b,algo:j,userId:t,canWrite:r,toast:o,onReload:i},b.id)),r&&e.jsxs("div",{style:{display:"flex",gap:6,marginTop:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{flex:1,fontSize:11,padding:"3px 6px"},placeholder:"New instance name…",value:p,onChange:b=>x(b.target.value),onKeyDown:b=>{b.key==="Enter"&&z(A)}}),e.jsxs("button",{className:"btn btn-sm",style:{fontSize:10},disabled:!p.trim(),onClick:()=>z(A),children:[e.jsx(We,{size:10,strokeWidth:2.5})," Create"]})]})]})]},A)})]},h))]},f))})}function Ma({inst:t,algo:s,userId:n,canWrite:a,toast:r,onReload:o}){var w;const[i,c]=l.useState(!1),[u,p]=l.useState(null),[x,g]=l.useState(!1),[k,z]=l.useState(t.name||"");async function D(){if(u===null)try{const j=await Se.getInstanceParams(n,t.id);p(Array.isArray(j)?j:[])}catch{p([])}}function $(){i||D(),c(j=>!j)}async function f(){if(!k.trim()||k.trim()===t.name){g(!1);return}try{await Se.updateInstance(n,t.id,k.trim()),r("Instance renamed","success"),o()}catch(j){r(String(j),"error")}g(!1)}async function d(){try{await Se.deleteInstance(n,t.id),r("Instance deleted","success"),o()}catch(j){r(String(j),"error")}}async function h(j,A){try{await Se.setInstanceParam(n,t.id,j,A);const T=await Se.getInstanceParams(n,t.id);p(Array.isArray(T)?T:[])}catch(T){r(String(T),"error")}}return e.jsxs("div",{className:"settings-card",style:{marginBottom:2},children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",cursor:"pointer"},onClick:$,children:[e.jsx("span",{className:"settings-card-chevron",children:i?e.jsx(Ke,{size:11,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ge,{size:11,strokeWidth:2,color:"var(--muted)"})}),x?e.jsx("input",{className:"field-input",style:{fontSize:12,padding:"1px 4px",flex:1},autoFocus:!0,value:k,onChange:j=>z(j.target.value),onBlur:f,onKeyDown:j=>{j.key==="Enter"&&f(),j.key==="Escape"&&(g(!1),z(t.name))},onClick:j=>j.stopPropagation()}):e.jsx("span",{className:"settings-card-name",style:{fontSize:12,flex:1},children:t.name}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)",fontFamily:"var(--mono)"},children:(w=t.id)==null?void 0:w.slice(-8)}),a&&e.jsxs("span",{style:{display:"flex",gap:4,marginLeft:8},onClick:j=>j.stopPropagation(),children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>{g(!0),z(t.name)},children:e.jsx(xt,{size:10})}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:d,children:e.jsx(wt,{size:10})})]})]}),i&&e.jsxs("div",{className:"settings-card-body",style:{padding:"6px 12px 8px 26px"},children:[u===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading params…"}),u!==null&&u.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No parameters"}),u!==null&&u.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Parameter"}),e.jsx("th",{children:"Value"})]})}),e.jsx("tbody",{children:u.map(j=>e.jsxs("tr",{children:[e.jsxs("td",{style:{fontSize:11},children:[j.paramLabel||j.param_label||j.paramName||j.param_name,(j.dataType||j.data_type)&&e.jsx("span",{style:{color:"var(--muted2)",fontSize:9,marginLeft:4},children:j.dataType||j.data_type})]}),e.jsx("td",{children:a?e.jsx(Wa,{param:j,onSave:A=>h(j.algorithmParameterId||j.algorithm_parameter_id||j.id,A)}):e.jsx("span",{style:{fontSize:11,fontFamily:"var(--mono)"},children:j.value||e.jsx("em",{style:{color:"var(--muted)"},children:"—"})})})]},j.id))})]})]})]})}function Oa({stats:t,onLoad:s,onReset:n}){return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:s,children:"Refresh"}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:n,children:"Reset"})]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading stats…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No algorithm executions recorded yet"}),t&&t.length>0&&e.jsxs("table",{className:"settings-table",style:{width:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Algorithm"}),e.jsx("th",{style:{textAlign:"right"},children:"Calls"}),e.jsx("th",{style:{textAlign:"right"},children:"Min (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Avg (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Max (ms)"}),e.jsx("th",{style:{textAlign:"right"},children:"Total (ms)"}),e.jsx("th",{children:"Last Update"})]})}),e.jsx("tbody",{children:t.map(a=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:a.algorithmCode})}),e.jsx("td",{style:{textAlign:"right"},children:a.callCount}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.minMs=="number"?a.minMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.avgMs=="number"?a.avgMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.maxMs=="number"?a.maxMs.toFixed(3):"—"}),e.jsx("td",{style:{textAlign:"right"},children:typeof a.totalMs=="number"?a.totalMs.toFixed(1):"—"}),e.jsx("td",{style:{fontSize:10,color:"var(--muted)"},children:a.lastFlushed||"—"})]},a.algorithmCode))})]})]})}function _a({timeseries:t,tsHours:s,onLoad:n}){const o={t:20,r:20,b:40,l:50},i=800-o.l-o.r,c=200-o.t-o.b;function u(g,k,z){if(g.length===0)return e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No data"});const D=Math.max(...g.map($=>$.calls),1);return e.jsxs("svg",{viewBox:"0 0 800 200",style:{width:"100%",height:200,display:"block"},children:[[0,.25,.5,.75,1].map($=>{const f=o.t+c*(1-$);return e.jsxs("g",{children:[e.jsx("line",{x1:o.l,x2:800-o.r,y1:f,y2:f,stroke:"var(--border)",strokeWidth:.5}),e.jsx("text",{x:o.l-4,y:f+3,textAnchor:"end",fill:"var(--muted)",fontSize:9,children:Math.round(D*$)})]},$)}),g.map(($,f)=>{const d=Math.max(i/g.length-1,2),h=o.l+f/g.length*i,w=$.calls/D*c,j=o.t+c-w,A=g.length<20||f%Math.ceil(g.length/12)===0,T=$.windowStart.replace("T"," ").slice(11,16);return e.jsxs("g",{children:[e.jsx("rect",{x:h,y:j,width:d,height:w,fill:z,opacity:.8,rx:1,children:e.jsxs("title",{children:[$.windowStart.replace("T"," ").slice(0,16)," — ",$.calls," calls, ",$.totalMs.toFixed(1),"ms"]})}),A&&e.jsx("text",{x:h+d/2,y:200-o.b+14,textAnchor:"middle",fill:"var(--muted)",fontSize:8,transform:`rotate(-45, ${h+d/2}, ${200-o.b+14})`,children:T})]},f)}),e.jsx("text",{x:12,y:o.t+c/2,textAnchor:"middle",fill:"var(--muted)",fontSize:9,transform:`rotate(-90, 12, ${o.t+c/2})`,children:"Calls"}),e.jsx("text",{x:o.l,y:12,fill:"var(--text)",fontSize:11,fontWeight:600,children:k})]})}const p={};(t||[]).forEach(g=>{p[g.windowStart]||(p[g.windowStart]={calls:0,totalMs:0}),p[g.windowStart].calls+=g.callCount||0,p[g.windowStart].totalMs+=g.totalMs||0});const x=Object.keys(p).sort().map(g=>({windowStart:g,...p[g]}));return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:12,alignItems:"center"},children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>n(s),children:"Refresh"}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)"},children:"Window:"}),[6,12,24,48].map(g=>e.jsxs("button",{className:"btn btn-xs",onClick:()=>n(g),style:{background:s===g?"var(--accent)":void 0,color:s===g?"#fff":void 0},children:[g,"h"]},g))]}),t===null&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Loading…"}),t&&t.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"No windowed data yet. Stats are bucketed every 15 seconds on flush."}),t&&t.length>0&&e.jsx("div",{style:{background:"var(--bg2)",borderRadius:6,padding:12},children:u(x,"All Algorithms (aggregate)","#3b82f6")})]})}function Wa({param:t,onSave:s}){const[n,a]=l.useState(t.value||""),[r,o]=l.useState(!1);function i(c){a(c),o(c!==(t.value||""))}return e.jsxs("div",{style:{display:"flex",gap:4,alignItems:"center"},children:[e.jsx("input",{className:"field-input",style:{fontSize:11,padding:"1px 4px",flex:1},value:n,onChange:c=>i(c.target.value),onBlur:()=>{r&&(s(n),o(!1))}}),r&&e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>{s(n),o(!1)},children:"Save"})]})}function Ga(t){if(!t)return{fg:"var(--muted2)",bg:"rgba(120,130,150,.14)"};let s=0;for(let a=0;a<t.length;a++)s=s*31+t.charCodeAt(a)&16777215;const n=s%360;return{fg:`hsl(${n},70%,72%)`,bg:`hsl(${n},55%,22%)`}}function Tn({module:t}){if(!t)return null;const s=Ga(t);return e.jsx("span",{title:`Spring Modulith module: ${t}`,style:{display:"inline-block",padding:"1px 7px",borderRadius:10,fontSize:9,fontWeight:700,letterSpacing:".06em",fontFamily:"var(--mono)",textTransform:"uppercase",background:s.bg,color:s.fg,border:`1px solid ${s.fg}33`,verticalAlign:"middle"},children:t})}function Ua({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[o,i]=l.useState(!1),[c,u]=l.useState({displayName:"",email:""}),[p,x]=l.useState(!1);l.useEffect(()=>{q.getUser(t,t).then(r).catch(()=>{})},[t]);function g(){u({displayName:(a==null?void 0:a.displayName)||"",email:(a==null?void 0:a.email)||""}),i(!0)}async function k(){x(!0);try{await q.updateUser(t,t,c.displayName.trim(),c.email.trim());const z=await q.getUser(t,t);r(z),i(!1),n("Profile updated","success")}catch{n("Failed to update profile","error")}finally{x(!1)}}return a?e.jsxs("div",{className:"settings-list",children:[e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx(Jt,{size:15,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{fontSize:13},children:a.username}),a.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--accent",children:"Admin"})]}),o?e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(Oe,{label:"Display Name",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.displayName,onChange:z=>u(D=>({...D,displayName:z.target.value}))})}),e.jsx(Oe,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:c.email,onChange:z=>u(D=>({...D,email:z.target.value}))})}),e.jsxs("div",{style:{display:"flex",gap:8,marginTop:4},children:[e.jsx("button",{className:"btn btn-primary",onClick:k,disabled:p,children:p?"Saving…":"Save"}),e.jsx("button",{className:"btn",onClick:()=>i(!1),children:"Cancel"})]})]}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,paddingLeft:23},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Display Name"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:a.displayName||"—"})]}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2},children:"Email"}),e.jsx("div",{style:{fontSize:12,color:"var(--text)"},children:a.email||"—"})]}),s&&e.jsx("div",{style:{marginTop:4},children:e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:g,children:[e.jsx(xt,{size:11,strokeWidth:2}),"Edit"]})})]})]}),e.jsx(Ha,{})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}const Fa=[{value:"dark",label:"Dark",icon:"●"},{value:"light",label:"Light",icon:"○"},{value:"system",label:"System",icon:"◐"}];function Ha(){const[t,s]=l.useState(Yt);function n(a){s(a),ws(a)}return e.jsxs("div",{className:"settings-card",style:{padding:"14px 14px"},children:[e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:10},children:"Theme"}),e.jsx("div",{className:"theme-selector",children:Fa.map(a=>e.jsxs("button",{type:"button",className:`theme-option${t===a.value?" theme-option--active":""}`,onClick:()=>n(a.value),children:[e.jsx("span",{className:"theme-option-icon",children:a.icon}),e.jsx("span",{children:a.label})]},a.value))})]})}function Qt({title:t,onClose:s,onSave:n,saving:a,saveLabel:r="Save",children:o,width:i=480}){return e.jsx("div",{className:"diff-overlay",style:{zIndex:600},onClick:c=>{c.target===c.currentTarget&&s()},children:e.jsxs("div",{className:"diff-modal",style:{width:i,maxHeight:"85vh",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{className:"diff-header",children:[e.jsx("span",{className:"diff-title",children:t}),e.jsx("button",{className:"diff-close",onClick:s,children:"×"})]}),e.jsx("div",{style:{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12},children:o}),e.jsxs("div",{style:{padding:"12px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0},children:[e.jsx("button",{className:"btn",onClick:s,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:n,disabled:a,children:a?"Saving…":r})]})]})})}function Oe({label:t,children:s}){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[e.jsx("label",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"},children:t}),s]})}function Va({userId:t,roleId:s,canWrite:n,toast:a,nodePerms:r,lcPerms:o,nodeTypes:i,transitions:c}){const[u,p]=l.useState(null);l.useEffect(()=>{p(null),q.getRolePolicies(t,s).then(f=>{const d=new Set;(Array.isArray(f)?f:[]).forEach(h=>{const w=h.permissionCode||h.permission_code,j=h.nodeTypeId||h.node_type_id||"",A=h.transitionId||h.transition_id||"";d.add(`${w}|${j}|${A}`)}),p(d)}).catch(()=>p(new Set))},[t,s]);const x=(f,d,h)=>`${f}|${d||""}|${h||""}`;async function g(f,d,h){if(!n||!u)return;const w=x(f,d,h),j=u.has(w);p(A=>{const T=new Set(A);return j?T.delete(w):T.add(w),T});try{j?await q.removePermissionGrant(t,d,f,s,h||null):await q.addPermissionGrant(t,d,f,s,h||null)}catch(A){p(T=>{const O=new Set(T);return j?O.add(w):O.delete(w),O}),a(A,"error")}}if(!u)return e.jsx("div",{style:{padding:"4px 0",color:"var(--muted)",fontSize:11},children:"Loading policies…"});if(i.length===0)return e.jsx("div",{className:"settings-empty-row",children:"No node types defined."});const k={padding:"4px 8px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)",background:"var(--bg2, var(--bg))",whiteSpace:"nowrap",verticalAlign:"bottom"},z={padding:"3px 6px",textAlign:"center",borderBottom:"1px solid var(--border)",borderRight:"1px solid var(--border)"};function D({permCode:f,ntId:d,transId:h}){const w=u.has(x(f,d,h));return e.jsx("td",{style:z,children:e.jsx("button",{className:"panel-icon-btn",disabled:!n,title:n?w?"Revoke":"Grant":"Requires MANAGE_ROLES",onClick:()=>g(f,d,h),style:{margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",width:22,height:22,cursor:n?"pointer":"default"},children:w?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})})})}function $({ntId:f,ntName:d}){return e.jsxs("td",{style:{...z,textAlign:"left",position:"sticky",left:0,background:"var(--bg)",zIndex:1,minWidth:120},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"var(--text)"},children:d}),e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--muted)"},children:f})]})}return e.jsxs("div",{children:[r.length>0&&e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Node Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...k,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),r.map(f=>e.jsxs("th",{style:{...k,minWidth:72},children:[e.jsx("div",{style:{fontSize:9,fontFamily:"monospace",color:"var(--accent)",marginBottom:1},children:f.permissionCode}),e.jsx("div",{style:{fontSize:9,color:"var(--muted)",fontWeight:400},children:f.displayName})]},f.permissionCode))]})}),e.jsx("tbody",{children:i.map(f=>{const d=f.id||f.ID,h=f.name||f.NAME||d;return e.jsxs("tr",{children:[e.jsx($,{ntId:d,ntName:h}),r.map(w=>e.jsx(D,{permCode:w.permissionCode,ntId:d,transId:null},w.permissionCode))]},d)})})]})})]}),o.length>0&&c.length>0&&e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:10,fontWeight:600,color:"var(--accent)",textTransform:"uppercase",letterSpacing:1,marginBottom:4},children:"Lifecycle Scope Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role + node type + transition check."}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{style:{borderCollapse:"collapse",width:"max-content",minWidth:"100%"},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{...k,textAlign:"left",minWidth:120,position:"sticky",left:0,zIndex:1},children:"Node Type"}),c.map(f=>e.jsx("th",{style:{...k,minWidth:100},children:e.jsx("div",{style:{fontSize:9,color:"var(--text)",fontWeight:500},children:f.label})},f.id))]})}),e.jsx("tbody",{children:i.filter(f=>f.lifecycle_id||f.lifecycleId).map(f=>{const d=f.id||f.ID,h=f.name||f.NAME||d,w=f.lifecycle_id||f.lifecycleId;return e.jsxs("tr",{children:[e.jsx($,{ntId:d,ntName:h}),c.map(j=>j.lifecycleId!==w?e.jsx("td",{style:z,children:e.jsx("span",{style:{color:"var(--border)",fontSize:11},children:"—"})},j.id):e.jsx(D,{permCode:o[0].permissionCode,ntId:d,transId:j.id},j.id))]},d)})})]})})]}),r.length===0&&o.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No permissions configured."})]})}function Ka({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState([]),[o,i]=l.useState(!0),[c,u]=l.useState(!1),[p,x]=l.useState({name:"",description:""}),[g,k]=l.useState(!1),[z,D]=l.useState(null),[$,f]=l.useState({}),[d,h]=l.useState({}),[w,j]=l.useState(!1);function A(){return q.listProjectSpaces(t).then(b=>r(Array.isArray(b)?b:[]))}l.useEffect(()=>{A().finally(()=>i(!1))},[t]),l.useEffect(()=>{mt.getRegistryTags().then(f).catch(()=>{})},[]);async function T(){if(p.name.trim()){k(!0);try{await q.createProjectSpace(t,p.name.trim(),p.description.trim()||null),await A(),u(!1),x({name:"",description:""})}catch(b){n(b,"error")}finally{k(!1)}}}async function O(b){if(z===b){D(null);return}D(b);try{const m=await q.getProjectSpaceServiceTags(t,b);h(m||{})}catch{h({})}}async function K(b){const m=b.id||b.ID,B=b.isolated===!0;try{await q.setProjectSpaceIsolated(t,m,!B),await A(),n(B?"Isolation disabled":"Isolation enabled")}catch(_){n(_,"error")}}async function R(b,m,B){j(!0);try{await q.setProjectSpaceServiceTags(t,b,m,B);const _=await q.getProjectSpaceServiceTags(t,b);h(_||{}),n("Tags updated")}catch(_){n(_,"error")}finally{j(!1)}}return o?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-list",children:[c&&e.jsxs(Qt,{title:"New Project Space",onClose:()=>{u(!1),x({name:"",description:""})},onSave:T,saving:g,saveLabel:"Create",children:[e.jsx(Oe,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:p.name,onChange:b=>x(m=>({...m,name:b.target.value})),placeholder:"e.g. Prototype-2026"})}),e.jsx(Oe,{label:"Description",children:e.jsx("input",{className:"field-input",value:p.description,onChange:b=>x(m=>({...m,description:b.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{x({name:"",description:""}),u(!0)},children:[e.jsx(We,{size:11,strokeWidth:2.5}),"New space"]})}),a.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No project spaces yet."}),a.map(b=>{const m=b.id||b.ID,B=b.name||b.NAME||m,_=b.description||b.DESCRIPTION||"",Y=b.active!==!1&&b.ACTIVE!==!1,y=b.isolated===!0,C=b.parentId||b.PARENT_ID||null,P=z===m;return e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer"},onClick:()=>O(m),children:[P?e.jsx(Ke,{size:12}):e.jsx(Ge,{size:12}),e.jsx(Lt,{size:13,color:Y?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:B}),e.jsx("span",{className:"settings-card-id",children:m}),C&&e.jsx("span",{className:"settings-badge",title:`Child of ${C}`,children:"child"}),y&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Isolated"}),!Y&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"})]}),_&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:19},children:_}),P&&e.jsxs("div",{style:{marginTop:10,paddingLeft:19,borderTop:"1px solid var(--border)",paddingTop:10},children:[s&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10},children:[e.jsxs("label",{style:{fontSize:11,display:"flex",alignItems:"center",gap:6,cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:y,onChange:()=>K(b)}),e.jsx("span",{children:"Isolated"})]}),e.jsx("span",{className:"muted",style:{fontSize:10},children:"Exclusive tag ownership, no untagged routing"})]}),e.jsx("div",{style:{fontSize:11,fontWeight:600,marginBottom:6},children:"Service Tags"}),Object.keys($).length===0?e.jsx("div",{className:"muted",style:{fontSize:11},children:"No services registered with tags."}):e.jsxs("table",{className:"status-table",style:{fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service"}),e.jsx("th",{children:"Available Tags"}),e.jsx("th",{children:"Assigned"}),s&&e.jsx("th",{})]})}),e.jsx("tbody",{children:Object.entries($).map(([M,v])=>{const S=d[M]||[];return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:M})}),e.jsx("td",{children:v.length===0?e.jsx("span",{className:"muted",children:"none"}):v.map(L=>e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",margin:"1px 2px",borderRadius:3,fontSize:10,background:S.includes(L)?"var(--accent-bg)":"var(--bg2)",color:S.includes(L)?"var(--accent)":"var(--muted)",border:`1px solid ${S.includes(L)?"var(--accent)":"var(--border)"}`,cursor:s?"pointer":"default"},onClick:s?()=>{const U=S.includes(L)?S.filter(F=>F!==L):[...S,L];R(m,M,U)}:void 0,title:s?S.includes(L)?"Click to remove":"Click to assign":"",children:L},L))}),e.jsx("td",{children:S.length===0?e.jsx("span",{className:"muted",children:"—"}):S.join(", ")}),s&&e.jsx("td",{children:S.length>0&&e.jsx("button",{className:"btn btn-sm btn-ghost",style:{fontSize:10,padding:"1px 6px"},onClick:()=>R(m,M,[]),disabled:w,children:"clear"})})]},M)})})]})]})]},m)})]})}function qa({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[o,i]=l.useState(null),[c,u]=l.useState({}),[p,x]=l.useState(!1),[g,k]=l.useState(null),z=l.useCallback(()=>q.getRoles(t).then(f=>r(Array.isArray(f)?f:[])),[t]);l.useEffect(()=>{z()},[z]);async function D(){var f,d,h;if((f=c.name)!=null&&f.trim()){x(!0);try{o==="create"?await q.createRole(t,c.name.trim(),((d=c.description)==null?void 0:d.trim())||null):await q.updateRole(t,o.role.id,c.name.trim(),((h=c.description)==null?void 0:h.trim())||null),await z(),i(null)}catch(w){n(w,"error")}finally{x(!1)}}}async function $(f){if(window.confirm(`Delete role "${f.name}"?
All user assignments for this role will also be removed.`)){k(f.id);try{await q.deleteRole(t,f.id),await z()}catch(d){n(d,"error")}finally{k(null)}}}return a?e.jsxs("div",{className:"settings-list",children:[o&&e.jsxs(Qt,{title:o==="create"?"New Role":`Edit — ${o.role.name}`,onClose:()=>i(null),onSave:D,saving:p,saveLabel:o==="create"?"Create":"Save",children:[e.jsx(Oe,{label:"Name *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:c.name||"",onChange:f=>u(d=>({...d,name:f.target.value})),placeholder:"e.g. APPROVER"})}),e.jsx(Oe,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,style:{resize:"vertical"},value:c.description||"",onChange:f=>u(d=>({...d,description:f.target.value})),placeholder:"Optional description"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{u({name:"",description:""}),i("create")},children:[e.jsx(We,{size:11,strokeWidth:2.5})," New role"]})}),a.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No roles yet."}),a.map(f=>e.jsxs("div",{className:"settings-card",style:{padding:"10px 14px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx(ht,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,fontSize:13,flex:1},children:f.name}),e.jsx("span",{className:"settings-card-id",children:f.id}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Edit role",onClick:()=>{u({name:f.name,description:f.description||""}),i({role:f})},children:e.jsx(xt,{size:11,strokeWidth:2,color:"var(--accent)"})}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Delete role",disabled:g===f.id,onClick:()=>$(f),children:e.jsx(wt,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),f.description&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginTop:4,paddingLeft:21},children:f.description})]},f.id))]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function Xa({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[o,i]=l.useState([]),[c,u]=l.useState([]),[p,x]=l.useState(null),[g,k]=l.useState({}),[z,D]=l.useState(!1),[$,f]=l.useState({username:"",displayName:"",email:""}),[d,h]=l.useState(!1),[w,j]=l.useState({}),[A,T]=l.useState(null),[O,K]=l.useState(null),[R,b]=l.useState(null),m=l.useCallback(()=>q.listUsers(t).then(v=>r(Array.isArray(v)?v:[])),[t]),B=l.useCallback(async v=>{const S=await q.getUserRoles(t,v).catch(()=>[]);k(L=>({...L,[v]:Array.isArray(S)?S:[]}))},[t]);l.useEffect(()=>{m(),q.getRoles(t).then(v=>i(Array.isArray(v)?v:[])),q.listProjectSpaces(t).then(v=>u(Array.isArray(v)?v:[]))},[t]);async function _(v){const S=v.id;if(p===S){x(null);return}x(S),await B(S),j(L=>{var U,F,G;return{...L,[S]:L[S]||{roleId:((U=o[0])==null?void 0:U.id)||"",spaceId:((F=c[0])==null?void 0:F.id)||((G=c[0])==null?void 0:G.ID)||""}}})}async function Y(){if($.username.trim()){h(!0);try{await q.createUser(t,$.username.trim(),$.displayName.trim()||null,$.email.trim()||null),await m(),D(!1),f({username:"",displayName:"",email:""})}catch(v){n(v,"error")}finally{h(!1)}}}async function y(v){if(window.confirm(`Deactivate user "${v.username}"?`))try{await q.deactivateUser(t,v.id),await m()}catch(S){n(S,"error")}}async function C(v){const{roleId:S,spaceId:L}=w[v]||{};if(!(!S||!L)){T(v);try{await q.assignRole(t,v,S,L),await B(v)}catch(U){n(U,"error")}finally{T(null)}}}async function P(v,S,L){const U=`${v}:${S}:${L}`;K(U);try{await q.removeRole(t,v,S,L),await B(v)}catch(F){n(F,"error")}finally{K(null)}}async function M(v,S){b(v.id);try{await q.setUserAdmin(t,v.id,S),await m()}catch(L){n(L,"error")}finally{b(null)}}return a?e.jsxs("div",{className:"settings-list",children:[z&&e.jsxs(Qt,{title:"New User",onClose:()=>{D(!1),f({username:"",displayName:"",email:""})},onSave:Y,saving:d,saveLabel:"Create",children:[e.jsx(Oe,{label:"Username *",children:e.jsx("input",{className:"field-input",autoFocus:!0,value:$.username,onChange:v=>f(S=>({...S,username:v.target.value})),placeholder:"e.g. john.doe"})}),e.jsx(Oe,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:$.displayName,onChange:v=>f(S=>({...S,displayName:v.target.value})),placeholder:"e.g. John Doe"})}),e.jsx(Oe,{label:"Email",children:e.jsx("input",{className:"field-input",type:"email",value:$.email,onChange:v=>f(S=>({...S,email:v.target.value})),placeholder:"e.g. john@company.com"})})]}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end",marginBottom:8},children:s&&e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:5},onClick:()=>{f({username:"",displayName:"",email:""}),D(!0)},children:[e.jsx(We,{size:11,strokeWidth:2.5})," New user"]})}),a.length===0&&e.jsx("div",{className:"settings-empty-row",children:"No users found."}),a.map(v=>{var G,I;const S=v.id,L=p===S,U=g[S]||[],F=v.active!==!1;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center"},onClick:()=>_(v),children:[e.jsx("span",{className:"settings-card-chevron",children:L?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(Jt,{size:13,color:F?"var(--accent)":"var(--muted)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:v.username}),v.displayName&&e.jsx("span",{style:{fontSize:11,color:"var(--muted)",marginLeft:6},children:v.displayName}),e.jsx("span",{className:"settings-card-id",children:S}),v.email&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:v.email}),!F&&e.jsx("span",{className:"settings-badge settings-badge--warn",children:"Inactive"}),v.isAdmin&&e.jsx("span",{className:"settings-badge settings-badge--warn",title:"Administrator",children:"Admin"}),s&&e.jsxs("select",{className:"field-input",style:{height:22,fontSize:10,padding:"0 4px",width:"auto",marginLeft:6,flexShrink:0},value:v.isAdmin?"admin":"user",disabled:R===S,onClick:E=>E.stopPropagation(),onChange:E=>{E.stopPropagation(),M(v,E.target.value==="admin")},title:"Admin status",children:[e.jsx("option",{value:"user",children:"User"}),e.jsx("option",{value:"admin",children:"Admin"})]}),s&&e.jsx("button",{className:"panel-icon-btn",title:"Deactivate user",style:{marginLeft:4},onClick:E=>{E.stopPropagation(),y(v)},children:e.jsx(wt,{size:11,strokeWidth:2,color:"var(--danger, #f87171)"})})]}),L&&e.jsxs("div",{className:"settings-card-body",style:{paddingTop:10},children:[e.jsx("span",{className:"settings-sub-label",style:{display:"block",margin:"0 0 8px"},children:"Role Assignments"}),U.length===0&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:"No role assignments yet."}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:4,marginBottom:10},children:U.map(E=>{const H=`${S}:${E.id}:${E.projectSpaceId}`;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,padding:"3px 0"},children:[e.jsx(ht,{size:11,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontWeight:600,minWidth:80},children:E.name}),e.jsx("span",{style:{color:"var(--muted)",fontSize:11},children:"in"}),e.jsx(Lt,{size:10,color:"var(--muted)",strokeWidth:1.5}),e.jsx("span",{style:{color:"var(--fg)",fontSize:11},children:E.projectSpaceName}),e.jsx("button",{className:"panel-icon-btn",title:"Remove assignment",disabled:O===H,onClick:()=>P(S,E.id,E.projectSpaceId),children:e.jsx(jt,{size:10,strokeWidth:2.5,color:"var(--danger, #f87171)"})})]},H)})}),s&&o.length>0&&c.length>0&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,paddingTop:6,borderTop:"1px solid var(--border)"},children:[e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((G=w[S])==null?void 0:G.roleId)||"",onChange:E=>j(H=>({...H,[S]:{...H[S]||{},roleId:E.target.value}})),children:o.map(E=>e.jsx("option",{value:E.id,children:E.name},E.id))}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",flexShrink:0},children:"in"}),e.jsx("select",{className:"field-input",style:{height:24,fontSize:11,padding:"0 6px",flex:1},value:((I=w[S])==null?void 0:I.spaceId)||"",onChange:E=>j(H=>({...H,[S]:{...H[S]||{},spaceId:E.target.value}})),children:c.map(E=>e.jsx("option",{value:E.id||E.ID,children:E.name||E.NAME},E.id||E.ID))}),e.jsxs("button",{className:"btn btn-sm",style:{display:"flex",alignItems:"center",gap:4,flexShrink:0},disabled:A===S,onClick:()=>C(S),children:[e.jsx(We,{size:10,strokeWidth:2.5})," Assign"]})]})]})]},S)})]}):e.jsx("div",{className:"settings-loading",children:"Loading…"})}function Ya({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState("roles");return e.jsxs("div",{children:[e.jsx("div",{style:{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid var(--border)"},children:[["roles","Roles"],["users","Users"]].map(([o,i])=>e.jsx("button",{onClick:()=>r(o),style:{background:"none",border:"none",cursor:"pointer",padding:"6px 16px",fontSize:12,fontWeight:600,color:a===o?"var(--accent)":"var(--muted)",borderBottom:a===o?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,letterSpacing:".02em"},children:i},o))}),a==="roles"?e.jsx(qa,{userId:t,canWrite:s,toast:n}):e.jsx(Xa,{userId:t,canWrite:s,toast:n})]})}function Ja({permissions:t,userId:s,canWrite:n,toast:a,onReload:r}){const[o,i]=l.useState(!1),[c,u]=l.useState(null),[p,x]=l.useState(!1),[g,k]=l.useState({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0});function z(){k({code:"",scope:"GLOBAL",displayName:"",description:"",displayOrder:0}),u("create")}function D(w){k({code:w.permissionCode,scope:w.scope,displayName:w.displayName,description:w.description||"",displayOrder:0}),u(w.permissionCode)}async function $(){x(!0);try{if(c==="create"){if(!g.code.trim()||!g.displayName.trim()){a("Code and label required","error"),x(!1);return}await q.createPermission(s,g.code.trim().toUpperCase(),g.scope,g.displayName.trim(),g.description.trim()||null,g.displayOrder),a("Permission created")}else await q.updatePermission(s,c,g.displayName.trim(),g.description.trim()||null,g.displayOrder),a("Permission updated");u(null),r()}catch(w){a(w,"error")}x(!1)}const f=["GLOBAL","NODE","LIFECYCLE"],d={};t.forEach(w=>{w.scope&&(d[w.scope]||(d[w.scope]=[]),d[w.scope].push(w))});const h=[...f.filter(w=>d[w]),...Object.keys(d).filter(w=>!f.includes(w)).sort()];return e.jsxs("div",{style:{marginBottom:16},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:4},onClick:()=>i(!o),children:[o?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"}),e.jsx(ht,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{style:{fontSize:13,fontWeight:700},children:"Permission Catalog"}),e.jsxs("span",{style:{fontSize:11,color:"var(--muted)"},children:["(",t.length,")"]}),n&&o&&e.jsxs("button",{className:"btn btn-sm",style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:4},onClick:w=>{w.stopPropagation(),z()},children:[e.jsx(We,{size:11})," Add"]})]}),o&&e.jsx("div",{style:{border:"1px solid var(--border)",borderRadius:6,overflow:"hidden",marginBottom:8},children:h.map(w=>{const j=d[w]||[];return j.length===0?null:e.jsxs("div",{children:[e.jsxs("div",{style:{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:"var(--muted)",padding:"6px 10px",background:"var(--subtle-bg)",borderBottom:"1px solid var(--border)"},children:[w," scope"]}),j.map(A=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"5px 10px",borderBottom:"1px solid var(--border)",fontSize:12},children:[e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:180,fontWeight:500},children:A.permissionCode}),e.jsx("span",{style:{flex:1,color:"var(--text)"},children:A.displayName}),A.description&&e.jsx("span",{style:{fontSize:10,color:"var(--muted)",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:A.description}),n&&e.jsx("button",{className:"panel-icon-btn",title:"Edit",onClick:()=>D(A),style:{flexShrink:0,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(xt,{size:12})})]},A.permissionCode))]},w)})}),c&&e.jsxs(Qt,{title:c==="create"?"New Permission":`Edit ${c}`,onClose:()=>u(null),onSave:$,saving:p,saveLabel:c==="create"?"Create":"Save",children:[c==="create"&&e.jsxs(e.Fragment,{children:[e.jsx(Oe,{label:"Permission Code",children:e.jsx("input",{className:"field-input",value:g.code,onChange:w=>k(j=>({...j,code:w.target.value})),placeholder:"e.g. MANAGE_EXPORTS",style:{textTransform:"uppercase",fontFamily:"monospace"}})}),e.jsx(Oe,{label:"Scope",children:e.jsx("select",{className:"field-input",value:g.scope,onChange:w=>k(j=>({...j,scope:w.target.value})),children:[...f,...Object.keys(d).filter(w=>!f.includes(w)).sort()].filter((w,j,A)=>A.indexOf(w)===j).map(w=>e.jsx("option",{value:w,children:w},w))})})]}),e.jsx(Oe,{label:"Display Name",children:e.jsx("input",{className:"field-input",value:g.displayName,onChange:w=>k(j=>({...j,displayName:w.target.value})),placeholder:"e.g. Manage Exports"})}),e.jsx(Oe,{label:"Description",children:e.jsx("textarea",{className:"field-input",rows:2,value:g.description,onChange:w=>k(j=>({...j,description:w.target.value})),placeholder:"Optional description"})})]})]})}function Za({scopeDef:t,allPermissions:s,roleId:n,projectSpaceId:a,userId:r,canWrite:o,toast:i}){const[c,u]=l.useState(null);l.useEffect(()=>{q.getGrantsForRoleAndScope(r,n,t.code).then(f=>{const d=(t.keys||[]).find(j=>{var A;return((A=j.values)==null?void 0:A.length)>0}),h=d==null?void 0:d.name,w=new Set((Array.isArray(f)?f:[]).map(j=>{var A;return`${j.permission_code}|${(A=j.keys)==null?void 0:A[h]}`}));u(w)}).catch(()=>u(new Set))},[n,t.code,r]);const p=(t.keys||[]).find(f=>{var d;return((d=f.values)==null?void 0:d.length)>0});if(!p)return null;const{name:x,values:g}=p,k=(s||[]).filter(f=>f.scope===t.code);if(k.length===0||g.length===0)return null;async function z(f,d){if(!o)return;const h=`${f}|${d}`,w=c==null?void 0:c.has(h);u(j=>{const A=new Set(j);return w?A.delete(h):A.add(h),A});try{const j={permissionCode:f,scopeCode:t.code,roleId:n,projectSpaceId:a,keys:{[x]:d}};w?await q.removeScopedGrant(r,j):await q.addScopedGrant(r,j)}catch(j){u(A=>{const T=new Set(A);return w?T.add(h):T.delete(h),T}),i(j,"error")}}const D=e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}),$=e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})});return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[t.code," Permissions"]}),t.description&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:t.description}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:11},children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{textAlign:"left",padding:"4px 8px 4px 0",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)"},children:e.jsx("code",{children:x})}),k.map(f=>e.jsx("th",{style:{textAlign:"center",padding:"4px 8px",color:"var(--muted)",fontWeight:500,borderBottom:"1px solid var(--border)",minWidth:80},children:e.jsx("code",{style:{color:"var(--accent)",fontSize:10},children:f.permissionCode})},f.permissionCode))]})}),e.jsx("tbody",{children:g.map(f=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 8px 4px 0"},children:e.jsx("code",{style:{color:"var(--text)"},children:f.label})}),k.map(d=>{const h=c===null,w=!h&&c.has(`${d.permissionCode}|${f.id}`);return e.jsx("td",{style:{textAlign:"center",padding:"4px 8px"},children:e.jsx("button",{className:"panel-icon-btn",disabled:h||!o,title:o?w?"Revoke from this role":"Grant to this role":"Requires MANAGE_ROLES",onClick:()=>z(d.permissionCode,f.id),style:{width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:h?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):w?D:$})},d.permissionCode)})]},f.id))})]})]})}function Qa({userId:t,projectSpaceId:s,canWrite:n,toast:a}){const[r,o]=l.useState(null),[i,c]=l.useState([]),[u,p]=l.useState([]),[x,g]=l.useState([]),[k,z]=l.useState(null),[D,$]=l.useState({}),[f,d]=l.useState({}),[h,w]=l.useState(null);l.useEffect(()=>{Promise.all([q.getRoles(t),q.listPermissions(t),q.getNodeTypes(t),q.getLifecycles(t)]).then(async([y,C,P,M])=>{o(Array.isArray(y)?y:[]);const v=(Array.isArray(C)?C:[]).map(U=>({...U,permissionCode:U.permissionCode||U.permission_code,displayName:U.displayName||U.display_name,displayOrder:U.displayOrder??U.display_order}));c(v),p(Array.isArray(P)?P:[]);const S=Array.isArray(M)?M:[],L=[];await Promise.all(S.map(async U=>{const F=U.id||U.ID,G=await q.getLifecycleTransitions(t,F).catch(()=>[]);(Array.isArray(G)?G:[]).forEach(I=>{const E=I.from_state_name||I.fromStateName||"",H=I.name||I.NAME||I.id;L.push({id:I.id||I.ID,label:E?`${E} → ${H}`:H,lifecycleId:F})})})),g(L)}).catch(()=>{o([])}),q.getAccessRightsTree(t,s).then(w).catch(()=>w({scopes:[]}))},[t,s]);async function j(){const y=await q.listPermissions(t).catch(()=>[]),C=(Array.isArray(y)?y:[]).map(P=>({...P,permissionCode:P.permissionCode||P.permission_code,displayName:P.displayName||P.display_name,displayOrder:P.displayOrder??P.display_order}));c(C)}const A=i.filter(y=>y.scope==="GLOBAL"),T=i.filter(y=>y.scope==="NODE"),O=i.filter(y=>y.scope==="LIFECYCLE"),K=Object.fromEntries(((h==null?void 0:h.scopes)||[]).filter(y=>{var C;return(C=y.keys)==null?void 0:C.some(P=>{var M;return((M=P.values)==null?void 0:M.length)>0})}).map(y=>[y.code,y])),R=new Set(["GLOBAL","NODE","LIFECYCLE",...Object.keys(K)]),b=[...new Set(i.map(y=>y.scope).filter(y=>y&&!R.has(y)))],m=y=>i.filter(C=>C.scope===y);async function B(y){if(k===y){z(null);return}if(z(y),D[y]===void 0){const P=await q.getRoleGlobalPermissions(t,y).catch(()=>[]),M=new Set((Array.isArray(P)?P:[]).map(v=>v.permissionCode||v.permission_code));$(v=>({...v,[y]:M}))}const C=b.filter(P=>!K[P]);if(C.length>0&&!f[y]){const P=await Promise.all(C.map(async M=>{const v=await q.getRoleScopePermissions(t,y,M).catch(()=>[]),S=new Set((Array.isArray(v)?v:[]).map(L=>L.permissionCode||L.permission_code));return[M,S]}));d(M=>({...M,[y]:Object.fromEntries(P)}))}}async function _(y,C){if(!n)return;const P=(D[y]||new Set).has(C);$(M=>{const v=new Set(M[y]||[]);return P?v.delete(C):v.add(C),{...M,[y]:v}});try{P?await q.removeRoleGlobalPermission(t,y,C):await q.addRoleGlobalPermission(t,y,C)}catch(M){$(v=>{const S=new Set(v[y]||[]);return P?S.add(C):S.delete(C),{...v,[y]:S}}),a(M,"error")}}async function Y(y,C,P){if(!n)return;const M=f[y]&&f[y][C]||new Set,v=M.has(P),S=new Set(M);v?S.delete(P):S.add(P),d(L=>({...L,[y]:{...L[y]||{},[C]:S}}));try{v?await q.removeRoleScopePermission(t,y,C,P):await q.addRoleScopePermission(t,y,C,P)}catch(L){d(U=>({...U,[y]:{...U[y]||{},[C]:M}})),a(L,"error")}}return r===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):r.length===0?e.jsx("div",{className:"settings-empty-row",children:"No roles defined. Create roles first in Users & Roles."}):e.jsxs("div",{className:"settings-list",children:[!n&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Read-only — requires ",e.jsx("code",{children:"MANAGE_ROLES"})]}),e.jsx(Ja,{permissions:i,userId:t,canWrite:n,toast:a,onReload:j}),e.jsx("div",{className:"settings-sub-label",style:{marginBottom:6},children:"Role Grants"}),r.map(y=>{const C=k===y.id,P=D[y.id];return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",onClick:()=>B(y.id),style:{display:"flex",alignItems:"center",cursor:"pointer"},children:[e.jsx("span",{className:"settings-card-chevron",children:C?e.jsx(Ke,{size:13,strokeWidth:2,color:"var(--muted)"}):e.jsx(Ge,{size:13,strokeWidth:2,color:"var(--muted)"})}),e.jsx(ht,{size:13,color:"var(--accent)",strokeWidth:1.5}),e.jsx("span",{className:"settings-card-name",style:{marginLeft:4},children:y.name}),e.jsx("span",{className:"settings-card-id",children:y.id}),y.description&&e.jsx("span",{style:{flex:1,fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginLeft:8},children:y.description})]}),C&&e.jsxs("div",{className:"settings-card-body",children:[A.length>0&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsx("div",{className:"settings-sub-label",children:"Global Permissions"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:"Role-only check — no node type context."}),A.map(M=>{const v=P===void 0,S=!v&&P.has(M.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:v||!n,title:n?S?`Revoke from ${y.name}`:`Grant to ${y.name}`:"Requires MANAGE_ROLES",onClick:()=>_(y.id,M.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:v?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):S?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:M.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:M.displayName})]},M.permissionCode)})]}),b.map(M=>{const v=m(M);if(v.length===0)return null;const S=f[y.id]&&f[y.id][M];return e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{className:"settings-sub-label",children:[M," Permissions"]}),e.jsxs("div",{style:{fontSize:10,color:"var(--muted)",marginBottom:6},children:["Role-only check — scope ",M," has no key context."]}),v.map(L=>{const U=S===void 0,F=!U&&S.has(L.permissionCode);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--border)"},children:[e.jsx("button",{className:"panel-icon-btn",disabled:U||!n,title:n?F?`Revoke from ${y.name}`:`Grant to ${y.name}`:"Requires MANAGE_ROLES",onClick:()=>Y(y.id,M,L.permissionCode),style:{flexShrink:0,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"},children:U?e.jsx("span",{style:{color:"var(--muted)",fontSize:10},children:"…"}):F?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--success)",strokeWidth:"2.5",children:[e.jsx("circle",{cx:"12",cy:"12",r:"9"}),e.jsx("path",{d:"M9 12l2 2 4-4"})]}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"var(--border)",strokeWidth:"2",children:e.jsx("circle",{cx:"12",cy:"12",r:"9"})})}),e.jsx("code",{style:{fontSize:11,color:"var(--accent)",minWidth:168},children:L.permissionCode}),e.jsx("span",{style:{fontSize:11,color:"var(--text)",flex:1},children:L.displayName})]},L.permissionCode)})]},M)}),Object.values(K).map(M=>m(M.code).length>0?e.jsx(Za,{scopeDef:M,allPermissions:i,roleId:y.id,projectSpaceId:s,userId:t,canWrite:n,toast:a},M.code):null),(T.length>0||O.length>0)&&e.jsx(Va,{userId:t,roleId:y.id,canWrite:n,toast:a,nodePerms:T,lcPerms:O,nodeTypes:u,transitions:x})]})]},y.id)})]})}function eo({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState([]),[o,i]=l.useState(null),[c,u]=l.useState(!1),[p,x]=l.useState(""),[g,k]=l.useState(!1),z=["pno","platform","spe"];async function D(){try{const[h,w]=await Promise.all([mt.getEnvironment(),mt.getStatus()]);r(h.expectedServices||[]),i(w)}catch(h){n((h==null?void 0:h.message)||String(h),"error")}}l.useEffect(()=>{D()},[]);const $={};((o==null?void 0:o.services)||[]).forEach(h=>{$[h.serviceCode]=h});async function f(){const h=p.trim();if(h){k(!0);try{await mt.addExpectedService(h),x(""),u(!1),n("Service added","success"),D()}catch(w){n((w==null?void 0:w.message)||String(w),"error")}finally{k(!1)}}}async function d(h){if(window.confirm(`Remove expected service '${h}'?`)){k(!0);try{const w=await mt.removeExpectedService(h);w!=null&&w.baseline?n("Cannot remove baseline service","error"):n("Service removed","success"),D()}catch(w){n((w==null?void 0:w.message)||String(w),"error")}finally{k(!1)}}}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Expected Services"}),e.jsx("span",{style:{fontSize:12,color:"var(--muted2)"},children:"Services the platform expects to be running"}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!c&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>u(!0),children:[e.jsx(We,{size:11,strokeWidth:2}),"Add service"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only access"}),c&&e.jsx("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx("input",{className:"field-input",placeholder:"Service code (e.g. my-service)",value:p,onChange:h=>x(h.target.value),onKeyDown:h=>h.key==="Enter"&&f(),style:{flex:1,maxWidth:300},autoFocus:!0}),e.jsx("button",{className:"btn btn-primary btn-xs",onClick:f,disabled:g,children:"Add"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>{u(!1),x("")},children:"Cancel"})]})}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service Code"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Instances"}),e.jsx("th",{children:"Version"}),e.jsx("th",{style:{width:80}})]})}),e.jsxs("tbody",{children:[a.map(h=>{const w=$[h],j=z.includes(h),A=(w==null?void 0:w.status)||"missing",T={up:"#4dd4a0",degraded:"#f0b429",down:"#fc8181",missing:"#6b8099"},O=T[A]||T.missing;return e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("code",{style:{fontSize:12},children:h}),j&&e.jsx("span",{className:"settings-badge",style:{marginLeft:8,fontSize:10},children:"baseline"})]}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot",style:{marginRight:6,background:O,boxShadow:`0 0 6px ${O}`}}),A]}),e.jsx("td",{children:w?`${w.healthyInstances??0}/${w.instanceCount??0}`:"–"}),e.jsx("td",{style:{fontFamily:"var(--mono)",fontSize:11},children:(w==null?void 0:w.version)||"–"}),e.jsx("td",{children:s&&!j&&e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>d(h),disabled:g,children:"Remove"})})]},h)}),a.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:5,style:{textAlign:"center",color:"var(--muted)",padding:24},children:"No expected services configured (dynamic discovery mode)"})})]})]})]})}function to({userId:t,canWrite:s,toast:n}){const[a,r]=l.useState(null),[o,i]=l.useState({}),[c,u]=l.useState({}),[p,x]=l.useState(null),[g,k]=l.useState(!1);async function z(){try{const j=await q.listSecrets(t);r(Array.isArray(j)?j.map(A=>A.key).sort():[])}catch(j){n((j==null?void 0:j.message)||String(j),"error"),r([])}}l.useEffect(()=>{z()},[t]);async function D(j){if(o[j]!==void 0){i(A=>{const T={...A};return delete T[j],T});return}i(A=>({...A,[j]:null}));try{const A=await q.revealSecret(t,j);i(T=>({...T,[j]:(A==null?void 0:A.value)??""}))}catch(A){n((A==null?void 0:A.message)||String(A),"error"),i(T=>{const O={...T};return delete O[j],O})}}function $(j){u(A=>({...A,[j]:o[j]??""}))}function f(j){u(A=>{const T={...A};return delete T[j],T})}async function d(j){k(!0);try{await q.updateSecret(t,j,c[j]),n(`Updated '${j}'`,"success"),f(j),o[j]!==void 0&&i(A=>({...A,[j]:c[j]}))}catch(A){n((A==null?void 0:A.message)||String(A),"error")}finally{k(!1)}}async function h(j){if(window.confirm(`Delete secret '${j}'? This cannot be undone.`)){k(!0);try{await q.deleteSecret(t,j),n(`Deleted '${j}'`,"success"),i(A=>{const T={...A};return delete T[j],T}),z()}catch(A){n((A==null?void 0:A.message)||String(A),"error")}finally{k(!1)}}}async function w(){var j;if(!((j=p==null?void 0:p.key)!=null&&j.trim())){n("Key required","error");return}k(!0);try{await q.createSecret(t,p.key.trim(),p.value??""),n(`Created '${p.key}'`,"success"),x(null),z()}catch(A){const T=((A==null?void 0:A.message)||String(A)).includes("409")?"Key already exists":(A==null?void 0:A.message)||String(A);n(T,"error")}finally{k(!1)}}return a===null?e.jsx("div",{className:"settings-loading",children:"Loading…"}):e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:16},children:[e.jsx("h2",{style:{margin:0},children:"Secrets"}),e.jsxs("span",{style:{fontSize:12,color:"var(--muted2)"},children:["Vault path: ",e.jsx("code",{children:"secret/plm"})]}),e.jsx("div",{style:{marginLeft:"auto"},children:s&&!p&&e.jsxs("button",{className:"btn btn-xs btn-primary",style:{display:"inline-flex",alignItems:"center",gap:5},onClick:()=>x({key:"",value:""}),children:[e.jsx(We,{size:11,strokeWidth:2}),"Add secret"]})})]}),!s&&e.jsx("div",{className:"settings-banner",style:{marginBottom:12},children:"Read-only — MANAGE_SECRETS not granted to your role."}),p&&e.jsxs("div",{style:{border:"1px solid var(--border)",padding:12,borderRadius:6,marginBottom:12,background:"var(--bg-alt, rgba(255,255,255,0.02))"},children:[e.jsxs("div",{style:{display:"flex",gap:8,marginBottom:8},children:[e.jsx("input",{className:"field-input",placeholder:"key (e.g. plm.s3.access-key)",value:p.key,onChange:j=>x(A=>({...A,key:j.target.value})),style:{flex:1}}),e.jsx("input",{className:"field-input",placeholder:"value",value:p.value,onChange:j=>x(A=>({...A,value:j.target.value})),style:{flex:2}})]}),e.jsxs("div",{style:{display:"flex",gap:6,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>x(null),disabled:g,children:"Cancel"}),e.jsx("button",{className:"btn btn-xs btn-primary",onClick:w,disabled:g,children:"Create"})]})]}),e.jsxs("table",{className:"settings-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{style:{width:"40%"},children:"Key"}),e.jsx("th",{children:"Value"}),e.jsx("th",{style:{width:220,textAlign:"right"},children:"Actions"})]})}),e.jsxs("tbody",{children:[a.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:3,style:{color:"var(--muted2)"},children:"No secrets yet."})}),a.map(j=>{const A=o[j],T=c[j]!==void 0,O=A!==void 0;return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:j})}),e.jsx("td",{children:T?e.jsx("input",{className:"field-input",value:c[j],onChange:K=>u(R=>({...R,[j]:K.target.value})),style:{width:"100%"},autoFocus:!0}):O?A===null?e.jsx("span",{style:{color:"var(--muted2)"},children:"loading…"}):e.jsx("code",{children:A}):e.jsx("span",{style:{letterSpacing:2,color:"var(--muted2)"},children:"••••••••"})}),e.jsx("td",{style:{textAlign:"right"},children:e.jsx("div",{style:{display:"inline-flex",gap:6,justifyContent:"flex-end"},children:T?e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs btn-primary",onClick:()=>d(j),disabled:g,children:"Save"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>f(j),disabled:g,children:"Cancel"})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"btn btn-xs",onClick:()=>D(j),title:O?"Hide value":"Reveal value",children:O?"Hide":"Reveal"}),s&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"btn btn-xs",style:{display:"inline-flex",alignItems:"center",gap:4},onClick:()=>$(j),disabled:!O,title:O?"Edit value":"Reveal first to edit",children:[e.jsx(xt,{size:10,strokeWidth:2}),"Edit"]}),e.jsx("button",{className:"btn btn-xs btn-danger",onClick:()=>h(j),disabled:g,title:"Delete secret",children:e.jsx(wt,{size:10,strokeWidth:2})})]})]})})})]},j)})]})]})]})}function so({userId:t,toast:s}){const[n,a]=l.useState(null),[r,o]=l.useState(null),[i,c]=l.useState(null),[u,p]=l.useState(null),[x,g]=l.useState(null);async function k(){try{const[h,w,j,A]=await Promise.all([q.getRegistryGrouped(t).catch(()=>({})),q.getRegistryTagsAdmin(t).catch(()=>null),q.getRegistryOverview(t).catch(()=>null),q.getUiManifest().catch(()=>null)]);a(h),o(w),c(j),g(A),p(null)}catch(h){p(h.message||String(h))}}if(l.useEffect(()=>{k();const h=setInterval(k,5e3);return()=>clearInterval(h)},[]),u)return e.jsxs("div",{className:"settings-empty-row",children:["Failed to load registry: ",u]});if(n===null)return e.jsx("div",{className:"settings-loading",children:"Loading…"});const z=Object.keys(n).sort(),D=h=>{if(!h)return null;const w=Date.now()-new Date(h).getTime();return Math.max(0,Math.round(w/1e3))},$=h=>h==null?"—":h<60?`${h}s`:h<3600?`${Math.round(h/60)}m`:`${Math.round(h/3600)}h`,f=(i==null?void 0:i.services)||{},d=(i==null?void 0:i.settingsRegistrations)||[];return e.jsxs("div",{className:"settings-list",children:[e.jsx("div",{className:"settings-sub-label",children:"Platform Federation"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Per-service summary as seen by platform-api (",(i==null?void 0:i.self)||"platform","). Settings tabs registered, live item contributions probed via ","/internal/items/visible",". Refreshes every 5s."]}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instances"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Settings tabs"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Items"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Creatable"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Listable"})]})}),e.jsxs("tbody",{children:[Object.keys(f).sort().map(h=>{const w=f[h]||{};return e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:h}),e.jsx("td",{style:{padding:"4px 6px"},children:w.instances??0}),e.jsx("td",{style:{padding:"4px 6px"},children:w.settingsSections??0}),e.jsx("td",{style:{padding:"4px 6px"},children:w.itemDescriptors??0}),e.jsx("td",{style:{padding:"4px 6px"},children:w.creatableItems??0}),e.jsx("td",{style:{padding:"4px 6px"},children:w.listableItems??0})]},h)}),Object.keys(f).length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:6,style:{padding:"4px 6px",color:"var(--muted2)"},children:"No services known."})})]})]}),d.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",children:"Settings Registrations"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:"Sections actively registered by each service against this platform-api."}),e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Sections"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Registered at"})]})}),e.jsx("tbody",{children:d.map(h=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:h.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:h.instanceId}),e.jsx("td",{style:{padding:"4px 6px"},children:(h.sections||[]).map(w=>w.key).join(", ")||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:h.registeredAt||"—"})]},h.serviceCode+":"+h.instanceId))})]})]}),e.jsx("div",{className:"settings-sub-label",children:"UI Plugin Registrations"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:6},children:["Plugin bundles declared by each service and loaded by the shell at boot. Source: ",e.jsx("code",{style:{fontSize:11},children:"/api/platform/ui/manifest"}),"."]}),x==null?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"Manifest unavailable."}):x.length===0?e.jsx("div",{className:"settings-empty-row",style:{marginBottom:16},children:"No UI plugins declared."}):e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse",marginBottom:16},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Service"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Plugin ID"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Zone"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Bundle URL"})]})}),e.jsx("tbody",{children:x.map(h=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:h.serviceCode}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:h.pluginId}),e.jsx("td",{style:{padding:"4px 6px"},children:e.jsx("span",{style:{display:"inline-block",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600,background:"var(--surface2)",color:"var(--muted)",border:"1px solid var(--border)"},children:h.zone})}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace",color:"var(--muted2)"},children:h.url})]},h.pluginId))})]}),e.jsx("div",{className:"settings-sub-label",children:"Registered Services (platform-api)"}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:8},children:["Live snapshot from platform-api environment registry. ",z.length," service",z.length===1?"":"s"," known."]}),z.length===0?e.jsx("div",{className:"settings-empty-row",children:"No services registered."}):z.map(h=>{const w=n[h]||[],j=w.filter(A=>A.healthy).length;return e.jsxs("div",{className:"settings-card",children:[e.jsxs("div",{className:"settings-card-hd",style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("span",{className:"settings-card-name",style:{fontFamily:"monospace"},children:h}),e.jsxs("span",{style:{fontSize:10,color:j===w.length?"var(--success)":"var(--warn)"},children:[j,"/",w.length," healthy"]})]}),e.jsx("div",{className:"settings-card-body",children:e.jsxs("table",{style:{width:"100%",fontSize:11,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"var(--muted)",textAlign:"left",borderBottom:"1px solid var(--border)"},children:[e.jsx("th",{style:{padding:"4px 6px"},children:"Instance"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Base URL"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Version"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Tag"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Health"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Last HB"}),e.jsx("th",{style:{padding:"4px 6px"},children:"Failures"})]})}),e.jsx("tbody",{children:w.map(A=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:A.instanceId}),e.jsx("td",{style:{padding:"4px 6px",fontFamily:"monospace"},children:A.baseUrl}),e.jsx("td",{style:{padding:"4px 6px"},children:A.version||"—"}),e.jsx("td",{style:{padding:"4px 6px"},children:A.spaceTag||"—"}),e.jsx("td",{style:{padding:"4px 6px",color:A.healthy?"var(--success)":"var(--danger, #e05252)"},children:A.healthy?"OK":"DOWN"}),e.jsx("td",{style:{padding:"4px 6px"},children:$(D(A.lastHeartbeatOk))}),e.jsx("td",{style:{padding:"4px 6px"},children:A.consecutiveFailures??0})]},A.instanceId))})]})})]},h)}),r&&Object.keys(r).length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"settings-sub-label",style:{marginTop:16},children:"Project Space Tags"}),e.jsx("div",{style:{fontSize:11,color:"var(--muted)"},children:"Service ↔ space-tag affinity (used by gateway routing)."}),e.jsx("pre",{style:{fontSize:11,background:"var(--bg2)",padding:8,borderRadius:4},children:JSON.stringify(r,null,2)})]})]})}function no({sectionKey:t,userId:s,projectSpaceId:n,canWrite:a,toast:r,pluginsLoaded:o}){if(t===null)return e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading…"});const c=Aa(t)??Ca(t);if(!c)return o?e.jsxs("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:["Unknown section: ",t]}):e.jsx("div",{style:{padding:"32px 24px",color:"var(--muted)",fontSize:13},children:"Loading plugins…"});const{Component:u,wrapBody:p}=c,x=e.jsx(u,{userId:s,projectSpaceId:n,canWrite:a,toast:r});return p?e.jsx("div",{className:"settings-content-body",children:x}):x}function ro({userId:t,projectSpaceId:s,activeSection:n,onSectionChange:a,settingsSections:r,pluginsLoaded:o,toast:i}){const c=l.useMemo(()=>{const p={};return(r||[]).forEach(x=>x.sections.forEach(g=>{p[g.key]=g.canWrite})),p},[r]),u=l.useMemo(()=>{if(!r)return n;for(const p of r){const x=p.sections.find(g=>g.key===n);if(x)return x.label}return n},[r,n]);return e.jsxs("div",{className:"settings-content",children:[e.jsx("div",{className:"settings-content-hd",children:e.jsx("span",{className:"settings-content-title",children:u})}),e.jsx(no,{sectionKey:n,userId:t,projectSpaceId:s,canWrite:c[n]??!1,pluginsLoaded:o,toast:i})]})}qe("my-profile",Ua);qe("api-playground",ja,{wrapBody:!1});qe("user-manual",ka,{wrapBody:!1});qe("proj-spaces",Ka);qe("users-roles",Ya);qe("access-rights",Qa);qe("secrets",to);qe("service-registry",so);qe("platform-environment",eo);qe("actions-catalog",Ia);qe("platform-algorithms",Da);class os extends Be.Component{constructor(s){super(s),this.state={hasError:!1,error:null}}static getDerivedStateFromError(s){return{hasError:!0,error:s}}componentDidCatch(s,n){console.error("ErrorBoundary caught:",s,n)}render(){var s;return this.state.hasError?this.props.fallback||e.jsxs("div",{style:{padding:24,color:"#e74c3c"},children:[e.jsx("strong",{children:"Something went wrong."}),e.jsx("pre",{style:{fontSize:12,marginTop:8},children:(s=this.state.error)==null?void 0:s.message})]}):this.props.children}}const Vs={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function ao({userId:t,txId:s,txNodes:n,stateColorMap:a,onCommitted:r,onClose:o,toast:i}){const[c,u]=l.useState(""),[p,x]=l.useState(!1),g=(n||[]).map(d=>d.node_id||d.NODE_ID),[k,z]=l.useState(()=>new Set(g));function D(d){z(h=>{const w=new Set(h);return w.has(d)?w.delete(d):w.add(d),w})}function $(){z(k.size===g.length?new Set:new Set(g))}async function f(){if(!c.trim()){i("Commit comment is required","warn");return}if(k.size===0){i("Select at least one object to commit","warn");return}x(!0);try{const d=k.size===g.length?null:[...k],h=await ut.commit(t,s,c,d),w=(h==null?void 0:h.continuationTxId)||null,j=g.length-k.size;i("Transaction committed","success"),r(w,j),o()}catch(d){i(d,"error")}finally{x(!1)}}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true","aria-labelledby":"commit-title",children:e.jsxs("div",{className:"card commit-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",id:"commit-title",children:"Commit transaction"}),e.jsx("button",{className:"btn btn-sm",onClick:o,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:"commit-comment",children:["Commit comment ",e.jsx("span",{className:"field-req","aria-label":"required",children:"*"})]}),e.jsx("input",{id:"commit-comment",className:"field-input",placeholder:"Describe what you changed…",value:c,onChange:d=>u(d.target.value),autoFocus:!0})]}),(n==null?void 0:n.length)>0&&e.jsxs("div",{className:"commit-node-list",children:[e.jsx("div",{className:"commit-node-list-hd",children:e.jsxs("label",{className:"commit-node-all",children:[e.jsx("input",{type:"checkbox",checked:k.size===g.length,onChange:$}),e.jsx("span",{children:"Objects to commit"}),e.jsxs("span",{className:"commit-node-count",children:[k.size,"/",g.length]})]})}),e.jsx("div",{className:"commit-node-list-scroll",children:n.map(d=>{const h=d.node_id||d.NODE_ID,w=d.logical_id||d.LOGICAL_ID||h,j=d.node_type_name||d.NODE_TYPE_NAME||"",A=d.revision||d.REVISION||"A",T=d.iteration??d.ITERATION??1,O=(d.change_type||d.CHANGE_TYPE||"CONTENT").toUpperCase(),K=d.lifecycle_state_id||d.LIFECYCLE_STATE_ID||"",R=Vs[O]||Vs.CONTENT;return e.jsxs("label",{className:"commit-node-item",children:[e.jsx("input",{type:"checkbox",checked:k.has(h),onChange:()=>D(h)}),e.jsx("span",{className:"commit-node-dot",style:{background:(a==null?void 0:a[K])||"#6b7280"}}),e.jsx("span",{className:"commit-node-lid",children:w}),e.jsx("span",{className:"commit-node-rev",children:T===0?A:`${A}.${T}`}),e.jsx("span",{className:"commit-node-type",children:j}),e.jsx("span",{className:"commit-node-badge",style:{background:R.bg,color:R.color},children:R.label})]},h)})})]}),e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:14},children:"Committed objects become visible to everyone. Uncommitted objects stay in a new transaction."}),e.jsxs("div",{className:"row flex-end",style:{gap:8},children:[e.jsx("button",{className:"btn",onClick:o,children:"Cancel"}),e.jsx("button",{className:"btn btn-success",onClick:f,disabled:p||!c.trim()||k.size===0,children:p?"Committing…":"✓ Commit"})]})]})]})})}function oo({resources:t,onCreated:s,onClose:n,toast:a,initialDescriptor:r}){const o=l.useMemo(()=>{const R=new Set,b=[];for(const m of t||[]){const B=m.sourceLabel||"OTHER";R.has(B)||(R.add(B),b.push(B))}return b},[t]),[i,c]=l.useState((r==null?void 0:r.sourceLabel)||o[0]||""),u=l.useMemo(()=>(t||[]).filter(R=>(R.sourceLabel||"OTHER")===i),[t,i]),[p,x]=l.useState(()=>r?(t||[]).find(R=>R.serviceCode===r.serviceCode&&R.itemCode===r.itemCode&&(R.itemKey||"")===(r.itemKey||""))||null:u[0]||null);l.useEffect(()=>{r||x(u[0]||null)},[i]);const[g,k]=l.useState({}),[z,D]=l.useState({}),[$,f]=l.useState(!1);if(l.useEffect(()=>{k({}),D({})},[p]),!p)return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsx("div",{className:"modal-scroll",style:{padding:24,color:"var(--muted)"},children:"No creatable resources available."})]})});const d=p.create,h=((d==null?void 0:d.parameters)||[]).slice().sort((R,b)=>(R.displayOrder||0)-(b.displayOrder||0)),w=[];let j=null;for(const R of h){const b=R.displaySection||"Fields";(w.length===0||b!==j)&&(w.push({section:b,items:[]}),j=b),w[w.length-1].items.push(R)}function A(R,b){k(m=>({...m,[R]:b})),D(m=>({...m,[R]:null}))}function T(){const R={};for(const b of h){const m=g[b.name];if(b.required&&(m==null||m===""||m instanceof File&&m.size===0)&&(R[b.name]="Required"),b.validationRegex&&typeof m=="string"&&m.trim())try{new RegExp(`^(?:${b.validationRegex})$`).test(m.trim())||(R[b.name]=`Does not match pattern: ${b.validationRegex}`)}catch{}}return D(R),Object.keys(R).length===0}async function O(){if(T()){f(!0);try{const R=await q.createResource(p,g);a(`${p.displayName||p.itemCode} created`,"success"),s==null||s(R,p),n()}catch(R){a(R,"error")}finally{f(!1)}}}function K(R){const b=(R.widgetType||"TEXT").toUpperCase(),m=z[R.name],B=g[R.name];if(b==="FILE")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("input",{id:`f-${R.name}`,type:"file",className:`field-input${m?" error":""}`,onChange:C=>{var P;return A(R.name,((P=C.target.files)==null?void 0:P[0])||null)}}),R.tooltip&&e.jsx("span",{className:"field-hint",children:R.tooltip}),m&&e.jsx("span",{className:"field-hint error",role:"alert",children:m})]},R.name);if(b==="TEXTAREA")return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsx("textarea",{id:`f-${R.name}`,className:`field-input${m?" error":""}`,placeholder:R.tooltip||"",value:B||"",onChange:C=>A(R.name,C.target.value)}),m&&e.jsx("span",{className:"field-hint error",role:"alert",children:m})]},R.name);if(b==="DROPDOWN"||b==="SELECT"){const C=R.allowedValues?lo(R.allowedValues):[];return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("select",{id:`f-${R.name}`,className:`field-input${m?" error":""}`,value:B||"",onChange:P=>A(R.name,P.target.value),children:[e.jsx("option",{value:"",children:"— select —"}),C.map(P=>e.jsx("option",{children:P},P))]}),m&&e.jsx("span",{className:"field-hint error",role:"alert",children:m})]},R.name)}const _=(B||"").toString().trim(),Y=R.validationRegex?io(`^(?:${R.validationRegex})$`):null,y=!Y||!_?null:Y.test(_);return e.jsxs("div",{className:"field",children:[e.jsxs("label",{className:"field-label",htmlFor:`f-${R.name}`,children:[R.label,R.required&&e.jsx("span",{className:"field-req",children:" *"})]}),e.jsxs("div",{className:"logical-id-wrap",children:[e.jsx("input",{id:`f-${R.name}`,type:b==="NUMBER"?"number":"text",className:`field-input${m?" error":y===!0?" ok":y===!1?" error":""}`,placeholder:R.tooltip||(R.validationRegex?`pattern: ${R.validationRegex}`:""),value:B||"",onChange:C=>A(R.name,C.target.value)}),_&&Y&&e.jsx("span",{className:`logical-id-badge ${y?"ok":"err"}`,children:y?"✓":"✗"})]}),R.validationRegex&&e.jsxs("div",{className:"logical-id-hint",children:[e.jsx("span",{className:"logical-id-hint-label",children:"Pattern"}),e.jsx("code",{className:"logical-id-hint-code",children:R.validationRegex}),!_&&e.jsx("span",{className:"logical-id-hint-idle",children:"start typing to validate"}),_&&y===!1&&e.jsx("span",{className:"logical-id-hint-err",children:"no match"}),_&&y===!0&&e.jsx("span",{className:"logical-id-hint-ok",children:"matches"})]}),!R.validationRegex&&R.tooltip&&e.jsx("span",{className:"field-hint",children:R.tooltip}),m&&e.jsx("span",{className:"field-hint error",role:"alert",children:m})]},R.name)}return e.jsx("div",{className:"overlay",role:"dialog","aria-modal":"true",children:e.jsxs("div",{className:"card create-node-modal",children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",children:"Create object"}),e.jsx("button",{className:"btn btn-sm",onClick:n,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:"modal-scroll",children:[e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsxs("div",{className:"field",style:{margin:0,flex:"0 0 180px"},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-source",children:"Source"}),e.jsx("select",{id:"rc-source",className:"field-input",value:i,onChange:R=>c(R.target.value),disabled:!!r,children:o.map(R=>e.jsx("option",{value:R,children:R},R))})]}),e.jsxs("div",{className:"field",style:{margin:0,flex:1},children:[e.jsx("label",{className:"field-label",htmlFor:"rc-type",children:"Type"}),e.jsx("select",{id:"rc-type",className:"field-input",value:p?`${p.serviceCode}/${p.itemCode}/${p.itemKey||""}`:"",onChange:R=>{const b=R.target.value,m=u.find(B=>`${B.serviceCode}/${B.itemCode}/${B.itemKey||""}`===b);m&&x(m)},disabled:!!r,children:u.map(R=>{const b=`${R.serviceCode}/${R.itemCode}/${R.itemKey||""}`;return e.jsx("option",{value:b,children:R.displayName},b)})})]})]}),p.description&&e.jsx("div",{style:{padding:"12px 0 0",color:"var(--muted)",fontSize:12},children:p.description}),w.map((R,b)=>e.jsxs(Be.Fragment,{children:[e.jsx("div",{className:"modal-identity-sep",style:{marginTop:b===0?16:18},children:e.jsx("span",{children:R.section})}),R.items.map(m=>K(m))]},`grp-${b}-${R.section}`))]}),e.jsx("div",{className:"card-hd",style:{borderTop:"1px solid var(--border)",borderBottom:"none"},children:e.jsxs("div",{className:"row flex-end",style:{width:"100%",gap:8},children:[e.jsx("button",{className:"btn",onClick:n,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:O,disabled:$,children:$?"Creating…":"Create"})]})})]})})}function io(t){try{return new RegExp(t)}catch{return null}}function lo(t){try{return JSON.parse(t)}catch{return[]}}function co({detail:t,onClose:s}){var r;const n=t.category==="TECHNICAL",a=n&&Array.isArray(t.stackTrace)?t.stackTrace.join(`
`):null;return e.jsx("div",{className:"overlay",onClick:s,role:"dialog","aria-modal":"true","aria-label":"Error detail",children:e.jsxs("div",{className:`card ${n?"err-card-tech":"err-card-func"}`,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{className:"card-hd",children:[e.jsx("span",{className:"card-title",style:{color:n?"var(--danger)":"var(--warn)"},children:n?"✗ Unexpected error":"⚠ Error"}),e.jsx("button",{className:"btn btn-sm",onClick:s,"aria-label":"Close",children:"✕"})]}),e.jsxs("div",{className:`card-body ${n?"err-body":""}`,children:[e.jsx("div",{className:"err-message",children:t.error}),((r=t.violations)==null?void 0:r.length)>0&&e.jsx("ul",{className:"violations-list",children:t.violations.map((o,i)=>e.jsx("li",{className:"violation-item",children:typeof o=="string"?o:o.message},i))}),n&&t.type&&e.jsx("div",{className:"err-meta",children:t.type}),t.path&&e.jsx("div",{className:"err-meta",children:t.path}),a&&e.jsx("pre",{className:"stack-trace",children:a})]})]})})}const St=[];function xs(t){if(!t||!t.match||!t.match.serviceCode)throw new Error("Plugin requires match.serviceCode");const s=(t.match.itemKey?4:0)+(t.match.itemCode?2:0)+(t.match.serviceCode==="*"?0:1);t._specificity=s,St.push(t),St.sort((n,a)=>(a._specificity||0)-(n._specificity||0))}function zn(t,s){const n=t.match;return!(n.serviceCode!=="*"&&n.serviceCode!==s.serviceCode||n.itemCode&&n.itemCode!==s.itemCode||n.itemKey&&n.itemKey!==s.itemKey)}function fs(t){for(const s of St)if(zn(s,t||{}))return s;return Pt}function po(t){if(!t)return Pt;for(const s of St)if(zn(s,t))return s;return Pt}let Pt={match:{serviceCode:"*"},name:"default",hasItemChildren:()=>!1};function mo(t){Pt={...Pt,...t,match:{serviceCode:"*"}}}function uo(t){for(const s of St)if(s.LinkRow&&(s.match.serviceCode==="*"||s.match.serviceCode===t))return s.LinkRow;return null}function Ks(t,s,n){const a=St.find(r=>r.match.serviceCode===t&&(!s||r.match.itemCode===s));a?Object.assign(a,n):xs({match:{serviceCode:t,itemCode:s},...n})}function ho(t){const s=t.value;if(s==null||s==="")return e.jsx("span",{style:{color:"var(--muted2)"},children:"—"});switch(t.widget){case"datetime":{try{const n=new Date(s);if(!isNaN(n.getTime()))return n.toLocaleString()}catch{}return String(s)}case"code":return e.jsx("code",{style:{fontSize:10,wordBreak:"break-all"},children:String(s)});case"number":return e.jsx("span",{style:{fontFamily:"var(--mono)"},children:Number(s).toLocaleString()});case"link":return e.jsx("a",{href:String(s),target:"_blank",rel:"noreferrer",children:String(s)});case"badge":return e.jsx("span",{className:"settings-badge",children:String(s)});case"image":return e.jsx("img",{src:String(s),alt:t.label,style:{maxWidth:"100%",maxHeight:240}});case"multiline":return e.jsx("pre",{style:{margin:0,whiteSpace:"pre-wrap",fontSize:12},children:String(s)});default:return String(s)}}function An({tab:t,ctx:s,descriptorOverride:n}){var B,_,Y;const{userId:a,toast:r}=s||{},o=n||t.get||{},i=o.path,c=(o.httpMethod||"GET").toUpperCase(),u=(n==null?void 0:n.serviceCode)||t.serviceCode,p=u?`/api/${u}`:"",[x,g]=l.useState(null),[k,z]=l.useState(null),[D,$]=l.useState(!0),[f,d]=l.useState(null),[h,w]=l.useState(null),[j,A]=l.useState(!1),[T,O]=l.useState(!1),[K,R]=l.useState(null),b=l.useCallback(async()=>{if(!i||!t.nodeId){z("No get action declared for this source"),$(!1);return}$(!0),z(null);try{const y=p+i.replace("{id}",encodeURIComponent(t.nodeId)),C=await q.gatewayJson(c,y);g(C)}catch(y){z((y==null?void 0:y.message)||String(y))}finally{$(!1)}},[i,c,t.nodeId,p]);l.useEffect(()=>{b()},[b]),l.useEffect(()=>{var P;const y=(P=x==null?void 0:x.metadata)==null?void 0:P.downloadUrl;if(!y){w(null),O(!1),R(null);return}let C=!1;return A(!0),q.gatewayRawText(y).then(({text:M,truncated:v,totalBytes:S})=>{C||(w(M),O(v),R(S),A(!1))}).catch(()=>{C||(w(null),A(!1))}),()=>{C=!0}},[(B=x==null?void 0:x.metadata)==null?void 0:B.downloadUrl]),l.useEffect(()=>{var y;(y=s==null?void 0:s.onRegisterPreview)==null||y.call(s,{text:h,truncated:T,totalBytes:K,loading:j})},[h,j,T,K]),l.useEffect(()=>()=>{var y;(y=s==null?void 0:s.onRegisterPreview)==null||y.call(s,null)},[t.nodeId]);async function m(y){var C,P;if(!(y.confirmRequired&&!window.confirm(`${y.label}?

${y.description||""}`))){if((C=y.metadata)!=null&&C.openInNewTab){window.open(p+y.path.replace("{id}",encodeURIComponent(t.nodeId)),"_blank","noreferrer");return}d(y.code);try{const M=p+y.path.replace("{id}",encodeURIComponent(t.nodeId));await q.gatewayJson(y.httpMethod,M,(P=y.parameters)!=null&&P.length?{}:void 0),r&&r(`${y.label} done`,"success"),b()}catch(M){r&&r(M,"error")}finally{d(null)}}}return D?e.jsx("div",{className:"settings-loading",children:"Loading…"}):k?e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⚠"}),e.jsx("div",{className:"editor-empty-text",children:"Failed to load"}),e.jsx("div",{className:"editor-empty-hint",children:k})]}):x?e.jsxs("div",{style:{padding:24,overflow:"auto",height:"100%",boxSizing:"border-box"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:4},children:[x.color&&e.jsx("span",{style:{width:10,height:10,borderRadius:2,background:x.color,flexShrink:0}}),e.jsx("h2",{style:{margin:0,fontSize:18},children:x.title||x.id}),e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontFamily:"var(--mono)"},children:x.id})]}),x.subtitle&&e.jsx("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:16},children:x.subtitle}),x.actions&&x.actions.length>0&&e.jsx("div",{style:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},children:x.actions.map(y=>e.jsx("button",{className:`btn btn-sm ${y.dangerous?"btn-danger":"btn-primary"}`,onClick:()=>m(y),disabled:f===y.code,title:y.description||y.label,children:f===y.code?"…":y.label},y.code))}),e.jsx("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse",marginBottom:24},children:e.jsx("tbody",{children:x.fields.map(y=>e.jsxs("tr",{style:{borderBottom:"1px solid var(--border)"},children:[e.jsxs("td",{style:{padding:"6px 8px",color:"var(--muted)",width:180,verticalAlign:"top"},children:[y.label,y.hint&&e.jsx("div",{style:{fontSize:10,color:"var(--muted2)"},children:y.hint})]}),e.jsx("td",{style:{padding:"6px 8px"},children:ho(y)})]},y.name))})}),((_=x.metadata)==null?void 0:_.isImage)&&((Y=x.metadata)==null?void 0:Y.downloadUrl)&&e.jsxs("div",{children:[e.jsx("div",{className:"settings-sub-label",style:{marginBottom:8},children:"Preview"}),e.jsx("img",{src:x.metadata.downloadUrl,alt:x.title,style:{maxWidth:"100%",maxHeight:480,border:"1px solid var(--border)",borderRadius:4}})]})]}):null}function xo({descriptor:t,item:s,ctx:n,isActive:a,isPinned:r,onPin:o,onUnpin:i}){var g,k,z,D;const c=((k=(g=t.list)==null?void 0:g.itemShape)==null?void 0:k.idField)||"id",u=((D=(z=t.list)==null?void 0:z.itemShape)==null?void 0:D.labelField)||"id",p=s[c]||s.id,x=s[u]||p;return e.jsxs("div",{className:`node-item${a?" active":""}`,onClick:()=>n.onNavigate(p,x,t),title:x,children:[e.jsx("span",{className:"ni-expand",style:{visibility:"hidden"}}),e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:x}),(o||i)&&e.jsx("button",{className:`search-pin-btn${r?" pinned":""}`,title:r?"Remove from basket":"Add to basket",onClick:$=>{$.stopPropagation(),r?i==null||i():o==null||o()},children:r?e.jsx(Nt,{size:11,strokeWidth:2}):e.jsx(Dt,{size:11,strokeWidth:2})})]})}const fo={match:{serviceCode:"*"},name:"default",NavRow:xo,Editor:An,hasItemChildren:()=>!1},In=256*1024*1024,Ss=Math.max(1,Math.min(navigator.hardwareConcurrency||2,4)),Ze=Array.from({length:Ss},()=>new Worker(new URL("/assets/stepWorker-BXK_CxMf.js",import.meta.url),{type:"module"}));Ze.forEach(t=>{t.addEventListener("message",({data:s})=>{s.type==="log"&&we.getState().appendLog(s.level,s.message)})});function go(t){let s=0;for(let n=0;n<t.length;n++)s=s*31+t.charCodeAt(n)>>>0;return Ze[s%Ss]}function qs({idb:t=!1}={}){Ze.forEach(s=>s.postMessage({type:"clear",idb:t}))}function bo(t){Ze.forEach(s=>s.postMessage({type:"setMaxBytes",maxBytes:t}))}const is={postMessage(t){t.uuid?go(t.uuid).postMessage(t):Ze.forEach(s=>s.postMessage(t))},addEventListener(t,s){Ze.forEach(n=>n.addEventListener(t,s))},removeEventListener(t,s){Ze.forEach(n=>n.removeEventListener(t,s))}},vo=()=>({entries:0,cacheBytes:0,maxBytes:In,memHits:0,idbHits:0,netFetches:0,avgDownloadMs:null,avgParseMs:null});function Xs(t,s){const n=t.map(a=>a[s]).filter(a=>a!=null);return n.length?n.reduce((a,r)=>a+r,0)/n.length:null}function yo(){const t=l.useRef(Ze.map(vo)),[,s]=l.useState(0);l.useEffect(()=>{const a=Ze.map((r,o)=>{const i=({data:c})=>{c.type==="stats"&&(t.current[o]={entries:c.entries,cacheBytes:c.cacheBytes,maxBytes:c.maxBytes??In,memHits:c.memHits??0,idbHits:c.idbHits??0,netFetches:c.netFetches??0,avgDownloadMs:c.avgDownloadMs??null,avgParseMs:c.avgParseMs??null},s(u=>u+1))};return r.addEventListener("message",i),r.postMessage({type:"stats"}),i});return()=>Ze.forEach((r,o)=>r.removeEventListener("message",a[o]))},[]);const n=t.current;return{workers:Ss,entries:n.reduce((a,r)=>a+r.entries,0),cacheBytes:n.reduce((a,r)=>a+r.cacheBytes,0),maxBytes:n.reduce((a,r)=>a+r.maxBytes,0),memHits:n.reduce((a,r)=>a+r.memHits,0),idbHits:n.reduce((a,r)=>a+r.idbHits,0),netFetches:n.reduce((a,r)=>a+r.netFetches,0),avgDownloadMs:Xs(n,"avgDownloadMs"),avgParseMs:Xs(n,"avgParseMs")}}function jo({nodes:t=[],loading:s=!1,onNavigateToNode:n}){var M;const a=l.useRef(null),r=l.useRef(null),o=l.useRef(null),i=l.useRef(null),c=l.useRef(null),u=l.useRef(null),p=l.useRef(null),x=l.useRef({}),g=l.useRef(new Set),k=l.useRef({}),z=l.useRef({}),D=l.useRef(n),$=l.useRef(null),f=l.useRef({}),d=l.useRef([]);l.useEffect(()=>{D.current=n},[n]);const[h,w]=l.useState({}),[j,A]=l.useState(()=>new Set),[T,O]=l.useState(()=>new Set),K=(M=t[0])==null?void 0:M.nodeId;l.useEffect(()=>{A(new Set)},[K]);const[R,b]=l.useState(!1);l.useEffect(()=>{const v={},S={};t.forEach(L=>L.parts.forEach(U=>{const F=U.instanceKey||U.uuid;v[F]=L.nodeId,S[F]=L.stateColor||"#6b7280"})),k.current=v,z.current=S,Object.entries(S).forEach(([L,U])=>{const F=x.current[L];if(!F)return;const G=new It(U);F.traverse(I=>{I.isMesh&&I.userData.isOutline&&I.material.uniforms.color.value.copy(G)})})},[t]);const B=t.flatMap(v=>v.parts).filter(v=>!j.has(v.instanceKey||v.uuid)),_=B.map(v=>`${v.instanceKey||v.uuid}@${v.matrix?v.matrix.join(","):"I"}`).join("|");d.current=B,l.useEffect(()=>{const v=a.current;if(!v)return;const S=v.clientWidth||600,L=v.clientHeight||400,U=()=>{const Q=getComputedStyle(document.documentElement).getPropertyValue("--scene-bg").trim();return new It(Q||"#1c1c2a")},F=new Ar;F.background=U(),F.add(new Ir(16777215,.7));const G=new Rr(16777215,1.2);G.position.set(8,12,6),F.add(G);const I=new $r(45,S/L,1e-4,1e5);I.position.set(0,5,10);const E=new Pr({antialias:!0});E.setPixelRatio(window.devicePixelRatio),E.setSize(S,L),v.appendChild(E.domElement);const H=new Lr(I,E.domElement);H.enableDamping=!0,H.dampingFactor=.08;const ie=new Dr(I,E,{size:80,container:v});ie.attachControls(H),r.current=F,o.current=E,i.current=I,c.current=H,u.current=ie;function re(){p.current=requestAnimationFrame(re),H.update(),E.render(F,I),ie.render()}re();function ue(){const Q=v.clientWidth,te=v.clientHeight;!Q||!te||(I.aspect=Q/te,I.updateProjectionMatrix(),E.setSize(Q,te),ie.update())}const he=new MutationObserver(()=>{r.current&&(r.current.background=U())});he.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});const ke=new ResizeObserver(()=>ue());ke.observe(v);const W=new Or,J=new Br;function ae(Q){const te=v.getBoundingClientRect();J.set((Q.clientX-te.left)/v.clientWidth*2-1,(Q.clientY-te.top)/v.clientHeight*-2+1),W.setFromCamera(J,I);const me=[];F.traverse(Ce=>{Ce.isMesh&&!Ce.userData.isOutline&&Ce.visible&&me.push(Ce)});const ve=W.intersectObjects(me,!1);if(!ve.length)return null;let Te=ve[0].object;for(;Te&&!Te.name;)Te=Te.parent;return(Te==null?void 0:Te.name)||null}function X(Q){const te=$.current;if(te!==Q){if(te){const me=x.current[te];me&&me.traverse(ve=>{ve.isMesh&&(ve.userData.isOutline?ve.material.uniforms.color.value.set(z.current[te]||"#6b7280"):ve.material.emissive.set(0))})}if(Q){const me=x.current[Q];me&&me.traverse(ve=>{ve.isMesh&&(ve.userData.isOutline?ve.material.uniforms.color.value.set(16777215):ve.material.emissive.set(6710886))})}$.current=Q,E.domElement.style.cursor=Q?"pointer":"default"}}function se(Q){X(ae(Q))}function ce(){X(null)}function xe(Q){if(!Q.ctrlKey&&!Q.metaKey)return;const te=ae(Q);if(!te)return;const me=k.current[te];me&&D.current&&D.current(me)}return E.domElement.addEventListener("mousemove",se),E.domElement.addEventListener("mouseleave",ce),E.domElement.addEventListener("click",xe),()=>{cancelAnimationFrame(p.current),he.disconnect(),ke.disconnect(),E.domElement.removeEventListener("mousemove",se),E.domElement.removeEventListener("mouseleave",ce),E.domElement.removeEventListener("click",xe),ie.dispose(),E.dispose(),v.contains(E.domElement)&&v.removeChild(E.domElement)}},[]),l.useEffect(()=>{const v=({data:S})=>{var F;const{type:L,uuid:U}=S;if(g.current.has(U)){if(g.current.delete(U),L==="ready"){f.current[U]=S.meshes;const G=d.current.filter(E=>E.uuid===U),I={};for(const E of G){const H=E.instanceKey||E.uuid;if(x.current[H])continue;const ie=z.current[H]||"#6b7280",re=Ys(S.meshes,ie);if(re.name=H,E.matrix){const ue=new es;ue.set(E.matrix[0],E.matrix[1],E.matrix[2],E.matrix[3],E.matrix[4],E.matrix[5],E.matrix[6],E.matrix[7],E.matrix[8],E.matrix[9],E.matrix[10],E.matrix[11],E.matrix[12],E.matrix[13],E.matrix[14],E.matrix[15]),re.matrix.copy(ue),re.matrixAutoUpdate=!1}(F=r.current)==null||F.add(re),x.current[H]=re,I[H]={phase:"ready",error:null,visible:!0}}Y(),Object.keys(I).length>0&&w(E=>({...E,...I}))}else if(L==="error"){const G=d.current.filter(E=>E.uuid===U),I={};for(const E of G){const H=E.instanceKey||E.uuid;I[H]={phase:"error",error:S.message,visible:!1}}Object.keys(I).length>0&&w(E=>({...E,...I}))}}};return is.addEventListener("message",v),()=>is.removeEventListener("message",v)},[]),l.useEffect(()=>{var F,G;const v=new Set(B.map(I=>I.instanceKey||I.uuid)),S=new Set(B.map(I=>I.uuid));for(const I of Object.keys(x.current))v.has(I)||(Js(x.current[I]),(F=r.current)==null||F.remove(x.current[I]),delete x.current[I]);for(const I of[...g.current])S.has(I)||g.current.delete(I);for(const I of Object.keys(f.current))S.has(I)||delete f.current[I];w(I=>{const E={...I};for(const H of Object.keys(E))v.has(H)||delete E[H];return E});const L={};let U=!1;for(const I of B){const E=I.instanceKey||I.uuid;if(x.current[E]){if(I.matrix){const H=new es;H.set(I.matrix[0],I.matrix[1],I.matrix[2],I.matrix[3],I.matrix[4],I.matrix[5],I.matrix[6],I.matrix[7],I.matrix[8],I.matrix[9],I.matrix[10],I.matrix[11],I.matrix[12],I.matrix[13],I.matrix[14],I.matrix[15]),x.current[E].matrix.equals(H)||(x.current[E].matrix.copy(H),x.current[E].matrixAutoUpdate=!1,U=!0)}continue}if(f.current[I.uuid]){const H=z.current[E]||"#6b7280",ie=Ys(f.current[I.uuid],H);if(ie.name=E,I.matrix){const re=new es;re.set(I.matrix[0],I.matrix[1],I.matrix[2],I.matrix[3],I.matrix[4],I.matrix[5],I.matrix[6],I.matrix[7],I.matrix[8],I.matrix[9],I.matrix[10],I.matrix[11],I.matrix[12],I.matrix[13],I.matrix[14],I.matrix[15]),ie.matrix.copy(re),ie.matrixAutoUpdate=!1}(G=r.current)==null||G.add(ie),x.current[E]=ie,L[E]={phase:"ready",error:null,visible:!0},U=!0}else g.current.has(I.uuid)?L[E]={phase:"loading",error:null,visible:!0}:(g.current.add(I.uuid),L[E]={phase:"loading",error:null,visible:!0},is.postMessage({type:"load",uuid:I.uuid,kind:I.kind||"design",token:kt(),projectSpace:qt()}))}U&&Y(),Object.keys(L).length>0&&w(I=>({...I,...L}))},[_]);function Y(){const v=r.current,S=i.current,L=c.current;if(!v||!S)return;const U=new Mr;if(v.traverse(E=>{E.isMesh&&!E.userData.isOutline&&E.visible&&U.expandByObject(E)}),U.isEmpty())return;const F=new Rs,G=new Rs;U.getCenter(F),U.getSize(G);const I=Math.max(G.x,G.y,G.z)||1;S.near=I*1e-4,S.far=I*200,S.position.set(F.x+I*1.5,F.y+I,F.z+I*2),S.lookAt(F),L&&(L.target.copy(F),L.update()),S.updateProjectionMatrix()}function y(v){const S=x.current[v];if(!S)return;const L=!S.visible;S.visible=L,w(U=>({...U,[v]:{...U[v],visible:L}}))}function C(v){var L;const S=x.current[v];S&&(Js(S),(L=r.current)==null||L.remove(S),delete x.current[v]),A(U=>new Set([...U,v])),w(U=>{const F={...U};return delete F[v],F})}function P(v){O(S=>{const L=new Set(S);return L.has(v)?L.delete(v):L.add(v),L})}return e.jsxs("div",{style:{display:"flex",height:"100%",overflow:"hidden"},children:[R?e.jsxs("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,background:"var(--surface)"},onClick:()=>b(!1),title:"Show parts panel",children:[e.jsx(Ge,{size:12,style:{color:"var(--muted)",flexShrink:0}}),e.jsx("span",{style:{writingMode:"vertical-rl",fontSize:10,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1,textTransform:"uppercase"},children:"Parts"})]}):e.jsxs("div",{style:{width:220,flexShrink:0,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{padding:"5px 8px 5px 10px",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsx("span",{children:"Parts"}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>b(!0),title:"Collapse parts panel",children:e.jsx(Sr,{size:13})})]}),s&&e.jsx("div",{style:{padding:"6px 10px",fontSize:11,color:"var(--muted)",flexShrink:0},children:"Loading…"}),!s&&t.length===0&&e.jsx("div",{style:{padding:"10px 12px",fontSize:12,color:"var(--muted)"},children:"No parts"}),e.jsx("div",{style:{flex:1,overflowY:"auto"},children:t.map(v=>{const S=v.parts.filter(F=>!j.has(F.instanceKey||F.uuid));if(S.length===0)return null;const L=T.has(v.nodeId),U=v.stateColor||"#6b7280";return e.jsxs("div",{children:[e.jsxs("div",{onClick:()=>P(v.nodeId),style:{display:"flex",alignItems:"center",gap:5,padding:`4px 8px 4px ${8+v.depth*12}px`,cursor:"pointer",fontSize:11,fontWeight:600,color:"var(--muted)",borderBottom:"1px solid var(--border)",background:"var(--surface)",userSelect:"none"},children:[e.jsx("span",{style:{width:7,height:7,borderRadius:2,background:U,flexShrink:0,display:"inline-block"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},title:v.nodeLabel,children:v.nodeLabel}),e.jsx("span",{style:{fontSize:9,flexShrink:0},children:L?"▶":"▼"})]}),!L&&S.map(F=>{const G=F.instanceKey||F.uuid,I=h[G]||{},E=I.visible!==!1;return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,padding:`4px 8px 4px ${14+v.depth*12}px`,fontSize:12,borderBottom:"1px solid var(--border)"},children:[e.jsx("input",{type:"checkbox",checked:E,disabled:I.phase!=="ready",onChange:()=>y(G),style:{flexShrink:0,cursor:I.phase==="ready"?"pointer":"default"}}),e.jsx("span",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:I.phase==="error"?"var(--danger, #e05252)":"inherit",opacity:E?1:.45},title:I.phase==="error"?I.error:F.fileName,children:F.fileName||F.uuid}),e.jsxs("span",{style:{fontSize:10,color:"var(--muted)",flexShrink:0},children:[I.phase==="loading"&&"…",I.phase==="error"&&"✗"]}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>C(G),title:"Remove from scene",style:{fontSize:13,lineHeight:1},children:"×"})]},G)})]},v.instanceId||v.nodeId)})})]}),e.jsx("div",{ref:a,style:{flex:1,overflow:"hidden",minWidth:0,position:"relative"}})]})}function Ys(t,s="#6b7280"){const n=new _r,a=new It(s);for(const r of t){if(!r.positions)continue;const o=new Wr;o.setAttribute("position",new ts(r.positions,3)),r.normals&&o.setAttribute("normal",new ts(r.normals,3)),r.indices&&o.setIndex(new ts(r.indices,1));const i=r.color?new It(r.color[0],r.color[1],r.color[2]):new It(6003958),c=new $s(o,new Gr({color:i,side:Ur}));n.add(c);const u=new $s(o,new Fr({side:Hr,uniforms:{color:{value:a.clone()},thickness:{value:.007}},vertexShader:`
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
void main() { gl_FragColor = vec4(color, 1.0); }`}));u.renderOrder=1,u.userData.isOutline=!0,n.add(u)}return n}function Js(t){t.traverse(s=>{var n,a;(n=s.geometry)==null||n.dispose(),Array.isArray(s.material)?s.material.forEach(r=>r.dispose()):(a=s.material)==null||a.dispose()})}function wo({data:t,tab:s,ctx:n}){const{nodes:a=[],loading:r=!1}=t||{};return e.jsx(jo,{nodes:a,loading:r,onNavigateToNode:n!=null&&n.onNavigate?o=>n.onNavigate(o,void 0,{serviceCode:"psm",itemCode:"node"}):void 0})}function ko(t){return t?t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`:""}function So({data:t}){const{text:s,loading:n,truncated:a,totalBytes:r}=t||{};return n?e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"Loading…"}):s?e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"},children:[e.jsx("pre",{style:{margin:0,padding:14,fontSize:11,lineHeight:1.55,fontFamily:"var(--mono)",whiteSpace:"pre-wrap",wordBreak:"break-all",color:"var(--text)",overflow:"auto",flex:1,boxSizing:"border-box"},children:s}),a&&e.jsxs("div",{style:{padding:"6px 14px",fontSize:11,color:"var(--muted)",borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:["Preview limited to first 64 KB",r?` — file is ${ko(r)}`:"","."]})]}):e.jsx("div",{style:{padding:14,fontSize:12,color:"var(--muted)"},children:"No preview available"})}function No({descriptor:t,item:s,ctx:n,isActive:a,hasChildren:r,isExpanded:o,isLoading:i,onToggleChildren:c,isPinned:u,onPin:p,onUnpin:x}){const{userId:g,stateColorMap:k,onNavigate:z}=n,D=s.id||s.ID,$=s.revision||s.REVISION||"A",f=s.iteration??s.ITERATION??1,d=s.lifecycle_state_id||s.LIFECYCLE_STATE_ID,h=s.logical_id||s.LOGICAL_ID||"",w=s.locked_by||s.LOCKED_BY||null,A=(s.tx_status||s.TX_STATUS||"COMMITTED")==="OPEN",T=w&&w!==g,O=w&&w===g,K=(t==null?void 0:t.color)??null;return e.jsxs("div",{className:`node-item${a?" active":""}`,onClick:()=>z(D,h||void 0,t),title:h||D,children:[e.jsx("span",{className:"ni-expand",style:{visibility:i||r?"visible":"hidden"},onClick:R=>c&&c(R),children:i?e.jsx("span",{style:{fontSize:9,color:"var(--muted)",lineHeight:1},children:"…"}):o?e.jsx(Ke,{size:9,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Ge,{size:9,strokeWidth:2.5,color:"var(--muted)"})}),K&&e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:K,flexShrink:0,display:"inline-block"}}),e.jsx("span",{className:"ni-dot",style:{background:(k==null?void 0:k[d])||"#6b7280"}}),e.jsxs("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:[h||e.jsx("span",{className:"ni-no-id",children:"—"}),(s.display_name||s.DISPLAY_NAME)&&e.jsx("span",{className:"ni-dname",children:s.display_name||s.DISPLAY_NAME})]}),e.jsx("span",{className:"ni-reviter",style:A?{color:"var(--warn)"}:void 0,children:f===0?$:`${$}.${f}`}),T&&e.jsx(bn,{size:10,strokeWidth:2.5,color:"var(--muted)",style:{flexShrink:0}}),O&&e.jsx(xt,{size:10,strokeWidth:2.5,color:"var(--accent)",style:{flexShrink:0}}),(p||x)&&e.jsx("button",{className:`search-pin-btn${u?" pinned":""}`,title:u?"Remove from basket":"Add to basket",onClick:R=>{R.stopPropagation(),u?x==null||x():p==null||p()},children:u?e.jsx(Nt,{size:11,strokeWidth:2}):e.jsx(Dt,{size:11,strokeWidth:2})})]})}function Co({descriptor:t,item:s,ctx:n,isActive:a,isPinned:r,onPin:o,onUnpin:i}){const c=s.id,u=s.originalName||c,p=(t==null?void 0:t.color)||"var(--muted2)";return e.jsxs("div",{className:`node-item${a?" active":""}`,onClick:()=>n.onNavigate(c,u,t),title:u,children:[e.jsx("span",{className:"ni-expand",style:{visibility:"hidden"}}),e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:p,flexShrink:0,display:"inline-block"}}),e.jsx("span",{className:"ni-logical",style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:u}),(o||i)&&e.jsx("button",{className:`search-pin-btn${r?" pinned":""}`,title:r?"Remove from basket":"Add to basket",onClick:x=>{x.stopPropagation(),r?i==null||i():o==null||o()},children:r?e.jsx(Nt,{size:11,strokeWidth:2}):e.jsx(Dt,{size:11,strokeWidth:2})})]})}let Zs=!1;function Eo(){Zs||(Zs=!0,mo(fo),xs({match:{serviceCode:"psm",itemCode:"node"},name:"psm-shell",NavRow:No,Preview:wo,previewLabel:"3D Preview",hasItemChildren:t=>{const s=t.children_count??t.CHILDREN_COUNT;return s==null||s>0}}),xs({match:{serviceCode:"dst",itemCode:"data-object"},name:"dst-shell",NavRow:Co,Editor:An,Preview:So,previewLabel:"Preview",hasItemChildren:()=>!1}))}const vt={},Ht=[];function To(t,s){return t.length!==s.length?!1:s.every((n,a)=>n==="*"||n===t[a])}const ls={emit(t){const s=t==null?void 0:t.type;if(!s)return;(vt[s]||[]).slice().forEach(a=>a(t));const n=s.split(":");Ht.forEach(({glob:a,handler:r})=>{To(n,a)&&r(t)})},on(t,s){return(vt[t]??(vt[t]=[])).push(s),()=>this.off(t,s)},onPattern(t,s){const n={glob:t.split(":"),handler:s};return Ht.push(n),()=>{const a=Ht.indexOf(n);a!==-1&&Ht.splice(a,1)}},off(t,s){vt[t]=(vt[t]||[]).filter(n=>n!==s)}};let Rn=null;function zo(){Rn=null}function Ao(){return Rn}const Io=l.createContext(null);function Ro({navigate:t,openTab:s,closeTab:n}){const a=we.getState;return{navigate:t,openTab:s,closeTab:n,getToken:()=>kt(),getProjectSpaceId:()=>qt(),emit:(r,o)=>ls.emit(r,o),on:(r,o)=>(ls.on(r,o),()=>ls.off(r,o)),getStore:()=>ee.getState(),usePlmStore:ee,useWebSocket:ks,api:q,txApi:ut,authoringApi:ra,cadApi:na,pollJobStatus:jn,getDraggedNode:Ao,clearDraggedNode:zo,getLinkRowForSource:uo,icons:{NODE_ICONS:ft,SignIcon:dn},components:{LifecycleDiagram:Na},http:{serviceRequest:(r,o,i,c)=>sa(r,o,i,c),serviceUpload:(r,o,i,c)=>Zt(`/api/${r}${o}`,"POST",{Authorization:`Bearer ${kt()}`,"X-PLM-ProjectSpace":qt()||""},i,c)},store:{registerSlice(r,o){ee.setState(i=>({_slices:{...i._slices,[r]:o.state??{}},_sliceActions:{...i._sliceActions,[r]:o.actions??{}}}))},getSlice:r=>{var o;return(o=ee.getState()._slices)==null?void 0:o[r]},useSlice:r=>ee(o=>{var i;return(i=o._slices)==null?void 0:i[r]}),dispatch(r,o,...i){var u,p;const c=(p=(u=ee.getState()._sliceActions)==null?void 0:u[r])==null?void 0:p[o];c&&c(ee.setState,ee.getState,...i)}},console:{addTab:(r,o,i)=>a().addConsoleTab(r,o,i),removeTab:r=>a().removeConsoleTab(r),log:(r,o)=>a().appendLog(r,o)},status:{register:(r,o,i)=>a().registerStatus(r,o,i),unregister:r=>a().unregisterStatus(r)},collab:{addTab:(r,o,i)=>a().addCollabTab(r,o,i),removeTab:r=>a().removeCollabTab(r)}}}async function $o(t){const s=await q.getUiManifest();return(await Promise.allSettled(s.map(async a=>{const o=(await import(a.url)).default;if(!(o!=null&&o.id))throw new Error(`Plugin at ${a.url} has no id`);if(o.init&&o.init(t),Ta(o),o.zone==="nav"&&o.match&&o.NavRow&&(Ks(o.match.serviceCode,o.match.itemCode,{NavRow:o.NavRow,ChildRow:o.ChildRow??null,hasItemChildren:o.hasItemChildren??(()=>!1),fetchChildren:o.fetchChildren??null,LinkRow:o.LinkRow??null}),o.linkSources&&o.LinkRow))for(const i of o.linkSources)Ks(i,null,{LinkRow:o.LinkRow})}))).map((a,r)=>{var o,i,c;return a.status==="rejected"?`${((o=s[r])==null?void 0:o.pluginId)??((i=s[r])==null?void 0:i.url)}: ${((c=a.reason)==null?void 0:c.message)??a.reason}`:null}).filter(Boolean)}const Qs=50,Po=8;function Lo({jobData:t,onClose:s}){const{job:n,results:a=[]}=t,r=n.status==="DONE"||n.status==="FAILED",o=a.reduce((c,u)=>(c[u.action]=(c[u.action]||0)+1,c),{}),i=c=>c==="CREATED"?"var(--success)":c==="UPDATED"?"var(--accent)":c==="REJECTED"?"var(--danger)":"var(--muted)";return e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:14},children:[e.jsx("span",{style:{fontSize:18},children:n.status==="DONE"?"✓":n.status==="FAILED"?"✕":"⏳"}),e.jsxs("span",{style:{fontWeight:600,color:n.status==="FAILED"?"var(--danger)":n.status==="DONE"?n.errorSummary?"var(--warning, #f5a623)":"var(--success)":void 0},children:[n.status==="PENDING"&&"Queued…",n.status==="RUNNING"&&"Processing…",n.status==="DONE"&&`Complete — ${a.length} node${a.length!==1?"s":""}${n.errorSummary?" (with warnings)":""}`,n.status==="FAILED"&&`Failed: ${n.errorSummary||"unknown error"}`]})]}),n.status==="DONE"&&n.errorSummary&&e.jsx("div",{style:{marginBottom:12,padding:"8px 10px",background:"var(--warning-bg, #fff8e1)",border:"1px solid var(--warning, #f5a623)",borderRadius:6,fontSize:12,color:"var(--warning-text, #7a4f00)",whiteSpace:"pre-wrap"},children:n.errorSummary}),Object.keys(o).length>0&&e.jsx("div",{style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12},children:Object.entries(o).map(([c,u])=>e.jsxs("span",{style:{fontSize:12,padding:"2px 8px",borderRadius:4,border:`1px solid ${i(c)}40`,color:i(c)},children:[c,": ",u]},c))}),a.length>0&&e.jsx("div",{style:{maxHeight:240,overflowY:"auto",border:"1px solid var(--border)",borderRadius:6,marginBottom:16},children:e.jsxs("table",{style:{width:"100%",fontSize:12,borderCollapse:"collapse"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{background:"var(--surface)",position:"sticky",top:0},children:[e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Name"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Type"}),e.jsx("th",{style:{padding:"6px 10px",textAlign:"left",fontWeight:600,borderBottom:"1px solid var(--border)"},children:"Result"})]})}),e.jsx("tbody",{children:a.map((c,u)=>e.jsxs("tr",{style:{borderTop:u>0?"1px solid var(--border)":void 0},children:[e.jsx("td",{style:{padding:"5px 10px"},children:c.name}),e.jsx("td",{style:{padding:"5px 10px",color:"var(--muted)",fontSize:11},children:c.type}),e.jsx("td",{style:{padding:"5px 10px"},children:e.jsxs("span",{style:{color:i(c.action),fontSize:11},children:[c.action,c.errorMessage?` — ${c.errorMessage}`:""]})})]},c.id||u))})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"flex-end"},children:e.jsx("button",{className:"btn btn-sm",onClick:s,children:r?"Close":"Dismiss (job continues in background)"})})]})}function en({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:a,onCreateNode:r,refreshKey:o,toast:i,panelSection:c="MAIN",basketView:u=!1,basketItems:p={}}){const x=ee(W=>W.items),g=ee(W=>W.itemsStatus),k=ee(W=>W.addToBasket),z=ee(W=>W.removeFromBasket),D=ee(W=>W.lockedByMe),$=ee(W=>W.userId);ee(W=>W.projectSpaceId);const f=l.useMemo(()=>x.filter(W=>W.list),[x]),[d,h]=l.useState({}),[w,j]=l.useState({}),[A,T]=l.useState(new Set),[O,K]=l.useState(new Set),R=l.useRef({}),[,b]=l.useState(0),[m,B]=l.useState(null),[_,Y]=l.useState(null),[y,C]=l.useState({}),[P,M]=l.useState(!1),[v,S]=l.useState(null),[L,U]=l.useState(null),F=l.useRef(null),G=l.useMemo(()=>({userId:t,activeNodeId:s,stateColorMap:n,onNavigate:a}),[t,s,n,a]),I=l.useCallback(W=>`${W.serviceCode}:${W.itemCode}:${W.itemKey||""}`,[]);l.useEffect(()=>()=>{F.current&&clearInterval(F.current)},[]),l.useEffect(()=>{f.length!==0&&(T(new Set(f.map(I))),f.forEach(W=>E(W,0).catch(()=>null)))},[f,o]),l.useEffect(()=>{if(s){for(const[W,J]of Object.entries(d))if(((J==null?void 0:J.items)||[]).some(ae=>(ae.id||ae.ID)===s)){T(ae=>new Set([...ae,W]));return}}},[s,d]);async function E(W,J){const ae=I(W);j(X=>({...X,[ae]:!0}));try{const X=await q.fetchListableItems(t,W,J,Qs);h(se=>{const ce=se[ae],xe=J===0||!ce?X:{...X,items:[...ce.items||[],...X.items||[]]};return{...se,[ae]:xe}})}catch{h(X=>({...X,[ae]:{items:[],totalElements:0,page:0,size:Qs}}))}finally{j(X=>({...X,[ae]:!1}))}}function H(W){const J=I(W);T(ae=>{const X=new Set(ae);return X.has(J)?X.delete(J):(X.add(J),!d[J]&&!w[J]&&E(W,0)),X})}function ie(W){const J=I(W),ae=d[J];if(!ae||w[J])return;const X=(ae.page??0)+1;X>=(ae.totalPages??0)||E(W,X)}const re=l.useCallback(async(W,J,ae,X)=>{X&&X.stopPropagation(),K(xe=>{const Q=new Set(xe);return Q.has(W)?Q.delete(W):Q.add(W),Q});const se=J.id||J.ID;if(R.current[se]!==void 0)return;const ce=fs(ae);if(!ce.fetchChildren){R.current[se]=[];return}R.current[se]="loading",b(xe=>xe+1);try{const xe=await ce.fetchChildren(J,G);R.current[se]=Array.isArray(xe)?xe:[]}catch{R.current[se]=[]}b(xe=>xe+1)},[G]);function ue(W,J,ae,X,se,ce){if(se>Po)return null;const xe=ae.id||ae.ID||X,Q=R.current[xe];return!Array.isArray(Q)||Q.length===0||!W.ChildRow?null:Q.map(te=>{const me=te.targetNodeId||te.id||te.ID,ve=`${X}/${te.linkId||me}`,Ce=!ce.has(me)&&O.has(ve);return e.jsxs(Be.Fragment,{children:[e.jsx(W.ChildRow,{link:te,child:te,depth:se,parentPath:ve,ancestorIds:ce,ctx:G,childCacheRef:R,expandedPaths:O,toggleNodeChildren:($e,Re,Ae)=>re($e,{id:Re},J,Ae)}),Ce&&ue(W,J,{id:me},ve,se+1,new Set([...ce,me]))]},ve)})}const he=l.useMemo(()=>{const W=String(c||"MAIN").toUpperCase(),J=f.filter(se=>String(se.panelSection||"MAIN").toUpperCase()===W),ae=new Map;for(const se of J){const ce=se.serviceCode||"_unknown";ae.has(ce)||ae.set(ce,[]),ae.get(ce).push(se)}const X=[];for(const[se,ce]of ae.entries()){ce.sort((te,me)=>(me.priority??100)-(te.priority??100));const xe=ce.reduce((te,me)=>Math.max(te,me.priority??100),0),Q=ce[0].sourceLabel||se;X.push({serviceCode:se,label:Q,maxPriority:xe,descriptors:ce})}return X.sort((se,ce)=>ce.maxPriority-se.maxPriority),X},[f,c]);async function ke(){if(!m||!_)return;const{descriptor:W,action:J}=m,ae=`/api/${W.serviceCode}${J.path}`,X=new FormData;X.append("file",_),(J.parameters||[]).forEach(Q=>{const te=y[Q.name];te!=null&&te!==""&&X.append(Q.name,te)});const se={},ce=kt(),xe=qt();ce&&(se.Authorization=`Bearer ${ce}`),xe&&(se["X-PLM-ProjectSpace"]=xe),M(!0),S(0);try{const Q=await Zt(ae,"POST",se,X,me=>S(me));if(!Q.ok){const me=await Q.json().catch(()=>({}));throw new Error(me.error||me.message||`HTTP ${Q.status}`)}const te=await Q.json().catch(()=>null);if(B(null),S(null),te!=null&&te.jobId&&J.jobStatusPath){const me=J.jobStatusPath.replace("{jobId}",te.jobId);U({id:te.jobId,data:{job:{id:te.jobId,status:te.status||"PENDING"},results:[]}}),F.current&&clearInterval(F.current),F.current=setInterval(async()=>{var ve,Te,Ce;try{const $e=await jn(W.serviceCode,me);U(Re=>Re?{...Re,data:$e}:null),(((ve=$e.job)==null?void 0:ve.status)==="DONE"||((Te=$e.job)==null?void 0:Te.status)==="FAILED")&&(clearInterval(F.current),F.current=null,((Ce=$e.job)==null?void 0:Ce.status)==="DONE"&&E(W,0))}catch{}},2e3)}else i==null||i(`${_.name} imported`,"success"),E(W,0)}catch(Q){B(null),S(null),i==null||i(Q,"error")}finally{M(!1)}}return g!=="loaded"&&c==="MAIN"?e.jsx("div",{className:"panel-empty",children:"Loading…"}):he.length===0?null:e.jsxs(e.Fragment,{children:[m&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:W=>{W.target===W.currentTarget&&!P&&B(null)},children:e.jsxs("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:360,maxWidth:"90vw",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("span",{style:{fontWeight:600,fontSize:13},children:m.action.name}),e.jsx("button",{className:"panel-icon-btn",onClick:()=>!P&&B(null),disabled:P,children:e.jsx(jt,{size:14})})]}),m.action.description&&e.jsx("p",{style:{fontSize:12,color:"var(--muted)",marginBottom:12,marginTop:0},children:m.action.description}),v!==null&&e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--muted)",marginBottom:6},children:[e.jsx("span",{children:"Uploading…"}),e.jsxs("span",{children:[v,"%"]})]}),e.jsx("div",{style:{height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${v}%`,background:"var(--accent)",borderRadius:3,transition:"width 0.15s ease"}})})]}),e.jsx("input",{type:"file",accept:m.action.acceptedTypes||void 0,disabled:P,onChange:W=>{var J;return Y(((J=W.target.files)==null?void 0:J[0])??null)},style:{width:"100%",marginBottom:14,fontSize:12}}),_&&e.jsxs("div",{style:{fontSize:11,color:"var(--muted)",marginBottom:12},children:[_.name," (",(_.size/1024).toFixed(1)," KB)"]}),(m.action.parameters||[]).map(W=>e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("label",{style:{display:"block",fontSize:11,color:"var(--muted)",marginBottom:4},children:[W.label,W.required?" *":""]}),W.widgetType==="DROPDOWN"&&W.allowedValues?e.jsx("select",{disabled:P,value:y[W.name]??(W.defaultValue||""),onChange:J=>C(ae=>({...ae,[W.name]:J.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)"},children:JSON.parse(W.allowedValues).map(J=>e.jsx("option",{value:J.value,children:J.label},J.value))}):e.jsx("input",{type:"text",disabled:P,value:y[W.name]??(W.defaultValue||""),onChange:J=>C(ae=>({...ae,[W.name]:J.target.value})),style:{width:"100%",fontSize:12,padding:"4px 6px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:4,color:"var(--text)",boxSizing:"border-box"}}),W.tooltip&&e.jsx("div",{style:{fontSize:10,color:"var(--muted)",marginTop:2},children:W.tooltip})]},W.name)),e.jsxs("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:[e.jsx("button",{className:"btn btn-ghost",onClick:()=>!P&&B(null),disabled:P,children:"Cancel"}),e.jsx("button",{className:"btn btn-primary",onClick:ke,disabled:!_||P,children:P?"Importing…":"Import"})]})]})}),L&&e.jsx("div",{style:{position:"fixed",inset:0,zIndex:901,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"},onClick:W=>{W.target===W.currentTarget&&U(null)},children:e.jsx("div",{style:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"20px 24px",width:480,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 8px 32px rgba(0,0,0,.3)"},onClick:W=>W.stopPropagation(),children:e.jsx(Lo,{jobData:L.data,onClose:()=>U(null)})})}),he.map(({serviceCode:W,label:J,descriptors:ae})=>e.jsxs("div",{className:"panel-section",style:{flex:"0 0 auto",minHeight:0},children:[e.jsx("div",{className:"panel-section-header",children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(bs,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsx("span",{className:"panel-label",children:J})]})}),e.jsx("div",{className:"node-list",children:ae.map(X=>{var Re;const se=I(X),ce=A.has(se),xe=!!w[se],Q=d[se],te=(Q==null?void 0:Q.items)||[],me=(Q==null?void 0:Q.totalElements)??te.length,ve=X.icon?ft[X.icon]:null,Te=Q&&(Q.totalPages??0)>(Q.page??0)+1,Ce=fs(X),$e=Ce.NavRow;return e.jsxs("div",{children:[e.jsxs("div",{className:"type-group-hd",onClick:()=>H(X),children:[e.jsx("span",{className:"type-chevron",children:ce?e.jsx(Ke,{size:11,strokeWidth:2.5,color:"var(--muted)"}):e.jsx(Ge,{size:11,strokeWidth:2.5,color:"var(--muted)"})}),ve?e.jsx(ve,{size:11,color:X.color||"var(--muted)",strokeWidth:2,style:{flexShrink:0}}):X.color?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:X.color,flexShrink:0}}):null,e.jsx("span",{className:"type-group-name",title:X.description||void 0,children:X.displayName}),e.jsx("span",{className:"type-group-count",children:xe&&te.length===0?"…":me}),X.create&&r&&e.jsx("button",{className:"type-group-create-btn",title:`Create ${X.displayName}`,onClick:Ae=>{Ae.stopPropagation(),r(X)},children:e.jsx(We,{size:10,strokeWidth:2.5})}),((Re=X.importActions)==null?void 0:Re.length)>0&&e.jsx("button",{className:"type-group-create-btn",title:X.importActions[0].name||`Import ${X.displayName}`,onClick:Ae=>{Ae.stopPropagation(),Y(null),C({}),B({descriptor:X,action:X.importActions[0]})},children:e.jsx(Nr,{size:10,strokeWidth:2.5})})]}),ce&&e.jsxs(e.Fragment,{children:[xe&&te.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Loading…"}),!xe&&te.length===0&&e.jsx("div",{className:"panel-empty",style:{fontSize:10},children:"Empty"}),te.length>0&&te.map(Ae=>{const Ie=Ae.id||Ae.ID,lt=Object.values(p).some(Me=>Me.has(Ie));if(u&&!lt)return null;const ct=X.serviceCode==="psm"&&D.has(Ie),Ue=`${se}/${Ie}`,nt=O.has(Ue),Xe=R.current[Ie]==="loading",Qe=Ce.hasItemChildren?Ce.hasItemChildren(Ae):!1;return e.jsxs(Be.Fragment,{children:[$e&&e.jsx($e,{descriptor:X,item:Ae,ctx:G,isActive:Ie===s,hasChildren:Qe,isExpanded:nt,isLoading:Xe,onToggleChildren:Me=>re(Ue,Ae,X,Me),isPinned:lt,onPin:()=>k($,X.serviceCode,X.itemKey||X.itemCode,Ie),onUnpin:ct?null:()=>z($,X.serviceCode,X.itemKey||X.itemCode,Ie)}),nt&&ue(Ce,X,Ae,Ue,1,new Set([Ie]))]},Ie)}),Te&&e.jsx("div",{className:"panel-empty",style:{fontSize:10,cursor:"pointer",color:"var(--muted2)"},onClick:()=>ie(X),children:xe?"Loading…":`Load more (${me-te.length} remaining)`})]})]},se)})})]},W))]})}const tn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}};function Do({nodeTypes:t,tx:s,txNodes:n,userId:a,activeNodeId:r,stateColorMap:o,onNavigate:i,canCreateNode:c,onCreateNode:u,onCommit:p,onRollback:x,onReleaseNode:g,showSettings:k,activeSettingsSection:z,onSettingsSectionChange:D,settingsSections:$,isDashboardOpen:f,onOpenDashboard:d,browseRefreshKey:h,style:w,toast:j}){const[A,T]=l.useState(null),O=ee(m=>m.basketItems),K=(s==null?void 0:s.ID)||(s==null?void 0:s.id),R=n||[],b=Be.useMemo(()=>{const m=new Map;return(t||[]).forEach(B=>{const _=B.id||B.ID;m.set(_,{name:B.name||B.NAME||_,color:B.color||B.COLOR||null,icon:B.icon||B.ICON||null})}),m},[t]);return e.jsx("aside",{className:"left-panel",style:w,children:k?e.jsx("div",{className:"settings-section-nav",children:($||[]).map(m=>e.jsxs("div",{children:[e.jsx("div",{className:"settings-nav-group-label",children:m.groupLabel}),m.sections.map(({key:B,label:_,icon:Y})=>{const y=Y?ca[Y]:null;return e.jsxs("div",{className:`settings-nav-item${z===B?" active":""}`,onClick:()=>D(B),children:[y&&e.jsx(y,{size:13,strokeWidth:1.8,color:z===B?"var(--accent)":"var(--muted)"}),_]},B)})]},m.groupKey))}):e.jsxs(e.Fragment,{children:[!f&&e.jsxs("button",{className:"panel-dash-btn",onClick:d,title:"Open dashboard",children:[e.jsx("span",{style:{opacity:.7,lineHeight:1},children:"⬡"}),"Dashboard"]}),c&&e.jsxs("div",{className:"panel-section-header",style:{flex:"0 0 auto"},children:[e.jsx("div",{style:{flex:1}}),e.jsx("button",{className:"panel-icon-btn",title:"Create new object",onClick:()=>u(),children:e.jsx(We,{size:13,color:"var(--accent)",strokeWidth:2.5})})]}),e.jsx("div",{style:{flex:1,minHeight:0,overflowY:"auto",display:"flex",flexDirection:"column"},children:e.jsx(en,{userId:a,activeNodeId:r,stateColorMap:o,onNavigate:i,onCreateNode:u,refreshKey:h,panelSection:"MAIN",toast:j,basketView:!0,basketItems:O})}),e.jsx(en,{userId:a,activeNodeId:r,stateColorMap:o,onNavigate:i,refreshKey:h,panelSection:"INFO",toast:j}),e.jsxs("div",{className:"panel-section tx-panel",children:[e.jsxs("div",{className:"panel-section-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx(Is,{size:12,color:"var(--muted)",strokeWidth:2}),e.jsxs("span",{className:"panel-label",children:["Transaction",K&&e.jsxs("span",{className:"tx-id-badge",children:[K.slice(0,8),"…"]})]})]}),R.length>0&&e.jsx("span",{className:"tx-count-badge",children:R.length})]}),e.jsx("div",{className:"tx-list",children:K?R.length===0?e.jsxs("div",{className:"panel-empty",children:["Transaction open —",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"no objects checked out yet."})]}):R.map((m,B)=>{const _=m.node_id||m.NODE_ID,Y=m.logical_id||m.LOGICAL_ID||"",y=m.node_type_name||m.NODE_TYPE_NAME||"",C=m.node_type_id||m.NODE_TYPE_ID||"",P=m.revision||m.REVISION||"A",M=m.iteration??m.ITERATION??1,v=(m.change_type||m.CHANGE_TYPE||"CONTENT").toUpperCase(),S=m.lifecycle_state_id||m.LIFECYCLE_STATE_ID||"",L=tn[v]||tn.CONTENT,U=_===r,F=A===_,G=b.get(C),I=(G==null?void 0:G.color)||null,E=G!=null&&G.icon?ft[G.icon]:null;return F?e.jsxs("div",{className:"tx-item tx-item-confirm",onClick:H=>H.stopPropagation(),children:[e.jsx("span",{className:"tx-type-icon",children:E?e.jsx(E,{size:11,color:I||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:I||"var(--muted2)",display:"inline-block"}})}),e.jsxs("span",{className:"tx-confirm-msg",children:["Release ",Y||_,"?"]}),e.jsx("button",{className:"btn btn-danger btn-xs",onClick:()=>{g&&g(_),T(null)},children:"Yes"}),e.jsx("button",{className:"btn btn-xs",onClick:()=>T(null),children:"No"})]},B):e.jsxs("div",{className:`tx-item${U?" active":""}`,onClick:()=>i(_,Y||void 0,Bt),title:y,children:[e.jsx("span",{className:"tx-type-icon",children:E?e.jsx(E,{size:11,color:I||"var(--muted2)",strokeWidth:2}):I?e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:I,display:"inline-block"}}):e.jsx("span",{style:{width:7,height:7,borderRadius:1,background:"var(--muted2)",display:"inline-block"}})}),e.jsx("span",{className:"tx-logical",children:Y||_}),e.jsx("span",{className:"tx-reviter",style:{color:(o==null?void 0:o[S])||"var(--muted2)"},children:M===0?P:`${P}.${M}`}),e.jsx("span",{className:"tx-ct-badge",style:{background:L.bg,color:L.color},children:L.label}),e.jsx("button",{className:"tx-release-btn",title:"Release from transaction",onClick:H=>{H.stopPropagation(),T(_)},children:e.jsx(Cr,{size:12,strokeWidth:2,color:"var(--muted)"})})]},B)}):e.jsxs("div",{className:"panel-empty",children:["No active transaction.",e.jsx("br",{}),e.jsx("span",{style:{fontSize:10,color:"var(--muted2)"},children:"Checkout an object to begin."})]})}),K&&e.jsxs("div",{className:"tx-actions",children:[e.jsxs("button",{className:"btn btn-success btn-sm",style:{flex:1},onClick:p,children:[e.jsx(Is,{size:12,strokeWidth:2}),"Commit"]}),e.jsxs("button",{className:"btn btn-danger btn-sm",onClick:x,children:[e.jsx(Er,{size:12,strokeWidth:2}),"Rollback"]})]})]})]})})}const Bo=Be.memo(Do);function Mo(t){return e.jsx(Bo,{...t})}const sn={CONTENT:{label:"edit",bg:"rgba(106,172,255,.15)",color:"var(--accent)"},LIFECYCLE:{label:"state",bg:"rgba(77,212,160,.15)",color:"var(--success)"},SIGNATURE:{label:"sign",bg:"rgba(240,180,41,.15)",color:"var(--warn)"}},Oo={PRIMARY:"var(--accent)",SECONDARY:"var(--muted)",DANGEROUS:"var(--danger)"};function $n({revision:t,iteration:s}){const n=s===0?t:`${t}.${s}`;return e.jsx("span",{className:"dash-rev",children:n})}function Pn({lifecycleStateId:t,stateColorMap:s}){const n=(s==null?void 0:s[t])||"#6b7280";return e.jsx("span",{className:"dash-state-dot",style:{background:n},title:t})}function Ln({nodeTypeId:t,nodeTypeName:s,nodeTypes:n}){const a=(n||[]).find(c=>(c.id||c.ID)===t),r=(a==null?void 0:a.color)||(a==null?void 0:a.COLOR)||null,o=(a==null?void 0:a.icon)||(a==null?void 0:a.ICON)||null,i=o?ft[o]:null;return e.jsxs("span",{className:"dash-type-chip",children:[i?e.jsx(i,{size:9,color:r||"var(--muted2)",strokeWidth:2}):r?e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:r,display:"inline-block",flexShrink:0}}):null,e.jsx("span",{style:{color:"var(--muted2)"},children:s||t})]})}function _o({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}){var g,k,z,D;const[r,o]=l.useState(void 0),[i,c]=l.useState(!0),[u,p]=l.useState(null),x=l.useCallback(async()=>{c(!0),p(null);try{const $=await q.getDashboardTransaction(t);o($||null)}catch($){p($.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{x()},[x]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Open transaction"}),e.jsx("button",{className:"dash-refresh-btn",onClick:x,title:"Refresh",disabled:i,children:e.jsx("span",{style:{display:"inline-block",transform:"none"},children:"⟳"})})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),u&&e.jsx("div",{className:"dash-error",children:u}),!i&&!u&&!r&&e.jsx("div",{className:"dash-empty",children:"No open transaction"}),!i&&!u&&r&&e.jsxs("div",{className:"dash-tx-card",children:[e.jsxs("div",{className:"dash-tx-header",children:[e.jsxs("span",{className:"dash-tx-id",children:[(g=r.txId)==null?void 0:g.slice(0,8),"…"]}),e.jsx("span",{className:"dash-tx-title",children:r.title}),e.jsxs("span",{className:"dash-tx-count",children:[((k=r.nodes)==null?void 0:k.length)||0," object",((z=r.nodes)==null?void 0:z.length)!==1?"s":""]})]}),((D=r.nodes)==null?void 0:D.length)>0&&e.jsx("div",{className:"dash-tx-nodes",children:r.nodes.map($=>{const f=sn[($.changeType||"CONTENT").toUpperCase()]||sn.CONTENT;return e.jsxs("button",{className:"dash-tx-node",onClick:()=>a($.nodeId,$.logicalId||$.nodeId,Bt),children:[e.jsx(Pn,{lifecycleStateId:$.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:$.logicalId||$.nodeId}),e.jsx($n,{revision:$.revision,iteration:$.iteration}),e.jsx(Ln,{nodeTypeId:$.nodeTypeId,nodeTypeName:$.nodeTypeName,nodeTypes:n}),e.jsx("span",{className:"dash-badge",style:{background:f.bg,color:f.color},children:f.label})]},$.nodeId)})})]})]})}function Wo({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}){const[r,o]=l.useState(null),[i,c]=l.useState(!0),[u,p]=l.useState(null),x=l.useCallback(async()=>{c(!0),p(null);try{const g=await q.getDashboardWorkItems(t);o(Array.isArray(g)?g:[])}catch(g){p(g.message||"Error")}finally{c(!1)}},[t]);return l.useEffect(()=>{x()},[x]),e.jsxs("section",{className:"dash-section",children:[e.jsxs("div",{className:"dash-section-hd",children:[e.jsx("span",{className:"dash-section-title",children:"Objects you can work on"}),e.jsx("span",{className:"dash-section-hint",children:"last 10 · sorted by available actions"}),e.jsx("button",{className:"dash-refresh-btn",onClick:x,title:"Refresh",disabled:i,children:"⟳"})]}),i&&e.jsx("div",{className:"dash-loading",children:"Loading…"}),u&&e.jsx("div",{className:"dash-error",children:u}),!i&&!u&&(r==null?void 0:r.length)===0&&e.jsx("div",{className:"dash-empty",children:"No actionable objects found"}),!i&&!u&&(r==null?void 0:r.length)>0&&e.jsx("div",{className:"dash-work-list",children:r.map(g=>e.jsxs("button",{className:"dash-work-item",onClick:()=>a(g.nodeId,g.logicalId||g.nodeId,Bt),children:[e.jsxs("div",{className:"dash-work-row",children:[e.jsx(Pn,{lifecycleStateId:g.lifecycleStateId,stateColorMap:s}),e.jsx("span",{className:"dash-node-lid",children:g.logicalId||g.nodeId}),e.jsx($n,{revision:g.revision,iteration:g.iteration}),e.jsx(Ln,{nodeTypeId:g.nodeTypeId,nodeTypeName:g.nodeTypeName,nodeTypes:n})]}),e.jsx("div",{className:"dash-action-chips",children:g.actions.map(k=>{var $,f;const z=(($=k.guardViolations)==null?void 0:$.length)>0,D=z?"Blocked: "+k.guardViolations.map(d=>d.message||d.code).join("; "):k.description||k.label;return e.jsx("span",{className:"dash-action-chip",title:D,style:{color:Oo[(f=k.metadata)==null?void 0:f.displayCategory]||"var(--muted)",opacity:z?.45:1},children:k.label},k.code)})})]},g.nodeId))})]})}function Go({userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}){return e.jsxs("div",{className:"dashboard",children:[e.jsxs("div",{className:"dash-hero",children:[e.jsx("span",{className:"dash-hero-icon",children:"⬡"}),e.jsxs("div",{children:[e.jsx("div",{className:"dash-hero-title",children:"Dashboard"}),e.jsx("div",{className:"dash-hero-sub",children:"Quick overview of your work session"})]})]}),e.jsxs("div",{className:"dash-body",children:[e.jsx(_o,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a}),e.jsx(Wo,{userId:t,stateColorMap:s,nodeTypes:n,onNavigate:a})]})]})}function Uo({tabs:t,activeTabId:s,userId:n,tx:a,toast:r,nodeTypes:o,stateColorMap:i,onTabActivate:c,onTabClose:u,onTabPin:p,onSubTabChange:x,onNavigate:g,onAutoOpenTx:k,onDescriptionLoaded:z,onRefreshItemData:D,onOpenCommentsForVersion:$,onCommentAttribute:f,tabItemData:d}){const h=we(G=>G.showCollab),w=we(G=>G.toggleCollab),j="dashboard",A=t.find(G=>G.id===s),T=!!(A!=null&&A.nodeId),[O,K]=l.useState({}),R=l.useRef(null),b=l.useRef({});l.useEffect(()=>{var I,E;const G=new Set(t.map(H=>H.id));K(H=>Object.fromEntries(Object.entries(H).filter(([ie])=>G.has(ie))));for(const H of Object.keys(b.current))G.has(H)||((E=(I=b.current)[H])==null||E.call(I),delete b.current[H])},[t]),l.useEffect(()=>()=>{var G,I;s&&((I=(G=b.current)[s])==null||I.call(G),delete b.current[s])},[s]);const m=s?O[s]??{data:null,closed:!1,maximized:!1,splitPos:50}:null;function B(G){s&&K(I=>({...I,[s]:{closed:!1,maximized:!1,splitPos:50,...I[s],...G}}))}function _(G){s&&K(I=>({...I,[s]:{closed:!1,maximized:!1,splitPos:50,...I[s],data:G}}))}function Y(G){var I,E;s&&((E=(I=b.current)[s])==null||E.call(I),b.current[s]=G)}function y(G){G.preventDefault();const I=R.current;if(!I)return;function E(ie){const re=I.getBoundingClientRect();B({splitPos:Math.max(20,Math.min(80,(ie.clientX-re.left)/re.width*100))})}function H(){window.removeEventListener("mousemove",E),window.removeEventListener("mouseup",H)}window.addEventListener("mousemove",E),window.addEventListener("mouseup",H)}const C=A&&A.id!==j?po(A):null,P=A&&A.id!==j?za(A)??C:null,M=(C==null?void 0:C.Preview)??null,v=(C==null?void 0:C.previewLabel)??"Preview",S=!!M,L=(m==null?void 0:m.closed)??!1,U=(m==null?void 0:m.maximized)??!1,F=(m==null?void 0:m.splitPos)??50;return e.jsx("div",{className:"editor-area",children:e.jsxs("div",{className:"editor-main",children:[e.jsxs("div",{className:"tab-bar",children:[t.length===0?e.jsx("div",{className:"tab-bar-empty",children:"Open an object from the navigation panel"}):t.map(G=>{var ue;const I=G.id===j,E=G.nodeTypeId?(o||[]).find(he=>(he.id||he.ID)===G.nodeTypeId):null,H=(E==null?void 0:E.color)||(E==null?void 0:E.COLOR)||null,ie=(E==null?void 0:E.icon)||(E==null?void 0:E.ICON)||null,re=ie?ft[ie]:null;return e.jsxs("div",{className:`editor-tab ${G.id===s?"active":""}`,onClick:()=>c(G.id),children:[I&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0,opacity:.6},children:"⬡"}),!I&&(re||H)&&e.jsx("span",{style:{display:"inline-flex",alignItems:"center",marginRight:4,flexShrink:0},children:re?e.jsx(re,{size:10,color:H||"var(--muted2)",strokeWidth:2}):e.jsx("span",{style:{width:6,height:6,borderRadius:1,background:H,display:"inline-block"}})}),e.jsx("span",{className:"tab-node-id",children:G.label||((ue=G.nodeId)==null?void 0:ue.slice(0,10))+"…"}),e.jsx("button",{className:`tab-pin ${G.pinned?"active":""}`,title:G.pinned?"Unpin tab":"Pin tab",onClick:he=>{he.stopPropagation(),p(G.id)},children:G.pinned?e.jsx(Dt,{size:11,color:"var(--accent)",strokeWidth:2}):e.jsx(Nt,{size:11,color:"var(--muted)",strokeWidth:2})}),e.jsx("button",{className:"tab-close",title:"Close tab",onClick:he=>{he.stopPropagation(),u(G.id)},children:e.jsx(jt,{size:11,color:"var(--muted)",strokeWidth:2.5})})]},G.id)}),t.length>0&&e.jsx("div",{className:"tab-add",title:"Pin a tab or navigate to open a new one",children:e.jsx(We,{size:13,color:"var(--muted)",strokeWidth:2})}),T&&e.jsx("button",{className:`tab-comments-toggle${h?" active":""}`,onClick:w,title:h?"Hide comments":"Show comments",children:"💬"})]}),e.jsxs("div",{ref:R,style:{flex:1,display:"flex",overflow:"hidden",minHeight:0},children:[e.jsx("div",{className:"editor-content",style:S?{width:L?"calc(100% - 28px)":U?0:`${F}%`,flex:"none",overflow:U?"hidden":void 0,transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"}:void 0,children:A?A.id===j?e.jsx(Go,{userId:n,stateColorMap:i,nodeTypes:o,onNavigate:g}):(()=>{const G=(P==null?void 0:P.Editor)??(P==null?void 0:P.Component),I={userId:n,tx:a,nodeTypes:o,stateColorMap:i,toast:r,onAutoOpenTx:k,onDescriptionLoaded:z,onRefreshItemData:D,onOpenCommentsForVersion:$,onCommentAttribute:f,onSubTabChange:x,onNavigate:g,onRegisterPreview:_,onRegisterCancel:Y,itemData:d};return G?e.jsx(G,{tab:A,ctx:I}):e.jsx("div",{className:"editor-empty",children:e.jsx("div",{className:"editor-empty-text",children:"Loading editor…"})})})():e.jsxs("div",{className:"editor-empty",children:[e.jsx("div",{className:"editor-empty-icon",children:"⬡"}),e.jsx("div",{className:"editor-empty-text",children:"No object open"}),e.jsx("div",{className:"editor-empty-hint",children:"Select an object in the navigation panel to open it here"})]})}),S&&(L?e.jsx("div",{style:{width:28,flexShrink:0,cursor:"pointer",borderLeft:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--surface)",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onClick:()=>B({closed:!1}),title:`Open ${v}`,children:e.jsxs("span",{style:{writingMode:"vertical-rl",fontSize:11,fontWeight:600,color:"var(--muted)",userSelect:"none",letterSpacing:1},children:[v," ▶"]})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{style:{width:U?0:5,cursor:"col-resize",background:"var(--border)",flexShrink:0,userSelect:"none",overflow:"hidden",transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)"},onMouseDown:U?void 0:y}),e.jsxs("div",{style:{flex:1,minWidth:0,display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 8px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--surface)",fontSize:11,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1},children:[e.jsx("span",{children:v}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:2},children:[e.jsx("button",{className:"panel-icon-btn",title:U?"Restore":`Maximize ${v}`,onClick:()=>B({maximized:!U}),children:U?e.jsx(Tr,{size:13}):e.jsx(zr,{size:13})}),e.jsx("button",{className:"panel-icon-btn",title:`Collapse ${v}`,onClick:()=>B({closed:!0}),children:e.jsx(jt,{size:13})})]})]}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(M,{data:(m==null?void 0:m.data)??null,tab:A,ctx:{userId:n,tx:a,nodeTypes:o,stateColorMap:i,toast:r,onAutoOpenTx:k,onDescriptionLoaded:z,onRefreshItemData:D,onOpenCommentsForVersion:$,onCommentAttribute:f,onSubTabChange:x,onNavigate:g,onRegisterPreview:_,itemData:d}})})]})]}))]})]})})}function Fo(t){const s=we(r=>r.openCollab),n=we(r=>r.setVersionFilter),a=we(r=>r.setTriggerText);return e.jsx(Uo,{...t,onOpenCommentsForVersion:r=>{n(r),s()},onCommentAttribute:r=>{a("#"+r+" "),s()}})}function Ho(t){const s={};t.forEach(r=>{s[r.id]={...r,children:[]}});const n=[];t.forEach(r=>{r.parentCommentId&&s[r.parentCommentId]?s[r.parentCommentId].children.push(s[r.id]):n.push(s[r.id])});function a(r){r.sort((o,i)=>new Date(o.createdAt)-new Date(i.createdAt)),r.forEach(o=>a(o.children))}return a(n),n}function Vo(t){const s=t.match(/#(\S+)/);return s?s[1]:null}function Ko(t,s){const n=t.slice(0,s);for(let a=n.length-1;a>=0;a--){const r=n[a];if(r==="#"||r==="@"){if(a===0||/\s/.test(n[a-1])){const o=n.slice(a+1);if(!/\s/.test(o))return{type:r,query:o,start:a}}return null}if(/\s/.test(r))return null}return null}function qo({text:t,attrMap:s,userMap:n}){const a=[],r=/(#\S+|@\S+)/g;let o=0,i;for(;(i=r.exec(t))!==null;){i.index>o&&a.push({kind:"text",value:t.slice(o,i.index)});const c=i[0];if(c.startsWith("#")){const u=c.slice(1),p=s[u];a.push({kind:"attr",id:u,label:p})}else{const u=c.slice(1),p=n[u];a.push({kind:"user",id:u,name:p})}o=i.index+c.length}return o<t.length&&a.push({kind:"text",value:t.slice(o)}),e.jsx("span",{children:a.map((c,u)=>c.kind==="text"?e.jsx("span",{children:c.value},u):c.kind==="attr"?e.jsxs("span",{className:"mention-chip mention-attr",title:`Attribute: ${c.id}`,children:["#",c.label||c.id]},u):e.jsxs("span",{className:"mention-chip mention-user",title:`User: ${c.id}`,children:["@",c.name||c.id]},u))})}function Xo({items:t,activeIdx:s,onSelect:n,onHover:a}){return e.jsx("ul",{className:"autocomplete-dropdown",children:t.map((r,o)=>e.jsxs("li",{className:`autocomplete-item${o===s?" active":""}`,onMouseEnter:()=>a(o),onMouseDown:i=>{i.preventDefault(),n(r)},children:[e.jsxs("span",{className:"autocomplete-item-id",children:[r.prefix,r.id]}),r.label&&e.jsx("span",{className:"autocomplete-item-label",children:r.label})]},r.id))})}function Yo({nodeId:t,userId:s,width:n,onClose:a,filterVersionId:r,onClearFilter:o,users:i,triggerText:c,onClearTrigger:u}){const[p,x]=l.useState([]),[g,k]=l.useState(""),[z,D]=l.useState(null),[$,f]=l.useState(!1),[d,h]=l.useState(null),[w,j]=l.useState(0),A=l.useRef(null),T=ee(S=>S.activeNodeDescs[t]),O=T==null?void 0:T.currentVersionId,K=l.useMemo(()=>{const S={};return((T==null?void 0:T.attributes)||[]).forEach(L=>{S[L.id]=L.label}),S},[T==null?void 0:T.attributes]),R=l.useMemo(()=>{const S={};return(i||[]).forEach(L=>{S[L.id]=L.displayName||L.username}),S},[i]),b=l.useMemo(()=>{if(!d)return[];const S=d.query.toLowerCase();return d.type==="#"?((T==null?void 0:T.attributes)||[]).filter(L=>L.id.toLowerCase().includes(S)||L.label.toLowerCase().includes(S)).slice(0,8).map(L=>({id:L.id,label:L.label,prefix:"#"})):(i||[]).filter(L=>L.id.toLowerCase().includes(S)||(L.displayName||L.username||"").toLowerCase().includes(S)).slice(0,8).map(L=>({id:L.id,label:L.displayName||L.username,prefix:"@"}))},[d,T==null?void 0:T.attributes,i]),m=l.useCallback(async()=>{if(t)try{const S=await q.getComments(s,t);x(Array.isArray(S)?S:[])}catch{}},[t,s]);l.useEffect(()=>{m()},[m]),ks(t?`/topic/nodes/${t}`:null,S=>{S.nodeId&&S.nodeId!==t||S.event==="COMMENT_ADDED"&&m()},s),l.useEffect(()=>{c&&(k(c),u==null||u(),setTimeout(()=>{const S=A.current;S&&(S.focus(),S.setSelectionRange(c.length,c.length))},50))},[c]),l.useEffect(()=>{D(null),k(""),h(null)},[t]);const B=l.useMemo(()=>Ho(p),[p]),_=l.useMemo(()=>r?B.filter(S=>S.versionId===r):B,[B,r]),Y=l.useMemo(()=>{function S(L){return L.reduce((U,F)=>U+1+S(F.children),0)}return S(_)},[_]);function y(S){const L=S.target.value,U=S.target.selectionStart;k(L);const F=Ko(L,U);h(F),j(0)}function C(S){if(!d)return;const L=g.slice(0,d.start),U=g.slice(d.start+1+d.query.length),F=S.prefix+S.id+" ",G=L+F+U;k(G),h(null),setTimeout(()=>{const I=A.current;if(I){const E=L.length+F.length;I.focus(),I.setSelectionRange(E,E)}},0)}function P(S){if(d&&b.length>0){if(S.key==="ArrowDown"){S.preventDefault(),j(L=>Math.min(L+1,b.length-1));return}if(S.key==="ArrowUp"){S.preventDefault(),j(L=>Math.max(L-1,0));return}if(S.key==="Enter"||S.key==="Tab"){S.preventDefault(),C(b[w]);return}if(S.key==="Escape"){h(null);return}}S.key==="Enter"&&S.ctrlKey&&g.trim()&&M()}async function M(){if(!(!g.trim()||!O)){f(!0);try{const S=Vo(g.trim());await q.addComment(s,t,O,g.trim(),(z==null?void 0:z.id)||null,S||null),k(""),D(null),h(null),await m()}catch{}finally{f(!1)}}}const v=T?`${T.revision??""}${T.iteration!=null?"."+T.iteration:""}`:"";return e.jsxs("div",{className:"comment-panel",style:{width:n},onClick:()=>d&&h(null),children:[e.jsxs("div",{className:"comment-panel-header",children:[e.jsxs("span",{children:["Comments",p.length>0&&e.jsx("span",{className:"comment-count-badge",children:p.length})]}),e.jsx("button",{className:"comment-close-btn",onClick:a,title:"Close",children:"✕"})]}),r&&e.jsxs("div",{className:"comment-filter-banner",children:[e.jsxs("span",{children:["Filtered: rev ",(()=>{const S=p.find(L=>L.versionId===r);return S?`${S.revision}.${S.iteration}`:r.slice(0,8)+"…"})()," · ",Y," comment",Y!==1?"s":""]}),e.jsx("button",{className:"comment-filter-clear",onClick:o,children:"Show all"})]}),e.jsx("div",{className:"comment-panel-list",children:_.length===0?e.jsx("div",{className:"comment-empty",children:r?"No comments on this version":"No comments yet"}):_.map(S=>e.jsx(Dn,{node:S,depth:0,onReply:D,activeReplyId:z==null?void 0:z.id,userId:s,attrMap:K,userMap:R},S.id))}),e.jsxs("div",{className:"comment-panel-input",onClick:S=>S.stopPropagation(),children:[O&&v&&e.jsxs("div",{className:"comment-version-context",children:["Commenting on rev ",e.jsx("strong",{children:v})]}),z&&e.jsxs("div",{className:"comment-reply-context",children:[e.jsxs("span",{children:["↩ Replying to ",e.jsx("strong",{children:z.author})]}),e.jsx("button",{className:"comment-cancel-reply",onClick:()=>D(null),children:"✕"})]}),e.jsxs("div",{className:"comment-input-wrap",children:[e.jsx("textarea",{ref:A,className:"field-input comment-textarea",rows:3,placeholder:O?"Write a comment… (# attr, @ user, Ctrl+Enter to post)":"No version available",value:g,onChange:y,onKeyDown:P,disabled:!O||$}),d&&b.length>0&&e.jsx(Xo,{items:b,activeIdx:w,onSelect:C,onHover:j})]}),e.jsx("button",{className:"btn btn-sm btn-success comment-post-btn",disabled:!g.trim()||!O||$,onClick:M,children:z?"↩ Post reply":"Post comment"})]})]})}const Jo=72,Zo=16;function Dn({node:t,depth:s,onReply:n,activeReplyId:a,userId:r,attrMap:o,userMap:i}){const c=Math.min(s*Zo,Jo),u=a===t.id;return e.jsxs("div",{style:{marginLeft:s>0?c:0},children:[e.jsx(Qo,{comment:t,onReply:n,isReply:s>0,isHighlighted:u,isOwn:t.author===r,attrMap:o,userMap:i}),t.children.length>0&&e.jsx("div",{className:"comment-children",style:{borderLeft:"2px solid var(--border2)",marginLeft:10},children:t.children.map(p=>e.jsx(Dn,{node:p,depth:s+1,onReply:n,activeReplyId:a,userId:r,attrMap:o,userMap:i},p.id))})]})}function Qo({comment:t,onReply:s,isReply:n,isHighlighted:a,isOwn:r,attrMap:o,userMap:i}){const c=t.createdAt?new Date(t.createdAt).toLocaleString(void 0,{dateStyle:"short",timeStyle:"short"}):"",u=["comment-item",n?"comment-reply":"",a?"comment-highlighted":"",r?"comment-own":""].filter(Boolean).join(" ");return e.jsxs("div",{className:u,children:[e.jsxs("div",{className:"comment-meta",children:[e.jsxs("span",{className:r?"comment-author comment-author-own":"comment-author",children:[t.author,r&&e.jsx("span",{className:"comment-you-badge",children:"you"})]}),t.attributeName&&e.jsxs("span",{className:"comment-attr-badge",title:`Attribute: ${t.attributeName}`,children:["#",o[t.attributeName]||t.attributeName]}),e.jsxs("span",{className:"comment-version",title:`Version ID: ${t.versionId}`,children:[t.revision,".",t.iteration]}),e.jsx("span",{className:"comment-time",children:c})]}),e.jsx("div",{className:"comment-text",children:e.jsx(qo,{text:t.text,attrMap:o,userMap:i})}),e.jsx("button",{className:"comment-reply-btn",onClick:()=>s({id:t.id,author:t.author}),children:"↩ Reply"})]})}function ei({activeNodeId:t,userId:s,users:n}){const a=we(z=>z.showCollab),r=we(z=>z.collabWidth),o=we(z=>z.setCollabWidth),i=we(z=>z.closeCollab),c=we(z=>z.collabVersionFilter),u=we(z=>z.setVersionFilter),p=we(z=>z.collabTriggerText),x=we(z=>z.clearTriggerText),g=we(z=>z.collabTabs),k=l.useCallback(z=>{const D=z.clientX,$=r;function f(h){o(Math.max(240,Math.min(560,$+D-h.clientX)))}function d(){document.removeEventListener("mousemove",f),document.removeEventListener("mouseup",d)}document.addEventListener("mousemove",f),document.addEventListener("mouseup",d)},[r,o]);return!a||!t?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"resize-handle comment-resize",onMouseDown:k}),e.jsx(Yo,{nodeId:t,userId:s,width:r,onClose:i,filterVersionId:c,onClearFilter:()=>u(null),users:n,triggerText:p,onClearTrigger:x}),g.map(z=>e.jsx("div",{style:{display:"none"}},z.id))]})}const ti={error:"var(--danger, #fc8181)",warn:"var(--warning, #f0b429)",info:"var(--muted)",debug:"var(--muted2)"};function si(t){return new Date(t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function nn(){const t=we(n=>n.consoleLog),s=l.useRef(null);return l.useEffect(()=>{var n;(n=s.current)==null||n.scrollIntoView({behavior:"smooth"})},[t.length]),t.length===0?e.jsx("div",{style:{padding:"16px",color:"var(--muted)",fontSize:12,fontStyle:"italic"},children:"No platform events yet."}):e.jsxs("div",{style:{fontFamily:"monospace",fontSize:11,overflow:"auto",height:"100%",padding:"4px 8px"},children:[t.map((n,a)=>{var r;return e.jsxs("div",{style:{display:"flex",gap:8,lineHeight:"18px"},children:[e.jsx("span",{style:{color:"var(--muted2)",flexShrink:0},children:si(n.ts)}),e.jsx("span",{style:{color:ti[n.level]??"inherit",flexShrink:0,width:40},children:(r=n.level)==null?void 0:r.toUpperCase()}),e.jsx("span",{style:{wordBreak:"break-all"},children:n.message})]},a)}),e.jsx("div",{ref:s})]})}function ni(){var p;const t=we(x=>x.consoleVisible),s=we(x=>x.consoleHeight),n=we(x=>x.setConsoleHeight),a=we(x=>x.consoleTabs),[r,o]=l.useState("console"),i=[{id:"console",label:"Console",Component:nn},...a],c=l.useCallback(x=>{x.preventDefault();const g=x.clientY,k=s;function z($){n(Math.max(80,Math.min(600,k+g-$.clientY)))}function D(){document.removeEventListener("mousemove",z),document.removeEventListener("mouseup",D)}document.addEventListener("mousemove",z),document.addEventListener("mouseup",D)},[s,n]);if(!t)return null;const u=((p=i.find(x=>x.id===r))==null?void 0:p.Component)??nn;return e.jsxs("div",{style:{height:s,flexShrink:0,display:"flex",flexDirection:"column",borderTop:"1px solid var(--border)"},children:[e.jsx("div",{style:{height:4,cursor:"row-resize",background:"var(--border)",flexShrink:0},onMouseDown:c}),e.jsx("div",{style:{display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)",background:"var(--surface)",flexShrink:0},children:i.map(x=>e.jsx("button",{onClick:()=>o(x.id),style:{padding:"4px 12px",fontSize:11,fontWeight:r===x.id?600:400,color:r===x.id?"var(--fg)":"var(--muted)",background:"none",border:"none",borderBottom:r===x.id?"2px solid var(--accent)":"2px solid transparent",cursor:"pointer"},children:x.label},x.id))}),e.jsx("div",{style:{flex:1,overflow:"hidden"},children:e.jsx(u,{})})]})}const ri=[];function ai(){return[...ri]}const cs={},oi=1e4,Vt=3e4,ii=1e3,li=(cs==null?void 0:cs.VITE_JAEGER_URL)||"http://localhost:16686",gs=100,Kt=1e3;function rn(t,s=0){if(t==null||Number.isNaN(t))return"hsl(210, 10%, 55%)";s>0&&t<Kt&&(t=Math.max(t,Kt*.75));const n=Math.max(0,Math.min(1,(t-gs)/(Kt-gs))),a=150-150*n,r=60+25*n,o=55-5*n;return`hsl(${a.toFixed(0)}, ${r.toFixed(0)}%, ${o.toFixed(0)}%)`}function an(t,s){return s===0?"IDLE":t<gs?"FAST":t<400?"OK":t<Kt?"SLOW":"BAD"}const yt={up:{dot:"#4dd4a0",label:"UP"},degraded:{dot:"#f0b429",label:"DEGRADED"},down:{dot:"#fc8181",label:"DOWN"},unknown:{dot:"#6b8099",label:"UNKNOWN"}};function ci(t){return t==null?"—":t<60?`${t}s`:t<3600?`${Math.floor(t/60)}m`:`${Math.floor(t/3600)}h`}function di(t){if(t==null)return"—";const s=Math.floor(t/3600),n=Math.floor(t%3600/60),a=t%60;return s?`${s}h ${n}m`:n?`${n}m ${a}s`:`${a}s`}function ze(t){return t==null||Number.isNaN(t)?"—":t<10?`${t.toFixed(1)}ms`:t<1e3?`${Math.round(t)}ms`:`${(t/1e3).toFixed(2)}s`}function At(t){return t==null?"—":t<1e3?String(t):t<1e6?`${(t/1e3).toFixed(1)}K`:`${(t/1e6).toFixed(1)}M`}function He(t){return t==null?"—":t<1024?`${t} B`:t<1024*1024?`${(t/1024).toFixed(1)} KB`:t<1024*1024*1024?`${(t/(1024*1024)).toFixed(1)} MB`:`${(t/(1024*1024*1024)).toFixed(2)} GB`}function Je(t){return t<100?"lat-fast":t<400?"lat-ok":t<1e3?"lat-slow":"lat-bad"}function pi({sorted:t}){if(!t||t.length<2)return e.jsx("div",{className:"perf-chart-empty",children:"Need at least 2 calls to plot distribution."});const s=600,n=90,a=34,r=6,o=8,i=18,c=s-a-r,u=n-o-i,p=t[t.length-1]||1,x=d=>a+c*d/(t.length-1),g=d=>o+u-u*d/p;let k="";for(let d=0;d<t.length;d++){const h=x(d).toFixed(1),w=g(t[d]).toFixed(1);k+=(d===0?"M":"L")+h+","+w+" "}const z=k+`L${x(t.length-1).toFixed(1)},${(o+u).toFixed(1)} L${a},${(o+u).toFixed(1)} Z`,D=[.5,.75,.9,.95,.99],$=d=>{const h=Math.min(t.length-1,Math.floor(t.length*d));return{p:d,v:t[h],x:x(h),y:g(t[h])}},f=[0,p/2,p];return e.jsxs("svg",{viewBox:`0 0 ${s} ${n}`,className:"perf-chart",preserveAspectRatio:"none",children:[f.map((d,h)=>{const w=g(d);return e.jsxs("g",{children:[e.jsx("line",{x1:a,y1:w,x2:s-r,y2:w,stroke:"var(--border)",strokeWidth:"0.5",strokeDasharray:"2,3"}),e.jsx("text",{x:a-4,y:w+3,textAnchor:"end",fontSize:"9",fill:"var(--muted2)",fontFamily:"var(--mono)",children:ze(d)})]},h)}),e.jsx("path",{d:z,fill:"rgba(106,172,255,0.18)"}),e.jsx("path",{d:k,stroke:"#6aacff",strokeWidth:"1.5",fill:"none"}),D.map(d=>{const h=$(d);return e.jsxs("g",{children:[e.jsx("line",{x1:h.x,y1:o,x2:h.x,y2:o+u,stroke:"#f0b429",strokeWidth:"0.6",strokeDasharray:"1,3",opacity:"0.65"}),e.jsx("circle",{cx:h.x,cy:h.y,r:"2",fill:"#f0b429"}),e.jsxs("text",{x:h.x,y:n-5,textAnchor:"middle",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:["p",Math.round(d*100)]})]},d)}),e.jsx("text",{x:a,y:n-5,textAnchor:"start",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p0"}),e.jsx("text",{x:s-r,y:n-5,textAnchor:"end",fontSize:"8",fill:"var(--muted2)",fontFamily:"var(--mono)",children:"p100"})]})}function mi({showSettings:t,onToggleSettings:s,consoleVisible:n,onToggleConsole:a}){const[r,o]=l.useState(null),[i,c]=l.useState(null),[u,p]=l.useState(!1),[x,g]=l.useState("services"),[k,z]=l.useState(null),[D,$]=l.useState(null),[f,d]=l.useState(Ot()),[h,w]=l.useState(()=>_t(Vt));l.useEffect(()=>{w(_t(Vt));const b=setInterval(()=>w(_t(Vt)),ii),m=Ps(()=>w(_t(Vt)));return()=>{clearInterval(b),m()}},[]);const j=l.useCallback(async()=>{try{const b=await mt.getStatus();o(b),c(null)}catch(b){c(b.message||String(b))}},[]);l.useEffect(()=>{j();const b=setInterval(j,oi);return()=>clearInterval(b)},[j]),l.useEffect(()=>u?(d(Ot()),Ps(()=>d(Ot()))):void 0,[u]);const A=l.useCallback(async()=>{try{const b=await mt.getNatsStatus();z(b),$(null)}catch(b){$(b.message||String(b))}},[]);l.useEffect(()=>{if(!u||x!=="nats")return;A();const b=setInterval(A,5e3);return()=>clearInterval(b)},[u,x,A]);const T=yo(),O=l.useMemo(()=>ai(),[]),K=i?"down":(r==null?void 0:r.overall)||"unknown",R=yt[K]||yt.unknown;return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-bar-row",children:[s&&e.jsxs("button",{type:"button",className:`status-bar-settings${t?" active":""}`,onClick:s,title:"Settings",children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"3"}),e.jsx("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]}),e.jsx("span",{children:"Settings"})]}),a&&e.jsxs("button",{type:"button",className:`status-bar-settings${n?" active":""}`,onClick:a,title:n?"Hide console":"Show console",style:{marginLeft:4},children:[e.jsx("span",{style:{fontSize:11},children:"≡"}),e.jsx("span",{children:"Console"})]}),e.jsxs("button",{type:"button",className:"status-bar",onClick:()=>p(!0),title:"Click for platform status + API perf",children:[e.jsx("span",{className:"status-dot",style:{background:R.dot}}),e.jsx("span",{className:"status-label",children:"PLATFORM"}),e.jsx("span",{className:"status-value",style:{color:R.dot},children:R.label}),(r==null?void 0:r.services)&&e.jsxs("span",{className:"status-count",children:[r.services.filter(b=>b.healthy).length,"/",r.services.length," svc",r.totalInstances!=null&&e.jsxs(e.Fragment,{children:[" · ",r.totalHealthyInstances,"/",r.totalInstances," inst"]})]}),e.jsxs("span",{className:"perf-chip",style:{background:rn(h.p95,h.errorCount)},title:`30s window: ${h.count} calls · p95 ${ze(h.p95)} · avg ${ze(h.avgMs)}${h.errorCount?` · ${h.errorCount} err`:""}`,children:[e.jsx("span",{className:"perf-chip-dot"}),an(h.p95,h.count),h.count>0&&e.jsx("span",{className:"perf-chip-val",children:ze(h.p95)})]}),T.cacheBytes>0&&e.jsxs("span",{className:"cache-chip",title:`3D cache: ${T.entries} part${T.entries!==1?"s":""} · ${He(T.cacheBytes)} / ${He(T.maxBytes)}`,children:["3D · ",He(T.cacheBytes)]})]})]}),u&&e.jsx("div",{className:"status-modal-overlay",onClick:()=>p(!1),children:e.jsxs("div",{className:"status-modal",onClick:b=>b.stopPropagation(),role:"dialog","aria-label":"Platform status",children:[e.jsxs("div",{className:"status-modal-header",children:[e.jsx("h3",{children:"Platform Status"}),e.jsxs("a",{className:"status-modal-jaeger",href:li,target:"_blank",rel:"noopener noreferrer",title:"Open Jaeger tracing UI",children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),e.jsx("polyline",{points:"15 3 21 3 21 9"}),e.jsx("line",{x1:"10",y1:"14",x2:"21",y2:"3"})]}),e.jsx("span",{children:"Traces"})]}),e.jsx("button",{className:"status-modal-close",onClick:()=>p(!1),"aria-label":"Close",children:"×"})]}),e.jsxs("div",{className:"status-tabs",children:[e.jsx("button",{className:`status-tab${x==="services"?" status-tab-active":""}`,onClick:()=>g("services"),children:"Services"}),e.jsxs("button",{className:`status-tab${x==="perf"?" status-tab-active":""}`,onClick:()=>g("perf"),children:["API Perf (",f.overall.total,")"]}),e.jsx("button",{className:`status-tab${x==="nats"?" status-tab-active":""}`,onClick:()=>g("nats"),children:"NATS"}),e.jsx("button",{className:`status-tab${x==="workers"?" status-tab-active":""}`,onClick:()=>g("workers"),children:"3D Workers"}),O.map(b=>e.jsx("button",{className:`status-tab${x===b.key?" status-tab-active":""}`,onClick:()=>g(b.key),children:b.label},b.key))]}),x==="services"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[e.jsx("span",{className:"status-dot",style:{background:R.dot}}),e.jsx("span",{className:"status-modal-overall",style:{color:R.dot},children:R.label}),(r==null?void 0:r.gatewayVersion)&&e.jsxs("span",{className:"status-modal-uptime",children:["spe-api ",e.jsx("code",{children:r.gatewayVersion})]}),(r==null?void 0:r.gatewayUptimeSeconds)!=null&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",di(r.gatewayUptimeSeconds)]}),e.jsx("button",{className:"status-modal-refresh",onClick:j,children:"refresh"})]}),i&&e.jsxs("div",{className:"status-modal-error",children:["Gateway unreachable: ",i]}),e.jsxs("table",{className:"status-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Service / Instance"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Path"}),e.jsx("th",{children:"Affinity"}),e.jsx("th",{children:"Last HB"}),e.jsx("th",{children:"Failures"})]})}),e.jsx("tbody",{children:((r==null?void 0:r.services)||[]).flatMap(b=>{const m=b.status||(b.healthy?"up":"down"),B=yt[m]||yt.unknown,_=e.jsxs("tr",{className:"status-row-service",children:[e.jsxs("td",{children:[e.jsx("code",{children:b.serviceCode}),b.instanceCount!=null&&e.jsxs("span",{className:"status-inst-badge",title:"healthy / total instances",children:[b.healthyInstances,"/",b.instanceCount," inst"]})]}),e.jsx("td",{children:b.version?e.jsx("code",{children:b.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:B.dot}}),e.jsx("span",{style:{color:B.dot},children:B.label})]}),e.jsx("td",{children:b.path?e.jsx("code",{children:b.path}):e.jsx("span",{className:"muted",children:"—"})}),e.jsx("td",{children:b.instances&&b.instances.length>0&&(()=>{const y=b.instances.filter(M=>!M.untagged),C=b.instances.filter(M=>M.untagged);if(y.length===0)return e.jsx("span",{className:"muted",children:"all untagged"});const P=[...new Set(y.map(M=>M.spaceTag))].sort().join(", ");return e.jsxs("span",{className:"muted",children:[P,C.length?` + ${C.length} untagged`:""]})})()}),e.jsx("td",{colSpan:"2",children:b.registered?e.jsxs("span",{className:"muted",children:["pool of ",b.instanceCount]}):e.jsx("span",{className:"muted",children:"no instances registered"})})]},b.serviceCode),Y=(b.instances||[]).map(y=>{const C=y.status||(y.healthy?"up":"down"),P=yt[C]||yt.unknown;return e.jsxs("tr",{className:"status-row-instance",children:[e.jsxs("td",{children:[e.jsx("span",{className:"status-inst-leaf",children:"↳"})," ",e.jsx("code",{className:"muted",children:y.instanceId})]}),e.jsx("td",{children:y.version?e.jsx("code",{children:y.version}):e.jsx("span",{className:"muted",children:"—"})}),e.jsxs("td",{children:[e.jsx("span",{className:"status-dot status-dot-sm",style:{background:P.dot}}),e.jsx("span",{style:{color:P.dot},children:P.label})]}),e.jsx("td",{children:y.untagged?e.jsx("span",{className:"muted",children:"—"}):e.jsx("code",{style:{fontSize:"0.85em"},children:y.spaceTag})}),e.jsx("td",{children:y.lastHeartbeatOk?ci(y.ageSeconds)+" ago":e.jsx("span",{className:"muted",children:"never"})}),e.jsx("td",{children:y.consecutiveFailures??0})]},b.serviceCode+"/"+y.instanceId)});return[_,...Y]})})]}),(r==null?void 0:r.timestamp)&&e.jsxs("div",{className:"status-modal-timestamp",children:["server time: ",r.timestamp]})]}),x==="perf"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"perf-window-banner",style:{"--perf-color":rn(h.p95,h.errorCount)},children:[e.jsx("span",{className:"perf-chip-dot perf-chip-dot-lg"}),e.jsxs("span",{className:"perf-window-label",children:["last 30s — ",an(h.p95,h.count)]}),e.jsxs("span",{className:"perf-window-metrics",children:[h.count," calls · p50 ",ze(h.p50)," · p95 ",ze(h.p95)," · max ",ze(h.maxMs),h.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[" · ",h.errorCount," err"]})]})]}),e.jsxs("div",{className:"status-modal-summary",children:[e.jsxs("span",{className:"status-perf-summary",children:[e.jsxs("span",{children:[f.overall.total," calls"]}),e.jsxs("span",{children:["avg ",e.jsx("strong",{className:Je(f.overall.avgMs),children:ze(f.overall.avgMs)})]}),e.jsxs("span",{children:["p50 ",e.jsx("strong",{className:Je(f.overall.p50),children:ze(f.overall.p50)})]}),e.jsxs("span",{children:["p95 ",e.jsx("strong",{className:Je(f.overall.p95),children:ze(f.overall.p95)})]}),e.jsxs("span",{children:["p99 ",e.jsx("strong",{className:Je(f.overall.p99),children:ze(f.overall.p99)})]}),e.jsxs("span",{children:["max ",e.jsx("strong",{className:Je(f.overall.maxMs),children:ze(f.overall.maxMs)})]}),f.overall.errorCount>0&&e.jsxs("span",{className:"lat-bad",children:[f.overall.errorCount," err"]})]}),e.jsx("button",{className:"status-modal-refresh",onClick:()=>{Xr(),d(Ot())},children:"reset"})]}),e.jsxs("div",{className:"status-perf-note",children:["Window = last ",f.overall.windowSize," calls. Latency = browser-observed time through nginx → spe-api → ","{","psm,pno","}","."]}),e.jsx(pi,{sorted:f.overall.sorted}),f.byEndpoint.length===0?e.jsx("div",{className:"status-perf-empty",children:"No API calls recorded yet."}):e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Method"}),e.jsx("th",{children:"Endpoint"}),e.jsx("th",{children:"#"}),e.jsx("th",{children:"avg"}),e.jsx("th",{children:"p50"}),e.jsx("th",{children:"p95"}),e.jsx("th",{title:"sorted desc by p95",children:"max ▼"}),e.jsx("th",{children:"last"}),e.jsx("th",{children:"err"})]})}),e.jsx("tbody",{children:[...f.byEndpoint].sort((b,m)=>m.p95-b.p95).map(b=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:b.method})}),e.jsx("td",{children:e.jsx("code",{title:b.endpoint,children:b.endpoint})}),e.jsx("td",{children:b.count}),e.jsx("td",{className:Je(b.avgMs),children:ze(b.avgMs)}),e.jsx("td",{className:Je(b.p50),children:ze(b.p50)}),e.jsx("td",{className:Je(b.p95),children:ze(b.p95)}),e.jsx("td",{className:Je(b.maxMs),children:ze(b.maxMs)}),e.jsx("td",{className:Je(b.lastMs),children:ze(b.lastMs)}),e.jsx("td",{className:b.errorCount?"lat-bad":"muted",children:b.errorCount||0})]},`${b.method} ${b.endpoint}`))})]})})]}),x==="nats"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"status-modal-summary",children:[k?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-dot",style:{background:k.status==="up"?"#4dd4a0":"#fc8181"}}),e.jsx("span",{className:"status-modal-overall",style:{color:k.status==="up"?"#4dd4a0":"#fc8181"},children:k.status==="up"?"UP":"DOWN"}),k.version&&e.jsxs("span",{className:"status-modal-uptime",children:["v",k.version]}),k.uptime&&e.jsxs("span",{className:"status-modal-uptime",children:["uptime: ",k.uptime]})]}):e.jsx("span",{className:"muted",children:D?`Error: ${D}`:"Loading..."}),e.jsx("button",{className:"status-modal-refresh",onClick:A,children:"refresh"})]}),k&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"nats-stats-grid",children:[e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Connections"}),e.jsx("span",{className:"nats-stat-value",children:k.connections??0}),e.jsxs("span",{className:"nats-stat-sub",children:["total: ",k.totalConnections??0]})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Subscriptions"}),e.jsx("span",{className:"nats-stat-value",children:k.subscriptions??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages In"}),e.jsx("span",{className:"nats-stat-value",children:At(k.inMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:He(k.inBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Messages Out"}),e.jsx("span",{className:"nats-stat-value",children:At(k.outMsgs)}),e.jsx("span",{className:"nats-stat-sub",children:He(k.outBytes)})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Slow Consumers"}),e.jsx("span",{className:`nats-stat-value${k.slowConsumers>0?" lat-bad":""}`,children:k.slowConsumers??0})]}),e.jsxs("div",{className:"nats-stat",children:[e.jsx("span",{className:"nats-stat-label",children:"Sub Cache"}),e.jsx("span",{className:"nats-stat-value",children:k.numCache??0}),e.jsxs("span",{className:"nats-stat-sub",children:["matches: ",At(k.numMatches)]})]})]}),k.connectionDetails&&k.connectionDetails.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("h4",{className:"nats-section-title",children:["Client Connections (",k.numConnections,")"]}),e.jsx("div",{className:"status-perf-scroll",children:e.jsxs("table",{className:"status-table status-table-sticky",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"CID"}),e.jsx("th",{children:"Name"}),e.jsx("th",{children:"Lang"}),e.jsx("th",{children:"Subs"}),e.jsx("th",{children:"Msgs In"}),e.jsx("th",{children:"Msgs Out"}),e.jsx("th",{children:"Bytes In"}),e.jsx("th",{children:"Bytes Out"}),e.jsx("th",{children:"Uptime"}),e.jsx("th",{children:"Idle"})]})}),e.jsx("tbody",{children:k.connectionDetails.map(b=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:b.cid})}),e.jsx("td",{children:e.jsx("code",{title:b.name,children:b.name||"—"})}),e.jsx("td",{children:b.lang||"—"}),e.jsx("td",{children:typeof b.subscriptions=="number"?b.subscriptions:Array.isArray(b.subscriptions)?b.subscriptions.length:"—"}),e.jsx("td",{children:At(b.inMsgs)}),e.jsx("td",{children:At(b.outMsgs)}),e.jsx("td",{children:He(b.inBytes)}),e.jsx("td",{children:He(b.outBytes)}),e.jsx("td",{children:b.uptime||"—"}),e.jsx("td",{children:b.idle||"—"})]},b.cid))})]})})]})]})]}),x==="workers"&&e.jsxs("div",{style:{padding:"12px 16px",overflowY:"auto"},children:[e.jsx("div",{style:{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"},children:[{v:T.workers,l:"Workers"},{v:T.entries,l:"Cached Parts"},{v:He(T.cacheBytes),l:"Memory Used"},{v:He(T.maxBytes),l:"Memory Limit"},{v:T.memHits,l:"Mem Hits"},{v:T.idbHits,l:"IDB Hits"},{v:T.netFetches,l:"Downloads"},{v:ze(T.avgDownloadMs),l:"Avg Download"},{v:ze(T.avgParseMs),l:"Avg Parse"}].map(({v:b,l:m})=>e.jsxs("div",{style:{background:"var(--surface2)",borderRadius:6,padding:"8px 14px",minWidth:90},children:[e.jsx("div",{style:{fontSize:17,fontWeight:700,color:"var(--text)",lineHeight:1.2},children:b??"—"}),e.jsx("div",{style:{fontSize:10,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginTop:2},children:m})]},m))}),e.jsxs("div",{style:{fontSize:11,color:"var(--muted2)"},children:["Cache: ",He(T.cacheBytes)," / ",He(T.maxBytes)," (",T.maxBytes>0?(T.cacheBytes/T.maxBytes*100).toFixed(1):0,"%)"]}),e.jsx("div",{style:{marginTop:6,height:6,background:"var(--surface2)",borderRadius:3,overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${T.maxBytes>0?Math.min(100,T.cacheBytes/T.maxBytes*100):0}%`,background:"var(--accent)",borderRadius:3,transition:"width .3s"}})}),e.jsxs("div",{style:{marginTop:16,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em",marginRight:4},children:"Limit / worker"}),[{label:"128 MB",bytes:128*1024*1024},{label:"256 MB",bytes:256*1024*1024},{label:"512 MB",bytes:512*1024*1024},{label:"1 GB",bytes:1024*1024*1024}].map(({label:b,bytes:m})=>{const B=T.workers>0?T.maxBytes/T.workers:0,_=Math.abs(B-m)<1024;return e.jsx("button",{type:"button",onClick:()=>bo(m),style:{padding:"3px 10px",fontSize:11,borderRadius:4,border:"1px solid",borderColor:_?"var(--accent)":"var(--border)",background:_?"var(--accent)":"var(--surface2)",color:_?"#fff":"var(--text)",cursor:"pointer",fontWeight:_?700:400},children:b},b)})]}),e.jsxs("div",{style:{marginTop:10,display:"flex",gap:8},children:[e.jsx("button",{type:"button",onClick:()=>qs({idb:!1}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear Memory"}),e.jsx("button",{type:"button",onClick:()=>qs({idb:!0}),style:{padding:"4px 12px",fontSize:11,borderRadius:4,border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)",cursor:"pointer"},children:"Clear All + IDB"})]}),e.jsx("div",{style:{marginTop:12,fontSize:11,color:"var(--muted2)"},children:"Avg timings = rolling average over last 50 loads per worker. IDB = IndexedDB persistent cache. Mem = in-memory LRU."})]}),O.map(b=>x===b.key&&e.jsx(b.Component,{},b.key))]})})]})}function on(t){const s=we(i=>i.statusSlots),n=we(i=>i.consoleVisible),a=we(i=>i.toggleConsole),r=s.filter(i=>i.position!=="right"),o=s.filter(i=>i.position==="right");return e.jsx(mi,{...t,leftSlots:r,rightSlots:o,consoleVisible:n,onToggleConsole:a})}const ui=300;function hi({descriptor:t,item:s,isPinned:n,onPin:a,onUnpin:r,onNavigate:o}){const i=s.id||s.ID,c=s.logical_id||s.LOGICAL_ID||s.name||s.originalName||i,u=t.displayName;return e.jsxs("div",{className:"search-result-row",onClick:()=>o(i,c,t),title:`${u}: ${c}`,children:[e.jsxs("div",{className:"search-result-label",children:[e.jsx("span",{className:"search-result-type",style:{color:t.color||"var(--muted)"},children:u}),e.jsx("span",{className:"search-result-name",children:c})]}),e.jsx("button",{className:`search-pin-btn${n?" pinned":""}`,title:n?"Remove from basket":"Add to basket",onClick:p=>{p.stopPropagation(),n?r():a()},children:n?e.jsx(Nt,{size:11,strokeWidth:2}):e.jsx(Dt,{size:11,strokeWidth:2})})]})}function xi({query:t,onQueryChange:s,onClose:n,userId:a,projectSpaceId:r,onNavigate:o}){const[i,c]=l.useState(t||""),[u,p]=l.useState({}),[x,g]=l.useState(!1),k=l.useRef(null),z=l.useRef(null),[D,$]=l.useState(280),f=l.useRef(null),d=ee(m=>m.items),h=ee(m=>m.basketItems),w=ee(m=>m.addToBasket),j=ee(m=>m.removeFromBasket),A=ee(m=>m.userId);ee(m=>m.projectSpaceId);const T=l.useMemo(()=>d.filter(m=>m.list),[d]),O=l.useCallback(async m=>{const B=m.trim().toLowerCase();if(!B){p({});return}g(!0);try{const _={};await Promise.all(T.map(async Y=>{try{const C=((await q.fetchListableItems(a,Y,0,100)).items||[]).filter(P=>{const M=(P.logical_id||P.LOGICAL_ID||P.name||P.originalName||"").toLowerCase(),v=(P.display_name||P.DISPLAY_NAME||"").toLowerCase();return M.includes(B)||v.includes(B)});C.length>0&&(_[`${Y.serviceCode}:${Y.itemCode}:${Y.itemKey||""}`]={descriptor:Y,items:C})}catch{}})),p(_)}finally{g(!1)}},[T,a]);l.useEffect(()=>{c(t||"")},[t]),l.useEffect(()=>(k.current&&clearTimeout(k.current),k.current=setTimeout(()=>O(i),ui),()=>clearTimeout(k.current)),[i,O]);function K(m){c(m.target.value),s&&s(m.target.value)}function R(m){const B=m.clientX,_=D;function Y(C){$(Math.max(220,Math.min(600,_+(C.clientX-B))))}function y(){document.removeEventListener("mousemove",Y),document.removeEventListener("mouseup",y)}document.addEventListener("mousemove",Y),document.addEventListener("mouseup",y)}const b=Object.values(u).reduce((m,{items:B})=>m+B.length,0);return e.jsxs("div",{className:"search-panel",ref:z,style:{width:D},children:[e.jsx("div",{className:"resize-handle search-panel-resize",onMouseDown:R,ref:f,style:{left:"auto",right:0}}),e.jsxs("div",{className:"search-panel-header",children:[e.jsx("span",{className:"search-panel-title",children:"Search"}),e.jsx("button",{className:"panel-icon-btn",onClick:n,title:"Close search",children:e.jsx(jt,{size:13,strokeWidth:2})})]}),e.jsx("div",{className:"search-panel-input-wrap",children:e.jsx("input",{autoFocus:!0,className:"search-panel-input",type:"text",placeholder:"Search items…",value:i,onChange:K})}),e.jsxs("div",{className:"search-panel-results",children:[x&&e.jsx("div",{className:"panel-empty",style:{fontSize:11},children:"Searching…"}),!x&&i.trim()&&b===0&&e.jsxs("div",{className:"panel-empty",style:{fontSize:11},children:['No results for "',i,'"']}),!x&&Object.values(u).map(({descriptor:m,items:B})=>{const Y=fs(m).SearchRow||hi;return e.jsxs("div",{className:"search-result-group",children:[e.jsxs("div",{className:"search-result-group-label",style:{color:m.color||"var(--muted)"},children:[m.sourceLabel||m.serviceCode," · ",m.displayName]}),B.map(y=>{const C=y.id||y.ID,P=`${m.serviceCode}:${m.itemKey||m.itemCode}`,M=!!(h[P]&&h[P].has(C));return e.jsx(Y,{descriptor:m,item:y,isPinned:M,onPin:()=>w(A||a,m.serviceCode,m.itemKey||m.itemCode,C),onUnpin:()=>j(A||a,m.serviceCode,m.itemKey||m.itemCode,C),onNavigate:o},C)})]},`${m.serviceCode}:${m.itemCode}:${m.itemKey||""}`)})]})]})}Eo();const ln="ps-default";let fi=0;function gi(){const[t,s]=l.useState([]),[n,a]=l.useState(null),r=l.useCallback((o,i="info")=>{const c=typeof o=="string"?o:(o==null?void 0:o.message)||String(o),u=typeof o!="string"&&(o!=null&&o.detail)?o.detail:null;if(i==="error"){a(u??{error:c});return}const p=++fi;s(x=>[...x,{id:p,msg:c,type:i}]),setTimeout(()=>s(x=>x.filter(g=>g.id!==p)),4e3)},[]);return{toasts:t,toast:r,errorDetail:n,setErrDetail:a}}function bi({toasts:t}){return e.jsx("div",{className:"toasts",role:"status","aria-live":"polite",children:t.map(s=>e.jsxs("div",{className:`toast toast-${s.type}`,children:[e.jsx("span",{"aria-hidden":"true",children:s.type==="success"?"✓":s.type==="error"?"✗":s.type==="warn"?"⚠":"ℹ"}),s.msg]},s.id))})}function vi(){const{toasts:t,toast:s,errorDetail:n,setErrDetail:a}=gi(),[r,o]=l.useState("user-alice"),[i,c]=l.useState(ln),u=ee(N=>N.setUserId),p=ee(N=>N.setProjectSpaceId),x=ee(N=>N.nodes),g=ee(N=>N.nodeTypes),k=ee(N=>N.resources),z=ee(N=>N.stateColorMap),D=ee(N=>N.stateColorMapLoaded),$=ee(N=>N.projectSpaces),f=ee(N=>N.users),d=ee(N=>N.activeTx),h=ee(N=>N.txNodes),w=ee(N=>N.refreshNodes),j=ee(N=>N.refreshTx),A=ee(N=>N.refreshAll),T=ee(N=>N.refreshItems),O=ee(N=>N.refreshStateColorMap),K=ee(N=>N.refreshProjectSpaces),R=ee(N=>N.refreshUsers),b=ee(N=>N.clearTx),m=ee(N=>N.loadBasket);ee(N=>N.addToBasket),ee(N=>N.basketItems);const B=ee(N=>N.syncBasketAdd),_=ee(N=>N.syncBasketRemove),Y=ee(N=>N.syncBasketClear),y=ee(N=>N.removeBasketItemIds),C=ee(N=>N.lockItem),P=ee(N=>N.unlockItem),M=ee(N=>N.unlockAll),[v,S]=l.useState(0),[L,U]=l.useState(!1),[F,G]=l.useState(""),I=l.useCallback(()=>S(N=>N+1),[]),[E,H]=l.useState(""),[ie,re]=l.useState(""),ue={id:"dashboard",nodeId:null,label:"Dashboard",pinned:!0},[he,ke]=l.useState([ue]),[W,J]=l.useState("dashboard"),[ae,X]=l.useState(null),[se,ce]=l.useState({}),xe=l.useRef(new Set),Q=l.useCallback(N=>{var fe;const Z=he.find(de=>de.nodeId===N);if(!((fe=Z==null?void 0:Z.get)!=null&&fe.path))return;const le=(d==null?void 0:d.ID)||(d==null?void 0:d.id)||null;ce(de=>({...de,[N]:{...de[N]??{},status:"loading"}})),ea(Z.serviceCode,Z.get,N,le?{txId:le}:{}).then(de=>ce(be=>({...be,[N]:{status:"ok",data:de}}))).catch(de=>{(de==null?void 0:de.status)===404?(xe.current.delete(N),ce(be=>{const et={...be};return delete et[N],et}),ke(be=>{const et=be.filter(pt=>pt.nodeId!==N);return J(pt=>{var Pe;return pt===Z.id?((Pe=et.at(-1))==null?void 0:Pe.id)??null:pt}),et})):ce(be=>({...be,[N]:{status:"error",error:de.message}}))})},[he,d]),te=l.useCallback(()=>{he.filter(N=>{var Z;return N.nodeId&&((Z=N.get)==null?void 0:Z.path)}).forEach(N=>Q(N.nodeId))},[he,Q]);l.useEffect(()=>{var Z;if(!W||W==="dashboard")return;const N=he.find(le=>le.id===W);!((Z=N==null?void 0:N.get)!=null&&Z.path)||!N.nodeId||xe.current.has(N.nodeId)||(xe.current.add(N.nodeId),Q(N.nodeId))},[W,he]);const me=l.useRef(null);l.useEffect(()=>{const N=(d==null?void 0:d.ID)||(d==null?void 0:d.id)||null;if(N===me.current||(me.current=N,!W||W==="dashboard"))return;const Z=he.find(le=>le.id===W);Z!=null&&Z.nodeId&&Q(Z.nodeId)},[d,W,he,Q]);const[ve,Te]=l.useState(!1),[Ce,$e]=l.useState(!1),[Re,Ae]=l.useState(null),[Ie,lt]=l.useState(!1),[ct,Ue]=l.useState(null),[nt,Fe]=l.useState(null),[Xe,Qe]=l.useState(268),[Me,Ns]=l.useState(!1),[Cs,Es]=l.useState(null),[Mn,On]=l.useState(0),[_n,Wn]=l.useState(!1),rt=l.useCallback((N,Z,le)=>{if(!le||!le.serviceCode)throw new Error("navigate(): descriptor is required");const fe={serviceCode:le.serviceCode,itemCode:le.itemCode,itemKey:le.itemKey,get:le.get||null};ke(de=>{const be=de.find(Pe=>Pe.nodeId===N);if(be)return J(be.id),de.map(Pe=>Pe.id===be.id?{...Pe,...fe}:Pe);const et=de.find(Pe=>!Pe.pinned&&Pe.id!=="dashboard");if(et)return J(et.id),de.map(Pe=>Pe.id===et.id?{...Pe,nodeId:N,label:Z||N.slice(0,10),...fe}:Pe);const pt=`tab-${Date.now()}`;return J(pt),[...de,{id:pt,nodeId:N,label:Z||N.slice(0,10),pinned:!1,...fe}]})},[]),Gn=l.useCallback(N=>rt(N.nodeId,N.label,N),[rt]),Ts=l.useCallback(N=>{ke(Z=>{const le=Z.find(de=>de.id===N);le!=null&&le.nodeId&&(xe.current.delete(le.nodeId),ce(de=>{const be={...de};return delete be[le.nodeId],be}));const fe=Z.filter(de=>de.id!==N);return W===N&&(J(fe.length>0?fe[fe.length-1].id:null),X(null)),fe})},[W]),zs=l.useMemo(()=>Ro({navigate:rt,openTab:Gn,closeTab:Ts}),[]);ks(["/topic/transactions","/topic/global","/topic/metamodel"],async N=>{N.event==="LOCK_ACQUIRED"?N.lockedBy===r&&C(N.nodeId):N.event==="LOCK_RELEASED"?N.releasedBy===r&&P(N.nodeId):N.event==="TX_COMMITTED"?(N.byUser===r&&M(),await j(),N.byUser&&N.byUser!==r&&s(`${N.byUser} committed a transaction`,"info")):N.event==="ITEM_DELETED"?(N.nodeId&&(y([N.nodeId]),ke(Z=>{const le=Z.find(de=>de.nodeId===N.nodeId);if(!le)return Z;xe.current.delete(N.nodeId),ce(de=>{const be={...de};return delete be[N.nodeId],be});const fe=Z.filter(de=>de.nodeId!==N.nodeId);return J(de=>{var be;return de===le.id?((be=fe.at(-1))==null?void 0:be.id)??null:de}),fe})),w(),I()):N.event==="TX_ROLLED_BACK"?(N.byUser===r&&M(),await j(),await w(),te(),I(),N.byUser&&N.byUser!==r&&s(`${N.byUser} rolled back a transaction`,"warn")):N.event==="ITEMS_RELEASED"?(N.byUser===r&&(N.nodeIds||[]).forEach(P),j(),I()):N.event==="ITEM_CREATED"?(w(),j(),I()):N.event==="ITEM_CAPTURED"?j():N.event==="BASKET_ITEM_ADDED"?B(N.key,N.value):N.event==="BASKET_ITEM_REMOVED"?_(N.key,N.value):N.event==="BASKET_CLEARED"?Y():N.event==="ITEM_VERSION_CREATED"||N.event==="ITEM_UPDATED"?(N.nodeId&&Q(N.nodeId),w(),I()):N.event==="METAMODEL_CHANGED"?(T(),I(),D&&O(),N.byUser&&N.byUser!==r&&s(`${N.byUser} updated the metamodel`,"info")):N.event==="PNO_CHANGED"&&(R(),K(),N.byUser&&N.byUser!==r&&s(`${N.byUser} updated ${(N.entity||"PNO data").toLowerCase()}`,"info"))},r);function As(){lt(N=>(!N&&r&&(q.getSettingsSections(r).then(Z=>{var fe,de,be;Fe(Z);const le=(be=(de=(fe=Z==null?void 0:Z[0])==null?void 0:fe.sections)==null?void 0:de[0])==null?void 0:be.key;le&&Ue(le)}).catch(()=>Fe([])),O()),!N))}l.useEffect(()=>{Ds(ln),Zr(N=>s(N,"error"))},[s]),l.useEffect(()=>{let N=!1;return Ns(!1),Es(null),(async()=>{try{await Bs.login(r,i)}catch(Z){N||Es(Z.message||String(Z));return}if(!N){Qr(async()=>{try{return(await Bs.login(r,i)).token}catch{return null}}),Ns(!0),u(r),p(i),A(),K(),R(),O(),m(r),aa(r),Ie&&q.getSettingsSections(r).then(Z=>{var fe,de,be;Fe(Z);const le=(be=(de=(fe=Z==null?void 0:Z[0])==null?void 0:fe.sections)==null?void 0:de[0])==null?void 0:be.key;le&&Ue(le)}).catch(()=>Fe([]));try{const Z=await $o(zs);Z.length>0&&s(`Some plugins failed to load: ${Z.join("; ")}`,"error")}catch(Z){s(`Plugin manifest unavailable: ${Z.message||Z}`,"error")}finally{Wn(!0),S(Z=>Z+1)}}})(),()=>{N=!0}},[r,i,Mn]);function Un(N){o(N),ke([ue]),J("dashboard"),X(null),H("")}function Fn(N){c(N),Ds(N),p(N),m(r),ke([ue]),J("dashboard"),X(null),A()}function Hn(N){const Z=N.clientX,le=Xe;function fe(be){Qe(Math.max(160,Math.min(600,le+be.clientX-Z)))}function de(){document.removeEventListener("mousemove",fe),document.removeEventListener("mouseup",de)}document.addEventListener("mousemove",fe),document.addEventListener("mouseup",de)}async function Vn(){if(d)return d.ID||d.id;try{const N=await ut.open(r,"Work session");return await j(),N.txId}catch(N){return s(N,"error"),null}}async function Kn(){if(d)try{await ut.rollback(r,d.ID||d.id),s("Transaction rolled back","warn"),b(),await w(),te()}catch(N){s(N,"error")}}async function qn(N){if(d)try{await ut.release(r,d.ID||d.id,[N]),s("Object released from transaction","info"),await A()}catch(Z){s(Z,"error")}}async function Xn(N,Z){if(await A(),te(),N&&Z>0){const le=Z;s(`${le} object${le>1?"s":""} deferred — new transaction opened`,"info")}}const dt=he.find(N=>N.id===W),Mt=dt==null?void 0:dt.nodeId,Yn=W==="dashboard",Jn=l.useCallback(N=>{if((N==null?void 0:N.nodeId)===Mt&&X(N),N!=null&&N.nodeId){const Z=N.logicalId||N.identity||void 0;ke(le=>le.map(fe=>fe.nodeId===N.nodeId?{...fe,...N.nodeTypeId&&{nodeTypeId:N.nodeTypeId},...Z&&{label:Z}}:fe))}},[Mt]);return Me?e.jsx(Io.Provider,{value:zs,children:e.jsxs("div",{className:"shell",children:[e.jsx(ga,{userId:r,onUserChange:Un,users:f,nodeTypes:g,stateColorMap:z,searchQuery:E,searchType:ie,onSearchChange:H,onSearchTypeChange:re,onSearchSubmit:N=>{G(N),U(!0)},projectSpaces:$,projectSpaceId:i,onProjectSpaceChange:Fn,nodes:x,onNavigate:rt}),e.jsxs("div",{className:"body",children:[e.jsx("div",{className:`search-strip${L?" search-strip--open":""}`,onClick:()=>U(N=>!N),title:L?"Close search":"Search items",children:e.jsxs("span",{className:"search-strip-label",children:[L?"◀":"▶"," Search"]})}),e.jsx(os,{children:e.jsx(Mo,{nodeTypes:g,tx:d,txNodes:h,userId:r,activeNodeId:Mt,stateColorMap:z,onNavigate:rt,canCreateNode:k.length>0,onCreateNode:N=>{Ae(N||null),$e(!0)},onCommit:()=>Te(!0),onRollback:Kn,onReleaseNode:qn,showSettings:Ie,onToggleSettings:As,activeSettingsSection:ct,onSettingsSectionChange:Ue,settingsSections:nt,isDashboardOpen:Yn,onOpenDashboard:()=>J("dashboard"),browseRefreshKey:v,style:{width:Xe},toast:s})}),e.jsx("div",{className:"resize-handle",onMouseDown:Hn}),e.jsxs("div",{className:"editor-column",children:[Ie?e.jsx(os,{children:e.jsx(ro,{userId:r,projectSpaceId:i,activeSection:ct,onSectionChange:Ue,settingsSections:nt,pluginsLoaded:_n,toast:s})}):e.jsx(os,{children:e.jsx(Fo,{tabs:he,activeTabId:W,userId:r,tx:d,toast:s,nodeTypes:g,stateColorMap:z,onTabActivate:N=>J(N),onTabClose:Ts,onTabPin:N=>ke(Z=>Z.map(le=>le.id===N?{...le,pinned:!le.pinned}:le)),onSubTabChange:(N,Z)=>ke(le=>le.map(fe=>fe.id===N?{...fe,activeSubTab:Z}:fe)),onNavigate:rt,onAutoOpenTx:Vn,onDescriptionLoaded:Jn,onRefreshItemData:Q,tabItemData:dt!=null&&dt.nodeId?se[dt.nodeId]??null:null})}),e.jsx(ni,{})]}),e.jsx(ei,{activeNodeId:Mt,userId:r,users:f})]}),L&&e.jsx(xi,{query:F,onQueryChange:G,onClose:()=>U(!1),userId:r,projectSpaceId:i,onNavigate:rt}),ve&&d&&e.jsx(ao,{userId:r,txId:d.ID||d.id,txNodes:h,stateColorMap:z,onCommitted:Xn,onClose:()=>Te(!1),toast:s}),Ce&&k.length>0&&e.jsx(oo,{resources:k,initialDescriptor:Re,onCreated:async(N,Z)=>{await A(),(Z==null?void 0:Z.serviceCode)==="psm"&&(N!=null&&N.nodeId)&&rt(N.nodeId,void 0,Bt)},onClose:()=>{$e(!1),Ae(null)},toast:s}),n&&e.jsx(co,{detail:n,onClose:()=>a(null)}),e.jsx(bi,{toasts:t}),e.jsx(on,{showSettings:Ie,onToggleSettings:As})]})}):e.jsxs("div",{className:"shell",children:[e.jsx("div",{className:"auth-splash",children:Cs?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-error",children:"Login failed"}),e.jsx("div",{className:"auth-splash-detail",children:Cs}),e.jsx("button",{className:"auth-splash-retry",onClick:()=>On(N=>N+1),children:"retry"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"auth-splash-spinner"}),e.jsxs("div",{className:"auth-splash-label",children:["Signing in as ",r,"…"]})]})}),e.jsx(on,{})]})}const yi=`
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
  min-width: 180px;
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
.search-panel{
  position:fixed;left:calc(var(--search-strip-w, 28px));top:var(--header-h);
  height:calc(100vh - var(--header-h));
  display:flex;flex-direction:column;flex-shrink:0;
  border-right:1px solid var(--border);background:var(--bg);
  overflow:hidden;z-index:120;
  box-shadow:4px 0 16px rgba(0,0,0,.18);
}
.search-panel-resize{position:absolute;top:0;right:0;bottom:0;width:4px;cursor:col-resize}
.search-panel-resize:hover,.search-panel-resize:active{background:var(--border2)}
.search-panel-header{display:flex;align-items:center;justify-content:space-between;padding:8px 10px 6px;border-bottom:1px solid var(--border);flex-shrink:0}
.search-panel-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.search-panel-input-wrap{padding:8px 10px;flex-shrink:0}
.search-panel-input{width:100%;box-sizing:border-box;padding:6px 8px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--fg);font-size:12px;outline:none}
.search-panel-input:focus{border-color:var(--accent)}
.search-panel-results{flex:1;overflow-y:auto;padding:4px 0}
.search-result-group{margin-bottom:4px}
.search-result-group-label{padding:4px 10px 2px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.search-result-row{display:flex;align-items:center;gap:6px;padding:5px 10px;cursor:pointer}
.search-result-row:hover{background:var(--hover)}
.search-result-label{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.search-result-type{font-size:10px;opacity:.7}
.search-result-name{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.search-pin-btn{flex-shrink:0;background:none;border:none;cursor:pointer;padding:2px;font-size:12px;opacity:.5;line-height:1}
.search-pin-btn:hover,.search-pin-btn.pinned{opacity:1}
`,Bn=document.createElement("style");Bn.textContent=yi;document.head.appendChild(Bn);ia();const ji=Zn.createRoot(document.getElementById("root"));ji.render(e.jsx(Be.StrictMode,{children:e.jsx(vi,{})}));
//# sourceMappingURL=index-6q62iDuF.js.map
