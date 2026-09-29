import "server-only";
import { sql } from "@/lib/db";
import { isUniqueViolation } from "@/lib/sql-errors";

export class AlreadyVotedError extends Error {
  constructor() {
    super("This account has already voted on this poll.");
  }
}

export async function hasVoted(
  pollId: string,
  userId: string,
): Promise<boolean> {
  const rows = await sql`
    select 1
    from poll_voters
    where poll_id = ${pollId} and user_id = ${userId}
  `;
  return rows.length > 0;
}

export async function castVote(
  pollId: string,
  userId: string,
  optionIds: string[],
): Promise<void> {
  try {
    await sql.transaction((txn) => [
      txn`insert into poll_voters (poll_id, user_id) values (${pollId}, ${userId})`,
      ...optionIds.map(
        (optionId) =>
          txn`insert into votes (poll_id, option_id) values (${pollId}, ${optionId})`,
      ),
    ]);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AlreadyVotedError();
    }
    throw error;
  }
}
