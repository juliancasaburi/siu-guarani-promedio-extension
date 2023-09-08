function updatePopup() {
  chrome.storage.local.get(['averageWithoutFails', 'averageWithFails'], function (data) {
    if(data.averageWithoutFails && data.averageWithFails){
      document.getElementById("averageWithoutFails").innerText = "Promedio sin aplazos: " + data.averageWithoutFails.toFixed(2);
      document.getElementById("averageWithFails").innerText = "Promedio con aplazos: " + data.averageWithFails.toFixed(2);
    }
  });
}

document.addEventListener('DOMContentLoaded', updatePopup);