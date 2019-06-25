// Creating the card for each day of the week
days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

let container = document.querySelector(".calendar");
let template = document.getElementById("cardTemplate");

for(day of days) {
  card = template.cloneNode(true);
  card.innerHTML = card.innerHTML.replace("Monday", day)
  container.appendChild(card);
}
