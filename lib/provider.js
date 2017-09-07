'use babel';
var fs = require('fs');
var path = require('path');

const PATH_CONFIG_KEY = 'behave-autocomplete.path';
const BEHAVE_STEP_DEF_PATTERN = /@(given|and|when|then)\('((?:[^\\']|\\\\|\\')*)'\)/g;
const GHERKIN_KEYWORDS_PATTERN = /(Given|And|When|Then)(.*)/g;
const PROPERTY_PREFIX_PATTERN = /(?:^|\[|\(|,|=|:|\s)\s*((?:And|Given|Then|When)\s(?:[a-zA-Z]+\.?){0,2})$/;
//Arbitary maxium depth of directories to search. There just to stop infinite loops due to symlink.
const MAX_DEPTH = 100;

const search = (path, pattern, depth = 0) => {
  //Give up if the depth is over max, in case there is a recursive directory simlink in the stack somewhere.
  if(depth > MAX_DEPTH) return [];
  //TODO: Convert to Atom's file system APIs
  const files = fs.readdirSync(path);
  const features = files.filter(file => pattern.test(file));
  const dirs = files.filter(file => fs.lstatSync(`${path}/${file}`).isDirectory());
  const featurePaths = features.map(feature => `${path}/${feature}`);
  const childFeaturePaths = dirs.reduce( (childFeatures, dir) => {
    const featuresFromDir = search(`${path}/${dir}`, pattern, depth++);
    return [...childFeatures, ...featuresFromDir];
  }, []);
  const allFeatures = [...featurePaths, ...childFeaturePaths];
  return allFeatures;
}

module.exports = {
  selector: '.source.feature, .feature',
  filterSuggestions: true,
  load: function() {},
  getSuggestions: function({bufferPosition, editor}) {

    // Disable the plugin if project hasn't been saved
    if (!atom.project.rootDirectories[0]) {
      return false;
    }

    let file = editor.getText();
    let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    return this.getCompletions(line, file);
  },
  getCompletions: function(line, file) {
    if (!this.matchGherkinKeyword(line)) return [];
    let results = [];

    try {
      let stats = fs.lstatSync(`${this.rootDirectory()}${this.featuresDirectory()}/steps`)
      if(stats.isDirectory()) {
        return this.scanStepDefinitionsDir(results);
      } else {
        return this.scanFeaturesDir(results)
      }
    } catch (e) {
      return this.scanFeaturesDir(results)
    }
  },
  scanStepDefinitionsDir: function(results = []) {
    //TODO: first search step definitions for your file
    const searchPath = `${this.rootDirectory()}${this.featuresDirectory()}/steps`;
    const allStepPaths = this.searchForPattern(searchPath, /.*/);
    allStepPaths.forEach( stepDefinitionPath => {
      let stepDefinitionFile = fs.readFileSync(stepDefinitionPath, 'utf8');
      let stepDefinitionLines = stepDefinitionFile.split('\n');
      for (let row in stepDefinitionLines) {
        let stepDefinitionLine = stepDefinitionLines[row];
        if ((myRegexArray = BEHAVE_STEP_DEF_PATTERN.exec(stepDefinitionLine)) != null) {
          results.push({
            snippet: this.replacedBehaveRegex(myRegexArray[2]),
            lineMatcher: this.generateLineMatchingRegex(myRegexArray[2]),
            fileName: stepDefinitionPath,
            row: Number(row),
            column: 0,
          });
        }
      }
    });

    return results
  },
  scanFeaturesDir: function(results = []) {
    try {
      const searchPath = `${this.rootDirectory()}${this.featuresDirectory()}`;
      const allFeaturePaths = this.searchForPattern(searchPath, /\.feature$/);
      allFeaturePaths.forEach( featurePath => {
        let data = fs.readFileSync(featurePath, 'utf8');
        while((myRegexArray = GHERKIN_KEYWORDS_PATTERN.exec(data)) != null) {
          results.push({"text":myRegexArray[2].replace(/^\s+|\s+$/g, "")});
        }
      })
    } catch (err) {
      atom.notifications.addWarning(`behave-autocomplete: Cannot find features directory at
          ${this.rootDirectory()}${this.featuresDirectory()}. Please update your setting to point to the location of your features directory.`)
    }

    return results
  },
  matchGherkinKeyword: function(line) {
    return PROPERTY_PREFIX_PATTERN.exec(line) != null;
  },
  rootDirectory: function() {
    return atom.project.rootDirectories[0].path;
  },
  featuresDirectory: function(path=PATH_CONFIG_KEY) {
    return atom.config.get(path);
  },
  replacedBehaveRegex: function(step) {
    //TODO: figure out how to loop through if there are multiple matches
    //      eg: 1:numberArgument, 2:numberArgument
    step = step.replace(/^\s+|\s+$/g, "");
    step = step.replace(/\(\\d\+\)/g, "${1:numberArgument}");
    return step.replace(/\(\.\*\?\)/g, "${1:textArgument}")
  },
  generateLineMatchingRegex: function (step) {
    return new RegExp(step);
  },
  searchForPattern: function(path, pattern){
    return search(path, pattern);
  }
};
