'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os')

//path setup
const templatePath = path.join(__dirname, 'report.html');
const fileContents = fs.readFileSync(templatePath).toString();

/** A jasmine reporter that produces an html report **/
class Reporter {

    /**
     * @constructor
     * @param {Object} options - options for the reporter
     * @param {String} options.path - Path the report.html will be written to
     * @param {Boolean} options.writeReportEachSpec=true - Write the report between each spec, recommended for long running tests.
     * @param {Boolean} options.showSuspectLine=true - Show suspect line on overview
     * @param {Boolean} options.highlightSuspectLine=true - Highlight the suspect line in the detail dialog
     * @param {String} options.title - Title to show on report
     * @param {String} options.filename - Name of the report file
	 * @param {Boolean} options.saveJson - Save JSON file for each spec
     */
    constructor(options) {
        this.options = options;
        this.sequence = [];
        this.counts = {};
        this.timer = {};
        this.starts = {}; //Spec start times


        this.options = Reporter.getDefaultOptions();
        this.setOptions(options);

        if (!this.options.path) {
            throw new Error('Please provide options.path')
        }

		Reporter.makeDirectoryIfNeeded(this.options.path)
		this.options.reportPath = path.resolve(this.options.path, `Test_${Date.now().toString()}`)
        Reporter.makeDirectoryIfNeeded(this.options.reportPath);

        this.destination = path.join(this.options.reportPath, this.options.filename + '.html');

		if(this.options.saveJson){
			/* We create JSON folder to write JSON files to. */
			Reporter.makeDirectoryIfNeeded(path.resolve(this.options.reportPath, 'JSON'))
		}

    }

    /**
     * Handles jasmine started event
     * @param {Object} suiteInfo - Jasmine provided object
     */
    jasmineStarted(suiteInfo) {
        this.timer.jasmineStart = Reporter.nowString();
    };

    /**
     * Handles jasmine suite start event
     * @param {Object} result - Jasmine provided object
     */
    suiteStarted(result) {
    };

    /**
     * Handles jasmine spec started event
     * @param {Object} result - Jasmine provided object
     */
    specStarted(result) {
        this.starts[result.id] = Reporter.nowString();
    };

    /**
     * Handles jasmine spec done event
     * @param {Object} result - Jasmine provided object
     */
    specDone(result) {

        result.stopped = Reporter.nowString();
        result.prefix = result.fullName.replace(result.description, '');
        result.duration = new Date(result.stopped) - new Date(this.starts[result.id])

        // suspectLine
        result.failedExpectations.forEach(failure => {
            failure.hasSuspectLine = failure.stack.split('\n').some(function (line) {
                let match = line.indexOf('Error:') === -1 && line.indexOf('node_modules') === -1;

                if (match) {
                    failure.suspectLine = line;
                }

                return match;
            });
        });

        this.sequence.push(result);
        this.counts[result.status] = (this.counts[result.status] || 0) + 1;

        if (this.options.writeReportEachSpec) {
            this.writeFile();
        }

		var JSONResult = {}
		JSONResult.description = `${result.prefix}|${result.description}`
		JSONResult.passed = result.status === 'passed'
		JSONResult.pending = ['pending', 'disabled', 'excluded'].includes(result.status)

		JSONResult.instanceId = process.pid
		JSONResult.timestamp = new Date(this.starts[result.id]).getTime() 
		JSONResult.duration = result.duration

		/* If webdriver is found we can attach extra information */
		if(typeof browser != 'undefined'){
			/* Web Driver Specific Information */
			const {capabilities, sessionId} = browser
			JSONResult.os = capabilities.platformName 
			JSONResult.sessionId = sessionId
			JSONResult.browser = {name: capabilities.browserName, version: capabilities.browserVersion}
		}

		if(JSONResult.passed){
			JSONResult.message = (result.passedExpectations[0] || {}).message || 'Passed'
			JSONResult.trace = (result.passedExpectations[0] || {}).stack;
		}else if(JSONResult.pending){
			JSONResult.message = result.pendingReason || 'Pending'	
		}else{
			if(result.failedExpectations[0].message){
				JSONResult.message = result.failedExpectations.map(result => result.message)
			}else {
				JSONResult.message = 'Failed'
			}

			if(result.failedExpectations[0].stack){
				JSONResult.trace = result.failedExpectations.map(result => result.stack)
			}else {
				JSONResult.trace = 'No Stack trace information'
			}
		}

		/* Write JSON file for each spec */
		if(this.options.saveJson){
			fs.writeFileSync(path.resolve(this.options.reportPath, 'JSON/' + JSONResult.timestamp + '.json'), JSON.stringify(JSONResult, null, 4), 'utf8');
		}
    };

    /**
     * Handles jasmine suite done event
     * @param {Object} result - Jasmine provided object
     */
    suiteDone(result) {
    };

    /** Handles jasmine done event **/
    jasmineDone() {
        this.timer.jasmineDone = Reporter.nowString();
        this.writeFile();
    };

    /**
     * configure the options for the report
     * @param {Object} options - options for the reporter
     */
    setOptions(options) {
        this.options = Object.assign(this.options, options);
    };

    /** writes the report html to the options.path **/
    writeFile() {

        let logEntry = {
            options: this.options,
            timer: this.timer,
            counts: this.counts,
            sequence: this.sequence
        };

        let results = fileContents.replace('\'<Results Replacement>\'', JSON.stringify(logEntry, null, 4));
        fs.writeFileSync(this.destination, results, 'utf8');
    }

    static nowString() {
        return (new Date()).toISOString();
    }

    static getDefaultOptions() {
        return {
            writeReportEachSpec: true,
            showSuspectLine: true,
            highlightSuspectLine: true,
			saveJson: true,
            /*Extras - jcernea */
            filename: 'report',
            title: 'Jasmine Pretty HTML Reporter'
        };
    }

    static makeDirectoryIfNeeded(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
}

module.exports = Reporter;