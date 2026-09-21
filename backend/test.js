import { initializeDb, getDb, closeDb, saveDb } from './db/index.js';

async function test() {
  try {
    console.log('Initializing database...');
    await initializeDb();
    
    const db = await getDb();
    
    console.log('Testing database queries...');
    
    const patients = db.exec('SELECT COUNT(*) as count FROM PATIENT');
    console.log('Patients:', patients[0].values[0][0]);
    
    const doctors = db.exec('SELECT COUNT(*) as count FROM DOCTOR');
    console.log('Doctors:', doctors[0].values[0][0]);
    
    const nurses = db.exec('SELECT COUNT(*) as count FROM NURSE');
    console.log('Nurses:', nurses[0].values[0][0]);
    
    const pharmacists = db.exec('SELECT COUNT(*) as count FROM PHARMACIST');
    console.log('Pharmacists:', pharmacists[0].values[0][0]);
    
    const rooms = db.exec('SELECT COUNT(*) as count FROM ROOMS');
    console.log('Rooms:', rooms[0].values[0][0]);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    closeDb();
  }
}

test();
