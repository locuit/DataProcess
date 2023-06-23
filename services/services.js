const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { exec } = require('child_process');
const docViewTemplate = fs.readFileSync(path.join(__dirname, '../views/docView.ejs'), 'utf-8');
const csvViewTemplate = fs.readFileSync(path.join(__dirname, '../views/csvView.ejs'), 'utf-8');
let parsedData = [];
const stringSimilarity = require('string-similarity');
const processCsvFile = (fileData, res) => {
    const Papa = require("papaparse");
    const csvString = fileData.buffer.toString('utf-8');
    Papa.parse(csvString, {
        header: true,
        complete: (results) => {
            parsedData = results.data;
            const html = ejs.render(csvViewTemplate, { data: parsedData });
            res.send(html);
        },
        error: (error) => {
            res.status(500).json({ error: 'Error parsing CSV file' });
        },
    });
}

const processExcelFile = (fileData, res) => {
    const XLSX = require('xlsx');
    const workbook = XLSX.read(fileData.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = jsonData[0];
    const filteredData = jsonData.slice(1);
    const formattedData = filteredData.map((row) => {
        const rowData = {};
        row.forEach((value, index) => {
            rowData[headers[index]] = value;
        });
        return rowData;
    });
    parsedData = formattedData;
    const html = ejs.render(csvViewTemplate, { data: formattedData });
    res.send(html);
}

const processDocFile = (fileData, res) => {
    const tempFilePath = path.join(__dirname, 'temp.docx').replace(/\\/g, '\\\\');
    fs.writeFileSync(tempFilePath, fileData.buffer);
    const pythonScriptPath = path.join(__dirname, '../python/tableExtractor.py');
    exec(`python ${pythonScriptPath} ${tempFilePath}`, (error, stdout, stderr) => {
        fs.unlinkSync(tempFilePath);
        if (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).send('An error occurred');
            return;
        }
        parsedData = JSON.parse(stdout);
        const tables = parsedData.tables;
        const paragraphs = parsedData.paragraphs;
        const html = ejs.render(docViewTemplate, { tables: tables, paragraphs: paragraphs });
        res.send(html);
    });
}

const searchClosestMatch = (query) => {
    const paragraphs = parsedData.paragraphs;
    const matches = stringSimilarity.findBestMatch(query, paragraphs);
    const bestMatch = matches.bestMatch;
    if (bestMatch.rating > 0) {
        return bestMatch.target;
    } else {
        throw new Error('No close match found');
    }
};

const searchByField = (query, sortBy) => {
    let searchResults = parsedData;

    if (query) {
        const queryRegex = /^(.*?)([<>=]+)(.*)$/;
        const queryParts = query.match(queryRegex);

        if (queryParts && queryParts.length === 4) {
            const field = queryParts[1].trim();
            const operator = queryParts[2].trim();
            const value = queryParts[3].trim();

            searchResults = searchResults.filter((row) => {
                const fieldValue = row[field];

                if (!isNaN(fieldValue) && !isNaN(value)) {
                    const numericFieldValue = parseFloat(fieldValue);
                    const numericValue = parseFloat(value);

                    switch (operator) {
                        case '=':
                            return numericFieldValue === numericValue;
                        case '>=':
                            return numericFieldValue >= numericValue;
                        case '<=':
                            return numericFieldValue <= numericValue;
                        default:
                            return false;
                    }
                }

                switch (operator) {
                    case '=':
                        return fieldValue === value;
                    default:
                        return false;
                }
            });
        } else {
            throw new Error('Invalid query format');
        }
    }

    if (sortBy) {
        const sortByParts = sortBy.split(':');
        const field = sortByParts[0];
        const order = sortByParts[1];

        searchResults.sort((a, b) => {
            const fieldValueA = a[field];
            const fieldValueB = b[field];

            if (!isNaN(fieldValueA) && !isNaN(fieldValueB)) {
                const numericFieldValueA = parseFloat(fieldValueA);
                const numericFieldValueB = parseFloat(fieldValueB);

                if (numericFieldValueA < numericFieldValueB) {
                    return order === 'asc' ? -1 : 1;
                }
                if (numericFieldValueA > numericFieldValueB) {
                    return order === 'asc' ? 1 : -1;
                }
                return 0;
            }

            if (fieldValueA < fieldValueB) {
                return order === 'asc' ? -1 : 1;
            }
            if (fieldValueA > fieldValueB) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    if (searchResults.length === 0) {
        throw new Error('No results found');
    }

    return searchResults;
};



module.exports = {
    processCsvFile,
    processExcelFile,
    processDocFile,
    searchByField,
    searchClosestMatch,
}
