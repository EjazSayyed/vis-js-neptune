var gremlin = require('gremlin');
var http = require('http');
var url = require('url');

exports.outnodes = [];

exports.handler = function(event, context, callback) {

    var DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
    var Graph = gremlin.structure.Graph;
    dc = new DriverRemoteConnection('ws://neptune360.cluajh6rcbti.us-east-1.neptune.amazonaws.com:8182/gremlin');
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

    console.log(event.pathParameters);
    console.log(event.pathParameters.proxy);
    console.log(event.pathParameters.proxy.match(/proxy/ig));

    // this code is only for populating the search LoV
    if (event.pathParameters.proxy.match(/initialize/ig)) {
        //using another technique as opposed to creating a new callback function

        g.V().hasLabel('User').limit(1000).valueMap(true).toList().then(
            data => {
            console.log(JSON.stringify(data));
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
        console.log("initialize response: " + JSON.stringify(data));
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
        console.log("search response: " + JSON.stringify(data));
        callback(null, response);
        context.done();
        dc.close(); // look at this carefully!!!
    }).
        catch(error => {
            console.log('ERROR', error);
        dc.close();
    });
    }

    /*
    if (event.pathParameters.proxy.match(/proxy/ig)) { //check the URL of the current request
        // res.writeHead(200,{'Access-Control-Allow-Origin': '*'});
        myNodes(g, function (err, data) {
            console.log(JSON.stringify(data));
            //res.write(JSON.stringify(data));
            var response = {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify(data)
            };

            console.log("response: " + JSON.stringify(response));

            callback(null, response);
            context.done();
            dc.close();
            console.log('response returned');
           // res.end();
        });
    }
*/

    if (event.pathParameters.proxy.match(/neighbours/ig)) {
        g.V().has('User','~id',event.queryStringParameters.id).in_('Follows').valueMap(true).limit(10).toList().then(
            data => {
            console.log(JSON.stringify(data));
        var response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(data)
        };
        console.log("neighbours response: " + JSON.stringify(data));
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
        console.log("getusertweets data"+JSON.stringify(data));
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


var myNodes = function(g, callback1)
{

    var nodes=[];

    console.log('test!!');

    g.V().has('User', 'name', 'Ramon Rippin').valueMap(true).limit(10).toList().then(
        data => {
        for(let i = 0;    i < data.length;    i++)
        {
            console.log('3!!');
            nodes.push({id: data[i].id, label: data[i].name.toString(), group: 'switch', value: 10});
        }
    console.log('2!!');
    callback1(null,nodes);
    //dc.close();
    }).
    catch(error => {
        console.log('ERROR', error);
    dc.close();
    });

}
