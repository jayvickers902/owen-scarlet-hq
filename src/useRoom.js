import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'

export function useRoom(roomCode, playerName) {
  const [room, setRoom]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const channelRef            = useRef(null)

  // Load room + subscribe to changes
  useEffect(() => {
    if (!roomCode) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single()
      if (cancelled) return
      if (err) { setError(err.message); setLoading(false); return }
      setRoom(data)
      setLoading(false)
    }
    load()

    // Realtime subscription
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'rooms',
        filter: `code=eq.${roomCode}`,
      }, payload => {
        if (!cancelled) setRoom(payload.new)
      })
      .subscribe()

    channelRef.current = channel
    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  const updateRoom = useCallback(async (patch) => {
    if (!roomCode) return { error: 'no room code' }
    const { data, error: err } = await supabase
      .from('rooms')
      .update(patch)
      .eq('code', roomCode)
      .select()
      .single()
    if (!err) setRoom(data)
    return { data, error: err }
  }, [roomCode])

  // Join: add player to members list
  const joinRoom = useCallback(async () => {
    if (!roomCode || !playerName) return { error: 'missing info' }
    const { data: current } = await supabase
      .from('rooms')
      .select('members')
      .eq('code', roomCode)
      .single()
    if (!current) return { error: 'room not found' }
    const members = current.members || []
    if (!members.includes(playerName)) {
      members.push(playerName)
    }
    return updateRoom({ members })
  }, [roomCode, playerName, updateRoom])

  // Leave: remove player from members list
  const leaveRoom = useCallback(async () => {
    if (!roomCode || !playerName || !room) return
    const members = (room.members || []).filter(m => m !== playerName)
    await updateRoom({ members })
  }, [roomCode, playerName, room, updateRoom])

  // Broadcast (ephemeral, for drawing)
  const broadcast = useCallback((event, payload) => {
    channelRef.current?.send({ type: 'broadcast', event, payload })
  }, [])

  const onBroadcast = useCallback((event, handler) => {
    channelRef.current?.on('broadcast', { event }, ({ payload }) => handler(payload))
  }, [])

  return { room, loading, error, updateRoom, joinRoom, leaveRoom, broadcast, onBroadcast }
}
