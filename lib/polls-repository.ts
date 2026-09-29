import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

export type ChoiceMode = "single" | "multiple";
export type ResultsVisibility = "live" | "after_close";

export type NewPoll = {
  question: string;
  options: string[];
  choiceMode: ChoiceMode;
  deadline: Date | null;
  resultsVisibility: ResultsVisibility;
  createdBy: string;
};

export async function createPoll(input: NewPoll): Promise<{ id: string }> {
  const pollId = randomUUID();
  const deadline = input.deadline?.toISOString() ?? null;

  await sql.transaction((txn) => [
    txn`
      insert into polls (
        id, question, choice_mode, deadline, results_visibility, created_by
      )
      values (
        ${pollId}, ${input.question}, ${input.choiceMode}, ${deadline},
        ${input.resultsVisibility}, ${input.createdBy}
      )
    `,
    ...input.options.map(
      (label, position) =>
        txn`
          insert into poll_options (poll_id, label, position)
          values (${pollId}, ${label}, ${position})
        `,
    ),
  ]);

  return { id: pollId };
}

export type PollOption = {
  id: string;
  label: string;
  position: number;
};

export type PollSummary = {
  id: string;
  question: string;
  choiceMode: ChoiceMode;
  deadline: Date | null;
  resultsVisibility: ResultsVisibility;
  closedAt: Date | null;
  createdAt: Date;
};

export type PollDetail = PollSummary & {
  options: PollOption[];
};

function toPollSummary(row: {
  id: string;
  question: string;
  choiceMode: ChoiceMode;
  deadline: string | null;
  resultsVisibility: ResultsVisibility;
  closedAt: string | null;
  createdAt: string;
}): PollSummary {
  return {
    id: row.id,
    question: row.question,
    choiceMode: row.choiceMode,
    deadline: row.deadline ? new Date(row.deadline) : null,
    resultsVisibility: row.resultsVisibility,
    closedAt: row.closedAt ? new Date(row.closedAt) : null,
    createdAt: new Date(row.createdAt),
  };
}

export async function listPolls(): Promise<PollSummary[]> {
  const rows = await sql`
    select
      id, question, choice_mode as "choiceMode", deadline,
      results_visibility as "resultsVisibility", closed_at as "closedAt",
      created_at as "createdAt"
    from polls
    where deleted_at is null
    order by created_at desc
  `;
  return (rows as Parameters<typeof toPollSummary>[0][]).map(toPollSummary);
}

export async function findPollById(id: string): Promise<PollDetail | null> {
  const pollRows = await sql`
    select
      id, question, choice_mode as "choiceMode", deadline,
      results_visibility as "resultsVisibility", closed_at as "closedAt",
      created_at as "createdAt"
    from polls
    where id = ${id} and deleted_at is null
  `;
  const pollRow = pollRows[0] as Parameters<typeof toPollSummary>[0] | undefined;
  if (!pollRow) return null;

  const optionRows = await sql`
    select id, label, position
    from poll_options
    where poll_id = ${id}
    order by position asc
  `;

  return {
    ...toPollSummary(pollRow),
    options: optionRows as PollOption[],
  };
}

export type OptionTally = {
  optionId: string;
  label: string;
  count: number;
};

export async function getResultTallies(pollId: string): Promise<OptionTally[]> {
  const rows = await sql`
    select
      po.id as "optionId",
      po.label,
      count(v.id)::int as count
    from poll_options po
    left join votes v on v.option_id = po.id
    where po.poll_id = ${pollId}
    group by po.id, po.label, po.position
    order by po.position asc
  `;
  return rows as OptionTally[];
}

export async function hasAnyVotes(pollId: string): Promise<boolean> {
  const rows = await sql`
    select 1 from votes where poll_id = ${pollId} limit 1
  `;
  return rows.length > 0;
}

export type PollEdit = {
  question: string;
  options: string[];
  choiceMode: ChoiceMode;
  deadline: Date | null;
  resultsVisibility: ResultsVisibility;
};

export async function updatePoll(
  pollId: string,
  input: PollEdit,
): Promise<void> {
  const deadline = input.deadline?.toISOString() ?? null;

  await sql.transaction((txn) => [
    txn`
      update polls
      set question = ${input.question}, choice_mode = ${input.choiceMode},
          deadline = ${deadline}, results_visibility = ${input.resultsVisibility}
      where id = ${pollId}
    `,
    txn`delete from poll_options where poll_id = ${pollId}`,
    ...input.options.map(
      (label, position) =>
        txn`
          insert into poll_options (poll_id, label, position)
          values (${pollId}, ${label}, ${position})
        `,
    ),
  ]);
}

export async function softDeletePoll(pollId: string): Promise<void> {
  await sql`
    update polls set deleted_at = now() where id = ${pollId}
  `;
}

export async function listTrashedPolls(): Promise<PollSummary[]> {
  const rows = await sql`
    select
      id, question, choice_mode as "choiceMode", deadline,
      results_visibility as "resultsVisibility", closed_at as "closedAt",
      created_at as "createdAt"
    from polls
    where deleted_at is not null
    order by created_at desc
  `;
  return (rows as Parameters<typeof toPollSummary>[0][]).map(toPollSummary);
}

export async function restorePoll(pollId: string): Promise<void> {
  await sql.transaction((txn) => [
    txn`delete from votes where poll_id = ${pollId}`,
    txn`delete from poll_voters where poll_id = ${pollId}`,
    txn`update polls set deleted_at = null where id = ${pollId}`,
  ]);
}

export async function hardDeletePoll(pollId: string): Promise<void> {
  await sql`delete from polls where id = ${pollId}`;
}
