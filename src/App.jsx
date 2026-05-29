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
  Plus,
  RotateCcw,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wifi,
  X,
} from "lucide-react";
import { API_URL } from "./api";

const PREDICTION_ENDPOINT = "/predict";
const VALIDATION_FALLBACK_ENDPOINT = "/validate";
const PRICE_RANGE_RATE = 0.1;
const FALLBACK_REAL_PRICE = 160000;
const FALLBACK_PROPERTY_ID = 0;

const initialForm = {
  Bairro: "Centro",
  Qualidade: 7,
  ClasseZona: "RL",
  AreaConstruida: 1710,
  QualidadeCozinha: "Gd",
  ArCentral: "Y",
  Exterior1: "VinylSd",
  ClasseImovel: "20",
  CarrosGaragem: 2,
};

const baseFieldNames = Object.keys(initialForm);

const modelDefaultPayload = {
  ClasseImovel: "20",
  ClasseZona: "RL",
  Fachada: 67,
  TamanhoLote: 9539.5,
  FormaProp: "Reg",
  PlanoProp: "Lvl",
  ConfigLote: "Inside",
  InclinacaoLote: "Gtl",
  Bairro: "Vila Independência",
  Estrada1: "Norm",
  Estrada2: "Norm",
  TipoHabitacao: "1Fam",
  EstiloHabitacao: "1Story",
  Qualidade: 6,
  Condicao: 5,
  AnoConstrucao: 1970,
  AnoReforma: 1991,
  TipoTelhado: "Gable",
  MaterialTelhado: "CompShg",
  Exterior1: "VinylSd",
  Exterior2: "VinylSd",
  TipoAlvenaria: "Ausente",
  AreaAlvenaria: 0,
  QualidadeCobertura: "TA",
  CondicaoExterna: "TA",
  TipoFundacao: "CBlock",
  AlturaPorao: "TA",
  CondicaoPorao: "TA",
  ParedePorao: "No",
  TipoAcabPorao1: "Unf",
  TipoAcabPorao2: "Unf",
  AreaPorao: 972,
  Aquecimento: "GasA",
  QualidadeAquecimento: "Ex",
  ArCentral: "Y",
  InstalacaoEletrica: "SBrkr",
  AreaConstruida: 1456,
  BanheiroPorao: 0,
  LavaboPorao: 0,
  Banheiro: 2,
  Lavabo: 0,
  BedroomAbvGr: 3,
  KitchenAbvGr: 1,
  QualidadeCozinha: "TA",
  Funcionalidade: "Typ",
  Lareira: 1,
  QualidadeLareira: "Ausente",
  LocalGaragem: "Attchd",
  AcabamentoGaragem: "Unf",
  CarrosGaragem: 2,
  QualidadeGaragem: "TA",
  CondicaoGaragem: "TA",
  EntradaPavimentada: "Y",
  AreaDeck: 0,
  AreaVarandaAberta: 22,
  AreaVarandaFechada: 0,
  AreaVaranda3Estacoes: 0,
  AreaAlpendre: 0,
  AreaPiscina: 0,
  QualidadeCerca: "Ausente",
  ValorOutros: 0,
  Idade: 38,
  FoiReformado: 0,
  area_por_lote: 0.15365942028985508,
  area_por_quarto: 504,
  area_por_vaga: 264,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const numericFields = new Set([
  "Fachada",
  "TamanhoLote",
  "Qualidade",
  "Condicao",
  "AnoConstrucao",
  "AnoReforma",
  "AreaAlvenaria",
  "AreaPorao",
  "AreaConstruida",
  "BanheiroPorao",
  "LavaboPorao",
  "Banheiro",
  "Lavabo",
  "BedroomAbvGr",
  "KitchenAbvGr",
  "Lareira",
  "CarrosGaragem",
  "AreaDeck",
  "AreaVarandaAberta",
  "AreaVarandaFechada",
  "AreaVaranda3Estacoes",
  "AreaAlpendre",
  "AreaPiscina",
  "ValorOutros",
  "Idade",
  "FoiReformado",
  "area_por_lote",
  "area_por_quarto",
  "area_por_vaga",
]);

const qualityOptions = [
  { value: "Ausente", label: "Ausente" },
  { value: "Po", label: "Ruim" },
  { value: "Fa", label: "Regular" },
  { value: "TA", label: "M\u00e9dia" },
  { value: "Gd", label: "Boa" },
  { value: "Ex", label: "Excelente" },
];

const simpleOptions = (values) =>
  values.map((value) => ({ value, label: value }));

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
  FormaProp: simpleOptions(["Reg", "IR1", "IR2", "IR3"]),
  PlanoProp: simpleOptions(["Lvl", "Bnk", "HLS", "Low"]),
  ConfigLote: simpleOptions(["Inside", "Corner", "CulDSac", "FR2", "FR3"]),
  InclinacaoLote: simpleOptions(["Gtl", "Mod", "Sev"]),
  Estrada1: simpleOptions([
    "Norm",
    "Artery",
    "Feedr",
    "PosA",
    "PosN",
    "RRAe",
    "RRAn",
    "RRNe",
    "RRNn",
  ]),
  Estrada2: simpleOptions(["Norm", "Artery", "Feedr", "PosA", "RRAe", "RRNn"]),
  TipoHabitacao: simpleOptions(["1Fam", "2fmCon", "Duplex", "Twnhs", "TwnhsE"]),
  EstiloHabitacao: simpleOptions([
    "1Story",
    "1.5Fin",
    "1.5Unf",
    "2Story",
    "2.5Fin",
    "2.5Unf",
    "SFoyer",
    "SLvl",
  ]),
  TipoTelhado: simpleOptions(["Gable", "Flat", "Gambrel", "Hip", "Mansard", "Shed"]),
  MaterialTelhado: simpleOptions([
    "CompShg",
    "Membran",
    "Metal",
    "Roll",
    "Tar&Grv",
    "WdShake",
    "WdShngl",
  ]),
  Exterior2: simpleOptions([
    "AsbShng",
    "AsphShn",
    "Brk Cmn",
    "BrkFace",
    "CBlock",
    "CmentBd",
    "HdBoard",
    "ImStucc",
    "MetalSd",
    "Plywood",
    "Stone",
    "Stucco",
    "VinylSd",
    "Wd Sdng",
    "Wd Shng",
  ]),
  TipoAlvenaria: simpleOptions(["Ausente", "BrkCmn", "BrkFace", "Stone"]),
  QualidadeCobertura: simpleOptions(["TA", "Fa", "Gd", "Ex"]),
  CondicaoExterna: simpleOptions(["TA", "Fa", "Gd", "Ex"]),
  TipoFundacao: simpleOptions(["BrkTil", "CBlock", "PConc", "Slab", "Stone", "Wood"]),
  AlturaPorao: qualityOptions,
  CondicaoPorao: qualityOptions,
  ParedePorao: [
    { value: "Ausente", label: "Ausente" },
    { value: "No", label: "Sem exposi\u00e7\u00e3o" },
    { value: "Mn", label: "M\u00ednima" },
    { value: "Av", label: "M\u00e9dia" },
    { value: "Gd", label: "Boa" },
  ],
  TipoAcabPorao1: simpleOptions(["Ausente", "Unf", "LwQ", "Rec", "BLQ", "ALQ", "GLQ"]),
  TipoAcabPorao2: simpleOptions(["Ausente", "Unf", "LwQ", "Rec", "BLQ", "ALQ", "GLQ"]),
  Aquecimento: simpleOptions(["GasA", "GasW", "Grav", "OthW", "Wall"]),
  QualidadeAquecimento: simpleOptions(["TA", "Po", "Fa", "Gd", "Ex"]),
  InstalacaoEletrica: simpleOptions(["SBrkr", "FuseA", "FuseF", "FuseP"]),
  Funcionalidade: simpleOptions(["Typ", "Min1", "Min2", "Mod", "Maj1", "Maj2"]),
  QualidadeLareira: qualityOptions,
  LocalGaragem: simpleOptions([
    "Ausente",
    "2Types",
    "Attchd",
    "Basment",
    "BuiltIn",
    "CarPort",
    "Detchd",
  ]),
  AcabamentoGaragem: simpleOptions(["Ausente", "Unf", "RFn", "Fin"]),
  QualidadeGaragem: qualityOptions,
  CondicaoGaragem: qualityOptions,
  EntradaPavimentada: simpleOptions(["Y", "P", "N"]),
  QualidadeCerca: [
    { value: "Ausente", label: "Ausente" },
    { value: "MnWw", label: "Madeira/arame simples" },
    { value: "GdWo", label: "Madeira boa" },
    { value: "MnPrv", label: "Privacidade simples" },
    { value: "GdPrv", label: "Privacidade boa" },
  ],
  FoiReformado: [
    { value: "1", label: "Sim" },
    { value: "0", label: "N\u00e3o" },
  ],
};

function hasPayloadValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

function toFiniteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function addDerivedFeature(payload, name, value) {
  if (hasPayloadValue(payload[name]) || value === null || value === undefined) {
    return;
  }

  payload[name] = value;
}

function safeRatio(numerator, denominator) {
  const numericNumerator = toFiniteNumber(numerator);
  const numericDenominator = toFiniteNumber(denominator);

  if (
    numericNumerator === null ||
    numericDenominator === null ||
    numericDenominator === 0
  ) {
    return null;
  }

  return numericNumerator / numericDenominator;
}

function addDerivedFeatures(payload) {
  addDerivedFeature(
    payload,
    "area_por_lote",
    safeRatio(payload.AreaConstruida, payload.TamanhoLote)
  );
  addDerivedFeature(
    payload,
    "area_por_quarto",
    safeRatio(payload.AreaConstruida, payload.BedroomAbvGr)
  );
  addDerivedFeature(
    payload,
    "area_por_vaga",
    safeRatio(payload.AreaGaragem, payload.CarrosGaragem)
  );

  const builtYear = toFiniteNumber(payload.AnoConstrucao);
  const remodelYear = toFiniteNumber(payload.AnoReforma);

  if (builtYear) {
    addDerivedFeature(
      payload,
      "Idade",
      Math.max(new Date().getFullYear() - Math.trunc(builtYear), 0)
    );
  }

  if (builtYear && remodelYear) {
    addDerivedFeature(payload, "FoiReformado", remodelYear > builtYear ? 1 : 0);
  }
}

