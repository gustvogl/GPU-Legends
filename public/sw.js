import {syncVotes} from './storage.js';
const VERSION='5.0.0-1e5f7185e7a6e000';
const PREFIX='gpu-legends-';
const CORE=PREFIX+'core-'+VERSION;
const PUBLIC=PREFIX+'public-'+VERSION;
const IMAGES=PREFIX+'images-'+VERSION;
const IMAGE_URLS=['voodoo2','8800-gtx','hd-7970','gtx-1080-ti','rx-580','rtx-3060','rx-7900-xtx','rtx-4090','gtx-750-ti','rx-480','geforce-256','radeon-9700-pro','6800-ultra','gtx-980-ti','gtx-1060','rtx-2080-ti','rtx-5090','rtx-5080','rtx-5070','rx-9070-xt','rx-9070','arc-b580','gpu-illustration'].map(id=>'/images/'+id+'.webp');
async function announce(data){for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))client.postMessage(data);}
async function prepare(){
 const cache=await caches.open(CORE);
 let urls=['/','/offline.html','/storage.js','/manifest.webmanifest','/favicon.svg','/icons/icon-192.png','/icons/icon-512.png'];let imageUrls=IMAGE_URLS;let manifestLoaded=false;
 try{const response=await fetch('/precache.json',{cache:'no-store'});if(response.ok){const manifest=await response.json();if(Array.isArray(manifest.urls)&&Array.isArray(manifest.images)){urls=[...new Set([...urls,...manifest.urls])];imageUrls=[...new Set([...IMAGE_URLS,...manifest.images.filter(url=>typeof url==='string'&&/^\/images\/[a-z0-9-]+\.webp$/.test(url))])];manifestLoaded=true;}}}catch{}
 await cache.addAll(urls);
 const images=await caches.open(IMAGES);const loaded=await Promise.allSettled(imageUrls.map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error(url);await images.put(url,response);}));
 const ready=manifestLoaded&&loaded.every(result=>result.status==='fulfilled');await cache.put('/__gpu_offline_ready',Response.json({ready}));
 await announce({type:ready?'OFFLINE_READY':'CACHE_PARTIAL',version:VERSION});return ready;
}
self.addEventListener('install',event=>{event.waitUntil(prepare());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&![CORE,PUBLIC,IMAGES].includes(key))await caches.delete(key);await self.clients.claim();})());});
async function networkFirst(request,cacheName,fallback,stale=false){const cache=await caches.open(cacheName);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);try{const response=await fetch(request,{signal:controller.signal});if(response.ok){await cache.put(request,response.clone());return response;}if(response.status>=500)throw new Error('Servidor indisponível');return response;}catch{const saved=await cache.match(request)||fallback&&await cache.match(fallback);if(saved){if(stale){const headers=new Headers(saved.headers);headers.set('X-GPU-Cached','true');return new Response(saved.body,{status:saved.status,headers});}return saved;}return Response.json({message:'Este recurso ainda não foi salvo offline.'},{status:503});}finally{clearTimeout(timer);}}
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(url.pathname==='/api/results'||url.pathname==='/api/elections/current'){event.respondWith(networkFirst(request,PUBLIC,null,true));return;}
 if(url.pathname==='/api/candidates'){event.respondWith((async()=>{const cache=await caches.open(PUBLIC);const saved=await cache.match(request);const update=fetch(request).then(async response=>{if(response.ok)await cache.put(request,response.clone());return response;});if(saved){event.waitUntil(update.catch(()=>{}));return saved;}return update.catch(()=>Response.json({message:'Conecte-se uma vez para salvar o catálogo.'},{status:503}));})());return;}
 if(request.mode==='navigate'){event.respondWith((async()=>{const response=await networkFirst(request,CORE,'/');if(response.ok)return response;return await (await caches.open(CORE)).match('/offline.html')||response;})());return;}
 if(url.pathname.startsWith('/api/'))return;
 event.respondWith((async()=>{const cache=await caches.open(url.pathname.startsWith('/images/')?IMAGES:CORE);const saved=await cache.match(request);if(saved)return saved;try{const response=await fetch(request);if(response.ok){await cache.put(request,response.clone());if(url.pathname.startsWith('/images/')){const keys=await cache.keys();if(keys.length>48)await cache.delete(keys[0]);}}return response;}catch{return new Response('Recurso não disponível offline.',{status:503});}})());
});
self.addEventListener('sync',event=>{if(event.tag==='sincronizar-votos'){event.waitUntil((async()=>{const operations=await syncVotes(true);await announce({type:'VOTES_SYNCED'});if(operations.some(op=>op.status==='pending'))throw new Error('Há votos aguardando envio.');})());}});
self.addEventListener('message',event=>{
 const data=event.data||{};
 if(data.type==='SKIP_WAITING')self.skipWaiting();
 if(data.type==='PREPARE_CACHE')event.waitUntil(prepare().catch(()=>announce({type:'CACHE_PARTIAL'})));
 if(data.type==='CACHE_STATUS')event.waitUntil((async()=>{const saved=await (await caches.open(CORE)).match('/__gpu_offline_ready');const state=saved?await saved.json():null;event.source?.postMessage({type:state?.ready?'OFFLINE_READY':'CACHE_PARTIAL',version:VERSION});})());
 if(data.type==='DEMO_NOTIFICATION')event.waitUntil(self.registration.showNotification('GPU Legends · demonstração',{body:'A apuração está disponível. Toque para abrir os resultados. Este é um aviso de teste.',icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:'gpu-legends-demo',data:{url:'/#results'}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL('/#results',self.location.origin).href;for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){if(new URL(client.url).origin===self.location.origin){await client.navigate(url);await client.focus();return;}}await self.clients.openWindow(url);})());});
