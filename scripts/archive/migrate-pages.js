const fs = require('fs');
const path = require('path');

const clientPagesDir = path.resolve('..', 'client', 'src', 'pages');
const nextAppDir = path.resolve('.', 'src', 'app');

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

function processContent(content) {
  let changed = false;
  if (!content.includes('"use client"')) {
    content = '"use client";\n' + content;
    changed = true;
  }
  
  // Replace react-router-dom Link with next/link
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

  // Replace useNavigate with useRouter
  if (content.includes('useNavigate()')) {
    content = content.replace(/useNavigate\(\)/g, 'useRouter()');
    changed = true;
  }
  
  if (content.includes('navigate(')) {
    content = content.replace(/const navigate = useRouter\(\)/g, 'const router = useRouter()');
    content = content.replace(/navigate\(/g, 'router.push(');
    changed = true;
  }

  // Replace <Link to= with <Link href=
  if (content.includes('<Link ') && content.includes('to=')) {
    content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link $1href=');
    changed = true;
  }

  return content;
}

// Convert camelCase or PascalCase file names to Next.js routes
function getRoutePath(relativePath) {
  let route = relativePath.replace(/Page\.tsx$/, '');
  route = route.replace(/\.tsx$/, '');
  
  if (route === 'Landing') return 'page.tsx';
  
  // Create lowercase dir name from filename (e.g. FlightSearch -> flight-search)
  let dirName = route.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
  // Dashboard routes
  if (dirName.startsWith('dashboard\\')) {
    dirName = dirName.replace('dashboard\\', 'dashboard/');
    if (dirName.endsWith('dashboard')) return 'dashboard/page.tsx';
  }
  
  if (dirName.startsWith('admin\\')) {
    dirName = dirName.replace('admin\\', 'admin/');
    if (dirName.endsWith('admin-dashboard')) return 'admin/page.tsx';
  }

  if (dirName.startsWith('auth\\')) {
    dirName = dirName.replace('auth\\', 'auth/');
  }

  return `${dirName}/page.tsx`;
}

walk(clientPagesDir, function(err, results) {
  if (err) throw err;
  results.forEach(file => {
    let relativePath = path.relative(clientPagesDir, file);
    let routePath = getRoutePath(relativePath);
    let destPath = path.resolve(nextAppDir, routePath);
    
    // Create directory if not exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    
    let content = fs.readFileSync(file, 'utf8');
    content = processContent(content);
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Mapped ${relativePath} to ${routePath}`);
  });
});

// Prepend "use client" to all components
walk(path.resolve('.', 'src', 'components'), function(err, results) {
  if (err) throw err;
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('"use client"')) {
      content = '"use client";\n' + content;
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added use client to ${file}`);
    }
  });
});
