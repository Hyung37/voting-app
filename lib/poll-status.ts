export type PollStatus = {
  closedAt: Date | null;
  deadline: Date | null;
  resultsVisibility: "live" | "after_close";
};

export function isPollOpen(
  poll: Pick<PollStatus, "closedAt" | "deadline">,
): boolean {
  if (poll.closedAt) return false;
  if (poll.deadline && poll.deadline.getTime() <= Date.now()) return false;
  return true;
}

export function canViewResults(poll: PollStatus): boolean {
  if (poll.resultsVisibility === "live") return true;
  return !isPollOpen(poll);
}
