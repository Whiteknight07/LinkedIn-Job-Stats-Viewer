(() => {
  "use strict";

  // Set DEBUG to true during development to enable console logs.
  const DEBUG = false;

  /**
   * Logs a message if debugging is enabled.
   * @param  {...any} args The messages or variables to log.
   */
  function debugLog(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  /**
   * Creates (or retrieves) the stats display container element.
   * @returns {HTMLElement} The container element.
   */
  function createStatsDisplay() {
    let container = document.getElementById('linkedin-stats-container');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'linkedin-stats-container';
    container.style.position = 'fixed';
    container.style.top = '70px';
    container.style.right = '20px';
    container.style.zIndex = '9999';

    container.innerHTML = `
      <div class="stats-box">
        <div class="stat">
          <span class="stat-label">Total Views:</span>
          <span class="stat-value" id="views-count">Loading...</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total Applies:</span>
          <span class="stat-value" id="applies-count">Loading...</span>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    return container;
  }

  /**
   * Attempts to extract the CSRF token from cookies.
   * @returns {string|null} The token if available; otherwise null.
   */
  function getCsrfToken() {
    // LinkedIn may store the token in the JSESSIONID cookie.
    const match = document.cookie.match(/JSESSIONID="(.*?)"/);
    return match ? match[1] : null;
  }

  /**
   * Extracts the job ID from the current URL.
   * It first attempts to extract a numeric portion from a slug ending in digits,
   * then checks the URL query for currentJobId,
   * and finally falls back to using the last pathname segment.
   * @returns {string} The job ID.
   */
  function extractJobId() {
    let jobId = null;
    // Attempt to extract a numeric ID from the pathname
    const numericMatch = window.location.pathname.match(/-(\d+)(\/)?$/);
    if (numericMatch) {
      jobId = numericMatch[1];
    }

    // If not found, try the query string parameter 'currentJobId'
    if (!jobId) {
      const urlParams = new URLSearchParams(window.location.search);
      jobId = urlParams.get('currentJobId');
    }

    // Fallback: use the last segment of the pathname
    if (!jobId) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      jobId = pathSegments[pathSegments.length - 1];
    }
    return jobId;
  }

  /**
   * Fetches job statistics from the LinkedIn API and updates the UI.
   */
  async function fetchJobStats() {
    try {
      // Ensure the stats container exists.
      createStatsDisplay();

      const jobId = extractJobId();
      if (!jobId) {
        throw new Error('Could not determine job ID from URL.');
      }
      debugLog('[LinkedIn Job Stats] Job ID:', jobId);

      // Construct API endpoint using the extracted job ID.
      const apiUrl = `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}`;
      debugLog('[LinkedIn Job Stats] Fetching from:', apiUrl);

      // Prepare request headers.
      const headers = {
        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
        'x-restli-protocol-version': '2.0.0'
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['csrf-token'] = csrfToken;
      } else {
        debugLog('[LinkedIn Job Stats] CSRF token not found.');
      }

      // Make the API request with credentials included.
      const response = await fetch(apiUrl, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      debugLog('[LinkedIn Job Stats] Data received:', data);

      // Update UI with the fetched data.
      const viewsElement = document.getElementById('views-count');
      const appliesElement = document.getElementById('applies-count');
      
      if (data.data) {
        viewsElement.textContent = data.data.views !== undefined ? data.data.views : 'N/A';
        appliesElement.textContent = data.data.applies !== undefined ? data.data.applies : 'N/A';
      } else {
        throw new Error('No data field present in API response.');
      }
      
    } catch (error) {
      console.error('[LinkedIn Stats Error]:', error);
      const container = document.getElementById('linkedin-stats-container');
      if (container) {
        container.innerHTML = `
          <div class="error-message">
            An error occurred: ${error.message}<br/>
            Please ensure you are on a valid LinkedIn job page, for example: 
            <a href="https://www.linkedin.com/jobs/view/4119480297/">Job View</a> or 
            <a href="https://www.linkedin.com/jobs/search/?currentJobId=4132638831&origin=JOBS_HOME_JYMBII">Job Search</a>.
          </div>
        `;
      }
    }
  }

  /**
   * Observes URL changes to support client-side navigation on LinkedIn.
   */
  function observeUrlChanges() {
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        debugLog('[LinkedIn Job Stats] URL changed, fetching new stats...');
        fetchJobStats();
      }
    });
    observer.observe(document, { subtree: true, childList: true });
  }

  // Initialize once the page has fully loaded.
  window.addEventListener('load', () => {
    fetchJobStats();
    observeUrlChanges();
  });
})();

