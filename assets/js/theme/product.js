/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

import utils from '@bigcommerce/stencil-utils';
/*
let productOptionsSingleton = null;

utils.hooks.on('product-option-change', (event, changedOption) => {
    if (productOptionsSingleton) {
        // console.log('in product.js');
        // productSingleton.productOptionsChanged(event, changedOption);
    }
});
*/

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        const prev = document.getElementById('option-prev');
        const next = document.getElementById('option-next');
        const buidProduct = document.getElementById('build-product');
        this.url = location.href;
        this.stepArray = new Array(10);
        this.currentStep = -1;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.moveNext = this.moveNext.bind(this);
        this.movePrev = this.movePrev.bind(this);
        this.hideAll = this.hideAll.bind(this);
        this.startBuild = this.startBuild.bind(this);
        this.setPrice = this.setPrice.bind(this);
        this.attachDetailsListener = this.attachDetailsListener.bind(this);
        this.buildBreadcrumb = this.buildBreadcrumb.bind(this);
        this.highlightBreadCrumb = this.highlightBreadCrumb.bind(this);
        prev.addEventListener('click', this.movePrev);
        next.addEventListener('click', this.moveNext);
        buidProduct.addEventListener('click', this.startBuild);

        // productOptionsSingleton = this;
    }


    before(next) {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#writeReview') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation();
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        next();
    }

    after(next) {
        this.productReviewHandler();

        next();

        const breadCrumbsArray = this.context.productBreadcrumbs;
        const productID = this.context.productID;
        const productOptions = this.context.productOptions;
        console.log(productOptions);
        productOptions.forEach((value) => {
            if (value.display_name) {
                // console.log(value.display_name);
                const stepName = value.display_name;
                const res = stepName.split('-');
                // console.log(res[1]);
                const stepNumber = parseInt(res[1], 10);
                if (this.stepArray[stepNumber] === undefined) {
                    this.stepArray[stepNumber] = [];
                }
                const stepOptions = this.stepArray[stepNumber];
                stepOptions.push(value.display_name);
                this.stepArray[stepNumber] = stepOptions;
            }
        });

        this.stepArray = this.stepArray.filter((element) => {
            let i = 0;
            i++;
            return element !== undefined;
        });
        // console.log(this.stepArray);
        // console.log(this.currentStep);

        this.hideAll();

        // const currentStepOptions = this.stepArray[this.currentStep];
        // if (currentStepOptions === undefined) {
        //    this.hideAll();
        // }


        // console.log('productOptions');
        // console.log(productOptions);
        // console.log(this.stepArray);
        // const decodedCookie = decodeURIComponent(document.cookie);
        // console.log('decodedCookie');
        // console.log(decodedCookie);
        document.cookie = 'make='.concat(productID);


        let parentCategoryURL = '';
        breadCrumbsArray.forEach((value) => {
            if (value.url) {
                parentCategoryURL = value.url;
            }
        });


        // console.log(parentCategoryURL);
        utils.api.getPage(
            parentCategoryURL,
            // { params: { debug: "context" } },
            // { template: 'category/_category-json' },
            { template: 'products/_alternative-product-carousel' },
            (err, resp) => {
                // var categoryProducts = JSON.parse(resp.replace(/&quot;/g,'"'));
                const alternativeTab = document.getElementById('tab-alternative');
                alternativeTab.innerHTML = resp;
                const articleId = 'alt-prd-'.concat(productID);
                const currentProductEl = document.getElementById(articleId);
                currentProductEl.parentNode.removeChild(currentProductEl);
            }
        );

        this.setPrice();
        this.attachDetailsListener();
        this.buildBreadcrumb();
    }

    highlightBreadCrumb() {
        // const liID = '#li-step-'.concat(this.currentStep + 1);
        // $(liID)css('font-weight','bold');
    }

    productReviewHandler() {
        if (this.url.indexOf('#writeReview') !== -1) {
            this.$reviewLink.click();
        }
    }

    moveNext() {
        // console.log("next");
        let nextStep = -1;
        // console.log('Current Step ', this.currentStep );
        for (let i = this.currentStep + 1; i < this.stepArray.length; i++) {
            // console.log("i=", i);
            if (this.stepArray[i] !== undefined) {
                // Change Current to normal bradcrumb
                let liCurrent = '#li-step-'.concat(this.currentStep + 1);
                $(liCurrent).css('font-weight', 'normal');

                this.currentStep = i;
                nextStep = i;
                const optionsEllements = document.querySelectorAll('[data-step-name]');
                // console.log(optionsEllements);
                // console.log(this.currentStep);
                const currentStepOptions = this.stepArray[this.currentStep];
                optionsEllements.forEach((value) => {
                    const j = currentStepOptions.indexOf(value.dataset.stepName);
                    if (j > - 1) {
                        // console.log(value.dataset.stepName);
                        // console.log("found");
                        $(value).show();
                    } else {
                        // console.log(value.dataset.stepName);
                        // console.log("not found");
                        $(value).hide();
                    }
                });
                // console.log("Next Step ", nextStep);
                if (nextStep > -1) {
                    // console.log(currentStepOptions);
                    const stepName = this.stepArray[nextStep][0];
                    // console.log(stepName);
                    const stepNameSplit = stepName.split('-');
                    // console.log(stepNameSplit)
                    const lableDivision = document.getElementById('step-name');
                    // lableDivision.innerHTML = stepNameSplit[0].concat(' ', stepNameSplit[1]);
                    lableDivision.innerHTML = stepNameSplit[0].concat(' ', (i + 1));
                }
                // Highlight BreadCrumb
                liCurrent = '#li-step-'.concat(this.currentStep + 1);
                $(liCurrent).css('font-weight', 'bold');

                this.showNext();
                this.showPrev();
                break;
            }
        }
    }

    movePrev() {
        // console.log("prev");
        let prevStep = -1;
        for (let i = this.currentStep - 1; i >= 0; i--) {
            if (this.stepArray[i] !== undefined) {
                // Change Current to normal bradcrumb
                let liCurrent = '#li-step-'.concat(this.currentStep + 1);
                $(liCurrent).css('font-weight', 'normal');

                this.currentStep = i;
                prevStep = i;
                const optionsEllements = document.querySelectorAll('[data-step-name]');
                // console.log(optionsEllements);
                const currentStepOptions = this.stepArray[this.currentStep];
                optionsEllements.forEach((value) => {
                    const j = currentStepOptions.indexOf(value.dataset.stepName);
                    if (j > - 1) {
                        // console.log(value.dataset.stepName);
                        // console.log("found");
                        $(value).show();
                    } else {
                        // console.log(value.dataset.stepName);
                        // console.log("not found");
                        $(value).hide();
                    }
                });
                if (prevStep > -1) {
                    // console.log(currentStepOptions);
                    const stepName = this.stepArray[prevStep][0];
                    // console.log(stepName);
                    const stepNameSplit = stepName.split('-');
                    // console.log(stepNameSplit)
                    const lableDivision = document.getElementById('step-name');
                    // lableDivision.innerHTML = stepNameSplit[0].concat(' ', stepNameSplit[1]);
                    lableDivision.innerHTML = stepNameSplit[0].concat(' ', (i + 1));
                }

                // Highlight Curent BreadCrumb
                liCurrent = '#li-step-'.concat(this.currentStep + 1);
                $(liCurrent).css('font-weight', 'bold');

                this.showNext();
                this.showPrev();
                break;
            }
        }
    }

    buildBreadcrumb() {
        const breadcrumb = document.getElementById('step-breadcrumb');
        console.log('Breadcrumb length: ', this.stepArray.length);
        for (let i = 0; i < this.stepArray.length; i++) {
            const li = document.createElement('li');
            const stepName = this.stepArray[i][0];
            // console.log(stepName);
            const stepNameSplit = stepName.split('-');
            li.appendChild(document.createTextNode(stepNameSplit[0].concat(' ', (i + 1))));
            li.setAttribute('id', 'li-step-'.concat(i + 1));
            breadcrumb.appendChild(li);
        }
    }

    hideAll() {
        const optionsEllements = document.querySelectorAll('[data-step-name]');
        optionsEllements.forEach((value) => {
            $(value).hide();
        });
        $('#form-action-addToCart').hide();
        $('#option-prev').hide();
        $('#option-next').hide();
        $('#build-product').show();
    }

    startBuild() {
        $('#build-product').hide();
        $('#step-breadcrumb').show();
        $('#div-option').show();
        this.currentStep = -1;
        this.moveNext();
    }

    showNext() {
        $('#option-next').hide();
        if (this.currentStep + 1 < this.stepArray.length) {
            $('#form-action-addToCart').hide();
            $('#option-next').show();
        } else {
            $('#form-action-addToCart').show();
            $('#build-product').hide();
        }
    }

    showPrev() {
        $('#option-prev').hide();
        if (this.currentStep > 0) {
            $('#build-product').hide();
            $('#option-prev').show();
        } else {
            $('#build-product').show();
            $('#form-action-addToCart').hide();
        }
    }

    setPrice() {
        const optionsArray = this.context.productOptions;
        // console.log(optionsArray);
        optionsArray.forEach((optionSet) => {
            const values = optionSet.values;
            // console.log(value.data);
            values.forEach((value) => {
                const spanId = '#price_'.concat(value.data);
                // console.log(spanId);
                utils.api.product.getById(
                    value.data,
                    // { params: { debug: "context" } },
                    { template: 'products/_nt-product-price-json' },
                    (err, resp) => {
                        // console.log(resp);
                        const price = JSON.parse(resp.replace(/&quot;/g, '"'));
                        // console.log(price);
                        // console.log('here');
                        $(spanId).html('<s>'.concat('+(', price.without_tax.formatted, ')</s> +(', price.without_tax.formatted, ')'));
                    });
            });
        });
    }

    attachDetailsListener() {
        const optionsArray = this.context.productOptions;
        // console.log('attachDetailsListener');
        // console.log(optionsArray);
        optionsArray.forEach((optionSet) => {
            const values = optionSet.values;
            // console.log(value.data);
            values.forEach((value) => {
                const buttonId = 'btn_option_details_'.concat(value.data);
                // console.log("buttonId: ", buttonId);
                const buttonEllement = document.getElementById(buttonId);
                // console.log(buttonEllement);
                const productId = value.data;
                // console.log("Calling with", productId)
                buttonEllement.addEventListener('click', () => {
                    // console.log('showOptionDetails:', productId);
                    const detailsDivId = '#option_details_'.concat(productId);
                    // console.log(detailsDivId);
                    // console.log($(detailsDivId));
                    // $(detailsDivId).html("Product ID:".concat(productId));
                    utils.api.product.getById(
                        productId,
                        // { params: { debug: "context" } },
                        { template: 'products/_nt-product-option-view' },
                        (err, resp) => {
                            // console.log(resp);
                            $(detailsDivId).html(resp);
                        }
                    );
                });
            });
        });
    }

}
