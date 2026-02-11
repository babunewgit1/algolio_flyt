
// Initialize Algolia search
const searchClient = algoliasearch(
   "ZSPO7HB4MN",
   "2a3621a18dca4f1fb757e9ddaea72440",
);
const index = searchClient.initIndex("Airports");

function debounce(func, delay) {
   let timeout;
   return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
   };
}

function escapeHTML(str) {
   const div = document.createElement("div");
   div.appendChild(document.createTextNode(str));
   return div.innerHTML;
}

const handleInput = debounce(function (event) {
   const input = event.target;
   if (!input.classList.contains("algolio_input")) return;
   const query = input.value.trim();
   const eminputBlock = input.closest(".eminputblock");
   const resultsContainer = eminputBlock.querySelector(".search-results");
   if (!resultsContainer) {
      console.warn("No .search-results container found for the input.");
      return;
   }

   if (query.length === 0) {
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
      return;
   }

   // Perform Algolia search
   index
      .search(query)
      .then(({
         hits
      }) => {
         // console.log("Algolia Search Results:", hits);
         if (hits.length > 0) {
            resultsContainer.innerHTML = hits
               .map(
                  (hit) =>
                  `<div class="port" tabindex="0">
              <div class="emfieldnamewrapper">
                <img
                  src="https://cdn.prod.website-files.com/6713759f858863c516dbaa19/6739f54808efbe5ead7a23c1_Screenshot_1-removebg-preview.avif"
                  alt="Location Icon"
                />
                <p class="emfieldname">${escapeHTML(hit["All Fields"])}</p>
                <p class="uniqueid" style="display:none">${escapeHTML(hit["unique id"])}</p>
                <p class="shortcode">${
                  hit["ICAO Code"]
                    ? escapeHTML(hit["ICAO Code"])
                    : hit["IATA Code"]
                      ? escapeHTML(hit["IATA Code"])
                      : hit["FAA Code"]
                        ? escapeHTML(hit["FAA Code"])
                        : ""
                }</p>
                <p class="cityname" style="display:none">${escapeHTML(hit["AirportCity"])}</p>
              </div>
            </div>`,
               )
               .join("");
            resultsContainer.style.display = "block";
         } else {
            resultsContainer.innerHTML =
               "<p style='padding:10px'>No results found.</p>";
            resultsContainer.style.display = "block";
         }
      })
      .catch((err) => {
         console.error("Algolia search error:", err);
         resultsContainer.innerHTML = "<p>Error fetching results.</p>";
         resultsContainer.style.display = "block";
      });
}, 300);

// Function to handle click events on search results
function handleClick(event) {
   const portElement = event.target.closest(".port");
   if (portElement) {
      const emfieldname =
         portElement.querySelector(".emfieldname").textContent;
      const uniqueid = portElement.querySelector(".uniqueid").textContent;
      const shortcode = portElement.querySelector(".shortcode").textContent;
      const citycode = portElement.querySelector(".cityname").textContent;

      // Find the corresponding input and .portid
      const eminputBlock = portElement.closest(".eminputblock");
      const input = eminputBlock.querySelector(".algolio_input");
      const portidElement = eminputBlock.querySelector(".portid");
      const shortElement = eminputBlock.querySelector(".airportshort");
      const airportCityName = eminputBlock.querySelector(".airportcity");
      input.value = emfieldname;
      portidElement.textContent = uniqueid;
      shortElement.textContent = shortcode;
      airportCityName.textContent = citycode;
      const resultsContainer =
         eminputBlock.querySelector(".search-results");
      resultsContainer.innerHTML = "";
      resultsContainer.style.display = "none";
   } else {
      // Handle cross icon click
      const crossIcon = event.target.closest(".cross_input_icon");
      if (crossIcon) {
         const eminputBlock = crossIcon.closest(".eminputblock");
         if (eminputBlock) {
            const input = eminputBlock.querySelector(".algolio_input");
            const portid = eminputBlock.querySelector(".portid");
            const airportshort = eminputBlock.querySelector(".airportshort");
            const airportcity = eminputBlock.querySelector(".airportcity");
            const resultsContainer =
               eminputBlock.querySelector(".search-results");

            if (input) {
               input.value = "";
               input.focus();
            }
            if (portid) portid.textContent = "";
            if (airportshort) airportshort.textContent = "";
            if (airportcity) airportcity.textContent = "";
            if (resultsContainer) {
               resultsContainer.innerHTML = "";
               resultsContainer.style.display = "none";
            }
            eminputBlock.classList.remove("displayx");
         }
      }
   }
}

