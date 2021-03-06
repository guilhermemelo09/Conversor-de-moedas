/*
  - Construa uma aplicação de conversão de moedas. O HTML e CSS são os que você
    está vendo no browser;
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/

const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

const showAlert = err =>{
  const div = document.createElement('div');
  const button = document.createElement('button')

  div.textContent = err.message
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
  div.setAttribute('role', 'alert')
  button.classList.add('btn-close')
  button.setAttribute('type', 'button')
  button.setAttribute('arial-label', 'close')

  button.addEventListener('click', ()=>{
    div.remove()
  })

  div.appendChild(button)
  currenciesEl.insertAdjacentElement('afterEnd', div)
}

const state = (() =>{  
  let exchangeRate = {}
  
  return {
    getExchangeRate:()=>exchangeRate,//estou declarando um método
    setExchangeRate: newExchangeRate=>{
      
      if (!newExchangeRate.conversion_rates){
        showAlert({message: 'O objeto precisa ...'})
        return
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})() //IIFE - função auto executável


const getUrl =  currency =>`https://v6.exchangerate-api.com/v6/94ed738b2e93a818a3e72318/latest/${currency}`;

const getErrormessage = errorType => ({
  "unsupported-code": "if we don't support the supplied currency code.",
  "malformed-request": "when some part of your request doesn't follow the structure shown above.",
  "invalid-key": "when your API key is not valid.",
  "inactive-account": "if your email address wasn't confirmed.",
  "quota-reached": "when your account has reached the the number of requests allowed by your plan."
})[errorType]|| 'Não foi possível obter as informações'



const fetchExchangeRate = async url => { //estou dizendo que essa é uma função assíncrona
  try{
    const response = await fetch(url);

    if (!response.ok){
      throw new Error ('Sua conexão falhou.Não foi possível obter as informações')
    }
    const exchangeRateData = await response.json();

    if (exchangeRateData.result === 'error'){
      throw new Error (getErrormessage(exchangeRateData['error-type']));
    }

    return exchangeRateData
  
  
  }catch(err){
    showAlert(err)
  }
}
const showInitialInfo = ({conversion_rates}) =>{
  const getOptions = selectedCurrency =>Object.keys (conversion_rates)
  .map(currency => `<option ${currency === selectedCurrency ? 'selected':''}>${currency}</option>`)
  .join('')
  
  
  currencyOneEl.innerHTML = getOptions('USD')
  currencyTwoEl.innerHTML = getOptions('BRL')

  convertedValueEl.textContent = conversion_rates.BRL.toFixed(2)
  valuePrecisionEl.textContent = `1 USD = ${conversion_rates.BRL} BRL`
}
const init = async() =>{

  const exchangeRate = state.setExchangeRate(await fetchExchangeRate(getUrl('USD')))
    
  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitialInfo(exchangeRate)
  }
  


}

const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]

  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2);
}

const showUpdatedRates = ({conversion_rates}) => {
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1*conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
}
//adicionar um listener nessa referência e que ela recebe uma função como segundo argumento
timesCurrencyOneEl.addEventListener('input',() => {
  const { conversion_rates } = state.getExchangeRate()
  
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates);
} )

currencyTwoEl.addEventListener('input',() => {
  const exchangeRate = state.getExchangeRate()
  showUpdatedRates(exchangeRate)
})

currencyOneEl.addEventListener('input', async e =>{
  const url = getUrl(e.target.value)
  const newExchangeRate = await fetchExchangeRate(url)
  const exchangeRate = state.setExchangeRate(newExchangeRate)
  
  showUpdatedRates(exchangeRate)
} )
init()







