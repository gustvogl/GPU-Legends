import { read,write,recordVote,syncVotes } from '../public/storage.js';
export {read,write,recordVote,syncVotes};
export type VoteOperation={operationId:string;electionId:string;candidateId:string;voterId:string;status:'pending'|'sending'|'confirmed'|'rejected';createdAt:string;receivedAt?:string;attempts:number;lastError:string|null;nextAttemptAt:number};
export type Results={electionId:string;counts:Record<string,number>;total:number;updatedAt:string;status:'open'|'closed';stale?:boolean};
