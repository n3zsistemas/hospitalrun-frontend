import { isArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { get, defineProperty, computed } from '@ember/object';
import SelectOrTypeahead from 'hospitalrun/components/select-or-typeahead';
export default SelectOrTypeahead.extend({
  checkboxesPerRow: 5,
  model: null,

  _getLabelFromContent(object) {
    let optionLabelPath = this.get('optionLabelPath');
    return get(object, optionLabelPath);
  },

  _getValueFromContent(object) {
    let optionValuePath = this.get('optionValuePath');
    return get(object, optionValuePath);
  },

  _mapCheckboxValues(value) {
    return {
      label: this._getLabelFromContent(value),
      value: this._getValueFromContent(value)
    };
  },

  _setup: function() {
    let property = this.get('property');
    defineProperty(this, 'errors', computed(`model.errors.${property}`, function() {
      let property = this.get('property');
      let errors = this.get(`model.errors.${property}`);
      if (!isEmpty(errors)) {
        return errors[0];
      }
    }));
  }.on('init'),

  checkboxRows: computed('content', 'checkboxesPerRow', function() {
    let checkboxRows = [];
    let checkboxesPerRow = this.get('checkboxesPerRow');
    let content = this.get('content');
    let allValues = content.copy();
    while (allValues.length > 0) {
      let checkBoxRowValues = allValues.splice(0, checkboxesPerRow).map(this._mapCheckboxValues.bind(this));
      checkboxRows.push(checkBoxRowValues);
    }
    return checkboxRows;
  }),

  actions: {
    checkboxChanged(value, checked) {
      let property = this.get('property');
      let propertyName = `model.${property}`;
      let selectedValues = this.get(propertyName);
      if (!isArray(selectedValues)) {
        selectedValues = [];
      }
      if (checked && !selectedValues.includes(value)) {
        selectedValues.addObject(value);
      } else if (!checked && selectedValues.includes(value)) {
        selectedValues.removeObject(value);
      }
      this.set(propertyName, selectedValues);
      this.set('selection', selectedValues);
      this.get('model').validate().catch(function() {});
    }
  }

});
