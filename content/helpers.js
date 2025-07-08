/**
 * Fetches HTML content from a given URL.
 *
 * @param {string} url - The URL from which to fetch the HTML content.
 * @returns {Promise<string>} A promise that resolves with the fetched HTML content.
 * @throws {Error} If there is a network error or if the response status is not OK.
 */
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

/**
 * Retrieves the first digit of a given number.
 *
 * @param {number|string} number - The number from which to extract the first digit.
 * @returns {number} The first digit of the given number.
 * @throws {Error} If the input is not a valid number or has no digits.
 */
function getFirstDigit(number) {
  // Convert the number to a string
  let numberStr = number.toString();

  // Check if the string is empty or doesn't contain digits
  if (!numberStr || !/\d/.test(numberStr)) {
    throw new Error("Input must contain at least one digit");
  }

  // Find the first digit in the string
  const firstDigitMatch = numberStr.match(/\d/);
  if (firstDigitMatch) {
    return parseInt(firstDigitMatch[0]);
  }
  
  throw new Error("No digit found in input");
}

/**
 * Removes diacritics (accented characters) from a given text.
 *
 * @param {string} text - The text from which diacritics will be removed.
 * @returns {string} The text with diacritics removed.
 */
function removeDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Creates a DOM parser and parses HTML content into a DOM document.
 *
 * @param {string} htmlContent - The HTML content to parse.
 * @returns {Document} A DOM document representing the parsed HTML.
 */
function getDOMParser(htmlContent) {
  // Create a DOM parser and parse the HTML
  var parser = new DOMParser();
  return parser.parseFromString(htmlContent, "text/html");
}

/**
 * Retrieves the student's degree element from the document.
 *
 * @param {Document} document - The document object representing the web page.
 * @returns {HTMLElement | null} The student's degree element or null if not found.
 */
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

/**
 * Retrieves a list of degrees offered by UNLP Informática.
 *
 * @returns {string[]} An array of degree names.
 */
function getUNLPInformaticaDegrees() {
  return [
    "Licenciatura en Sistemas",
    "Licenciatura en Informática",
    "Ingeniería en Computación",
    "Analista Programador Universitario",
    "Analista en Tecnologías de la Información y la Comunicación",
    "ATIC",
  ];
}

/**
 * Constructs and returns options for making a POST request to retrieve optional subjects.
 *
 * @param {string} idOptativas - The ID of the optativas element to retrieve.
 * @returns {Object} - An object containing the HTTP request options.
 */
function getOptativasFetchOptions(idOptativas) {
  // Define the headers for the request
  const headers = {
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  };

  // Create the request body with the provided idOptativas
  const body = `elemento=${idOptativas}`;

  // Define the HTTP method as POST
  const method = "POST";

  // Construct and return the options object
  return {
    headers,
    body,
    method,
  };
}
