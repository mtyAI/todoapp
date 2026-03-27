import { useState } from "react";

const FILTERS = [
  { key: "all", label: "すべて" },
  { key: "active", label: "未完了" },
  { key: "done", label: "完了済み" },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks([{ id: Date.now(), text, done: false }, ...tasks]);
    setInput("");
  };

  const toggle = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Todoリスト
          </h1>
          {tasks.length > 0 && (
            <p className="mt-1 text-sm text-gray-400">
              {doneCount} / {tasks.length} 件完了
            </p>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="新しいタスクを入力..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm placeholder-gray-300 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
          />
          <button
            onClick={addTask}
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-600 active:scale-95 transition"
          >
            追加
          </button>
        </div>

        {/* Filter tabs */}
        {tasks.length > 0 && (
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  filter === f.key
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Task list */}
        <ul className="space-y-2">
          {visible.length === 0 && (
            <li className="text-center text-sm text-gray-300 py-10">
              {tasks.length === 0 ? "タスクがありません" : "該当するタスクなし"}
            </li>
          )}
          {visible.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-100 group"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  task.done
                    ? "bg-violet-500 border-violet-500"
                    : "border-gray-300 hover:border-violet-400"
                }`}
              >
                {task.done && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 10 8"
                  >
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

              {/* Text */}
              <span
                className={`flex-1 text-sm transition ${
                  task.done ? "line-through text-gray-300" : "text-gray-700"
                }`}
              >
                {task.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => remove(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition"
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
          ))}
        </ul>

        {/* Clear done */}
        {doneCount > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setTasks(tasks.filter((t) => !t.done))}
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
