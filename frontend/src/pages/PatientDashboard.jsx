// src/pages/PatientDashboard.jsx
  import React, { useState, useEffect } from "react";
  import { Line } from "react-chartjs-2";
  import Calendar from "react-calendar";
  import "react-calendar/dist/Calendar.css";
  import "../styles/PatientDashboard.css"; // keep your styles
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Time slots 
  const TIME_SLOTS = {
    'morning': '8AM - 12PM',
    'afternoon': '12PM - 5PM',
    'evening': '5PM - 8PM'
  };

  const PatientDashboard = ({ user, setUser }) => {
    const [practitioners, setPractitioners] = useState([]);
    const [selectedPractitioner, setSelectedPractitioner] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [patientSchedules, setPatientSchedules] = useState([]);
    const [bookingDate, setBookingDate] = useState(""); // date for custom booking
    const [bookingTimeSlot, setBookingTimeSlot] = useState(""); // time slot for custom booking
    const [bookingMsg, setBookingMsg] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Therapy predictor state
    const [predictorData, setPredictorData] = useState({
      age: '',
      gender: '',
      disease: '',
      lifestyle: '',
      stressLevel: '',
      severityScore: ''
    });
    const [prediction, setPrediction] = useState(null);
    const [predictLoading, setPredictLoading] = useState(false);
    const [predictError, setPredictError] = useState('');
    const [expanded, setExpanded] = useState(false);
    
    // Reschedule modal state
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");
    const [rescheduleReason, setRescheduleReason] = useState("");

    // Helper to build fetch options (supports both token and session)
    const buildFetchOptions = (opts = {}) => {
      const headers = opts.headers ?? {};
      if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";

      // Try token first, then fall back to session
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      return {
        credentials: "include", // keep cookie/session compatibility
        ...opts,
        headers,
      };
    };

    useEffect(() => {
      loadAll();
    }, []);

    const loadAll = async () => {
      setLoading(true);
      try {
        // fetch practitioners and patient schedules in parallel
        const [prRes, schedRes] = await Promise.all([
          fetch(`${API}/api/practitioners`, buildFetchOptions()),
          fetch(`${API}/api/schedules/patient`, buildFetchOptions()),
        ]);

        // safe parsing
        const prData = prRes.ok ? await safeJson(prRes) : [];
        const schedData = schedRes.ok ? await safeJson(schedRes) : [];

        setPractitioners(prData || []);
        setPatientSchedules(schedData || []);
        // if a practitioner already selected, refresh available slots
        if (selectedPractitioner) fetchAvailableSlots(selectedPractitioner.id);
      } catch (err) {
        console.error("loadAll error:", err);
      } finally {
        setLoading(false);
      }
    };

    // safe JSON parser that logs non-JSON responses
    const safeJson = async (res) => {
      try {
        return await res.json();
      } catch (e) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }
    };

    const fetchAvailableSlots = async (practitionerId) => {
      try {
        setAvailableSlots([]);
        const url = new URL(`${API}/api/schedules/available`);
        if (practitionerId) url.searchParams.append("practitionerId", practitionerId);

        const res = await fetch(url.toString(), buildFetchOptions());
        const data = res.ok ? await safeJson(res) : [];
        setAvailableSlots(data || []);
      } catch (err) {
        console.error("fetchAvailableSlots error:", err);
      }
    };

    const handlePractitionerSelect = (e) => {
      const id = e.target.value;
      const pr = practitioners.find((p) => String(p.id) === String(id));
      setSelectedPractitioner(pr || null);
      if (pr) fetchAvailableSlots(pr.id);
    };

    const formatSlotDisplay = (schedule) => {
      const date = new Date(schedule.date).toLocaleDateString();
      const timeSlotLabel = TIME_SLOTS[schedule.timeSlot] || schedule.timeSlot;
      
      // If there's a specific interval booked, show that instead of the full slot
      if (schedule.notes && schedule.notes.includes("Booked for interval:")) {
        const intervalMatch = schedule.notes.match(/Booked for interval: (.+)/);
        if (intervalMatch) {
          return `${date} - ${intervalMatch[1]}`;
        }
      }
      
      return `${date} - ${timeSlotLabel}`;
    };

    // Book a slot by scheduleId (preferred flow)
    const handleBookSlot = async (scheduleId) => {
      try {
        const res = await fetch(`${API}/api/schedules/book`, buildFetchOptions({
          method: "POST",
          body: JSON.stringify({ scheduleId }),
        }));
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Booking failed");
        setBookingMsg("Slot booked successfully!");
        await refreshAfterChange();
      } catch (err) {
        console.error("book slot error:", err);
        setBookingMsg(`Error: ${err.message}`);
      } finally {
        setTimeout(() => setBookingMsg(""), 3000);
      }
    };

    // Book custom date/time slot
    const handleBookCustom = async (e) => {
      e.preventDefault();
      if (!selectedPractitioner) {
        setBookingMsg("Please select a practitioner first");
        setTimeout(() => setBookingMsg(""), 3000);
        return;
      }
      if (!bookingDate || !bookingTimeSlot) {
        setBookingMsg("Please select both date and time slot");
        setTimeout(() => setBookingMsg(""), 3000);
        return;
      }

      try {
        const res = await fetch(`${API}/api/schedules/book-custom`, buildFetchOptions({
          method: "POST",
          body: JSON.stringify({ 
            practitionerId: selectedPractitioner.id, 
            date: bookingDate,
            timeSlot: bookingTimeSlot
          }),
        }));
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Booking failed");
        setBookingMsg("Custom slot booked successfully!");
        setBookingDate("");
        setBookingTimeSlot("");
        await refreshAfterChange();
      } catch (err) {
        console.error("book custom error:", err);
        setBookingMsg(`Error: ${err.message}`);
      } finally {
        setTimeout(() => setBookingMsg(""), 3000);
      }
    };

    // Refresh patient schedules and available slots
    const refreshAfterChange = async () => {
      try {
        const schedRes = await fetch(`${API}/api/schedules/patient`, buildFetchOptions());
        if (schedRes.ok) {
          const schedData = await safeJson(schedRes);
          setPatientSchedules(schedData || []);
        }
        // also refresh available slots for current practitioner
        if (selectedPractitioner) await fetchAvailableSlots(selectedPractitioner.id);
      } catch (err) {
        console.error("refreshAfterChange error:", err);
      }
    };

    // Open reschedule modal
    const openRescheduleModal = (appointment) => {
      setRescheduleAppointment(appointment);
      setRescheduleDate("");
      setRescheduleTimeSlot("");
      setRescheduleReason("");
      setShowRescheduleModal(true);
    };

    // Close reschedule modal
    const closeRescheduleModal = () => {
      setShowRescheduleModal(false);
      setRescheduleAppointment(null);
    };

    // Submit reschedule request
    const handleRescheduleSubmit = async (e) => {
      e.preventDefault();
      if (!rescheduleDate || !rescheduleTimeSlot) {
        setBookingMsg("Please select both new date and time slot");
        setTimeout(() => setBookingMsg(""), 3000);
        return;
      }

      try {
        const res = await fetch(`${API}/api/schedules/reschedule`, buildFetchOptions({
          method: "POST",
          body: JSON.stringify({
            scheduleId: rescheduleAppointment.id,
            newDate: rescheduleDate,
            newTimeSlot: rescheduleTimeSlot,
            reason: rescheduleReason
          }),
        }));
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Reschedule request failed");
        
        setBookingMsg("Reschedule request sent successfully!");
        closeRescheduleModal();
        await refreshAfterChange();
      } catch (err) {
        console.error("reschedule request error:", err);
        setBookingMsg(`Error: ${err.message}`);
      } finally {
        setTimeout(() => setBookingMsg(""), 3000);
      }
    };

    // Cancel appointment
    const handleCancelAppointment = async (scheduleId) => {
      if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

      try {
        const res = await fetch(`${API}/api/schedules/cancel`, buildFetchOptions({
          method: "POST",
          body: JSON.stringify({ scheduleId }),
        }));
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || "Cancel failed");
        setBookingMsg("Appointment cancelled successfully");
        await refreshAfterChange();
      } catch (err) {
        console.error("cancel appointment error:", err);
        setBookingMsg(`Error: ${err.message}`);
      } finally {
        setTimeout(() => setBookingMsg(""), 3000);
      }
    };

    // Therapy predictor handlers
    const handlePredictorChange = (e) => {
      e.stopPropagation(); // Prevent card from collapsing
      setPredictorData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    };

    const handlePredict = async (e) => {
      e.preventDefault();
      setPredictLoading(true);
      setPredictError('');
      
      try {
        const res = await fetch(`${API}/api/ml/predict`, buildFetchOptions({
          method: 'POST',
          body: JSON.stringify(predictorData),
        }));
        
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.message || 'Prediction failed');
        
        setPrediction(data);
      } catch (err) {
        console.error('Prediction error:', err);
        setPredictError(err.message || 'Failed to get prediction');
      } finally {
        setPredictLoading(false);
      }
    };

    // Calendar events for patient upcoming booked appointments
    const upcomingDates = patientSchedules.filter(s => s.status === "booked").map(s => new Date(s.date));

    // Calculate stats for the chart
    const calculateStats = () => {
      const now = new Date();
      const weeks = {
        'Week 1': 0,
        'Week 2': 0,
        'Week 3': 0,
        'Week 4': 0
      };
      
      patientSchedules.forEach(schedule => {
        if (schedule.status === "completed") {
          const scheduleDate = new Date(schedule.date);
          const daysDiff = Math.floor((now - scheduleDate) / (1000 * 60 * 60 * 24));
          const weekNum = Math.floor(daysDiff / 7);
          
          if (weekNum < 4) {
            const weekLabel = `Week ${4-weekNum}`;
            weeks[weekLabel]++;
          }
        }
      });
      
      return weeks;
    };

    const completed = patientSchedules.filter((s) => s.status === "completed").length;
    const upcoming = patientSchedules.filter((s) => s.status === "booked").length;
    const weeklyStats = calculateStats();
    
    const chartData = {
      labels: Object.keys(weeklyStats),
      datasets: [{
        label: "Completed Sessions", 
        data: Object.values(weeklyStats), 
        borderColor: "#50b89b", 
        backgroundColor: "rgba(80,184,155,0.2)", 
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#50b89b",
      }]
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
      <main className="dashboard-container">
        <header className="dashboard-header">
          <div className="welcome-section">
            <span className="welcome-text">Welcome</span>
            <h1 className="user-name">{user?.name || user?.username || "Patient"}</h1>
            <p className="user-email">{user?.email}</p>
          </div>

          <button
            className="login-btn"
            style={{ maxWidth: 120 }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </header>

        <section className="top-cards-section">
          <div className="card card-session">
            <div className="card-content">
              <h3>Upcoming Therapy Sessions</h3>
              <p>{upcoming} scheduled</p>
            </div>
          </div>

          <div className="card card-progress">
            <div className="card-content">
              <h3>Progress</h3>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(completed/(completed+upcoming || 1))*100}%` }} 
                />
              </div>
              <p>{completed} complete</p>
            </div>
          </div>

          <div 
            className={`card card-therapy-predictor ${expanded ? 'expanded' : ''}`} 
            onClick={() => setExpanded(!expanded)}
          >
            <div className="card-content">
              <div className="card-header">
                <h3>Therapy Recommendation</h3>
                <span className="expand-icon">▼</span>
              </div>
              {!expanded && (
                <div className="preview-content">
                  {prediction ? (
                    <p>Recommended: {prediction.recommendedTherapy}</p>
                  ) : (
                    <p>Click to get personalized therapy recommendations</p>
                  )}
                </div>
              )}
              {expanded && (prediction ? (
                <div className="prediction-result" onClick={(e) => e.stopPropagation()}>
                  <p className="recommended-therapy">{prediction.recommendedTherapy}</p>
                  {prediction.description && (
                    <p className="therapy-description">{prediction.description}</p>
                  )}
                  <button 
                    className="btn-reset"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrediction(null);
                    }}
                  >
                    Get Another Recommendation
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePredict(e);
                  }} 
                  className="predictor-form"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={predictorData.age}
                      onChange={handlePredictorChange}
                      required
                      min="18"
                      max="100"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={predictorData.gender}
                      onChange={handlePredictorChange}
                      required
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Primary Health Concern</label>
                    <select
                      name="disease"
                      value={predictorData.disease}
                      onChange={handlePredictorChange}
                      required
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select health condition</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Digestive Issues">Digestive Issues</option>
                      <option value="Insomnia">Insomnia</option>
                      <option value="Back Pain">Back Pain</option>
                      <option value="Stress">Stress</option>
                      <option value="Migraine">Migraine</option>
                      <option value="Anxiety">Anxiety</option>
                      <option value="Joint Pain">Joint Pain</option>
                      <option value="Obesity">Obesity</option>
                      <option value="Skin Disorders">Skin Disorders</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lifestyle</label>
                    <select
                      name="lifestyle"
                      value={predictorData.lifestyle}
                      onChange={handlePredictorChange}
                      required
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select lifestyle</option>
                      <option value="Active">Active</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Sedentary">Sedentary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stress Level</label>
                    <select
                      name="stressLevel"
                      value={predictorData.stressLevel}
                      onChange={handlePredictorChange}
                      required
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Select stress level</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Severity Score (1-10)</label>
                    <input
                      type="number"
                      name="severityScore"
                      value={predictorData.severityScore}
                      onChange={handlePredictorChange}
                      required
                      min="1"
                      max="10"
                      placeholder="How severe are your symptoms? (1=mild, 10=severe)"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn-predict"
                    disabled={predictLoading}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {predictLoading ? 'Getting Recommendation...' : 'Get Recommendation'}
                  </button>
                  {predictError && <p className="error-message">{predictError}</p>}
                </form>
              ))}
            </div>
          </div>
        </section>

        <section className="main-content">
          <div className="left-column">
            <div className="card card-quick-stats">
              <h3>Quick Stats</h3>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  plugins: { 
                    legend: { display: false },
                    title: {
                      display: true,
                      text: 'Completed Sessions by Week'
                    }
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { 
                      beginAtZero: true,
                      ticks: { stepSize: 1 }
                    }
                  }
                }} 
              />
            </div>

            <div className="card card-book-slot">
              <h3>Book a Therapy Session</h3>

              <label>Choose Practitioner</label>
              <select
                value={selectedPractitioner?.id || ""}
                onChange={handlePractitionerSelect}
              >
                <option value="">-- Select practitioner --</option>
                {practitioners.map((p) => {
                  const displayName = p.name || p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.username;
                  return (
                    <option key={p.id} value={p.id}>
                      {displayName} {p.specialization ? `(${p.specialization})` : ""}
                    </option>
                  );
                })}
              </select>

              <div className="available-slots-section">
                <h4>Available Slots</h4>
                {availableSlots.length === 0 && <p className="slot-info">No slots available</p>}
                <ul className="slot-list">
                  {availableSlots.map(slot => (
                    <li key={slot.id} className="slot-item">
                      <span>{formatSlotDisplay(slot)}</span>
                      <button className="btn-book" onClick={() => handleBookSlot(slot.id)}>Book</button>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="section-divider" />

              <form onSubmit={handleBookCustom} className="custom-booking-form">
                <label>Or create custom appointment</label>
                <input 
                  type="date" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
                <select
                  value={bookingTimeSlot}
                  onChange={(e) => setBookingTimeSlot(e.target.value)}
                  required
                >
                  <option value="">-- Select Time Slot --</option>
                  {Object.entries(TIME_SLOTS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-book">Book Custom Slot</button>
              </form>

              {bookingMsg && <div className="success-message">{bookingMsg}</div>}
            </div>
          </div>

          <div className="right-column">
            <div className="card card-calendar">
              <h3>Your Upcoming Sessions</h3>
              <Calendar 
                tileContent={({ date }) => {
                  const match = patientSchedules.find(s => 
                    new Date(s.date).toDateString() === date.toDateString() && 
                    s.status === "booked"
                  );
                  if (match) {
                    return (
                      <div className="calendar-badge">
                        {match.practitioner?.name || match.practitioner?.username || "Practitioner"}
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              
              <div className="appointments-list-section">
                <h4>My Appointments</h4>
                {patientSchedules.length === 0 ? (
                  <p className="slot-info">No appointments</p>
                ) : (
                  patientSchedules.map(s => (
                    <div key={s.id} className="appointment-item">
                      <p>
                        {formatSlotDisplay(s)} — {s.practitioner?.name || s.practitioner?.username || "Practitioner"} 
                        <span className={`status status-${s.status}`}>({s.status})</span>
                      </p>
                      {s.status === "booked" && (
                        <div className="appointment-actions">
                          <button 
                            onClick={() => openRescheduleModal(s)}
                            className="btn-reschedule"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancelAppointment(s.id)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {s.status === "reschedule_requested" && (
                        <div className="reschedule-info">
                          <p><small>Reschedule requested for: {s.rescheduleDate ? new Date(s.rescheduleDate).toLocaleDateString() : 'N/A'} - {TIME_SLOTS[s.rescheduleTimeSlot] || s.rescheduleTimeSlot}</small></p>
                          {s.reason && <p><small>Reason: {s.reason}</small></p>}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Reschedule Appointment</h3>
                <button className="modal-close" onClick={closeRescheduleModal}>×</button>
              </div>
              <form onSubmit={handleRescheduleSubmit}>
                <div className="form-group">
                  <label>Current Appointment:</label>
                  <p>{rescheduleAppointment ? formatSlotDisplay(rescheduleAppointment) : 'N/A'}</p>
                </div>
                
                <div className="form-group">
                  <label>New Date:</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>New Time Slot:</label>
                  <select
                    value={rescheduleTimeSlot}
                    onChange={(e) => setRescheduleTimeSlot(e.target.value)}
                    required
                  >
                    <option value="">-- Select Time Slot --</option>
                    {Object.entries(TIME_SLOTS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Reason (optional):</label>
                  <textarea
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Please provide a reason for rescheduling..."
                    rows="3"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={closeRescheduleModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    );
  };

  export default PatientDashboard;