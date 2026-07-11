const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('route.ts')) results.push(file);
    }
  });
  return results;
}

const routes = walk('src/app/api');
routes.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('prisma') && !content.includes('force-dynamic')) {
    // find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for(let i=0; i<lines.length; i++){
      if(lines[i].startsWith('import ')) lastImportIndex = i;
    }
    lines.splice(lastImportIndex + 1, 0, '\nexport const dynamic = "force-dynamic";\n');
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Added force-dynamic to ' + file);
  }
});
