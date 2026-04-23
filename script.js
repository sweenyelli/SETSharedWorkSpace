const $ = (id) => document.getElementById(id);

let currentUser = null;
let editingPropertyId = null;
let editingWorkspaceId = null;

// =======================
// NAVBAR
// =======================
function updateNavbar() {
  const nav = document.getElementById("navBar");
  if (!nav) return;

  nav.innerHTML = `<a href="index.html">Home</a>`;

  if (currentUser) {
    if (currentUser.role === "owner") {
      nav.innerHTML += `<a href="owner.html">Dashboard</a>`;
    }

    nav.innerHTML += `
      <span style="margin-left:15px;">Hi, ${currentUser.name}</span>
      <button onclick="logout()" style="margin-left:10px; width:auto; padding:6px 10px;">
        Logout
      </button>
    `;
  } else {
    nav.innerHTML += `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}

// =======================
// REGISTER
// =======================
async function addUser() {
  console.log("🚀 addUser called");

  const newUser = {
    name: $("name").value,
    email: $("email").value,
    phone: $("phone").value,
    password: $("password").value,
    role: $("role").value
  };

  const res = await fetch("http://localhost:3000/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser)
  });

  const data = await res.json();

  if (data.success) {
    alert("User created!");
    window.location.href = "login.html";
  } else {
    alert("Error creating user");
  }
}

// =======================
// LOGIN (API-based)
// =======================
async function login() {
  const email = $("loginEmail").value;
  const password = $("loginPassword").value;
  const message = $("loginMessage");

  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    message.textContent = "Invalid login";
    return;
  }

  currentUser = data.user;

  window.location.href =
    currentUser.role === "owner" ? "owner.html" : "index.html";
}

// =======================
// SEARCH WORKSPACES
// =======================
async function searchWorkspaces() {
  const res = await fetch("http://localhost:3000/api/workspaces");
  const data = await res.json();

  if (!data.success) {
    alert("Failed to load data");
    return;
  }

  const results = document.getElementById("results");
  results.innerHTML = "";

  data.data.forEach(w => {
    let div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${w.type}</h3>
      <p>Seats: ${w.seats}</p>
      <p>Price: $${w.price}</p>
    `;

    // ✅ STEP 1 FIX: click → send ID to details page
    div.onclick = () => {
      window.location.href = `details.html?id=${w.id}`;
    };

    results.appendChild(div);
  });
}

// =======================
// OWNER DASHBOARD
// =======================
async function displayOwner() {
  const results = document.getElementById("results");
  if (!results) return;

  const res = await fetch("http://localhost:3000/api/workspaces");
  const data = await res.json();

  results.innerHTML = "";

  data.data.forEach(w => {
    let div = document.createElement("div");
    div.className = "workspace";

    div.innerHTML = `
      <h3>${w.type}</h3>
      <p>Seats: ${w.seats}</p>
      <p>Price: $${w.price}</p>
    `;

    results.appendChild(div);
  });
}

// =======================
// ADD PROPERTY (API)
// =======================
async function addProperty() {
  const res = await fetch("http://localhost:3000/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: $("address").value,
      neighborhood: $("neighborhood").value,
      sqft: $("sqft").value,
      parking: $("parking").checked,
      transport: $("transport").checked,
      owner: currentUser?.email
    })
  });

  const data = await res.json();

  if (data.success) {
    alert("Property added!");
  }
}

// =======================
// ADD WORKSPACE (API)
// =======================
async function addWorkspace() {
  const res = await fetch("http://localhost:3000/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      propertyId: $("propertySelect").value,
      type: $("type").value,
      seats: $("seats").value,
      smoking: $("smoking").checked,
      date: $("date").value,
      lease: $("lease").value,
      price: $("price").value
    })
  });

  const data = await res.json();

  if (data.success) {
    alert("Workspace added!");
  }
}

// =======================
// LOAD DETAILS (API FIX NEEDED LATER)
// =======================
async function loadDetails() {
  const container = document.getElementById("details");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = "<p>No workspace ID provided</p>";
    return;
  }

  const res = await fetch(`http://localhost:3000/api/workspaces/${id}`);
  const data = await res.json();

  if (!data.success) {
    container.innerHTML = "<p>Workspace not found</p>";
    return;
  }

  const w = data.data;

  container.innerHTML = `
    <h2>${w.type}</h2>

    <h3>Workspace Info</h3>
    <p><strong>Seats:</strong> ${w.seats}</p>
    <p><strong>Price:</strong> $${w.price}</p>
    <p><strong>Smoking:</strong> ${w.smoking ? "Yes" : "No"}</p>
    <p><strong>Available From:</strong> ${w.date}</p>
    <p><strong>Lease:</strong> ${w.lease}</p>
  `;
}

// =======================
// PROPERTY FORM HELPERS (UI ONLY)
// =======================
function resetPropertyForm() {
  editingPropertyId = null;
  propertyFormTitle.textContent = "Add Property";

  address.value = "";
  neighborhood.value = "";
  sqft.value = "";
  parking.checked = false;
  transport.checked = false;
}

// =======================
// WORKSPACE FORM HELPERS (UI ONLY)
// =======================
function resetWorkspaceForm() {
  editingWorkspaceId = null;
  workspaceFormTitle.textContent = "Add Workspace";

  type.value = "";
  seats.value = "";
  smoking.checked = false;
  date.value = "";
  price.value = "";
}

// =======================
// LOGOUT
// =======================
function logout() {
  currentUser = null;
  window.location.href = "index.html";
}

// =======================
// PAGE INIT
// =======================
window.onload = () => {
  updateNavbar();

  if (location.pathname.includes("index.html")) {
    searchWorkspaces();

    const btn = $("searchBtn");
    if (btn) btn.addEventListener("click", searchWorkspaces);
  }

  if (location.pathname.includes("owner.html")) {
    displayOwner();
  }
};