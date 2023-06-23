const checkFileType = (req, res, next) => {
    if (!req.files || !req.files.file) {
        req.flash('error', 'No file uploaded');
        return next(new Error('No file uploaded'));
    }

    const file = req.files.file;

    // Define the allowed file types
    const allowedFileTypes = ['.csv', '.xlsx','.xls','.docx', '.pdf'];

    // Get the file extension
    const fileExtension = getFileExtension(file.name);
    console.log(fileExtension)
    // Check if the file extension is allowed
    if (!allowedFileTypes.includes(fileExtension)) {
        req.flash('error', 'Invalid file type');
        res.locals.error = req.flash('error');
        // Render upload.ejs và sử dụng biến locals.error để hiển thị thông báo lỗi
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
