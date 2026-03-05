export const SocketEvents = {
  // ── Client → Server ────────────────────────────
  JOIN:              'join',
  CREATE_ROOM:       'create_room',
  JOIN_ROOM:         'join_room',
  LEAVE_ROOM:        'leave_room',
  SEND_MESSAGE:      'send_message',
  TYPING:            'typing',

  // ── Server → Client (individual) ───────────────
  JOIN_ACK:          'join_ack',
  ROOM_JOINED:       'room_joined',
  ERROR:             'error',

  // ── Server → Client (broadcast) ────────────────
  ROOM_CREATED:      'room_created',
  NEW_MESSAGE:       'new_message',
  USER_JOINED:       'user_joined',
  USER_LEFT:         'user_left',
  TYPING_UPDATE:     'typing_update',
  ROOM_USERS_UPDATE: 'room_users_update',
} as const
