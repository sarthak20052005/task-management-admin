import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckSquare, List, CalendarDays, User, Flag, Clock } from 'lucide-react';
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
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, updateDoc} from "firebase/firestore";
import { db } from "../firebase";


//Fluid
import { Fluid } from '@whatisjery/react-fluid-distortion';
import { EffectComposer } from '@react-three/postprocessing';
import { Canvas } from '@react-three/fiber';

const App = () => {
  // const initialUsers = [
  //   // { id: 1, name: 'Harmish', tasks: [], completed: false, visible: true, lists: [] },
  //   // { id: 2, name: 'Aarush', tasks: [], completed: false, visible: true, lists: [] },
  //   // { id: 3, name: 'Animesh', tasks: [], completed: false, visible: true, lists: [] },
  //   // { id: 4, name: 'Ayush', tasks: [], completed: false, visible: true, lists: [] },
  //   // { id: 5, name: 'Sarthak', tasks: [], completed: false, visible: true, lists: [] },
  //   // { id: 6, name: 'Mansi', tasks: [], completed: false, visible: true, lists: [] },
  // ];
  // const [users, setUsers] = useState(initialUsers);

  const [lists, setLists] = useState([]);
  const [selectedType, setSelectedType] = useState('task');
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('mid');
  const [searchText, setSearchText] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [deadlineTime, setDeadlineTime] = useState('11:59 PM');
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTaskInfo, setEditingTaskInfo] = useState(null);
  const [editingText, setEditingText] = useState('');

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

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

  const convertTo12Hour = (time24h) => {
    if (!time24h) return '11:59 PM';
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

        if (hour !== 12 || minute !== 45) { // Don't duplicate 12:45 PM
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

  const toggleCalendar = () => setShowCalendar(prev => !prev);

  const combineDateTime = (date, time) => {
    if (!date) return null;
    const time24h = convertTo24Hour(time);
    const [hours, minutes] = time24h.split(':');
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combinedDate;
  };

  //Fetching user from Database
  async function fetchUsersFromFirebase() {
    try {
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);
      
      if (querySnapshot.empty) {
        console.log("No users found in the database");
        return [];
      }
  
      const users = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // More comprehensive validation
        if (data && typeof data === 'object') {
          users.push({
            docId: docSnap.id,
            id: data.id || docSnap.id, 
            name: data.name || data.fullName ||'Unknown',
            tasks: data.tasks || [],
            lists: data.lists || [],
            completed: data.completed || false,
            visible: data.visible !== false, 
            notes: data.notes || ''
          });
        }
      });
  
      console.log(`Fetched ${users.length} users from Firebase:`, users);   
      setLists(users);
      return users;
    } catch (error) {
      console.error("Error fetching users from Firebase:", error);
      return [];
    }
  }

  useEffect(() => {
    fetchUsersFromFirebase();
  }, []);
  

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

  const completeList = async (id) => {
    const updatedLists = lists.map(list =>
      list.id === id ? { ...list, completed: !list.completed } : list
    );
    setLists(updatedLists); // Update local state first

    // Find the user whose list was completed
    const updatedUser = updatedLists.find(user => user.id === id);
    if (updatedUser) {
      try {
        const userRef = doc(db, "users", String(updatedUser.name));
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        });
        console.log("List completion updated successfully in Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error updating list completion in Firebase:", error);
      }
    }
  };

  const deleteList = async (id) => {
    const targetList = lists.find(list => list.id === id);
    if (confirm(`Do you want to delete the "${targetList?.name}" user?`)) {
      const updatedLists = lists.map(list =>
        list.id === id ? { ...list, tasks: [], visible: false, lists: [] } : list // Also clear sublists
      );
      setLists(updatedLists); // Update local state first

      // Delete the corresponding document from Firebase
      if (targetList) {
        try {
          const userRef = doc(db, "users", String(targetList.name));
          await setDoc(userRef, {
            id: targetList.id,
            name: targetList.name,
            tasks: [],
            lists: [],
            completed: false,
            visible: false, // Only mark as hidden
            notes: targetList.notes || '',
          });
          console.log(`Cleared tasks and lists for user "${targetList.name}" in Firebase (not deleted).`);
        } catch (error) {
          console.error("Error clearing user tasks in Firebase:", error);
        }
      }
    }
  };

  const completeTaskInList = async (listId, taskId) => {
    const updatedLists = lists.map(list =>
      list.id === listId
        ? {
          ...list,
          tasks: list.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }
        : list
    );
    setLists(updatedLists); // Update local state first

    // Find the user whose task was completed
    const updatedUser = updatedLists.find(user => user.id === listId);
    if (updatedUser) {
      try {
        const userRef = doc(db, "users", String(updatedUser.name));
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
        });
        console.log("Main task completion updated successfully in Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error updating main task completion in Firebase:", error);
      }
    }
  };

  const deleteTaskFromList = async (listId, taskId, doNotAskTaskDelete) => {
    const targetList = lists.find(list => list.id === listId);
    const targetTask = targetList?.tasks.find(task => task.id === taskId); // Use optional chaining

    if (doNotAskTaskDelete || window.confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
      const updatedTasks = targetList.tasks.filter(task => task.id !== taskId);
      const updatedLists = lists.map(list =>
        list.id === listId ? { ...list, tasks: updatedTasks } : list
      );
      setLists(updatedLists); // Update local state first

      // Find the user whose task was deleted
      const updatedUser = updatedLists.find(user => user.id === listId);
      if (updatedUser) {
        try {
          const userRef = doc(db, "users", String(updatedUser.name));
          await setDoc(userRef, { // Overwrite the entire user document with updated data
            id: updatedUser.id,
            name: updatedUser.name,
            tasks: updatedUser.tasks,
            lists: updatedUser.lists,
            completed: updatedUser.completed,
            notes: updatedUser.notes || '',
          });
          console.log("Main task deleted successfully from Firebase for user:", updatedUser.name);
        } catch (error) {
          console.error("Error deleting main task from Firebase:", error);
        }
      }
    }
  };

  const completeSublistTask = async (userId, sublistId, taskId) => {
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

    setLists(updatedLists); // Update local state first

    // Find the user whose sublist task was completed
    const updatedUser = updatedLists.find(user => user.id === userId);
    if (updatedUser) {
      try {
        const userRef = doc(db, "users", String(updatedUser.name));
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists,
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
          role: 'admin'
        });
        console.log("Sublist task completion updated successfully in Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error updating sublist task completion in Firebase:", error);
      }
    }
  };

  const deleteSublistTask = async (userId, sublistId, taskId, doNotAskTaskDelete) => {
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

      setLists(updatedLists); // Update local state first

      // Find the user whose sublist task was deleted
      const updatedUser = updatedLists.find(user => user.id === userId);
      if (updatedUser) {
        try {
          const userRef = doc(db, "users", String(updatedUser.name));
          await setDoc(userRef, { // Overwrite the entire user document with updated data
            id: updatedUser.id,
            name: updatedUser.name,
            tasks: updatedUser.tasks,
            lists: updatedUser.lists,
            completed: updatedUser.completed,
            notes: updatedUser.notes || '',
          });
          console.log("Sublist task deleted successfully from Firebase for user:", updatedUser.name);
        } catch (error) {
          console.error("Error deleting sublist task from Firebase:", error);
        }
      }
    }
  };

  const handleAddTaskToSublist = async (userId, sublistId, taskText, taskDeadline, taskTime, taskPriority) => {
    const updatedLists = lists.map(user => {
      if (user.id !== userId) return user;

      const updatedSublists = user.lists.map(sublist => {
        if (sublist.id !== sublistId) return sublist;

        const combinedDeadline = combineDateTime(taskDeadline || today, taskTime || '11:59 PM');

        const newTask = {
          id: Date.now(), // Generate a unique ID for the new task
          text: taskText,
          deadline: combinedDeadline || today,
          deadlineTime: taskTime || '11:59 PM',
          completed: false,
          priority: taskPriority,
          notes: ''
        };

        return {
          ...sublist,
          task: [...(sublist.task || []), newTask] // Ensure sublist.task is an array
        };
      });

      return {
        ...user,
        lists: updatedSublists
      };
    });

    setLists(updatedLists); // Update local state first

    // Find the user to update in Firebase
    const updatedUser = updatedLists.find(user => user.id === userId);
    if (updatedUser) {
      try {
        const userRef = doc(db, "users", String(updatedUser.name));
        await setDoc(userRef, { // Overwrite the entire user document with updated data
          id: updatedUser.id,
          name: updatedUser.name,
          tasks: updatedUser.tasks,
          lists: updatedUser.lists, // Crucially, include the updated sublists
          completed: updatedUser.completed,
          notes: updatedUser.notes || '',
          archived: updatedUser.archived || false, 
        });
        console.log("Sublist task added successfully to Firebase for user:", updatedUser.name);
      } catch (error) {
        console.error("Error adding sublist task to Firebase:", error);
      }
    }
  };

  const deleteSublist = async (userId, sublistId) => {
    const targetUser = lists.find(user => user.id === userId);
    const targetSublist = targetUser?.lists?.find(sublist => sublist.id === sublistId);

    if (confirm(`Do you want to delete the "${targetSublist?.name}" sublist?`)) {
      const updatedLists = lists.map(user => {
        if (user.id !== userId) return user;

        return {
          ...user,
          lists: user.lists.filter(sublist => sublist.id !== sublistId)
        };
      });

      setLists(updatedLists); // Update local state first

      // Find the user whose sublist was deleted
      const updatedUser = updatedLists.find(user => user.id === userId);
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
          console.log("Sublist deleted successfully from Firebase for user:", updatedUser.name);
        } catch (error) {
          console.error("Error deleting sublist from Firebase:", error);
        }
      }
    }
  }

  const handleAdd = () => {
    if (!inputValue.trim() || !selectedUser) return;

    const combinedDeadline = combineDateTime(deadline || new Date(formattedDate), deadlineTime);

    const updatedLists = lists.map(user => {
      if (user.id !== selectedUser) return user;

      if (selectedType === 'task') {
        const newTask = {
          id: Date.now(),
          text: inputValue.trim(),
          completed: false,
          deadline: combinedDeadline || new Date(formattedDate),
          deadlineTime: deadlineTime,
          priority: selectedPriority,
          notes: '',
          role: 'admin'
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
    setDeadlineTime('11:59 PM');
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
    <>
    <Canvas
      style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          background: '#000000',
          zIndex: 0,                // Keep it above -1
          pointerEvents: 'none',
      }}>
      <EffectComposer>
          <Fluid
          radius={0.2}
          distortion={1}
          force={2}
          pressure={0.94}
          densityDissipation={0.98}
          velocityDissipation={0.99}
          intensity={0.3}
          rainbow={false}
          blend={0}
          showBackground={true}
          fluidColor='#0d0b12'/>
      </EffectComposer>
    </Canvas>
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
  <div className="form-controls">
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

    <div className="calendar-container">
      <button
        onClick={toggleCalendar}
        className="calendar-button"
        title="Pick deadline date and time"
      >
        <CalendarDays size={20} />
      </button>

      {showCalendar && (
        <div className="calendar-dropdown">
          <DatePicker
            selected={deadline}
            onChange={(date) => setDeadline(date)}
            inline
            minDate={new Date()}
          />
          <div className="time-selection-container"> 
          <div className="time-selection">
            <label className="time-label">Select Time:</label>
            <CustomDropdown
              options={timeOptions}
              selectedValue={deadlineTime}
              setSelectedValue={setDeadlineTime}
              placeholder="Time"
            />
          </div>
          <div className="calendar-actions">
            <button
              onClick={() => setShowCalendar(false)}
              className="calendar-done-btn"
            >
              Done
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  </div>

  <textarea
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleAdd()}
    placeholder="Describe your task or list in detail... (Press Ctrl+Enter to add)"
    className="main-input"
    rows="4"
  />

  <div className="form-actions">
    <button
      onClick={handleAdd}
      className="add-btn primary"
      disabled={!inputValue.trim() || !selectedUser}
    >
      <Plus size={16} /> Add Task
    </button>
  </div>
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
                    onAddTaskToSublist={handleAddTaskToSublist}
                    onCompleteTask={completeTaskInList}
                    onDeleteTask={deleteTaskFromList}
                    onDeleteSublist={deleteSublist}
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
    </>
  );
};

export default App;