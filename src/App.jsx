import { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
Calendar,
  Tag,
  Flame,
  AlertTriangle,
  Minus,
  BarChart3,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: "work",
    label: "仕事",
    icon: "💼",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    borderL: "border-l-sky-400",
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    bar: "bg-sky-400",
  },
  {
    key: "private",
    label: "プライベート",
    icon: "🏠",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    borderL: "border-l-rose-400",
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    bar: "bg-rose-400",
  },
  {
    key: "other",
    label: "その他",
    icon: "✨",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    borderL: "border-l-emerald-400",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-400",
  },
];

const PRIORITIES = [
  {
    key: "high",
    label: "高",
    icon: <Flame className="w-3 h-3" />,
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  {
    key: "medium",
    label: "中",
    icon: <Minus className="w-3 h-3" />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    key: "low",
    label: "低",
    icon: <AlertTriangle className="w-3 h-3" />,
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const catMeta = (key) => CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[2];
const priMeta = (key) => PRIORITIES.find((p) => p.key === key) ?? PRIORITIES[1];

function isOverdue(task) {
  if (!task.deadline || task.done) return false;
  return new Date(task.deadline) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({ done, total }) {
  const pct = total === 0 ? 0 : done / total;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="absolute -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="oklch(0.9 0.04 290)" strokeWidth="9" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <defs>
          <linearGradient id="ring-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="96" y2="0">
            <stop offset="0%" stopColor="oklch(0.52 0.24 293)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 350)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-xl font-extrabold text-foreground leading-none">
          {Math.round(pct * 100)}
          <span className="text-xs font-normal text-muted-foreground">%</span>
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

// ── Category Bar Chart ────────────────────────────────────────────────────────

function CategoryChart({ tasks }) {
  if (tasks.length === 0) return null;
  return (
    <div className="space-y-2">
      {CATEGORIES.map((c) => {
        const total = tasks.filter((t) => t.category === c.key).length;
        const done = tasks.filter((t) => t.category === c.key && t.done).length;
        if (total === 0) return null;
        const pct = Math.round((done / total) * 100);
        return (
          <div key={c.key} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <span>{c.icon}</span>
                {c.label}
              </span>
              <span className="text-muted-foreground">{done}/{total}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={cn("h-1.5 rounded-full transition-all duration-700", c.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
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

  const overdueCount = tasks.filter(isOverdue).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50/60 to-indigo-100/80 py-8 px-4">
      <div className="w-full max-w-xl mx-auto space-y-4">

        {/* ── Header ── */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-200">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, oklch(0.52 0.24 293), oklch(0.65 0.22 350))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              My Tasks
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            タスクを整理して、毎日を充実させよう
          </p>
        </div>

        {/* ── Stats Card ── */}
        {tasks.length > 0 && (
          <Card className="border-violet-100 shadow-md shadow-violet-100/50 stats-enter">
            <CardContent className="pt-5">
              <div className="flex items-center gap-5">
                <ProgressRing done={doneCount} total={tasks.length} />

                <div className="flex-1 min-w-0 space-y-3">
                  {/* プログレスバー */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-muted-foreground uppercase tracking-wider">完了率</span>
                      <span className="text-foreground font-bold">{Math.round((doneCount / tasks.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-violet-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="progress-bar h-2 rounded-full"
                        style={{
                          width: `${(doneCount / tasks.length) * 100}%`,
                          background: "linear-gradient(90deg, oklch(0.52 0.24 293), oklch(0.65 0.22 350))",
                        }}
                      />
                    </div>
                  </div>

                  {/* サマリーバッジ */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {doneCount} 完了
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                      {tasks.length - doneCount} 残り
                    </Badge>
                    {overdueCount > 0 && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        期限切れ {overdueCount}件
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* カテゴリバー */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  カテゴリ別進捗
                </p>
                <CategoryChart tasks={tasks} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Add Task Form ── */}
        <Card className="border-violet-100 shadow-md shadow-violet-100/50">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              新しいタスク
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* テキスト入力 */}
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="タスクを入力..."
              className="border-violet-200 focus-visible:ring-violet-400 bg-white"
            />

            {/* カテゴリ */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                カテゴリ
              </p>
              <div className="flex gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all duration-200",
                      category === c.key
                        ? `${c.bg} ${c.text} ${c.border} shadow-sm`
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 優先度 + 締め切り */}
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  優先度
                </p>
                <div className="flex gap-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPriority(p.key)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200",
                        priority === p.key
                          ? `${p.bg} ${p.text} border-current/20 shadow-sm`
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  締め切り
                </p>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-input bg-white px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition"
                />
              </div>
            </div>

            {/* 追加ボタン */}
            <Button
              onClick={addTask}
              className="w-full font-bold shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, oklch(0.52 0.24 293), oklch(0.65 0.22 350))",
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              タスクを追加
            </Button>
          </CardContent>
        </Card>

        {/* ── Filters ── */}
        {tasks.length > 0 && (
          <Card className="border-violet-100 shadow-sm">
            <CardContent className="pt-4 pb-4 space-y-3">
              {/* ステータスタブ */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="w-full bg-muted/70">
                  <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:text-violet-700">
                    すべて ({tasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex-1 text-xs data-[state=active]:text-violet-700">
                    未完了 ({tasks.filter(t => !t.done).length})
                  </TabsTrigger>
                  <TabsTrigger value="done" className="flex-1 text-xs data-[state=active]:text-violet-700">
                    完了済み ({doneCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-4">
                {/* カテゴリフィルター */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">カテゴリ</p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200",
                        categoryFilter === "all"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      全て
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setCategoryFilter(c.key)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200",
                          categoryFilter === c.key
                            ? `${c.bg} ${c.text} ${c.border}`
                            : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                        )}
                      >
                        {c.icon} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 優先度フィルター */}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">優先度</p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setPriorityFilter("all")}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200",
                        priorityFilter === "all"
                          ? "bg-foreground text-background border-foreground"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      全て
                    </button>
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setPriorityFilter(p.key)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200",
                          priorityFilter === p.key
                            ? `${p.bg} ${p.text} border-current/20`
                            : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Task List ── */}
        <ul className="space-y-2">
          {visible.length === 0 && (
            <li className="text-center py-16">
              <div className="text-4xl mb-3">
                {tasks.length === 0 ? "📝" : "🔍"}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {tasks.length === 0 ? "タスクがありません" : "該当するタスクなし"}
              </p>
              {tasks.length === 0 && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  上のフォームからタスクを追加してみましょう
                </p>
              )}
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
                className={cn(
                  "group relative flex items-start gap-3 rounded-xl bg-white px-4 py-3.5",
                  "shadow-sm border border-border/60 border-l-4 transition-all duration-300",
                  cat.borderL,
                  task.done ? "opacity-55" : "hover:shadow-md hover:-translate-y-0.5",
                  isNew ? "task-enter" : ""
                )}
                onAnimationEnd={() =>
                  setNewIds((prev) => prev.filter((id) => id !== task.id))
                }
              >
                {/* チェックボタン */}
                <button
                  onClick={() => toggle(task.id)}
                  className={cn(
                    "shrink-0 mt-0.5 w-5 h-5 rounded-full border-2",
                    "flex items-center justify-center transition-all duration-200",
                    task.done
                      ? "bg-violet-500 border-violet-500 shadow-sm shadow-violet-200"
                      : "border-border hover:border-violet-400 hover:bg-violet-50",
                    isPopped ? "task-pop" : ""
                  )}
                  onAnimationEnd={() =>
                    setPoppedIds((prev) => prev.filter((id) => id !== task.id))
                  }
                >
                  {task.done && (
                    <CheckCircle2 className="w-3 h-3 text-white fill-white" strokeWidth={0} />
                  )}
                </button>

                {/* コンテンツ */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium leading-snug transition-all duration-200",
                      task.done ? "line-through text-muted-foreground/60" : "text-foreground"
                    )}
                  >
                    {task.text}
                  </p>

                  {/* バッジ群 */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border", cat.badge)}>
                      {cat.icon} {cat.label}
                    </span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1", pri.badge)}>
                      {pri.icon}
                      {pri.label}
                    </span>
                    {task.deadline && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1",
                          overdue
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        )}
                      >
                        <Calendar className="w-3 h-3" />
                        {overdue && "期限切れ · "}
                        {formatDate(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => remove(task.id)}
                  className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all duration-200"
                  aria-label="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>

        {/* 完了済み一括削除 */}
        {doneCount > 0 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setTasks((prev) => prev.filter((t) => !t.done))}
              className="text-xs text-muted-foreground/50 hover:text-destructive transition-colors duration-200 flex items-center gap-1 mx-auto"
            >
              <Trash2 className="w-3 h-3" />
              完了済みをまとめて削除 ({doneCount}件)
            </button>
          </div>
        )}

        {/* フッター */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground/40">My Tasks • 今日も頑張ろう 💪</p>
        </div>
      </div>
      <Analytics />
    </div>
  );
}
