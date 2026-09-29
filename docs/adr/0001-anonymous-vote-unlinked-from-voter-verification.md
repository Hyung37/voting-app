# Anonymous votes, unlinked from the casting User account

**Status**: accepted

Voters must have a User account (created by checking that its name + date of birth aren't already registered to another account) so we can stop the same account voting twice on a Poll and tell apart two people who share a name and birthdate. We still store the Vote itself (Poll + Option chosen) with no reference to the casting User's account — only a separate "has this account already voted on this Poll" record exists for the one-vote-per-account check. This means not even an Operator can see which account cast which Vote, only aggregate Option tallies. The alternative of storing a direct User-to-Vote link was rejected because it would let an Operator deanonymize any ballot; the alternative of no accounts at all (matching by name + date of birth per Poll) was rejected because it couldn't distinguish two different people sharing a name and birthdate.
