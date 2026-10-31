const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 1. Supabase Credentials (Apne project ki details yahan dalein)
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Yeh anon/public key hai, service_role key kabhi use mat karna!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Login Function (Patient ya Doctor ke liye)
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('❌ Login Failed:', error.message);
        return null;
    } else {
        console.log('✅ Login Successful! User ID:', data.user.id);
        return data.session;
    }
}

// 3. Upload Medical Record to Private Bucket
// RLS Policy ke mutabiq file path hamesha patient_id se shuru hona chahiye: `${patient_id}/filename.pdf`
async function uploadMedicalRecord(patientId, localFilePath, recordTitle) {
    try {
        const fileBuffer = fs.readFileSync(localFilePath);
        const fileName = `${Date.now()}_report.pdf`;
        const storagePath = `${patientId}/${fileName}`;

        // Step A: Upload file to 'medical-records' private bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('medical-records')
            .upload(storagePath, fileBuffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Storage Upload Error:', uploadError.message);
            return;
        }

        console.log('✅ File uploaded to bucket:', uploadData.path);

        // Step B: Insert metadata into 'medical_records' table
        const { error: dbError } = await supabase
            .from('medical_records')
            .insert([
                { 
                    patient_id: patientId, 
                    title: recordTitle, 
                    file_path: uploadData.path 
                }
            ]);

        if (dbError) {
            console.error('❌ Database Record Error:', dbError.message);
        } else {
            console.log('✅ Medical record metadata saved successfully in DB!');
        }

    } catch (err) {
        console.error('❌ Error reading local file:', err.message);
    }
}

// 4. Revoke Consent using our secure Postgres Function
async function revokeDoctorConsent(consentId) {
    const { data, error } = await supabase.rpc('revoke_my_consent', {
        p_consent_id: consentId
    });

    if (error) {
        console.error('❌ Error revoking consent:', error.message);
    } else {
        console.log('✅ Consent revocation status:', data);
    }
}

// --- EXAMPLE EXECUTION FLOW ---
async function runDemo() {
    console.log('🔄 Connecting to MediLock Supabase...');
    
    // Test login as Rahul (Patient)
    // const session = await loginUser('chotabheem@gmail.com', 'your_password');
    
    // If logged in, you can call:
    // await uploadMedicalRecord('04b818c1-f03c-4b03-b9bb-b7649c36531f', './sample.pdf', 'X-Ray Report');
}

// runDemo();