//
// GSS3 protocol analyzer
//                                                 Copyright 2009 ABEKAWA Takeshi
//                                                             abekawa ( at ) nii.ac.jp
//
var gss3;
var GSS3 = function () {}
GSS3.prototype =
{
    url: '',
    url_form: '<form onsubmit="gss3.searchCatalogue(); return false;">\
               <span id="url">Getassoc Url</span>: \
               <input type="text" name="input_url" id="input_url"/>\
               <button type="submit">Submit</button></form>',
    objXml: null,
    stemmer: null,
    properties: null,
    mode: 'assoc',
    prevMode: '',
    checked: {},
    pagerOffset: null,
    crossRef: {},
    maxScore: {},

    init: function() {
        this.stemmer = new Object();
        this.properties = {};
        this.checked['articleName'] = new Array();
        this.checked['keywordVector'] = new Array();
        // $("#url_div").html(this.url_form);
        this.maxScore['article'] = {};
        this.maxScore['keyword'] = {};

        $("#menu_assoc").addClass("menuSelected");

        $("button")
        .live("mouseover", function(){
            $(this).addClass("bHover");
        })
        .live("mouseout", function(){
            $(this).removeClass("bHover");
        });

        // Live event
        //$(".articles tr")
        $("tr.Harticle")
        .live("mouseover", function(){
            gss3.crossOverOut('over', 'article', $(this).attr('id'));
            $(this).addClass("over");
        })
        .live("mouseout", function(){
            gss3.crossOverOut('out', 'article', $(this).attr('id'));
            $(this).removeClass("over");
        });

        $("tr.Hkeyword")
        .live("mouseover", function(){
            gss3.crossOverOut('over', 'keyword', $(this).attr('id'));
            $(this).addClass("over");
        })
        .live("mouseout", function(){
            gss3.crossOverOut('out', 'keyword', $(this).attr('id'));
            $(this).removeClass("over");
        });

        /*
        $(".articles table tr").live("click", function(){
            $(this).toggleClass("clicked");
            gss3.checkForm( 'articleName', $(this).attr("name") );
        });
        $(".keywords tr").live("click", function(){
            $(this).toggleClass("clicked");
            gss3.checkForm( 'keywordVector', $(this).attr("name") );
        });
        */
    },

    submitUrl: function(callBack) {
        /*
        if ( $("#input_url").val() == null ) {
            alert("Please input GETASSOC URL.");
            return;
        } else {
            this.url = $("#input_url").val();
        }
        */
        if ( this.url == null ) {
            alert("Please input GETASSOC URL.");
            return;
        }
        $.ajax({
            url: this.url,
            type: 'POST',
            timeout: 30000,  // 30s
            processData: false,
            dataType: 'xml',
            contentType : "text/xml; charset=UTF-8",
            data: this.objXml,
            success: callBack,
            error: function(XMLHttpRequest, textStatus, errorThrown){
                $('#result > img').remove();
                $('.articles').text('Error loading XML document: ' + textStatus);
            }
        });

    },

    searchCatalogue: function() {
        this.makeXml("catalogue"); 
        this.submitUrl(this.callBackInquire);
    },

    callBackInquire: function(xml) {
        $('#catalogue').empty();
        $('#stage1target').empty();
        $('#ftsTarget').empty();
        $("#propertyTarget").empty();
        var d = new Date();
        $('<tr></tr>').html('<th>Name</th><th>Title</th><th>Properties</th><th>Stemmer</th><th>#Articles</th><th>Create time</th>').appendTo('#catalogue');

        $(xml).find('corpus').each(function(){
            var corpus = $(this);
            var name = corpus.attr('name');
            var target = $('<option></option>').html( corpus.attr('title') )
                                               .attr( {'value': name} )
                                               .appendTo('#stage1target');
            if ( corpus.attr('properties').match(/\@fss/) )
                target.clone().appendTo('#ftsTarget');
            gss3.stemmer[name] = corpus.attr('stemmer');
            gss3.properties[name] = corpus.attr('properties').split(',');
            d.setTime( corpus.attr('created')*1000 );
            $('<tr></tr>')
                .append($('<td></td>').html( name ))
                .append($('<td></td>').html( corpus.attr('title') ))
                .append($('<td></td>').html( corpus.attr('properties') ))
                .append($('<td></td>').html( corpus.attr('stemmer') ))
                .append($('<td class="alignRight"></td>').html(
             corpus.attr('number-of-articles').replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g,'$1,') ))
                .append($('<td></td>').html( d.toLocaleString() ))
                .appendTo('#catalogue');
        });
        $('#stage1target > option:first').attr('selected', 'selected');
        $('#stage1target > option').clone().appendTo("#propertyTarget");
        $('#catalogue tr:odd').addClass('row');

        if ( $('#stage1target') ) {
            $('#queries').show();
            $('#contents').show();
            $('#footer').show();
        }
        //gss3.searchArticle();
    },

    stage1Response: function(xml) {
        gss3.makeXml('stage2', xml);
        gss3.submitUrl(gss3.stage2Response);
    },

    stage2Response: function(xml) {
        $('#time').text( $(xml).find('gss').attr("user-time") + 's' );
        gss3.makeResultTable(xml, 'articles', 'article', 'articleName');
        gss3.makeResultTable(xml, 'keywords', 'keyword', 'keywordVector');
        $('#result > img').remove();
    },

    makeResultTable: function(xml, kinds, kind, queryForm) {
        var kindObj = $(xml).find(kinds);
        var totalResult = kindObj.attr('total');
        this.maxScore[kind]['keyword'] = 0;
        this.maxScore[kind]['article'] = 0;

        if ( totalResult > 0 ) {
            var prntObj = ( this.mode == 'assoc' ) ? $('#assocResult') : $('#ftsResult');
            var obj = $('.' + kinds, prntObj);
            obj.html('<table></table>');
            $('<ul></ul>').addClass("totalResult")
                          .append( $('<li></li>').html( totalResult + ' ' + kinds ) )
                          .prependTo( obj );

            // make paging button
            if ( kind == 'article' ) {
                var aOffsetInput =
                  (this.pagerOffset == null ? Number($("#aOffsetInput").val()) : this.pagerOffset);
                var narticlesSelect = Number($("#narticlesSelect").val());
                var ulObj = $('<ul></ul>').addClass("pagerTop");
                if ( aOffsetInput > 0 ) {
                    var selectNum = Math.min(narticlesSelect, aOffsetInput);
                    var newOffset = aOffsetInput - selectNum;
                    $('<li></li>').html('<a onclick="gss3.searchArticleFrom('
                                        + newOffset + ')">prev '+ selectNum + ' &lt; </a>' )
                                  .appendTo( ulObj );
                }
                $('<li></li>').addClass('from')
                              .html('from ' + (aOffsetInput+1) )
                              .appendTo( ulObj );
                if ( totalResult > aOffsetInput + narticlesSelect ) {
                    var selectNum = Math.min(narticlesSelect,
                                             totalResult - aOffsetInput - narticlesSelect);
                    var newOffset = aOffsetInput + selectNum;
                    $('<li></li>').html('<a onclick="gss3.searchArticleFrom('
                                        + newOffset + ')">&gt; next ' + selectNum + ' </a>' )
                                  .appendTo( ulObj );
                }
                this.pagerOffset = null;
                ulObj.prependTo( obj );
            }

            // search results
            var clsNum = 1;
            var clsObj = kindObj.find('cls');
            var colspan = 2;
            if ( kind == 'article' && this.mode == 'assoc' ) colspan = 3;

            var heading = $('<tr></tr>');
            if ( (kind == 'article' && colspan == 3) || kind == 'keyword' )
                heading.append( $('<th></th>').addClass('heading').html('Score') );
            heading.append( $('<th></th>').addClass('heading').html('Name') )
            if ( kind == 'article' )
                heading.append( $('<th></th>').addClass('heading').html('Title') )
            heading.appendTo( $('table', obj) );

            clsObj.each(function(){
                // cluster row
                if ( clsObj.length > 1 ) {
                    $('<tr></tr>').addClass('cluster')
                                  .append( $('<th></th>').attr('colspan', colspan)
                                                         .html('Cluster ' + clsNum++)
                                          )
                                  .appendTo( $('table', obj) );
                }

                $(this).children().each(function(){
                    var score = Number($(this).attr('score')).toFixed(3);
                    var tr = $('<tr></tr>').addClass('found');
                    var name = $(this).attr('name');
                    tr.attr('id', name);
                    if ( (kind == 'article' && colspan == 3) || kind == 'keyword' )
                        tr.append( $('<td></td>').attr('score', score).html(score) );
                    tr.append( $('<td></td>').html(name) );
                    if ( kind == 'article' ) {
                        var aTag = '<a onclick="gss3.titleClick(\'';
                        aTag += name;
                        aTag += '\')">';
                        aTag += $(this).attr('title');
                        aTag += '</a>';
                        tr.append( $('<td></td>').addClass('ftitle').html(aTag) );
                    }
                    var children = $(this).children();
                    if ( children.length > 0 ) tr.addClass('H'+kind);
                    tr.appendTo( $('table', obj) );

                    // for cross correlation
                    if ( children.length > 0 ) {
                        var cross = {};
                        cross['article'] = {};
                        cross['keyword'] = {};
                        children.each(function(){
                            var target = jQuery.nodeName(this, 'article') ? 'article' : 'keyword';
                            var n = $(this).attr('name');
                            var s = Number($(this).attr('score'));
                            cross[target][n] = s;
                            if ( s > gss3.maxScore[kind][target] && n != name )
                                gss3.maxScore[kind][target] = s;
                        });
                        gss3.crossRef[name] = cross;
                    }
                        
                });
            });
            $('.found:even', obj).addClass('row');
/*
            $(gss3.checked[queryForm]).each(function(){
                var key = this;
                $('table tr', obj).each(function(){
                    if ( $(this).attr('name') == key )
                        $(this).addClass('clicked');
                });
            });
*/
        }
    },

    searchArticle: function() {
        if (this.mode == 'assoc') $('#assocResult').show();
        this.clearResult();
        this.makeXml(this.mode);
        this.submitUrl(this.stage2Response);
    },

    searchArticleFrom: function(newOffset) {
        this.pagerOffset = newOffset;
        this.searchArticle();
    },

    searchDivide: function() {
        this.clearResult();
        this.makeXml('stage1');
        this.submitUrl(this.stage1Response);
    },

    clearResult: function() {
        $('<img src="load.gif" />').appendTo( $('#result') );
        var prntObj = ( this.mode == 'assoc' ) ? $('#assocResult') : $('#ftsResult');
        $('.articles', prntObj).html('');
        $('.keywords', prntObj).html('');
    },

    makeXml: function(mode, xml) {
        this.objXml = null;
        if (document.all) {
            this.objXml = new ActiveXObject("Microsoft.XMLDOM");
        } else {
            this.objXml = document.implementation.createDocument("", "", null);
        }
        var p = this.objXml.createProcessingInstruction("xml",
                                                        "version=\"1.0\" encoding=\"UTF-8\"");
        this.objXml.appendChild(p);
        var gss = this.objXml.createElement('gss'); 
        this.createAttributes(gss, {version: "3.0"});

        var node;
        if ( ! mode ) mode = this.mode;
        if (mode == "assoc" || mode == "stage1" ) {
            var queries = this.makeQueries();
            if ( queries.length == 0 ) { alert("Queries are empty."); return;}
            if ( mode == "assoc" )
                node = this.makeAssoc(queries);
            else
                node = this.makeStage1(queries);
        } else if ( mode == "fts" ) {
            node = this.makeFullText();
        } else if ( mode == "getprop" ) {
            node = this.makeProp();
        } else if ( mode == "catalogue" ) {
            node = this.makeInquire();
        } else if ( mode == 'stage2' ) {
            node = gss3.makeStage2( xml );
        }
        gss.appendChild(node);
        this.objXml.appendChild(gss); 
    },

    makeInquire: function() {
        var inquire = this.objXml.createElement('inquire'); 
        this.createAttributes(inquire, {'type': "catalogue"});
        return inquire;
    },

    makeAssoc: function(elements) {
        var assoc = this.objXml.createElement('assoc'); 

        var attrs1 = this.makeStage1Attribute();
        this.createAttributes(assoc, attrs1);
        var attrs2 = this.makeStage2Attribute();
        this.createAttributes(assoc, attrs2);
       
        jQuery.each(elements, function(){
            assoc.appendChild( $(this).get(0) );
        });

        this.makeFilters(assoc);
        return assoc;
    },

    makeFullText: function() {
        var assoc = this.objXml.createElement('assoc'); 
        var attrs2 = this.makeStage2Attribute();
        attrs2['target'] = $("#ftsTarget").val();
        this.createAttributes(assoc, attrs2);

        var search = this.objXml.createElement('search'); 
        if ( $('#segments').val() != '' )
            this.createAttributes(search, {segments: $('#segments').val()});

        if ( $('#ftsOptions').val() ) {
            var options = $("#ftsOptions").val() || [];
            this.createAttributes(search, {options: options.join(',')});
        }
        var join = this.objXml.createElement('join'); 
        if ( $('#fulltext').val() != '' ) {
            var p = this.objXml.createElement('p');
            $(p).text( $('#fulltext').val() );
            join.appendChild( p );
        }
        search.appendChild( join );
        assoc.appendChild( search );
        return assoc;
    },

    makeProp: function() {
        var self = this;
        var query = $('#property').val();
        if ( query == '' )
            return;
        var target = $("#propertyTarget").val();
        var properties = ['vec'];
        jQuery.each(self.properties[target].reverse(), function() {
            if ( this.substr(0,1) != '@' )
                properties.unshift(this);
        });
        var prop = this.objXml.createElement('getprop'); 
        this.createAttributes( prop, {target: target, 'a-props': properties.join(',')} );

        var names = query.split(',');
        $(names).each(function(){
            if ( this != '' ) {
                var val = jQuery.trim(this);
                var element = self.objXml.createElement('article'); 
                self.createAttributes(element, {name: val});
                prop.appendChild(element);
            }
        });
        return prop;
    },

    makeStage1: function(elements) {
        var attrs = this.makeStage1Attribute();
        attrs['xstage'] = "1";
        var assoc = this.objXml.createElement('assoc'); 
        this.createAttributes(assoc, attrs);
        jQuery.each(elements, function(){
            assoc.appendChild( $(this).get(0) );
        });
        return assoc;
    },

    makeStage2: function(xml) {
        var self = this;
        var attrs = this.makeStage2Attribute();
        attrs['xstage'] = "2";
        var assoc = this.objXml.createElement('assoc'); 
        this.createAttributes(assoc, attrs);
        $(xml).find('keyword').each(function(){
            var keyword = self.objXml.createElement('keyword'); 
            self.createAttributes(keyword, {name: $(this).attr('name'),
                                            score: $(this).attr('score'),
                                            TFd: $(this).attr('TFd')
                                  });
            assoc.appendChild( keyword );
        });
        this.makeFilters(assoc);
        return assoc;
    },

    makeQueries: function() {
        var queries = new Array();
        this.makeFreetextQuery(queries);
        this.makeArticleQuery(queries);
        this.makeKeywordQuery(queries);
        return queries;
    },

    makeFreetextQuery: function(queries) {
        if ( $('#freetext').val() == '' ) return;
        var freetext = this.objXml.createElement('freetext');
        $(freetext).text( $('#freetext').val() );
        this.createAttributes(freetext, {'cutoff-df': "0",
                          'stemmer': this.stemmer[$('#stage1target').attr('value')]} );
        queries.push(freetext);
    },

    makeArticleQuery: function(queries) {
        var self = this;
        var query = $('#articleName').val();
        if ( query == '' ) return;
        var names = query.split(',');
        self.checked['articleName'].length = 0;
        $(names).each(function(){
            if ( this != '' ) {
                var val = jQuery.trim(this);
                self.checked['articleName'].push(val);
                var node = self.objXml.createElement('article');
                self.createAttributes(node, {'name': val} );
                queries.push(node);
            }
        });
    },

    makeKeywordQuery: function(queries) {
        var self = this;
        var query = $('#keywordVector').val();
        if ( query == '' ) return;
        var vec = '';
        var keywords = query.split(',');
        self.checked['keywordVector'].length = 0;
        $(keywords).each(function(){
            var val = jQuery.trim(this);
            self.checked['keywordVector'].push(val);
            if ( val.indexOf(':', 0) != -1 ) {
                var list = val.split(':');
                vec += ',["' + jQuery.trim(list[0]) + '",' + jQuery.trim(list[1]) + ']';
            } else if ( val != '' ) {
                vec += ',["' + val + '",1]';
            }
        });
        if ( vec.substr(0,1) == ',' ) {
            var node = self.objXml.createElement('article');
            self.createAttributes(node, {'vec': '[' + vec.substr(1) + ']'} );
            queries.push(node);
        }
    },

    makeStage1Attribute: function() {
        var attrs = {
            target: $("#stage1target").val(),
            niwords: $("#niwords").val(),
            'cutoff-df': $("#cutoffDf").val(),
            'stage1-sim': $("#stage1WeightSelect").val(),
        };
        return attrs;
    },

    makeStage2Attribute: function() {
        var crossRefs = new Array();
        $('input[checked="true"]', $('#stage2')).each(function(){
            crossRefs.push($(this).next().text());
        });
        var attrs = {
            // target: $("#stage2target").val(),
            target: $("#stage1target").val(),
            narticles: $("#narticlesSelect").val(),
            nkeywords: $("#nkeywordsSelect").val(),
            yykn: $("#yykn").val(),
            nacls: $("#nacls").val(),
            nkcls: $("#nkcls").val(),
            'a-offset': (this.pagerOffset == null ? $("#aOffsetInput").val() : this.pagerOffset),
            'a-props': "title",
            'cross-ref': crossRefs.join(','),
            'stage2-sim': $("#stage2WeightSelect").val()
        };
        return attrs;
    },

    makeFilters: function(assoc) {
        if ( $('#filterInclude').val() != '' || $('#filterExclude').val() != '' )
            assoc.appendChild( this.makeFilterXML() );

        if ( $('#filterPhraseInclude').val() != '' || $('#filterPhraseExclude').val() != '' )
            assoc.appendChild( this.makeFilterPhraseXML() );
    },
    
    makeFilterXML: function() {
        var words = new Array();
        if ( $('#filterInclude').val() != '' )
            $($('#filterInclude').val().split(',')).each(function(){
                words.push('"' + jQuery.trim(this) + '"');
            });
        if ( $('#filterExclude').val() != '' )
            $($('#filterExclude').val().split(',')).each(function(){
                words.push('!"' + jQuery.trim(this) + '"');
            });
        if ( words.length == 0 ) return;
        var filter = this.objXml.createElement('filter'); 
        var attrs = {expression: '(' + words.join(' & ') + ')'};
        this.createAttributes(filter, attrs);
        return filter;
    },

    makeFilterPhraseXML: function() {
        if ( $('#filterPhraseInclude').val() == '' && $('#filterPhraseExclude').val() == '' )
            return;
        var self = this;
        var join = this.objXml.createElement('join'); 
        if ( $('#filterPhraseInclude').val() != '' )
            $($('#filterPhraseInclude').val().split(',')).each(function(){
                var p = self.objXml.createElement('p'); 
                $(p).text( jQuery.trim(this) );
                join.appendChild( p );
            });
        if ( $('#filterPhraseExclude').val() != '' )
            $($('#filterPhraseExclude').val().split(',')).each(function(){
                var n = self.objXml.createElement('n'); 
                $(n).text( jQuery.trim(this) );
                join.appendChild( n );
            });
        var search = this.objXml.createElement('search'); 
        search.appendChild( join );
        var filter = this.objXml.createElement('filter');
        filter.appendChild( search );
        return filter;
    },

    createAttributes: function(element, attrs) {
        for (var attr in attrs) {
            var attrNode = this.objXml.createAttribute(attr);
            attrNode.value = attrs[attr];
            element.setAttributeNode(attrNode);
        }
    },

    //
    // Add or remove its value in form when an article or a keyword is clicked.
    //
    checkForm: function(kind, name) {
        if (name == undefined) return;
        var checkedArray = this.checked[kind];
        var newArray = new Array();
        var flag = true;
        for (var i=0; i<checkedArray.length; ++i) {
            if ( checkedArray[i] == name )
                flag = false;
            else
                newArray.push(checkedArray[i]);
        }
        if ( flag ) newArray.push(name);
        this.checked[kind] = newArray;
        $('#'+kind).val( newArray.join(', ') );
    },

    changeTarget: function() {
        this.searchArticle();
    },

    changeNarticles: function() {
        this.searchArticle();
    },

    changeNkeywords: function() {
        this.searchArticle();
    },

    changeClusterNum: function() {
        this.searchArticle();
    },

    changeCrossRef: function() {
        this.searchArticle();
    },

    changeStage2Weight: function() {
        this.searchArticle();
    },

    //
    // show stage1 XML format
    //
    showStage1XML: function() {
        this.makeXml('stage1');
        var xml = $(this.objXml).toXML();
        this.showXML(xml);
    },

    //
    // Show stage2 XML format (part1)
    //
    showStage2XML: function() {
        this.makeXml('stage1');
        this.submitUrl(this.showStage2XML2);
    },

    //
    // Show stage2 XML format (part2)
    //
    showStage2XML2: function(xml) {
        gss3.makeXml('stage2', xml);
        var res = $(gss3.objXml).toXML();
        gss3.showXML(res);
    },

    //
    // Clear values in all query forms
    //
    clearQueries: function() {
        $('#freetext').val("");
        $('#articleName').val("");
        $('#keywordVector').val("");
        $('#filterInclude').val("");
        $('#filterExclude').val("");
        $('#filterPhraseInclude').val("");
        $('#filterPhraseExclude').val("");
        $("#aOffsetInput").val(0);

        this.checked['articleName'].length = 0;
        this.checked['keywordVector'].length = 0;
        $(".keywords tr.clicked").removeClass("clicked");
        $(".articles tr.clicked").removeClass("clicked");
    },

    clearFts: function() {
        $('#fulltext').val("");
    },

    clearProperty: function() {
        $('#property').val("");
    },

    fullTextSearch: function() {
        this.clearResult();
        this.makeXml('fts');
        this.submitUrl(this.stage2Response);
    },

    menuClick: function(mode) {
        this.prevMode = this.mode;
        this.mode = mode;
        jQuery.each(["assoc", "fts", "getprop", "catalogue"], function(){
            if ( this == mode ) {
                $('#menu_'+this).addClass("menuSelected");
                $('#'+this).show();
            } else if ( $('#'+this).css("display") == "table" ) {
                $('#menu_'+this).removeClass("menuSelected");
                $('#'+this).hide();
            }
        });
        if ( mode == "getprop" || mode == "catalogue" ) {
            $("#arguments").hide();
            $("#assocResult").hide();
            $("#ftsResult").hide();
            $("#result").css("margin-left", 0);

            if ( mode == "getprop" ) {
                var target;
                if ( this.prevMode == 'assoc' )
                    target = $('#stage1target').attr('value');
                else if ( this.prevMode == 'fts' )
                    target = $('#ftsTarget').attr('value');
                $("#propertyTarget > option[value='" + target + "']").attr('selected', 'selected');

                if ( this.prevMode == 'assoc' && $('#articleName').val() ) {
                    $("#property").val( $('#articleName').val() );
                    this.searchProperty();
                }
                $("#propResult").show();
                $('#properties').html('');
            } else {
                $("#propResult").hide();
            }

        } else if ( mode == "assoc" || mode == "fts" ) {
            $("#arguments").show();
            $("#propResult").hide();
            $("#result").css("margin-left", "15em");

            if ( mode == "assoc" ) {
                $("#assocResult").show();
                $("#ftsResult").hide();
                $("#stage1").show();
                $(".stage2sim").show();
                $("#freetext").focus();
            } else {
                $("#ftsResult").show();
                $("#assocResult").hide();
                $("#stage1").hide();
                $(".stage2sim").hide();
                $("#fulltext").focus();
            }
        }
        return false;
    },

    titleClick: function(name) {
        $('#property').val(name);
        this.menuClick('getprop');
        this.searchProperty();
    },

    searchProperty: function() {
        this.makeXml('getprop'); 
        this.submitUrl(this.callbackProperty);
    },

    callbackProperty: function(xml) {
        var obj = $('#properties');
        obj.html('<table></table>');

        var properties = ['name'];
        jQuery.each(gss3.properties[$("#propertyTarget").val()], function() {
            if ( this.substr(0,1) != '@' )
                properties.push(this);
        });
        properties.push('vec');

        $(xml).find('article').each(function(){
            var self = this;
            var vec = eval($(self).attr('vec'));
            var vecStr = [];
            jQuery.each(vec, function(){
                var num = Math.min(Number(this[1]), 10);
                if ( num > 1) vecStr.push('<span class="vec' + num + '">');
                vecStr.push(this[0]);
                vecStr.push(':');
                vecStr.push(this[1]);
                if (num > 1) vecStr.push('</span>');
                vecStr.push(', ');
            });
            jQuery.each(properties, function() {
                var name = this.substr(0);
                var value = (name == 'vec') ? vecStr.join('') : $(self).attr(name);
                if ( name == 'link' )
                    value = '<a href="' + value + '">' + value + '</a>';
                else if ( name == 'name' )
                    value = '<div style="float:left">'
                          + value
                          + '</div><div style="float:right"><button type="submit" onclick="gss3.menuClick(\''
                          + gss3.prevMode 
                          + '\')">Back to Search result</button></div>';

                //.attr(name, $(self).attr(name))
                $('<tr></tr>').append( $('<td></td>').html(name) )
                              .append( $('<td></td>').html(value) )
                              .appendTo( $('table', obj) );
            });
        });

    },

    showRequestXML: function() {
        this.makeXml(); 
        var xml = $(this.objXml).toXML();
        this.showXML(xml);
    },

    showResponseXML: function() {
        this.makeXml(); 
        this.submitUrl(this.showResponseXML2);
    },

    showResponseXML2: function(xml) {
        var res = $(xml).toXML();
        gss3.showXML(res);
    },

    showXML: function(xml) {
        xml = xml.replace(/></g, ">\n<").replace(/&/g, "&amp;")
                 .replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")
                 .replace(/\"(.+?)\"/g, '\"<span class="attr">$1</span>\"')
                 .replace(/(&lt;|\/)([a-zA-Z]+?)( |&gt;)/g, '$1<span class="tag">$2</span>$3');
        var windowWidth = $('#contents').width();
        var windowHeight = $(window).height();
        var closeTag = '<div class="close"><a onclick="gss3.hideXML()">Close</a></div>';
        $('#overlay').empty().append( closeTag )
                     .append( $('<p><code></code></p>').html(xml) )
                     .width( windowWidth * 0.8 )
                     .css({left: windowWidth * 0.1, "max-height": windowHeight * 0.8})
                     .css("top", (windowHeight - $('#overlay').height()) / 2 )
                     .show();
        $('div.close').css({right: windowWidth * 0.1 + 20});
    },

    hideXML: function() {
        $('#overlay').hide();
    },

    crossOverOut: function(event, kind, id) {
        for (var target in {'article':1, 'keyword':1}) {
            if ( this.maxScore[kind][target] > 0 && this.crossRef[id] ) {
                var cross = this.crossRef[id][target];
                var maxScore = this.maxScore[kind][target];
                for (var name in cross) {
                    var score = Number(cross[name]);
                    var rate = Math.floor((score / maxScore) * 10);
                    var td = $('#'+name).toggleClass('c'+rate).children(':first');
                    if ( event == 'out' )
                        td.html(td.attr('score'));
                    else
                        td.html(score.toFixed(3));
                }
            }
        }
    }
};

$(function(){
    gss3 = new GSS3();
    gss3.init();
    gss3.url = 'http://10.226.89.139/getassoc/gss3';
    gss3.searchCatalogue();
});


//
// XML Serializer Plugin By Mark Gibson
// http://dev.jquery.com/wiki/Plugins/toXML
//
jQuery.fn.toXML = function () {
    var out = '';
    if (this.length > 0) {
        if (typeof XMLSerializer == 'function' ||
            typeof XMLSerializer == 'object')
        {
            var xs = new XMLSerializer();
            this.each(function() {
                out += xs.serializeToString(this);
            });
        } else if (this[0].xml !== undefined) {
            this.each(function() {
                out += this.xml;
            });
        } else {
            // TODO: Manually serialize DOM here,
            // for browsers that support neither
            // of two methods above.
        }
    }
    return out;
};
