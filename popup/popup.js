/**
 * Updates the extension popup page with average scores from Chrome local storage.
 */
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

// When the DOM content is fully loaded, call the 'updatePopup' function
document.addEventListener('DOMContentLoaded', updatePopup);

// Add a click event listener to the 'instructions' element
document.addEventListener("DOMContentLoaded", function () {
  var link = document.getElementById("instructions");
  link.addEventListener("click", function (event) {
    event.preventDefault();

    // Get the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Extract the URL from the tab object
      const currentUrl = tabs[0].url;

      // Create the new URL
      const newUrl = currentUrl.replace(/\/+$/, '').replace(/\/[^/]*$/, '') + "/historia_academica";

      // Navigate to the new URL
      chrome.tabs.update({ url: newUrl });
    });
  });
});