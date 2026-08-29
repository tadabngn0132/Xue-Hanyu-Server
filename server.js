import express from 'express';

// Routes
import { wordRoutes } from './src/routes/index.js';

const app = express();
app.use(express.json());
app.use('/api', wordRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000. Try accessing http://localhost:3000 in your browser.');
});
