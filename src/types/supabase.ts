/**
 * Permissive Supabase Database type — allows any table name, any column shape.
 *
 * Replace this with proper generated types post-MVP by running:
 *   npm run supabase:types
 *
 * Until then, Supabase queries are effectively untyped at the column level,
 * but the rest of the code (DwpLevel, DwpProgress, etc.) provides type safety
 * via explicit `as DwpLevel` casts where it matters.
 */
export interface Database {
  public: {
    Tables: {
      [tableName: string]: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
        Relationships: []
      }
    }
    Views: { [viewName: string]: { Row: Record<string, any> } }
    Functions: { [fnName: string]: { Args: Record<string, any>; Returns: any } }
    Enums: { [enumName: string]: string }
    CompositeTypes: Record<string, Record<string, any>>
  }
}
