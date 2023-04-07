# EndFrame

<hr>
<br>
<p align="center">
  <img src="./ef.png?raw=true" width="550" title="EndFrame logo">
</p>


<p align="justify">
Microservice API REST to easy implement cloud functions and CronJobs in your own infrastructure, on the fly consuming an API

Creating a rest API with for create CloudFunctions and CronJobs never was easy.

Thanks to EndFrame you can create a REST API to manage Mail

## How to use

<hr>

**Import endframe-functions basic project**

```javascript
const endFrame = require("endframe-functions");
```

**Set up the library**

```javascript


let mongoDBURI = 'mongodb://localhost/files'  // the mongo db uri where file data and properties will be  saved
let port = 3010 // port to run your app 
let options = {
    api_base_uri: '/functions/',
    activeLogRequest: true,
    active_cors: true,
    collection_name: "functions",
    collection_log: "executions",
    collection_cron: "cron",
    timezone: "America/Mexico_City",
    secure: { // if use basic auth  to consume endpoints
        user: "endframe",
        password: "piedpipper"
    }
}
let cf = new endFrame(mongoDBURI, port, options)

```

**Initialize and run the app**

```javascript
cf.initialize()
cf.start()
```

**Full example code**

```javascript
let endFrame = require('endframe-functions')


let options = {
    api_base_uri: '/functions/',
    activeLogRequest: true,
    active_cors: true,
    collection_name: "functions",
    collection_log: "executions",
    collection_cron: "cron",
    timezone: "America/Mexico_City",
    secure: { // if use basic auth  to consume endpoints
        user: "endframe",
        password: "piedpipper"
    }
}

let functions = new endFrame('mongodb://localhost/functions', 3011, options)
functions.publishServerStats()
functions.initialize()
functions.start()


```

<hr>

## endpoints

### *POST:function

This endpoint allows you to create a new cloud function

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "newDatafunction",
    "func": "function ({body,query,headers}) {  return body.a + body.b }",
    "method": "POST",
    "active": true,
    "bodyParams": [
        {
            "name": "a",
            "kind": "number",
            "mandatory": true
        },
        {
            "name": "b",
            "kind": "number",
            "mandatory": true
        }
    ],
    "queryParams": [
        {
            "name": "token",
            "kind": "string",
            "mandatory": true
        }
    ],
    "headers": []
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3011/functions/function", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "success": true,
  "code": 200,
  "error": false,
  "message": "OK",
  "container_id": false,
  "data": {
    "name": "newdatafunction",
    "uri": "/functions/exec/newdatafunction?token=4f5f9bfa",
    "token": "4f5f9bfa",
    "function": "function ({body,query,headers}) {  return body.a + body.b }",
    "method": "POST",
    "active": true,
    "bodyParams": [
      {
        "name": "a",
        "kind": "number",
        "mandatory": true,
        "_id": "6430a1c0c6acec026dd07baa"
      },
      {
        "name": "b",
        "kind": "number",
        "mandatory": true,
        "_id": "6430a1c0c6acec026dd07bab"
      }
    ],
    "queryParams": [
      {
        "name": "token",
        "kind": "string",
        "mandatory": true,
        "_id": "6430a1c0c6acec026dd07bac"
      }
    ],
    "headers": [],
    "_id": "6430a1c0c6acec026dd07ba9",
    "createdAt": "2023-04-07T23:05:36.269Z",
    "updatedAt": "2023-04-07T23:05:36.269Z",
    "__v": 0
  }
}
```

### *[POST,PUT,DELETE,GET,PATCH]:exec

This endpoint allows you to exec cloud function as an endpoint

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "a": 1233,
    "b": 1212
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3011/functions/exec/default?token=f7a6af7c", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "success": true,
  "code": 200,
  "error": false,
  "message": "OK",
  "container_id": false,
  "data": 2445,
  "log": {
    "name": "default",
    "method": "POST",
    "execID": "3a6deae4",
    "function": "\nlet moment = require('moment');\nlet axios = require('axios'); \n module.exports= async function ({body,query,headers}) {  return body.a + body.b }",
    "type": "CloudFunction",
    "response": 2445,
    "body": {
      "a": 1233,
      "b": 1212
    },
    "_id": "6430a270c6acec026dd07bb1",
    "createdAt": "2023-04-07T23:08:32.144Z",
    "updatedAt": "2023-04-07T23:08:32.144Z",
    "__v": 0
  }
}
```

### *POST:cron

This endpoint allows you to create a new CronJob on the fly

**Fetch request example**

```javascript
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "newDatafunction",
    "func": "function () {  console.log('This is a cron every minute ') ; return true }",
    "active": true,
    "schedule": "* * * * *"
});

var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
};

fetch("http://localhost:3011/functions/cron", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "success": true,
  "code": 200,
  "error": false,
  "message": "OK",
  "container_id": false,
  "data": {
    "name": "newdatafunction",
    "schedule": "* * * * *",
    "token": "33fd6963",
    "function": "function () {  console.log('This is a cron every minute ') ; return true }",
    "active": true,
    "_id": "6430a349c6acec026dd07bb3",
    "createdAt": "2023-04-07T23:12:09.001Z",
    "updatedAt": "2023-04-07T23:12:09.001Z",
    "__v": 0
  }
}
```

* Important: The cron jobs are created on the fly, You must check cron folder to depure it every certain time

### *GET:log

Allows you to list all ejecutions of functions

