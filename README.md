# jasmine pretty html reporter

```
npm i jasmine-pretty-html-reporter --save-dev
```


_NOTE: jasmine is set as a peer dependency_

### Basic Setup

```
var Jasmine = require('jasmine');
var HtmlReporter = require('jasmine-pretty-html-reporter').Reporter;
var path = require('path');
var jasmine = new Jasmine();

jasmine.loadConfigFile('./spec/support/jasmine.json');

// options object
jasmine.addReporter(new HtmlReporter({
	path: path.join(process.cwd(), 'Reports'),
	title: 'Spectron Report',
	filename: 'TestReport',
	saveJson: true,
	screenshotOnFail: true
}));

jasmine.execute();
```

_ALSO: Reporter now reads into browser object and if it's defined it provides additional information on JSON reports. Made to work with spectron. (browser = app.client)_

#### Reporter Options

| Name                | Type    | Default | Description                                                                                  |
| ------------------- | ------- | ------- | -------------------------------------------------------------------------------------------- |
| path                | String  |         | path the report.html will be written to (required)                                           |
| writeReportEachSpec | Boolean | true    | writes the report.html after each spec completes, this is recommended for long running tests |
| showSuspectLine     | Boolean | true    | shows "suspect line" on overview                                                             |
| Title               | String  |         | Set title for HTML report                                                                    |
| filename            | String  | true    | Filename of the HTML report                                                                  |
| saveJSON            | Boolean | true    | Exports JSON file for each spec                                                              |
| screenshotOnFail    | Boolean | true    | Save screenshot on failed test                                                               |
| screenshotOnSuccess | Boolean | false   | Save screenshot on successful test                                                           |
