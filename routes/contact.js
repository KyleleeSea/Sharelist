const express = require('express');
const router = express.Router();
const contact = require('../controllers/contact');
const catchAsync = require('../utils/catchAsync');
const { contactValidation } = require('../middleware');

router.route('/contact')
    .get(contact.renderContact)
    .post(contactValidation, contact.postContact)

router.route('/featurecontact')
    .get(contact.renderFeatureContact)
    .post(contactValidation, contact.postFeatureContact)

module.exports = router;