* query(url): Could contain the next elements
    * sort(Object):Object that defines the fields will be used for order results 'DESC' for descending or 'ASC'
      ascending
    * paginate(Object):Object with 2 properties 'page' and limit, defines the number of results to return and page
    * where(Object):Object filter to exactly match in find query for values
    * like(Object):Object filter to regex match in find query for values %LIKE% equivalent

**Fetch request example**

```javascript
var requestOptions = {
    method: 'GET',
    redirect: 'follow'
};

fetch("http://localhost:3011/functions/log", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

```

**Example fetch response**

```json
{
  "error": {},
  "success": true,
  "message": "ok",
  "code": 200,
  "data": [
    {
      "_id": "642e04e5a1178181eb2de627",
      "name": "default",
      "method": "POST",
      "execID": "157f18a1",
      "function": "module.exports= async function ({body,query,headers}) {  return body.a + body.b }",
      "type": "CloudFunction",
      "response": 1133,
      "body": {
        "a": 1233,
        "b": -100
      },
      "createdAt": "2023-04-05T23:31:49.017Z",
      "updatedAt": "2023-04-05T23:31:49.017Z",
      "__v": 0
    },
    {
      "_id": "642e060af7a34a4c9fb2d09a",
      "name": "default",
      "method": "POST",
      "execID": "3b24dba2",
      "function": "module.exports= async function ({body,query,headers}) {  return body.a + body.b }",
      "type": "CloudFunction",
      "response": 2445,
      "body": {
        "a": 1233,
        "b": 1212
      },
      "createdAt": "2023-04-05T23:36:42.679Z",
      "updatedAt": "2023-04-05T23:36:42.679Z",
      "__v": 0
    },
    {
      "_id": "642e07073cf199b83092ef78",
      "name": "default",
      "method": "POST",
      "execID": "4f981011",
      "function": "module.exports= async function ({body,query,headers}) {  return body.a + body.b }",
      "type": "CloudFunction",
      "response": 2445,
      "body": {
        "a": 1233,
        "b": 1212
      },
      "createdAt": "2023-04-05T23:40:55.291Z",
      "updatedAt": "2023-04-05T23:40:55.291Z",
      "__v": 0
    },
    {
      "_id": "642e07210727d38e170f671e",
      "name": "default",
      "method": "POST",
      "execID": "82b0e29a",
      "function": "module.exports= async function ({body,query,headers}) {  return body.a + body.b }",
      "type": "CloudFunction",
      "response": 2445,
      "body": {
        "a": 1233,
        "b": 1212
      },
      "createdAt": "2023-04-05T23:41:21.890Z",
      "updatedAt": "2023-04-05T23:41:21.890Z",
      "__v": 0
    },
    {
      "_id": "6430a270c6acec026dd07bb1",
      "name": "default",
      "method": "POST",
      "execID": "3a6deae4",
      "function": "\nlet moment = require('moment');\nlet axios = require('axios'); \n module.exports= async function ({body,query,headers}) {  return body.a + body.b }",
      "type": "CloudFunction",
      "response": 2445,
      "body": {
        "a": 1233,
        "b": 1212
      },
      "createdAt": "2023-04-07T23:08:32.144Z",
      "updatedAt": "2023-04-07T23:08:32.144Z",
      "__v": 0
    }
  ]
}

```

## OTHER endpoints

now there are another endpoints can be executed, Powered by
APIATA ( <a href="https://www.npmjs.com/package/apiato"> https://www.npmjs.com/package/apiato </a> )

Function

* GET function/one = get a function detail for search and filters
* GET function/:id = get a function detail for id
* GET function/ = get a list of functions with detail for search and filters
* PUT function/:id = updates a function by ID
* DELETE function/:id = deletes a function by ID
* POST function/dt_agr = Caller for datatable

Cron
* GET cron/one = get a cron detail for search and filters
* GET cron/:id = get a cron detail for id
* GET cron/ = get a list of cron with detail for search and filters
* PUT cron/:id = updates a cron by ID  ***(You can active or deactive Crons on the fly using this method)
* DELETE cron/:id = deletes a cron by ID
* POST cron/dt_agr = Caller for datatable

log
* GET log/one = get a log detail for search and filters
* GET log/:id = get a log detail for id
* GET log/ = get a list of log with detail for search and filters
* PUT log/:id = updates a log by ID
* DELETE log/:id = deletes a log by ID
* POST log/dt_agr = Caller for datatable

## Object request query URL example (more in APITO Docs)

**where**

```text
?where[name]=erick&where[age]=30
```

equal to

```javascript
let where = {
    name: 'erick',
    age: 30
}
```

**like**

```text
?like[name]=eri
```

equal to

```javascript
let like = {
    name: {$regex: 'eri', $options: 'i'},
}
```

**paginate**

```text
?paginate[page]=1&paginate[limit]=10
```

equal to

```javascript
let paginate = {
    page: 1,
    limit: 10
}
```

**sort**

```text
?sort[name]=DESC&sort[age]=ASC
```

equal to

```javascript
let sort = {
    name: "DESC",
    age: "ASC"
}
```

<hr>


<p align="center">
    <img src="https://leganux.net/web/wp-content/uploads/2020/01/circullogo.png" width="100" title="hover text">
    <br>
  EndFrame is another project of  <a href="https://leganux.net">leganux.net</a> &copy; 2023 all rights reserved
    <br>
   This project is distributed under the MIT license. 
    <br>

<br>
<br>
The logo and the name of EndFrame is inspired by the name of EndFrame, the fictional company  from the HBO series, Silicon Valley. This inspiration was taken for fun purposes only. The original name and logo reserve their rights to their original creators. 
</p>

