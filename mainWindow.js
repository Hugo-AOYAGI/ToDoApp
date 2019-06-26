// Setting up all the buttons for the day selection bar
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "September", "October", "November", "December"];

let buttons = [];
// Getting the template
let selection_bar = document.querySelector(".day-selection-bar");
let template = document.querySelector(".template.__day-button");
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

let date_span = document.querySelector(".__date");
let date_span_og = date_span.cloneNode(true);

leadingZero = (n) => {
  return n < 10 ? "0"+n : n;
}

reloadDate = () => {
  let d = new Date();
  let txt_date = `${leadingZero(d.getDate())} /
                  ${leadingZero(d.getMonth()+1)} /
                  ${leadingZero(d.getFullYear())} <br>
                  ${leadingZero(d.getHours())} :
                  ${leadingZero(d.getMinutes())} :
                  ${leadingZero(d.getSeconds())}`;
  console.log(txt_date);
  date_span.innerHTML = date_span_og.innerHTML.replace("[DATE]", txt_date);
}
reloadDate();
t = setInterval(reloadDate, 1000);
