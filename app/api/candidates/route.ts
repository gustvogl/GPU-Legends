import {candidates} from '@/lib/candidates';
export function GET(){return Response.json(candidates,{headers:{'Cache-Control':'public, max-age=60'}});}
