import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckSquare, List, ChevronDown,CalendarDays } from 'lucide-react';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

//Components
import Task from './Component/Task';
import TodoList from './Component/TodoList'; 

//CSS
import './App.css'; 

const App = () => {
  //Components UseStates
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);

  //Functionality
  const [selectedType, setSelectedType] = useState('task');
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  //Search
  const [searchText,setSearchText] = useState('')

  //Dates and Calender
  const [deadline, setDeadline] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  //Calender
  const toggleCalendar = () => {
    setShowCalendar(prev => !prev);
  };

  /// Local Storage
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    let taskString = localStorage.getItem("tasks")
    let listString = localStorage.getItem("lists")

    if(taskString){
      let tasks = JSON.parse(taskString)  
      setTasks(tasks)
    }

    if(listString){
      let lists = JSON.parse(listString)
      setLists(lists)
    }
    
    setIsDataLoaded(true); 
  }, [])

 
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, isDataLoaded])

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem("lists", JSON.stringify(lists))
    }
  }, [lists, isDataLoaded])

  //Search function
  const filteredTasks = useMemo(() => {
    if (!searchText.trim()) {
      return tasks; // Show all tasks when no search text
    }
    return tasks.filter(task => 
      task.text.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [tasks, searchText]);

  const filteredLists = useMemo(() => {
    if (!searchText.trim()) {
      return lists; // Show all tasks when no search text
    }
    return lists.filter(list => {
      const listNameMatches = list.name.toLowerCase().includes(searchText.toLowerCase());
      
      const taskMatches = list.tasks.some(task => 
        task.text.toLowerCase().includes(searchText.toLowerCase())
      );
      
      return listNameMatches || taskMatches;
    });
  }, [lists, searchText]);

  // Task functions
  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      deadline: deadline || null,
    };
    setTasks((prev) => [...prev, newTask]);
    
    setInputValue('');
    setDeadline(null); 

  };

  const completeTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    
  };

  const deleteTask = (id) => {
    const targetTask = tasks.find(task => task.id === id)
    var result = confirm(`Do you want to delete the "${targetTask?.text}" task?`)
    if(result){
      setTasks(tasks.filter(task => task.id !== id));
    }    
  };

  const handleSaveNote = (taskId, updatedNote) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, note: updatedNote } : task
    );
    setTasks(updatedTasks);
    
  };

  // List functions
  const addList = (name) => {
    const newList = {
      id: Date.now(),
      name,
      completed: false,
      tasks: []
    };
    setLists([...lists, newList]);
    
  };

  const completeList = (id) => {
    setLists(lists.map(list => 
      list.id === id ? { ...list, completed: !list.completed } : list
    ));
    
  };

  const deleteList = (id) => {
    const targetList = lists.find(list => list.id === id)
    var result = confirm(`Do you want to delete the "${targetList?.name}" list?`)

    if(result){
      setLists(lists.filter(list => list.id !== id));
    }
  };

  const addTaskToList = (listId, taskText, listTaskDeadline) => {
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      deadline: listTaskDeadline || null
    };
    setLists(lists.map(list => 
      list.id === listId 
        ? { ...list, tasks: [...list.tasks, newTask] }
        : list
    ));
    
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
    const dontAsk = localStorage.getItem(`dontAskAgain_task_list_${listId}`) === 'true';
  
    const targetList = lists.find(list => list.id === listId);
    const targetTask = targetList.tasks.find(task => task.id === taskId);
  
    if (dontAsk || confirm(`Do you want to delete the "${targetTask?.text}" task?`)) {
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
    if (inputValue.trim()) {
      if (selectedType === 'task') {
        addTask(inputValue.trim());
      } else {
        addList(inputValue.trim());
      }
      setInputValue('');
    }
  };

  //Handle Edit Task
  const handleEditTask = (id, newText) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, text: newText } : t
      )
    );
  };
  

  const dropdownOptions = [
    { value: 'task', label: 'Task', icon: <CheckSquare size={16} /> },
    { value: 'list', label: 'List', icon: <List size={16} /> }
  ];

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">Todo App</h1>
        <div className='search-container'>
          <input type='text' onChange={(e) => setSearchText(e.target.value)} value={searchText} placeholder='Search...' className='search-input'/>
        </div>
      </div>
     
      <div className="add-form">
        <div className="dropdown-container">
          <button
            className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {dropdownOptions.find(opt => opt.value === selectedType)?.icon}
              {dropdownOptions.find(opt => opt.value === selectedType)?.label}
            </span>
            <ChevronDown size={16} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {dropdownOptions.map(option => (
                <div
                  key={option.value}
                  className="dropdown-option"
                  onClick={() => {
                    setSelectedType(option.value);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.icon}
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={selectedType === 'task' ? 'Add a new task...' : 'Create a new list...'}
          className="main-input"
        />
      <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Calendar Icon Button */}
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
              inline // shows it as a block calendar
              minDate={new Date()}
            />
          </div>
        )}    
      </div>
        <button
          onClick={handleAdd}
          className="add-btn primary"
        >
          <Plus size={16} />
          Add {selectedType === 'task' ? 'Task' : 'List'}
        </button>
      </div>

      <div className="content-area">
        {filteredTasks.length > 0 && (
            <div className="tasks-section">
              <h2 className="section-title">
                <CheckSquare size={20} />
                Tasks ({tasks.filter(t => t.completed).length}/{tasks.length})
              </h2>
              <div className="tasks-container">
                {[...filteredTasks]
                  .sort((a, b) => a.completed - b.completed).map(task => (
                  <Task
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onDelete={deleteTask}
                    deadline={deadline}
                    onSave={handleSaveNote}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            </div>
          )}
        {tasks.length > 0 && lists.length > 0 && <div className="separator"></div>}

        {filteredLists.length > 0 && (
          <div className="lists-section">
            <h2 className="section-title">
              <List size={20} />
              Lists ({lists.filter(l => l.completed).length}/{lists.length})
            </h2>
            <div className="lists-container">
              {[...filteredLists]
                  .sort((a, b) => a.completed - b.completed).map(list => (
                <TodoList
                  key={list.id}
                  list={list}
                  onComplete={completeList}
                  onDelete={deleteList}
                  onAddTask={addTaskToList}
                  onCompleteTask={completeTaskInList}
                  onDeleteTask={deleteTaskFromList}
                />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && lists.length === 0 && (
          <div className="empty-state">
            <p>No tasks or lists yet. Use the dropdown above to create your first task or list!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;