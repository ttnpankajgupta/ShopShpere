# Sprint Execution Prompt Template

Use this after the framework is installed.

```text
Execute ShopSphere Sprint S<N>.

Sprint documents are the source of truth:
- Backend + DB: ShopSphere_S<N>_backend_db.pdf
- Customer Portal: ShopSphere_S<N>_customer_portal.pdf
- Admin Portal: ShopSphere_S<N>_admin_portal.pdf

Use the Main Orchestrator.

Requirements:
1. Read all three documents before coding.
2. Inspect the existing repository before modifying anything.
3. Create a task/dependency ledger.
4. Delegate to specialist agents.
5. Parallelize only safe independent tasks.
6. Use isolated worktrees for conflicting code changes.
7. Follow contract -> DB -> backend -> platform -> integration -> tests -> acceptance.
8. Do not invent scope where a platform document says "No new feature".
9. Run QA against every acceptance criterion and test case.
10. Run security review where applicable.
11. Run final debugger/code review.
12. Do not report PASS unless the feature is actually verified.

Start with the PLAN and TASK LEDGER. Then execute.
```
