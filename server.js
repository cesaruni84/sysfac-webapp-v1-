const express = require('express');
const app = express();
path = require('path');

// app.use(express.static('./dist/modfac-front-end'));

app.use(express.static('./dist/egret'));

app.listen(process.env.PORT || 8080, () => {
    console.log('Server started');
})

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/egret/index.html'));

});