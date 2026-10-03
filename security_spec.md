# Security Specification - SPI 1A Firestore Security Rules

## 1. Data Invariants
1. **Default Deny**: Any unmatched document path is strictly inaccessible (`allow read, write: if false;`).
2. **Bootstrapped Admin Access**: The application administrator (`luthfif882@gmail.com` or documents in `/admins/{uid}`) has full CRUD permissions for managing students, schedules, assignments, announcements, cash transactions, class structure, and moderation.
3. **Student Profile Integrity**: Only administrators can create, update, or delete student directory records. Members can read student data.
4. **Schedule & Assignment Integrity**: Only administrators can modify lecture schedules and assignments. Members have read-only access.
5. **Cash Treasury Integrity**: Cash transactions and payment tracking can only be added, updated, or deleted by administrators to prevent fraud. Members can read.
6. **Birthday Message Integrity**: A member can only create birthday messages with `senderUid == request.auth.uid`. A member can edit or delete their own messages. Admins can delete inappropriate messages.
7. **Message Wall Integrity**: A user can write to the message wall with their own `senderUid`. A user can delete their own wall message, and admins can delete any wall message.
8. **Documentation / Memories Integrity**: Only admins can upload, edit, or delete class memory documentation.
9. **User Profile Isolation**: Users can only update their own profile document (`/users/{uid}`), and cannot elevate their role to `admin` unless verified in `/admins/`.
10. **ID and Payload Validation**: Document IDs and payloads must pass strict string length checks and pattern validation to avoid Denial of Wallet and resource exhaustion.

---

## 2. The "Dirty Dozen" Payloads (Malicious / Invalid Payloads)
1. **Payload 1 (Privilege Escalation on User Profile)**:
   A standard member tries to write `{ "role": "admin" }` to `/users/{uid}`.
2. **Payload 2 (Unauthenticated Student Modification)**:
   An anonymous or unauthenticated client attempts `setDoc` on `/students/2661310019`.
3. **Payload 3 (Member Editing Schedule)**:
   An authenticated member attempts to alter course time or lecturer in `/schedules/{id}`.
4. **Payload 4 (Ghost Field Injection in Cash Transaction)**:
   A user injects arbitrary unknown fields `{ "amount": 1000000, "hack": true, "backdoor": "open" }`.
5. **Payload 5 (Impersonation in Birthday Message)**:
   User `user_A` writes a birthday message with `senderUid: "user_B"`.
6. **Payload 6 (Tampering with Someone Else's Birthday Message)**:
   User `user_B` attempts to update or delete a message authored by `user_A`.
7. **Payload 7 (Member Tampering with Class Treasury)**:
   A non-admin writes an `income` transaction of Rp 50.000.000 to `/cash_transactions`.
8. **Payload 8 (Giant String Denial of Wallet)**:
   A client sends a 2MB string as student name or message.
9. **Payload 9 (ID Traversal / ID Poisoning)**:
   A client tries to write to document ID `../../system/compromise` or containing special characters.
10. **Payload 10 (Direct Modification of Admin List)**:
    A non-admin user attempts to create a document in `/admins/{uid}`.
11. **Payload 11 (Fabricated Announcement by Non-Admin)**:
    A student member creates a fake official announcement in `/announcements`.
12. **Payload 12 (Direct Deletion of Class Structure by Member)**:
    A member attempts `deleteDoc` on `/class_structure/ketua`.

---

## 3. Test Runner Design (`firestore.rules.test.ts`)
Tests assert that all 12 scenarios fail with `PERMISSION_DENIED` under Firestore rules evaluation.
