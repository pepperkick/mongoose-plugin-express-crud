# [WIP] Mongoose Plugin - Express CRUD
Mongoose plugin for basic create, read, update, delete express routes or apis. This module is dependent on [@abskmj/mongoose-plugin-express](https://github.com/abskmj/mongoose-plugin-express).

# Installation
```
npm install -S github:abskmj/mongoose-plugin-express-crud
```

# Usage
```javascript
const mongoose = require('mongoose');
const express = require('express');

const plugin = require('@abskmj/mongoose-plugin-express-crud');
const basePlugin = require('@abskmj/mongoose-plugin-express');

let schema = new mongoose.Schema({ ... });

schema.plugin(basePlugin);
schema.plugin(plugin);

let Model = mongoose.model('Model', schema);

let app = express();

app.use('/models', Model.router()); // apis are available at /models like /models/count
```

# APIs

| Name | Path | Method | Accepts | Returns |
| :--- | :--- | :--- | :--- | :--- |
| create | `/` | POST | Object / Array | Object / Array |
| find | `/` | GET | | Array |
| count | `/count` | GET | | Object |
| findById | `/:id` | GET | | Object
| findById | `/:id` | GET | | Object
| updateById | `/:id` | PUT | Object | Object
| deleteById | `/:id` | DELETE | | Object