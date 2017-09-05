import $ from 'jquery';
// import PageManager from '../page-manager';
import urlUtils from '../common/url-utils';


/*
 * Manage the behaviour of a menu
 * @param {jQuery} $menu
 */
class InterfaceSearch {

    constructor() {
        // super();
        this.cnt = 1;
        this.onMakeSelect = this.onMakeSelect.bind(this);
        this.onModelSelect = this.onModelSelect.bind(this);
        this.onYearSelect = this.onYearSelect.bind(this);
        this.onOptionSelect = this.onOptionSelect.bind(this);
        this.loadDropDowns = this.loadDropDowns.bind(this);
        this.resetDropDowns = this.resetDropDowns.bind(this);
        this.loadMake = this.loadMake.bind(this);
        this.loadModel = this.loadModel.bind(this);
        this.loadYear = this.loadYear.bind(this);
        this.loadOption = this.loadOption.bind(this);
        this.populateDropDown = this.populateDropDown.bind(this);
        this.searchMMY = this.searchMMY.bind(this);

        this.baseUrl = 'http://localhost:3000';

        console.log('Interface Search');
        const makeSelect = document.getElementById('vehicle-make');
        makeSelect.addEventListener('change', this.onMakeSelect);
        const modelSelect = document.getElementById('vehicle-model');
        modelSelect.addEventListener('change', this.onModelSelect);
        const yearSelect = document.getElementById('vehicle-year');
        yearSelect.addEventListener('change', this.onYearSelect);
        const optionSelect = document.getElementById('vehicle-option');
        optionSelect.addEventListener('change', this.onOptionSelect);
        const resetBtn = document.getElementById('mmy-reset');
        resetBtn.addEventListener('click', this.resetDropDowns);
        const sumbitBtn = document.getElementById('mmy-submit');
        sumbitBtn.addEventListener('click', this.searchMMY);
    }

    searchMMY() {
        const optionList = sessionStorage.getItem('optionList');
        const optionArray = JSON.parse(optionList);
        const selectedOption = sessionStorage.getItem('option-selected');
        optionArray.forEach((arrayItem) => {
            if (arrayItem.option_1.localeCompare(selectedOption) === 0) {
                window.location = arrayItem.category_url;
            }
        });
    }

    resetDropDowns() {
        sessionStorage.removeItem('make-selected');
        sessionStorage.removeItem('model-selected');
        sessionStorage.removeItem('year-selected');
        sessionStorage.removeItem('modelList');
        sessionStorage.removeItem('yearsList');
        sessionStorage.removeItem('option-selected');
        sessionStorage.removeItem('optionList');
        $('#vehicle-make').val('');
        this.populateDropDown('vehicle-model', 'Select Model', 'model_id', 'vehicle_model', null);
        this.populateDropDown('vehicle-year', 'Select Year', 'year_id', 'year_text', null);
        this.populateDropDown('vehicle-option', 'Select Option', 'option_1', 'option_1_desc', null);
    }

    onOptionSelect() {
        // console.log('option selected InterfaceSearch');
        // console.log($('#vehicle-option option:selected').val());
        sessionStorage.setItem('option-selected', $('#vehicle-option option:selected').val());
    }

    onMakeSelect() {
        // console.log('make selected InterfaceSearch');
        // console.log($('#vehicle-make option:selected').val());
        sessionStorage.setItem('make-selected', $('#vehicle-make option:selected').val());
        const makeId = $('#vehicle-make option:selected').val();
        sessionStorage.removeItem('model-selected');
        sessionStorage.removeItem('year-selected');
        sessionStorage.removeItem('modelList');
        sessionStorage.removeItem('yearsList');
        sessionStorage.removeItem('option-selected');
        sessionStorage.removeItem('optionList');
        this.populateDropDown('vehicle-model', 'Loading Model ...', 'model_id', 'vehicle_model', null);
        this.populateDropDown('vehicle-year', 'Select Year', 'year_id', 'year_text', null);
        this.populateDropDown('vehicle-option', 'Select Option', 'option_1', 'option_1_desc', null);
        this.loadModel(makeId);
    }

