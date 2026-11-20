export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["catalogue_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalogue_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalogue_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          area: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean
          phone: string
          postal_code: string | null
          recipient_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          area?: string | null
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          phone: string
          postal_code?: string | null
          recipient_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          area?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          phone?: string
          postal_code?: string | null
          recipient_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          full_name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          code: string
          coverage_description: string | null
          created_at: string
          delivery_charge_bdt: number | null
          id: string
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          coverage_description?: string | null
          created_at?: string
          delivery_charge_bdt?: number | null
          id?: string
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          coverage_description?: string | null
          created_at?: string
          delivery_charge_bdt?: number | null
          id?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          order_id: string | null
          product_id: string
          quantity_on_hand_delta: number
          quantity_reserved_delta: number
          reason: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          order_id?: string | null
          product_id: string
          quantity_on_hand_delta?: number
          quantity_reserved_delta?: number
          reason: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          order_id?: string | null
          product_id?: string
          quantity_on_hand_delta?: number
          quantity_reserved_delta?: number
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string | null
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status?: string | null
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total_bdt: number
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot: string | null
          unit_price_bdt: number
          variant_id: string | null
          variant_name_snapshot: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_bdt: number
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          quantity: number
          sku_snapshot?: string | null
          unit_price_bdt: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          line_total_bdt?: number
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          quantity?: number
          sku_snapshot?: string | null
          unit_price_bdt?: number
          variant_id?: string | null
          variant_name_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_note: string | null
          customer_phone: string
          customer_user_id: string | null
          delivery_address_line_1: string
          delivery_address_line_2: string | null
          delivery_area: string | null
          delivery_charge_bdt: number
          delivery_city: string
          delivery_postal_code: string | null
          delivery_zone_id: string
          delivery_zone_name_snapshot: string
          fulfilment_status: Database["public"]["Enums"]["fulfilment_status"]
          id: string
          idempotency_key: string
          order_access_token_hash: string
          order_number: string
          payment_preference: Database["public"]["Enums"]["checkout_payment_preference"] | null
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          request_fingerprint: string
          stock_status: Database["public"]["Enums"]["stock_status"]
          subtotal_bdt: number
          total_bdt: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_note?: string | null
          customer_phone: string
          customer_user_id?: string | null
          delivery_address_line_1: string
          delivery_address_line_2?: string | null
          delivery_area?: string | null
          delivery_charge_bdt: number
          delivery_city: string
          delivery_postal_code?: string | null
          delivery_zone_id: string
          delivery_zone_name_snapshot: string
          fulfilment_status?: Database["public"]["Enums"]["fulfilment_status"]
          id?: string
          idempotency_key: string
          order_access_token_hash: string
          order_number: string
          payment_preference?: Database["public"]["Enums"]["checkout_payment_preference"] | null
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          request_fingerprint: string
          stock_status?: Database["public"]["Enums"]["stock_status"]
          subtotal_bdt: number
          total_bdt: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_note?: string | null
          customer_phone?: string
          customer_user_id?: string | null
          delivery_address_line_1?: string
          delivery_address_line_2?: string | null
          delivery_area?: string | null
          delivery_charge_bdt?: number
          delivery_city?: string
          delivery_postal_code?: string | null
          delivery_zone_id?: string
          delivery_zone_name_snapshot?: string
          fulfilment_status?: Database["public"]["Enums"]["fulfilment_status"]
          id?: string
          idempotency_key?: string
          order_access_token_hash?: string
          order_number?: string
          payment_preference?: Database["public"]["Enums"]["checkout_payment_preference"] | null
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          request_fingerprint?: string
          stock_status?: Database["public"]["Enums"]["stock_status"]
          subtotal_bdt?: number
          total_bdt?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reviews: {
        Row: {
          id: string
          order_id: string
          customer_user_id: string | null
          reviewer_display_name: string | null
          rating: number
          review_text: string | null
          status: "pending" | "approved" | "rejected"
          moderator_user_id: string | null
          moderated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_user_id?: string | null
          reviewer_display_name?: string | null
          rating: number
          review_text?: string | null
          status?: "pending" | "approved" | "rejected"
          moderator_user_id?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          customer_user_id?: string | null
          reviewer_display_name?: string | null
          rating?: number
          review_text?: string | null
          status?: "pending" | "approved" | "rejected"
          moderator_user_id?: string | null
          moderated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_telegram_notifications: {
        Row: {
          id: string
          order_id: string
          status: "sending" | "sent" | "failed"
          sent_at: string | null
          failure_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status?: "sending" | "sent" | "failed"
          sent_at?: string | null
          failure_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: "sending" | "sent" | "failed"
          sent_at?: string | null
          failure_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_telegram_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["payment_event_type"]
          id: string
          note: string | null
          payment_submission_id: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["payment_event_type"]
          id?: string
          note?: string | null
          payment_submission_id: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["payment_event_type"]
          id?: string
          note?: string | null
          payment_submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_submission_id_fkey"
            columns: ["payment_submission_id"]
            isOneToOne: false
            referencedRelation: "payment_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_method_settings: {
        Row: {
          customer_instructions: string | null
          is_enabled: boolean
          method: Database["public"]["Enums"]["payment_method"]
          receiving_number: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          customer_instructions?: string | null
          is_enabled?: boolean
          method: Database["public"]["Enums"]["payment_method"]
          receiving_number?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          customer_instructions?: string | null
          is_enabled?: boolean
          method?: Database["public"]["Enums"]["payment_method"]
          receiving_number?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          amount_bdt: number
          id: string
          idempotency_key: string
          method: Database["public"]["Enums"]["payment_method"]
          normalized_reference: string | null
          order_id: string
          rejection_reason: string | null
          sender_phone: string
          status: Database["public"]["Enums"]["payment_submission_status"]
          submitted_at: string
          transaction_reference: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount_bdt: number
          id?: string
          idempotency_key: string
          method: Database["public"]["Enums"]["payment_method"]
          normalized_reference?: string | null
          order_id: string
          rejection_reason?: string | null
          sender_phone: string
          status?: Database["public"]["Enums"]["payment_submission_status"]
          submitted_at?: string
          transaction_reference: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount_bdt?: number
          id?: string
          idempotency_key?: string
          method?: Database["public"]["Enums"]["payment_method"]
          normalized_reference?: string | null
          order_id?: string
          rejection_reason?: string | null
          sender_phone?: string
          status?: Database["public"]["Enums"]["payment_submission_status"]
          submitted_at?: string
          transaction_reference?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text: string
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          low_stock_threshold: number | null
          product_id: string
          quantity_on_hand: number | null
          quantity_reserved: number
          tracking_mode: Database["public"]["Enums"]["stock_tracking_mode"]
          updated_at: string
        }
        Insert: {
          low_stock_threshold?: number | null
          product_id: string
          quantity_on_hand?: number | null
          quantity_reserved?: number
          tracking_mode?: Database["public"]["Enums"]["stock_tracking_mode"]
          updated_at?: string
        }
        Update: {
          low_stock_threshold?: number | null
          product_id?: string
          quantity_on_hand?: number | null
          quantity_reserved?: number
          tracking_mode?: Database["public"]["Enums"]["stock_tracking_mode"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string
          id: string
          label: string
          product_id: string
          sort_order: number
          unit: string | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          product_id: string
          sort_order?: number
          unit?: string | null
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          product_id?: string
          sort_order?: number
          unit?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          option_values: Json
          price_override_bdt: number | null
          product_id: string
          sku: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          option_values?: Json
          price_override_bdt?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          option_values?: Json
          price_override_bdt?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          orderable: boolean
          price_bdt: number | null
          public_availability: Database["public"]["Enums"]["public_availability_status"]
          published_at: string | null
          search_document: unknown
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["catalogue_status"]
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          orderable?: boolean
          price_bdt?: number | null
          public_availability?: Database["public"]["Enums"]["public_availability_status"]
          published_at?: string | null
          search_document?: unknown
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalogue_status"]
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          orderable?: boolean
          price_bdt?: number | null
          public_availability?: Database["public"]["Enums"]["public_availability_status"]
          published_at?: string | null
          search_document?: unknown
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["catalogue_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_windows: {
        Row: {
          identifier_hash: string
          request_count: number
          scope: string
          updated_at: string
          window_started_at: string
        }
        Insert: {
          identifier_hash: string
          request_count: number
          scope: string
          updated_at?: string
          window_started_at: string
        }
        Update: {
          identifier_hash?: string
          request_count?: number
          scope?: string
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      stock_reservations: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          order_id: string
          order_item_id: string
          product_id: string
          quantity: number
          released_at: string | null
          status: Database["public"]["Enums"]["reservation_status"]
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id: string
          order_item_id: string
          product_id: string
          quantity: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string
          order_item_id?: string
          product_id?: string
          quantity?: number
          released_at?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          checkout_enabled: boolean
          reservation_ttl_minutes: number | null
          singleton: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          checkout_enabled?: boolean
          reservation_ttl_minutes?: number | null
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          checkout_enabled?: boolean
          reservation_ttl_minutes?: number | null
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      catalog_categories: {
        Row: {
          description: string | null
          id: string | null
          name: string | null
          parent_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_product_images: {
        Row: {
          alt_text: string | null
          id: string | null
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
          storage_path: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_product_specifications: {
        Row: {
          id: string | null
          label: string | null
          product_id: string | null
          sort_order: number | null
          unit: string | null
          value: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_product_variants: {
        Row: {
          id: string | null
          name: string | null
          option_values: Json | null
          price_override_bdt: number | null
          product_id: string | null
          sku: string | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          brand: string | null
          category_id: string | null
          description: string | null
          id: string | null
          name: string | null
          orderable: boolean | null
          price_bdt: number | null
          public_availability:
            | Database["public"]["Enums"]["public_availability_status"]
            | null
          published_at: string | null
          short_description: string | null
          sku: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      adjust_inventory: {
        Args: {
          p_product_id: string
          p_quantity_delta: number
          p_reason: string
        }
        Returns: undefined
      }
      cancel_order_and_release_reservations: {
        Args: { p_order_id: string; p_reason: string }
        Returns: undefined
      }
      configure_inventory_tracking: {
        Args: {
          p_low_stock_threshold: number
          p_product_id: string
          p_quantity_on_hand: number
          p_reason: string
          p_tracking_mode: Database["public"]["Enums"]["stock_tracking_mode"]
        }
        Returns: undefined
      }
      confirm_order_stock: {
        Args: { p_available: boolean; p_note: string; p_order_id: string }
        Returns: undefined
      }
      consume_rate_limit: {
        Args: {
          p_identifier_hash: string
          p_max_requests: number
          p_scope: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      count_catalog_products: {
        Args: {
          p_category_slug?: string
          p_max_price_bdt?: number
          p_min_price_bdt?: number
          p_query?: string
        }
        Returns: number
      }
      create_checkout_order: {
        Args: {
          p_customer_details: Json
          p_customer_user_id?: string
          p_delivery_zone_id: string
          p_idempotency_key: string
          p_items: Json
          p_order_access_token_hash: string
          p_request_fingerprint: string
        }
        Returns: {
          delivery_charge_bdt: number
          order_id: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          stock_status: Database["public"]["Enums"]["stock_status"]
          subtotal_bdt: number
          total_bdt: number
        }[]
      }
      create_checkout_order_with_preference: {
        Args: {
          p_customer_details: Json
          p_customer_user_id?: string
          p_delivery_zone_id: string
          p_idempotency_key: string
          p_items: Json
          p_order_access_token_hash: string
          p_request_fingerprint: string
          p_payment_preference: Database["public"]["Enums"]["checkout_payment_preference"]
        }
        Returns: {
          delivery_charge_bdt: number
          order_id: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          stock_status: Database["public"]["Enums"]["stock_status"]
          subtotal_bdt: number
          total_bdt: number
        }[]
      }
      confirm_cash_on_delivery_order: { Args: { p_order_id: string; p_note?: string }; Returns: undefined }
      mark_cash_on_delivery_collected: { Args: { p_order_id: string; p_note?: string }; Returns: undefined }
      submit_customer_review: {
        Args: { p_order_id: string; p_order_access_token_hash: string; p_rating: number; p_review_text?: string | null; p_reviewer_display_name?: string | null }
        Returns: string
      }
      get_public_store_stats: { Args: never; Returns: Json }
      auto_deliver_shipped_orders: { Args: never; Returns: number }
      expire_stock_reservations: { Args: never; Returns: number }
      get_guest_order_summary: {
        Args: { p_order_access_token_hash: string; p_order_id: string }
        Returns: Json
      }
      get_public_checkout_config: { Args: never; Returns: Json }
      has_store_role: {
        Args: { p_roles: Database["public"]["Enums"]["admin_role"][] }
        Returns: boolean
      }
      is_published_category: {
        Args: { p_category_id: string }
        Returns: boolean
      }
      is_store_admin: { Args: never; Returns: boolean }
      is_store_staff: { Args: never; Returns: boolean }
      mark_order_fulfilled: { Args: { p_order_id: string }; Returns: undefined }
      search_catalog_products: {
        Args: {
          p_category_slug?: string
          p_limit?: number
          p_max_price_bdt?: number
          p_min_price_bdt?: number
          p_offset?: number
          p_query?: string
          p_sort?: string
        }
        Returns: {
          brand: string
          category_slug: string
          id: string
          name: string
          price_bdt: number
          primary_image_path: string
          public_availability: Database["public"]["Enums"]["public_availability_status"]
          short_description: string
          sku: string
          slug: string
        }[]
      }
      set_primary_product_image: {
        Args: { p_image_id: string; p_product_id: string }
        Returns: undefined
      }
      submit_manual_payment: {
        Args: {
          p_amount_bdt: number
          p_idempotency_key: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_order_access_token_hash: string
          p_order_id: string
          p_sender_phone: string
          p_transaction_reference: string
        }
        Returns: string
      }
      update_order_fulfilment_status: {
        Args: {
          p_next_status: Database["public"]["Enums"]["fulfilment_status"]
          p_note?: string
          p_order_id: string
        }
        Returns: undefined
      }
      verify_manual_payment: {
        Args: {
          p_note?: string
          p_rejection_reason?: string
          p_result: Database["public"]["Enums"]["payment_event_type"]
          p_submission_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      admin_role: "admin" | "staff"
      catalogue_status: "draft" | "review" | "published" | "archived"
      fulfilment_status:
        | "unfulfilled"
        | "processing"
        | "packed"
        | "shipped"
        | "delivered"
        | "cancelled"
      inventory_movement_type:
        | "receipt"
        | "adjustment_increase"
        | "adjustment_decrease"
        | "reservation"
        | "reservation_release"
        | "fulfilment"
      order_status:
        | "pending_stock_confirmation"
        | "awaiting_payment"
        | "confirmed"
        | "cancelled"
      checkout_payment_preference: "cash_on_delivery" | "online_payment"
            payment_event_type: "submitted" | "verified" | "rejected"
      payment_method: "bkash" | "nagad"
      payment_status:
        | "not_submitted"
        | "pending_verification"
        | "verified"
        | "rejected"
        | "refunded"
      payment_submission_status:
        | "pending_verification"
        | "verified"
        | "rejected"
      public_availability_status:
        | "unknown"
        | "in_stock"
        | "low_stock"
        | "out_of_stock"
        | "availability_on_request"
        | "backorder"
        | "discontinued"
        | "build_to_order"
      reservation_status: "active" | "released" | "consumed" | "expired"
      stock_status:
        | "pending_confirmation"
        | "reserved"
        | "confirmed_untracked"
        | "unavailable"
      stock_tracking_mode: "unknown" | "tracked" | "untracked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["admin", "staff"],
      catalogue_status: ["draft", "review", "published", "archived"],
      fulfilment_status: [
        "unfulfilled",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      inventory_movement_type: [
        "receipt",
        "adjustment_increase",
        "adjustment_decrease",
        "reservation",
        "reservation_release",
        "fulfilment",
      ],
      order_status: [
        "pending_stock_confirmation",
        "awaiting_payment",
        "confirmed",
        "cancelled",
      ],
      checkout_payment_preference: ["cash_on_delivery", "online_payment"],
            payment_event_type: ["submitted", "verified", "rejected"],
      payment_method: ["bkash", "nagad"],
      payment_status: [
        "not_submitted",
        "pending_verification",
        "verified",
        "rejected",
        "refunded",
      ],
      payment_submission_status: [
        "pending_verification",
        "verified",
        "rejected",
      ],
      public_availability_status: [
        "unknown",
        "in_stock",
        "low_stock",
        "out_of_stock",
        "availability_on_request",
        "backorder",
        "discontinued",
        "build_to_order",
      ],
      reservation_status: ["active", "released", "consumed", "expired"],
      stock_status: [
        "pending_confirmation",
        "reserved",
        "confirmed_untracked",
        "unavailable",
      ],
      stock_tracking_mode: ["unknown", "tracked", "untracked"],
    },
  },
} as const
