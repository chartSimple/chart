// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

//

(function(CodeMirror) {
    "use strict";

    (function(CodeMirror) {
        CodeMirror.defineOption("placeholder", "", function(cm, val, old) {
            var prev = old && old != CodeMirror.Init;
            if (val && !prev) {
                cm.on("blur", onBlur);
                cm.on("change", onChange);
                onChange(cm);
            } else if (!val && prev) {
                cm.off("blur", onBlur);
                cm.off("change", onChange);
                clearPlaceholder(cm);
                var wrapper = cm.getWrapperElement();
                wrapper.className = wrapper.className.replace(" CodeMirror-empty", "");
            }

            if (val && !cm.hasFocus()) onBlur(cm);
        });

        function clearPlaceholder(cm) {
            if (cm.state.placeholder) {
                cm.state.placeholder.parentNode.removeChild(cm.state.placeholder);
                cm.state.placeholder = null;
            }
        }
        function setPlaceholder(cm) {
            clearPlaceholder(cm);
            var elt = cm.state.placeholder = document.createElement("pre");
            elt.style.cssText = "height: 0; overflow: visible";
            elt.className = "CodeMirror-placeholder";
            elt.appendChild(document.createTextNode(cm.getOption("placeholder")));
            cm.display.lineSpace.insertBefore(elt, cm.display.lineSpace.firstChild);
        }

        function onBlur(cm) {
            if (isEmpty(cm)) setPlaceholder(cm);
        }
        function onChange(cm) {
            var wrapper = cm.getWrapperElement(), empty = isEmpty(cm);
            wrapper.className = wrapper.className.replace(" CodeMirror-empty", "") + (empty ? " CodeMirror-empty" : "");

            if (empty) setPlaceholder(cm);
            else clearPlaceholder(cm);
        }

        function isEmpty(cm) {
            return (cm.lineCount() === 1) && (cm.getLine(0) === "");
        }
    })(CodeMirror);

    CodeMirror.defineMode("bdpFormula", function(config, parserConfig) {
        "use strict";

        var client         = parserConfig.client || {},
            atoms          = parserConfig.atoms || {"false": true, "true": true, "null": true},
            builtin        = parserConfig.builtin || {},
            keywords       = parserConfig.keywords || {},
            operatorChars  = parserConfig.operatorChars || /^[\/\*\+\-%<>!=&|~^]/,
            support        = parserConfig.support || {},
            hooks          = parserConfig.hooks || {},
            dateSQL        = parserConfig.dateSQL || {"date" : true, "time" : true, "timestamp" : true};
        var fields = config.fields;
        
        function tokenBase(stream, state) {
            var ch = stream.next();

            // call hooks from the mime type
            if (hooks[ch]) {
                var result = hooks[ch](stream, state, fields);
                if (result !== false) return result;
            }

            if (support.hexNumber == true &&
                ((ch == "0" && stream.match(/^[xX][0-9a-fA-F]+/))
                    || (ch == "x" || ch == "X") && stream.match(/^'[0-9a-fA-F]+'/))) {
                // hex
                // ref: http://dev.mysql.com/doc/refman/5.5/en/hexadecimal-literals.html
                return "number";
            } else if (support.binaryNumber == true &&
                (((ch == "b" || ch == "B") && stream.match(/^'[01]+'/))
                    || (ch == "0" && stream.match(/^b[01]+/)))) {
                // bitstring
                // ref: http://dev.mysql.com/doc/refman/5.5/en/bit-field-literals.html
                return "number";
            } else if (ch.charCodeAt(0) > 47 && ch.charCodeAt(0) < 58) {
                // numbers
                // ref: http://dev.mysql.com/doc/refman/5.5/en/number-literals.html
                stream.match(/^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);
                support.decimallessFloat == true && stream.eat('.');
                return "number";
            } else if (ch == "?" && (stream.eatSpace() || stream.eol() || stream.eat(";"))) {
                // placeholders
                return "variable-3";
            } else if (ch == "'" || (ch == '"' && support.doubleQuote)) {
                // strings
                // ref: http://dev.mysql.com/doc/refman/5.5/en/string-literals.html
                state.tokenize = tokenLiteral(ch);
                return state.tokenize(stream, state);
            } else if ((((support.nCharCast == true && (ch == "n" || ch == "N"))
                || (support.charsetCast == true && ch == "_" && stream.match(/[a-z][a-z0-9]*/i)))
                && (stream.peek() == "'" || stream.peek() == '"'))) {
                // charset casting: _utf8'str', N'str', n'str'
                // ref: http://dev.mysql.com/doc/refman/5.5/en/string-literals.html
                return "keyword";
            } else if (/^[\(\),\;\[\]]/.test(ch)) {
                // no highlightning
                return null;
            } else if (support.commentSlashSlash && ch == "/" && stream.eat("/")) {
                // 1-line comment
                stream.skipToEnd();
                return "comment";
            } else if ((support.commentHash && ch == "#")
                || (ch == "-" && stream.eat("-") && (!support.commentSpaceRequired || stream.eat(" ")))) {
                // 1-line comments
                // ref: https://kb.askmonty.org/en/comment-syntax/
                stream.skipToEnd();
                return "comment";
            } else if (ch == "/" && stream.eat("*")) {
                // multi-line comments
                // ref: https://kb.askmonty.org/en/comment-syntax/
                state.tokenize = tokenComment;
                return state.tokenize(stream, state);
            } else if (ch == ".") {
                // .1 for 0.1
                if (support.zerolessFloat == true && stream.match(/^(?:\d+(?:e[+-]?\d+)?)/i)) {
                    return "number";
                }
                // .table_name (ODBC)
                // // ref: http://dev.mysql.com/doc/refman/5.6/en/identifier-qualifiers.html
                if (support.ODBCdotTable == true && stream.match(/^[a-zA-Z_]+/)) {
                    return "variable-2";
                }
            } else if (operatorChars.test(ch)) {
                // operators
                stream.eatWhile(operatorChars);
                return "operator";
            } else if (ch == '{' &&
                (stream.match(/^( )*(d|D|t|T|ts|TS)( )*'[^']*'( )*}/) || stream.match(/^( )*(d|D|t|T|ts|TS)( )*"[^"]*"( )*}/))) {
                // dates (weird ODBC syntax)
                // ref: http://dev.mysql.com/doc/refman/5.5/en/date-and-time-literals.html
                return "number";
            } else {
                stream.eatWhile(/^[_\w\d]/);
                var word = stream.current().toLowerCase();
                // dates (standard SQL syntax)
                // ref: http://dev.mysql.com/doc/refman/5.5/en/date-and-time-literals.html
                if (dateSQL.hasOwnProperty(word) && (stream.match(/^( )+'[^']*'/) || stream.match(/^( )+"[^"]*"/)))
                    return "number";
                if (atoms.hasOwnProperty(word)) return "atom";
                if (keywords.hasOwnProperty(word)) return "keyword";
                if (builtin.hasOwnProperty(word)) return "builtin";
                if (client.hasOwnProperty(word)) return "string-2";
                return null;
            }
        }

        // 'string', with char specified in quote escaped by '\'
        function tokenLiteral(quote) {
            return function(stream, state) {
                var escaped = false, ch;
                while ((ch = stream.next()) != null) {
                    if (ch == quote && !escaped) {
                        state.tokenize = tokenBase;
                        break;
                    }
                    escaped = !escaped && ch == "\\";
                }
                return "string";
            };
        }
        function tokenComment(stream, state) {
            while (true) {
                if (stream.skipTo("*")) {
                    stream.next();
                    if (stream.eat("/")) {
                        state.tokenize = tokenBase;
                        break;
                    }
                } else {
                    stream.skipToEnd();
                    break;
                }
            }
            return "comment";
        }

        function pushContext(stream, state, type) {
            state.context = {
                prev: state.context,
                indent: stream.indentation(),
                col: stream.column(),
                type: type
            };
        }

        function popContext(state) {
            state.indent = state.context.indent;
            state.context = state.context.prev;
        }

        return {
            startState: function() {
                return {tokenize: tokenBase, context: null};
            },

            token: function(stream, state) {
                if (stream.sol()) {
                    if (state.context && state.context.align == null)
                        state.context.align = false;
                }
                if (stream.eatSpace()) return null;

                var style = state.tokenize(stream, state);
                if (style == "comment") return style;

                if (state.context && state.context.align == null)
                    state.context.align = true;

                var tok = stream.current();
                if (tok == "(")
                    pushContext(stream, state, ")");
                else if (tok == "[")
                    pushContext(stream, state, "]");
                else if (state.context && state.context.type == tok)
                    popContext(state);
                return style;
            },

            indent: function(state, textAfter) {
                var cx = state.context;
                if (!cx) return 0;
                var closing = textAfter.charAt(0) == cx.type;
                if (cx.align) return cx.col + (closing ? 0 : 1);
                else return cx.indent + (closing ? 0 : config.indentUnit);
            },

            blockCommentStart: "/*",
            blockCommentEnd: "*/",
            lineComment: support.commentSlashSlash ? "//" : support.commentHash ? "#" : null
        };
    });

    (function() {
        "use strict";

        // `identifier`
        function hookIdentifier(stream) {
            // MySQL/MariaDB identifiers
            // ref: http://dev.mysql.com/doc/refman/5.6/en/identifier-qualifiers.html
            var ch;
            while ((ch = stream.next()) != null) {
                if (ch == "`" && !stream.eat("`")) return "variable-2";
            }
            stream.backUp(stream.current().length - 1);
            return stream.eatWhile(/\w/) ? "variable-2" : null;
        }

        // variable token
        function hookVar(stream) {
            // variables
            // @@prefix.varName @varName
            // varName can be quoted with ` or ' or "
            // ref: http://dev.mysql.com/doc/refman/5.5/en/user-variables.html
            if (stream.eat("@")) {
                stream.match(/^session\./);
                stream.match(/^local\./);
                stream.match(/^global\./);
            }

            if (stream.eat("'")) {
                stream.match(/^.*'/);
                return "variable-2";
            } else if (stream.eat('"')) {
                stream.match(/^.*"/);
                return "variable-2";
            } else if (stream.eat("`")) {
                stream.match(/^.*`/);
                return "variable-2";
            } else if (stream.match(/^[0-9a-zA-Z$\.\_]+/)) {
                return "variable-2";
            }
            return null;
        };

        function hookField(stream, state, fields){
            var ch;
            var word = '';
            while ((ch = stream.next()) != null) {
                if (ch == "]" && !stream.eat("]")) {
                    if(fields && angular.indexOf(fields, word) < 0){
                        return "error";
                    }else{
                        return "variable-2"
                    }
                }else{
                    word += ch;
                }
            }
            return null;
            //stream.backUp(stream.current().length - 1);
            //return stream.eatWhile(/[^\]]/) ? "variable-2" : null;
        }

        // short client keyword token
        function hookClient(stream) {
            // \N means NULL
            // ref: http://dev.mysql.com/doc/refman/5.5/en/null-values.html
            if (stream.eat("N")) {
                return "atom";
            }
            // \g, etc
            // ref: http://dev.mysql.com/doc/refman/5.5/en/mysql-commands.html
            return stream.match(/^[a-zA-Z.#!?]/) ? "variable-2" : null;
        }

        // these keywords are used by all SQL dialects (however, a mode can still overwrite it)
        var sqlKeywords = "alter and as asc between by count create delete desc distinct drop from having in insert into is join like not on or order select set table union update values where ";

        var udfKeywords = "sum avg max min count distinct row_max row_min max_date min_date hour_diff minute_diff second_diff day_diff month_diff year_diff week quarter now first_day_of_month last_day_of_month work_day_of_month if year month day hour to_date date_add date_sub concat instring length repeat reverse substr day_of_week";

        // turn a space-separated list into an array
        function set(str) {
            var obj = {}, words = str.split(" ");
            for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
            return obj;
        }

        CodeMirror.defineMIME("text/x-bdp-formula", {
            name: "bdpFormula",
            client: set("charset clear connect edit ego exit go help nopager notee nowarning pager print prompt quit rehash source status system tee"),
            //keywords: set(sqlKeywords + udfKeywords + "accessible action add after algorithm all analyze asensitive at authors auto_increment autocommit avg avg_row_length before binary binlog both btree cache call cascade cascaded case catalog_name chain change changed character check checkpoint checksum class_origin client_statistics close coalesce code collate collation collations column columns comment commit committed completion concurrent condition connection consistent constraint contains continue contributors convert cross current current_date current_time current_timestamp current_user cursor data database databases day_hour day_microsecond day_minute day_second deallocate dec declare default delay_key_write delayed delimiter des_key_file describe deterministic dev_pop dev_samp deviance diagnostics directory disable discardnctrow div dual dumpfile each elseif enable enclosed end ends engine engines enum errors escape escaped even event events every execute exists exit explain extended fast fetch field fields first flush for force foreign found_rows full fulltext function general get global grant grants group groupby_concat handler hash help high_priority hosts hour_microsecond hour_minute hour_second if ignore ignore_server_ids import index index_statistics infile inner innodb inout insensitive insert_method install interval invoker isolation iterate key keys kill language last leading leave left level limit linear lines list load local localtime localtimestamp lock logs low_priority master master_heartbeat_period master_ssl_verify_server_cert masters match max max_rows maxvalue message_text middleint migrate min min_rows minute_microsecond minute_second mod mode modifies modify mutex mysql_errno natural next no no_write_to_binlog offline offset one online open optimize option optionally out outer outfile pack_keys parser partition partitions password phase plugin plugins prepare preserve prev primary privileges procedure processlist profile profiles purge query quick range read read_write reads real rebuild recover references regexp relaylog release remove rename reorganize repair repeatable replace require resignal restrict resume return returns revoke right rlike rollback rollup row row_format rtree savepoint schedule schema schema_name schemas second_microsecond security sensitive separator serializable server session share show signal slave slow smallint snapshot soname spatial specific sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sqlexception sqlstate sqlwarning ssl start starting starts status std stddev stddev_pop stddev_samp storage straight_join subclass_origin sum suspend table_name table_statistics tables tablespace temporary terminated to trailing transaction trigger triggers truncate uncommitted undo uninstall unique unlock upgrade usage use use_frm user user_resources user_statistics using utc_date utc_time utc_timestamp value variables varying view views warnings when while with work write xa xor year_month zerofill begin do then else loop repeat"),
//            builtin: set("bool boolean bit blob decimal double float long longblob longtext medium mediumblob mediumint mediumtext time timestamp tinyblob tinyint tinytext text bigint int int1 int2 int3 int4 int8 integer float float4 float8 double char varbinary varchar varcharacter precision date datetime year unsigned signed numeric"),
            keywords : set(udfKeywords),
            atoms: set("false true null unknown"),
            operatorChars: /^[\/*+\-%<>!=&|^]/,
            dateSQL: set("date time timestamp"),
            support: set("ODBCdotTable decimallessFloat zerolessFloat binaryNumber hexNumber doubleQuote nCharCast charsetCast commentHash commentSpaceRequired"),
            hooks: {
                "@":   hookVar,
                "`":   hookIdentifier,
                "\\":  hookClient,
                "[": hookField
            }
        });

    }());

})(CodeMirror);
