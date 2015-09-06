/*\
title: $:/plugins/danielo515/autotag/startup/tagger.js
type: application/javascript
module-type: startup

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "autotagger";
exports.after = ["startup"];
exports.platforms = ["browser"];
exports.synchronous = true;

exports.startup = function(callback) {

var getTags=$tw.wiki.compileFilter("[tags[]!is[system]sort[title]]"),
    cache={};

function autotag(changes){
    var allTags=getTags(),
        tagsRegex=new RegExp(allTags.join("|")),
        taggedTiddlers=[];
    $tw.utils.each(changes,function(tidInfo,title){
     //if the title is on the cache it means we are tagging the same tiddler twice in a row, so skip it
     // and remove it from the cache for future calls
        if(cache[title]){
            delete cache[title];
            return;
        }
        if( !/^Draft of|^\$:\//.test(title) && changes[title].modified){
            /*If the title is not a system one or draft we operate on it*/
            var tiddler=$tw.wiki.getTiddler(title).fields;
                if(tagsRegex.test(tiddler.text))
                {
                    /*If any of the tags is contained on the tiddler text, then create a new array to host the new set of tags*/
                    var newTags=[];
                        for(var i=0,x=allTags.length;i<x;i++){
                            if( tiddler.text.indexOf(allTags[i]) !==-1 && ( tiddler.tags === undefined || tiddler.tags.indexOf(allTags[i]) ==-1 )){
                                newTags.push(allTags[i]);
                            }
                        }
                    console.log(newTags);
                    cache[title]=true; // save the processed tiddler on the cache to avoid edit loops
                    taggedTiddlers.push(new $tw.Tiddler(tiddler,{tags: tiddler.tags ? newTags.concat(tiddler.tags) : newTags })); //only concatenate if the source tiddler has tagsS
                }
        }
        
    });
    $tw.wiki.addTiddlers(taggedTiddlers);
};
    $tw.wiki.addEventListener("change",autotag);

};

})();