import React, { useEffect, useState } from "react";
import { Plus, Check, Trash2, List } from "lucide-react";
import Task from "./Task";
import ProgressBar from "./ProgressBar";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';

const TodoList = ({
  list,
  onComplete,
  onDelete,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
  onDeleteTaskAgain
}) => {
  const [newTask, setNewTask] = useState("");
  const [showTasks, setShowTasks] = useState(false);
  const [complete, setComeplete] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [doNotAskTaskDelete, setDoNotAskTaskDelete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`dontAskAgain_task_list_${list.id}`);
    if (saved === 'true') {
      setDoNotAskTaskDelete(true);
    }
  }, [list.id]);

  const toggleDoNotAskTaskDelete = () => {
    const updated = !doNotAskTaskDelete;
    setDoNotAskTaskDelete(updated);
    if (updated) {
      localStorage.setItem(`dontAskAgain_task_list_${list.id}`, 'true');
    } else {
      localStorage.removeItem(`dontAskAgain_task_list_${list.id}`);
    }
  };


  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(list.id, newTask.trim(),deadline);
      setNewTask("");
    }
  };

  const toggleCalendar = () => {
    setShowCalendar(prev => !prev);
  };
  const totalTasks = list.tasks.length;
  const completedTasks = list.completed
    ? totalTasks
    : list.tasks.filter((task) => task.completed).length;

  return (
    <div className={`todo-list-item ${list.completed ? "completed" : ""}`}>
      <div className="list-header">
        <div className="list-info">
          <button
            onClick={() => onComplete(list.id)}
            className={`checkbox ${list.completed ? "checked" : ""}`}
          >
            {list.completed && <Check size={12} />}
          </button>
          <h3 className={`list-name ${list.completed ? "strikethrough" : ""}`}>
            {list.name}
          </h3>
          <span className="task-count">
            ({completedTasks}/{totalTasks})
          </span>
        </div>
        <div className="list-actions">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="toggle-btn"
          >
            <List size={16} />
          </button>
          <button onClick={() => onDelete(list.id)} className="delete-btn">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {showTasks && (<label style={{ fontSize: '1rem', display: 'flex', marginTop: '0.5rem',justifyContent:'center',padding:5 }}>
            Dont ask again to confirm
            <input
              type="checkbox"
              checked={doNotAskTaskDelete}
              onChange={toggleDoNotAskTaskDelete}
              style={{ marginLeft: '6px',borderRadius:"25" }}
            />
        </label>)}

      {showTasks && (
        <div className="list-tasks">
          {/* <div className="add-task-form">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Add task for this list..."
              className="task-input"
            />
            <button
              onClick={toggleCalendar}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              title="Pick deadline"
            >
              <CalendarDays size={24} />
            </button>
            {showCalendar && (
              <div
                style={{
                  position: "absolute",
                  top: "35px",
                  zIndex: 100,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <DatePicker
                  selected={deadline}
                  onChange={(date) => {
                    setDeadline(date);
                    setShowCalendar(false);
                  }}
                  inline // shows it as a block calendar
                  minDate={new Date()}
                />
              </div>
            )}
            <button onClick={handleAddTask} className="add-btn secondary">
              <Plus size={16} />
            </button>
          </div> */}

          <div className="tasks-container">
            {list.tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onComplete={(taskId) => onCompleteTask(list.id, taskId)}
                onDelete={(taskId) => onDeleteTask(list.id, taskId)}
              />
            ))}
            {list.tasks.length === 0 && (
              <p className="empty-state">No tasks in this list yet.</p>
            )}
          </div>
        </div>
      )}
      {list.tasks.length > 0 && (
        <ProgressBar completedTask={completedTasks} total={totalTasks} />
      )}
    </div>
  );
};

export default TodoList;
