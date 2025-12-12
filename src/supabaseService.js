import { supabase } from "./supabaseClient";

// Table name for this project - unique to avoid conflicts with other websites
const TABLE_NAME = "website_content_pixelart_converter";

/**
 * ADMIN PANEL: Save content with upsert logic (Insert if new, Update if exists)
 * @param {string} slug - Content identifier (e.g., "homepage_text")
 * @param {string|object} content - Content to save (will be stringified if object)
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
/**
 * ADMIN PANEL: Save content with smart duplicate handling
 * Allows saving even if 'slug' is not unique in DB schema.
 * Cleans up duplicates by keeping only the most recent one.
 */
export async function saveContent(slug, content) {
    try {
        const contentString = typeof content === 'object' ? JSON.stringify(content) : content;
        console.log(`[Supabase] Saving content for slug: ${slug}`);

        // 1. Check for existing rows (fetch ALL to detect duplicates)
        const { data: existingRows, error: checkError } = await supabase
            .from(TABLE_NAME)
            .select("id, updated_at")
            .eq("slug", slug)
            .order('updated_at', { ascending: false });

        if (checkError) {
            console.error("Supabase Check Error:", checkError);
            return { success: false, error: checkError };
        }

        // 2. Decide Action
        if (!existingRows || existingRows.length === 0) {
            // INSERT (No rows exist)
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
            // UPDATE (Rows exist)
            // Use the ID of the most recent row (first in list due to sort)
            const targetId = existingRows[0].id;

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update({
                    content: contentString,
                    updated_at: new Date().toISOString()
                })
                .eq("id", targetId) // Update by ID to be safe
                .select();

            if (error) return { success: false, error };

            // CLEANUP: If duplicates exist, delete older ones
            if (existingRows.length > 1) {
                console.log(`[Supabase] Found ${existingRows.length} duplicates for ${slug}. Cleaning up...`);
                const idsToDelete = existingRows.slice(1).map(r => r.id);
                await supabase.from(TABLE_NAME).delete().in('id', idsToDelete);
            }

            return { success: true, data, action: 'updated' };
        }

    } catch (err) {
        console.error("Supabase Save Exception:", err);
        return { success: false, error: err };
    }
}

/**
 * FRONTEND: Load content robustly
 * Handles duplicate rows by taking the most recent one.
 */
export async function loadContent(slug, parseJSON = false, defaultContent = "") {
    try {
        // Fetch most recent row instead of using maybeSingle() which fails on duplicates
        const { data: rows, error } = await supabase
            .from(TABLE_NAME)
            .select("content")
            .eq("slug", slug)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error("Supabase Load Error:", error);
            // Don't auto-create on generic error, only if confirmed empty later
        }

        const data = rows?.[0];

        // If no data found, create default row
        if (!data) {
            console.log(`No data found for slug: ${slug}, creating default row`);
            await createDefaultRow(slug, defaultContent);
            return parseJSON ? (typeof defaultContent === 'object' ? defaultContent : null) : defaultContent;
        }

        const content = data?.content || (parseJSON ? null : "");

        if (parseJSON && content) {
            try {
                return JSON.parse(content);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                return typeof defaultContent === 'object' ? defaultContent : null;
            }
        }

        return content;
    } catch (err) {
        console.error("Supabase Load Exception:", err);
        return parseJSON ? null : "";
    }
}

/**
 * HELPER: Create a default row safely
 */
async function createDefaultRow(slug, defaultContent = "") {
    try {
        // Double check existence before inserting to avoid race conditions
        const { count } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('slug', slug);

        if (count > 0) {
            console.log(`Default row creation skipped: Content for ${slug} already exists.`);
            return { success: true };
        }

        const contentString = typeof defaultContent === 'object'
            ? JSON.stringify(defaultContent)
            : defaultContent;

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([{
                slug,
                content: contentString,
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error("Error creating default row:", error);
            return { success: false, error };
        }

        console.log(`Default row created for slug: ${slug}`);
        return { success: true, data };
    } catch (err) {
        console.error("Exception creating default row:", err);
        return { success: false, error: err };
    }
}

/**
 * ADMIN PANEL: Bulk upsert multiple content items
 * @param {Array<{slug: string, content: string|object}>} items - Array of content items
 * @returns {Promise<{success: boolean, results: Array, errors: Array}>}
 */
export async function bulkSaveContent(items) {
    const results = [];
    const errors = [];

    for (const item of items) {
        const result = await saveContent(item.slug, item.content);
        if (result.success) {
            results.push({ slug: item.slug, ...result });
        } else {
            errors.push({ slug: item.slug, error: result.error });
        }
    }

    return {
        success: errors.length === 0,
        results,
        errors
    };
}

/**
 * Get all content from Supabase
 * @returns {Promise<Array>}
 */
export async function getAllContent() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("*")
            .order("slug");

        if (error) {
            console.error("Supabase GetAll Error:", error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("Supabase GetAll Exception:", err);
        return [];
    }
}

/**
 * Delete content by slug
 * @param {string} slug - Content identifier
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function deleteContent(slug) {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("slug", slug);

        if (error) {
            console.error("Supabase Delete Error:", error);
            return { success: false, error };
        }

        console.log(`Content deleted for slug: ${slug}`);
        return { success: true };
    } catch (err) {
        console.error("Supabase Delete Exception:", err);
        return { success: false, error: err };
    }
}

/**
 * Subscribe to real-time changes for a specific slug
 * @param {string} slug - Content identifier
 * @param {function} callback - Callback function to handle updates
 * @returns {object} Subscription object with unsubscribe method
 */
export function subscribeToContent(slug, callback) {
    const subscription = supabase
        .channel(`content-${slug}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: TABLE_NAME,
                filter: `slug=eq.${slug}`
            },
            (payload) => {
                callback(payload.new);
            }
        )
        .subscribe();

    return {
        unsubscribe: () => subscription.unsubscribe()
    };
}

/**
 * Check if Supabase connection is working
 * @returns {Promise<{success: boolean, error?: any}>}
 */
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("count")
            .limit(1);

        if (error) {
            console.error("Supabase Connection Test Failed:", error);
            return { success: false, error };
        }

        console.log("Supabase connection successful");
        return { success: true };
    } catch (err) {
        console.error("Supabase Connection Exception:", err);
        return { success: false, error: err };
    }
}

// Export table name for reference
export { TABLE_NAME };

/**
 * USAGE EXAMPLES:
 * 
 * // Admin Panel - Save content (auto insert/update)
 * const result = await saveContent("homepage_text", "Hello World");
 * if (result.success) {
 *   console.log(`Content ${result.action}`); // "inserted" or "updated"
 * }
 * 
 * // Frontend - Load content with default
 * const content = await loadContent("homepage_text", false, "Default text");
 * 
 * // Frontend - Load JSON content with default object
 * const settings = await loadContent("settings", true, { theme: "dark" });
 * 
 * // Admin Panel - Bulk save
 * const items = [
 *   { slug: "header", content: "Welcome" },
 *   { slug: "footer", content: "© 2025" }
 * ];
 * const bulkResult = await bulkSaveContent(items);
 * 
 * // Test connection
 * const connectionTest = await testConnection();
 */
