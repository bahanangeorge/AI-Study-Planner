import { useState } from "react";

function AddTask() {
  const [subject, setSubject] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(subject);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Enter subject"
      />
      <button>Add</button>
    </form>
  );
}

export default AddTask;