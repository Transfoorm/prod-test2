# Dev Knox Protocol

## The Short Version

You can commit and push freely to main for **any file** in this repo — **except these 10 protected items:**

1. `eslint.config.mjs`
2. `eslint-custom-rules/`
3. `package.json`
4. `tsconfig*`
5. `scripts/`
6. `.husky/`
7. `.vrp-approval*`
8. `.github/`
9. `src/middleware.ts`
10. `.claude/`

Touch any of these? You need **Ken's approval** before it can merge.

---

## What Happens If You Touch a Protected File

### Step 1: Local Warning (Pre-Commit Hook)

When you try to commit, you'll see:

```
═══════════════════════════════════════════════════════════════
  🛑 STOP! YOU ARE WASTING YOUR TIME!
═══════════════════════════════════════════════════════════════

  Even if you bypass this hook, GitHub will BLOCK your push.
  These files are protected by CODEOWNERS - only @Metafoorm
  can approve changes. There is NO backdoor. NO bypass.

═══════════════════════════════════════════════════════════════
  🚫 --no-verify IS USELESS
  Go ahead, try it. GitHub will still reject your push.
  Server-side enforcement. No local bypass possible.
═══════════════════════════════════════════════════════════════
```

Your commit is **blocked**.

### Step 2: Even If You Bypass Locally...

Let's say you use `git commit --no-verify` to skip the hook. Fine. You commit locally.

Now you try `git push origin main`:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Cannot update this protected ref.
remote: - Changes must be made through a pull request.
```

**Blocked by GitHub.** Server-side. No local bypass possible.

---

## How to Get Approval for Protected Files

1. **Create a feature branch**
   ```bash
   git checkout -b my-feature-branch
   ```

2. **Make your changes** to the protected file(s)

3. **Commit and push to your branch**
   ```bash
   git add .
   git commit -m "description of changes"
   git push origin my-feature-branch
   ```

4. **Create a Pull Request** on GitHub
   - Go to the repo on GitHub
   - Click "Compare & pull request"
   - Describe what you're changing and why

5. **Wait for Ken's approval**
   - GitHub automatically requests Ken's review (CODEOWNERS)
   - CI checks run (ESLint, TypeScript, Build)
   - Ken reviews and approves (or requests changes)

6. **Merge** — only after approval

---

## For Everything Else: Push Freely

Any file NOT in the protected list? Commit and push directly to main. No PR needed. No approval needed.

```bash
git add .
git commit -m "your changes"
git push origin main
```

Works instantly. No hoops.

---

## Why These 10 Are Protected

| Protected Item | Why |
|----------------|-----|
| `eslint.config.mjs` | Code quality rules — changing these affects the entire codebase |
| `eslint-custom-rules/` | Custom enforcement rules — VRP/FUSE doctrine |
| `package.json` | Dependencies — security and stability |
| `tsconfig*` | TypeScript config — affects all type checking |
| `scripts/` | Build/enforcement scripts — CI/CD integrity |
| `.husky/` | Git hooks — local enforcement |
| `.vrp-approval*` | Approval tokens — can't self-approve |
| `.github/` | Workflows & CODEOWNERS — protects the protection |
| `src/middleware.ts` | Auth/routing gate — security critical |
| `.claude/` | AI guardrails — keeps Claude in check |

---

## Summary

| What you're doing | What happens |
|-------------------|--------------|
| Push normal code to main | ✅ Works instantly |
| Touch a protected file | 🛑 Blocked — need PR + Ken's approval |
| Try to bypass with `--no-verify` | 🛑 Still blocked by GitHub |
| Try to push protected file directly | 🛑 Blocked by GitHub |
| Create PR for protected file | ✅ Ken reviews and approves |

No backdoors. No bypasses. Server-side enforcement.
