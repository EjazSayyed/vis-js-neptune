/*
 * Copyright 2018. Amazon Web Services, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/

var gremlin = require('gremlin');
var http = require('http');
var url = require('url');

exports.outnodes = [];

exports.handler = function(event, context, callback) {

    var DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
    var Graph = gremlin.structure.Graph;
    dc = new DriverRemoteConnection('ws://'+process.env.NEPTUNE_CLUSTER_ENDPOINT+':'+process.env.NEPTUNE_PORT+'/gremlin');
    var graph = new Graph();
    var g = graph.traversal().withRemote(dc);

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        /** add other headers as per requirement */
        'Access-Control-Allow-Headers' : '*',
        "Content-Type": "application/json"
    };

    console.log("Path Parameters => "+ event.pathParameters);
    console.log("event.pathParameters.proxy => "+ event.pathParameters.proxy);
    console.log(event.pathParameters.proxy.match(/proxy/ig));

    // this code is only for populating the search LoV
    if (event.pathParameters.proxy.match(/initialize/ig)) {
        //using another technique as opposed to creating a new callback function

        g.V().hasLabel('User').limit(1000).valueMap(true).toList().then(
            data => {
            console.log("Response from Neptune for initialize .." + JSON.stringify(data));
        var nodes=[];
        for(var i = 0;    i < data.length;    i++)
        {
            nodes.push({name: data[i].name.toString()});
        }
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(nodes)
        };
        console.log("Initialize call response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }


    if (event.pathParameters.proxy.match(/search/ig)) {
        g.V().has('name', gremlin.process.P.between(event.queryStringParameters.username, event.queryStringParameters.touser)).limit(20).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
            var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("Search call response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }


    if (event.pathParameters.proxy.match(/neighbours/ig)) {
        g.V().has('User','~id',event.queryStringParameters.id).in_('Follows').valueMap(true).limit(10).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getNeighbours response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close();
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });

    }


    if (event.pathParameters.proxy.match(/getusertweets/ig)) {
        g.V().has('User', '~id', event.queryStringParameters.userid).out('Tweets').limit(3).valueMap(true).toList().then(
            data => {
        console.log("getusertweets data" + JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getusertweets response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
        }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
        });
    }


    if (event.pathParameters.proxy.match(/whichusersliketweet/ig)) {
        g.V().has('Tweet','~id',event.queryStringParameters.tweetid).in_('Likes').hasLabel('User').limit(5).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("getusertweets response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }


}

