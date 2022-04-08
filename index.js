#!/usr/bin/env node

const glob = require("glob");
const path = require("path");
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const from = argv.from || "./";
const to = argv.to || "./out";
const ext = argv.ext || "*";

const fromGlob = path.join(from, "**/*." + ext);
const toGlob = path.join(to, "**/*." + ext);

console.log(path.join(from, "**/*." + ext));

// options is optional
glob(fromGlob, function (er, fromFiles) {
  if (er) {
    console.error(er);
    return;
  }

  if (0 === fromFiles.length) {
    console.log("No files found in source folder!");
    return;
  }

  glob(toGlob, function (er, toFiles) {
    if (er) {
      console.error(er);
      return;
    }

    if (0 === toFiles.length) {
      console.log("No files found in output folder!");
      return;
    }

    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.

    const fromFilesMap = createFileMap(fromFiles);
    const toFilesMap = createFileMap(toFiles);

    for (let file in fromFilesMap) {
      if (toFilesMap[file]) {
        replaceFileContent(fromFilesMap[file], toFilesMap[file]);
      } else {
        console.log("DON'T REPLACE", file);
      }
    }
  });
});

function createFileMap(list) {
  const map = {};

  for (let i = 0; i < list.length; i++) {
    const file = path.parse(list[i]);

    if (!map[file.base]) {
      map[file.base] = [];
    }

    map[file.base].push(list[i]);
  }

  return map;
}

function replaceFileContent(from, to) {
  if (1 !== from.length) {
    console.error("MULTIPLE FILES WITH SAME NAME. SKIP", from);
    return;
  }

  for (let i = 0; i < to.length; i++) {
    ((fromFile, toFile) => {
      fs.copyFile(fromFile, toFile, (er) => {
        if (er) {
          console.error("Replace file error", er);
        } else {
          console.log("Replaced file", fromFile, toFile);
        }
      });
    })(from[0], to[i]);
  }
}
