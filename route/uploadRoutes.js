const express = require('express');
const uploadController = require('../controllers/upload.controller');
const checkFile = require('../middlewares/checkFileType');
const router = express.Router();

router
    .route('/')
    .get((req, res) => {
        res.render('upload.ejs');
    })
    .post(checkFile, uploadController.uploadFile);
router
    .route('/search')
    .get(uploadController.searchByFieldHandler);
router
    .route('/search-doc')
    .get(uploadController.searchByFieldHandlerDoc);



module.exports = router;