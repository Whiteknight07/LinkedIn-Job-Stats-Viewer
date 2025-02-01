# LinkedIn Job Stats Viewer

A lightweight Chrome extension that enhances your LinkedIn job browsing experience by displaying real-time job statistics—such as total views and total applications—directly on job posting pages. This extension does not collect or store any user data.

## Features

- **Real-time Stats:** Displays total views and applies for each job posting.
- **Seamless Integration:** Injects a container into LinkedIn job pages without interfering with the site's layout.
- **Privacy-focused:** Uses a minimal set of permissions and does not collect any personal data.


## Usage

1. Visit a job posting page on LinkedIn (URLs matching `https://*.linkedin.com/jobs/view/*`).

2. The extension will automatically inject a stats display overlay on the page and begin fetching relevant statistics.

3. If the data is available, you will see the total views and total applications displayed. If there is an error, the fields will display "Error".

## Code Overview

- **manifest.json:** Declares the extension's metadata, permissions, and content script injection rules.
- **content.js:** Contains the JavaScript logic for extracting job IDs, fetching statistics from LinkedIn's API, and updating the UI.
- **styles.css:** Provides the styling for the stats display overlay.

## Contributing

Contributions are welcome! Please fork this repository and open a pull request with your changes.

## License

This project is licensed under the Apache License 2.0 
