"use client";

import { useEffect, useMemo, useState } from "react";

type Subtask = {
  id: string;
  text: string;
  completed: boolean;
};

type Task = {
  id: string;
  text: string;
  completed: boolean;
  expanded: boolean;
  subtasks: Subtask[];
};

const STORAGE_KEY = "taskChecklist.tasks";

export default function TaskChecklist() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [draggingSubtask, setDraggingSubtask] =
    useState<{ taskId: string; subtaskId: string } | null>(null);
  const [dragOverSubtask, setDragOverSubtask] =
    useState<{ taskId: string; subtaskId: string } | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingSubtask, setEditingSubtask] =
    useState<{ taskId: string; subtaskId: string } | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTasks(
            parsed.map((task) => ({
              id: (task as any).id,
              text: (task as any).text ?? "",
              completed: Boolean((task as any).completed),
              expanded: (task as any).expanded ?? true,
              subtasks: Array.isArray((task as any).subtasks)
                ? (task as any).subtasks.map((sub: any) => ({
                    id: sub.id,
                    text: sub.text ?? "",
                    completed: Boolean(sub.completed),
                  }))
                : [],
            }))
          );
        }
      }
    } catch {
      // ignore invalid data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const tasksLeft = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);

  const addTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        expanded: true,
        subtasks: [],
      },
    ]);
    setNewTask("");
  };

  const toggleTaskExpand = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, expanded: !task.expanded } : task
      )
    );
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
  };

  const saveTaskEdit = () => {
    if (!editingTaskId) return;
    const trimmed = editingTaskText.trim();
    if (!trimmed) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === editingTaskId ? { ...task, text: trimmed } : task
      )
    );
    cancelEditingTask();
  };

  const startEditingSubtask = (taskId: string, subtask: Subtask) => {
    setEditingSubtask({ taskId, subtaskId: subtask.id });
    setEditingSubtaskText(subtask.text);
  };

  const cancelEditingSubtask = () => {
    setEditingSubtask(null);
    setEditingSubtaskText("");
  };

  const saveSubtaskEdit = () => {
    if (!editingSubtask) return;
    const trimmed = editingSubtaskText.trim();
    if (!trimmed) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === editingSubtask.taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === editingSubtask.subtaskId
                  ? { ...sub, text: trimmed }
                  : sub
              ),
            }
          : task
      )
    );

    cancelEditingSubtask();
  };

  const reorderTasks = (fromId: string, toId: string) => {
    setTasks((current) => {
      const fromIndex = current.findIndex((t) => t.id === fromId);
      const toIndex = current.findIndex((t) => t.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;

      const result = [...current];
      const [moved] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, moved);
      return result;
    });
  };

  const reorderSubtasks = (
    taskId: string,
    fromId: string,
    toId: string
  ) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const fromIndex = task.subtasks.findIndex((s) => s.id === fromId);
        const toIndex = task.subtasks.findIndex((s) => s.id === toId);
        if (fromIndex === -1 || toIndex === -1) return task;

        const updated = [...task.subtasks];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);

        return { ...task, subtasks: updated };
      })
    );
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const setSubtaskInput = (taskId: string, value: string) => {
    setSubtaskInputs((current) => ({ ...current, [taskId]: value }));
  };

  const addSubtask = (taskId: string) => {
    const text = (subtaskInputs[taskId] ?? "").trim();
    if (!text) return;

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                { id: crypto.randomUUID(), text, completed: false },
              ],
            }
          : task
      )
    );

    setSubtaskInputs((current) => ({ ...current, [taskId]: "" }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
              ),
            }
          : task
      )
    );
  };

  const removeSubtask = (taskId: string, subtaskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter((sub) => sub.id !== subtaskId),
            }
          : task
      )
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/paradise.jpg')] bg-cover bg-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Task checklist</h1>
          <p className="text-sm text-slate-500">
            Add tasks, check them off, and they’ll stick around between refreshes.
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addTask();
            }}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="Add a new task"
            aria-label="New task"
          />
          <button
            type="button"
            onClick={addTask}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Add
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
            <span>{tasksLeft} left</span>
          </div>

          <ul className="mt-4 space-y-2">
            {tasks.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-400">
                No tasks yet. Add one above.
              </li>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.id}
                  draggable
                  onDragStart={(event) => {
                    setDraggingTaskId(task.id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverTaskId(task.id);
                  }}
                  onDragLeave={() => setDragOverTaskId(null)}
                  onDrop={() => {
                    if (draggingTaskId && draggingTaskId !== task.id) {
                      reorderTasks(draggingTaskId, task.id);
                    }
                    setDraggingTaskId(null);
                    setDragOverTaskId(null);
                  }}
                  className={
                    "rounded-lg border px-3 py-3 " +
                    (dragOverTaskId === task.id
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 bg-slate-50")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTaskExpand(task.id)}
                      className="text-slate-500 hover:text-slate-700"
                      aria-label={task.expanded ? "Collapse subtasks" : "Expand subtasks"}
                    >
                      {task.expanded ? "▾" : "▸"}
                    </button>

                    <label className="flex flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {editingTaskId === task.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            value={editingTaskText}
                            onChange={(event) => setEditingTaskText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") saveTaskEdit();
                              if (event.key === "Escape") cancelEditingTask();
                            }}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          />
                          <button
                            type="button"
                            onClick={saveTaskEdit}
                            className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingTask}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={
                              task.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-900"
                            }
                          >
                            {task.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => startEditingTask(task)}
                            className="text-xs text-slate-500 hover:text-slate-700 focus:outline-none"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      className="text-sm font-medium text-rose-500 transition hover:text-rose-600 focus:outline-none"
                    >
                      Delete
                    </button>
                  </div>

                  {task.subtasks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {task.subtasks.filter((s) => s.completed).length} of {task.subtasks.length} completed
                        </span>
                        <span className="text-xs text-slate-400">
                          {task.expanded ? "Hide" : "Show"} subtasks
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-indigo-500"
                          style={{
                            width: `${
                              (task.subtasks.filter((s) => s.completed).length /
                                task.subtasks.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {task.expanded && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          value={subtaskInputs[task.id] ?? ""}
                          onChange={(event) => setSubtaskInput(task.id, event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") addSubtask(task.id);
                          }}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          placeholder="Add a subtask"
                          aria-label="New subtask"
                        />
                        <button
                          type="button"
                          onClick={() => addSubtask(task.id)}
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          Add
                        </button>
                      </div>

                      {task.subtasks.length > 0 && (
                        <ul className="space-y-1">
                          {task.subtasks.map((subtask) => (
                            <li
                              key={subtask.id}
                              draggable
                              onDragStart={(event) => {
                                setDraggingSubtask({ taskId: task.id, subtaskId: subtask.id });
                                event.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(event) => {
                                event.preventDefault();
                                setDragOverSubtask({ taskId: task.id, subtaskId: subtask.id });
                              }}
                              onDragLeave={() => setDragOverSubtask(null)}
                              onDrop={() => {
                                if (
                                  draggingSubtask &&
                                  draggingSubtask.subtaskId !== subtask.id &&
                                  draggingSubtask.taskId === task.id
                                ) {
                                  reorderSubtasks(
                                    task.id,
                                    draggingSubtask.subtaskId,
                                    subtask.id
                                  );
                                }
                                setDraggingSubtask(null);
                                setDragOverSubtask(null);
                              }}
                              className={
                                "flex items-center justify-between gap-3 rounded-md bg-white px-2 py-1 " +
                                (dragOverSubtask?.taskId === task.id &&
                                dragOverSubtask?.subtaskId === subtask.id
                                  ? "ring-2 ring-indigo-300"
                                  : "")
                              }
                            >
                              <label className="flex flex-1 items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={subtask.completed}
                                  onChange={() => toggleSubtask(task.id, subtask.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />

                                {editingSubtask?.taskId === task.id &&
                                editingSubtask?.subtaskId === subtask.id ? (
                                  <div className="flex flex-1 items-center gap-2">
                                    <input
                                      value={editingSubtaskText}
                                      onChange={(event) =>
                                        setEditingSubtaskText(event.target.value)
                                      }
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") saveSubtaskEdit();
                                        if (event.key === "Escape") cancelEditingSubtask();
                                      }}
                                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={saveSubtaskEdit}
                                      className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditingSubtask}
                                      className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span
                                      className={
                                        subtask.completed
                                          ? "text-slate-400 line-through"
                                          : "text-slate-800"
                                      }
                                    >
                                      {subtask.text}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => startEditingSubtask(task.id, subtask)}
                                      className="text-xs text-slate-500 hover:text-slate-700 focus:outline-none"
                                    >
                                      Edit
                                    </button>
                                  </>
                                )}
                              </label>
                              <button
                                type="button"
                                onClick={() => removeSubtask(task.id, subtask.id)}
                                className="text-xs font-medium text-rose-500 transition hover:text-rose-600 focus:outline-none"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
