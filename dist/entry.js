"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var hljs = __importStar(require("highlightjs"));
var nimble_1 = require("nimble");
var target = document.getElementById('frame');
var affect = nimble_1.makeRenderLoop(target, {
    runResult: {
        success: '',
        error: ''
    },
    paymentOptions: {
        paymentDetails: {
            title: 'Tickets to Venice x2',
            total: {
                label: 'Total',
                amount: {
                    currency: 'USD',
                    value: 2000
                }
            },
            displayItems: [],
            shippingOptions: []
        },
        methods: {
            'card': true
        },
        options: {
            requestShipping: false,
            shippingType: 'delivery'
        }
    }
}, function (state, affect, changes) {
    var renderedCode = hljs.highlightAuto(makeCodePreview(state.paymentOptions));
    function onrender(el) {
        el.innerHTML = renderedCode.value;
    }
    var displayItems = state.paymentOptions.paymentDetails.displayItems || [];
    var shippingOptions = state.paymentOptions.paymentDetails.shippingOptions || [];
    return nimble_1.h('div.app', [
        nimble_1.h('div.code-preview', [
            nimble_1.h('pre', [
                nimble_1.h('code.javascript', {
                    oncreate: onrender,
                    onupdate: onrender
                }, [Date.now()])
            ])
        ]),
        nimble_1.h('div.designer', [
            nimble_1.h('table', [
                nimble_1.h('div', [
                    inputGroup('Item Name:', [
                        makeInput(state, affect, 'paymentOptions.paymentDetails.title', 'text', 'e.g. MacBook Pro')
                    ]),
                ]),
                nimble_1.h('div', [
                    nimble_1.h('strong', 'Total:')
                ]),
                paymentDisplayItemConfig(state, affect, 'paymentOptions.paymentDetails.total'),
                nimble_1.h('div', [
                    nimble_1.h('strong', ['Breakdown:'])
                ])
            ].concat(displayItems.map(function (_, index) {
                return paymentDisplayItemConfig(state, affect, "paymentOptions.paymentDetails.displayItems." + index);
            }), [
                nimble_1.h('tr', [
                    nimble_1.h('td', {
                        colspan: 2
                    }, [
                        nimble_1.h('button', {
                            onclick: function () {
                                affect.push('paymentOptions.paymentDetails.displayItems', {
                                    label: 'Discount (10%)',
                                    amount: {
                                        currency: 'USD',
                                        value: -1,
                                    },
                                });
                            }
                        }, 'add item'),
                        displayItems.length ? nimble_1.h('button.red', {
                            onclick: function () {
                                affect.delete("paymentOptions.paymentDetails.displayItems." + (displayItems.length - 1));
                            }
                        }, 'remove item') : null
                    ])
                ]),
                nimble_1.h('div', [
                    nimble_1.h('strong', ['Other Payment Details:'])
                ]),
                nimble_1.h('div.paymentDisplayItem', [
                    inputGroup('User Info:', [
                        toggleButton(state, affect, "paymentOptions.options.requestPayerName", 'Name', false),
                        toggleButton(state, affect, "paymentOptions.options.requestPayerPhone", 'Phone', false),
                        toggleButton(state, affect, "paymentOptions.options.requestPayerEmail", 'Email', false),
                    ]),
                    inputGroup('Payment Methods:', [
                        toggleButton(state, affect, "paymentOptions.methods.card", 'Card', false),
                        toggleButton(state, affect, "paymentOptions.methods.googlePlay", 'Custom', false)
                    ])
                ]),
                nimble_1.h('div', [
                    nimble_1.h('strong', ['Shipping:'])
                ]),
                nimble_1.h('div', [
                    inputGroup('Address:', [
                        toggleButton(state, affect, "paymentOptions.options.requestShipping", 'Require', false),
                    ])
                ].concat((state.paymentOptions.options.requestShipping ? [
                    inputGroup('Shipping Type:', [
                        toggleButton(state, affect, "paymentOptions.options.shippingType", 'Delivery', 'delivery'),
                        toggleButton(state, affect, "paymentOptions.options.shippingType", 'Pickup', 'pickup'),
                    ]),
                    nimble_1.h('strong', ['Shipping Options:'])
                ].concat(shippingOptions.map(function (_, index) {
                    return shippingOptionConfig(state, affect, "paymentOptions.paymentDetails.shippingOptions." + index);
                }), [
                    nimble_1.h('tr', [
                        nimble_1.h('td', {
                            colspan: 2
                        }, [
                            nimble_1.h('button', {
                                onclick: function () {
                                    affect.push('paymentOptions.paymentDetails.shippingOptions', {
                                        label: 'Economy (5-7 days)',
                                        id: 'economy',
                                        amount: {
                                            currency: 'USD',
                                            value: 0,
                                        },
                                    });
                                }
                            }, 'add item'),
                            shippingOptions.length ? nimble_1.h('button.red', {
                                onclick: function () {
                                    affect.delete("paymentOptions.paymentDetails.shippingOptions." + (shippingOptions.length - 1));
                                }
                            }, 'remove item') : null
                        ])
                    ]),
                ]) : []))),
            ])),
            nimble_1.h('div', [
                nimble_1.h('br'),
                nimble_1.h('div.center', [
                    nimble_1.h('button.purple.big', {
                        onclick: function () {
                            try {
                                var request = new PaymentRequest(parsePaymentMethods(state.paymentOptions.methods), state.paymentOptions.paymentDetails, state.paymentOptions.options);
                                request.addEventListener('shippingoptionchange', function (event) {
                                    var prInstance = event.target;
                                    var selectedId = prInstance.shippingOption;
                                    // Step 3: Mark selected option
                                    var updatedShippingOptions = state.paymentOptions.paymentDetails.shippingOptions.map(function (option) {
                                        return Object.assign({}, option, { selected: option.id === selectedId });
                                    });
                                    var selectedShippingOption = updatedShippingOptions.find(function (o) { return o.selected; });
                                    // TODO: Update total and display items, including pending states.
                                    var newTotal = Object.assign({}, state.paymentOptions.paymentDetails.total);
                                    newTotal.amount.value += selectedShippingOption.amount.value;
                                    event.updateWith({
                                        total: newTotal,
                                        shippingOptions: updatedShippingOptions,
                                    });
                                });
                                request.show()
                                    .then(function (paymentResponse) {
                                    affect.set('runResult.success', JSON.stringify(paymentResponse, null, '\t'));
                                    paymentResponse.complete();
                                })
                                    .catch(function (err) { return affect.set('runResult.error', err); });
                            }
                            catch (err) {
                                affect.set('runResult.error', err);
                            }
                        }
                    }, 'TEST')
                ]),
                nimble_1.h('br'),
                state.runResult.success.toString() ?
                    nimble_1.h('pre.success', [
                        state.runResult.success.toString()
                    ]) : null,
                state.runResult.error.toString() ?
                    nimble_1.h('pre.error', [
                        state.runResult.error.toString()
                    ]) : null
            ])
        ])
    ]);
});
function parsePaymentMethods(methods) {
    var retMethods = [];
    if (methods.card) {
        retMethods.push({
            supportedMethods: 'basic-card',
        });
    }
    if (methods.googlePlay) {
        retMethods.push({
            supportedMethods: 'https://google.com/pay',
            data: {
                'environment': 'TEST',
                'apiVersion': 1,
                'allowedPaymentMethods': ['CARD', 'TOKENIZED_CARD'],
                'paymentMethodTokenizationParameters': {
                    'tokenizationType': 'PAYMENT_GATEWAY',
                    // Check with your payment gateway on the parameters to pass.
                    'parameters': {}
                },
                'cardRequirements': {
                    'allowedCardNetworks': ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA'],
                    'billingAddressRequired': true,
                    'billingAddressFormat': 'MIN'
                },
                'phoneNumberRequired': true,
                'emailRequired': true,
                'shippingAddressRequired': true
            },
        });
    }
    return retMethods;
}
function makeCodePreview(settings) {
    var shippingOptionChangeHandler = settings.options.requestShipping ? "\n\nrequest.addEventListener('shippingoptionchange', (event) => {\n    const prInstance = event.target;\n\n    const selectedId = prInstance.shippingOption;\n\n    const updatedShippingOptions = paymentDetails.shippingOptions.map((option) => {\n        return Object.assign({}, option, { selected: option.id === selectedId });\n    });\n\n    const selectedShippingOption = updatedShippingOptions.find(o => o.selected);\n\n    // Update total and display items, including pending states.\n    const newTotal = Object.assign({}, paymentDetails.total);\n    newTotal.amount.value += selectedShippingOption.amount.value;\n    event.updateWith({\n        total: newTotal,\n        shippingOptions: updatedShippingOptions,\n    });\n});\n\n" : '';
    return "\nconst supportedPaymentMethods = " + JSON.stringify(parsePaymentMethods(settings.methods), null, '    ') + ";\n\nconst paymentDetails = " + JSON.stringify(settings.paymentDetails, null, '    ') + ";\n\n// Options isn't required.\nconst options = " + JSON.stringify(settings.options, null, '    ') + ";\n\nconst request = new PaymentRequest(\n    supportedPaymentMethods,\n    paymentDetails,\n    options\n);\n" + shippingOptionChangeHandler + "\n// Call when you wish to show the UI to the user.\nrequest.show()\n    .then((paymentResponse) => {\n        console.info(paymentResponse);\n        // TODO: Process payment (stripe/mastercard/etc.)\n        paymentResponse.complete();\n    })\n    .catch((err) => {\n        console.error(err);\n    });\n";
}
function makeInput(state, affect, keypath, type, placeholder, options) {
    if (options === void 0) { options = {}; }
    return nimble_1.h('input', __assign({ type: type, placeholder: placeholder, value: nimble_1.get(state, keypath), oninput: function (ev) {
            affect.set(keypath, ev.target.value);
        } }, options));
}
function inputGroup(title, inputs, wrap) {
    if (wrap === void 0) { wrap = true; }
    return nimble_1.h('tr.input-group', {
        style: wrap ? {} : {
            'overflow-x': 'scroll',
            'white-space': 'nowrap'
        }
    }, [
        nimble_1.h('td', title),
        nimble_1.h('td', inputs)
    ]);
}
function toggleButton(state, affect, keypath, label, value) {
    if (value === void 0) { value = label; }
    var toggle = value === false;
    var isSelected = nimble_1.get(state, keypath) === (toggle ? true : value);
    return nimble_1.h("button", {
        onclick: function () {
            affect.set(keypath, toggle ? !isSelected : value);
        }
    }, [isSelected ? nimble_1.h('img', { src: './res/checkbox-checked.svg' }) : nimble_1.h('img', { src: './res/checkbox.svg' }), ' ' + label]);
}
function paymentDisplayItemConfig(state, affect, baseKp) {
    return nimble_1.h('div.paymentDisplayItem', [
        inputGroup('Label:', [
            makeInput(state, affect, baseKp + ".label", 'text', 'Subtotal')
        ]),
        inputGroup('Amount:', [
            makeInput(state, affect, baseKp + ".amount.value", 'number', 'e.g. 1000')
        ]),
        inputGroup('Currency:', [
            toggleButton(state, affect, baseKp + ".amount.currency", 'USD'),
            toggleButton(state, affect, baseKp + ".amount.currency", 'GBP'),
            toggleButton(state, affect, baseKp + ".amount.currency", 'EUR'),
            toggleButton(state, affect, baseKp + ".amount.currency", 'HUF')
        ], false)
    ]);
}
function shippingOptionConfig(state, affect, baseKp) {
    return nimble_1.h('div.paymentDisplayItem', [
        inputGroup('Label:', [
            makeInput(state, affect, baseKp + ".label", 'text', 'Economy (5-7 days)')
        ]),
        inputGroup('Id:', [
            makeInput(state, affect, baseKp + ".id", 'text', 'economy')
        ]),
        inputGroup('Amount:', [
            makeInput(state, affect, baseKp + ".amount.value", 'number', 'e.g. 10')
        ]),
        inputGroup('Currency:', [
            toggleButton(state, affect, baseKp + ".amount.currency", 'USD'),
            toggleButton(state, affect, baseKp + ".amount.currency", 'GBP'),
            toggleButton(state, affect, baseKp + ".amount.currency", 'EUR'),
            toggleButton(state, affect, baseKp + ".amount.currency", 'HUF')
        ], false)
    ]);
}
