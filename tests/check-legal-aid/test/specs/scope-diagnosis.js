"use strict";

var constants = require("../modules/constants");
var allInScopePaths = require("../modules/all-inscope-paths")

var scenarioTypes = {
  outOfScope: {
    label: "Out of scope",
    destination: "/scope/refer",
    identifier: 'a[href="http://find-legal-advice.justice.gov.uk/"]'
  },
  inScope: {
    label: "In scope",
    destination: "/legal-aid-available",
    identifier: "a.button-get-started"
  },
  faceToFace: {
    label: "Face to Face",
    destination: "/scope/refer/legal-adviser",
    identifier: 'input[name="postcode"]'
  },
  contact: {
    label: "Contact",
    destination: "/contact",
    identifier: ".contact-form"
  }
};
var scenarios = [
  constants.SCOPE_PATHS.clinnegFaceToFace,
  constants.SCOPE_PATHS.domesticAbuseContact,
  constants.SCOPE_PATHS.debtOutOfScope,
  constants.SCOPE_PATHS.debtInScope
];
Object.keys(allInScopePaths.SCOPE_PATHS.allInScope).forEach(function(key){
	var scenario = allInScopePaths.SCOPE_PATHS.allInScope[key];
	scenarios.push(scenario);
});
module.exports = {
  "@disabled": false,
  "Scope diagnosis scenarios": function(client) {
    scenarios.forEach(function(scenario) {
      var scenarioType = scenarioTypes[scenario.type];

      client
        .startService()
        .scopeDiagnosis(scenario)
        .ensureCorrectPage(scenarioType.identifier, scenarioType.destination);
      if (scenario.hasOwnProperty("category") && scenario.category != null) {
        client.ensureFalaLinkCategory(".field-more-info-toggle", scenario.category);
      }
    });

    client.end();
  }
};