function applyModelDerivedFeatures(payload, explicitPayload) {
  const derivedValues = {
    area_por_lote: safeRatio(payload.AreaConstruida, payload.TamanhoLote),
    area_por_quarto: safeRatio(payload.AreaConstruida, payload.BedroomAbvGr),
  };
  const builtYear = toFiniteNumber(payload.AnoConstrucao);
  const remodelYear = toFiniteNumber(payload.AnoReforma);

  if (builtYear) {
    derivedValues.Idade = Math.max(
      new Date().getFullYear() - Math.trunc(builtYear),
      0
    );
  }

  if (builtYear && remodelYear) {
    derivedValues.FoiReformado = remodelYear > builtYear ? 1 : 0;
  }

  Object.entries(derivedValues).forEach(([name, value]) => {
    if (
      hasPayloadValue(explicitPayload[name]) ||
      value === null ||
      value === undefined
    ) {
      return;
    }

    payload[name] = value;
  });
}

function buildPayload(form) {
  const payload = Object.fromEntries(
    Object.entries(form)
      .filter(([, value]) => hasPayloadValue(value))
      .map(([key, value]) => [
        key,
        numericFields.has(key) ? Number(value) : value,
      ])
  );

  addDerivedFeatures(payload);

  return payload;
}

function buildModelPayload(form) {
  const explicitPayload = buildPayload(form);
  const payload = { ...modelDefaultPayload, ...explicitPayload };

  applyModelDerivedFeatures(payload, explicitPayload);

  return payload;
}

async function postJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Não foi possível gerar a previsão.");
  }

  return response.json();
}

function toPredictionResult(data) {
  return {
    predicted_price: data.predicted_price,
    model_version: data.model_version,
    inference_time_ms: data.inference_time_ms,
  };
}

