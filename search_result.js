const getStoredData = JSON.parse(sessionStorage.getItem("storeData"));

const ONE_WAY_API = "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_one_way_flight_flyt";
const ROUND_TRIP_API = "https://operators-dashboard.bubbleapps.io/api/1.1/wf/webflow_round_trip_flight_flyt";

function to24HourTime(timeStr) {
  if (!timeStr) return "00:00:00";
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") hours = String(Number(hours) + 12);
  if (modifier === "AM" && hours === "12") hours = "00";
  return `${hours.padStart(2, "0")}:${minutes}:00`;
}

function ensureValidTimestamp(timestamp, dateText, timeText) {
  if (timestamp && timestamp !== 0) return timestamp;
  try {
    const isoTime = to24HourTime(timeText || "12:00 AM");
    const d = new Date(`${dateText}T${isoTime}`);
    if (!isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);
  } catch (e) {
    console.error("ensureValidTimestamp error:", e);
  }
  return null;
}

async function makeApiCall() {
  if (!getStoredData) {
    console.error("No storeData found in sessionStorage.");
    return;
  }

  const isOneWay = getStoredData.way.toLowerCase() === "one way";
  const apiUrl = isOneWay ? ONE_WAY_API : ROUND_TRIP_API;
  let requestBody;

  if (isOneWay) {
    const timestamp = ensureValidTimestamp(
      getStoredData.timeStamp,
      getStoredData.dateAsText,
      getStoredData.timeAsText
    );
    requestBody = {
      "from airport id": getStoredData.fromId,
      "to airport id": getStoredData.toId,
      date: timestamp ? timestamp * 1000 : null,
      pax: getStoredData.pax,
      date_as_text: getStoredData.dateAsText,
      time_as_text: getStoredData.timeAsText,
    };
  } else {
    const depTimestamp = ensureValidTimestamp(
      getStoredData.timeStamp,
      getStoredData.dateAsText,
      getStoredData.timeAsText
    );
    const retTimestamp = ensureValidTimestamp(
      getStoredData.timeStampReturn,
      getStoredData.returnDateAsText,
      getStoredData.timeAsTextReturn
    );
    requestBody = {
      "out-dep airport id": getStoredData.fromId,
      "out-arr airport id": getStoredData.toId,
      "out-dep date": depTimestamp ? depTimestamp * 1000 : null,
      "out-pax": getStoredData.pax,
      "ret-date": retTimestamp ? retTimestamp * 1000 : null,
      "ret-dep airport id": getStoredData.returnFromId,
      "ret-arr airport id": getStoredData.returnToId,
      "ret-pax": getStoredData.paxReturn,
      Dep_date_as_text: getStoredData.dateAsText,
      Ret_date_as_text: getStoredData.returnDateAsText,
      Dep_time_as_text: getStoredData.timeAsText,
      Ret_time_as_text: getStoredData.timeAsTextReturn,
    };
  }

  console.log(`API REQUEST — ${isOneWay ? "ONE WAY" : "ROUND TRIP"}`);
  console.log("Endpoint:", apiUrl);
  console.log("Session Data:", getStoredData);
  console.log("Request Body:", requestBody);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("API RESPONSE:", data);
    console.log("Response Body:", data.response);
    return data;

  } catch (error) {
    console.error("API ERROR:", error);
    console.error("Failed Request Body:", requestBody);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  makeApiCall();
});
