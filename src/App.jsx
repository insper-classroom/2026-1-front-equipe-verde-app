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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const PRICE_RANGE_RATE = 0.1;

const initialForm = {
  Bairro: "CollgCr",
  Qualidade: 7,
  ClasseZona: "RL",
  AreaConstruida: 1710,
  QualidadeCozinha: "Gd",
  ArCentral: "Y",
  Exterior1: "VinylSd",
  ClasseImovel: "20",
  CarrosGaragem: 2,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const numericFields = new Set([
  "Qualidade",
  "AreaConstruida",
  "CarrosGaragem",
]);

const selectOptions = {
  Bairro: [
    { value: "Blmngtn", label: "Blmngtn - Bloomington Heights" },
    { value: "Blueste", label: "Blueste - Bluestem" },
    { value: "BrDale", label: "BrDale - Briardale" },
    { value: "BrkSide", label: "BrkSide - Brookside" },
    { value: "ClearCr", label: "ClearCr - Clear Creek" },
    { value: "CollgCr", label: "CollgCr - College Creek" },
    { value: "Crawfor", label: "Crawfor - Crawford" },
    { value: "Edwards", label: "Edwards" },
    { value: "Gilbert", label: "Gilbert" },
    { value: "IDOTRR", label: "IDOTRR - Iowa DOT and Rail Road" },
    { value: "MeadowV", label: "MeadowV - Meadow Village" },
    { value: "Mitchel", label: "Mitchel - Mitchell" },
    { value: "NAmes", label: "NAmes - North Ames" },
    { value: "NoRidge", label: "NoRidge - Northridge" },
    { value: "NPkVill", label: "NPkVill - Northpark Villa" },
    { value: "NridgHt", label: "NridgHt - Northridge Heights" },
    { value: "NWAmes", label: "NWAmes - Northwest Ames" },
    { value: "OldTown", label: "OldTown - Old Town" },
    { value: "SWISU", label: "SWISU - South & West of Iowa State University" },
    { value: "Sawyer", label: "Sawyer" },
    { value: "SawyerW", label: "SawyerW - Sawyer West" },
    { value: "Somerst", label: "Somerst - Somerset" },
    { value: "StoneBr", label: "StoneBr - Stone Brook" },
    { value: "Timber", label: "Timberland" },
    { value: "Veenker", label: "Veenker" },
  ],
  ClasseZona: [
    { value: "RL", label: "Residencial de baixa densidade" },
    { value: "RM", label: "Residencial de m\u00e9dia densidade" },
    { value: "FV", label: "Vila flutuante residencial" },
    { value: "RH", label: "Residencial de alta densidade" },
    { value: "C (all)", label: "Comercial" },
  ],
  ClasseImovel: [
    { value: "20", label: "1 pavimento, 1946 ou mais novo" },
    { value: "30", label: "1 pavimento, 1945 ou anterior" },
    { value: "40", label: "1 pavimento com s\u00f3t\u00e3o acabado" },
    { value: "45", label: "1,5 pavimento inacabado" },
    { value: "50", label: "1,5 pavimento acabado" },
    { value: "60", label: "2 pavimentos, 1946 ou mais novo" },
    { value: "70", label: "2 pavimentos, 1945 ou anterior" },
    { value: "75", label: "2,5 pavimentos" },
    { value: "80", label: "N\u00edveis divididos ou m\u00faltiplos" },
    { value: "85", label: "Entrada em n\u00edvel dividido" },
    { value: "90", label: "Duplex" },
    { value: "120", label: "Condom\u00ednio planejado, 1 pavimento" },
    { value: "160", label: "Condom\u00ednio planejado, 2 pavimentos" },
    { value: "180", label: "Condom\u00ednio planejado, multin\u00edvel" },
    { value: "190", label: "Convers\u00e3o para duas fam\u00edlias" },
  ],
  QualidadeCozinha: [
    { value: "Ex", label: "Excelente" },
    { value: "Gd", label: "Boa" },
    { value: "TA", label: "M\u00e9dia" },
    { value: "Fa", label: "Regular" },
    { value: "Po", label: "Ruim" },
    { value: "Ausente", label: "Ausente" },
  ],
  Exterior1: [
    { value: "AsbShng", label: "Telhas de amianto" },
    { value: "BrkComm", label: "Tijolo comum" },
    { value: "BrkFace", label: "Tijolo aparente" },
    { value: "CBlock", label: "Bloco de concreto" },
    { value: "CemntBd", label: "Placa ciment\u00edcia" },
    { value: "HdBoard", label: "Chapa de madeira prensada" },
    { value: "ImStucc", label: "Estuque imita\u00e7\u00e3o" },
    { value: "MetalSd", label: "Revestimento met\u00e1lico" },
    { value: "Plywood", label: "Compensado" },
    { value: "Stucco", label: "Estuque" },
    { value: "VinylSd", label: "Revestimento vin\u00edlico" },
    { value: "Wd Sdng", label: "Revestimento de madeira" },
    { value: "WdShing", label: "Telhas de madeira" },
  ],
  ArCentral: [
    { value: "Y", label: "Sim" },
    { value: "N", label: "N\u00e3o" },
  ],
};

function buildPayload(form) {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      numericFields.has(key) ? Number(value) : value,
    ])
  );
}

