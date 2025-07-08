// ================================
// CONSTANTS AND CONFIGURATION
// ================================

const REGEX_PATTERNS = {
  PASSED_SCORES: /(\d+) \(([^)]+)\) (Aprobado|Promocionado)/g,
  FAILED_SCORES: /(\d+) \(([^)]+)\) (Desaprobado|Reprobado)/g,
  STUDY_PLAN_PASSED: /^\d+\s?\(Aprobado\)$/
};

const UI_CONSTANTS = {
  MIN_PROGRESS_BAR_WIDTH: 5,
  EXTENSION_GITHUB_URL: "https://github.com/juliancasaburi/siu-guarani-promedio-extension/",
  COLORS: {
    WITHOUT_FAILS: "teal",
    WITH_FAILS: "firebrick"
  }
};

const SELECTORS = {
  KERNEL_CONTENIDO: "kernel_contenido",
  CATEDRAS: "catedras",
  AVERAGES_DIV: "averagesDiv",
  LISTADO: "listado"
};

// ================================
// MAIN INITIALIZATION
// ================================

class SIUGuaraniExtension {
  constructor() {
    this.observer = null;
    this.kernelContenido = null;
    this.init();
  }

  init() {
    this.kernelContenido = document.getElementById(SELECTORS.KERNEL_CONTENIDO);
    if (this.kernelContenido) {
      this.setupObserver();
      this.handleKernelContenidoChange();
    }
  }

  setupObserver() {
    this.observer = new MutationObserver(() => this.handleKernelContenidoChange());
    this.observer.observe(this.kernelContenido, { childList: true, subtree: true });
  }

  handleKernelContenidoChange() {
    const catedras = document.getElementsByClassName(SELECTORS.CATEDRAS);
    if (catedras.length > 0 && !document.getElementById(SELECTORS.AVERAGES_DIV)) {
      this.observer.disconnect();
      this.calculateAndDisplayAverages();
      this.calculateAndDisplayProgressBar();
    }
  }

  observeKernelContenido() {
    if (this.observer && this.kernelContenido) {
      this.observer.observe(this.kernelContenido, {
        childList: true,
        subtree: true,
      });
    }
  }

  // ================================
  // SCORE CALCULATION METHODS
  // ================================

  calculateAndDisplayAverages() {
    const scoreData = this.extractAllScores();
    const averages = this.calculateAverages(scoreData);
    
    this.createAveragesContainer();
    this.displayAverages(averages);
    this.saveAveragesToStorage(averages);
  }

  extractAllScores() {
    const pageContent = document.body.innerText;
    const scoresWithoutFails = this.extractScores(pageContent, REGEX_PATTERNS.PASSED_SCORES);
    const scoresWithFails = [...scoresWithoutFails, ...this.extractScores(pageContent, REGEX_PATTERNS.FAILED_SCORES)];
    
    return { scoresWithoutFails, scoresWithFails };
  }

  extractScores(content, regex) {
    const matches = content.match(regex);
    if (!matches) return [];
    
    return matches.map(match => {
      const scoreMatch = match.match(/\d+/);
      return scoreMatch ? parseInt(scoreMatch[0]) : 0;
    }).filter(score => score > 0);
  }

  calculateAverages({ scoresWithoutFails, scoresWithFails }) {
    return {
      withoutFails: this.calculateAverage(scoresWithoutFails),
      withFails: this.calculateAverage(scoresWithFails)
    };
  }

  calculateAverage(scoresArray) {
    if (scoresArray.length === 0) return 0;
    const total = scoresArray.reduce((sum, score) => sum + score, 0);
    return total / scoresArray.length;
  }

  // ================================
  // UI CREATION METHODS
  // ================================

  createAveragesContainer() {
    if (document.getElementById(SELECTORS.AVERAGES_DIV)) return;

    const averagesDiv = this.createElement('div', {
      id: SELECTORS.AVERAGES_DIV,
      className: 'averages'
    });

    const titleElement = this.createTitleElement();
    averagesDiv.appendChild(titleElement);

    this.insertAveragesContainer(averagesDiv);
  }

  createTitleElement() {
    const titleElement = this.createElement('h2', { className: 'averages-title' });
    const linkElement = this.createElement('a', {
      href: UI_CONSTANTS.EXTENSION_GITHUB_URL,
      textContent: 'Extensión SIU Guaraní Promedio'
    });
    titleElement.appendChild(linkElement);
    return titleElement;
  }