// Function to attach event listeners to a given .algolio_wrapper
function attachListeners(algolioWrapper) {
   algolioWrapper.addEventListener("input", handleInput);

   // Listener for toggling cross icon visibility
   algolioWrapper.addEventListener("input", function (event) {
      const input = event.target;
      if (input.classList.contains("algolio_input")) {
         const eminputBlock = input.closest(".eminputblock");
         if (eminputBlock) {
            if (input.value.trim() !== "") {
               eminputBlock.classList.add("displayx");
            } else {
               eminputBlock.classList.remove("displayx");
            }
         }
      }
   });

   algolioWrapper.addEventListener("click", handleClick);

   algolioWrapper.addEventListener("focusout", function (event) {
      setTimeout(() => {
         const relatedTarget = event.relatedTarget;

         if (!relatedTarget || !algolioWrapper.contains(relatedTarget)) {
            const allResults =
               algolioWrapper.querySelectorAll(".search-results");
            allResults.forEach((resultsContainer) => {
               resultsContainer.innerHTML = "";
               resultsContainer.style.display = "none";
            });
         }
      }, 100);
   });
}

// Select all existing .algolio_wrapper elements and attach listeners
const algolioWrappers = document.querySelectorAll(".algolio_wrapper");
algolioWrappers.forEach(attachListeners);

// Hide search results when clicking outside any .algolio_wrapper
document.addEventListener("click", function (event) {
   algolioWrappers.forEach((algolioWrapper) => {
      const isClickInside = algolioWrapper.contains(event.target);

      if (!isClickInside) {
         const allResults =
            algolioWrapper.querySelectorAll(".search-results");
         allResults.forEach((resultsContainer) => {
            resultsContainer.innerHTML = "";
            resultsContainer.style.display = "none";
         });
      }
   });
});

// Clear inputs on page load
document.addEventListener("DOMContentLoaded", function () {
   const inputs = document.querySelectorAll(".algolio_input");
   inputs.forEach((input) => {
      input.value = "";
      const eminputBlock = input.closest(".eminputblock");
      if (eminputBlock) {
         eminputBlock.classList.remove("displayx");
         const portid = eminputBlock.querySelector(".portid");
         const airportshort = eminputBlock.querySelector(".airportshort");
         const airportcity = eminputBlock.querySelector(".airportcity");
         if (portid) portid.textContent = "";
         if (airportshort) airportshort.textContent = "";
         if (airportcity) airportcity.textContent = "";
      }
   });
});

