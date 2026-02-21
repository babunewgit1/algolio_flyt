const currencyMenu = document.querySelector(".currency_menu");
const currencyTrigger = currencyMenu?.querySelector("a.nav_bar_link");

// Toggle dropdown open/close
currencyTrigger?.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation(); 
  const isOpen = currencyMenu.classList.toggle("currency_open");
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Close when clicking outside
document.addEventListener("click", function (e) {
  if (!currencyMenu?.contains(e.target)) {
    currencyMenu?.classList.remove("currency_open");
    document.body.style.overflow = "";
  }
});

