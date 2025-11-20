// server.js
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routes/auth.router.js';
import { errorHandler } from './middleware/errorHandler.js';
import { postRouter } from './routes/posts.router.js';
import { categoryRouter } from './routes/category.router.js';
import { tagRouter } from './routes/tag.router.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/tags', tagRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
