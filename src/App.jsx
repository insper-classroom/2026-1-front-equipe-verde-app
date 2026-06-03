import { useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Calculator,
  Car,
  CheckCircle2,
  DollarSign,
  Gauge,
  Home,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Ruler,
  Sparkles,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { API_URL } from "./api";

const PREDICTION_ENDPOINT = "/predict";
const PRICE_RANGE_RATE = 0.1;
const M2_TO_FT2 = 10.7639;

const initialForm = {
  Bairro: "Centro",
  AreaConstruida: 159,
  BedroomAbvGr: 3,
  Banheiro: 2,
  CarrosGaragem: 2,
  Qualidade: 7,
  Condicao: 5,
  Idade: 36,
  QualidadeCozinha: "Gd",
  FoiReformado: "0",
};

const baseFieldNames = Object.keys(initialForm);

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const numericFields = new Set([
  "AreaConstruida",
  "BedroomAbvGr",
  "Banheiro",
  "CarrosGaragem",
  "Qualidade",
  "Condicao",
  "Idade",
  "FoiReformado",
]);

const selectOptions = {
  Bairro: [
    { value: "Centro", label: "Centro" },
    { value: "Jardim Aeroporto", label: "Jardim Aeroporto" },
    { value: "Jardim Bela Vista", label: "Jardim Bela Vista" },
    { value: "Jardim Boa Esperan\u00e7a", label: "Jardim Boa Esperan\u00e7a" },
    { value: "Jardim Cana\u00e3", label: "Jardim Cana\u00e3" },
    { value: "Jardim Eldorado", label: "Jardim Eldorado" },
    { value: "Jardim Europa", label: "Jardim Europa" },
    { value: "Jardim Fl\u00f3rida", label: "Jardim Fl\u00f3rida" },
    { value: "Jardim Ipanema", label: "Jardim Ipanema" },
    { value: "Jardim Margarida", label: "Jardim Margarida" },
    { value: "Jardim Nova Botucatu", label: "Jardim Nova Botucatu" },
    { value: "Jardim Nova Igua\u00e7u", label: "Jardim Nova Igua\u00e7u" },
    { value: "Jardim Para\u00edso", label: "Jardim Para\u00edso" },
    { value: "Jardim Petr\u00f3polis", label: "Jardim Petr\u00f3polis" },
    { value: "Jardim Redentor", label: "Jardim Redentor" },
    { value: "Jardim Santa Luzia", label: "Jardim Santa Luzia" },
    { value: "Jardim S\u00e3o Judas Tadeu", label: "Jardim S\u00e3o Judas Tadeu" },
    { value: "Jardim das Flores", label: "Jardim das Flores" },
    { value: "Recanto dos Pinheiros", label: "Recanto dos Pinheiros" },
    { value: "Rubi\u00e3o J\u00fanior", label: "Rubi\u00e3o J\u00fanior" },
    { value: "Vila Independ\u00eancia", label: "Vila Independ\u00eancia" },
    { value: "Vila Real", label: "Vila Real" },
    { value: "Vila S\u00e3o Francisco", label: "Vila S\u00e3o Francisco" },
    { value: "Vila Universit\u00e1ria", label: "Vila Universit\u00e1ria" },
    { value: "Vitoriana", label: "Vitoriana" },
  ],
  QualidadeCozinha: [
    { value: "Ex", label: "Excelente" },
    { value: "Gd", label: "Boa" },
    { value: "TA", label: "M\u00e9dia" },
    { value: "Fa", label: "Regular" },
    { value: "Po", label: "Ruim" },
    { value: "Ausente", label: "Ausente" },
  ],
  FoiReformado: [
    { value: "1", label: "Sim" },
    { value: "0", label: "N\u00e3o" },
  ],
  Qualidade: [
    { value: "9", label: "Excelente" },
    { value: "7", label: "Boa" },
    { value: "5", label: "M\u00e9dia" },
    { value: "3", label: "Ruim" },
    { value: "1", label: "P\u00e9ssima" },
  ],
  Condicao: [
    { value: "9", label: "Excelente" },
    { value: "7", label: "Boa" },
    { value: "5", label: "M\u00e9dia" },
    { value: "3", label: "Ruim" },
    { value: "1", label: "P\u00e9ssima" },
  ],
};

function hasPayloadValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

function buildPayload(form) {
  return Object.fromEntries(
    Object.entries(form)
      .filter(([, value]) => hasPayloadValue(value))
      .map(([key, value]) => [
        key,
        numericFields.has(key) ? Number(value) : value,
      ])
  );
}

async function postJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : responseText || `HTTP ${response.status}`;

    throw new Error(
      `Não foi possível gerar a previsão em ${path} (${response.status}). ${detail}`
    );
  }

  return data;
}

