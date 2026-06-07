import React, { useState, useEffect } from "react";
import { 
  Heart, MessageSquare, ChevronRight, Activity, Building, 
  ArrowLeft, CheckCircle2, AlertCircle, Clock, User, 
  Send, Bot, Shield, Smartphone, Smile, Users, Plus, Trash2
} from "lucide-react";

// ============================================================
// 共通のスタイル定義 & 初期データ
// ============================================================
const bgGrad = { background: "linear-gradient(to bottom, #0f172a, #1e293b)" };
const cardStyle = { backgroundColor: "rgba(30, 41, 59, 0.7)", borderColor: "rgba(100, 116, 139, 0.2)" };

const DEFAULT_RESIDENTS = [
  { id: 1, name: "佐藤 豊", room: "101", status: "pending", time: "" },
  { id: 2, name: "鈴木 よし", room: "102", status: "pending", time: "" },
  { id: 3, name: "高橋 健一", room: "103", status: "pending", time: "" },
  { id: 4, name: "田中 幸子", room: "105", status: "pending", time: "" },
  { id: 5, name: "渡辺 三郎", room: "106", status: "pending", time: "" },
];

// ============================================================
// 1. 安否確認モジュール (TapLifeModule)
// ============================================================
function TapLifeModule({ residents, onUpdateResidents }) {
  const [filter, setFilter] = useState("all");

  const handleTap = (id) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const next = residents.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: r.status === "pending" ? "tapped" : "pending",
          time: r.status === "pending" ? timeStr : "",
        };
      }
      return r;
    });
    onUpdateResidents(next);
  };

  const filtered = residents.filter((r) => {
    if (filter === "done") return r.status === "tapped";
    if (filter === "pending") return r.status === "pending";
    return true;
  });

  const doneCount = residents.filter((r) => r.status === "tapped").length;

  return (
    <div className="flex-1 max-w-md w-full mx-auto px-4 py-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">毎朝の安否確認</h2>
            <p className="text-[11px] text-slate-400">起床時のタップ記録システム</p>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="p-4 rounded-xl border mb-4 text-center" style={cardStyle}>
          <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-300">
            <span>確認進捗</span>
            <span className="text-emerald-400">{doneCount} / {residents.length} 名完了</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${(doneCount / residents.length) * 100}%` }}
            />
          </div>
        </div>

        {/* フィルタータブ */}
        <div className="flex space-x-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800 mb-3">
          <button onClick={() => setFilter("all")} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${filter === "all" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
            全員 ({residents.length})
          </button>
          <button onClick={() => setFilter("pending")} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${filter === "pending" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
            未確認 ({residents.length - doneCount})
          </button>
          <button onClick={() => setFilter("done")} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${filter === "done" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}>
            確認済 ({doneCount})
          </button>
        </div>

        {/* 入居者リスト */}
        <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
          {filtered.map((r) => (
            <div 
              key={r.id}
              onClick={() => handleTap(r.id)}
              className="p-3 rounded-xl border flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
              style={{
                ...cardStyle,
                borderLeftWidth: "4px",
                borderLeftColor: r.status === "tapped" ? "#34d399" : "#64748b"
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${r.status === "tapped" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                  {r.room}
                </div>
                <div>
                  <span className="font-bold text-sm block text-slate-100">{r.name}</span>
                  {r.status === "tapped" && (
                    <span className="text-[10px] text-slate-400 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" /> {r.time} 起床確認済
                    </span>
                  )}
                </div>
              </div>
              <div>
                {r.status === "tapped" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 2. 家族連絡・AIレポートモジュール (CareReportModule)
// ============================================================
function CareReportModule({ residents, onUpdateResidents }) {
  const [selectedId, setSelectedId] = useState(residents[0]?.id || null);
  const [meal, setMeal] = useState("完食");
  const [condition, setCondition] = useState("良好");
  const [memo, setMemo] = useState("");
  const [aiReport, setAiReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatLogs, setChatLogs] = useState({});

  const activeRes = residents.find(r => r.id === selectedId) || residents[0];

  const handleGenerateAI = () => {
    if (!activeRes) return;
    setIsGenerating(true);
    setAiReport("");
    
    setTimeout(() => {
      const generatedText = `【TapCare施設だより】\nいつもお世話になっております。本日の${activeRes.name}様のご様子をお伝えします。\n\nお食事は「${meal}」で、体調も「${condition}」と非常に安定されております。${memo ? `本日の一コマ：${memo}` : "日中も他の入居者様と穏やかに笑顔で過ごされていました。"}明日のご面会もお待ちしております。`;
      setAiReport(generatedText);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSendToFamily = () => {
    if (!aiReport || !activeRes) return;
    
    const currentLogs = chatLogs[activeRes.id] || [];
    const newMsg = { id: Date.now(), text: aiReport, sender: "staff", time: "今日" };
    
    setChatLogs({
      ...chatLogs,
      [activeRes.id]: [...currentLogs, newMsg]
    });
    setAiReport("");
    setMemo("");
  };

  const activeChats = chatLogs[activeRes?.id] || [];

  return (
    <div className="flex-1 max-w-md w-full mx-auto px-4 py-3 flex flex-col justify-between overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* モジュール用ミニヘッダー */}
        <div className="flex items-center space-x-3 mb-3 shrink-0">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">家族連絡・AIレポート</h2>
            <p className="text-[11px] text-slate-400">日誌からLINE風の自動テキストを作成・送信</p>
          </div>
        </div>

        {/* 対象入居者セレクター */}
        <div className="mb-3 shrink-0">
          <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">対象の入居者</label>
          <select 
            value={selectedId} 
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {residents.map(r => (
              <option key={r.id} value={r.id}>部屋 {r.room} : {r.name}</option>
            ))}
          </select>
        </div>

        {/* 2カラム構成（記録入力とチャット） */}
        <div className="flex-1 grid grid-cols-1 gap-3 min-h-0 overflow-y-auto pb-4">
          
          {/* 左側：スタッフ入力エリア */}
          <div className="p-4 rounded-xl border flex flex-col space-y-3 shrink-0" style={cardStyle}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">食事量</label>
                <select value={meal} onChange={(e) => setMeal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white">
                  <option value="完食">完食</option>
                  <option value="8割">8割</option>
                  <option value="5割">5割</option>
                  <option value="小食">小食</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">日中のご様子</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white">
                  <option value="良好">良好・元気</option>
                  <option value="普通">いつも通り</option>
                  <option value="傾眠">やや傾眠傾向</option>
                  <option value="不穏">不穏・興奮気味</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">自由メモ（AIが拾ってくれます）</label>
              <input 
                type="text" 
                placeholder="例: リハビリを頑張って笑顔だった" 
                value={memo} 
                onChange={(e) => setMemo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/10"
            >
              <Bot className="w-4 h-4" />
              <span>{isGenerating ? "AIレポート生成中..." : "AI報告文を自動作成"}</span>
            </button>

            {aiReport && (
              <div className="bg-slate-900/80 border border-blue-500/30 rounded-lg p-3 relative mt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 block mb-1 flex items-center">
                  <Bot className="w-3 h-3 mr-1" /> 生成された報告文
                </span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
                <button 
                  onClick={handleSendToFamily}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 rounded-md text-xs transition flex items-center justify-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>家族のLINE画面へ送信</span>
                </button>
              </div>
            )}
          </div>

          {/* 右側：家族への擬似LINE風チャット画面 */}
          <div className="p-3 rounded-xl border flex flex-col" style={{ ...cardStyle, minHeight: "220px" }}>
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-2">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">{activeRes?.name} 様のご家族</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full flex items-center font-medium">
                <Shield className="w-2.5 h-2.5 mr-1" /> 接続中
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] pr-1 flex flex-col">
              {activeChats.length === 0 ? (
                <div className="my-auto text-center text-slate-500 py-6">
                  <Smartphone className="w-8 h-8 mx-auto mb-1.5 text-slate-600 opacity-60" />
                  <p className="text-[11px]">スタッフが上にテキストを送信すると</p>
                  <p className="text-[10px]">ご家族のスマホ画面（履歴）に反映されます</p>
                </div>
              ) : (
                activeChats.map(msg => (
                  <div key={msg.id} className="self-end max-w-[85%]">
                    <div className="bg-emerald-600 text-white text-xs p-2.5 rounded-2xl rounded-tr-none shadow-sm whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 text-right block mt-0.5">{msg.time} · 既読</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. 全体を統括する共通シェル（トップメニュー・ポータル）
// ============================================================
export default function TapCareApp() {
  // アプリ起動時は "menu"（ポータル画面）を表示
  const [tab, setTab] = useState("menu"); 
  const [residents, setResidents] = useState(() => {
    const saved = localStorage.getItem("taplife_residents_v2");
    return saved ? JSON.parse(saved) : DEFAULT_RESIDENTS;
  });

  // データの同期用関数
  const handleUpdateResidents = (newResidents) => {
    setResidents(newResidents);
    localStorage.setItem("taplife_residents_v2", JSON.stringify(newResidents));
  };

  const doneCount = residents.filter(r => r.status === "tapped").length;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans" style={bgGrad}>
      
      {/* ─── ① トップメニュー（ポータル画面） ─── */}
      {tab === "menu" && (
        <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-between">
          <div>
            {/* ヘッダー・プロダクトロゴ */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">TapCare Pro</h1>
                <p className="text-xs text-slate-400">高齢者施設向け 業務統括ポータル</p>
              </div>
            </div>

            {/* 今日の施設サマリー・ダッシュボード（M&Aアピール用） */}
            <div className="p-5 rounded-2xl border mb-6" style={cardStyle}>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-400" />本日の稼働サマリー
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                  <span className="text-[10px] text-slate-400 block">登録入居者数</span>
                  <span className="text-xl font-bold text-white">
                    {residents.length} <span className="text-xs font-normal text-slate-400">名</span>
                  </span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                  <span className="text-[10px] text-slate-400 block">朝の安否確認率</span>
                  <span className={`text-xl font-bold ${doneCount === residents.length ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.round((doneCount / residents.length) * 100)} <span className="text-xs font-normal text-slate-400">%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* モジュール導線ボタン */}
            <div className="space-y-3">
              <button 
                onClick={() => setTab("tap")}
                className="w-full p-4 rounded-xl border text-left flex items-center justify-between transition hover:bg-slate-800/50 active:scale-[0.99]"
                style={cardStyle}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">① 毎朝の安否確認システム</span>
                    <span className="text-[11px] text-slate-400">入居者の起床確認・ワンタップ記録</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                onClick={() => setTab("care")}
                className="w-full p-4 rounded-xl border text-left flex items-center justify-between transition hover:bg-slate-800/50 active:scale-[0.99]"
                style={cardStyle}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">② 家族連絡・AIレポート送信</span>
                    <span className="text-[11px] text-slate-400">介護記録の自動要約と家族への一斉LINE風通知</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* フッター（企業向けパッケージを意識した演出） */}
          <div className="text-center text-[11px] text-slate-500 mt-8">
            <p>© 2026 TapCare SaaS All Rights Reserved.</p>
            <p className="mt-0.5 text-[10px]">Enterprise Edition v1.0.0</p>
          </div>
        </div>
      )}

      {/* ─── ② 安否確認システム画面（稼働中） ─── */}
      {tab === "tap" && (
        <div className="flex flex-col flex-1">
          <div className="p-3 border-b flex items-center bg-slate-900/50" style={{ borderColor: "rgba(100,116,139,0.2)" }}>
            <button onClick={() => setTab("menu")} className="flex items-center text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4 mr-1" /> ポータル（メニュー）へ戻る
            </button>
          </div>
          <TapLifeModule residents={residents} onUpdateResidents={handleUpdateResidents} />
        </div>
      )}
      
      {/* ─── ③ 家族連絡システム画面（稼働中） ─── */}
      {tab === "care" && (
        <div className="flex flex-col flex-1">
          <div className="p-3 border-b flex items-center bg-slate-900/50" style={{ borderColor: "rgba(100,116,139,0.2)" }}>
            <button onClick={() => setTab("menu")} className="flex items-center text-xs text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4 mr-1" /> ポータル（メニュー）へ戻る
            </button>
          </div>
          <CareReportModule residents={residents} onUpdateResidents={handleUpdateResidents} />
        </div>
      )}

    </div>
  );
}
