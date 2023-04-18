const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const makeDir = require('make-dir');

//import APIATO
let apiato = require('apiato')
//initialize microservice objecto for employee colection
let ms_ = new apiato();

const express = require('express');
const bodyParser = require('body-parser');
const getId = require('docker-container-id');

const morgan = require('morgan');
const moment = require('moment');
let osu = require('node-os-utils')
let hooli = require("hooli-logger-client")

let cron = require('node-cron');


const {v4: uuidv4} = require('uuid');

let endFrame = function (mongoDBUri, port = 3011, options = {
    api_base_uri: false,
    activeLogRequest: false,
    active_cors: false,
    collection_name: "functions",
    collection_log: "executions",
    collection_cron: "cron",
    timezone: "America/Mexico_City",
    mailTransporter: false,
    app: false,
    mongoose: false
}, ssl_config = {}) {

    console.log(`
    v1.0.2
    Welcome to End-Frame
        
   __          _         ___                         
  /__\\ __   __| |       / __\\ __ __ _ _ __ ___   ___ 
 /_\\| '_ \\ / _\` |_____ / _\\| '__/ _\` | '_ \` _ \\ / _ \\
//__| | | | (_| |_____/ /  | | | (_| | | | | | |  __/
\\__/|_| |_|\\__,_|     \\/   |_|  \\__,_|_| |_| |_|\\___|
                                                     
                                                                                                                                                      
               This is a project made by leganux.net (c) 2021-2023 
                      ______________________________________
               Read the docs at https://www.npmjs.com/package/end-frame
                                
                                                                                                                            
`)

    try {
        this.instancedMongoose = false
        this.mongoose = {}
        if (!options.mongoose) {
            this.mongoose = require("mongoose");

        } else {
            this.mongoose = options.mongoose
            this.instancedMongoose = true
        }


        if (!mongoDBUri) {
            throw new Error('You must to add the mongo db URI')
        }


        this.app = {}
        this.instancedApp = false

        if (options.app) {
            this.app = options.app
            this.instancedApp = true
        } else {
            this.app = express()
            this.app.use(bodyParser.urlencoded({extended: true}));
            this.app.use(bodyParser.json());
            this.instancedApp = false
        }

        this.activeLogRequest = false
        if (ssl_config && ssl_config.private && ssl_config.cert && ssl_config.port&& !this.instancedApp) {
            this.privateKey = fs.readFileSync(ssl_config.private, 'utf8');
            this.certificate = fs.readFileSync(ssl_config.cert, 'utf8');
            this.credentials = {key: this.privateKey, cert: this.certificate};
            this.httpsServer = https.createServer(this.credentials, this.app);
        }

        if (!this.instancedApp) {
            this.httpServer = http.createServer(this.app);
        }



        if (!this.instancedMongoose) {
            this.mongoose.connect(mongoDBUri, {useUnifiedTopology: true, useNewUrlParser: true,});
            this.mongoose.set('strictQuery', true);
        }


        this.db = this.mongoose.connection;


        this.api_base_uri = '/functions/';
        this.secure = false

        this.collection_name = "functions"
        this.collection_log = "executions"
        this.collection_cron = "cron"
        this.timezone = "America/Mexico_City",
            this.secure = false


        if (options.secure) {
            this.secure = options.secure
        }
        if (options.timezone) {
            this.timezone = options.timezone
        }
        if (options.api_base_uri) {
            this.api_base_uri = options.api_base_uri
        }
        if (options.activeLogRequest) {
            this.activeLogRequest = options.activeLogRequest
        }
        if (options?.active_cors) {
            this.app.use((_req, res, next) => {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
                res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
                res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
                next();
            });
        }
        if (options?.collection_name) {
            this.collection_name = options.collection_name
        }
        if (options?.collection_log) {
            this.collection_log = options.collection_log
        }
        if (options?.collection_cron) {
            this.collection_cron = options.collection_cron
        }

        let el__ = this
        el__.db_timestamps = true

        let Schema = this.mongoose.Schema;
        this.MSchema = new Schema({
            name: {
                type: String
            },
            uri: {
                type: String
            },
            token: {
                type: String
            },
            function: {
                type: String
            },
            method: {
                type: String
            },
            active: {
                type: Boolean
            },
            bodyParams: [{
                name: String,
                kind: String,
                mandatory: Boolean,
            }],
            queryParams: [{
                name: String,
                kind: String,
                mandatory: Boolean,
            }],
            headers: [{
                name: String,
                kind: String,
                mandatory: Boolean,
            }],


        }, {timestamps: el__.db_timestamps})
        this.MCronSchema = new Schema({
            name: {
                type: String
            },
            schedule: {
                type: String
            },
            token: {
                type: String
            },
            function: {
                type: String
            },

            active: {
                type: Boolean
            },


        }, {timestamps: el__.db_timestamps})

        this.logSchema = new Schema({
            name: {
                type: String
            },
            method: {
                type: String
            },
            execID: {
                type: String
            },
            function: {
                type: String
            },
            type: {
                type: String
            },
            response: {
                type: Schema.Types.Mixed
            },
            body: {
                type: Schema.Types.Mixed
            },
            query: {
                type: Schema.Types.Mixed
            },
            headers: {
                type: Schema.Types.Mixed
            },


        }, {timestamps: el__.db_timestamps})

        this.functionsModel = this.mongoose.model(el__.collection_name, this.MSchema, el__.collection_name)
        this.logModel = this.mongoose.model(el__.collection_log, this.logSchema, el__.collection_log)
        this.cronModel = this.mongoose.model(el__.collection_cron, this.MCronSchema, el__.collection_cron)

        this.decodeBase64 = function (data) {
            return Buffer.from(data, 'base64').toString('utf8')
        }
        this.encodeBase64 = function (data) {
            return Buffer.from(data, 'utf8').toString('base64')
        }


        this.suuid = function () {
            var g = this.gen()
            while (g.length < 8) g = this.gen()
            return g
        }

        this.gen = function () {
            var sm = [], i = 256
            while (i--) sm[i] = i < 16 ? '0' : '' + (i).toString(16)
            var uu = Math.random() * 0xffffffff | 0
            return sm[uu & 0xff]
                + sm[uu >> 8 & 0xff]
                + sm[uu >> 16 & 0xff]
                + sm[uu >> 24 & 0xff]
        }

        this.cronInit = 0
        this.cronFile = {}
        this.oldPath = ''


        this.startAndUpdateCron = async function () {
            let el = this

            if (el.cronInit == 1 && typeof el.cronFile == 'object') {
                for (const [key, value] of Object.entries(el.cronFile)) {
                    value.stop()
                }
                fs.unlinkSync(el.oldPath);
            }


            el.cronFile = {}
            let list_cron_ = {}

            let list = await el.cronModel.find({active: true})
            for (let item of list) {
                if (item.schedule.trim().split(' ').length == 5) {
                    let id = item.token
                    if (!item.function.trim().startsWith('async')) {
                        item.function = 'async ' + item.function
                    }
                    list_cron_ = list_cron_ + `
cronlist["${id}"]=cron.schedule('${item.schedule.trim()}', ${item.function},  {timezone: "${el.timezone}"});  
cronlist["${id}"].stop();
                    `
                }
            }


            let cronFile = `
let cron = require('node-cron');
let moment = require('moment');
let axios = require('axios');
let cronlist = {};
${list_cron_}
module.exports=cronlist;
            `
            cronFile = cronFile.replace('[object Object]', '  ')
            let ID_file = el.suuid()
            let path_ = await makeDir('./cron/')
            let full = path.join(path_, 'cron_' + ID_file + '.js')
            fs.writeFileSync(full, cronFile);


            el.cronInit = 1
            el.cronFile = require(full)
            el.oldPath = full

            for (const [key, value] of Object.entries(el.cronFile)) {
                value.start()
            }

        }

        this.initialize = async function () {
            let el = this
            if (el.activeLogRequest) {
                el.app.use(morgan(function (tokens, req, res) {
                    return [
                        moment().format('YYYY-MM-DD hh:mm:ss'),
                        tokens.method(req, res),
                        tokens.url(req, res),
                        tokens.status(req, res),
                        tokens['response-time'](req, res), 'ms'
                    ].join('  ');
                }))
            }

            let middleware = async function (req, res, next) {
                if (!el.secure) {
                    next()
                    return
                }
                if (!el?.secure?.user || !el?.secure?.password) {
                    res.status(403).json({
                        success: true,
                        code: 403,
                        error: 'The user or password is not set',
                        message: '403 - Forbidden ',
                        container_id: await getId(),

                    })
                    return
                }


                if (!req?.headers?.authorization && !req?.query?.authorization) {
                    res.status(403).json({
                        success: true,
                        code: 403,
                        error: 'Token or header not present',
                        message: '403 - Forbidden ',
                        container_id: await getId(),
                    })
                    return
                }

                let auth = (req?.headers?.authorization?.replace('Basic ', '')) || (req?.query?.authorization?.replace('Basic ', ''))


                let decoded = el.decodeBase64(auth)


                if (decoded != (el.secure.user + ':' + el.secure.password)) {
                    res.status(403).json({
                        success: true,
                        code: 403,
                        error: 'Invalid Access or credentials',
                        message: '403 - Forbidden ',
                        container_id: await getId(),

                    })
                    return
                }

                next()
            }

            el.app.get('/', async function (_req, res) {
                res.status(200).json({
                    success: true,
                    code: 200,
                    error: '',
                    message: 'end-frame has been successful started',
                    container_id: await getId()
                })
            })

            el.app.all(el.api_base_uri + 'exec/:name', middleware, async function (req, res) {

                try {
                    let response = []

                    let body = req.body
                    let query = req.query
                    let headers = req.headers
                    let {name} = req.params

                    let myFunc = await el.functionsModel.findOne({
                        name: name.trim().toLowerCase(),
                        token: query.token,
                        active: true
                    })

                    if (!myFunc) {
                        res.status(404).json({
                            success: false,
                            code: 404,
                            error: '404 Not Found',
                            message: 'Not found function',
                            container_id: await getId(),
                        })
                    }

                    if (myFunc.method.toUpperCase() !== req.method.toUpperCase()) {
                        res.status(405).json({
                            success: false,
                            code: 405,
                            error: '405 Invalid Method',
                            message: 'Invalid Method',
                            container_id: await getId(),
                        })
                    }

                    let body_ = {}
                    let query_ = {}
                    let headers_ = {}

                    for (let item of myFunc.bodyParams) {
                        if (body[item.name]) {
                            if ((typeof body[item.name]).toLowerCase() == item.kind.toLowerCase()) {
                                body_[item.name] = body[item.name]
                            }
                        }
                    }
                    for (let item of myFunc.queryParams) {
                        if (query[item.name]) {
                            if ((typeof body[item.name]).toLowerCase() == item.kind.toLowerCase()) {
                                query_[item.name] = query[item.name]
                            }
                        }
                    }
                    for (let item of myFunc.headers) {
                        if (headers[item.name]) {
                            if ((typeof body[item.name]).toLowerCase() == item.kind.toLowerCase()) {
                                headers_[item.name] = headers[item.name]
                            }
                        }
                    }

                    let id__ = el.suuid()
                    let file = id__ + '.js'
                    let path_ = await makeDir('./exec/')
                    let full = path.join(path_, file)

                    let func__ = myFunc.function.trim()
                    if (!func__.startsWith('async')) {
                        func__ = 'async ' + func__
                    }
                    func__ = "" +
                        "\nlet moment = require('moment');" +
                        "\nlet axios = require('axios'); \n module.exports= " + func__

                    console.log('Ejecutando function ' + name)
                    fs.writeFileSync(full, func__);

                    console.time('Function ' + name)

                    let forExec = require(full)

                    let reponse = await forExec({
                        body: body_,
                        headers: headers_,
                        query: query_
                    })

                    fs.unlinkSync(full);

                    console.timeEnd('Function ' + name)

                    let log = new el.logModel(
                        {
                            name: name,
                            method: req.method,
                            execID: id__,
                            function: func__,
                            response: reponse,
                            body: body_,
                            query: query_,
                            headers: headers_,
                            type: 'CloudFunction'
                        }
                    )
                    log = await log.save()

                    console.log('Function successful  executed ' + name, JSON.stringify(log))

                    res.status(200).json({
                        success: true,
                        code: 200,
                        error: false,
                        message: 'OK',
                        container_id: await getId(),
                        data: reponse,
                        log: log
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: e,
                        message: 'Upload Error',
                        container_id: await getId()
                    })
                }


            })
            el.app.post(el.api_base_uri + 'cron/', middleware, async function (req, res) {

                try {
                    let response = []
                    let {name, func, active, schedule} = req.body

                    if ((!name || name.trim() == '')) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Incomplete data in body',
                            container_id: await getId(),

                        })
                        return
                    }

                    if (!func.includes('function') || !func.includes('{') || !func.includes('}') || !func.includes(')') || !func.includes('(')) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Malformed Function',
                            container_id: await getId(),

                        })
                        return
                    }

                    if (func.includes('child_process') || func.includes('eval')) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Invalid option into a function for security reason',
                            container_id: await getId(),

                        })
                        return
                    }

                    if (!cron.validate(schedule)) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Malformed Schedule String',
                            container_id: await getId(),

                        })
                        return
                    }


                    let token = el.suuid()

                    let newFunc = new el.cronModel({
                        name: name.toLowerCase(),
                        schedule: schedule.toLowerCase(),
                        token: token,
                        function: func.trim(),
                        active,

                    })


                    newFunc = await newFunc.save()

                    el.startAndUpdateCron()


                    res.status(200).json({
                        success: true,
                        code: 200,
                        error: false,
                        message: 'OK',
                        container_id: await getId(),
                        data: newFunc
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: e,
                        message: 'Upload Error',
                        container_id: await getId()
                    })
                }


            })
            el.app.post(el.api_base_uri + 'function/', middleware, async function (req, res) {

                try {
                    let response = []
                    let {name, func, method, active, bodyParams = [], queryParams = [], headers = []} = req.body

                    if ((!name || name.trim() == '' || !method || method.trim() == '')) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Incomplete data in body',
                            container_id: await getId(),
                            data: response
                        })
                        return
                    }

                    if (!func.includes('function') || !func.includes('{') || !func.includes('}') || !func.includes('return') || !func.includes(')') || !func.includes('(')) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Malformed Function',
                            container_id: await getId(),
                            data: response
                        })
                        return
                    }

                    if (func.includes('child_process') || func.includes('eval')) {
                        res.status(400).json({
                            success: false,
                            code: 400,
                            error: 'Bad Request',
                            message: 'Invalid option into a function for security reason',
                            container_id: await getId(),

                        })
                        return
                    }

                    bodyParams = bodyParams.filter(item => {
                        if (item.name && item.kind) {
                            return item
                        }
                    })
                    queryParams = queryParams.filter(item => {
                        if (item.name && item.kind) {
                            return item
                        }
                    })
                    headers = headers.filter(item => {
                        if (item.name && item.kind) {
                            return item
                        }
                    })

                    let token = el.suuid()

                    let newFunc = new el.functionsModel({
                        name: name.toLowerCase(),
                        uri: el.api_base_uri + 'exec/' + name.toLowerCase() + '?token=' + token,
                        token: token,
                        function: func.trim(),
                        method: method.toUpperCase().trim(),
                        active,
                        bodyParams,
                        queryParams,
                        headers
                    })


                    newFunc = await newFunc.save()


                    res.status(200).json({
                        success: true,
                        code: 200,
                        error: false,
                        message: 'OK',
                        container_id: await getId(),
                        data: newFunc
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: e,
                        message: 'Upload Error',
                        container_id: await getId()
                    })
                }


            })

            el.app.post(el.api_base_uri + 'function/dt_agr', middleware, ms_.datatable_aggregate(el.functionsModel, [], '', {allowDiskUse: true}))
            el.app.get(el.api_base_uri + 'function/one', middleware, ms_.getOneWhere(el.functionsModel, false, {}))
            el.app.get(el.api_base_uri + 'function/:id', middleware, ms_.getOneById(el.functionsModel, false, {}))
            el.app.get(el.api_base_uri + 'function/', middleware, ms_.getMany(el.functionsModel, false, {}))

            el.app.put(el.api_base_uri + 'function/:id', middleware, ms_.updateById(el.functionsModel, {}, false, {}))
            el.app.delete(el.api_base_uri + 'function/:id', middleware, ms_.findIdAndDelete(el.functionsModel, {}))

            el.app.post(el.api_base_uri + 'log/dt_agr', middleware, ms_.datatable_aggregate(el.logModel, [], '', {allowDiskUse: true}))
            el.app.get(el.api_base_uri + 'log/one', middleware, ms_.getOneWhere(el.logModel, false, {}))
            el.app.get(el.api_base_uri + 'log/:id', middleware, ms_.getOneById(el.logModel, false, {}))
            el.app.get(el.api_base_uri + 'log/', middleware, ms_.getMany(el.logModel, false, {}))

            el.app.put(el.api_base_uri + 'log/:id', middleware, ms_.updateById(el.logModel, {}, false, {}))
            el.app.delete(el.api_base_uri + 'log/:id', middleware, ms_.findIdAndDelete(el.logModel, {}))

            el.app.post(el.api_base_uri + 'cron/dt_agr', middleware, ms_.datatable_aggregate(el.cronModel, [], '', {allowDiskUse: true}))
            el.app.get(el.api_base_uri + 'cron/one', middleware, ms_.getOneWhere(el.cronModel, false, {}))
            el.app.get(el.api_base_uri + 'cron/:id', middleware, ms_.getOneById(el.cronModel, false, {}))
            el.app.get(el.api_base_uri + 'cron/', middleware, ms_.getMany(el.cronModel, false, {}))

            el.app.put(el.api_base_uri + 'cron/:id', middleware, ms_.updateById(el.cronModel, {}, false, {}, false, async function (data) {
                el.startAndUpdateCron()
                return data;
            }))
            el.app.delete(el.api_base_uri + 'cron/:id', middleware, ms_.findIdAndDelete(el.cronModel, {}, false, async function (data) {
                el.startAndUpdateCron()
                return data;
            }))


            let defaultFunction = await el.functionsModel.findOne({name: "default"})
            if (!defaultFunction) {
                let token = el.suuid()

                defaultFunction = new el.functionsModel({
                    name: "default",
                    token: token,
                    uri: el.api_base_uri + 'exec/default?token=' + token,
                    function: "function ({body,query,headers}) {  return body.a + body.b }",
                    method: 'POST',
                    active: true,
                    bodyParams: [
                        {
                            name: 'a',
                            kind: 'number',
                            mandatory: true,
                        }, {
                            name: 'b',
                            kind: 'number',
                            mandatory: true,
                        }
                    ],

                })
                await defaultFunction.save()
            }

            let defaultFunctionCron = await el.cronModel.findOne({name: "default"})
            if (!defaultFunctionCron) {
                let token = el.suuid()

                defaultFunction = new el.cronModel({
                    name: "default",
                    schedule: "* * * * *",
                    token: token,
                    function: "function () { console.info('Cron every minute');   return body.a + body.b }",
                    active: true
                })
                await defaultFunction.save()
            }
            el.startAndUpdateCron()
        }

        this.addHooliLogger = async function (host = "http://localhost:3333", AppName = 'tres-comas') {
            let el = this
            let logger = new hooli(host, AppName, await getId() || 'API-REST')
            const _privateLog = console.log;
            const _privateError = console.error;
            const _privateInfo = console.info;
            const _privateWarn = console.warn;
            const _privateDebug = console.debug;

            console.log = async function (message) {
                _privateLog.apply(console, arguments);
                logger.log(arguments)
            };
            console.error = async function (message) {
                _privateError.apply(console, arguments);
                logger.error(arguments)
            };
            console.info = async function (message) {
                _privateInfo.apply(console, arguments);
                logger.info(arguments)
            };
            console.warn = async function (message) {
                _privateWarn.apply(console, arguments);
                logger.warn(arguments)
            };
            console.debug = async function (message) {
                _privateDebug.apply(console, arguments);
                logger.debug(arguments)
            };
            el.app.use(morgan(function (tokens, req, res) {
                /*  Implement request logger  */
                logger.request(JSON.stringify({
                    method: tokens.method(req, res),
                    url: tokens.url(req, res),
                    status: tokens.status(req, res),
                    body: req.body,
                    query: req.query,
                    params: req.params,
                }))
                return '';
            }));
        }
        this.publishServerStats = async function () {
            let el = this
            let {cpu, drive, osCmd, mem, netstat, os} = osu
            el.app.get(el.api_base_uri + 'STATS', async function (_req, res) {
                try {
                    let obj_counts = []
                    for (let [key, value] of Object.entries(el.models_object)) {
                        obj_counts.push({
                            name: key,
                            count: await value.count()
                        })
                    }

                    let drive_info,
                        drive_free,
                        drive_used = {}
                    try {
                        drive_info = await drive.info()
                        drive_free = await drive.free()
                        drive_used = await drive.used()

                    } catch
                        (e) {
                        console.info('disco no localizado')
                    }


                    res.status(200).json({
                        success: true,
                        code: 200,
                        error: '',
                        message: 'Server statistics',
                        data: {
                            model_counts: obj_counts,
                            cpu_usage: await cpu.usage(),
                            cpu_average: await cpu.average(),
                            cpu_free: await cpu.free(),
                            cpu_count: await cpu.count(),
                            osCmd_whoami: await osCmd.whoami(),

                            mem_used: await mem.used(),
                            mem_free: await mem.free(),

                            drive_free, drive_used, drive_info,
                            netstat_inout: await netstat.inOut(),
                            os_info: await os.oos(),
                            os_uptime: await os.uptime(),
                            os_platform: await os.platform(),
                            os_ip: await os.ip(),
                            os_hostname: await os.hostname(),
                            os_arch: await os.arch(),
                        },
                        container_id: await getId()
                    })
                } catch (e) {
                    console.error(e)
                    res.status(500).json({
                        success: false,
                        code: 500,
                        error: 'Internal server error',
                        message: e.message,
                    })
                }
            })
        }
        this.getExpressInstanceApp = function () {
            return this.app
        }
        this.getMongooseInstanceApp = function () {
            return {
                mongooseInstance: this.mongoose,
                schema: {
                    FUNCTION: this.MSchema,
                    CRON: this.MCronSchema
                },
                model: {
                    FUNCTION: this.functionsModel,
                    CRON: this.cronModel
                }
            }
        }
        this.start = async function () {


            this.app.get('*', async function (_req, res) {
                res.status(404).json({
                    success: false,
                    code: 404,
                    error: 'Resource not found',
                    message: 'end-frame has been successful started',
                    container_id: await getId()
                })
            })
            if (ssl_config && ssl_config.private && ssl_config.cert && ssl_config.port) {
                this.httpsServer.listen(ssl_config.port, () => {
                    console.log("https server start al port", ssl_config.port);
                });
            }
            this.httpServer.listen(port ? port : 3000, () => {
                console.log("http server start al port", port ? port : 3000);
            });
            this.db.once("open", function () {
                console.log("MongoDB database connection established successfully", mongoDBUri);
            });
            return true
        }
    } catch (e) {
        console.error(e)
        throw e
    }
}
module.exports = endFrame
