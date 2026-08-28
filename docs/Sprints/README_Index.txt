ShopSphere Sprint 0-24 - Platform-specific document set

For every sprint there are three independent documents:
1. Backend + DB
2. Customer Portal
3. Admin Portal

Recommended implementation order inside each feature: contract -> DB -> backend -> platform client -> integration -> tests -> acceptance.
The three documents are deliberately segregated to avoid mixing platform behavior.