    onModelSelect() {
        // console.log('model selected InterfaceSearch');
        // console.log($('#vehicle-model option:selected').val());
        sessionStorage.setItem('model-selected', $('#vehicle-model option:selected').val());
        const modelId = $('#vehicle-model option:selected').val();
        sessionStorage.removeItem('year-selected');
        sessionStorage.removeItem('yearsList');
        sessionStorage.removeItem('option-selected');
        sessionStorage.removeItem('optionList');
        this.populateDropDown('vehicle-year', 'Loading Year ...', 'year_id', 'year_text', null);
        this.populateDropDown('vehicle-option', 'Select Option', 'option_1', 'option_1_desc', null);
        this.loadYear(modelId);
    }

    onYearSelect() {
        sessionStorage.setItem('year-selected', $('#vehicle-year option:selected').val());
        const yearId = $('#vehicle-year option:selected').val();
        sessionStorage.removeItem('option-selected');
        sessionStorage.removeItem('optionList');
        this.populateDropDown('vehicle-option', 'Loading Option...', 'option_1', 'option_1_desc', null);
        this.loadOption(yearId);
    }

    loadDropDowns() {
        this.loadMake();
        this.loadModel();
        this.loadYear();
        this.loadOption();
    }

    loadModel(makeID) {
        // console.log('makeId:', makeID);
        if (makeID !== undefined) {
            const url = this.baseUrl.concat('/bc_model?vehicle_make=').concat(makeID);
            // console.log(url);
            const xhr = urlUtils.createCORSRequest('GET', url);
            if (!xhr) {
                alert('CORS not supported');
                return;
            }
            // Response handlers.
            xhr.onload = () => {
                let list = [];
                list = JSON.parse(xhr.responseText);
                // console.log(list);
                sessionStorage.setItem('modelList', JSON.stringify(list));
                this.populateDropDown('vehicle-model', 'Select Model', 'model_id', 'vehicle_model', list);
            };

            xhr.onerror = () => {
                alert('Woops, there was an error making the request.');
            };

            xhr.send();
        } else {
            const modelList = sessionStorage.getItem('modelList');
            const modelArray = JSON.parse(modelList);
            this.populateDropDown('vehicle-model', 'Select Model', 'model_id', 'vehicle_model', modelArray);
        }
        const modelValue = sessionStorage.getItem('model-selected');
        // console.log('Current model: ', modelValue);
        if (modelValue !== null) {
            // console.log('Setting model value', modelValue);
            $('#vehicle-model').val(modelValue);
        }
    }

    loadMake() {
        const makeList = sessionStorage.getItem('makeList');
        if (makeList === null) {
            const url = this.baseUrl.concat('/bc_make');
            const xhr = urlUtils.createCORSRequest('GET', url);
            if (!xhr) {
                alert('CORS not supported');
                return;
            }
            // Response handlers.
            xhr.onload = () => {
                let list = [];
                list = JSON.parse(xhr.responseText);
                // console.log(list);
                sessionStorage.setItem('makeList', JSON.stringify(list));
                this.populateDropDown('vehicle-make', 'Select Make', 'make_id', 'vehicle_make', list);
            };

            xhr.onerror = () => {
                alert('Woops, there was an error making the request.');
            };

            xhr.send();
        } else {
            const makeArray = JSON.parse(makeList);
            // console.log('Loading Array from session');
            // console.log(makeArray);
            this.populateDropDown('vehicle-make', 'Select Make', 'make_id', 'vehicle_make', makeArray);
        }
        const makeValue = sessionStorage.getItem('make-selected');
        // console.log('Current make: ', makeValue);
        if (makeValue !== null) {
            $('#vehicle-make').val(makeValue);
        }
    }

