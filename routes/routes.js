//var Joi = require('joi');
var express = require('express');
var router = express.Router();
//var appfn = require('../app');
var Handlers = require('../handlers/handlers');
var DataStore = require('../datastore/dataStore');
var Customer = require('../module/customers');
var Boom = require('boom');
var passport = require('passport');






router.get('/', Handlers.customer_list);
router.get('/json/', Handlers.customer_json);
router.get('/customers/', Handlers.customer_feb);
router.post('/customers/:tekstId/update', Handlers.customer_feb_tekst);
router.get('/customers/:kommId/komm', Handlers.kommentaarid_json);
router.get('/customers/:kommId/arve', Handlers.arved_json);
router.get('/customers/:kommId/kontakt', Handlers.kontaktid_json);


module.exports = router;
