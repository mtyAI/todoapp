import { useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: "work",
    label: "仕事",
    bg: "bg-sky-100",
    text: "text-sky-700",
    borderL: "border-l-sky-400",
    dot: "bg-sky-500",
  },
  {
    key: "private",
    label: "プライベート",
    bg: "bg-rose-100",
    text: "text-rose-700",
    borderL: "border-l-rose-400",
    dot: "bg-rose-500",
  },
  {
    key: "other",
    label: "その他",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    borderL: "border-l-emerald-400",
    dot: "bg-emerald-500",
  },
];

const PRIORITIES = [
  {
    key: "high",
    label: "高",
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  {
    key: "medium",
    label: "中",
    bg: "bg-amber-100",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  {
    key: "low",
    label: "低",
    bg: "bg-green-100",
    text: "text-green-600",
    dot: "bg-green-500",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const catMeta = (key) => CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[2];
const priMeta = (key) => PRIORITIES.find((p) => p.key === key) ?? PRIORITIES[1];

function isOverdue(task) {
  if (!task.deadline || task.done) return false;
  return new Date(task.deadline) < new Date(new Date().toDateString());
}

// ── Progress Ring (SVG) ──────────────────────────────────────────────────────

function ProgressRing({ done, total }) {
  const pct = total === 0 ? 0 : done / total;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative flex items-center justify-center w-28 h-28 flex-shrink-0">
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        className="absolute -rotate-90"
      >
        <circle cx="56" cy="56" r={r} fill="none" stroke="#ede9fe" strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient
            id="ring-grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="112"
            y2="0"
          >
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-2xl font-extrabold text-gray-800 leading-none">
          {Math.round(pct * 100)}
          <span className="text-sm font-normal text-gray-400">%</span>
        </span>
        <span className="text-xs text-gray-400 mt-0.5">
          {done} / {total}
        </span>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function App() {
  // フォーム
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("work");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  // タスク
  const [tasks, setTasks] = useState([]);
  const [newIds, setNewIds] = useState([]);
  const [poppedIds, setPoppedIds] = useState([]);

  // フィルター
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // ── Actions ───────────────────────────────────────────────────────────────

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const id = Date.now();
    setTasks((prev) => [
      { id, text, done: false, category, priority, deadline },
      ...prev,
    ]);
    setNewIds((prev) => [...prev, id]);
    setInput("");
    setDeadline("");
  };

  const toggle = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    setPoppedIds((prev) => [...prev, id]);
  };

  const remove = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  // ── Derived ───────────────────────────────────────────────────────────────

  const doneCount = tasks.filter((t) => t.done).length;

  const visible = tasks.filter((t) => {
    if (statusFilter === "active" && t.done) return false;
    if (statusFilter === "done" && !t.done) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-10 px-4">
      <div className="w-full max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Tasks
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            タスクを整理して、毎日を充実させよう
          </p>
        </div>

        {/* ── Progress Card ── */}
        {tasks.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-violet-100 p-5 mb-5 flex items-center gap-5">
            <ProgressRing done={doneCount} total={tasks.length} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                完了率
              </p>
              <div className="w-full bg-violet-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="progress-bar h-2.5 rounded-full"
                  style={{
                    width: `${(doneCount / tasks.length) * 100}%`,
                    background: "linear-gradient(90deg, #7c3aed, #db2777)",
                  }}
                />
              </div>
              <div className="mt-2.5 flex gap-4 text-xs text-gray-500">
                <span>
                  <span className="font-bold text-violet-600">{doneCount}</span>{" "}
                  完了
                </span>
                <span>
                  <span className="font-bold text-gray-600">
                    {tasks.length - doneCount}
                  </span>{" "}
                  残り
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const cnt = tasks.filter((t) => t.category === c.key).length;
                  if (cnt === 0) return null;
                  return (
                    <span
                      key={c.key}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}
                    >
                      {c.label} {cnt}件
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Add Task Form ── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-violet-100 p-5 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            新しいタスク
          </p>

          {/* テキスト入力 */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="タスクを入力..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition mb-4"
          />

          {/* カテゴリ選択 */}
          <div className="mb-3">
            <p className="text-xs text-gray-400 font-medium mb-1.5">カテゴリ</p>
            <div className="flex gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
                    category === c.key
                      ? `${c.bg} ${c.text} border-transparent`
                      : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 優先度 + 締め切り */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium mb-1.5">優先度</p>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPriority(p.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
                      priority === p.key
                        ? `${p.bg} ${p.text} border-transparent`
                        : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium mb-1.5">締め切り</p>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>
          </div>

          {/* 追加ボタン */}
          <button
            onClick={addTask}
            className="w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-md active:scale-95 transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #db2777)",
            }}
          >
            + タスクを追加
          </button>
        </div>

        {/* ── Filters ── */}
        {tasks.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-violet-100 p-4 mb-4">
            {/* ステータスタブ */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
              {[
                { key: "all", label: "すべて" },
                { key: "active", label: "未完了" },
                { key: "done", label: "完了済み" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                    statusFilter === f.key
                      ? "bg-white text-violet-600 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              {/* カテゴリフィルター */}
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1.5">カテゴリ</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium transition ${
                      categoryFilter === "all"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    全て
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCategoryFilter(c.key)}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium transition ${
                        categoryFilter === c.key
                          ? `${c.bg} ${c.text}`
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 優先度フィルター */}
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1.5">優先度</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setPriorityFilter("all")}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium transition ${
                      priorityFilter === "all"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    全て
                  </button>
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPriorityFilter(p.key)}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium transition ${
                        priorityFilter === p.key
                          ? `${p.bg} ${p.text}`
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Task List ── */}
        <ul className="space-y-2">
          {visible.length === 0 && (
            <li className="text-center text-sm text-gray-300 py-12">
              {tasks.length === 0 ? "タスクがありません" : "該当するタスクなし"}
            </li>
          )}

          {visible.map((task) => {
            const cat = catMeta(task.category);
            const pri = priMeta(task.priority);
            const overdue = isOverdue(task);
            const isNew = newIds.includes(task.id);
            const isPopped = poppedIds.includes(task.id);

            return (
              <li
                key={task.id}
                className={[
                  "group flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5",
                  "shadow-sm border border-gray-100 border-l-4",
                  cat.borderL,
                  task.done ? "opacity-60" : "",
                  isNew ? "task-enter" : "",
                ].join(" ")}
                onAnimationEnd={() =>
                  setNewIds((prev) => prev.filter((id) => id !== task.id))
                }
              >
                {/* チェックボックス */}
                <button
                  onClick={() => toggle(task.id)}
                  className={[
                    "flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2",
                    "flex items-center justify-center transition",
                    task.done
                      ? "bg-violet-500 border-violet-500"
                      : "border-gray-300 hover:border-violet-400",
                    isPopped ? "task-pop" : "",
                  ].join(" ")}
                  onAnimationEnd={() =>
                    setPoppedIds((prev) => prev.filter((id) => id !== task.id))
                  }
                >
                  {task.done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug transition ${
                      task.done ? "line-through text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {task.text}
                  </p>

                  {/* バッジ群 */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.text}`}
                    >
                      {cat.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${pri.bg} ${pri.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                      {pri.label}
                    </span>
                    {task.deadline && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          overdue
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {overdue ? "期限切れ · " : ""}
                        {task.deadline}
                      </span>
                    )}
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => remove(task.id)}
                  className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition"
                  aria-label="削除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        {/* 完了済み一括削除 */}
        {doneCount > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
              className="text-xs text-gray-300 hover:text-red-400 transition"
            >
              完了済みをまとめて削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
