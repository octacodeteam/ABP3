<p align="center">
  <img src="https://github.com/user-attachments/assets/da2c22a6-1fee-4c20-8ffc-9aa337d1a9ea" alt="gifgithubupdated">
</p>

<div align="center">
  <a href="./README.md">🇧🇷 Português</a>
  <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
  <strong>🇺🇸 English</strong>
</div>

<br>

<p align="center">
  <a href="#objective">Project Objective</a> |
  <a href="#sprints">Sprints</a> |
  <a href="#backlog">Backlog & Artifacts</a> |
  <a href="#burndown">Burndown</a> |
  <a href="#overview">Product Overview</a> |
  <a href="#methodology">Methodology</a> |
  <a href="#authors">Authors</a> |
  <a href="#technologies">Technologies</a>
</p>

</br>

<span id="objective">

## 🎯 Project Objective

To develop an interactive web application that allows **farmers and researchers** to visualize and compare **free geospatial satellite data**.

The system is based on an **interactive map**, where the user can select an area of interest and:

- 📌 List available satellites for that region, including **spatial resolution**, **temporal resolution**, and **variables** (e.g., NDVI, soil moisture, surface temperature).
- 📊 Consult and compare **time series from different satellites** (e.g., Sentinel-2 NDVI vs. Landsat-8) in side-by-side charts.
- 🔗 Integrate with **STAC** (SpatioTemporal Asset Catalog) and **WTSS** (Web Time Series Service) services.

The main focus is to offer a **simple, intuitive, and accessible tool** that facilitates geospatial data analysis and supports **decision-making in the agricultural sector**.

</span>

<span id="sprints">

## 📅 Sprints

