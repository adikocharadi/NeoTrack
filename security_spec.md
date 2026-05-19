# Security Specification - NeoTrack NICU

## Data Invariants
1. A baby profile must have a valid `name`, `babyId`, `birthDateTime`, and `gaWeeks`/`gaDays`.
2. A weight entry must belong to an existing baby.
3. Weights must be positive numbers.
4. `status` must be one of: admitted, discharged, expired, transferred.
5. `sex` must be one of: male, female, other.
6. `createdBy` and `recordedBy` MUST match the `request.auth.uid`.

## The "Dirty Dozen" Payloads (Security TDD)

1. **Identity Spoofing**: Creating a baby profile with a different `createdBy` UID.
2. **Key Poisoning**: Adding a `isAdmin: true` field to a baby document.
3. **Status Shortcutting**: Updating a baby's status directly to `discharged` without being the creator (or authorized).
4. **ID Injection**: Using a 2KB string as a `babyId`.
5. **Orphaned Writes**: Creating a weight entry for a non-existent `babyId`.
6. **Future Birth**: Setting a `birthDateTime` in the future.
7. **Negative Weight**: Recording a weight of -500g.
8. **PII Leak**: A non-authenticated user attempting to list babies.
9. **History Tampering**: Modifying the `createdAt` of a weight entry.
10. **Shadow Fields**: Adding a `notes_internal` field not in the schema.
11. **Type Mismatch**: Sending `gaWeeks` as a string "32".
12. **Mass Update**: Attempting to change `birthWeight` after creation.

## Testing Strategy
All payloads above must return `PERMISSION_DENIED`.
Rules will enforce:
- `isValidBaby()`: Schema, types, sizes, regex IDs, authorized user.
- `isValidWeightEntry()`: Schema, types, sizes, parent exists.
- `hasOnly()`: Strict field updates.
- Server timestamps for all time fields.
