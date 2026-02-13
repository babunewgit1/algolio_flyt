
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
   const timeList = document.getElementById("time-list");
   const confirmBtn = document.getElementById("confirm-selection");
   const closeBtn = document.getElementById("close-calendar");

   // New Time Controls
   const timeSectionRet = document.getElementById("time-section-ret");
   const timeDisplayDep = document.getElementById("time-display-dep");
   const timeDisplayRet = document.getElementById("time-display-ret");
   const ampmDep = document.getElementById("ampm-dep");
   const ampmRet = document.getElementById("ampm-ret");

   let currentInput = null;
   let viewingDate = new Date(); 
   
   // State
   let isRoundTrip = false;
   // We separate logical state for Departure vs Return
   // For One-Way, we use 'dep' values.
   let selectedDateDep = null;
   let selectedDateRet = null;
   
   // Time State objects
   let timeDep = { h: "12", m: "00", ampm: "AM" };
   let timeRet = { h: "12", m: "00", ampm: "AM" };
   
   // Which time picker is currently open? 'dep' or 'ret'
   let activeTimeTarget = 'dep'; 

   const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
   ];

   function updateRealTimeUI() {
      if (!currentInput) return;
      
      const formatTime = (t) => `${t.h}:${t.m} ${t.ampm}`;
      const formatDate = (d) => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

      if (isRoundTrip) {
          // --- Round Trip Update ---
          const roundPlaceholder = currentInput.querySelector(".round_placeholder");
          const depDateEl = currentInput.querySelector(".round_trip_departure_date");
          const depTimeEl = currentInput.querySelector(".round_trip_departure_time");
          const retDateEl = currentInput.querySelector(".round_trip_return_date");
          const retTimeEl = currentInput.querySelector(".round_trip_return_time");

          if (selectedDateDep) {
              // 1. Hide Global Placeholder
              if(roundPlaceholder) roundPlaceholder.style.display = "none";

              // 2. Show Departure Date & Time and set text
              if(depDateEl) {
                  depDateEl.style.display = "block";
                  depDateEl.textContent = formatDate(selectedDateDep);
                  depDateEl.classList.remove("roundtrip_date_placeholder"); 
              }
              if (depTimeEl) depTimeEl.textContent = formatTime(timeDep);
              
              // 3. Handle Return Section
              if (selectedDateRet) {
                  // Return Selected: Show Date & Time
                  if(retDateEl) {
                      retDateEl.style.display = "block";
                      retDateEl.textContent = formatDate(selectedDateRet);
                  }
                  if (retTimeEl) retTimeEl.textContent = formatTime(timeRet);
              } else {
                  // Return NOT Selected: Show "Return date" Placeholder text in the Date Element
                  if(retDateEl) {
                      retDateEl.style.display = "block";
                      retDateEl.textContent = "Return date";
                  }
                  if (retTimeEl) retTimeEl.textContent = "";
              }
              
          } else {
              // No Departure Selected: Show Global Placeholder, Hide others
              if(roundPlaceholder) roundPlaceholder.style.display = "block";
              
              if(depDateEl) {
                  depDateEl.style.display = "none";
                  depDateEl.textContent = "";
              }
              if (depTimeEl) depTimeEl.textContent = "";
              
              if(retDateEl) {
                  retDateEl.style.display = "none";
                  retDateEl.textContent = "";
              }
              if (retTimeEl) retTimeEl.textContent = "";
          }

          // Update dataset
          if(selectedDateDep) currentInput.dataset.depDate = selectedDateDep.toISOString();
          if(selectedDateRet) currentInput.dataset.retDate = selectedDateRet.toISOString();
          currentInput.dataset.depTime = JSON.stringify(timeDep);
          currentInput.dataset.retTime = JSON.stringify(timeRet);

      } else {
          // --- One Way Update ---
          const oneWayDate = currentInput.querySelector(".one_way_date");
          const oneWayTime = currentInput.querySelector(".one_way_time");
          const dateField = currentInput.querySelector(".date-input"); // Legacy fallback
          const timeField = currentInput.querySelector(".time-input"); // Legacy fallback

          const dStr = formatDate(selectedDateDep);
          const tStr = formatTime(timeDep);

          if (oneWayDate && selectedDateDep) {
             oneWayDate.textContent = dStr;
             oneWayDate.classList.remove("one_way_date_placeholder");
             if (oneWayTime) oneWayTime.textContent = tStr;
          } else if (oneWayTime) {
              oneWayTime.textContent = "";
          }

          if (dateField && selectedDateDep) dateField.value = dStr;
          if (timeField && selectedDateDep) timeField.value = tStr;
          
          if(selectedDateDep) currentInput.dataset.selectedDate = selectedDateDep.toISOString();
          currentInput.dataset.selectedHour = timeDep.h;
          currentInput.dataset.selectedMinute = timeDep.m;
          currentInput.dataset.selectedAmPm = timeDep.ampm;
      }
   }

   function updateTimeControls() {
       // Display Texts
       if(timeDisplayDep) timeDisplayDep.textContent = `${timeDep.h}:${timeDep.m}`;
       if(timeDisplayRet) timeDisplayRet.textContent = `${timeRet.h}:${timeRet.m}`;
       
       // AM/PM Active States
       if(ampmDep) {
           Array.from(ampmDep.children).forEach(btn => {
               btn.classList.toggle("active", btn.dataset.val === timeDep.ampm);
           });
       }
       if(ampmRet) {
           Array.from(ampmRet.children).forEach(btn => {
               btn.classList.toggle("active", btn.dataset.val === timeRet.ampm);
           });
       }
   }

   // --- Time List Generation ---
   function generateTimeList() {
      if(!timeList) return;
      timeList.innerHTML = "";
      const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      // Which time object are we targeting?
      const targetTime = (activeTimeTarget === 'ret') ? timeRet : timeDep;

      hours.forEach((h) => {
         ["00", "30"].forEach((m) => {
            const timeStr = `${String(h).padStart(2, "0")}:${m}`;
            const div = document.createElement("div");
            div.className = "time-option";
            div.textContent = timeStr;

            // Check Selection
            if (timeStr === `${targetTime.h}:${targetTime.m}`) {
               div.classList.add("selected");
            }

            div.onclick = (e) => {
               e.stopPropagation();
               targetTime.h = String(h).padStart(2, "0");
               targetTime.m = m;
               
               updateTimeControls();
               updateRealTimeUI(); // Update DOM immediately
               if(timeList) timeList.classList.remove("show"); 
            };
            timeList.appendChild(div);
         });
      });
   }
   
   // --- Calendar Rendering ---
   function renderCalendar() {
      if(!leftMonthLabel) return;
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

      const firstDayIndex = new Date(year, month, 1).getDay(); 
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDayIndex; i++) {
         const empty = document.createElement("div");
         empty.className = "day empty";
         daysEl.appendChild(empty);
      }

      for (let i = 1; i <= daysInMonth; i++) {
         const dayEl = document.createElement("div");
         dayEl.className = "day";
         dayEl.innerHTML = `${i} <span class="price-tag">$120k</span>`; 
         
         const currentDate = new Date(year, month, i);
         
         // Selection Logic
         let isSelected = false;
         // Check Departure
         if (selectedDateDep && 
             selectedDateDep.getDate() === i && 
             selectedDateDep.getMonth() === month && 
             selectedDateDep.getFullYear() === year) {
             isSelected = true;
         }
         // Check Return
         if (isRoundTrip && selectedDateRet && 
             selectedDateRet.getDate() === i && 
             selectedDateRet.getMonth() === month && 
             selectedDateRet.getFullYear() === year) {
             isSelected = true;
         }
         
         // Range Highlight (Optional but good)
         if (isRoundTrip && selectedDateDep && selectedDateRet && currentDate > selectedDateDep && currentDate < selectedDateRet) {
             dayEl.classList.add("in-range"); // Add CSS for this later if desired
         }

         if (isSelected) dayEl.classList.add("selected");
         
         // Disable Past Dates
         const today = new Date();
         today.setHours(0, 0, 0, 0); // Normalize today
         if (currentDate < today) {
             dayEl.classList.add("disabled");
             dayEl.style.opacity = "0.3";
             dayEl.style.pointerEvents = "none";
         } else {
             dayEl.onclick = (e) => {
                e.stopPropagation();
                const clickedDate = new Date(year, month, i);
                
                if (isRoundTrip) {
                    // Round Trip Logic:
                    if (!selectedDateDep) {
                        selectedDateDep = clickedDate;
                    } else if (!selectedDateRet) {
                        if (clickedDate < selectedDateDep) {
                            selectedDateDep = clickedDate; // Retroactive move start
                        } else if (clickedDate.getTime() === selectedDateDep.getTime()) {
                            // Same day round trip? Allow it.
                            selectedDateRet = clickedDate;
                        } else {
                            selectedDateRet = clickedDate;
                        }
                    } else {
                        // Reset triggered
                        selectedDateDep = clickedDate;
                        selectedDateRet = null;
                    }
                } else {
                    // One Way
                    selectedDateDep = clickedDate;
                }
    
                renderCalendar();
                updateRealTimeUI();
             };
         }

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

   // AM/PM setup helper
   function setupAmPm(wrapper, timeObj) {
       if(!wrapper) return;
       const btns = wrapper.querySelectorAll(".ampm-btn");
       btns.forEach(btn => {
           btn.onclick = (e) => {
               e.stopPropagation();
               timeObj.ampm = btn.dataset.val;
               updateTimeControls();
               updateRealTimeUI();
           }
       });
   }
   setupAmPm(ampmDep, timeDep);
   setupAmPm(ampmRet, timeRet);

   // Time Display Click (Open Dropdown) logic helper
   function setupTimeDisplay(displayEl, targetKey) {
       if(!displayEl) return;
       displayEl.onclick = (e) => {
           e.stopPropagation();
           activeTimeTarget = targetKey; 
           
           // If clicking distinct display, move list? 
           // The list is absolute mostly.
           // However, layout might need it to be appended near the display if we want perfect alignment.
           // For now, let's keep list in place and just update active target.
           
           // Toggle visibility
           const isVisible = timeList.classList.contains("show");
           // If we click a different one while open, just refresh content.
           
           generateTimeList(); // Refresh with correct selection
           timeList.classList.add("show");
           
           // Simple toggle off if clicking same?
           // Actually global click handles outside.
       };
   }
   setupTimeDisplay(timeDisplayDep, 'dep');
   setupTimeDisplay(timeDisplayRet, 'ret');


   // Input Click -> Open Widget
   inputs.forEach((input) => {
      input.addEventListener("click", (e) => {
         if (widget && widget.contains(e.target)) return;
         e.stopPropagation();

         currentInput = input;
         
         // Detect Mode
         const searchForm = input.closest(".action_form"); // .one_way_search or .round_trip_search
         isRoundTrip = searchForm && searchForm.classList.contains("round_trip_search");

         // UI Adjustment
         if(timeSectionRet) {
             timeSectionRet.style.display = isRoundTrip ? "block" : "none";
         }
         
         // Append Widget
         if(widget) {
             input.appendChild(widget);
             widget.style.top = "";
             widget.style.left = "";
             widget.classList.remove("active");
             void widget.offsetWidth;
             widget.classList.add("active");
         }

         inputs.forEach((i) => i.classList.remove("active-input"));
         input.classList.add("active-input");

         // Reset or Load State (Basic Reset for Demo)
         // To persist, read datasets here...
         if(currentInput.dataset.depDate) {
             selectedDateDep = new Date(currentInput.dataset.depDate);
         } else if (currentInput.dataset.selectedDate) {
             selectedDateDep = new Date(currentInput.dataset.selectedDate);
         } else {
             selectedDateDep = null;
         }
         
         if(currentInput.dataset.retDate) selectedDateRet = new Date(currentInput.dataset.retDate);
         else selectedDateRet = null;
         
         // Restore Time State
         if (currentInput.dataset.depTime) {
             // Round Trip Format
             try {
                 timeDep = JSON.parse(currentInput.dataset.depTime);
             } catch (e) {
                 console.error("Error parsing depTime", e);
             }
         } else if (currentInput.dataset.selectedHour) {
             // One Way Format (Legacy keys)
             timeDep = {
                 h: currentInput.dataset.selectedHour,
                 m: currentInput.dataset.selectedMinute || "00",
                 ampm: currentInput.dataset.selectedAmPm || "AM"
             };
         } else {
            // Default if nothing saved
            timeDep = { h: "12", m: "00", ampm: "AM" };
         }

         if (currentInput.dataset.retTime) {
             try {
                 timeRet = JSON.parse(currentInput.dataset.retTime);
             } catch (e) {
                 console.error("Error parsing retTime", e);
             }
         } else {
            timeRet = { h: "12", m: "00", ampm: "AM" };
         }
         
         viewingDate = selectedDateDep ? new Date(selectedDateDep) : new Date();

         updateTimeControls();
         renderCalendar();
         updateRealTimeUI(); // Ensure displayed text matches state
      });
   });

   // Close / Confirm Logic
   const closeWidget = () => {
       if(widget) widget.classList.remove("active");
       if(timeList) timeList.classList.remove("show");
       inputs.forEach((i) => i.classList.remove("active-input"));
   };

   if(closeBtn) closeBtn.onclick = (e) => {
       e.stopPropagation();
       closeWidget();
   };

   document.addEventListener("click", (e) => {
      if (widget && widget.classList.contains("active")) {
          // Careful not to close if clicking inside widget
         if (!widget.contains(e.target) && !Array.from(inputs).includes(e.target)) {
            closeWidget();
         }
      }
      // Dropdown close logic
      if (timeList && timeList.classList.contains("show")) {
          // Check if click is inside any display or the list itself
          if(!timeList.contains(e.target) && 
             !timeDisplayDep.contains(e.target) && 
             (!timeDisplayRet || !timeDisplayRet.contains(e.target))) {
             timeList.classList.remove("show");
          }
      }
   });

   if(confirmBtn) confirmBtn.onclick = (e) => {
      e.stopPropagation();
      // Validation?
      if(!selectedDateDep) {
          alert("Please select a departure date.");
          return;
      }
      if(isRoundTrip && !selectedDateRet) {
          alert("Please select a return date.");
          return;
      }
      
      updateRealTimeUI();
      closeWidget();
   };
   
   // Init
   generateTimeList();
   // renderCalendar(); // Wait for click to render specific state
});