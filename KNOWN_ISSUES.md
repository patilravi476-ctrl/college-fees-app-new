# KNOWN ISSUES

This document tracks known bugs, limitations, and planned fixes for the CPTC Fees Module.

---

## High Priority

### Duplicate Transaction Entries
Status: Investigating

Description:
- Some students show multiple transaction records unexpectedly.
- Transaction history may contain duplicate entries.

Impact:
- Financial reports may become inaccurate.
- Receipt history may be confusing.

---

### Receipt History Consistency
Status: Investigating

Description:
- Verify that each payment creates exactly one receipt.
- Verify that reprinting receipts does not generate new transactions.

Impact:
- Financial audit accuracy.

---

### Transaction ID Validation
Status: Pending Review

Description:
- Verify uniqueness of UPI / Bank Transaction IDs.
- Prevent duplicate transaction references.

Impact:
- Payment tracking reliability.

---

## Medium Priority

### Firebase Migration
Status: Planned

Description:
- Move data storage from LocalStorage to Firebase Firestore.

Benefits:
- Multi-device access.
- Better data persistence.
- Centralized database.

---

### Backup & Restore System
Status: Planned

Description:
- Allow export and import of student and transaction data.

Benefits:
- Disaster recovery.
- Data portability.

---

## Low Priority

### Advanced Reports
Status: Planned

### SMS / WhatsApp Notifications
Status: Planned

### QR Receipt Verification
Status: Planned

---

## Last Updated

2026-06-16