function toPredictionResult(data) {
  return {
    predicted_price: data.predicted_price,
    model_version: data.model_version,
    inference_time_ms: data.inference_time_ms,
  };
}

async function predictPrice(modelPayload) {
  return toPredictionResult(await postJson(PREDICTION_ENDPOINT, modelPayload));
}

function getOptionLabel(name, value) {
  const option = selectOptions[name]?.find((item) =>
    typeof item === "string"
      ? String(item) === String(value)
      : String(item.value) === String(value)
  );

  return typeof option === "object" ? option.label : value;
}

const fieldMeta = {
  Bairro: { icon: MapPin, label: "Bairro" },
  AreaConstruida: {
    icon: Ruler,
    label: "\u00c1rea constru\u00edda",
    type: "number",
    min: 65,
    max: 260,
  },
  BedroomAbvGr: { icon: Home, label: "Quartos", type: "number", min: 1, max: 5 },
  Banheiro: { icon: Home, label: "Banheiros", type: "number", min: 1, max: 3 },
  CarrosGaragem: {
    icon: Car,
    label: "Vagas",
    type: "number",
    min: 0,
    max: 3,
  },
  Qualidade: { icon: CheckCircle2, label: "Qualidade" },
  Condicao: { icon: CheckCircle2, label: "Condi\u00e7\u00e3o do im\u00f3vel" },
  Idade: { icon: Home, label: "Idade do im\u00f3vel", type: "number", min: 1, max: 115 },
  QualidadeCozinha: { icon: CheckCircle2, label: "Qualidade da cozinha" },
  FoiReformado: { icon: CheckCircle2, label: "Foi reformado" },
};

function getPriceRange(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return null;
  }

  return {
    min: numericPrice * (1 - PRICE_RANGE_RATE),
    max: numericPrice * (1 + PRICE_RANGE_RATE),
  };
}

