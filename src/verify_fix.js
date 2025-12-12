const { createClient } = require('@supabase/supabase-js');

// Config from supabaseClient.js
const supabaseUrl = "https://deyzyxzqlsyszbmeqiqx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleXp5eHpxbHN5c3pibWVxaXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjM5MTMsImV4cCI6MjA4MDg5OTkxM30.d480g6oM_Apkcc1MT1PLSwyk668JLB3Bz4Lz7C6gYWA";
const TABLE_NAME = "website_content_pixelart_converter";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    console.log("Starting Supabase Fix Verification (updated_at)...");

    const slug = "verification_test_" + Date.now();
    const content = "Test Content";

    // 1. SAVE (Should Insert)
    console.log(`\n1. Testing SAVE (Insert) for ${slug}...`);
    const saveResult1 = await saveContent(slug, content);
    if (!saveResult1.success) {
        console.error("❌ Save 1 failed:", saveResult1.error);
        return;
    }
    console.log("✅ Save 1 successful:", saveResult1.action);

    // 2. SAVE AGAIN (Should Update)
    console.log(`\n2. Testing SAVE (Update) for ${slug}...`);
    const saveResult2 = await saveContent(slug, content + " Updated");
    if (!saveResult2.success) {
        console.error("❌ Save 2 failed:", saveResult2.error);
        return;
    }
    console.log("✅ Save 2 successful:", saveResult2.action);

    // 3. LOAD (Should get updated content)
    console.log(`\n3. Testing LOAD for ${slug}...`);
    const loadedContent = await loadContent(slug);
    if (loadedContent !== content + " Updated") {
        console.error("❌ Load failed. Expected '" + content + " Updated', got:", loadedContent);
        return;
    }
    console.log("✅ Load successful. Content verified.");

    // 4. CLEANUP (Delete test row)
    console.log(`\n4. Cleaning up...`);
    const { error: delError } = await supabase.from(TABLE_NAME).delete().eq("slug", slug);
    if (delError) console.error("⚠️ Cleanup failed:", delError);
    else console.log("✅ Cleanup successful.");

    console.log("\n🎉 ALL TESTS PASSED!");
}

// ------ COPIED LOGIC FROM FIX (using updated_at) ------

async function saveContent(slug, content) {
    try {
        const contentString = typeof content === 'object' ? JSON.stringify(content) : content;

        // 1. Check for existing rows (fetch ALL to detect duplicates)
        const { data: existingRows, error: checkError } = await supabase
            .from(TABLE_NAME)
            .select("id, updated_at")
            .eq("slug", slug)
            .order('updated_at', { ascending: false });

        if (checkError) return { success: false, error: checkError };

        // 2. Decide Action
        if (!existingRows || existingRows.length === 0) {
            // INSERT
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    slug,
                    content: contentString,
                    updated_at: new Date().toISOString()
                }])
                .select();

            if (error) return { success: false, error };
            return { success: true, data, action: 'inserted' };

        } else {
            // UPDATE
            const targetId = existingRows[0].id; // Newest

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update({
                    content: contentString,
                    updated_at: new Date().toISOString()
                })
                .eq("id", targetId)
                .select();

            if (error) return { success: false, error };

            // CLEANUP DUPLICATES
            if (existingRows.length > 1) {
                console.log(`   (Cleaning up ${existingRows.length - 1} duplicates...)`);
                const idsToDelete = existingRows.slice(1).map(r => r.id);
                await supabase.from(TABLE_NAME).delete().in('id', idsToDelete);
            }

            return { success: true, data, action: 'updated' };
        }
    } catch (err) {
        return { success: false, error: err };
    }
}

async function loadContent(slug) {
    try {
        const { data: rows, error } = await supabase
            .from(TABLE_NAME)
            .select("content")
            .eq("slug", slug)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error || !rows || rows.length === 0) return null;
        return rows[0].content;
    } catch (err) {
        return null;
    }
}

runTest();
