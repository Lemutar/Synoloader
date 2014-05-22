/**
 * @fileOverview A Crappy Logger
 * @author       ClearCode Inc.
 * @version      1
 * @license
 *   The MIT License, Copyright (c) 2012 ClearCode Inc.
 *
 * Simple Usage
 * ============
 *
 * var { Logger } = Components.utils.import('resource://uxu-modules/lib/logger.jsm', {});
 * var logger = new Logger("/tmp/log.txt");
 * logger.log();
 *
 */

var EXPORTED_SYMBOLS = ["Logger"];

var { classes: Cc, interfaces: Ci } = Components;

function Logger(logFileName) {
  this.logFile = this.openFile(logFileName);
}

Logger.prototype = {
  encoding: "UTF-8",

  openFile: function (path) {
    var file = Cc["@mozilla.org/file/local;1"]
          .createInstance(Ci.nsILocalFile);
    file.initWithPath(path);
    return file;
  },

  withAppendOnlyLogFileStreamForEncoding: function (encoding, callback) {
    var os = Cc["@mozilla.org/intl/converter-output-stream;1"]
          .createInstance(Ci.nsIConverterOutputStream);

    this.withAppendOnlyLogFileStream(function (fos) {
      os.init(fos, encoding, 0, 0x0000);
      callback.call(this, os);
      // we do not have to close os (fos will be closed)
    });
  },

  withAppendOnlyLogFileStream: function (callback) {
    var foStream = Cc["@mozilla.org/network/file-output-stream;1"]
          .createInstance(Ci.nsIFileOutputStream);
    // append only
    foStream.init(this.logFile, 0x02 | 0x08 | 0x10, parseInt("0664", 8), 0);
    try {
      callback.call(this, foStream);
    } finally {
      foStream.close();
    }
  },

  indentation_: 0,
  withIndentation: function (block, self) {
    var indentationAmount = 4;
    try {
      this.indentation_ += indentationAmount;
      block.call(self);
    } finally {
      this.indentation_ -= indentationAmount;
    }
  },

  // without line termination
  logRawString: function (rawString) {
    var indentation = this.indentation_;
    if (indentation > 0) {
      rawString = rawString.split("\n").map(function (line) {
        return (new Array(indentation + 1)).join(" ") + line;
      }).join("\n");
    }
    this.withAppendOnlyLogFileStreamForEncoding(this.encoding, function (os) {
      os.writeString(rawString);
    });
  },

  // with line termination
  log: function (message) {
    this.logRawString(message + "\n");
  },

  logObject: function (object) {
    this.logRawString(this.objectToString(object) + "\n");
  },

  objectToString: function (object) {
    try {
      return JSON.stringify(object, null, 2);
    } catch (x) {
      var keys = [];
      for (var key in object)
        keys.push(key);
      return "{\n" + keys.reduce(function (keyValueStrings, key) {
        keyValueStrings.push("  " + key + ": " + object[key]);
        return keyValueStrings;
      }, []).join(",\n") + "\n}";
    }
  }
};
