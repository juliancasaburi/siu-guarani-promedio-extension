// Define regular expressions to match scores
const averageScoreWithoutFailsRegex =
  /(\d+) \(([^)]+)\) (Aprobado|Promocionado)/g;
const averageScoreWithFailsRegex = /(\d+) \(([^)]+)\) (Desaprobado|Reprobado)/g;

// Create a MutationObserver to watch for changes in the "kernel_contenido" div
const kernelContenido = document.getElementById("kernel_contenido");
const observer = new MutationObserver(handleKernelContenidoChange);
if (kernelContenido) {
  observer.observe(kernelContenido, { childList: true, subtree: true });
  // Also, check if the "catedras" elements are already present when the page loads
  handleKernelContenidoChange();
}

// Function to be called when the "kernel_contenido" div changes
function handleKernelContenidoChange() {
  // check if the "catedras" elements are present
  let catedras = document.getElementsByClassName("catedras");
  if (catedras.length > 0) {
    observer.disconnect();
    calculateScoresAndDisplay();
    calculateProgressBarAndDisplay()
  }
}

// Function to extract and calculate exam scores
function calculateScoresAndDisplay() {
  // Initialize score arrays
  let scoresWithoutFails = [];
  let scoresWithFails = [];

  // Extract passed exams from the page content
  extractScores(
    document.body.innerText,
    averageScoreWithoutFailsRegex,
    scoresWithoutFails
  );

  // Copy the content of scoresWithoutFails to scoresWithFails and add the failed exams
  scoresWithFails = [...scoresWithoutFails];
  extractScores(
    document.body.innerText,
    averageScoreWithFailsRegex,
    scoresWithFails
  );

  // Calculate the average scores
  const averageScoreWithoutFails = calculateAverage(scoresWithoutFails);
  const averageScoreWithFails = calculateAverage(scoresWithFails);

  // Check if the element with id "averagesDiv" doesn't exist
  if (!document.getElementById("averagesDiv")) {
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
    linkElement.href =
      "https://github.com/juliancasaburi/siu-guarani-promedio-extension/";

    // Set the text content for the anchor element (the title)
    linkElement.textContent = "Extensión SIU Guaraní Promedio";

    // Apply an inline style to the h2 element
    titleElement.style.fontWeight = "bold";

    // Append the anchor element to the title element
    titleElement.appendChild(linkElement);

    // Append the title element to the averagesDiv
    averagesDiv.appendChild(titleElement);

    // Get the div with id "listado"
    var listadoDiv = document.getElementById("listado");

    // Get the parent of the "listadoDiv" div
    var parentOfListadoDiv = listadoDiv.parentElement;

    // Insert the new div before the "listadoDiv" div
    parentOfListadoDiv.insertBefore(averagesDiv, listadoDiv);
  }

  // Create divs and append them to averagesDiv
  updateOrCreateAverageDiv(
    "averageWithoutFailsDiv",
    "Promedio sin aplazos: ",
    averageScoreWithoutFails,
    "teal"
  );
  updateOrCreateAverageDiv(
    "averageWithFailsDiv",
    "Promedio con aplazos: ",
    averageScoreWithFails,
    "firebrick"
  );

  // Save both average scores
  chrome.storage.local.set({
    averageScoreWithoutFails: averageScoreWithoutFails,
  });
  chrome.storage.local.set({ averageScoreWithFails: averageScoreWithFails });
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

// Function to add the career completion progress bar
function calculateProgressBarAndDisplay() {
  // Add the career completion progress bar (At the moment, it is only enabled for UNLP Informática)
  const unlpInfoDegrees = [
    "Licenciatura en Sistemas",
    "Licenciatura en Informática",
    "Ingeniería en Computación",
    "Analista Programador Universitario",
    "Analista en Tecnologías de la Información y la Comunicación",
    "ATIC",
  ];

  degree = document.getElementById("js-dropdown-toggle-carreras");

  if (
    unlpInfoDegrees.some(
      (x) =>
        removeDiacritics(x.toLowerCase()) ===
        removeDiacritics(degree.textContent.toLowerCase().trim())
    )
  ) {
    const baseUrl = window.location.origin; // Get the current browser URL as the base URL
    const url = `${baseUrl}/plan_estudio/`; // Define the URL to fetch
    fetchHTML(url) // Fetch the HTML content and extract data
      .then((html) => {
        const parseSubjectsResult = parseSubjects(html);
        let optionalsPassedExamsCount = 0;
        let completionPercentage = 0;

        // Perform the second fetch
        const optativasUrl = `${baseUrl}/plan_estudio/optativas`;

        const options = {
          headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language":
              "es-AR,es;q=0.9,es-419;q=0.8,en;q=0.7,pt;q=0.6,gl;q=0.5,ru;q=0.4",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua":
              '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          body: `elemento=${parseSubjectsResult.idOptativas}`,
          method: "POST",
        };

        if (parseSubjectsResult.idOptativas) {
          // Perform the fetch operation
          fetch(optativasUrl, options)
            .then((response) =>
              response.json().then((data) => {
                optionalsPassedExamsCount = parseOptionalSubjects(data.cont);
                // Including every optional subject in the calculation could potentially result in a percentage greater than 100 (There can be more optionals with exams than the required credits).
                optionalsPassedExamsCount = Math.min(
                  parseSubjectsResult.optativasRequired,
                  optionalsPassedExamsCount
                ); // Workaround
                completionPercentage =
                  ((parseSubjectsResult.passedExamsCount +
                    optionalsPassedExamsCount) /
                    (parseSubjectsResult.passedExamsCount +
                      parseSubjectsResult.withoutExamCount +
                      parseSubjectsResult.optativasRequired)) *
                  100;
                // Create the progress bar
                createProgressBar(completionPercentage);
              })
            )
            .catch((error) => {
              console.error(
                "There was a problem with the fetch operation:",
                error
              );
            })
            .finally(() => {
              observer.observe(document.getElementById("kernel_contenido"), {
                childList: true,
                subtree: true,
              });
            });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function createProgressBar(progress) {
  // Create a label for the progress bar
  const labelElement = document.createElement("h2");
  labelElement.textContent = "Porcentaje completado de la propuesta"; // Set the text content
  labelElement.style.fontWeight = "bold"; // Make the label bold
  labelElement.style.padding = "10px 0"; // Add padding to the label

  // Create the progress bar container
  const progressBarContainer = document.createElement("div");
  progressBarContainer.style.height = "20px"; // Set the height of the progress bar container to 20px
  progressBarContainer.style.backgroundColor = "grey"; // Set a grey background color for the container
  progressBarContainer.style.width = "100%"; // Set the initial width to 100% to cover the grey background
  progressBarContainer.style.borderRadius = "10px"; // Add rounded corners to the container
  progressBarContainer.style.display = "flex"; // Use flexbox to center-align vertically

  // Create the progress bar itself
  const progressBar = document.createElement("div");
  progressBar.id = "progress-bar";
  progressBar.style.height = "100%"; // Set the height of the progress bar to 100% to fill the container
  progressBar.style.backgroundColor = "green"; // Set a green color for the filled part of the progress bar
  progressBar.style.width = "0%"; // Initial width
  progressBar.style.borderRadius = "10px"; // Add rounded corners to the progress bar
  progressBar.style.fontWeight = "bold"; // Make the text bold
  progressBar.style.color = "#fff"; // Set the text color to white for better contrast
  progressBar.style.textAlign = "center";
  progressBar.textContent = progress.toFixed(2) + "%";
  progressBar.style.width = `${Math.max(5, progress)}%`;

  // Append the progress bar to the container
  progressBarContainer.appendChild(progressBar);

  // Find the div with ID averagesDiv and append the label and progress bar container to it
  const averagesDiv = document.getElementById("averagesDiv");
  if (averagesDiv) {
    averagesDiv.appendChild(labelElement);
    averagesDiv.appendChild(progressBarContainer);
  }
}

// Function to extract the data from the HTML content
function parseSubjects(html) {
  // Extract the HTML content within the script tag
  var startIndex = html.indexOf('content":"') + 'content":"'.length;
  var endIndex = html.lastIndexOf('"});');
  var htmlContent = html.substring(startIndex, endIndex);

  // Replace escaped HTML tags
  htmlContent = htmlContent.replace(/<\\\//g, "</");
  // Replace &quot; with regular double quotes in the HTML content
  var htmlContent = htmlContent.replace(/&quot;/g, '"').replace(/\\"/g, "");

  // Create a DOM parser and parse the HTML
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlContent, "text/html");

  // Step 2: Select the tables within the HTML content
  const tables = doc.querySelectorAll("table");

  // Initialize values
  let trsWithExamenCount = 0;
  let trsWithoutExamenCount = 0;
  let idOptativas = 0;
  let optativasRequired = 0;

  // Step 3: Loop through each table
  tables.forEach((table, tableIndex) => {
    const tbody = table.querySelector("tbody");
    if (!tbody) return; // Skip tables without tbody

    // Check if any td within this tbody contains "propuesta"
    const hasPropuesta = [...tbody.querySelectorAll("td")].some((td) =>
      td.textContent.trim().toLowerCase().includes("propuesta")
    );

    if (hasPropuesta) {
      // Skip this tbody
      return;
    }

    const trs = tbody.querySelectorAll("tr");

    trs.forEach((tr) => {
      if (tr.classList.contains("materia")) {
        const tds = tr.querySelectorAll("td");
        let hasExamen = false;

        tds.forEach((td) => {
          const text = td.textContent.trim();
          if (text === "Examen" || text === "Promocion") {
            hasExamen = true;
          }
        });

        if (hasExamen) {
          trsWithExamenCount++;
        } else {
          trsWithoutExamenCount++;
        }
      }
    });
  });

  // Find the button with text "Verificar"
  // Get all button elements on the page
  var buttons = doc.querySelectorAll("button");

  // Iterate through the buttons to find the one with the text "Verificar"
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent.trim() === "Verificar") {
      // Found the button with the text "Verificar"
      var buttonWithTextVerificar = buttons[i];

      // Get the value of the data-materia attribute
      idOptativas = buttonWithTextVerificar.getAttribute("data-materia");

      // Get the required credits (E.g. 300 for Licenciatura en Sistemas)
      optativasRequired = getFirstDigit(
        buttonWithTextVerificar.getAttribute("data-parametros")
      );

      // Break the loop since we found the button
      break;
    }
  }

  return {
    passedExamsCount: trsWithExamenCount,
    withoutExamCount: trsWithoutExamenCount,
    idOptativas,
    optativasRequired,
  };
}

// Function to extract the data from the Optional Subjects
function parseOptionalSubjects(html) {
  // Initialize values
  let trsWithExamenCount = 0;

  // Create a DOM parser and parse the HTML
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, "text/html");

  // Step 2: Select the tables within the HTML content
  const tables = doc.querySelectorAll("table");

  // Step 3: Loop through each table
  tables.forEach((table, tableIndex) => {
    const tbody = table.querySelector("tbody");
    if (!tbody) return; // Skip tables without tbody

    // Check if any td within this tbody contains "propuesta"
    const hasPropuesta = [...tbody.querySelectorAll("td")].some((td) =>
      td.textContent.trim().toLowerCase().includes("propuesta")
    );

    if (hasPropuesta) {
      // Skip this tbody
      return;
    }

    const trs = tbody.querySelectorAll("tr");

    trs.forEach((tr) => {
      if (tr.classList.contains("materia")) {
        const tds = tr.querySelectorAll("td");
        let hasExamen = false;

        tds.forEach((td) => {
          const text = td.textContent.trim();
          if (text === "Examen" || text === "Promocion") {
            hasExamen = true;
          }
        });

        if (hasExamen) {
          trsWithExamenCount++;
        }
      }
    });
  });

  return trsWithExamenCount;
}

// Function to fetch the HTML content
async function fetchHTML(url) {
  try {
    const response = await fetch(url, { redirect: "error" });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const html = await response.text();
    return html;
  } catch (error) {
    console.error("Error fetching HTML:", error);
    throw error;
  }
}

function getFirstDigit(number) {
  // Convert the number to a string
  let numberStr = number.toString();

  // Check if the number is negative
  if (numberStr[0] === "-") {
    // If it's negative, return the second character (the first digit)
    return parseInt(numberStr[1]);
  } else {
    // If it's positive, return the first character (the first digit)
    return parseInt(numberStr[0]);
  }
}

function removeDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
