const fileList = [];
const ejs = require('ejs');
const {searchClosestMatch,searchByField, processCsvFile, processExcelFile, processDocFile} = require('../services/services');
const fs = require("fs");
const path = require("path");
const csvViewTemplate = fs.readFileSync(path.join(__dirname, '../views/csvView.ejs'), 'utf-8');
const searchByFieldHandler = (req, res) => {
    const { query, sortBy } = req.query;

    try {
        const searchResults = searchByField(query, sortBy);
        const html = ejs.render(csvViewTemplate, { data: searchResults });
        console.log(searchResults);
        res.send(html);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const uploadFile = (req, res) => {
    if (req.files && req.files.file) {
        const file = req.files.file;
        const fileData = {
            originalName: file.name,
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.data,
        };
        fileList.push(fileData);
        const extension = fileData.mimetype.split('/')[1];
        if (extension === 'csv') {
            processCsvFile(fileData, res);
        } else if (extension === 'xlsx' || extension === 'xls'|| extension ==='vnd.openxmlformats-officedocument.spreadsheetml.sheet'|| extension ==='vnd.ms-excel') {
           processExcelFile(fileData, res);
        }else if ( extension === 'docx' || extension === 'msword' || extension === 'vnd.openxmlformats-officedocument.wordprocessingml.document') {
            processDocFile(fileData, res);
    } else if (extension === 'pdf') {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument();
            res.contentType('application/pdf');
            doc.pipe(res);
        } else {
            req.flash('error', 'Invalid file format');
            res.locals.error = req.flash('error');
            res.status(400).json({ error: 'Invalid file format' });
        }
    } else {
        req.flash('error', 'No file uploaded');
        res.locals.error = req.flash('error');
        res.render('upload.ejs');
    }
};

const searchByFieldHandlerDoc = (req, res) => {
    const {query} = req.query;

    try {
        const searchResults = searchClosestMatch(query);
        res.send(searchResults);
    } catch (error) {
        res.status(400).json({error: error.message});

    }
};
module.exports = {
    uploadFile,
    searchByFieldHandler,
    searchByFieldHandlerDoc,
};