  insertAveragesContainer(averagesDiv) {
    const listadoDiv = document.getElementById(SELECTORS.LISTADO);
    if (listadoDiv && listadoDiv.parentElement) {
      listadoDiv.parentElement.insertBefore(averagesDiv, listadoDiv);
    }
  }

  displayAverages({ withoutFails, withFails }) {
    this.createAverageDiv(
      "averageWithoutFailsDiv",
      "Promedio sin aplazos: ",
      withoutFails,
      UI_CONSTANTS.COLORS.WITHOUT_FAILS
    );
    this.createAverageDiv(
      "averageWithFailsDiv",
      "Promedio con aplazos: ",
      withFails,
      UI_CONSTANTS.COLORS.WITH_FAILS
    );
  }

  createAverageDiv(divId, prefix, average, backgroundColor) {
    if (document.getElementById(divId)) return;

    const averageDiv = this.createElement('div', {
      id: divId,
      className: 'catedra'
    });

    const h3Element = this.createElement('h3', {
      className: 'titulo-corte',
      textContent: prefix + average.toFixed(2),
      style: {
        display: 'inline',
        backgroundColor: backgroundColor
      }
    });

    averageDiv.appendChild(h3Element);

    const averagesDiv = document.getElementById(SELECTORS.AVERAGES_DIV);
    if (averagesDiv) {
      averagesDiv.appendChild(averageDiv);
    }
  }

  saveAveragesToStorage({ withoutFails, withFails }) {
    // Small delay to ensure polyfill is loaded, then support both chrome.* and browser.* APIs
    setTimeout(() => {
      const storageAPI = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : chrome.storage;
      
      storageAPI.local.set({
        averageScoreWithoutFails: withoutFails,
        averageScoreWithFails: withFails
      });
    }, 50);
  }

  saveCompletionPercentageToStorage(completionPercentage) {
    ('Saving completion percentage:', completionPercentage + '%'); // Debug log
    
    // Small delay to ensure polyfill is loaded, then support both chrome.* and browser.* APIs
    setTimeout(() => {
      const storageAPI = (typeof browser !== 'undefined' && browser.storage) ? browser.storage : chrome.storage;
      
      storageAPI.local.set({
        completionPercentage: completionPercentage
      });
      
      ('Completion percentage saved to storage'); // Debug log
    }, 50);
  }

  // ================================
  // PROGRESS BAR METHODS
  // ================================

  async calculateAndDisplayProgressBar() {
    try {
      const degree = getStudentDegree(document);
      const unlpInformaticaDegrees = getUNLPInformaticaDegrees();

      ('Student degree found:', degree ? degree.textContent.trim() : 'No degree found'); // Debug log
      ('Supported degrees:', unlpInformaticaDegrees); // Debug log

      if (!this.isValidDegree(degree, unlpInformaticaDegrees)) {
        ('Degree not supported for progress calculation - skipping progress bar'); // Debug log
        this.observeKernelContenido();
        return;
      }

      ('Degree is supported - calculating progress...'); // Debug log
      const progressData = await this.fetchProgressData();
      if (progressData) {
        ('Progress data calculated:', progressData.completionPercentage + '%'); // Debug log
        this.createProgressBar(progressData.completionPercentage);
        this.saveCompletionPercentageToStorage(progressData.completionPercentage);
      } else {
        ('No progress data calculated'); // Debug log
      }
    } catch (error) {
      console.error("Error calculating progress:", error);
    } finally {
      this.observeKernelContenido();
    }
  }

  isValidDegree(degree, unlpInformaticaDegrees) {
    return degree && unlpInformaticaDegrees.some(degreeOption =>
      removeDiacritics(degreeOption.toLowerCase()) ===
      removeDiacritics(degree.textContent.toLowerCase().trim())
    );
  }

