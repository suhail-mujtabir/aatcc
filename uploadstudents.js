// uploadStudents.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// ▼▼▼ PASTE YOUR REAL VALUES HERE ▼▼▼
const SUPABASE_URL = 'https://ucnmgwqsbujyliphanms.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbm1nd3FzYnVqeWxpcGhhbm1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE2MTkzNCwiZXhwIjoyMDc0NzM3OTM0fQ.JUnLQpZdYL8YiYWzP6vs0TD74qBi2WbykTlC5lkCn20';
// ▲▲▲ PASTE YOUR REAL VALUES HERE ▲▲▲

// Initialize the admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// This function reads the CSV and creates users
const uploadUsers = () => {
  console.log('Reading students.csv file...');
  fs.createReadStream('students.csv')
    .pipe(csv())
    .on('data', async (row) => {
      // Supabase Auth requires an email, so we create one from the student_id
      const email = `${row.student_id}@yourschool.com`;
      const password = row.password;

      if (!email || !password) {
        console.error('Skipping row due to missing data:', row);
        return;
      }

      // Use the admin client to create a new user
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Automatically confirms the user's email
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

// Run the function
uploadUsers();