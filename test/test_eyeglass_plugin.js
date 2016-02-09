/* Copyright 2016 LinkedIn Corp. Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.  You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied.
 */

"use strict";

var assert = require("assert");
var path = require("path");
var fs = require("fs");
var broccoli = require("broccoli");
var RSVP = require("rsvp");
var glob = require("glob");
var EyeglassCompiler = require("../lib/index");

RSVP.on("error", function(reason, label) {
  if (label) {
    console.error(label);
  }

  console.assert(false, reason.message);
});

function fixtureSourceDir(name) {
  return path.resolve(__dirname, "fixtures", name, "input");
}

function fixtureOutputDir(name) {
  return path.resolve(__dirname, "fixtures", name, "output");
}


function build(builder) {
  return RSVP.Promise.resolve()
  .then(function() {
    return builder.build();
  })
  .then(function(hash) {
    return builder.tree.outputPath;
  });
}

function diffDirs(actualDir, expectedDir, callback) {
  var actualFiles = glob.sync("**/*", {cwd: actualDir}).sort();
  var expectedFiles = glob.sync("**/*", {cwd: expectedDir}).sort();
  assert.deepEqual(actualFiles, expectedFiles);
  actualFiles.forEach(function(file) {
    var actualPath = path.join(actualDir, file);
    var expectedPath = path.join(expectedDir, file);
    var stats = fs.statSync(actualPath);
    if (stats.isFile()) {
      assert.equal(fs.readFileSync(actualPath).toString(),
                   fs.readFileSync(expectedPath).toString());
    }
  });
  callback();
}

describe("EyeglassCompiler", function () {
  it("can be instantiated", function (done) {
    var optimizer = new EyeglassCompiler(fixtureSourceDir("basicProject"), {
      cssDir: "."
    });
    assert(optimizer instanceof EyeglassCompiler);
    done();
  });

  it("compiles sass files", function (done) {
    var optimizer = new EyeglassCompiler(fixtureSourceDir("basicProject"), {
      cssDir: "."
    });

    var builder = new broccoli.Builder(optimizer);

    build(builder)
      .then(function(outputDir) {
        diffDirs(outputDir, fixtureOutputDir("basicProject"), function() {
          done();
        });
      });
  });
});
