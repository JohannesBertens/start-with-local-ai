# PR #1 Review: Interactive sliders, cost comparison & PNG export

**Branch:** `fix/calculator-issues`  
**Files changed:** `src/pages/CalculatorPage.tsx`, `src/pages/CalculatorPage.module.css`, `package.json`, `package-lock.json`  
**Overall:** Solid feature work. The log-scale sliders are a UX improvement, the cost comparison is a useful addition, and the export is straightforward. Below are findings ordered by severity.

---

## Cost Formula Correctness

### 🟡 Correctness issue — Per-1K token cost displays `$0.00` for typical local-inference scenarios

**Location:** `CalculatorPage.tsx`, Local cost card "Per 1K tokens" display (line ~499)

```tsx
${localPer1K < 0.00001 ? '< $0.00001' : round2(localPer1K) <= 0 ? '$0.00' : '$' + round2(localPer1K).toFixed(5)}
```

`round2()` rounds to 2 decimal places. With the default inputs ($3000 hardware, 3yr, 300W, $0.12/kWh, 30 tok/s), `localPer1K ≈ $0.00139`. `round2(0.00139)` → `0`, so the second branch fires and displays **`$0.00`** even though the real cost is non-zero. The per-1K column is essentially broken for all realistic local scenarios.

**Fix:** Don't pre-round with `round2()` before displaying at 5 decimals. Use the raw value:
```tsx
{localPer1K < 0.00001 ? '< $0.00001' : localPer1K < 0.001 ? '$' + localPer1K.toFixed(5) : '$' + localPer1K.toFixed(3)}
```

### 🟡 Correctness issue — API per-1K cost rounds `$0.0055` up to `$0.01000`

**Location:** `CalculatorPage.tsx`, API cost card "Per 1K tokens" (line ~524)

For GPT-4o at 60% input ratio, `apiPer1K = $0.0055`. `round2(0.0055) = 0.01`, displayed as **`$0.01000`** — nearly **2×** the actual cost. Same root cause as above: `round2()` truncates precision needed for per-1K pricing.

### 🟡 Correctness issue — KV cache formula off by ~4 orders of magnitude (pre-existing, not introduced by this PR)

**Location:** `CalculatorPage.tsx:131–134`, `calculate()` function

```ts
const hiddenDim = Math.round(Math.sqrt(billions * 1e9) * 3.5);
const nLayers   = Math.round(Math.sqrt(billions * 1e9) * 0.15);
const kvCacheGb = (2 * 2 * hiddenDim * nLayers * contextLen) / 1e9 / 1e9;
```

For 8B params: `hiddenDim ≈ 313,050`, `nLayers ≈ 13,416`. Real Llama-3-8B has `hidden_dim = 4096`, `n_layers = 32`. The formula produces `kvCacheGb ≈ 0.000069 GB` vs the real ~2.15 GB. The result is that the KV cache line always shows `0.00 GB`, making the total estimate effectively just `weights + overhead`.

This is a pre-existing bug (identical in `main`), but since this PR is focused on calculator correctness (WEB-47/48/49), it's worth fixing now. A simpler and more accurate approach:

```ts
// Empirical: kv_bytes_per_token ≈ 2 * 2 * (2/3) * d_model * n_layers
// With d_model * n_layers ≈ 2 * params (for typical transformer configs)
const kvBytesPerToken = 4 * (2 * billions * 1e9) / 3;
const kvCacheGb = (kvBytesPerToken * contextLen) / 1e9;
```

### 🟡 Correctness issue — `isEqual` comparison uses strict float equality; dead code

**Location:** `CalculatorPage.tsx:170`

```ts
const isEqual = localPer1M === apiPer1M && apiProviderId !== 'local';
```

`localPer1M` and `apiPer1M` are computed via different arithmetic paths. Strict `===` equality on two floats will essentially never be true, making the "Equal" badge unreachable. Consider a tolerance-based comparison:

```ts
const isEqual = Math.abs(localPer1M - apiPer1M) < 0.001 && apiProviderId !== 'local';
```

---

## Edge Cases & Input Validation

### 🟡 Correctness issue — `NaN` propagation when users type non-numeric text in cost inputs

**Location:** All number inputs with `Math.max(n, Number(e.target.value))` (lines 437, 445, 453)

```ts
onChange={(e) => setHardwareCost(Math.max(0, Number(e.target.value)))}
```

`Number('abc')` → `NaN`. `Math.max(0, NaN)` → `NaN`. Once `hardwareCost` is `NaN`, all downstream computations (`localPer1M`, `localPer1K`) become `NaN`, and the cost cards display `$NaN`.

**Fix:** Guard against NaN:
```ts
onChange={(e) => {
  const n = Number(e.target.value);
  setHardwareCost(Number.isNaN(n) ? 0 : Math.max(0, n));
}}
```

### 🟢 Suggestion — No upper bound validation on hardware cost, power draw, or electricity rate

A user can type `$999,999,999` for hardware cost or `1,000,000W` for power draw. While the formula handles it mathematically, the resulting costs become nonsensical. Consider clamping to reasonable maximums (e.g., hardware ≤ $50,000, power ≤ 2000W).

### 🟢 Suggestion — `lifespanYears` minimum of 1 allows `0.05` (3 weeks) via keyboard input

The `<input min={1} step={1}>` only constrains the spinner buttons. A user can type `0.05` directly, leading to `localPer1M` = 20× the 1-year value. Consider `Math.max(0.5, ...)` or `parseInt` with validation.

---

## Export (PNG)

### 🟡 Correctness issue — Exported PNG includes the "Export as PNG" button