| Links | Period | Status |
|:-----:|:----------:|:---------:|
| [Sprint 1](https://github.com/octacodeteam/ABP3/tree/sprint-1) | 09/16/2025 - 10/07/2025 | Completed ✅|
| [Sprint 2](https://github.com/octacodeteam/ABP3/tree/sprint-2) | 10/13/2025 - 11/03/2025 | Completed ✅|
| [Sprint 3](https://github.com/octacodeteam/ABP3/tree/sprint-3) | 11/06/2025 - 11/24/2025 | Completed ✅|

</span>

<span id="backlog">

## 🌲 Product Backlog
<p align="center">

### Functional Requirements

| ID | Description |
|-----------|----------------------------------------------------------------------------|
| 1 | Allow users to select a point of interest on an interactive map, preferably using geographic coordinates or a direct click. |
| 2 | The system must dynamically return a list of satellites with free data available for the area, detailing their spatial and temporal resolutions (e.g., 10m, daily, weekly) and available geospatial variables (such as NDVI, EVI, surface temperature, soil moisture, etc.). |
| 3 | A core requirement is the ability to compare data, where the user can select two or more time series of similar variables (e.g., Sentinel-2 and Landsat-8 NDVI) for the same area, visualizing them side-by-side in charts. |
| 4 | The platform must offer filtering options by satellite, variable, or period, facilitating data navigation and enabling the export of metadata and raw or processed data (if applicable and allowed) for further analysis. |

### Non-Functional Requirements

| ID | Description |
|-----------|----------------------------------------------------------------------------|
| 1 | Usability will be a critical non-functional requirement, demanding an intuitive, clear, and easy-to-navigate interface, even for users with no prior experience in geoprocessing. |
| 2 | Application performance must be optimized to ensure fast loading of the map and data, as well as fluid interaction, even with large volumes of geospatial information. |
| 3 | Scalability is another important point, so the application can handle a growing number of users and satellite data sources in the future. |
| 4 | Reliability is essential, ensuring that displayed data is accurate, up-to-date, and correctly attributed to its original sources. |

### Project Constraints

| ID | Description |
|-----------|----------------------------------------------------------------------------|
| 1 | The exclusive use of freely available satellite data limits information sources to missions like Landsat, Sentinel, MODIS, among others. |
| 2 | The time available for development by students will also be a restrictive factor, requiring a clear scope definition to ensure the completion of a Minimum Viable Product (MVP). |
| 3 | The availability of computational and storage resources for the server may be a constraint if dedicated infrastructure for processing or data caching is required. |


### Tasks - Sprint 1

| Index | Title | Score | Assignee | Condition | Link |
|--------|-----------|:---------:|-------------|----------------|------|
| 001 to 005 - SM | Planning | 3 | All Team | ✅ Completed | [🔗 View](https://github.com/) |
| 006 to 010 - SM | Planning | 3 | All Team | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/blob/DOCS/ATA's/ATA%2018-09-25%20(2).pdf) |
| 011 - SM | Backlog Documentation | 3 | Georgia | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/blob/DOCS/Backlog.pdf) |
| 012 - SM | Trello Creation and Organization | 5 | João Pedro | ✅ Completed | [🔗 View](https://trello.com/b/XUPTasD9/octacode-3sem) |
| 013 - HCI | Figma Prototype Creation | 2 | Alisson | ✅ Completed | [🔗 View](https://www.figma.com/design/q1W0mvIbWcwPwbUqHVlSwf/GeoInsight?node-id=0-1&p=f&t=EugiHkEg9QJdP4oz-0) |
| 014 - WD | Develop fixed header and footer | 5 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/08f347fc7a610c200828901f679bfbbef4982dd2) |
| 015 - WD | Folder Structure Creation | 3 | Igor Lima | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/322b0d90c74c90d3ccff631a84aa0c2a9440abff) |
| 016 - PT | Start API Consumption Migration: Python to TypeScript | 8 | Igor Lima | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/322b0d90c74c90d3ccff631a84aa0c2a9440abff) |
| 017 - SM | Implement field clearing logic | 3 | Georgia | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/e15214b1d80725d43a339b9d4452abdfab25bd74) |
| 018 - WD | Placeholder Development | 2 | Gustavo | ✅ Completed | [🔗 View](https://github.com/) |
| 019 - SM | Research STAC API Documentation | 2 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 020 - SM | Task Spreadsheet Creation | 2 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 021 - WD | Structure call function for STAC API | 5 | Georgia | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 022 - WD | Integrate Leaflet into code | 5 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/98cb469bd7b852d77ddc63660d8e893549168296) |
| 023 - WD | Add visual marker | 3 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/98cb469bd7b852d77ddc63660d8e893549168296) |
| 024 - SM | Create Burndown | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 025 - WD | API Error Handling | 5 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 026 - WD | Implement Base Map Rendering | 5 | Georgia | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/f35cb7d7ecef29101dd85b596ac7d15ed48f806e) |
| 027 - WD | Style Map and Zoom Controls | 3 | Gustavo | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 028 - WD | Display Spatial and Temporal Resolution | 5 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 029 - PT | Implement Comparison Charts | 3 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 030 - SM | Create Initial README Documentation | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 031 - SM | Prepare Sprint Review Environment | 2 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 032 - WD | CSS Refinement | 2 | Gustavo | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/14710351d926288a9302263d6318ee8dbd96250e) |
| 033 - WD | Add Address Search | 3 | Igor | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/0107505868f9f84029d1bea5debc6fdf918f4700) |
| 034 - WD | Ensure Project Stability | 8 | Gustavo | ✅ Completed | [🔗 View](https://github.com/) |
| 035 - HCI | Interface Usability Testing | 5 | Igor | ✅ Completed | [🔗 View](https://github.com/) |

### Tasks - Sprint 2

| Index | Title | Score | Assignee | Condition | Link |
|--------|-----------|:---------:|-------------|----------------|------|
| 036 to 040 - SM | Sprint 2 Planning | 3 | All Team | ✅ Completed | [🔗 View](https://github.com/) |
| 041 - PT | Adjust Data Display in API Call | 3 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/0cf7e7a31d820c179175d3254e910812b63a9a67) |
| 042 - PT | Structure Call Function for WTSS API | 3 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/0cf7e7a31d820c179175d3254e910812b63a9a67) |
| 043 - SM | Trello Update and Task Breakdown | 3 | Georgia Mantchev | ✅ Completed | [🔗 View](https://github.com/) |
| 044 - SM | Prepare Github for Sprint 2 | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 045 - SM | Spreadsheet Filling | 3 | Georgia Mantchev | ✅ Completed | [🔗 View](https://github.com/) |
| 046 - WD | Fix WTSS API Usage Error | 8 | Alisson, João, Igor, Georgia | ✅ Completed | [🔗 View](https://github.com/) |
| 046.1 - WD | Fix WTSS API Usage Error | 8 | Alisson, João, Georgia | ✅ Completed | [🔗 View](https://github.com/) |
| 047 - WD | Add "Clear Filters" Button | 3 | Gustavo Hammes | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/f50b17b77499b139c700b564f5cbc7a914a862ac) |
| 047.1 - WD | WTSS Data Return Handling | 5 | João Pedro | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/8751bfa9271de258a0d321fb89f7d9d9e837359b) |
| 047.2 - WD | WTSS Adjustment and Chart Creation | 3 | Gustavo Hammes, Igor | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/9690ed4deb9150ff45a4567a5e367bacf1603cc8) |
| 048 - WD | Home Page Creation | 3 | Gustavo Hammes | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/b81b6b7c6e6e48533f1f7b672dcbc71c929c29ee) |
| 049 - SM | Use Cases | 3 | Georgia Mantchev | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/f6bedb8d9eefcb123ffbfe702b485cb61b2eb954) |
| 050 - SM | Class Diagram | 3 | Georgia Mantchev | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/0388f549c8e6245aec2026c7971f5ba0adbcfa17) |
| 051 - SM | Sequence Diagram | 3 | Georgia Mantchev | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/144510f695e9465a121a9511f6d2c3f8dcac152d) |
| 052 - PT | Export Data to Spreadsheet Function | 3 | Alisson, Igor | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/86dfe36f0c53bb087f644999713141d8ee2f1b48) |
| 053 - SM | Testing and Site Analysis | 3 | João Pedro, Gustavo | ✅ Completed | [🔗 View](https://github.com/) |
| 054 - SM | Record Sprint 2 Video | 3 | João Pedro | ✅ Completed | [🔗 View](https://youtu.be/iqorYPgTSvY) |

### Tasks - Sprint 3

| Index | Title | Score | Assignee | Condition | Link |
|--------|-----------|:---------:|-------------|----------------|------|
| 055 to 059 - SM | Sprint 3 Planning | 3 | All Team | ✅ Completed | [🔗 View](https://github.com/) |
| 60 - HCI | Visual Improvement Data Export | 3 | Gustavo, Igor | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/2cf696cb1ed69c4a510457bee9b75e01adf91405) |
| 61 - HCI | Interface Update | 3 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/c7e0d56ba831c02bf2bd879b0314c8839652ad27) |
| 62 - SM | Organize Trello | 3 | Georgia | ✅ Completed | [🔗 View](https://trello.com/b/XUPTasD9/octacode-3sem) |
| 63 - SM | Finalize Sprint 3 GITHUB | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 64 - WD | Optimization and Visual Improvement | 3 | Alisson | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/c318231d8905ea8a0fe010a6d0f7af412669a29a) |
| 65 - SM | Analyze Completed Tasks and Mark | 3 | Georgia | ✅ Completed | [🔗 View](https://trello.com/b/XUPTasD9/octacode-3sem) |
| 66 - WD | Code Review for Deployment | 3 | Gustavo | ✅ Completed | [🔗 View](https://github.com/) |
| 67 - SM | Sprint 3 Presentation Script | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |
| 68 - HCI | Add Legends for Attributes | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/octacodeteam/ABP3/commit/e01c95dac2f9acb8f92ccd86910d206e313bb339) |
| 69 - HCI | Usability Testing | 3 | Igor, Georgia, Alisson | ✅ Completed | [🔗 View](https://github.com/) |
| 70 - SM | Deploy Site | 3 | Gustavo | ✅ Completed | [🔗 View](https://github.com/) |
| 71 - SM | Record Sprint 3 Video | 3 | João Pedro | ✅ Completed | [🔗 View](https://github.com/) |

</p>
</span>
<br>

<span id="burndown">

## 🔥 Burndown

<p align="center">
  <img src="https://github.com/octacodeteam/ABP3/blob/main/assets/Burndown_Sprint1.png">
</p>

<p align="center">
  <img src="https://github.com/octacodeteam/ABP3/blob/main/assets/burndown_sprint2.jpg">
</p>

<p align="center">
  <img src="https://github.com/octacodeteam/ABP3/blob/main/assets/burndown_sprint3.png">
</p>

</span>
  
<br>

<span id="overview">

## 💡 About the Product

## Step-by-Step Guide to Set Up the Development Environment

1. Clone the Repository
First, download the project from GitHub to your local machine. Open a terminal and run the command:

```bash
git clone [https://github.com/octacodeteam/ABP3.git](https://github.com/octacodeteam/ABP3.git)

```

Then, enter the project folder:

```bash
cd ABP3 

```

2. Install Backend Dependencies
The backend has its own dependencies. We need to install them.

### Navigate to the backend folder

```bash
cd backend

```

### Install all dependencies listed in package.json

```bash
npm install

```

3. Install Frontend Dependencies
Now, do the same for the frontend, which also has its own dependencies.

### Return to the project root and enter the frontend folder

```bash
cd ../frontend

```

### Install all dependencies listed in package.json

```bash
npm install

```

## Summary of Dependencies

The `npm install` command will automatically install everything listed in the `package.json` files. For your knowledge, these are the main dependencies we used:

### backend:

Production dependencies:

* **express:** To create the web API server.
* **axios:** To make calls to the INPE API.

Development dependencies:

* **typescript:** To write code in TypeScript.
* **ts-node-dev:** To run the server in development mode, restarting automatically.
* **@types/express:** For TypeScript to understand Express types.

### frontend:

Production dependencies:

* **leaflet:** The interactive map library.

Development dependencies:

* **vite:** The frontend development server.
* **typescript:** To write code in TypeScript.
* **@types/leaflet:** For TypeScript to understand Leaflet types.
* **@types/geojson:** (Optional, but recommended) For TypeScript to understand the geographic data format.

## How to Run the Full Project

After installing everything, you will need two terminals open at the same time:

Terminal 1 - Run Backend:

```bash
cd backend
npm run dev

```

You should see the message "Backend server running at http://localhost:3000".

Terminal 2 - Run Frontend:

```bash
cd frontend
npm run dev

```

You should see the Vite message with the local address, such as "Local: http://localhost:5173/".

Now just access the frontend address (http://localhost:5173) in your browser to use the application.

</span>

<span id="methodology">

## 📚 Methodology

The project is being developed using the **Agile methodology**, utilizing the **Scrum** framework.

* 📌 Work is organized into **sprints** (short development cycles).
* 👥 The team holds **daily meetings** to align progress.
* 📝 Tasks are organized in the **backlog** and prioritized by the Product Owner.
* ✅ At the end of each sprint, there is a **review** to present results and a **retrospective** for improvements.

This approach ensures **continuous delivery, team collaboration, and adaptation to client needs**.

</span>

<span id="user-stories">

## 👥 User Stories

| ID | Description |
| --- | --- |
| 1 | As a farmer, I want to select my area on the map to discover which satellites have data available, so I can monitor my crops without manually searching multiple sources. |
| 2 | As a farmer, I want to visualize NDVI (vegetation index) over time, to monitor plantation development and identify problems such as water stress. |
| 3 | As a farmer, I want to compare time series from different satellites, to identify which one offers more useful information for my area. |
| 4 | As a researcher, I want to access a detailed list of satellites and variables (resolution, period, coverage), to select the most suitable data source for my research. |
| 5 | As a researcher, I want to download or export metadata and time series in open formats, to perform more advanced analysis in external tools. |
| 6 | As a researcher, I want to filter data by satellite, variable, or time period, to focus only on information relevant to my study. |
| 7 | As an inexperienced user, I want a simple and intuitive interface, to be able to visualize satellite information without needing technical knowledge. |
| 8 | As a general user, I want to click on a map point and receive fast and clear results, to quickly understand what data is available for that region. |
| 9 | As a general user, I want to navigate fluidly through the map and charts, so I don't face difficulties using the tool. |
| 10 | As a user, I want the displayed data to be reliable and up-to-date, to have confidence in my analysis and decisions. |

</span>

## 📋 Trello

<p align="center">
<a href="https://trello.com/b/XUPTasD9/octacode-3sem" target="_blank">
<img src="https://img.shields.io/badge/Trello-Octacode--Board-026AA7?style=for-the-badge&logo=trello&logoColor=white" alt="Trello Board"/>
</a>
</p>

<span id="authors">

## 👨‍💻 **Authors**

| Name | Role | Github |
| --- | --- | --- |
| Alisson Franco Gritti | Dev Team | <a href="https://github.com/alissonfatec"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| Georgia Mantchev de Figueiredo Alves do Santos | Product Owner | <a href="https://github.com/Mantchev13"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| Gustavo Henrique Ferreira Hammes | Dev Team | <a href="https://github.com/GustavoHammes"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| Igor Santos Lima | Dev Team | <a href="https://github.com/IgorSantosL"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |
| João Pedro Souza dos Anjos | Scrum Master | <a href="https://github.com/Shynj0"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> |

</span>

<span id="technologies">

## 🔌 **Technologies**

> [!NOTE]
> These were the technologies used in the development of the project:

<h4 align="left">
<img src="https://skillicons.dev/icons?i=html,css,react,figma,vscode,js,ts,postgres,mysql,git,github&perline=14">
</h4>
