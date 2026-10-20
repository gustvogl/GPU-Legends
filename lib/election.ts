import {MAIN_ELECTION,DEMO_ELECTION} from './candidates';
export function isElection(id:unknown):id is string{return id===MAIN_ELECTION||id===DEMO_ELECTION;}
export function election(id:string){return {id,title:id===DEMO_ELECTION?'GPU Legends · Apresentação':'GPU Legends',status:'open' as const,startsAt:'2026-10-06T00:00:00.000Z',endsAt:null,rulesVersion:'1.0'};}
export const noCache={'Cache-Control':'no-store'};
