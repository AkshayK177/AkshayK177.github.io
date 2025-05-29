function handleSearch() {
  const input = document.getElementById("searchBox").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = teachers.filter(t =>
    t.name.toLowerCase().includes(input)
  );

  matches.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.name;
    li.onclick = () => showTeacherInfo(t);
    suggestions.appendChild(li);
  });
}

function showTeacherInfo(teacher) {
  document.getElementById("teacherName").textContent = teacher.name;
  document.getElementById("teacherSubject").textContent = "Department: " + teacher.department;
  document.getElementById("teacherEmail").textContent = "Email: " + teacher.email;

  const scheduleList = document.getElementById("scheduleList");
  scheduleList.innerHTML = "";

  if (teacher.schedule.length === 0) {
    scheduleList.innerHTML = "<li>No scheduled classes.</li>";
  } else {
    teacher.schedule.forEach(s => {
      const li = document.createElement("li");
      li.textContent = `Period ${s.period}: ${s.courseName} (${s.classLoc})`;
      scheduleList.appendChild(li);
    });
  }

  document.getElementById("teacherInfo").classList.remove("hidden");
  document.getElementById("suggestions").innerHTML = "";
}
