'use babel';
const provider = require('./provider');
const Point = require('atom').Point;
const Range = require('atom').Range;

module.exports = {
  priority: 1,

  _containsStepDefinition: function (line) {
    return /^\s*(?:Given|When|Then|And|But)\s/.test(line);
  },

  _wordRangeToLineRange: function (wordRange, line) {
    const matches = /^(\s*).*?(\s*)$/.exec(line);
    const [start, end] = [matches[1].length, matches[2].length];

    return new Range(
      new Point(wordRange.start.row, start),
      new Point(wordRange.start.row, line.length - end)
    );
  },

  getSuggestionForWord: function (editor, text, range) {
    const line = editor.getBuffer().getLines()[range.start.row];

    if (this._containsStepDefinition(line)) {
      const lineRange = this._wordRangeToLineRange(range, line);

      const callback = () => {
        const definitions = provider.scanStepDefinitionsDir();

        const matches = definitions.filter(definition => {
          return definition.lineMatcher.exec(line);
        });

        matches.forEach(match => {
          const promise = atom.workspace.open(match.fileName);

          promise.then((editor) => {
            editor.setCursorBufferPosition([match.row, match.column]);
            editor.scrollToCursorPosition();
          });
        });
      };

      return {range: lineRange, callback: callback};
    }
  }
};
