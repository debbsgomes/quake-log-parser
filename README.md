# Quake Log Parser

A comprehensive log parsing tool designed to analyze Quake game logs and generate various reports. This tool parses log files, extracts relevant data, and generates reports in multiple formats including text, CSV, and JSON.

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
    -   [Parsing Logs](#parsing-logs)
    -   [Generating Reports](#generating-reports)
-   [API Documentation](#api-documentation)
    -   [parseLogFile](#parselogfilefilepath)
    -   [parseKillLine](#parsekilllineline)
    -   [generateTextReport](#generatetextreportmatches)
    -   [generateCSVReport](#generatecsvreportmatches)
    -   [generateJSONReport](#generatejsonreportmatches)
    -   [validateMatchData](#validatematchdatamatch)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   Parses Quake game logs to extract match data.
-   Generates reports in text, CSV, and JSON formats.
-   Validates parsed match data to ensure correctness.

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

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.