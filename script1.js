const API = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://irrigation-backend-2m4h.onrender.com";
const token = sessionStorage.getItem("token");

window.onload = async function(){
  const verified = await verifyUser();
  if(!verified) return;
  loadStatus();
  loadAlarmHistory();
  setInterval(loadStatus,3000);
  setInterval(loadAlarmHistory,3000);
};

async function verifyUser() {
  if (!token) {
    window.location.replace("indexLogin.html");
    return false;
  }
  try {
    const response = await fetch(API + "/verify", {
      headers: { Authorization: token }
    });
    const data = await response.json();
    if (!data.valid) {
      sessionStorage.removeItem("token");
      window.location.replace("indexLogin.html");
      return false;
    }
    return true;
  } catch (err) {
    console.error("Verify error:", err);
    return false;
  }
}

const socket = new WebSocket(API);
socket.onmessage = function(event){
  const data = JSON.parse(event.data);
  console.log("Live update:", data);
  updateDashboard(data.status);
};

async function loadStatus(){
  try {
    const response = await fetch(API + "/status", {
      headers: { Authorization: token }
    });
    if(!response.ok) return;
    const data = await response.json();
    updateDashboard(data);
  } catch(err){
    console.error("Status error:", err);
  }
}

async function loadAlarmHistory(){
  try{
    const response = await fetch(API + "/alarm-history", {
      headers:{ Authorization: token }
    });
    if(!response.ok) return;
    const data = await response.json();
    const list = document.getElementById("alarmHistoryList");
    list.innerHTML = "";
    if(data.length === 0){
      list.textContent = "No alarms recorded";
      return;
    }
    data.slice(0,20).forEach(a => {
      const row = document.createElement("div");
      row.className = "alarmHistoryRow";
      const time = new Date(alarm.timestamp).toLocaleString();
      row.innerHTML = `<i class="fa-solid fa-bell bell"></i>
         ${time} — ${a.alarm}`;
      list.appendChild(row);
    });
  }catch(err){
    console.error("Alarm history error:",err);
  }
}

async function resetAlarmHistory(){
  if(!confirm("Clear alarm history?")) return;
  try{
    const response = await fetch(API + "/alarm-history",{
      method:"DELETE",
      headers:{
        Authorization: token
      }
    });
    const data = await response.json();
    alert(data.message);
    loadAlarmHistory(); // refresh list
  }catch(err){
    console.error("Reset error:",err);
  }
}

document.getElementById("resetAlarmsBtn").addEventListener("click", resetAlarmHistory);

const historyTitle = document.getElementById("alarmHistoryTitle");
const historyList = document.getElementById("alarmHistoryList1");

historyTitle.addEventListener("click", () => {
  if(historyList.classList.contains("alarmHistoryHidden")){
    historyList.classList.remove("alarmHistoryHidden");
    historyList.classList.add("alarmHistoryVisible");
  }else{
    historyList.classList.remove("alarmHistoryVisible");
    historyList.classList.add("alarmHistoryHidden");
  }
});
let lastStatus = null;

function updateDashboard(data){
  if(lastStatus && JSON.stringify(lastStatus) === JSON.stringify(data)){
      return;
  }
  lastStatus = data;
  document.getElementById("selectedCrop").textContent = data.crop ?? "--";
  document.getElementById("selectedTime").textContent = data.time ?? "--";
  document.getElementById("selectedDays").textContent = data.days ?? "--";
  document.getElementById("batVol").textContent = data.voltage ?? "--";
  document.getElementById("modeSelect").textContent = data.mode ?? "--";
  document.getElementById("src").textContent = data.source ?? "--";
  document.getElementById("pumpState").textContent = data.pump ?? "--";

  const alarmsBox = document.getElementById("alarmState");

  alarmsBox.innerHTML = "";

  if (!data.alarms || data.alarms === "NONE" || data.alarms.length === 0) {
    const line = document.createElement("div");
    line.className = "alarmItem";
    line.innerHTML =  '<i class="fa-solid fa-bell bell"></i>' + "System working normally";
    alarmsBox.className = "onlineLED";
    alarmsBox.appendChild(line);
  } else {
    alarmsBox.className = "offlineLED";
    if (Array.isArray(data.alarms)) {
        data.alarms.forEach(alarm => {
            const line = document.createElement("div");
            line.className = "alarmItem";
            line.innerHTML =  '<i class="fa-solid fa-bell bell"></i>' + alarm;
            alarmsBox.appendChild(line);
        });
    } else {
        alarmsBox.innerHTML = '<i class="fa-solid fa-bell bell"></i>' + data.alarms;
    }
  }
}

function changeLanguage(){
    const lang = document.getElementById("languageSelect").value;
    const text = {
        en:{
            cycle:"Current cycle",
            voltage:"Battery Voltage",
            mode:"Mode selected",
            source:"Source",
            pump:"Pump"
        },
        hi:{
            cycle:"वर्तमान चक्र",
            voltage:"बैटरी वोल्टेज",
            mode:"चयनित मोड",
            source:"स्रोत",
            pump:"पंप"
        },
        gu:{
            cycle:"હાલનો ચક્ર",
            voltage:"બેટરી વોલ્ટેજ",
            mode:"પસંદ કરેલ મોડ",
            source:"સોર્સ",
            pump:"પંપ"
        },
        mr:{
            cycle:"सध्याचा चक्र",
            voltage:"बॅटरी व्होल्टेज",
            mode:"निवडलेला मोड",
            source:"स्रोत",
            pump:"पंप"
        },
        bn:{
            cycle:"বর্তমান চক্র",
            voltage:"ব্যাটারি ভোল্টেজ",
            mode:"নির্বাচিত মোড",
            source:"উৎস",
            pump:"পাম্প"
        }
    };

    document.getElementById("cycleLabel").textContent = text[lang].cycle;
    document.getElementById("voltageLabel").textContent = text[lang].voltage;
    document.getElementById("modeLabel").textContent = text[lang].mode;
    document.getElementById("sourceLabel").textContent = text[lang].source;
    document.getElementById("pumpLabel").textContent = text[lang].pump;
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("token");
    window.location.replace("indexLogin.html");
  }
}