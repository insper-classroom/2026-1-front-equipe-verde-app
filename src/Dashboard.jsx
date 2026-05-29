import { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Building2, Cpu, Gauge,
  Home, MapPin, RefreshCw, Target, TrendingUp,
} from "lucide-react";
import {
  Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { API_URL } from "./api";

const ENDPOINTS = {
  status: "/stats/status",
  inference: "/stats/inference-time",
  latency: "/stats/latency",
  system: "/stats/system",
  neighborhoods: "/stats/neighborhoods",
  avgPrice: "/stats/average-price",
  priceDist: "/stats/price-distribution",
  quality: "/stats/quality-impact",
  zones: "/stats/zone-analysis",
  profile: "/stats/property-profile",
  validation: "/stats/validation-metrics",
  last7: "/stats/requests?days=7",
};

const EMERALD = "#10b981";
const BLUE = "#1f7cff";

const fmtMoney = (v) =>
  v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtNum = (v) => (v == null ? "—" : Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 }));

function Card({ title, icon: Icon, children, subtitle }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-emerald-600" />}
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Kpi({ label, value, hint, icon: Icon, accent = "emerald" }) {
  const ring = accent === "emerald" ? "border-t-emerald-500" : accent === "blue" ? "border-t-quinto-500" : "border-t-amber-500";
  return (
    <div className={`rounded-lg border border-slate-200 border-t-4 ${ring} bg-white p-4 shadow-soft`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-300" />}
      </div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

function Empty({ msg = "Sem dados ainda" }) {
  return <div className="py-6 text-center text-sm font-medium text-slate-400">{msg}</div>;
}

function getValidationMetrics(validation) {
  return validation?.so_normais || validation?.todos || {};
}

function HBar({ data, valueKey, nameKey, color = EMERALD, money = false, height = 280 }) {
  if (!data || data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
        <XAxis type="number" tickFormatter={money ? (v) => `R$${(v / 1000).toFixed(0)}k` : fmtNum} fontSize={11} stroke="#94a3b8" />
        <YAxis type="category" dataKey={nameKey} width={120} fontSize={11} stroke="#475569" />
        <Tooltip formatter={(v) => (money ? fmtMoney(v) : fmtNum(v))} cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => <Cell key={i} fill={color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const entries = await Promise.all(
      Object.entries(ENDPOINTS).map(async ([key, path]) => {
        try {
          const r = await fetch(`${API_URL}${path}`);
          return [key, r.ok ? await r.json() : null];
        } catch {
          return [key, null];
        }
      })
    );
    setData(Object.fromEntries(entries));
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000); // auto-refresh a cada 5 min
    return () => clearInterval(id);
  }, [load]);

  const status = data.status || {};
  const successRate =
    status.success_count != null && (status.success_count + status.error_count) > 0
      ? ((status.success_count / (status.success_count + status.error_count)) * 100).toFixed(1)
      : null;
  const val = getValidationMetrics(data.validation);
  const validationCount = val.n ?? data.validation?.todos?.n ?? null;
  const sys = data.system || {};
  const lat = data.latency || {};
  const dist = data.priceDist || {};
  const priceDistributionCount = validationCount ?? dist.count;

  const bairros = (data.neighborhoods?.ranking || []).map((r) => ({ bairro: r.bairro, count: r.count }));
  const qualidade = (data.quality?.by_quality || []).map((r) => ({ q: `Q${r.qualidade}`, preco: r.avg_price }));
  const precoBairro = (data.avgPrice?.by_neighborhood || []).slice(0, 10).map((r) => ({ bairro: r.bairro, preco: r.avg_price }));
  const zonas = data.zones?.by_zone || [];
  const profile = data.profile || {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Dashboard de Validação do Modelo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Desempenho validado do modelo — transações, bairros, features e saúde da API.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>
      {updatedAt && (
        <p className="mt-1 text-xs text-slate-400">
          Atualizado {updatedAt.toLocaleString("pt-BR")} · auto-refresh a cada 5 min
        </p>
      )}

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Transações validadas" value={fmtNum(validationCount)} icon={TrendingUp}
             hint="somente validações" />
        <Kpi label="Taxa de sucesso" value={successRate ? `${successRate}%` : "—"} icon={Activity} accent="blue"
             hint={status.error_count != null ? `${fmtNum(status.error_count)} erros` : null} />
        <Kpi label="Latência p95" value={lat.p95_ms != null ? `${lat.p95_ms} ms` : "—"} icon={Gauge} accent="blue"
             hint={lat.p50_ms != null ? `p50 ${lat.p50_ms} ms · p99 ${lat.p99_ms} ms` : null} />
        <Kpi label="Erro do modelo (MAPE)" value={val.mape != null ? `${val.mape}%` : "—"} icon={Target} accent="amber"
             hint={val.mae != null ? `MAE ${fmtMoney(val.mae)} · R² ${val.r2}` : "sem validações ainda"} />
      </div>

      {/* Bairros + Preço por bairro */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Bairros mais consultados" icon={MapPin} subtitle="Nº de consultas por bairro">
          <HBar data={bairros} valueKey="count" nameKey="bairro" color={EMERALD} />
        </Card>
        <Card title="Preço médio previsto por bairro" icon={Building2} subtitle="Top 10 por volume">
          <HBar data={precoBairro} valueKey="preco" nameKey="bairro" color={BLUE} money />
        </Card>
      </div>

      {/* Qualidade + Distribuição de preço */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Impacto da qualidade no preço" icon={BarChart3} subtitle="Preço médio previsto por nível (1–10)">
          {qualidade.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={qualidade} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="q" fontSize={11} stroke="#475569" />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={11} stroke="#94a3b8" />
                <Tooltip formatter={(v) => fmtMoney(v)} cursor={{ fill: "#f1f5f9" }} />
                <Bar dataKey="preco" fill={EMERALD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Distribuição dos preços previstos" icon={TrendingUp} subtitle={`${fmtNum(priceDistributionCount)} validações`}>
          {!dist.count ? <Empty /> : (
            <div className="space-y-3 py-4">
              {[["Mínimo", dist.min], ["P25", dist.p25], ["Mediana", dist.median], ["P75", dist.p75], ["Máximo", dist.max]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-sm font-medium text-slate-500">{k}</span>
                  <span className="text-sm font-bold text-ink">{fmtMoney(v)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Perfil dos imóveis + Zonas */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Perfil dos imóveis consultados" icon={Home} subtitle="Médias e proporções das features informadas">
          {!profile.total_queried ? <Empty /> : (
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Área construída", profile.avg_area_construida != null ? `${fmtNum(profile.avg_area_construida)} ft²` : "—"],
                ["Quartos", profile.avg_quartos],
                ["Banheiros", profile.avg_banheiro],
                ["Vagas garagem", profile.avg_carros_garagem],
                ["% com ar central", profile.pct_ar_central != null ? `${profile.pct_ar_central}%` : "—"],
                ["% com piscina", profile.pct_piscina != null ? `${profile.pct_piscina}%` : "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-medium text-slate-400">{k}</div>
                  <div className="mt-0.5 text-lg font-bold text-ink">{v ?? "—"}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Consultas por zona" icon={MapPin} subtitle="Volume e preço médio por classe de zona">
          {zonas.length === 0 ? <Empty /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="pb-2">Zona</th><th className="pb-2 text-right">Consultas</th><th className="pb-2 text-right">Preço médio</th>
                </tr>
              </thead>
              <tbody>
                {zonas.map((z) => (
                  <tr key={z.classe_zona} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-semibold text-ink">{z.classe_zona}</td>
                    <td className="py-2 text-right text-slate-600">{fmtNum(z.count)}</td>
                    <td className="py-2 text-right font-medium text-slate-700">{fmtMoney(z.avg_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Saúde da API: latência + saturação */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Latência (request completo)" icon={Gauge} subtitle={`${fmtNum(lat.count)} requisições · em memória`}>
          {!lat.count ? <Empty /> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Média", lat.avg_ms], ["p50", lat.p50_ms], ["p95", lat.p95_ms], ["p99", lat.p99_ms]].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-slate-50 p-3 text-center">
                  <div className="text-xs font-medium text-slate-400">{k}</div>
                  <div className="mt-0.5 text-lg font-bold text-ink">{v} <span className="text-xs font-normal text-slate-400">ms</span></div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Saturação do servidor" icon={Cpu} subtitle="Utilização de CPU e memória">
          {sys.cpu_percent == null ? <Empty /> : (
            <div className="space-y-4 py-1">
              {[["CPU", sys.cpu_percent], ["Memória", sys.memory_percent]].map(([k, pct]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-500">{k}</span>
                    <span className="font-bold text-ink">{pct}%</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-slate-100">
                    <div className={`h-2.5 rounded-full ${pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                         style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Processo: {sys.process_rss_mb} MB · {sys.process_threads} threads · load {sys.load_avg_1m ?? "—"}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
