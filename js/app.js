
function showDashboard() {
    document.getElementById("landing").classList.add("hidden");
    document.getElementById("doctorDashboard").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");

    updateActiveCount();
    renderDoctorDashboard();
    window.scrollTo(0, 0);
}

function showDoctorDashboard() {
    document.getElementById("landing").classList.add("hidden");
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("doctorDashboard").classList.remove("hidden");

    renderDoctorDashboard();
    window.scrollTo(0, 0);
}

function showLanding() {
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("doctorDashboard").classList.add("hidden");
    document.getElementById("landing").classList.remove("hidden");

    window.scrollTo(0, 0);
}

// DOCTOR PERMISSION MANAGEMENT

function updatePermission(doctor, newStatus) {
    const doctorNames = {
        sharma: "Dr. Sharma",
        verma: "Dr. Verma"
    };

    if (!doctorNames[doctor]) return;

    const row = document.querySelector(
        `.permission[data-doctor="${doctor}"]`
    );

    if (!row) return;

    const statusElement = row.querySelector(".status-label");
    if (!statusElement) return;

    const oldStatus = statusElement.textContent;

    if (oldStatus === newStatus) return;

    statusElement.textContent = newStatus;

    statusElement.className = "status-label " +
        (newStatus === "Approved" ? "approved" :
         newStatus === "Pending" ? "pending" :
         newStatus === "Revoked" ? "revoked" : "rejected");

    const actions = row.querySelector(".permission-actions");

    actions.querySelectorAll("button").forEach(button => button.remove());

    if (newStatus === "Pending") {
        addButton(actions, "Approve", "approve-btn", doctor, "Approved");
        addButton(actions, "Reject", "reject-btn", doctor, "Rejected");
    } else if (newStatus === "Approved") {
        addButton(actions, "Revoke", "revoke-btn", doctor, "Revoked");
    } else {
        addButton(actions, "Restore Access", "approve-btn", doctor, "Approved");
    }

    updateActiveCount();
    addActivity(doctorNames[doctor], oldStatus, newStatus);
    renderDoctorDashboard();
}

function addButton(container, label, className, doctor, status) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = className;

    button.addEventListener("click", function() {
        updatePermission(doctor, status);
    });

    container.appendChild(button);
}

function updateActiveCount() {
    const statuses = document.querySelectorAll(
        "#permissions .status-label"
    );

    let count = 0;

    statuses.forEach(status => {
        if (status.textContent === "Approved") {
            count++;
        }
    });

    document.getElementById("activeCount").textContent = count;
}

// PATIENT ACTIVITY LOG

function addActivity(person, oldStatus, newStatus) {
    const activity = document.getElementById("activity");

    const event = document.createElement("div");
    event.className = "event";

    const dot = document.createElement("span");
    dot.className = "event-dot " +
        (newStatus === "Approved" ? "green" : "red");

    const content = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = person + " — " + newStatus;

    const description = document.createElement("small");
    description.textContent =
        oldStatus + " → " + newStatus + " · " +
        new Date().toLocaleTimeString();

    content.appendChild(title);
    content.appendChild(description);

    event.appendChild(dot);
    event.appendChild(content);

    activity.prepend(event);

    const eventCount = document.getElementById("eventCount");
    eventCount.textContent = Number(eventCount.textContent) + 1;
}

// DOCTOR DASHBOARD

function doctorRespond(doctor, decision) {
    if (doctor !== "verma") return;

    updatePermission(doctor, decision);
}

