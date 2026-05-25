import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bath,
  BedDouble,
  Building2,
  Calculator,
  Car,
  CheckCircle2,
  Home,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Ruler,
  Wifi,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const initialForm = {
  Bairro: "CollgCr",
  ClasseZona: "RL",
  ClasseImovel: "1Fam",
  TipoHabitacao: "1Story",
  EstiloHabitacao: "2Story",
  Qualidade: 7,
  Condicao: 5,
  AreaConstruida: 1710,
  TamanhoLote: 8450,
  BedroomAbvGr: 3,
  Banheiro: 2,
  CarrosGaragem: 2,
  AreaGaragem: 548,
  AreaPorao: 856,
  ArCentral: "Y",
  AreaPiscina: 0,
  Lareira: 0,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const numericFields = new Set([
  "Qualidade",
  "Condicao",
  "AreaConstruida",
  "TamanhoLote",
  "BedroomAbvGr",
  "Banheiro",
  "CarrosGaragem",
  "AreaGaragem",
  "AreaPorao",
  "AreaPiscina",
  "Lareira",
]);

const selectOptions = {
  Bairro: [
    "CollgCr",
    "Veenker",
    "Crawfor",
    "NoRidge",
    "Mitchel",
    "Somerst",
    "NWAmes",
    "OldTown",
    "BrkSide",
    "Sawyer",
  ],
  ClasseZona: ["RL", "RM", "FV", "RH", "C (all)"],
  ClasseImovel: ["1Fam", "TwnhsE", "Twnhs", "Duplex", "2fmCon"],
  TipoHabitacao: ["1Story", "2Story", "1.5Fin", "SLvl", "SFoyer"],
  EstiloHabitacao: ["2Story", "1Story", "1.5Fin", "SLvl", "SFoyer"],
  ArCentral: ["Y", "N"],
};

function buildPayload(form) {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [
      key,
      numericFields.has(key) ? Number(value) : value,
    ])
  );
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
            <option key={option} value={option}>
              {option}
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

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const payload = useMemo(() => buildPayload(form), [form]);

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
        throw new Error("Nao foi possivel gerar a previsao.");
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
    <main className="min-h-screen bg-slate-50 text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-quinto-700 text-white">
              <Home className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-quinto-700">
                Equipe Verde
              </p>
              <h1 className="text-xl font-bold text-ink sm:text-2xl">
                Estimador de preco de imoveis
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <Wifi className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {API_URL}
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:px-8">
        <form
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:p-6"
          onSubmit={handleSubmit}
        >
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Dados do imovel</h2>
              <p className="mt-1 text-sm text-slate-500">
                Campos principais usados pela API de predicao.
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
              icon={Building2}
              label="Zona"
              name="ClasseZona"
              value={form.ClasseZona}
              onChange={handleChange}
            />
            <Field
              icon={Home}
              label="Classe"
              name="ClasseImovel"
              value={form.ClasseImovel}
              onChange={handleChange}
            />
            <Field
              icon={Building2}
              label="Tipo"
              name="TipoHabitacao"
              value={form.TipoHabitacao}
              onChange={handleChange}
            />
            <Field
              icon={Home}
              label="Estilo"
              name="EstiloHabitacao"
              value={form.EstiloHabitacao}
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
              icon={CheckCircle2}
              label="Qualidade"
              name="Qualidade"
              type="number"
              value={form.Qualidade}
              onChange={handleChange}
            />
            <Field
              icon={CheckCircle2}
              label="Condicao"
              name="Condicao"
              type="number"
              value={form.Condicao}
              onChange={handleChange}
            />
            <Field
              icon={Ruler}
              label="Area construida"
              name="AreaConstruida"
              type="number"
              value={form.AreaConstruida}
              onChange={handleChange}
            />
            <Field
              icon={Ruler}
              label="Tamanho do lote"
              name="TamanhoLote"
              type="number"
              value={form.TamanhoLote}
              onChange={handleChange}
            />
            <Field
              icon={BedDouble}
              label="Quartos"
              name="BedroomAbvGr"
              type="number"
              value={form.BedroomAbvGr}
              onChange={handleChange}
            />
            <Field
              icon={Bath}
              label="Banheiros"
              name="Banheiro"
              type="number"
              value={form.Banheiro}
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
            <Field
              icon={Car}
              label="Area da garagem"
              name="AreaGaragem"
              type="number"
              value={form.AreaGaragem}
              onChange={handleChange}
            />
            <Field
              icon={Ruler}
              label="Area do porao"
              name="AreaPorao"
              type="number"
              value={form.AreaPorao}
              onChange={handleChange}
            />
            <Field
              icon={Ruler}
              label="Area da piscina"
              name="AreaPiscina"
              type="number"
              value={form.AreaPiscina}
              onChange={handleChange}
            />
            <Field
              icon={Home}
              label="Lareiras"
              name="Lareira"
              type="number"
              value={form.Lareira}
              onChange={handleChange}
            />
          </div>
        </form>

        <aside className="grid gap-6 lg:content-start">
          <section className="rounded-lg border border-slate-200 bg-quinto-700 p-5 text-white shadow-soft">
            <p className="text-sm font-semibold text-quinto-100">
              Previsao estimada
            </p>
            <div className="mt-4 min-h-24">
              {result ? (
                <>
                  <p className="break-words text-4xl font-bold leading-tight sm:text-5xl lg:text-4xl xl:text-5xl">
                    {formatCurrency(result.predicted_price)}
                  </p>
                  <p className="mt-3 text-sm font-medium text-quinto-100">
                    Modelo {result.model_version}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold leading-tight text-quinto-100">
                  Aguardando calculo
                </p>
              )}
            </div>
          </section>

          {error ? (
            <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
                <div>
                  <h2 className="font-bold">Erro na previsao</h2>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-base font-bold text-ink">Resumo enviado</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Stat label="Area" value={`${payload.AreaConstruida} m2`} />
              <Stat label="Lote" value={`${payload.TamanhoLote} m2`} />
              <Stat label="Quartos" value={payload.BedroomAbvGr} />
              <Stat label="Garagem" value={`${payload.CarrosGaragem} vagas`} />
              <Stat label="Qualidade" value={payload.Qualidade} />
              <Stat
                label="Tempo"
                value={
                  result ? `${result.inference_time_ms} ms` : "Sem resultado"
                }
              />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
