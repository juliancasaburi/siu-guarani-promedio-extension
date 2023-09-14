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
    calculateProgressBarAndDisplay();
  }
}

function observeKernelContenido() {
  observer.observe(document.getElementById("kernel_contenido"), {
    childList: true,
    subtree: true,
  });
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

    // Add class for styling
    averagesDiv.classList.add("averages");

    // Create a new h2 element for the title and append it to the averagesDiv
    var titleElement = document.createElement("h2");
    titleElement.className = "averages-title";
    averagesDiv.appendChild(titleElement);

    // Create an anchor element
    var linkElement = document.createElement("a");
    linkElement.href =
      "https://github.com/juliancasaburi/siu-guarani-promedio-extension/";

    // Set the text content for the anchor element (the title)
    linkElement.textContent = "Extensión SIU Guaraní Promedio";

    // Append the anchor element to the title element
    titleElement.appendChild(linkElement);

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

/**
 * Extracts scores from the provided content using the given regular expression
 * and stores them in the specified array.
 *
 * @param {string} content - The content to search for scores.
 * @param {RegExp} regex - The regular expression used to identify scores in the content.
 * @param {any[]} scoresArray - The array where extracted scores will be stored.
 */
function extractScores(content, regex, scoresArray) {
  const matches = content.match(regex);
  if (matches) {
    for (const match of matches) {
      const score = parseInt(match.match(/\d+/)[0]);
      scoresArray.push(score);
    }
  }
}

/** 
 * Calculates the average of an array of scores.
 *
 * @param {number[]} scoresArray - An array containing numeric scores to be averaged.
 * @returns {number} The calculated average of the scores or 0 if the array is empty.
 */
function calculateAverage(scoresArray) {
  const totalScores = scoresArray.reduce((sum, score) => sum + score, 0);
  return scoresArray.length > 0 ? totalScores / scoresArray.length : 0;
}

/**
 * Updates or creates a div to display averages.
 *
 * @param {string} divId - The ID for the div element.
 * @param {string} prefix - The prefix text to display before the average.
 * @param {number} average - The average score to display.
 * @param {string} backgroundColor - The background color of the average display element (optional).
 */
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

/**
 * Adds a career completion progress bar.
 * This function is currently enabled for UNLP Informática degrees.
 */
function calculateProgressBarAndDisplay() {
  const degree = getStudentDegree(document);
  const unlpInfoDegrees = getUNLPInfoDegrees();

  // At the moment, it is only enabled for UNLP Informática degrees.
  if (
    degree &&
    unlpInfoDegrees.some(
      (x) =>
        removeDiacritics(x.toLowerCase()) ===
        removeDiacritics(degree.textContent.toLowerCase().trim())
    )
  ) {
    const baseUrl = window.location.origin; // Get the current browser URL as the base URL
    const url = `${baseUrl}/plan_estudio/`; // Define the URL to fetch

    // Fetch the HTML content and extract data
    fetchHTML(url)
      .then((html) => {
        const parseSubjectsResult = parseSubjects(html);
        let optionalsPassedExamsCount = 0;
        let completionPercentage = 0;

        if (parseSubjectsResult.idOptativas) {
          // Setup the fetch
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

          // Perform the fetch operation for optional subjects
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
              observeKernelContenido();
            });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    observeKernelContenido();
  }
}

/**
 * Creates and displays a progress bar.
 *
 * @param {number} progress - The percentage of completion for the progress bar.
 */
function createProgressBar(progress) {
  // Create a div element for the progress bar container
  const divElement = document.createElement("div");
  divElement.classList.add("titulo_operacion");

  // Create a label for the progress bar
  const labelElement = document.createElement("h2");
  labelElement.textContent = "Porcentaje completado de la propuesta"; // Set the text content
  labelElement.classList.add("progressbar-label");

  // Create the progress bar container
  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progressbar-container");

  // Create the progress bar itself
  const progressBar = document.createElement("div");
  progressBar.id = "progress-bar";
  progressBar.classList.add("progressbar");
  progressBar.textContent = progress.toFixed(2) + "%"; // Display progress percentage
  progressBar.style.width = `${Math.max(5, progress)}%`; // Set the width of the progress bar

  // Append the labelElement to divElement
  divElement.appendChild(labelElement);
  // Append the progress bar to the container
  progressBarContainer.appendChild(progressBar);
  // Append the progressBarContainer to divElement
  divElement.appendChild(progressBarContainer);

  // Find the div with ID averagesDiv and append the label and progress bar container to it
  const averagesDiv = document.getElementById("averagesDiv");
  if (averagesDiv) {
    averagesDiv.appendChild(divElement);
  }
}

/**
 * Extracts and parses data from HTML content.
 *
 * @param {string} htmlContent - The HTML content to parse.
 * @returns {object} An object containing extracted data.
 */
function parseSubjects(htmlContent) {
  // Extract the HTML content within the script tag
  var startIndex = htmlContent.indexOf('content":"') + 'content":"'.length;
  var endIndex = htmlContent.lastIndexOf('"});');
  var htmlContent = htmlContent.substring(startIndex, endIndex);

  // Replace escaped HTML tags
  htmlContent = htmlContent.replace(/<\\\//g, "</");
  // Replace &quot; with regular double quotes in the HTML content
  var htmlContent = htmlContent.replace(/&quot;/g, '"').replace(/\\"/g, "");

  // Create a DOMParser instance to parse the HTML content
  const doc = getDOMParser(htmlContent);

  // Get and parse HTML Tables
  const tables = doc.querySelectorAll("table");
  const examCounts = parseSubjectTables(tables);

  // Iterate through the buttons to find the one with the text "Verificar"
  var buttons = doc.querySelectorAll("button");

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
    passedExamsCount: examCounts.trsWithExamenCount,
    withoutExamCount: examCounts.trsWithoutExamenCount,
    idOptativas,
    optativasRequired,
  };
}

// Function to extract the data from the Optional Subjects
function parseOptionalSubjects(htmlContent) {
  // Create a DOMParser instance to parse the HTML content
  const doc = getDOMParser(htmlContent);

  // Get HTML Tables
  const tables = doc.querySelectorAll("table");

  // Parse tables
  const examCounts = parseSubjectTables(tables);

  return examCounts.trsWithExamenCount;
}

/**
 * Extracts and parses data from optional subjects HTML content.
 *
 * @param {string} htmlContent - The HTML content of optional subjects to parse.
 * @returns {number} The count of optional subjects with exams.
 */
function parseSubjectTables(tables) {
  // Subjects regex
  const studyPlanPassedSubjectsRegex = /^\d+\s?\(Aprobado\)$/;

  // Initialize values
  let trsWithExamenCount = 0;
  let trsWithoutExamenCount = 0;

  // Loop through each table
  tables.forEach((table, tableIndex) => {
    const trs = table.querySelectorAll("tr.materia");

    trs.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      let hasExamen = false;

      tds.forEach((td) => {
        const text = td.textContent.trim();
        if (studyPlanPassedSubjectsRegex.test(text)) {
          hasExamen = true;
          // If a match is found, exit the loop early
          return;
        }
      });

      if (hasExamen) {
        trsWithExamenCount++;
      } else {
        trsWithoutExamenCount++;
      }
    });
  });

  return {
    trsWithExamenCount,
    trsWithoutExamenCount,
  };
}