    loadYear(modelID) {
        // console.log('modelID:', modelID);
        if (modelID !== undefined) {
            const makeID = sessionStorage.getItem('make-selected');
            const url = this.baseUrl.concat('/bc_years?vehicle_make=').concat(makeID).concat('&vehicle_model=').concat(modelID);
            // console.log(url);
            const xhr = urlUtils.createCORSRequest('GET', url);
            if (!xhr) {
                alert('CORS not supported');
                return;
            }
            // Response handlers.
            xhr.onload = () => {
                let list = [];
                list = JSON.parse(xhr.responseText);
                const yearResult = list[0];
                const yearFrom = parseInt(yearResult.year_from, 10);
                const yearTo = parseInt(yearResult.year_to, 10);
                const yearsArray = [];
                for (let i = yearFrom; i <= yearTo; i++) {
                    yearsArray.push({ year_id: i, year_text: i });
                }
                // console.log('Years Array: ', yearsArray);
                sessionStorage.setItem('yearsList', JSON.stringify(yearsArray));
                this.populateDropDown('vehicle-year', 'Select Year', 'year_id', 'year_text', yearsArray);
            };

            xhr.onerror = () => {
                alert('Woops, there was an error making the request.');
            };

            xhr.send();
        } else {
            const yearsList = sessionStorage.getItem('yearsList');
            const yearsArray = JSON.parse(yearsList);
            this.populateDropDown('vehicle-year', 'Select Year', 'year_id', 'year_text', yearsArray);
        }
        const yearValue = sessionStorage.getItem('year-selected');
        // console.log('Current year: ', yearValue);
        if (yearValue !== null) {
            $('#vehicle-year').val(yearValue);
        }
    }

    loadOption(yearID) {
        // console.log('yearID:', yearID);
        if (yearID !== undefined) {
            const makeID = sessionStorage.getItem('make-selected');
            const modelID = sessionStorage.getItem('model-selected');
            const url = this.baseUrl.concat('/bc_options?vehicle_make=').concat(makeID).concat('&vehicle_model=').concat(modelID).concat('&vehicle_year=').concat(yearID);
            // console.log(url);
            const xhr = urlUtils.createCORSRequest('GET', url);
            if (!xhr) {
                alert('CORS not supported');
                return;
            }
            // Response handlers.
            xhr.onload = () => {
                let list = [];
                list = JSON.parse(xhr.responseText);
                // console.log(list);
                sessionStorage.setItem('optionList', JSON.stringify(list));
                this.populateDropDown('vehicle-option', 'Select Option', 'option_1', 'option_1_desc', list);
            };

            xhr.onerror = () => {
                alert('Woops, there was an error making the request.');
            };

            xhr.send();
        } else {
            const optionList = sessionStorage.getItem('optionList');
            const optionArray = JSON.parse(optionList);
            this.populateDropDown('vehicle-option', 'Select Option', 'option_1', 'option_1_desc', optionArray);
        }
        const optionValue = sessionStorage.getItem('option-selected');
        // console.log('Current option: ', optionValue);
        if (optionValue !== null) {
            $('#vehicle-option').val(optionValue);
        }
    }

    populateDropDown(dropdownId, selectText, valueProperty, textProperty, valueArray) {
        const dId = '#'.concat(dropdownId);
        $(dId)
            .empty()
            .append($('<option></option>')
            .attr('value', '')
            .text(selectText));
        // console.log('populateDropDown');
        // console.log(valueArray);
        if (valueArray !== null) {
            valueArray.forEach((arrayItem) => {
                const optValue = arrayItem[valueProperty];
                const optText = arrayItem[textProperty];
                $(dId)
                    .append($('<option></option>')
                    .attr('value', optValue)
                    .text(optText));
            });
        }
        // console.log('Array Size:', $(dId).children('option').length);
    }
}

export const searchMMY = new InterfaceSearch();
