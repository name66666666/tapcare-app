import { useState, useEffect } from "react";
import { Heart, Settings, ArrowLeft, X, CheckCircle, Building, MessageSquare, Send, Shield, Plus, Edit2, Trash2, User, Mail, Hash, FileText, ChevronRight, Save, ChevronDown, Utensils, Moon, Activity, Sparkles, Droplets, Wind, HelpCircle, Users, Clock } from "lucide-react";

const getTodayJP = () => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
};

const DEFAULT_RESIDENTS = [
  { id: 1, room: "101", name: "佐藤 志津葉", familyEmail: "sato-family@example.com", status: "tapped", time: "07:45", notes: "朝食全量摂取。非常に元気。" },
  { id: 2, room: "102", name: "鈴木 茂夫", familyEmail: "suzuki-family@example.com", status: "tapped", time: "08:20", notes: "少し足元がふらつくが歩行可能。" },
  { id: 3, room: "105", name: "高橋 健二", familyEmail: "takahashi-family@example.com", status: "pending", time: null, notes: "夜間、数回の途中覚醒あり。" },
  { id: 4, room: "201", name: "田中 美代子", familyEmail: "tanaka-family@example.com", status: "warning", time: null, notes: "9時を過ぎても未タップ。要見回り。" },
];

const EMPTY_FORM = { room: "", name: "", familyEmail: "", notes: "" };
const EMPTY_RESIDENT_FORM = { room: "", name: "", familyEmail: "" };
const EMPTY_CARE = { meal: "", sleep: "", activity: "", bath: "", skin: "", toilet: "", who: "", when: "", where: "", how: "", memo: "" };

const CARE_OPTIONS = {
  meal: [
    { value: "full", label: "全量", emoji: "🍽️", color: "#059669" },
    { value: "half", label: "半量", emoji: "🥣", color: "#d97706" },
    { value: "little", label: "少量", emoji: "😐", color: "#e11d48" },
  ],
  sleep: [
    { value: "good", label: "良好", emoji: "😴", color: "#059669" },
    { value: "normal", label: "普通", emoji: "🌙", color: "#d97706" },
    { value: "poor", label: "不良", emoji: "😔", color: "#e11d48" },
  ],
  activity: [
    { value: "active", label: "活発", emoji: "🚶", color: "#059669" },
    { value: "normal", label: "普通", emoji: "🪑", color: "#d97706" },
    { value: "low", label: "少なめ", emoji: "🛏️", color: "#e11d48" },
  ],
  bath: [
    { value: "done", label: "入浴完了", emoji: "🛁", color: "#059669" },
    { value: "refused", label: "入浴拒否", emoji: "🚿", color: "#e11d48" },
    { value: "wipe", label: "清拭対応", emoji: "🧴", color: "#d97706" },
    { value: "none", label: "本日なし", emoji: "➖", color: "#475569" },
  ],
  skin: [
    { value: "good", label: "問題なし", emoji: "✅", color: "#059669" },
    { value: "watch", label: "要観察", emoji: "👀", color: "#d97706" },
    { value: "care", label: "処置済み", emoji: "🩹", color: "#e11d48" },
  ],
  toilet: [
    { value: "independent", label: "自立", emoji: "🚶", color: "#059669" },
    { value: "partial", label: "一部介助", emoji: "🤝", color: "#d97706" },
    { value: "full", label: "全介助", emoji: "♿", color: "#6366f1" },
  ],
};

const WHERE_OPTIONS = ["食堂", "ホール", "居室", "浴室", "リハビリ室", "庭・屋外", "その他"];
const HOW_OPTIONS = [
  "笑顔で過ごされていた", "穏やかにお過ごしだった", "他の入居者と交流されていた",
  "テレビをご覧になっていた", "体操・リハビリに参加された", "読書や趣味を楽しまれていた",
  "少しお疲れのご様子だった", "その他",
];

const TIME_OPTIONS = (() => {
  const times = [];
  for (let h = 6; h <= 22; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 22) times.push(`${String(h).padStart(2, "0")}:30`);
  }
  return times;
})();

const bgGrad = { background: "linear-gradient(160deg,#1e293b 0%,#0f172a 60%,#1a1f35 100%)" };
const cardStyle = { background: "rgba(30,41,59,0.6)", borderColor: "rgba(100,116,139,0.25)" };
const inputStyle = { background: "rgba(15,23,42,0.6)", borderColor: "rgba(100,116,139,0.3)" };
const headerBg = { background: "rgba(15,23,42,0.98)", borderBottom: "1px solid rgba(100,116,139,0.25)" };

