# Behave Autocomplete Atom Package

This package requires [language-gherkin](https://atom.io/packages/language-gherkin) to be installed as well.

[![Build Status](https://travis-ci.org/scato/atom-behave-autocomplete.svg?branch=master)](https://travis-ci.org/scato/atom-behave-autocomplete)
[![apm](https://img.shields.io/apm/dm/behave-autocomplete.svg)]()

Scans your project for existing Behave steps and provides suggestions as you type.

![Behave Autocomplete Screenshot](https://raw.githubusercontent.com/scato/atom-behave-autocomplete/master/images/behave_autocomplete.jpg)

#### FAQs
* __When does it provide suggestions?__ Type a keyword (`And`, `Then`, `When`, `Given`) in a `.feature` file to trigger suggestions
* __What does it scan?__ The package scans a directory of your choice, by default it scans the `/features` directory of your project. You override the default by changing the path option under settings.
