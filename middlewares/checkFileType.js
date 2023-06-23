const checkFileType = (req, res, next) => {
    if (!req.files || !req.files.file) {
        req.flash('error', 'No file uploaded');
        res.locals.error = req.flash('error');
        res.render('upload.ejs');
        return next(new Error('No file uploaded'));
    }
    const file = req.files.file;
    const allowedFileTypes = ['.csv', '.xlsx','.xls','.docx'];
    const fileExtension = getFileExtension(file.name);
    if (!allowedFileTypes.includes(fileExtension)) {
        req.flash('error', 'Invalid file type');
        res.locals.error = req.flash('error');
        res.render('upload.ejs');
        return next(new Error('Invalid file type'));
    }
    next();
};
const flash = require('connect-flash');

const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return '.' + parts[parts.length - 1];
};

module.exports = checkFileType;
