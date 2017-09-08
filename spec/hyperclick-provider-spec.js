'use babel';
const model = require('../lib/hyperclick-provider');
const Point = require('atom').Point;
const Range = require('atom').Range;

describe("hyperclick provider model", function() {
  it("has top priority", function () {
    expect(model.priority).toBe(1);
  });

  it("only looks up steps", function () {
    expect(model._containsStepDefinition("Feature: check this out")).toBe(false);
    expect(model._containsStepDefinition("    Given a sample step file")).toBe(true);
  });

  it("highlights the entire line", function () {
    const wordRange = new Range(new Point(3, 19), new Point(3, 23));
    const line = "    Given a sample step file ";
    const lineRange = model._wordRangeToLineRange(wordRange, line);
    expect(lineRange.start.row).toBe(3);
    expect(lineRange.start.column).toBe(4);
    expect(lineRange.end.row).toBe(3);
    expect(lineRange.end.column).toBe(28);
  });
});
