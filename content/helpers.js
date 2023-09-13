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

function getDOMParser(htmlContent) {
  // Create a DOM parser and parse the HTML
  var parser = new DOMParser();
  return parser.parseFromString(htmlContent, "text/html");
}

function getStudentDegree(document) {
  const degreeById = document.getElementById("js-dropdown-toggle-carreras");

  if (degreeById) {
    return degreeById;
  } else {
    // Students enrolled in a single career
    const degreeByClass = document.querySelector(".control-label-carrera");
    return degreeByClass || null; // Return null if no matching elements found
  }
}

function getUNLPInfoDegrees(){
    return [
        "Licenciatura en Sistemas",
        "Licenciatura en Informática",
        "Ingeniería en Computación",
        "Analista Programador Universitario",
        "Analista en Tecnologías de la Información y la Comunicación",
        "ATIC",
      ];
}
