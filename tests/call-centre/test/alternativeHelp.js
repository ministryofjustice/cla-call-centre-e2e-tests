(function() {
  "use strict";

  var utils = require("./helpers/_utils");
  var modelsRecipe = require("./helpers/_modelsRecipe");
  var CONSTANTS = require("../protractor.constants");

  var providers = element.all(by.css("input[name=selected_providers]"));
  var selectedProviders = element.all(
    by.css("input[name=selected_providers]:checked")
  );
  var assignSubmit = element(by.name("assign-alternative-help"));
  var assignF2fBtn = element(by.name("assign-f2f"));
  var declineBtn = element(by.name("btn-decline-help"));
  var modal = element(by.css(".modal-content"));
  var modalHeading = modal.element(by.css("h2"));
  var modalSubmit = modal.element(by.css('button[type="submit"]'));

  describe("alternativeHelp", function() {
    beforeEach(utils.setUp);

    describe("An operator", function() {
      it("should not be able to assign without diagnosis", function() {
        modelsRecipe.Case.createEmpty().then(function(case_ref) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + "/");

          gotoAltHelp();

          expect(modal.isPresent()).toBe(true);
          expect(modal.getText()).toContain(
            "Cannot assign alternative help without setting area of law. Please complete diagnosis."
          );
        });
      });

      it("should not be able to assign without minimum personal details", function() {
        expect(modal.isPresent()).toBe(true);
        expect(modal.getText()).toContain(
          "You must collect at least a name and a postcode or phone number from the client before assigning alternative help."
        );
      });

      it("should have a disabled assign button if no alternative help providers selected", function() {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(
          _caseRef
        ) {
          browser.get(CONSTANTS.callcentreBaseUrl + _caseRef + "/");

          gotoAltHelp();

          expect(selectedProviders.count()).toBe(0);
          expect(assignSubmit.isEnabled()).toBe(false);
        });
      });

      xit("should have enabled assign button if alternative help providers selected", function() {
        providers.then(function(data) {
          // select the first three
          var to_select = data.splice(0, 3);

          for (var i = 0; i < to_select.length; i += 1) {
            var inputEl = to_select[i];
            inputEl.click();
          }
        });

        expect(selectedProviders.count()).toBe(3);
        expect(assignSubmit.isEnabled()).toBe(true);
      });

      xit("should assign", function() {
        browser.getCurrentUrl().then(function(caseUrl) {
          utils.scrollTo(assignSubmit);
          assignSubmit.click();

          ensureHasSurveyModal();

          browser.get(caseUrl);
          utils.checkLastOutcome("IRKB");
        });
      });

      it("should be able assign f2f after clicking f2f link", function() {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(
          case_ref
        ) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + "/");

          gotoAltHelp();

          var f2f = element
            .all(by.css('a[href^="http://find-legal-advice.justice.gov.uk/"]'))
            .get(0);

          f2f.click().then(function() {
            browser.getAllWindowHandles().then(function(handles) {
              var origWindow = handles[0];
              var newWindowHandle = handles[1];
              browser
                .switchTo()
                .window(newWindowHandle)
                .then(function() {
                  browser.driver.close().then(function() {
                    browser.switchTo().window(origWindow);
                  });
                });
            });
          });

          expect(assignF2fBtn.isEnabled()).toBe(false);

          element(by.name("assign-notes")).sendKeys("assigning face to face");
          expect(assignF2fBtn.isEnabled()).toBe(true);
        });
      });

      it("should assign f2f", function() {
        browser.getCurrentUrl().then(function(caseUrl) {
          assignF2fBtn.click();
          ensureHasSurveyModal();
          browser.get(caseUrl);
          utils.checkLastOutcome("SPFN");
        });
      });

      //      An in-scope / eligible case shouldn't see ECF message;
      it("should see ECF message if declining out of scope case", function() {
        modelsRecipe.Case.createWithOutScopeAndInEligible().then(function(
          case_ref
        ) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + "/");

          gotoAltHelp();

          expect(declineBtn.isEnabled()).toBe(true);
          utils.scrollTo(declineBtn);
          declineBtn.click();

          expect(modal.isPresent()).toBe(true);

          expect(
            element
              .all(by.css("div.modal h2"))
              .get(0)
              .getText()
          ).toBe("Exceptional case funding");
          pickECFStatement();
        });
      });

      //      An in-scope / eligible case shouldn't see ECF message;
      it("should be able to filter out of scope outcome codes", function() {
        var searchField = modal.element(by.name("outcome-modal-code-search"));
        searchField.sendKeys("all help options");

        var outcomes = element.all(by.repeater("code in outcome_codes"));
        outcomes.then(function(items) {
          expect(items.length).toBe(1);
        });
        expect(outcomes.getText()).toEqual([
          "DECL - Client declined all help options"
        ]);
      });

      //      An in-scope / eligible case shouldn't see ECF message;
      it("should decline help for out of scope case", function() {
        declineHelp();

        browser.getCurrentUrl().then(function(caseUrl) {
          modalSubmit.click();
          browser.get(caseUrl);
          utils.checkLastOutcome("DECL");
        });
      });

      //      An in-scope / eligible case shouldn't see ECF message;
      it("should be able to decline help (in_scope)", function() {
        modelsRecipe.Case.createWithInScopeAndEligible().then(function(
          case_ref
        ) {
          browser.get(CONSTANTS.callcentreBaseUrl + case_ref + "/");

          gotoAltHelp();

          expect(declineBtn.isEnabled()).toBe(true);
          utils.scrollTo(declineBtn);
          declineBtn.click();

          ensureHasSurveyModal();
          declineHelp();

          expect(modal.isPresent()).toBe(true);
          expect(modalSubmit.isPresent()).toBe(true);

          browser.getCurrentUrl().then(function(caseUrl) {
            modalSubmit.click();
            browser.get(caseUrl);
            utils.checkLastOutcome("DECL");
          });
        });
      });
    });
  });

  // helpers
  function pickECFStatement() {
    element(
      by.css('input[name="ecf_statement"][value="CLIENT_TERMINATED"]')
    ).click();
    modalSubmit.click();
    browser.waitForAngular();
  }

  function declineHelp() {
    expect(modalHeading.getText()).toBe("Decline help");
    expect(element(by.repeater("code in outcome_codes")).isPresent()).toBe(
      true
    );
    element(by.css('input[name="code"][value="DECL"]')).click();
  }

  function gotoAltHelp() {
    element(
      by.css('.CaseBar-actions a[ui-sref="case_detail.alternative_help"]')
    ).click();
  }

  function ensureHasSurveyModal() {
    expect(modal.isPresent()).toBe(true);
    expect(
      element
        .all(by.css("div.modal h2"))
        .get(0)
        .getText()
    ).toBe("Survey reminder");
    modalSubmit.click();
  }
})();
