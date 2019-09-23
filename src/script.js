const shell = require("shelljs");
const escomplex = require('escomplex');

const fs = require('fs');
const path = require('path');


var data = JSON.parse(shell.head('data.json'));
var array = Object.keys(data).map(i => data[Number(i)]);

 var analyse;
var results = [];
var report;

array.forEach(function(repo){
    if (shell.exec('git clone '+ repo.url).code !== 0) {
        shell.echo('Error: Git cloning falhou!');
        shell.exit(1);
    }else{
        
        analyse = escomplex.analyse(repo.name);
        analyse.aggregate.name = repo.name;         
        // shell.ShellString(JSON.stringify(analyse)).toEnd("repositories.json");
        results.push(analyse);
        shell.rm('-rf', repo.name);
        
        // filewalker(repo.name, function(err, paths){
        //     if(err){
        //         throw err;
        //     }
        //     paths.forEach(function(file){
               
        //         if(file.substr(-2) == 'py'){
        //             // shell.echo(file);
        //             analyse = escomplex.analyse(file);
        //             analyse.aggregate.name = repo.name;         
        //             results.push(analyse);
        //         }
        //     });
        //     // shell.echo(results);
            
        // });
        
        // report = escomplex.processResults({results}, false);
        // shell.echo(report);
        // results = [];
       
    }
});
var teste = JSON.stringify(results);
shell.ShellString("{"+teste+"}").to("repositories.json");
    



// function filewalker(dir, done) {
//     let results = [];

//     fs.readdir(dir, function(err, list) {
//         if (err) return done(err);

//         var pending = list.length;

//         if (!pending) return done(null, results);

//         list.forEach(function(file){
//             file = path.resolve(dir, file);

//             fs.stat(file, function(err, stat){
//                 // If directory, execute a recursive call
//                 if (stat && stat.isDirectory()) {
//                     // Add directory to array [comment if you need to remove the directories from the array]
//                     results.push(file);

//                     filewalker(file, function(err, res){
//                         results = results.concat(res);
//                         if (!--pending) done(null, results);
//                     });
//                 } else {
//                     results.push(file);

//                     if (!--pending) done(null, results);
//                 }
//             });
//         });
//     });
//};