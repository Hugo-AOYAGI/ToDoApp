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

//Displaying the date on the page header
let date_span = document.querySelector(".__date");
let time_span = document.querySelector(".__time");

//Adds a zero before a date or time if it is lesser than 10
leadingZero = (n) => {
  return n < 10 ? "0"+n : n;
}

//Reloads the date every second
reloadDate = () => {
  let d = new Date();
  let txt_date = `${leadingZero(d.getDate())} /
                  ${leadingZero(d.getMonth()+1)} /
                  ${leadingZero(d.getFullYear())}`;
                  
  let txt_time = `${leadingZero(d.getHours())} :
                  ${leadingZero(d.getMinutes())} :
                  ${leadingZero(d.getSeconds())}`;
  date_span.innerHTML = txt_date;
  time_span.innerHTML = txt_time;
}
reloadDate();
let t = setInterval(reloadDate, 1000);


//Manages the sidebar buttons on each task
let tab_buttons = document.getElementsByClassName("__tab-main");
let sidebars = document.getElementsByClassName("__side-bar");
let titles = document.querySelectorAll(".task .__title");

//Add event listeners to each tab
for(let i = 0; i < tab_buttons.length; i++) {
  tab_buttons[i].addEventListener("click", () => {toggleSideBar(i);});
}

function toggleSideBar(i) {
  if (tab_buttons[i].innerHTML == "〉") {
    sidebars[i].style.width = "15%";
    tab_buttons[i].style.left = "15%";
    tab_buttons[i].innerHTML = "〈";
    titles[i].style.marginLeft = "15%";
  } else {
    sidebars[i].style.width = "0";
    tab_buttons[i].style.left = "0%";
    tab_buttons[i].innerHTML = "〉";
    titles[i].style.marginLeft = "0";
  }
}