function OptionBtn({ option, selected, onSelect, small }) {
  const isSelected = selected === option.value;
  return (
    <button onClick={() => onSelect(option.value)}
      className="flex-1 rounded-xl border-2 text-center transition-all duration-150"
      style={{
        padding: small ? "8px 4px" : "12px 4px",
        borderColor: isSelected ? option.color : "rgba(100,116,139,0.3)",
        backgroundColor: isSelected ? option.color + "33" : "rgba(30,41,59,0.6)",
        boxShadow: isSelected ? `0 0 12px ${option.color}44` : "none",
      }}>
      <div style={{ fontSize: small ? "1.1rem" : "1.4rem" }} className="mb-0.5">{option.emoji}</div>
      <div style={{ fontSize: "0.65rem", color: isSelected ? "#fff" : "#94a3b8" }}>{option.label}</div>
    </button>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl p-4 border" style={cardStyle}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-blue-400" />
        <h2 className="text-white text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SelectPicker({ value, onChange, options, placeholder, icon: Icon }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} className="text-slate-400 shrink-0" />}
      <div className="relative flex-1">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl text-xs focus:outline-none border transition"
          style={{ background: "rgba(15,23,42,0.7)", borderColor: value ? "rgba(59,130,246,0.5)" : "rgba(100,116,139,0.3)", color: value ? "#f1f5f9" : "#64748b" }}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ============================================================
// タブバー
// ============================================================
function TabBar({ tab, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b"
      style={{ background: "rgba(10,16,30,0.97)", borderColor: "rgba(100,116,139,0.2)" }}>
      <div className="flex items-center gap-1.5">
        <Heart size={16} fill="#f43f5e" color="#f43f5e" />
        <span className="text-white text-sm font-bold tracking-wide">TapCare Pro</span>
      </div>
      <div className="flex gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
        <button onClick={() => onChange("tap")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: tab === "tap" ? "#1d4ed8" : "transparent", color: tab === "tap" ? "#fff" : "#64748b" }}>
          <Shield size={12} /> 安否確認
        </button>
        <button onClick={() => onChange("care")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: tab === "care" ? "#1d4ed8" : "transparent", color: tab === "care" ? "#fff" : "#64748b" }}>
          <FileText size={12} /> 家族連絡
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ① 安否確認ダッシュボード
// ============================================================
function AnpiDashboardModule({ residents, setResidents }) {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedResident, setSelectedResident] = useState(null);
  const [aiReport, setAiReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [residentForm, setResidentForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const handleResidentSubmit = () => {
    if (!residentForm.room.trim()) { setFormError("部屋番号を入力してください"); return; }
    if (!residentForm.name.trim()) { setFormError("名前を入力してください"); return; }
    setFormError("");
    if (editingId !== null) {
      setResidents(residents.map(r => r.id === editingId ? { ...r, ...residentForm } : r));
      setSaveMessage(`${residentForm.name} 様の情報を更新しました ✓`);
    } else {
      setResidents([...residents, { id: Date.now(), ...residentForm, status: "pending", time: null }]);
      setSaveMessage(`${residentForm.name} 様を追加しました ✓`);
    }
    setResidentForm(EMPTY_FORM); setEditingId(null);
    setCurrentView("dashboard");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleEditResident = (r) => {
    setResidentForm({ room: r.room, name: r.name, familyEmail: r.familyEmail || "", notes: r.notes || "" });
    setEditingId(r.id);
    setCurrentView("resident-form");
  };

  const handleDeleteResident = (id) => {
    setResidents(residents.filter(r => r.id !== id));
    setShowDeleteConfirm(null); setSelectedResident(null);
    setSaveMessage("入居者を削除しました");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const generateAiReport = (r) => {
    setIsGenerating(true);
    setTimeout(() => {
      let text = `【TapCare 施設ケアレポート】\n${r.name}様の本日のご様子をお知らせします。\n\n`;
      if (r.status === "tapped") text += `朝の安否確認タップは【${r.time}】に完了しており、ご自身で元気に起床されています。\n`;
      else if (r.status === "warning") text += `本日朝の定期タップが未完了だったため、スタッフが直接お部屋を訪問し、体調にお変わりないことを確認いたしました。ご安心ください。\n`;
      else text += `本日の安否確認は現在対応中です。\n`;
      if (r.notes) text += `\n【スタッフメモ】\n${r.notes}\n`;
      text += `\n本日も引き続きサポートいたします。`;
      setAiReport(text); setIsGenerating(false);
    }, 600);
  };

  const handleSelectResident = (r) => {
    setSelectedResident(r); setAiReport("");
    generateAiReport(r);
  };

  const sendToFamily = () => {
    setSaveMessage("ご家族へAI確認レポートを送信しました ✉️");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  // ダッシュボード
  if (currentView === "dashboard") {
    const total = residents.length;
    const tappedCount = residents.filter(r => r.status === "tapped").length;
    const pendingCount = residents.filter(r => r.status === "pending").length;
    const warningCount = residents.filter(r => r.status === "warning").length;

    return (
      <div className="flex flex-col" style={bgGrad}>
        <header className="px-4 py-3 flex justify-between items-center border-b border-slate-700" style={{ background: "rgba(15,23,42,0.9)" }}>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-xl"><Building size={16} className="text-white" /></div>
            <div>
              <h1 className="text-sm font-bold text-white">安否ダッシュボード</h1>
              <p className="text-[10px] text-slate-400">施設内リアルタイム状況</p>
            </div>
          </div>
          <button onClick={() => { setResidentForm(EMPTY_FORM); setEditingId(null); setFormError(""); setCurrentView("resident-form"); }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
            <Plus size={14} /> 入居者追加
          </button>
        </header>

        <div className="p-4 space-y-4 pb-8">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "総入居者", val: total, cls: "bg-slate-800 border-slate-700", tc: "text-white" },
              { label: "起床完了", val: tappedCount, cls: "bg-emerald-950/50 border-emerald-800/40", tc: "text-emerald-400" },
              { label: "未確認", val: pendingCount, cls: "bg-blue-950/50 border-blue-800/40", tc: "text-blue-300" },
              { label: "要確認", val: warningCount, cls: "bg-rose-950/50 border-rose-800/40", tc: "text-rose-400" },
            ].map(({ label, val, cls, tc }) => (
              <div key={label} className={`p-2.5 rounded-xl border text-center ${cls}`}>
                <p className="text-[9px] text-slate-400 whitespace-nowrap">{label}</p>
                <p className={`text-lg font-bold ${tc}`}>{val}</p>
              </div>
            ))}
          </div>

          {saveMessage && (
            <div className="bg-emerald-900/80 border border-emerald-600 text-emerald-200 text-xs px-4 py-2 rounded-xl text-center">{saveMessage}</div>
          )}

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shield size={13} className="text-blue-400" /> 朝の安否確認一覧
              </h2>
              <span className="text-[10px] text-slate-500">{residents.length}名</span>
            </div>
            {residents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">入居者が登録されていません</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {residents.map((r) => (
                  <div key={r.id}
                    className={`p-3 flex items-center justify-between cursor-pointer transition ${selectedResident?.id === r.id ? "bg-slate-700/60" : "hover:bg-slate-700/30"}`}
                    onClick={() => handleSelectResident(r)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 shrink-0">{r.room}</span>
                      <span className="font-bold text-sm text-white truncate">{r.name} 様</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {r.status === "tapped" && <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full">完了 {r.time}</span>}
                      {r.status === "pending" && <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] px-2 py-0.5 rounded-full">未確認</span>}
                      {r.status === "warning" && <span className="bg-rose-950 text-rose-400 border border-rose-800 text-[10px] px-2 py-0.5 rounded-full animate-pulse">要確認</span>}
                      <button onClick={(e) => { e.stopPropagation(); handleEditResident(r); }} className="text-slate-500 hover:text-blue-400 p-1 transition">
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedResident && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
              <div className="border-b border-slate-700 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedResident.room}号室 {selectedResident.name} 様</h3>
                  {selectedResident.familyEmail && <p className="text-[10px] text-slate-400 mt-0.5">📧 {selectedResident.familyEmail}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditResident(selectedResident)} className="text-slate-400 hover:text-blue-400 p-1.5 hover:bg-slate-700 rounded-lg transition"><Edit2 size={14} /></button>
                  <button onClick={() => setShowDeleteConfirm(selectedResident.id)} className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-700 rounded-lg transition"><Trash2 size={14} /></button>
                  <button onClick={() => setSelectedResident(null)} className="text-slate-500 hover:text-slate-300 p-1"><X size={16} /></button>
                </div>
              </div>

              {showDeleteConfirm === selectedResident.id && (
                <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 space-y-2">
                  <p className="text-rose-300 text-xs font-semibold">本当に削除しますか？</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteResident(selectedResident.id)} className="flex-1 bg-rose-700 hover:bg-rose-600 text-white text-xs py-2 rounded-lg font-bold transition">削除する</button>
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-slate-700 text-slate-200 text-xs py-2 rounded-lg transition">キャンセル</button>
                  </div>
                </div>
              )}

              {selectedResident.notes && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">介護メモ</span>
                  <p className="bg-slate-900 p-2.5 rounded-lg text-xs text-slate-300">{selectedResident.notes}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] font-semibold text-blue-400 flex items-center gap-1 mb-1"><MessageSquare size={11} /> 安否状況のAI報告文</span>
                {isGenerating ? (
                  <div className="bg-slate-900 p-4 rounded-lg text-center text-xs text-slate-500 animate-pulse">生成中...</div>
                ) : (
                  <textarea value={aiReport} onChange={(e) => setAiReport(e.target.value)}
                    className="w-full h-24 bg-slate-900 text-slate-200 text-xs p-3 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 resize-none" />
                )}
              </div>
              <button onClick={sendToFamily} disabled={isGenerating || !aiReport}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
                <Send size={12} /> ご家族へ送信する
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 入居者フォーム
  return (
    <div style={bgGrad}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50" style={{ background: "rgba(15,23,42,0.9)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => { setCurrentView("dashboard"); setFormError(""); }} className="text-slate-400 p-2 hover:text-white hover:bg-slate-700 rounded-full transition"><ArrowLeft size={20} /></button>
          <h1 className="text-white text-base font-bold">{editingId !== null ? "入居者情報を編集" : "入居者を追加"}</h1>
        </div>
      </div>
      <div className="p-4 space-y-4 pb-8">
        {formError && <div className="bg-rose-950/50 border border-rose-700/50 text-rose-300 text-xs px-4 py-2.5 rounded-xl">⚠️ {formError}</div>}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-4">
          <h2 className="text-white text-xs font-semibold flex items-center gap-2"><Hash size={14} className="text-blue-400" /> 基本情報</h2>
          {[["部屋番号", "room", "例：101"], ["入居者氏名", "name", "例：山田 花子"]].map(([label, key, ph]) => (
            <div key={key}>
              <label className="text-slate-400 text-xs block mb-1">{label} <span className="text-rose-400">*</span></label>
              <input type="text" value={residentForm[key]} onChange={(e) => setResidentForm({ ...residentForm, [key]: e.target.value })}
                placeholder={ph} className="w-full bg-slate-700/70 text-white px-3 py-2.5 rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500 text-xs" />
            </div>
          ))}
        </div>
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-3">
          <h2 className="text-white text-xs font-semibold flex items-center gap-2"><Mail size={14} className="text-blue-400" /> ご家族の連絡先</h2>
          <input type="email" value={residentForm.familyEmail} onChange={(e) => setResidentForm({ ...residentForm, familyEmail: e.target.value })}
            placeholder="family@example.com" className="w-full bg-slate-700/70 text-white px-3 py-2.5 rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500 text-xs" />
        </div>
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-3">
          <h2 className="text-white text-xs font-semibold flex items-center gap-2"><FileText size={14} className="text-blue-400" /> 介護メモ</h2>
          <textarea value={residentForm.notes} onChange={(e) => setResidentForm({ ...residentForm, notes: e.target.value })}
            className="w-full h-20 bg-slate-700/70 text-white px-3 py-2.5 rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500 text-xs resize-none"
            placeholder="注意事項や特記事項など" />
        </div>
        <button onClick={handleResidentSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition">
          <Save size={14} /> {editingId !== null ? "変更を保存する" : "入居者を登録する"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ② 家族連絡レポート
// ============================================================
function CareReportModule({ residents, setResidents }) {
  const [step, setStep] = useState("select");
  const [resident, setResident] = useState(null);
  const [care, setCare] = useState(EMPTY_CARE);
  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [facilityName, setFacilityName] = useState("さくらホーム");
  const [staffList, setStaffList] = useState([
    { id: "1", name: "田村 さくら", role: "介護士" },
    { id: "2", name: "山本 太郎", role: "ケアマネジャー" },
  ]);
  const [staffSaved, setStaffSaved] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");
  const [residentForm, setResidentForm] = useState(EMPTY_RESIDENT_FORM);
  const [editingResidentId, setEditingResidentId] = useState(null);
  const [residentFormError, setResidentFormError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const saveStaff = () => {
    setStaffSaved(true); setTimeout(() => setStaffSaved(false), 2000);
  };

  const addStaff = () => {
    if (!newStaffName.trim()) return;
    setStaffList([...staffList, { id: Date.now().toString(), name: newStaffName.trim(), role: newStaffRole.trim() }]);
    setNewStaffName(""); setNewStaffRole("");
  };

  const handleResidentSubmit = () => {
    if (!residentForm.room.trim()) { setResidentFormError("部屋番号を入力してください"); return; }
    if (!residentForm.name.trim()) { setResidentFormError("名前を入力してください"); return; }
    setResidentFormError("");
    if (editingResidentId !== null) {
      setResidents(residents.map(r => r.id === editingResidentId ? { ...r, ...residentForm } : r));
      showToast(`${residentForm.name} 様の情報を更新しました ✓`);
    } else {
      setResidents([...residents, { id: Date.now(), ...residentForm, status: "pending", time: null }]);
      showToast(`${residentForm.name} 様を登録しました ✓`);
    }
    setResidentForm(EMPTY_RESIDENT_FORM); setEditingResidentId(null); setStep("residents");
  };

  const set = (key, val) => setCare(prev => ({ ...prev, [key]: val }));
  const canGenerate = care.meal && care.sleep && care.activity;

  const getStaffName = () => {
    if (!care.who) return "";
    const f = staffList.find(s => s.id === care.who);
    return f ? `${f.name}${f.role ? `（${f.role}）` : ""}` : "";
  };

  const handleGenerate = () => {
    if (!canGenerate) { setError("食事・睡眠・活動量は必須です"); return; }
    setError(""); setIsGenerating(true); setReport("");
    const labelOf = (key, val) => CARE_OPTIONS[key]?.find(o => o.value === val)?.label || "普通";
    const staffName = getStaffName() || "担当スタッフ";
    setTimeout(() => {
      let text = `${resident.name} 様のご家族へ\n\n`;
      text += `いつもお世話になっております。${facilityName}の${staffName}です。本日（${getTodayJP()}）のご様子をお伝えいたします。\n\n`;
      text += `本日の食事は【${labelOf("meal", care.meal)}】、睡眠状態は【${labelOf("sleep", care.sleep)}】、活動量は【${labelOf("activity", care.activity)}】とお元気にお過ごしでした。`;
      if (care.how) text += `\n\nお部屋では${care.how}ご様子が見られました。`;
      if (care.memo) text += `\n\n【スタッフより】\n${care.memo}`;
      else text += `\n\n本日も特に体調の変化はなく、穏やかな笑顔がたくさん見られました。ご安心ください。`;
      text += `\n\n今後ともよろしくお願いいたします。\n${facilityName} ${staffName}`;
      setReport(text); setStep("report"); setIsGenerating(false);
    }, 800);
  };

  const Toast = () => toast ? (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 border border-emerald-600 text-emerald-100 text-xs px-4 py-2 rounded-full shadow-lg">{toast}</div>
  ) : null;

  // 設定
  if (step === "settings") return (
    <div style={bgGrad}>
      <Toast />
      <header className="px-4 py-3 flex items-center justify-between border-b" style={headerBg}>
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("select")} className="text-slate-400 p-1.5 hover:text-white hover:bg-slate-700 rounded-full transition"><ArrowLeft size={18} /></button>
          <h1 className="text-white text-sm font-bold">スタッフ環境設定</h1>
        </div>
        <button onClick={saveStaff} className="flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
          style={{ background: staffSaved ? "#059669" : "#2563eb" }}>
          {staffSaved ? "保存完了 ✓" : "設定を保存"}
        </button>
      </header>
      <div className="p-4 space-y-4 pb-8">
        <div className="rounded-2xl p-4 border space-y-3" style={cardStyle}>
          <div className="flex items-center gap-2"><Building size={14} className="text-blue-400" /><h2 className="text-white text-xs font-semibold">施設・事業所名</h2></div>
          <input value={facilityName} onChange={e => setFacilityName(e.target.value)} placeholder="例：ケアサービスさくら"
            className="w-full px-3 py-2 rounded-xl border text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" style={inputStyle} />
        </div>
        <div className="rounded-2xl p-4 border space-y-3" style={cardStyle}>
          <div className="flex items-center gap-2"><Users size={14} className="text-blue-400" /><h2 className="text-white text-xs font-semibold">所属スタッフ</h2></div>
          {staffList.length === 0 && <p className="text-slate-500 text-[11px] text-center py-2">スタッフが未登録です</p>}
          {staffList.map(s => (
            <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-xl border" style={{ background: "rgba(15,23,42,0.5)", borderColor: "rgba(100,116,139,0.25)" }}>
              <div><p className="text-white text-xs font-medium">{s.name}</p>{s.role && <p className="text-slate-400 text-[10px]">{s.role}</p>}</div>
              <button onClick={() => setStaffList(staffList.filter(x => x.id !== s.id))} className="text-slate-500 hover:text-rose-400 p-1 transition"><Trash2 size={13} /></button>
            </div>
          ))}
          <div className="border-t pt-3 space-y-2" style={{ borderColor: "rgba(100,116,139,0.2)" }}>
            <p className="text-slate-400 text-[11px] font-semibold">＋ スタッフを追加</p>
            <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="名前（例：介護 太郎）"
              className="w-full px-3 py-2 rounded-xl border text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" style={inputStyle} />
            <input value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} placeholder="役職（例：ケアマネジャー）"
              className="w-full px-3 py-2 rounded-xl border text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" style={inputStyle} />
            <button onClick={addStaff} disabled={!newStaffName.trim()}
              className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              style={{ background: newStaffName.trim() ? "rgba(37,99,235,0.7)" : "rgba(51,65,85,0.5)", color: newStaffName.trim() ? "#fff" : "#64748b" }}>
              <Plus size={13} /> 追加する
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 入居者管理
  if (step === "residents") return (
    <div style={bgGrad}>
      <Toast />
      <header className="px-4 py-3 flex items-center justify-between border-b" style={headerBg}>
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("select")} className="text-slate-400 p-1.5 hover:text-white hover:bg-slate-700 rounded-full transition"><ArrowLeft size={18} /></button>
          <h1 className="text-white text-sm font-bold">入居者マスター管理</h1>
        </div>
        <button onClick={() => { setResidentForm(EMPTY_RESIDENT_FORM); setEditingResidentId(null); setResidentFormError(""); setStep("resident-form"); }}
          className="flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg" style={{ background: "#2563eb" }}>
          <Plus size={13} /> 新規登録
        </button>
      </header>
      <div className="p-4 space-y-2 pb-8">
        {residents.length === 0 ? (
          <div className="rounded-2xl p-6 text-center border" style={cardStyle}>
            <p className="text-slate-400 text-xs">登録されている入居者がいません</p>
          </div>
        ) : residents.map(r => (
          <div key={r.id} className="rounded-xl p-3 border flex items-center justify-between" style={cardStyle}>
            <div className="min-w-0">
              <p className="text-white font-bold text-xs truncate">{r.name} 様</p>
              <p className="text-slate-400 text-[10px]">{r.room}号室 · {r.familyEmail || "メール未登録"}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { setResidentForm({ room: r.room, name: r.name, familyEmail: r.familyEmail || "" }); setEditingResidentId(r.id); setResidentFormError(""); setStep("resident-form"); }}
                className="text-slate-400 hover:text-blue-400 p-1.5 transition"><Edit2 size={14} /></button>
              <button onClick={() => setDeleteConfirmId(r.id)} className="text-slate-400 hover:text-rose-400 p-1.5 transition"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {deleteConfirmId && (
          <div className="rounded-xl p-3 border space-y-2" style={{ background: "rgba(127,29,29,0.3)", borderColor: "rgba(239,68,68,0.4)" }}>
            <p className="text-rose-300 text-xs text-center">本当に削除しますか？</p>
            <div className="flex gap-2">
              <button onClick={() => { setResidents(residents.filter(r => r.id !== deleteConfirmId)); setDeleteConfirmId(null); showToast("削除しました"); }}
                className="flex-1 bg-rose-700 text-white text-xs py-1.5 rounded-lg font-bold">削除</button>
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-slate-700 text-slate-200 text-xs py-1.5 rounded-lg">戻る</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 入居者フォーム
  if (step === "resident-form") return (
    <div style={bgGrad}>
      <header className="px-4 py-3 flex items-center gap-3 border-b" style={headerBg}>
        <button onClick={() => setStep("residents")} className="text-slate-400 p-1.5 hover:text-white hover:bg-slate-700 rounded-full transition"><ArrowLeft size={18} /></button>
        <h1 className="text-white text-sm font-bold">{editingResidentId ? "入居者情報の編集" : "入居者新規登録"}</h1>
      </header>
      <div className="p-4 space-y-4 pb-8">
        {residentFormError && <div className="rounded-xl px-3 py-2 border text-rose-300 text-xs bg-rose-950/30 border-rose-500/40">⚠️ {residentFormError}</div>}
        <div className="rounded-2xl p-4 border space-y-3" style={cardStyle}>
          <input value={residentForm.room} onChange={e => setResidentForm({ ...residentForm, room: e.target.value })} placeholder="部屋番号（例：105）"
            className="w-full px-3 py-2 rounded-xl border text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" style={inputStyle} />
          <input value={residentForm.name} onChange={e => setResidentForm({ ...residentForm, name: e.target.value })} placeholder="入居者氏名（例：鈴木 茂）"
            className="w-full px-3 py-2 rounded-xl border text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" style={inputStyle} />
          <input type="email" value={residentForm.familyEmail} onChange={e => setResidentForm({ ...residentForm, familyEmail: e.target.value })} placeholder="ご家族メール（family@example.com）"
            className="w-full px-3 py-2 rounded-xl border text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500" style={inputStyle} />
        </div>
        <button onClick={handleResidentSubmit} className="w-full py-3 rounded-xl font-bold text-xs text-white" style={{ background: "#2563eb" }}>
          {editingResidentId ? "変更を保存する" : "マスターに登録する"}
        </button>
      </div>
    </div>
  );

  // 入居者選択
  if (step === "select") return (
    <div style={bgGrad}>
      <Toast />
      <header className="px-4 py-4 flex items-center justify-between" style={{ background: "rgba(15,23,42,0.6)" }}>
        <div>
          <span className="text-blue-400 text-[10px] font-bold tracking-widest block mb-0.5">STAFF DAILY REPORT</span>
          <h1 className="text-white text-lg font-bold">ご家族向け日誌作成</h1>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setStep("residents")} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-full transition"><Users size={16} /></button>
          <button onClick={() => setStep("settings")} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-full transition"><Settings size={16} /></button>
        </div>
      </header>
      {facilityName && (
        <div className="mx-4 mb-2 bg-blue-950/40 border border-blue-900/50 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Building size={11} className="text-blue-400" /><p className="text-blue-300 text-[11px]">{facilityName}</p>
        </div>
      )}
      <div className="p-4 space-y-2 pb-8">
        {residents.length === 0 ? (
          <div className="rounded-2xl p-6 text-center border" style={cardStyle}>
            <p className="text-slate-400 text-xs mb-2">入居者が登録されていません</p>
            <button onClick={() => setStep("residents")} className="text-blue-400 text-xs font-bold underline">＋ 入居者を登録する</button>
          </div>
        ) : residents.map(r => (
          <button key={r.id}
            onClick={() => { setResident(r); setCare(EMPTY_CARE); setReport(""); setIsSent(false); setStep("input"); }}
            className="w-full rounded-xl p-3 flex items-center justify-between border transition-all hover:border-slate-500"
            style={{ background: "rgba(30,41,59,0.7)", borderColor: "rgba(100,116,139,0.3)" }}>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-700"><User size={14} className="text-slate-300" /></div>
              <div className="text-left">
                <p className="text-white font-bold text-xs">{r.name} 様</p>
                <p className="text-slate-400 text-[10px]">{r.room}号室</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );

  // ケアデータ入力
  if (step === "input") return (
    <div style={bgGrad}>
      <header className="px-4 py-3 flex items-center gap-3 border-b" style={headerBg}>
        <button onClick={() => setStep("select")} className="text-slate-400 p-1.5 hover:text-white hover:bg-slate-700 rounded-full transition"><ArrowLeft size={18} /></button>
        <div><h1 className="text-white text-sm font-bold">{resident.name} 様</h1><p className="text-slate-400 text-[10px]">{resident.room}号室 · {getTodayJP()}</p></div>
      </header>
      <div className="p-4 space-y-4 pb-36">
        <Section icon={Utensils} title="食事量 *"><div className="flex gap-2">{CARE_OPTIONS.meal.map(o => <OptionBtn key={o.value} option={o} selected={care.meal} onSelect={v => set("meal", v)} />)}</div></Section>
        <Section icon={Moon} title="睡眠状態 *"><div className="flex gap-2">{CARE_OPTIONS.sleep.map(o => <OptionBtn key={o.value} option={o} selected={care.sleep} onSelect={v => set("sleep", v)} />)}</div></Section>
        <Section icon={Activity} title="活動量 *"><div className="flex gap-2">{CARE_OPTIONS.activity.map(o => <OptionBtn key={o.value} option={o} selected={care.activity} onSelect={v => set("activity", v)} />)}</div></Section>
        <Section icon={Droplets} title="入浴状況"><div className="flex gap-1.5">{CARE_OPTIONS.bath.map(o => <OptionBtn key={o.value} option={o} selected={care.bath} onSelect={v => set("bath", v)} small />)}</div></Section>
        <Section icon={Wind} title="皮膚ケア"><div className="flex gap-2">{CARE_OPTIONS.skin.map(o => <OptionBtn key={o.value} option={o} selected={care.skin} onSelect={v => set("skin", v)} />)}</div></Section>
        <Section icon={HelpCircle} title="排泄自立"><div className="flex gap-2">{CARE_OPTIONS.toilet.map(o => <OptionBtn key={o.value} option={o} selected={care.toilet} onSelect={v => set("toilet", v)} />)}</div></Section>
        <div className="rounded-2xl p-4 border" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3"><Clock size={14} className="text-blue-400" /><h2 className="text-white text-xs font-semibold">詳細シチュエーション</h2></div>
          <div className="space-y-2">
            <div className="relative">
              <select value={care.who} onChange={e => set("who", e.target.value)}
                className="w-full appearance-none px-3 py-2 rounded-xl text-xs border focus:outline-none"
                style={{ background: "rgba(15,23,42,0.7)", borderColor: "rgba(100,116,139,0.3)", color: care.who ? "#f1f5f9" : "#64748b" }}>
                <option value="">担当スタッフを選択</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} {s.role && `(${s.role})`}</option>)}
              </select>
            </div>
            <SelectPicker value={care.where} onChange={v => set("where", v)} options={WHERE_OPTIONS} placeholder="過ごされた場所" icon={HelpCircle} />
            <SelectPicker value={care.how} onChange={v => set("how", v)} options={HOW_OPTIONS} placeholder="具体的なご様子" icon={Activity} />
          </div>
        </div>
        <Section icon={MessageSquare} title="自由記述メモ">
          <textarea value={care.memo} onChange={e => set("memo", e.target.value)} placeholder="家族へ添えたい具体的な出来事やメッセージ"
            className="w-full h-16 px-3 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none border" style={inputStyle} />
        </Section>
        {error && <p className="text-rose-400 text-xs text-center">{error}</p>}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 max-w-md mx-auto border-t border-slate-800" style={{ background: "rgba(10,16,30,0.95)" }}>
        <button onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
          style={{ background: canGenerate ? "#2563eb" : "#334155", color: canGenerate ? "#fff" : "#64748b" }}>
          {isGenerating
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> AI文章を組み立て中...</>
            : <><Sparkles size={14} /> AI家族連絡文を自動生成する</>}
        </button>
      </div>
    </div>
  );

  // レポート確認
  return (
    <div style={bgGrad}>
      <header className="px-4 py-3 flex items-center gap-3 border-b" style={headerBg}>
        <button onClick={() => setStep("input")} className="text-slate-400 p-1.5 hover:text-white hover:bg-slate-700 rounded-full transition"><ArrowLeft size={18} /></button>
        <div><h1 className="text-white text-sm font-bold">生成結果の確認</h1><p className="text-slate-400 text-[10px]">{resident.name} 様 · 連絡文面</p></div>
      </header>
      <div className="p-4 space-y-4 pb-8">
        <div className="rounded-2xl p-4 border" style={{ background: "rgba(30,41,59,0.6)", borderColor: "rgba(59,130,246,0.35)" }}>
          <div className="flex items-center gap-2 mb-2"><Sparkles size={13} className="text-blue-400" /><span className="text-blue-400 text-xs font-semibold">AI生成 · 編集できます</span></div>
          <textarea value={report} onChange={e => setReport(e.target.value)}
            className="w-full h-52 text-slate-100 text-xs p-3 rounded-xl border focus:outline-none resize-none leading-relaxed"
            style={{ background: "rgba(15,23,42,0.5)", borderColor: "rgba(100,116,139,0.3)" }} />
        </div>
        <div className="rounded-xl p-2.5 border flex items-center gap-2" style={{ background: "rgba(30,41,59,0.4)", borderColor: "rgba(100,116,139,0.25)" }}>
          <Send size={13} className="text-slate-400" />
          <p className="text-slate-300 text-xs">宛先: {resident.familyEmail || "メールアドレス未登録"}</p>
        </div>
        {isSent ? (
          <div className="rounded-xl p-4 text-center border" style={{ background: "rgba(6,78,59,0.3)", borderColor: "rgba(52,211,153,0.3)" }}>
            <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-emerald-400 font-bold text-xs">ご家族への日誌送信が完了しました 💚</p>
            <button onClick={() => setStep("select")} className="mt-3 text-slate-400 text-[11px] underline">一覧に戻る</button>
          </div>
        ) : (
          <button onClick={() => setIsSent(true)} className="w-full py-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2" style={{ background: "#059669" }}>
            <Send size={14} /> この内容をご家族へ送信する
          </button>
        )}
        <button onClick={() => { setStep("input"); setIsSent(false); }} className="w-full text-slate-500 text-xs hover:text-slate-300 py-2 transition text-center">← 入力内容を修正する</button>
      </div>
    </div>
  );
}

// ============================================================
// メインシェル（入居者データを両モジュールで共有）
// ============================================================

// ============================================================
// トップメニュー画面
// ============================================================
function TopMenu({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)" }}>

      {/* 背景グロー */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full pointer-events-none"
        style={{ background: "rgba(99,102,241,0.08)", filter: "blur(120px)" }} />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full pointer-events-none"
        style={{ background: "rgba(59,130,246,0.08)", filter: "blur(120px)" }} />

      {/* ヘッダー */}
      <nav className="px-6 pt-8 pb-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <span className="font-black text-xl text-white tracking-wide">TapCare</span>
        </div>
        <span className="text-[10px] bg-slate-800 text-blue-400 border border-blue-500/30 font-bold px-3 py-1 rounded-full tracking-widest uppercase">
          Staff Only
        </span>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10 text-center">

        {/* バッジ */}
        <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 text-blue-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest">
          <Shield size={12} /> 介護施設スタッフ専用
        </div>

        {/* キャッチコピー */}
        <h1 className="text-3xl font-black text-white leading-tight mb-4">
          介護記録を、<br />
          <span style={{ background: "linear-gradient(90deg,#60a5fa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            家族の安心へ。
          </span>
        </h1>

        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-10">
          安否確認・家族連絡レポートをワンアプリで。<br />
          スタッフの業務負担を減らしながら、<br />
          家族との信頼をつなぎます。
        </p>

        {/* 機能カード */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          {[
            { icon: Shield, label: "安否確認ダッシュボード", desc: "入居者の朝の安否を一元管理", color: "#3b82f6" },
            { icon: FileText, label: "家族連絡レポート", desc: "AIが家族向け文章を自動生成", color: "#8b5cf6" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3 text-left">
              <div className="p-2 rounded-xl shrink-0" style={{ background: color + "22" }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">{label}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 入室ボタン */}
        <button onClick={onEnter}
          className="w-full max-w-sm py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}>
          <Users size={18} /> スタッフとしてログイン
        </button>

        <p className="text-slate-600 text-xs mt-4">このアプリは施設スタッフ専用です</p>
      </main>

      {/* フッター */}
      <footer className="px-6 py-4 text-center text-xs text-slate-600 border-t border-slate-800 relative z-10">
        © {new Date().getFullYear()} TapCare. All rights reserved.
      </footer>
    </div>
  );
}

// ============================================================
// メインシェル（トップメニュー → スタッフ画面）
// ============================================================
export default function TapCareApp() {
  const [screen, setScreen] = useState("menu"); // "menu" | "app"
  const [tab, setTab] = useState("tap");
  const [residents, setResidents] = useState(DEFAULT_RESIDENTS);

  if (screen === "menu") {
    return <TopMenu onEnter={() => setScreen("app")} />;
  }

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen shadow-2xl flex flex-col">
      <TabBar tab={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto">
        {tab === "tap"  && <AnpiDashboardModule residents={residents} setResidents={setResidents} />}
        {tab === "care" && <CareReportModule residents={residents} setResidents={setResidents} />}
      </div>
    </div>
  );
}