async function predictPrice(modelPayload) {
  try {
    return toPredictionResult(await postJson(PREDICTION_ENDPOINT, modelPayload));
  } catch {
    const fallbackPayload = {
      ...modelPayload,
      ImovelId: FALLBACK_PROPERTY_ID,
      PrecoVenda: FALLBACK_REAL_PRICE,
    };

    return toPredictionResult(
      await postJson(VALIDATION_FALLBACK_ENDPOINT, fallbackPayload)
    );
  }
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
  Qualidade: {
    icon: CheckCircle2,
    label: "Qualidade",
    type: "number",
    min: 1,
    max: 10,
  },
  ClasseZona: { icon: Building2, label: "Zona" },
  AreaConstruida: {
    icon: Ruler,
    label: "\u00c1rea constru\u00edda",
    type: "number",
    min: 0,
  },
  QualidadeCozinha: { icon: CheckCircle2, label: "Qualidade da cozinha" },
  ArCentral: { icon: CheckCircle2, label: "Ar central" },
  Exterior1: { icon: Building2, label: "Material externo" },
  ClasseImovel: { icon: Home, label: "Tipo de im\u00f3vel" },
  CarrosGaragem: {
    icon: Car,
    label: "Vagas",
    type: "number",
    min: 0,
  },
  Fachada: { icon: Ruler, label: "Fachada", type: "number", min: 0 },
  TamanhoLote: { icon: Ruler, label: "Tamanho do lote", type: "number", min: 0 },
  FormaProp: { icon: MapPin, label: "Formato do terreno" },
  PlanoProp: { icon: MapPin, label: "Plano do terreno" },
  ConfigLote: { icon: MapPin, label: "Configura\u00e7\u00e3o do lote" },
  InclinacaoLote: { icon: MapPin, label: "Inclina\u00e7\u00e3o do lote" },
  Estrada1: { icon: MapPin, label: "Proximidade estrada 1" },
  Estrada2: { icon: MapPin, label: "Proximidade estrada 2" },
  TipoHabitacao: { icon: Home, label: "Tipo de habita\u00e7\u00e3o" },
  EstiloHabitacao: { icon: Home, label: "Estilo da habita\u00e7\u00e3o" },
  Condicao: {
    icon: CheckCircle2,
    label: "Condi\u00e7\u00e3o geral",
    type: "number",
    min: 1,
    max: 10,
  },
  AnoConstrucao: { icon: Home, label: "Ano de constru\u00e7\u00e3o", type: "number" },
  AnoReforma: { icon: Home, label: "Ano da reforma", type: "number" },
  TipoTelhado: { icon: Building2, label: "Tipo de telhado" },
  MaterialTelhado: { icon: Building2, label: "Material do telhado" },
  Exterior2: { icon: Building2, label: "Material externo 2" },
  TipoAlvenaria: { icon: Building2, label: "Tipo de alvenaria" },
  AreaAlvenaria: { icon: Ruler, label: "\u00c1rea de alvenaria", type: "number", min: 0 },
  QualidadeCobertura: { icon: CheckCircle2, label: "Qualidade da cobertura" },
  CondicaoExterna: { icon: CheckCircle2, label: "Condi\u00e7\u00e3o externa" },
  TipoFundacao: { icon: Building2, label: "Tipo de funda\u00e7\u00e3o" },
  AlturaPorao: { icon: CheckCircle2, label: "Altura do por\u00e3o" },
  CondicaoPorao: { icon: CheckCircle2, label: "Condi\u00e7\u00e3o do por\u00e3o" },
  ParedePorao: { icon: CheckCircle2, label: "Exposi\u00e7\u00e3o do por\u00e3o" },
  TipoAcabPorao1: { icon: CheckCircle2, label: "Acabamento por\u00e3o 1" },
  TipoAcabPorao2: { icon: CheckCircle2, label: "Acabamento por\u00e3o 2" },
  AreaPorao: { icon: Ruler, label: "\u00c1rea do por\u00e3o", type: "number", min: 0 },
  Aquecimento: { icon: Home, label: "Aquecimento" },
  QualidadeAquecimento: { icon: CheckCircle2, label: "Qualidade aquecimento" },
  InstalacaoEletrica: { icon: Gauge, label: "Instala\u00e7\u00e3o el\u00e9trica" },
  BanheiroPorao: { icon: Home, label: "Banheiros no por\u00e3o", type: "number", min: 0 },
  LavaboPorao: { icon: Home, label: "Lavabos no por\u00e3o", type: "number", min: 0 },
  Banheiro: { icon: Home, label: "Banheiros", type: "number", min: 0 },
  Lavabo: { icon: Home, label: "Lavabos", type: "number", min: 0 },
  BedroomAbvGr: { icon: Home, label: "Quartos", type: "number", min: 0 },
  KitchenAbvGr: { icon: Home, label: "Cozinhas", type: "number", min: 0 },
  Funcionalidade: { icon: Gauge, label: "Funcionalidade" },
  Lareira: { icon: Home, label: "Lareiras", type: "number", min: 0 },
  QualidadeLareira: { icon: CheckCircle2, label: "Qualidade da lareira" },
  LocalGaragem: { icon: Car, label: "Local da garagem" },
  AcabamentoGaragem: { icon: Car, label: "Acabamento da garagem" },
  QualidadeGaragem: { icon: Car, label: "Qualidade da garagem" },
  CondicaoGaragem: { icon: Car, label: "Condi\u00e7\u00e3o da garagem" },
  EntradaPavimentada: { icon: Car, label: "Entrada pavimentada" },
  AreaDeck: { icon: Ruler, label: "\u00c1rea do deck", type: "number", min: 0 },
  AreaVarandaAberta: { icon: Ruler, label: "\u00c1rea varanda aberta", type: "number", min: 0 },
  AreaVarandaFechada: { icon: Ruler, label: "\u00c1rea varanda fechada", type: "number", min: 0 },
  AreaVaranda3Estacoes: {
    icon: Ruler,
    label: "\u00c1rea varanda 3 esta\u00e7\u00f5es",
    type: "number",
    min: 0,
  },
  AreaAlpendre: { icon: Ruler, label: "\u00c1rea do alpendre", type: "number", min: 0 },
  AreaPiscina: { icon: Ruler, label: "\u00c1rea da piscina", type: "number", min: 0 },
  QualidadeCerca: { icon: CheckCircle2, label: "Qualidade da cerca" },
  ValorOutros: { icon: DollarSign, label: "Valor de extras", type: "number", min: 0 },
  Idade: { icon: Home, label: "Idade do im\u00f3vel", type: "number", min: 0 },
  FoiReformado: { icon: CheckCircle2, label: "Foi reformado", type: "number", min: 0, max: 1 },
  area_por_lote: { icon: Ruler, label: "\u00c1rea por lote", type: "number", min: 0 },
  area_por_quarto: { icon: Ruler, label: "\u00c1rea por quarto", type: "number", min: 0 },
  area_por_vaga: { icon: Ruler, label: "\u00c1rea por vaga", type: "number", min: 0 },
};

