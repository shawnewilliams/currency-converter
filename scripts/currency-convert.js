const getExchangeRate = (from, to) => {
    return axios.get(`https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=y`).then((response) => {
        return response.data[`${from}_${to}`].val;
    }).catch((e) => console.log(e));
};

const getCountries = (currencyCode) => {
    return axios.get(`https://restcountries.eu/rest/v2/currency/${currencyCode}`).then((response) => {
        let index = response.data[0].currencies.findIndex(item => item.code === currencyCode);
        return ({
            currency: response.data[0].currencies[index].name,
            countries: response.data.map((country) => country.name)
        })
    }).catch((e) => console.log(e));
};

const getCurrencies = () => {
    return axios.get('--https://free.currencyconverterapi.com/api/v5/currencies').then((response) => {
        let data = response.data.results;
        let keys = Object.keys(data).sort();
        for (let item of keys) {
            addSelectOption(`${data[item].id} - ${data[item].currencyName}`, data[item].id, "select-from");
            addSelectOption(`${data[item].id} - ${data[item].currencyName}`, data[item].id, "select-to");
        }
        return data;
    }).catch((e) => console.log(e));
};

const addSelectOption = (text, value, selectID) => {
    let select = document.querySelector(`#${selectID}`)
        let option = document.createElement("option");
        option.value = value
        let textNode = document.createTextNode(text);
        option.appendChild(textNode);
        select.append(option);
};

const convertCurrency = async (from, to, amount) => {
    let countries = {};
    if (to !== "BTC"){
        countries = await getCountries(to);
    } else {
        countries = {
            countries: ["Accepted everywhere on the internet."],
            currency: "Bitcoin"
        }
    }
    let exchangedAmount = await getExchangeRate(from, to) * amount;
    exchangedAmount = parseFloat(exchangedAmount).toFixed(2);
    return ({
        amount: `${amount} ${from} is worth ${exchangedAmount} ${to}`,
        currency: `The ${countries.currency} can be used in the following countries:`,
        countries: `${countries.countries.join(', ')}`})
};

let getData = () => {
    var submit = document.querySelector('body button');
    submit.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelector('select').classList.remove("red-text");
        document.querySelector('#amount').classList.remove("red-input");
        
        changeElementID('warning', 'warning-exit');
        changeElementID('result', 'result-exit');
        
        let from = document.querySelector("#select-from").value;
        let to = document.querySelector("#select-to").value;
        let amount = parseInt(document.querySelector("#amount").value);
        let hasError = dataError(from, to, amount)
        setTimeout(() => {
            removeElement('result-exit');
            removeElement('warning-exit');
            if (hasError === false) {
                convertCurrency(from, to, amount).then((result) => {
                    let newDiv = document.createElement("div");
                    newDiv.id = 'result';
                    // add the text node to the newly created div
                    addParagraph(newDiv, result.amount);
                    addParagraph(newDiv, result.currency);
                    addParagraph(newDiv, result.countries); 
                    document.body.appendChild(newDiv);
                });
            }
        },50); 
    });
};

let addParagraph = (parent, text) => {
    let para = document.createElement("p");
    let textNode = document.createTextNode(text);
    para.appendChild(textNode);
    parent.appendChild(para);
};

let removeElement = (elementID) => {
    if(document.querySelector(`#${elementID}`)) {
        document.querySelector(`#${elementID}`).parentNode.removeChild(document.querySelector(`#${elementID}`));
    }
};

let changeElementID = (id, newId) => {
    if(document.querySelector(`#${id}`)){
        let element = document.querySelector(`#${id}`);
        element.removeAttribute(`#${id}`);
        element.id = newId;
    }
};

let warning = (message)=> {
    setTimeout(() => {
        removeElement('warning-exit')
        let newDiv = document.createElement("div");
        newDiv.id = 'warning';
        let textNode = document.createTextNode(message)
        newDiv.appendChild(textNode);  
        document.body.appendChild(newDiv);
    }, 100);
};

let shake = () => {
    changeElementID('no-shake', 'shake');
    setTimeout(() => {
        changeElementID('shake', 'no-shake');
    },250);
};

let dataError = (from, to, amount) => {
    document.querySelector('#select-from').classList.add("red-text");
    document.querySelector('#select-to').classList.add("red-text");
    document.querySelector('#amount').classList.add("red-input");
    if (from) {
        document.querySelector('#select-from').classList.remove("red-text");
    }
    if (to) {
        document.querySelector('#select-to').classList.remove("red-text");
    }
    if (amount) {
        document.querySelector('#amount').classList.remove("red-input");
    }
    if (!amount) {
        document.querySelector('#amount').value = '';
    }
    if (!from) {
        shake();
        setTimeout(()=> {
            removeElement('result-exit');
        },250);
        return warning('Please enter a type of currency.');
    } else if (!to) {
        shake();
        setTimeout(()=> {
            removeElement('result-exit');
        },250);
        return warning('Please enter a type of currency.');
    } else if (from === to) {
        shake();
        setTimeout(()=> {
            removeElement('result-exit');
        },50);
        return warning('You cannot convert to the same type of currency.');
    } else if (!amount) {
        shake();
        setTimeout(()=> {
            removeElement('result-exit');
        },50);
        return warning('Please enter an amount');
    } else {
        return false
    }
    
};

getCurrencies();
getData();
