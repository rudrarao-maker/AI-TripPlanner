const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, 'src', 'components', 'layout', 'Navbar.tsx');
let content = fs.readFileSync(navbarPath, 'utf8');

// Replacements
content = content.replace('const { user, isSignedIn: isAuthenticated } = useUser();', 'const { user, signOut: logout } = useUser();\n  const isAuthenticated = !!user;');
content = content.replace('const { signOut: logout } = useClerk();\n', '');
content = content.replace('const location = useLocation();', 'const pathname = usePathname();');
content = content.replace(/location\.pathname/g, 'pathname');

// User properties
content = content.replace(/user\?\.imageUrl/g, 'user?.user_metadata?.avatar_url');
content = content.replace(/user\.imageUrl/g, 'user?.user_metadata?.avatar_url');
content = content.replace(/user\?\.fullName \|\| user\?\.firstName/g, 'user?.user_metadata?.full_name');
content = content.replace(/user\.fullName \|\| user\.firstName/g, 'user?.user_metadata?.full_name');
content = content.replace(/user\?\.primaryEmailAddress\?\.emailAddress/g, 'user?.email');

fs.writeFileSync(navbarPath, content);
console.log('Fixed Navbar.tsx');
