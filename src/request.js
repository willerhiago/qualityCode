const axios = require('axios');
const shell = require("shelljs");

var data = [];
var json = {};
var cursor = null;

module.exports = {
    
    getContribuidores(row){
        return axios.get(`https://api.github.com/repos/${row.node.nameWithOwner}/contributors`).then( response=>{
            row.node.qtdContr = response.data.length; 
            return row; 
        });
    },
    
    concatResults(response){
        var json = response;
        var array = module.exports.json2array(json['data']['search']['edges']);
        cursor = response.data.search.pageInfo.endCursor;
        // let array = module.exports.json2array(json['data']['search']['edges']);
        data = data.concat(array);
    },
    
    requestData(cursor){
        var url = 'https://api.github.com/graphql';
        var after = '';
        if(cursor) after = `, after:"${cursor}"`;
        var params = JSON.stringify({
                        query : `query example { search(query: "language:python", first: 10, type: REPOSITORY ${after}) { pageInfo { hasNextPage endCursor } edges { node { ... on Repository{ name nameWithOwner createdAt updatedAt } } } } }`
                     });
        
        axios.defaults.headers.common['Authorization'] = 'Bearer e9a64335ea44cdcc22444079385a160bfed8fb6e';
        return axios.post(url, params).then( response =>{
           module.exports.concatResults(response.data);
            if(data.length <= 10) module.exports.requestData(cursor);
            if(data.length == 10){
                var promises = [];
                data.forEach( row =>{
                    promises.push(module.exports.getContribuidores(row));    
                });
                return Promise.all(promises).then( data =>{
                    shell.ShellString(JSON.stringify(data)).toEnd("data.json");
                });
            }
            
        });
    },
    
    json2array(json){
        var result = [];
        var keys = Object.keys(json);
        keys.forEach(function(key){
            result.push(json[key]);
        });
        return result;
    }

}

module.exports.requestData();
