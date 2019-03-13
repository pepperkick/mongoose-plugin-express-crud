const express = require('express');
const mongoose = require('mongoose');

module.exports = (schema, options) => {
    let defaultOptions = {
        disable: []
    }

    // merge options
    options = Object.assign({}, defaultOptions, options);
    
    let pluggable = schema.statics.router.Pluggable(options.disable);

    const create = pluggable('create', async(req, res, next) => {
        try {
            let data = req.body;

            let doc = await req.model.create(data);

            res.json(doc);

            next();
        }
        catch (err) {
            next(err);
        }
    });

    const find = pluggable('find', async(req, res, next) => {
        try {
            let conditions = req.query.where || {};
            let projection = req.query.projection || {};
            let options = req.query.options || {};

            let data = await req.model.find(conditions, projection, options).lean();

            res.json(data);

            next();
        }
        catch (err) {
            next(err);
        }
    });

    const findById = pluggable('findById', async(req, res, nxt) => {
        try {
            let id = req.params.id;
            let projection = req.query.projection || {};
            let options = req.query.options || {};

            let doc = await req.model.findById(id, projection, options).lean();

            if (doc) {

                res.json(doc);

                nxt();
            }
            else {
                throw new req.errors.ResourceNotFound();
            }
        }
        catch (err) {
            nxt(err);
        }
    });

    const count = pluggable('count', async(req, res, next) => {
        try {
            let count = await req.model.countDocuments(req.query.where);

            res.json({ count });

            next();
        }
        catch (err) {
            next(err);
        }
    });

    const aggregate = pluggable('aggregate', async(req, res, next) => {
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
    });

    const updateById = pluggable('updateById', async(req, res, nxt) => {
        try {
            let id = req.params.id;
            let update = req.body || {};
            let options = req.query.options || {};

            // always return updated document
            options = Object.assign({ new: true }, options);

            let doc = await req.model.findByIdAndUpdate(id, update, options).lean();

            if (doc) {

                res.json(doc);

                nxt();
            }
            else {
                throw new req.errors.ResourceNotFound();
            }

        }
        catch (err) {
            nxt(err);
        }
    });

    const deleteById = pluggable('deleteById', async(req, res, nxt) => {
        try {
            let id = req.params.id;
            let options = req.query.options || {};

            let doc = await req.model.findByIdAndDelete(id, options).lean();

            if (doc) {

                res.json(doc);

                nxt();
            }
            else {
                throw new req.errors.ResourceNotFound();
            }

        }
        catch (err) {
            nxt(err);
        }
    });

    // routes
    let router = express.Router();

    // mount routes
    router.route('/').get(find).post(create);
    router.get('/count', count);
    router.get('/aggregate', aggregate);
    router.route('/@:id').get(findById).put(updateById).delete(deleteById);

    // mount router
    schema.statics.router.attach(router);
}
