function updatePopup() {
  chrome.storage.local.get(['averageScoreWithoutFails', 'averageScoreWithFails'], function (data) {
    if(data.averageScoreWithoutFails && data.averageScoreWithFails){
      // Get the noData <h2> element
      var noData = document.getElementById("noData");

      // Set up averageScoreWithFails
      var text = document.createElement("h2");
      text.style.color = "teal"; // Set text color
      text.innerText = "Promedio sin aplazos: " + data.averageScoreWithoutFails.toFixed(2);

      // Replace the averageScoreWithoutFails <h2> element
      noData.parentNode.replaceChild(text, noData);

      // Get the instructions <h2> element
      var instructions = document.getElementById("instructions");

      // Set up averageScoreWithtFails
      var text = document.createElement("h2");
      text.style.color = "firebrick"; // Set text color
      text.innerText = "Promedio con aplazos: " + data.averageScoreWithFails.toFixed(2);

      // Replace the instructions <h2> element
      instructions.parentNode.replaceChild(text, instructions);
    }
  });
}

document.addEventListener('DOMContentLoaded', updatePopup);

document.addEventListener("DOMContentLoaded", function () {
  var link = document.getElementById("instructions");
  link.addEventListener("click", function (event) {
    event.preventDefault();
    window.open("https://autogestion.guarani.unlp.edu.ar/historia_academica", "_blank");
  });
});