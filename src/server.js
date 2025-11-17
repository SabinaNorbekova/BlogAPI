// server.js
import 'dotenv/config';
import express from 'express';
import { authRouter } from './routers/auth.router.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
// app.use("/api/posts", postRouter); // Keyin qo'shiladi
// app.use("/api/authors", authorRouter);
// app.use("/api/categories", categoryRouter);
// app.use("/api/tags", tagRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
