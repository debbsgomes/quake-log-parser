# Quake Log Parser

A comprehensive log parsing tool designed to analyze Quake game logs and generate various reports. This tool parses log files, extracts relevant data, and generates reports in multiple formats including text, CSV, and JSON. It also includes an LLM-powered game analyst to answer queries about match data.

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [Parsing Logs](#parsing-logs)
    -   [Generating Reports](#generating-reports)
    -   [LLM Integration](#llm-integration)
-   [API Documentation](#api-documentation)
    -   [parseLogFile](#parselogfilefilepath)
    -   [parseKillLine](#parsekilllineline)
    -   [generateTextReport](#generatetextreportmatches)
    -   [generateCSVReport](#generatecsvreportmatches)
    -   [generateJSONReport](#generatejsonreportmatches)
    -   [validateMatchData](#validatematchdatamatch)
    -   [getLLMResponse](#getllmresponseprompt)
-   [Running Tests](#running-tests)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   Parses Quake game logs to extract match data.
-   Generates reports in text, CSV, and JSON formats.
-   Validates parsed match data to ensure correctness.
-   Uses an LLM to answer queries about match data.

## Installation

1.  Clone the repository:
    
    bash
    
    Copiar código
    
    `git clone https://github.com/debbsgomes/quake-log-parser-cloudwalk-test.git` 
    
2.  Navigate to the project directory:
    
    bash
    
    Copiar código
    
    `cd quake-log-parser-cloudwalk-test` 
    
3.  Install dependencies (if using npm or yarn):
    
    bash
    
    Copiar código
    
    `npm install` 
    
    or
    
    bash
    
    Copiar código
    
    `yarn install` 
    

## Usage

### Parsing Logs

To parse a log file and generate reports, use the `reportGenerator.js` script:

bash

Copiar código

`node reportGenerator.js` 

Make sure the `qgames.log` file is in the same directory or update the path in `reportGenerator.js`.

### Generating Reports

Reports will be generated and saved in the current directory. The generated files include:

-   `.txt` - Text-based report
-   `.csv` - CSV-based report
-   `.json` - JSON-based report

### LLM Integration

The tool includes an LLM-powered game analyst. To use the LLM, ensure you have configured the environment with your API key. You can query the LLM for information about match data.

1.  Ensure you have an API key and set it in your environment variables.
    
2.  The LLM integration is handled by the `llmClient.js` file. Use the function `getLLMResponse(prompt)` to send queries to the LLM. For example:
    
    javascript
    
    Copiar código
    
    `import { getLLMResponse } from './llmClient.js';
    
    async function queryLLM() {
      const prompt = "How many matches were played?";
      const response = await getLLMResponse(prompt);
      console.log(response);
    }
    
    queryLLM();` 
    

## API Documentation

### `parseLogFile(filePath)`

Parses a log file and extracts match data.

-   **Parameters:**
    -   `filePath` (string): Path to the log file.
-   **Returns:**
    -   `Array`: An array of match objects.

### `parseKillLine(line)`

Parses a single line from the log file to extract kill data.

-   **Parameters:**
    -   `line` (string): A line from the log file.
-   **Returns:**
    -   `Object | null`: An object containing `killer`, `victim`, and `meansOfDeath` or `null` if parsing fails.

### `generateTextReport(matches)`

Generates a text-based report from the parsed matches.

-   **Parameters:**
    -   `matches` (Array): An array of match objects.
-   **Returns:**
    -   `string`: A formatted text report.

### `generateCSVReport(matches)`

Generates a CSV-based report from the parsed matches.

-   **Parameters:**
    -   `matches` (Array): An array of match objects.
-   **Returns:**
    -   `string`: A CSV-formatted report.

### `generateJSONReport(matches)`

Generates a JSON-based report from the parsed matches.

-   **Parameters:**
    -   `matches` (Array): An array of match objects.
-   **Returns:**
    -   `string`: A JSON-formatted report.

### `validateMatchData(match)`

Validates the structure of a match object.

-   **Parameters:**
    -   `match` (Object): The match object to validate.
-   **Throws:**
    -   `Error`: If the match data is invalid.

### `getLLMResponse(prompt)`

Queries the LLM with a prompt and returns the response.

-   **Parameters:**
    -   `prompt` (string): The query to send to the LLM.
-   **Returns:**
    -   `string`: The response from the LLM.

## Running Tests

To run the tests, use the following command:

bash

Copiar código

`npm test` 

or

bash

Copiar código

`yarn test` 

This will run all the unit and integration tests in the project. Ensure that your environment is correctly set up and that any necessary mock configurations or environment variables are in place.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.