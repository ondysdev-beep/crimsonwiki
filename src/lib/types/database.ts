export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          discord_id: string | null;
          role: 'viewer' | 'editor' | 'moderator' | 'admin';
          is_founder: boolean;
          created_at: string;
          bio: string | null;
          website_url: string | null;
          twitter_handle: string | null;
          discord_username: string | null;
          email_notifications: boolean;
          theme_preference: 'dark' | 'light';
          language_preference: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          discord_id?: string | null;
          role?: 'viewer' | 'editor' | 'moderator' | 'admin';
          is_founder?: boolean;
          created_at?: string;
          bio?: string | null;
          website_url?: string | null;
          twitter_handle?: string | null;
          discord_username?: string | null;
          email_notifications?: boolean;
          theme_preference?: 'dark' | 'light';
          language_preference?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          discord_id?: string | null;
          role?: 'viewer' | 'editor' | 'moderator' | 'admin';
          is_founder?: boolean;
          bio?: string | null;
          website_url?: string | null;
          twitter_handle?: string | null;
          discord_username?: string | null;
          email_notifications?: boolean;
          theme_preference?: 'dark' | 'light';
          language_preference?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string | null;
          description: string | null;
          color: string | null;
          parent_id: number | null;
        };
        Insert: {
          name: string;
          slug: string;
          icon?: string | null;
          description?: string | null;
          color?: string | null;
          parent_id?: number | null;
        };
        Update: {
          name?: string;
          slug?: string;
          icon?: string | null;
          description?: string | null;
          color?: string | null;
          parent_id?: number | null;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category_id: number | null;
          content: Json;
          content_text: string | null;
          excerpt: string | null;
          cover_image_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
          view_count: number;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category_id?: number | null;
          content?: Json;
          content_text?: string | null;
          excerpt?: string | null;
          cover_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          is_published?: boolean;
        };
        Update: {
          slug?: string;
          title?: string;
          category_id?: number | null;
          content?: Json;
          content_text?: string | null;
          excerpt?: string | null;
          cover_image_url?: string | null;
          updated_by?: string | null;
          is_published?: boolean;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'articles_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'articles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'articles_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      article_revisions: {
        Row: {
          id: string;
          article_id: string;
          content: Json;
          content_text: string | null;
          edited_by: string | null;
          edit_summary: string | null;
          created_at: string;
        };
        Insert: {
          article_id: string;
          content: Json;
          content_text?: string | null;
          edited_by?: string | null;
          edit_summary?: string | null;
        };
        Update: {
          content?: Json;
          content_text?: string | null;
          edit_summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'article_revisions_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'article_revisions_edited_by_fkey';
            columns: ['edited_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          article_id: string;
          user_id: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          article_id: string;
          user_id?: string | null;
          content: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_article_views: {
        Args: { p_article_id: string };
        Returns: undefined;
      };
      search_articles: {
        Args: { search_query: string; result_limit?: number };
        Returns: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          cover_image_url: string | null;
          category_name: string | null;
          category_slug: string | null;
          category_color: string | null;
          rank: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleRevision = Database['public']['Tables']['article_revisions']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

export type ArticleWithCategory = Article & {
  categories: Category | null;
  profiles: Profile | null;
};