**Location:** `captureRef` is on the `.layout` div (line 244), which contains the `.exportRow` div.

The captured image includes the export button at the bottom. Users sharing the PNG will include a confusing button artifact.

**Fix:** Move `captureRef` to a wrapper that excludes the export row, or filter the export button during capture using `html-to-image`'s `filter` option:

```ts
await toPng(captureRef.current, {
  pixelRatio: 2,
  quality: 1,
  filter: (node) => !node.classList?.contains(styles.exportRow),
});
```

### 🟢 Suggestion — `html-to-image` `quality: 1` has no effect for PNG

PNG is lossless; the `quality` parameter is only relevant for JPEG. Not harmful, but misleading. Remove or add a comment.

### 🟢 Suggestion — Export has no loading state in the DOM while `captureRef.current` is missing

```ts
if (!captureRef.current) return;
```

This silently does nothing. If the ref isn't attached (e.g., during SSR or before mount), the user clicks and nothing happens with no feedback. Consider a guard message.

---

## Accessibility (ARIA)

### 🟢 Suggestion — `aria-valuetext` would improve screen reader experience for log-scale sliders

The param and context sliders use `aria-valuenow` (e.g., `8` for 8B params). Screen readers will announce "8" but the unit isn't clear from `aria-label` alone on all readers. Adding `aria-valuetext="8 billion parameters"` would give a much better experience:

```tsx
aria-valuetext={formatParams(paramVal) + ' parameters'}
```

### ⚪ Style nit — `aria-hidden="true"` on slider value spans is correct

Good practice — the visual value is supplementary to the range input's accessible name and value. No issue.

---

## Slider Implementation

### ⚪ Style nit — Speed slider uses a different mapping strategy than param/context sliders

Param and ctx sliders map `0-1000` → log scale internally. Speed slider maps `min-max` (1-200) linearly, but stores an intermediate `speedSlider` state as `0-1000` that's converted back and forth. This is inconsistent and adds unnecessary complexity. Since speed is linear, the state could just be the direct `speedTps` value:

```ts
const [speedTps, setSpeedTps] = useState(SPEED_DEFAULT);
// ...
onChange={(e) => setSpeedTps(Number(e.target.value))}
```

### 🟢 Suggestion — `formatContext` has redundant branches

```ts
if (val >= CTX_MAX) return '1M';
if (val >= 1048576) return '1M';   // CTX_MAX === 1048576, so this is unreachable
```

Since `CTX_MAX = 1048576`, the second check is identical to the first.

---

## Cost Model Design

### 🟢 Suggestion — Local cost assumes 100% GPU utilization (24/7 full power)

The formula divides hardware cost evenly across all seconds in the lifespan and assumes full power draw at all times. In practice, a GPU is idle most of the time. This inflates the local per-token cost. Consider adding a "utilization %" input (default ~20%) or noting the assumption in the UI.

### 🟢 Suggestion — Input token ratio range of 50–100% prevents exploring output-heavy workloads

The slider clamps at 50% input (50% output). Some use cases (e.g., summarization, code generation) have output ratios > 50%. Consider extending to 0–100%.

---

## Code Quality

### ⚪ Style nit — `handleQuantChange` is defined as a standalone handler but could be inline

All other `onChange` handlers are inline arrow functions. `handleQuantChange` breaks the pattern without adding readability.

### ⚪ Style nit — Unused `modelName` state

`modelName` is stored but never used in any calculation or display. If it's intended for the export filename or future use, add a comment; otherwise remove.

### ⚪ Style nit — `useCallback` on `handleExport` has empty deps

```ts
const handleExport = useCallback(async () => { ... }, []);
```

The empty dependency array is correct since the callback only uses refs and state setters (which are stable). No issue, just noting for clarity.

---

## Summary Table

| # | Severity | Category | Summary |
|---|----------|----------|---------|
| 1 | 🟡 Correctness | Cost display | Per-1K local cost shows `$0.00` due to premature `round2()` |
| 2 | 🟡 Correctness | Cost display | Per-1K API cost inflated 2× due to `round2()` |
| 3 | 🟡 Correctness | RAM formula | KV cache off by ~4 orders of magnitude (pre-existing) |
| 4 | 🟡 Correctness | Comparison | `isEqual` float comparison is dead code |
| 5 | 🟡 Correctness | Edge case | `NaN` propagation from non-numeric input |
| 6 | 🟡 Correctness | Export | PNG includes the export button itself |
| 7 | 🟢 Suggestion | Validation | No upper-bound clamps on cost inputs |
| 8 | 🟢 Suggestion | Validation | `lifespanYears` allows unreasonably small values |
| 9 | 🟢 Suggestion | Export | `quality: 1` has no effect for PNG |
| 10 | 🟢 Suggestion | ARIA | `aria-valuetext` would improve log-slider SR experience |
| 11 | 🟢 Suggestion | Cost model | 100% utilization assumption inflates local cost |
| 12 | 🟢 Suggestion | UX | Input ratio range 50–100% excludes output-heavy workloads |
| 13 | ⚪ Style | Code | Inconsistent handler style (`handleQuantChange` vs inline) |
| 14 | ⚪ Style | Code | Unused `modelName` state |
| 15 | ⚪ Style | Code | Speed slider uses different mapping strategy |
| 16 | ⚪ Style | Code | Redundant branch in `formatContext` |

**Recommendation:** Address findings #1–6 before merge. The per-1K display bugs (#1, #2) and NaN propagation (#5) will produce confusing output for users immediately. The KV cache fix (#3) is pre-existing but highly visible. The export including its own button (#6) is a polish issue that's easy to fix.
