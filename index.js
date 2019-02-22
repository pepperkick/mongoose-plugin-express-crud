const express = require('express');
const mongoose = require('mongoose');

module.exports = (schema, options) => {
    
    // check if base plugin is available
    let thisPlugin = '@abskmj/mongoose-plugin-express-crud';
    let basePlugin = '@abskmj/mongoose-plugin-express'

    if (!(schema.statics.attachRouter instanceof Function)) {
        throw new Error(`${thisPlugin} plugin is dependent on ${basePlugin}`);
    }
    
    
    // routes
    let router = express.Router();

    const create = async(req, res, next) => {
        try {
            let data = req.body;

            let doc = await req.model.create(data);

            res.json(doc);

            next();
        }
        catch (err) {
            next(err);
        }
    }

    const find = async(req, res, next) => {
        try {
            let conditions = req.query.where || {};
            let projection = req.query.projection || {};
            let options = req.query.option || {};

            let data = await req.model.find(conditions, projection, options).lean();

            res.json(data);

            next();
        }
        catch (err) {
            next(err);
        }
    };

    const findById = async(req, res, next) => {
        if (["count", "aggregate"].includes(req.params.id)) return next();

        try {
            let id = req.params.id;
            let projection = req.query.projection || {};
            let options = req.query.option || {};

            let doc = await req.model.findById(id, projection, options).lean();

            res.json(doc);

            next();
        }
        catch (err) {
            next(err);
        }
    };

    const count = async(req, res, next) => {
        try {
            let count = await req.model.countDocuments(req.query.where);

            res.json({ count });

            next();
        }
        catch (err) {
            next(err);
        }
    }

    const aggregate = async(req, res, next) => {
        try {

            let pipelines = req.query.aggregate;

            // convert id to ObjectId recursively

            for (let pipeline of pipelines) {
                if (pipeline.$match) {
                    for (let field in pipeline.$match) {
                        let value = pipeline.$match[field];

                        if (/^[0-9a-fA-F]{24}$/.test(value)) {
                            pipeline.$match[field] = mongoose.Types.ObjectId(value);
                        }
                    }
                }
            }

            let result = await req.model.aggregate(pipelines);

            res.json(result);

            next();
        }
        catch (err) {
            next(err);
        }
    }
    
    // mount routes
    router.post('/', create);
    router.get('/', find);
    router.get('/count', count);
    router.get('/aggregate', aggregate);
    router.get('/:id', findById);
    
    // mount router
    schema.statics.attachRouter(router);
}
