const express = require('express');
const router = express.Router();
const uploadRouter = require('./uploadRoutes');

const defaultRoutes = [
    {
        path: '/upload',
        route: uploadRouter,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
module.exports = router;
