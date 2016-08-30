/**
 * Created by Karthik Kalletla on 4/6/16.
 */
'use strict';
(function(Vue, dc, iViz, $) {
  Vue.component('pieChart', {
    template: '<div id={{chartDivId}} ' +
    'class="grid-item grid-item-h-1 grid-item-w-1" ' +
    ':data-number="attributes.priority" ' +
    '@mouseenter="mouseEnter($event)" @mouseleave="mouseLeave($event)">' +
    '<chart-operations :has-chart-title="hasChartTitle" ' +
    ':display-name="displayName" :show-table-icon.sync="showTableIcon" ' +
    ' :show-pie-icon.sync="showPieIcon" :chart-id="chartId" ' +
    ':show-operations="showOperations" :groupid="groupid" ' +
    ':reset-btn-id="resetBtnId" :chart-ctrl="piechart" ' +
    ' :filters.sync="filters" ' +
    ':attributes="attributes"></chart-operations>' +
    '<div class="dc-chart dc-pie-chart" ' +
    ':class="{view: showPieIcon}" align="center" style="float:none' +
    ' !important;" id={{chartId}} ></div>' +
    '<div id={{chartTableId}} :class="{view: showTableIcon}"></div>' +
    '</div>',
    props: [
      'ndx', 'attributes', 'filters', 'groupid', 'options'
    ],
    data: function() {
      return {
        v: {},
        chartDivId: 'chart-' +
        this.attributes.attr_id.replace(/\(|\)| /g, '') + '-div',
        resetBtnId: 'chart-' +
        this.attributes.attr_id.replace(/\(|\)| /g, '') + '-reset',
        chartId: 'chart-' + this.attributes.attr_id.replace(/\(|\)| /g, ''),
        chartTableId: 'table-' +
        this.attributes.attr_id.replace(/\(|\)| /g, ''),
        displayName: this.attributes.display_name,
        chartInst: '',
        component: '',
        showOperations: false,
        cluster: '',
        piechart: '',
        hasChartTitle: true,
        showTableIcon: true,
        showPieIcon: false,
        filtersUpdated: false
      };
    },
    watch: {
      filters: function(newVal, oldVal) {
        if (this.filtersUpdated) {
          this.filtersUpdated = false;
        } else {
          this.filtersUpdated = true;
          if (newVal.length === 0) {
            this.chartInst.filterAll();
          } else {
            this.chartInst.replaceFilter([newVal]);
          }
          dc.redrawAll(this.groupid);
          this.$dispatch('update-filters');
        }
      }
    },
    events: {
      toTableView: function() {
        this.piechart.changeView(this, !this.showTableIcon);
      },
      closeChart: function() {
        $('#' + this.chartDivId).qtip('destroy');
        dc.deregisterChart(this.chartInst, this.attributes.groupid);
        this.chartInst.dimension().dispose();
        this.$dispatch('close');
      }
    },
    methods: {
      mouseEnter: function() {
        this.showOperations = true;
        this.$emit('initMainDivQtip');
      }, mouseLeave: function(event) {
        if (event.relatedTarget === null) {
          this.showOperations = false;
        }
        if ((event.relatedTarget !== null) &&
          (event.relatedTarget.nodeName !== 'CANVAS')) {
          this.showOperations = false;
        }
      }, initMainDivQtip: function() {
        this.piechart.initMainDivQtip();
      }
    },
    ready: function() {
      var _self = this;
      var _attrId = _self.attributes.attr_id;
      var _cluster = _self.ndx.dimension(function(d) {
        if (typeof d[_attrId] === 'undefined') {
          d[_attrId] = 'NA';
        }
        return d[_attrId];
      });

      _self.$once('initMainDivQtip', _self.initMainDivQtip);
      var opts = {
        chartId: _self.chartId,
        chartDivId: _self.chartDivId,
        groupid: _self.groupid,
        chartTableId: _self.chartTableId,
        transitionDuration: iViz.opts.dc.transitionDuration,
        width: window.style['piechart-svg-width'] | 130,
        height: window.style['piechart-svg-height'] | 130
      };
      _self.piechart = new iViz.view.component.PieChart(
        _self.ndx, _self.attributes, opts, _cluster);
      _self.piechart.setDownloadDataTypes(['tsv', 'pdf', 'svg']);
      _self.chartInst = _self.piechart.getChart();
      _self.chartInst.on('filtered', function(_chartInst, _filter) {
        if (_self.filtersUpdated) {
          _self.filtersUpdated = false;
        } else {
          _self.filtersUpdated = true;

          if (_filter instanceof Array) {
            _self.filters = _filter;
          } else if ($.inArray(_filter, _self.filters) === -1) {
            _self.filters.push(_filter);
          } else {
            _self.filters = _.filter( _self.filters, function(d) {
              return d !== _filter;
            });
          }
          _self.$dispatch('update-filters');
        }
        // Trigger pie chart filtered event.
        _self.piechart.filtered();
      });
      _self.$dispatch('data-loaded', this.chartDivId);
    }
  });
})(
  window.Vue,
  window.dc,
  window.iViz,
  window.$ || window.jQuery);
