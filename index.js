/**
 * Primary file for the API
 * 
 * 
 */


const http = require("http");
const https = require("https");
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const { readFileSync } = require('fs');

const handler = {
    hello: (data, callback)=>{
        callback(200, {
            message: 'Welcome'
        })
    },
    notFound: (data, callback) => {
        callback(404);
    }
}

const router = {
    'hello': handler.hello
}



const unifiedServer = (req, res)=> {
    let { url:RequestUrl, method, headers } = req;
    let { pathname: path, query: queryStringObject } = url.parse(RequestUrl, true);

    path = path.replace(/^\/+|\/+$/g, "")
    
    method = method.toLowerCase();
    
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on("data", (data)=>{
        buffer += decoder.write(data);
    })

    req.on('end', ()=>{
        buffer += decoder.end();

        let chosenHandler = !!router[path] ? router[path] : handler.notFound;

        const data = {
            body: buffer,
            ...req,
            query: queryStringObject,
            path,
        }
        
        chosenHandler(data, (statusCode, payload)=>{
            statusCode = typeof statusCode == 'number' ? statusCode : 200;
            payload = typeof payload == 'object' ? payload : {};

            let payloadString = JSON.stringify(payload);

            res.setHeader("Content-Type", "application/json");
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log("Returning this response: ",statusCode,payloadString);

        })
    });
}

const httpServer = http.createServer(unifiedServer);

httpServer.listen(process.env.PORT || 3000, ()=>{
    console.log('http server up on port ' + config.httpPort);
})


