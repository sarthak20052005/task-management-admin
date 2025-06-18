import React, { useState, useMemo } from 'react';
import { Plus, CheckSquare, List, ChevronDown, CalendarDays, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Components
import TodoList from './Component/TodoList';
import CustomDropdown from './Component/CustomDropDown';

// CSS
import './App.css';

const App = () => {
  const initialUsers = [
    { id: 1, name: 'Harmish', tasks: [], completed: false },
    { id: 2, name: 'Aarush', tasks: [], completed: false },
    { id: 3, name: 'Animesh', tasks: [], completed: false },
    { id: 4, name: 'Ayush', tasks: [], completed: false },
    { id: 5, name: 'Sarthak', tasks: [], completed: false },
    { id: 6, name: 'Mansi', tasks: [], completed: false },
  ];

  const [lists, setLists] = useState(initialUsers);
  const [selectedType, setSelectedType] = useState('task');
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [searchText, setSearchText] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => {
    setShowCalendar(prev => !prev);
  };

  const filteredLists = useMemo(() => {
    return lists.filter(
      list =>
        list.tasks.length > 0 &&
        (
          list.name.toLowerCase().includes(searchText.toLowerCase()) ||
          list.tasks.some(task =>
            task.text.toLowerCase().includes(searchText.toLowerCase())
          )
        )
    );
  }, [lists, searchText]);

  const completeList = (id) => {
    setLists(lists.map(list =>
      list.id === id ? { ...list, completed: !list.completed } : list
    ));
  };

  const deleteList = (id) => {
    const targetList = lists.find(list => list.id === id);
    if (confirm(`Do you want to delete the "${targetList?.name}" user?`)) {
      setLists(lists.filter(list => list.id !== id));
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

  const deleteTaskFromList = (listId, taskId) => {
    const targetList = lists.find(list => list.id === listId);
    const targetTask = targetList.tasks.find(task => task.id === taskId);

    if (confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
      setLists(prev =>
        prev.map(list =>
          list.id === listId
            ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
            : list
        )
      );
    }
  };

  const handleAdd = () => {
    if (!inputValue.trim() || !selectedUser) return;

    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      deadline: deadline || null,
      //priority: selectedPriority
    };

    setLists(prev =>
      prev.map(user =>
        user.id === selectedUser
          ? { ...user, tasks: [...user.tasks, newTask] }
          : user
      )
    );

    setInputValue('');
    setDeadline(null);
    //setSelectedPriority('medium');
  };

  const userOptions = lists.map((user) => ({
    value: user.id,
    label: user.name,
    icon: <User size={16} />,
  }));

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
          placeholder="Add a new task..."
          className="main-input"
        />

        <CustomDropdown
          options={userOptions}
          selectedValue={selectedUser}
          setSelectedValue={setSelectedUser}
          placeholder="Select User"
        />

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={toggleCalendar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Pick deadline"
          >
            <CalendarDays size={24} />
          </button>

          {showCalendar && (
            <div
              style={{
                position: 'absolute',
                top: '35px',
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <DatePicker
                selected={deadline}
                onChange={(date) => {
                  setDeadline(date);
                  setShowCalendar(false);
                }}
                inline
                minDate={new Date()}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="add-btn primary"
          disabled={!inputValue.trim() || !selectedUser}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <div className="content-area">
        {filteredLists.length > 0 ? (
          <div className="lists-section">
            <h2 className="section-title">
              <List size={20} />
              Users with Tasks ({filteredLists.length}/{lists.length})
            </h2>
            <div className="lists-container">
              {filteredLists
                .sort((a, b) => a.completed - b.completed)
                .map((list) => (
                  <TodoList
                    key={list.id}
                    list={list}
                    onComplete={completeList}
                    onDelete={deleteList}
                    onAddTask={() => {}}
                    onCompleteTask={completeTaskInList}
                    onDeleteTask={deleteTaskFromList}
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
