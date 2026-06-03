import { useState, useMemo } from 'react';
import styles from './CalculatorPage.module.css';

type Quant = 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q8' | 'fp16';

const QUANT_OPTIONS: { id: Quant; label: string; bitsPerWeight: number }[] = [
  { id: 'q2', label: 'Q2 (2-bit)', bitsPerWeight: 2.3 },
  { id: 'q3', label: 'Q3 (3-bit)', bitsPerWeight: 3.3 },
  { id: 'q4', label: 'Q4 (4-bit)', bitsPerWeight: 4.5 },
  { id: 'q5', label: 'Q5 (5-bit)', bitsPerWeight: 5.5 },
  { id: 'q6', label: 'Q6 (6-bit)', bitsPerWeight: 6.6 },
  { id: 'q8', label: 'Q8 (8-bit)', bitsPerWeight: 8.5 },
  { id: 'fp16', label: 'FP16 (16-bit)', bitsPerWeight: 16 },
];

const DEFAULT_QUANT: Quant = 'q4';

/** Convert a human-readable parameter count like "8" to raw billions (8e9). */
function parseParamCount(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, '');
  const match = cleaned.match(/^(\d+\.?\d*)([BbTtMm]?)$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const suffix = match[2].toLowerCase();
  switch (suffix) {
    case 'b':
      return num;
    case 't':
      return num * 1000;
    case 'm':
      return num / 1000;
    default:
      return num; // assume billions already
  }
}

interface CalcResult {
  weightsGb: number;
  kvCacheGb: number;
  overheadGb: number;
  totalGb: number;
}

function calculate(billions: number, bits: number, contextLen: number, overheadFactor: number): CalcResult {
  // Weights: params * bits per weight / 8 bits per byte / 1e9
  const weightsGb = (billions * bits) / 8;
  // KV cache: ~2 bytes * 2 (key + value) * layers (~40 for a typical transformer)
  //   hidden_dim ~ params^0.5 * ~500 (rough heuristic).
  //   Simplified: ~2 bytes * 2 * hidden * layers = rough constant per token.
  //   Using a simplified formula: 2 * (hidden_dim * layers) * context_length / 1e9
  //   Where hidden_dim * layers ≈ 0.25 * params_in_billions * 1e9 (rough empirical)
  //   Actually: kv_cache_bytes ≈ 2 * 2 * (0.5 * params^0.66) * context_length  — simplified:
  const hiddenDim = Math.round(Math.sqrt(billions * 1e9) * 3.5); // rough estimate
  const nLayers = Math.round(Math.sqrt(billions * 1e9) * 0.15);
  const kvCacheGb = (2 * 2 * hiddenDim * nLayers * contextLen) / 1e9 / 1e9;
  // Overhead: scratch buffers, intermediate activations, etc.
  const overheadGb = weightsGb * (overheadFactor - 1);
  const totalGb = weightsGb + kvCacheGb + overheadGb;

  return { weightsGb, kvCacheGb, overheadGb, totalGb };
}

export function CalculatorPage() {
  const [modelName, setModelName] = useState('');
  const [paramRaw, setParamRaw] = useState('8');
  const [quant, setQuant] = useState<Quant>(DEFAULT_QUANT);
  const [contextLen, setContextLen] = useState(4096);
  const [overheadFactor, setOverheadFactor] = useState(1.15);

  const quantDef = QUANT_OPTIONS.find((q) => q.id === quant) ?? QUANT_OPTIONS[3];
  const paramBillions = useMemo(() => {
    const parsed = parseParamCount(paramRaw);
    if (parsed === null) return null;
    return parsed;
  }, [paramRaw]);

  const result = useMemo<CalcResult | null>(() => {
    if (paramBillions === null || paramBillions <= 0) return null;
    return calculate(paramBillions, quantDef.bitsPerWeight, contextLen, overheadFactor);
  }, [paramBillions, quantDef.bitsPerWeight, contextLen, overheadFactor]);

  const handleQuantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuant(e.target.value as Quant);
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParamRaw(e.target.value);
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Model RAM Calculator</h1>
        <p className={styles.pageSubtitle}>
          Estimate how much memory a model needs based on its size, quantization, and context window.
        </p>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="calc-model-name">Model name</label>
            <input
              id="calc-model-name"
              className={styles.input}
              type="text"
              placeholder="e.g. Qwen 3.5 14B"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="calc-params">Parameters</label>
            <input
              id="calc-params"
              className={styles.input}
              type="text"
              inputMode="decimal"
              placeholder="e.g. 8, 14, 70, or 1.5"
              value={paramRaw}
              onChange={handleParamChange}
            />
            <p className={styles.hint}>
              Accepts numbers like <code>8</code>, <code>70</code>, <code>0.5</code>. Suffixes B (billions), M (millions), T (trillions) are optional — plain numbers are treated as billions.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="calc-quant">Quantization</label>
            <select
              id="calc-quant"
              className={styles.select}
              value={quant}
              onChange={handleQuantChange}
            >
              {QUANT_OPTIONS.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label} ({q.bitsPerWeight.toFixed(1)} bpw)
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="calc-ctx">Context length</label>
              <input
                id="calc-ctx"
                className={styles.input}
                type="number"
                min={1}
                max={1048576}
                value={contextLen}
                onChange={(e) => setContextLen(Math.max(1, Number(e.target.value)))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="calc-overhead">Overhead factor</label>
              <input
                id="calc-overhead"
                className={styles.input}
                type="number"
                min={1.0}
                max={2.0}
                step={0.05}
                value={overheadFactor}
                onChange={(e) => setOverheadFactor(Math.max(1.0, Number(e.target.value)))}
              />
            </div>
          </div>
        </form>

        <div className={styles.result}>
          {result !== null && paramBillions !== null ? (
            <>
              <div className={styles.total}>
                <span className={styles.totalValue}>{result.totalGb.toFixed(1)}</span>
                <span className={styles.totalUnit}>GB</span>
                <span className={styles.totalLabel}>estimated total</span>
              </div>

              <div className={styles.breakdown}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Weights</span>
                  <span className={styles.rowValue}>{result.weightsGb.toFixed(1)} GB</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>KV cache ({contextLen.toLocaleString()} tokens)</span>
                  <span className={styles.rowValue}>{result.kvCacheGb.toFixed(2)} GB</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Overhead ({((overheadFactor - 1) * 100).toFixed(0)}%)</span>
                  <span className={styles.rowValue}>{result.overheadGb.toFixed(1)} GB</span>
                </div>
                <div className={`${styles.row} ${styles.totalRow}`}>
                  <span className={styles.rowLabel}>Total</span>
                  <span className={styles.rowValue}>{result.totalGb.toFixed(1)} GB</span>
                </div>
              </div>

              <hr className={styles.divider} />

              <details className={styles.formulaDetails}>
                <summary className={styles.formulaSummary}>View formula</summary>
                <div className={styles.formula}>
                  <p><strong>Weights</strong> = params × bits_per_weight ÷ 8</p>
                  <p><strong>KV cache</strong> ≈ 2 × 2 × hidden_dim × layers × context_len</p>
                  <p><strong>Overhead</strong> = weights × (overhead_factor − 1)</p>
                </div>
              </details>
            </>
          ) : (
            <div className={styles.empty}>
              <p>Enter a parameter count above to see the estimated memory usage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
