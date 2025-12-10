import { supabase } from "./supabaseClient";

// Table name for this project - unique to avoid conflicts with other websites
const TABLE_NAME = "website_content_pixelart_converter";

/**
 * ADMIN PANEL: Save content with upsert logic (Insert if new, Update if exists)
 * @param {string} slug - Content identifier (e.g., "homepage_text")
 * @param {string|object} content - Content to save (will be stringified if object)
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export async function saveContent(slug, content) {
    try {
        // Convert content to string if it's an object
        const contentString = typeof content === 'object' ? JSON.stringify(content) : content;

        // Step 1: Check if slug exists
        const { data: existingRow, error: checkError } = await supabase
            .from(TABLE_NAME)
            .select("id")
            .eq("slug", slug)
            .maybeSingle(); // Use maybeSingle() to avoid error if no row exists

        if (checkError) {
            console.error("Supabase Check Error:", checkError);
            return { success: false, error: checkError };
        }

        let result;

        if (existingRow) {
            // Step 2a: Row exists → UPDATE
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update({
                    content: contentString,
                    updated_at: new Date().toISOString()
                })
                .eq("slug", slug)
                .select();

            if (error) {
                console.error("Supabase Update Error:", error);
                return { success: false, error };
            }

            result = { success: true, data, action: 'updated' };
        } else {
            // Step 2b: Row does not exist → INSERT
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([{
                    slug,
                    content: contentString,
                    updated_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                console.error("Supabase Insert Error:", error);
                return { success: false, error };
            }

            result = { success: true, data, action: 'inserted' };
        }

        console.log(`Content ${result.action} successfully for slug: ${slug}`);
        return result;

    } catch (err) {
        console.error("Supabase Save Exception:", err);
        return { success: false, error: err };
    }
}

/**
 * FRONTEND: Load content from Supabase with automatic default row creation
 * @param {string} slug - Content identifier (e.g., "homepage_text")
 * @param {boolean} parseJSON - Whether to parse content as JSON (default: false)
 * @param {string|object} defaultContent - Default content if row doesn't exist
 * @returns {Promise<string|object|null>}
 */
export async function loadContent(slug, parseJSON = false, defaultContent = "") {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select("content")
            .eq("slug", slug)
            .maybeSingle(); // Use maybeSingle() to avoid error if no row exists

        if (error) {
            console.error("Supabase Load Error:", error);

            // If error is "no rows returned", create default row
            if (error.code === 'PGRST116' || !data) {
                console.log(`Creating default row for slug: ${slug}`);
                await createDefaultRow(slug, defaultContent);
                return parseJSON ? (typeof defaultContent === 'object' ? defaultContent : null) : defaultContent;
            }

            return parseJSON ? null : "";
        }

        // If no data found, create default row
        if (!data) {
            console.log(`No data found for slug: ${slug}, creating default row`);
            await createDefaultRow(slug, defaultContent);
            return parseJSON ? (typeof defaultContent === 'object' ? defaultContent : null) : defaultContent;
        }

        const content = data?.content || (parseJSON ? null : "");

        // Parse JSON if requested and content exists
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
 * HELPER: Create a default row if it doesn't exist
 * @param {string} slug - Content identifier
 * @param {string|object} defaultContent - Default content value
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async function createDefaultRow(slug, defaultContent = "") {
    try {
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
