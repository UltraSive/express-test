const mongoose = require('mongoose');

const DeploymentSchema = new mongoose.Schema({
    container_id: String,
    // the github commit id
    commit_id: String,
    dates: {
        // when the deployment began
        started: Date,
        // when the deployment finished (elapsed time can be helpful)
        finished: Date,
    },
    status: {
        // the status of this deploy
        status: String,
        // if the deployment is in progress (building)
        in_progress: Boolean,
        // logs from building
        logs: String,
        // if the deployment is in production right now
        production: Boolean,
        // if the deployment has been pulled back
        rolled_back: Boolean,
        // the nodes the container is on (if it's in production)
        nodes: [String],
    },
    author: {
        // the user who deployed
        name: String,
        // username
        username: String,
    },
    changes: {
        // the changes that were made
        added: [String],
        removed: [String],
        modified: [String],
    },
    message: String,
});

const ContainerSchema = new mongoose.Schema({
    // who owns the container
    user_id: String,
    // the name of the service
    name: String,
    // Port the app launches on
    containerPort: Number,
    // the git repo id so we can identify from incoming webhooks
    git: {
        repo_id: String,
        repo: String,
        owner: String,
        branch: String,
        subdirectory: String,
    },
    // env variables
    environment: [{
        key: String,
        value: String,
    }],
    // deployments to the edge
    deployments: [DeploymentSchema]
});

const ContainerModel = mongoose.model("containers", ContainerSchema);

module.exports = ContainerModel;