# Security Specification - MockAI

## Data Invariants
1. A user can only access their own profile and interview history.
2. An interview record must be associated with the user who conducted it.
3. Only the admin can modify global system configurations.
4. Interview feedback and scores are "System-Only" fields that users should not be able to modify themselves.
5. Users can only create interviews for themselves.

## The "Dirty Dozen" Payloads
1. Attempt to create a user profile with a different UID.
2. Attempt to read another user's profile.
3. Attempt to read someone else's interview session.
4. Attempt to update an interview score after it's completed.
5. Attempt to inject a "role: admin" into a user profile creation.
6. Attempt to modify the global system prompt.
7. Attempt to delete an interview record that doesn't belong to the user.
8. Attempt to create an interview for a different user.
9. Attempt to update the `transcript` of a completed interview.
10. Attempt to read the `private` config subcollection (if any).
11. Attempt to create a user profile without a required `role` field.
12. Attempt to update `updatedAt` with a client-side timestamp instead of server timestamp.

## The Eight Pillars of Hardened Rules
All rules will follow the 8 pillars: Master Gate, Validation Blueprints, Path Variable Hardening, Tiered Identity Logic, Total Array Guarding, PII Isolation, existsAfter Atomicity, and Secure List Queries.
