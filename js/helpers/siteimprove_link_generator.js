// 
// Generate full list of links to all pages for SiteImprove Accessibility crawl feature
// Limitations:
// - Titles of pages are not translated (robots don't care right?)
// - Won't work 100% with more than two languages for now, link text will be duplicated
// 
// Assumptions: Structure 100% equivalent in english and french (Not working with E433 right now for example... WIP)
// 
// MODEL
// \t\t<li><a href="index_LANG.html?state=mX-Y-Z">TITLE</a></li>\n
// 
//Vars

//Contains HTML padding content for populating list
var htmlPadder = ['<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Static links for SiteImprove crawling feature</title>\n</head>\n<body>\n\t<div>\n\t\t<ul>\n','\t\t</ul>\n\t</div>\n</body>\n</html>'];

//Langs to generate, used for unilingual products (keep only working lang)
var langs = ['en','fr'];

//Inits
var buildBuffer = "";
var folderLookout = "";
var fileLookout = "";
var mf,mfa;

//Loop through FlatList
for(i in masterStructure.flatList){
    
    //Aliases
    mf = masterStructure.flatList[i];
    mfa = mf.aPosition;
    
    //Generate true URL
    // folderLookout = 'content/module'+mfa[0]+'/';
    for(ii in langs){
        
        //Build true links (unnecessary for now)
        // fileLookout = 'm'+mfa[0]+(mfa[1]?'-'+mfa[1]:'')+(mfa[2]?'-'+mfa[2]:'')+'_'+langs[ii]+'.html';

        //Build link without translated title
        buildBuffer += '\t\t\t<li><a href="index_'+langs[ii]+'.html?state=m'+mfa[0]+(mfa[1]?'-'+mfa[1]:'')+(mfa[2]?'-'+mfa[2]:'')+'">'+mf.title+(ii==1?' (Translation)':'')+'</a></li>\n';
        // console.log(folderLookout+fileLookout);
    }
}

//Show result
console.log(htmlPadder[0] + buildBuffer + htmlPadder[1]);

//Write to file (full_sitemap_for_crawling_purposes.html)