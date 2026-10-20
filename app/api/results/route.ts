import { database } from '@/lib/database';
import { candidates, MAIN_ELECTION } from '@/lib/candidates';
import { isElection, noCache, election } from '@/lib/election';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('electionId') || MAIN_ELECTION;
  if (!isElection(id)) {
    return Response.json({ message: 'Eleição inválida.' }, { status: 400, headers: noCache });
  }
  try {
    const sql = await database();
    const rows = await sql.query(
      'SELECT candidate_id, COUNT(*)::int AS count FROM gpu_legends_votes WHERE election_id = $1 GROUP BY candidate_id', [id],
    );
    const counts: Record<string, number> = Object.fromEntries(candidates.map(candidate => [candidate.id, 0]));
    for (const row of rows) {
      if (Object.hasOwn(counts, row.candidate_id)) counts[row.candidate_id] = Number(row.count);
    }
    return Response.json({
      electionId: id, counts, total: Object.values(counts).reduce((a, b) => a + b, 0),
      updatedAt: new Date().toISOString(), status: election(id).status,
    }, { headers: noCache });
  } catch {
    console.error('GPU_RESULTS_STORAGE_UNAVAILABLE');
    return Response.json({ message: 'Apuração indisponível. Tente novamente.' }, { status: 503, headers: noCache });
  }
}
