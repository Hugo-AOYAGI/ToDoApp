

// Setting up all the buttons for the day selection bar
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "September", "October", "November", "December"];

let body = document.querySelector("body");
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

// Manages the navigation bar button
let nav_btn = document.querySelector(".nav-btn");
nav_btn.addEventListener("click", () => {toggleNavBar();});

// Allows for the navigation bar to appear and disappear
toggleNavBar = () => {
  if (selection_bar.style.display == "none" || selection_bar.style.display == "" ) {
    body.style.gridTemplate = '"head head timer" 2fr "nav main main" 12fr "nav foot foot" 1fr / 1fr 3.5fr 1.5fr';
    selection_bar.style.display = "flex";
    nav_btn.style.transform = "rotateZ(90deg)";
  } else {
    body.style.gridTemplate = '"head head timer" 2fr "main main main" 12fr "foot foot foot" 1fr / 1fr 3.5fr 1.5fr';
    selection_bar.style.display = "none";
    nav_btn.style.transform = "rotateZ(0deg)";
  }
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
  // Formats the date with leading zeros and dashes
  let txt_date = `${leadingZero(d.getDate())} /
                  ${leadingZero(d.getMonth()+1)} /
                  ${leadingZero(d.getFullYear())}`;
  // Formats the time with leading zeros and semi-colons
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

// Add event listeners to each tab
for(let i = 0; i < tab_buttons.length; i++) {
  tab_buttons[i].addEventListener("click", () => {toggleSideBar(i);});
}

// Displays the transition when the button is pressed
function toggleSideBar(i) {
  // Checks whether the sidebar is already shown or not
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

// Manages the more-info button on each task which displays the full task card
let more_info_buttons = document.getElementsByClassName("__more-button");
let tasks = document.getElementsByClassName("task");
let time_divs = document.getElementsByClassName("__start-time");
let task_cards = document.getElementsByClassName("task-card");


// Add event listeners to each button
for(let i = 0; i < tasks.length; i++) {
  more_info_buttons[i].addEventListener("click", () => {toggleTaskCard(i);});
}

// Displays the transition when the button is pressed
function toggleTaskCard(i) {
  // Checks whether the card is already shown or not
  if (tasks[i].style.height == "20%" || tasks[i].style.height == "") {
    if (tab_buttons[i].innerHTML != "〉") {
      toggleSideBar(i);
    }
    tasks[i].style.height = "10%";
    more_info_buttons[i].style.transform = "rotateZ(0deg)";
    time_divs[i].style.opacity = "0";
    tab_buttons[i].style.left = "-1em";
    setTimeout(() => {task_cards[0].style.transform = "translateX(0)";}, 450);
    // Hides all the other tasks
    for(let j = 0; j < tasks.length; j++) {
      if (j != i){
        setTimeout(() => {
          tasks[j].style.display = "none";
        }, 300);
      }
      tasks[j].style.left = "-100%";
      setTimeout(() => {
        tasks[i].style.left = "0";
      }, 600);
      
    }
  } else {
    tasks[i].style.height = "20%";
    more_info_buttons[i].style.transform = "rotateZ(45deg)";
    time_divs[i].style.opacity = "1";
    tab_buttons[i].style.left = "0";
    tasks[i].style.left = "-100%";
    task_cards[0].style.transform = "translateX(100%)";
    // Unhides all the other tasks
    for(let j = 0; j < tasks.length; j++) {
      if (j != i){
        setTimeout(() => {
          tasks[j].style.display = "block";
        }, 300);
      }
      setTimeout(() => {
        tasks[j].style.left = "0";
      }, 600);
    }
  }
}

