document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Cria lista de participantes sem bullets e com ícone de deletar
        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";
        details.participants.forEach(participant => {
          const li = document.createElement("li");
          li.className = "participant-item";
          li.style.display = "flex";
          li.style.alignItems = "center";
          li.style.gap = "8px";
          // Email
          const emailSpan = document.createElement("span");
          emailSpan.textContent = participant;
          // Ícone de deletar
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "delete-participant-btn";
          deleteBtn.title = "Remover participante";
          deleteBtn.innerHTML = "&#128465;"; // ícone de lixeira unicode
          deleteBtn.style.background = "none";
          deleteBtn.style.border = "none";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.color = "#c62828";
          deleteBtn.style.fontSize = "1.1em";
          deleteBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!confirm(`Remover ${participant} de ${name}?`)) return;
            try {
              const resp = await fetch(`/activities/${encodeURIComponent(name)}/participants/${encodeURIComponent(participant)}`, {
                method: "DELETE"
              });
              const result = await resp.json();
              if (resp.ok) {
                fetchActivities();
              } else {
                alert(result.detail || "Erro ao remover participante");
              }
            } catch (err) {
              alert("Erro ao remover participante");
            }
          });
          li.appendChild(emailSpan);
          li.appendChild(deleteBtn);
          participantsList.appendChild(li);
        });

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <strong>Participants:</strong>
          </div>
        `;
        activityCard.querySelector(".participants").appendChild(participantsList);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
