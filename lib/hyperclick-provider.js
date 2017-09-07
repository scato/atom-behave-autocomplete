'use babel';
const provider = require('./provider');
const Point = require('atom').Point;
const Range = require('atom').Range;

module.exports = {
  priority: 1,

  _isValidScopeChain: function (scopeChain) {
    switch (scopeChain) {
      case ".source.feature":
        return true;
      case ".source.feature .support.class.gherkin":
        return true;
    }

    return false;
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
    const scopeChain = editor.scopeDescriptorForBufferPosition(range.start).getScopeChain();

    if (this._isValidScopeChain(scopeChain)) {
      const line = editor.getLastCursor().getCurrentBufferLine();
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
