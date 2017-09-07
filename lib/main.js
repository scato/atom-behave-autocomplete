'use babel';
var provider = require('./provider');
var hyperclickProvider = require('./hyperclick-provider');

module.exports = {
  config: {
    path: {
      type: 'string',
      title: 'Path',
      default: '/features',
      description: 'This is the relative path (from your project root) to your projects features directory.'
    }
  },
  activate: function() {
    return provider.load();
  },
  getProvider: function() {
    return provider
  },
  getHyperclickProvider: function() {
    return hyperclickProvider
  }
};
