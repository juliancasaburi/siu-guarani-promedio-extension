// Define regular expressions to match scores
const averageWithoutFailsRegex = /(\d+) \(([^)]+)\) Aprobado/g;
const averageWithFailsRegex = /(\d+) \(([^)]+)\) Desaprobado/g;

// Initialize score arrays
const scoresWithoutFails = [];
const scoresWithFails = [];

// Function to extract and calculate exam scores
function extractAndCalculateScores() {
  // Extract scores from the page content
  extractScoresWithoutFails(document.body.innerText, averageWithoutFailsRegex, scoresWithoutFails);
  extractScoresWithFails(document.body.innerText, averageWithFailsRegex, scoresWithFails);

  // Calculate the average scores
  const averageWithoutFails = calculateAverage(scoresWithoutFails);
  const averageWithFails = calculateAverage(scoresWithFails);

  // Update or create the averageDivs
  updateOrCreateAverageDiv("averageWithoutFailsDiv", "Promedio sin aplazos: ", averageWithoutFails, "teal");
  updateOrCreateAverageDiv("averageWithFailsDiv", "Promedio con aplazos: ", averageWithFails, "firebrick");

  // Save both average scores
  chrome.storage.local.set({ 'averageWithoutFails': averageWithoutFails });
  chrome.storage.local.set({ 'averageWithFails': averageWithFails });
}

// Function to extract scores with fails from the page content and store them in the specified array
function extractScoresWithFails(content, regex, scoresArray) {
  const matches = content.match(regex);
  if (matches) {
    for (const match of matches) {
      const score = parseInt(match.match(/\d+/)[0]);
      scoresArray.push(score);
    }
  }
}

// Function to extract scores without fails from the page content and store them in the specified array
function extractScoresWithoutFails(content, regex, scoresArray) {
  const matches = content.match(regex);
  if (matches) {
    for (const match of matches) {
      const score = parseInt(match.match(/\d+/)[0]);
      scoresArray.push(score);
      scoresWithFails.push(score);
    }
  }
}

// Function to calculate the average of an array of scores
function calculateAverage(scoresArray) {
  const totalScores = scoresArray.reduce((sum, score) => sum + score, 0);
  return scoresArray.length > 0 ? totalScores / scoresArray.length : 0;
}

// Function to update or create an averageDiv
function updateOrCreateAverageDiv(divId, prefix, average, backgroundColor) {
  // Find the existing averageDiv by its ID
  let averageDiv = document.getElementById(divId);

  if (!averageDiv) {
    // Create a new div element for the average score
    averageDiv = document.createElement("div");
    averageDiv.id = divId;
    averageDiv.classList.add("catedra");

    // Create an h3 element with the class "titulo-corte" and set its text content
    const h3Element = document.createElement("h3");
    h3Element.textContent = prefix + average.toFixed(2) + " [Extensión SIU Guaraní UNLP Promedio]";

    h3Element.classList.add("titulo-corte");

    // Set the backgroundColor if provided
    if (backgroundColor) {
      h3Element.style.backgroundColor = backgroundColor;
    }

    // Append the h3 element to the newAverageDiv
    averageDiv.appendChild(h3Element);

    // Find the div with ID "listado"
    const listadoDiv = document.getElementById("listado");

    // Insert the new average div before the "listado" div
    if (listadoDiv) {
      listadoDiv.parentNode.insertBefore(averageDiv, listadoDiv);
    }
  }
}

// Function to be called when the "kernel_contenido" div changes
function handleKernelContenidoChange(mutationsList, observer) {
  let catedras = document.getElementsByClassName("catedras");
  if (catedras.length > 0) {
    extractAndCalculateScores();
  }
}

// Create a MutationObserver to watch for changes in the "kernel_contenido" div
const kernelContenido = document.getElementById("kernel_contenido");
if (kernelContenido) {
  const observer = new MutationObserver(handleKernelContenidoChange);
  observer.observe(kernelContenido, { childList: true, subtree: true });
}