import { useState } from "react";

function AddStudy({ refreshStudies }) {
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();

  const response = await fetch("http://localhost:5000/add-study", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subject, deadline }),
  });

  const data = await response.json();
  alert(data.message);

  refreshStudies();   // ⭐ ADD THIS LINE HERE
};

  return (
    <div>
      <h2>Add Study Task</h2>

      {/* ✅ HERE */}
      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <br /><br />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <br /><br />

        {/* ✅ IMPORTANT */}
        <button  type="submit">Add</button>

      </form>
    </div>
  );
}

export default AddStudy;