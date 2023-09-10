// Define regular expressions to match scores
const averageWithoutFailsRegex = /(\d+) \(([^)]+)\) Aprobado/g;
const averageWithFailsRegex = /(\d+) \(([^)]+)\) Desaprobado/g;

// Create a MutationObserver to watch for changes in the "kernel_contenido" div
const kernelContenido = document.getElementById("kernel_contenido");
const observer = new MutationObserver(handleKernelContenidoChange);
if (kernelContenido) {
  observer.observe(kernelContenido, { childList: true, subtree: true });

  // Also, check if the "catedras" elements are already present when the page loads
  let catedras = document.getElementsByClassName("catedras");
  if (catedras.length > 0) {
    extractAndCalculateScores();
  }
}

// Initialize score arrays
let scoresWithoutFails = [];
let scoresWithFails = [];

// Function to extract and calculate exam scores
function extractAndCalculateScores() {
  // Extract passed exams from the page content
  extractScores(document.body.innerText, averageWithoutFailsRegex, scoresWithoutFails);

  // Copy the content of scoresWithoutFails to scoresWithFails and add the failed exams
  scoresWithFails = [...scoresWithoutFails];
  extractScores(document.body.innerText, averageWithFailsRegex, scoresWithFails);

  // Calculate the average scores
  const averageWithoutFails = calculateAverage(scoresWithoutFails);
  const averageWithFails = calculateAverage(scoresWithFails);

  // Create a new div element
  var averagesDiv = document.createElement("div");

  // Set the id attribute
  averagesDiv.id = "averagesDiv";

  // Set the inline styles for the new div
  averagesDiv.className = "titulo_operacion";
  averagesDiv.style.backgroundColor = "#f1f0f5"; // White background
  averagesDiv.style.border = "4px";
  averagesDiv.style.borderRadius = "24px";
  averagesDiv.style.padding = "20px 20px";
  averagesDiv.style.margin = "20px 20px";
  averagesDiv.style.textAlign = "center";

  // Create a new h2 element for the title
  var titleElement = document.createElement("h2");

  // Create an anchor element
  var linkElement = document.createElement("a");
  linkElement.href = "https://github.com/juliancasaburi/siu-guarani-unlp-promedio-extension/";

  // Set the text content for the anchor element (the title)
  linkElement.textContent = "Extensión SIU Guaraní UNLP Promedio";

  // Apply an inline style to the h2 element
  titleElement.style.fontWeight = "bold"; // Example: Making it bold

  // Append the anchor element to the title element
  titleElement.appendChild(linkElement);

  // Append the title element to the averagesDiv
  averagesDiv.appendChild(titleElement);

  // Get the div with id "listado"
  var listadoDiv = document.getElementById("listado");

  // Get the parent of the "listadoDiv" div
  var parentOfListadoDiv = listadoDiv.parentElement;

  // Insert the new div before the "listadoDiv" div
  observer.disconnect();
  parentOfListadoDiv.insertBefore(averagesDiv, listadoDiv);

  updateOrCreateAverageDiv("averageWithoutFailsDiv", "Promedio sin aplazos: ", averageWithoutFails, "teal");
  updateOrCreateAverageDiv("averageWithFailsDiv", "Promedio con aplazos: ", averageWithFails, "firebrick");

  // Save both average scores
  chrome.storage.local.set({ 'averageWithoutFails': averageWithoutFails });
  chrome.storage.local.set({ 'averageWithFails': averageWithFails });

  observer.observe(document.getElementById("kernel_contenido"), { childList: true, subtree: true });
}

// Function to extract scores from the page content and store them in the specified array
function extractScores(content, regex, scoresArray) {
  const matches = content.match(regex);
  if (matches) {
    for (const match of matches) {
      const score = parseInt(match.match(/\d+/)[0]);
      scoresArray.push(score);
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
    h3Element.style.display = "inline";
    h3Element.textContent = prefix + average.toFixed(2);

    h3Element.classList.add("titulo-corte");

    // Set the backgroundColor if provided
    if (backgroundColor) {
      h3Element.style.backgroundColor = backgroundColor;
    }

    // Append the h3 element to the newAverageDiv
    averageDiv.appendChild(h3Element);

    // Find the div with ID "averagesDiv"
    const averagesDiv = document.getElementById("averagesDiv");

    // Append the new "averageDiv" to "averagesDiv"
    if (averagesDiv) {
      averagesDiv.appendChild(averageDiv);
    }
  }
}

// Function to be called when the "kernel_contenido" div changes
function handleKernelContenidoChange(mutationsList, observer) {
  // check if the "catedras" elements are present
  let catedras = document.getElementsByClassName("catedras");
  if (catedras.length > 0) {
    extractAndCalculateScores();
  }
}