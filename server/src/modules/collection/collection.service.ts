// ──────────────────────────────────────────────
// Collection Service — manages user's saved plants with offline fallback
// ──────────────────────────────────────────────

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config/env.config.js';
import { NotFoundError, InternalError } from '../../common/errors/AppError.js';
import { compressImageBuffer, stripDataUriPrefix } from '../../common/utils/image.utils.js';
import fs from 'fs';
import path from 'path';

// Define a local database file path in the workspace
const COLLECTION_FILE = path.join(process.cwd(), 'scratch', 'local_collection.json');

// Ensure scratch directory exists
const scratchDir = path.join(process.cwd(), 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

// Helpers to read/write local data
function readLocalCollection(): any[] {
  if (!fs.existsSync(COLLECTION_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(COLLECTION_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeLocalCollection(data: any[]): void {
  fs.writeFileSync(COLLECTION_FILE, JSON.stringify(data, null, 2), 'utf8');
}

class CollectionService {
  private supabase: SupabaseClient;

  constructor() {
    // Use service role key if available to bypass RLS in backend operations
    const supabaseKey = config.supabaseServiceKey && config.supabaseServiceKey !== 'your_supabase_service_role_key'
      ? config.supabaseServiceKey
      : config.supabaseAnonKey;
    
    this.supabase = createClient(config.supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  /**
   * Helper to process and compress image if it's a base64 string
   */
  private async processImage(image: string): Promise<string> {
    if (image && image.startsWith('data:image')) {
      try {
        const base64Data = stripDataUriPrefix(image);
        const buffer = Buffer.from(base64Data, 'base64');
        const compressed = await compressImageBuffer(buffer, 1024, 75);
        return `data:image/jpeg;base64,${compressed}`;
      } catch (err) {
        console.error('Image compression failed:', err);
        return image; // Fallback to original if compression fails
      }
    }
    return image;
  }

  async getCollection(userId: string, page = 1, limit = 20, search?: string) {
    try {
      let query = this.supabase
        .from('plants')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,scientific_name.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (err: any) {
      console.warn('⚠️ [CollectionService] Supabase query failed. Falling back to local offline DB:', err.message);
      
      let items = readLocalCollection();
      items = items.filter(item => item.user_id === userId && !item.deleted_at);
      
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(s) || 
          (item.scientific_name && item.scientific_name.toLowerCase().includes(s))
        );
      }
      
      const total = items.length;
      const paginated = items.slice((page - 1) * limit, page * limit);
      
      return {
        items: paginated,
        total,
        page,
        limit,
      };
    }
  }

  async getPlantById(userId: string, plantId: string) {
    try {
      const { data, error } = await this.supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error || !data) throw error || new Error('Plant not found');

      return data;
    } catch (err: any) {
      console.warn('⚠️ [CollectionService] Supabase fetch failed. Falling back to local offline DB:', err.message);
      
      const items = readLocalCollection();
      const plant = items.find(item => item.id === plantId && item.user_id === userId && !item.deleted_at);
      
      if (!plant) {
        throw new NotFoundError('Plant not found in your collection');
      }
      
      return plant;
    }
  }

  async addToCollection(userId: string, plantData: {
    name: string;
    scientificName: string;
    image: string;
    tags: string[];
    data: Record<string, unknown>;
  }) {
    // Compress image to avoid large payload errors
    const processedImage = await this.processImage(plantData.image);

    try {
      // 1. Check if plant already exists for this user
      const { data: existingPlant, error: findError } = await this.supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .eq('name', plantData.name)
        .is('deleted_at', null)
        .maybeSingle();

      if (findError) throw findError;

      if (existingPlant) {
        // 2. Update existing plant with new scan and history
        const currentData = existingPlant.data || {};
        const history = currentData.analysis_history || [];
        
        const newScanEntry = {
          date: new Date().toISOString(),
          image: processedImage,
          ...plantData.data
        };

        const updatedData = {
          ...plantData.data, // Set latest scan as primary data
          analysis_history: [newScanEntry, ...history].slice(0, 50) // Limit history size
        };

        const { data, error } = await this.supabase
          .from('plants')
          .update({
            image: processedImage,
            scientific_name: plantData.scientificName,
            data: updatedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPlant.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // 3. Create new plant entry
        const initialData = {
          ...plantData.data,
          analysis_history: [{
            date: new Date().toISOString(),
            image: processedImage,
            ...plantData.data
          }]
        };

        const { data, error } = await this.supabase
          .from('plants')
          .insert({
            user_id: userId,
            name: plantData.name,
            scientific_name: plantData.scientificName,
            image: processedImage,
            tags: plantData.tags,
            data: initialData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err: any) {
      console.warn('⚠️ [CollectionService] Supabase write failed. Falling back to local offline DB:', err.message);
      
      const items = readLocalCollection();
      
      // 1. Check if plant already exists locally
      const existingPlantIndex = items.findIndex(item => 
        item.user_id === userId && 
        item.name === plantData.name && 
        !item.deleted_at
      );

      if (existingPlantIndex >= 0) {
        const existingPlant = items[existingPlantIndex];
        const currentData = existingPlant.data || {};
        const history = currentData.analysis_history || [];
        
        const newScanEntry = {
          date: new Date().toISOString(),
          image: processedImage,
          ...plantData.data
        };

        const updatedData = {
          ...plantData.data,
          analysis_history: [newScanEntry, ...history].slice(0, 50)
        };

        const updatedPlant = {
          ...existingPlant,
          image: processedImage,
          scientific_name: plantData.scientificName,
          data: updatedData,
          updated_at: new Date().toISOString()
        };

        items[existingPlantIndex] = updatedPlant;
        writeLocalCollection(items);
        return updatedPlant;
      } else {
        // 2. Create new plant entry locally
        const newId = crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const initialData = {
          ...plantData.data,
          analysis_history: [{
            date: new Date().toISOString(),
            image: processedImage,
            ...plantData.data
          }]
        };

        const newPlant = {
          id: newId,
          user_id: userId,
          name: plantData.name,
          scientific_name: plantData.scientificName,
          image: processedImage,
          tags: plantData.tags,
          data: initialData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        };

        items.push(newPlant);
        writeLocalCollection(items);
        return newPlant;
      }
    }
  }

  async removeFromCollection(userId: string, plantId: string) {
    try {
      const { error } = await this.supabase
        .from('plants')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', plantId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.warn('⚠️ [CollectionService] Supabase delete failed. Falling back to local offline DB:', err.message);
      
      const items = readLocalCollection();
      const plantIndex = items.findIndex(item => item.id === plantId && item.user_id === userId);
      
      if (plantIndex >= 0) {
        items[plantIndex].deleted_at = new Date().toISOString();
        writeLocalCollection(items);
      }
    }
  }

  async updatePlant(userId: string, plantId: string, updates: Record<string, any>) {
    // If updating image, compress it
    if (updates.image) {
      updates.image = await this.processImage(updates.image);
    }

    try {
      const { data, error } = await this.supabase
        .from('plants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', plantId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn('⚠️ [CollectionService] Supabase update failed. Falling back to local offline DB:', err.message);
      
      const items = readLocalCollection();
      const plantIndex = items.findIndex(item => item.id === plantId && item.user_id === userId && !item.deleted_at);
      
      if (plantIndex < 0) {
        throw new NotFoundError('Plant not found in your collection');
      }

      const updatedPlant = {
        ...items[plantIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      items[plantIndex] = updatedPlant;
      writeLocalCollection(items);
      return updatedPlant;
    }
  }
}

export const collectionService = new CollectionService();
