const teachers = [
  {
    name: "Mr. Anderson",
    subject: "Mathematics",
    schedule: ["Algebra 1", "Geometry", "Prep", "Algebra 2", "Calculus"]
  },
  {
    name: "Ms. Smith",
    subject: "English",
    schedule: ["English 9", "English 10", "Prep", "Literature", "Writing"]
  },
  {
    name: "Mrs. Johnson",
    subject: "Biology",
    schedule: ["Biology 1", "Anatomy", "Prep", "Biology 2", "Environmental Science"]
  }
];

function handleSearch() {
  const input = document.getElementById("searchBox").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (input.length === 0) return;

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(input));
  filtered.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t.name;
    li.onclick = () => displayTeacher(t);
    suggestions.appendChild(li);
  });
}

function displayTeacher(teacher) {
  document.getElementById("teacherName").textContent = teacher.name;
  document.getElementById("teacherSubject").textContent = `Subject: ${teacher.subject}`;

  const scheduleList = document.getElementById("scheduleList");
  scheduleList.innerHTML = "";
  teacher.schedule.forEach((period, index) => {
    const li = document.createElement("li");
    li.textContent = `Period ${index + 1}: ${period}`;
    scheduleList.appendChild(li);
  });

  document.getElementById("teacherInfo").classList.remove("hidden");
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("searchBox").value = teacher.name;
}
