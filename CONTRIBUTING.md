# CONTRIBUTING.md

Thanks for considering a contribution! 🙌 This project welcomes fixes, features, docs, and examples.

## Developer Certificate of Origin (DCO)

We use the **Developer Certificate of Origin**. By contributing, you assert that you have the right to submit your work under the project license. See the full text at [https://developercertificate.org/](https://developercertificate.org/).

**All commits must be signed off.** Add a `Signed-off-by` line to your commit message, which is easiest via the `-s` flag:

```bash
# one-time: set your real name and email (must match the sign-off)
git config user.name  "Your Real Name"
git config user.email "you@example.com"

# sign off your commit
git commit -s -m "feat: add Visual Groups Editor"
```

This adds a footer like:

```
Signed-off-by: Your Real Name <you@example.com>
```

If you forgot to sign off:

```bash
git commit --amend -s --no-edit
# then push with force-if-safe
git push --force-with-lease
```

**Co-authors:** each contributor should add their own `Signed-off-by` line. You can still use `Co-authored-by:` lines as usual.

---

## Dev Setup

```bash
npm ci
npm run dev   # Vite dev server; open demo/builder.html
npm run build # outputs dist/*.es.js and dist/*.umd.cjs
```

## Commit Style

Use **Conventional Commits**:

* `feat: …`, `fix: …`, `docs: …`, `chore: …`, `refactor: …`, etc.

## Pull Requests

1. Create a feature branch: `feat/your-topic`
2. Include or update a demo under `demo/` when relevant
3. Update README/CHANGELOG if behavior changes
4. Ensure all commits are **signed off** (DCO)

## Coding Notes

* Renderer is framework‑agnostic; DOM only
* Builder UI should rely on public formBuilder hooks (userAttrs, `onOpenFieldEdit`)
* Keep rule matching **name‑based** (no CSS class coupling)

