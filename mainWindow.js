// Setting up all the buttons for the day selection bar
let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

let buttons = [];
// Getting the template
let selection_bar = document.querySelector(".day-selection-bar");
let template = document.querySelector("#day-button-template");
for(day of days) {
  copy = template.cloneNode(true);
  // Changing the template with the right text
  copy.innerHTML = copy.innerHTML.replace("Day Name", day);
  copy.innerHTML = copy.innerHTML.replace("X", "0");
  copy.setAttribute("class", "__day-button")
  buttons.push(copy);
}

// Displaying all the buttons
template.style.display = "none";
for(button of buttons) {
  selection_bar.appendChild(button);
}
