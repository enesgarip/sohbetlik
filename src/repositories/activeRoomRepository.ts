import { isSupabaseConfigured } from '../lib/supabase'
import { localRoomRepository } from './localRoomRepository'
import type { RoomRepository } from './roomRepository'
import { supabaseRoomRepository } from './supabaseRoomRepository'

export const roomRepository: RoomRepository = isSupabaseConfigured
  ? supabaseRoomRepository
  : localRoomRepository
