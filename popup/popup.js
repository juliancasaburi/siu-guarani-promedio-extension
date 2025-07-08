/**
 * Creates a percentage bar element for completion percentage
 * @param {number} percentage - The completion percentage (0-100)
 * @param {string} color - The color for the progress bar
 * @returns {HTMLElement} - The percentage bar container
 */
function createPercentageBar(percentage, color) {
  // Create container for the percentage bar
  var barContainer = document.createElement("div");
  barContainer.className = "percentage-bar-container";
  
  // Create the background bar
  var barBackground = document.createElement("div");
  barBackground.className = "percentage-bar-background";
  
  // Create the progress bar
  var barProgress = document.createElement("div");
  barProgress.className = "percentage-bar-progress";
  barProgress.style.backgroundColor = color;
  barProgress.style.width = percentage.toFixed(2) + "%"; // Use actual percentage value
  
  // Create percentage text
  var percentageText = document.createElement("span");
  percentageText.className = "percentage-text";
  percentageText.innerText = percentage.toFixed(2) + "%";
  
  // Assemble the bar
  barBackground.appendChild(barProgress);
  barContainer.appendChild(barBackground);
  barContainer.appendChild(percentageText);
  
  return barContainer;
}

/**
 * Updates the extension popup page with average scores from browser local storage.
 */
function updatePopup() {
  // Small delay to ensure polyfill is loaded
  setTimeout(() => {
    // Support both chrome.* and browser.* APIs
    const storageAPI = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : chrome.storage;
    
    // Get data from storage
    const getStorageData = () => {
      if (typeof browser !== 'undefined' && browser.storage) {
        // Firefox/WebExtension polyfill - returns Promise
        return browser.storage.local.get(['averageScoreWithoutFails', 'averageScoreWithFails', 'completionPercentage']);
      } else {
        // Chrome - uses callback, convert to Promise
        return new Promise((resolve) => {
          chrome.storage.local.get(['averageScoreWithoutFails', 'averageScoreWithFails', 'completionPercentage'], resolve);
        });
      }
    };

    getStorageData().then(function (data) {
      if(data.averageScoreWithoutFails && data.averageScoreWithFails){
        
        // Get the info-box container
        var infoBox = document.querySelector(".info-box");

        // Clear the existing content
        if (infoBox) {
          infoBox.innerHTML = "";
        }

        // Set up averageScoreWithoutFails
        var averageWithoutFailsElement = document.createElement("h2");
        averageWithoutFailsElement.style.color = "teal"; // Set text color
        averageWithoutFailsElement.innerText = "Promedio sin aplazos: " + data.averageScoreWithoutFails.toFixed(2);

        // Add the first average to the info box
        if (infoBox) {
          infoBox.appendChild(averageWithoutFailsElement);
        }

        // Set up averageScoreWithFails
        var averageWithFailsElement = document.createElement("h2");
        averageWithFailsElement.style.color = "firebrick"; // Set text color
        averageWithFailsElement.innerText = "Promedio con aplazos: " + data.averageScoreWithFails.toFixed(2);

        // Create a single percentage bar using the completion percentage if available
        var percentageBar = null;
        if (data.completionPercentage) {
          percentageBar = createPercentageBar(data.completionPercentage, "#0078D4");
        }

        // Create a container for the average with fails and the percentage bar
        var withFailsContainer = document.createElement("div");
        withFailsContainer.className = "score-container";
        withFailsContainer.appendChild(averageWithFailsElement);
        if (percentageBar) {
          withFailsContainer.appendChild(percentageBar);
        }

        // Add the second average and percentage bar to the info box
        if (infoBox) {
          infoBox.appendChild(withFailsContainer);
        }
      }
    }).catch(function(error) {
      // Storage access failed, extension will show default state
    });
  }, 100); // 100ms delay to ensure polyfill is ready
}

// When the DOM content is fully loaded, call the 'updatePopup' function
document.addEventListener('DOMContentLoaded', updatePopup);

// Add a click event listener to the 'instructions' element
document.addEventListener("DOMContentLoaded", function () {
  var link = document.getElementById("instructions");
  if (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      // Support both chrome.* and browser.* APIs for tabs
      const getTabsData = () => {
        if (typeof browser !== 'undefined' && browser.tabs) {
          // Firefox/WebExtension polyfill - returns Promise
          return browser.tabs.query({ active: true, currentWindow: true });
        } else {
          // Chrome - uses callback, convert to Promise
          return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, resolve);
          });
        }
      };

      const updateTab = (url) => {
        if (typeof browser !== 'undefined' && browser.tabs) {
          // Firefox/WebExtension polyfill - returns Promise
          return browser.tabs.update({ url: url });
        } else {
          // Chrome - uses callback
          return chrome.tabs.update({ url: url });
        }
      };

      // Get the active tab in the current window
      getTabsData().then(function (tabs) {
        // Extract the URL from the tab object
        const currentUrl = tabs[0].url;

        // Create the new URL
        const newUrl = currentUrl.replace(/\/+$/, '').replace(/\/[^/]*$/, '') + "/historia_academica";

        // Navigate to the new URL
        updateTab(newUrl);
      }).catch(function(error) {
        console.error('Error updating tab:', error);
      });
    });
  }
});