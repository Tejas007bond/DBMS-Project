import express from 'express';
import cors from 'cors';
import { initializeDb, closeDb } from './db/index.js';
import { queryContext } from './db/queryLog.js';

// Import routes
import employeesRouter from './routes/employees.js';
import doctorsRouter from './routes/doctors.js';
import nursesRouter from './routes/nurses.js';
import pharmacistsRouter from './routes/pharmacists.js';
import patientsRouter from './routes/patients.js';
import roomsRouter from './routes/rooms.js';
import appointmentsRouter from './routes/appointments.js';
import billsRouter from './routes/bills.js';
import testReportsRouter from './routes/testReports.js';
import medicalRecordsRouter from './routes/medicalRecords.js';
import personsRouter from './routes/persons.js';
import validRouter from './routes/valid.js';
import dashboardRouter from './routes/dashboard.js';
import sqlRouter from './routes/sql.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Tag every query executed during a request with its endpoint (for the SQL log)
app.use((req, res, next) => {
  queryContext.run({ method: req.method, path: req.originalUrl }, next);
});

// Routes
app.use('/api/employees', employeesRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/nurses', nursesRouter);
app.use('/api/pharmacists', pharmacistsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/bills', billsRouter);
app.use('/api/test-reports', testReportsRouter);
app.use('/api/medical-records', medicalRecordsRouter);
app.use('/api/persons', personsRouter);
app.use('/api/valid', validRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/sql', sqlRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hospital Management System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    await initializeDb();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Hospital Management System API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});
