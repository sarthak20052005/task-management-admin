import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const AddTask = () => {
  const [task, setTask] = useState("");

  const saveTask = async () => {
    if (!task.trim()) return;
    await addDoc(collection(db, "tasks"), {
      text: task,
      completed: false,
      createdAt: new Date()
    });
    setTask(""); // Clear input
  };

  return (
    <div>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter your task"
      />
      <button onClick={saveTask}>Add Task</button>
    </div>
  );
};

export default AddTask;
