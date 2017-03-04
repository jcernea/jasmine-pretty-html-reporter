# jasmine pretty html reporter [![Build Status](https://travis-ci.org/stuisme/jasmine-pretty-html-reporter.svg?branch=master)](https://travis-ci.org/stuisme/jasmine-pretty-html-reporter)

```
npm i jasmine-pretty-html-reporter --save-dev
```
_NOTE: jasmine is set as a peer dependency_

### Check out the samples

https://stuisme.github.io/jasmine-pretty-html-reporter/


### Basic Setup

```
var Jasmine = require('jasmine');
var HtmlReporter = require('jasmine-pretty-html-reporter').Reporter;
var jasmine = new Jasmine();

jasmine.loadConfigFile('./spec/support/jasmine.json');

// options object
jasmine.addReporter(new HtmlReporter({
  path: path.join(__dirname,'results')
}));

jasmine.execute();
```