const featureImportanceOrder = [
  "Bairro",
  "Qualidade",
  "ClasseZona",
  "AreaConstruida",
  "QualidadeCozinha",
  "ArCentral",
  "Exterior1",
  "ClasseImovel",
  "CarrosGaragem",
  "Estrada1",
  "Funcionalidade",
  "QualidadeAquecimento",
  "Condicao",
  "CondicaoGaragem",
  "Idade",
  "EntradaPavimentada",
  "AreaPorao",
  "ConfigLote",
  "CondicaoExterna",
  "Aquecimento",
  "TipoFundacao",
  "QualidadeLareira",
  "TamanhoLote",
  "LocalGaragem",
  "KitchenAbvGr",
  "area_por_lote",
  "QualidadeCobertura",
  "InstalacaoEletrica",
  "TipoHabitacao",
  "Lareira",
  "BanheiroPorao",
  "Banheiro",
  "AnoConstrucao",
  "EstiloHabitacao",
  "Lavabo",
  "AcabamentoGaragem",
  "AnoReforma",
  "FormaProp",
  "Exterior2",
  "ParedePorao",
  "TipoAcabPorao1",
  "AreaAlpendre",
  "CondicaoPorao",
  "AreaVarandaAberta",
  "PlanoProp",
  "area_por_quarto",
  "AreaVarandaFechada",
  "AreaAlvenaria",
  "AlturaPorao",
  "area_por_vaga",
  "AreaDeck",
  "QualidadeGaragem",
  "MaterialTelhado",
  "Fachada",
  "TipoAcabPorao2",
  "QualidadeCerca",
  "LavaboPorao",
  "BedroomAbvGr",
  "TipoTelhado",
  "ValorOutros",
  "FoiReformado",
  "TipoAlvenaria",
  "AreaPiscina",
  "InclinacaoLote",
  "AreaVaranda3Estacoes",
  "Estrada2",
];

const featureImportanceRank = Object.fromEntries(
  featureImportanceOrder.map((name, index) => [name, index + 1])
);

function sortByFeatureImportance(names) {
  return [...names].sort(
    (a, b) =>
      (featureImportanceRank[a] ?? Number.MAX_SAFE_INTEGER) -
      (featureImportanceRank[b] ?? Number.MAX_SAFE_INTEGER)
  );
}

