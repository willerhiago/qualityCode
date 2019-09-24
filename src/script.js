const shell = require("shelljs");
const escomplex = require('escomplex');

const path = require('path');

var config;
var data = JSON.parse(shell.cat('data.json'));
var array = Object.keys(data).map(i => data[Number(i)]);
shell.echo(__dirname);
array.forEach(function(repo){
    if (!shell.test('-e',repo.node.name) && shell.exec(`git clone https://github.com/${repo.node.nameWithOwner}.git`).code !== 0) {
        shell.echo('Error: Git cloning falhou!');
        shell.exit(1);
    }else{
        source = path.join(__dirname, '../')+repo.node.name;
        config = `sonar.host.url=http://localhost:9000
                  sonar.projectKey=${repo.node.nameWithOwner}
                  sonar.projeName=${repo.node.nameWithOwner}
                  sonar.projectVersion=1.0
                  sonar.sources=${source}`;
        
        shell.ShellString(config).to('sonar-scanner/conf/sonar-scanner.properties');
        //shell.rm('-rf', repo.node.name);
    }
});