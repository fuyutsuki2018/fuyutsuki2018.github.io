#!/usr/local/bin/node

var fs = require('fs');

var data = JSON.parse(fs.readFileSync('./_catalog.json').toString());

// Index

(function () {
    var template = fs.readFileSync('./index.template.html').toString();
    var listHtml = data.contents.map(function (seriesObj) {
        return '<div class="series"><h3>' + seriesObj.seriesName + '</h3><ul>' + seriesObj.contents.map(function (chapterObj, chapterInd) {
            return '<li><a href="/article/' + chapterObj.filename + '.html" target="">' + (!chapterObj.isSeries ? (chapterInd + 1) + ' - ' : '') + chapterObj.title + '</a> ' + (chapterObj.fDraft ? '<span class="draft">' : '') + (chapterObj.fNew ? '<span class="new">' : '') + '</li>';
        }).join('') + '</ul></div>';
    }).join(' ');
    var result = template.replace('{{ LIST OF ARTICLES }}', listHtml);
    fs.writeFileSync('./index.html', result);
})();

// Article

(function () {
    var template = fs.readFileSync('./article.template.html').toString();
    data.contents.map(function (seriesObj) {
        seriesObj.contents.map(function (articleObj, articleInd) {
            var text = fs.readFileSync('./contents/' + articleObj.filename + '.txt').toString();
            var tmp = template.replace(/__ARTICLE_TITLE_HUMANREADABLE__/g, (articleInd + 1) + ' - ' + articleObj.title);
            tmp = tmp.replace(/__SERIES_NAME_HUMANREADABLE__/g, seriesObj.seriesName);
            tmp = tmp.replace('{{ CONTENT }}', '<p>' + text.split('\n\n').join('</p>\n\n<p>').replace(/"(.+?)"(\s|<)/g, '“$1”$2').trim().replace(/(\w)'(\w)/g, '$1’$2') + '</p>');
            tmp = tmp.replace('{{ PLAIN_TEXT_FILE_PATH }}', '/contents/' + articleObj.filename + '.txt');

            if (seriesObj.contents.length !== 1 && seriesObj.isSeries) { // More than one chapter && Is a series
                // Prev Link
                if (articleInd === 0) {
                    // First chapter, no prev
                    tmp = tmp.replace(/LINK_PREV_START(.|\n\s)+LINK_PREV_END/gi, 'no previous chapter');
                } else {
                    tmp = tmp.replace('{{URL_PREV}}', '/article/' + seriesObj.contents[articleInd-1].filename + '.html').replace('{{TITLE_PREV}}', seriesObj.contents[articleInd-1].title);
                };

                // Next Link
                if (articleInd === seriesObj.contents.length - 1) {
                    // Last chapter, no next link
                    tmp = tmp.replace(/LINK_NEXT_START(.|\n\s)+LINK_NEXT_END/gi, 'no next chapter');
                } else {
                    tmp = tmp.replace('{{URL_NEXT}}', '/article/' + seriesObj.contents[articleInd+1].filename + '.html').replace('{{TITLE_NEXT}}', seriesObj.contents[articleInd+1].title);
                };
            } else {
                // Only one chapter
                tmp = tmp.replace(/NAV_START(.|\n\s)+NAV_END/, 'no nav');
            };

            // Finally write the file
            fs.writeFileSync('./article/' + articleObj.filename + '.html', tmp);
        });
    });
})();
