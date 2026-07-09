import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { getAdminUser, hasPermission } from "@/lib/admin-auth";

export interface AuditLogEntry {
  user_id: string;
  staff_id: string;
  action: "create" | "update" | "delete";
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}

/**
 * Log an admin action for audit purposes
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  const supabase = await createClient();
  const headersList = await headers();
  
  const ipAddress = headersList.get("x-forwarded-for") || 
                    headersList.get("x-real-ip") || 
                    "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    await supabase.rpc("log_audit_action", {
      p_user_id: entry.user_id,
      p_staff_id: entry.staff_id,
      p_action: entry.action,
      p_table_name: entry.table_name,
      p_record_id: entry.record_id || null,
      p_old_values: entry.old_values || null,
      p_new_values: entry.new_values || null,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });
  } catch (error) {
    // Log to console if database logging fails
    console.error("Failed to log audit action:", error);
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getAuditLogsForUser(userId: string, limit = 50) {
  const adminUser = await getAdminUser();
  
  // Only allow users with can_manage_permissions to view audit logs
  if (!adminUser || !(await hasPermission("can_manage_permissions"))) {
    throw new Error("Unauthorized: You do not have permission to view audit logs");
  }

  const supabase = await createClient();
  
  // Use service role to bypass RLS for audit logs
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }

  return data;
}

/**
 * Get audit logs for a specific table
 */
export async function getAuditLogsForTable(tableName: string, limit = 50) {
  const adminUser = await getAdminUser();
  
  // Only allow users with can_manage_permissions to view audit logs
  if (!adminUser || !(await hasPermission("can_manage_permissions"))) {
    throw new Error("Unauthorized: You do not have permission to view audit logs");
  }

  const supabase = await createClient();
  
  // Use service role to bypass RLS for audit logs
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("table_name", tableName)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }

  return data;
}
