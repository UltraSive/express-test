const express = require('express');

const app = express();
const port = 3000;

// Parse JSON bodies for this app.
app.use(express.json());

// MongoDB connection URI with credentials
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
