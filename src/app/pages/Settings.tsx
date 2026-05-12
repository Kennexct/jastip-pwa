import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  Globe,
  DollarSign,
  Shield,
  ImageIcon,
  Info,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Zap,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  Save,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/AuthContext";

/* ─── Data ─────────────────────────────────────────────── */
const countries = [
  { code: "SG", name: "Singapore", currency: "SGD", flag: "🇸🇬", rate: "11500" },
  { code: "MY", name: "Malaysia",  currency: "MYR", flag: "🇲🇾", rate: "3400"  },
  { code: "JP", name: "Japan",     currency: "JPY", flag: "🇯🇵", rate: "103"   },
  { code: "KR", name: "S. Korea",  currency: "KRW", flag: "🇰🇷", rate: "11"    },
  { code: "TH", name: "Thailand",  currency: "THB", flag: "🇹🇭", rate: "430"   },
  { code: "AU", name: "Australia", currency: "AUD", flag: "🇦🇺", rate: "10500" },
];

type ConfirmConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
};

type SaveStep = { label: string; done: boolean };

/* ─── Reusable Toggle ───────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  color = "bg-blue-500",
}: {
  checked: boolean;
  onChange: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-[52px] h-7 rounded-full relative transition-all duration-300 flex-shrink-0 ${
        checked ? color : "bg-gray-200"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
        style={{ left: checked ? "calc(100% - 26px)" : "2px" }}
      />
    </button>
  );
}

/* ─── Unsaved Badge ─────────────────────────────────────── */
function DirtyBadge() {
  return (
    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      Unsaved
    </span>
  );
}

/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({
  icon: Icon,
  title,
  isDirty,
  isSaved,
  iconBg,
  iconColor,
  headerBg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isDirty: boolean;
  isSaved: boolean;
  iconBg: string;
  iconColor: string;
  headerBg: string;
}) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 ${headerBg}`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
      </div>
      <span className="font-semibold text-gray-800 flex-1">{title}</span>
      <AnimatePresence mode="wait">
        {isSaved && (
          <motion.span
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1"
          >
            <CheckCircle2 className="w-2.5 h-2.5" /> Saved
          </motion.span>
        )}
        {isDirty && !isSaved && (
          <motion.div key="dirty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DirtyBadge />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Confirmation Modal ─────────────────────────────────── */
function ConfirmModal({
  config,
  onCancel,
}: {
  config: ConfirmConfig;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        {/* Icon */}
        <div className="flex flex-col items-center px-6 pt-7 pb-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: "18px" }}>
            {config.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">{config.message}</p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => { config.onConfirm(); onCancel(); }}
            className={`flex-1 h-12 rounded-2xl text-white font-bold text-sm ${config.confirmColor}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Save Progress Overlay ──────────────────────────────── */
