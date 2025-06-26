import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckSquare, List, CalendarDays, User, Flag } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Components
import Task from './Component/Task';
import TodoList from './Component/TodoList';
import CustomDropdown from './Component/CustomDropDown';
import { GrainOverlay, GrainContainer } from './GrainOverlay01';

// CSS
import './App.css';

// Firebase
import { collection, addDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const App = () => {
  const initialUsers = [
    { id: 1, name: 'Harmish', tasks: [], completed: false, visible: true, lists: [] },
    { id: 2, name: 'Aarush', tasks: [], completed: false, visible: true, lists: [] },
    { id: 3, name: 'Animesh', tasks: [], completed: false, visible: true, lists: [] },
    { id: 4, name: 'Ayush', tasks: [], completed: false, visible: true, lists: [] },
    { id: 5, name: 'Sarthak', tasks: [], completed: false, visible: true, lists: [] },
    { id: 6, name: 'Mansi', tasks: [], completed: false, visible: true, lists: [] },
  ];

  const [lists, setLists] = useState(initialUsers);
  const [selectedType, setSelectedType] = useState('task');
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('mid');
  const [searchText, setSearchText] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [selectedTime, setSelectedTime] = useState('12:00'); // Default time
  const [sublistDeadline, setSublistDeadline] = useState(null);
  const [sublistTime, setSublistTime] = useState("12:00");
  const [showSublistCalendar, setShowSublistCalendar] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTaskInfo, setEditingTaskInfo] = useState(null);
  const [editingText, setEditingText] = useState('');

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  const toggleCalendar = () => setShowCalendar(prev => !prev);

  const combineDateAndTime = (date, timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate.toISOString(); // Store in ISO format
  };


  const handleEditTask = (listId, task, sublistId = null) => {
    setEditingTaskInfo({ listId, taskId: task.id, sublistId });
    setEditingText(task.text);
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim()) return;

    const updatedLists = lists.map((list) => {
      if (list.id !== editingTaskInfo.listId) return list;

      // If editing a sublist task
      if (editingTaskInfo.sublistId) {
        return {
          ...list,
          lists: list.lists.map((sublist) =>
            sublist.id === editingTaskInfo.sublistId
              ? {
                ...sublist,
                task: sublist.task.map((task) =>
                  task.id === editingTaskInfo.taskId
                    ? { ...task, text: editingText }
                    : task
                ),
              }
              : sublist
          ),
        };
      }

      // If editing a main list task
      return {
        ...list,
        tasks: list.tasks.map((task) =>
          task.id === editingTaskInfo.taskId
            ? { ...task, text: editingText }
            : task
        ),
      };
    });

    setLists(updatedLists);

    const updatedUser = updatedLists.find(user => user.id === editingTaskInfo.listId);
    if (updatedUser) {
      try {
        const userRef = doc(db, "users", String(updatedUser.name));
        await setDoc(userRef, {
          id: updatedUser.id,
          name: updatedUser.name,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        });
        console.log("Task updated successfully in Firebase");
      } catch (error) {
        console.error("Error updating task in Firebase:", error);
      }
    }

    setEditingTaskInfo(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingTaskInfo(null);
    setEditingText('');
  };

  const filteredLists = useMemo(() => {
    return lists.filter(list => {
      const hasTasks = list.tasks?.length > 0;
      const hasSublists = list.lists?.length > 0;

      const matchesSearch =
        list.name.toLowerCase().includes(searchText.toLowerCase()) ||
        list.tasks.some(task => task.text.toLowerCase().includes(searchText.toLowerCase())) ||
        list.lists?.some(subList =>
          subList.name.toLowerCase().includes(searchText.toLowerCase()) ||
          subList.task?.some(task => task.text.toLowerCase().includes(searchText.toLowerCase()))
        );

      return (hasTasks || hasSublists) && list.visible !== false && matchesSearch;
    });
  }, [lists, searchText]);

  const completeList = (id) => {
    const updatedLists = lists.map(list =>
      list.id === id ? { ...list, completed: !list.completed } : list
    );
    setLists(updatedLists);
  };

  const deleteList = (id) => {
    const targetList = lists.find(list => list.id === id);
    if (confirm(`Do you want to delete the "${targetList?.name}" user?`)) {
      const updatedLists = lists.map(list =>
        list.id === id ? { ...list, tasks: [], visible: false } : list
      );
      setLists(updatedLists);
    }
  };

  const completeTaskInList = (listId, taskId) => {
    setLists(lists.map(list =>
      list.id === listId
        ? {
          ...list,
          tasks: list.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }
        : list
    ));
  };

  const deleteTaskFromList = (listId, taskId, doNotAskTaskDelete) => {
    const targetList = lists.find(list => list.id === listId);
    const targetTask = targetList.tasks.find(task => task.id === taskId);

    if (doNotAskTaskDelete || window.confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
      const updatedTasks = targetList.tasks.filter(task => task.id !== taskId);
      const updatedLists = lists.map(list =>
        list.id === listId ? { ...list, tasks: updatedTasks } : list
      );
      setLists(updatedLists);
    }
  };

  const completeSublistTask = (userId, sublistId, taskId) => {
    const updatedLists = lists.map(user => {
      if (user.id !== userId) return user;

      const updatedSublists = user.lists.map(sublist => {
        if (sublist.id !== sublistId) return sublist;

        return {
          ...sublist,
          task: sublist.task.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      });

      return {
        ...user,
        lists: updatedSublists
      };
    });

    setLists(updatedLists);
  };

  const deleteSublistTask = (userId, sublistId, taskId, doNotAskTaskDelete) => {
    const targetUser = lists.find(user => user.id === userId);
    const targetSublist = targetUser?.lists?.find(sublist => sublist.id === sublistId);
    const targetTask = targetSublist?.task?.find(task => task.id === taskId);

    if (doNotAskTaskDelete || window.confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
      const updatedLists = lists.map(user => {
        if (user.id !== userId) return user;

        const updatedSublists = user.lists.map(sublist => {
          if (sublist.id !== sublistId) return sublist;

          return {
            ...sublist,
            task: sublist.task.filter(task => task.id !== taskId)
          };
        });

        return {
          ...user,
          lists: updatedSublists
        };
      });

      setLists(updatedLists);
    }
  };

  const handleAddTaskToSublist = (userId, sublistId, taskText, taskDeadline, taskPriority) => {
  const combinedDeadline = combineDateAndTime(taskDeadline || new Date(), sublistTime);
  const updatedLists = lists.map(user => {
    if (user.id !== userId) return user;

    const updatedSublists = user.lists.map(sublist => {
      if (sublist.id !== sublistId) return sublist;

      const newTask = {
        id: Date.now(),
        text: taskText,
        deadline: combinedDeadline,
        completed: false,
        priority: taskPriority,
        notes: ''
      };

      return {
        ...sublist,
        task: [...(sublist.task || []), newTask]
      };
    });

    return {
      ...user,
      lists: updatedSublists
    };
  });

  setLists(updatedLists);
};


  const handleAdd = () => {
    if (!inputValue.trim() || !selectedUser) return;

    const updatedLists = lists.map(user => {
      if (user.id !== selectedUser) return user;

      if (selectedType === 'task') {
        const newTask = {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
          deadline: combineDateAndTime(deadline || new Date(), selectedTime),
          priority: selectedPriority,
          notes: ''
        };
        return {
          ...user,
          visible: true,
          tasks: [...user.tasks, newTask]
        };
      }

      if (selectedType === 'list') {
        const newList = {
          id: Date.now(),
          name: inputValue.trim(),
          task: [],
          completed: false,
        };
        return {
          ...user,
          visible: true,
          lists: [...user.lists, newList]
        };
      }

      return user;
    });

    setLists(updatedLists);

    const updatedUser = updatedLists.find(user => user.id === selectedUser);

    const uploadToFirebase = async () => {
      try {
        const userRef = doc(db, "users", String(updatedUser.name));
        await setDoc(userRef, {
          id: updatedUser.id,
          name: updatedUser.name,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        });
        console.log("Document written with ID: ", userRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };

    uploadToFirebase();
    setInputValue('');
    setDeadline(null);
    setSelectedPriority('mid');
  };

  const userOptions = lists.map(user => ({
    value: user.id,
    label: user.name,
    icon: <User size={16} />,
  }));

  const priorityOptions = [
    { value: 'high', label: 'High Priority', icon: <Flag size={16} color="#ff4444" /> },
    { value: 'mid', label: 'Medium Priority', icon: <Flag size={16} color="#ffaa44" /> },
    { value: 'low', label: 'Low Priority', icon: <Flag size={16} color="#44ff44" /> }
  ];

  const typesOptions = [
    { value: 'task', label: 'Task' },
    { value: 'list', label: 'List' },
  ];

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">Todo App</h1>
        <div className="search-container">
          <input
            type="text"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            placeholder="Search..."
            className="search-input"
          />
        </div>
      </div>

      <div className="add-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new task or list..."
          className="main-input"
        />

        <CustomDropdown
          options={userOptions}
          selectedValue={selectedUser}
          setSelectedValue={setSelectedUser}
          placeholder="Select User"
        />

        <CustomDropdown
          options={typesOptions}
          selectedValue={selectedType}
          setSelectedValue={setSelectedType}
          placeholder="Select Type"
        />

        <CustomDropdown
          options={priorityOptions}
          selectedValue={selectedPriority}
          setSelectedValue={setSelectedPriority}
          placeholder="Priority"
        />

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={toggleCalendar}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            title="Pick deadline"
          >
            <CalendarDays size={24} />
          </button>

          {showCalendar && (
            <div className="calendar-dropdown">
              <DatePicker
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                inline
                minDate={new Date()}
              />
              <div style={{ marginTop: '10px' }}>
                <label style={{ color: '#e5e5e5', marginBottom: '4px', display: 'block' }}>Set Time:</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="time-input"
                />
                <button
                  onClick={() => setShowCalendar(false)}
                  className="add-btn secondary"
                  style={{ marginTop: '10px', width: '100%' }}
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="add-btn primary"
          disabled={!inputValue.trim() || !selectedUser}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="content-area">
        {filteredLists.length > 0 ? (
          <div className="lists-section">
            <h2 className="section-title">
              <List size={20} /> Users with Tasks ({filteredLists.length}/{lists.length})
            </h2>
            <div className="lists-container">
              {filteredLists
                .sort((a, b) => a.completed - b.completed)
                .map((list) => (
                  <TodoList
                    key={list.id}
                    list={list}
                    subLists={list.lists}
                    onComplete={completeList}
                    onDelete={deleteList}
                    onAddTask={(listId, taskText, deadline) => {
                      const updated = lists.map(user => {
                        if (user.id !== listId) return user;
                        const newTask = {
                          id: Date.now(),
                          text: taskText,
                          completed: false,
                          deadline: deadline || formattedDate,
                          priority: 'mid',
                          notes: ''
                        };
                        return { ...user, tasks: [...user.tasks, newTask] };
                      });
                      setLists(updated);
                    }}
                    onAddTaskToSublist={handleAddTaskToSublist}
                    onCompleteTask={completeTaskInList}
                    onDeleteTask={deleteTaskFromList}
                    onCompleteSublistTask={completeSublistTask}
                    onDeleteSublistTask={deleteSublistTask}
                    editingTaskInfo={editingTaskInfo}
                    editingText={editingText}
                    setEditingText={setEditingText}
                    onEditTask={handleEditTask}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>No users with tasks yet. Add a task to see the user here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;