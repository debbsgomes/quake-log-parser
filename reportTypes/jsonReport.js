export function generateJSONReport(parsedData) {
    return JSON.stringify(parsedData, null, 2);
}