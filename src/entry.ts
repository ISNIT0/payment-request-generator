import * as hljs from 'highlightjs';
import { h, makeRenderLoop, get } from 'nimble';
type VNode = any;

const target = <HTMLElement>document.getElementById('frame');

const affect = makeRenderLoop(target, {
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
},
    function (state, affect, changes) {
        const renderedCode = hljs.highlightAuto(makeCodePreview(state.paymentOptions));
        function onrender(el: HTMLElement) {
            el.innerHTML = renderedCode.value;
        }
        const displayItems = state.paymentOptions.paymentDetails.displayItems || [];
        const shippingOptions = state.paymentOptions.paymentDetails.shippingOptions || [];
        return h('div.app', [
            h('div.code-preview', [
                h('pre', [
                    h('code.javascript', {
                        oncreate: onrender,
                        onupdate: onrender
                    }, [Date.now()])
                ])
            ]),
            h('div.designer', [
                h('table', [
                    h('div', [
                        inputGroup('Item Name:', [
                            makeInput(state, affect, 'paymentOptions.paymentDetails.title', 'text', 'e.g. MacBook Pro')
                        ]),
                    ]),

                    h('div', [
                        h('strong', 'Total:')
                    ]),
                    paymentDisplayItemConfig(state, affect, 'paymentOptions.paymentDetails.total'),

                    h('div', [
                        h('strong', ['Breakdown:'])
                    ]),
                    ...displayItems.map((_, index) => {
                        return paymentDisplayItemConfig(state, affect, `paymentOptions.paymentDetails.displayItems.${index}`);
                    }),
                    h('tr', [
                        h('td', {
                            colspan: 2
                        }, [
                                h('button', {
                                    onclick() {
                                        affect.push('paymentOptions.paymentDetails.displayItems', {
                                            label: 'Discount (10%)',
                                            amount: {
                                                currency: 'USD',
                                                value: -1,
                                            },
                                        });
                                    }
                                }, 'add item'),
                                displayItems.length ? h('button.red', {
                                    onclick() {
                                        affect.delete(`paymentOptions.paymentDetails.displayItems.${displayItems.length - 1}`);
                                    }
                                }, 'remove item') : null
                            ])
                    ]),

                    h('div', [
                        h('strong', ['Other Payment Details:'])
                    ]),
                    h('div.paymentDisplayItem', [
                        inputGroup('User Info:', [
                            toggleButton(state, affect, `paymentOptions.options.requestPayerName`, 'Name', false),
                            toggleButton(state, affect, `paymentOptions.options.requestPayerPhone`, 'Phone', false),
                            toggleButton(state, affect, `paymentOptions.options.requestPayerEmail`, 'Email', false),
                        ]),
                        inputGroup('Payment Methods:', [
                            toggleButton(state, affect, `paymentOptions.methods.card`, 'Card', false),
                            toggleButton(state, affect, `paymentOptions.methods.googlePlay`, 'Custom', false)
                        ])
                    ]),

                    h('div', [
                        h('strong', ['Shipping:'])
                    ]),
                    h('div', [
                        inputGroup('Address:', [
                            toggleButton(state, affect, `paymentOptions.options.requestShipping`, 'Require', false),
                        ]),
                        ...(state.paymentOptions.options.requestShipping ? [
                            inputGroup('Shipping Type:', [
                                toggleButton(state, affect, `paymentOptions.options.shippingType`, 'Delivery', 'delivery'),
                                toggleButton(state, affect, `paymentOptions.options.shippingType`, 'Pickup', 'pickup'),
                            ]),
                            h('strong', ['Shipping Options:']),
                            ...shippingOptions.map((_, index) => {
                                return shippingOptionConfig(state, affect, `paymentOptions.paymentDetails.shippingOptions.${index}`);
                            }),
                            h('tr', [
                                h('td', {
                                    colspan: 2
                                }, [
                                        h('button', {
                                            onclick() {
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
                                        shippingOptions.length ? h('button.red', {
                                            onclick() {
                                                affect.delete(`paymentOptions.paymentDetails.shippingOptions.${shippingOptions.length - 1}`);
                                            }
                                        }, 'remove item') : null
                                    ])
                            ]),
                        ] : [])
                    ]),
                ]),
                h('div', [
                    h('br'),
                    h('div.center', [
                        h('button.purple.big', {
                            onclick() {
                                try {
                                    const request = new PaymentRequest(
                                        parsePaymentMethods(state.paymentOptions.methods),
                                        <any>state.paymentOptions.paymentDetails,
                                        state.paymentOptions.options
                                    );

                                    request.addEventListener('shippingoptionchange', (event: any) => {
                                        const prInstance: any = event.target;

                                        const selectedId = prInstance.shippingOption;

                                        // Step 3: Mark selected option
                                        const updatedShippingOptions = state.paymentOptions.paymentDetails.shippingOptions.map((option: any) => {
                                            return Object.assign({}, option, { selected: option.id === selectedId });
                                        });

                                        const selectedShippingOption = updatedShippingOptions.find(o => o.selected);

                                        // TODO: Update total and display items, including pending states.
                                        const newTotal = Object.assign({}, state.paymentOptions.paymentDetails.total);
                                        newTotal.amount.value += selectedShippingOption.amount.value;
                                        event.updateWith({
                                            total: newTotal,
                                            shippingOptions: updatedShippingOptions,
                                        });
                                    });

                                    request.show()
                                        .then((paymentResponse: PaymentResponse) => {
                                            affect.set('runResult.success', JSON.stringify(paymentResponse, null, '\t'));
                                            paymentResponse.complete();
                                        })
                                        .catch((err: any) => affect.set('runResult.error', err));
                                } catch (err) {
                                    affect.set('runResult.error', err);
                                }
                            }
                        }, 'TEST')
                    ]),
                    h('br'),
                    state.runResult.success.toString() ?
                        h('pre.success', [
                            state.runResult.success.toString()
                        ]) : null,
                    state.runResult.error.toString() ?
                        h('pre.error', [
                            state.runResult.error.toString()
                        ]) : null
                ])
            ])
        ])
    }
);

function parsePaymentMethods(methods: any) {
    const retMethods = [];
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

function makeCodePreview(settings: any) {
    const shippingOptionChangeHandler = settings.options.requestShipping ? `

request.addEventListener('shippingoptionchange', (event) => {
    const prInstance = event.target;

    const selectedId = prInstance.shippingOption;

    const updatedShippingOptions = paymentDetails.shippingOptions.map((option) => {
        return Object.assign({}, option, { selected: option.id === selectedId });
    });

    const selectedShippingOption = updatedShippingOptions.find(o => o.selected);

    // Update total and display items, including pending states.
    const newTotal = Object.assign({}, paymentDetails.total);
    newTotal.amount.value += selectedShippingOption.amount.value;
    event.updateWith({
        total: newTotal,
        shippingOptions: updatedShippingOptions,
    });
});

` : '';
    return `
const supportedPaymentMethods = ${JSON.stringify(parsePaymentMethods(settings.methods), null, '    ')};

const paymentDetails = ${JSON.stringify(settings.paymentDetails, null, '    ')};

// Options isn't required.
const options = ${JSON.stringify(settings.options, null, '    ')};

const request = new PaymentRequest(
    supportedPaymentMethods,
    paymentDetails,
    options
);
${shippingOptionChangeHandler}
// Call when you wish to show the UI to the user.
request.show()
    .then((paymentResponse) => {
        console.info(paymentResponse);
        // TODO: Process payment (stripe/mastercard/etc.)
        paymentResponse.complete();
    })
    .catch((err) => {
        console.error(err);
    });
`;
}


function makeInput(state: any, affect: Affect, keypath: string, type: string, placeholder: string, options: any = {}) {
    return h('input', {
        type: type,
        placeholder: placeholder,
        value: get(state, keypath),
        oninput(ev: any) {
            affect.set(keypath, ev.target.value);
        },
        ...options
    });
}

function inputGroup(title: string, inputs: VNode[], wrap = true) {
    return h('tr.input-group', {
        style: wrap ? {} : {
            'overflow-x': 'scroll',
            'white-space': 'nowrap'
        }
    }, [
            h('td', title),
            h('td', inputs)
        ]);
}

function toggleButton(state: any, affect: Affect, keypath: string, label: string, value: string | boolean = label) {
    const toggle = value === false;
    const isSelected = get(state, keypath) === (toggle ? true : value);
    return h(`button`, {
        onclick() {
            affect.set(keypath, toggle ? !isSelected : value);
        }
    }, [isSelected ? h('img', { src: './res/checkbox-checked.svg' }) : h('img', { src: './res/checkbox.svg' }), ' ' + label])
}

function paymentDisplayItemConfig(state: any, affect: Affect, baseKp: string) {
    return h('div.paymentDisplayItem', [
        inputGroup('Label:', [
            makeInput(state, affect, `${baseKp}.label`, 'text', 'Subtotal')
        ]),
        inputGroup('Amount:', [
            makeInput(state, affect, `${baseKp}.amount.value`, 'number', 'e.g. 1000')
        ]),
        inputGroup('Currency:', [
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'USD'),
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'GBP'),
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'EUR'),
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'HUF')
        ], false)
    ]);
}

function shippingOptionConfig(state: any, affect: Affect, baseKp: string) {
    return h('div.paymentDisplayItem', [
        inputGroup('Label:', [
            makeInput(state, affect, `${baseKp}.label`, 'text', 'Economy (5-7 days)')
        ]),
        inputGroup('Id:', [
            makeInput(state, affect, `${baseKp}.id`, 'text', 'economy')
        ]),
        inputGroup('Amount:', [
            makeInput(state, affect, `${baseKp}.amount.value`, 'number', 'e.g. 10')
        ]),
        inputGroup('Currency:', [
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'USD'),
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'GBP'),
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'EUR'),
            toggleButton(state, affect, `${baseKp}.amount.currency`, 'HUF')
        ], false)
    ]);
}