function renderDoctorDashboard() {
    const row = document.querySelector(
        '.permission[data-doctor="verma"]'
    );

    if (!row) return;

    const currentStatus = row.querySelector(".status-label").textContent;

    const requestControls = document.getElementById(
        "rahulRequestControls"
    );

    const patientList = document.getElementById("authorizedPatients");

    const pendingCount = document.getElementById("doctorPendingCount");
    const patientCount = document.getElementById("doctorPatientCount");

    // Update request status
    requestControls.innerHTML = "";

    const status = document.createElement("span");
    status.className = "status-label " +
        (currentStatus === "Approved" ? "approved" :
         currentStatus === "Pending" ? "pending" :
         currentStatus === "Revoked" ? "revoked" : "rejected");

    status.textContent = currentStatus;
    requestControls.appendChild(status);

    // Show decision buttons only while request is pending
    if (currentStatus === "Pending") {
        addDoctorDecisionButton(
            requestControls, "Approve", "approve-btn", "Approved"
        );

        addDoctorDecisionButton(
            requestControls, "Reject", "reject-btn", "Rejected"
        );
    }

    pendingCount.textContent =
        currentStatus === "Pending" ? "1" : "0";

    // Show approved patients
    patientList.innerHTML = "";

    if (currentStatus === "Approved") {
        patientCount.textContent = "1";

        const patient = document.createElement("div");
        patient.className = "authorized-patient";

        const avatar = document.createElement("div");
        avatar.className = "patient-avatar";
        avatar.textContent = "R";

        const info = document.createElement("div");
        info.className = "authorized-patient-info";

        const name = document.createElement("strong");
        name.textContent = "Rahul";

        const details = document.createElement("small");
        details.textContent = "Patient ID: DEMO-001 · Access approved";

        info.appendChild(name);
        info.appendChild(details);

        const viewButton = document.createElement("button");
        viewButton.className = "view-patient-btn";
        viewButton.textContent = "View Records";
        viewButton.addEventListener("click", openDoctorRecord);

        patient.appendChild(avatar);
        patient.appendChild(info);
        patient.appendChild(viewButton);

        patientList.appendChild(patient);
    } else {
        patientCount.textContent = "0";

        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent =
            "No patients have granted access yet.";

        patientList.appendChild(empty);
    }
}

function addDoctorDecisionButton(container, label, className, decision) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = className;

    button.addEventListener("click", function() {
        doctorRespond("verma", decision);
    });

    container.appendChild(button);
}

// PATIENT MEDICAL RECORD VIEWER

const demoRecords = {
    blood: {
        title: "Blood Test Report",
        date: "20 October 2026",
        doctor: "Dr. Sharma",
        type: "Laboratory Report"
    },

    prescription: {
        title: "Prescription",
        date: "15 October 2026",
        doctor: "Dr. Verma",
        type: "Prescription"
    },

    checkup: {
        title: "Health Checkup",
        date: "10 October 2026",
        doctor: "Dr. Sharma",
        type: "Health Summary"
    }
};

function viewRecord(recordId) {
    const record = demoRecords[recordId];

    if (!record) return;

    document.getElementById("modalTitle").textContent = record.title;
    document.getElementById("modalDate").textContent = record.date;
    document.getElementById("modalDoctor").textContent = record.doctor;
    document.getElementById("modalType").textContent = record.type;

    document.getElementById("recordModal").classList.remove("hidden");
}

function closeRecord() {
    document.getElementById("recordModal").classList.add("hidden");
}

// DOCTOR RECORD VIEWER

function openDoctorRecord() {
    const row = document.querySelector(
        '.permission[data-doctor="verma"]'
    );

    const status = row.querySelector(".status-label").textContent;

    if (status !== "Approved") {
        alert("Patient access has not been approved.");
        return;
    }

    document.getElementById("doctorRecordModal").classList.remove("hidden");
}

function closeDoctorRecord() {
    document.getElementById("doctorRecordModal").classList.add("hidden");
}

// CLOSE POPUPS

document.addEventListener("click", function(event) {
    const patientModal = document.getElementById("recordModal");
    const doctorModal = document.getElementById("doctorRecordModal");

    if (event.target === patientModal) {
        closeRecord();
    }

    if (event.target === doctorModal) {
        closeDoctorRecord();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeRecord();
        closeDoctorRecord();
    }
});

// INITIALIZE

document.addEventListener("DOMContentLoaded", function() {
    updateActiveCount();
    renderDoctorDashboard();
});

console.log("MediLock Patient and Doctor Portals Loaded!");
