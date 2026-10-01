import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Mentor.css";

function MentorInterns() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected intern
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Task heading
  const [taskHeading, setTaskHeading] = useState("");

  // Dynamic sub topics
  const [subTopics, setSubTopics] = useState([""]);

  // Deadline
  const [taskDeadline, setTaskDeadline] = useState("");

  const [assigning, setAssigning] = useState(false);

  // ============================================================
  // LOAD INTERNS
  // ============================================================

  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      const response = await api.get(
        "/mentor/mentors_interns/"
      );

      setInterns(
        response.data.interns || response.data || []
      );
    } catch (error) {
      console.error(
        "Failed to load interns:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // OPEN TASK MODAL
  // ============================================================

  const handleAssignTask = (intern) => {
    setSelectedIntern(intern);

    setTaskHeading("");
    setSubTopics([""]);
    setTaskDeadline("");
  };

  // ============================================================
  // CLOSE TASK MODAL
  // ============================================================

  const closeTaskModal = () => {
    if (assigning) return;

    setSelectedIntern(null);
    setTaskHeading("");
    setSubTopics([""]);
    setTaskDeadline("");
  };

  // ============================================================
  // ADD NEW SUB TOPIC
  // ============================================================

  const addSubTopic = () => {
    setSubTopics([
      ...subTopics,
      ""
    ]);
  };

  // ============================================================
  // UPDATE SUB TOPIC
  // ============================================================

  const updateSubTopic = (index, value) => {
    const updatedTopics = [...subTopics];

    updatedTopics[index] = value;

    setSubTopics(updatedTopics);
  };

  // ============================================================
  // REMOVE SUB TOPIC
  // ============================================================

  const removeSubTopic = (index) => {
    const updatedTopics = subTopics.filter(
      (_, i) => i !== index
    );

    setSubTopics(
      updatedTopics.length > 0
        ? updatedTopics
        : [""]
    );
  };

  // ============================================================
  // SUBMIT TASK
  // ============================================================

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    // Validate heading
    if (!taskHeading.trim()) {
      alert("Please enter task heading.");
      return;
    }

    // Remove empty sub topics
    const validSubTopics = subTopics
      .map((topic) => topic.trim())
      .filter((topic) => topic !== "");

    if (validSubTopics.length === 0) {
      alert("Please add at least one sub topic.");
      return;
    }

    if (!selectedIntern) {
      alert("Please select an intern.");
      return;
    }

    try {
      setAssigning(true);

      const taskData = {
        intern_id: selectedIntern.id,

        heading: taskHeading.trim(),

        sub_topics: validSubTopics,

        deadline: taskDeadline || null,
      };

      console.log(
        "Sending task:",
        taskData
      );

      const response = await api.post(
        "/mentor/assign_task/",
        taskData
      );

      console.log(
        "Task assigned:",
        response.data
      );

      alert("Task assigned successfully!");

      closeTaskModal();

    } catch (error) {
      console.error(
        "Failed to assign task:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        error.response?.data?.error ||
        "Failed to assign task."
      );

    } finally {
      setAssigning(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="page-loading">
        Loading interns...
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="mentor-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mentor-page-header">

        <div>

          <p className="mentor-label">
            MENTOR
          </p>

          <h1>
            My Interns
          </h1>

          <p>
            Assign tasks to your assigned interns.
          </p>

        </div>

      </div>

      {/* ======================================================
          INTERN CARDS
      ====================================================== */}

      {interns.length === 0 ? (

        <div className="empty-state">
          No interns assigned to you.
        </div>

      ) : (

        <div className="intern-grid">

          {interns.map((intern) => (

            <div
              className="intern-card"
              key={intern.id}
            >

              <div className="intern-card-top">

                <div className="intern-avatar">
                  {(intern.username || "I")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="intern-main-info">

                  <h3>
                    {intern.username}
                  </h3>

                  <p>
                    {intern.email || "No email"}
                  </p>

                  <span className="active-badge">
                    Active
                  </span>

                </div>

              </div>

              {/* ASSIGN TASK */}

              <button
                className="view-details-btn"
                onClick={() =>
                  handleAssignTask(intern)
                }
              >
                Assign Task
              </button>

            </div>

          ))}

        </div>

      )}

      {/* ======================================================
          TASK ASSIGNMENT MODAL
      ====================================================== */}

      {selectedIntern && (

        <div
          className="mentor-modal-overlay"
          onClick={closeTaskModal}
        >

          <div
            className="mentor-modal task-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="modal-header">

              <div>

                <p className="mentor-label">
                  ASSIGN TASK
                </p>

                <h2>
                  {selectedIntern.username}
                </h2>

                <p>
                  Create a task with multiple
                  sub topics.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeTaskModal}
              >
                ×
              </button>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleTaskSubmit}
              className="task-assignment-form"
            >

              {/* =================================================
                  TASK HEADING
              ================================================= */}

              <div className="form-group">

                <label>
                  Task Heading
                </label>

                <input
                  type="text"
                  value={taskHeading}
                  onChange={(e) =>
                    setTaskHeading(e.target.value)
                  }
                  placeholder="Example: Build Attendance Module"
                  disabled={assigning}
                />

              </div>

              {/* =================================================
                  SUB TOPICS
              ================================================= */}

              <div className="form-group">

                <div className="subtopic-header">

                  <label>
                    Sub Topics
                  </label>

                  <span>
                    {subTopics.length} topic
                    {subTopics.length !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>

                <div className="subtopics-container">

                  {subTopics.map(
                    (topic, index) => (

                      <div
                        className="subtopic-row"
                        key={index}
                      >

                        <div className="subtopic-number">
                          {index + 1}
                        </div>

                        <input
                          type="text"
                          value={topic}
                          onChange={(e) =>
                            updateSubTopic(
                              index,
                              e.target.value
                            )
                          }
                          placeholder={`Sub topic ${index + 1}`}
                          disabled={assigning}
                        />

                        {/* REMOVE */}

                        {subTopics.length > 1 && (

                          <button
                            type="button"
                            className="remove-subtopic-btn"
                            onClick={() =>
                              removeSubTopic(index)
                            }
                            disabled={assigning}
                          >
                            ×
                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>

                {/* =================================================
                    ADD SUB TOPIC BUTTON
                ================================================= */}

                <button
                  type="button"
                  className="add-subtopic-btn"
                  onClick={addSubTopic}
                  disabled={assigning}
                >
                  <span>
                    +
                  </span>

                  Add Sub Topic

                </button>

              </div>

              {/* =================================================
                  DEADLINE
              ================================================= */}

              <div className="form-group">

                <label>
                  Deadline
                </label>

                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) =>
                    setTaskDeadline(
                      e.target.value
                    )
                  }
                  disabled={assigning}
                />

              </div>

              {/* =================================================
                  PREVIEW
              ================================================= */}

              <div className="task-preview">

                <p>
                  TASK PREVIEW
                </p>

                <h3>
                  {taskHeading ||
                    "Your task heading"}
                </h3>

                <ol>

                  {subTopics
                    .filter(
                      (topic) =>
                        topic.trim() !== ""
                    )
                    .map(
                      (topic, index) => (
                        <li key={index}>
                          {topic}
                        </li>
                      )
                    )}

                </ol>

              </div>

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="task-modal-actions">

                <button
                  type="button"
                  className="cancel-task-btn"
                  onClick={closeTaskModal}
                  disabled={assigning}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="assign-task-btn"
                  disabled={assigning}
                >
                  {assigning
                    ? "Assigning..."
                    : "Assign Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default MentorInterns;
