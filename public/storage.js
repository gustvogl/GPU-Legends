const DB_NAME='gpu-legends-v1';
let database;
export function openDB(){
 if(database)return database;
 database=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('records');
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();database=undefined;};resolve(db);};
  request.onerror=()=>{database=undefined;reject(request.error);};
  request.onblocked=()=>{database=undefined;reject(new Error('Feche outras abas para preparar o armazenamento.'));};
 });return database;
}
export async function read(key){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('records').objectStore('records').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function write(key,value){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put(value,key);tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
export async function allVotes(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('records').objectStore('records').getAll();r.onsuccess=()=>resolve(r.result.filter(v=>v&&v.operationId&&v.electionId));r.onerror=()=>reject(r.error);});}
export async function recordVote(electionId,candidateId){
 const db=await openDB();return new Promise((resolve,reject)=>{
  const tx=db.transaction('records','readwrite');const store=tx.objectStore('records');let operation;let error;
  const vote=store.get('vote:'+electionId);
  vote.onsuccess=()=>{if(vote.result){error=new Error('Você já registrou um voto nesta eleição.');tx.abort();return;}
   const identity=store.get('identity');identity.onsuccess=()=>{const voterId=identity.result||crypto.randomUUID();if(!identity.result)store.put(voterId,'identity');operation={operationId:crypto.randomUUID(),electionId,candidateId,voterId,status:'pending',createdAt:new Date().toISOString(),attempts:0,lastError:null,nextAttemptAt:0};store.put(operation,'vote:'+electionId);};};
  tx.oncomplete=()=>resolve(operation);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error);
 });
}
async function processVote(operation,force){
 if(operation.status==='confirmed'||operation.status==='rejected')return operation;
 if(!force&&operation.nextAttemptAt>Date.now())return operation;
 operation={...operation,status:'sending',attempts:operation.attempts+1};await write('vote:'+operation.electionId,operation);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch('/api/votes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({operationId:operation.operationId,electionId:operation.electionId,candidateId:operation.candidateId,voterId:operation.voterId}),signal:controller.signal});
  const body=await response.json().catch(()=>({message:'Não foi possível enviar agora. Seu voto continua salvo.'}));
  if(response.ok&&body.vote&&body.vote.operationId===operation.operationId){operation={...operation,status:'confirmed',receivedAt:body.vote.receivedAt,lastError:null,nextAttemptAt:0};}
  else if([400,409,410,422].includes(response.status)){operation={...operation,status:'rejected',lastError:body.message||'O servidor recusou este voto. Veja as regras da eleição.'};}
  else throw new Error(body.message||'Servidor indisponível. Seu voto continua salvo.');
 }catch(error){operation={...operation,status:'pending',lastError:error?.name==='AbortError'?'O envio demorou mais que o esperado. Seu voto continua salvo.':(error?.message||'Sem conexão com o servidor.'),nextAttemptAt:Date.now()+Math.min(60000,2000*2**Math.min(operation.attempts,5))};}
 finally{clearTimeout(timeout);}
 await write('vote:'+operation.electionId,operation);return operation;
}
let activeSync;
export function syncVotes(force=false){
 if(activeSync)return activeSync;
 const run=async()=>{const votes=await allVotes();const out=[];for(const op of votes)out.push(await processVote(op,force));return out;};
 activeSync=(typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request('gpu-legends-sync',run):run()).finally(()=>{activeSync=undefined;});return activeSync;
}