const optionalFeatureNames = sortByFeatureImportance(
  Object.keys(fieldMeta).filter((name) => !baseFieldNames.includes(name))
);

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
  onRemove,
  optional = false,
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
        {onRemove ? (
          <button
            aria-label={`Remover ${label}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={onRemove}
            title={`Remover ${label}`}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {options ? (
        <select
          className="field-control"
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
        >
          {optional ? <option value="">Selecionar</option> : null}
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
  const [selectedOptionalFields, setSelectedOptionalFields] = useState([]);
  const [showOptionalFeaturePicker, setShowOptionalFeaturePicker] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const payload = useMemo(() => buildPayload(form), [form]);
  const modelPayload = useMemo(() => buildModelPayload(form), [form]);
  const activeFieldCount = baseFieldNames.length + selectedOptionalFields.length;
  const availableOptionalFeatures = useMemo(
    () =>
      optionalFeatureNames.filter(
        (name) => !selectedOptionalFields.includes(name)
      ),
    [selectedOptionalFields]
  );
  const priceRange = useMemo(
    () => (result ? getPriceRange(result.predicted_price) : null),
    [result]
  );
  const summaryItems = useMemo(
    () => {
      const baseSummary = [
        {
          icon: Ruler,
          label: "\u00c1rea",
          value:
            payload.AreaConstruida === undefined
              ? "N/A"
              : `${payload.AreaConstruida} m\u00b2`,
        },
        {
          icon: CheckCircle2,
          label: "Qualidade",
          value: payload.Qualidade ?? "N/A",
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
          value:
            payload.CarrosGaragem === undefined
              ? "N/A"
              : `${payload.CarrosGaragem} vagas`,
        },
      ];

      const optionalSummary = selectedOptionalFields
        .filter((name) => payload[name] !== undefined)
        .map((name) => {
          const meta = fieldMeta[name];
          const rawValue = payload[name];

          return {
            icon: meta.icon,
            label: meta.label,
            value: selectOptions[name] ? getOptionLabel(name, rawValue) : rawValue,
          };
        });

      return [...baseSummary, ...optionalSummary];
    },
    [payload, selectedOptionalFields]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleAddFeature(name) {
    if (!name || selectedOptionalFields.includes(name)) {
      return;
    }

    setSelectedOptionalFields((current) =>
      sortByFeatureImportance([...current, name])
    );
    setForm((current) => ({ ...current, [name]: "" }));
  }

  function handleRemoveFeature(name) {
    setSelectedOptionalFields((current) =>
      current.filter((fieldName) => fieldName !== name)
    );
    setForm((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictPrice(modelPayload);
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
    setSelectedOptionalFields([]);
    setShowOptionalFeaturePicker(false);
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
                9 campos principais e features opcionais do modelo.
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

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Features opcionais
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {availableOptionalFeatures.length} dispon&iacute;veis
                  </p>
                </div>
              </div>

              <button
                aria-controls="optional-feature-picker"
                aria-expanded={showOptionalFeaturePicker}
                className="btn-secondary w-full sm:w-auto"
                onClick={() =>
                  setShowOptionalFeaturePicker((current) => !current)
                }
                type="button"
              >
                {showOptionalFeaturePicker ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden="true" />
                )}
                {showOptionalFeaturePicker ? "Ocultar opções" : "Adicionar features"}
              </button>
            </div>

            {showOptionalFeaturePicker ? (
              <div
                className="mt-5 max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                id="optional-feature-picker"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2.5">
                  <p className="text-sm font-bold text-slate-700">
                    Adicionar feature
                  </p>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    ordem de impacto
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {availableOptionalFeatures.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {availableOptionalFeatures.map((name) => {
                        const meta = fieldMeta[name];
                        const Icon = meta.icon;

                        return (
                          <button
                            key={name}
                            className="group flex min-h-14 w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                            onClick={() => handleAddFeature(name)}
                            type="button"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-white">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-slate-800">
                                  {meta.label}
                                </span>
                                <span className="mt-0.5 block text-xs font-bold text-slate-400">
                                  prioridade #{featureImportanceRank[name]}
                                </span>
                              </span>
                            </span>

                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition group-hover:border-emerald-200 group-hover:bg-white group-hover:text-emerald-700">
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-sm font-semibold text-slate-500">
                      Todas as features foram adicionadas.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {selectedOptionalFields.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {selectedOptionalFields.map((name) => {
                  const meta = fieldMeta[name];

                  return (
                    <Field
                      key={name}
                      {...meta}
                      name={name}
                      optional
                      value={form[name] ?? ""}
                      onChange={handleChange}
                      onRemove={() => handleRemoveFeature(name)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">
                Nenhuma feature opcional adicionada.
              </div>
            )}
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
