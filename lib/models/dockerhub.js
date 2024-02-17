const mongoose = require('mongoose');

const DockerhubSchema = new mongoose.Schema({ // Dockerhub
    user_id: String,
    namespace: String,
    key: String,
    repository: String,
    tag: String,
});

module.exports = mongoose.model('Dockerhub', DockerhubSchema);