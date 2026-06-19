"use client";

import { useMemo, useState } from "react";
import { Calculator, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { products, taxRules } from "./tax-data";

type Operation = "producao" | "revenda";
type Regime = "lucro-real" | "lucro-presumido" | "simples";
type Destination = "RS" | "SC" | "PR" | "SP" | "exportacao";

export default function Home() {
  const [query, setQuery] = useState("brita");
  const [operation, setOperation] = useState<Operation>("producao");
  const [origin, setOrigin] = useState("RS");
  const [destination, setDestination] = useState<Destination>("RS");
  const [regime, setRegime] = useState<Regime>("lucro-real");
  const [selectedNcm, setSelectedNcm] = useState("");

  const suggestions = useMemo(() => {
    return products.filter((item) =>
      item.keywords.some((keyword) =>
        query.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }, [query]);

  const selectedProduct = suggestions.find((item) => item.ncm === selectedNcm) ?? suggestions[0];

  const result = useMemo(() => {
    if (!selectedProduct) return null;
    const isExport = destination === "exportacao";
    const rule = taxRules[selectedProduct.ncm];
    const pisCofins = regime === "lucro-real" ? rule.pisCofinsLucroReal : rule.pisCofinsDefault;

    return {
      ncm: selectedProduct.ncm,
      produto: selectedProduct.name,
      confianca: selectedProduct.confidence,
      icms: isExport ? "Não incidência na exportação" : origin === destination ? "17% estimado no RS" : "12% estimado interestadual Sul/Sudeste",
      pis: isExport ? "Alíquota zero" : pisCofins.pis,
      cofins: isExport ? "Alíquota zero" : pisCofins.cofins,
      ipi: rule.ipi,
      cfem: operation === "producao" ? rule.cfem : "Normalmente não aplicável na revenda pura",
      cfop: isExport ? "7101 / 7102" : operation === "producao" ? (origin === destination ? "5101" : "6101") : (origin === destination ? "5102" : "6102"),
      cst: isExport ? "ICMS 041 | PIS/COFINS 08" : "Validar conforme operação e benefício fiscal",
      warning: rule.warning,
    };
  }, [selectedProduct, origin, destination, regime, operation]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-8">
        <header className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              <Sparkles size={16} /> MVP fiscal para agro e mineração
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Tributa Fácil
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Informe o produto, tipo de operação, origem, destino e regime tributário. O sistema sugere NCM e monta uma análise preliminar de ICMS, PIS/COFINS, CFEM, IPI, CFOP e CST.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-300" />
              <div>
                <p className="font-semibold">Análise assistida</p>
                <p className="text-sm text-slate-300">Base inicial com regras parametrizadas e validação humana.</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              <Metric value="8" label="Produtos base" />
              <Metric value="5" label="Tributos" />
              <Metric value="4" label="Destinos" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-6 text-slate-950 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <FileSearch />
              <h2 className="text-2xl font-bold">Consulta fiscal</h2>
            </div>

            <label className="label">Produto ou descrição</label>
            <textarea value={query} onChange={(event) => setQuery(event.target.value)} className="input min-h-24" placeholder="Ex.: venda de brita 1 produção própria para construtora no RS" />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select label="Tipo" value={operation} onChange={setOperation} options={[['producao','Produção própria'],['revenda','Revenda']]} />
              <Select label="Regime" value={regime} onChange={setRegime} options={[['lucro-real','Lucro Real'],['lucro-presumido','Lucro Presumido'],['simples','Simples Nacional']]} />
              <Select label="Origem" value={origin} onChange={setOrigin} options={[['RS','RS'],['SC','SC'],['PR','PR'],['SP','SP']]} />
              <Select label="Destino" value={destination} onChange={setDestination} options={[['RS','RS'],['SC','SC'],['PR','PR'],['SP','SP'],['exportacao','Exportação']]} />
            </div>

            <div className="mt-5">
              <label className="label">NCM sugerido</label>
              <select className="input" value={selectedNcm || selectedProduct?.ncm || ""} onChange={(event) => setSelectedNcm(event.target.value)}>
                {suggestions.length === 0 && <option>Nenhum NCM encontrado</option>}
                {suggestions.map((item) => (
                  <option key={item.ncm} value={item.ncm}>{item.ncm} — {item.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <Calculator className="text-emerald-300" />
              <h2 className="text-2xl font-bold">Resultado preliminar</h2>
            </div>

            {!result ? (
              <p className="text-slate-300">Digite um produto como brita, granito, calcário, soja, milho, trigo, aveia ou feldspato.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-400">Produto identificado</p>
                  <h3 className="text-2xl font-bold">{result.produto}</h3>
                  <p className="mt-1 text-emerald-300">NCM {result.ncm} · Confiança {result.confianca}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Result label="ICMS" value={result.icms} />
                  <Result label="PIS" value={result.pis} />
                  <Result label="COFINS" value={result.cofins} />
                  <Result label="IPI" value={result.ipi} />
                  <Result label="CFEM" value={result.cfem} />
                  <Result label="CFOP" value={result.cfop} />
                  <Result label="CST/CSOSN" value={result.cst} wide />
                </div>

                <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
                  {result.warning}
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl bg-white/10 p-3"><p className="text-2xl font-bold">{value}</p><p className="text-slate-300">{label}</p></div>;
}

function Result({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={`rounded-2xl bg-white p-4 text-slate-950 ${wide ? 'sm:col-span-2' : ''}`}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: any) => void; options: string[][] }) {
  return <div><label className="label">{label}</label><select className="input" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>;
}
