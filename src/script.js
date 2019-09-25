const shell = require("shelljs");
const axios = require("axios");
const Promise = require('promise');

var config;
var data = JSON.parse(shell.cat('data.json'));
var array = Object.keys(data).map(i => data[Number(i)]);

array.forEach(function(repo){
    if (!shell.test('-e',repo.node.name) && shell.exec(`git clone https://github.com/${repo.node.nameWithOwner}.git`).code !== 0) {
        shell.echo('Error: Git cloning falhou!');
        shell.exit(1);
    }else{
        config = `sonar.host.url=http://localhost:9000
                  sonar.projectKey=${repo.node.nameWithOwner}
                  sonar.projectName=${repo.node.nameWithOwner}
                  sonar.projectVersion=1.0
                  sonar.projectBaseDir=${repo.node.name}
                  sonar.sources=.
                  sonar.java.binaries=.
                  sonar.exclusions=**/*.ts
                  sonar.report.export.path=${repo.node.name}report.json`;
        
        shell.ShellString(config).to('sonar-scanner/conf/sonar-scanner.properties');
        shell.exec('sonar-scanner ');
        shell.rm('-rf', repo.node.name);
        getReportMetrics(repo);
        // new Promise((resolve,reject)=>{
        //     getReportMetrics(repo).then(callback=>{
        //         resolve(true);
        //     });
        // });
    }
});

function getReportMetrics(repo){
    return axios.get(`http://localhost:9000/api/measures/component?componentKey=${repo.node.nameWithOwner}&metricKeys=ncloc,complexity,bugs,vulnerabilities,code_smells`).then(response=>{
        shell.ShellString(JSON.stringify(response.data)+',').toEnd('reports.json');
        shell.echo('oi');
    });
}