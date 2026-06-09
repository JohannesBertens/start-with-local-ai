import { useState, useMemo, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import styles from './CalculatorPage.module.css';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

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

/* API provider pricing table */
interface ApiProvider {
  id: string;
  name: string;
  model: string;
  inputPrice: number;   // $ per 1M input tokens
  outputPrice: number;  // $ per 1M output tokens
}

const API_PROVIDERS: ApiProvider[] = [
  /* Anthropic (current non-deprecated models — prices as of June 2025) */
  { id: 'anthropic-fable-5',      name: 'Anthropic', model: 'Claude Fable 5',              inputPrice: 10.00, outputPrice: 50.00 },
  { id: 'anthropic-mythos-5',     name: 'Anthropic', model: 'Claude Mythos 5',             inputPrice: 10.00, outputPrice: 50.00 },
  { id: 'anthropic-opus-48',      name: 'Anthropic', model: 'Claude Opus 4.8',             inputPrice: 5.00,  outputPrice: 25.00 },
  { id: 'anthropic-opus-47',      name: 'Anthropic', model: 'Claude Opus 4.7',             inputPrice: 5.00,  outputPrice: 25.00 },
  { id: 'anthropic-opus-46',      name: 'Anthropic', model: 'Claude Opus 4.6',             inputPrice: 5.00,  outputPrice: 25.00 },
  { id: 'anthropic-opus-45',      name: 'Anthropic', model: 'Claude Opus 4.5',             inputPrice: 5.00,  outputPrice: 25.00 },
  { id: 'anthropic-sonnet-46',    name: 'Anthropic', model: 'Claude Sonnet 4.6',           inputPrice: 3.00,  outputPrice: 15.00 },
  { id: 'anthropic-sonnet-45',    name: 'Anthropic', model: 'Claude Sonnet 4.5',           inputPrice: 3.00,  outputPrice: 15.00 },
  { id: 'anthropic-haiku-45',     name: 'Anthropic', model: 'Claude Haiku 4.5',            inputPrice: 1.00,  outputPrice: 5.00 },
  /* OpenAI (current standard models — prices from developers.openai.com) */
  { id: 'openai-gpt55',           name: 'OpenAI',    model: 'GPT-5.5',                     inputPrice: 5.00,  outputPrice: 30.00 },
  { id: 'openai-gpt54',           name: 'OpenAI',    model: 'GPT-5.4',                     inputPrice: 2.50,  outputPrice: 15.00 },
  { id: 'openai-gpt54-mini',      name: 'OpenAI',    model: 'GPT-5.4 mini',                inputPrice: 0.75,  outputPrice: 4.50 },
  { id: 'openai-gpt54-nano',      name: 'OpenAI',    model: 'GPT-5.4 nano',                inputPrice: 0.20,  outputPrice: 1.25 },
  /* Groq */
  { id: 'groq-llama3-70b',        name: 'Groq',      model: 'Llama 3 70B',                 inputPrice: 0.59,  outputPrice: 0.79 },
  /* Local (no cost) */
  { id: 'local',                  name: 'Local',     model: 'N/A',                         inputPrice: 0,     outputPrice: 0 },
];

/* Slider ranges */
const PARAM_MIN = 0.5;
const PARAM_MAX = 1000;
const CTX_MIN = 1024;
const CTX_MAX = 1048576;
const SPEED_MIN = 1;
const SPEED_MAX = 200;
const SPEED_DEFAULT = 30;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Convert a linear 0-1000 slider position to a log-scale parameter value (billions). */
function sliderToParams(sliderVal: number): number {
  const fraction = sliderVal / 1000;
  const logMin = Math.log10(PARAM_MIN);
  const logMax = Math.log10(PARAM_MAX);
  const raw = Math.pow(10, logMin + fraction * (logMax - logMin));
  // Round to 2 significant digits
  return parseFloat(raw.toPrecision(2));
}

/** Convert a value in billions to a linear 0-1000 slider position. */
function paramsToSlider(val: number): number {
  const logMin = Math.log10(PARAM_MIN);
  const logMax = Math.log10(PARAM_MAX);
  const fraction = (Math.log10(val) - logMin) / (logMax - logMin);
  return Math.round(Math.min(1, Math.max(0, fraction)) * 1000);
}

/** Convert a linear 0-1000 slider position to a log-scale context length. */
function sliderToCtx(sliderVal: number): number {
  const fraction = sliderVal / 1000;
  const logMin = Math.log2(CTX_MIN);
  const logMax = Math.log2(CTX_MAX);
  return Math.round(Math.pow(2, logMin + fraction * (logMax - logMin)));
}

/** Convert a context length to a linear 0-1000 slider position. */
function ctxToSlider(val: number): number {
  const logMin = Math.log2(CTX_MIN);
  const logMax = Math.log2(CTX_MAX);
  const fraction = (Math.log2(val) - logMin) / (logMax - logMin);
  return Math.round(Math.min(1, Math.max(0, fraction)) * 1000);
}

/** Format a parameter value for display. */
function formatParams(val: number): string {
  if (val < 1) return val.toFixed(1) + 'B';
  if (val >= 1000) return '1000B';
  return val + 'B';
}

/** Format a context length for display. */
function formatContext(val: number): string {
  if (val >= CTX_MAX) return '1M';
  if (val >= 1024) return Math.round(val / 1024) + 'K';
  return String(val);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format a date as yyyy-mm-dd. */
function dateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ------------------------------------------------------------------ */
/*  RAM calculation                                                     */
/* ------------------------------------------------------------------ */

interface CalcResult {
  weightsGb: number;
  kvCacheGb: number;
  overheadGb: number;
  totalGb: number;
}

function calculate(billions: number, bits: number, contextLen: number, overheadFactor: number): CalcResult {
  const weightsGb = (billions * bits) / 8;
  const hiddenDim = Math.round(Math.sqrt(billions * 1e9) * 3.5);
  const nLayers = Math.round(Math.sqrt(billions * 1e9) * 0.15);
  const kvCacheGb = (2 * 2 * hiddenDim * nLayers * contextLen) / 1e9 / 1e9;
  const overheadGb = weightsGb * (overheadFactor - 1);
  const totalGb = weightsGb + kvCacheGb + overheadGb;
  return { weightsGb, kvCacheGb, overheadGb, totalGb };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function CalculatorPage() {
  /* ---- model / RAM inputs ---- */
  const [modelName, setModelName] = useState('');
  const [paramSlider, setParamSlider] = useState(paramsToSlider(8));
  const [quant, setQuant] = useState<Quant>(DEFAULT_QUANT);
  const [ctxSlider, setCtxSlider] = useState(ctxToSlider(4096));
  const [overheadFactor, setOverheadFactor] = useState(1.15);

  /* ---- speed slider ---- */
  const [speedTps, setSpeedTps] = useState(SPEED_DEFAULT);

  /* ---- cost comparison inputs ---- */
  const [apiProviderId, setApiProviderId] = useState(API_PROVIDERS[0].id);
  const [hardwareCost, setHardwareCost] = useState(3000);
  const [elecRate, setElecRate] = useState(0.12);
  const [powerDraw, setPowerDraw] = useState(300);
  const [lifespanYears, setLifespanYears] = useState(3);
  const [inputRatioSlider, setInputRatioSlider] = useState(60); // 0-100, represents %

  /* ---- export ---- */
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  /* ---- derived values ---- */
  const paramVal = sliderToParams(paramSlider);
  const ctxVal = sliderToCtx(ctxSlider);
  // speedTps is stored directly as the state
  const inputRatio = inputRatioSlider / 100;

  const quantDef = QUANT_OPTIONS.find((q) => q.id === quant) ?? QUANT_OPTIONS[3];

  const result = useMemo<CalcResult | null>(() => {
    if (paramVal <= 0) return null;
    return calculate(paramVal, quantDef.bitsPerWeight, ctxVal, overheadFactor);
  }, [paramVal, quantDef.bitsPerWeight, ctxVal, overheadFactor]);

  const selectedProvider = API_PROVIDERS.find((p) => p.id === apiProviderId) ?? API_PROVIDERS[0];

  const localPer1M = useMemo(() => {
    if (speedTps <= 0) return Infinity;
    const secondsPer1M = 1_000_000 / speedTps;
    const costPerSecond =
      hardwareCost / (lifespanYears * 365 * 24 * 3600) +
      (powerDraw / 1000) * elecRate / 3600;
    return costPerSecond * secondsPer1M;
  }, [hardwareCost, lifespanYears, powerDraw, elecRate, speedTps]);

  const safeVal = (v: number, fallback: number) => isNaN(v) ? fallback : v;

  const apiPer1M = useMemo(() => {
    return selectedProvider.inputPrice * inputRatio + selectedProvider.outputPrice * (1 - inputRatio);
  }, [selectedProvider, inputRatio]);

  const localPer1K = localPer1M / 1000;
  const apiPer1K = apiPer1M / 1000;

  const isLocalCheaper = localPer1M < apiPer1M && apiProviderId !== 'local';
  const isApiCheaper = apiPer1M < localPer1M && apiProviderId !== 'local';
  const isEqual = Math.abs(localPer1M - apiPer1M) < 0.001 && apiProviderId !== 'local';

  /* ---- event handlers ---- */
  const handleQuantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuant(e.target.value as Quant);
  };

  const handleExport = useCallback(async () => {
    if (!captureRef.current) {
      setExportError('Nothing to export. Please try again.');
      return;
    }
    setExportError(null);
    try {
      // Capture first (button still says "Export as PNG"), then show loading
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2 });
      setExporting(true);
      const link = document.createElement('a');
      link.download = `model-calculator-${dateStr()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setExportError('Failed to export image. Please try again.');
    } finally {
      setExporting(false);
    }
  }, []);

  /* ---- slider percentage for filled-track CSS ---- */
  const paramPct = (paramSlider / 10).toFixed(1);   // 0–100
  const ctxPct = (ctxSlider / 10).toFixed(1);
  const speedPct = ((speedTps - SPEED_MIN) / (SPEED_MAX - SPEED_MIN) * 100).toFixed(1);
  const inputRatioPct = inputRatioSlider.toFixed(0); // 0-100

  /* ---- render ---- */
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Model RAM Calculator</h1>
        <p className={styles.pageSubtitle}>
          Estimate how much memory a model needs based on its size, quantization, and context window.
        </p>
      </header>

      <div
        className={styles.layout}
        ref={captureRef}
      >
        {/* ============================================================== */}
        {/*  FORM                                                         */}
        {/* ============================================================== */}
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

          {/* ---- Parameters slider ---- */}
          <div className={styles.field}>
            <div className={styles.sliderHeader}>
              <label className={styles.label} htmlFor="calc-params">Parameters</label>
              <span className={styles.sliderValue} aria-hidden="true">
                {formatParams(paramVal)}
              </span>
            </div>
            <input
              id="calc-params"
              className={styles.inputRange}
              type="range"
              min={0}
              max={1000}
              step={1}
              value={paramSlider}
              onChange={(e) => setParamSlider(Number(e.target.value))}
              style={{ '--slider-pct': paramPct + '%' } as React.CSSProperties}
              aria-label="Model parameters in billions"
              aria-valuetext={`${formatParams(paramVal)}`}
            />
            <p className={styles.hint}>
              Range 0.5B – 1000B (logarithmic scale).
            </p>
          </div>

          {/* ---- Quantization ---- */}
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

          {/* ---- Context length slider ---- */}
          <div className={styles.field}>
            <div className={styles.sliderHeader}>
              <label className={styles.label} htmlFor="calc-ctx">Context length</label>
              <span className={styles.sliderValue} aria-hidden="true">
                {formatContext(ctxVal)}
              </span>
            </div>
            <input
              id="calc-ctx"
              className={styles.inputRange}
              type="range"
              min={0}
              max={1000}
              step={1}
              value={ctxSlider}
              onChange={(e) => setCtxSlider(Number(e.target.value))}
              style={{ '--slider-pct': ctxPct + '%' } as React.CSSProperties}
              aria-label="Context length in tokens"
              aria-valuetext={`${formatContext(ctxVal)} tokens`}
            />
            <p className={styles.hint}>
              Range 1K – 1M tokens (logarithmic scale).
            </p>
          </div>

          {/* ---- Speed slider (NEW) ---- */}
          <div className={styles.field}>
            <div className={styles.sliderHeader}>
              <label className={styles.label} htmlFor="calc-speed">Inference speed</label>
              <span className={styles.sliderValue} aria-hidden="true">
                {speedTps} tok/s
              </span>
            </div>
            <input
              id="calc-speed"
              className={styles.inputRange}
              type="range"
              min={SPEED_MIN}
              max={SPEED_MAX}
              step={1}
              value={speedTps}
              onChange={(e) => setSpeedTps(Number(e.target.value))}
              style={{ '--slider-pct': speedPct + '%' } as React.CSSProperties}
              aria-label="Inference speed in tokens per second"
              aria-valuetext={`${speedTps} tokens per second`}
            />
            <p className={styles.hint}>
              Estimated tokens per second for cost calculation.
            </p>
          </div>

          {/* ---- Overhead factor (kept as number input) ---- */}
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
              onChange={(e) => setOverheadFactor(Math.max(1.0, safeVal(Number(e.target.value), 1.15)))}
            />
          </div>
        </form>

        {/* ============================================================== */}
        {/*  RAM ESTIMATE RESULTS                                         */}
        {/* ============================================================== */}
        <div className={styles.result} id="calc-results">
          {result !== null ? (
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
                  <span className={styles.rowLabel}>KV cache ({ctxVal.toLocaleString()} tokens)</span>
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

        {/* ============================================================== */}
        {/*  COST COMPARISON (WEB-48)                                     */}
        {/* ============================================================== */}
        <div className={styles.costSection}>
          <h2 className={styles.costSectionTitle}>Cost comparison</h2>

          <div className={styles.costForm}>
            {/* ---- API provider ---- */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="calc-api-provider">API provider</label>
              <select
                id="calc-api-provider"
                className={styles.select}
                value={apiProviderId}
                onChange={(e) => setApiProviderId(e.target.value)}
              >
                {API_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} – {p.model}
                  </option>
                ))}
              </select>
            </div>

            {/* ---- Input ratio slider ---- */}
            <div className={styles.field}>
              <div className={styles.sliderHeader}>
                <label className={styles.label} htmlFor="calc-input-ratio">Input token ratio</label>
                <span className={styles.sliderValue} aria-hidden="true">{inputRatioSlider}%</span>
              </div>
              <input
                id="calc-input-ratio"
                className={styles.inputRange}
                type="range"
                min={0}
                max={100}
                step={1}
                value={inputRatioSlider}
                onChange={(e) => setInputRatioSlider(Number(e.target.value))}
                style={{ '--slider-pct': inputRatioPct + '%' } as React.CSSProperties}
                aria-label="Input token ratio percentage"
              />
              <p className={styles.hint}>
                What fraction of tokens are input vs output. Default 60%.
              </p>
            </div>

            {/* ---- Local cost inputs ---- */}
            <div className={styles.costInputsGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="calc-hw-cost">Hardware cost ($)</label>
                <input
                  id="calc-hw-cost"
                  className={styles.input}
                  type="number"
                  min={0}
                  step={100}
                  value={hardwareCost}
                  onChange={(e) => setHardwareCost(Math.max(0, safeVal(Number(e.target.value), 0)))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="calc-elec-rate">Electricity ($/kWh)</label>
                <input
                  id="calc-elec-rate"
                  className={styles.input}
                  type="number"
                  min={0}
                  step={0.01}
                  value={elecRate}
                  onChange={(e) => setElecRate(Math.max(0, safeVal(Number(e.target.value), 0)))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="calc-power">Power draw (W)</label>
                <input
                  id="calc-power"
                  className={styles.input}
                  type="number"
                  min={0}
                  step={10}
                  value={powerDraw}
                  onChange={(e) => setPowerDraw(Math.max(0, safeVal(Number(e.target.value), 0)))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="calc-lifespan">Lifespan (years)</label>
                <input
                  id="calc-lifespan"
                  className={styles.input}
                  type="number"
                  min={1}
                  step={1}
                  value={lifespanYears}
                  onChange={(e) => setLifespanYears(Math.max(1, safeVal(Number(e.target.value), 3)))}
                />
              </div>
            </div>
          </div>

          {/* ---- Side-by-side comparison ---- */}
          <div className={styles.costCards}>
            <div className={`${styles.costCard} ${isLocalCheaper ? styles.cheaperCard : ''}`}>
              <h3 className={styles.costCardTitle}>Local</h3>
              {isLocalCheaper && (
                <span className={styles.cheaperBadge}>Cheaper</span>
              )}
              <div className={styles.costRow}>
                <span className={styles.costRowLabel}>Per 1K tokens</span>
                <span className={styles.costRowValue}>
                  {localPer1K < 0.00001 ? '< $0.00001' : round2(localPer1K) <= 0 ? '$0.00' : '$' + round2(localPer1K).toFixed(5)}
                </span>
              </div>
              <div className={styles.costRow}>
                <span className={styles.costRowLabel}>Per 1M tokens</span>
                <span className={styles.costRowValue}>
                  ${localPer1M < 0.01 ? round2(localPer1M).toFixed(4) : round2(localPer1M).toFixed(2)}
                </span>
              </div>
            </div>

            <div className={`${styles.costCard} ${apiProviderId !== 'local' && isApiCheaper ? styles.cheaperCard : ''} ${apiProviderId === 'local' ? styles.costCardMuted : ''}`}>
              <h3 className={styles.costCardTitle}>
                {selectedProvider.name}
                <span className={styles.costCardModel}>{selectedProvider.model}</span>
              </h3>
              {isApiCheaper && (
                <span className={styles.cheaperBadge}>Cheaper</span>
              )}
              {isEqual && apiProviderId !== 'local' && (
                <span className={styles.cheaperBadge}>Equal</span>
              )}
              {apiProviderId !== 'local' && (
                <div className={styles.costPricingHint}>
                  <span>Input: ${selectedProvider.inputPrice}/1M &middot; Output: ${selectedProvider.outputPrice}/1M</span>
                </div>
              )}
              <div className={styles.costRow}>
                <span className={styles.costRowLabel}>Per 1K tokens</span>
                <span className={styles.costRowValue}>
                  {apiProviderId === 'local'
                    ? '—'
                    : (apiPer1K < 0.00001 ? '< $0.00001' : '$' + round2(apiPer1K).toFixed(5))
                  }
                </span>
              </div>
              <div className={styles.costRow}>
                <span className={styles.costRowLabel}>Per 1M tokens</span>
                <span className={styles.costRowValue}>
                  {apiProviderId === 'local'
                    ? '—'
                    : '$' + (apiPer1M < 0.01 ? round2(apiPer1M).toFixed(4) : round2(apiPer1M).toFixed(2))
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/*  EXPORT BUTTON (WEB-49)                                       */}
        {/* ============================================================== */}
        <div className={styles.exportRow}>
          <button
            className={`${styles.exportBtn} ${exporting ? styles.exportBtnLoading : ''}`}
            onClick={handleExport}
            disabled={exporting}
            type="button"
          >
            {exporting ? 'Exporting…' : 'Export as PNG'}
          </button>
          {exportError && (
            <p className={styles.exportError}>{exportError}</p>
          )}
        </div>

      </div>
    </div>
  );
}
