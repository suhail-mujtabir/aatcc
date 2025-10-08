// student.cjs (without bcrypt)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';
// const bcrypt = require('bcrypt'); // 1. REMOVED

// ... (your Supabase URL and Key) ...
// ▼▼▼ PASTE YOUR REAL VALUES HERE ▼▼▼
const SUPABASE_URL = 'https://ucnmgwqsbujyliphanms.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbm1nd3FzYnVqeWxpcGhhbm1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE2MTkzNCwiZXhwIjoyMDc0NzM3OTM0fQ.JUnLQpZdYL8YiYWzP6vs0TD74qBi2WbykTlC5lkCn20';
// ▲▲▲ PASTE YOUR REAL VALUES HERE ▲▲▲


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const uploadUsers = () => {
  console.log('Reading students.csv file...');
  fs.createReadStream('students.csv')
    .pipe(csv())
    .on('data', async (row) => {
      const email = `${row.userId}@yourschool.com`;
      const plainPassword = row.password;

      if (!email || !plainPassword) {
        console.error('Skipping row due to missing data:', row);
        return;
      }

      // 2. REMOVED HASHING LOGIC
      // const saltRounds = 10;
      // const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: plainPassword, // 3. USE THE PLAIN PASSWORD
        email_confirm: true,
      });

      if (error) {
        console.error(`Error creating user ${email}:`, error.message);
      } else {
        console.log(`Successfully created user: ${data.user.email}`);
      }
    })
    .on('end', () => {
      console.log('--- CSV file processing finished. ---');
    });
};

uploadUsers();