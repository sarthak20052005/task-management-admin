import React, { useEffect, useState, useMemo } from "react";
import { Plus, Check, Trash2, List, Flag, Clock } from "lucide-react";
import Task from "./Task";
import ProgressBar from "./ProgressBar";
import CustomDropdown from "./CustomDropDown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays } from "lucide-react";

const TodoList = ({
  list,
  onComplete,
  onDelete,
  onCompleteTask,
  onDeleteTask,
  editingTaskInfo,
  editingText,
  setEditingText,
  onEditTask,
  onSaveEdit,
  onCancelEdit,
  onAddTaskToSublist,
  onCompleteSublistTask,
  onDeleteSublistTask,
}) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [doNotAskTaskDelete, setDoNotAskTaskDelete] = useState(false);
  const [sublistInputs, setSublistInputs] = useState({});
  const [selectedPriority, setSelectedPriority] = useState('mid');
  const [sublistCalendars, setSublistCalendars] = useState({});
  const [sublistDeadlines, setSublistDeadlines] = useState({});
  const [sublistTimes, setSublistTimes] = useState({});

  const priorityOrder = {
    low: 3,
    mid: 2,
    high: 1,
  };

  const priorityOptions = [
    { value: 'high', label: 'High Priority', icon: <Flag size={16} color="#ff4444" /> },
    { value: 'mid', label: 'Medium Priority', icon: <Flag size={16} color="#ffaa44" /> },
    { value: 'low', label: 'Low Priority', icon: <Flag size={16} color="#44ff44" /> }
  ];

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Generate 12-hour time options for dropdown
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const minuteStr = minute.toString().padStart(2, '0');
        const amTime = `${hour}:${minuteStr} AM`;
        const pmTime = `${hour}:${minuteStr} PM`;
        
        times.push({
          value: amTime,
          label: amTime,
          icon: <Clock size={16} />
        });
        
        if (hour !== 12 || minute !== 45) {
          times.push({
            value: pmTime,
            label: pmTime,
            icon: <Clock size={16} />
          });
        }
      }
    }
    return times.sort((a, b) => {
      const timeA = convertTo24Hour(a.value);
      const timeB = convertTo24Hour(b.value);
      return timeA.localeCompare(timeB);
    });
  };

  const timeOptions = generateTimeOptions();

  const sortedTasks = useMemo(() => {
    return [...list.tasks].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [list.tasks]);

  useEffect(() => {
    const saved = localStorage.getItem(`dontAskAgain_task_list_${list.id}`);
    if (saved === "true") {
      setDoNotAskTaskDelete(true);
    }
  }, [list.id]);

  const toggleDoNotAskTaskDelete = () => {
    const updated = !doNotAskTaskDelete;
    setDoNotAskTaskDelete(updated);
    if (updated) {
      localStorage.setItem(`dontAskAgain_task_list_${list.id}`, "true");
    } else {
      localStorage.removeItem(`dontAskAgain_task_list_${list.id}`);
    }
  };

  const combineDateTime = (date, time) => {
    if (!date) return null;
    const time24h = convertTo24Hour(time);
    const [hours, minutes] = time24h.split(':');
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combinedDate;
  };

  const toggleSublistCalendar = (sublistId) => {
    setSublistCalendars(prev => ({
      ...prev,
      [sublistId]: !prev[sublistId]
    }));
  };

  const handleEditTaskText = (listId, taskId, newText) => {
    const task = list.tasks.find((t) => t.id === taskId);
    if (task && onEditTask) {
      onEditTask(listId, task);
    }
  };

  const handleEditSublistTask = (sublistId, taskId) => {
    const sublist = list.lists.find((s) => s.id === sublistId);
    const task = sublist?.task?.find((t) => t.id === taskId);
    if (task && onEditTask) {
      onEditTask(list.id, task, sublistId);
    }
  };

  const handleSublistInputChange = (sublistId, value) => {
    setSublistInputs((prev) => ({ ...prev, [sublistId]: value }));
  };

  const handleSublistTaskAdd = (sublistId) => {
    const taskText = sublistInputs[sublistId]?.trim();
    const sublistDeadline = sublistDeadlines[sublistId];
    const sublistTime = sublistTimes[sublistId] || '11:59 PM';
    
    if (taskText && onAddTaskToSublist) {
      onAddTaskToSublist(list.id, sublistId, taskText, sublistDeadline, sublistTime, selectedPriority);
      setSublistInputs((prev) => ({ ...prev, [sublistId]: "" }));
      setSublistDeadlines((prev) => ({ ...prev, [sublistId]: null }));
      setSublistTimes((prev) => ({ ...prev, [sublistId]: '11:59 PM' }));
      setSublistCalendars(prev => ({ ...prev, [sublistId]: false }));
    }
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

      {showTasks && (
        <label
          style={{
            fontSize: "1rem",
            display: "flex",
            marginTop: "0.5rem",
            justifyContent: "center",
            padding: 5,
          }}
        >
          Don't ask again to confirm
          <input
            type="checkbox"
            checked={doNotAskTaskDelete}
            onChange={toggleDoNotAskTaskDelete}
            style={{ marginLeft: "6px" }}
          />
        </label>
      )}

      {showTasks && (
        <div className="list-tasks">
          <div className="tasks-container">
            {sortedTasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onComplete={(taskId) => onCompleteTask(list.id, taskId)}
                onDelete={(taskId) =>
                  onDeleteTask(list.id, taskId, doNotAskTaskDelete)
                }
                priority={task.priority}
                onEdit={() => handleEditTaskText(list.id, task.id)}
                doNotAskTaskDelete={doNotAskTaskDelete}
                isEditing={
                  editingTaskInfo?.listId === list.id &&
                  editingTaskInfo?.taskId === task.id &&
                  !editingTaskInfo?.sublistId
                }
                editingText={editingText}
                setEditingText={setEditingText}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
              />
            ))}
            {list.tasks.length === 0 && (
              <p className="empty-state">No tasks in this list yet.</p>
            )}
          </div>

          {list.lists && list.lists.length > 0 && (
            <div className="sublists-section">
              <div className="sublists-section-02">
                <h4 className="sublist-title">📂 Sub Lists</h4>
                {list.lists.map((subList) => (
                  <div key={subList.id} className="sublist-card">
                    <p className="sublist-name">
                      <strong>{subList.name}</strong>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginBottom: "0.5rem",
                        flexWrap: "wrap",
                        alignItems: "center"
                      }}
                    >
                      <input
                        type="text"
                        className="sublist-input"
                        placeholder="Add task to sublist"
                        value={sublistInputs[subList.id] || ""}
                        onChange={(e) =>
                          handleSublistInputChange(subList.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSublistTaskAdd(subList.id);
                        }}
                        style={{
                          flex: 1,
                          padding: "4px 6px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          minWidth: "200px"
                        }}
                      />
                      
                      <CustomDropdown
                        options={priorityOptions}
                        selectedValue={selectedPriority}
                        setSelectedValue={setSelectedPriority}
                        placeholder="Priority"
                      />
                      
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                          onClick={() => toggleSublistCalendar(subList.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Pick deadline date and time"
                        >
                          <CalendarDays size={24} />
                        </button>

                        {sublistCalendars[subList.id] && (
                          <div className="calendar-dropdown">
                            <DatePicker
                              selected={sublistDeadlines[subList.id]}
                              onChange={(date) => {
                                setSublistDeadlines(prev => ({
                                  ...prev,
                                  [subList.id]: date
                                }));
                              }}
                              inline
                              minDate={new Date()}
                            />
                            <div className="time-selection">
                              <label className="time-label">Select Time:</label>
                              <CustomDropdown
                                options={timeOptions}
                                selectedValue={sublistTimes[subList.id] || '11:59 PM'}
                                setSelectedValue={(time) => setSublistTimes(prev => ({
                                  ...prev,
                                  [subList.id]: time
                                }))}
                                placeholder="Time"
                              />
                            </div>
                            <div className="calendar-actions">
                              <button 
                                onClick={() => setSublistCalendars(prev => ({
                                  ...prev,
                                  [subList.id]: false
                                }))}
                                className="calendar-done-btn"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setShowSubTasks(!showSubTasks)}
                        className="toggle-btn"
                      >
                        <List size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleSublistTaskAdd(subList.id)}
                        style={{
                          padding: "4px 10px",
                          border: "none",
                          background: "#4CAF50",
                          color: "white",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {showSubTasks && (
                      <div className="sublist-tasks">
                        {subList.task && subList.task.length > 0 ? (
                          subList.task
                            .sort(
                              (a, b) =>
                                priorityOrder[a.priority] -
                                priorityOrder[b.priority]
                            )
                            .map((task) => (
                              <Task
                                key={task.id}
                                task={task}
                                onComplete={(taskId) =>
                                  onCompleteSublistTask
                                    ? onCompleteSublistTask(
                                        list.id,
                                        subList.id,
                                        taskId
                                      )
                                    : console.log(
                                        "onCompleteSublistTask not provided"
                                      )
                                }
                                onDelete={(taskId) =>
                                  onDeleteSublistTask
                                    ? onDeleteSublistTask(
                                        list.id,
                                        subList.id,
                                        taskId,
                                        doNotAskTaskDelete
                                      )
                                    : console.log(
                                        "onDeleteSublistTask not provided"
                                      )
                                }
                                priority={task.priority}
                                onEdit={() =>
                                  handleEditSublistTask(subList.id, task.id)
                                }
                                doNotAskTaskDelete={doNotAskTaskDelete}
                                isEditing={
                                  editingTaskInfo?.listId === list.id &&
                                  editingTaskInfo?.taskId === task.id &&
                                  editingTaskInfo?.sublistId === subList.id
                                }
                                editingText={editingText}
                                setEditingText={setEditingText}
                                onSaveEdit={onSaveEdit}
                                onCancelEdit={onCancelEdit}
                              />
                            ))
                        ) : (
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#888",
                              fontStyle: "italic",
                              margin: "0.5rem 0",
                            }}
                          >
                            No tasks in this sublist yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {list.tasks.length > 0 && (
        <ProgressBar completedTask={completedTasks} total={totalTasks} />
      )}
    </div>
  );
};

export default TodoList;