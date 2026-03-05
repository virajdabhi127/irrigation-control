const API = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://irrigation-backend-2m4h.onrender.com";
const token = sessionStorage.getItem("token");

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

let lastStatus = null;

function updateDashboard(data){
  if(lastStatus && JSON.stringify(lastStatus) === JSON.stringify(data)){
      return;
  }
  lastStatus = data;
  document.getElementById("cycleStatus").textContent = data.cycle ?? "--";
  document.getElementById("batVol").textContent = data.voltage ?? "--";
  document.getElementById("modeSelect").textContent = data.mode ?? "--";
  document.getElementById("src").textContent = data.source ?? "--";
  document.getElementById("pumpState").textContent = data.pump ?? "--";

  const device = document.getElementById("deviceState");

  if(data.device === "ONLINE"){
    device.textContent = "● ONLINE";
    device.className = "onlineLED";
}
else{
    device.textContent = "● OFFLINE";
    device.className = "offlineLED";
}
}

window.onload = async function(){
  const verified = await verifyUser();
  if(!verified) return;
  loadStatus();
  setInterval(loadStatus,3000);
};
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