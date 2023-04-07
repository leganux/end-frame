let endFrame = require('./index')


let options = {
    api_base_uri: '/functions/',
    activeLogRequest: true,
    active_cors: true,
    collection_name: "functions",
    collection_log: "executions",
    collection_cron: "cron",
    timezone: "America/Mexico_City",
}

let functions = new endFrame('mongodb://localhost/functions', 3011, options)
functions.publishServerStats()
functions.initialize()
functions.start()
