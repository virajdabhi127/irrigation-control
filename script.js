const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

client.on('connect', function () {
    console.log("Connected");
});

function sendCrop() {
  const selected = document.querySelector('input[name="mode"]:checked').value
  const crop = document.getElementById("crop").value;
  const time = document.getElementById("time").value;
  const days = document.getElementById("days").value;
  const pumpElement = document.querySelector('input[name="pump"]:checked');

if (selected === "MANUAL" && !pumpElement) {
  alert("Select pump state");
  return;
}

const pumpState = pumpElement ? pumpElement.value : "";

  if(!selected) {
   alert("Select mode")
   return
  } else if (selected == "AUTO"){
  if (!crop) {
   alert("Select a crop");
   return;
  }
  if (!time) {
   alert("Set time");
   return;
  }
  if (!days) {
   alert("Set days");
   return;
  }
  const msg = selected + "," + crop + "," + time + "," + days;
  client.publish("esp32/msg", msg.toString());
  console.log("Message sent:", msg);
} else if (selected == "MANUAL"){
  const msg = selected + "," + pumpState
  client.publish("esp32/msg", msg.toString());
  console.log("Message sent:", msg);
}
}
function stop(){
  const value = document.getElementById('stop').value
  client.publish("esp32/msg", value.toString())
  console.log(value)
}
const auto = document.getElementById("auto");
const manual = document.getElementById("manual");

const autoSelects = document.querySelectorAll("#options select");
const pumpRadios = document.querySelectorAll('input[name="pump"]');
 
autoSelects.forEach(s => s.disabled = true);
pumpRadios.forEach(p => p.disabled = true);

auto.addEventListener("change", function () {
  if (this.checked) {
    autoSelects.forEach(s => s.disabled = false);
    pumpRadios.forEach(p => {
      p.disabled = true;
      p.checked = false;
      });
    }
  });

manual.addEventListener("change", function () {
  if (this.checked) {
    autoSelects.forEach(s => {
    s.disabled = true;
    s.selectedIndex = 0;
    });
    pumpRadios.forEach(p => p.disabled = false);
    }
  });
const translations = {
  en: {
    title: "HELLO FARMER",
    modeLabel: "Mode :",
    cropLabel: "Choose a crop:",
    crops: ["Groundnut","Cotton","Wheat","Bajra","Rice","Castor","Mustard","Cumin","Sugarcane"],
    timeLabel: "Set time :",
    daysLabel: "Set interval :",
    pumpLabel: "Pump :",
    confirmBtn: "Confirm",
    stopBtn: "EMERGENCY STOP",
     autoText: "Auto",
    manualText: "Manual",
    onText: "ON",
    offText: "OFF"
  },
  hi: {
    modeLabel: "मोड :",
    cropLabel: "फसल चुनें:",
    crops: ["मूंगफली","कपास","गेहूं","बाजरा","चावल","अरंडी","सरसों","जीरा","गन्ना"],
    timeLabel: "समय सेट करें :",
    daysLabel: "अंतराल सेट करें :",
    pumpLabel: "पंप :",
    confirmBtn: "पुष्टि करें",
    stopBtn: "आपातकालीन रोक",
    autoText: "स्वचालित",
    manualText: "मैनुअल",
    onText: "चालू",
    offText: "बंद"
  },
  gu: {
    modeLabel: "મોડ :",
    cropLabel: "પાક પસંદ કરો:",
    crops: ["શિંગદાણા","કપાસ","ઘઉં","બાજરી","ચોખા","અરંડા","રાઈ","જીરૂ","ઉખાણું"],
    timeLabel: "સમય સેટ કરો :",
    daysLabel: "અંતર સેટ કરો :",
    pumpLabel: "પંપ :",
    confirmBtn: "ખાતરી કરો",
    stopBtn: "તાત્કાલિક બંધ",
    autoText: "ઓટો",
    manualText: "મેન્યુઅલ",
    onText: "ચાલુ",
    offText: "બંધ"
  },
  mr: {
  modeLabel: "मोड :",
  cropLabel: "पीक निवडा:",
  timeLabel: "वेळ सेट करा :",
  daysLabel: "अंतर सेट करा :",
  pumpLabel: "पंप :",
  confirmBtn: "पुष्टी करा",
  stopBtn: "आपत्कालीन थांबा",
  autoText: "स्वयंचलित",
  manualText: "मॅन्युअल",
  onText: "चालू",
  offText: "बंद",
  crops: ["भुईमूग","कापूस","गहू","बाजरी","तांदूळ","एरंडी","मोहरी","जिरे","ऊस"]
  },
  bn: {
  modeLabel: "মোড :",
  cropLabel: "ফসল নির্বাচন করুন:",
  timeLabel: "সময় নির্ধারণ করুন :",
  daysLabel: "ব্যবধান নির্ধারণ করুন :",
  pumpLabel: "পাম্প :",
  confirmBtn: "নিশ্চিত করুন",
  stopBtn: "জরুরি বন্ধ",
  autoText: "স্বয়ংক্রিয়",
  manualText: "ম্যানুয়াল",
  onText: "চালু",
  offText: "বন্ধ",
  crops: ["চিনাবাদাম","কাপাস","গম","বাজরা","ধান","এরন্ড","সরিষা","জিরা","আখ" ]
  }
};
function changeLanguage() {
  const lang = document.getElementById("languageSelect").value;
  localStorage.setItem("lang", lang);  
  applyLanguage(lang);
}
function applyLanguage(lang) {
  const elements = translations[lang];
  for (let key in elements) {
    if (key !== "crops") {
      const el = document.getElementById(key);
      if (el) el.innerText = elements[key];
    }
  }
  const cropSelect = document.getElementById("crop");
  const selectedValue = cropSelect.value; 
  cropSelect.innerHTML = '<option value="" disabled></option>';
  elements.crops.forEach((crop, index) => {
    const option = document.createElement("option");
    option.value = index;   
    option.text = crop;
    cropSelect.appendChild(option);
  });
  cropSelect.value = selectedValue;
}
document.addEventListener("DOMContentLoaded", function () {
  const savedLang = localStorage.getItem("lang") || "en";
  document.getElementById("languageSelect").value = savedLang;
  applyLanguage(savedLang);
});