function SaveProgressOverlay({
  steps,
  onDone,
}: {
  steps: SaveStep[];
  onDone: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const allDone = current >= steps.length;

  useEffect(() => {
    if (allDone) {
      setTimeout(onDone, 900);
      return;
    }
    const t1 = setTimeout(() => {
      setProgress(((current + 1) / steps.length) * 100);
    }, 80);
    const t2 = setTimeout(() => {
      setCurrent((c) => c + 1);
    }, 480);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [current, allDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
      >
        {/* Top icon */}
        <div className="flex justify-center mb-5">
          <AnimatePresence mode="wait">
            {allDone ? (
              <motion.div
                key="done"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center"
              >
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </motion.div>
            ) : (
              <motion.div
                key="saving"
                className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Save className="w-8 h-8 text-blue-600" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mb-5">
          <h3 className="font-bold text-gray-900 mb-1" style={{ fontSize: "18px" }}>
            {allDone ? "All Settings Saved!" : "Saving Changes…"}
          </h3>
          <p className="text-gray-500 text-sm">
            {allDone
              ? "Your trip is ready. Let's start shopping! 🛍️"
              : steps[current]
              ? `Processing: ${steps[current].label}`
              : "Finalising…"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        {/* Step list */}
        <div className="space-y-2.5">
          {steps.map((step, i) => {
            const isDone = i < current;
            const isActive = i === current && !allDone;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    isDone
                      ? "bg-green-500"
                      : isActive
                      ? "bg-blue-500"
                      : "bg-gray-200"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-3 h-3 text-white" />
                    </motion.div>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-200 ${
                    isDone ? "text-green-700 font-medium" : isActive ? "text-blue-700 font-semibold" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  /* Saved originals to track dirty */
  const [savedState, setSavedState] = useState({
    country: "SG", rate: "11500",
    dpMandatory: true, dpType: "percent" as "percent" | "nominal", dpThreshold: "30",
    opacity: 40, autoPrice: true, watermark: null as string | null,
  });

  /* Live edits */
  const [country,      setCountry]      = useState("SG");
  const [rate,         setRate]          = useState("11500");
  const [dpMandatory,  setDpMandatory]   = useState(true);
  const [dpType,       setDpType]        = useState<"percent" | "nominal">("percent");
  const [dpThreshold,  setDpThreshold]   = useState("30");
  const [opacity,      setOpacity]       = useState(40);
  const [autoPrice,    setAutoPrice]     = useState(true);
  const [watermark,    setWatermark]     = useState<string | null>(null);

  /* UI states */
  const [confirm,      setConfirm]       = useState<ConfirmConfig | null>(null);
  const [showSaving,   setShowSaving]    = useState(false);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [showPreview,  setShowPreview]   = useState(false);

  /* Derived dirty flags */
  const currencyDirty = country !== savedState.country || rate !== savedState.rate;
  const dpDirty = dpMandatory !== savedState.dpMandatory || dpType !== savedState.dpType || dpThreshold !== savedState.dpThreshold;
  const catalogDirty = opacity !== savedState.opacity || autoPrice !== savedState.autoPrice || watermark !== savedState.watermark;
  const anyDirty = currencyDirty || dpDirty || catalogDirty;

  const countryObj = countries.find((c) => c.code === country)!;

  /* Confirm a destructive toggle */
  const askConfirm = useCallback((cfg: ConfirmConfig) => setConfirm(cfg), []);

  const handleCountrySelect = (code: string) => {
    const c = countries.find((x) => x.code === code)!;
    if (code !== country) {
      askConfirm({
        title: "Switch Destination?",
        message: `Switching to ${c.name} will prefill the exchange rate to ~${Number(c.rate).toLocaleString("id-ID")} IDR. You can adjust it manually.`,
        confirmLabel: `Switch to ${c.flag} ${c.name}`,
        confirmColor: "bg-blue-600",
        onConfirm: () => { setCountry(code); setRate(c.rate); },
      });
    }
  };

  const handleDpToggle = () => {
    if (dpMandatory) {
      askConfirm({
        title: "Disable DP Requirement?",
        message: "Making DP optional means customers can order without paying a down payment upfront. Existing orders won't be affected.",
        confirmLabel: "Yes, Make Optional",
        confirmColor: "bg-amber-500",
        onConfirm: () => setDpMandatory(false),
      });
    } else {
      setDpMandatory(true);
    }
  };

  const handleDeleteWatermark = () => {
    askConfirm({
      title: "Remove Watermark?",
      message: "Your watermark logo will be removed from all future catalog photos. Already generated photos are not affected.",
      confirmLabel: "Remove Logo",
      confirmColor: "bg-red-500",
      onConfirm: () => setWatermark(null),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setWatermark(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!anyDirty) return;
    setShowSaving(true);
  };

  const handleSaveDone = () => {
    setShowSaving(false);
    const newSaved = new Set<string>();
    if (currencyDirty) newSaved.add("currency");
    if (dpDirty)       newSaved.add("dp");
    if (catalogDirty)  newSaved.add("catalog");
    setSavedSections(newSaved);
    setSavedState({ country, rate, dpMandatory, dpType, dpThreshold, opacity, autoPrice, watermark });
    setTimeout(() => setSavedSections(new Set()), 3000);
  };

  const saveSteps: SaveStep[] = [
    ...(currencyDirty ? [{ label: "Currency & Exchange Rate", done: false }] : []),
    ...(dpDirty       ? [{ label: "Down Payment Policy",       done: false }] : []),
    ...(catalogDirty  ? [{ label: "Visual Catalog Engine",     done: false }] : []),
    { label: "Syncing trip profile", done: false },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA]">

      {/* ── Header ─────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a4fc4] to-[#2563EB] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold" style={{ fontSize: "22px" }}>
              Trip Settings
            </h1>
            <p className="text-blue-200 text-xs mt-0.5">Configure before your next jastip run</p>
          </div>
          <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-white" />
          </button>
        </div>

        {/* Active trip chip */}
        <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-3 border border-white/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-sm font-semibold">Active Trip: 🇸🇬 Singapore</span>
          <ChevronRight className="w-4 h-4 text-white/60 ml-auto" />
        </div>
      </div>

      {/* ── Unsaved Changes Banner ─────────── */}
      <AnimatePresence>
        {anyDirty && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-amber-800 font-semibold text-sm">You have unsaved changes</p>
              <p className="text-amber-600 text-xs">
                {[currencyDirty && "Currency", dpDirty && "DP Policy", catalogDirty && "Catalog"]
                  .filter(Boolean).join(", ")} modified
              </p>
            </div>
            <button
              onClick={handleSave}
              className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
            >
              Save
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pt-3 pb-32 space-y-4">

        {/* ── Section 1: Currency ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <SectionHeader
            icon={Globe} title="Currency Setup"
            isDirty={currencyDirty} isSaved={savedSections.has("currency")}
            iconBg="bg-blue-100" iconColor="text-blue-600" headerBg="bg-blue-50/60"
          />

          <div className="p-4 space-y-5">
            {/* Country Grid */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                Destination Country
              </label>
              <div className="grid grid-cols-3 gap-2">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCountrySelect(c.code)}
                    className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 border-2 transition-all active:scale-95 ${
                      country === c.code
                        ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                        : "border-gray-100 bg-[#F4F6FA] hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className={`text-[11px] font-bold ${country === c.code ? "text-blue-700" : "text-gray-600"}`}>
                      {c.code}
                    </span>
                    {country === c.code && (
                      <motion.div
                        layoutId="country-check"
                        className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Exchange Rate
                </label>
                <button
                  onClick={() => setRate(countryObj.rate)}
                  className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100"
                >
                  <Zap className="w-3 h-3" /> Autofill Rate
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-blue-100 rounded-xl px-2.5 py-1.5 z-10">
                  <span className="text-base">{countryObj.flag}</span>
                  <span className="text-blue-700 text-xs font-bold">1 {countryObj.currency}</span>
                </div>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full h-[56px] bg-[#F4F6FA] rounded-2xl pl-[108px] pr-14 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="11500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">IDR</span>
              </div>

              {/* Live preview */}
              {Number(rate) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2.5 bg-blue-50 rounded-xl px-3.5 py-2.5 border border-blue-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-700 text-xs">Example conversion</span>
                  </div>
                  <span className="text-blue-800 text-xs font-bold">
                    {countryObj.currency} 100 = Rp {(100 * Number(rate)).toLocaleString("id-ID")}
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: DP Policy ────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <SectionHeader
            icon={Shield} title="Down Payment (DP) Policy"
            isDirty={dpDirty} isSaved={savedSections.has("dp")}
            iconBg="bg-amber-100" iconColor="text-amber-600" headerBg="bg-amber-50/60"
          />

          <div className="p-4 space-y-4">
            {/* Master toggle */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${dpMandatory ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dpMandatory ? "bg-amber-100" : "bg-gray-200"}`}>
                  <Shield className={`w-5 h-5 ${dpMandatory ? "text-amber-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${dpMandatory ? "text-amber-900" : "text-gray-600"}`}>
                    {dpMandatory ? "DP Required" : "DP Optional"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {dpMandatory ? "All orders must include a deposit" : "Customers can order without deposit"}
                  </div>
                </div>
              </div>
              <Toggle checked={dpMandatory} onChange={handleDpToggle} color="bg-amber-500" />
            </div>

            <AnimatePresence>
              {dpMandatory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* DP Type */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 block">
                      DP Calculation Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["percent", "nominal"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setDpType(type)}
                          className={`h-[56px] rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            dpType === type
                              ? "border-amber-400 bg-amber-50 text-amber-700"
                              : "border-gray-200 bg-[#F4F6FA] text-gray-500"
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm ${dpType === type ? "bg-amber-200" : "bg-gray-200"}`}>
                            {type === "percent" ? "%" : "Rp"}
                          </span>
                          {type === "percent" ? "Percentage" : "Fixed Amount"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick presets for percent */}
                  {dpType === "percent" && (
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Quick presets</label>
                      <div className="flex gap-2 flex-wrap">
                        {["20", "25", "30", "50"].map((p) => (
                          <button
                            key={p}
                            onClick={() => setDpThreshold(p)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              dpThreshold === p
                                ? "bg-amber-500 text-white border-amber-500"
                                : "bg-white text-gray-600 border-gray-200"
                            }`}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Threshold input */}
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                      Minimum DP {dpType === "percent" ? "Percentage" : "Amount"}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                        <span className="text-amber-700 font-black text-sm">
                          {dpType === "percent" ? "%" : "Rp"}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={dpThreshold}
                        onChange={(e) => setDpThreshold(e.target.value)}
                        className="w-full h-[56px] bg-[#F4F6FA] rounded-2xl pl-16 pr-4 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                        placeholder={dpType === "percent" ? "30" : "50000"}
                      />
                    </div>

                    {/* Summary pill */}
                    <div className="mt-2.5 bg-amber-50 rounded-xl px-3.5 py-2.5 border border-amber-100">
                      <p className="text-amber-800 text-xs">
                        {dpType === "percent"
                          ? `For a Rp 500.000 item → DP required: Rp ${(500000 * Number(dpThreshold || 0) / 100).toLocaleString("id-ID")}`
                          : `Fixed deposit of Rp ${Number(dpThreshold || 0).toLocaleString("id-ID")} per order`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Section 3: Visual Catalog ───── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <SectionHeader
            icon={ImageIcon} title="Visual Catalog Engine"
            isDirty={catalogDirty} isSaved={savedSections.has("catalog")}
            iconBg="bg-purple-100" iconColor="text-purple-600" headerBg="bg-purple-50/60"
          />

          <div className="p-4 space-y-5">
            {/* Watermark Upload */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 block">
                Brand Watermark Logo
              </label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

              {watermark ? (
                <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 overflow-hidden">
                  <div className="relative aspect-[3/1] flex items-center justify-center bg-[#F4F6FA]">
                    <img src={watermark} alt="Logo" className="max-h-20 max-w-[60%] object-contain" style={{ opacity: opacity / 100 }} />
                    {/* Preview badge */}
                    <div className="absolute top-2 left-2 bg-black/40 rounded-lg px-2 py-1">
                      <span className="text-white text-[10px] font-bold">Preview at {opacity}%</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex-1 h-10 rounded-xl bg-purple-100 text-purple-700 text-sm font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Replace
                    </button>
                    <button
                      onClick={handleDeleteWatermark}
                      className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-[110px] rounded-2xl border-2 border-dashed border-gray-300 bg-[#F4F6FA] flex flex-col items-center justify-center gap-2.5 hover:border-purple-400 hover:bg-purple-50 transition-colors active:scale-98"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-200 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">Tap to upload logo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG with transparent background recommended</p>
                  </div>
                </button>
              )}
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Watermark Opacity
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-purple-700 font-black text-base">{opacity}%</span>
                  <button onClick={() => setShowPreview(!showPreview)} className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                    {showPreview ? <EyeOff className="w-3.5 h-3.5 text-purple-600" /> : <Eye className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                </div>
              </div>

              {/* Custom track */}
              <div className="relative h-8 flex items-center">
                <div className="absolute inset-x-0 h-2 rounded-full bg-gradient-to-r from-gray-200 to-purple-300 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                    style={{ width: `${opacity}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="absolute inset-x-0 w-full opacity-0 cursor-pointer h-8"
                />
                {/* Thumb */}
                <div
                  className="absolute w-7 h-7 bg-white rounded-full shadow-lg border-2 border-purple-400 pointer-events-none transition-all"
                  style={{ left: `calc(${opacity}% - 14px)` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                {[10, 30, 50, 70, 90].map((v) => (
                  <button
                    key={v}
                    onClick={() => setOpacity(v)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                      opacity === v ? "bg-purple-100 text-purple-700" : "text-gray-400"
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Price Labeling */}
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${autoPrice ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${autoPrice ? "bg-purple-100" : "bg-gray-200"}`}>
                  <Sparkles className={`w-5 h-5 ${autoPrice ? "text-purple-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${autoPrice ? "text-purple-900" : "text-gray-600"}`}>
                    Auto-Price Labeling
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {autoPrice ? "Price ribbon added automatically" : "Manually add price to photos"}
                  </div>
                </div>
              </div>
              <Toggle checked={autoPrice} onChange={() => setAutoPrice(!autoPrice)} color="bg-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* ── Save CTA ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleSave}
            disabled={!anyDirty}
            className={`w-full h-[60px] rounded-2xl flex items-center justify-center gap-3 font-bold text-base transition-all shadow-lg ${
              anyDirty
                ? "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white shadow-blue-200 active:scale-98"
                : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
            }`}
          >
            <Save className={`w-5 h-5 ${anyDirty ? "text-white" : "text-gray-400"}`} />
            {anyDirty ? "Save All Changes" : "No Changes to Save"}
          </button>

          {anyDirty && (
            <p className="text-center text-xs text-gray-400 mt-2.5">
              {[currencyDirty && "Currency", dpDirty && "DP Policy", catalogDirty && "Catalog"]
                .filter(Boolean).join(" · ")} will be updated
            </p>
          )}
        </motion.div>

        {/* ── Logout Button ───────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={async () => { await signOut(); navigate("/login"); }}
            className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 font-semibold transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
          <p className="text-center text-xs text-gray-300 mt-3">JastipFlow v1.0</p>
        </motion.div>
      </div>

      {/* ── Confirm Modal ─────────────────── */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal config={confirm} onCancel={() => setConfirm(null)} />
        )}
      </AnimatePresence>

      {/* ── Save Progress Overlay ─────────── */}
      <AnimatePresence>
        {showSaving && (
          <SaveProgressOverlay steps={saveSteps} onDone={handleSaveDone} />
        )}
      </AnimatePresence>
    </div>
  );
}
