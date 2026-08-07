const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('./src', function(err, results) {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Replace react-router-dom Link with next/link
    if (content.includes("react-router-dom")) {
      changed = true;
      content = content.replace(/import\s+{([^}]*?)}\s+from\s+['"]react-router-dom['"];/g, (match, p1) => {
        let imports = p1.split(',').map(i => i.trim());
        let res = [];
        
        if (imports.includes('Link')) {
          res.push(`import Link from 'next/link';`);
          imports = imports.filter(i => i !== 'Link');
        }
        
        let navigationImports = [];
        if (imports.includes('useNavigate')) {
          navigationImports.push('useRouter');
          imports = imports.filter(i => i !== 'useNavigate');
        }
        if (imports.includes('useParams')) {
          navigationImports.push('useParams');
          imports = imports.filter(i => i !== 'useParams');
        }
        if (imports.includes('useLocation')) {
          navigationImports.push('usePathname');
          imports = imports.filter(i => i !== 'useLocation');
        }
        
        if (navigationImports.length > 0) {
          res.push(`import { ${navigationImports.join(', ')} } from 'next/navigation';`);
        }
        
        return res.join('\n');
      });
    }

    // 2. Replace useNavigate with useRouter
    if (content.includes('useNavigate()')) {
      content = content.replace(/useNavigate\(\)/g, 'useRouter()');
      changed = true;
    }
    
    // 3. Replace navigate with router.push
    if (content.includes('navigate(')) {
      // Need to make sure navigate is defined as router. Or just replace navigate with router.push
      // Assuming 'const navigate = useRouter()' -> replace with 'const router = useRouter()'
      content = content.replace(/const navigate = useRouter\(\)/g, 'const router = useRouter()');
      content = content.replace(/navigate\(/g, 'router.push(');
      changed = true;
    }

    // 4. Replace <Link to= with <Link href=
    if (content.includes('<Link ') && content.includes('to=')) {
      content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link $1href=');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Migrated ${file}`);
    }
  });
});
