import {MAIN_ELECTION} from '@/lib/candidates';
import {election,isElection,noCache} from '@/lib/election';
export function GET(request:Request){const id=new URL(request.url).searchParams.get('electionId')||MAIN_ELECTION;if(!isElection(id))return Response.json({message:'Eleição inválida.'},{status:400,headers:noCache});return Response.json(election(id),{headers:noCache});}
