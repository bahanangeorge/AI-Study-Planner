import { useEffect, useState } from "react";
import AddStudy from "./components/AddStudy";
import ReactMarkdown from "react-markdown";
import Navbar from "./components/Navbar";

function App() {
  // ================= STATES =================
  const [studies, setStudies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedDeadline, setEditedDeadline] = useState("");

  const [aiPlan, setAiPlan] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // ================= FETCH TASKS =================
  const fetchStudies = () => {
    fetch("http://localhost:5000/studies")
      .then((res) => res.json())
      .then((data) => setStudies(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  // ================= DELETE =================
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/studies/${id}`, {
      method: "DELETE",
    });

    setStudies(studies.filter((study) => study._id !== id));
  };

  // ================= EDIT =================
  const startEdit = (study) => {
    setEditingId(study._id);
    setEditedSubject(study.subject);
    setEditedDeadline(study.deadline);
  };

  const saveEdit = async (id) => {
    await fetch(`http://localhost:5000/studies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: editedSubject,
        deadline: editedDeadline,
      }),
    });

    setEditingId(null);
    fetchStudies();
  };

  // ================= AI GENERATION =================
const generateAIPlan = async () => {
  try {
    setLoadingAI(true);

    const res = await fetch("http://localhost:5000/generate-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks: studies }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "AI failed");
    }

    setAiPlan(data.plan || "No plan generated.");
  } catch (err) {
    console.error(err);
    alert("AI generation failed");
    setAiPlan("");
  } finally {
    setLoadingAI(false);
  }
};

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* ===== AI LOADING OVERLAY ===== */}
      {loadingAI && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">
              Generating Smart Study Plan...
            </p>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTAINER ===== */}
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-6">

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
          AI Study Planner
        </h1>

        {/* ADD TASK FORM */}
        <AddStudy refreshStudies={fetchStudies} />

        {/* TASK HEADING */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Saved Tasks
        </h2>

        {/* AI BUTTON */}
        <button
          onClick={generateAIPlan}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mb-4"
        >
          Generate AI Study Plan
        </button>

        {/* ===== AI RESULT ===== */}
        {aiPlan && (
  <div className="bg-purple-50 border rounded-lg p-4 mt-4">
    <h3 className="text-xl font-semibold mb-2">
      AI Study Plan
    </h3>

    <div className="prose max-w-none">
      <ReactMarkdown>
        {String(aiPlan || "")}
      </ReactMarkdown>
    </div>
  </div>
)}
        {/* ===== TASK LIST ===== */}
        {studies.map((study) => (
          <div
            key={study._id}
            className="bg-gray-50 border rounded-lg p-4 mb-4 shadow-sm"
          >
            {editingId === study._id ? (
              <>
                <input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                />

                <input
                  type="date"
                  value={editedDeadline}
                  onChange={(e) => setEditedDeadline(e.target.value)}
                  className="border p-2 rounded w-full mb-2"
                />

                <button
                  onClick={() => saveEdit(study._id)}
                  className="bg-green-500 text-white px-4 py-1 rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">
                  {study.subject}
                </p>

                <p className="text-gray-500">
                  Deadline: {study.deadline}
                </p>

                <button
                  onClick={() => startEdit(study)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded mr-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteTask(study._id)}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}

export default App;