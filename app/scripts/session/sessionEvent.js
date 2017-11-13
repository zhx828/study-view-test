'use strict';
// Move vcSession initialization to here since the sessionEvent.js
// is the first one to be called in the dependency list.
window.vcSession = window.vcSession ? window.vcSession : {};

(function(vcSession, _) {
  if (!_.isObject(vcSession)) {
    vcSession = {};
  }
  vcSession.events = (function() {
    return {
      saveCohort: function(stats, name, description) {
        var def = new $.Deferred();
        $.when(vcSession.utils.buildVCObject(stats.filters, stats.studies,
          name, description)).done(function(_virtualCohort) {
          vcSession.model.saveSession(_virtualCohort)
            .done(function(response) {
              def.resolve(response);
            })
            .fail(function() {
              def.reject();
            });
        });
        return def.promise();
      },
      removeVirtualCohort: function(virtualCohort) {
        vcSession.model.removeSession(virtualCohort);
      },
      editVirtualCohort: function(virtualCohort) {
        vcSession.model.editSession(virtualCohort);
      },
      addSampleToVirtualCohort: function(virtualCohortID, cancerStudyID,
                                         sampleID) {
        var _returnString = 'error';
        var _virtualCohorts = vcSession.utils.getVirtualCohorts();
        var _studyMatch = _.findWhere(_virtualCohorts, {
          virtualCohortID: virtualCohortID
        });
        if (typeof _studyMatch === 'undefined') {
          /*
           TODO : if virtual cohort is not present in local storage
           */
          console.log('virtual cohort not found');
        } else {
          var _match = _.findWhere(_studyMatch.studies, {
            id: cancerStudyID
          });
          if (typeof _match === 'undefined') {
            var _selectedCases = vcSession.utils.buildCaseListObject(
              _studyMatch.studies, cancerStudyID, sampleID);
            _studyMatch.studies = _selectedCases;
            // TODO: this is the question I have for a while, should we have
            // individual length property? I understand it's convenient
            // but also easy to get out of sync with the samples array.
            _returnString = 'success';
          } else if (_.contains(_match.samples, sampleID)) {
            _returnString = 'warn';
          } else {
            _match.samples.push(sampleID);
            _returnString = 'success';
          }
          this.editVirtualCohort(_studyMatch);
        }
        return _returnString;
      }
    };
  })();
})(window.vcSession,
  window._);
