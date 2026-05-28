import { useState } from "react";
import { BarChart3, Calculator } from "lucide-react";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";

const TABS = [
  { id: "calculadora", label: "Calculadora", icon: Calculator },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Root() {
  const [view, setView] = useState("calculadora");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-emerald-500 text-ink"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {view === "calculadora" ? <App /> : <Dashboard />}
    </div>
  );
}
