import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { requestLogger } from './middlewares/request-logger.middleware';
import { requestId } from './middlewares/request-id.middleware';
import { errorHandler } from './middlewares/error-handler.middleware';
import routes from './routes/index.route';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging

app.use(requestId);
app.use(morgan('dev'));
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Route Not Found',
  });
});

export default app;
