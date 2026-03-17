import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useHousehold } from "./useHousehold";
import VoiceButton from "./VoiceButton";
import Login from "./Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [section, setSection] = useState("now");
  const [confirm, setConfirm] = useState(null);
  const [tomorrowOpen, setTomorrowOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);

  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useHousehold();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  function handleVoiceResult(tasks) {
    if (tasks.length === 1) {
      const task = tasks[0];
      setInputValue(task.text);
      const lower = task.text.toLowerCase();
      if (lower.includes("now") || lower.includes("urgent") || lower.includes("asap") || lower.includes("immediately") || lower.includes("right now")) {
        setSection("now");
      } else if (lower.includes("tomorrow") || lower.includes("next day") || lower.includes("morning")) {
        setSection("tomorrow");
      } else if (lower.includes("later") || lower.includes("sometime") || lower.includes("eventually") || lower.includes("no rush")) {
        setSection("later");
      } else {
        setSection(task.section || "now");
      }
    } else {
      tasks.forEach(task => {
        addTodo(task.text, task.section);
      });
    }
  }

  function handleAddTodo() {
    if (inputValue.trim() === "") return;
    addTodo(inputValue, section);
    setInputValue("");
  }

  function handleCheckbox(todo) {
    setConfirm(todo);
  }

  function handleConfirm(answer) {
    toggleTodo(confirm, answer === "yes");
    setConfirm(null);
  }

  function getTimeBucket(iso) {
    const diff = (new Date() - new Date(iso)) / 60000;
    if (diff < 60) return "Last Hour";
    if (diff < 1440) return "Today";
    if (diff < 2880) return "Yesterday";
    if (diff < 10080) return "This Week";
    if (diff < 43200) return "This Month";
    return "Older";
  }

  const bucketOrder = ["Last Hour", "Today", "Yesterday", "This Week", "This Month", "Older"];
  const completedTodos = todos.filter(t => t.done && t.completedAt);
  const grouped = bucketOrder.reduce((acc, bucket) => {
    const items = completedTodos.filter(t => getTimeBucket(t.completedAt) === bucket);
    if (items.length > 0) acc[bucket] = items;
    return acc;
  }, {});

  const nowTodos = todos.filter(t => t.section === "now");
  const laterTodos = todos.filter(t => t.section === "later");
  const tomorrowTodos = todos.filter(t => t.section === "tomorrow");

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  }

  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      Loading...
    </div>
  );

  if (!user) return <Login />;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      Loading tasks...
    </div>
  );

  return (
    <div className="layout">

      {/* LEFT PANEL — Do Later */}
      <div className="side-panel left-panel">
        <h2 className="panel-title later-title">Do Later</h2>
        <p className="panel-count">{laterTodos.filter(t => !t.done).length} tasks</p>
        <div className="side-list">
          {laterTodos.length === 0 && <p className="empty">Nothing yet</p>}
          {laterTodos.map(todo => (
            <div key={todo.id} className={`side-item ${todo.done ? "done-item" : ""}`}>
              <input type="checkbox" checked={todo.done} onChange={() => handleCheckbox(todo)} />
              <span className={todo.done ? "done" : ""}>{todo.text}</span>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER + BOTTOM */}
      <div className="main-column">
        <div className="center-panel">

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{ fontSize: "13px", color: "#888" }}>👤 {user.email}</span>
            <button onClick={() => signOut(auth)} style={{
              background: "none", border: "1px solid #ddd", borderRadius: "6px",
              padding: "4px 10px", fontSize: "12px", cursor: "pointer", color: "#888"
            }}>
              Sign out
            </button>
          </div>

          <h1 className="main-title">Do Now</h1>
          <p className="subtitle">
            {nowTodos.filter(t => !t.done).length} task{nowTodos.filter(t => !t.done).length !== 1 ? "s" : ""} remaining
          </p>

          <div className="input-row">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddTodo()}
              placeholder="Add a new task..."
            />
            <select value={section} onChange={e => setSection(e.target.value)} className="section-select">
              <option value="now">Now</option>
              <option value="later">Later</option>
              <option value="tomorrow">Tomorrow</option>
            </select>
            <button onClick={handleAddTodo}>Add</button>
            <VoiceButton onResult={handleVoiceResult} />
          </div>

          <div className="now-list">
            {nowTodos.length === 0 && <p className="empty">Nothing to do right now!</p>}
            {nowTodos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.done ? "done-item" : ""}`}>
                <input type="checkbox" checked={todo.done} onChange={() => handleCheckbox(todo)} />
                <span className={todo.done ? "done" : ""}>{todo.text}</span>
                <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM PANEL */}
        <div className={`bottom-panel ${bottomOpen ? "open" : ""}`}>
          <div className="bottom-header" onClick={() => setBottomOpen(!bottomOpen)}>
            <div className="bottom-header-left">
              <span className="bottom-title">Completed</span>
              <span className="bottom-badge">{completedTodos.length}</span>
            </div>
            <span className="toggle-arrow">{bottomOpen ? "▼" : "▲"}</span>
          </div>
          {bottomOpen && (
            <div className="bottom-content">
              {completedTodos.length === 0 && <p className="empty">No completed tasks yet. Get to work! 💪</p>}
              {Object.keys(grouped).map(bucket => (
                <div key={bucket} className="bucket-group">
                  <div className="bucket-label">{bucket}</div>
                  <div className="bucket-items">
                    {grouped[bucket].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).map(todo => (
                      <div key={todo.id} className="completed-item">
                        <span className="completed-check">✓</span>
                        <span className="completed-section-tag">{todo.section}</span>
                        <span className="completed-text">{todo.text}</span>
                        <span className="completed-time">{formatDate(todo.completedAt)} · {formatTime(todo.completedAt)}</span>
                        <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Do Tomorrow */}
      <div className={`side-panel right-panel ${tomorrowOpen ? "open" : ""}`}>
        <div className="tomorrow-header" onClick={() => setTomorrowOpen(!tomorrowOpen)}>
          <h2 className="panel-title tomorrow-title">Do Tomorrow</h2>
          <span className="toggle-arrow">{tomorrowOpen ? "→" : "←"}</span>
        </div>
        <p className="panel-count">{tomorrowTodos.filter(t => !t.done).length} tasks</p>
        <div className="side-list">
          {tomorrowTodos.length === 0 && <p className="empty">Nothing yet</p>}
          {tomorrowTodos.map(todo => (
            <div key={todo.id} className={`side-item ${todo.done ? "done-item" : ""}`}>
              <input type="checkbox" checked={todo.done} onChange={() => handleCheckbox(todo)} />
              <span className={todo.done ? "done" : ""}>{todo.text}</span>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* CONFIRMATION POPUP */}
      {confirm && (
        <div className="overlay">
          <div className="popup">
            <p>Are you done with:</p>
            <p className="popup-task">"{confirm.text}"</p>
            <div className="popup-buttons">
              <button className="btn-yes" onClick={() => handleConfirm("yes")}>✓ Yes, completed!</button>
              <button className="btn-no" onClick={() => handleConfirm("no")}>✗ No, still active</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;