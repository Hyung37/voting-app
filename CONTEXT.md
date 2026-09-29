# Voting App

A simple polling application where an Operator publishes Polls for anyone to vote on and see results for.

## Language

**Poll**:
A single question with a fixed set of Options that Voters cast a Vote against. Only the Operator can create, edit, or delete a Poll.
_Avoid_: Question, survey

**Option**:
One of the selectable answers attached to a Poll.
_Avoid_: Choice, item

**Operator**:
A permission granted to an existing User account by another Operator, giving that account the ability to create, edit, and delete Polls. Not a separate account type — any User can be made an Operator; there is no separate sign-up for it.
_Avoid_: Admin, manager, owner, operator account

**User**:
An account identified by a verified email and authenticated with a password. Sign-up only completes once the given email is verified and its accompanying name and date of birth aren't already registered to another account, so one real person can't hold two accounts. The base account type for anyone using the app; an Operator is a User with a permission added on top.
_Avoid_: Account, member

**Voter**:
A logged-in User casting a Vote on a Poll. A Voter's account is never linked to the Option they chose, even for an Operator — the account is only checked against whether it has already voted on this Poll.
_Avoid_: Participant

**Vote**:
A Voter's submitted choice of one Option (or several, if the Poll allows multiple) on a Poll, recorded with no reference to the casting User's account.
_Avoid_: Ballot, response

**Trash**:
A holding area for a deleted Poll before it is permanently erased. A Poll in the Trash is invisible to Voters. The Operator can either erase it permanently or restore it, but restoring brings back only the Poll and its Options — every Vote cast against it is discarded, so a restored Poll returns to its pre-vote state.
_Avoid_: Recycle bin, archive
