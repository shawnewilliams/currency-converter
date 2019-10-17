const getExchangeRate = async (from, to) => {
    try {
        const response = await axios.get(`https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=y&apiKey=39dd7ebe2b7075bcb4d4`);
        return response.data[`${from}_${to}`].val;
    } catch (e) {
        throw new Error (`Unable to get exchange rate for ${from} and ${to}`)
    }
    
};

// const getCountries = (currencyCode) => {
//     return axios.get(`https://restcountries.eu/rest/v2/currency/${currencyCode}`).then((response) => {
//         let index = response.data[0].currencies.findIndex(item => item.code === currencyCode);
//         return ({
//             currency: response.data[0].currencies[index].name,
//             countries: response.data.map((country) => country.name)
//         })
//     }).catch((e) => console.log(e));
// };

const getCountries = async (currencyCode) => {
    try {
        const response = await axios.get(`https://restcountries.eu/rest/v2/currency/${currencyCode}`);
        let index = response.data[0].currencies.findIndex(item => item.code === currencyCode);
        return ({
            currency: response.data[0].currencies[index].name,
            countries: response.data.map((country) => country.name)
    });

    } catch(e) {
        throw new Error (`Unable to get countries with currency code ${currencyCode}`)
    }
};

// const getCurrencies = () => {
//     return axios.get('https://free.currencyconverterapi.com/api/v5/currencies').then((response) => {
//         let data = response.data.results;
//         let keys = Object.keys(data).sort();
//         for (let item of keys) {
//             addSelectOption(`${data[item].id} - ${data[item].currencyName}`, data[item].id, "select-from");
//             addSelectOption(`${data[item].id} - ${data[item].currencyName}`, data[item].id, "select-to");
//         }
//         return data;
//     }).catch((e) => console.log(e));
// };

const getCurrencies = async () => {
    try {
        const response = await axios.get('https://free.currencyconverterapi.com/api/v5/currencies?apiKey=39dd7ebe2b7075bcb4d4');
        let data = response.data.results;
        let keys = Object.keys(data).sort();
        for (let item of keys) {
            addSelectOption(`${data[item].id} - ${data[item].currencyName}`, data[item].id, "select-from");
            addSelectOption(`${data[item].id} - ${data[item].currencyName}`, data[item].id, "select-to");
        }
        return data;
    } catch (e) {
        throw new Error ('Unable to get currencies');
    }
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
        countries: `${countries.countries.join(', ')}`
    });
};

let getData = () => {
    var submit = document.querySelector('body button');
    submit.addEventListener('click', (e) => {
        e.preventDefault();

        document.querySelector('select').classList.remove("red-text");
        document.querySelector('#amount').classList.remove("red-input");
        
        changeElementID('warning', 'warning-exit');
        changeElementID('result', 'result-exit');
        removeElement('warning-exit', 50);
        removeElement('result-exit', 50);
        
        let from = document.querySelector("#select-from").value;
        let to = document.querySelector("#select-to").value;
        let amount = parseInt(document.querySelector("#amount").value);
        let hasError = dataError(from, to, amount)
        
        if (hasError === false) {
            convertCurrency(from, to, amount).then((result) => {
                let newDiv = document.createElement("div");
                newDiv.id = 'result';
                addParagraph(newDiv, result.amount);
                addParagraph(newDiv, result.currency);
                addParagraph(newDiv, result.countries); 
                document.body.appendChild(newDiv);
            });
        } else {
            warning(hasError);
        }
    });
};

let addParagraph = (parent, text) => {
    let para = document.createElement("p");
    let textNode = document.createTextNode(text);
    para.appendChild(textNode);
    parent.appendChild(para);
};

let removeElement = (elementID, delay = 0) => {
    setTimeout(() => {
        if(document.querySelector(`#${elementID}`)) {
            document.querySelector(`#${elementID}`).parentNode.removeChild(document.querySelector(`#${elementID}`));
        }
    }, delay); 
};

let changeElementID = (id, newId) => {
    if(document.querySelector(`#${id}`)){
        let element = document.querySelector(`#${id}`);
        element.removeAttribute(`#${id}`);
        element.id = newId;
    }
};

let warning = (message)=> {
    let newDiv = document.createElement("div");
    newDiv.id = 'warning';
    let textNode = document.createTextNode(message)
    newDiv.appendChild(textNode);  
    document.body.appendChild(newDiv);
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
    if (from && from !== to) {
        document.querySelector('#select-from').classList.remove("red-text");
    }
    if (to && from !== to) {
        document.querySelector('#select-to').classList.remove("red-text");
    }
    if (amount) {
        document.querySelector('#amount').classList.remove("red-input");
    }
    if (!amount) {
        document.querySelector('#amount').value = '';
    }
    if (!from || !to) {
        shake();
        return 'Please enter a type of currency.';
    } else if (from === to) {
        shake();
        return 'You cannot convert to the same type of currency.';
    } else if (!amount) {
        shake();
        return 'Please enter an amount';
    } else {
        return false
    }
};

getCurrencies().catch((e) => console.log(e));
getData()
