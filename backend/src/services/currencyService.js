const axios = require('axios');

class CurrencyService {
  static async getCountriesWithCurrencies() {
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
      return response.data.map(country => ({
        name: country.name.common,
        currencies: Object.keys(country.currencies || {})
      }));
    } catch (error) {
      throw new Error('Failed to fetch countries data');
    }
  }

  static async convertCurrency(from, to, amount) {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
      const rate = response.data.rates[to];
      if (!rate) throw new Error('Currency conversion rate not found');
      return amount * rate;
    } catch (error) {
      throw new Error('Currency conversion failed');
    }
  }
}

module.exports = CurrencyService;