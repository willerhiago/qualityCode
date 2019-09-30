const axios = require('axios');
const shell = require("shelljs");


var data = [];
var json = {};
var cursor = null;
var self = this;
var count = 0;

module.exports = {

    getReportMetrics(repo){
        return axios.get(`http://localhost:9000/api/measures/component?componentKey=${repo.node.nameWithOwner}&metricKeys=ncloc,complexity,bugs,vulnerabilities,code_smells`).then(response=>{
            shell.ShellString(JSON.stringify(response.data)+',').toEnd('reports.json');
        });
    },

    getContribuidores(row){
        try{
            shell.echo(++count);
            return axios.get(`https://api.github.com/repos/${row.node.nameWithOwner}/contributors`).then( response=>{
                row.node.qtdContr = response.data.length; 
            return row; 
            });
        }catch(e){
            shell.echo(e);
            
        }
        
    },
    
    concatResults(response){
        var json = response;
        var array = module.exports.json2array(json['data']['search']['edges']);
        self.cursor = response.data.search.pageInfo.endCursor;
        // let array = module.exports.json2array(json['data']['search']['edges']);
        data = data.concat(array);
    },
    
    requestData(cursor){
        var url = 'https://api.github.com/graphql';
        var after = '';
        if(cursor) after = `, after:"${cursor}"`;
        var params = JSON.stringify({
                        query : `query example { search(query: "language:kotlin", first: 20, type: REPOSITORY ${after}) { pageInfo { hasNextPage endCursor } edges { node { ... on Repository { name nameWithOwner createdAt updatedAt stargazers{ totalCount } } } } } }`
                     });
        
        axios.defaults.headers.common['Authorization'] = 'Bearer e0ce543a422019073e0d5724de522258f37149f5';
        return axios.post(url, params).then( response =>{
           module.exports.concatResults(response.data);
           shell.echo(data.length); 
            if(data.length <= 1000) module.exports.requestData(self.cursor);
            if(data.length == 1000){
                shell.ShellString(JSON.stringify(data)).to("data.json");
                var promises = [];
                data.forEach( row =>{
                    promises.push(module.exports.getContribuidores(row));    
                });
                return Promise.all(promises).then( data =>{
                    shell.echo(data);
                    shell.ShellString(JSON.stringify(data)).to("data.json");
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

module.exports.requestData(self.cursor);
// module.exports = getReportMetrics;
