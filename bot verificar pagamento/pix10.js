// exemplo.js
const axios = require('axios');

const token = 'SeuAccessTokenAqui';

axios.get('https://api.exemplo.com/recurso', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => {
    // Manipular a resposta bem-sucedida
    console.log(response.data);
  })
  .catch(error => {
    // Manipular erros, incluindo respostas não autorizadas (401)
    console.error(error);
  });