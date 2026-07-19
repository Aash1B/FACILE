const fs = require('fs');
const path = 'FRONTEND/app/(shop)/profile/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace duplicated tags due to the #E6E6FA vs #DDE0F0 conflict
// This looks for anything containing #E6E6FA that is followed by the exact same line but with #DDE0F0
content = content.replace(/^(.*)\[#E6E6FA\](.*)\r?\n\s*(.*)\[#DDE0F0\](.*)\r?\n/gm, (match, p1, p2, p3, p4) => {
    // Keep the #E6E6FA version or #DDE0F0 version. The user probably wants #DDE0F0 since it's the remote change.
    return p3 + '[#DDE0F0]' + p4 + '\n';
});

// There is also a motion.div duplicated block
content = content.replace(/<div className="bg-\[#E6E6FA\] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural\/10 space-y-8">\s*<div className="bg-\[#DDE0F0\] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural\/10 space-y-8">/g, 
  '<div className="bg-[#DDE0F0] rounded-3xl p-6 sm:p-8 shadow-sm border border-natural/10 space-y-8">');

content = content.replace(/<label className="absolute left-4 -top-2 text-\[10px\] font-bold text-fern bg-\[#E6E6FA\] px-1 pointer-events-none">\s*<label className="absolute left-4 -top-2 text-\[10px\] font-bold text-fern bg-\[#DDE0F0\] px-1 pointer-events-none">/g, 
  '<label className="absolute left-4 -top-2 text-[10px] font-bold text-fern bg-[#DDE0F0] px-1 pointer-events-none">');

content = content.replace(/className="peer w-full h-14 px-4 bg-transparent border-2 border-natural\/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-\[#E6E6FA\] focus:shadow-sm placeholder-transparent"\s*className="peer w-full h-14 px-4 bg-transparent border-2 border-natural\/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-\[#DDE0F0\] focus:shadow-sm placeholder-transparent"/g, 
  'className="peer w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm placeholder-transparent"');

content = content.replace(/className="w-full h-14 px-4 bg-transparent border-2 border-natural\/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-\[#E6E6FA\] focus:shadow-sm appearance-none cursor-pointer"\s*className="w-full h-14 px-4 bg-transparent border-2 border-natural\/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-\[#DDE0F0\] focus:shadow-sm appearance-none cursor-pointer"/g, 
  'className="w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm appearance-none cursor-pointer"');

content = content.replace(/className="peer w-full h-14 px-4 bg-transparent border-2 border-natural\/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-\[#E6E6FA\] focus:shadow-sm"\s*className="peer w-full h-14 px-4 bg-transparent border-2 border-natural\/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-\[#DDE0F0\] focus:shadow-sm"/g, 
  'className="peer w-full h-14 px-4 bg-transparent border-2 border-natural/20 text-sm font-medium text-fern rounded-2xl outline-none transition-all focus:border-fern focus:bg-[#DDE0F0] focus:shadow-sm"');

fs.writeFileSync(path, content);
console.log('Fixed profile page');
