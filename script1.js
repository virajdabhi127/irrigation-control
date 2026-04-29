const API = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://irrigation-backend-2m4h.onrender.com";
// const API = "http://localhost:5000";
const token = sessionStorage.getItem("token");
let currentCropEnglish = null;

window.onload = async function(){
  const verified = await verifyUser();
  if(!verified) return;
  const username = getUsernameFromToken();
  document.getElementById("loggedUser").textContent = username;
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
      const d = new Date(a.timestamp.replace(" ", "T"));
      const day = String(d.getDate()).padStart(2,'0');
      const month = String(d.getMonth()+1).padStart(2,'0');
      const year = d.getFullYear();
      const hour = String(d.getHours()).padStart(2,'0');
      const min = String(d.getMinutes()).padStart(2,'0');
      const sec = String(d.getSeconds()).padStart(2,'0');
      const time = `${day}/${month}/${year} ${hour}:${min}:${sec}`;
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
  currentCropEnglish = data.crop;
  document.getElementById("selectedCrop").textContent = translateCrop(currentCropEnglish) ?? "--";
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

const text = {
        en:{
            cycle:"Current cycle",
            voltage:"Battery Voltage",
            mode:"Mode selected",
            cropLabel1: "Choose a crop:",
            timeLabel1: "Set time :",
            daysLabel1: "Set interval :",
            source:"Source",
            pump:"Pump",
            selection:"Current selection",
            crops: ["Groundnut","Cotton","Wheat","Bajra","Rice","Castor","Mustard","Cumin","Sugarcane"]
        },
        hi:{
            cycle:"वर्तमान चक्र",
            voltage:"बैटरी वोल्टेज",
            mode:"चयनित मोड",
            cropLabel1: "फसल चुनें:",
            timeLabel1: "समय सेट करें :",
            daysLabel1: "अंतराल सेट करें :",
            source:"स्रोत",
            pump:"पंप",
            selection:"वर्तमान चयन",
            crops: ["मूंगफली","कपास","गेहूं","बाजरा","चावल","अरंडी","सरसों","जीरा","गन्ना"]
        },
        gu:{
            cycle:"હાલનો ચક્ર",
            voltage:"બેટરી વોલ્ટેજ",
            mode:"પસંદ કરેલ મોડ",
            cropLabel1: "પાક પસંદ કરો:",
            timeLabel1: "સમય સેટ કરો :",
            daysLabel1: "અંતર સેટ કરો :",
            source:"સોર્સ",
            pump:"પંપ",
            selection: "વર્તમાન પસંદગી",
            crops: ["શિંગદાણા","કપાસ","ઘઉં","બાજરી","ચોખા","અરંડા","રાઈ","જીરૂ","ઉખાણું"]
        },
        mr:{
            cycle:"सध्याचा चक्र",
            voltage:"बॅटरी व्होल्टेज",
            mode:"निवडलेला मोड",
            cropLabel1: "पीक निवडा:",
            timeLabel1: "वेळ सेट करा :",
            daysLabel1: "अंतर सेट करा :",
            source:"स्रोत",
            pump:"पंप",
            selection: "सध्याची निवड",
            crops: ["भुईमूग","कापूस","गहू","बाजरी","तांदूळ","एरंडी","मोहरी","जिरे","ऊस"]
        },
        bn:{
            cycle:"বর্তমান চক্র",
            voltage:"ব্যাটারি ভোল্টেজ",
            mode:"নির্বাচিত মোড",
            cropLabel1: "ফসল নির্বাচন করুন:",
            timeLabel1: "সময় নির্ধারণ করুন :",
            daysLabel1: "ব্যবধান নির্ধারণ করুন :",
            source:"উৎস",
            pump:"পাম্প",
            selection: "বর্তমান নির্বাচন",
            crops: ["চিনাবাদাম","কাপাস","গম","বাজরা","ধান","এরন্ড","সরিষা","জিরা","আখ" ]
        }
    };

function getUsernameFromToken() {
  const token = sessionStorage.getItem("token");
  if(!token) return null;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.username;
}

function changeLanguage(){
    const lang = document.getElementById("languageSelect").value;

    document.getElementById("selectionLabel").textContent = text[lang].selection;
    document.getElementById("cropLabel").textContent = text[lang].cropLabel1;
    document.getElementById("timeLabel").textContent = text[lang].timeLabel1;
    document.getElementById("daysLabel").textContent = text[lang].daysLabel1;
    document.getElementById("voltageLabel").textContent = text[lang].voltage;
    document.getElementById("modeLabel").textContent = text[lang].mode;
    document.getElementById("sourceLabel").textContent = text[lang].source;
    document.getElementById("pumpLabel").textContent = text[lang].pump;

    // translate currently shown crop
    const currentCrop = document.getElementById("selectedCrop").textContent;
    document.getElementById("selectedCrop").textContent = translateCrop(currentCrop);
    if(currentCropEnglish){
    document.getElementById("selectedCrop").textContent = translateCrop(currentCropEnglish);
}
}

function translateCrop(crop){
  const lang = document.getElementById("languageSelect").value || "en";
  const index = text.en.crops.indexOf(crop);
  if(index !== -1){
    return text[lang].crops[index];
  }
  return crop;
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.removeItem("token");
    window.location.replace("indexLogin.html");
  }
}