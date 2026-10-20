import { database } from '@/lib/database';
import { candidates } from '@/lib/candidates';
import { isElection, election, noCache } from '@/lib/election';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Row = {
  operation_id: string; election_id: string; voter_id: string;
  candidate_id: string; received_at: string;
};
const serialize = (row: Row) => ({
  operationId: row.operation_id, electionId: row.election_id,
  candidateId: row.candidate_id, receivedAt: row.received_at,
});
const sameVote = (row: Row, choice: { electionId: string; voterId: string; candidateId: string }) =>
  row.election_id === choice.electionId && row.voter_id === choice.voterId.toLowerCase() &&
  row.candidate_id === choice.candidateId;

export async function POST(request: Request) {
  const json = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: noCache });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return json({ message: 'Origem de envio inválida.' }, 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return json({ message: 'Envie os dados em JSON.' }, 415);
  }
  if (Number(request.headers.get('content-length') || 0) > 4096) {
    return json({ message: 'Dados muito grandes.' }, 413);
  }
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ message: 'Dados muito grandes.' }, 413);
    let data;
    try { data = JSON.parse(raw); }
    catch { return json({ message: 'Dados inválidos.' }, 400); }
    const { operationId, electionId, candidateId, voterId } = data || {};
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!isElection(electionId) || typeof operationId !== 'string' ||
        !uuid.test(operationId) || typeof voterId !== 'string' ||
        !uuid.test(voterId) || !candidates.some(candidate => candidate.id === candidateId)) {
      return json({ message: 'Eleição, candidata ou identificação inválida.' }, 400);
    }
    const sql = await database();
    const existing = (await sql.query(
      'SELECT * FROM gpu_legends_votes WHERE operation_id = $1', [operationId],
    ) as Row[])[0];
    if (existing) {
      if (!sameVote(existing, { electionId, voterId, candidateId })) {
        return json({ message: 'Esta operação já corresponde a outro voto.' }, 409);
      }
      return json({ vote: serialize(existing), replayed: true });
    }
    if (election(electionId).status !== 'open') {
      return json({ message: 'A eleição está encerrada. Votos pendentes só são aceitos enquanto ela está aberta.' }, 410);
    }
    await sql.query(
      'INSERT INTO gpu_legends_votes (operation_id,election_id,voter_id,candidate_id,received_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [operationId, electionId, voterId, candidateId, new Date().toISOString()],
    );
    const inserted = (await sql.query(
      'SELECT * FROM gpu_legends_votes WHERE operation_id = $1', [operationId],
    ) as Row[])[0];
    if (inserted) {
      if (!sameVote(inserted, { electionId, voterId, candidateId })) {
        return json({ message: 'Esta operação já corresponde a outro voto.' }, 409);
      }
      return json({ vote: serialize(inserted) });
    }
    return json({ message: 'Já existe um voto confirmado para esta identidade nesta eleição.' }, 409);
  } catch {
    // Driver errors can contain connection details; keep their payloads out of logs.
    console.error('GPU_VOTE_STORAGE_UNAVAILABLE');
    return json({ message: 'Não foi possível enviar agora. Seu voto continua salvo.' }, 503);
  }
}