/* --- Calendar Logic --- */
document.addEventListener("DOMContentLoaded", () => {
   const widget = document.getElementById("calendar-widget");
   const inputs = document.querySelectorAll(".multi-input-container, .form_input_multipul");
   const leftMonthLabel = document.querySelector("#month-left .month-label");
   const rightMonthLabel = document.querySelector("#month-right .month-label");
   const leftDaysContainer = document.getElementById("days-left");
   const rightDaysContainer = document.getElementById("days-right");
   const prevBtn = document.querySelector(".prev-month");
   const nextBtns = document.querySelectorAll(".next-month");
   const amPmBtns = document.querySelectorAll(".ampm-btn");
   const timeList = document.getElementById("time-list");
   const confirmBtn = document.getElementById("confirm-selection");
   const closeBtn = document.getElementById("close-calendar");
   const timeDisplay = document.getElementById("selected-time-display");

   let currentInput = null;
   let viewingDate = new Date(); // The date determining the left month
   // viewingDate.setDate(1); // Ensure we start at the 1st

   let selectedDate = null;
   let selectedHour = "12";
   let selectedMinute = "00";
   let selectedAmPm = "AM";

   const monthNames = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
   ];

   // --- Time List Generation ---
   function generateTimeList() {
      if(!timeList) return;
      timeList.innerHTML = "";
      const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      hours.forEach((h) => {
         ["00", "30"].forEach((m) => {
            const timeStr = `${String(h).padStart(2, "0")}:${m}`;
            const div = document.createElement("div");
            div.className = "time-option";
            div.textContent = timeStr;

            // Check Selection
            if (timeStr === `${selectedHour}:${selectedMinute}`) {
               div.classList.add("selected");
            }

            div.onclick = (e) => {
               e.stopPropagation();
               selectedHour = String(h).padStart(2, "0");
               selectedMinute = m;
               updateTimeUI();
               if(timeList) timeList.classList.remove("show"); // Close dropdown
            };

            timeList.appendChild(div);
         });
      });
   }

   function updateTimeUI() {
      if(!timeDisplay) return;
      // Update text display
      timeDisplay.textContent = `${selectedHour}:${selectedMinute}`;
      // Re-render list to show active state
      generateTimeList();
   }

   // --- Calendar Rendering ---
   function renderCalendar() {
      if(!leftMonthLabel) return;
      // Always render starting from viewingDate
      renderMonth(viewingDate, leftMonthLabel, leftDaysContainer);

      const nextMonthDate = new Date(viewingDate);
      nextMonthDate.setMonth(viewingDate.getMonth() + 1);
      renderMonth(nextMonthDate, rightMonthLabel, rightDaysContainer);
   }

   function renderMonth(date, labelEl, daysEl) {
      if(!daysEl) return;
      const year = date.getFullYear();
      const month = date.getMonth();

      labelEl.textContent = `${monthNames[month]} ${year}`;
      daysEl.innerHTML = "";

      const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Empty slots for previous month
      for (let i = 0; i < firstDayIndex; i++) {
         const empty = document.createElement("div");
         empty.className = "day empty";
         daysEl.appendChild(empty);
      }

      // Days
      for (let i = 1; i <= daysInMonth; i++) {
         const dayEl = document.createElement("div");
         dayEl.className = "day";
         dayEl.innerHTML = `${i} <span class="price-tag">$120k</span>`; // Mock Data

         // Selection Logic
         if (
            selectedDate &&
            selectedDate.getDate() === i &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year
         ) {
            dayEl.classList.add("selected");
         }

         dayEl.onclick = (e) => {
            e.stopPropagation();
            selectedDate = new Date(year, month, i);
            renderCalendar();
         };

         daysEl.appendChild(dayEl);
      }
   }

   // --- Handlers ---
   if(prevBtn) prevBtn.onclick = (e) => {
      e.stopPropagation();
      viewingDate.setMonth(viewingDate.getMonth() - 1);
      renderCalendar();
   };
   
   nextBtns.forEach(btn => {
      btn.onclick = (e) => {
         e.stopPropagation();
         viewingDate.setMonth(viewingDate.getMonth() + 1);
         renderCalendar();
      };
   });

   amPmBtns.forEach((btn) => {
      btn.onclick = (e) => {
         e.stopPropagation();
         amPmBtns.forEach((b) => b.classList.remove("active"));
         btn.classList.add("active");
         selectedAmPm = btn.dataset.val;
      };
   });

   // Toggle Time List Dropdown
   if(timeDisplay) {
      timeDisplay.onclick = (e) => {
         e.stopPropagation();
         if(timeList) timeList.classList.toggle("show");
      };
   }

   // Input Click -> Open Widget
   inputs.forEach((input) => {
      input.addEventListener("click", (e) => {
         if (widget && widget.contains(e.target)) return;
         e.stopPropagation();

         currentInput = input;
         
         // Append widget to clicked input
         if(widget) {
             input.appendChild(widget);
             widget.style.top = "";
             widget.style.left = "";
             
             // Trigger animation restart
             widget.classList.remove("active");
             // Force reflow
             void widget.offsetWidth;
             widget.classList.add("active");
         }

         // Remove active class from others
         inputs.forEach((i) => i.classList.remove("active-input"));
         input.classList.add("active-input");

         // Load state from input if exists
         if (input.dataset.selectedDate) {
            selectedDate = new Date(input.dataset.selectedDate);
            viewingDate = new Date(selectedDate); // Jump to that month
            selectedHour = input.dataset.selectedHour;
            selectedMinute = input.dataset.selectedMinute;
            selectedAmPm = input.dataset.selectedAmPm;
         } else {
            // Reset to defaults if new input
            selectedDate = null;
            viewingDate = new Date();
            selectedHour = "12";
            selectedMinute = "00";
            selectedAmPm = "AM";
         }

         // Refresh UI with loaded/reset state
         updateTimeUI();
         amPmBtns.forEach((btn) => {
            if (btn.dataset.val === selectedAmPm) btn.classList.add("active");
            else btn.classList.remove("active");
         });
         renderCalendar();
      });
   });

   // Close Logic
   if(closeBtn) closeBtn.onclick = (e) => {
       e.stopPropagation();
       widget.classList.remove("active");
       inputs.forEach((i) => i.classList.remove("active-input"));
   };

   document.addEventListener("click", (e) => {
      if (widget && widget.classList.contains("active")) {
         if (
            !widget.contains(e.target) &&
            !Array.from(inputs).includes(e.target)
         ) {
            widget.classList.remove("active");
            inputs.forEach((i) => i.classList.remove("active-input"));
         }
      }
      // Close dropdown if clicking outside time display
      if (timeList && timeList.classList.contains("show") && !timeDisplay.contains(e.target) && !timeList.contains(e.target)) {
         timeList.classList.remove("show");
      }
   });

   // Confirm Button Logic
   if(confirmBtn) confirmBtn.onclick = (e) => {
      e.stopPropagation();
      if (selectedDate) {
         const dateStr = selectedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
         });

         const timeStr = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;

         if (currentInput) {
            const dateField = currentInput.querySelector(".date-input");
            const timeField = currentInput.querySelector(".time-input");

            if (dateField) dateField.value = dateStr;
            if (timeField) timeField.value = timeStr;

            // Save state to dataset
            currentInput.dataset.selectedDate = selectedDate.toISOString();
            currentInput.dataset.selectedHour = selectedHour;
            currentInput.dataset.selectedMinute = selectedMinute;
            currentInput.dataset.selectedAmPm = selectedAmPm;
         }

         if(widget) widget.classList.remove("active");
         if (currentInput) currentInput.classList.remove("active-input");
      } else {
         alert("Please select a date.");
      }
   };

   // Init
   generateTimeList();
   renderCalendar();
});