/*jshint node: true */

(function() {
  'use strict';
  
  var atImport = require('at-import'),
      fs = require('fs'),
      colors = require('colors'),
      path = require('path'),
      uglify = require('uglify-js'),
      less = require('less'),
      jshint = require('jshint').JSHINT,
      jsp = uglify.parser,
      pro = uglify.uglify,
      base = path.resolve(__dirname),
      lessBase = path.join(base, 'public', 'css', '_src'),
      cssBase = path.join(base, 'public', 'css'),
      lessInput = path.join(lessBase, 'bootstrap.less'),
      cssOutput = path.join(cssBase, 'style.css'),
      srcBase = path.join(base, 'public', 'js'),
      libsBase = path.join(srcBase, 'libs'),
      srcPluginsInput = path.join(srcBase, '_src', 'plugins.js'),
      srcPluginsOutput = path.join(srcBase, 'libs', 'plugins.min.js'),
      srcTemplatesInput = path.join(srcBase, '_src', 'templates.js'),
      srcTemplatesOutput = path.join(srcBase, 'templates.js'),
      srcScriptsInput = path.join(srcBase, '_src', 'script.js'),
      srcScriptsOutput = path.join(srcBase, 'script.js'),      
      uglifyScriptsOutput = path.join(srcBase, 'script.min.js'),
      uglifyTemplatesOutput = path.join(srcBase, 'templates.min.js');
      
  var print = {
    ok: function(msg) {
      console.log(msg.toString().green);
    },

    error: function(msg) {
      console.log(msg.toString().bold.red);
      process.exit(1);
    },

    warn: function(msg) {
      console.log(msg.toString().bold.yellow);
    }
  };
       
  var hintScript = function() {
    fs.readFile(srcScriptsOutput, function(err, data) {
      if (err) { print.error(err); }
      var result = jshint(data.toString());

      if (result === false) {
        var i, j = jshint.errors.length;
        print.warn(jshint.errors.length + ' jshint errors.');
        
        for (i = 0; i < j; i++) {
          print.warn('\t' + jshint.errors[0].reason);
        }
      }
    });

    fs.readFile(srcTemplatesOutput, function(err, data) {
      if (err) { print.error(err); }
      var result = jshint(data.toString());

      if (result === false) {
        var i, j = jshint.errors.length;
        print.warn(jshint.errors.length + ' jshint errors.');
        
        for (i = 0; i < j; i++) {
          print.warn('\t' + jshint.errors[0].reason);
        }
      }
    });
  };

  var show_copyright = function (comments) {
    var ret = "",
        c, i;
  
    for (i = 0; i < comments.length; ++i) {
      c = comments[i];
    
      if (c.type == "comment1") {
        ret += "//" + c.value + "\n";
      } else {
        ret += "/*" + c.value + "*/";
      }
    }
  
    return ret;
  };
  
  var ugly = function(input, output) {
    print.ok('Uglifying files...');
    var result = "",
        code = fs.readFileSync(input).toString(),
        tok = jsp.tokenizer(code),
        c = tok(),
        ast = jsp.parse(code),
        fd;
  
    result += show_copyright(c.comments_before);
  
    ast = pro.ast_mangle(ast, { topLevel: false });
    ast = pro.ast_squeeze(ast, {
      make_seqs: true,
      dead_code: true,
      keep_comps: true
    });
  
    result += pro.gen_code(ast, {
      ascii_only: false,
      beautify: false,
      indent_level: 4,
      indent_start: 0,
      quote_keys: false,
      space_colon: false,
      inline_script: false
    });
  
    fs.writeFile(output, result, function(err) {
      if (err) { print.error(err); }
      print.ok('Uglified files.');
    });
  };
  
  var uglifyFiles = function() {
    ugly(srcScriptsOutput, uglifyScriptsOutput);
    ugly(srcTemplatesOutput, uglifyTemplatesOutput);
  };
  
  var methods = [
    function() {
      hintScript();
      uglifyFiles();
    },
    null,
    null,
    null
  ];

  var next = function() {
    var method = methods.pop();
    if (typeof(method) === 'function') method();
  };

  var compileLess = function() {
    print.ok('Compiling Less...');
  
    var input = lessInput,
        paths = lessBase,
        output = cssOutput,
        parser = new less.Parser({
          paths: [paths],
          optimization: 1
        }),
        css, fd;
  
    fs.readFile(input, function(err, data) {
      if (err) { print.error(err); }
    
      parser.parse(data.toString(), function(err, tree) {
        if (err) {
          less.writeError(err);
          process.exit(1);
        } else {
          css = tree.toCSS({ compress: true });
        
          if (output) {
            fs.writeFile(output, css, function(err) {
              if (err) { print.error(err); }

              print.ok('Compiled Less.');
              next();
            });
          }
        }
      });
    });
  };

  var compilePlugins = function() {
    print.ok('Compiling plugins...');
  
    atImport({
      input: srcPluginsInput,
      output: srcPluginsOutput
    }, function() {
      print.ok('Compiled plugins.');
      next();
    });
  };

  var compileScripts = function() {
    print.ok('Compiling scripts...');
  
    fs.readFile(path.join(base, 'VERSION'), function(err, data) {
      if (err) { print.error(err); }

      var version = data.toString().trim();

      atImport({
        input: srcScriptsInput,
        output: srcScriptsOutput,
        replacements: {
          '@@VERSION@@': version
        }
      }, function() {
        print.ok('Compiled scripts.');
        next();
      });
    });
  };

  var compileTemplates = function() {
    print.ok('Compiling templates...');
  
    fs.readFile(path.join(base, 'VERSION'), function(err, data) {
      if (err) { print.error(err); }

      var version = data.toString().trim();

      atImport({
        input: srcTemplatesInput,
        output: srcTemplatesOutput,
        replacements: {
          '@@VERSION@@': version
        }
      }, function() {
        print.ok('Compiled templates.');
        next();
      });
    });
  };

  compilePlugins();
  compileScripts();
  compileTemplates();
  compileLess();
}());