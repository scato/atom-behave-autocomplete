'use babel';
var model = require('../lib/provider');

describe("provider model", function() {
  describe("featuresDirectory", function() {
    it("gets feature directory from configuration", function() {
      atom.config.set("behave-autocomplete.path", "/some_path");
      expect(model.featuresDirectory("behave-autocomplete.path")).toEqual("/some_path");
    });
  });

  describe("getSuggestions", function() {
    it("disables the plugin if project has not been saved", function() {
      atom.project.rootDirectories[0] = undefined;
      expect(model.getSuggestions(true, true)).toEqual(false);
    });
  });

  describe("rootDirectory", function() {
    it("gets the root directory", function() {
      expect(model.rootDirectory()).toEqual(atom.project.rootDirectories[0].path);
    });
  });

  describe("matchGherkinKeyword", function() {
    it("matches Given keyword", function() {
      let line = "Given something";
      expect(model.matchGherkinKeyword(line)).toEqual(true);
    });

    it("matches the 'And' keyword", function() {
      let line = "And something";
      expect(model.matchGherkinKeyword(line)).toEqual(true);
    });

    it("matches the 'When' keyword", function() {
      let line = "When something";
      expect(model.matchGherkinKeyword(line)).toEqual(true);
    });

    it("matches the 'Then' keyword", function() {
      let line = "Then something";
      expect(model.matchGherkinKeyword(line)).toEqual(true);
    });

    it("doesn't match if there are no keywords", function() {
      let line = "I something";
      expect(model.matchGherkinKeyword(line)).toEqual(false);
    });
  });

  describe("scanFeaturesDir", function() {
    it("adds a warning when features directory cannot be found", function() {
      expect(function(){ model.scanFeaturesDir([]) }).not.toThrow();
    })
  });

  describe("replacedBehaveRegex", function() {
    it("doesn't replace anything if there aren't any behave variables", function() {
      let step = "I should see the index page";
      expect(model.replacedBehaveRegex(step)).toEqual("I should see the index page");
    });

    it("replaces behave number variables with autocomplete variables", function() {
      let step = "there are (\\d+) users";
      expect(model.replacedBehaveRegex(step)).toEqual("there are ${1:numberArgument} users");
    });

    it("replaces behave text variables with autocomplete variables", function() {
      let step = "I select \"(.*?)\" in the admin panel"
      expect(model.replacedBehaveRegex(step)).toEqual("I select \"${1:textArgument}\" in the admin panel");
    });

    it("replaces multiple behave text variables with autocomplete variables", function() {
      let step = `(.*?)" can add text "(.*?)" for "(.*?)" hours and "(.*?)" minutes`
      expect(model.replacedBehaveRegex(step)).toEqual("${1:textArgument}\" can add text \"${1:textArgument}\" for \"${1:textArgument}\" hours and \"${1:textArgument}\" minutes");
    });
  });

  describe('file reading', () => {
    it('should read files directly from the directory provided', () => {
      const rootPath = process.cwd();
      const featureFilePaths = model.searchForPattern(`${rootPath}/spec/features`, /test\.feature/);
      expect(featureFilePaths.length).toEqual(1);
      const matchesExpected = featureFilePaths[0].match(/test\.feature/);
      expect(Boolean(matchesExpected)).toEqual(true);
    });

    it('should read files from subdirectories', () => {
      const rootPath = process.cwd();
      const featureFilePaths = model.searchForPattern(`${rootPath}/spec/features`, /childTest\.feature/);
      expect(featureFilePaths.length).toEqual(1);
      const matchesExpected = featureFilePaths[0].match(/childTest\.feature/);
      expect(Boolean(matchesExpected)).toEqual(true);
    });

    it('should return an empty array if no matches are found', () => {
      const rootPath = process.cwd();
      const featureFilePaths = model.searchForPattern(`${rootPath}/spec/features`, /fakeTest\.feature/);
      expect(featureFilePaths.length).toEqual(0);
    });

    describe('step files', () => {
      it('should pull in step definitions', () => {
        model.rootDirectory = () => process.cwd();
        atom.config.set("behave-autocomplete.path", `/spec/features`);
        const stepDefs = model.scanStepDefinitionsDir();
        expect(stepDefs.length).toBe(1);
        stepDefs.forEach(stepDef => {
          expect(stepDef.snippet).toEqual('a sample step file')
          expect(stepDef.lineMatcher instanceof RegExp).toBe(true)
          expect(stepDef.row).toBe(2)
          expect(stepDef.column).toBe(0)
        });
      });
    });
  });
});