function Field({
  icon: Icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  min,
  max,
  step,
}) {
  const options = selectOptions[name];
  const fieldId = `field-${name}`;

  return (
    <div className="grid gap-2 text-sm font-semibold text-slate-700">
      <div className="flex min-h-5 items-center justify-between gap-2">
        <label className="flex min-w-0 items-center gap-2" htmlFor={fieldId}>
          <Icon className="h-4 w-4 shrink-0 text-quinto-700" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </label>
      </div>
      {options ? (
        <select
          className="field-control"
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
        >
          {options.map((option) => (
            <option
              key={typeof option === "string" ? option : option.value}
              value={typeof option === "string" ? option : option.value}
            >
              {typeof option === "string" ? option : option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="field-control"
          id={fieldId}
          max={max}
          min={min ?? (type === "number" ? "0" : undefined)}
          name={name}
          step={step}
          type={type}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-quinto-50 text-quinto-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
      </div>
      <p className="min-w-0 text-right text-sm font-bold text-ink">{value}</p>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const payload = useMemo(() => buildPayload(form), [form]);
  const activeFieldCount = baseFieldNames.length;
  const priceRange = useMemo(
    () => (result ? getPriceRange(result.predicted_price) : null),
    [result]
  );
  const summaryItems = useMemo(
    () => [
      {
        icon: MapPin,
        label: "Bairro",
        value: getOptionLabel("Bairro", payload.Bairro),
      },
      {
        icon: Ruler,
        label: "\u00c1rea",
        value:
          payload.AreaConstruida === undefined
            ? "N/A"
            : `${payload.AreaConstruida} m\u00b2`,
      },
      {
        icon: Home,
        label: "Quartos",
        value:
          payload.BedroomAbvGr === undefined
            ? "N/A"
            : payload.BedroomAbvGr,
      },
      {
        icon: Home,
        label: "Banheiros",
        value:
          payload.Banheiro === undefined ? "N/A" : payload.Banheiro,
      },
      {
        icon: Car,
        label: "Garagem",
        value:
          payload.CarrosGaragem === undefined
            ? "N/A"
            : `${payload.CarrosGaragem} vagas`,
      },
      {
        icon: CheckCircle2,
        label: "Qualidade",
        value: payload.Qualidade ?? "N/A",
      },
      {
        icon: CheckCircle2,
        label: "Condi\u00e7\u00e3o",
        value: payload.Condicao ?? "N/A",
      },
      {
        icon: Home,
        label: "Idade",
        value: payload.Idade === undefined ? "N/A" : `${payload.Idade} anos`,
      },
      {
        icon: CheckCircle2,
        label: "Cozinha",
        value: getOptionLabel("QualidadeCozinha", payload.QualidadeCozinha),
      },
      {
        icon: CheckCircle2,
        label: "Reformado",
        value: getOptionLabel("FoiReformado", payload.FoiReformado),
      },
    ],
    [payload]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const apiPayload =
        payload.AreaConstruida !== undefined
          ? { ...payload, AreaConstruida: Math.round(payload.AreaConstruida * M2_TO_FT2) }
          : payload;
      const data = await predictPrice(apiPayload);
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro inesperado ao chamar a API."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-ink">
      <header className="border-b border-slate-200 bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white shadow-soft">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Equipe Verde
              </p>
              <h1 className="text-xl font-bold text-ink sm:text-2xl">
                Estimador de pre&ccedil;o de im&oacute;veis
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-emerald-800">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {activeFieldCount} campos
            </span>
            <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Wifi className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {API_URL}
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.8fr)] lg:px-8">
        <form
          className="rounded-lg border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-4 shadow-soft sm:p-6"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">
                Dados do im&oacute;vel
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                10 campos usados pelo modelo atual.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" type="button" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Limpar
              </button>
              <button className="btn-primary" disabled={isLoading} type="submit">
                {isLoading ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Calculator className="h-4 w-4" aria-hidden="true" />
                )}
                Calcular
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {baseFieldNames.map((name) => {
              const meta = fieldMeta[name];

              return (
                <Field
                  key={name}
                  {...meta}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                />
              );
            })}
          </div>
        </form>

        <aside className="grid gap-6 lg:content-start">
          <section className="rounded-lg border border-[#102235] bg-[#102235] p-5 text-white shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400 text-ink">
                  <DollarSign className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-100">
                    Pre&ccedil;o previsto
                  </p>
                  <p className="text-xs font-medium text-slate-300">
                    Modelo {result?.model_version || "aguardando"}
                  </p>
                </div>
              </div>
              <TrendingUp
                className="h-5 w-5 text-emerald-300"
                aria-hidden="true"
              />
            </div>

            <div className="mt-5 min-h-56">
              {result ? (
                <>
                  <p className="break-words text-4xl font-bold leading-tight sm:text-5xl lg:text-4xl xl:text-5xl">
                    {formatCurrency(result.predicted_price)}
                  </p>
                  {priceRange ? (
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                        <Gauge className="h-4 w-4" aria-hidden="true" />
                        Faixa de refer&ecirc;ncia (&plusmn;10%)
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        Esse im&oacute;vel varia entre{" "}
                        <span className="font-bold text-white">
                          {formatCurrency(priceRange.min)}
                        </span>{" "}
                        e{" "}
                        <span className="font-bold text-white">
                          {formatCurrency(priceRange.max)}
                        </span>
                        .
                      </p>
                      <div className="mt-5">
                        <div className="relative h-3 rounded-full bg-white/15">
                          <div className="absolute inset-y-0 left-[8%] right-[8%] rounded-full bg-emerald-300" />
                          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-500 shadow-lg" />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-slate-300">
                          <span>{formatCurrency(priceRange.min)}</span>
                          <span className="text-emerald-200">previsto</span>
                          <span>{formatCurrency(priceRange.max)}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="grid min-h-48 place-items-center border-t border-white/10 pt-5 text-center">
                  <div>
                    <p className="text-3xl font-bold leading-tight text-slate-100">
                      Aguardando c&aacute;lculo
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-300">
                      Sem resultado por enquanto.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {error ? (
            <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
                <div>
                  <h2 className="font-bold">Erro na previs&atilde;o</h2>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <h2 className="text-base font-bold text-ink">Resumo enviado</h2>
              <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {result ? `${result.inference_time_ms} ms` : "Sem resultado"}
              </span>
            </div>
            <div className="mt-2">
              {summaryItems.map((item) => (
                <SummaryItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
