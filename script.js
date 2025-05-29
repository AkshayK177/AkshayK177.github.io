let teachers = [];

function handleSearch() {
  const input = document.getElementById("searchBox").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(input)
  );

  filtered.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.name;
    li.onclick = () => displayTeacher(t);
    suggestions.appendChild(li);
  });
}

function displayTeacher(teacher) {
  document.getElementById("teacherName").textContent = teacher.name;
  document.getElementById("teacherSubject").textContent = `Department: ${teacher.department}`;
  const scheduleList = document.getElementById("scheduleList");
  scheduleList.innerHTML = "";
  teacher.schedule.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `Course: ${s.courseName} (${s.classLoc})`;
    scheduleList.appendChild(li);
  });
  document.getElementById("teacherInfo").classList.remove("hidden");
  document.getElementById("suggestions").innerHTML = "";
}

window.onload = () => {
  fetch('teachers.json')
    .then(res => res.json())
    .then(data => {
      teachers = data;
      console.log("Loaded", teachers.length, "teachers.");
    });
};