  async fetchProgressData() {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/plan_estudio/`;

    const html = await fetchHTML(url);
    const parseSubjectsResult = parseSubjects(html);

    if (!parseSubjectsResult.idOptativas) return null;

    const optativasUrl = `${baseUrl}/plan_estudio/optativas`;
    const response = await fetch(optativasUrl, getOptativasFetchOptions(parseSubjectsResult.idOptativas));
    const data = await response.json();

    const optionalsPassedExamsCount = Math.min(
      parseSubjectsResult.optativasRequired,
      parseOptionalSubjects(data.cont)
    );

    const completionPercentage = this.calculateCompletionPercentage(
      parseSubjectsResult,
      optionalsPassedExamsCount
    );

    return { completionPercentage };
  }

  calculateCompletionPercentage(parseSubjectsResult, optionalsPassedExamsCount) {
    const totalPassed = parseSubjectsResult.passedExamsCount + optionalsPassedExamsCount;
    const totalRequired = parseSubjectsResult.passedExamsCount + 
                         parseSubjectsResult.withoutExamCount + 
                         parseSubjectsResult.optativasRequired;
    
    return (totalPassed / totalRequired) * 100;
  }

  createProgressBar(progress) {
    const container = this.createElement('div', { className: 'titulo_operacion' });
    
    const label = this.createElement('h2', {
      textContent: 'Porcentaje completado de la propuesta',
      className: 'progressbar-label'
    });

    const progressBarContainer = this.createElement('div', { className: 'progressbar-container' });
    
    const progressBar = this.createElement('div', {
      id: 'progress-bar',
      className: 'progressbar',
      textContent: progress.toFixed(2) + '%',
      style: {
        width: `${Math.max(UI_CONSTANTS.MIN_PROGRESS_BAR_WIDTH, progress)}%`
      }
    });

    container.appendChild(label);
    progressBarContainer.appendChild(progressBar);
    container.appendChild(progressBarContainer);

    const averagesDiv = document.getElementById(SELECTORS.AVERAGES_DIV);
    if (averagesDiv) {
      averagesDiv.appendChild(container);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    Object.entries(options).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'className') {
        element.className = value;
      } else {
        element[key] = value;
      }
    });

    return element;
  }
}

// ================================
// STANDALONE UTILITY FUNCTIONS
// ================================

/**
 * Extracts and parses data from HTML content.
 *
 * @param {string} htmlContent - The HTML content to parse.
 * @returns {object} An object containing extracted data.
 */
function parseSubjects(htmlContent) {
  const startIndex = htmlContent.indexOf('content":"');
  if (startIndex === -1) {
    throw new Error("Expected content pattern not found");
  }
  
  const contentStart = startIndex + 'content":"'.length;
  const endIndex = htmlContent.lastIndexOf('"});');
  if (endIndex === -1) {
    throw new Error("Expected content end pattern not found");
  }
  
  let parsedHtmlContent = htmlContent.substring(contentStart, endIndex);

  // Replace escaped HTML tags and quotes
  parsedHtmlContent = parsedHtmlContent
    .replace(/<\\\//g, "</")
    .replace(/&quot;/g, '"')
    .replace(/\\"/g, "");

  const doc = getDOMParser(parsedHtmlContent);
  const tables = doc.querySelectorAll("table");
  const examCounts = parseSubjectTables(tables);

  // Find verification button for optional subjects
  const buttons = doc.querySelectorAll("button");
  let idOptativas = null;
  let optativasRequired = 0;

  for (const button of buttons) {
    if (button.textContent.trim() === "Verificar") {
      idOptativas = button.getAttribute("data-materia");
      const parametros = button.getAttribute("data-parametros");
      if (parametros) {
        optativasRequired = getFirstDigit(parametros);
      }
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

/**
 * Extracts and parses data from optional subjects HTML content.
 *
 * @param {string} htmlContent - The HTML content of optional subjects to parse.
 * @returns {number} The count of optional subjects with exams.
 */
function parseOptionalSubjects(htmlContent) {
  const doc = getDOMParser(htmlContent);
  const tables = doc.querySelectorAll("table");
  const examCounts = parseSubjectTables(tables);
  return examCounts.trsWithExamenCount;
}

/**
 * Parses subject tables to count passed and pending subjects.
 *
 * @param {NodeList} tables - The table elements to parse.
 * @returns {object} Object containing counts of subjects with and without exams.
 */
function parseSubjectTables(tables) {
  let trsWithExamenCount = 0;
  let trsWithoutExamenCount = 0;

  tables.forEach((table) => {
    const rows = table.querySelectorAll("tr.materia");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      let hasExamen = false;

      for (const cell of cells) {
        const text = cell.textContent.trim();
        if (REGEX_PATTERNS.STUDY_PLAN_PASSED.test(text)) {
          hasExamen = true;
          break;
        }
      }

      if (hasExamen) {
        trsWithExamenCount++;
      } else {
        trsWithoutExamenCount++;
      }
    });
  });

  return { trsWithExamenCount, trsWithoutExamenCount };
}

// ================================
// INITIALIZATION
// ================================

// Initialize the extension when the page loads
const siuExtension = new SIUGuaraniExtension();
