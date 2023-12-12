const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const userRouter = require('./backend/user');
const bookRouter = require('./backend/book');
const searchRouter = require('./backend/search_book');
const chapterRouter = require('./backend/chapter');
const pageRouter = require('./backend/page');
const adminRouter = require('./backend/admin');

app.use(cors());

app.use('/user', userRouter);

app.use('/book', bookRouter);

app.use('/search', searchRouter);

app.use('/chapter', chapterRouter);

app.use('/page', pageRouter);

app.use('/admin', adminRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