function getOptionLabel(name, value) {
  const option = selectOptions[name]?.find((item) =>
    typeof item === "string" ? item === value : item.value === value
  );

  return typeof option === "object" ? option.label : value;
}

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

function Field({ icon: Icon, label, name, type = "text", value, onChange }) {
  const options = selectOptions[name];

  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-quinto-700" aria-hidden="true" />
        {label}
      </span>
      {options ? (
        <select
          className="field-control"
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
          min={type === "number" ? "0" : undefined}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
        />
      )}
    </label>
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
  const priceRange = useMemo(
    () => (result ? getPriceRange(result.predicted_price) : null),
    [result]
  );
  const summaryItems = useMemo(
    () => [
      {
        icon: Ruler,
        label: "\u00c1rea",
        value: `${payload.AreaConstruida} m\u00b2`,
      },
      {
        icon: CheckCircle2,
        label: "Qualidade",
        value: payload.Qualidade,
      },
      {
        icon: MapPin,
        label: "Bairro",
        value: getOptionLabel("Bairro", payload.Bairro),
      },
      {
        icon: Building2,
        label: "Zona",
        value: getOptionLabel("ClasseZona", payload.ClasseZona),
      },
      {
        icon: CheckCircle2,
        label: "Cozinha",
        value: getOptionLabel("QualidadeCozinha", payload.QualidadeCozinha),
      },
      {
        icon: CheckCircle2,
        label: "Ar central",
        value: getOptionLabel("ArCentral", payload.ArCentral),
      },
      {
        icon: Building2,
        label: "Material externo",
        value: getOptionLabel("Exterior1", payload.Exterior1),
      },
      {
        icon: Home,
        label: "Tipo de im\u00f3vel",
        value: getOptionLabel("ClasseImovel", payload.ClasseImovel),
      },
      {
        icon: Car,
        label: "Garagem",
        value: `${payload.CarrosGaragem} vagas`,
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
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("N\u00e3o foi poss\u00edvel gerar a previs\u00e3o.");
      }

      const data = await response.json();
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
              9 campos
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
                9 campos mais influentes no modelo de predi&ccedil;&atilde;o.
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
            <Field
              icon={MapPin}
              label="Bairro"
              name="Bairro"
              value={form.Bairro}
              onChange={handleChange}
            />
            <Field
              icon={CheckCircle2}
              label="Qualidade"
              name="Qualidade"
              type="number"
              value={form.Qualidade}
              onChange={handleChange}
            />
            <Field
              icon={Building2}
              label="Zona"
              name="ClasseZona"
              value={form.ClasseZona}
              onChange={handleChange}
            />
            <Field
              icon={Ruler}
              label={"\u00c1rea constru\u00edda"}
              name="AreaConstruida"
              type="number"
              value={form.AreaConstruida}
              onChange={handleChange}
            />
            <Field
              icon={CheckCircle2}
              label="Qualidade da cozinha"
              name="QualidadeCozinha"
              value={form.QualidadeCozinha}
              onChange={handleChange}
            />
            <Field
              icon={CheckCircle2}
              label="Ar central"
              name="ArCentral"
              value={form.ArCentral}
              onChange={handleChange}
            />
            <Field
              icon={Building2}
              label="Material externo"
              name="Exterior1"
              value={form.Exterior1}
              onChange={handleChange}
            />
            <Field
              icon={Home}
              label={"Tipo de im\u00f3vel"}
              name="ClasseImovel"
              value={form.ClasseImovel}
              onChange={handleChange}
            />
            <Field
              icon={Car}
              label="Vagas"
              name="CarrosGaragem"
              type="number"
              value={form.CarrosGaragem}
              onChange={handleChange}
            />
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
                        Faixa de refer&ecirc;ncia
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
