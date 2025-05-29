class HandleFetching {
  static #worker;
  static #index;
  static #mapping;

  static request(url, type){
    HandleFetching.worker.postMessage({id: HandleFetching.index, url: url, type: type});
    const promise = new Promise((resolve, reject)=>{
      HandleFetching.mapping.set(HandleFetching.index++, {resolve: resolve, reject: reject});
    });
    return promise;
  }

  static stop() {
    HandleFetching.worker.terminate();
  }

  static {
    const blob = new Blob([`
      const queue = [];
      let numFetched = 0;
      let timeout = null;
      onmessage = ({data: message}) => {
        queue.push(message);
        handleRequests();
      };

      function handleRequests(){
        if(queue.length === 0){return;}
        if(timeout === null){
          timeout = setTimeout(()=>{
            numFetched = 0;
            timeout = null;
            handleRequests();
          }, 10002);
        }
        while(numFetched < 30 && queue.length > 0){
          const result = queue.shift();
          fetch("https://awsapieast1-prod21.schoolwires.com/REST/api/v4/FlexData/GetFlexDataFiltered/".concat(result.url), {
            headers: {
              "Authorization": "Bearer eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIn0.TyUf0AE25v-u3D7zrzMkzBuTecwErBXFDRGDmdNvO7f_1GKL7AvAhIHjwHzJ2eSEyJ6N-Sls2UHfXqDLq0Ynkeun9GNv55fO.-If8lE4dHsZkZ7YJIx2GDA.heUaSP7VfCb7AaqApmKFq81QJMgIcOVtfRWaFemMYeM3A9l6Jqy2-H797SaYDcN5HUpH6k4JLa7Xh8rzRHmPt3-JXKcvQzB-KXSTptrXJ6HLpPoHPPKuTJurOqvDKvJJLQfnF3dGKfU-YAI9Y3Po3CPzYhnLaIdTA-COASv9Ltl-JurDP-SVaGChlBBd2K_0tIAvFdsVwPrQFNyOl5x-TreauNfQbVxNUoDrgG6yEBDPhEki71DRWQmcC92QOzruV9Jh1WNw7JhgfnutgkYZqw.pibE6z88AQg7NPR7kxob5yxAZYKpDBuBaf712zskn58"
            }
          }).then((response)=>{
            return response[result.type]();
          }).then((response)=>{
            postMessage({id: result.id, response: response});
          }).catch((err)=>{
            postMessage({id: result.id, error: err.message});
          });
          numFetched++;
        }
      }
    `], {type: "text/javascript"});
    HandleFetching.worker = new Worker(URL.createObjectURL(blob));
    HandleFetching.mapping = new Map();
    HandleFetching.index = 0;

    HandleFetching.worker.onmessage = ({data: {id, response, error}}) =>{
      const {resolve, reject} = HandleFetching.mapping.get(id);
      HandleFetching.mapping.delete(id);
      if(error){
        reject(error);
        return;
      }
      resolve(response);
    }
  }
}

let teachers = [];

async function fetchTeachers() {
  console.log("Fetching teacher data...");
  const raw = await HandleFetching.request("17036", "json");
  const arr = raw.map(i => ({
    isDepartmentChair: i.cd_DepartmentChair.toLowerCase().trim() === "true",
    name: `${i.cd_EmployeeLastName}, ${i.cd_EmployeeFirstName}`,
    email: i.cd_EmployeeEmail,
    department: i.cd_EmployeeDepartment,
  }));

  const promises = arr.map(async teacher => {
    try {
      const schedule = await HandleFetching.request(`18947?EmployeeEmail=${encodeURIComponent(teacher.email)}`, "json");
      teacher.schedule = schedule.map(j => ({
        courseId: j.cd_Course,
        courseName: j.cd_CourseName,
        period: parseInt(j.cd_Period),
        classLoc: j.cd_Room,
      }));
    } catch (err) {
      teacher.schedule = [];
      console.error(`Error fetching schedule for ${teacher.name}: ${err.message}`);
    }
  });

  await Promise.allSettled(promises);
  teachers = arr;
  console.log("Loaded", teachers.length, "teachers.");
}

// UI Logic

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
  document.getElementById("teacherSubject").textContent = `Department: ${teacher.department}`;

  const scheduleList = document.getElementById("scheduleList");
  scheduleList.innerHTML = "";

  if (!teacher.schedule || teacher.schedule.length === 0) {
    scheduleList.innerHTML = "<li>No schedule available</li>";
  } else {
    teacher.schedule.sort((a, b) => a.period - b.period).forEach((p) => {
      const li = document.createElement("li");
      li.textContent = `Period ${p.period}: ${p.courseName} (${p.classLoc})`;
      scheduleList.appendChild(li);
    });
  }

  document.getElementById("teacherInfo").classList.remove("hidden");
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("searchBox").value = teacher.name;
}

// Start fetching when page loads
window.onload = () => {
  fetchTeachers();
};
