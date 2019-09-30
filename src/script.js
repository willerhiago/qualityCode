const shell = require("shelljs");
const request = require("./request");


/**
 * Necessário rodar o script "npm run requestData" para requisição dos dados a serem analisados 
 */
var config;
var data = JSON.parse(shell.cat('data.json'));
var array = Object.keys(data).map(i => data[Number(i)]);

var countRepos = 0;

for (let index = 0; index < array.length; index++) {
    if (!shell.test('-e',array[index].node.name) && shell.exec(`git clone https://github.com/${array[index].node.nameWithOwner}.git`).code !== 0) {
        shell.echo('Error: Git cloning falhou!');
    }else{
        try{
            config = `sonar.host.url=http://localhost:9000
                  sonar.projectKey=${array[index].node.nameWithOwner}
                  sonar.projectName=${array[index].node.nameWithOwner}
                  sonar.projectVersion=1.0
                  sonar.projectBaseDir=${array[index].node.name}
                  sonar.sourceEncoding=UTF-8
                  sonar.sources=.
                  sonar.java.binaries=.
                  sonar.exclusions=**/*.ts
                  sonar.report.export.path=${array[index].node.name}report.json`;
        
            shell.ShellString(config).to('sonar-scanner/conf/sonar-scanner.properties');
            shell.exec('sonar-scanner ');
            //shell.rm('-rf', array[index].node.name);
            countRepos++;
            shell.echo('---------------------------------');
            shell.echo('Repositorios analisados: '+ countRepos);
            shell.echo('---------------------------------');
            request.getReportMetrics(array[index]);
        }catch(e){
            shell.echo('Erro: '+ array[index].node.nameWithOwner );
            shell.echo(e);
        }
    }
    
}