// UserDashboard.jsx
import React from 'react';
import './UserDashboard.css';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'red';
    case 'Medium':
      return 'orange';
    case 'Low':
      return 'green';
    default:
      return 'gray';
  }
};

const UserDashboard = ({ users }) => {
  if (!Array.isArray(users)) {
    return <p className="no-users">Invalid users data.</p>;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">👤 User Dashboard</h2>

      {users.length === 0 ? (
        <p className="no-users">No users available.</p>
      ) : (
        users.map((user) => {
          const total = Array.isArray(user.tasks) ? user.tasks.length : 0;
          const completed = Array.isArray(user.tasks)
            ? user.tasks.filter((t) => t.completed).length
            : 0;
          const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

          return (
            <div key={user.id} className="user-card">
              <h3 className="user-name">{user.name}</h3>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: percentage === 100 ? 'green' : '#3498db',
                  }}
                />
              </div>
              <p className="progress-text">{completed}/{total} tasks completed ({percentage}%)</p>

              {total === 0 ? (
                <p className="no-tasks">No tasks assigned.</p>
              ) : (
                <ul className="task-list">
                  {user.tasks.map((task) => (
                    <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <div className="task-text">
                        <strong>{task.text}</strong>
                      </div>
                      <div className="task-meta">
                        <span className="priority" style={{ color: getPriorityColor(task.priority) }}>
                          {task.priority || 'None'}
                        </span>
                        <span className="deadline">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span className={`status ${task.completed ? 'done' : 'pending'}`}>
                          {task.completed ? '✓ Done' : '⏳ Pending'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default UserDashboard;
